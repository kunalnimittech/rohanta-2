// Verifier module (Part 5). Verifiers are trust staff or volunteers invited by
// admin. They see only the applications assigned to them. Their decision is a
// recommendation; admin gives the final approval.
import React, { useState } from 'react';
import {
  Check,
  X,
  Eye,
  FileText,
  ShieldCheck,
  ThumbsUp,
  MessageCircle,
  ArrowUpRight,
  ClipboardCheck,
  Clock,
  AlertCircle,
  History as HistoryIcon,
  TrendingUp,
  Phone,
  MapPin,
} from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate, timeAgo, firstNameInitial } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  ConfirmSheet,
  DocViewer,
  FloatingTextarea,
  SelectableTile,
  Segmented,
  EmptyState,
  SectionLabel,
  StatTile,
  BottomSheet,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, useToast, useConfirm, StudentStatusChip, RAISED_INPUTS } from '../admin/AdminShared';

const DAY = 86400000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** SLA state for an open review. */
export function slaInfo(review, now = new Date()) {
  if (!review.slaDueAt) return { key: 'none', label: 'No SLA', text: '' };
  const due = new Date(review.slaDueAt);
  const dayDiff = Math.round((startOfDay(due) - startOfDay(now)) / DAY);
  if (due.getTime() < now.getTime() && dayDiff < 0) return { key: 'overdue', label: 'Overdue', text: `Overdue by ${-dayDiff} day${dayDiff === -1 ? '' : 's'}` };
  if (dayDiff <= 0) return { key: 'today', label: 'Due today', text: 'Due today' };
  const isNew = review.assignedAt && now.getTime() - new Date(review.assignedAt).getTime() < DAY && !Object.values(review.checklist || {}).some(Boolean);
  return { key: isNew ? 'new' : 'open', label: isNew ? 'New' : 'Open', text: `Due in ${dayDiff} day${dayDiff === 1 ? '' : 's'}` };
}
const SLA_CHIP = { overdue: 'rejected', today: 'needs_review', new: 'uploaded', open: 'pending', none: 'pending' };

const CHECKS = [
  ['docsMatch', 'Documents match the form', 'Name, date of birth and marks on the documents match what the student entered.'],
  ['incomeOk', 'Income within the ceiling', null],
  ['marksOk', 'Class 10 marks meet the minimum', null],
  ['guardianCalled', 'Guardian called', 'Spoke to the guardian and confirmed consent and family details.'],
  ['studentCalled', 'Student called', 'Spoke to the student about the course and their plans.'],
  ['noDuplicate', 'No duplicate application', 'No other application with the same Aadhaar, mobile or guardian.'],
];

function myReviews(state, userId) {
  return state.reviews.filter((r) => r.verifierId === userId);
}

// --- 5.1 My tasks --------------------------------------------------------------------
function TaskQueue({ user, onOpen }) {
  const { state } = useStore();
  const now = new Date();
  const mine = myReviews(state, user.id);
  const open = mine.filter((r) => !r.decidedAt).sort((a, b) => (a.slaDueAt || '9') < (b.slaDueAt || '9') ? -1 : 1);
  const monthKey = now.toISOString().slice(0, 7);
  const doneThisMonth = mine.filter((r) => r.decidedAt && r.decidedAt.startsWith(monthKey)).length;
  const infos = open.map((r) => ({ r, sla: slaInfo(r, now), st: sel.getStudent(state, r.studentId) })).filter((x) => x.st);
  const counts = {
    open: infos.length,
    today: infos.filter((x) => x.sla.key === 'today').length,
    overdue: infos.filter((x) => x.sla.key === 'overdue').length,
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Open" value={counts.open} icon={ClipboardCheck} />
        <StatTile label="Due today" value={counts.today} icon={Clock} />
        <StatTile label="Overdue" value={counts.overdue} icon={AlertCircle} />
        <StatTile label="Completed this month" value={doneThisMonth} icon={Check} />
      </div>
      {infos.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No open tasks" body="New applications assigned to you by the admin appear here, sorted by due date." />
      ) : (
        <div className="space-y-3">
          {infos.map(({ r, sla, st }) => {
            const done = Object.values(r.checklist || {}).filter(Boolean).length;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onOpen(r.id)}
                className="w-full text-left p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] active:scale-[0.99] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[16px] font-semibold">{firstNameInitial(st.fullName)}</span>
                    <StatusChip status={SLA_CHIP[sla.key]} label={sla.label} />
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                    {st.district}, {st.state} · {st.exam || 'Exam not chosen'} · assigned {r.assignedAt ? formatDate(r.assignedAt) : '—'}
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[14px] font-semibold">{sla.text}</div>
                  <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{done} of 6 checks</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- 5.3 Monthly progress checks ------------------------------------------------------
function ProgressChecks({ user }) {
  const { state, dispatch } = useStore();
  const [action, setAction] = useState(null); // { rec, kind }
  const [toastEl, toast] = useToast();
  const [confirmEl, confirm] = useConfirm();
  const myStudents = state.students.filter((s) => s.verifierId === user.id).map((s) => s.id);
  const pending = state.progress.filter((p) => myStudents.includes(p.studentId) && p.status === 'pending');
  const done = state.progress.filter((p) => myStudents.includes(p.studentId) && p.verifiedBy === user.id && p.status !== 'pending').slice(0, 6);
  return (
    <div className="space-y-4">
      {pending.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No progress updates to check" body="Monthly updates from your enrolled students arrive after the 7th of each month." />
      ) : (
        pending.map((p) => {
          const st = sel.getStudent(state, p.studentId);
          return (
            <div key={p.id} className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-semibold">{firstNameInitial(st.fullName)} · {p.type}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{p.month} · {sel.getInstitute(state, st.instituteId)?.name}</div>
                </div>
                <span className="text-[16px] font-bold">{p.score}</span>
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {[
                  p.attendance != null && `Attendance ${p.attendance}%`,
                  p.testsTaken != null && `${p.testsTaken} tests`,
                  p.avgScore != null && `Average ${p.avgScore}%`,
                  p.rank && `Rank ${p.rank}`,
                  p.subjects && Object.entries(p.subjects).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k} ${v}%`).join(', '),
                ].filter(Boolean).join(' · ') || 'No breakdown given'}
              </div>
              <div className="text-[13px]">Institute remark: {p.mentorRemark || p.remark}</div>
              {p.comments && <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Student&apos;s note: {p.comments}</div>}
              {p.progressStatus && p.progressStatus !== 'active' && <StatusChip status="needs_review" label={`Student marked: ${p.progressStatus === 'at_risk' ? 'at risk' : 'dropped'}`} />}
              <div className="flex flex-wrap gap-2 pt-1">
                <SmallButton primary onClick={() => confirm({ title: `Accept ${p.type}?`, body: 'Checked with the institute. The student and their sponsors see the update.', confirmLabel: 'Accept update', onConfirm: () => { dispatch('verifyProgress', { recordId: p.id, decision: 'verified' }); toast('Accepted'); } })}>
                  <Check className="w-3.5 h-3.5" strokeWidth={2} /> Accept
                </SmallButton>
                <SmallButton onClick={() => setAction({ rec: p, kind: 'correction' })}>Request correction</SmallButton>
                <SmallButton onClick={() => setAction({ rec: p, kind: 'flagged' })}>Flag issue</SmallButton>
              </div>
            </div>
          );
        })
      )}
      {done.length > 0 && (
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Recently checked</SectionLabel>
          {done.map((p) => (
            <KV key={p.id} label={`${firstNameInitial(sel.getStudent(state, p.studentId)?.fullName)} · ${p.type} · ${p.month}`} value={p.status === 'verified' ? 'Accepted' : p.status === 'flagged' ? 'Flagged' : 'Correction asked'} />
          ))}
        </Card>
      )}
      <ConfirmSheet
        open={!!action}
        title={action?.kind === 'flagged' ? 'Flag this student as at risk?' : 'Ask for a correction?'}
        body={action?.kind === 'flagged' ? 'Admin is notified to follow up with the student and institute.' : 'The student sees your message and can submit the update again.'}
        confirmLabel={action?.kind === 'flagged' ? 'Flag and notify admin' : 'Send to student'}
        reasonRequired
        reasonLabel={action?.kind === 'flagged' ? 'What is the concern?' : 'What needs correcting?'}
        onClose={() => setAction(null)}
        onConfirm={(note) => {
          dispatch('verifyProgress', { recordId: action.rec.id, decision: action.kind, note });
          setAction(null);
          toast(action.kind === 'flagged' ? 'Flagged. Admin notified.' : 'Sent to the student');
        }}
      />
      {toastEl}
      {confirmEl}
    </div>
  );
}

// --- 5.2 Review screen -------------------------------------------------------------------
export function ReviewScreen({ reviewId, onBack, onSubmitted }) {
  const { state, dispatch } = useStore();
  const review = state.reviews.find((r) => r.id === reviewId);
  const [checklist, setChecklist] = useState(review?.checklist || {});
  const [notes, setNotes] = useState(review?.notes || '');
  const [rec, setRec] = useState(null);
  const [reason, setReason] = useState('');
  const [viewDoc, setViewDoc] = useState(null);
  const [rejectDoc, setRejectDoc] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const [confirmEl, confirm] = useConfirm();
  if (!review) return null;
  const st = sel.getStudent(state, review.studentId);
  const g = sel.getGuardian(state, st.id);
  const docs = sel.studentDocuments(state, st.id);
  const course = sel.getCourse(state, st.courseId);
  const inst = course && sel.getInstitute(state, course.instituteId);
  const totals = sel.studentPackageTotals(state, st.id);
  const s = state.settings;
  const sla = slaInfo(review);
  const readOnly = !!review.decidedAt;
  const done = Object.values(checklist).filter(Boolean).length;
  const needsReason = rec === 'reject' || rec === 'request_info' || rec === 'escalate';
  const ready = rec && (!needsReason || reason.trim().length >= 3);
  const checkHint = {
    incomeOk: `Ceiling ${formatINR(s.incomeCeiling)} a year. Declared band: ${st.incomeBand}.`,
    marksOk: `Minimum ${s.minClass10Marks}%. Declared: ${st.class10Marks}%.`,
  };
  const recTiles = [
    { id: 'approve', icon: ThumbsUp, title: 'Approve', subtitle: 'Recommend listing' },
    { id: 'reject', icon: X, title: 'Reject', subtitle: 'Reason is required' },
    { id: 'request_info', icon: MessageCircle, title: 'Request more info', subtitle: 'Message goes to the student' },
    { id: 'escalate', icon: ArrowUpRight, title: 'Escalate to admin', subtitle: 'Unsure, or needs a field visit' },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-[880px]">
      <PageHeader
        onBack={onBack}
        backLabel="My tasks"
        title={st.fullName}
        sub={`${st.id} · Class ${st.studentClass} · ${st.exam || 'No exam'}`}
        actions={readOnly ? <StatusChip status="verified" label="Submitted" /> : <StatusChip status={SLA_CHIP[sla.key]} label={sla.text || sla.label} />}
      />

      <Card className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        <KV label="District" value={`${st.district}, ${st.state}`} />
        <KV label="School" value={st.school} />
        <KV label="Student mobile" value={st.mobile} />
        <KV label="Guardian" value={g ? `${g.name} (${g.relation})` : '—'} />
        <KV label="Guardian mobile" value={g?.mobile} />
        <KV label="Guardian consent" value={sel.effectiveConsentState(g).replace('_', ' ')} />
        <KV label="Course" value={course ? `${course.name}, ${inst?.name}` : 'Not chosen'} />
        <KV label="Package total" value={formatINR(totals.total)} />
      </Card>
      {st.sop && (
        <Card className="space-y-2">
          <SectionLabel>Statement of purpose</SectionLabel>
          <p className="text-[14px] leading-relaxed">{st.sop}</p>
        </Card>
      )}

      <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-[14px] font-medium">Your word is a recommendation. Admin decides.</p>
      </div>

      {/* 1. Documents */}
      <section className="space-y-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.01em]">1. Documents</h2>
        {docs.map((d) => (
          <div key={d.id} className="p-4 md:px-6 md:py-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold">{d.name}</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{d.status === 'rejected' && d.rejectReason ? d.rejectReason : d.detail}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
              {d.status !== 'not_uploaded' && (
                <StatusChip status={d.source === 'digilocker' ? 'verified' : 'uploaded'} label={d.source === 'digilocker' ? 'DigiLocker' : 'Manual upload'} />
              )}
              <StatusChip status={d.status} />
              {d.status !== 'not_uploaded' && (
                <SmallButton ariaLabel={`View ${d.name}`} onClick={() => setViewDoc(d)}>
                  <Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View
                </SmallButton>
              )}
              {!readOnly && ['uploaded', 'pending', 'needs_review'].includes(d.status) && (
                <>
                  <SmallButton primary onClick={() => confirm({ title: `Accept ${d.name}?`, body: 'Marks it verified. The student is notified.', confirmLabel: 'Accept document', onConfirm: () => { dispatch('reviewDocument', { studentId: st.id, docId: d.id, decision: 'verified' }); toast(`${d.name} accepted`); } })}>Accept</SmallButton>
                  <SmallButton onClick={() => setRejectDoc(d)}>Reject</SmallButton>
                </>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* 2. Checklist */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em]">2. Checklist</h2>
          <span className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">{done} of 6 done</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHECKS.map(([k, title, hint]) => {
            const on = !!checklist[k];
            return (
              <button
                key={k}
                type="button"
                disabled={readOnly}
                aria-pressed={on}
                onClick={() => setChecklist((c) => ({ ...c, [k]: !c[k] }))}
                className={`text-left p-5 rounded-[24px] flex items-start gap-4 transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25 ${
                  on ? 'bg-white dark:bg-[#151515] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA] shadow-soft' : 'bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F]'
                }`}
              >
                <span className={`mt-0.5 w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 ${on ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'bg-white dark:bg-[#222224] border border-[#D4D4D8] dark:border-[#3F3F46]'}`}>
                  {on && <Check className="w-4 h-4 animate-pop-in" strokeWidth={2.5} />}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{title}</span>
                  <span className="block mt-0.5 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{checkHint[k] || hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Notes */}
      <section className={`space-y-3 ${RAISED_INPUTS}`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.01em]">3. Notes</h2>
        {readOnly ? (
          <Card><p className="text-[14px]">{notes || 'No notes.'}</p></Card>
        ) : (
          <>
            <FloatingTextarea label="Notes (visible to admin only)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxWords={200} />
            <SmallButton onClick={() => { dispatch('saveReviewDraft', { reviewId, checklist, notes }); toast('Draft saved'); }} className="bg-[#F4F4F5] dark:bg-[#151515]">Save draft</SmallButton>
          </>
        )}
      </section>

      {/* 4. Recommendation */}
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.01em]">4. Recommendation</h2>
        {readOnly ? (
          <Card className="space-y-1">
            <KV label="You recommended" value={recTiles.find((t) => t.id === review.recommendation)?.title} />
            {review.reason && <KV label="Reason" value={review.reason} />}
            <KV label="Submitted" value={formatDate(review.decidedAt)} />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recTiles.map((t) => (
                <SelectableTile key={t.id} icon={t.icon} title={t.title} subtitle={t.subtitle} selected={rec === t.id} onClick={() => setRec(t.id)} />
              ))}
            </div>
            {needsReason && (
              <FloatingTextarea
                label={rec === 'request_info' ? 'Message to the student' : rec === 'escalate' ? 'Note to admin' : 'Reason (the student sees this)'}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxWords={100}
              />
            )}
            <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Your word is a recommendation. Admin decides.</p>
            <PrimaryButton disabled={!ready} onClick={() => setConfirmOpen(true)} className="w-full sm:w-auto">
              Submit recommendation
            </PrimaryButton>
            {rec === 'approve' && done < 6 && <p className="text-[13px]">Only {done} of 6 checks are ticked. You can still submit; admin will see this.</p>}
          </>
        )}
      </section>

      <DocViewer open={!!viewDoc} onClose={() => setViewDoc(null)} doc={viewDoc} />
      <ConfirmSheet
        open={!!rejectDoc}
        title={`Reject ${rejectDoc?.name}?`}
        body="The student and guardian see your reason and can upload it again."
        confirmLabel="Reject document"
        destructive
        reasonRequired
        onClose={() => setRejectDoc(null)}
        onConfirm={(r) => { dispatch('reviewDocument', { studentId: st.id, docId: rejectDoc.id, decision: 'rejected', reason: r }); setRejectDoc(null); toast('Document returned'); }}
      />
      <ConfirmSheet
        open={confirmOpen}
        title="Submit your recommendation?"
        body={
          rec === 'approve' ? 'The application moves to the admin for final approval.'
          : rec === 'reject' ? 'The student sees your reason. Admin can still overturn it.'
          : rec === 'request_info' ? 'The student is asked to update their application. It comes back to you after.'
          : 'Admin is notified to take over this application.'
        }
        confirmLabel="Submit"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          dispatch('verifierDecision', { reviewId, recommendation: rec, reason: reason.trim(), checklist, notes });
          onSubmitted();
        }}
      />
      {toastEl}
      {confirmEl}
    </div>
  );
}

// --- Pages -------------------------------------------------------------------------------
export function VerifierTasksPage({ user, params = {} }) {
  const { state } = useStore();
  const [openId, setOpenId] = useState(params.reviewId || null);
  React.useEffect(() => { if (params.reviewId) setOpenId(params.reviewId); }, [params]);
  const [tab, setTab] = useState('applications');
  const [toastEl, toast] = useToast();
  if (openId)
    return (
      <ReviewScreen
        reviewId={openId}
        onBack={() => setOpenId(null)}
        onSubmitted={() => { setOpenId(null); toast('Submitted. It is now with the admin.'); }}
      />
    );
  const myStudents = state.students.filter((s) => s.verifierId === user.id).map((s) => s.id);
  const progressCount = state.progress.filter((p) => myStudents.includes(p.studentId) && p.status === 'pending').length;
  const openCount = myReviews(state, user.id).filter((r) => !r.decidedAt).length;
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="My tasks" sub={`Hello, ${user.name.split(' ')[0]}. Districts: ${(user.districts || []).join(', ') || '—'}.`} />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: 'applications', label: 'Applications', count: openCount },
          { value: 'progress', label: 'Monthly progress', count: progressCount },
        ]}
      />
      {tab === 'applications' ? <TaskQueue user={user} onOpen={setOpenId} /> : <ProgressChecks user={user} />}
      {toastEl}
    </div>
  );
}

const REC_LABEL = { approve: 'Approve', reject: 'Reject', request_info: 'Request info', escalate: 'Escalate' };
function adminOutcome(st, review) {
  if (['Listed', 'Partially funded', 'Fully funded', 'Enrolled', 'Completed'].includes(st.status)) return ['verified', st.overrideReason ? 'Listed (admin override)' : 'Listed by admin'];
  if (st.status === 'Rejected') return ['rejected', st.rejectedByVerifier ? 'Rejected, awaiting admin' : 'Rejected by admin'];
  if (st.status === 'Info requested') return ['needs_review', 'Info requested'];
  if (st.status === 'Dropped') return ['rejected', 'Dropped'];
  if (st.status === 'Under verification' && review.recommendation) return ['pending', 'Awaiting admin'];
  return ['pending', st.status];
}

export function VerifierHistoryPage({ user }) {
  const { state } = useStore();
  const [open, setOpen] = useState(null);
  const decided = myReviews(state, user.id).filter((r) => r.decidedAt).sort((a, b) => (a.decidedAt < b.decidedAt ? 1 : -1));
  const r = open && state.reviews.find((x) => x.id === open);
  const st = r && sel.getStudent(state, r.studentId);
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="History" sub="Your past recommendations and what the admin decided." />
      {decided.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No decisions yet" body="Applications you submit a recommendation for appear here." />
      ) : (
        <div className="space-y-3">
          {decided.map((rv) => {
            const s2 = sel.getStudent(state, rv.studentId);
            if (!s2) return null;
            const [chip, label] = adminOutcome(s2, rv);
            return (
              <button key={rv.id} type="button" onClick={() => setOpen(rv.id)} className="w-full text-left p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold">{firstNameInitial(s2.fullName)} · {s2.district}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">You: {REC_LABEL[rv.recommendation]} · {formatDate(rv.decidedAt)}</div>
                </div>
                <StatusChip status={chip} label={label} />
              </button>
            );
          })}
        </div>
      )}
      <BottomSheet open={!!r} onClose={() => setOpen(null)} title={st ? firstNameInitial(st.fullName) : ''}>
        {r && st && (
          <div className="space-y-1">
            <KV label="Your recommendation" value={REC_LABEL[r.recommendation]} />
            {r.reason && <KV label="Reason" value={r.reason} />}
            <KV label="Checks done" value={`${Object.values(r.checklist || {}).filter(Boolean).length} of 6`} />
            <KV label="Submitted" value={`${formatDate(r.decidedAt)} (${timeAgo(r.decidedAt)})`} />
            <KV label="Current stage" value={st.status} />
            <KV label="Admin decision" value={adminOutcome(st, r)[1]} />
            {st.overrideReason && <KV label="Override reason" value={st.overrideReason} />}
            {r.notes && <p className="pt-3 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Your notes: {r.notes}</p>}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

/** Extra section for the shared Settings page: districts covered (set by admin). */
export function VerifierDistricts({ user }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[18px] font-semibold">Districts covered</h2>
      <div className="p-6 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
        <div className="flex flex-wrap gap-2">
          {(user.districts || []).map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#222224] text-[13px] font-medium">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} /> {d}
            </span>
          ))}
        </div>
        <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">The admin assigns your districts. Ask them to change this.</p>
      </div>
    </section>
  );
}
