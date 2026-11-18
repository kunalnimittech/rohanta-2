export const formatINR = (amount) => {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

export const STATUS_STEPS = [
  'Draft',
  'Consent pending',
  'Under verification',
  'Listed',
  'Partially funded',
  'Fully funded',
  'Enrolled',
  'Completed',
];

export const APP_STEPS = [
  { id: 'details', label: 'Details' },
  { id: 'guardian', label: 'Guardian' },
  { id: 'documents', label: 'Documents' },
  { id: 'course', label: 'Course' },
  { id: 'package', label: 'Package' },
  { id: 'review', label: 'Review' },
];

export const INITIAL_STUDENT = {
  id: 'SB-2026-004521',
  fullName: 'Priya Kumari',
  initials: 'PK',
  dob: '2010-04-12',
  age: 16,
  gender: 'Female',
  mobile: '+91 98765 43210',
  email: 'priya.kumari2010@example.in',
  state: 'Bihar',
  district: 'Patna',
  school: 'Kendriya Vidyalaya, Kankarbagh',
  board: 'CBSE',
  studentClass: '11',
  class10Marks: '92',
  incomeBand: '₹1–2.5L',
  sop: 'I scored 92% in Class 10 CBSE and aim to study Computer Science at an NIT or IIT. My father works as an electrician and our family income makes coaching fees difficult to afford. With structured guidance at Vidya Coaching Centre, I am committed to working hard and mentoring younger girls from my neighbourhood in Patna.',
};

export const INITIAL_GUARDIAN = {
  name: 'Sunita Devi',
  relation: 'Mother',
  mobile: '+91 98XXX XX210',
  email: 'sunita.devi@example.in',
  consentState: 'pending', // 'pending' | 'approved' | 'declined' | 'expired'
  approvedDate: '14 Nov 2026',
};

export const INITIAL_DOCUMENTS = [
  {
    id: 'class10',
    name: 'Class 10 marksheet',
    status: 'verified',
    detail: 'CBSE · 92% verified via DigiLocker',
  },
  {
    id: 'aadhaar',
    name: 'Aadhaar (last 4: 1234)',
    status: 'verified',
    detail: 'Identity & age verified',
  },
  {
    id: 'income',
    name: 'Income certificate',
    status: 'pending',
    detail: 'Under review by trust officer',
  },
  {
    id: 'school_id',
    name: 'School ID / Bonafide',
    status: 'uploaded',
    detail: 'Uploaded · Pending check',
  },
  {
    id: 'photo',
    name: 'Passport photo',
    status: 'rejected',
    detail: 'Photo is blurry',
  },
  {
    id: 'caste_ews',
    name: 'Caste / EWS certificate (optional)',
    status: 'not_uploaded',
    detail: 'Optional supporting document',
  },
];

export const INSTITUTES = [
  {
    id: 'vidya-patna',
    name: 'Vidya Coaching Centre',
    city: 'Patna',
    mode: 'Offline · Classroom',
    rating: '4.8',
    exams: ['JEE', 'NEET'],
  },
  {
    id: 'sankalp-patna',
    name: 'Sankalp Academy',
    city: 'Patna',
    mode: 'Hybrid',
    rating: '4.7',
    exams: ['JEE', 'CUET'],
  },
  {
    id: 'nalanda-scholars',
    name: 'Nalanda Scholars Institute',
    city: 'Patna',
    mode: 'Offline · Classroom',
    rating: '4.6',
    exams: ['NEET', 'CUET'],
  },
  {
    id: 'prayas-kota',
    name: 'Prayas Learning Hub',
    city: 'Online · Live',
    mode: 'Online',
    rating: '4.7',
    exams: ['JEE', 'NEET', 'CUET'],
  },
];

export const COURSES = [
  {
    id: 'jee-12m',
    instituteId: 'vidya-patna',
    exam: 'JEE',
    name: '12-month JEE Foundation batch',
    duration: '12 months',
    startDate: '1 Dec 2026',
    fee: 40000,
  },
  {
    id: 'jee-24m',
    instituteId: 'vidya-patna',
    exam: 'JEE',
    name: '24-month JEE Integrated batch',
    duration: '24 months',
    startDate: '15 Dec 2026',
    fee: 72000,
  },
  {
    id: 'neet-12m',
    instituteId: 'vidya-patna',
    exam: 'NEET',
    name: '12-month NEET UG Target batch',
    duration: '12 months',
    startDate: '1 Dec 2026',
    fee: 42000,
  },
  {
    id: 'cuet-6m',
    instituteId: 'sankalp-patna',
    exam: 'CUET',
    name: '6-month CUET Science & General',
    duration: '6 months',
    startDate: '10 Jan 2027',
    fee: 18000,
  },
];

export const INITIAL_EXTRAS = [
  {
    id: 'ext-1',
    category: 'Stationery',
    amount: 3000,
    reason: 'Notebooks, graph sheets & test series printouts',
    state: 'normal', // 'normal' | 'needs_review' | 'rejected'
  },
  {
    id: 'ext-2',
    category: 'Travel',
    amount: 5000,
    reason: 'Monthly bus pass to Boring Road centre',
    state: 'normal',
  },
  {
    id: 'ext-3',
    category: 'Books',
    amount: 1800,
    reason: 'Reference problem sets (physics & organic chemistry)',
    state: 'needs_review',
    excluded: true,
  },
];

export const INITIAL_CONTRIBUTIONS = [
  {
    id: 'c1',
    date: '14 Nov 2026',
    sponsor: 'Tata Steel',
    type: 'CSR',
    amount: 15000,
  },
  {
    id: 'c2',
    date: '11 Nov 2026',
    sponsor: 'Anand S.',
    type: 'Individual',
    amount: 10000,
  },
  {
    id: 'c3',
    date: '08 Nov 2026',
    sponsor: 'Anonymous sponsor',
    type: 'Individual',
    amount: 5000,
  },
];

export const INITIAL_PROGRESS_RECORDS = [
  {
    id: 'p1',
    month: 'October 2026',
    type: 'Mock test 4',
    score: '184 / 300',
    numericScore: 61,
    status: 'pending',
    remark: 'Awaiting coaching centre verification',
  },
  {
    id: 'p2',
    month: 'September 2026',
    type: 'Mock test 3',
    score: '198 / 300',
    numericScore: 66,
    status: 'verified',
    remark: 'Steady improvement in Electrostatics',
  },
  {
    id: 'p3',
    month: 'August 2026',
    type: 'Attendance August',
    score: '92%',
    numericScore: 58,
    status: 'verified',
    remark: '23 of 25 classes attended',
  },
  {
    id: 'p4',
    month: 'July 2026',
    type: 'Mock test 1',
    score: '162 / 300',
    numericScore: 54,
    status: 'verified',
    remark: 'Baseline diagnostic test',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    category: 'Funding',
    title: 'A sponsor contributed ₹10,000',
    detail: 'Anand S. contributed toward your Vidya Coaching Centre package.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'n2',
    category: 'Documents',
    title: 'Income certificate accepted',
    detail: 'Your district income certificate has been reviewed by our trust team.',
    time: 'Yesterday',
    unread: true,
  },
  {
    id: 'n3',
    category: 'Documents',
    title: 'Please upload a clearer photo',
    detail: 'Your passport photo was marked blurry. Re-upload a sharp portrait.',
    time: '2 days ago',
    unread: true,
  },
  {
    id: 'n4',
    category: 'Progress',
    title: 'October attendance reminder',
    detail: 'Upload your October attendance screenshot before 5 Nov.',
    time: '4 days ago',
    unread: false,
  },
  {
    id: 'n5',
    category: 'Funding',
    title: 'Tata Steel CSR contributed ₹15,000',
    detail: 'Your application reached 52% of its ₹48,000 goal.',
    time: '6 days ago',
    unread: false,
  },
];

// ===========================================================================
// PART 1 SEEDS — normalised data for every role. Existing exports above are
// unchanged; the store builds its first state from buildSeedState().
// ===========================================================================
import {
  PLATFORM_FEE_PERCENT,
  FEE_MODE,
  INCOME_CEILING,
  MIN_CLASS10_MARKS,
  EXTRA_CATEGORY_CAPS,
  VERIFIER_SLA_DAYS,
} from './rules';

export const PRIYA_ID = INITIAL_STUDENT.id;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// '2026-11-08' -> '08 Nov 2026'
export const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const formatShortDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const monthLabel = (iso) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
};
export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(iso);
};
// 'Priya Kumari' -> 'Priya K.' (sponsors never see a full surname)
export const firstNameInitial = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] || '';
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};
export const initialsOf = (name = '') =>
  name
    .replace(/[^A-Za-z\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

// --- Demo accounts (Login > Demo accounts, and the demo switcher) ----------
export const DEMO_ACCOUNTS = [
  { email: 'priya.kumari2010@example.in', userId: 'u-stu-priya', role: 'student', label: 'Student', name: 'Priya Kumari' },
  { email: 'sunita.devi@example.in', userId: 'u-gdn-sunita', role: 'guardian', label: 'Guardian', name: 'Sunita Devi' },
  { email: 'admin@sikshitbharat.org', userId: 'u-admin', role: 'admin', label: 'Admin', name: 'Neha Agarwal' },
  { email: 'verifier1@sikshitbharat.org', userId: 'u-ver-rakesh', role: 'verifier', label: 'Verifier', name: 'Rakesh Sinha' },
  { email: 'anand.s@example.in', userId: 'u-sp-anand', role: 'sponsor', label: 'Individual sponsor', name: 'Anand S.' },
  { email: 'csr@tatasteel.example', userId: 'u-sp-tata', role: 'sponsor', label: 'Corporate (CSR) sponsor', name: 'Tata Steel CSR' },
  { email: 'trustee@sikshitbharat.org', userId: 'u-trustee', role: 'trustee', label: 'Trustee', name: 'Dr. Ramesh N. Prasad' },
  { email: 'finance@sikshitbharat.org', userId: 'u-finance', role: 'finance', label: 'Finance', name: 'Vikas Choudhary' },
  { email: 'accounts@vidyacoaching.example', userId: 'u-inst-vidya', role: 'institute', label: 'Institute', name: 'Vidya Coaching Centre' },
];

// Extra switcher entries (not on the login sheet) so every sponsor type is reachable.
export const DEMO_SWITCH_EXTRA = [
  { userId: 'u-sp-janseva', role: 'sponsor', label: 'NGO / Trust sponsor', name: 'Jan Seva Trust' },
  { userId: 'u-sp-mp', role: 'sponsor', label: 'MP / MLA sponsor', name: 'Office of the MP, Patna Sahib' },
  { userId: 'u-sp-meridian', role: 'sponsor', label: 'Corporate sponsor, KYC pending', name: 'Meridian Pharma Ltd' },
];

// --- Catalogue -------------------------------------------------------------
const isoDay = (x) =>
  `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;

const instalmentsFor = (fee, months, start) => {
  const count = months >= 24 ? 4 : months >= 12 ? 2 : 1;
  const step = Math.floor(months / count);
  const base = Math.floor(fee / count / 100) * 100;
  const s = new Date(start);
  return Array.from({ length: count }, (_, i) => ({
    no: i + 1,
    dueDate: isoDay(new Date(s.getFullYear(), s.getMonth() + i * step, s.getDate())),
    amount: i === count - 1 ? fee - base * (count - 1) : base,
  }));
};

const INSTITUTE_EXTRA = {
  'vidya-patna': { legalType: 'Private Limited', gst: '10AAGCV2231K1Z5', pan: 'AAGCV2231K', contactPerson: 'Manoj Tiwari', email: 'accounts@vidyacoaching.example', mobile: '+91 94310 22118', address: 'Boring Road, Patna 800001', branches: ['Boring Road', 'Kankarbagh'], years: 14, bank: { name: 'State Bank of India', account: 'XXXXXX4417', ifsc: 'SBIN0003111' } },
  'sankalp-patna': { legalType: 'Partnership', gst: '10ABNFS7781E1Z2', pan: 'ABNFS7781E', contactPerson: 'Ritu Sharma', email: 'office@sankalpacademy.example', mobile: '+91 93341 50762', address: 'Ashok Rajpath, Patna 800004', branches: ['Ashok Rajpath'], years: 9, bank: { name: 'HDFC Bank', account: 'XXXXXX9032', ifsc: 'HDFC0001248' } },
  'nalanda-scholars': { legalType: 'Society', gst: '10AAATN5520Q1ZK', pan: 'AAATN5520Q', contactPerson: 'Dr. Alok Ranjan', email: 'admin@nalandascholars.example', mobile: '+91 90061 44380', address: 'Rajendra Nagar, Patna 800016', branches: ['Rajendra Nagar'], years: 11, bank: { name: 'Bank of Baroda', account: 'XXXXXX2265', ifsc: 'BARB0PATNAX' } },
  'prayas-kota': { legalType: 'Private Limited', gst: '08AAHCP6612L1ZQ', pan: 'AAHCP6612L', contactPerson: 'Suresh Jain', email: 'partners@prayaslearning.example', mobile: '+91 98290 61174', address: 'Talwandi, Kota 324005', branches: ['Online'], years: 6, bank: { name: 'ICICI Bank', account: 'XXXXXX7710', ifsc: 'ICIC0000412' } },
};

export const CATALOGUE_EXAMS = [
  { id: 'JEE', name: 'JEE Main & Advanced', subjects: ['Physics', 'Chemistry', 'Maths'] },
  { id: 'NEET', name: 'NEET UG', subjects: ['Physics', 'Chemistry', 'Biology'] },
  { id: 'CUET', name: 'CUET UG', subjects: ['English', 'General Test', 'Domain subject 1', 'Domain subject 2'] },
];

export const CATALOGUE_INSTITUTES = [
  ...INSTITUTES.map((i) => ({ ...i, approvalStatus: 'approved', bankVerified: true, mouAccepted: true, ...INSTITUTE_EXTRA[i.id] })),
  {
    id: 'shikshapath-ranchi', name: 'Shiksha Path Academy', city: 'Ranchi', mode: 'Offline · Classroom', rating: '4.5', exams: ['NEET', 'JEE'],
    approvalStatus: 'pending', bankVerified: false, mouAccepted: true, legalType: 'Proprietorship', gst: '20AQPPK4410H1ZT', pan: 'AQPPK4410H',
    contactPerson: 'Kamal Kishore', email: 'info@shikshapath.example', mobile: '+91 94700 31852', address: 'Lalpur Chowk, Ranchi 834001', branches: ['Lalpur'], years: 5,
    bank: { name: 'Punjab National Bank', account: 'XXXXXX5531', ifsc: 'PUNB0221300' }, submittedAt: '2026-11-15T10:20:00',
  },
  {
    id: 'aravali-jaipur', name: 'Aravali Coaching Classes', city: 'Jaipur', mode: 'Hybrid', rating: '4.4', exams: ['JEE'],
    approvalStatus: 'pending', bankVerified: false, mouAccepted: false, legalType: 'LLP', gst: '08AAQFA9021C1Z9', pan: 'AAQFA9021C',
    contactPerson: 'Neeraj Saini', email: 'hello@aravalicoaching.example', mobile: '+91 94140 77215', address: 'Gopalpura Bypass, Jaipur 302018', branches: ['Gopalpura'], years: 7,
    bank: { name: 'Axis Bank', account: 'XXXXXX0884', ifsc: 'UTIB0000561' }, submittedAt: '2026-11-17T16:05:00',
  },
];

const COURSE_EXTRA = {
  'jee-12m': { durationMonths: 12, mode: 'Classroom', medium: 'Hindi + English', start: '2026-12-01' },
  'jee-24m': { durationMonths: 24, mode: 'Classroom', medium: 'Hindi + English', start: '2026-12-15' },
  'neet-12m': { durationMonths: 12, mode: 'Classroom', medium: 'Hindi + English', start: '2026-12-01' },
  'cuet-6m': { durationMonths: 6, mode: 'Hybrid', medium: 'English', start: '2027-01-10' },
};

const NEW_COURSES = [
  { id: 'sankalp-jee-12m', instituteId: 'sankalp-patna', exam: 'JEE', name: '12-month JEE Main + Advanced batch', fee: 38000, durationMonths: 12, mode: 'Hybrid', medium: 'English', start: '2026-07-15' },
  { id: 'nalanda-neet-12m', instituteId: 'nalanda-scholars', exam: 'NEET', name: '12-month NEET Achiever batch', fee: 45000, durationMonths: 12, mode: 'Classroom', medium: 'Hindi + English', start: '2026-12-05' },
  { id: 'nalanda-cuet-6m', instituteId: 'nalanda-scholars', exam: 'CUET', name: '6-month CUET Humanities & Commerce', fee: 16000, durationMonths: 6, mode: 'Classroom', medium: 'Hindi', start: '2027-01-05' },
  { id: 'prayas-jee-12m', instituteId: 'prayas-kota', exam: 'JEE', name: '12-month JEE Live Online', fee: 24000, durationMonths: 12, mode: 'Online', medium: 'Hindi + English', start: '2026-12-10' },
  { id: 'prayas-neet-12m', instituteId: 'prayas-kota', exam: 'NEET', name: '12-month NEET Live Online', fee: 26000, durationMonths: 12, mode: 'Online', medium: 'Hindi + English', start: '2026-12-10' },
  { id: 'prayas-cuet-6m', instituteId: 'prayas-kota', exam: 'CUET', name: '6-month CUET Live Online', fee: 12000, durationMonths: 6, mode: 'Online', medium: 'English', start: '2027-01-12' },
  { id: 'shikshapath-neet-12m', instituteId: 'shikshapath-ranchi', exam: 'NEET', name: '12-month NEET Foundation Plus', fee: 39000, durationMonths: 12, mode: 'Classroom', medium: 'Hindi', start: '2027-01-02' },
  { id: 'aravali-jee-12m', instituteId: 'aravali-jaipur', exam: 'JEE', name: '12-month JEE Target batch', fee: 41000, durationMonths: 12, mode: 'Hybrid', medium: 'Hindi + English', start: '2027-01-04' },
];

const withSchedule = (c) => {
  const d = new Date(c.start);
  const end = new Date(d.getFullYear(), d.getMonth() + c.durationMonths, d.getDate() - 1);
  return {
    duration: `${c.durationMonths} months`,
    startDate: `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
    ...c,
    discount: 0,
    batches: [
      { id: `${c.id}-b1`, start: c.start, end: isoDay(end), branch: (INSTITUTE_EXTRA[c.instituteId]?.branches || ['Main'])[0], seats: 60 },
    ],
    instalments: instalmentsFor(c.fee, c.durationMonths, c.start),
  };
};

export const CATALOGUE_COURSES = [
  ...COURSES.map((c) => withSchedule({ ...c, ...COURSE_EXTRA[c.id] })),
  ...NEW_COURSES.map(withSchedule),
];

// --- People ----------------------------------------------------------------
// [id suffix, name, gender, dob, state, district, class, class10 %, family income, status, courseId]
const STUDENT_ROWS = [
  ['004521', 'Priya Kumari', 'Female', '2010-04-12', 'Bihar', 'Patna', '11', '92', 160000, 'Partially funded', 'jee-12m'],
  ['004602', 'Aman Raj', 'Male', '2009-09-03', 'Bihar', 'Gaya', '12', '78', 210000, 'Draft', null],
  ['004611', 'Sneha Kumari', 'Female', '2010-01-22', 'Jharkhand', 'Ranchi', '11', '84', 180000, 'Draft', null],
  ['004587', 'Rahul Yadav', 'Male', '2009-06-15', 'Uttar Pradesh', 'Varanasi', '12', '81', 240000, 'Consent pending', 'jee-24m'],
  ['004593', 'Anjali Mahato', 'Female', '2010-03-08', 'Jharkhand', 'Dhanbad', '11', '88', 150000, 'Consent pending', 'neet-12m'],
  ['004550', 'Saurabh Kumar', 'Male', '2009-11-30', 'Bihar', 'Muzaffarpur', '12', '86', 195000, 'Under verification', 'nalanda-neet-12m'],
  ['004558', 'Laxmi Majhi', 'Female', '2010-02-17', 'Odisha', 'Mayurbhanj', '11', '79', 120000, 'Under verification', 'prayas-neet-12m'],
  ['004571', 'Mohit Meena', 'Male', '2008-12-05', 'Rajasthan', 'Jaipur', 'Dropper', '74', 260000, 'Under verification', 'prayas-jee-12m'],
  ['004498', 'Ritika Singh', 'Female', '2009-08-19', 'Uttar Pradesh', 'Gorakhpur', '12', '90', 170000, 'Listed', 'nalanda-neet-12m'],
  ['004503', 'Deepak Oraon', 'Male', '2009-05-27', 'Jharkhand', 'Ranchi', '12', '83', 140000, 'Listed', 'cuet-6m'],
  ['004476', 'Kiran Kumari', 'Female', '2009-10-11', 'Bihar', 'Gaya', '12', '89', 135000, 'Fully funded', 'neet-12m'],
  ['004455', 'Arjun Prajapati', 'Male', '2009-04-02', 'Uttar Pradesh', 'Varanasi', '12', '91', 190000, 'Enrolled', 'sankalp-jee-12m'],
];

const SCHOOLS = {
  Patna: 'Kendriya Vidyalaya, Kankarbagh', Gaya: 'Zila School, Gaya', Ranchi: 'Jawahar Vidya Mandir, Shyamali',
  Varanasi: 'Queen’s College, Varanasi', Dhanbad: 'DAV Public School, Hirak', Muzaffarpur: 'Govt. Inter College, Muzaffarpur',
  Mayurbhanj: 'Govt. High School, Baripada', Jaipur: 'Govt. Sr. Sec. School, Malviya Nagar', Gorakhpur: 'Maharana Pratap Inter College',
};

const SOPS = {
  'Aman Raj': 'My father runs a small tea stall near Gaya junction. I want to become a civil engineer and build better roads for my district.',
  'Sneha Kumari': 'I want to be the first doctor in my family. I study late after helping my mother with her tailoring work.',
  'Rahul Yadav': 'I teach maths to younger children in my mohalla. A good JEE rank will help me study at an IIT and support my parents.',
  'Anjali Mahato': 'My mother is an anganwadi worker. Watching her care for mothers and babies made me want to study medicine.',
  'Saurabh Kumar': 'I lost my father two years ago. My uncle supports our family, and I want to repay him by becoming a doctor.',
  'Laxmi Majhi': 'I come from a Santhal village near Baripada. Online classes let me prepare for NEET without leaving my younger sisters.',
  'Mohit Meena': 'I missed JEE by a few marks last year. I am taking a drop year and need structured guidance to clear it.',
  'Ritika Singh': 'I scored 90% in Class 10 and want to study MBBS. My father is a daily-wage mason in Gorakhpur.',
  'Deepak Oraon': 'I want to study economics at Delhi University and come back to work on tribal livelihoods in Jharkhand.',
  'Kiran Kumari': 'I am the eldest of four sisters. Becoming a doctor will change what people in my village think girls can do.',
  'Arjun Prajapati': 'My family makes clay pots in Varanasi. I love physics and want to study at IIT BHU, close to home.',
};

const GUARDIAN_ROWS = {
  '004521': ['Sunita Devi', 'Mother', '+91 98XXX XX210', 'sunita.devi@example.in'],
  '004602': ['Ramesh Prasad', 'Father', '+91 99XXX XX431', 'ramesh.p@example.in'],
  '004611': ['Usha Devi', 'Mother', '+91 87XXX XX902', 'usha.devi@example.in'],
  '004587': ['Shyam Lal Yadav', 'Father', '+91 94XXX XX118', 'shyamlal.y@example.in'],
  '004593': ['Meena Mahato', 'Mother', '+91 70XXX XX655', 'meena.m@example.in'],
  '004550': ['Vinod Kumar', 'Uncle', '+91 91XXX XX207', 'vinod.k@example.in'],
  '004558': ['Basanti Majhi', 'Mother', '+91 63XXX XX481', 'basanti.m@example.in'],
  '004571': ['Hari Ram Meena', 'Father', '+91 98XXX XX734', 'hariram.m@example.in'],
  '004498': ['Ajay Singh', 'Father', '+91 99XXX XX562', 'ajay.singh@example.in'],
  '004503': ['Phulmani Oraon', 'Mother', '+91 82XXX XX319', 'phulmani.o@example.in'],
  '004476': ['Rekha Devi', 'Mother', '+91 90XXX XX845', 'rekha.devi@example.in'],
  '004455': ['Mukesh Prajapati', 'Father', '+91 95XXX XX673', 'mukesh.p@example.in'],
};

const EXTRAS_BY_STUDENT = {
  '004587': [{ id: 'ext-r1', category: 'Test series', amount: 4500, reason: 'All-India mock test series for JEE Main', state: 'needs_review' }],
  '004593': [{ id: 'ext-an1', category: 'Travel', amount: 6000, reason: 'Bus fare Hirak to Bank More centre', state: 'needs_review' }],
  '004550': [{ id: 'ext-s1', category: 'Books', amount: 3500, reason: 'NCERT exemplar and Biology reference books', state: 'needs_review' }],
  '004558': [{ id: 'ext-l1', category: 'Stationery', amount: 2000, reason: 'Notebooks and a tablet stand for online classes', state: 'normal' }],
  '004498': [{ id: 'ext-ri1', category: 'Travel', amount: 6000, reason: 'Auto fare to Rajendra Nagar hostel', state: 'normal' }],
  '004503': [{ id: 'ext-d1', category: 'Books', amount: 2000, reason: 'Economics and English reference books', state: 'normal' }],
  '004476': [{ id: 'ext-k1', category: 'Travel', amount: 4000, reason: 'Monthly bus pass Gaya to Patna', state: 'normal' }],
  '004455': [{ id: 'ext-a1', category: 'Stationery', amount: 2500, reason: 'Notebooks, graph sheets and calculator', state: 'normal' }],
};

const VERIFIERS = [
  { id: 'u-ver-rakesh', name: 'Rakesh Sinha', email: 'verifier1@sikshitbharat.org', mobile: '+91 94311 20871', districts: ['Patna', 'Gaya', 'Muzaffarpur'] },
  { id: 'u-ver-meena', name: 'Meena Kumari', email: 'verifier2@sikshitbharat.org', mobile: '+91 94312 66104', districts: ['Ranchi', 'Dhanbad', 'Jamshedpur'] },
  { id: 'u-ver-imran', name: 'Imran Ansari', email: 'verifier3@sikshitbharat.org', mobile: '+91 94150 38842', districts: ['Varanasi', 'Gorakhpur', 'Lucknow'] },
  { id: 'u-ver-pooja', name: 'Pooja Verma', email: 'verifier4@sikshitbharat.org', mobile: '+91 94370 51129', districts: ['Mayurbhanj', 'Cuttack', 'Jaipur'] },
];

const SPONSORS = [
  { id: 'sp-anand', leaderboardOptIn: true, userId: 'u-sp-anand', type: 'individual', displayName: 'Anand S.', public: true, pan: 'ABCPS1234K', email: 'anand.s@example.in', mobile: '+91 98110 45521', address: 'Indiranagar, Bengaluru 560038', kycStatus: 'not_required', commsConsent: true, joinedAt: '2026-06-10' },
  { id: 'sp-kavita', leaderboardOptIn: true, userId: 'u-sp-kavita', type: 'individual', displayName: 'Kavita Iyer', public: true, pan: 'AHKPI7720B', email: 'kavita.iyer@example.in', mobile: '+91 98200 71634', address: 'Powai, Mumbai 400076', kycStatus: 'not_required', commsConsent: true, joinedAt: '2026-08-01' },
  { id: 'sp-rohit', leaderboardOptIn: false, userId: 'u-sp-rohit', type: 'individual', displayName: 'Rohit Agarwal', public: false, pan: 'BDXPA3391C', email: 'rohit.agarwal@example.in', mobile: '+91 99300 18842', address: 'Salt Lake, Kolkata 700091', kycStatus: 'not_required', commsConsent: false, joinedAt: '2026-09-12' },
  { id: 'sp-farah', leaderboardOptIn: false, userId: 'u-sp-farah', type: 'individual', displayName: 'Farah Siddiqui', public: true, pan: 'CQRPS5518D', email: 'farah.s@example.in', mobile: '+91 98450 22977', address: 'Aliganj, Lucknow 226024', kycStatus: 'not_required', commsConsent: true, joinedAt: '2026-07-01', sip: { amount: 2000, day: 5, status: 'active', startedAt: '2026-07-05' } },
  { id: 'sp-tata', leaderboardOptIn: true, userId: 'u-sp-tata', type: 'corporate', displayName: 'Tata Steel', public: true, pan: 'AAACT2803M', email: 'csr@tatasteel.example', mobile: '+91 65766 41100', kycStatus: 'verified', kycSubmittedAt: '2026-06-02T11:00:00', kycVerifiedAt: '2026-06-03T15:30:00', joinedAt: '2026-06-02',
    org: { name: 'Tata Steel Limited (CSR)', cin: 'L27100MH1907PLC000260', gstin: '20AAACT2803M1ZK', registeredAddress: 'Bistupur, Jamshedpur 831001', signatory: 'Anita Rao', designation: 'Head, CSR', csrNo: 'CSR00000117', committeeRef: 'CSRC/2026-27/14', preferredStates: ['Bihar', 'Jharkhand', 'Odisha'], preferredExams: ['NEET', 'JEE'] } },
  { id: 'sp-meridian', leaderboardOptIn: false, userId: 'u-sp-meridian', type: 'corporate', displayName: 'Meridian Pharma Ltd', public: false, pan: 'AAFCM6627P', email: 'csr@meridianpharma.example', mobile: '+91 22 4411 7300', kycStatus: 'pending', kycSubmittedAt: '2026-11-17T09:40:00', joinedAt: '2026-11-17',
    org: { name: 'Meridian Pharma Ltd', cin: 'U24230MH2004PLC148812', gstin: '27AAFCM6627P1Z3', registeredAddress: 'Andheri East, Mumbai 400093', signatory: 'Sameer Kulkarni', designation: 'CSR Manager', csrNo: 'CSR00041207', committeeRef: 'MPL/CSR/2026/09', preferredStates: ['Uttar Pradesh', 'Bihar'], preferredExams: ['NEET'] } },
  { id: 'sp-janseva', leaderboardOptIn: true, userId: 'u-sp-janseva', type: 'ngo', displayName: 'Jan Seva Trust', public: true, pan: 'AAATJ8810R', email: 'office@janseva.example', mobile: '+91 612 222 9810', kycStatus: 'verified', kycSubmittedAt: '2026-07-20T10:00:00', kycVerifiedAt: '2026-07-21T12:10:00', joinedAt: '2026-07-20',
    org: { name: 'Jan Seva Trust', registrationNo: 'BR/TR/2011/0482', registrationType: 'Public Charitable Trust', reg12A: 'AAATJ8810RE20214', reg80G: 'AAATJ8810RF20214', csrNo: 'CSR00009931', signatory: 'Sushil Kumar Jha' } },
  { id: 'sp-mp', leaderboardOptIn: true, userId: 'u-sp-mp', type: 'mp_mla', displayName: 'Office of the MP, Patna Sahib', public: true, pan: 'AJXPS4410Q', email: 'mp.patnasahib@example.in', mobile: '+91 612 250 0111', kycStatus: 'verified', kycSubmittedAt: '2026-07-10T10:00:00', kycVerifiedAt: '2026-07-11T17:45:00', joinedAt: '2026-07-10',
    org: { name: 'Shri Arvind Sinha, MP', house: 'Lok Sabha', constituency: 'Patna Sahib', state: 'Bihar', officeContact: '+91 612 250 0111', pa: 'Deepak Raj, +91 94310 88120' } },
];

export const PACKAGE_PRODUCTS = [
  { id: 'pp-sponsor', name: 'Sponsor a student', type: 'SPONSOR_STUDENT', amountRule: 'FULL_REMAINING_NEED', minAmount: 0, fixedAmount: 0, allocationTarget: 'SPECIFIC_STUDENT', allowedDonorTypes: ['individual', 'corporate', 'ngo', 'mp_mla'], platformFeePercent: 10, feeMode: 'ON_TOP', certificateTemplate: 'sponsorship', reportingFrequency: 'On payout', visibility: 'PUBLIC' },
  { id: 'pp-partial', name: 'Partial support', type: 'PARTIAL', amountRule: 'MIN_AMOUNT', minAmount: 1000, fixedAmount: 0, allocationTarget: 'SPECIFIC_STUDENT', allowedDonorTypes: ['individual', 'corporate', 'ngo', 'mp_mla'], platformFeePercent: 10, feeMode: 'ON_TOP', certificateTemplate: 'sponsorship', reportingFrequency: 'On payout', visibility: 'PUBLIC' },
  { id: 'pp-sip', name: 'Monthly SIP', type: 'SIP', amountRule: 'MONTHLY_FIXED', minAmount: 500, fixedAmount: 2000, allocationTarget: 'GENERAL_POOL', allowedDonorTypes: ['individual', 'corporate', 'ngo'], platformFeePercent: 10, feeMode: 'ON_TOP', certificateTemplate: 'annual_sip', reportingFrequency: 'Monthly', visibility: 'PUBLIC' },
  { id: 'pp-constituency', name: 'Constituency fund', type: 'CONSTITUENCY', amountRule: 'MIN_AMOUNT', minAmount: 50000, fixedAmount: 0, allocationTarget: 'CONSTITUENCY_POOL', allowedDonorTypes: ['mp_mla'], platformFeePercent: 10, feeMode: 'ON_TOP', certificateTemplate: 'constituency_impact', reportingFrequency: 'Annual', visibility: 'PRIVATE', privateDonorId: 'sp-mp' },
  { id: 'pp-cohort', name: 'Cohort / CSR programme', type: 'COHORT', amountRule: 'MIN_AMOUNT', minAmount: 100000, fixedAmount: 0, allocationTarget: 'COHORT', allowedDonorTypes: ['corporate', 'ngo'], platformFeePercent: 10, feeMode: 'ON_TOP', certificateTemplate: 'utilisation', reportingFrequency: 'Quarterly', visibility: 'PRIVATE' },
  { id: 'pp-tata-neet27', name: 'Tata Steel — NEET 2027 Bihar — 10 students', type: 'COHORT', amountRule: 'FIXED', minAmount: 0, fixedAmount: 600000, allocationTarget: 'COHORT', allowedDonorTypes: ['corporate'], platformFeePercent: 10, feeMode: 'ON_TOP', certificateTemplate: 'utilisation', reportingFrequency: 'Quarterly', visibility: 'PRIVATE', privateDonorId: 'sp-tata' },
];

const COHORTS = [
  { id: 'coh-tata-neet27', name: 'Tata Steel — NEET 2027 Bihar', sponsorId: 'sp-tata', productId: 'pp-tata-neet27', target: 600000, seats: 10, studentIds: [], exam: 'NEET', state: 'Bihar' },
];

const POOLS = [
  { id: 'general', name: 'General pool' },
  { id: 'const-patna-sahib', name: 'Constituency pool, Patna Sahib', sponsorId: 'sp-mp' },
];

// [id, createdAt, sponsorId, productId, target, amount to students, status, extra]
// Every amount is before the 10% fee; fee and total are derived below.
const DONATION_ROWS = [
  ['d01', '2026-06-12T11:20:00', 'sp-tata', 'pp-tata-neet27', { cohortId: 'coh-tata-neet27' }, 300000, 'success', { tranche: 1 }],
  ['d02', '2026-06-20T19:05:00', 'sp-anand', 'pp-partial', { poolId: 'general' }, 10000, 'success'],
  ['d11', '2026-07-02T10:40:00', 'sp-tata', 'pp-sponsor', { studentId: 'SB-2026-004455' }, 40500, 'success'],
  ['d03', '2026-07-05T06:00:00', 'sp-farah', 'pp-sip', { poolId: 'general' }, 2000, 'success', { sip: true }],
  ['d08', '2026-07-18T12:30:00', 'sp-mp', 'pp-constituency', { poolId: 'const-patna-sahib' }, 200000, 'success'],
  ['d04', '2026-08-05T06:00:00', 'sp-farah', 'pp-sip', { poolId: 'general' }, 2000, 'success', { sip: true }],
  ['d09', '2026-08-10T15:10:00', 'sp-janseva', 'pp-partial', { studentId: 'SB-2026-004476' }, 25000, 'success'],
  ['d10', '2026-08-22T20:45:00', 'sp-kavita', 'pp-sponsor', { studentId: 'SB-2026-004476' }, 21000, 'success'],
  ['d05', '2026-09-05T06:00:00', 'sp-farah', 'pp-sip', { poolId: 'general' }, 2000, 'success', { sip: true }],
  ['d12', '2026-09-14T09:15:00', 'sp-rohit', 'pp-partial', { poolId: 'general' }, 5000, 'success'],
  ['d20', '2026-09-25T13:00:00', 'sp-janseva', 'pp-partial', { poolId: 'general' }, 100000, 'success', { offline: true, offlineMode: 'Cheque', chequeNo: '004417' }],
  ['d16', '2026-10-02T18:30:00', 'sp-kavita', 'pp-partial', { poolId: 'general' }, 15000, 'success'],
  ['d06', '2026-10-05T06:00:00', 'sp-farah', 'pp-sip', { poolId: 'general' }, 2000, 'success', { sip: true }],
  ['d17', '2026-10-21T21:10:00', 'sp-anand', 'pp-partial', { poolId: 'general' }, 8000, 'success'],
  ['d07', '2026-11-05T06:00:00', 'sp-farah', 'pp-sip', { poolId: 'general' }, 2000, 'failed', { sip: true, failReason: 'Mandate debit failed: insufficient balance' }],
  ['d13', '2026-11-08T10:05:00', 'sp-rohit', 'pp-partial', { studentId: PRIYA_ID }, 5000, 'success'],
  ['d14', '2026-11-11T16:40:00', 'sp-anand', 'pp-partial', { studentId: PRIYA_ID }, 10000, 'success'],
  ['d15', '2026-11-14T11:55:00', 'sp-tata', 'pp-partial', { studentId: PRIYA_ID }, 15000, 'success'],
  ['d18', '2026-11-16T14:25:00', 'sp-meridian', 'pp-partial', { poolId: 'general' }, 50000, 'success'],
  ['d19', '2026-11-17T22:50:00', 'sp-kavita', 'pp-partial', { poolId: 'general' }, 3000, 'pending'],
];

const sponsorOf = (id) => SPONSORS.find((s) => s.id === id);
const pad6 = (n) => String(n).padStart(6, '0');

export function buildSeedState() {
  const users = [
    { id: 'u-admin', role: 'admin', name: 'Neha Agarwal', email: 'admin@sikshitbharat.org', mobile: '+91 94310 10001' },
    { id: 'u-trustee', role: 'trustee', name: 'Dr. Ramesh N. Prasad', email: 'trustee@sikshitbharat.org', mobile: '+91 94310 10002' },
    { id: 'u-trustee2', role: 'trustee', name: 'Shalini Mehta', email: 'trustee2@sikshitbharat.org', mobile: '+91 94310 10005' },
    { id: 'u-finance', role: 'finance', name: 'Vikas Choudhary', email: 'finance@sikshitbharat.org', mobile: '+91 94310 10003' },
    { id: 'u-inst-vidya', role: 'institute', name: 'Vidya Coaching Centre', email: 'accounts@vidyacoaching.example', mobile: '+91 94310 22118', orgId: 'vidya-patna' },
    { id: 'u-gdn-sunita', role: 'guardian', name: 'Sunita Devi', email: 'sunita.devi@example.in', mobile: '+91 98XXX XX210', orgId: 'g-sunita' },
    ...VERIFIERS.map((v) => ({ id: v.id, role: 'verifier', name: v.name, email: v.email, mobile: v.mobile, districts: v.districts })),
    ...SPONSORS.map((s) => ({ id: s.userId, role: 'sponsor', name: s.org?.name || s.displayName, email: s.email, mobile: s.mobile, orgId: s.id })),
  ];

  const students = [];
  const guardians = [];
  const documents = [];
  const packages = [];
  const reviews = [];

  const verifierFor = (district) => VERIFIERS.find((v) => v.districts.includes(district));
  const POST_SUBMIT = ['Under verification', 'Listed', 'Partially funded', 'Fully funded', 'Enrolled'];
  const LISTED_UP = ['Listed', 'Partially funded', 'Fully funded', 'Enrolled'];

  STUDENT_ROWS.forEach(([suffix, name, gender, dob, state, district, cls, marks, income, status, courseId]) => {
    const id = `SB-2026-${suffix}`;
    const isPriya = id === PRIYA_ID;
    const userId = isPriya ? 'u-stu-priya' : `u-stu-${suffix}`;
    const guardianId = isPriya ? 'g-sunita' : `g-${suffix}`;
    const first = name.split(' ')[0].toLowerCase();
    const course = CATALOGUE_COURSES.find((c) => c.id === courseId);
    const assigned = POST_SUBMIT.includes(status) && suffix !== '004571';
    const verifier = assigned ? verifierFor(district) : null;
    const listedAt = { Listed: '2026-11-02', 'Partially funded': '2026-11-05', 'Fully funded': '2026-08-06', Enrolled: '2026-06-28' }[status] || null;
    const email = isPriya ? INITIAL_STUDENT.email : `${first}.${suffix}@example.in`;
    const mobile = isPriya ? INITIAL_STUDENT.mobile : `+91 9XXXX X${suffix.slice(2)}`;

    users.push({ id: userId, role: 'student', name, email, mobile, orgId: id });

    const base = isPriya
      ? { ...INITIAL_STUDENT }
      : {
          id, fullName: name, initials: initialsOf(name), dob, age: 2026 - Number(dob.slice(0, 4)), gender, mobile, email, state, district,
          school: SCHOOLS[district], board: state === 'Bihar' || state === 'Jharkhand' ? 'CBSE' : 'State board',
          studentClass: cls, class10Marks: marks,
          incomeBand: income <= 100000 ? 'Below ₹1L' : income <= 250000 ? '₹1–2.5L' : '₹2.5–3L',
          sop: SOPS[name],
        };
    students.push({
      ...base, userId, familyIncome: income, status, listedAt, guardianId,
      verifierId: verifier ? verifier.id : null, courseId, packageId: course ? `pkg-${suffix}` : null,
      exam: course ? course.exam : null, instituteId: course ? course.instituteId : null,
      batchId: course ? course.batches[0].id : null, createdAt: '2026-06-01',
    });

    const [gName, rel, gMobile, gEmail] = GUARDIAN_ROWS[suffix];
    // Priya keeps the existing prototype seed (pending) so her waiting screen is unchanged.
    const consentState = isPriya ? INITIAL_GUARDIAN.consentState : status === 'Draft' ? 'not_sent' : status === 'Consent pending' ? 'pending' : 'approved';
    guardians.push({
      id: guardianId, userId: isPriya ? 'u-gdn-sunita' : null, studentId: id, name: gName, relation: rel, mobile: gMobile, email: gEmail,
      consentState, approvedDate: isPriya ? INITIAL_GUARDIAN.approvedDate : consentState === 'approved' ? '20 Oct 2026' : null,
      // Priya's link has no timestamp so her waiting screen keeps the prototype's Pending state.
      consentSentAt: consentState === 'not_sent' || isPriya ? null : suffix === '004593' ? '2026-11-15T09:00:00' : '2026-11-17T10:00:00',
      consentAt: consentState === 'approved' ? '2026-10-20T18:00:00' : null, otpVerified: consentState === 'approved',
    });

    // Documents
    if (isPriya) {
      INITIAL_DOCUMENTS.forEach((d) =>
        documents.push({ ...d, type: d.id, studentId: id, source: ['class10', 'aadhaar'].includes(d.id) ? 'digilocker' : 'manual', rejectReason: d.status === 'rejected' ? d.detail : null })
      );
    } else {
      const verifiedAll = LISTED_UP.includes(status);
      [
        ['class10', 'Class 10 marksheet', 'digilocker'],
        ['aadhaar', `Aadhaar (last 4: ${suffix.slice(2)})`, 'digilocker'],
        ['income', 'Income certificate', 'manual'],
        ['school_id', 'School ID / Bonafide', 'manual'],
        ['photo', 'Passport photo', 'manual'],
        ['caste_ews', 'Caste / EWS certificate (optional)', 'manual'],
      ].forEach(([type, dname, source]) => {
        let st = 'not_uploaded';
        if (verifiedAll) st = type === 'caste_ews' ? 'not_uploaded' : 'verified';
        else if (status === 'Under verification') st = source === 'digilocker' ? 'verified' : type === 'caste_ews' ? 'not_uploaded' : 'uploaded';
        else if (status === 'Consent pending') st = source === 'digilocker' ? 'verified' : type === 'income' ? 'uploaded' : 'not_uploaded';
        else if (status === 'Draft' && source === 'digilocker' && suffix === '004611') st = 'verified';
        documents.push({
          id: type, type, studentId: id, name: dname, status: st, source,
          detail:
            st === 'verified'
              ? source === 'digilocker' ? 'Verified via DigiLocker' : 'Checked by trust officer'
              : st === 'uploaded' ? 'Uploaded · Pending check' : 'Not uploaded yet',
          rejectReason: null,
        });
      });
    }

    // Package
    if (course) {
      const extras = isPriya ? INITIAL_EXTRAS.map((e) => ({ ...e })) : (EXTRAS_BY_STUDENT[suffix] || []).map((e) => ({ ...e }));
      const locked = !isPriya && POST_SUBMIT.includes(status);
      packages.push({
        id: `pkg-${suffix}`, studentId: id, courseId, courseFee: course.fee, extras, discount: 0, familyContribution: 0,
        // Priya keeps the existing prototype behaviour (unlocked) until Part 2 connects it.
        locked, lockedAt: locked ? '2026-10-28' : null,
        adminApproved: LISTED_UP.includes(status), adminApprovedAt: listedAt, durationMonths: course.durationMonths,
      });
    }

    // Verification reviews
    if (status === 'Under verification') {
      const map = {
        '004550': { assignedAt: '2026-11-16T10:00:00', slaDueAt: '2026-11-19T10:00:00', checklist: { docsMatch: true, incomeOk: true, marksOk: true, guardianCalled: true, studentCalled: false, noDuplicate: false } },
        '004558': { assignedAt: '2026-11-12T11:00:00', slaDueAt: '2026-11-15T11:00:00', checklist: { docsMatch: true, incomeOk: false, marksOk: true, guardianCalled: false, studentCalled: false, noDuplicate: false } },
        '004571': { assignedAt: null, slaDueAt: null, checklist: {} },
      }[suffix];
      reviews.push({ id: `rv-${suffix}`, studentId: id, verifierId: verifier ? verifier.id : null, notes: '', recommendation: null, reason: '', decidedAt: null, submittedAt: '2026-11-15T09:00:00', ...map });
    } else if (assigned) {
      reviews.push({
        id: `rv-${suffix}`, studentId: id, verifierId: verifier.id, submittedAt: '2026-10-21T09:00:00', assignedAt: '2026-10-22T10:00:00', slaDueAt: '2026-10-25T10:00:00',
        checklist: { docsMatch: true, incomeOk: true, marksOk: true, guardianCalled: true, studentCalled: true, noDuplicate: true },
        notes: 'Spoke to the guardian and the student. Documents match. Family income confirmed from the tehsil certificate.',
        recommendation: 'approve', reason: '', decidedAt: '2026-10-24T17:20:00',
      });
    }
  });

  // --- Donations, allocations, receipts, reconciliation ---------------------
  const donations = [];
  const allocations = [];
  const receipts = [];
  const reconciliation = [];
  let receiptSeq = 100;
  DONATION_ROWS.forEach(([id, at, sponsorId, productId, target, amount, status, extra = {}]) => {
    const fee = Math.round((amount * PLATFORM_FEE_PERCENT) / 100);
    const total = amount + fee;
    const sp = sponsorOf(sponsorId);
    const receiptNo = status === 'success' ? `SB/80G/2026/${pad6(++receiptSeq)}` : null;
    donations.push({
      id, sponsorId, packageProductId: productId,
      studentId: target.studentId || null, cohortId: target.cohortId || null, poolId: target.poolId || null,
      amount, fee, total,
      paymentRef: extra.offline ? `CHQ-${extra.chequeNo}` : `pay_${id.toUpperCase()}${at.slice(5, 10).replace('-', '')}RZ`,
      status, createdAt: at, receiptNo, offline: !!extra.offline, offlineMode: extra.offlineMode || null,
      sip: !!extra.sip, tranche: extra.tranche || null, failReason: extra.failReason || null, anonymous: !sp.public,
    });
    if (status !== 'success') return;
    const recoState = id === 'd17' ? 'mismatch' : id === 'd18' ? 'pending' : 'matched';
    const allocState = recoState === 'matched' ? 'confirmed' : 'pending';
    const lines = [];
    if (target.studentId) lines.push({ targetType: 'student', targetId: target.studentId, amount });
    else if (target.cohortId) lines.push({ targetType: 'cohort', targetId: target.cohortId, amount });
    else lines.push({ targetType: 'pool', targetId: target.poolId, amount });
    lines.push({ targetType: 'operations', targetId: 'operations', amount: fee });
    lines.forEach((l, i) => allocations.push({ id: `al-${id}-${i + 1}`, donationId: id, ...l, state: allocState, createdAt: at }));
    receipts.push({ id: `rc-${id}`, donationId: id, number: receiptNo, amount: total, issuedAt: at, panMasked: `XXXXX${sp.pan.slice(5, 9)}X`, section: '80G' });
    reconciliation.push({
      id: `re-${id}`, donationId: id, gatewayAmount: total,
      bankAmount: recoState === 'pending' ? null : id === 'd17' ? total - 200 : total,
      state: recoState, checkedBy: recoState === 'pending' ? null : 'u-finance',
      checkedAt: recoState === 'pending' ? null : `${at.slice(0, 10)}T18:00:00`,
      note: id === 'd17' ? 'Bank credit is ₹200 short of the gateway settlement. Asked the gateway for a settlement report.' : '',
    });
  });

  // --- Disbursements --------------------------------------------------------
  const arjunCourse = CATALOGUE_COURSES.find((c) => c.id === 'sankalp-jee-12m');
  const kiranCourse = CATALOGUE_COURSES.find((c) => c.id === 'neet-12m');
  const disbursements = [
    { id: 'ds1', studentId: 'SB-2026-004455', instituteId: 'sankalp-patna', invoiceNo: 'SA/2026/0712', instalmentNo: 1, amount: arjunCourse.instalments[0].amount, status: 'confirmed', createdBy: 'u-finance', createdAt: '2026-07-10T11:00:00', approvedBy: 'u-trustee', approvedAt: '2026-07-11T10:30:00', utr: 'SBIN526193004417', paidOn: '2026-07-12', confirmedAt: '2026-07-14T16:00:00', rejectReason: null },
    { id: 'ds2', studentId: 'SB-2026-004476', instituteId: 'vidya-patna', invoiceNo: 'VCC/INV/2026/1184', instalmentNo: 1, amount: kiranCourse.instalments[0].amount, status: 'pending_trustee', createdBy: 'u-finance', createdAt: '2026-11-16T12:15:00', approvedBy: null, approvedAt: null, utr: null, paidOn: null, confirmedAt: null, rejectReason: null },
    { id: 'ds3', studentId: 'SB-2026-004455', instituteId: 'sankalp-patna', invoiceNo: 'SA/2027/0108', instalmentNo: 2, amount: arjunCourse.instalments[1].amount, status: 'draft', createdBy: 'u-finance', createdAt: '2026-11-17T15:00:00', approvedBy: null, approvedAt: null, utr: null, paidOn: null, confirmedAt: null, rejectReason: null },
    { id: 'ds4', studentId: 'SB-2026-004476', instituteId: 'vidya-patna', invoiceNo: 'VCC/INV/2026/1102', instalmentNo: 1, amount: kiranCourse.instalments[0].amount + 2000, status: 'rejected', createdBy: 'u-admin', createdAt: '2026-11-10T10:00:00', approvedBy: 'u-trustee', approvedAt: '2026-11-11T09:00:00', utr: null, paidOn: null, confirmedAt: null, rejectReason: 'Invoice amount is ₹2,000 above the catalogue instalment. Ask the institute for a corrected invoice.' },
  ];

  // Fee invoices raised by institutes (per student, per instalment)
  const invoices = disbursements
    .filter((d) => d.id !== 'ds4')
    .map((d) => ({
      id: `inv-${d.id}`, instituteId: d.instituteId, studentId: d.studentId, instalmentNo: d.instalmentNo, invoiceNo: d.invoiceNo, amount: d.amount,
      dueDate: CATALOGUE_COURSES.find((c) => c.instituteId === d.instituteId && c.id === STUDENT_ROWS.find((r) => `SB-2026-${r[0]}` === d.studentId)[10])?.instalments[d.instalmentNo - 1]?.dueDate,
      file: { name: `${d.invoiceNo.replace(/\//g, '-')}.pdf`, sizeLabel: '184 KB' }, uploadedBy: d.instituteId === 'vidya-patna' ? 'u-inst-vidya' : 'u-finance',
      status: ['paid', 'confirmed'].includes(d.status) ? 'paid' : 'used', at: d.createdAt,
    }));

  // Monthly sweep of the 10% fee to the operating account
  const feesUntilOct = donations
    .filter((d) => d.status === 'success' && d.createdAt < '2026-10-01')
    .reduce((s, d) => s + d.fee, 0);
  const opsTransfers = [{ id: 'ot1', amount: feesUntilOct, at: '2026-10-01T10:00:00', by: 'u-finance', note: 'Fees collected Jun–Sep 2026' }];

  // --- Progress -------------------------------------------------------------
  const progress = [
    ...INITIAL_PROGRESS_RECORDS.map((r) => ({ ...r, studentId: PRIYA_ID, verifiedBy: r.status === 'verified' ? 'u-ver-rakesh' : null })),
    { id: 'pa1', studentId: 'SB-2026-004455', month: 'October 2026', type: 'Mock test 3', score: '212 / 300', numericScore: 71, status: 'pending', remark: 'Institute marks shared, awaiting verifier', verifiedBy: null, attendance: 94 },
    { id: 'pa2', studentId: 'SB-2026-004455', month: 'September 2026', type: 'Mock test 2', score: '196 / 300', numericScore: 65, status: 'verified', remark: 'Strong in Mechanics', verifiedBy: 'u-ver-imran', attendance: 91 },
  ];

  // --- Certificates ---------------------------------------------------------
  const certificates = [
    { id: 'ce1', sponsorId: 'sp-tata', type: 'sponsorship', studentIds: ['SB-2026-004455'], amount: arjunCourse.instalments[0].amount, issuedAt: '2026-07-15T10:00:00', signedBy: 'u-trustee', number: 'SB/CERT/2026/000041', donationId: 'd11' },
  ];

  // --- Notifications --------------------------------------------------------
  const n = (id, userId, category, title, detail, at, unread = true) => ({ id, userId, category, title, detail, at, unread });
  const notifications = [
    ...INITIAL_NOTIFICATIONS.map((x) => ({ ...x, userId: 'u-stu-priya' })),
    n('na1', 'u-admin', 'Approval', 'Verifier task overdue', 'Laxmi M. (Mayurbhanj) was due on 15 Nov. Assigned to Pooja Verma.', '2026-11-16T09:00:00'),
    n('na2', 'u-admin', 'Approval', 'New application to assign', 'Mohit M. (Jaipur) submitted an application. No verifier assigned yet.', '2026-11-17T08:30:00'),
    n('na3', 'u-admin', 'Approval', 'Sponsor KYC pending', 'Meridian Pharma Ltd submitted CSR documents. Target: verify within 48 hours.', '2026-11-17T09:45:00'),
    n('na4', 'u-admin', 'Funding', 'Reconciliation mismatch', 'Anand S., 21 Oct: bank credit is ₹200 short of the gateway amount.', '2026-10-22T18:00:00', false),
    n('na5', 'u-admin', 'Funding', 'SIP debit failed', 'Farah Siddiqui’s 5 Nov SIP debit failed. A reminder was sent.', '2026-11-05T07:00:00'),
    n('nv1', 'u-ver-rakesh', 'Approval', 'New verification task', 'Saurabh K. (Muzaffarpur) is assigned to you. Due 19 Nov.', '2026-11-16T10:00:00'),
    n('nv2', 'u-ver-pooja', 'Approval', 'Verification overdue', 'Laxmi M. (Mayurbhanj) was due on 15 Nov.', '2026-11-15T11:00:00'),
    n('ns1', 'u-sp-anand', 'Funding', 'Payment successful', 'Your ₹11,000 payment for Priya K. was received. Your 80G receipt is ready.', '2026-11-11T16:42:00'),
    n('ns2', 'u-sp-tata', 'Funding', 'Sponsorship certificate ready', 'Arjun P.’s first instalment was paid to Sankalp Academy.', '2026-07-15T10:05:00', false),
    n('ns3', 'u-sp-meridian', 'System', 'Verification in progress', 'Our team is checking your CSR documents. This usually takes up to 48 hours.', '2026-11-17T09:41:00'),
    n('ns4', 'u-sp-farah', 'Funding', 'SIP debit failed', 'Your 5 Nov SIP of ₹2,200 could not be debited. Please check your mandate.', '2026-11-05T07:00:00'),
    n('nt1', 'u-trustee', 'Payout', 'Payout awaiting your approval', '₹21,000 to Vidya Coaching Centre for Kiran K., instalment 1.', '2026-11-16T12:16:00'),
    n('nf1', 'u-finance', 'Funding', 'Donation to reconcile', '₹55,000 from Meridian Pharma Ltd is waiting for a bank statement match.', '2026-11-16T14:30:00'),
    n('ng1', 'u-gdn-sunita', 'Consent', 'Consent requested for Priya', 'Priya has applied for coaching support. Please review and give consent.', '2026-11-13T10:00:00'),
    n('ni1', 'u-inst-vidya', 'Payout', 'Invoice under trustee review', 'VCC/INV/2026/1184 for Kiran K. is awaiting trustee approval.', '2026-11-16T12:16:00'),
  ];

  // --- Audit log ------------------------------------------------------------
  const a = (id, actorId, role, action, entity, entityId, at) => ({ id, actorId, role, action, entity, entityId, at });
  const auditLog = [
    a('au11', 'u-finance', 'finance', 'Created disbursement', 'disbursement', 'ds2', '2026-11-16T12:15:00'),
    a('au10', 'u-admin', 'admin', 'Assigned verifier Rakesh Sinha', 'review', 'rv-004550', '2026-11-16T10:00:00'),
    a('au9', 'u-trustee', 'trustee', 'Rejected disbursement', 'disbursement', 'ds4', '2026-11-11T09:00:00'),
    a('au8', 'u-admin', 'admin', 'Listed student', 'student', PRIYA_ID, '2026-11-05T10:00:00'),
    a('au7', 'u-admin', 'admin', 'Listed student', 'student', 'SB-2026-004498', '2026-11-02T11:00:00'),
    a('au6', 'u-finance', 'finance', 'Flagged reconciliation mismatch', 'reconciliation', 're-d17', '2026-10-22T18:00:00'),
    a('au5', 'u-finance', 'finance', 'Moved fees to operating account', 'opsTransfer', 'ot1', '2026-10-01T10:00:00'),
    a('au4', 'u-finance', 'finance', 'Entered UTR SBIN526193004417', 'disbursement', 'ds1', '2026-07-12T15:00:00'),
    a('au3', 'u-trustee', 'trustee', 'Approved disbursement', 'disbursement', 'ds1', '2026-07-11T10:30:00'),
    a('au2', 'u-finance', 'finance', 'Created disbursement', 'disbursement', 'ds1', '2026-07-10T11:00:00'),
    a('au1', 'u-admin', 'admin', 'Listed student', 'student', 'SB-2026-004455', '2026-06-28T12:00:00'),
  ];

  return {
    version: 1,
    users,
    students,
    guardians,
    documents,
    catalogue: { exams: CATALOGUE_EXAMS, institutes: CATALOGUE_INSTITUTES, courses: CATALOGUE_COURSES },
    packages,
    reviews,
    verifiers: VERIFIERS,
    sponsors: SPONSORS,
    packageProducts: PACKAGE_PRODUCTS,
    cohorts: COHORTS,
    pools: POOLS,
    donations,
    allocations,
    reconciliation,
    disbursements,
    invoices,
    refunds: [],
    opsTransfers,
    progress,
    certificates,
    receipts,
    notifications,
    auditLog,
    thankYouNotes: [],
    instituteRequests: [],
    changeRequests: [],
    settings: {
      platformFeePercent: PLATFORM_FEE_PERCENT,
      feeMode: FEE_MODE,
      incomeCeiling: INCOME_CEILING,
      minClass10Marks: MIN_CLASS10_MARKS,
      extraCategoryCaps: { ...EXTRA_CATEGORY_CAPS },
      verifierSlaDays: VERIFIER_SLA_DAYS,
      demoMode: true,
      simulateDigilockerFailure: false,
      institutePortalEnabled: true, // Phase 1.5: not in the original SOW
    },
  };
}
