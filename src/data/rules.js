// Business rules for Sikshit Bharat, kept in one place so they can be changed
// without hunting through screens. Runtime-editable copies live in
// `state.settings` (Admin > Settings); these are the defaults.

// --- Platform fee ----------------------------------------------------------
// Client Q&A: the 10% fee is charged ON TOP of what the donor chooses to give.
// The vendor's earlier wording said "deducted". Flip FEE_MODE to switch.
export const PLATFORM_FEE_PERCENT = 10;
export const FEE_MODES = { ON_TOP: 'ON_TOP', DEDUCTED: 'DEDUCTED' };
export const FEE_MODE = FEE_MODES.ON_TOP;

// --- Eligibility -----------------------------------------------------------
export const ELIGIBLE_CLASSES = ['11', '12', 'Dropper'];
export const INCOME_CEILING = 300000; // ₹3,00,000 a year
export const MIN_CLASS10_MARKS = 60; // percent

// --- Extras ----------------------------------------------------------------
export const EXTRA_CATEGORY_CAPS = {
  Stationery: 5000,
  Travel: 12000,
  Books: 5000,
  'Test series': 6000,
};

// --- Verification ----------------------------------------------------------
export const VERIFIER_SLA_DAYS = 3;
export const SPONSOR_KYC_TARGET_HOURS = 48;

// --- Progress --------------------------------------------------------------
export const PROGRESS_DEADLINE_DAY = 7; // monthly progress due by the 7th

// --- Student status --------------------------------------------------------
// Main ladder is STATUS_STEPS in mockData.js. Side states sit beside it.
export const SIDE_STATES = ['Rejected', 'Info requested', 'Dropped'];

// --- Sponsor types ---------------------------------------------------------
export const SPONSOR_TYPES = {
  individual: 'Individual',
  corporate: 'Corporate (CSR)',
  ngo: 'NGO / Trust',
  mp_mla: 'MP / MLA',
};
// Types that need admin document verification before their name is public,
// before cohort / constituency products, and before CSR certificates.
export const KYC_REQUIRED_TYPES = ['corporate', 'ngo', 'mp_mla'];

// --- Impact score levels ---------------------------------------------------
export const IMPACT_LEVELS = [
  { min: 0, label: 'Supporter' },
  { min: 100, label: 'Champion' },
  { min: 500, label: 'Changemaker' },
];

export const TRUST = {
  name: 'Sikshit Bharat Educational Trust',
  regNo: 'Regd. No. PAT/IV/412/2019',
  pan: 'AAKTS4821M',
  reg80G: 'AAKTS4821ME20219',
  address: '2nd Floor, Gyan Bhawan, Fraser Road, Patna 800001',
};

// Income bands shown on the Details step, with the top of each band.
export const INCOME_BANDS = [
  { label: 'Below ₹1L', max: 100000 },
  { label: '₹1–2.5L', max: 250000 },
  { label: '₹2.5–3L', max: 300000 },
  { label: '₹3–5L', max: 500000 },
  { label: 'Above ₹5L', max: Infinity },
];

/**
 * Eligibility (shown as a calm "may not be eligible" card, never a silent block).
 * Class 11, 12 or dropper; family income ≤ ceiling; Class 10 marks ≥ minimum.
 * Example: class '12', band '₹2.5–3L', marks '74' -> { ok: true, reasons: [] }
 *          class '10', band '₹3–5L', marks '55'  -> { ok: false, reasons: [3 reasons] }
 */
export function checkEligibility(student, settings = {}) {
  const ceiling = settings.incomeCeiling ?? INCOME_CEILING;
  const minMarks = settings.minClass10Marks ?? MIN_CLASS10_MARKS;
  const reasons = [];
  if (!ELIGIBLE_CLASSES.includes(String(student.studentClass)))
    reasons.push('Support is for students in Class 11, Class 12 or taking a drop year.');
  const band = INCOME_BANDS.find((b) => b.label === student.incomeBand);
  const income = student.familyIncome ?? (band ? band.max : null);
  if (band ? band.max > ceiling : income != null && income > ceiling)
    reasons.push(`Family income must be ₹${ceiling.toLocaleString('en-IN')} a year or less.`);
  const marks = parseFloat(String(student.class10Marks).replace('%', ''));
  if (Number.isNaN(marks)) reasons.push('Enter your Class 10 marks to check eligibility.');
  else if (marks < minMarks) reasons.push(`Class 10 marks must be at least ${minMarks}%.`);
  return { ok: reasons.length === 0, reasons };
}

export const ageFromDob = (dob, at = new Date()) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  let age = at.getFullYear() - d.getFullYear();
  const m = at.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < d.getDate())) age -= 1;
  return age;
};
