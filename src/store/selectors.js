// Derived values. Every selector takes the store state first so it stays a
// pure function (easy to move to a backend query later).
import { STATUS_STEPS, formatDate, timeAgo, firstNameInitial } from '../data/mockData';
import { packageTotals } from './ledger';
import { IMPACT_LEVELS } from '../data/rules';

const sum = (arr, f = (x) => x.amount) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const PAID = ['paid', 'confirmed'];

export const getStudent = (s, id) => s.students.find((x) => x.id === id);
export const getUser = (s, id) => s.users.find((x) => x.id === id);
export const getSponsor = (s, id) => s.sponsors.find((x) => x.id === id);
export const getSponsorByUser = (s, userId) => s.sponsors.find((x) => x.userId === userId);
export const getStudentByUser = (s, userId) => s.students.find((x) => x.userId === userId);
export const getPackage = (s, studentId) => s.packages.find((p) => p.studentId === studentId);
export const getGuardian = (s, studentId) => s.guardians.find((g) => g.studentId === studentId);
export const getCourse = (s, id) => s.catalogue.courses.find((c) => c.id === id);
export const getInstitute = (s, id) => s.catalogue.institutes.find((i) => i.id === id);
export const studentDocuments = (s, studentId) => s.documents.filter((d) => d.studentId === studentId);
export const studentProgress = (s, studentId) => s.progress.filter((p) => p.studentId === studentId);

/** Package total, verified need and monthly need for a student. */
export function studentPackageTotals(s, studentId) {
  const pkg = getPackage(s, studentId);
  if (!pkg) return { extrasTotal: 0, total: 0, verifiedNeed: 0, monthlyNeed: 0 };
  return packageTotals(pkg, pkg.durationMonths || getCourse(s, pkg.courseId)?.durationMonths || 12);
}

/** Everything ever allocated to the student (pending + confirmed). */
export const studentAllocated = (s, studentId) =>
  sum(s.allocations.filter((a) => a.targetType === 'student' && a.targetId === studentId));

/** Raised = allocations to the student (pending reconciliation included, shown as "Confirming"). */
export const studentRaised = (s, studentId) => studentAllocated(s, studentId);

/** Confirmed only: what the student sees as received. */
export const studentConfirmed = (s, studentId) =>
  sum(s.allocations.filter((a) => a.targetType === 'student' && a.targetId === studentId && a.state === 'confirmed'));

/** Remaining need = verified need − raised (never negative). */
export const studentRemainingNeed = (s, studentId) =>
  Math.max(0, studentPackageTotals(s, studentId).verifiedNeed - studentRaised(s, studentId));

/**
 * Funded % = raised / verified need, capped at 100 and rounded.
 * Example: Priya, ₹30,000 raised of ₹48,000 -> 62.5 -> 63%.
 * (Student and guardian screens count only bank-matched money; see studentConfirmed.)
 */
export function studentFundingPercent(s, studentId) {
  const need = studentPackageTotals(s, studentId).verifiedNeed;
  if (!need) return 0;
  return Math.min(100, Math.round((studentRaised(s, studentId) / need) * 100));
}

/** Allocated balance held in the trust account for the student (allocated − paid out). */
export const studentBalance = (s, studentId) =>
  studentAllocated(s, studentId) -
  sum(s.disbursements.filter((d) => d.studentId === studentId && PAID.includes(d.status)));

/** Index on STATUS_STEPS for the 8-step tracker. Side states sit on their nearest step. */
export function studentStatusIndex(s, studentId) {
  const st = getStudent(s, studentId)?.status;
  const idx = STATUS_STEPS.indexOf(st);
  if (idx >= 0) return idx;
  if (st === 'Info requested' || st === 'Rejected') return 2;
  if (st === 'Dropped') return 6;
  return 0;
}

/** Contributions in the shape the existing Funding / Dashboard pages expect. Fee is never shown. */
export function studentContributions(s, studentId) {
  return s.allocations
    .filter((a) => a.targetType === 'student' && a.targetId === studentId && a.amount > 0)
    .map((a) => {
      const d = s.donations.find((x) => x.id === a.donationId);
      if (!d) {
        // Pool top-up by the trust (no single donor).
        return { id: a.id, date: formatDate(a.createdAt), at: a.createdAt, sponsor: 'Sikshit Bharat pool', type: 'Pool top-up', amount: a.amount, state: a.state, sponsorId: null };
      }
      const sp = d && getSponsor(s, d.sponsorId);
      const isPublic = sp && sp.public && !d.anonymous && (sp.kycStatus === 'verified' || sp.kycStatus === 'not_required');
      return {
        id: a.id,
        date: formatDate(a.createdAt),
        at: a.createdAt,
        sponsor: isPublic ? sp.displayName : 'Anonymous sponsor',
        type: !sp ? 'Individual' : sp.type === 'corporate' ? 'CSR' : sp.type === 'ngo' ? 'NGO' : sp.type === 'mp_mla' ? 'MP / MLA' : 'Individual',
        amount: a.amount,
        state: a.state,
        sponsorId: sp?.id,
      };
    })
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

// --- Ledger ------------------------------------------------------------------
const linesFor = (s, type, id) =>
  s.allocations.filter((a) => a.targetType === type && (id == null || a.targetId === id));

export const poolBalance = (s, poolId = 'general') => sum(linesFor(s, 'pool', poolId));

export const operationsBalance = (s) =>
  sum(linesFor(s, 'operations')) - sum(s.opsTransfers || []);

export const cohortBalance = (s, cohortId) => sum(linesFor(s, 'cohort', cohortId));

/**
 * The invariant: total of all allocation balances = trust bank balance.
 * Bank balance is computed independently from money in (successful donations)
 * minus money out (paid payouts + operating-account transfers).
 */
export function ledgerTotals(s) {
  const studentIds = [...new Set(linesFor(s, 'student').map((a) => a.targetId))];
  const students = sum(studentIds.map((id) => ({ amount: studentBalance(s, id) })));
  const cohorts = sum(s.cohorts.map((c) => ({ amount: cohortBalance(s, c.id) })));
  const pools = sum(s.pools.map((p) => ({ amount: poolBalance(s, p.id) })));
  const operations = operationsBalance(s);
  const balances = students + cohorts + pools + operations;

  // Refunds from institutes (student dropped after payout) come back into the trust account.
  const moneyIn = sum(s.donations.filter((d) => d.status === 'success'), (d) => d.total) + sum(s.refunds || []);
  const paidOut = sum(s.disbursements.filter((d) => PAID.includes(d.status)));
  const opsOut = sum(s.opsTransfers || []);
  const bank = moneyIn - paidOut - opsOut;

  return { students, cohorts, pools, operations, balances, moneyIn, paidOut, opsOut, bank, refunds: sum(s.refunds || []), balanced: balances === bank };
}

/** Funds in vs out by month (last n months) for charts. */
export function fundsByMonth(s, months = 6, endIso = new Date().toISOString()) {
  const end = new Date(endIso);
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(end.getFullYear(), end.getMonth() - (months - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const inn = sum(s.donations.filter((x) => x.status === 'success' && x.createdAt.startsWith(key)), (x) => x.total);
    const out = sum(s.disbursements.filter((x) => PAID.includes(x.status) && (x.paidOn || '').startsWith(key)));
    return { key, label: d.toLocaleString('en-IN', { month: 'short' }), in: inn, out };
  });
}

export function studentsByStage(s) {
  const counts = {};
  s.students.forEach((st) => (counts[st.status] = (counts[st.status] || 0) + 1));
  return counts;
}

// --- Sponsor -----------------------------------------------------------------
export const sponsorDonations = (s, sponsorId) => s.donations.filter((d) => d.sponsorId === sponsorId);

export function sponsorTotals(s, sponsorId) {
  const ok = sponsorDonations(s, sponsorId).filter((d) => d.status === 'success');
  const studentIds = [...new Set(ok.filter((d) => d.studentId).map((d) => d.studentId))];
  // Utilised = this sponsor's share of payouts already made to institutes.
  let utilised = 0;
  studentIds.forEach((sid) => {
    const mine = sum(ok.filter((d) => d.studentId === sid));
    const all = studentAllocated(s, sid) || 1;
    const paid = sum(s.disbursements.filter((d) => d.studentId === sid && PAID.includes(d.status)));
    utilised += Math.round((paid * mine) / all);
  });
  const given = sum(ok, (d) => d.total);
  const toStudents = sum(ok);
  return { given, toStudents, studentsSupported: studentIds.length, utilised, held: Math.max(0, toStudents - utilised) };
}

/**
 * Impact score (read-only; never affects verification, allocation or payout).
 * Six parts. Co-funded students share points in proportion to what each
 * sponsor allocated to that student.
 *  - Utilisation: 1 point per ₹1,000 actually paid to institutes (sponsor's share)
 *  - Students supported: +10 per fully funded student (× share)
 *  - Attendance: +2 per verified month with attendance ≥ 85% (× share)
 *  - Test improvement: +1 per percentage point gained, first to latest verified score (× share)
 *  - Results: +50 if the student qualified, +10 if they completed without qualifying (× share)
 *  - Consistency: +5 per successful SIP month, +20 for giving again in a second year
 * Example: Tata Steel funded Arjun alone (share 1). ₹19,000 paid -> 19; Arjun is
 * enrolled -> +10; total 29 -> "Supporter" (levels: 0-99, 100-499, 500+).
 * asOf (ISO) lets the Impact page draw monthly snapshots.
 */
export function donorImpactScore(s, sponsorId, asOf) {
  const cut = asOf || '9999';
  const ok = sponsorDonations(s, sponsorId).filter((d) => d.status === 'success' && d.createdAt <= cut);
  const okIds = new Set(ok.map((d) => d.id));
  const studentIds = [...new Set(ok.filter((d) => d.studentId).map((d) => d.studentId))];
  const parts = { utilisation: 0, students: 0, attendance: 0, improvement: 0, outcomes: 0, consistency: 0 };
  studentIds.forEach((sid) => {
    const lines = s.allocations.filter((a) => a.targetType === 'student' && a.targetId === sid && a.amount > 0 && a.createdAt <= cut);
    const all = lines.reduce((n, a) => n + a.amount, 0) || 1;
    const mine = lines.filter((a) => okIds.has(a.donationId)).reduce((n, a) => n + a.amount, 0);
    const share = mine / all;
    const paid = s.disbursements
      .filter((d) => d.studentId === sid && PAID.includes(d.status) && (d.paidOn || '') <= cut)
      .reduce((n, d) => n + d.amount, 0);
    parts.utilisation += (paid * share) / 1000;
    const st = getStudent(s, sid);
    if (['Fully funded', 'Enrolled', 'Completed'].includes(st?.status) && mine >= 0) {
      const raisedThen = lines.reduce((n, a) => n + a.amount, 0);
      if (raisedThen >= studentPackageTotals(s, sid).verifiedNeed) parts.students += 10 * share;
    }
    const prog = s.progress.filter((p) => p.studentId === sid && p.status === 'verified' && (!p.verifiedAt || p.verifiedAt <= cut));
    parts.attendance += prog.filter((p) => p.attendance != null && p.attendance >= 85).length * 2 * share;
    const scores = prog.filter((p) => p.numericScore != null && String(p.type || '').startsWith('Mock'));
    if (scores.length > 1) {
      const sorted = [...scores].sort((x, y) => (x.month > y.month ? 1 : -1));
      const gain = Number(sorted[sorted.length - 1].numericScore) - Number(sorted[0].numericScore);
      if (gain > 0) parts.improvement += gain * share;
    }
    if (st?.outcome && (st.outcome.at || '') <= cut) parts.outcomes += (st.outcome.qualified ? 50 : 10) * share;
  });
  parts.consistency += ok.filter((d) => d.sip).length * 5;
  const years = new Set(ok.map((d) => d.createdAt.slice(0, 4)));
  if (years.size > 1) parts.consistency += 20;
  Object.keys(parts).forEach((k) => (parts[k] = Math.floor(parts[k])));
  const score = Object.values(parts).reduce((a, b) => a + b, 0);
  const level = [...IMPACT_LEVELS].reverse().find((l) => score >= l.min).label;
  const next = IMPACT_LEVELS.find((l) => l.min > score);
  return { score, level, parts, nextLevel: next ? next.label : null, toNext: next ? next.min - score : 0 };
}

/** Month-end impact snapshots for the trend chart. */
export function impactTrend(s, sponsorId, months = 6, end = new Date()) {
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(end.getFullYear(), end.getMonth() - (months - 1 - i) + 1, 0, 23, 59, 59);
    const asOf = i === months - 1 ? undefined : d.toISOString();
    return { label: d.toLocaleString('en-IN', { month: 'short' }), score: donorImpactScore(s, sponsorId, asOf).score };
  });
}

/** Students this sponsor has funded (sponsor-safe views). */
export function sponsorStudents(s, sponsorId) {
  const ids = [...new Set(sponsorDonations(s, sponsorId).filter((d) => d.status === 'success' && d.studentId).map((d) => d.studentId))];
  return ids.map((id) => publicStudent(s, id)).filter(Boolean);
}

/** Can this sponsor act publicly / use private products / get CSR certificates? */
export const sponsorVerified = (sp) => sp && (sp.kycStatus === 'verified' || sp.kycStatus === 'not_required');

/** Next SIP debit date (ISO) from the mandate day. */
export function nextSipDate(sip, today = new Date()) {
  if (!sip || sip.status !== 'active') return null;
  let d = new Date(today.getFullYear(), today.getMonth(), sip.day);
  if (d <= today) d = new Date(today.getFullYear(), today.getMonth() + 1, sip.day);
  return d.toISOString();
}

// --- Admin -------------------------------------------------------------------
export function pendingCountsForAdmin(s) {
  const now = Date.now();
  return {
    unassigned: s.reviews.filter((r) => !r.verifierId && !r.recommendation).length,
    overdue: s.reviews.filter((r) => r.verifierId && !r.recommendation && r.slaDueAt && new Date(r.slaDueAt).getTime() < now).length,
    awaitingDecision: s.reviews.filter((r) => {
      const st = getStudent(s, r.studentId);
      return r.recommendation && !!st && (st.status === 'Under verification' || (st.status === 'Rejected' && st.rejectedByVerifier));
    }).length,
    extras: s.packages.reduce((n, p) => n + p.extras.filter((e) => e.state === 'needs_review' && !e.excluded).length, 0),
    sponsorKyc: s.sponsors.filter((sp) => sp.kycStatus === 'pending').length,
    mismatches: s.reconciliation.filter((r) => r.state === 'mismatch').length,
    reconPending: s.reconciliation.filter((r) => r.state === 'pending').length,
    payoutsAwaitingTrustee: s.disbursements.filter((d) => d.status === 'pending_trustee').length,
    thankYouNotes: (s.thankYouNotes || []).filter((t) => t.state === 'pending').length,
    instituteApprovals: s.catalogue.institutes.filter((i) => i.approvalStatus === 'pending').length,
  };
}

export const notificationsFor = (s, userId) =>
  s.notifications
    .filter((n) => n.userId === userId)
    .map((n) => ({ ...n, time: n.time || (n.at ? timeAgo(n.at) : '') }));

/** Sponsor-safe view of a student: first name + initial, bands only. */
export function publicStudent(s, studentId) {
  const st = getStudent(s, studentId);
  if (!st) return null;
  const m = Number(st.class10Marks);
  const band = m >= 90 ? '90–100%' : m >= 80 ? '80–90%' : m >= 70 ? '70–80%' : '60–70%';
  const course = getCourse(s, st.courseId);
  return {
    id: st.id,
    displayName: firstNameInitial(st.fullName),
    studentClass: st.studentClass,
    state: st.state,
    district: st.district,
    exam: st.exam,
    institute: getInstitute(s, st.instituteId)?.name,
    course: course?.name,
    marksBand: band,
    incomeBand: st.incomeBand,
    story: st.sop,
    status: st.status,
    initials: (st.fullName || '').split(/\s+/).map((x) => x[0]).slice(0, 2).join('').toUpperCase(),
    // Photo is shown to sponsors only when the guardian allowed it.
    hasPhoto: !!getGuardian(s, studentId)?.photoConsent,
    need: studentPackageTotals(s, studentId).verifiedNeed,
    raised: studentRaised(s, studentId),
    remaining: studentRemainingNeed(s, studentId),
    percent: studentFundingPercent(s, studentId),
  };
}

// --- Part 2: student-side helpers ----------------------------------------------
export const CONSENT_LINK_HOURS = 48;

/** Pending links older than 48 hours show as expired. */
export function effectiveConsentState(guardian, nowMs = Date.now()) {
  if (!guardian) return 'not_sent';
  if (guardian.consentState === 'pending' && guardian.consentSentAt) {
    const age = nowMs - new Date(guardian.consentSentAt).getTime();
    if (age > CONSENT_LINK_HOURS * 3600000) return 'expired';
  }
  return guardian.consentState;
}

export const CHECKLIST_KEYS = ['docsMatch', 'incomeOk', 'marksOk', 'guardianCalled', 'studentCalled', 'noDuplicate'];

/** Latest review for the student: verifier, checks done, SLA date. */
export function verificationProgress(s, studentId) {
  const reviews = s.reviews.filter((r) => r.studentId === studentId);
  const review = reviews.find((r) => !r.decidedAt) || reviews[reviews.length - 1] || null;
  if (!review) return null;
  const done = CHECKLIST_KEYS.filter((k) => review.checklist && review.checklist[k]).length;
  const verifier = review.verifierId ? getUser(s, review.verifierId) : null;
  return {
    review,
    done,
    total: CHECKLIST_KEYS.length,
    verifierFirst: verifier ? verifier.name.split(' ')[0] : null,
    dueAt: review.slaDueAt,
  };
}

/** Next unpaid instalment and its payout record, if any. */
export function nextInstalment(s, studentId) {
  const st = getStudent(s, studentId);
  const course = st && getCourse(s, st.courseId);
  if (!course) return null;
  const ds = s.disbursements.filter((d) => d.studentId === studentId && d.status !== 'rejected');
  const paidNos = ds.filter((d) => ['paid', 'confirmed'].includes(d.status)).map((d) => d.instalmentNo);
  const inst = course.instalments.find((i) => !paidNos.includes(i.no));
  const lastPaid = ds.filter((d) => ['paid', 'confirmed'].includes(d.status)).sort((a, b) => (a.paidOn < b.paidOn ? 1 : -1))[0] || null;
  if (!inst) return { instalment: null, disbursement: null, allPaid: true, paidCount: paidNos.length, total: course.instalments.length, lastPaid };
  return {
    lastPaid,
    instalment: inst,
    disbursement: ds.find((d) => d.instalmentNo === inst.no) || null,
    allPaid: false,
    paidCount: paidNos.length,
    total: course.instalments.length,
  };
}

/** Monthly progress is due by the 7th. Returns the next due date and the month it covers. */
export function nextProgressDeadline(today = new Date(), day = 7) {
  let due = new Date(today.getFullYear(), today.getMonth(), day);
  if (today.getDate() > day) due = new Date(today.getFullYear(), today.getMonth() + 1, day);
  const covers = new Date(due.getFullYear(), due.getMonth() - 1, 1);
  return {
    due,
    coversLabel: covers.toLocaleString('en-IN', { month: 'long' }),
    dueLabel: `${due.getDate()} ${due.toLocaleString('en-IN', { month: 'short' })}`,
  };
}

// --- Part 8: payouts ------------------------------------------------------------------
export const OPEN_PAYOUT = ['draft', 'pending_trustee', 'approved'];
export const PAYOUT_DUE_WINDOW_DAYS = 45;

/** Balance not already promised to other open payout requests. */
export function availableForPayout(s, studentId, excludeId) {
  const reserved = s.disbursements
    .filter((d) => d.studentId === studentId && OPEN_PAYOUT.includes(d.status) && d.id !== excludeId)
    .reduce((n, d) => n + d.amount, 0);
  return studentBalance(s, studentId) - reserved;
}

/**
 * Checks shown on the payout screens (maker and checker see the same list).
 * Trigger rule: enrolled in the batch AND instalment due AND allocated balance covers it.
 * System checks: amount not above balance, institute approved with verified bank, invoice not already paid.
 * Example: Kiran K., fully funded (₹46,000 held), instalment 1 of ₹21,000 due 1 Dec -> all pass.
 *          Arjun P., instalment 2 due 15 Jan (58 days away) -> "Instalment due" fails until 1 Dec.
 */
export function payoutChecks(s, { studentId, instalmentNo, amount, instituteId, invoiceNo, excludeId }, today = new Date()) {
  const st = getStudent(s, studentId);
  const course = st && getCourse(s, st.courseId);
  const inst = course?.instalments.find((i) => i.no === Number(instalmentNo));
  const institute = getInstitute(s, instituteId || course?.instituteId);
  const available = st ? availableForPayout(s, studentId, excludeId) : 0;
  const days = inst ? Math.ceil((new Date(inst.dueDate).getTime() - today.getTime()) / 86400000) : null;
  const active = s.disbursements.filter((d) => d.id !== excludeId && !['rejected', 'failed'].includes(d.status));
  const dupInvoice = invoiceNo && active.some((d) => d.invoiceNo.trim().toLowerCase() === String(invoiceNo).trim().toLowerCase());
  const instPaid = active.some((d) => d.studentId === studentId && d.instalmentNo === Number(instalmentNo) && ['paid', 'confirmed'].includes(d.status));
  const enrolled = !!st && (st.status === 'Enrolled' || (['Fully funded', 'Partially funded'].includes(st.status) && Number(instalmentNo) === 1));
  const trigger = [
    { key: 'enrolled', label: 'Student enrolled in the batch', ok: enrolled, why: enrolled ? '' : `Current stage: ${st?.status}. The first instalment enrols a funded student.` },
    { key: 'due', label: `Instalment due (within ${PAYOUT_DUE_WINDOW_DAYS} days)`, ok: days != null && days <= PAYOUT_DUE_WINDOW_DAYS, why: inst ? (days > PAYOUT_DUE_WINDOW_DAYS ? `Due ${inst.dueDate}, ${days} days away.` : '') : 'Choose an instalment.' },
    { key: 'covered', label: 'Allocated balance covers the instalment', ok: !!inst && available >= inst.amount, why: inst && available < inst.amount ? `Held for the student ₹${available.toLocaleString('en-IN')}, instalment ₹${inst.amount.toLocaleString('en-IN')}. Top up from the pool or wait for sponsors.` : '' },
  ];
  const system = [
    { key: 'amount', label: 'Amount not above the allocated balance', ok: Number(amount) > 0 && Number(amount) <= available, why: Number(amount) > available ? `Only ₹${Math.max(0, available).toLocaleString('en-IN')} is available.` : '' },
    { key: 'institute', label: 'Institute approved with verified bank details', ok: !!institute && institute.approvalStatus === 'approved' && !!institute.bankVerified, why: institute ? (institute.approvalStatus !== 'approved' ? 'Institute is not approved.' : !institute.bankVerified ? 'Bank details not verified.' : '') : 'No institute.' },
    { key: 'invoice', label: 'Invoice not already paid', ok: !!invoiceNo && !dupInvoice && !instPaid, why: !invoiceNo ? 'Enter the invoice number.' : dupInvoice ? 'This invoice number is already on another payout.' : instPaid ? 'This instalment is already paid.' : '' },
  ];
  return { trigger, system, all: [...trigger, ...system], ok: [...trigger, ...system].every((c) => c.ok), available, instalment: inst, institute };
}
