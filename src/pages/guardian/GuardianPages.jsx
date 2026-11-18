// Guardian module (Part 3): consent landing, My child, Documents, Funding.
// Guardians see their own child's details, but never edit the application:
// the only write actions are consent and uploading a document the trust asks for.
import React, { useState } from 'react';
import {
  Check,
  Shield,
  ShieldCheck,
  EyeOff,
  Eye,
  FileText,
  AlertCircle,
  Clock,
  GraduationCap,
  IndianRupee,
  ClipboardCheck,
  CalendarDays,
  ArrowRight,
  Link2Off,
  Upload,
} from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  FloatingInput,
  FloatingSelect,
  StatusChip,
  StatusTracker,
  ProgressBar,
  BottomSheet,
  ConfirmSheet,
  OtpInput,
  Stepper,
  EmptyState,
  FileDrop,
  Toast,
  SectionLabel,
} from '../../components/ui';

const DEMO_OTP = '123456';
const RELATIONS = ['Mother', 'Father', 'Legal guardian', 'Grandparent', 'Uncle', 'Aunt', 'Elder sibling'];

/** The guardian's linked child, with everything the pages need. */
function useChild(user) {
  const { state } = useStore();
  const guardian = state.guardians.find((g) => g.userId === user.id);
  const student = guardian && sel.getStudent(state, guardian.studentId);
  if (!student) return { state, guardian: null, student: null };
  const course = sel.getCourse(state, student.courseId);
  return {
    state,
    guardian,
    student,
    first: student.fullName.split(' ')[0],
    consentState: sel.effectiveConsentState(guardian),
    course,
    institute: course ? sel.getInstitute(state, course.instituteId) : null,
    totals: sel.studentPackageTotals(state, student.id),
    // Guardian sees money once the trust has matched it with the bank.
    raised: sel.studentConfirmed(state, student.id),
    percent: Math.min(100, Math.round((sel.studentConfirmed(state, student.id) / (sel.studentPackageTotals(state, student.id).verifiedNeed || 1)) * 100)),
    docs: sel.studentDocuments(state, student.id),
    verification: sel.verificationProgress(state, student.id),
    instalment: sel.nextInstalment(state, student.id),
    statusIndex: sel.studentStatusIndex(state, student.id),
    pkg: sel.getPackage(state, student.id),
  };
}

function NoChild() {
  return (
    <EmptyState
      icon={Link2Off}
      title="No application linked yet"
      body="When your child adds you as their guardian, the consent link connects your account to their application."
    />
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] ${className}`}>{children}</div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-[14px]">
      <span className="text-[#52525B] dark:text-[#A1A1AA]">{label}</span>
      <span className="font-semibold text-right">{value}</span>
    </div>
  );
}

function PrivacyCard() {
  const can = [
    'First name and surname initial',
    'Class, district and state',
    'Exam, institute and course',
    'Verified need and amount funded',
    'Class 10 marks band and family income band',
    'The short story your child wrote',
  ];
  const never = [
    'Phone number, email or address',
    'Aadhaar or bank details',
    'Exact marks or full surname',
    'Photo, unless you allow it below',
  ];
  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] shadow-soft flex items-center justify-center shrink-0">
          <Shield className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </span>
        <div className="text-[16px] font-semibold">What sponsors can and cannot see</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-[14px]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
            <Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> Sponsors see
          </div>
          {can.map((c) => (
            <div key={c} className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
              <span>{c}</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
            <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} /> Never shown
          </div>
          {never.map((c) => (
            <div key={c} className="flex items-start gap-2 text-[#52525B] dark:text-[#A1A1AA]">
              <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">–</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function CheckTile({ checked, onToggle, title, body }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={`w-full text-left p-5 md:p-6 rounded-[24px] flex items-start gap-4 transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25 ${
        checked
          ? 'bg-white dark:bg-[#151515] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA] shadow-soft'
          : 'bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F]'
      }`}
    >
      <span
        className={`mt-0.5 w-6 h-6 rounded-[8px] flex items-center justify-center shrink-0 ${
          checked
            ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]'
            : 'bg-white dark:bg-[#222224] border border-[#D4D4D8] dark:border-[#3F3F46]'
        }`}
      >
        {checked && <Check className="w-4 h-4 animate-pop-in" strokeWidth={2.5} />}
      </span>
      <span>
        <span className="block text-[16px] font-semibold">{title}</span>
        {body && <span className="block mt-1 text-[14px] leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">{body}</span>}
      </span>
    </button>
  );
}

function ResultState({ icon: Icon, solid, title, body, children }) {
  return (
    <div className="max-w-[600px] mx-auto text-center py-6 md:py-12 animate-slide-in">
      <div className="w-20 h-20 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center mx-auto mb-6 shadow-soft">
        {solid ? (
          <span className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center animate-pop-in">
            <Icon className="w-6 h-6" strokeWidth={2.25} />
          </span>
        ) : (
          <Icon className="w-8 h-8" strokeWidth={1.75} />
        )}
      </div>
      <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">{title}</h1>
      {body && <p className="mt-3 text-[16px] text-[#52525B] dark:text-[#A1A1AA]">{body}</p>}
      {children && <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">{children}</div>}
    </div>
  );
}

// --- 3.1 Consent landing -------------------------------------------------------
export function GuardianConsentPage({ user, onNavigate }) {
  const { dispatch } = useStore();
  const c = useChild(user);
  const g = c.guardian;
  const [name, setName] = useState(g?.name || '');
  const [relation, setRelation] = useState(g?.relation || 'Mother');
  const [confirmed, setConfirmed] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpOk, setOtpOk] = useState(false);
  const [agree, setAgree] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [wrongOpen, setWrongOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [askedNew, setAskedNew] = useState(false);

  if (!c.student) return <NoChild />;
  const { student, first, consentState } = c;

  if (consentState === 'approved') {
    return (
      <ResultState
        icon={Check}
        solid
        title="Consent given"
        body={`You approved ${first}'s application${g.approvedDate ? ` on ${g.approvedDate}` : ''}. The trust will now verify it.`}
      >
        <PrimaryButton onClick={() => onNavigate('child')} className="min-w-[220px]">
          See {first}&apos;s application
          <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
        </PrimaryButton>
      </ResultState>
    );
  }

  if (consentState === 'declined') {
    return (
      <ResultState
        icon={AlertCircle}
        title="You declined consent"
        body={`${first}'s application cannot be verified or listed without your consent.${g.declineReason ? ` Your reason: ${g.declineReason}` : ''} If this was a mistake, ask ${first} to send the link again.`}
      >
        <SecondaryButton onClick={() => onNavigate('child')}>See the application</SecondaryButton>
      </ResultState>
    );
  }

  if (consentState === 'expired') {
    return (
      <ResultState
        icon={Clock}
        title="This consent link has expired"
        body={`Consent links work for 48 hours. ${askedNew ? `We have asked ${first} to send you a new one.` : `Ask ${first} for a new link, or tap below and we will remind them.`}`}
      >
        <PrimaryButton
          disabled={askedNew}
          onClick={() => {
            dispatch('requestNewConsentLink', { studentId: student.id });
            setAskedNew(true);
          }}
        >
          {askedNew ? 'Request sent' : 'Ask for a new link'}
        </PrimaryButton>
      </ResultState>
    );
  }

  if (consentState === 'not_sent') {
    return (
      <ResultState
        icon={Clock}
        title="No consent request yet"
        body={`${first} has not sent you a consent link yet. You will get an SMS when they do.`}
      />
    );
  }

  // Pending: the 3-step consent flow
  const step = !confirmed ? 0 : !otpOk ? 1 : 2;
  const course = c.course;
  const relationOptions = RELATIONS.includes(relation) ? RELATIONS : [relation, ...RELATIONS];

  return (
    <div className="space-y-8 pb-12 max-w-[760px] animate-slide-in">
      <div className="space-y-2">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Consent for {first}&apos;s application
        </h1>
        <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
          {student.fullName} has asked Sikshit Bharat, a registered educational trust, to sponsor their coaching fees.
          The trust pays the institute directly. No money comes to you or your child.
        </p>
      </div>

      {/* What they are applying for */}
      <Card className="space-y-3">
        <SectionLabel>What {first} is applying for</SectionLabel>
        <Row label="Exam" value={course ? course.exam : 'Not chosen yet'} />
        <Row label="Institute" value={c.institute ? `${c.institute.name}, ${c.institute.city}` : 'Not chosen yet'} />
        <Row label="Course" value={course ? course.name : 'Not chosen yet'} />
        <Row label="Package total" value={c.totals.total ? formatINR(c.totals.total) : 'Being prepared'} />
      </Card>

      {/* Data shared */}
      <Card className="space-y-3">
        <SectionLabel>What the trust receives</SectionLabel>
        <p className="text-[14px] leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
          {first}&apos;s name, date of birth, school, class, Class 10 marks, family income, statement of purpose and
          documents (marksheet, Aadhaar, income certificate, school ID, photo). A trust verifier may call you and{' '}
          {first} to confirm these details. Only trust staff can see the documents.
        </p>
      </Card>

      <PrivacyCard />

      <Stepper steps={['Confirm details', 'Verify mobile', 'Give consent']} current={step} />

      {/* Step 1 */}
      <Card className="space-y-4 [&_input]:bg-white [&_select]:bg-white dark:[&_input]:bg-[#222224] dark:[&_select]:bg-[#222224]">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[16px] font-semibold">1. Confirm who you are</div>
          {confirmed && <StatusChip status="verified" label="Confirmed" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput label="Your name" value={name} onChange={(e) => setName(e.target.value)} disabled={confirmed} />
          <FloatingSelect label={`Relation to ${first}`} value={relation} onChange={(e) => setRelation(e.target.value)} options={relationOptions} />
        </div>
        {!confirmed ? (
          <PrimaryButton onClick={() => name.trim().length > 1 && setConfirmed(true)} disabled={name.trim().length < 2} className="h-12 px-6 text-[14px]">
            This is me
          </PrimaryButton>
        ) : (
          <button type="button" onClick={() => { setConfirmed(false); setOtpOk(false); setOtp(''); }} className="text-[13px] font-medium underline underline-offset-4 text-[#52525B] dark:text-[#A1A1AA]">
            Edit
          </button>
        )}
      </Card>

      {/* Step 2 */}
      <Card className={`space-y-4 [&_input]:bg-white [&_select]:bg-white dark:[&_input]:bg-[#222224] dark:[&_select]:bg-[#222224] ${step < 1 ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="text-[16px] font-semibold">2. Verify your mobile</div>
          {otpOk && <StatusChip status="verified" label="Verified" />}
        </div>
        {!otpOk ? (
          <>
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">We sent a 6-digit code to {g.mobile || 'your mobile'}.</p>
            <OtpInput value={otp} demo={c.state.settings.demoMode} autoFocus={false} onChange={(v) => { setOtp(v); setOtpError(false); }} />
            {otpError && <p className="text-[13px] font-medium">That code is not right. Please try again.</p>}
            <PrimaryButton
              disabled={otp.length !== 6}
              onClick={() => (otp === DEMO_OTP ? setOtpOk(true) : setOtpError(true))}
              className="h-12 px-6 text-[14px]"
            >
              Verify
            </PrimaryButton>
          </>
        ) : (
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">{g.mobile} verified.</p>
        )}
      </Card>

      {/* Step 3 */}
      <div className={`space-y-4 ${step < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="text-[16px] font-semibold px-1">3. Your consent</div>
        <CheckTile
          checked={agree}
          onToggle={() => setAgree((v) => !v)}
          title="I consent"
          body={`I am ${first}'s ${relation.toLowerCase()}. I allow Sikshit Bharat Educational Trust to verify ${first}'s details and documents, share the limited profile above with verified sponsors, and pay the coaching fee directly to the institute. I can ask the trust to withdraw the application at any time.`}
        />
        <CheckTile
          checked={photo}
          onToggle={() => setPhoto((v) => !v)}
          title={`Show ${first}'s photo to sponsors (optional)`}
          body="If you leave this off, sponsors never see a photo."
        />
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <PrimaryButton
            disabled={!agree || step < 2}
            onClick={() =>
              dispatch('guardianConsent', { studentId: student.id, decision: 'approved', name: name.trim(), relation, photoConsent: photo })
            }
            className="sm:min-w-[220px]"
          >
            <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
            Give consent
          </PrimaryButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 border-t border-[#ECECEE] dark:border-[#262626]">
        <button type="button" onClick={() => setDeclineOpen(true)} className="pt-4 text-[14px] font-medium underline underline-offset-4">
          Decline
        </button>
        <button type="button" onClick={() => setWrongOpen(true)} className="pt-4 text-[14px] font-medium text-[#52525B] dark:text-[#A1A1AA] underline underline-offset-4">
          This link looks wrong
        </button>
      </div>

      <ConfirmSheet
        open={declineOpen}
        title="Decline consent?"
        body={`${first}'s application will stop. The trust cannot verify or list it without your consent. Please tell us why so we can help.`}
        confirmLabel="Decline consent"
        destructive
        reasonRequired
        onClose={() => setDeclineOpen(false)}
        onConfirm={(reason) => {
          setDeclineOpen(false);
          dispatch('guardianConsent', { studentId: student.id, decision: 'declined', reason });
        }}
      />
      <ConfirmSheet
        open={wrongOpen}
        title="Report this link"
        body="If you don't know this student or the details look wrong, tell us. The trust team will call you. Nothing is approved."
        confirmLabel="Send report"
        reasonRequired
        reasonLabel="What looks wrong?"
        onClose={() => setWrongOpen(false)}
        onConfirm={(reason) => {
          setWrongOpen(false);
          dispatch('reportConsentLink', { studentId: student.id, reason });
          setToast('Thanks. The trust team will call you.');
        }}
      />
      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}

// --- shared document list ---------------------------------------------------------
const GUARDIAN_UPLOADABLE = ['income', 'caste_ews'];

function DocumentList({ c, compact = false }) {
  const { dispatch } = useStore();
  const [uploadDoc, setUploadDoc] = useState(null);
  const [file, setFile] = useState(null);
  const [toast, setToast] = useState('');
  const requested = (d) =>
    GUARDIAN_UPLOADABLE.includes(d.id) &&
    (d.status === 'rejected' || (c.student.status === 'Info requested' && d.status === 'not_uploaded'));
  const docs = compact ? c.docs.slice(0, 4) : c.docs;

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div key={doc.id} className="p-4 md:px-6 md:py-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold">{doc.name}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {doc.status === 'rejected' && doc.rejectReason ? `Reason: ${doc.rejectReason}` : doc.detail}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <StatusChip status={doc.status} />
            {!compact && requested(doc) && (
              <button
                type="button"
                onClick={() => { setFile(null); setUploadDoc(doc); }}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] text-[13px] font-medium active:scale-[0.97] transition-transform"
              >
                <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
                Upload
              </button>
            )}
          </div>
        </div>
      ))}

      <BottomSheet open={!!uploadDoc} onClose={() => setUploadDoc(null)} title={uploadDoc ? `Upload ${uploadDoc.name}` : 'Upload'}>
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            The trust asked for this document. It goes to the verifier, not to sponsors.
          </p>
          <FileDrop file={file} onFile={setFile} />
          <PrimaryButton
            disabled={!file}
            onClick={() => {
              dispatch('uploadDocument', { studentId: c.student.id, docId: uploadDoc.id, file, byGuardian: true });
              setUploadDoc(null);
              setToast('Uploaded. The trust will check it.');
            }}
            className="w-full"
          >
            Upload file
          </PrimaryButton>
        </div>
      </BottomSheet>
      <Toast message={toast} onDone={() => setToast('')} />
    </div>
  );
}

function verificationText(c) {
  const st = c.student.status;
  if (['Listed', 'Partially funded', 'Fully funded', 'Enrolled', 'Completed'].includes(st)) return { chip: 'verified', label: 'Verified', text: 'Verified and approved by the trust.' };
  if (st === 'Under verification')
    return {
      chip: 'pending',
      label: 'In progress',
      text: c.verification?.verifierFirst
        ? `${c.verification.verifierFirst} from the trust is checking it · ${c.verification.done} of ${c.verification.total} checks done`
        : 'Waiting for a trust verifier to be assigned.',
    };
  if (st === 'Info requested') return { chip: 'needs_review', label: 'Info requested', text: c.student.infoRequest || 'The trust needs more information.' };
  if (st === 'Rejected') return { chip: 'rejected', label: 'Not approved', text: c.student.rejectReason || 'The application was not approved.' };
  return { chip: 'not_uploaded', label: 'Not submitted', text: `${c.first} has not submitted the application yet.` };
}

// --- 3.2 My child -------------------------------------------------------------------
export function GuardianChildPage({ user, onNavigate }) {
  const c = useChild(user);
  if (!c.student) return <NoChild />;
  const { student, first, totals, course } = c;
  const v = verificationText(c);
  const inst = c.instalment;

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[32px] md:text-[44px] font-semibold tracking-[-0.03em]">{first}&apos;s application</h1>
          <span className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">ID {student.id}</span>
        </div>
        <StatusTracker currentStepIndex={c.statusIndex} />
      </div>

      {c.consentState === 'pending' && (
        <div className="p-6 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[15px] font-semibold">{first} is waiting for your consent</div>
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">Nothing moves forward until you approve.</p>
          </div>
          <PrimaryButton onClick={() => onNavigate('consent')} className="h-12 px-6 text-[14px] shrink-0">Review and consent</PrimaryButton>
        </div>
      )}
      {student.status === 'Info requested' && (
        <div className="p-6 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[15px] font-semibold">The trust needs more information</div>
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">{student.infoRequest}</p>
          </div>
          <SecondaryButton onClick={() => onNavigate('documents')} className="h-12 px-6 text-[14px] shrink-0">See documents</SecondaryButton>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-2 md:row-span-2 p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Funding</div>
            <div className="mt-4 text-[44px] md:text-[52px] leading-none font-bold tracking-[-0.035em]">{formatINR(c.raised)}</div>
            <div className="mt-2 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">raised of {formatINR(totals.verifiedNeed)}</div>
          </div>
          <div className="space-y-3 mt-8">
            <div className="flex justify-between text-[13px] font-semibold">
              <span>{c.percent}% funded</span>
              <span>{formatINR(Math.max(0, totals.verifiedNeed - c.raised))} to go</span>
            </div>
            <ProgressBar percent={c.percent} />
          </div>
        </div>

        <Card className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[15px] font-semibold">Package</div>
            {c.pkg?.locked ? <StatusChip status="locked" label="Locked" /> : <StatusChip status="pending" label="Not locked" />}
          </div>
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Package total</div>
              <div className="font-bold text-[15px] mt-0.5">{formatINR(totals.total)}</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Monthly need</div>
              <div className="font-semibold text-[15px] mt-0.5">{formatINR(totals.monthlyNeed)}</div>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[15px] font-semibold">Verification</div>
            <StatusChip status={v.chip} label={v.label} />
          </div>
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">{v.text}</p>
          {student.status === 'Under verification' && c.verification && (
            <ProgressBar percent={(c.verification.done / c.verification.total) * 100} />
          )}
        </Card>

        <Card className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <GraduationCap className="w-[18px] h-[18px]" strokeWidth={1.75} />
            Course
          </div>
          {course ? (
            <>
              <div className="text-[14px] font-medium">{course.name}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {c.institute?.name}, {c.institute?.city} · {course.exam} · starts {course.startDate}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{first} has not chosen a course yet.</div>
          )}
        </Card>

        <Card className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2 text-[15px] font-semibold">
            <CalendarDays className="w-[18px] h-[18px]" strokeWidth={1.75} />
            Upcoming instalment
          </div>
          {inst && inst.instalment ? (
            <>
              <div className="text-[22px] font-bold tracking-[-0.02em]">{formatINR(inst.instalment.amount)}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                Instalment {inst.instalment.no} of {inst.total} · due {formatDate(inst.instalment.dueDate)} · paid by the trust to the institute
              </div>
            </>
          ) : inst && inst.allPaid ? (
            <div className="text-[14px] font-medium">All instalments paid</div>
          ) : (
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Shown once a course is chosen.</div>
          )}
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em]">Documents</h2>
          <button type="button" onClick={() => onNavigate('documents')} className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]">
            View all
          </button>
        </div>
        <DocumentList c={c} compact />
      </section>

      <p className="flex items-center gap-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
        <Shield className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        <span>This page is read-only. Only {first} can change the application.</span>
      </p>
    </div>
  );
}

// --- 3.3 Documents and Funding -----------------------------------------------------
export function GuardianDocumentsPage({ user }) {
  const c = useChild(user);
  if (!c.student) return <NoChild />;
  return (
    <div className="space-y-8 pb-12 max-w-[760px]">
      <div className="space-y-2">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">Documents</h1>
        <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
          {c.first}&apos;s documents and where each one stands. You can upload a document only when the trust asks you for it.
        </p>
      </div>
      <DocumentList c={c} />
    </div>
  );
}

export function GuardianFundingPage({ user }) {
  const c = useChild(user);
  const { state } = useStore();
  if (!c.student) return <NoChild />;
  const rows = sel.studentContributions(state, c.student.id);
  return (
    <div className="space-y-8 pb-12">
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">Funding</h1>
      <Card className="space-y-4 md:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-[40px] md:text-[48px] font-bold tracking-[-0.035em] leading-none">{formatINR(c.raised)}</div>
            <div className="text-[15px] text-[#52525B] dark:text-[#A1A1AA] mt-2">raised of {formatINR(c.totals.verifiedNeed)} goal</div>
          </div>
          <div className="text-[15px] font-semibold">{c.percent}%</div>
        </div>
        <ProgressBar percent={c.percent} />
        <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] flex items-center gap-2">
          <IndianRupee className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          Money is held by the trust and paid straight to the institute against its fee invoice.
        </p>
      </Card>
      {rows.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No sponsors yet" body={`Sponsors can fund ${c.first} once the trust lists the application.`} />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold">{r.sponsor}</span>
                  {r.state === 'pending' && <StatusChip status="pending" label="Confirming" />}
                </div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">{r.type} · {r.date}</div>
              </div>
              <div className="text-[17px] font-bold tracking-[-0.01em] shrink-0">{formatINR(r.amount)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
