// Certificates (Part 10.3). Issued by package type, never chosen by the donor.
// Certificates never contain student surnames, photos or contact details:
// every student line comes from the sponsor-safe publicStudent() view.
import React, { useState } from 'react';
import { Award, Eye, MapPin, Building2, Repeat, GraduationCap } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import { CertificateCard, BottomSheet, ConfirmSheet, StatusChip, EmptyState, DataTable, SectionLabel, Segmented } from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, useToast } from '../admin/AdminShared';

export const CERT_LABEL = {
  sponsorship: 'Sponsorship Certificate',
  constituency_impact: 'Constituency Impact Certificate',
  utilisation: 'Utilisation Certificate',
  annual_sip: 'Annual SIP Certificate',
};

/** Lines printed on a certificate (sponsor-safe). */
export function certificateLines(state, c) {
  const student = (sid) => {
    const p = sel.publicStudent(state, sid);
    return p ? `${p.displayName} · ${p.exam} · ${p.institute}` : '';
  };
  if (c.type === 'sponsorship') return [...c.studentIds.map(student), ...(c.result ? [`Result: ${c.result}`] : [])];
  if (c.type === 'annual_sip') return [`Monthly SIP to the general pool · ${c.period || 'Financial year'}`, `${(c.donationIds || []).length} monthly gifts`];
  if (c.type === 'constituency_impact')
    return [`${c.constituency || 'Constituency'} · ${c.period || ''}`, `${c.studentIds.length} student${c.studentIds.length === 1 ? '' : 's'} supported from the constituency pool`, ...(c.results ? [`Results: ${c.results}`] : [])];
  if (c.type === 'utilisation')
    return [`${c.programme || 'CSR programme'} · ${c.period || ''}`, `${c.studentIds.length} student${c.studentIds.length === 1 ? '' : 's'} · ${formatINR(c.utilised || c.amount)} paid to institutes`, 'CA certification of the annual accounts to follow'];
  return [];
}

export function CertificateView({ certificate }) {
  const { state } = useStore();
  const sp = sel.getSponsor(state, certificate.sponsorId);
  const signer = sel.getUser(state, certificate.signedBy);
  return (
    <CertificateCard
      certificate={certificate}
      sponsorName={sp?.org?.name || sp?.displayName || 'Sponsor'}
      lines={certificateLines(state, certificate)}
      signedBy={signer ? `${signer.name}, Trustee` : 'Trustee'}
    />
  );
}

// --- What can be issued now (admin) --------------------------------------------------------
export function annualCandidates(state, period = 'FY 2026–27') {
  const out = [];
  // Constituency fund -> annual Constituency Impact Certificate for the MP/MLA.
  state.pools.filter((p) => p.sponsorId).forEach((p) => {
    const sp = sel.getSponsor(state, p.sponsorId);
    const lines = state.allocations.filter((a) => a.fromPool === p.id && a.targetType === 'student');
    const studentIds = [...new Set(lines.map((a) => a.targetId))];
    const amount = lines.reduce((n, a) => n + a.amount, 0);
    const qualified = studentIds.filter((id) => sel.getStudent(state, id)?.outcome?.qualified).length;
    out.push({
      key: `const-${p.id}`, icon: MapPin, type: 'constituency_impact', sponsorId: p.sponsorId, title: `${sp?.displayName}`, sub: p.name,
      ready: studentIds.length > 0, why: studentIds.length ? '' : 'No students funded from this pool yet. Allocate from Funds › Pool top-up.',
      certificate: { sponsorId: p.sponsorId, type: 'constituency_impact', studentIds, amount, period, constituency: sp?.org?.constituency, results: qualified ? `${qualified} qualified` : 'Results due after exams' },
    });
  });
  // CSR cohort -> Utilisation Certificate (trustee-signed; CA-certified annually).
  state.cohorts.forEach((c) => {
    const sp = sel.getSponsor(state, c.sponsorId);
    const paid = state.disbursements.filter((d) => c.studentIds.includes(d.studentId) && ['paid', 'confirmed'].includes(d.status)).reduce((n, d) => n + d.amount, 0);
    const received = state.donations.filter((d) => d.cohortId === c.id && d.status === 'success').reduce((n, d) => n + d.amount, 0);
    out.push({
      key: `util-${c.id}`, icon: Building2, type: 'utilisation', sponsorId: c.sponsorId, title: sp?.displayName, sub: c.name,
      ready: paid > 0, why: paid ? '' : `${formatINR(received)} received, nothing paid to institutes yet.`,
      certificate: { sponsorId: c.sponsorId, type: 'utilisation', studentIds: c.studentIds, amount: received, utilised: paid, period, programme: c.name },
    });
  });
  // SIP -> one consolidated annual certificate.
  state.sponsors.forEach((sp) => {
    const ok = state.donations.filter((d) => d.sponsorId === sp.id && d.sip && d.status === 'success');
    if (!ok.length) return;
    out.push({
      key: `sip-${sp.id}`, icon: Repeat, type: 'annual_sip', sponsorId: sp.id, title: sp.displayName, sub: `${ok.length} monthly gifts`, ready: true, why: '',
      certificate: { sponsorId: sp.id, type: 'annual_sip', studentIds: [], amount: ok.reduce((n, d) => n + d.total, 0), period, donationIds: ok.map((d) => d.id) },
    });
  });
  return out.map((c) => ({ ...c, issued: state.certificates.find((x) => x.sponsorId === c.sponsorId && x.type === c.type && (x.period || '') === period && (c.type !== 'utilisation' || x.programme === c.certificate.programme)) }));
}

export function AdminCertificates() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState('issue');
  const [view, setView] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toastEl, toast] = useToast();
  const trustee = state.users.find((u) => u.role === 'trustee');
  const candidates = annualCandidates(state);
  const rows = state.certificates.slice().sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Certificates" sub="Issued by package type. Sponsorship certificates are automatic once the institute confirms the fee." />
      <Segmented value={tab} onChange={setTab} options={[{ value: 'issue', label: 'Annual certificates' }, { value: 'all', label: 'All issued', count: rows.length }]} />
      {tab === 'issue' ? (
        <div className="space-y-3">
          <div className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] text-[14px] space-y-1">
            <KV label="Sponsor a student" value="Sponsorship Certificate · automatic after fee confirmed; result added at course end" />
            <KV label="Constituency fund" value="Constituency Impact Certificate · annual" />
            <KV label="CSR programme" value="Receipt per tranche + Utilisation Certificate (trustee-signed, CA-certified annually)" />
            <KV label="Monthly SIP" value="Monthly receipts + one consolidated annual certificate" />
          </div>
          {candidates.length === 0 && <EmptyState icon={Award} title="Nothing to issue" />}
          {candidates.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.key} className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0"><Icon className="w-4 h-4" strokeWidth={1.75} /></span>
                  <div className="min-w-0">
                    <div className="text-[15px] font-semibold">{CERT_LABEL[c.type]} · {c.title}</div>
                    <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{c.sub}{!c.ready && !c.issued ? ` · ${c.why}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.issued ? (
                    <>
                      <StatusChip status="verified" label={`Issued ${formatDate(c.issued.issuedAt)}`} />
                      <SmallButton ariaLabel="View certificate" onClick={() => setView(c.issued)}><Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View</SmallButton>
                    </>
                  ) : (
                    <SmallButton primary disabled={!c.ready} onClick={() => setConfirm(c)}>Issue for FY 2026–27</SmallButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable
          rows={rows}
          searchText={(r) => `${r.number} ${sel.getSponsor(state, r.sponsorId)?.displayName}`}
          searchPlaceholder="Search certificates"
          filter={{ options: Object.entries(CERT_LABEL).map(([value, label]) => ({ value, label: label.replace(' Certificate', '') })), getValue: (r) => r.type }}
          onRowClick={(r) => setView(r)}
          empty={{ icon: Award, title: 'No certificates yet' }}
          columns={[
            { key: 'number', label: 'Number', width: 'minmax(0,1.3fr)', render: (r) => <span className="font-semibold">{r.number}</span> },
            { key: 'type', label: 'Type', render: (r) => CERT_LABEL[r.type] },
            { key: 'sponsor', label: 'Sponsor', sortValue: (r) => sel.getSponsor(state, r.sponsorId)?.displayName, render: (r) => sel.getSponsor(state, r.sponsorId)?.displayName },
            { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
            { key: 'issuedAt', label: 'Issued', render: (r) => formatDate(r.issuedAt) },
          ]}
        />
      )}
      <BottomSheet open={!!view} onClose={() => setView(null)} title={view ? CERT_LABEL[view.type] : ''}>
        {view && <CertificateView certificate={view} />}
      </BottomSheet>
      <ConfirmSheet
        open={!!confirm}
        title={`Issue ${confirm ? CERT_LABEL[confirm.type] : ''}?`}
        body={confirm ? `For ${confirm.title}, signed by ${trustee?.name}. ${formatINR(confirm.certificate.utilised ?? confirm.certificate.amount)}. The sponsor is notified.` : ''}
        confirmLabel="Issue certificate"
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          dispatch('issueCertificate', { certificate: confirm.certificate, signedBy: trustee?.id });
          setConfirm(null);
          toast('Certificate issued');
        }}
      />
      {toastEl}
    </div>
  );
}
