import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  X,
  Eye,
  UserPlus,
  ShieldCheck,
  AlertCircle,
  FileText,
  Scale,
  Landmark,
  Inbox,
} from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate, timeAgo, firstNameInitial } from '../../data/mockData';
import { ageFromDob } from '../../data/rules';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  StatusTracker,
  ProgressBar,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  Segmented,
  Timeline,
  DocViewer,
  Amount,
  FloatingTextarea,
  EmptyState,
  SectionLabel,
} from '../../components/ui';
import {
  Card,
  KV,
  PageHeader,
  SmallButton,
  StudentStatusChip,
  MiniSelect,
  STAGES,
  useToast,
  useConfirm,
  RAISED_INPUTS,
} from './AdminShared';

const REQUIRED_DOCS = ['class10', 'aadhaar', 'income', 'school_id', 'photo'];
const CHECKLIST = [
  ['docsMatch', 'Documents match the form'],
  ['incomeOk', 'Income within the ceiling'],
  ['marksOk', 'Class 10 marks at least the minimum'],
  ['guardianCalled', 'Guardian called'],
  ['studentCalled', 'Student called'],
  ['noDuplicate', 'No duplicate application'],
];
const REC_LABEL = { approve: 'Recommend approve', reject: 'Recommend reject', request_info: 'Request more info', escalate: 'Escalate to admin' };

// --- Approval gate ------------------------------------------------------------
export function listingGate(state, studentId) {
  const st = sel.getStudent(state, studentId);
  const g = sel.getGuardian(state, studentId);
  const adult = (st.age ?? ageFromDob(st.dob) ?? 0) >= 18;
  const consent = sel.effectiveConsentState(g) === 'approved';
  const docs = sel.studentDocuments(state, studentId);
  const missing = REQUIRED_DOCS.filter((t) => docs.find((d) => d.id === t)?.status !== 'verified');
  const rv = sel.verificationProgress(state, studentId)?.review;
  const pkg = sel.getPackage(state, studentId);
  const checks = [
    { key: 'consent', label: 'Guardian consent approved', ok: consent || adult, why: adult ? '' : 'Waiting for guardian consent.' },
    { key: 'docs', label: 'Documents verified (DigiLocker or manual)', ok: missing.length === 0, why: missing.length ? `Not verified yet: ${missing.map((m) => docs.find((d) => d.id === m)?.name || m).join(', ')}.` : '' },
    { key: 'verifier', label: 'Verifier recommendation received', ok: !!rv?.recommendation, why: rv?.recommendation ? '' : 'No recommendation yet. You can override with a written reason.' },
    { key: 'package', label: 'Package locked by the student', ok: !!pkg?.locked, why: pkg?.locked ? '' : 'The student has not locked the package.' },
  ];
  return { checks, review: rv, recommendation: rv?.recommendation || null, adult };
}

// --- Extras review (4D) --------------------------------------------------------
export function ExtraReviewCard({ studentId, extra, showStudent = true, onDone }) {
  const { state, dispatch } = useStore();
  const st = sel.getStudent(state, studentId);
  const cap = state.settings.extraCategoryCaps[extra.category];
  const [lowerOpen, setLowerOpen] = useState(false);
  const [lower, setLower] = useState(Math.min(extra.amount, cap ?? extra.amount));
  const [removeOpen, setRemoveOpen] = useState(false);
  const [confirmEl, confirm] = useConfirm();
  const pool = sel.poolBalance(state, 'general');
  const remaining = sel.studentRemainingNeed(state, studentId);
  const within = cap == null || extra.amount <= cap;
  const poolCovers = pool >= extra.amount;
  const affordable = within && poolCovers;

  const decide = (decision, extraPayload = {}) => {
    dispatch('reviewExtra', { studentId, extraId: extra.id, decision, ...extraPayload });
    onDone && onDone(decision);
  };

  return (
    <div className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] grid grid-cols-1 lg:grid-cols-5 gap-5">
      <div className="lg:col-span-3 space-y-2 min-w-0">
        {showStudent && (
          <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            {st.fullName} · {st.district}, {st.state} · {st.id}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[16px] font-semibold">{extra.category}</span>
          <span className="text-[16px] font-semibold">· {formatINR(extra.amount)}</span>
          <StatusChip status="needs_review" label="Needs review" />
        </div>
        <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">{extra.reason}</p>
        <div className="flex flex-wrap gap-2 pt-2">
          <SmallButton primary disabled={!within} onClick={() => confirm({ title: `Accept ${extra.category} ${formatINR(extra.amount)}?`, body: `It is added to ${st.fullName.split(' ')[0]}'s package and the goal goes up by ${formatINR(extra.amount)}.`, confirmLabel: 'Accept extra', onConfirm: () => decide('accept') })}>
            <Check className="w-3.5 h-3.5" strokeWidth={2} /> Accept
          </SmallButton>
          <SmallButton onClick={() => setLowerOpen(true)}>Accept lower amount</SmallButton>
          <SmallButton onClick={() => setRemoveOpen(true)}>
            <X className="w-3.5 h-3.5" strokeWidth={2} /> Remove
          </SmallButton>
        </div>
        {!within && <p className="text-[12px] font-medium">Above the {extra.category} cap. Accept a lower amount or remove it.</p>}
      </div>

      <div className="lg:col-span-2 p-4 rounded-[20px] bg-white dark:bg-[#222224] space-y-1.5">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] mb-1">Check the funds</div>
        <KV label={`Cap for ${extra.category}`} value={cap != null ? formatINR(cap) : 'No cap'} />
        <KV label="Requested" value={`${formatINR(extra.amount)} · ${within ? 'within cap' : 'over cap'}`} />
        <KV label="General pool balance" value={formatINR(pool)} />
        <KV label="Student's remaining need" value={formatINR(remaining)} />
        <KV label="Remaining need if accepted" value={formatINR(remaining + extra.amount)} />
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#ECECEE] dark:border-[#262626]">
          <span className="text-[13px] font-semibold">Can sponsors reasonably fund this?</span>
          <StatusChip status={affordable ? 'verified' : 'needs_review'} label={affordable ? 'Yes' : 'No'} />
        </div>
        <p className="text-[11px] text-[#52525B] dark:text-[#A1A1AA] pt-1">
          Within cap, and the general pool could cover it if sponsors fall short. Not a bank check.
        </p>
      </div>

      <BottomSheet open={lowerOpen} onClose={() => setLowerOpen(false)} title="Accept a lower amount">
        <div className="space-y-4">
          <Amount label={`New amount for ${extra.category}`} value={lower} onChange={setLower} max={cap ?? extra.amount} />
          <PrimaryButton
            disabled={!lower || lower <= 0 || lower > (cap ?? extra.amount)}
            onClick={() => {
              setLowerOpen(false);
              decide('accept_lower', { amount: lower, note: `Accepted at ${formatINR(lower)} (requested ${formatINR(extra.amount)}).` });
            }}
            className="w-full"
          >
            Accept {lower ? formatINR(lower) : ''}
          </PrimaryButton>
        </div>
      </BottomSheet>
      <ConfirmSheet
        open={removeOpen}
        title={`Remove ${extra.category}?`}
        body="The student sees your note on their package."
        confirmLabel="Remove extra"
        destructive
        reasonRequired
        reasonLabel="Note to the student"
        onClose={() => setRemoveOpen(false)}
        onConfirm={(note) => {
          setRemoveOpen(false);
          decide('remove', { note });
        }}
      />
      {confirmEl}
    </div>
  );
}

export function ExtrasQueue() {
  const { state } = useStore();
  const [toastEl, toast] = useToast();
  const items = state.packages.flatMap((p) =>
    p.extras.filter((e) => e.state === 'needs_review' && !e.excluded).map((e) => ({ studentId: p.studentId, extra: e }))
  );
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <EmptyState icon={Scale} title="No extras to review" body="When students add stationery, travel, books or test series, they appear here." />
      ) : (
        items.map((it) => (
          <ExtraReviewCard key={`${it.studentId}-${it.extra.id}`} studentId={it.studentId} extra={it.extra} onDone={(d) => toast(d === 'remove' ? 'Extra removed. Student notified.' : 'Extra accepted. Package updated.')} />
        ))
      )}
      {toastEl}
    </div>
  );
}

// --- Assign verifier ----------------------------------------------------------
function AssignSheet({ open, onClose, student, onAssigned }) {
  const { state, dispatch } = useStore();
  const now = Date.now();
  const rows = state.verifiers.map((v) => {
    const open = state.reviews.filter((r) => r.verifierId === v.id && !r.decidedAt);
    return {
      ...v,
      open: open.length,
      overdue: open.filter((r) => r.slaDueAt && new Date(r.slaDueAt).getTime() < now).length,
      covers: v.districts.includes(student.district),
    };
  });
  rows.sort((a, b) => (b.covers - a.covers) || (a.open - b.open));
  const assign = (verifierId, name) => {
    dispatch('assignVerifier', { studentId: student.id, verifierId });
    onClose();
    onAssigned(name);
  };
  return (
    <BottomSheet open={open} onClose={onClose} title="Assign a verifier">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224]">
          <div>
            <div className="text-[14px] font-semibold">Auto-assign by district</div>
            <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Phase 2. Manual assignment at launch.</div>
          </div>
          <span aria-disabled="true" className="relative inline-flex h-7 w-12 rounded-full bg-[#ECECEE] dark:bg-[#1C1C1C] opacity-60">
            <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-[#52525B]" />
          </span>
        </div>
        <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
          {student.fullName} · {student.district}, {student.state} · SLA {state.settings.verifierSlaDays} days
        </div>
        <div className="space-y-2">
          {rows.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => assign(v.id, v.name)}
              className="w-full text-left px-5 py-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] hover:bg-[#ECECEE] dark:hover:bg-[#2E2E32] active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-semibold">{v.name}</span>
                {v.covers && <StatusChip status="verified" label={`Covers ${student.district}`} />}
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                {v.districts.join(', ')} · {v.open} open{v.overdue ? ` · ${v.overdue} overdue` : ''}
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => assign(state.users.find((u) => u.role === 'admin')?.id, 'you (admin)')}
            className="w-full text-left px-5 py-4 rounded-[20px] border border-[#ECECEE] dark:border-[#262626] hover:bg-[#F4F4F5] dark:hover:bg-[#1D1D1F]"
          >
            <div className="text-[15px] font-semibold">Verify it myself</div>
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Admin can act as verifier when none is available.</div>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

// --- Admin acting as verifier ---------------------------------------------------
function AdminVerifyForm({ review, onDone }) {
  const { state, dispatch } = useStore();
  const [checklist, setChecklist] = useState(review.checklist || {});
  const [notes, setNotes] = useState(review.notes || '');
  const [rec, setRec] = useState(null);
  const [reason, setReason] = useState('');
  const needsReason = rec && rec !== 'approve';
  return (
    <Card className={`space-y-5 ${RAISED_INPUTS}`}>
      <div className="text-[15px] font-semibold">Your verification (acting as verifier)</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CHECKLIST.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={!!checklist[k]}
            onClick={() => setChecklist((c) => ({ ...c, [k]: !c[k] }))}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-left text-[14px] font-medium transition-all ${
              checklist[k] ? 'bg-white dark:bg-[#222224] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA]' : 'bg-white/60 dark:bg-[#222224]/60'
            }`}
          >
            <span className={`w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 ${checklist[k] ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#D4D4D8] dark:border-[#3F3F46]'}`}>
              {checklist[k] && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
            </span>
            {label}
            {k === 'incomeOk' && <span className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">({formatINR(state.settings.incomeCeiling)})</span>}
            {k === 'marksOk' && <span className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">({state.settings.minClass10Marks}%)</span>}
          </button>
        ))}
      </div>
      <FloatingTextarea label="Notes (admin only)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxWords={150} />
      <Segmented
        value={rec || ''}
        onChange={setRec}
        options={[
          { value: 'approve', label: 'Approve' },
          { value: 'reject', label: 'Reject' },
          { value: 'request_info', label: 'Request info' },
        ]}
      />
      {needsReason && (
        <FloatingTextarea label={rec === 'request_info' ? 'Message to the student' : 'Reason'} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxWords={80} />
      )}
      <PrimaryButton
        disabled={!rec || (needsReason && reason.trim().length < 3)}
        onClick={() => {
          dispatch('verifierDecision', { reviewId: review.id, recommendation: rec, reason: reason.trim(), checklist, notes });
          onDone(rec);
        }}
        className="h-12 px-6 text-[14px]"
      >
        Save recommendation
      </PrimaryButton>
    </Card>
  );
}

// --- Detail page -------------------------------------------------------------------
function StudentDetail({ studentId, onBack, initialTab = 'verification' }) {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState(initialTab);
  const [assignOpen, setAssignOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUp, setTopUp] = useState('');
  const [topUpReason, setTopUpReason] = useState('');
  const [viewDoc, setViewDoc] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [toastEl, toast] = useToast();
  const [confirmEl, confirm] = useConfirm();

  const st = sel.getStudent(state, studentId);
  if (!st) return <EmptyState title="Student not found" action={<SecondaryButton onClick={onBack}>Back</SecondaryButton>} />;
  const g = sel.getGuardian(state, studentId);
  const docs = sel.studentDocuments(state, studentId);
  const pkg = sel.getPackage(state, studentId);
  const totals = sel.studentPackageTotals(state, studentId);
  const course = sel.getCourse(state, st.courseId);
  const inst = course && sel.getInstitute(state, course.instituteId);
  const ver = sel.verificationProgress(state, studentId);
  const review = ver?.review;
  const gate = listingGate(state, studentId);
  const nonOverride = gate.checks.filter((c) => c.key !== 'verifier');
  const canDecide = ['Under verification', 'Info requested'].includes(st.status) || (st.status === 'Rejected' && st.rejectedByVerifier);
  const needsOverride = !gate.checks.find((c) => c.key === 'verifier').ok || (gate.recommendation && gate.recommendation !== 'approve');
  const approveEnabled = canDecide && nonOverride.every((c) => c.ok);
  const firstFail = gate.checks.find((c) => !c.ok && !(c.key === 'verifier'));
  const verifier = review?.verifierId ? sel.getUser(state, review.verifierId) : null;
  const actingAsVerifier = verifier && verifier.role === 'admin' && !review.recommendation;
  const contributions = sel.studentContributions(state, studentId);
  const allocations = state.allocations.filter((a) => a.targetType === 'student' && a.targetId === studentId && a.amount > 0);
  const pool = sel.poolBalance(state, 'general');
  const remaining = sel.studentRemainingNeed(state, studentId);
  const audits = state.auditLog.filter(
    (a) =>
      a.entityId === studentId ||
      a.entityId === pkg?.id ||
      a.entityId === `pkg:${studentId}` ||
      String(a.entityId).startsWith(`${studentId}:`) ||
      state.reviews.some((r) => r.studentId === studentId && r.id === a.entityId) ||
      a.entityId === g?.id ||
      state.disbursements.some((d) => d.studentId === studentId && d.id === a.entityId)
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        onBack={onBack}
        backLabel="All applications"
        title={st.fullName}
        sub={`${st.id} · ${st.district}, ${st.state} · ${st.exam || 'No exam yet'} · Class ${st.studentClass}`}
        actions={<StudentStatusChip status={st.status} />}
      />
      <StatusTracker currentStepIndex={sel.studentStatusIndex(state, studentId)} />

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'profile', label: 'Profile' },
          { value: 'documents', label: 'Documents' },
          { value: 'verification', label: 'Verification' },
          { value: 'package', label: 'Package' },
          { value: 'funding', label: 'Funding' },
          { value: 'audit', label: 'Audit' },
        ]}
      />

      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="space-y-1">
            <SectionLabel className="mb-2">Student</SectionLabel>
            <KV label="Date of birth" value={st.dob ? `${formatDate(st.dob)} (${st.age ?? ageFromDob(st.dob)} yrs)` : null} />
            <KV label="Gender" value={st.gender} />
            <KV label="Mobile" value={st.mobile} />
            <KV label="Email" value={st.email} />
            <KV label="School" value={st.school} />
            <KV label="Board · Class" value={`${st.board} · ${st.studentClass}`} />
            <KV label="Class 10 marks" value={st.class10Marks ? `${st.class10Marks}%` : null} />
            <KV label="Income band" value={st.incomeBand} />
          </Card>
          <Card className="space-y-1">
            <SectionLabel className="mb-2">Guardian</SectionLabel>
            <KV label="Name" value={g?.name} />
            <KV label="Relation" value={g?.relation} />
            <KV label="Mobile" value={g?.mobile} />
            <KV label="Consent" value={sel.effectiveConsentState(g).replace('_', ' ')} />
            <KV label="Photo shared with sponsors" value={g?.photoConsent ? 'Yes' : 'No'} />
          </Card>
          <Card className="lg:col-span-2 space-y-3">
            <SectionLabel>Statement of purpose</SectionLabel>
            <p className="text-[14px] leading-relaxed">{st.sop || 'Not written yet.'}</p>
          </Card>
          {!['Dropped', 'Rejected', 'Completed'].includes(st.status) && (
            <div className="lg:col-span-2">
              <SecondaryButton onClick={() => setDropOpen(true)} className="h-11 px-5 text-[14px]">Mark as dropped out</SecondaryButton>
            </div>
          )}
        </div>
      )}

      {tab === 'documents' && (
        <div className="space-y-3">
          {docs.map((d) => (
            <div key={d.id} className="p-4 md:px-6 md:py-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold">{d.name}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                    {d.source === 'digilocker' ? 'DigiLocker' : 'Manual upload'} · {d.status === 'rejected' && d.rejectReason ? d.rejectReason : d.detail}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                <StatusChip status={d.status} />
                {d.status !== 'not_uploaded' && (
                  <SmallButton ariaLabel={`View ${d.name}`} onClick={() => setViewDoc(d)}>
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View
                  </SmallButton>
                )}
                {['uploaded', 'pending', 'needs_review'].includes(d.status) && (
                  <>
                    <SmallButton primary onClick={() => confirm({ title: `Accept ${d.name}?`, body: 'Marks it verified. The student is notified.', confirmLabel: 'Accept document', onConfirm: () => { dispatch('reviewDocument', { studentId, docId: d.id, decision: 'verified' }); toast(`${d.name} accepted`); } })}>Accept</SmallButton>
                    <SmallButton onClick={() => setRejectDoc(d)}>Reject</SmallButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'verification' && (
        <div className="space-y-5">
          <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
            <p className="text-[14px] font-medium">Verifier&apos;s recommendation is advice. Your approval lists the student.</p>
          </div>
          {st.status === 'Rejected' && st.rejectedByVerifier && (
            <div className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] text-[14px]">
              The verifier recommended rejection: “{st.rejectReason}”. You can confirm it with Reject, or overturn it with Approve and list.
            </div>
          )}

          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[15px] font-semibold">Verifier</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                  {verifier
                    ? `${verifier.name}${review.assignedAt ? ` · assigned ${formatDate(review.assignedAt)}` : ''}${review.slaDueAt ? ` · due ${formatDate(review.slaDueAt)}` : ''}`
                    : review
                    ? 'Not assigned yet'
                    : 'The student has not submitted yet'}
                </div>
              </div>
              {review && !review.recommendation && canDecide && (
                <SmallButton primary onClick={() => setAssignOpen(true)}>
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={1.75} /> {verifier ? 'Reassign' : 'Assign'}
                </SmallButton>
              )}
            </div>
            {review && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {CHECKLIST.map(([k, label]) => (
                    <div key={k} className="flex items-center gap-2.5 text-[14px]">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${review.checklist?.[k] ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#D4D4D8] dark:border-[#3F3F46]'}`}>
                        {review.checklist?.[k] && <Check className="w-3 h-3" strokeWidth={2.5} />}
                      </span>
                      <span className={review.checklist?.[k] ? '' : 'text-[#52525B] dark:text-[#A1A1AA]'}>{label}</span>
                    </div>
                  ))}
                </div>
                {review.notes && <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] pt-2">Notes: {review.notes}</p>}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[13px] font-medium">Recommendation:</span>
                  {review.recommendation ? (
                    <StatusChip status={review.recommendation === 'approve' ? 'verified' : review.recommendation === 'reject' ? 'rejected' : 'needs_review'} label={REC_LABEL[review.recommendation]} />
                  ) : (
                    <StatusChip status="pending" label="Waiting" />
                  )}
                  {review.reason && <span className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">“{review.reason}”</span>}
                </div>
              </>
            )}
          </Card>

          {actingAsVerifier && <AdminVerifyForm review={review} onDone={() => toast('Recommendation saved')} />}

          <Card className="space-y-4">
            <div className="text-[15px] font-semibold">Final approval</div>
            <div className="space-y-2.5">
              {gate.checks.map((c) => (
                <div key={c.key} className="flex items-start gap-3">
                  <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${c.ok ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40'}`}>
                    {c.ok ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <X className="w-3 h-3" strokeWidth={2} />}
                  </span>
                  <div>
                    <div className="text-[14px] font-medium">{c.label}</div>
                    {!c.ok && c.why && <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{c.why}</div>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <PrimaryButton disabled={!approveEnabled} onClick={() => setApproveOpen(true)}>
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
                Approve and list
              </PrimaryButton>
              <SecondaryButton disabled={!canDecide} onClick={() => setInfoOpen(true)}>Send back for info</SecondaryButton>
              <SecondaryButton disabled={!canDecide} onClick={() => setRejectOpen(true)}>Reject</SecondaryButton>
            </div>
            {!canDecide ? (
              <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Decisions are available while the application is under verification. Current stage: {st.status}.</p>
            ) : !approveEnabled && firstFail ? (
              <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Approve is disabled: {firstFail.why}</p>
            ) : needsOverride ? (
              <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {gate.recommendation ? `The verifier recommended "${REC_LABEL[gate.recommendation]}".` : 'There is no verifier recommendation.'} Approving needs a written override reason.
              </p>
            ) : null}
          </Card>
        </div>
      )}

      {tab === 'package' && (
        <div className="space-y-5">
          <Card className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[15px] font-semibold">Package</div>
              {pkg?.locked ? <StatusChip status="locked" label="Locked" /> : <StatusChip status="pending" label="Not locked" />}
            </div>
            <KV label="Course" value={course ? `${course.name} · ${inst?.name}` : 'Not selected'} />
            <KV label="Course fee" value={course ? formatINR(pkg?.courseFee ?? course.fee) : null} />
            {(pkg?.extras || []).filter((e) => e.state === 'normal' && !e.excluded).map((e) => (
              <KV key={e.id} label={e.category} value={formatINR(e.amount)} />
            ))}
            <KV label="Discount" value={formatINR(pkg?.discount || 0)} />
            <KV label="Family contribution" value={formatINR(pkg?.familyContribution || 0)} />
            <KV label="Verified need (what sponsors see)" value={formatINR(totals.verifiedNeed)} strong />
            <KV label="Monthly need" value={`${formatINR(totals.monthlyNeed)} for ${pkg?.durationMonths || course?.durationMonths || 12} months`} />
          </Card>
          {(pkg?.extras || []).filter((e) => e.state === 'needs_review' && !e.excluded).map((e) => (
            <ExtraReviewCard key={e.id} studentId={studentId} extra={e} showStudent={false} onDone={() => toast('Package updated. Student notified.')} />
          ))}
          {(pkg?.extras || []).filter((e) => e.state === 'rejected').map((e) => (
            <div key={e.id} className="px-5 py-4 rounded-[20px] border border-[#ECECEE] dark:border-[#262626] text-[14px]">
              <span className="font-semibold">{e.category} · {formatINR(e.amount)}</span> <StatusChip status="rejected" label="Removed" />
              {e.adminNote && <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">{e.adminNote}</div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'funding' && (
        <div className="space-y-5">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="text-[36px] font-bold tracking-[-0.03em] leading-none">{formatINR(sel.studentRaised(state, studentId))}</div>
                <div className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mt-2">raised of {formatINR(totals.verifiedNeed)} · {formatINR(remaining)} remaining</div>
              </div>
              <div className="text-[14px] font-semibold">Held for student: {formatINR(sel.studentBalance(state, studentId))}</div>
            </div>
            <ProgressBar percent={sel.studentFundingPercent(state, studentId)} />
            {['Listed', 'Partially funded'].includes(st.status) && remaining > 0 && (
              <SmallButton onClick={() => { setTopUp(Math.min(remaining, pool)); setTopUpOpen(true); }}>
                <Landmark className="w-3.5 h-3.5" strokeWidth={1.75} /> Top up from general pool
              </SmallButton>
            )}
          </Card>
          {allocations.length === 0 ? (
            <EmptyState title="No contributions yet" />
          ) : (
            <div className="space-y-2">
              {allocations.map((a) => {
                const d = state.donations.find((x) => x.id === a.donationId);
                const sp = d && sel.getSponsor(state, d.sponsorId);
                const shown = contributions.find((c) => c.id === a.id);
                return (
                  <div key={a.id} className="px-5 py-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[15px] font-semibold">{sp ? sp.displayName : 'Pool top-up'}</div>
                      <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                        {formatDate(a.createdAt)}{shown && sp && shown.sponsor !== sp.displayName ? ' · shown to student as Anonymous' : ''}{a.note ? ` · ${a.note}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusChip status={a.state === 'confirmed' ? 'verified' : 'pending'} label={a.state === 'confirmed' ? 'Confirmed' : 'Confirming'} />
                      <span className="text-[16px] font-bold">{formatINR(a.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'audit' && (
        <Card>
          {audits.length === 0 ? (
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">No recorded actions yet.</p>
          ) : (
            <Timeline items={audits.map((a) => ({ id: a.id, title: a.action, detail: sel.getUser(state, a.actorId)?.name || 'System', time: `${formatDate(a.at)} · ${timeAgo(a.at)}` }))} />
          )}
        </Card>
      )}

      <AssignSheet open={assignOpen} onClose={() => setAssignOpen(false)} student={st} onAssigned={(n) => toast(`Assigned to ${n}`)} />
      <DocViewer open={!!viewDoc} onClose={() => setViewDoc(null)} doc={viewDoc} />
      <ConfirmSheet
        open={!!rejectDoc}
        title={`Reject ${rejectDoc?.name}?`}
        body="The student and guardian see your reason and can re-upload."
        confirmLabel="Reject document"
        destructive
        reasonRequired
        onClose={() => setRejectDoc(null)}
        onConfirm={(reason) => {
          dispatch('reviewDocument', { studentId, docId: rejectDoc.id, decision: 'rejected', reason });
          setRejectDoc(null);
          toast('Document returned to the student');
        }}
      />
      <ConfirmSheet
        open={approveOpen}
        title={`List ${firstNameInitial(st.fullName)} for sponsors?`}
        body={`Verified need ${formatINR(totals.verifiedNeed)}. Verified sponsors will see the limited profile only.`}
        confirmLabel="Approve and list"
        reasonRequired={needsOverride}
        reasonLabel="Override reason (required)"
        onClose={() => setApproveOpen(false)}
        onConfirm={(reason) => {
          setApproveOpen(false);
          dispatch('adminApproveListing', { studentId, overrideReason: needsOverride ? reason : null });
          toast('Listed. Student and guardian notified.');
        }}
      />
      <ConfirmSheet
        open={rejectOpen}
        title="Reject this application?"
        body="The student and guardian see your reason in a calm card."
        confirmLabel="Reject application"
        destructive
        reasonRequired
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          setRejectOpen(false);
          dispatch('adminRejectApplication', { studentId, reason });
          toast('Application rejected');
        }}
      />
      <ConfirmSheet
        open={infoOpen}
        title="Send back for information"
        body="The student sees your message on their dashboard and can update documents."
        confirmLabel="Send to student"
        reasonRequired
        reasonLabel="Message to the student"
        onClose={() => setInfoOpen(false)}
        onConfirm={(reason) => {
          setInfoOpen(false);
          dispatch('adminRequestInfo', { studentId, reason });
          toast('Sent back to the student');
        }}
      />
      <ConfirmSheet
        open={dropOpen}
        title="Mark as dropped out?"
        body={`Any money held for this student that is not yet paid to the institute (${formatINR(Math.max(0, sel.studentBalance(state, studentId)))}) moves to the general pool. It is not refunded to donors. Donors are notified.`}
        confirmLabel="Mark dropped"
        destructive
        reasonRequired
        onClose={() => setDropOpen(false)}
        onConfirm={(reason) => {
          setDropOpen(false);
          dispatch('dropStudent', { studentId, reason });
          toast('Marked dropped. Balance moved to the pool.');
        }}
      />
      <BottomSheet open={topUpOpen} onClose={() => setTopUpOpen(false)} title="Top up from the general pool">
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Pool balance {formatINR(pool)} · remaining need {formatINR(remaining)}. The amount is capped at the remaining need.
          </p>
          <Amount value={topUp} onChange={setTopUp} max={Math.min(pool, remaining)} />
          <FloatingTextarea label="Reason (for the audit log)" value={topUpReason} onChange={(e) => setTopUpReason(e.target.value)} rows={2} maxWords={50} />
          <PrimaryButton
            disabled={!topUp || topUp > Math.min(pool, remaining) || topUpReason.trim().length < 3}
            onClick={() => {
              dispatch('allocateDonation', { poolId: 'general', studentId, amount: topUp, reason: topUpReason.trim() });
              setTopUpOpen(false);
              setTopUpReason('');
              toast(`${formatINR(topUp)} moved from the pool`);
            }}
            className="w-full"
          >
            Move {topUp ? formatINR(topUp) : ''}
          </PrimaryButton>
        </div>
      </BottomSheet>
      {toastEl}
      {confirmEl}
    </div>
  );
}

// --- List ----------------------------------------------------------------------------
const QUICK = {
  unassigned: { label: 'Unassigned', test: (s, st) => s.reviews.some((r) => r.studentId === st.id && !r.verifierId && !r.decidedAt) },
  overdue: { label: 'Overdue verifier tasks', test: (s, st) => s.reviews.some((r) => r.studentId === st.id && r.verifierId && !r.decidedAt && r.slaDueAt && new Date(r.slaDueAt) < new Date()) },
  decision: { label: 'Ready for decision', test: (s, st) => (st.status === 'Under verification' || (st.status === 'Rejected' && st.rejectedByVerifier)) && !!sel.verificationProgress(s, st.id)?.review?.recommendation },
};

export function AdminApplications({ params = {}, onNavigate }) {
  const { state } = useStore();
  const [view, setView] = useState(params.filter === 'extras' ? 'extras' : 'list');
  const [openId, setOpenId] = useState(params.studentId || null);
  const [quick, setQuick] = useState(QUICK[params.filter] ? params.filter : null);
  const [fState, setFState] = useState('All states');
  const [fExam, setFExam] = useState('All exams');
  const [fVerifier, setFVerifier] = useState('All verifiers');

  useEffect(() => {
    setView(params.filter === 'extras' ? 'extras' : 'list');
    setQuick(QUICK[params.filter] ? params.filter : null);
    setOpenId(params.studentId || null);
  }, [params]);

  const rows = useMemo(() => {
    let out = state.students;
    if (quick) out = out.filter((st) => QUICK[quick].test(state, st));
    if (fState !== 'All states') out = out.filter((st) => st.state === fState);
    if (fExam !== 'All exams') out = out.filter((st) => st.exam === fExam);
    if (fVerifier !== 'All verifiers') out = out.filter((st) => (sel.getUser(state, st.verifierId)?.name || 'Unassigned') === fVerifier);
    return out;
  }, [state, quick, fState, fExam, fVerifier]);

  if (openId) return <StudentDetail studentId={openId} onBack={() => setOpenId(null)} />;

  const states = ['All states', ...new Set(state.students.map((s) => s.state).filter(Boolean))];
  const verifierNames = ['All verifiers', 'Unassigned', ...state.verifiers.map((v) => v.name)];
  const extrasCount = sel.pendingCountsForAdmin(state).extras;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Applications" sub="The verification pipeline, from draft to completed." />
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'list', label: 'All applications', count: state.students.length },
          { value: 'extras', label: 'Extras to review', count: extrasCount },
        ]}
      />
      {view === 'extras' ? (
        <ExtrasQueue />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <MiniSelect label="State" value={fState} onChange={setFState} options={states} />
            <MiniSelect label="Exam" value={fExam} onChange={setFExam} options={['All exams', 'JEE', 'NEET', 'CUET']} />
            <MiniSelect label="Verifier" value={fVerifier} onChange={setFVerifier} options={verifierNames} />
            {quick && (
              <button type="button" onClick={() => setQuick(null)} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 text-[13px] font-medium">
                {QUICK[quick].label}
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
          <DataTable
            rows={rows}
            searchText={(r) => `${r.fullName} ${r.id} ${r.district} ${r.state}`}
            searchPlaceholder="Search name, ID or district"
            filter={{ options: STAGES, getValue: (r) => r.status }}
            onRowClick={(r) => setOpenId(r.id)}
            empty={{ icon: Inbox, title: 'No applications match', body: 'Try clearing a filter.' }}
            columns={[
              { key: 'fullName', label: 'Student', width: 'minmax(0,1.6fr)', render: (r) => (
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.fullName}</div>
                  <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.id}</div>
                </div>
              ) },
              { key: 'district', label: 'District', render: (r) => (r.district ? `${r.district}, ${r.state}` : '—') },
              { key: 'exam', label: 'Exam', width: 'minmax(0,0.6fr)', render: (r) => r.exam || '—' },
              { key: 'status', label: 'Stage', width: 'minmax(0,1.2fr)', render: (r) => <StudentStatusChip status={r.status} /> },
              { key: 'verifier', label: 'Verifier', sortValue: (r) => sel.getUser(state, r.verifierId)?.name || '', render: (r) => sel.getUser(state, r.verifierId)?.name || 'Unassigned' },
              { key: 'funded', label: 'Funded', width: 'minmax(0,0.7fr)', align: 'right', sortValue: (r) => sel.studentFundingPercent(state, r.id), render: (r) => `${sel.studentFundingPercent(state, r.id)}%` },
            ]}
          />
        </>
      )}
    </div>
  );
}
