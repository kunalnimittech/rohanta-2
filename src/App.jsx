import React, { useState, useEffect } from 'react';
import {
  INITIAL_STUDENT,
  INITIAL_GUARDIAN,
  INITIAL_DOCUMENTS,
  INITIAL_EXTRAS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_PROGRESS_RECORDS,
  INITIAL_NOTIFICATIONS,
  COURSES,
} from './data/mockData';
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
import { StudentShell } from './components/Layout';

export default function App() {
  const [themeMode, setThemeMode] = useState('light'); // 'light' | 'dark' | 'system'
  const [systemDark, setSystemDark] = useState(false);

  // 'signup' | 'login' | 'role' | 'app'
  const [flow, setFlow] = useState('signup');
  // 'dashboard' | 'application' | 'documents' | 'package' | 'funding' | 'progress' | 'notifications' | 'settings'
  const [activeNav, setActiveNav] = useState('dashboard');
  // 0: details, 1: guardian, 2: waiting, 3: documents, 4: course, 5: package, 6: review
  const [appSubStep, setAppSubStep] = useState(0);

  const [student, setStudent] = useState(INITIAL_STUDENT);
  const [guardian, setGuardian] = useState(INITIAL_GUARDIAN);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [guardianApprovedDocs, setGuardianApprovedDocs] = useState(true);

  const [selectedExam, setSelectedExam] = useState('JEE');
  const [selectedInstitute, setSelectedInstitute] = useState('vidya-patna');
  const [selectedCourse, setSelectedCourse] = useState('jee-12m');
  const [extras, setExtras] = useState(INITIAL_EXTRAS);
  const [packageLocked, setPackageLocked] = useState(false);

  const [contributions] = useState(INITIAL_CONTRIBUTIONS);
  const [progressRecords, setProgressRecords] = useState(
    INITIAL_PROGRESS_RECORDS
  );
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

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
  const activeCourse =
    COURSES.find((c) => c.id === selectedCourse) || COURSES[0];
  const extrasTotal = extras
    .filter((e) => !e.excluded && e.state !== 'rejected')
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const goalTotal = activeCourse.fee + extrasTotal;

  if (flow === 'signup') {
    return (
      <SignUpScreen
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onSuccess={() => setFlow('role')}
        onGoLogin={() => setFlow('login')}
      />
    );
  }

  if (flow === 'login') {
    return (
      <LoginScreen
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onSuccess={() => {
          setFlow('app');
          setActiveNav('dashboard');
        }}
        onGoSignup={() => setFlow('signup')}
      />
    );
  }

  if (flow === 'role') {
    return (
      <RoleSelectScreen
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onContinue={() => {
          setFlow('app');
          setActiveNav('application');
          setAppSubStep(0);
        }}
      />
    );
  }

  return (
    <StudentShell
      activeNav={activeNav}
      onSelectNav={(nav) => setActiveNav(nav)}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      unreadCount={unreadCount}
      onLogout={() => setFlow('login')}
    >
      {activeNav === 'dashboard' && (
        <DashboardPage
          student={student}
          contributions={contributions}
          progressRecords={progressRecords}
          onNavigate={(nav) => setActiveNav(nav)}
          onOpenUpload={() => setActiveNav('progress')}
        />
      )}

      {activeNav === 'application' && (
        <>
          {appSubStep === 0 && (
            <DetailsStep
              student={student}
              setStudent={setStudent}
              onNext={() => setAppSubStep(1)}
            />
          )}
          {appSubStep === 1 && (
            <GuardianStep
              guardian={guardian}
              setGuardian={setGuardian}
              onBack={() => setAppSubStep(0)}
              onNext={() => setAppSubStep(2)}
            />
          )}
          {appSubStep === 2 && (
            <WaitingGuardianStep
              guardian={guardian}
              setGuardian={setGuardian}
              onChangeNumber={() => setAppSubStep(1)}
              onContinue={() => {
                setGuardianApprovedDocs(true);
                setAppSubStep(3);
              }}
            />
          )}
          {appSubStep === 3 && (
            <DocumentsStep
              documents={documents}
              setDocuments={setDocuments}
              guardianApproved={guardianApprovedDocs}
              onToggleGuardianApproved={() =>
                setGuardianApprovedDocs((v) => !v)
              }
              onBack={() => setAppSubStep(2)}
              onNext={() => setAppSubStep(4)}
            />
          )}
          {appSubStep === 4 && (
            <ExamCourseStep
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              selectedInstitute={selectedInstitute}
              setSelectedInstitute={setSelectedInstitute}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              onBack={() => setAppSubStep(3)}
              onNext={() => setAppSubStep(5)}
            />
          )}
          {appSubStep === 5 && (
            <PackageStep
              courseFee={activeCourse.fee}
              extras={extras}
              setExtras={setExtras}
              packageLocked={packageLocked}
              setPackageLocked={setPackageLocked}
              onBack={() => setAppSubStep(4)}
              onNext={() => setAppSubStep(6)}
            />
          )}
          {appSubStep === 6 && (
            <ReviewSubmitStep
              student={student}
              guardian={guardian}
              course={activeCourse}
              goalTotal={goalTotal}
              onEditStep={(idx) => setAppSubStep(idx === 4 ? 5 : idx)}
              onBack={() => setAppSubStep(5)}
              onGoDashboard={() => setActiveNav('dashboard')}
            />
          )}
        </>
      )}

      {activeNav === 'documents' && (
        <DocumentsStep
          documents={documents}
          setDocuments={setDocuments}
          guardianApproved={guardianApprovedDocs}
          onToggleGuardianApproved={() => setGuardianApprovedDocs((v) => !v)}
          onBack={() => setActiveNav('dashboard')}
          onNext={() => setActiveNav('package')}
        />
      )}

      {activeNav === 'package' && (
        <PackageStep
          courseFee={activeCourse.fee}
          extras={extras}
          setExtras={setExtras}
          packageLocked={packageLocked}
          setPackageLocked={setPackageLocked}
          standalone
        />
      )}

      {activeNav === 'funding' && <FundingPage contributions={contributions} />}

      {activeNav === 'progress' && (
        <ProgressPage
          records={progressRecords}
          onAddRecord={(rec) =>
            setProgressRecords((prev) => [rec, ...prev])
          }
        />
      )}

      {activeNav === 'notifications' && (
        <NotificationsPage
          notifications={notifications}
          onMarkRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
            )
          }
        />
      )}

      {activeNav === 'settings' && (
        <SettingsPage
          student={student}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
      )}
    </StudentShell>
  );
}
