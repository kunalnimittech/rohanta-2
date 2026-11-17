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
} from 'lucide-react';
import {
  APP_STEPS,
  INSTITUTES,
  COURSES,
  formatINR,
} from '../data/mockData';
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
} from '../components/ui';

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

export function DetailsStep({ student, setStudent, onNext }) {
  const update = (key) => (e) =>
    setStudent((prev) => ({ ...prev, [key]: e.target.value }));

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
              options={['Below ₹1L', '₹1–2.5L', '₹2.5–5L', 'Above ₹5L']}
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
      </div>

      <div className="hidden md:flex justify-end mt-8">
        <PrimaryButton onClick={onNext}>Continue</PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20">
        <PrimaryButton onClick={onNext} className="w-full">
          Continue
        </PrimaryButton>
      </div>
    </div>
  );
}

export function GuardianStep({ guardian, setGuardian, onNext, onBack }) {
  const update = (key) => (e) =>
    setGuardian((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="animate-slide-in max-w-[560px] pb-24 md:pb-6">
      <ApplicationProgressHeader stepIndex={1} />
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
        Add your guardian
      </h1>
      <p className="mt-2 text-[15px] text-[#52525B] dark:text-[#A1A1AA] mb-8">
        Since you are under 18, your parent or guardian must approve your
        application first.
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

      <div className="hidden md:flex items-center justify-between mt-8">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton onClick={onNext}>Send consent link</PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Back
        </SecondaryButton>
        <PrimaryButton onClick={onNext} className="flex-[2]">
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
}) {
  const [resent, setResent] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const state = guardian.consentState;

  const setConsentState = (next) =>
    setGuardian((prev) => ({ ...prev, consentState: next }));

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
            <PrimaryButton onClick={() => setResent(true)}>
              Resend link
            </PrimaryButton>
            <SecondaryButton onClick={onChangeNumber}>
              Change number
            </SecondaryButton>
          </div>
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
            <PrimaryButton
              onClick={() => {
                setResent(true);
                setConsentState('pending');
              }}
            >
              Resend link
            </PrimaryButton>
            <SecondaryButton onClick={onChangeNumber}>
              Change number
            </SecondaryButton>
          </div>
        </>
      )}

      {/* State switcher for reviewing all 4 states */}
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

      <BottomSheet
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
        title="Trust support"
      >
        <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA] leading-relaxed mb-5">
          Our student verification team can speak with your guardian to explain
          how Sikshit Bharat pays coaching fees directly to the institute.
        </p>
        <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] text-[14px] space-y-1 mb-6">
          <div className="font-semibold">Helpline · Mon–Sat, 9 AM – 6 PM</div>
          <div className="text-[#52525B] dark:text-[#A1A1AA]">
            support@sikshitbharat.org · +91 11 4000 8120
          </div>
        </div>
        <PrimaryButton
          onClick={() => setSupportOpen(false)}
          className="w-full"
        >
          Got it
        </PrimaryButton>
      </BottomSheet>
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
}) {
  const [uploadDoc, setUploadDoc] = useState(null);
  const [digiDone, setDigiDone] = useState(false);

  const handleSimulatedUpload = () => {
    if (!uploadDoc) return;
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === uploadDoc.id
          ? { ...d, status: 'uploaded', detail: 'Uploaded · Pending check' }
          : d
      )
    );
    setUploadDoc(null);
  };

  return (
    <div className="animate-slide-in max-w-[760px] pb-24 md:pb-6">
      <ApplicationProgressHeader stepIndex={2} />
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Verify your documents
        </h1>
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
                : 'Or upload manually below.'}
            </div>
          </div>
        </div>
        <PrimaryButton
          onClick={() => setDigiDone(true)}
          className="h-12 px-6 text-[14px]"
        >
          {digiDone ? 'Synced' : 'Verify with DigiLocker'}
        </PrimaryButton>
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
                  {doc.detail}
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
        onClose={() => setUploadDoc(null)}
        title={uploadDoc ? `Upload ${uploadDoc.name}` : 'Upload document'}
      >
        <div className="border-2 border-dashed border-[#D4D4D8] dark:border-[#3F3F46] rounded-[24px] p-8 text-center bg-[#F4F4F5]/60 dark:bg-[#1C1C1E] mb-6">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#262626] flex items-center justify-center mx-auto mb-3 shadow-soft">
            <Upload className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div className="text-[15px] font-medium">
            Tap to choose a file or drop it here
          </div>
          <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
            PDF, JPG or PNG · max 5 MB
          </div>
        </div>
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
}) {
  const [search, setSearch] = useState('');
  const [requestOpen, setRequestOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqSent, setReqSent] = useState(false);

  const exams = [
    { id: 'JEE', title: 'JEE', subtitle: 'Engineering · Main & Advanced', icon: BookOpen },
    { id: 'NEET', title: 'NEET', subtitle: 'Medical · UG Entrance', icon: Stethoscope },
    { id: 'CUET', title: 'CUET', subtitle: 'Central Universities Entrance', icon: GraduationCap },
  ];

  const filteredInstitutes = INSTITUTES.filter(
    (inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase())
  );

  const availableCourses = COURSES.filter(
    (c) =>
      c.exam === selectedExam ||
      c.instituteId === selectedInstitute
  );

  const activeCourse =
    COURSES.find((c) => c.id === selectedCourse) || COURSES[0];

  return (
    <div className="animate-slide-in max-w-[780px] pb-28 md:pb-8 space-y-10">
      <div>
        <ApplicationProgressHeader stepIndex={3} />
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Exam and course
        </h1>
      </div>

      {/* 1. Choose exam */}
      <section className="space-y-4">
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
              onClick={() => setSelectedExam(ex.id)}
            />
          ))}
        </div>
      </section>

      {/* 2. Choose institute */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
            2. Choose your institute
          </h2>
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
        </div>

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

        <div className="space-y-2.5">
          {filteredInstitutes.map((inst) => {
            const active = selectedInstitute === inst.id;
            return (
              <button
                key={inst.id}
                type="button"
                onClick={() => setSelectedInstitute(inst.id)}
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
      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold tracking-[-0.01em]">
          3. Choose your course
        </h2>
        <div className="space-y-2.5">
          {availableCourses.map((c) => {
            const active = selectedCourse === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourse(c.id)}
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

      {/* Bottom summary pill */}
      <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[14px] font-medium">
        <Lock className="w-4 h-4" strokeWidth={1.75} />
        <span>
          {formatINR(activeCourse.fee)} · {activeCourse.duration} · Starts{' '}
          {activeCourse.startDate}
        </span>
      </div>

      <div className="hidden md:flex items-center justify-between pt-2">
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
              coaching centres within 3 working days.
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
              label="Institute name & city"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
            />
            <PrimaryButton
              onClick={() => setReqSent(true)}
              className="w-full"
            >
              Submit request
            </PrimaryButton>
          </div>
        )}
      </BottomSheet>
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
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [changeSheetOpen, setChangeSheetOpen] = useState(false);
  const [cat, setCat] = useState('Stationery');
  const [amt, setAmt] = useState('1500');
  const [reason, setReason] = useState('');

  const activeExtras = extras.filter((e) => !e.excluded && e.state !== 'rejected');
  const extrasTotal = activeExtras.reduce((sum, e) => sum + Number(e.amount), 0);
  const goalTotal = courseFee + extrasTotal;
  const perMonth = Math.round(goalTotal / 12);

  const addExtra = () => {
    const num = Number(amt);
    if (!num || num <= 0) return;
    setExtras((prev) => [
      ...prev,
      {
        id: `ext-${Date.now()}`,
        category: cat,
        amount: num,
        reason: reason || `${cat} allowance`,
        state: 'normal',
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
                className="h-11 px-5 text-[14px]"
              >
                <Plus className="w-4 h-4" strokeWidth={1.75} />
                Add extra
              </SecondaryButton>
            )}
          </div>

          <div className="space-y-3">
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
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-1 truncate">
                    {ex.reason}
                  </div>
                </div>
                {!packageLocked && (
                  <button
                    type="button"
                    onClick={() => removeExtra(ex.id)}
                    aria-label={`Delete ${ex.category}`}
                    className="w-9 h-9 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] shrink-0"
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
              <span className="font-semibold">{formatINR(courseFee)}</span>
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
              {formatINR(perMonth)} per month
            </div>
          </div>

          {!packageLocked ? (
            <div className="space-y-2.5">
              <PrimaryButton
                onClick={() => setPackageLocked(true)}
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
                onClick={() => setChangeSheetOpen(true)}
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
          <FloatingSelect
            label="Category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            options={['Stationery', 'Books', 'Travel', 'Hostel', 'Device']}
          />
          <FloatingInput
            label="Amount (₹)"
            type="number"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
          />
          <FloatingInput
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <PrimaryButton onClick={addExtra} className="w-full">
            Add to package
          </PrimaryButton>
        </div>
      </BottomSheet>

      <BottomSheet
        open={changeSheetOpen}
        onClose={() => setChangeSheetOpen(false)}
        title="Request package change"
      >
        <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mb-4">
          Describe what needs to be updated. An admin will review and unlock
          your package if approved.
        </p>
        <div className="space-y-4">
          <FloatingInput
            label="Reason for change"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-3">
            <DestructiveButton
              onClick={() => {
                setPackageLocked(false);
                setChangeSheetOpen(false);
              }}
              className="flex-1"
            >
              Unlock for demo
            </DestructiveButton>
            <PrimaryButton
              onClick={() => setChangeSheetOpen(false)}
              className="flex-1"
            >
              Send request
            </PrimaryButton>
          </div>
        </div>
      </BottomSheet>
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
}) {
  const [declared, setDeclared] = useState(true);
  const [storyOptIn, setStoryOptIn] = useState(true);
  const [submitted, setSubmitted] = useState(false);

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

        <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[14px] font-medium">
          <span>Verification</span>
          <span className="text-[#A1A1AA]">→</span>
          <span>Approval</span>
          <span className="text-[#A1A1AA]">→</span>
          <span>Listed for sponsors</span>
        </div>

        <div className="mt-10 flex justify-center">
          <PrimaryButton onClick={onGoDashboard} className="min-w-[240px]">
            Go to dashboard
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'Personal & academic details',
      stepIdx: 0,
      lines: [
        `${student.fullName}, ${student.age} · ${student.district}, ${student.state}`,
        `Class ${student.studentClass} · ${student.board} · Class 10: ${student.class10Marks}% · Income ${student.incomeBand}`,
      ],
    },
    {
      title: 'Guardian consent',
      stepIdx: 1,
      lines: [`${guardian.name} (${guardian.relation}) · ${guardian.mobile}`],
    },
    {
      title: 'Documents',
      stepIdx: 2,
      lines: ['Class 10 marksheet & Aadhaar verified · 2 under review'],
    },
    {
      title: 'Course & package',
      stepIdx: 4,
      lines: [
        `Vidya Coaching Centre, Patna · ${course.name}`,
        `Total sponsorship goal: ${formatINR(goalTotal)}`,
      ],
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
          onClick={() => setSubmitted(true)}
          disabled={!declared}
        >
          Submit application
        </PrimaryButton>
      </div>
      <div className="md:hidden fixed bottom-20 inset-x-4 z-20 flex gap-3">
        <SecondaryButton onClick={onBack} className="flex-1">
          Back
        </SecondaryButton>
        <PrimaryButton
          onClick={() => setSubmitted(true)}
          disabled={!declared}
          className="flex-[2]"
        >
          Submit application
        </PrimaryButton>
      </div>
    </div>
  );
}
