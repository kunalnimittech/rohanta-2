import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Calendar,
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  Shield,
  RotateCcw,
  MessageSquare,
  Heart,
} from 'lucide-react';
import { formatINR, formatDate } from '../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  ProgressBar,
  StatusTracker,
  BottomSheet,
  FloatingInput,
  SelectableTile,
  ConfirmSheet,
  FloatingSelect,
  FloatingTextarea,
  Segmented,
  FileDrop,
  EmptyState,
} from '../components/ui';

const DEFAULT_PACKAGE = {
  courseFee: 40000,
  extras: [
    { id: 'd1', category: 'Stationery', amount: 3000 },
    { id: 'd2', category: 'Travel', amount: 5000 },
  ],
  total: 48000,
  locked: true,
};

function Tile({ className = '', children }) {
  return (
    <div className={`p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] ${className}`}>
      {children}
    </div>
  );
}

const DISBURSEMENT_CHIP = {
  draft: { status: 'pending', label: 'Being prepared' },
  pending_trustee: { status: 'pending', label: 'Awaiting trustee' },
  approved: { status: 'uploaded', label: 'Approved' },
  paid: { status: 'verified', label: 'Paid' },
  confirmed: { status: 'verified', label: 'Paid · confirmed' },
  failed: { status: 'needs_review', label: 'Bank return' },
};

export function DashboardPage({
  student,
  contributions,
  progressRecords,
  onNavigate,
  onOpenUpload,
  // Part 2: store-driven values (defaults keep the original prototype look)
  goal = 48000,
  packageInfo = DEFAULT_PACKAGE,
  statusIndex = 4,
  status = 'Partially funded',
  verification,
  infoRequest,
  rejectReason,
  instalment,
  courseStart,
  nextStep,
  outcome,
  onOpenOutcome,
  onContactUs,
}) {
  // Only money the trust has matched with the bank counts as raised for the student.
  const raised = contributions.filter((c) => c.state !== 'pending').reduce((s, c) => s + c.amount, 0);
  const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - raised);
  const sponsorCount = new Set(contributions.map((c) => c.sponsorId || c.sponsor)).size;
  const confirming = contributions.some((c) => c.state === 'pending');

  const listedOrLater = ['Listed', 'Partially funded', 'Fully funded', 'Enrolled', 'Completed'].includes(status);
  const preListing = ['Draft', 'Consent pending', 'Under verification', 'Info requested'].includes(status);

  // Course start line
  let startLine = 'Course starts in 14 days';
  if (courseStart !== undefined) {
    if (!courseStart) startLine = 'Choose a course to see your start date';
    else {
      const days = Math.ceil((new Date(courseStart).getTime() - Date.now()) / 86400000);
      startLine =
        days > 1
          ? `Course starts in ${days} days`
          : days === 1
          ? 'Course starts tomorrow'
          : days === 0
          ? 'Course starts today'
          : `Course started on ${formatDate(courseStart)}`;
    }
  }

  // Unique sponsors, newest first (display name only if the donor chose public)
  const seen = new Set();
  const sponsorRows = contributions.filter((c) => {
    const k = c.sponsorId || c.sponsor;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const step = nextStep || {
    label: 'Next step',
    title: 'Upload October attendance by 5 Nov',
    action: onOpenUpload,
    cta: 'Upload now',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting & Status Tracker */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[32px] md:text-[44px] font-semibold tracking-[-0.03em]">
            Hello, {student.fullName.split(' ')[0]}
          </h1>
          <span className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
            ID {student.id}
          </span>
        </div>
        <StatusTracker currentStepIndex={statusIndex} />
      </div>

      {/* Info requested: outlined banner */}
      {status === 'Info requested' && (
        <div className="p-6 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop-in">
          <div className="flex items-start gap-3.5 min-w-0">
            <span className="w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold">The trust needs a little more from you</div>
              <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                {infoRequest || 'Please check your documents and upload anything missing.'}
              </p>
            </div>
          </div>
          <PrimaryButton onClick={() => onNavigate('documents')} className="h-12 px-6 text-[14px] shrink-0">
            Update documents
          </PrimaryButton>
        </div>
      )}

      {/* Rejected: calm card */}
      {status === 'Rejected' && (
        <Tile className="space-y-3">
          <StatusChip status="rejected" label="Not approved this year" />
          <div className="text-[17px] font-semibold">We could not approve your application</div>
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            {rejectReason || 'The trust team will share the reason with you by phone.'}
          </p>
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            You can re-apply next year, or contact us if you think something was missed.
          </p>
          <div className="pt-1">
            <SecondaryButton onClick={onContactUs} className="h-11 px-5 text-[14px] bg-white dark:bg-[#222224]">
              Contact us
            </SecondaryButton>
          </div>
        </Tile>
      )}

      {/* 5-tile Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* 1. Funding goal (2x2) */}
        <div className="md:col-span-2 md:row-span-2 p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between min-h-[280px]">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Funding goal
            </div>
            <div className="mt-4 text-[44px] md:text-[52px] leading-none font-bold tracking-[-0.035em]">
              {formatINR(raised)}
            </div>
            <div className="mt-2 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
              raised of {formatINR(goal)}
            </div>
            {preListing && (
              <div className="mt-3 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                Sponsors can fund you once the trust lists your application.
              </div>
            )}
          </div>

          <div className="space-y-3 mt-8">
            <div className="flex items-center justify-between text-[13px] font-semibold">
              <span>{pct}% funded</span>
              <span>
                {sponsorCount} sponsors · {formatINR(remaining)} to go
              </span>
            </div>
            <ProgressBar percent={pct} />
            {confirming && (
              <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                Some contributions are being confirmed with the bank.
              </div>
            )}
            <div className="flex items-center gap-2 pt-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
              <Calendar className="w-4 h-4" strokeWidth={1.75} />
              <span>{startLine}</span>
            </div>
          </div>
        </div>

        {/* 2. Package (2x1) */}
        <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-[15px] font-semibold">Package</div>
            {packageInfo.locked ? (
              <StatusChip status="locked" label="Locked" />
            ) : (
              <StatusChip status="pending" label="Not locked" />
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">
                Institute fee
              </div>
              <div className="font-semibold text-[15px] mt-0.5">
                {packageInfo.courseFee ? formatINR(packageInfo.courseFee) : 'Not chosen'}
              </div>
            </div>
            {packageInfo.extras.slice(0, 2).map((e) => (
              <div key={e.id}>
                <div className="text-[#52525B] dark:text-[#A1A1AA]">{e.category}</div>
                <div className="font-semibold text-[15px] mt-0.5">{formatINR(e.amount)}</div>
              </div>
            ))}
            {packageInfo.extras.length > 2 && (
              <div>
                <div className="text-[#52525B] dark:text-[#A1A1AA]">
                  {packageInfo.extras.length - 2} more extras
                </div>
                <div className="font-semibold text-[15px] mt-0.5">
                  {formatINR(packageInfo.extras.slice(2).reduce((s, e) => s + Number(e.amount), 0))}
                </div>
              </div>
            )}
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Total</div>
              <div className="font-bold text-[15px] mt-0.5">{formatINR(packageInfo.total)}</div>
            </div>
          </div>
        </div>

        {/* 3. Progress uploads (2x1) */}
        <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[15px] font-semibold">Progress uploads</div>
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] text-[12px] font-semibold active:scale-[0.97] transition-transform"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={1.75} />
              Upload screenshot
            </button>
          </div>
          <div className="space-y-2.5 text-[14px]">
            {progressRecords.length === 0 && (
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                Monthly updates start once you join your course.
              </div>
            )}
            {progressRecords.slice(0, 3).map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate font-medium">
                  {rec.type}
                  {rec.type.includes('Attendance') ? ` ${rec.score}` : ''}
                </span>
                <StatusChip
                  status={rec.status === 'verified' ? 'verified' : 'pending'}
                  label={rec.status === 'verified' ? 'Accepted' : 'Pending'}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Verification (before listing) or Sponsors (listed and later) */}
        {listedOrLater || !verification ? (
          <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[15px] font-semibold">Sponsors</div>
              <button
                type="button"
                onClick={() => onNavigate('funding')}
                className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
              >
                View all
              </button>
            </div>
            <div className="space-y-2 text-[14px]">
              {sponsorRows.length === 0 && (
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                  No sponsors yet. Verified sponsors can see your story once you are listed.
                </div>
              )}
              {sponsorRows.slice(0, 3).map((c) => (
                <div key={c.id} className="flex justify-between gap-3">
                  <span className="font-medium truncate">{c.sponsor}</span>
                  <span className="text-[#52525B] dark:text-[#A1A1AA] shrink-0">{c.type}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[15px] font-semibold">Verification</div>
              <StatusChip
                status={status === 'Under verification' ? 'pending' : status === 'Info requested' ? 'needs_review' : 'not_uploaded'}
                label={status === 'Under verification' ? 'In progress' : status === 'Info requested' ? 'Info requested' : 'Not started'}
              />
            </div>
            {verification.review && status !== 'Draft' && status !== 'Consent pending' ? (
              <>
                <div className="text-[14px] font-medium">
                  {verification.verifierFirst
                    ? `${verification.verifierFirst} from the trust is verifying your application`
                    : 'Waiting for a trust officer to be assigned'}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                    <span>
                      {verification.done} of {verification.total} checks done
                    </span>
                    {verification.dueAt && <span>Expected by {formatDate(verification.dueAt)}</span>}
                  </div>
                  <ProgressBar percent={(verification.done / verification.total) * 100} />
                </div>
              </>
            ) : (
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                Submit your application and a trust officer will verify it within a few days.
              </div>
            )}
          </div>
        )}

        {/* 5. Next step / Next instalment / Result */}
        {status === 'Enrolled' && instalment ? (
          <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
                  Next instalment
                </div>
                {instalment.instalment && (
                  <StatusChip
                    {...(instalment.disbursement
                      ? DISBURSEMENT_CHIP[instalment.disbursement.status] || { status: 'pending', label: 'In progress' }
                      : { status: 'not_uploaded', label: 'Not started' })}
                  />
                )}
              </div>
              {instalment.instalment ? (
                <>
                  <div className="mt-1.5 text-[24px] font-bold tracking-[-0.02em]">
                    {formatINR(instalment.instalment.amount)}
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                    Instalment {instalment.instalment.no} of {instalment.total} · due{' '}
                    {formatDate(instalment.instalment.dueDate)}
                  </div>
                </>
              ) : (
                <div className="mt-1.5 text-[16px] font-semibold">All instalments paid</div>
              )}
            </div>
            {instalment.lastPaid && (
              <div className="text-[13px] font-medium">
                Instalment {instalment.lastPaid.instalmentNo} paid on {formatDate(instalment.lastPaid.paidOn)}
                {instalment.lastPaid.status === 'confirmed' ? ' · confirmed by your institute' : ''}
              </div>
            )}
            <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
              The trust pays your institute directly after a trustee approves it.
            </p>
          </div>
        ) : status === 'Completed' ? (
          <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Your result</div>
              {outcome ? (
                <div className="mt-1.5 space-y-1">
                  <div className="text-[16px] font-semibold leading-snug">
                    {outcome.exam} · {outcome.qualified ? 'Qualified' : 'Did not qualify'}
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                    {[outcome.score && `Score ${outcome.score}`, outcome.rank && `Rank ${outcome.rank}`, outcome.college].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 text-[16px] font-semibold leading-snug">Tell us how your exam went</div>
              )}
            </div>
            {!outcome && onOpenOutcome && (
              <div>
                <SecondaryButton onClick={onOpenOutcome} className="h-11 px-5 text-[13px] bg-white dark:bg-[#222224]">
                  Add result
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </SecondaryButton>
              </div>
            )}
          </div>
        ) : (
          <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
                {step.label || 'Next step'}
              </div>
              <div className="mt-1.5 text-[16px] font-semibold leading-snug">
                {step.title}
              </div>
            </div>
            {step.action && (
              <div>
                <SecondaryButton
                  onClick={step.action}
                  className="h-11 px-5 text-[13px] bg-white dark:bg-[#222224]"
                >
                  {step.cta || 'Continue'}
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </SecondaryButton>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="flex items-center gap-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
        <Shield className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        <span>
          Your contact details, Aadhaar and bank details are never shown to
          sponsors.
        </span>
      </p>
    </div>
  );
}

export function FundingPage({ contributions, goal = 48000, onThankYou, sentNotes = [], demoMode = true }) {
  const [emptyPreview, setEmptyPreview] = useState(false);
  const [thanksFor, setThanksFor] = useState(null);
  const [note, setNote] = useState('');
  const items = emptyPreview ? [] : contributions;
  const raised = items.filter((c) => c.state !== 'pending').reduce((s, c) => s + c.amount, 0);
  const confirming = items.filter((c) => c.state === 'pending').reduce((s, c) => s + c.amount, 0);
  const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
  const words = note.trim() ? note.trim().split(/\s+/).length : 0;
  const noteFor = (c) => sentNotes.find((n) => n.sponsorId && n.sponsorId === c.sponsorId);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Funding
        </h1>
        {demoMode && (
        <button
          type="button"
          onClick={() => setEmptyPreview(!emptyPreview)}
          className="px-4 py-2 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]"
        >
          {emptyPreview ? 'Show contributions' : 'Preview empty state'}
        </button>
        )}
      </div>

      <div className="p-7 md:p-8 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-[40px] md:text-[48px] font-bold tracking-[-0.035em] leading-none">
              {formatINR(raised)}
            </div>
            <div className="text-[15px] text-[#52525B] dark:text-[#A1A1AA] mt-2">
              raised of {formatINR(goal)} goal
            </div>
          </div>
          <div className="text-[15px] font-semibold">{pct}%</div>
        </div>
        <ProgressBar percent={pct} />
        {confirming > 0 && (
          <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            {formatINR(confirming)} more is being confirmed with the bank.
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-12 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] text-center">
          <div className="text-[18px] font-semibold">No sponsors yet.</div>
          <p className="mt-1.5 text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Once your application is listed, sponsor contributions will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((c) => {
            const sent = noteFor(c);
            return (
              <div
                key={c.id}
                className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold">{c.sponsor}</span>
                    {c.state === 'pending' && (
                      <StatusChip status="pending" label="Confirming" />
                    )}
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                    {c.type} · {c.date}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {onThankYou && c.sponsorId && (
                    sent ? (
                      <span className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
                        {sent.state === 'approved'
                          ? 'Thank-you shared'
                          : sent.state === 'rejected'
                          ? 'Note not shared'
                          : 'Note with admin'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setNote('');
                          setThanksFor(c);
                        }}
                        className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-white dark:bg-[#222224] text-[13px] font-medium active:scale-[0.97] transition-transform"
                      >
                        <Heart className="w-3.5 h-3.5" strokeWidth={1.75} />
                        Say thank you
                      </button>
                    )
                  )}
                  <div className="text-[17px] font-bold tracking-[-0.01em]">
                    {formatINR(c.amount)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BottomSheet
        open={!!thanksFor}
        onClose={() => setThanksFor(null)}
        title="Send a thank-you note"
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            To {thanksFor?.sponsor}. The trust reads every note before the
            sponsor sees it. Please do not share your phone number, address or
            surname.
          </p>
          <FloatingTextarea
            label="Your note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            maxWords={80}
          />
          <PrimaryButton
            onClick={() => {
              onThankYou(thanksFor, note.trim());
              setThanksFor(null);
            }}
            disabled={words < 3 || words > 80}
            className="w-full"
          >
            Send for review
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}

const SUBJECT_TEMPLATES = {
  JEE: ['Physics', 'Chemistry', 'Maths'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  CUET: ['English', 'General Test', 'Domain subject'],
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthOptions = (count = 4, today = new Date()) =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  });
const monthKey = (label) => {
  const [m, y] = String(label).split(' ');
  return Number(y) * 12 + MONTH_NAMES.indexOf(m);
};

export function ProgressPage({
  records,
  onAddRecord,
  exam,
  subjects,
  deadline,
  showOutcome = false,
  outcome,
  onSubmitOutcome,
  demoMode = false,
  instituteName = 'Vidya Coaching Centre, Patna',
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [previewOutcome, setPreviewOutcome] = useState(false);
  const months = monthOptions();
  const subjectList = subjects || SUBJECT_TEMPLATES[exam] || null;

  // Fixed fields
  const [institute, setInstitute] = useState(instituteName);
  const [month, setMonth] = useState(months[0]);
  const [testName, setTestName] = useState('Mock test 5');
  const [date, setDate] = useState('2026-11-16');
  const [score, setScore] = useState('210 / 300');
  const [attendance, setAttendance] = useState('');
  const [testsTaken, setTestsTaken] = useState('');
  const [avgScore, setAvgScore] = useState('');
  const [rank, setRank] = useState('');
  const [mentorRemark, setMentorRemark] = useState('');
  const [statusFlag, setStatusFlag] = useState('active');
  const [comments, setComments] = useState('');
  const [subjectScores, setSubjectScores] = useState({});
  const [file, setFile] = useState(null);

  // Outcome form
  const [oExam, setOExam] = useState(exam ? `${exam} 2027` : '');
  const [oScore, setOScore] = useState('');
  const [oRank, setORank] = useState('');
  const [oQualified, setOQualified] = useState('yes');
  const [oCollege, setOCollege] = useState('');

  // Chart: one point per month from the records (verified and pending)
  const byMonth = {};
  records.forEach((r) => {
    if (r.numericScore == null) return;
    const k = monthKey(r.month);
    if (Number.isNaN(k)) return;
    if (!byMonth[k] || r.type?.startsWith('Mock') || r.avgScore != null) byMonth[k] = r;
  });
  const chartPoints = Object.keys(byMonth)
    .map(Number)
    .sort((a, b) => a - b)
    .slice(-6)
    .map((k) => ({
      label: MONTH_NAMES[k % 12].slice(0, 3),
      value: Number(byMonth[k].numericScore),
    }));
  const lo = Math.min(40, ...chartPoints.map((p) => p.value - 5));
  const hi = Math.max(80, ...chartPoints.map((p) => p.value + 5));
  const step = chartPoints.length > 1 ? 315 / (chartPoints.length - 1) : 0;
  const xAt = (i) => (chartPoints.length > 1 ? 40 + i * step : 200);
  const yAt = (v) => 110 - ((v - lo) / (hi - lo)) * 80;

  const pctOk = (v) => v === '' || (Number(v) >= 0 && Number(v) <= 100);
  const valid = pctOk(attendance) && pctOk(avgScore) && (testName || '').trim();

  const handleSave = () => {
    if (!valid) return;
    const numeric =
      avgScore !== ''
        ? Number(avgScore)
        : (() => {
            const m = String(score).match(/(\d+)\s*\/\s*(\d+)/);
            return m ? Math.round((Number(m[1]) / Number(m[2])) * 100) : null;
          })();
    onAddRecord({
      id: `p-${Date.now()}`,
      month,
      type: testName || 'Monthly update',
      score: score || (avgScore ? `${avgScore}%` : 'Submitted'),
      numericScore: numeric ?? 70,
      status: 'pending',
      remark: mentorRemark || `${institute} · ${date}`,
      attendance: attendance === '' ? null : Number(attendance),
      testsTaken: testsTaken === '' ? null : Number(testsTaken),
      avgScore: avgScore === '' ? null : Number(avgScore),
      rank: rank || null,
      mentorRemark: mentorRemark || null,
      progressStatus: statusFlag,
      comments: comments || null,
      subjects: subjectList ? subjectScores : null,
      file,
      institute,
      date,
    });
    setSheetOpen(false);
    setFile(null);
    setComments('');
  };

  const canShowOutcome = (showOutcome || previewOutcome) && onSubmitOutcome;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Progress
        </h1>
        <PrimaryButton
          onClick={() => setSheetOpen(true)}
          className="h-12 px-6 text-[14px]"
        >
          <Plus className="w-4 h-4" strokeWidth={1.75} />
          Add update
        </PrimaryButton>
      </div>

      {deadline && (
        <div className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[14px] font-medium w-fit max-w-full">
          <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>
            {deadline.coversLabel} update due by {deadline.dueLabel}
          </span>
        </div>
      )}

      {/* Clean monochrome line chart */}
      <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515]">
        <div className="text-[14px] font-semibold mb-4">
          Mock test score trend (%)
        </div>
        {chartPoints.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            Your trend appears after your first update.
          </div>
        ) : (
          <svg viewBox="0 0 400 130" className="w-full h-36 overflow-visible" role="img" aria-label="Mock test score trend">
            {[30, 60, 90].map((y) => (
              <line
                key={y}
                x1="20"
                y1={y}
                x2="380"
                y2={y}
                stroke="currentColor"
                className="text-[#E4E4E7] dark:text-[#262626]"
                strokeWidth="1"
              />
            ))}
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#0A0A0A] dark:text-[#FAFAFA]"
              points={chartPoints.map((pt, i) => `${xAt(i)},${yAt(pt.value)}`).join(' ')}
            />
            {chartPoints.map((pt, i) => {
              const x = xAt(i);
              const y = yAt(pt.value);
              return (
                <g key={`${pt.label}-${i}`}>
                  <circle cx={x} cy={y} r="4.5" className="fill-[#0A0A0A] dark:fill-[#FAFAFA]" />
                  <text x={x} y={y - 10} textAnchor="middle" className="fill-[#0A0A0A] dark:fill-[#FAFAFA] text-[11px] font-semibold">
                    {pt.value}%
                  </text>
                  <text x={x} y="126" textAnchor="middle" className="fill-[#52525B] dark:fill-[#A1A1AA] text-[11px]">
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {records.length === 0 && (
          <EmptyState title="No updates yet" body="Add your attendance and test scores each month, by the 7th." />
        )}
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5">
                <span className="text-[15px] font-semibold">{rec.type}</span>
                <span className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                  · {rec.month}
                </span>
                {rec.progressStatus && rec.progressStatus !== 'active' && (
                  <StatusChip status="needs_review" label={rec.progressStatus === 'at_risk' ? 'At risk' : 'Dropped'} />
                )}
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                {rec.remark}
              </div>
              {(rec.attendance != null || rec.testsTaken != null || rec.subjects) && (
                <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                  {[
                    rec.attendance != null && `Attendance ${rec.attendance}%`,
                    rec.testsTaken != null && `${rec.testsTaken} tests`,
                    rec.avgScore != null && `Average ${rec.avgScore}%`,
                    rec.rank && `Rank ${rec.rank}`,
                    rec.subjects &&
                      Object.entries(rec.subjects)
                        .filter(([, v]) => v !== '' && v != null)
                        .map(([k, v]) => `${k} ${v}%`)
                        .join(', '),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              )}
              {rec.comments && (
                <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] mt-1">
                  Your note: {rec.comments}
                </div>
              )}
              {rec.verifierNote && (
                <div className="text-[12px] text-[#0A0A0A] dark:text-[#FAFAFA] mt-1">
                  Trust note: {rec.verifierNote}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-[15px] font-semibold">{rec.score}</span>
              <StatusChip
                status={rec.status === 'verified' ? 'verified' : rec.status === 'correction' || rec.status === 'flagged' ? 'needs_review' : 'pending'}
                label={rec.status === 'verified' ? 'Accepted' : rec.status === 'correction' ? 'Fix needed' : rec.status === 'flagged' ? 'Checked' : 'Pending'}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Final outcome (once, at course end) */}
      {canShowOutcome && (
        <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
          <div className="text-[15px] font-semibold">Final result</div>
          {outcome ? (
            <div className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
              {outcome.exam} · {outcome.qualified ? 'Qualified' : 'Did not qualify'}
              {outcome.score ? ` · Score ${outcome.score}` : ''}
              {outcome.rank ? ` · Rank ${outcome.rank}` : ''}
              {outcome.college ? ` · ${outcome.college}` : ''}
            </div>
          ) : (
            <>
              <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
                Your course has ended. Share your result once. Sponsors see it
                without your surname or photo.
              </p>
              <SecondaryButton onClick={() => setOutcomeOpen(true)} className="h-11 px-5 text-[14px] bg-white dark:bg-[#222224]">
                Add final result
              </SecondaryButton>
            </>
          )}
        </div>
      )}
      {demoMode && !showOutcome && onSubmitOutcome && !previewOutcome && (
        <button
          type="button"
          onClick={() => setPreviewOutcome(true)}
          className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] underline underline-offset-4"
        >
          Preview the end-of-course result form (demo)
        </button>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add progress update"
      >
        <div className="space-y-4">
          <FloatingSelect
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            options={months}
          />
          <FloatingInput
            label="Institute"
            value={institute}
            onChange={(e) => setInstitute(e.target.value)}
          />
          <FloatingInput
            label="Test or record name"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <FloatingInput
              label="Score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <FloatingInput
              label="Attendance %"
              type="number"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
            />
            <FloatingInput
              label="Tests taken"
              type="number"
              value={testsTaken}
              onChange={(e) => setTestsTaken(e.target.value)}
            />
            <FloatingInput
              label="Average test score %"
              type="number"
              value={avgScore}
              onChange={(e) => setAvgScore(e.target.value)}
            />
            <FloatingInput
              label="Rank (optional)"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
          </div>
          {(!pctOk(attendance) || !pctOk(avgScore)) && (
            <p className="px-2 text-[12px] font-medium">Percentages must be between 0 and 100.</p>
          )}

          {subjectList && (
            <div className="space-y-3">
              <div className="text-[13px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">
                {exam} subjects (%)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subjectList.map((sub) => (
                  <FloatingInput
                    key={sub}
                    label={sub}
                    type="number"
                    value={subjectScores[sub] ?? ''}
                    onChange={(e) =>
                      setSubjectScores((prev) => ({ ...prev, [sub]: e.target.value }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <FloatingInput
            label="Mentor remark"
            value={mentorRemark}
            onChange={(e) => setMentorRemark(e.target.value)}
          />
          <div className="space-y-2">
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Status this month</div>
            <Segmented
              value={statusFlag}
              onChange={setStatusFlag}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'at_risk', label: 'At risk' },
                { value: 'dropped', label: 'Dropped' },
              ]}
            />
          </div>
          <FloatingTextarea
            label="Your comments (optional)"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            maxWords={60}
          />
          <FileDrop
            label="Attach scorecard or attendance screenshot (PDF, JPG, PNG)"
            file={file}
            onFile={setFile}
          />
          <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
            Due by the 7th of each month. A trust verifier checks it with your institute.
          </p>
          <PrimaryButton onClick={handleSave} disabled={!valid} className="w-full">
            Submit update
          </PrimaryButton>
        </div>
      </BottomSheet>

      <BottomSheet open={outcomeOpen} onClose={() => setOutcomeOpen(false)} title="Final result">
        <div className="space-y-4">
          <FloatingInput label="Exam attempted" value={oExam} onChange={(e) => setOExam(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput label="Score / percentile" value={oScore} onChange={(e) => setOScore(e.target.value)} />
            <FloatingInput label="Rank (optional)" value={oRank} onChange={(e) => setORank(e.target.value)} />
          </div>
          <div className="space-y-2">
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Did you qualify?</div>
            <Segmented
              value={oQualified}
              onChange={setOQualified}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>
          <FloatingInput label="College admitted (if any)" value={oCollege} onChange={(e) => setOCollege(e.target.value)} />
          <PrimaryButton
            onClick={() => {
              onSubmitOutcome({ exam: oExam, score: oScore, rank: oRank, qualified: oQualified === 'yes', college: oCollege });
              setOutcomeOpen(false);
            }}
            disabled={!oExam.trim()}
            className="w-full"
          >
            Submit result
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}

export function NotificationsPage({ notifications, onMarkRead, onMarkAll }) {
  const [tab, setTab] = useState('All');
  // Original four tabs, plus any other category this user has received.
  const base = ['All', 'Documents', 'Funding', 'Progress'];
  const tabs = [
    ...base,
    ...[...new Set(notifications.map((n) => n.category))].filter((c) => !base.includes(c)),
  ];

  const filtered =
    tab === 'All'
      ? notifications
      : notifications.filter((n) => n.category === tab);

  return (
    <div className="space-y-8 pb-12 max-w-[760px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Notifications
        </h1>
        {onMarkAll && notifications.some((n) => n.unread) && (
          <button
            type="button"
            onClick={onMarkAll}
            className="px-4 py-2 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`hit-44 px-5 py-2.5 rounded-full text-[13px] font-medium transition-colors ${
              tab === t
                ? 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]'
                : 'bg-[#F4F4F5] text-[#52525B] dark:bg-[#151515] dark:text-[#A1A1AA]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <EmptyState title="You're all caught up" body="New updates about your account will appear here." />
        )}
        {filtered.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onMarkRead(n.id)}
            className="w-full text-left p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-start gap-4 hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] transition-colors"
          >
            <span
              className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${
                n.unread
                  ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]'
                  : 'bg-transparent'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-[15px] ${
                    n.unread ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  {n.title}
                </span>
                <span className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                  {n.time}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {n.detail}
              </p>
              {n.channels && n.channels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Sent via">
                  {n.channels.map((c) => (
                    <span
                      key={c}
                      title={c === 'In-app' ? 'Delivered in the app' : `${c} (mocked in this prototype)`}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        c === 'In-app'
                          ? 'bg-white dark:bg-[#222224] text-[#0A0A0A] dark:text-[#FAFAFA]'
                          : 'border border-dashed border-[#A1A1AA] dark:border-[#52525B] text-[#52525B] dark:text-[#A1A1AA]'
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage({
  student,
  themeMode,
  setThemeMode,
  onResetDemo,
  demoMode,
  onToggleDemoMode,
  idLabel = 'Student ID',
  children,
}) {
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <div className="space-y-10 pb-12 max-w-[760px]">
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
        Settings
      </h1>

      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold">Account details</h2>
        <div className="p-6 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3 text-[14px]">
          <div className="flex justify-between gap-4">
            <span className="text-[#52525B] dark:text-[#A1A1AA]">Name</span>
            <span className="font-semibold">{student.fullName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#52525B] dark:text-[#A1A1AA]">
              {idLabel}
            </span>
            <span className="font-semibold">{student.id}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#52525B] dark:text-[#A1A1AA]">Mobile</span>
            <span className="font-semibold">{student.mobile}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#52525B] dark:text-[#A1A1AA]">Email</span>
            <span className="font-semibold">{student.email}</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold">Appearance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectableTile
            icon={Sun}
            title="Light"
            subtitle="Bright white surfaces"
            selected={themeMode === 'light'}
            onClick={() => setThemeMode('light')}
          />
          <SelectableTile
            icon={Moon}
            title="Dark"
            subtitle="Soft neutral charcoal"
            selected={themeMode === 'dark'}
            onClick={() => setThemeMode('dark')}
          />
          <SelectableTile
            icon={Monitor}
            title="Match device"
            subtitle="Follow system setting"
            selected={themeMode === 'system'}
            onClick={() => setThemeMode('system')}
          />
        </div>
      </section>

      {children}

      {onResetDemo && (
        <section className="space-y-4">
          <h2 className="text-[18px] font-semibold">Demo data</h2>
          <div className="p-6 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
              This prototype keeps all data in your browser. Reset to restore
              the original seed data for every role.
            </p>
            <div className="flex flex-wrap gap-3">
              <SecondaryButton
                onClick={() => setResetOpen(true)}
                className="h-11 px-5 text-[14px] bg-white dark:bg-[#222224]"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
                Reset demo data
              </SecondaryButton>
              {onToggleDemoMode && (
                <SecondaryButton
                  onClick={onToggleDemoMode}
                  className="h-11 px-5 text-[14px] bg-white dark:bg-[#222224]"
                >
                  {demoMode ? 'Turn off demo mode' : 'Turn on demo mode'}
                </SecondaryButton>
              )}
            </div>
          </div>
          <ConfirmSheet
            open={resetOpen}
            title="Reset demo data?"
            body="All changes made in this browser (applications, donations, payouts, notifications) will be replaced with the original seed data."
            confirmLabel="Reset"
            destructive
            onClose={() => setResetOpen(false)}
            onConfirm={() => {
              setResetOpen(false);
              onResetDemo();
            }}
          />
        </section>
      )}
    </div>
  );
}
