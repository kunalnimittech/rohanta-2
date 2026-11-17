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
} from 'lucide-react';
import { formatINR } from '../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  ProgressBar,
  StatusTracker,
  BottomSheet,
  FloatingInput,
  SelectableTile,
} from '../components/ui';

export function DashboardPage({
  student,
  contributions,
  progressRecords,
  onNavigate,
  onOpenUpload,
}) {
  const raised = contributions.reduce((s, c) => s + c.amount, 0);
  const goal = 48000;
  const pct = Math.round((raised / goal) * 100);
  const remaining = Math.max(0, goal - raised);

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
        <StatusTracker currentStepIndex={4} />
      </div>

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
          </div>

          <div className="space-y-3 mt-8">
            <div className="flex items-center justify-between text-[13px] font-semibold">
              <span>{pct}% funded</span>
              <span>
                {contributions.length} sponsors · {formatINR(remaining)} to go
              </span>
            </div>
            <ProgressBar percent={pct} />
            <div className="flex items-center gap-2 pt-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
              <Calendar className="w-4 h-4" strokeWidth={1.75} />
              <span>Course starts in 14 days</span>
            </div>
          </div>
        </div>

        {/* 2. Package (2x1) */}
        <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-[15px] font-semibold">Package</div>
            <StatusChip status="locked" label="Locked" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">
                Institute fee
              </div>
              <div className="font-semibold text-[15px] mt-0.5">₹40,000</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">
                Stationery
              </div>
              <div className="font-semibold text-[15px] mt-0.5">₹3,000</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Travel</div>
              <div className="font-semibold text-[15px] mt-0.5">₹5,000</div>
            </div>
            <div>
              <div className="text-[#52525B] dark:text-[#A1A1AA]">Total</div>
              <div className="font-bold text-[15px] mt-0.5">₹48,000</div>
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

        {/* 4. Sponsors (1x1 -> 2 cols on 4-col grid or 1+1) */}
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
            <div className="flex justify-between">
              <span className="font-medium">Anand S.</span>
              <span className="text-[#52525B] dark:text-[#A1A1AA]">
                Individual
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tata Steel</span>
              <span className="text-[#52525B] dark:text-[#A1A1AA]">CSR</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Anonymous sponsor</span>
              <span className="text-[#52525B] dark:text-[#A1A1AA]">
                Individual
              </span>
            </div>
          </div>
        </div>

        {/* 5. Next step (1x1 -> 2 cols on 4-col grid) */}
        <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between gap-4">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Next step
            </div>
            <div className="mt-1.5 text-[16px] font-semibold leading-snug">
              Upload October attendance by 5 Nov
            </div>
          </div>
          <div>
            <SecondaryButton
              onClick={onOpenUpload}
              className="h-11 px-5 text-[13px] bg-white dark:bg-[#222224]"
            >
              Upload now
              <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </SecondaryButton>
          </div>
        </div>
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

export function FundingPage({ contributions }) {
  const [emptyPreview, setEmptyPreview] = useState(false);
  const items = emptyPreview ? [] : contributions;
  const raised = items.reduce((s, c) => s + c.amount, 0);
  const goal = 48000;
  const pct = Math.round((raised / goal) * 100);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
          Funding
        </h1>
        <button
          type="button"
          onClick={() => setEmptyPreview(!emptyPreview)}
          className="px-4 py-2 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]"
        >
          {emptyPreview ? 'Show contributions' : 'Preview empty state'}
        </button>
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
          {items.map((c) => (
            <div
              key={c.id}
              className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-between gap-4"
            >
              <div>
                <div className="text-[15px] font-semibold">{c.sponsor}</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                  {c.type} · {c.date}
                </div>
              </div>
              <div className="text-[17px] font-bold tracking-[-0.01em]">
                {formatINR(c.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProgressPage({ records, onAddRecord }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [institute, setInstitute] = useState('Vidya Coaching Centre, Patna');
  const [testName, setTestName] = useState('Mock test 5');
  const [date, setDate] = useState('2026-11-16');
  const [score, setScore] = useState('210 / 300');

  const chartPoints = [
    { label: 'Jul', value: 54 },
    { label: 'Aug', value: 58 },
    { label: 'Sep', value: 66 },
    { label: 'Oct', value: 61 },
  ];

  const handleSave = () => {
    onAddRecord({
      id: `p-${Date.now()}`,
      month: 'November 2026',
      type: testName || 'Monthly update',
      score: score || 'Submitted',
      numericScore: 70,
      status: 'pending',
      remark: `${institute} · ${date}`,
    });
    setSheetOpen(false);
  };

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

      {/* Clean monochrome line chart */}
      <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515]">
        <div className="text-[14px] font-semibold mb-4">
          Mock test score trend (%)
        </div>
        <svg viewBox="0 0 400 130" className="w-full h-36 overflow-visible">
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
            points={chartPoints
              .map(
                (pt, i) =>
                  `${40 + i * 105},${110 - ((pt.value - 40) / 40) * 80}`
              )
              .join(' ')}
          />
          {chartPoints.map((pt, i) => {
            const x = 40 + i * 105;
            const y = 110 - ((pt.value - 40) / 40) * 80;
            return (
              <g key={pt.label}>
                <circle
                  cx={x}
                  cy={y}
                  r="4.5"
                  className="fill-[#0A0A0A] dark:fill-[#FAFAFA]"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="fill-[#0A0A0A] dark:fill-[#FAFAFA] text-[11px] font-semibold"
                >
                  {pt.value}%
                </text>
                <text
                  x={x}
                  y="126"
                  textAnchor="middle"
                  className="fill-[#52525B] dark:fill-[#A1A1AA] text-[11px]"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {records.map((rec) => (
          <div
            key={rec.id}
            className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-semibold">{rec.type}</span>
                <span className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                  · {rec.month}
                </span>
              </div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                {rec.remark}
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-[15px] font-semibold">{rec.score}</span>
              <StatusChip
                status={rec.status === 'verified' ? 'verified' : 'pending'}
                label={rec.status === 'verified' ? 'Accepted' : 'Pending'}
              />
            </div>
          </div>
        ))}
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add progress update"
      >
        <div className="space-y-4">
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
          <FloatingInput
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <FloatingInput
            label="Score / Attendance"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <div className="border-2 border-dashed border-[#D4D4D8] dark:border-[#3F3F46] rounded-[20px] p-5 text-center text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            Attach scorecard or attendance screenshot (PDF, JPG, PNG)
          </div>
          <PrimaryButton onClick={handleSave} className="w-full">
            Submit update
          </PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}

export function NotificationsPage({ notifications, onMarkRead }) {
  const [tab, setTab] = useState('All');
  const tabs = ['All', 'Documents', 'Funding', 'Progress'];

  const filtered =
    tab === 'All'
      ? notifications
      : notifications.filter((n) => n.category === tab);

  return (
    <div className="space-y-8 pb-12 max-w-[760px]">
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">
        Notifications
      </h1>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-full text-[13px] font-medium transition-colors ${
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
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage({ student, themeMode, setThemeMode }) {
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
              Student ID
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
    </div>
  );
}
