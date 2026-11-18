import React, { useEffect, useState } from 'react';
import { Plus, UserPlus, Link2, Copy, Check, MessageSquareHeart, Inbox, Wallet, Trash2, ShieldCheck } from 'lucide-react';
import { useStore, uid } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate, timeAgo, STATUS_STEPS } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  Segmented,
  Amount,
  FloatingInput,
  FloatingSelect,
  FileDrop,
  Timeline,
  BarChart,
  ChartAxis,
  ChartLegend,
  Donut,
  SectionLabel,
  EmptyState,
  compactINR,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, PayoutChip, MiniSelect, useToast, useConfirm, CsvButton, downloadCSV, STAGES, RAISED_INPUTS } from './AdminShared';
import { donorStats } from './AdminOverview';
import { InstituteRequestsInbox } from './AdminCatalogue';

// --- Payouts (admin view) -----------------------------------------------------
export function AdminPayouts() {
  const { state } = useStore();
  const [open, setOpen] = useState(null);
  const rows = state.disbursements.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const name = (id) => sel.getUser(state, id)?.name || '—';
  const d = open && state.disbursements.find((x) => x.id === open);
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Payouts" sub="Money goes from the trust account to the institute against its fee invoice, after a trustee approves." />
      <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-[14px]">Admin can see every payout but cannot approve one. Finance prepares the request and a trustee approves it. Maker and checker must be different people.</p>
      </div>
      <DataTable
        rows={rows}
        searchText={(r) => `${sel.getStudent(state, r.studentId)?.fullName} ${r.invoiceNo} ${sel.getInstitute(state, r.instituteId)?.name}`}
        searchPlaceholder="Search student, invoice or institute"
        filter={{ options: [{ value: 'draft', label: 'Draft' }, { value: 'pending_trustee', label: 'Awaiting trustee' }, { value: 'approved', label: 'Approved' }, { value: 'paid', label: 'Paid' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'rejected', label: 'Rejected' }], getValue: (r) => r.status }}
        onRowClick={(r) => setOpen(r.id)}
        empty={{ icon: Wallet, title: 'No payouts yet' }}
        columns={[
          { key: 'student', label: 'Student', width: 'minmax(0,1.3fr)', sortValue: (r) => sel.getStudent(state, r.studentId)?.fullName, render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{sel.getStudent(state, r.studentId)?.fullName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Instalment {r.instalmentNo} · {r.invoiceNo}</div></div> },
          { key: 'institute', label: 'Institute', sortValue: (r) => sel.getInstitute(state, r.instituteId)?.name, render: (r) => sel.getInstitute(state, r.instituteId)?.name },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
          { key: 'status', label: 'Status', render: (r) => <PayoutChip status={r.status} /> },
        ]}
      />
      <BottomSheet open={!!d} onClose={() => setOpen(null)} title="Payout history">
        {d && (
          <div className="space-y-5">
            <div className="space-y-1">
              <KV label="Student" value={sel.getStudent(state, d.studentId)?.fullName} />
              <KV label="Institute" value={sel.getInstitute(state, d.instituteId)?.name} />
              <KV label="Invoice" value={`${d.invoiceNo} · instalment ${d.instalmentNo}`} />
              <KV label="Amount" value={formatINR(d.amount)} strong />
            </div>
            <Timeline
              items={[
                { title: `Created by ${name(d.createdBy)}`, time: formatDate(d.createdAt) },
                { title: d.status === 'rejected' ? `Rejected by ${name(d.approvedBy)}` : d.approvedBy ? `Approved by ${name(d.approvedBy)}` : 'Trustee approval', detail: d.rejectReason, time: d.approvedAt ? formatDate(d.approvedAt) : null, muted: !d.approvedBy },
                { title: d.utr ? `Paid · UTR ${d.utr}` : 'Paid to institute', time: d.paidOn ? formatDate(d.paidOn) : null, muted: !d.utr },
                { title: 'Institute confirmed receipt', time: d.confirmedAt ? formatDate(d.confirmedAt) : null, muted: !d.confirmedAt },
              ]}
            />
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

// --- Users and invites -----------------------------------------------------------
const STAFF_ROLES = [
  ['verifier', 'Verifier'],
  ['trustee', 'Trustee'],
  ['finance', 'Finance'],
  ['institute', 'Institute'],
  ['admin', 'Admin'],
];

function InviteSheet({ open, onClose, onInvited }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState({ name: '', mobile: '', email: '', role: 'verifier', districts: '', orgId: '', idProof: null });
  const [done, setDone] = useState(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (open) {
      setF({ name: '', mobile: '', email: '', role: 'verifier', districts: '', orgId: state.catalogue.institutes[0]?.id || '', idProof: null });
      setDone(null);
      setCopied(false);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const valid = f.name.trim() && f.mobile.replace(/\D/g, '').length >= 10 && f.email.includes('@') && (f.role !== 'verifier' || f.districts.trim()) && f.idProof;
  const invite = () => {
    const id = `u-${f.role}-${uid('u').slice(-6)}`;
    const token = Math.random().toString(36).slice(2, 10);
    dispatch('upsertUser', {
      user: {
        id, role: f.role, name: f.name.trim(), mobile: f.mobile.trim(), email: f.email.trim(), status: 'invited', invitedAt: new Date().toISOString(), inviteToken: token,
        districts: f.role === 'verifier' ? f.districts.split(',').map((d) => d.trim()).filter(Boolean) : undefined,
        orgId: f.role === 'institute' ? f.orgId : undefined, idProof: f.idProof,
      },
    });
    setDone({ id, link: `https://sikshitbharat.org/invite/${token}` });
    onInvited(`Invite sent to ${f.name.trim()}`);
  };
  return (
    <BottomSheet open={open} onClose={onClose} title={done ? 'Invite sent' : 'Invite staff'}>
      {done ? (
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            We sent this link by SMS and email (mocked). They open it, verify their mobile with an OTP and set a password.
          </p>
          <div className="flex items-center gap-2 p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224]">
            <Link2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span className="text-[13px] font-medium truncate flex-1">{done.link}</span>
            <SmallButton ariaLabel="Copy invite link" onClick={() => { try { navigator.clipboard.writeText(done.link); } catch { /* ignore */ } setCopied(true); }}>
              {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {copied ? 'Copied' : 'Copy'}
            </SmallButton>
          </div>
          <PrimaryButton onClick={onClose} className="w-full">Done</PrimaryButton>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Staff roles cannot sign up themselves. Only admin invites them.</p>
          <FloatingSelect label="Role" value={STAFF_ROLES.find(([k]) => k === f.role)[1]} onChange={(e) => setF((x) => ({ ...x, role: STAFF_ROLES.find(([, l]) => l === e.target.value)[0] }))} options={STAFF_ROLES.map(([, l]) => l)} />
          <FloatingInput label="Full name" value={f.name} onChange={set('name')} />
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput label="Mobile" value={f.mobile} onChange={set('mobile')} />
            <FloatingInput label="Email" type="email" value={f.email} onChange={set('email')} />
          </div>
          {f.role === 'verifier' && <FloatingInput label="Districts covered (comma separated)" value={f.districts} onChange={set('districts')} />}
          {f.role === 'institute' && (
            <label className="relative block">
              <select value={f.orgId} onChange={set('orgId')} aria-label="Institute" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
                {state.catalogue.institutes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Institute</span>
            </label>
          )}
          <FileDrop label="ID proof (PDF, JPG, PNG)" file={f.idProof} onFile={(file) => setF((x) => ({ ...x, idProof: file }))} />
          <PrimaryButton disabled={!valid} onClick={invite} className="w-full">
            <UserPlus className="w-4 h-4" strokeWidth={1.75} /> Send invite
          </PrimaryButton>
        </div>
      )}
    </BottomSheet>
  );
}

export function AdminUsers() {
  const { state, dispatch } = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const rows = state.users.filter((u) => !['student', 'sponsor', 'guardian'].includes(u.role));
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Users"
        sub="Trust staff and institute logins. Students, guardians and sponsors register themselves."
        actions={<PrimaryButton onClick={() => setInviteOpen(true)} className="h-12 px-6 text-[14px]"><UserPlus className="w-4 h-4" strokeWidth={1.75} /> Invite</PrimaryButton>}
      />
      <DataTable
        rows={rows}
        searchText={(r) => `${r.name} ${r.email}`}
        searchPlaceholder="Search staff"
        filter={{ options: STAFF_ROLES.map(([k, l]) => ({ value: k, label: l })), getValue: (r) => r.role }}
        columns={[
          { key: 'name', label: 'Name', width: 'minmax(0,1.4fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.name}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] truncate">{r.email}</div></div> },
          { key: 'role', label: 'Role', render: (r) => STAFF_ROLES.find(([k]) => k === r.role)?.[1] },
          { key: 'scope', label: 'Scope', sortable: false, render: (r) => (r.districts ? r.districts.join(', ') : r.orgId ? sel.getInstitute(state, r.orgId)?.name : '—') },
          { key: 'status', label: 'Status', render: (r) => (
            r.status === 'invited' ? (
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status="pending" label="Invited" />
                {state.settings.demoMode && <SmallButton onClick={() => { dispatch('upsertUser', { user: { ...r, status: 'active', joinedAt: new Date().toISOString() } }); toast(`${r.name} joined (demo)`); }}>Mark joined (demo)</SmallButton>}
              </div>
            ) : <StatusChip status="verified" label="Active" />
          ) },
        ]}
      />
      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={toast} />
      {toastEl}
    </div>
  );
}

// --- Reports ---------------------------------------------------------------------
function utilisationBy(state, keyFn) {
  const groups = {};
  state.students.forEach((st) => {
    const k = keyFn(st);
    if (!k) return;
    const g = (groups[k] = groups[k] || { key: k, students: 0, allocated: 0, paid: 0 });
    const alloc = sel.studentAllocated(state, st.id);
    if (alloc <= 0) return;
    g.students += 1;
    g.allocated += alloc;
    g.paid += alloc - sel.studentBalance(state, st.id);
  });
  return Object.values(groups)
    .filter((g) => g.students)
    .map((g) => ({ ...g, pct: g.allocated ? Math.round((g.paid / g.allocated) * 100) : 0 }))
    .sort((a, b) => b.allocated - a.allocated);
}

export function AdminReports() {
  const { state } = useStore();
  const [dim, setDim] = useState('exam');
  const months = sel.fundsByMonth(state, 6);
  const stages = sel.studentsByStage(state);
  const ds = donorStats(state);
  const util = utilisationBy(state, (st) => (dim === 'exam' ? st.exam : dim === 'state' ? st.state : st.district));
  const constituency = state.pools.filter((p) => p.id !== 'general').map((p) => {
    const lines = state.allocations.filter((a) => a.targetType === 'pool' && a.targetId === p.id);
    const inn = lines.filter((a) => a.amount > 0).reduce((s, a) => s + a.amount, 0);
    const out = -lines.filter((a) => a.amount < 0).reduce((s, a) => s + a.amount, 0);
    return { key: p.name, students: state.allocations.filter((a) => a.fromPool === p.id).length, allocated: inn, paid: out, pct: inn ? Math.round((out / inn) * 100) : 0 };
  });
  const utilCols = [
    { key: 'key', label: dim === 'exam' ? 'Exam' : dim === 'state' ? 'State' : 'District' },
    { key: 'students', label: 'Students' },
    { key: 'allocated', label: 'Allocated' },
    { key: 'paid', label: 'Paid to institutes' },
    { key: 'pct', label: 'Utilisation %' },
  ];
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Reports" sub="Exports are CSV files generated in your browser." />
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[15px] font-semibold">Funds in and out by month</div>
          <div className="flex items-center gap-3">
            <ChartLegend items={[{ label: 'In' }, { label: 'Paid out', secondary: true }]} />
            <CsvButton onClick={() => downloadCSV('funds-by-month.csv', [{ key: 'key', label: 'Month' }, { key: 'in', label: 'In' }, { key: 'out', label: 'Paid out' }], months)} />
          </div>
        </div>
        <BarChart data={months.map((m) => ({ label: m.label, value: m.in, value2: m.out }))} ariaLabel="Funds in and paid out by month" />
        <ChartAxis labels={months.map((m) => m.label)} />
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">General pool</div><div className="text-[26px] font-bold mt-1">{compactINR(sel.poolBalance(state, 'general'))}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Donor retention</div><div className="text-[26px] font-bold mt-1">{ds.retention}%</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{ds.repeat} of {ds.donors} gave again</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">SIP failures</div><div className="text-[26px] font-bold mt-1">{ds.sipFailures}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{ds.sipActive} active SIP{ds.sipActive === 1 ? '' : 's'}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Students</div><div className="text-[26px] font-bold mt-1">{state.students.length}</div></Card>
      </div>
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[15px] font-semibold">Students by stage</div>
          <CsvButton onClick={() => downloadCSV('students-by-stage.csv', [{ key: 'stage', label: 'Stage' }, { key: 'count', label: 'Students' }], STAGES.map((s) => ({ stage: s, count: stages[s] || 0 })))} />
        </div>
        <Donut segments={STAGES.filter((s) => stages[s]).map((s) => ({ label: s, value: stages[s] }))} label={String(state.students.length)} sublabel="students" />
      </Card>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Segmented value={dim} onChange={setDim} options={[{ value: 'exam', label: 'By exam' }, { value: 'state', label: 'By state' }, { value: 'district', label: 'By district' }]} />
          <CsvButton onClick={() => downloadCSV(`utilisation-by-${dim}.csv`, utilCols, util)} />
        </div>
        <DataTable
          rows={util}
          rowKey={(r) => r.key}
          columns={[
            { key: 'key', label: utilCols[0].label, width: 'minmax(0,1.3fr)', render: (r) => <span className="font-semibold">{r.key}</span> },
            { key: 'students', label: 'Students', align: 'right' },
            { key: 'allocated', label: 'Allocated', align: 'right', render: (r) => formatINR(r.allocated) },
            { key: 'paid', label: 'Paid', align: 'right', render: (r) => formatINR(r.paid) },
            { key: 'pct', label: 'Utilised', align: 'right', render: (r) => `${r.pct}%` },
          ]}
          empty={{ title: 'No funded students yet' }}
        />
      </section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionLabel>Constituency pools</SectionLabel>
          <CsvButton onClick={() => downloadCSV('constituency-utilisation.csv', [{ key: 'key', label: 'Pool' }, { key: 'allocated', label: 'Received' }, { key: 'paid', label: 'Allocated to students' }, { key: 'pct', label: '%' }], constituency)} />
        </div>
        {constituency.map((c) => (
          <Card key={c.key} className="space-y-1">
            <div className="text-[15px] font-semibold mb-1">{c.key}</div>
            <KV label="Received" value={formatINR(c.allocated)} />
            <KV label="Allocated to students" value={`${formatINR(c.paid)} (${c.pct}%)`} />
            <KV label="Balance" value={formatINR(c.allocated - c.paid)} />
          </Card>
        ))}
      </section>
    </div>
  );
}

// --- Settings ----------------------------------------------------------------------
export function AdminSettings({ onResetDemo, themeSlot }) {
  const { state, dispatch } = useStore();
  const s = state.settings;
  const [f, setF] = useState(() => ({ ...s, caps: Object.entries(s.extraCategoryCaps).map(([k, v]) => ({ k, v })) }));
  const [resetOpen, setResetOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const dirty =
    Number(f.platformFeePercent) !== s.platformFeePercent || f.feeMode !== s.feeMode || Number(f.incomeCeiling) !== s.incomeCeiling ||
    Number(f.minClass10Marks) !== s.minClass10Marks || Number(f.verifierSlaDays) !== s.verifierSlaDays ||
    JSON.stringify(Object.fromEntries(f.caps.filter((c) => c.k.trim()).map((c) => [c.k.trim(), Number(c.v) || 0]))) !== JSON.stringify(s.extraCategoryCaps);
  const save = () => {
    dispatch('setSettings', {
      platformFeePercent: Number(f.platformFeePercent), feeMode: f.feeMode, incomeCeiling: Number(f.incomeCeiling), minClass10Marks: Number(f.minClass10Marks),
      verifierSlaDays: Number(f.verifierSlaDays), extraCategoryCaps: Object.fromEntries(f.caps.filter((c) => c.k.trim()).map((c) => [c.k.trim(), Number(c.v) || 0])),
    });
    toast('Settings saved');
  };
  const Toggle = ({ on, onClick, label, sub }) => (
    <button type="button" onClick={onClick} aria-pressed={on} className="w-full flex items-center justify-between gap-4 text-left">
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        {sub && <span className="block text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{sub}</span>}
      </span>
      <span className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#D4D4D8] dark:bg-[#3F3F46]'}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-[#0A0A0A] transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </button>
  );
  return (
    <div className="space-y-8 pb-12 max-w-[820px]">
      <PageHeader title="Settings" sub="Business rules live here so they can be changed in one place. Every change is written to the audit log." />
      <Card className={`space-y-4 ${RAISED_INPUTS}`}>
        <SectionLabel>Platform fee</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Fee %" type="number" value={f.platformFeePercent} onChange={(e) => setF((x) => ({ ...x, platformFeePercent: e.target.value }))} />
          <FloatingSelect label="Fee mode" value={f.feeMode} onChange={(e) => setF((x) => ({ ...x, feeMode: e.target.value }))} options={['ON_TOP', 'DEDUCTED']} />
        </div>
        <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
          Open decision for the client. ON_TOP: the donor pays the amount plus {f.platformFeePercent}%. DEDUCTED: the fee comes out of the amount. Applies to new checkouts only.
        </p>
      </Card>
      <Card className={`space-y-4 ${RAISED_INPUTS}`}>
        <SectionLabel>Eligibility and verification</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Amount label="Income ceiling (₹ a year)" value={f.incomeCeiling} onChange={(v) => setF((x) => ({ ...x, incomeCeiling: v }))} />
          <FloatingInput label="Min. Class 10 marks %" type="number" value={f.minClass10Marks} onChange={(e) => setF((x) => ({ ...x, minClass10Marks: e.target.value }))} />
          <FloatingInput label="Verifier SLA (days)" type="number" value={f.verifierSlaDays} onChange={(e) => setF((x) => ({ ...x, verifierSlaDays: e.target.value }))} />
        </div>
      </Card>
      <Card className={`space-y-4 ${RAISED_INPUTS}`}>
        <div className="flex items-center justify-between">
          <SectionLabel>Extras categories and caps</SectionLabel>
          <SmallButton onClick={() => setF((x) => ({ ...x, caps: [...x.caps, { k: '', v: 0 }] }))}><Plus className="w-3.5 h-3.5" strokeWidth={1.75} /> Add</SmallButton>
        </div>
        {f.caps.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <FloatingInput label="Category" value={c.k} onChange={(e) => setF((x) => ({ ...x, caps: x.caps.map((y, j) => (j === i ? { ...y, k: e.target.value } : y)) }))} className="flex-1" />
            <Amount label="Cap (₹)" value={c.v} onChange={(v) => setF((x) => ({ ...x, caps: x.caps.map((y, j) => (j === i ? { ...y, v } : y)) }))} className="flex-1" />
            <button type="button" aria-label={`Remove ${c.k || 'category'}`} onClick={() => setF((x) => ({ ...x, caps: x.caps.filter((_, j) => j !== i) }))} className="w-11 h-11 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        ))}
        <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Placeholder categories and caps until the client confirms them.</p>
      </Card>
      <div className="flex gap-3">
        <PrimaryButton disabled={!dirty} onClick={save}>Save settings</PrimaryButton>
        {dirty && <SecondaryButton onClick={() => setF({ ...s, caps: Object.entries(s.extraCategoryCaps).map(([k, v]) => ({ k, v })) })}>Discard</SecondaryButton>}
      </div>
      <Card className="space-y-5">
        <Toggle
          on={s.institutePortalEnabled}
          onClick={() => dispatch('setSettings', { institutePortalEnabled: !s.institutePortalEnabled })}
          label="Institute portal (Phase 1.5)"
          sub="Not in the original SOW. When off, admin acts on behalf of institutes."
        />
        <Toggle on={s.demoMode} onClick={() => dispatch('setSettings', { demoMode: !s.demoMode })} label="Demo mode" sub="Shows the role switcher and simulation controls." />
        {s.demoMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span>
              <span className="block text-[15px] font-semibold">Scheduled reminders</span>
              <span className="block text-[13px] text-[#52525B] dark:text-[#A1A1AA]">SLA, monthly progress, SIP and consent reminders run once a day{s.lastReminderRun ? ` · last run ${s.lastReminderRun}` : ''}.</span>
            </span>
            <SmallButton onClick={() => { dispatch('runReminders', {}); toast('Reminders sent'); }} className="bg-white dark:bg-[#222224]">Run now (demo)</SmallButton>
          </div>
        )}
      </Card>
      {themeSlot}
      <Card className="space-y-3">
        <SectionLabel>Demo data</SectionLabel>
        <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">All data lives in this browser. Reset restores the seed data for every role.</p>
        <SecondaryButton onClick={() => setResetOpen(true)} className="h-11 px-5 text-[14px] bg-white dark:bg-[#222224]">Reset demo data</SecondaryButton>
      </Card>
      <ConfirmSheet open={resetOpen} title="Reset demo data?" body="Everything changed in this browser is replaced with the original seed data." confirmLabel="Reset" destructive onClose={() => setResetOpen(false)} onConfirm={() => { setResetOpen(false); onResetDemo(); }} />
      {toastEl}
    </div>
  );
}

// --- Moderation: thank-you notes + student requests --------------------------------
export function AdminModeration({ params = {} }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState(params.tab || 'notes');
  const [reject, setReject] = useState(null);
  const [declineCr, setDeclineCr] = useState(null);
  const [toastEl, toast] = useToast();
  const [confirmEl, confirm] = useConfirm();
  useEffect(() => { if (params.tab) setTab(params.tab); }, [params]);
  const notes = state.thankYouNotes.filter((n) => n.state === 'pending');
  const crs = state.changeRequests.filter((c) => c.state === 'open');
  const openIr = state.instituteRequests.filter((r) => r.state === 'open').length;
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Moderation" sub="Thank-you notes are checked before sponsors see them. Student change requests are approved here." />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'notes', label: 'Thank-you notes', count: notes.length },
          { value: 'requests', label: 'Change requests', count: crs.length },
          { value: 'institutes', label: 'Institute requests', count: openIr },
        ]}
      />
      {tab === 'notes' && (
        <div className="space-y-3">
          {notes.length === 0 && <EmptyState icon={MessageSquareHeart} title="No notes to moderate" body="Notes students write to sponsors appear here first." />}
          {notes.map((n) => {
            const st = sel.getStudent(state, n.studentId);
            const sp = sel.getSponsor(state, n.sponsorId);
            return (
              <div key={n.id} className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{st?.fullName} → {sp?.displayName} · {timeAgo(n.at)}</div>
                <p className="text-[15px] leading-relaxed">“{n.text}”</p>
                <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Check: no phone number, address, surname or photo.</p>
                <div className="flex gap-2">
                  <SmallButton primary onClick={() => confirm({ title: 'Share this note?', body: `${sp?.displayName} will see it. Only approve notes without contact details, surname or photos.`, confirmLabel: 'Approve and share', onConfirm: () => { dispatch('moderateThankYou', { noteId: n.id, decision: 'approved' }); toast('Shared with the sponsor'); } })}>Approve and share</SmallButton>
                  <SmallButton onClick={() => setReject(n)}>Reject</SmallButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === 'requests' && (
        <div className="space-y-3">
          {crs.length === 0 && <EmptyState icon={Inbox} title="No open change requests" body="Package changes and exam switches requested by students appear here." />}
          {crs.map((c) => {
            const st = sel.getStudent(state, c.studentId);
            return (
              <div key={c.id} className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold">{st?.fullName}</span>
                    <StatusChip status="needs_review" label={c.kind === 'exam_switch' ? 'Exam / course switch' : 'Package change'} />
                  </div>
                  <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mt-1">{c.detail}</p>
                  <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                    {st?.status} · {timeAgo(c.at)}
                    {c.kind === 'exam_switch' && (st?.examSwitchUsed ? ' · already switched once' : ' · first switch')}
                    {c.kind === 'exam_switch' && state.disbursements.some((d) => d.studentId === c.studentId && ['paid', 'confirmed'].includes(d.status)) ? ' · a fee has already been paid' : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <SmallButton
                    primary
                    disabled={c.kind === 'exam_switch' && (st?.examSwitchUsed || state.disbursements.some((d) => d.studentId === c.studentId && ['paid', 'confirmed'].includes(d.status)))}
                    onClick={() => confirm({ title: 'Approve this change?', body: c.kind === 'exam_switch' ? 'The student can change exam or course once, then locks the package again.' : 'The package is unlocked so the student can edit it and lock it again.', confirmLabel: 'Approve', onConfirm: () => { dispatch('resolveChangeRequest', { requestId: c.id, decision: 'approved' }); toast('Approved. Package unlocked for the student.'); } })}
                  >
                    Approve
                  </SmallButton>
                  <SmallButton onClick={() => setDeclineCr(c)}>Decline</SmallButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab === 'institutes' && <InstituteRequestsInbox />}
      <ConfirmSheet
        open={!!reject}
        title="Reject this note?"
        body="The student is told it was not shared, with your reason."
        confirmLabel="Reject note"
        destructive
        reasonRequired
        onClose={() => setReject(null)}
        onConfirm={(reason) => { dispatch('moderateThankYou', { noteId: reject.id, decision: 'rejected', reason }); setReject(null); toast('Note rejected'); }}
      />
      <ConfirmSheet
        open={!!declineCr}
        title="Decline this request?"
        body="The student sees your note. Their package stays locked."
        confirmLabel="Decline"
        destructive
        reasonRequired
        onClose={() => setDeclineCr(null)}
        onConfirm={(note) => { dispatch('resolveChangeRequest', { requestId: declineCr.id, decision: 'declined', note }); setDeclineCr(null); toast('Request declined'); }}
      />
      {toastEl}
      {confirmEl}
    </div>
  );
}

// --- Audit log ------------------------------------------------------------------------
export function AdminAuditLog() {
  const { state } = useStore();
  const [actor, setActor] = useState('All actors');
  const [entity, setEntity] = useState('All entities');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const actorName = (a) => sel.getUser(state, a.actorId)?.name || (a.actorId === 'gateway' ? 'Payment gateway' : 'System');
  const actors = ['All actors', ...new Set(state.auditLog.map(actorName))];
  const entities = ['All entities', ...new Set(state.auditLog.map((a) => a.entity))];
  const rows = state.auditLog.filter(
    (a) =>
      (actor === 'All actors' || actorName(a) === actor) &&
      (entity === 'All entities' || a.entity === entity) &&
      (!from || a.at.slice(0, 10) >= from) &&
      (!to || a.at.slice(0, 10) <= to)
  );
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Audit log" sub="Every approval, rejection, payout and settings change." />
      <div className="flex flex-wrap items-center gap-2">
        <MiniSelect label="Actor" value={actor} onChange={setActor} options={actors} />
        <MiniSelect label="Entity" value={entity} onChange={setEntity} options={entities} />
        <label className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[13px]">
          From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="bg-transparent outline-none" />
        </label>
        <label className="inline-flex items-center gap-2 h-11 px-4 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[13px]">
          To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="bg-transparent outline-none" />
        </label>
        <CsvButton onClick={() => downloadCSV('audit-log.csv', [{ label: 'When', value: (a) => a.at }, { label: 'Actor', value: actorName }, { key: 'role', label: 'Role' }, { key: 'action', label: 'Action' }, { key: 'entity', label: 'Entity' }, { key: 'entityId', label: 'Entity ID' }], rows)} />
      </div>
      <DataTable
        rows={rows}
        searchText={(a) => `${a.action} ${a.entityId}`}
        searchPlaceholder="Search actions"
        columns={[
          { key: 'at', label: 'When', width: 'minmax(0,0.9fr)', render: (a) => <div><div className="font-medium">{formatDate(a.at)}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{timeAgo(a.at)}</div></div> },
          { key: 'actor', label: 'Actor', sortValue: actorName, render: (a) => <div className="min-w-0"><div className="font-medium truncate">{actorName(a)}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{a.role}</div></div> },
          { key: 'action', label: 'Action', width: 'minmax(0,2fr)', render: (a) => <span className="break-words">{a.action}</span> },
          { key: 'entity', label: 'Entity', render: (a) => <span className="text-[13px] break-all">{a.entity} · {a.entityId}</span> },
        ]}
        empty={{ title: 'No entries match these filters' }}
      />
    </div>
  );
}
