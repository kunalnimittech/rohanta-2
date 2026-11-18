import React, { useEffect, useState } from 'react';
import { Eye, ShieldCheck, Timer, HeartHandshake, Banknote } from 'lucide-react';
import { useStore, uid } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import { SPONSOR_TYPES, SPONSOR_KYC_TARGET_HOURS } from '../../data/rules';
import { calcCheckout } from '../../store/ledger';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  DocViewer,
  Amount,
  FloatingInput,
  FloatingSelect,
  SectionLabel,
  EmptyState,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, KycChip, DonationChip, useToast } from './AdminShared';

function KycTimer({ sponsor }) {
  if (sponsor.kycStatus !== 'pending' || !sponsor.kycSubmittedAt) return null;
  const hrs = (Date.now() - new Date(sponsor.kycSubmittedAt).getTime()) / 3600000;
  const left = Math.round(SPONSOR_KYC_TARGET_HOURS - hrs);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap ${left < 0 ? 'border border-[#0A0A0A] dark:border-[#FAFAFA]' : 'bg-[#ECECEE] dark:bg-[#262626] text-[#52525B] dark:text-[#A1A1AA]'}`}>
      <Timer className="w-3.5 h-3.5" strokeWidth={2} />
      {left < 0 ? `${Math.abs(left)}h over the 48h target` : `${left}h left of 48h`}
    </span>
  );
}

const ORG_FIELDS = {
  corporate: [
    ['name', 'Company'], ['cin', 'CIN'], ['gstin', 'GSTIN'], ['registeredAddress', 'Registered address'], ['signatory', 'CSR contact'],
    ['designation', 'Designation'], ['committeeRef', 'CSR committee approval ref.'], ['csrNo', 'CSR-1 number'],
  ],
  ngo: [['name', 'Organisation'], ['registrationNo', 'Registration no.'], ['registrationType', 'Registration type'], ['reg12A', '12A number'], ['reg80G', '80G number'], ['csrNo', 'CSR-1 number'], ['signatory', 'Authorised signatory']],
  mp_mla: [['name', 'Name'], ['house', 'House'], ['constituency', 'Constituency'], ['state', 'State'], ['officeContact', 'Office contact'], ['pa', 'PA details']],
};
const DOCS_FOR = {
  individual: ['PAN card'],
  corporate: ['Certificate of incorporation', 'Company PAN', 'GST certificate', 'CSR committee resolution', 'Authorisation letter'],
  ngo: ['Registration certificate', '12A certificate', '80G certificate', 'CSR-1 registration', 'Trust PAN'],
  mp_mla: ['Official ID / letterhead', 'PAN', 'Authorisation for PA'],
};

/** Offline donation (cheque / bank transfer): created as pending, confirmed by finance. */
export function OfflineDonationSheet({ open, onClose, sponsorId: fixedSponsor, onSaved }) {
  const { state, dispatch } = useStore();
  const [sponsorId, setSponsorId] = useState(fixedSponsor || state.sponsors[0]?.id);
  const [mode, setMode] = useState('Cheque');
  const [ref, setRef] = useState('');
  const [amount, setAmount] = useState('');
  const [target, setTarget] = useState('pool:general');
  useEffect(() => {
    if (open) {
      setSponsorId(fixedSponsor || state.sponsors[0]?.id);
      setRef('');
      setAmount('');
    }
  }, [open, fixedSponsor]); // eslint-disable-line react-hooks/exhaustive-deps
  const c = calcCheckout(amount || 0, state.settings.platformFeePercent, state.settings.feeMode);
  const listed = state.students.filter((s) => ['Listed', 'Partially funded'].includes(s.status));
  const targets = [
    ['pool:general', 'General pool'],
    ...state.pools.filter((p) => p.id !== 'general').map((p) => [`pool:${p.id}`, p.name]),
    ...listed.map((s) => [`student:${s.id}`, `${s.fullName} · needs ${formatINR(sel.studentRemainingNeed(state, s.id))}`]),
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title="Record an offline donation">
      <div className="space-y-4">
        {!fixedSponsor && (
          <label className="relative block">
            <select value={sponsorId} onChange={(e) => setSponsorId(e.target.value)} aria-label="Donor" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
              {state.sponsors.map((s) => <option key={s.id} value={s.id}>{s.displayName}</option>)}
            </select>
            <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Donor</span>
          </label>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FloatingSelect label="Mode" value={mode} onChange={(e) => setMode(e.target.value)} options={['Cheque', 'Bank transfer']} />
          <FloatingInput label={mode === 'Cheque' ? 'Cheque no.' : 'UTR / reference'} value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <label className="relative block">
          <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Allocate to" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
            {targets.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Allocate to</span>
        </label>
        <Amount label="Amount for students (₹)" value={amount} onChange={setAmount} />
        {amount > 0 && (
          <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] space-y-1">
            <KV label="To students / pool" value={formatINR(c.toStudents)} />
            <KV label={`Platform fee ${state.settings.platformFeePercent}%`} value={formatINR(c.fee)} />
            <KV label="Cheque / transfer amount" value={formatINR(c.total)} strong />
          </div>
        )}
        <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">It stays Pending until finance confirms the money is in the trust account. The receipt is issued then.</p>
        <PrimaryButton
          disabled={!amount || ref.trim().length < 3}
          onClick={() => {
            const [kind, id] = target.split(':');
            dispatch('createDonation', {
              id: `doff-${uid('d').slice(-6)}`, sponsorId, packageProductId: kind === 'student' ? 'pp-partial' : 'pp-partial', amount,
              studentId: kind === 'student' ? id : null, poolId: kind === 'pool' ? id : null, offline: true, offlineMode: mode,
              paymentRef: `${mode === 'Cheque' ? 'CHQ' : 'NEFT'}-${ref.trim()}`,
            });
            onSaved && onSaved('Offline donation recorded. Finance confirms receipt in Funds.');
            onClose();
          }}
          className="w-full"
        >
          Record {c.total ? formatINR(c.total) : ''}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function SponsorDetail({ id, onBack }) {
  const { state, dispatch } = useStore();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [doc, setDoc] = useState(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const sp = sel.getSponsor(state, id);
  if (!sp) return null;
  const t = sel.sponsorTotals(state, sp.id);
  const donations = sel.sponsorDonations(state, sp.id).slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const fields = ORG_FIELDS[sp.type] || [];
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        onBack={onBack}
        backLabel="All sponsors"
        title={sp.displayName}
        sub={`${SPONSOR_TYPES[sp.type]} · joined ${formatDate(sp.joinedAt)} · ${sp.public ? 'Public name' : 'Anonymous'}`}
        actions={<><KycChip status={sp.kycStatus} /><KycTimer sponsor={sp} /></>}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Total paid</div><div className="text-[24px] font-bold mt-1">{formatINR(t.given)}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">To students and pools</div><div className="text-[24px] font-bold mt-1">{formatINR(t.toStudents)}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Students supported</div><div className="text-[24px] font-bold mt-1">{t.studentsSupported}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Utilised</div><div className="text-[24px] font-bold mt-1">{formatINR(t.utilised)}</div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Profile</SectionLabel>
          <KV label="Display name" value={sp.displayName} />
          <KV label="Email" value={sp.email} />
          <KV label="Mobile (OTP verified)" value={sp.mobile} />
          <KV label="PAN" value={sp.pan} />
          {sp.address && <KV label="Address" value={sp.address} />}
          <KV label="Display preference" value={sp.public ? 'Public' : 'Anonymous'} />
          {sp.type === 'individual' && <KV label="Communication consent" value={sp.commsConsent ? 'Yes' : 'No'} />}
          {fields.map(([k, l]) => <KV key={k} label={l} value={sp.org?.[k]} />)}
          {sp.org?.preferredStates && <KV label="Preferred states" value={sp.org.preferredStates.join(', ')} />}
          {sp.org?.preferredExams && <KV label="Preferred exams" value={sp.org.preferredExams.join(', ')} />}
          {sp.sip && <KV label="SIP" value={`${formatINR(sp.sip.amount)} + fee, day ${sp.sip.day} · ${sp.sip.status}`} />}
        </Card>
        <Card className="space-y-3">
          <SectionLabel>Documents</SectionLabel>
          {(DOCS_FOR[sp.type] || []).map((d) => (
            <div key={d} className="flex items-center justify-between gap-3">
              <span className="text-[14px] font-medium">{d}</span>
              <SmallButton ariaLabel={`View ${d}`} onClick={() => setDoc({ name: d, type: d.toLowerCase().replace(/\s+/g, '-'), status: sp.kycStatus === 'verified' || sp.kycStatus === 'not_required' ? 'verified' : 'uploaded' })}>
                <Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View
              </SmallButton>
            </div>
          ))}
          {sp.kycStatus === 'pending' && (
            <div className="flex flex-wrap gap-2 pt-3">
              <PrimaryButton onClick={() => setVerifyOpen(true)} className="h-12 px-6 text-[14px]">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} /> Verify
              </PrimaryButton>
              <SecondaryButton onClick={() => setRejectOpen(true)} className="h-12 px-6 text-[14px]">Reject</SecondaryButton>
            </div>
          )}
          {sp.kycStatus === 'pending' && (
            <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
              Until verified: name stays private, cohort and constituency products and CSR certificates are locked. Normal donations still work.
            </p>
          )}
          {sp.kycStatus === 'rejected' && <p className="text-[13px]">Rejected: {sp.kycRejectReason}</p>}
        </Card>
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Donations</SectionLabel>
          <SmallButton onClick={() => setOfflineOpen(true)}><Banknote className="w-3.5 h-3.5" strokeWidth={1.75} /> Offline donation</SmallButton>
        </div>
        {donations.length === 0 ? (
          <EmptyState icon={HeartHandshake} title="No donations yet" />
        ) : (
          donations.map((d) => (
            <div key={d.id} className="px-5 py-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[14px] font-semibold">
                  {d.studentId ? sel.getStudent(state, d.studentId)?.fullName : d.cohortId ? state.cohorts.find((c) => c.id === d.cohortId)?.name : state.pools.find((p) => p.id === d.poolId)?.name}
                </div>
                <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{formatDate(d.createdAt)} · {d.paymentRef}{d.offline ? ` · ${d.offlineMode}` : ''}{d.sip ? ' · SIP' : ''}</div>
              </div>
              <div className="flex items-center gap-3"><DonationChip status={d.status} /><span className="font-bold">{formatINR(d.total)}</span></div>
            </div>
          ))
        )}
      </section>
      <DocViewer open={!!doc} onClose={() => setDoc(null)} doc={doc} />
      <ConfirmSheet
        open={verifyOpen}
        title={`Verify ${sp.displayName}?`}
        body="Their name can be public, private cohort and constituency products unlock, and CSR certificates can be issued."
        confirmLabel="Verify organisation"
        onClose={() => setVerifyOpen(false)}
        onConfirm={() => { setVerifyOpen(false); dispatch('verifySponsorKyc', { sponsorId: sp.id, decision: 'verified' }); toast('Verified. Sponsor notified.'); }}
      />
      <ConfirmSheet
        open={rejectOpen}
        title="Reject verification?"
        body="The sponsor sees your reason and can resubmit documents. Normal donations stay open."
        confirmLabel="Reject"
        destructive
        reasonRequired
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => { setRejectOpen(false); dispatch('verifySponsorKyc', { sponsorId: sp.id, decision: 'rejected', reason }); toast('Rejected. Sponsor notified.'); }}
      />
      <OfflineDonationSheet open={offlineOpen} onClose={() => setOfflineOpen(false)} sponsorId={sp.id} onSaved={toast} />
      {toastEl}
    </div>
  );
}

export function AdminSponsors({ params = {} }) {
  const { state } = useStore();
  const [openId, setOpenId] = useState(params.sponsorId || null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [toastEl, toast] = useToast();
  useEffect(() => setOpenId(params.sponsorId || null), [params]);
  if (openId) return <SponsorDetail id={openId} onBack={() => setOpenId(null)} />;
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Sponsors"
        sub="Individuals donate after PAN and mobile OTP. Organisations need document verification within 48 hours."
        actions={<SecondaryButton onClick={() => setOfflineOpen(true)} className="h-12 px-6 text-[14px]"><Banknote className="w-4 h-4" strokeWidth={1.75} /> Offline donation</SecondaryButton>}
      />
      <DataTable
        rows={state.sponsors}
        initialFilter={params.filter === 'pending' ? 'pending' : 'All'}
        searchText={(r) => `${r.displayName} ${r.org?.name || ''} ${r.email}`}
        searchPlaceholder="Search sponsors"
        filter={{ options: [{ value: 'pending', label: 'KYC pending' }, { value: 'verified', label: 'Verified' }, { value: 'not_required', label: 'Individuals' }, { value: 'rejected', label: 'Rejected' }], getValue: (r) => r.kycStatus }}
        onRowClick={(r) => setOpenId(r.id)}
        columns={[
          { key: 'displayName', label: 'Sponsor', width: 'minmax(0,1.6fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.displayName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] truncate">{r.email}</div></div> },
          { key: 'type', label: 'Type', render: (r) => SPONSOR_TYPES[r.type] },
          { key: 'kycStatus', label: 'KYC', width: 'minmax(0,1.4fr)', render: (r) => <div className="flex flex-wrap gap-1.5"><KycChip status={r.kycStatus} /><KycTimer sponsor={r} /></div> },
          { key: 'given', label: 'Paid', align: 'right', sortValue: (r) => sel.sponsorTotals(state, r.id).given, render: (r) => formatINR(sel.sponsorTotals(state, r.id).given) },
        ]}
      />
      <OfflineDonationSheet open={offlineOpen} onClose={() => setOfflineOpen(false)} onSaved={toast} />
      {toastEl}
    </div>
  );
}
