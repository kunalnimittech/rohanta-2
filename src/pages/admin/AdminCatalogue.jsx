import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Building2, BookOpen, AlertCircle, Check, X, Inbox } from 'lucide-react';
import { useStore, uid } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  Segmented,
  FloatingInput,
  FloatingSelect,
  FileDrop,
  Amount,
  EmptyState,
  SectionLabel,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, useToast, useConfirm } from './AdminShared';

const EXAMS = ['JEE', 'NEET', 'CUET'];
const LEGAL_TYPES = ['Private Limited', 'LLP', 'Partnership', 'Proprietorship', 'Society', 'Trust'];
const MODES = ['Classroom', 'Online', 'Hybrid'];
const MEDIUMS = ['English', 'Hindi', 'Hindi + English'];

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const startLabel = (isoDate) => {
  const d = new Date(isoDate);
  return Number.isNaN(d.getTime()) ? '' : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** Equal instalments spread across the course, rounded to ₹100; the last one absorbs the remainder. */
export function buildInstalments(fee, months, start, count) {
  const n = Math.max(1, Number(count) || 1);
  const step = Math.max(1, Math.floor(months / n));
  const base = Math.floor(fee / n / 100) * 100;
  const s = new Date(start);
  return Array.from({ length: n }, (_, i) => ({
    no: i + 1,
    dueDate: iso(new Date(s.getFullYear(), s.getMonth() + i * step, s.getDate())),
    amount: i === n - 1 ? fee - base * (n - 1) : base,
  }));
}

const ApprovalChip = ({ status }) => (
  <StatusChip status={status === 'approved' ? 'verified' : status === 'rejected' ? 'rejected' : 'pending'} label={status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending approval'} />
);

// --- Institute form ---------------------------------------------------------------
const EMPTY_INST = {
  name: '', legalType: 'Private Limited', gst: '', pan: '', address: '', city: '', branchesText: '', contactPerson: '', email: '', mobile: '',
  bankName: '', bankAccount: '', bankIfsc: '', years: '', pastResults: '', mouAccepted: false, exams: ['JEE'], mode: 'Offline · Classroom', cheque: null,
};

function InstituteForm({ open, onClose, initial, onSaved }) {
  const { dispatch } = useStore();
  const [f, setF] = useState(EMPTY_INST);
  const [loadedFor, setLoadedFor] = useState(null);
  if (open && loadedFor !== (initial?.id || 'new')) {
    setLoadedFor(initial?.id || 'new');
    setF(
      initial
        ? {
            ...EMPTY_INST, ...initial, branchesText: (initial.branches || []).join(', '), bankName: initial.bank?.name || '',
            bankAccount: initial.bank?.account || '', bankIfsc: initial.bank?.ifsc || '', years: initial.years ?? '', cheque: initial.cheque || null,
          }
        : EMPTY_INST
    );
  }
  if (!open && loadedFor) setLoadedFor(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const valid = f.name.trim() && f.city.trim() && f.pan.trim() && f.contactPerson.trim() && f.mobile.trim() && f.bankAccount.trim() && f.bankIfsc.trim() && f.mouAccepted && f.exams.length;

  const save = () => {
    if (!valid) return;
    const id = initial?.id || `inst-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}-${uid('x').slice(-4)}`;
    const bankChanged = initial && (initial.bank?.account !== f.bankAccount || initial.bank?.ifsc !== f.bankIfsc);
    dispatch('upsertInstitute', {
      institute: {
        ...(initial || { rating: '—', approvalStatus: 'pending', bankVerified: false, submittedAt: new Date().toISOString() }),
        id, name: f.name.trim(), legalType: f.legalType, gst: f.gst.trim(), pan: f.pan.trim().toUpperCase(), address: f.address.trim(), city: f.city.trim(),
        branches: f.branchesText.split(',').map((b) => b.trim()).filter(Boolean), contactPerson: f.contactPerson.trim(), email: f.email.trim(), mobile: f.mobile.trim(),
        bank: { name: f.bankName.trim(), account: f.bankAccount.trim(), ifsc: f.bankIfsc.trim().toUpperCase() }, cheque: f.cheque,
        years: f.years === '' ? null : Number(f.years), pastResults: f.pastResults.trim(), mouAccepted: f.mouAccepted, exams: f.exams, mode: f.mode,
        ...(bankChanged ? { bankVerified: false } : {}),
      },
    });
    onSaved(initial ? 'Institute updated' : 'Institute added. Approve it to make it visible to students.');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? 'Edit institute' : 'Add institute'}>
      <div className="space-y-4">
        <FloatingInput label="Institute name" value={f.name} onChange={set('name')} />
        <div className="grid grid-cols-2 gap-3">
          <FloatingSelect label="Legal entity type" value={f.legalType} onChange={set('legalType')} options={LEGAL_TYPES} />
          <FloatingInput label="Years in operation" type="number" value={f.years} onChange={set('years')} />
          <FloatingInput label="Registration / GST no." value={f.gst} onChange={set('gst')} />
          <FloatingInput label="PAN" value={f.pan} onChange={set('pan')} />
        </div>
        <FloatingInput label="Address" value={f.address} onChange={set('address')} />
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="City" value={f.city} onChange={set('city')} />
          <FloatingSelect label="Mode" value={f.mode} onChange={set('mode')} options={['Offline · Classroom', 'Hybrid', 'Online']} />
        </div>
        <FloatingInput label="Branches (comma separated)" value={f.branchesText} onChange={set('branchesText')} />
        <div className="space-y-2">
          <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Exams offered</div>
          <div className="flex gap-2">
            {EXAMS.map((ex) => {
              const on = f.exams.includes(ex);
              return (
                <button key={ex} type="button" aria-pressed={on} onClick={() => setF((x) => ({ ...x, exams: on ? x.exams.filter((e) => e !== ex) : [...x.exams, ex] }))}
                  className={`h-11 px-5 rounded-full text-[13px] font-medium ${on ? 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]' : 'bg-[#F4F4F5] dark:bg-[#222224]'}`}>
                  {ex}
                </button>
              );
            })}
          </div>
        </div>
        <SectionLabel className="pt-2">Contact</SectionLabel>
        <FloatingInput label="Contact person" value={f.contactPerson} onChange={set('contactPerson')} />
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Email" type="email" value={f.email} onChange={set('email')} />
          <FloatingInput label="Mobile" value={f.mobile} onChange={set('mobile')} />
        </div>
        <SectionLabel className="pt-2">Bank details (payouts go here)</SectionLabel>
        <FloatingInput label="Bank name" value={f.bankName} onChange={set('bankName')} />
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Account number" value={f.bankAccount} onChange={set('bankAccount')} />
          <FloatingInput label="IFSC" value={f.bankIfsc} onChange={set('bankIfsc')} />
        </div>
        <FileDrop label="Cancelled cheque (PDF, JPG, PNG)" file={f.cheque} onFile={(file) => setF((x) => ({ ...x, cheque: file }))} />
        <FloatingInput label="Past results (optional)" value={f.pastResults} onChange={set('pastResults')} />
        <button type="button" aria-pressed={f.mouAccepted} onClick={() => setF((x) => ({ ...x, mouAccepted: !x.mouAccepted }))} className="flex items-start gap-3 text-left">
          <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${f.mouAccepted ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#D4D4D8] dark:border-[#3F3F46]'}`}>
            {f.mouAccepted && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
          </span>
          <span className="text-[14px]">MoU accepted: fees are invoiced per student and paid by the trust to this account only.</span>
        </button>
        {initial && (initial.bank?.account !== f.bankAccount || initial.bank?.ifsc !== f.bankIfsc) && (
          <p className="text-[12px] font-medium">Changing bank details marks them unverified until checked again.</p>
        )}
        <PrimaryButton disabled={!valid} onClick={save} className="w-full">
          {initial ? 'Save changes' : 'Add institute'}
        </PrimaryButton>
        {!valid && <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Name, city, PAN, contact, mobile, bank account, IFSC, one exam and the MoU are required.</p>}
      </div>
    </BottomSheet>
  );
}

// --- Institutes tab ---------------------------------------------------------------
export function InstitutesTab() {
  const { state, dispatch } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const inst = openId && sel.getInstitute(state, openId);

  if (inst) {
    const courses = state.catalogue.courses.filter((c) => c.instituteId === inst.id);
    const students = state.students.filter((s) => s.instituteId === inst.id).length;
    return (
      <div className="space-y-6">
        <PageHeader
          onBack={() => setOpenId(null)}
          backLabel="All institutes"
          title={inst.name}
          sub={`${inst.city} · ${inst.legalType || ''} · ${students} students`}
          actions={
            <>
              <ApprovalChip status={inst.approvalStatus} />
              <StatusChip status={inst.bankVerified ? 'verified' : 'pending'} label={inst.bankVerified ? 'Bank verified' : 'Bank not verified'} />
            </>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="space-y-1">
            <SectionLabel className="mb-2">Registration</SectionLabel>
            <KV label="GST / registration" value={inst.gst} />
            <KV label="PAN" value={inst.pan} />
            <KV label="Address" value={inst.address} />
            <KV label="Branches" value={(inst.branches || []).join(', ')} />
            <KV label="Years in operation" value={inst.years} />
            <KV label="Exams" value={(inst.exams || []).join(', ')} />
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
            <KV label="Cancelled cheque" value={inst.cheque ? inst.cheque.name : inst.approvalStatus === 'approved' ? 'On file' : 'Not uploaded'} />
          </Card>
        </div>
        <Card className="space-y-2">
          <SectionLabel className="mb-1">Courses</SectionLabel>
          {courses.length === 0 && <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">No courses yet. Add them in the Courses tab.</p>}
          {courses.map((c) => (
            <KV key={c.id} label={c.name} value={`${formatINR(c.fee)} · ${c.duration}`} />
          ))}
        </Card>
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={() => setApproveOpen(true)} disabled={inst.approvalStatus === 'approved' && inst.bankVerified}>
            {inst.approvalStatus === 'approved' ? 'Mark bank verified' : 'Approve institute'}
          </PrimaryButton>
          {inst.approvalStatus !== 'rejected' && <SecondaryButton onClick={() => setRejectOpen(true)}>Reject</SecondaryButton>}
          <SecondaryButton onClick={() => { setEditing(inst); setFormOpen(true); }}>
            <Pencil className="w-4 h-4" strokeWidth={1.75} /> Edit
          </SecondaryButton>
        </div>
        <ConfirmSheet
          open={approveOpen}
          title={`Approve ${inst.name}?`}
          body="Approving confirms the documents and that the bank account matches the cancelled cheque. Students can then choose its courses and payouts can go to this account."
          confirmLabel="Approve and verify bank"
          onClose={() => setApproveOpen(false)}
          onConfirm={() => {
            setApproveOpen(false);
            dispatch('decideInstitute', { instituteId: inst.id, decision: 'approved', bankVerified: true });
            toast('Institute approved');
          }}
        />
        <ConfirmSheet
          open={rejectOpen}
          title={`Reject ${inst.name}?`}
          body="Students will not see it and no payout can go to it."
          confirmLabel="Reject institute"
          destructive
          reasonRequired
          onClose={() => setRejectOpen(false)}
          onConfirm={(reason) => {
            setRejectOpen(false);
            dispatch('decideInstitute', { instituteId: inst.id, decision: 'rejected', reason });
            toast('Institute rejected');
          }}
        />
        <InstituteForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSaved={toast} />
        {toastEl}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        rows={state.catalogue.institutes}
        searchText={(r) => `${r.name} ${r.city}`}
        searchPlaceholder="Search institutes"
        filter={{ options: [{ value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Pending' }, { value: 'rejected', label: 'Rejected' }], getValue: (r) => r.approvalStatus }}
        onRowClick={(r) => setOpenId(r.id)}
        toolbar={
          <PrimaryButton onClick={() => { setEditing(null); setFormOpen(true); }} className="h-11 px-5 text-[13px]">
            <Plus className="w-4 h-4" strokeWidth={1.75} /> Add institute
          </PrimaryButton>
        }
        columns={[
          { key: 'name', label: 'Institute', width: 'minmax(0,1.6fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.name}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.city}</div></div> },
          { key: 'approvalStatus', label: 'Approval', render: (r) => <ApprovalChip status={r.approvalStatus} /> },
          { key: 'bankVerified', label: 'Bank', render: (r) => (r.bankVerified ? 'Verified' : 'Not verified') },
          { key: 'gst', label: 'GST', render: (r) => <span className="text-[13px]">{r.gst || '—'}</span> },
          { key: 'contactPerson', label: 'Contact', render: (r) => r.contactPerson || '—' },
        ]}
      />
      <InstituteForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSaved={toast} />
      {toastEl}
    </div>
  );
}

// --- Course form -------------------------------------------------------------------
function CourseForm({ open, onClose, initial, onSaved }) {
  const { state, dispatch } = useStore();
  const approved = state.catalogue.institutes.filter((i) => i.approvalStatus !== 'rejected');
  const blank = { name: '', exam: 'JEE', instituteId: approved[0]?.id || '', durationMonths: 12, mode: 'Classroom', medium: 'Hindi + English', fee: '', discount: 0, instalmentCount: 2, batches: [{ id: 'b1', start: '2027-01-05', end: '2027-12-31', branch: '', seats: 60 }] };
  const [f, setF] = useState(blank);
  const [loadedFor, setLoadedFor] = useState(null);
  if (open && loadedFor !== (initial?.id || 'new')) {
    setLoadedFor(initial?.id || 'new');
    setF(initial ? { ...blank, ...initial, instalmentCount: initial.instalments?.length || 1, batches: initial.batches?.length ? initial.batches : blank.batches } : blank);
  }
  if (!open && loadedFor) setLoadedFor(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const setBatch = (i, k, v) => setF((x) => ({ ...x, batches: x.batches.map((b, j) => (j === i ? { ...b, [k]: v } : b)) }));
  const chosenBy = initial ? state.students.filter((s) => s.courseId === initial.id).length : 0;
  const fee = Number(f.fee) || 0;
  const months = Number(f.durationMonths) || 1;
  const firstStart = f.batches[0]?.start || '2027-01-05';
  const instalments = fee ? buildInstalments(fee, months, firstStart, f.instalmentCount) : [];
  const valid = f.name.trim() && f.instituteId && fee > 0 && months > 0 && f.batches.every((b) => b.start && b.end && Number(b.seats) > 0);

  const save = () => {
    if (!valid) return;
    const id = initial?.id || `crs-${uid('c').slice(-6)}`;
    dispatch('upsertCourse', {
      course: {
        id, instituteId: f.instituteId, exam: f.exam, name: f.name.trim(), fee, durationMonths: months, duration: `${months} months`, mode: f.mode, medium: f.medium,
        start: firstStart, startDate: startLabel(firstStart), discount: Number(f.discount) || 0,
        batches: f.batches.map((b, i) => ({ ...b, id: b.id && !String(b.id).match(/^b\d+$/) ? b.id : `${id}-b${i + 1}`, seats: Number(b.seats) || 0 })),
        instalments,
      },
    });
    onSaved(initial ? 'Course updated. New fees apply only to new selections.' : 'Course added');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? 'Edit course' : 'New course'}>
      <div className="space-y-4">
        {chosenBy > 0 && (
          <div className="flex items-start gap-2.5 p-4 rounded-[20px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 text-[13px]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
            <span>{chosenBy} student{chosenBy > 1 ? 's have' : ' has'} already chosen this course. Their package totals stay as they are; fee changes apply only to new selections.</span>
          </div>
        )}
        <FloatingInput label="Course name" value={f.name} onChange={set('name')} />
        <div className="grid grid-cols-2 gap-3">
          <FloatingSelect label="Exam" value={f.exam} onChange={set('exam')} options={EXAMS} />
          <label className="relative block">
            <select value={f.instituteId} onChange={set('instituteId')} aria-label="Institute" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25">
              {approved.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Institute</span>
          </label>
          <FloatingInput label="Duration (months)" type="number" value={f.durationMonths} onChange={set('durationMonths')} />
          <FloatingSelect label="Mode" value={f.mode} onChange={set('mode')} options={MODES} />
          <FloatingSelect label="Medium" value={f.medium} onChange={set('medium')} options={MEDIUMS} />
          <FloatingInput label="Instalments" type="number" value={f.instalmentCount} onChange={set('instalmentCount')} />
        </div>
        <Amount label="Total fee (₹)" value={f.fee} onChange={(v) => setF((x) => ({ ...x, fee: v }))} />
        <Amount label="Platform discount (₹)" value={f.discount} onChange={(v) => setF((x) => ({ ...x, discount: v }))} helper="Kept at ₹0 until the client defines discounts." />
        {instalments.length > 0 && (
          <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] space-y-1">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] mb-1">Instalment schedule</div>
            {instalments.map((i) => <KV key={i.no} label={`#${i.no} · ${formatDate(i.dueDate)}`} value={formatINR(i.amount)} />)}
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <SectionLabel>Batches</SectionLabel>
          <SmallButton onClick={() => setF((x) => ({ ...x, batches: [...x.batches, { id: `b${x.batches.length + 1}`, start: x.batches[0]?.start || '', end: x.batches[0]?.end || '', branch: '', seats: 60 }] }))}>
            <Plus className="w-3.5 h-3.5" strokeWidth={1.75} /> Add batch
          </SmallButton>
        </div>
        {f.batches.map((b, i) => (
          <div key={i} className="p-4 rounded-[20px] border border-[#ECECEE] dark:border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold">Batch {i + 1}</span>
              {f.batches.length > 1 && (
                <button type="button" aria-label={`Remove batch ${i + 1}`} onClick={() => setF((x) => ({ ...x, batches: x.batches.filter((_, j) => j !== i) }))} className="hit-44 w-9 h-9 rounded-full bg-[#F4F4F5] dark:bg-[#222224] flex items-center justify-center">
                  <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FloatingInput label="Start" type="date" value={b.start} onChange={(e) => setBatch(i, 'start', e.target.value)} />
              <FloatingInput label="End" type="date" value={b.end} onChange={(e) => setBatch(i, 'end', e.target.value)} />
              <FloatingInput label="Branch" value={b.branch} onChange={(e) => setBatch(i, 'branch', e.target.value)} />
              <FloatingInput label="Seats" type="number" value={b.seats} onChange={(e) => setBatch(i, 'seats', e.target.value)} />
            </div>
          </div>
        ))}
        <PrimaryButton disabled={!valid} onClick={save} className="w-full">{initial ? 'Save course' : 'Add course'}</PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function CoursesTab() {
  const { state } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toastEl, toast] = useToast();
  return (
    <div className="space-y-4">
      <DataTable
        rows={state.catalogue.courses}
        searchText={(r) => `${r.name} ${sel.getInstitute(state, r.instituteId)?.name}`}
        searchPlaceholder="Search courses"
        filter={{ options: EXAMS, getValue: (r) => r.exam }}
        onRowClick={(r) => { setEditing(r); setFormOpen(true); }}
        toolbar={
          <PrimaryButton onClick={() => { setEditing(null); setFormOpen(true); }} className="h-11 px-5 text-[13px]">
            <Plus className="w-4 h-4" strokeWidth={1.75} /> New course
          </PrimaryButton>
        }
        columns={[
          { key: 'name', label: 'Course', width: 'minmax(0,1.8fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.name}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] truncate">{sel.getInstitute(state, r.instituteId)?.name}</div></div> },
          { key: 'exam', label: 'Exam', width: 'minmax(0,0.6fr)' },
          { key: 'fee', label: 'Fee', align: 'right', render: (r) => formatINR(r.fee) },
          { key: 'duration', label: 'Duration', sortValue: (r) => r.durationMonths },
          { key: 'batches', label: 'Batches', width: 'minmax(0,0.7fr)', sortValue: (r) => r.batches.length, render: (r) => `${r.batches.length} · ${r.batches.reduce((s, b) => s + (Number(b.seats) || 0), 0)} seats` },
          { key: 'students', label: 'Students', width: 'minmax(0,0.6fr)', align: 'right', sortValue: (r) => state.students.filter((s) => s.courseId === r.id).length, render: (r) => state.students.filter((s) => s.courseId === r.id).length },
        ]}
      />
      <CourseForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSaved={toast} />
      {toastEl}
    </div>
  );
}

function ExamsTab() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState(null);
  const [text, setText] = useState('');
  const [toastEl, toast] = useToast();
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
        Each exam has a progress template. Students fill these subject scores every month, alongside attendance, tests taken and average score.
      </p>
      {state.catalogue.exams.map((ex) => (
        <div key={ex.id} className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <span className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0"><BookOpen className="w-4 h-4" strokeWidth={1.75} /></span>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold">{ex.id} · {ex.name}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {ex.subjects.join(', ')} · {state.catalogue.courses.filter((c) => c.exam === ex.id).length} courses
              </div>
            </div>
          </div>
          <SmallButton onClick={() => { setEditing(ex); setText(ex.subjects.join(', ')); }}>
            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} /> Edit template
          </SmallButton>
        </div>
      ))}
      <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={`${editing?.id} progress template`}>
        <div className="space-y-4">
          <FloatingInput label="Subjects (comma separated)" value={text} onChange={(e) => setText(e.target.value)} />
          <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Fixed fields (month, attendance, tests taken, average score, rank, mentor remark, status) are always included.</p>
          <PrimaryButton
            disabled={!text.trim()}
            onClick={() => {
              dispatch('upsertExam', { exam: { ...editing, subjects: text.split(',').map((x) => x.trim()).filter(Boolean) } });
              setEditing(null);
              toast('Template saved');
            }}
            className="w-full"
          >
            Save template
          </PrimaryButton>
        </div>
      </BottomSheet>
      {toastEl}
    </div>
  );
}

export function InstituteRequestsInbox() {
  const { state, dispatch } = useStore();
  const [decline, setDecline] = useState(null);
  const [toastEl, toast] = useToast();
  const [confirmEl, confirm] = useConfirm();
  const open = state.instituteRequests.filter((r) => r.state === 'open');
  const done = state.instituteRequests.filter((r) => r.state !== 'open');
  return (
    <div className="space-y-3">
      {open.length === 0 && <EmptyState icon={Inbox} title="No institute requests" body="When a student asks for an institute that is not in the catalogue, it appears here." />}
      {open.map((r) => {
        const st = sel.getStudent(state, r.studentId);
        return (
          <div key={r.id} className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[15px] font-semibold">{r.name}{r.city ? `, ${r.city}` : ''}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {[r.course, r.exam, r.fee ? formatINR(r.fee) : null, r.file?.name].filter(Boolean).join(' · ')} · from {st?.fullName} ({st?.district}) · {formatDate(r.at)}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <SmallButton primary onClick={() => confirm({ title: `Onboard ${r.name}?`, body: 'The student is told the trust is adding it. Add and approve it in Institutes before students can choose it.', confirmLabel: 'Onboard', onConfirm: () => { dispatch('resolveInstituteRequest', { requestId: r.id, decision: 'added' }); toast('Marked for onboarding. Add it with "Add institute".'); } })}>Onboard</SmallButton>
              <SmallButton onClick={() => setDecline(r)}>Decline</SmallButton>
            </div>
          </div>
        );
      })}
      {done.length > 0 && (
        <div className="pt-2 space-y-1">
          <SectionLabel>Resolved</SectionLabel>
          {done.map((r) => <KV key={r.id} label={`${r.name} · ${sel.getStudent(state, r.studentId)?.fullName}`} value={r.state === 'added' ? 'Onboarding' : 'Declined'} />)}
        </div>
      )}
      <ConfirmSheet
        open={!!decline}
        title={`Decline ${decline?.name}?`}
        body="The student is told to choose an approved institute."
        confirmLabel="Decline request"
        destructive
        reasonRequired
        onClose={() => setDecline(null)}
        onConfirm={(note) => {
          dispatch('resolveInstituteRequest', { requestId: decline.id, decision: 'declined', note });
          setDecline(null);
          toast('Request declined');
        }}
      />
      {toastEl}
      {confirmEl}
    </div>
  );
}

export function AdminCatalogue() {
  const [tab, setTab] = useState('institutes');
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Catalogue" sub="Admin builds the catalogue. Students only pick from it." />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'exams', label: 'Exams' },
          { value: 'institutes', label: 'Institutes' },
          { value: 'courses', label: 'Courses' },
        ]}
      />
      {tab === 'exams' && <ExamsTab />}
      {tab === 'institutes' && <InstitutesTab />}
      {tab === 'courses' && <CoursesTab />}
    </div>
  );
}

export function AdminInstitutes() {
  const { state } = useStore();
  const [tab, setTab] = useState('institutes');
  const openReq = state.instituteRequests.filter((r) => r.state === 'open').length;
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Institutes" sub="Approve partners, verify bank details, and handle student requests." />
      <Segmented value={tab} onChange={setTab} options={[{ value: 'institutes', label: 'Institutes' }, { value: 'requests', label: 'Institute requests', count: openReq }]} />
      {tab === 'institutes' ? <InstitutesTab /> : <InstituteRequestsInbox />}
    </div>
  );
}
