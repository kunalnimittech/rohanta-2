// End-to-end demo script (Part 11). Follows one student through all 17 steps.
// "Done" is read from the live store, so every step reflects what the other
// roles have actually done. "Go" signs in as the right role and opens the
// right screen.
import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR } from '../../data/mockData';
import { BottomSheet, StatusChip, ProgressBar } from '../../components/ui';
import { MiniSelect } from '../admin/AdminShared';

export const DEFAULT_DEMO_STUDENT = 'SB-2026-004602'; // Aman Raj, a fresh Draft in the seed
const LISTED = ['Listed', 'Partially funded', 'Fully funded', 'Enrolled', 'Completed'];

/**
 * target: { userId, nav, params } | { flow: 'signup' } | { flow: 'sponsorSignup', type }
 */
export function demoSteps(state, sid) {
  const st = sel.getStudent(state, sid);
  if (!st) return [];
  const g = sel.getGuardian(state, sid);
  const docs = sel.studentDocuments(state, sid);
  const rv = sel.verificationProgress(state, sid)?.review;
  const pkg = sel.getPackage(state, sid);
  const studentUser = st.userId;
  const guardianUser = g?.userId;
  const donations = state.donations.filter((d) => d.studentId === sid);
  const ok = donations.filter((d) => d.status === 'success');
  const lastOk = ok[ok.length - 1];
  const reco = lastOk && state.reconciliation.find((r) => r.donationId === lastOk.id);
  const sponsorUser = lastOk ? sel.getSponsor(state, lastOk.sponsorId)?.userId : 'u-sp-anand';
  const payouts = state.disbursements.filter((d) => d.studentId === sid);
  const pending = payouts.find((d) => d.status === 'pending_trustee');
  const instituteUser = state.users.find((u) => u.role === 'institute' && u.orgId === st.instituteId)?.id;
  const cert = state.certificates.find((c) => c.studentIds.includes(sid));
  const corp = state.sponsors.filter((s) => s.type !== 'individual');
  const uploaded = docs.filter((d) => d.source === 'manual' && ['uploaded', 'verified', 'pending'].includes(d.status) && d.id !== 'caste_ews').length;
  const extrasDecided = (pkg?.extras || []).some((e) => e.approved || e.state === 'rejected') || (!!pkg?.locked && !(pkg?.extras || []).some((e) => e.state === 'needs_review' && !e.excluded));
  const stu = (nav, params) => ({ userId: studentUser, nav, params });
  const admin = (nav, params) => ({ userId: 'u-admin', nav, params });

  return [
    { n: 1, title: 'Student registers with phone OTP and uploads documents', who: 'Student', done: uploaded >= 3,
      detail: `${uploaded} of 3 manual documents uploaded (income, school ID, photo).`,
      actions: [{ label: 'Sign up as a new student', target: { flow: 'signup' } }, { label: `Documents (${st.fullName.split(' ')[0]})`, target: stu('documents') }] },
    { n: 2, title: 'Guardian approves consent by link + OTP', who: 'Student → Guardian', done: sel.effectiveConsentState(g) === 'approved',
      detail: `Consent: ${sel.effectiveConsentState(g).replace('_', ' ')}. Expired and decline paths are on the same page.`,
      actions: [{ label: 'Send consent link', target: stu('application', { step: 1 }) }, ...(guardianUser ? [{ label: 'Open guardian link', target: { userId: guardianUser, nav: 'consent' } }] : [])] },
    { n: 3, title: 'DigiLocker verifies documents (failure: re-upload)', who: 'Student', done: docs.filter((d) => ['class10', 'aadhaar'].includes(d.id)).every((d) => d.status === 'verified'),
      detail: 'Class 10 marksheet and Aadhaar via DigiLocker sandbox. Tick "Simulate failure" to see the re-upload path.',
      actions: [{ label: 'DigiLocker', target: stu('documents') }, { label: 'Submit application', target: stu('application', { step: 6 }) }] },
    { n: 4, title: 'Admin assigns a verifier', who: 'Admin', done: !!rv?.verifierId,
      detail: rv ? (rv.verifierId ? `Assigned to ${sel.getUser(state, rv.verifierId)?.name}.` : 'Submitted, not assigned yet.') : 'The student must submit first (step 3).',
      actions: [{ label: 'Open application', target: admin('applications', { studentId: sid }) }] },
    { n: 5, title: 'Verifier completes the checklist and recommends', who: 'Verifier', done: !!rv?.recommendation,
      detail: rv?.recommendation ? `Recommendation: ${rv.recommendation.replace('_', ' ')}.` : 'Other paths: reject with reason, request info, escalate.',
      actions: rv?.verifierId ? [{ label: 'Open review', target: { userId: rv.verifierId, nav: 'tasks', params: { reviewId: rv.id } } }] : [] },
    { n: 6, title: 'Student picks exam, institute and course from the catalogue', who: 'Admin → Student', done: !!st.courseId,
      detail: st.courseId ? `${sel.getCourse(state, st.courseId)?.name}. Fee, duration and batch are read-only.` : 'Admin maintains the catalogue (already seeded).',
      actions: [{ label: 'Choose course', target: stu('application', { step: 4 }) }, { label: 'Admin catalogue', target: admin('catalogue') }] },
    { n: 7, title: 'Student adds extras; admin checks the funds and decides', who: 'Student → Admin', done: extrasDecided,
      detail: (pkg?.extras || []).length ? `${pkg.extras.length} extra(s): ${pkg.extras.map((e) => `${e.category} ${e.state === 'needs_review' ? 'waiting' : e.state === 'rejected' ? 'removed' : 'accepted'}`).join(', ')}.` : 'No extras yet.',
      actions: [{ label: 'Add extras', target: stu('package') }, { label: 'Review extras', target: admin('applications', { filter: 'extras' }) }] },
    { n: 8, title: 'Package = fee + approved extras; student locks it', who: 'Student', done: !!pkg?.locked,
      detail: pkg ? `${formatINR(sel.studentPackageTotals(state, sid).total)} · ${formatINR(sel.studentPackageTotals(state, sid).monthlyNeed)} a month` : 'Choose a course first.',
      actions: [{ label: 'Lock package', target: stu('package') }] },
    { n: 9, title: 'Admin gives final approval; student is listed', who: 'Admin', done: LISTED.includes(st.status),
      detail: `Stage: ${st.status}. Rejection path: "Send back for info" returns it to the student.`,
      actions: [{ label: 'Final approval', target: admin('applications', { studentId: sid }) }] },
    { n: 10, title: 'Sponsor registers (corporate: admin verifies in 48 h)', who: 'Sponsor → Admin', done: corp.some((s) => s.kycStatus === 'verified' && s.id !== 'sp-tata' && s.id !== 'sp-janseva' && s.id !== 'sp-mp'),
      detail: `${corp.filter((s) => s.kycStatus === 'pending').length} organisation(s) waiting for KYC.`,
      actions: [{ label: 'Register a company', target: { flow: 'sponsorSignup', type: 'corporate' } }, { label: 'Verify KYC', target: admin('sponsors', { filter: 'pending' }) }] },
    { n: 11, title: 'Sponsor picks the student and enters ₹4,00,000', who: 'Sponsor', done: donations.length > 0,
      detail: LISTED.includes(st.status) ? `Remaining need ${formatINR(sel.studentRemainingNeed(state, sid))}. Any extra goes to the general pool.` : 'The student must be listed first.',
      actions: [{ label: 'Open student as sponsor', target: { userId: 'u-sp-anand', nav: 'discover', params: { studentId: sid } } }, { label: 'As Meridian Pharma', target: { userId: 'u-sp-meridian', nav: 'discover', params: { studentId: sid } } }] },
    { n: 12, title: 'Platform adds 10%; sponsor pays via the mock gateway', who: 'Sponsor', done: ok.length > 0,
      detail: lastOk ? `${formatINR(lastOk.amount)} + ${formatINR(lastOk.fee)} = ${formatINR(lastOk.total)} paid.` : 'Failure path: simulate "Failed" and try again.',
      actions: [{ label: 'My giving', target: { userId: sponsorUser, nav: 'giving' } }] },
    { n: 13, title: 'Trust receives it: students/pool + operations in the ledger', who: 'Admin', done: ok.length > 0,
      detail: lastOk ? state.allocations.filter((a) => a.donationId === lastOk.id).map((a) => `${a.targetType} ${formatINR(a.amount)}`).join(' · ') : '—',
      actions: [{ label: 'Ledger', target: admin('funds', { tab: 'ledger' }) }] },
    { n: 14, title: 'Finance checks it against the bank statement', who: 'Finance', done: !!reco && ['matched', 'resolved'].includes(reco.state),
      detail: reco ? `Reconciliation: ${reco.state}. Mismatch path: hold and resolve.` : 'Waiting for a payment.',
      actions: [{ label: 'Reconciliation', target: { userId: 'u-finance', nav: 'reconciliation' } }] },
    { n: 15, title: 'Student sees the funds; 80G receipt issued for the full amount', who: 'Student · Sponsor', done: sel.studentConfirmed(state, sid) > 0,
      detail: `${formatINR(sel.studentConfirmed(state, sid))} confirmed for the student.`,
      actions: [{ label: 'Student dashboard', target: stu('dashboard') }, { label: 'Receipt', target: { userId: sponsorUser, nav: 'certificates', params: { tab: 'receipts' } } }] },
    { n: 16, title: 'Finance pays out, trustee approves, UTR, institute confirms', who: 'Finance → Trustee → Institute', done: payouts.some((d) => d.status === 'confirmed'),
      detail: payouts.length ? payouts.map((d) => `#${d.instalmentNo} ${d.status.replace('_', ' ')}`).join(' · ') : 'Upload the invoice, then create the payout.',
      actions: [
        ...(instituteUser ? [{ label: 'Institute invoices', target: { userId: instituteUser, nav: 'invoices' } }] : []),
        { label: 'Finance payouts', target: { userId: 'u-finance', nav: 'payouts' } },
        { label: 'Trustee approval', target: { userId: 'u-trustee', nav: 'approvals', params: pending ? { payoutId: pending.id } : {} } },
      ] },
    { n: 17, title: 'Certificate issued; donor sees impact, progress and results', who: 'Sponsor', done: !!cert,
      detail: cert ? `${cert.number} for ${sel.getSponsor(state, cert.sponsorId)?.displayName}.` : 'Issued automatically when the institute confirms the fee.',
      actions: [{ label: 'Certificates', target: { userId: cert ? sel.getSponsor(state, cert.sponsorId)?.userId : sponsorUser, nav: 'certificates', params: { tab: 'certificates' } } }, { label: 'Impact', target: { userId: cert ? sel.getSponsor(state, cert.sponsorId)?.userId : sponsorUser, nav: 'impact' } }] },
  ];
}

export function DemoScriptSheet({ open, onClose, onGo }) {
  const { state, dispatch } = useStore();
  const sid = state.settings.demoStudentId && sel.getStudent(state, state.settings.demoStudentId) ? state.settings.demoStudentId : DEFAULT_DEMO_STUDENT;
  const steps = demoSteps(state, sid);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);
  const options = state.students
    .filter((s) => s.id === sid || ['Draft', 'Consent pending', 'Under verification', 'Info requested', 'Listed'].includes(s.status) || s.createdAt > '2026-11-18')
    .map((s) => ({ value: s.id, label: `${s.fullName} · ${s.status}` }));
  return (
    <BottomSheet open={open} onClose={onClose} title="Demo script">
      <div className="space-y-5">
        <div className="space-y-3">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Follow one student from sign-up to certificate. Each step shows whether it has happened, and Go opens the right role and screen.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium">Following</span>
            <MiniSelect label="Student to follow" value={sid} onChange={(v) => dispatch('setSettings', { demoStudentId: v })} options={options} />
          </div>
          <div className="flex justify-between text-[13px] font-semibold"><span>{done} of {steps.length} steps done</span>{next && <span>Next: step {next.n}</span>}</div>
          <ProgressBar percent={(done / steps.length) * 100} />
        </div>
        <ol className="space-y-2">
          {steps.map((s) => (
            <li key={s.n} className={`p-4 rounded-[20px] ${s === next ? 'bg-white dark:bg-[#222224] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA]' : 'bg-[#F4F4F5] dark:bg-[#222224]'}`}>
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold ${s.done ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40'}`}>
                  {s.done ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : s.n}
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold leading-snug">{s.title}</span>
                    <StatusChip status="info" label={s.who} />
                  </div>
                  <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{s.detail}</p>
                  {s.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {s.actions.map((a) => (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => onGo(a.target)}
                          className="inline-flex items-center gap-1 h-11 px-4 rounded-full bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A] text-[12px] font-medium active:scale-[0.97] transition-transform"
                        >
                          {a.label} <ArrowRight className="w-3 h-3" strokeWidth={2} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </BottomSheet>
  );
}
