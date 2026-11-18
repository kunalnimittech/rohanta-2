// Pure money logic. No React, no store access; everything comes in as
// arguments so a Node/Express backend can reuse these functions unchanged.
import { PLATFORM_FEE_PERCENT, FEE_MODE, FEE_MODES } from '../data/rules';

const round = (n) => Math.round(Number(n) || 0);

/**
 * calcCheckout(amount, feePercent, feeMode)
 *
 * ON_TOP (built, per client Q&A):
 *   calcCheckout(400000, 10, 'ON_TOP')
 *   -> { amount: 400000, fee: 40000, total: 440000, toStudents: 400000 }
 *   The donor pays ₹4,40,000. ₹4,00,000 goes to students/cohort/pool and
 *   ₹40,000 is tagged "operations". The 80G receipt is for ₹4,40,000.
 *
 * DEDUCTED (alternative, one-line switch in rules.js):
 *   calcCheckout(400000, 10, 'DEDUCTED')
 *   -> { amount: 400000, fee: 40000, total: 400000, toStudents: 360000 }
 */
export function calcCheckout(
  amount,
  feePercent = PLATFORM_FEE_PERCENT,
  feeMode = FEE_MODE
) {
  const a = Math.max(0, round(amount));
  const fee = round((a * feePercent) / 100);
  if (feeMode === FEE_MODES.DEDUCTED) {
    return { amount: a, fee, total: a, toStudents: a - fee };
  }
  return { amount: a, fee, total: a + fee, toStudents: a };
}

/**
 * allocate(donation, target)
 * Turns a successful donation into ledger lines.
 *
 * donation: { id, toStudents, fee, studentId?, cohortId?, poolId? }
 * target:   { remainingNeed } when the donation is for a specific student.
 *
 * Rules:
 *  - Nobody can fund more than a student's remaining need.
 *  - Any excess goes to the general pool.
 *  - The fee always becomes an "operations" line.
 *
 * Example: remaining need ₹18,000, donor gives ₹20,000 (+₹2,000 fee)
 *   -> student ₹18,000, pool:general ₹2,000, operations ₹2,000
 */
export function allocate(donation, target = {}) {
  const lines = [];
  const toStudents = round(donation.toStudents);
  if (donation.studentId) {
    const cap = Math.max(0, round(target.remainingNeed));
    const toStudent = Math.min(toStudents, cap);
    const spill = toStudents - toStudent;
    if (toStudent > 0)
      lines.push({ targetType: 'student', targetId: donation.studentId, amount: toStudent });
    if (spill > 0)
      lines.push({ targetType: 'pool', targetId: 'general', amount: spill, note: 'Excess over remaining need' });
  } else if (donation.cohortId) {
    lines.push({ targetType: 'cohort', targetId: donation.cohortId, amount: toStudents });
  } else {
    lines.push({ targetType: 'pool', targetId: donation.poolId || 'general', amount: toStudents });
  }
  if (round(donation.fee) > 0)
    lines.push({ targetType: 'operations', targetId: 'operations', amount: round(donation.fee) });
  return lines;
}

/**
 * canDisburse({ student, instalment, balance, institute, alreadyPaid })
 * A payout is allowed only when:
 *  - the student is Enrolled (or Fully funded and joining the batch),
 *  - the instalment amount is not above the student's allocated balance,
 *  - the institute is approved with verified bank details,
 *  - the invoice / instalment has not already been paid.
 *
 * Example: balance ₹21,500, instalment ₹19,000 -> { ok: true }
 *          balance ₹12,000, instalment ₹20,000 -> { ok: false, reason: 'Allocated balance ₹12,000 is below this instalment' }
 */
export function canDisburse({ student, instalment, balance, institute, alreadyPaid }) {
  const checks = [
    {
      ok: !!student && ['Enrolled', 'Fully funded', 'Partially funded'].includes(student.status),
      reason: 'Student is not enrolled in the batch',
    },
    {
      ok: !!instalment && round(balance) >= round(instalment.amount),
      reason: `Allocated balance is below this instalment`,
    },
    {
      ok: !!institute && institute.approvalStatus === 'approved' && institute.bankVerified,
      reason: 'Institute is not approved or bank details are not verified',
    },
    { ok: !alreadyPaid, reason: 'This invoice has already been paid' },
  ];
  const failed = checks.find((c) => !c.ok);
  return { ok: !failed, reason: failed ? failed.reason : null, checks };
}

/**
 * Package maths.
 * total       = course fee + approved extras (rejected / excluded / needs_review are left out)
 * verifiedNeed = total − discount − family contribution
 * monthlyNeed = total / course months
 *
 * Example: fee ₹40,000 + Stationery ₹3,000 + Travel ₹5,000 = ₹48,000;
 *          12 months -> ₹4,000 a month.
 */
export function packageTotals(pkg, durationMonths = 12) {
  const extras = (pkg.extras || []).filter(
    (e) => !e.excluded && e.state !== 'rejected' && e.state !== 'needs_review'
  );
  const extrasTotal = extras.reduce((s, e) => s + round(e.amount), 0);
  const total = round(pkg.courseFee) + extrasTotal;
  const verifiedNeed = Math.max(0, total - round(pkg.discount) - round(pkg.familyContribution));
  const monthlyNeed = durationMonths > 0 ? Math.round(total / durationMonths) : total;
  return { extrasTotal, total, verifiedNeed, monthlyNeed };
}
