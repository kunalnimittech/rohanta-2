import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  AlertCircle,
  GraduationCap,
  Users,
  HeartHandshake,
  Building2,
  Landmark,
  Award,
  Check,
} from 'lucide-react';
import {
  Logo,
  ThemeToggle,
  PrimaryButton,
  SecondaryButton,
  FloatingInput,
  SelectableTile,
  BottomSheet,
} from '../components/ui';

function AuthSplitShell({ isDark, onToggleTheme, children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] flex flex-col">
      {/* Top bar */}
      <header className="max-w-[1280px] w-full mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5">
          <Logo className="w-7 h-7" />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            Sikshit Bharat
          </span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </header>

      <div className="flex-1 max-w-[1280px] w-full mx-auto px-5 md:px-8 pb-24 md:pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left half (Desktop large soft rounded panel) */}
        <div className="hidden lg:flex flex-col justify-between p-12 rounded-[32px] bg-[#F4F4F5] dark:bg-[#151515] min-h-[580px]">
          <div>
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-white dark:bg-[#222224] text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] shadow-soft">
              Registered Educational Trust
            </span>
            <h1 className="mt-8 text-[44px] leading-[1.1] font-semibold tracking-[-0.03em] text-[#0A0A0A] dark:text-[#FAFAFA]">
              Every deserving student deserves a sponsor.
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-[#52525B] dark:text-[#A1A1AA] max-w-md">
              A registered trust that verifies students and pays their fees
              directly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#ECECEE] dark:border-[#262626]">
            <div>
              <div className="text-[32px] font-bold tracking-[-0.03em]">
                1,240+
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                Students supported
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-[-0.03em]">
                480+
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                Sponsors
              </div>
            </div>
            <div>
              <div className="text-[32px] font-bold tracking-[-0.03em]">
                ₹4.2 Cr
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                Funds raised
              </div>
            </div>
          </div>
        </div>

        {/* Mobile short header */}
        <div className="lg:hidden pt-2">
          <h1 className="text-[32px] leading-[1.15] font-semibold tracking-[-0.025em]">
            Every deserving student deserves a sponsor.
          </h1>
          <p className="mt-2.5 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
            A registered trust that verifies students and pays their fees
            directly.
          </p>
        </div>

        {/* Right half form */}
        <div className="w-full max-w-[440px] mx-auto">{children}</div>
      </div>
    </div>
  );
}

export function SignUpScreen({
  isDark,
  onToggleTheme,
  onSuccess,
  onGoLogin,
}) {
  const [name, setName] = useState('Priya Kumari');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [email, setEmail] = useState('priya.kumari2010@example.in');
  const [password, setPassword] = useState('••••••••••');
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;
    onSuccess();
  };

  return (
    <AuthSplitShell isDark={isDark} onToggleTheme={onToggleTheme}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.025em]">
            Create your account
          </h2>
          <p className="mt-1.5 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
            Start your verified scholarship application in minutes.
          </p>
        </div>

        <FloatingInput
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <FloatingInput
          label="Mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <FloatingInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FloatingInput
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="p-2 text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          }
        />

        <label className="flex items-start gap-3 pt-1 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
              agreed
                ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]'
                : 'bg-[#F4F4F5] dark:bg-[#151515] border border-[#D4D4D8] dark:border-[#3F3F46]'
            }`}
          >
            {agreed && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
          </button>
          <span className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] leading-snug">
            I agree to Sikshit Bharat&apos;s Terms of Trust and Privacy Policy.
          </span>
        </label>

        {/* Desktop button */}
        <div className="hidden md:block pt-2">
          <PrimaryButton type="submit" disabled={!agreed} className="w-full">
            Create account
          </PrimaryButton>
        </div>

        {/* Mobile sticky bottom button */}
        <div className="md:hidden fixed bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#ECECEE] dark:border-[#262626] z-30">
          <PrimaryButton type="submit" disabled={!agreed} className="w-full">
            Create account
          </PrimaryButton>
        </div>

        <p className="text-center text-[14px] text-[#52525B] dark:text-[#A1A1AA] pt-2">
          Already registered?{' '}
          <button
            type="button"
            onClick={onGoLogin}
            className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA] underline underline-offset-4"
          >
            Log in
          </button>
        </p>
      </form>
    </AuthSplitShell>
  );
}

export function LoginScreen({
  isDark,
  onToggleTheme,
  onSuccess,
  onGoSignup,
}) {
  const [identifier, setIdentifier] = useState('+91 98765 43210');
  const [password, setPassword] = useState('priya@2026');
  const [showPw, setShowPw] = useState(false);
  const [showError, setShowError] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim() || password.length < 4) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onSuccess();
  };

  return (
    <AuthSplitShell isDark={isDark} onToggleTheme={onToggleTheme}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-6">
          <h2 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.025em]">
            Welcome back
          </h2>
          <p className="mt-1.5 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
            Log in to track your application and sponsorship.
          </p>
        </div>

        {showError && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#F4F4F5] dark:bg-[#151515] border border-[#0A0A0A] dark:border-[#FAFAFA] text-[13px] font-medium animate-pop-in">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Mobile number or password is incorrect</span>
          </div>
        )}

        <FloatingInput
          label="Mobile or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <FloatingInput
          label="Password"
          type={showPw ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="p-2 text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
            >
              {showPw ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between text-[13px]">
          <button
            type="button"
            onClick={() => setShowError(!showError)}
            className="text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
          >
            {showError ? 'Clear error state' : 'Preview error state'}
          </button>
          <button
            type="button"
            onClick={() => {
              setResetSent(false);
              setForgotOpen(true);
            }}
            className="font-medium text-[#0A0A0A] dark:text-[#FAFAFA] underline underline-offset-4"
          >
            Forgot password
          </button>
        </div>

        <div className="hidden md:block pt-2">
          <PrimaryButton type="submit" className="w-full">
            Log in
          </PrimaryButton>
        </div>

        <div className="md:hidden fixed bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#ECECEE] dark:border-[#262626] z-30">
          <PrimaryButton type="submit" className="w-full">
            Log in
          </PrimaryButton>
        </div>

        <p className="text-center text-[14px] text-[#52525B] dark:text-[#A1A1AA] pt-2">
          New to Sikshit Bharat?{' '}
          <button
            type="button"
            onClick={onGoSignup}
            className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA] underline underline-offset-4"
          >
            Sign up
          </button>
        </p>
      </form>

      <BottomSheet
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset password"
      >
        {resetSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto animate-pop-in">
              <Check className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
              We&apos;ve sent a password reset link to your registered email.
            </p>
            <PrimaryButton
              onClick={() => setForgotOpen(false)}
              className="w-full"
            >
              Done
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
              Enter your registered mobile or email and we&apos;ll send a reset
              link.
            </p>
            <FloatingInput
              label="Mobile or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <PrimaryButton
              onClick={() => setResetSent(true)}
              className="w-full"
            >
              Send reset link
            </PrimaryButton>
          </div>
        )}
      </BottomSheet>
    </AuthSplitShell>
  );
}

export function RoleSelectScreen({ isDark, onToggleTheme, onContinue }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [nonStudentSheet, setNonStudentSheet] = useState(false);

  const roles = [
    {
      id: 'student',
      title: 'Student',
      subtitle: 'Preparing for JEE, NEET or CUET',
      icon: GraduationCap,
    },
    {
      id: 'guardian',
      title: 'Parent / Guardian',
      subtitle: 'Approve and track your child’s application',
      icon: Users,
    },
    {
      id: 'individual_sponsor',
      title: 'Individual Sponsor',
      subtitle: 'Fund verified students directly',
      icon: HeartHandshake,
    },
    {
      id: 'csr',
      title: 'Company (CSR)',
      subtitle: 'Sponsor cohorts with impact reports',
      icon: Building2,
    },
    {
      id: 'ngo',
      title: 'NGO / Trust',
      subtitle: 'Partner to verify and refer scholars',
      icon: Landmark,
    },
    {
      id: 'representative',
      title: 'MP / MLA',
      subtitle: 'Support students from your constituency',
      icon: Award,
    },
  ];

  const handleContinue = () => {
    if (!selectedRole) return;
    if (selectedRole === 'student') {
      onContinue();
    } else {
      setNonStudentSheet(true);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] flex flex-col">
      <header className="max-w-[1280px] w-full mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
        <div className="inline-flex items-center gap-2.5">
          <Logo className="w-7 h-7" />
          <span className="text-[17px] font-semibold tracking-[-0.02em]">
            Sikshit Bharat
          </span>
        </div>
        <ThemeToggle isDark={isDark} onToggleTheme={onToggleTheme} />
      </header>

      <main className="flex-1 max-w-[1040px] w-full mx-auto px-5 md:px-8 py-8 md:py-12 pb-28">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-[32px] md:text-[42px] font-semibold tracking-[-0.03em]">
            Tell us who you are
          </h1>
          <p className="mt-2.5 text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
            We&apos;ll set up the right dashboard for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((r) => (
            <SelectableTile
              key={r.id}
              icon={r.icon}
              title={r.title}
              subtitle={r.subtitle}
              selected={selectedRole === r.id}
              onClick={() => setSelectedRole(r.id)}
            />
          ))}
        </div>

        <div className="hidden md:flex justify-center mt-10">
          <PrimaryButton
            onClick={handleContinue}
            disabled={!selectedRole}
            className="min-w-[240px]"
          >
            Continue
          </PrimaryButton>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 inset-x-0 p-4 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#ECECEE] dark:border-[#262626] z-30">
        <PrimaryButton
          onClick={handleContinue}
          disabled={!selectedRole}
          className="w-full"
        >
          Continue
        </PrimaryButton>
      </div>

      <BottomSheet
        open={nonStudentSheet}
        onClose={() => setNonStudentSheet(false)}
        title="Student module preview"
      >
        <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-6">
          This interactive prototype covers Sign up, Log in, Role selection, and
          the full Student module. Select <strong>Student</strong> to explore
          the application and student dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <PrimaryButton
            onClick={() => {
              setSelectedRole('student');
              setNonStudentSheet(false);
              onContinue();
            }}
            className="flex-1"
          >
            Continue as Student
          </PrimaryButton>
          <SecondaryButton
            onClick={() => setNonStudentSheet(false)}
            className="flex-1"
          >
            Close
          </SecondaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}
