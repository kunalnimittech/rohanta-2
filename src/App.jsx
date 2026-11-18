import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  ShieldCheck,
  User,
  FolderCheck,
  IndianRupee,
  Bell,
  Settings,
  Inbox,
  BookOpen,
  Package,
  HeartHandshake,
  Wallet,
  Landmark,
  Building2,
  Users,
  BarChart3,
  ClipboardCheck,
  History,
  Compass,
  Gift,
  Sparkles,
  Award,
  Receipt,
  Scale,
  FileText,
  MapPin,
  MessageSquareHeart,
  ScrollText,
} from 'lucide-react';
import { DEMO_ACCOUNTS, DEMO_SWITCH_EXTRA, initialsOf, buildSeedState } from './data/mockData';
import { ageFromDob } from './data/rules';
import { SupportSheet } from './pages/ApplicationPages';
import {
  SignUpScreen,
  LoginScreen,
  RoleSelectScreen,
} from './pages/AuthPages';
import {
  DetailsStep,
  GuardianStep,
  WaitingGuardianStep,
  DocumentsStep,
  ExamCourseStep,
  PackageStep,
  ReviewSubmitStep,
} from './pages/ApplicationPages';
import {
  DashboardPage,
  FundingPage,
  ProgressPage,
  NotificationsPage,
  SettingsPage,
} from './pages/DashboardPages';
import { RolePreviewPage } from './pages/shared/RolePreview';
import {
  GuardianConsentPage,
  GuardianChildPage,
  GuardianDocumentsPage,
  GuardianFundingPage,
} from './pages/guardian/GuardianPages';
import {
  AdminOverview,
  AdminApplications,
  AdminCatalogue,
  AdminInstitutes,
  AdminProducts,
  AdminSponsors,
  AdminFunds,
  AdminPayouts,
  AdminUsers,
  AdminReports,
  AdminSettings,
  AdminModeration,
  AdminAuditLog,
} from './pages/admin/AdminPages';
import { VerifierTasksPage, VerifierHistoryPage, VerifierDistricts } from './pages/verifier/VerifierPages';
import {
  SponsorOverview,
  SponsorDiscover,
  SponsorGiving,
  SponsorImpact,
  SponsorCertificates,
  SponsorCsr,
  SponsorConstituency,
  SponsorSettingsSection,
} from './pages/sponsor/SponsorPages';
import { CheckoutPage } from './pages/sponsor/CheckoutPages';
import { FinancePayouts, TrusteeApprovals, TrusteeHistory } from './pages/trust/TrustPages';
import { AdminCertificates } from './pages/shared/CertificatePages';
import { DemoScriptSheet } from './pages/shared/DemoScript';
import { InstituteOverview, InstituteStudents, InstituteInvoices, InstituteProfile } from './pages/institute/InstitutePages';
import { SponsorOnboarding } from './pages/sponsor/SponsorOnboarding';
import { StudentShell, RoleShell, DemoRoleSheet } from './components/Layout';
import { StoreProvider, useStore } from './store/StoreProvider';
import * as sel from './store/selectors';

// --- Role navigation (Parts 3–9 fill in the screens) -------------------------
const ROLE_CONFIG = {
  guardian: {
    label: 'Guardian',
    nav: [
      { id: 'consent', label: 'Consent', icon: ShieldCheck },
      { id: 'child', label: 'My child', icon: User },
      { id: 'documents', label: 'Documents', icon: FolderCheck },
      { id: 'funding', label: 'Funding', icon: IndianRupee },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['consent', 'child', 'funding'],
    home: 'child',
  },
  admin: {
    label: 'Admin',
    nav: [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'applications', label: 'Applications', icon: Inbox, short: 'Apps' },
      { id: 'catalogue', label: 'Catalogue', icon: BookOpen },
      { id: 'products', label: 'Packages & products', icon: Package },
      { id: 'sponsors', label: 'Sponsors', icon: HeartHandshake },
      { id: 'funds', label: 'Funds', icon: Landmark },
      { id: 'payouts', label: 'Payouts', icon: Wallet },
      { id: 'institutes', label: 'Institutes', icon: Building2 },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'certificates', label: 'Certificates', icon: Award },
      { id: 'moderation', label: 'Moderation', icon: MessageSquareHeart },
      { id: 'audit', label: 'Audit log', icon: ScrollText },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['overview', 'applications', 'funds', 'payouts'],
    home: 'overview',
  },
  verifier: {
    label: 'Verifier',
    nav: [
      { id: 'tasks', label: 'My tasks', icon: ClipboardCheck },
      { id: 'history', label: 'History', icon: History },
      { id: 'notifications', label: 'Notifications', icon: Bell, short: 'Alerts' },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['tasks', 'history', 'notifications', 'settings'],
    home: 'tasks',
  },
  sponsor: {
    label: 'Sponsor',
    nav: [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'discover', label: 'Discover', icon: Compass },
      { id: 'giving', label: 'My giving', icon: Gift, short: 'Giving' },
      { id: 'impact', label: 'Impact', icon: Sparkles },
      { id: 'certificates', label: 'Certificates & receipts', icon: Award },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['overview', 'discover', 'giving'],
    home: 'overview',
  },
  trustee: {
    label: 'Trustee',
    nav: [
      { id: 'approvals', label: 'Approvals', icon: Scale },
      { id: 'history', label: 'Payout history', icon: History, short: 'History' },
      { id: 'notifications', label: 'Notifications', icon: Bell, short: 'Alerts' },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['approvals', 'history', 'notifications'],
    home: 'approvals',
  },
  finance: {
    label: 'Finance',
    nav: [
      { id: 'payouts', label: 'Payouts', icon: Wallet },
      { id: 'funds', label: 'Funds', icon: Landmark },
      { id: 'reconciliation', label: 'Reconciliation', icon: Scale, short: 'Recon' },
      { id: 'receipts', label: 'Receipts', icon: Receipt },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['payouts', 'funds', 'reconciliation'],
    home: 'payouts',
  },
  institute: {
    label: 'Institute',
    nav: [
      { id: 'overview', label: 'Overview', icon: LayoutGrid },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'profile', label: 'Profile', icon: Building2 },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    primary: ['overview', 'students', 'invoices', 'profile'],
    home: 'overview',
  },
};

function navFor(role, sponsor) {
  const cfg = ROLE_CONFIG[role];
  if (role !== 'sponsor' || !sponsor) return cfg.nav;
  const extra =
    sponsor.type === 'corporate'
      ? [{ id: 'csr', label: 'CSR programmes', icon: Building2 }]
      : sponsor.type === 'mp_mla'
      ? [{ id: 'constituency', label: 'Constituency', icon: MapPin }]
      : [];
  return [...cfg.nav.slice(0, 5), ...extra, ...cfg.nav.slice(5)];
}

// Role select tile -> demo user for that role (onboarding forms arrive in Part 6).
const ROLE_TILE_USER = {
  guardian: 'u-gdn-sunita',
  individual_sponsor: 'u-sp-anand',
  csr: 'u-sp-tata',
  ngo: 'u-sp-janseva',
  representative: 'u-sp-mp',
};

const SWITCH_ACCOUNTS = [...DEMO_ACCOUNTS, ...DEMO_SWITCH_EXTRA];

const ADMIN_PAGES = {
  overview: AdminOverview,
  applications: AdminApplications,
  catalogue: AdminCatalogue,
  products: AdminProducts,
  sponsors: AdminSponsors,
  funds: AdminFunds,
  payouts: FinancePayouts, // admin can prepare payouts (maker) but never approve
  institutes: AdminInstitutes,
  users: AdminUsers,
  reports: AdminReports,
  moderation: AdminModeration,
  certificates: AdminCertificates,
  audit: AdminAuditLog,
};

const SPONSOR_PAGES = {
  overview: SponsorOverview,
  discover: SponsorDiscover,
  giving: SponsorGiving,
  impact: SponsorImpact,
  certificates: SponsorCertificates,
  csr: SponsorCsr,
  constituency: SponsorConstituency,
  checkout: CheckoutPage,
};
// Pages reachable by link but not listed in the nav, with the nav item they belong to.
const HIDDEN_PAGES = { checkout: 'discover' };
const ROLE_TILE_SPONSOR_TYPE = { individual_sponsor: 'individual', csr: 'corporate', ngo: 'ngo', representative: 'mp_mla' };

const FinanceFunds = (props) => <AdminFunds {...props} title="Funds" sub="Donations, the ledger and the monthly fee transfer." tabs={['donations', 'ledger', 'topup', 'operations']} />;
const FinanceReconciliation = (props) => <AdminFunds {...props} title="Reconciliation" sub="Gateway settlement report vs bank statement." tabs={['reconciliation']} />;
const FinanceReceipts = (props) => <AdminFunds {...props} title="Receipts" sub="80G receipts issued for every successful donation." tabs={['receipts']} />;
const FINANCE_PAGES = {
  payouts: FinancePayouts,
  funds: FinanceFunds,
  reconciliation: FinanceReconciliation,
  receipts: FinanceReceipts,
};
const INSTITUTE_PAGES = {
  overview: InstituteOverview,
  students: InstituteStudents,
  invoices: InstituteInvoices,
  profile: InstituteProfile,
};
const TRUSTEE_PAGES = {
  approvals: TrusteeApprovals,
  history: TrusteeHistory,
};

const VERIFIER_PAGES = {
  tasks: VerifierTasksPage,
  history: VerifierHistoryPage,
};

const GUARDIAN_PAGES = {
  consent: GuardianConsentPage,
  child: GuardianChildPage,
  documents: GuardianDocumentsPage,
  funding: GuardianFundingPage,
};

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}

function AppInner() {
  const { state, dispatch, resetDemo, setActor } = useStore();

  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark' | 'system'
  const [systemDark, setSystemDark] = useState(false);

  // 'signup' | 'login' | 'role' | 'app'
  const [flow, setFlow] = useState('signup');
  const [currentUserId, setCurrentUserId] = useState('u-stu-priya');
  // 'dashboard' | 'application' | 'documents' | 'package' | 'funding' | 'progress' | 'notifications' | 'settings'
  const [activeNav, setActiveNav] = useState('dashboard');
  // 0: details, 1: guardian, 2: waiting, 3: documents, 4: course, 5: package, 6: review
  const [appSubStep, setAppSubStep] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const [sponsorSignup, setSponsorSignup] = useState(null); // { type, tile }
  const [scriptOpen, setScriptOpen] = useState(false);
  // Optional parameters for in-app links (e.g. Overview tile -> filtered list).
  const [navParams, setNavParams] = useState({});
  const goTo = (nav, params = {}) => {
    setNavParams(params);
    setActiveNav(nav);
  };

  const user = sel.getUser(state, currentUserId) || sel.getUser(state, 'u-stu-priya');
  const role = user.role;
  setActor({ id: user.id, role });

  // ---- live student (Priya by default) — same props as before -------------
  const studentRec =
    (role === 'student' && sel.getStudentByUser(state, user.id)) ||
    sel.getStudent(state, 'SB-2026-004521');
  const studentId = studentRec.id;
  const student = studentRec;
  const guardian = sel.getGuardian(state, studentId);
  const documents = sel.studentDocuments(state, studentId);
  const pkg = sel.getPackage(state, studentId);
  const extras = pkg ? pkg.extras : [];
  const packageLocked = pkg ? pkg.locked : false;
  const contributions = sel.studentContributions(state, studentId);
  const progressRecords = sel.studentProgress(state, studentId);
  const notifications = sel.notificationsFor(state, user.id);

  const latest = useRef(state);
  latest.current = state;
  // Accepts a value or an updater function, like React's setState.
  const resolve = (current, v) => (typeof v === 'function' ? v(current) : v);
  const setStudent = (v) => {
    const cur = sel.getStudent(latest.current, studentId);
    dispatch('updateStudent', { studentId, patch: resolve(cur, v) });
  };
  const setGuardian = (v) => {
    const cur = sel.getGuardian(latest.current, studentId);
    dispatch('updateGuardian', { studentId, patch: resolve(cur, v) });
  };
  const setDocuments = (v) => {
    const cur = sel.studentDocuments(latest.current, studentId);
    dispatch('setStudentDocuments', { studentId, documents: resolve(cur, v) });
  };
  const setExtras = (v) => {
    const cur = sel.getPackage(latest.current, studentId)?.extras || [];
    dispatch('setPackageExtras', { studentId, extras: resolve(cur, v) });
  };
  const setPackageLocked = (v) => {
    const cur = sel.getPackage(latest.current, studentId)?.locked || false;
    dispatch('setPackageLocked', { studentId, locked: resolve(cur, v) });
  };

  const [guardianApprovedDocs, setGuardianApprovedDocs] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);

  // Course comes from the admin catalogue in the store (approved institutes only).
  const activeCourse = sel.getCourse(state, student.courseId) || null;
  const activeInstitute = activeCourse ? sel.getInstitute(state, activeCourse.instituteId) : null;
  const approvedInstitutes = state.catalogue.institutes.filter((i) => i.approvalStatus === 'approved');
  const catalogueCourses = state.catalogue.courses.filter((c) =>
    approvedInstitutes.some((i) => i.id === c.instituteId)
  );
  const [selectedExam, setSelectedExam] = useState(activeCourse ? activeCourse.exam : 'JEE');
  const [selectedInstitute, setSelectedInstitute] = useState(activeCourse ? activeCourse.instituteId : null);
  const selectedCourse = activeCourse ? activeCourse.id : null;
  const setSelectedCourse = (id) => dispatch('selectCourse', { studentId, courseId: id });

  // When the live student changes (sign up, demo switch), reset local step state.
  useEffect(() => {
    const c = sel.getCourse(latest.current, sel.getStudent(latest.current, studentId)?.courseId);
    setSelectedExam(c ? c.exam : 'JEE');
    setSelectedInstitute(c ? c.instituteId : null);
    setAppSubStep(0);
  }, [studentId]);

  // Deep link into an application step (demo script).
  useEffect(() => {
    if (navParams.step != null) setAppSubStep(navParams.step);
  }, [navParams]);

  // Student-side derived values for Part 2
  const consentState = sel.effectiveConsentState(guardian);
  const guardianView = guardian ? { ...guardian, consentState } : guardian;
  const totals = sel.studentPackageTotals(state, studentId);
  const statusIndex = sel.studentStatusIndex(state, studentId);
  const status = student.status;
  const verification = sel.verificationProgress(state, studentId);
  const instalment = sel.nextInstalment(state, studentId);
  const deadline = sel.nextProgressDeadline();
  const isAdult = (student.age ?? ageFromDob(student.dob) ?? 0) >= 18;
  const submittedStates = ['Under verification', 'Listed', 'Partially funded', 'Fully funded', 'Enrolled', 'Completed', 'Rejected', 'Dropped'];
  const alreadySubmitted = submittedStates.includes(status);
  // Course stays editable during verification until the package is locked; after
  // listing (or a locked package) a change needs an admin-approved request.
  const listedOrLater = ['Listed', 'Partially funded', 'Fully funded', 'Enrolled', 'Completed', 'Rejected', 'Dropped'].includes(status);
  const courseLocked = (listedOrLater || packageLocked) && !student.courseChangeAllowed;
  const approvedExtras = extras.filter(
    (e) => !e.excluded && e.state !== 'rejected' && e.state !== 'needs_review'
  );
  const packageInfo = {
    courseFee: activeCourse ? activeCourse.fee : 0,
    extras: approvedExtras,
    total: totals.total,
    locked: packageLocked,
  };
  const batch = activeCourse ? activeCourse.batches[0] : null;
  const guardianFirst = (guardian?.name || 'your guardian').split(' ')[0];
  const nextStep =
    status === 'Draft'
      ? { label: 'Next step', title: 'Finish your application', cta: 'Continue', action: () => setActiveNav('application') }
      : status === 'Consent pending'
      ? {
          label: 'Next step',
          title: consentState === 'expired' ? 'Your consent link expired. Send a new one.' : `Waiting for ${guardianFirst} to give consent`,
          cta: 'View consent',
          action: () => {
            setActiveNav('application');
            setAppSubStep(2);
          },
        }
      : status === 'Under verification'
      ? { label: 'Next step', title: 'Keep your phone handy. The verifier may call you and your guardian.', cta: 'View documents', action: () => setActiveNav('documents') }
      : status === 'Info requested'
      ? { label: 'Next step', title: 'Update your documents and resubmit', cta: 'Update documents', action: () => setActiveNav('documents') }
      : { label: 'Next step', title: `Upload ${deadline.coversLabel} progress by ${deadline.dueLabel}`, cta: 'Upload now', action: () => setActiveNav('progress') };
  const sentNotes = (state.thankYouNotes || []).filter((t) => t.studentId === studentId);
  const courseEnded = batch ? new Date(batch.end) < new Date() : false;
  const guardianUserId = guardian?.userId;

  // Demo-mode deep link: #as=<userId>&nav=<page>&p=<json params>&theme=dark&flow=login
  // Lets a presenter (or an automated check) open any role's screen directly.
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    if (h.get('theme')) setThemeMode(h.get('theme'));
    if (h.get('flow')) setFlow(h.get('flow'));
    const as = h.get('as');
    const u = as && sel.getUser(latest.current, as);
    if (u && latest.current.settings.demoMode) {
      let params = {};
      try {
        params = JSON.parse(h.get('p') || '{}');
      } catch {
        /* ignore bad params */
      }
      setCurrentUserId(u.id);
      setNavParams(params);
      setActiveNav(h.get('nav') || (u.role === 'student' ? 'dashboard' : ROLE_CONFIG[u.role].home));
      setFlow('app');
    }
    // QA: report page width vs viewport and runtime errors in the title (#qa=overflow).
    if (h.get('qa')) {
      // Simulate a phone width and list elements that stick out past it
      // (ignoring ones inside clipping/scrolling containers or fixed layers).
      const W = Number(h.get('w') || 375);
      document.documentElement.style.width = `${W}px`;
      document.documentElement.style.overflowX = 'hidden';
      let errors = 0;
      window.addEventListener('error', () => (errors += 1));
      const origError = console.error;
      console.error = (...a) => { errors += 1; origError(...a); };
      setTimeout(() => {
        document.getAnimations().forEach((a) => a.finish());
        const bad = [];
        document.querySelectorAll('body *').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.right <= W + 1) return;
          for (let a = el; a && a !== document.body; a = a.parentElement) {
            const cs = getComputedStyle(a);
            if (cs.position === 'fixed') return;
            if (a !== el && ['hidden', 'auto', 'scroll', 'clip'].includes(cs.overflowX) && a.getBoundingClientRect().right <= W + 1) return;
          }
          bad.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}@${Math.round(r.right)}`);
        });
        document.title = `QA ${bad.length} ${errors} ${bad.slice(0, 2).join(' | ')}`;
      }, 1500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mq.matches);
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const goalTotal = totals.total;

  const demoMode = state.settings.demoMode;
  const openDemo = demoMode ? () => setDemoOpen(true) : undefined;

  const signInAs = (userId, nav) => {
    const u = sel.getUser(state, userId);
    if (!u) return;
    setCurrentUserId(userId);
    let home = u.role === 'student' ? 'dashboard' : ROLE_CONFIG[u.role].home;
    if (u.role === 'guardian') {
      // A guardian with a pending consent request lands on the consent page.
      const g = state.guardians.find((x) => x.userId === userId);
      if (g && ['pending', 'expired'].includes(sel.effectiveConsentState(g))) home = 'consent';
    }
    setActiveNav(nav || home);
    setFlow('app');
  };

  const resetAll = () => {
    resetDemo();
    // Stay signed in as the same seeded user; accounts created in the demo fall back to Priya.
    const seedIds = new Set(buildSeedState().users.map((u) => u.id));
    if (!seedIds.has(currentUserId)) setCurrentUserId('u-stu-priya');
    setNavParams({});
    setActiveNav('settings');
  };

  // Demo script "Go": sign in as the step's role and open its screen.
  const goToTarget = (t) => {
    setScriptOpen(false);
    setDemoOpen(false);
    if (t.flow === 'signup') return setFlow('signup');
    if (t.flow === 'sponsorSignup') {
      setSponsorSignup({ type: t.type, tile: Object.keys(ROLE_TILE_SPONSOR_TYPE).find((k) => ROLE_TILE_SPONSOR_TYPE[k] === t.type) });
      return setFlow('sponsorSignup');
    }
    if (!t.userId || !sel.getUser(state, t.userId)) return undefined;
    setCurrentUserId(t.userId);
    setNavParams(t.params || {});
    setActiveNav(t.nav);
    setFlow('app');
    return undefined;
  };

  const demoSheet = (
    <>
      <DemoRoleSheet
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        accounts={SWITCH_ACCOUNTS}
        currentUserId={flow === 'app' ? currentUserId : null}
        onOpenScript={() => { setDemoOpen(false); setScriptOpen(true); }}
        onPick={(a) => {
          setDemoOpen(false);
          signInAs(a.userId);
        }}
      />
      <DemoScriptSheet open={scriptOpen} onClose={() => setScriptOpen(false)} onGo={goToTarget} />
    </>
  );

  if (flow === 'signup') {
    return (
      <SignUpScreen
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onSuccess={(form = {}) => {
          // After phone OTP: reuse an existing account with the same email or
          // mobile (the prefilled demo details are Priya's), else create a
          // new user + Draft student.
          const norm = (v) => String(v || '').replace(/\s/g, '').toLowerCase();
          const existing = state.users.find(
            (u) =>
              (form.email && norm(u.email) === norm(form.email)) ||
              (form.mobile && norm(u.mobile) === norm(form.mobile))
          );
          if (existing) {
            setCurrentUserId(existing.id);
          } else {
            const newId = `u-stu-${Date.now().toString(36)}`;
            dispatch('registerStudent', { userId: newId, name: form.name || 'New student', email: form.email, mobile: form.mobile, gender: form.gender });
            setCurrentUserId(newId);
          }
          setFlow('role');
        }}
        onGoLogin={() => setFlow('login')}
        demoMode={demoMode}
      />
    );
  }

  if (flow === 'login') {
    return (
      <LoginScreen
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onSuccess={(identifier = '') => {
          // Role-aware: a known email or mobile signs in as that user; otherwise the student.
          const id = identifier.toLowerCase();
          const match = state.users.find(
            (u) => u.email.toLowerCase() === id || u.mobile.replace(/\s/g, '') === id.replace(/\s/g, '')
          );
          signInAs(match ? match.id : 'u-stu-priya');
        }}
        onGoSignup={() => setFlow('signup')}
        demoAccounts={DEMO_ACCOUNTS}
        onDemoLogin={demoMode ? (a) => signInAs(a.userId) : undefined}
      />
    );
  }

  if (flow === 'role') {
    return (
      <RoleSelectScreen
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onContinue={(roleId = 'student') => {
          if (roleId === 'student') {
            if (role !== 'student') setCurrentUserId('u-stu-priya');
            setFlow('app');
            setActiveNav('application');
            setAppSubStep(0);
            return;
          }
          if (ROLE_TILE_SPONSOR_TYPE[roleId]) {
            setSponsorSignup({ type: ROLE_TILE_SPONSOR_TYPE[roleId], tile: roleId });
            setFlow('sponsorSignup');
            return;
          }
          signInAs(ROLE_TILE_USER[roleId] || 'u-stu-priya');
        }}
      />
    );
  }

  if (flow === 'sponsorSignup' && sponsorSignup) {
    return (
      <SponsorOnboarding
        sponsorType={sponsorSignup.type}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        demoMode={demoMode}
        onBack={() => setFlow('role')}
        onUseDemo={() => signInAs(ROLE_TILE_USER[sponsorSignup.tile])}
        onDone={(newUserId) => {
          setCurrentUserId(newUserId);
          setNavParams({});
          setActiveNav('overview');
          setFlow('app');
        }}
      />
    );
  }

  // ---- Non-student roles ----------------------------------------------------
  if (role !== 'student') {
    const sponsor = role === 'sponsor' ? sel.getSponsorByUser(state, user.id) : null;
    let nav = navFor(role, sponsor);
    if (role === 'admin') {
      const c = sel.pendingCountsForAdmin(state);
      const badges = {
        applications: c.unassigned + c.awaitingDecision + c.extras || 0,
        sponsors: c.sponsorKyc,
        funds: c.mismatches + c.reconPending,
        moderation: c.thankYouNotes + state.changeRequests.filter((r) => r.state === 'open').length + state.instituteRequests.filter((r) => r.state === 'open').length,
        institutes: c.instituteApprovals,
      };
      nav = nav.map((n) => (badges[n.id] ? { ...n, badge: badges[n.id] } : n));
    }
    if (role === 'institute') {
      const n = state.disbursements.filter((d) => d.instituteId === user.orgId && d.status === 'paid').length;
      nav = nav.map((x) => (x.id === 'invoices' && n ? { ...x, badge: n } : x));
    }
    if (role === 'trustee') {
      const n = state.disbursements.filter((d) => d.status === 'pending_trustee').length;
      nav = nav.map((x) => (x.id === 'approvals' && n ? { ...x, badge: n } : x));
    }
    if (role === 'finance') {
      const toAct = state.disbursements.filter((d) => ['draft', 'approved', 'paid'].includes(d.status)).length;
      const recon = state.reconciliation.filter((r) => ['pending', 'mismatch'].includes(r.state)).length;
      const offline = state.donations.filter((d) => d.offline && d.status === 'pending').length;
      nav = nav.map((x) => (x.id === 'payouts' && toAct ? { ...x, badge: toAct } : x.id === 'reconciliation' && recon ? { ...x, badge: recon } : x.id === 'funds' && offline ? { ...x, badge: offline } : x));
    }
    if (role === 'verifier') {
      const mineStudents = state.students.filter((x) => x.verifierId === user.id).map((x) => x.id);
      const openTasks =
        state.reviews.filter((r) => r.verifierId === user.id && !r.decidedAt).length +
        state.progress.filter((p) => mineStudents.includes(p.studentId) && p.status === 'pending').length;
      nav = nav.map((n) => (n.id === 'tasks' && openTasks ? { ...n, badge: openTasks } : n));
    }
    const cfg = ROLE_CONFIG[role];
    const hiddenPage = role === 'sponsor' && HIDDEN_PAGES[activeNav] ? activeNav : null;
    const navItem = hiddenPage
      ? nav.find((n) => n.id === (navParams.backTo || HIDDEN_PAGES[activeNav])) || nav[0]
      : nav.find((n) => n.id === activeNav) || nav[0];
    const pageId = hiddenPage || navItem.id;
    const roleLabel = sponsor ? `Sponsor · ${sponsor.type === 'mp_mla' ? 'MP / MLA' : sponsor.type === 'ngo' ? 'NGO / Trust' : sponsor.type === 'corporate' ? 'Corporate' : 'Individual'}` : cfg.label;
    return (
      <>
        <RoleShell
          roleLabel={roleLabel}
          navItems={nav}
          mobilePrimaryIds={cfg.primary}
          activeNav={navItem.id}
          onSelectNav={(id) => goTo(id)}
          homeNav={cfg.home}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          unreadCount={unreadCount}
          onLogout={() => setFlow('login')}
          onOpenDemo={openDemo}
          initials={initialsOf(sponsor ? sponsor.displayName : user.name.replace(/^Dr\.\s*/, ''))}
          userName={user.name}
        >
          {navItem.id === 'notifications' ? (
            <NotificationsPage
              notifications={notifications}
              onMarkRead={(id) => dispatch('markNotificationRead', { id })}
              onMarkAll={() => dispatch('markAllNotificationsRead', { userId: user.id })}
            />
          ) : role === 'admin' && navItem.id === 'settings' ? (
            <AdminSettings onResetDemo={resetAll} />
          ) : role === 'admin' && ADMIN_PAGES[navItem.id] ? (
            React.createElement(ADMIN_PAGES[navItem.id], { user, params: navParams, onNavigate: goTo, key: navItem.id })
          ) : navItem.id === 'settings' ? (
            <SettingsPage
              student={{ fullName: user.name, id: user.id, mobile: user.mobile, email: user.email }}
              idLabel="User ID"
              themeMode={themeMode}
              setThemeMode={setThemeMode}
              onResetDemo={role === 'admin' ? resetAll : undefined}
              demoMode={demoMode}
              onToggleDemoMode={role === 'admin' ? () => dispatch('setSettings', { demoMode: !demoMode }) : undefined}
            >
              {role === 'verifier' && <VerifierDistricts user={user} />}
              {role === 'sponsor' && <SponsorSettingsSection user={user} />}
            </SettingsPage>
          ) : role === 'sponsor' && SPONSOR_PAGES[pageId] ? (
            React.createElement(SPONSOR_PAGES[pageId], { user, params: navParams, onNavigate: goTo, key: pageId })
          ) : role === 'finance' && FINANCE_PAGES[navItem.id] ? (
            React.createElement(FINANCE_PAGES[navItem.id], { user, params: navParams, onNavigate: goTo, key: navItem.id })
          ) : role === 'institute' && INSTITUTE_PAGES[navItem.id] ? (
            React.createElement(INSTITUTE_PAGES[navItem.id], { user, params: navParams, onNavigate: goTo, key: navItem.id })
          ) : role === 'trustee' && TRUSTEE_PAGES[navItem.id] ? (
            React.createElement(TRUSTEE_PAGES[navItem.id], { user, params: navParams, onNavigate: goTo, key: navItem.id })
          ) : role === 'verifier' && VERIFIER_PAGES[navItem.id] ? (
            React.createElement(VERIFIER_PAGES[navItem.id], { user, onNavigate: goTo, key: navItem.id })
          ) : role === 'guardian' && GUARDIAN_PAGES[navItem.id] ? (
            React.createElement(GUARDIAN_PAGES[navItem.id], { user, onNavigate: setActiveNav })
          ) : (
            <RolePreviewPage role={role} user={user} navItem={navItem} isHome={navItem.id === cfg.home} />
          )}
        </RoleShell>
        {demoSheet}
      </>
    );
  }

  // ---- Student (same screens, now fed from the store) ----------------------
  const docsStep = (back, next) => (
    <DocumentsStep
      documents={documents}
      setDocuments={setDocuments}
      guardianApproved={guardianApprovedDocs}
      onToggleGuardianApproved={() => setGuardianApprovedDocs((v) => !v)}
      onBack={back}
      onNext={next}
      onDigiLocker={(success) => dispatch('digilockerSync', { studentId, success })}
      demoMode={demoMode}
    />
  );
  const packageStep = (extra) => (
    <PackageStep
      courseFee={activeCourse ? activeCourse.fee : 0}
      noCourse={!activeCourse}
      extras={extras}
      setExtras={setExtras}
      packageLocked={packageLocked}
      setPackageLocked={setPackageLocked}
      caps={state.settings.extraCategoryCaps}
      durationMonths={activeCourse ? activeCourse.durationMonths : 12}
      onLock={() => dispatch('lockPackage', { studentId })}
      onRequestChange={(detail) => dispatch('requestChange', { studentId, kind: 'package', detail })}
      demoMode={demoMode}
      {...extra}
    />
  );

  return (
    <>
    <StudentShell
      activeNav={activeNav}
      onSelectNav={(nav) => setActiveNav(nav)}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      unreadCount={unreadCount}
      onLogout={() => setFlow('login')}
      onOpenDemo={openDemo}
    >
      {activeNav === 'dashboard' && (
        <DashboardPage
          student={student}
          contributions={contributions}
          progressRecords={progressRecords}
          onNavigate={(nav) => setActiveNav(nav)}
          onOpenUpload={() => setActiveNav('progress')}
          goal={totals.verifiedNeed}
          packageInfo={packageInfo}
          statusIndex={statusIndex}
          status={status}
          verification={verification}
          infoRequest={student.infoRequest}
          rejectReason={student.rejectReason}
          instalment={instalment}
          courseStart={batch ? batch.start : null}
          nextStep={nextStep}
          outcome={student.outcome}
          onOpenOutcome={() => setActiveNav('progress')}
          onContactUs={() => setSupportOpen(true)}
        />
      )}

      {activeNav === 'application' && (
        <>
          {appSubStep === 0 && (
            <DetailsStep
              student={student}
              setStudent={setStudent}
              settings={state.settings}
              onNext={() => setAppSubStep(1)}
            />
          )}
          {appSubStep === 1 && (
            <GuardianStep
              guardian={guardian}
              setGuardian={setGuardian}
              isAdult={isAdult}
              onSkip={() => setAppSubStep(3)}
              onBack={() => setAppSubStep(0)}
              onNext={() => {
                dispatch('sendConsentLink', { studentId });
                setAppSubStep(2);
              }}
            />
          )}
          {appSubStep === 2 && (
            <WaitingGuardianStep
              guardian={guardianView}
              setGuardian={setGuardian}
              onChangeNumber={() => setAppSubStep(1)}
              onResend={() => dispatch('sendConsentLink', { studentId })}
              onOpenGuardianLink={
                guardianUserId || guardian?.consentState === 'pending'
                  ? () => signInAs(guardianUserId || `u-gdn-${studentId.slice(-6)}`, 'consent')
                  : undefined
              }
              demoMode={demoMode}
              onContinue={() => {
                setGuardianApprovedDocs(true);
                setAppSubStep(3);
              }}
            />
          )}
          {appSubStep === 3 && docsStep(() => setAppSubStep(2), () => setAppSubStep(4))}
          {appSubStep === 4 && (
            <ExamCourseStep
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              selectedInstitute={selectedInstitute}
              setSelectedInstitute={setSelectedInstitute}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              institutes={approvedInstitutes}
              courses={catalogueCourses}
              locked={courseLocked}
              changeRequested={!!student.examSwitchRequested}
              onRequestChange={(detail) => dispatch('requestChange', { studentId, kind: 'exam_switch', detail })}
              onRequestInstitute={(request) => dispatch('requestInstitute', { studentId, request })}
              onBack={() => setAppSubStep(3)}
              onNext={() => setAppSubStep(5)}
            />
          )}
          {appSubStep === 5 &&
            packageStep({ onBack: () => setAppSubStep(4), onNext: () => setAppSubStep(6) })}
          {appSubStep === 6 && (
            <ReviewSubmitStep
              student={student}
              guardian={guardian}
              course={activeCourse}
              institute={activeInstitute}
              documents={documents}
              packageLocked={packageLocked}
              consentState={consentState}
              goalTotal={goalTotal}
              statusIndex={statusIndex}
              alreadySubmitted={alreadySubmitted}
              submittedStatus={status}
              onSubmit={() => dispatch('submitApplication', { studentId })}
              onEditStep={(idx) => setAppSubStep(idx === 4 ? 5 : idx)}
              onBack={() => setAppSubStep(5)}
              onGoDashboard={() => setActiveNav('dashboard')}
            />
          )}
        </>
      )}

      {activeNav === 'documents' &&
        docsStep(() => setActiveNav('dashboard'), () =>
          status === 'Info requested' ? (setActiveNav('application'), setAppSubStep(6)) : setActiveNav('package')
        )}

      {activeNav === 'package' && packageStep({ standalone: true })}

      {activeNav === 'funding' && (
        <FundingPage
          contributions={contributions}
          goal={totals.verifiedNeed}
          sentNotes={sentNotes}
          demoMode={demoMode}
          onThankYou={(c, text) => dispatch('sendThankYou', { studentId, sponsorId: c.sponsorId, text })}
        />
      )}

      {activeNav === 'progress' && (
        <ProgressPage
          records={progressRecords}
          onAddRecord={(rec) => dispatch('addProgress', { studentId, record: rec })}
          exam={student.exam}
          subjects={state.catalogue.exams.find((e) => e.id === student.exam)?.subjects}
          deadline={deadline}
          instituteName={activeInstitute ? `${activeInstitute.name}, ${activeInstitute.city}` : undefined}
          showOutcome={status === 'Completed' || (status === 'Enrolled' && courseEnded)}
          outcome={student.outcome}
          onSubmitOutcome={
            ['Enrolled', 'Completed'].includes(status) || demoMode
              ? (outcome) => dispatch('submitOutcome', { studentId, outcome })
              : undefined
          }
          demoMode={demoMode}
        />
      )}

      {activeNav === 'notifications' && (
        <NotificationsPage
          notifications={notifications}
          onMarkRead={(id) => dispatch('markNotificationRead', { id })}
              onMarkAll={() => dispatch('markAllNotificationsRead', { userId: user.id })}
        />
      )}

      {activeNav === 'settings' && (
        <SettingsPage
          student={student}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          onResetDemo={resetAll}
        />
      )}
    </StudentShell>
    <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)} />
    {demoSheet}
    </>
  );
}
