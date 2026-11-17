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
