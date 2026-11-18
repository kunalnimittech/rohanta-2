// Institute portal (Part 9, "Phase 1.5"). Thin by design: it exists so fee
// invoices and fee receipts have an owner. Admin/finance can always act on an
// institute's behalf, and admin can switch this portal off in Settings.
import React, { useState } from 'react';
import { Users, FileText, IndianRupee, CheckCircle2, Plus, Upload, Building2, Lock, PowerOff } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  StatTile,
  EmptyState,
  SectionLabel,
  FloatingInput,
  FloatingTextarea,
  FileDrop,
  Amount,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, PayoutChip, useToast } from '../admin/AdminShared';

const FUNDED = ['Partially funded', 'Fully funded', 'Enrolled', 'Completed', 'Dropped'];
const INVOICE_CHIP = { submitted: ['pending', 'With trust'], used: ['uploaded', 'Payout in progress'], paid: ['verified', 'Paid'] };

function useInstitute(user) {
  const { state } = useStore();
  const inst = sel.getInstitute(state, user.orgId);
  const students = state.students.filter((s) => s.instituteId === user.orgId && FUNDED.includes(s.status));
  const disbursements = state.disbursements.filter((d) => d.instituteId === user.orgId);
  const invoices = state.invoices.filter((i) => i.instituteId === user.orgId);
  return { state, inst, students, disbursements, invoices, portalOn: state.settings.institutePortalEnabled !== false };
}

function PortalOff() {
  return (
    <EmptyState
      icon={PowerOff}
      title="The institute portal is switched off"
      body="The trust's finance team handles invoices and fee receipts with you directly. Contact accounts@sikshitbharat.org."
    />
  );
}

/** Status of each instalment for one student, as the institute sees it. */
function instalmentRows(state, student) {
  const course = sel.getCourse(state, student.courseId);
  if (!course) return [];
  return course.instalments.map((i) => {
    const d = state.disbursements
      .filter((x) => x.studentId === student.id && x.instalmentNo === i.no && x.status !== 'rejected')
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
    const inv = state.invoices.find((x) => x.studentId === student.id && x.instalmentNo === i.no);
    return { ...i, d, inv };
  });
}

function InstalmentChip({ row }) {
  if (row.d) return <PayoutChip status={row.d.status} />;
  if (row.inv) return <StatusChip status="pending" label="Invoice sent" />;
  return <StatusChip status="not_uploaded" label="Not invoiced" />;
}

// --- Confirm fee received ------------------------------------------------------------
function ConfirmReceiptSheet({ d, onClose, onDone }) {
  const { state, dispatch } = useStore();
  const [file, setFile] = useState(null);
  if (!d) return null;
  const st = sel.getStudent(state, d.studentId);
  return (
    <BottomSheet open={!!d} onClose={onClose} title="Confirm fee received">
      <div className="space-y-4">
        <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] space-y-1">
          <KV label="Student" value={st?.fullName} />
          <KV label="Instalment" value={`#${d.instalmentNo} · ${d.invoiceNo}`} />
          <KV label="Amount" value={formatINR(d.amount)} strong />
          <KV label="UTR" value={d.utr} />
          <KV label="Paid on" value={formatDate(d.paidOn)} />
        </div>
        <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Upload the fee receipt issued in the student&apos;s name. This tells the trust and the sponsors that the fee has reached you.</p>
        <FileDrop label="Fee receipt (PDF, JPG, PNG)" file={file} onFile={setFile} />
        <PrimaryButton disabled={!file} onClick={() => { dispatch('instituteConfirm', { disbursementId: d.id, receiptFile: file }); onDone(); }} className="w-full">
          Confirm fee received
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

// --- Upload invoice --------------------------------------------------------------------
function UploadInvoiceSheet({ open, onClose, user, presetStudent, presetInstalment, onDone }) {
  const { state, dispatch } = useStore();
  const { students } = useInstitute(user);
  const [studentId, setStudentId] = useState(presetStudent || '');
  const [no, setNo] = useState(presetInstalment || '');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [loaded, setLoaded] = useState(null);
  const key = `${open}-${presetStudent}-${presetInstalment}`;
  if (open && loaded !== key) {
    setLoaded(key);
    setStudentId(presetStudent || '');
    setInvoiceNo('');
    setFile(null);
    const st = presetStudent && sel.getStudent(state, presetStudent);
    const inst = st && sel.getCourse(state, st.courseId)?.instalments.find((i) => i.no === Number(presetInstalment));
    setNo(presetInstalment ? String(presetInstalment) : '');
    setAmount(inst ? inst.amount : '');
    setDueDate(inst ? inst.dueDate : '');
  }
  if (!open && loaded) setLoaded(null);
  const st = studentId && sel.getStudent(state, studentId);
  const rows = st ? instalmentRows(state, st).filter((r) => !r.inv && !r.d) : [];
  const dupNo = invoiceNo.trim() && state.invoices.some((i) => i.invoiceNo.trim().toLowerCase() === invoiceNo.trim().toLowerCase());
  const valid = st && no && invoiceNo.trim().length >= 3 && !dupNo && Number(amount) > 0 && dueDate && file;
  const pick = (v) => {
    setNo(v);
    const r = rows.find((x) => x.no === Number(v));
    if (r) { setAmount(r.amount); setDueDate(r.dueDate); }
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Upload a fee invoice">
      <div className="space-y-4">
        <label className="relative block">
          <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setNo(''); }} aria-label="Student" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
            <option value="">Choose a student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} · {s.id}</option>)}
          </select>
          <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Student</span>
        </label>
        {st && (
          rows.length === 0 ? (
            <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Every instalment for this student already has an invoice.</p>
          ) : (
            <label className="relative block">
              <select value={no} onChange={(e) => pick(e.target.value)} aria-label="Instalment" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
                <option value="">Choose an instalment</option>
                {rows.map((r) => <option key={r.no} value={r.no}>#{r.no} · {formatINR(r.amount)} · due {formatDate(r.dueDate)}</option>)}
              </select>
              <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Instalment</span>
            </label>
          )
        )}
        <FloatingInput label="Invoice number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
        {dupNo && <p className="px-2 text-[12px] font-medium">This invoice number has already been used.</p>}
        <div className="grid grid-cols-2 gap-3">
          <Amount label="Amount (₹)" value={amount} onChange={setAmount} />
          <FloatingInput label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        {st && no && rows.find((r) => r.no === Number(no)) && Number(amount) !== rows.find((r) => r.no === Number(no)).amount && (
          <p className="px-2 text-[12px] font-medium">The amount differs from the agreed instalment of {formatINR(rows.find((r) => r.no === Number(no)).amount)}. The trust may ask for a corrected invoice.</p>
        )}
        <FileDrop label="Invoice file (PDF, JPG, PNG)" file={file} onFile={setFile} />
        <PrimaryButton
          disabled={!valid}
          onClick={() => {
            dispatch('uploadInvoice', { invoice: { instituteId: user.orgId, studentId, instalmentNo: Number(no), invoiceNo: invoiceNo.trim(), amount: Number(amount), dueDate, file } });
            onDone('Invoice sent to the trust');
            onClose();
          }}
          className="w-full"
        >
          Send to the trust
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

// --- Pages ------------------------------------------------------------------------------
export function InstituteOverview({ user, onNavigate }) {
  const { state, inst, students, disbursements, invoices, portalOn } = useInstitute(user);
  const [confirm, setConfirm] = useState(null);
  const [toastEl, toast] = useToast();
  if (!portalOn) return <PortalOff />;
  if (!inst) return <EmptyState icon={Building2} title="Institute not found" />;
  const toConfirm = disbursements.filter((d) => d.status === 'paid');
  const received = disbursements.filter((d) => ['paid', 'confirmed'].includes(d.status)).reduce((n, d) => n + d.amount, 0);
  const inProgress = disbursements.filter((d) => ['draft', 'pending_trustee', 'approved'].includes(d.status)).length + invoices.filter((i) => i.status === 'submitted').length;
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title={inst.name}
        sub={`${inst.city} · ${inst.approvalStatus === 'approved' ? 'Approved partner' : 'Approval pending'} · bank ${inst.bankVerified ? 'verified' : 'not verified'}`}
      />
      {inst.approvalStatus !== 'approved' && (
        <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 text-[14px]">
          The trust is still checking your registration and bank details. Students can choose your courses once you are approved.
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Funded students" value={students.length} icon={Users} onClick={() => onNavigate('students')} />
        <StatTile label="Invoices in progress" value={inProgress} icon={FileText} onClick={() => onNavigate('invoices')} />
        <StatTile label="Received from the trust" value={formatINR(received)} icon={IndianRupee} />
        <StatTile label="Payments to confirm" value={toConfirm.length} icon={CheckCircle2} onClick={() => onNavigate('invoices')} />
      </div>
      <Card className="space-y-3">
        <div className="text-[15px] font-semibold">Payments to confirm</div>
        {toConfirm.length === 0 ? (
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">When the trust pays an invoice, confirm the fee here and upload the receipt.</p>
        ) : (
          toConfirm.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-1">
              <div className="text-[14px]">
                <span className="font-semibold">{formatINR(d.amount)}</span> · {sel.getStudent(state, d.studentId)?.fullName}
              </div>
              <SmallButton primary onClick={() => setConfirm(d)}>Confirm fee received</SmallButton>
            </div>
          ))
        )}
      </Card>
      <ConfirmReceiptSheet d={confirm} onClose={() => setConfirm(null)} onDone={() => { setConfirm(null); toast('Thank you. The trust and sponsors are informed.'); }} />
      {toastEl}
    </div>
  );
}

export function InstituteStudents({ user }) {
  const { state, students, portalOn } = useInstitute(user);
  const [open, setOpen] = useState(null);
  const [uploadFor, setUploadFor] = useState(null);
  const [toastEl, toast] = useToast();
  if (!portalOn) return <PortalOff />;
  const st = open && sel.getStudent(state, open);
  const course = st && sel.getCourse(state, st.courseId);
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Students" sub="Students funded by the trust in your batches. Fees are paid by the trust, never by the family." />
      <DataTable
        rows={students}
        rowKey={(r) => r.id}
        searchText={(r) => `${r.fullName} ${r.id}`}
        searchPlaceholder="Search students"
        onRowClick={(r) => setOpen(r.id)}
        empty={{ icon: Users, title: 'No funded students yet', body: 'Students who choose your courses appear here once sponsors fund them.' }}
        columns={[
          { key: 'fullName', label: 'Student', width: 'minmax(0,1.4fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.fullName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.id}</div></div> },
          { key: 'course', label: 'Course', width: 'minmax(0,1.6fr)', sortValue: (r) => sel.getCourse(state, r.courseId)?.name, render: (r) => <span className="truncate block">{sel.getCourse(state, r.courseId)?.name}</span> },
          { key: 'batch', label: 'Batch', sortable: false, render: (r) => { const b = sel.getCourse(state, r.courseId)?.batches.find((x) => x.id === r.batchId) || sel.getCourse(state, r.courseId)?.batches[0]; return b ? `${b.branch} · ${formatDate(b.start)}` : '—'; } },
          { key: 'paid', label: 'Instalments paid', align: 'right', sortValue: (r) => instalmentRows(state, r).filter((x) => x.d && ['paid', 'confirmed'].includes(x.d.status)).length, render: (r) => { const rows = instalmentRows(state, r); return `${rows.filter((x) => x.d && ['paid', 'confirmed'].includes(x.d.status)).length} of ${rows.length}`; } },
          { key: 'status', label: 'Stage', render: (r) => <StatusChip status={r.status === 'Dropped' ? 'rejected' : r.status === 'Enrolled' ? 'verified' : 'uploaded'} label={r.status} /> },
        ]}
      />
      <BottomSheet open={!!st} onClose={() => setOpen(null)} title={st?.fullName || ''}>
        {st && (
          <div className="space-y-4">
            <div className="space-y-1">
              <KV label="Student ID" value={st.id} />
              <KV label="Course" value={course?.name} />
              <KV label="Exam" value={st.exam} />
            </div>
            <SectionLabel>Instalment schedule</SectionLabel>
            <div className="space-y-2">
              {instalmentRows(state, st).map((r) => (
                <div key={r.no} className="px-4 py-3 rounded-[16px] bg-[#F4F4F5] dark:bg-[#222224] flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[14px] font-semibold">#{r.no} · {formatINR(r.amount)}</div>
                    <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Due {formatDate(r.dueDate)}{r.inv ? ` · ${r.inv.invoiceNo}` : ''}{r.d?.utr ? ` · UTR ${r.d.utr}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <InstalmentChip row={r} />
                    {!r.inv && !r.d && st.status !== 'Dropped' && <SmallButton onClick={() => setUploadFor({ studentId: st.id, no: r.no })}><Upload className="w-3.5 h-3.5" strokeWidth={1.75} /> Invoice</SmallButton>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Contact details and family information are not shared with institutes.</p>
          </div>
        )}
      </BottomSheet>
      <UploadInvoiceSheet open={!!uploadFor} onClose={() => setUploadFor(null)} user={user} presetStudent={uploadFor?.studentId} presetInstalment={uploadFor?.no} onDone={toast} />
      {toastEl}
    </div>
  );
}

export function InstituteInvoices({ user }) {
  const { state, invoices, disbursements, portalOn } = useInstitute(user);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toastEl, toast] = useToast();
  if (!portalOn) return <PortalOff />;
  const rows = invoices
    .map((i) => ({ ...i, d: disbursements.filter((d) => d.invoiceNo === i.invoiceNo).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0] }))
    .sort((a, b) => (a.at < b.at ? 1 : -1));
  const toConfirm = disbursements.filter((d) => d.status === 'paid');
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Invoices"
        sub="One invoice per student per instalment. The trust pays your verified bank account after a trustee approves."
        actions={<PrimaryButton onClick={() => setUploadOpen(true)} className="h-12 px-6 text-[14px]"><Plus className="w-4 h-4" strokeWidth={1.75} /> Upload invoice</PrimaryButton>}
      />
      {toConfirm.length > 0 && (
        <section className="space-y-3">
          <SectionLabel>Paid by the trust · please confirm</SectionLabel>
          {toConfirm.map((d) => (
            <div key={d.id} className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[15px] font-semibold">{formatINR(d.amount)} · {sel.getStudent(state, d.studentId)?.fullName}</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{d.invoiceNo} · instalment {d.instalmentNo} · UTR {d.utr} · {formatDate(d.paidOn)}</div>
              </div>
              <PrimaryButton onClick={() => setConfirm(d)} className="h-12 px-6 text-[14px] shrink-0">Confirm fee received</PrimaryButton>
            </div>
          ))}
        </section>
      )}
      <DataTable
        rows={rows}
        searchText={(r) => `${r.invoiceNo} ${sel.getStudent(state, r.studentId)?.fullName}`}
        searchPlaceholder="Search invoices"
        empty={{ icon: FileText, title: 'No invoices yet', body: 'Upload an invoice for each funded student when an instalment is due.' }}
        columns={[
          { key: 'invoiceNo', label: 'Invoice', width: 'minmax(0,1.2fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.invoiceNo}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.file?.name || '—'}{r.onBehalf ? ' · uploaded by the trust' : ''}</div></div> },
          { key: 'student', label: 'Student', sortValue: (r) => sel.getStudent(state, r.studentId)?.fullName, render: (r) => `${sel.getStudent(state, r.studentId)?.fullName} · #${r.instalmentNo}` },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
          { key: 'dueDate', label: 'Due', render: (r) => (r.dueDate ? formatDate(r.dueDate) : '—') },
          { key: 'status', label: 'Status', render: (r) => (r.d ? <PayoutChip status={r.d.status} /> : <StatusChip status={(INVOICE_CHIP[r.status] || INVOICE_CHIP.submitted)[0]} label={(INVOICE_CHIP[r.status] || INVOICE_CHIP.submitted)[1]} />) },
        ]}
      />
      <UploadInvoiceSheet open={uploadOpen} onClose={() => setUploadOpen(false)} user={user} onDone={toast} />
      <ConfirmReceiptSheet d={confirm} onClose={() => setConfirm(null)} onDone={() => { setConfirm(null); toast('Thank you. The trust and sponsors are informed.'); }} />
      {toastEl}
    </div>
  );
}

export function InstituteProfile({ user }) {
  const { state, inst, portalOn } = useInstitute(user);
  const { dispatch } = useStore();
  const [reqOpen, setReqOpen] = useState(false);
  const [toastEl, toast] = useToast();
  if (!portalOn) return <PortalOff />;
  if (!inst) return null;
  const courses = state.catalogue.courses.filter((c) => c.instituteId === inst.id);
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Profile"
        sub="Managed by the trust. Ask for a change if anything is out of date."
        actions={<><StatusChip status={inst.approvalStatus === 'approved' ? 'verified' : 'pending'} label={inst.approvalStatus === 'approved' ? 'Approved' : 'Pending approval'} /><StatusChip status={inst.bankVerified ? 'verified' : 'pending'} label={inst.bankVerified ? 'Bank verified' : 'Bank not verified'} /></>}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Registration</SectionLabel>
          <KV label="Legal entity" value={inst.legalType} />
          <KV label="GST / registration" value={inst.gst} />
          <KV label="PAN" value={inst.pan} />
          <KV label="Address" value={inst.address} />
          <KV label="Branches" value={(inst.branches || []).join(', ')} />
          <KV label="Years in operation" value={inst.years} />
          <KV label="MoU accepted" value={inst.mouAccepted ? 'Yes' : 'No'} />
        </Card>
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Contact and bank</SectionLabel>
          <KV label="Contact person" value={inst.contactPerson} />
          <KV label="Email" value={inst.email} />
          <KV label="Mobile" value={inst.mobile} />
          <KV label="Bank" value={inst.bank?.name} />
          <KV label="Account" value={inst.bank?.account} />
          <KV label="IFSC" value={inst.bank?.ifsc} />
        </Card>
      </div>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>Courses and batches</SectionLabel>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]"><Lock className="w-3.5 h-3.5" strokeWidth={1.75} /> Read-only</span>
        </div>
        {courses.map((c) => (
          <Card key={c.id} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[15px] font-semibold">{c.name}</div>
              <span className="text-[15px] font-semibold">{formatINR(c.fee)}</span>
            </div>
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{c.exam} · {c.duration} · {c.mode} · {c.medium}</div>
            <div className="text-[13px]">Batches: {c.batches.map((b) => `${b.branch}, ${formatDate(b.start)} to ${formatDate(b.end)}, ${b.seats} seats`).join(' · ')}</div>
            <div className="text-[13px]">Instalments: {c.instalments.map((i) => `#${i.no} ${formatINR(i.amount)} on ${formatDate(i.dueDate)}`).join(' · ')}</div>
          </Card>
        ))}
      </section>
      <SecondaryButton onClick={() => setReqOpen(true)}>Request a change</SecondaryButton>
      <ConfirmSheet
        open={reqOpen}
        title="Request a profile change"
        body="The trust admin updates your profile. Changing bank details needs a new cancelled cheque and re-verification."
        confirmLabel="Send to the trust"
        reasonRequired
        reasonLabel="What should change?"
        onClose={() => setReqOpen(false)}
        onConfirm={(detail) => { setReqOpen(false); dispatch('instituteChangeRequest', { instituteId: inst.id, detail }); toast('Sent to the trust admin'); }}
      />
      {toastEl}
    </div>
  );
}
