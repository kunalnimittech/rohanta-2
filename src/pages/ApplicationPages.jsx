import React, { useState } from 'react';
import {
  Check,
  Phone,
  ShieldCheck,
  FileText,
  Upload,
  Search,
  Lock,
  Plus,
  Trash2,
  BookOpen,
  Stethoscope,
  GraduationCap,
  AlertCircle,
  Unlock,
  MessageCircle,
  ExternalLink,
  CalendarDays,
} from 'lucide-react';
import {
  APP_STEPS,
  INSTITUTES,
  COURSES,
  formatINR,
  formatDate,
} from '../data/mockData';
import {
  checkEligibility,
  INCOME_BANDS,
  EXTRA_CATEGORY_CAPS,
} from '../data/rules';
import {
  PrimaryButton,
  SecondaryButton,
  DestructiveButton,
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  SelectableTile,
  StatusChip,
  BottomSheet,
  StatusTracker,
  ConfirmSheet,
  FileDrop,
  Amount,
} from '../components/ui';

// Shared support sheet ("Talk to us" / "Contact support").
export function SupportSheet({ open, onClose, children }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Trust support">
      <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-5">
        {children ||
          'Our student team can talk you through eligibility, documents and how Sikshit Bharat pays coaching fees directly to the institute.'}
      </p>
      <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] text-[14px] space-y-1 mb-6">
        <div className="font-semibold">Helpline · Mon–Sat, 9 AM – 6 PM</div>
        <div className="text-[#52525B] dark:text-[#A1A1AA]">
          support@sikshitbharat.org · +91 11 4000 8120
        </div>
      </div>
      <PrimaryButton onClick={onClose} className="w-full">
        Got it
      </PrimaryButton>
    </BottomSheet>
  );
}

// Calm outlined notice card (no red). Used for eligibility and info requests.
export function NoticeCard({ chip, title, children, actions }) {
  return (
    <div className="p-6 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 space-y-3 animate-pop-in">
      {chip && <StatusChip status="needs_review" label={chip} />}
      {title && <div className="text-[17px] font-semibold tracking-[-0.01em]">{title}</div>}
      <div className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed">{children}</div>
      {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
    </div>
  );
}

export function ApplicationProgressHeader({ stepIndex }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-[13px] mb-3">
        <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">
          Step {stepIndex + 1} of {APP_STEPS.length} ·{' '}
          {APP_STEPS[stepIndex].label}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#52525B] dark:text-[#A1A1AA] font-medium">
          <Check className="w-3.5 h-3.5" strokeWidth={2} />
          Draft saved
        </span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {APP_STEPS.map((s, idx) => (
          <div
            key={s.id}
            className={`h-1.5 rounded-full transition-colors duration-300 ${
              idx <= stepIndex
                ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]'
                : 'bg-[#ECECEE] dark:bg-[#262626]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function DetailsStep({ student, setStudent, onNext, settings }) {
  const [result, setResult] = useState(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const update = (key) => (e) => {
    setResult(null);
    setStudent((prev) => ({ ...prev, [key]: e.target.value }));
  };
  const bandOptions = INCOME_BANDS.map((b) => b.label);
  if (student.incomeBand && !bandOptions.includes(student.incomeBand))
    bandOptions.push(student.incomeBand);

  const handleContinue = () => {
    const r = checkEligibility(student, settings);
    setResult(r);
    if (r.ok) onNext();
  };

  return (
    <div className="animate-slide-in max-w-[720px] pb-24 md:pb-6">
      <ApplicationProgressHeader stepIndex={0} />
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] mb-8">
        Tell us about you
      </h1>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
            Personal details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="Full name"
              value={student.fullName}
              onChange={update('fullName')}
            />
            <FloatingInput
              label="Date of birth"
              type="date"
              value={student.dob}
              onChange={update('dob')}
            />
            <FloatingSelect
              label="Gender"
              value={student.gender}
              onChange={update('gender')}
              options={['Female', 'Male', 'Other', 'Prefer not to say']}
            />
            <FloatingInput
              label="Mobile"
              value={student.mobile}
              onChange={update('mobile')}
            />
            <FloatingInput
              label="Email (optional)"
              type="email"
              value={student.email}
              onChange={update('email')}
              className="md:col-span-2"
            />
            <FloatingInput
              label="State"
              value={student.state}
              onChange={update('state')}
            />
            <FloatingInput
              label="District"
              value={student.district}
              onChange={update('district')}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
            Academics &amp; family
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingInput
              label="School"
              value={student.school}
              onChange={update('school')}
              className="md:col-span-2"
            />
            <FloatingSelect
              label="Board"
              value={student.board}
              onChange={update('board')}
              options={['CBSE', 'CISCE', 'State']}
            />
            <FloatingSelect
              label="Class"
              value={student.studentClass}
              onChange={update('studentClass')}
              options={['11', '12', 'Dropper']}
            />
            <FloatingInput
              label="Class 10 marks %"
              value={student.class10Marks}
              onChange={update('class10Marks')}
            />
            <FloatingSelect
              label="Family income band"
              value={student.incomeBand}
              onChange={update('incomeBand')}
              options={bandOptions}
            />
          </div>
          <FloatingTextarea
            label="Statement of purpose"
            value={student.sop}
            onChange={update('sop')}
            rows={4}
            maxWords={150}
          />
        </section>

        {result && !result.ok && (
          <NoticeCard
            chip="Not eligible"
            title="You may not be eligible this year"
            actions={
              <SecondaryButton
                onClick={() => setSupportOpen(true)}
                className="h-11 px-5 text-[14px]"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
                Talk to us
              </SecondaryButton>
            }
          >
            <ul className="space-y-1">
              {result.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="mt-2">
              If something above is wrong, correct it and tap Continue again.
            </p>
          </NoticeCard>
        )}
      </div>

      <div className="hidden md:flex justify-end mt-8">
        <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20">
        <PrimaryButton onClick={handleContinue} className="w-full">
          Continue
        </PrimaryButton>
      </div>

      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)}>
        Tell us about your situation. The trust reviews special cases, and we
        can tell you when the next intake opens.
      </SupportSheet>
    </div>
  );
}

export function GuardianStep({
  guardian,
  setGuardian,
  onNext,
  onBack,
  isAdult = false,
  onSkip,
}) {
  const update = (key) => (e) =>
    setGuardian((prev) => ({ ...prev, [key]: e.target.value }));
  const ready =
    (guardian.name || '').trim().length > 1 &&
    (guardian.mobile || '').replace(/\D/g, '').length >= 10;
  const send = () => ready && onNext();

  return (
    <div className="animate-slide-in max-w-[560px] pb-24 md:pb-6">
      <ApplicationProgressHeader stepIndex={1} />
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
        Add your guardian
      </h1>
      <p className="mt-2 text-[15px] text-[#52525B] dark:text-[#A1A1AA] mb-8">
        {isAdult
          ? 'You are 18 or older, so guardian consent is optional. Adding a guardian still helps our verifier.'
          : 'Since you are under 18, your parent or guardian must approve your application first.'}
      </p>

      <div className="space-y-4">
        <FloatingInput
          label="Guardian name"
          value={guardian.name}
          onChange={update('name')}
        />
        <FloatingSelect
          label="Relation"
          value={guardian.relation}
          onChange={update('relation')}
          options={['Father', 'Mother', 'Legal guardian']}
        />
        <FloatingInput
          label="Mobile number"
          value={guardian.mobile}
          onChange={update('mobile')}
        />
        <FloatingInput
          label="Email (optional)"
          type="email"
          value={guardian.email}
          onChange={update('email')}
        />
      </div>

      {!ready && (
        <p className="mt-3 px-2 text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
          Enter your guardian&apos;s name and a 10-digit mobile number.
        </p>
      )}

      {isAdult && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-5 text-[13px] font-medium underline underline-offset-4 text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
        >
          Skip, I am 18 or older
        </button>
      )}

      <div className="hidden md:flex items-center justify-between mt-8">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={send} disabled={!ready}>
          Send consent link
        </PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Back
        </SecondaryButton>
        <PrimaryButton onClick={send} disabled={!ready} className="flex-[2]">
          Send consent link
        </PrimaryButton>
      </div>
    </div>
  );
}

export function WaitingGuardianStep({
  guardian,
  setGuardian,
  onContinue,
  onChangeNumber,
  onResend,
  onOpenGuardianLink,
  demoMode = true,
}) {
  const [resent, setResent] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const state = guardian.consentState;

  const setConsentState = (next) =>
    setGuardian((prev) => ({ ...prev, consentState: next }));
  const resend = () => {
    setResent(true);
    if (onResend) onResend();
    else setConsentState('pending');
  };

  return (
    <div className="animate-slide-in max-w-[600px] mx-auto text-center py-6 md:py-12 pb-24">
      <div className="w-20 h-20 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center mx-auto mb-6 shadow-soft">
        {state === 'approved' ? (
          <span className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center animate-pop-in">
            <Check className="w-6 h-6" strokeWidth={2.25} />
          </span>
        ) : state === 'declined' ? (
          <AlertCircle className="w-8 h-8" strokeWidth={1.75} />
        ) : (
          <Phone className="w-8 h-8" strokeWidth={1.75} />
        )}
      </div>

      {state === 'pending' && (
        <>
          <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">
            Waiting for your guardian&apos;s approval
          </h1>
          <p className="mt-3 text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
            Link sent to {guardian.mobile}
          </p>
          {resent && (
            <p className="mt-2 text-[13px] font-medium text-[#0A0A0A] dark:text-[#FAFAFA] animate-pop-in">
              Consent link resent to {guardian.name}
            </p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryButton onClick={resend}>Resend link</PrimaryButton>
            <SecondaryButton onClick={onChangeNumber}>
              Change number
            </SecondaryButton>
          </div>
          {demoMode && onOpenGuardianLink && (
            <button
              type="button"
              onClick={onOpenGuardianLink}
              className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium underline underline-offset-4 text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
              Open guardian link (demo)
            </button>
          )}
        </>
      )}

      {state === 'approved' && (
        <>
          <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">
            Guardian approved
          </h1>
          <p className="mt-3 text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
            Approved on {guardian.approvedDate} by {guardian.name}
          </p>
          <div className="mt-8 flex justify-center">
            <PrimaryButton onClick={onContinue} className="min-w-[220px]">
              Continue
            </PrimaryButton>
          </div>
        </>
      )}

      {state === 'declined' && (
        <>
          <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">
            Your guardian declined consent
          </h1>
          <p className="mt-3 text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
            We cannot verify or list your application without guardian consent.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryButton onClick={() => setSupportOpen(true)}>
              Contact support
            </PrimaryButton>
            <SecondaryButton onClick={onChangeNumber}>
              Change number
            </SecondaryButton>
          </div>
        </>
      )}

      {state === 'expired' && (
        <>
          <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">
            Consent link expired
          </h1>
          <p className="mt-3 text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
            The 48-hour approval link for {guardian.mobile} has expired.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <PrimaryButton onClick={resend}>Resend link</PrimaryButton>
            <SecondaryButton onClick={onChangeNumber}>
              Change number
            </SecondaryButton>
          </div>
        </>
      )}

      {/* State switcher for reviewing all 4 states (Demo mode only) */}
      {demoMode && (
      <div className="mt-12 pt-6 border-t border-[#ECECEE] dark:border-[#262626]">
        <div className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] mb-3">
          Preview guardian consent state
        </div>
        <div className="inline-flex flex-wrap justify-center gap-2">
          {[
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Approved' },
            { id: 'declined', label: 'Declined' },
            { id: 'expired', label: 'Link expired' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setConsentState(item.id)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                state === item.id
                  ? 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]'
                  : 'bg-[#F4F4F5] text-[#52525B] dark:bg-[#151515] dark:text-[#A1A1AA]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      )}

      <SupportSheet open={supportOpen} onClose={() => setSupportOpen(false)}>
        Our student verification team can speak with your guardian to explain
        how Sikshit Bharat pays coaching fees directly to the institute.
      </SupportSheet>
    </div>
  );
}

export function DocumentsStep({
  documents,
  setDocuments,
  guardianApproved,
  onToggleGuardianApproved,
  onNext,
  onBack,
  onDigiLocker,
  demoMode = false,
}) {
  const [uploadDoc, setUploadDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [localDigiDone, setLocalDigiDone] = useState(false);
  const [simulateFail, setSimulateFail] = useState(false);
  const [digiFailed, setDigiFailed] = useState(false);
  const fileRef = React.useRef(null);

  // Connected mode: DigiLocker state comes from the documents themselves.
  const digiDocs = documents.filter((d) => ['class10', 'aadhaar'].includes(d.id));
  const digiDone = onDigiLocker
    ? digiDocs.length > 0 &&
      digiDocs.every((d) => d.status === 'verified' && d.source === 'digilocker')
    : localDigiDone;

  const runDigiLocker = () => {
    if (!onDigiLocker) {
      setLocalDigiDone(true);
      return;
    }
    setDigiFailed(simulateFail);
    onDigiLocker(!simulateFail);
  };

  const handleSimulatedUpload = () => {
    if (!uploadDoc) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === uploadDoc.id
          ? {
              ...d,
              status: 'uploaded',
              detail: 'Uploaded · Pending check',
              source: 'manual',
              rejectReason: null,
              fileName: uploadFile ? uploadFile.name : d.fileName,
            }
          : d
      )
    );
    setUploadDoc(null);
    setUploadFile(null);
  };

  return (
    <div className="animate-slide-in max-w-[760px] pb-24 md:pb-6">
      <ApplicationProgressHeader stepIndex={2} />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Verify your documents
        </h1>
        {demoMode && (
        <button
          type="button"
          onClick={onToggleGuardianApproved}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]"
        >
          {guardianApproved ? (
            <Unlock className="w-3.5 h-3.5" strokeWidth={1.75} />
          ) : (
            <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
          )}
          <span>
            {guardianApproved ? 'Preview locked state' : 'Unlock documents'}
          </span>
        </button>
        )}
      </div>

      {!guardianApproved && (
        <div className="mb-6 p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="text-[14px] font-medium">
            Documents are locked until your guardian approves.
          </div>
        </div>
      )}

      {/* DigiLocker tile */}
      <div
        className={`p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          !guardianApproved ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shadow-soft shrink-0">
            <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[17px] font-semibold">
              Verify with DigiLocker
            </div>
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
              {digiDone
                ? 'DigiLocker synced · Class 10 & Aadhaar verified'
                : digiFailed
                ? 'DigiLocker could not fetch your documents. Please upload them below.'
                : 'Or upload manually below.'}
            </div>
            {onDigiLocker && (
              <div className="text-[11px] text-[#A1A1AA] dark:text-[#52525B] mt-1">
                Sandbox only in this prototype
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-2">
          <PrimaryButton
            onClick={runDigiLocker}
            disabled={digiDone}
            className="h-12 px-6 text-[14px]"
          >
            {digiDone ? 'Synced' : digiFailed ? 'Try DigiLocker again' : 'Verify with DigiLocker'}
          </PrimaryButton>
          {demoMode && onDigiLocker && !digiDone && (
            <button
              type="button"
              onClick={() => setSimulateFail((v) => !v)}
              aria-pressed={simulateFail}
              className="inline-flex items-center justify-center gap-2 text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]"
            >
              <span
                className={`w-4 h-4 rounded-[5px] flex items-center justify-center ${
                  simulateFail
                    ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]'
                    : 'border border-[#D4D4D8] dark:border-[#3F3F46]'
                }`}
              >
                {simulateFail && <Check className="w-3 h-3" strokeWidth={2.5} />}
              </span>
              Simulate failure (demo)
            </button>
          )}
        </div>
      </div>

      {/* Document rows */}
      <div
        className={`space-y-3 ${
          !guardianApproved ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 md:px-6 md:py-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[15px] font-semibold">{doc.name}</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                  {doc.status === 'rejected' && doc.rejectReason && doc.rejectReason !== doc.detail
                    ? `Reason: ${doc.rejectReason}`
                    : doc.detail}
                  {doc.fileName && doc.status === 'uploaded' ? ` · ${doc.fileName}` : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <StatusChip status={doc.status} />
              {(doc.status === 'rejected' || doc.status === 'not_uploaded') && (
                <button
                  type="button"
                  onClick={() => setUploadDoc(doc)}
                  className="px-4 py-2 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] text-[13px] font-medium active:scale-[0.97] transition-transform"
                >
                  {doc.status === 'rejected' ? 'Re-upload' : 'Upload'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:flex items-center justify-between mt-8">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Back
        </SecondaryButton>
        <PrimaryButton onClick={onNext} className="flex-[2]">
          Continue
        </PrimaryButton>
      </div>

      <BottomSheet
        open={!!uploadDoc}
        onClose={() => {
          setUploadDoc(null);
          setUploadFile(null);
        }}
        title={uploadDoc ? `Upload ${uploadDoc.name}` : 'Upload document'}
      >
        {uploadDoc?.status === 'rejected' && (
          <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mb-4">
            Why it was returned: {uploadDoc.rejectReason || uploadDoc.detail}
          </p>
        )}
        <button
          type="button"
          onClick={() => fileRef.current && fileRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) setUploadFile({ name: f.name, size: f.size });
          }}
          className="w-full border-2 border-dashed border-[#D4D4D8] dark:border-[#3F3F46] rounded-[24px] p-8 text-center bg-[#F4F4F5]/60 dark:bg-[#1C1C1E] mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25"
        >
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#262626] flex items-center justify-center mx-auto mb-3 shadow-soft">
            {uploadFile ? (
              <FileText className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <Upload className="w-5 h-5" strokeWidth={1.75} />
            )}
          </div>
          <div className="text-[15px] font-medium">
            {uploadFile ? uploadFile.name : 'Tap to choose a file or drop it here'}
          </div>
          <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
            {uploadFile
              ? `${Math.max(1, Math.round(uploadFile.size / 1024))} KB · not stored in this prototype`
              : 'PDF, JPG or PNG · max 5 MB'}
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files[0];
            if (f) setUploadFile({ name: f.name, size: f.size });
          }}
        />
        <PrimaryButton onClick={handleSimulatedUpload} className="w-full">
          Upload file
        </PrimaryButton>
      </BottomSheet>
    </div>
  );
}

export function ExamCourseStep({
  selectedExam,
  setSelectedExam,
  selectedInstitute,
  setSelectedInstitute,
  selectedCourse,
  setSelectedCourse,
  onNext,
  onBack,
  institutes = INSTITUTES,
  courses = COURSES,
  locked = false,
  changeRequested = false,
  onRequestChange,
  onRequestInstitute,
}) {
  const [search, setSearch] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqCity, setReqCity] = useState('');
  const [reqCourse, setReqCourse] = useState('');
  const [reqFee, setReqFee] = useState('');
  const [reqFile, setReqFile] = useState(null);
  const [reqSent, setReqSent] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);

  const exams = [
    { id: 'JEE', title: 'JEE', subtitle: 'Engineering · Main & Advanced', icon: BookOpen },
    { id: 'NEET', title: 'NEET', subtitle: 'Medical · UG Entrance', icon: Stethoscope },
    { id: 'CUET', title: 'CUET', subtitle: 'Central Universities Entrance', icon: GraduationCap },
  ];

  // exam -> institute -> course
  const filteredInstitutes = institutes.filter(
    (inst) =>
      (!selectedExam || !inst.exams || inst.exams.includes(selectedExam)) &&
      (inst.name.toLowerCase().includes(search.toLowerCase()) ||
        inst.city.toLowerCase().includes(search.toLowerCase()))
  );

  const availableCourses = courses.filter(
    (c) => c.exam === selectedExam && c.instituteId === selectedInstitute
  );

  const activeCourse = courses.find((c) => c.id === selectedCourse) || null;
  const activeInstitute = activeCourse
    ? institutes.find((i) => i.id === activeCourse.instituteId)
    : null;
  const batch = activeCourse && activeCourse.batches ? activeCourse.batches[0] : null;

  const guard = (fn) => (...args) => {
    if (!locked) fn(...args);
  };

  const submitRequest = () => {
    if (!reqName.trim()) return;
    if (onRequestInstitute)
      onRequestInstitute({
        name: reqName.trim(),
        city: reqCity.trim(),
        course: reqCourse.trim(),
        fee: reqFee === '' ? null : Number(reqFee),
        exam: selectedExam,
        file: reqFile,
      });
    setReqSent(true);
  };

  return (
    <div className="animate-slide-in max-w-[780px] pb-28 md:pb-8 space-y-10">
      <div>
        <ApplicationProgressHeader stepIndex={3} />
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Exam and course
        </h1>
      </div>

      {locked && (
        <NoticeCard
          chip="Course fixed"
          title="Your course is fixed"
          actions={
            onRequestChange &&
            (changeRequested ? (
              <span className="text-[13px] font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
                Change request sent. The trust admin will contact you.
              </span>
            ) : (
              <SecondaryButton
                onClick={() => setChangeOpen(true)}
                className="h-11 px-5 text-[14px]"
              >
                Request an exam or course change
              </SecondaryButton>
            ))
          }
        >
          Your package is locked or you are already listed. You can switch exam
          once, before any fee is paid to your institute, and only with admin
          approval.
        </NoticeCard>
      )}

      {/* 1. Choose exam */}
      <section className={`space-y-4 ${locked ? 'opacity-60' : ''}`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
          1. Choose your exam
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exams.map((ex) => (
            <SelectableTile
              key={ex.id}
              icon={ex.icon}
              title={ex.title}
              subtitle={ex.subtitle}
              selected={selectedExam === ex.id}
              onClick={guard(() => setSelectedExam(ex.id))}
            />
          ))}
        </div>
      </section>

      {/* 2. Choose institute */}
      <section className={`space-y-4 ${locked ? 'opacity-60' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
            2. Choose your institute
          </h2>
          {!locked && (
            <button
              type="button"
              onClick={() => {
                setReqSent(false);
                setRequestOpen(true);
              }}
              className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA] underline underline-offset-4 hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
            >
              Can&apos;t find your institute? Request it
            </button>
          )}
        </div>

        {!locked && (
          <FloatingInput
            label="Search institute or city"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            rightElement={
              <Search
                className="w-4 h-4 text-[#52525B] dark:text-[#A1A1AA]"
                strokeWidth={1.75}
              />
            }
          />
        )}

        <div className="space-y-2.5">
          {filteredInstitutes.length === 0 && (
            <div className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
              No approved institute matches. You can request one above.
            </div>
          )}
          {filteredInstitutes.map((inst) => {
            const active = selectedInstitute === inst.id;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={guard(() => setSelectedInstitute(inst.id))}
                className={`w-full text-left p-5 rounded-[24px] flex items-center justify-between gap-4 transition-all active:scale-[0.99] ${
                  active
                    ? 'bg-white dark:bg-[#151515] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA] shadow-soft'
                    : 'bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1E1E20]'
                }`}
              >
                <div>
                  <div className="text-[15px] font-semibold">{inst.name}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                    {inst.city} · {inst.mode} · ★ {inst.rating}
                  </div>
                </div>
                {active && (
                  <span className="w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center animate-pop-in shrink-0">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Choose course */}
      <section className={`space-y-4 ${locked ? 'opacity-60' : ''}`}>
        <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
          3. Choose your course
        </h2>
        <div className="space-y-2.5">
          {availableCourses.length === 0 && (
            <div className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
              {selectedInstitute
                ? `This institute has no ${selectedExam} course in the trust's catalogue yet.`
                : 'Choose an institute to see its courses.'}
            </div>
          )}
          {availableCourses.map((c) => {
            const active = selectedCourse === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={guard(() => setSelectedCourse(c.id))}
                className={`w-full text-left p-5 rounded-[24px] flex items-center justify-between gap-4 transition-all active:scale-[0.99] ${
                  active
                    ? 'bg-white dark:bg-[#151515] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA] shadow-soft'
                    : 'bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1E1E20]'
                }`}
              >
                <div>
                  <div className="text-[15px] font-semibold">{c.name}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                    {c.duration} · Starts {c.startDate}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[16px] font-semibold">
                    {formatINR(c.fee)}
                  </span>
                  {active && (
                    <span className="w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center animate-pop-in">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Auto-filled, read-only details from the admin catalogue */}
      {activeCourse && (
        <section className="p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[15px] font-semibold">Course details</div>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
              From the trust&apos;s catalogue · read-only
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Course fee</div>
              <div className="font-semibold text-[15px] mt-0.5">{formatINR(activeCourse.fee)}</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Duration</div>
              <div className="font-semibold text-[15px] mt-0.5">{activeCourse.duration}</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Starts</div>
              <div className="font-semibold text-[15px] mt-0.5">{activeCourse.startDate}</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Batch</div>
              <div className="font-semibold text-[15px] mt-0.5">
                {batch ? batch.branch : 'To be assigned'}
              </div>
            </div>
          </div>
          {activeInstitute && (
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
              {activeInstitute.name}, {activeInstitute.city}
              {activeCourse.mode ? ` · ${activeCourse.mode}` : ''}
              {activeCourse.medium ? ` · ${activeCourse.medium}` : ''}
              {batch ? ` · ${formatDate(batch.start)} to ${formatDate(batch.end)}` : ''}
            </div>
          )}
        </section>
      )}

      {/* Bottom summary pill */}
      {activeCourse && (
        <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[14px] font-medium">
          <Lock className="w-4 h-4" strokeWidth={1.75} />
          <span>
            {formatINR(activeCourse.fee)} · {activeCourse.duration} · Starts{' '}
            {activeCourse.startDate}
          </span>
        </div>
      )}

      <div className="hidden md:flex items-center justify-between pt-2">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onNext} disabled={!activeCourse}>
          Continue
        </PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Back
        </SecondaryButton>
        <PrimaryButton onClick={onNext} disabled={!activeCourse} className="flex-[2]">
          Continue
        </PrimaryButton>
      </div>

      <BottomSheet
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Request an institute"
      >
        {reqSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto animate-pop-in">
              <Check className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
              We&apos;ve logged your request. Our trust team verifies new
              coaching centres within 3 working days. Sponsors cannot fund this
              course until the institute is approved.
            </p>
            <PrimaryButton
              onClick={() => setRequestOpen(false)}
              className="w-full"
            >
              Done
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-4">
            <FloatingInput
              label="Institute name"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingInput
                label="City"
                value={reqCity}
                onChange={(e) => setReqCity(e.target.value)}
              />
              <FloatingInput
                label="Course name"
                value={reqCourse}
                onChange={(e) => setReqCourse(e.target.value)}
              />
            </div>
            <Amount
              label="Course fee (₹, optional)"
              value={reqFee}
              onChange={setReqFee}
            />
            <FileDrop
              label="Fee receipt or brochure (PDF, JPG, PNG)"
              file={reqFile}
              onFile={setReqFile}
            />
            <PrimaryButton
              onClick={submitRequest}
              disabled={!reqName.trim()}
              className="w-full"
            >
              Submit request
            </PrimaryButton>
          </div>
        )}
      </BottomSheet>

      <ConfirmSheet
        open={changeOpen}
        title="Request a course change"
        body="Tell the admin which exam or course you want and why. You can switch exam only once, before any fee is paid."
        confirmLabel="Send request"
        reasonRequired
        reasonLabel="What would you like to change?"
        onClose={() => setChangeOpen(false)}
        onConfirm={(reason) => {
          setChangeOpen(false);
          onRequestChange(reason);
        }}
      />
    </div>
  );
}

export function PackageStep({
  courseFee,
  extras,
  setExtras,
  packageLocked,
  setPackageLocked,
  onNext,
  onBack,
  standalone = false,
  caps = EXTRA_CATEGORY_CAPS,
  durationMonths = 12,
  onLock,
  onRequestChange,
  demoMode = true,
  noCourse = false,
}) {
  const categories = Object.keys(caps);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [changeSheetOpen, setChangeSheetOpen] = useState(false);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [changeSent, setChangeSent] = useState(false);
  const [cat, setCat] = useState(categories[0] || 'Stationery');
  const [amt, setAmt] = useState(1500);
  const [reason, setReason] = useState('');
  const [changeReason, setChangeReason] = useState('');

  // Package total = course fee + approved extras. Extras waiting for admin
  // review are shown but not counted until accepted.
  const activeExtras = extras.filter(
    (e) => !e.excluded && e.state !== 'rejected' && e.state !== 'needs_review'
  );
  const extrasTotal = activeExtras.reduce((sum, e) => sum + Number(e.amount), 0);
  const goalTotal = courseFee + extrasTotal;
  const months = durationMonths || 12;
  const perMonth = Math.round(goalTotal / months);
  const cap = caps[cat];
  const overCap = cap != null && Number(amt) > cap;

  const addExtra = () => {
    const num = Number(amt);
    if (!num || num <= 0 || overCap) return;
    setExtras((prev) => [
      ...prev,
      {
        id: `ext-${Date.now()}`,
        category: cat,
        amount: num,
        reason: reason || `${cat} allowance`,
        // Every new extra is sent to the admin for review.
        state: 'needs_review',
      },
    ]);
    setReason('');
    setSheetOpen(false);
  };

  const removeExtra = (id) => {
    if (packageLocked) return;
    setExtras((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="animate-slide-in pb-28 md:pb-8">
      {!standalone && <ApplicationProgressHeader stepIndex={4} />}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Build your package
        </h1>
        {packageLocked && <StatusChip status="locked" label="Locked" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Extras */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-semibold">Extras</h2>
            {!packageLocked && (
              <SecondaryButton
                onClick={() => setSheetOpen(true)}
                className="h-11 px-5 text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/20 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0A0A0A]"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
                Add extra
              </SecondaryButton>
            )}
          </div>

          <div className="space-y-3">
            {extras.length === 0 && (
              <div className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
                No extras yet. Add stationery, travel, books or a test series if you need them.
              </div>
            )}
            {extras.map((ex) => (
              <div
                key={ex.id}
                className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold">
                      {ex.category}
                    </span>
                    <span className="text-[15px] font-semibold">
                      · {formatINR(ex.amount)}
                    </span>
                    {ex.state === 'needs_review' && (
                      <StatusChip status="needs_review" label="Needs review" />
                    )}
                    {ex.state === 'rejected' && (
                      <StatusChip status="rejected" label="Rejected" />
                    )}
                    {ex.state === 'normal' && ex.approved && (
                      <StatusChip status="verified" label="Approved" />
                    )}
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1 truncate">
                    {ex.reason}
                  </div>
                  {ex.adminNote && (
                    <div className="text-[13px] text-[#0A0A0A] dark:text-[#FAFAFA] mt-1">
                      Admin note: {ex.adminNote}
                    </div>
                  )}
                  {ex.state === 'needs_review' && !ex.excluded && (
                    <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                      With the trust admin. Added to your goal once accepted.
                    </div>
                  )}
                </div>
                {!packageLocked && (
                  <button
                    type="button"
                    onClick={() => removeExtra(ex.id)}
                    aria-label={`Delete ${ex.category}`}
                    className="hit-44 w-9 h-9 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] shrink-0"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Soft summary panel */}
        <div className="lg:col-span-5 p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-6">
          <div className="space-y-3 text-[15px]">
            <div className="flex justify-between">
              <span className="text-[#52525B] dark:text-[#A1A1AA]">
                Course fee
              </span>
              <span className="font-semibold">
                {noCourse ? 'Choose a course' : formatINR(courseFee)}
              </span>
            </div>
            {activeExtras.map((ex) => (
              <div key={ex.id} className="flex justify-between">
                <span className="text-[#52525B] dark:text-[#A1A1AA]">
                  {ex.category}
                </span>
                <span className="font-semibold">{formatINR(ex.amount)}</span>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-[#ECECEE] dark:border-[#262626]">
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Goal
            </div>
            <div className="text-[40px] leading-tight font-bold tracking-[-0.03em] mt-1">
              {formatINR(goalTotal)}
            </div>
            <div className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
              Monthly need {formatINR(perMonth)} for {months} months
            </div>
          </div>

          {!packageLocked ? (
            <div className="space-y-2.5">
              <PrimaryButton
                onClick={() => setLockConfirmOpen(true)}
                disabled={noCourse}
                className="w-full"
              >
                <Lock className="w-4 h-4" strokeWidth={1.75} />
                Lock package
              </PrimaryButton>
              <p className="text-[12px] text-center text-[#52525B] dark:text-[#A1A1AA]">
                Changes after locking need admin approval.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <SecondaryButton
                onClick={() => {
                  setChangeSent(false);
                  setChangeSheetOpen(true);
                }}
                className="w-full"
              >
                Request a change
              </SecondaryButton>
              {!standalone && (
                <PrimaryButton onClick={onNext} className="w-full">
                  Continue to review
                </PrimaryButton>
              )}
            </div>
          )}
        </div>
      </div>

      {!standalone && (
        <>
          <div className="hidden md:flex items-center justify-between mt-8">
            <SecondaryButton onClick={onBack}>Back</SecondaryButton>
            {!packageLocked && (
              <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
            )}
          </div>
          <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
            <SecondaryButton onClick={onBack} className="flex-1">
              Back
            </SecondaryButton>
            <PrimaryButton onClick={onNext} className="flex-[2]">
              Continue
            </PrimaryButton>
          </div>
        </>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add extra"
      >
        <div className="space-y-4">
          <div>
            <FloatingSelect
              label="Category"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              options={categories}
            />
            {cap != null && (
              <p className="mt-2 px-2 text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                Cap for {cat}: {formatINR(cap)}
              </p>
            )}
          </div>
          <Amount label="Amount (₹)" value={amt} onChange={setAmt} max={cap} />
          <FloatingInput
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
            Extras are reviewed by the trust admin before they count toward
            your goal.
          </p>
          <PrimaryButton
            onClick={addExtra}
            disabled={!Number(amt) || overCap}
            className="w-full"
          >
            Send for review
          </PrimaryButton>
        </div>
      </BottomSheet>

      <BottomSheet
        open={changeSheetOpen}
        onClose={() => setChangeSheetOpen(false)}
        title="Request package change"
      >
        {changeSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto animate-pop-in">
              <Check className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
              Your request is with the trust admin. Your package stays locked
              until it is reviewed.
            </p>
            <PrimaryButton
              onClick={() => setChangeSheetOpen(false)}
              className="w-full"
            >
              Done
            </PrimaryButton>
          </div>
        ) : (
          <>
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mb-4">
              Describe what needs to be updated. An admin will review and unlock
              your package if approved.
            </p>
            <div className="space-y-4">
              <FloatingInput
                label="Reason for change"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
              />
              <div className="flex gap-3">
                {demoMode && (
                  <DestructiveButton
                    onClick={() => {
                      setPackageLocked(false);
                      setChangeSheetOpen(false);
                    }}
                    className="flex-1"
                  >
                    Unlock for demo
                  </DestructiveButton>
                )}
                <PrimaryButton
                  onClick={() => {
                    if (onRequestChange) {
                      if (changeReason.trim().length < 3) return;
                      onRequestChange(changeReason.trim());
                      setChangeReason('');
                      setChangeSent(true);
                    } else {
                      setChangeSheetOpen(false);
                    }
                  }}
                  disabled={!!onRequestChange && changeReason.trim().length < 3}
                  className="flex-1"
                >
                  Send request
                </PrimaryButton>
              </div>
            </div>
          </>
        )}
      </BottomSheet>

      <ConfirmSheet
        open={lockConfirmOpen}
        title="Lock your package?"
        body={`Your goal will be ${formatINR(goalTotal)} (${formatINR(perMonth)} a month for ${months} months). After locking, any change needs admin approval.`}
        confirmLabel="Lock package"
        onClose={() => setLockConfirmOpen(false)}
        onConfirm={() => {
          setLockConfirmOpen(false);
          if (onLock) onLock();
          else setPackageLocked(true);
        }}
      />
    </div>
  );
}

export function ReviewSubmitStep({
  student,
  guardian,
  course,
  goalTotal,
  onEditStep,
  onBack,
  onGoDashboard,
  onSubmit,
  institute,
  documents,
  packageLocked,
  consentState,
  statusIndex,
  alreadySubmitted = false,
  submittedStatus,
}) {
  const [declared, setDeclared] = useState(true);
  const [storyOptIn, setStoryOptIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!declared || alreadySubmitted) return;
    if (onSubmit) onSubmit({ storyOptIn });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="animate-slide-in max-w-[560px] mx-auto text-center py-12 pb-24">
        <div className="w-20 h-20 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto mb-6 animate-pop-in">
          <Check className="w-10 h-10" strokeWidth={2.25} />
        </div>
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Application submitted
        </h1>
        <p className="mt-2 text-[16px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
          ID {student.id}
        </p>

        {onSubmit && (
          <p className="mt-3 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
            A trust officer will verify it.
          </p>
        )}

        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[14px] font-medium">
          <span>Verification</span>
          <span className="text-[#A1A1AA]">→</span>
          <span>Approval</span>
          <span className="text-[#A1A1AA]">→</span>
          <span>Listed for sponsors</span>
        </div>

        {statusIndex != null && (
          <div className="mt-10 text-left">
            <StatusTracker currentStepIndex={statusIndex} />
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <PrimaryButton onClick={onGoDashboard} className="min-w-[240px]">
            Go to dashboard
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // Document summary from real statuses (falls back to the original line).
  let docLine = 'Class 10 marksheet & Aadhaar verified · 2 under review';
  if (documents) {
    const verified = documents.filter((d) => d.status === 'verified').length;
    const review = documents.filter((d) => ['pending', 'uploaded', 'needs_review'].includes(d.status)).length;
    const missing = documents.filter((d) => ['not_uploaded', 'rejected'].includes(d.status) && d.id !== 'caste_ews').length;
    docLine = `${verified} verified · ${review} under review${missing ? ` · ${missing} still needed` : ''}`;
  }
  const consentLabel = {
    approved: 'Consent given',
    pending: 'Waiting for consent',
    declined: 'Consent declined',
    expired: 'Link expired',
    not_sent: 'Link not sent yet',
  }[consentState];
  const instituteLine = institute
    ? `${institute.name}, ${institute.city}`
    : 'Vidya Coaching Centre, Patna';

  const sections = [
    {
      title: 'Personal & academic details',
      stepIdx: 0,
      lines: [
        `${student.fullName}${student.age != null ? `, ${student.age}` : ''} · ${student.district || 'District not set'}, ${student.state || 'State not set'}`,
        `Class ${student.studentClass} · ${student.board} · Class 10: ${student.class10Marks}% · Income ${student.incomeBand}`,
      ],
    },
    {
      title: 'Guardian consent',
      stepIdx: 1,
      lines: [
        `${guardian.name || 'Guardian not added'} (${guardian.relation}) · ${guardian.mobile || 'No mobile'}`,
        ...(consentLabel ? [consentLabel] : []),
      ],
    },
    {
      title: 'Documents',
      stepIdx: 2,
      lines: [docLine],
    },
    {
      title: 'Course & package',
      stepIdx: 4,
      lines: course
        ? [
            `${instituteLine} · ${course.name}`,
            `Total sponsorship goal: ${formatINR(goalTotal)}`,
            ...(packageLocked === false ? ['Package not locked yet. The admin can list you only after you lock it.'] : []),
          ]
        : ['No course selected yet. You can choose it while the trust verifies you; the admin lists you only after your package is locked.'],
    },
  ];

  return (
    <div className="animate-slide-in max-w-[720px] pb-28 md:pb-8">
      <ApplicationProgressHeader stepIndex={5} />
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] mb-8">
        Review and submit
      </h1>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div
            key={sec.title}
            className="p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="text-[16px] font-semibold">{sec.title}</div>
              {sec.lines.map((l) => (
                <div
                  key={l}
                  className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]"
                >
                  {l}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => onEditStep(sec.stepIdx)}
              className="text-[13px] font-semibold underline underline-offset-4 shrink-0"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {alreadySubmitted && (
        <div className="mt-6">
          <NoticeCard chip="Already submitted" title="Your application is with the trust">
            Current status: {submittedStatus}. Use the dashboard to follow
            verification and funding. To change something, use Request a change
            on the Package page.
          </NoticeCard>
        </div>
      )}

      <div className="mt-6 space-y-3.5">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setDeclared(!declared)}
            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
              declared
                ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]'
                : 'bg-[#F4F4F5] dark:bg-[#151515] border border-[#D4D4D8] dark:border-[#3F3F46]'
            }`}
          >
            {declared && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
          </button>
          <span className="text-[14px] text-[#0A0A0A] dark:text-[#FAFAFA]">
            I confirm that all details and documents submitted are true and
            accurate.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setStoryOptIn(!storyOptIn)}
            className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
              storyOptIn
                ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]'
                : 'bg-[#F4F4F5] dark:bg-[#151515] border border-[#D4D4D8] dark:border-[#3F3F46]'
            }`}
          >
            {storyOptIn && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
          </button>
          <span className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Allow my first name, photo and story in Success Stories
          </span>
        </label>
      </div>

      <div className="hidden md:flex items-center justify-between mt-8">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!declared || alreadySubmitted}
        >
          {alreadySubmitted ? 'Submitted' : 'Submit application'}
        </PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Back
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!declared || alreadySubmitted}
          className="flex-[2]"
        >
          {alreadySubmitted ? 'Submitted' : 'Submit application'}
        </PrimaryButton>
      </div>
    </div>
  );
}
