import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Clock,
  X,
  Sun,
  Moon,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  UploadCloud,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { STATUS_STEPS, formatINR, formatDate } from '../data/mockData';
import { TRUST } from '../data/rules';

export function Logo({ className = 'w-7 h-7' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Rising sun */}
      <path
        d="M10.5 14.5a5.5 5.5 0 0 1 11 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16 5.5V7.5M9 8.5l1.4 1.4M23 8.5l-1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Open book */}
      <path
        d="M5 17.5c3.5-1 7.5-.5 11 1.5 3.5-2 7.5-2.5 11-1.5v8.5c-3.5-1-7.5-.5-11 1.5-3.5-2-7.5-2.5-11-1.5v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 19v8.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="hit-44 relative inline-flex items-center h-9 w-[66px] rounded-full p-1 bg-[#F4F4F5] dark:bg-[#151515] border border-[#ECECEE] dark:border-[#262626] transition-colors duration-200 active:scale-[0.96]"
    >
      <span
        className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white dark:bg-[#262626] shadow-soft transition-transform duration-300 ease-out ${
          isDark ? 'translate-x-[28px]' : 'translate-x-0'
        }`}
      />
      <span className="relative z-10 w-7 h-7 flex items-center justify-center text-[#0A0A0A] dark:text-[#A1A1AA]">
        <Sun className="w-3.5 h-3.5" strokeWidth={1.75} />
      </span>
      <span className="relative z-10 w-7 h-7 flex items-center justify-center text-[#52525B] dark:text-[#FAFAFA]">
        <Moon className="w-3.5 h-3.5" strokeWidth={1.75} />
      </span>
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-14 px-7 rounded-full font-semibold text-[15px] tracking-[-0.01em] inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.97] ${
        disabled
          ? 'bg-[#ECECEE] text-[#A1A1AA] dark:bg-[#1C1C1C] dark:text-[#52525B] cursor-not-allowed active:scale-100'
          : 'bg-[#0A0A0A] text-white hover:bg-[#1F1F1F] dark:bg-[#FAFAFA] dark:text-[#0A0A0A] dark:hover:bg-[#E4E4E7] shadow-soft'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`h-14 px-7 rounded-full font-medium text-[15px] tracking-[-0.01em] inline-flex items-center justify-center gap-2 bg-[#F4F4F5] text-[#0A0A0A] hover:bg-[#ECECEE] dark:bg-[#151515] dark:text-[#FAFAFA] dark:hover:bg-[#222222] transition-all duration-150 active:scale-[0.97] disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function DestructiveButton({
  children,
  onClick,
  type = 'button',
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`h-12 px-6 rounded-full font-medium text-[14px] inline-flex items-center justify-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#F4F4F5] dark:border-[#FAFAFA] dark:text-[#FAFAFA] dark:hover:bg-[#1C1C1C] transition-all duration-150 active:scale-[0.97] ${className}`}
    >
      {children}
    </button>
  );
}

export function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = ' ',
  rightElement = null,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="peer w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[#0A0A0A] dark:text-[#FAFAFA] text-[15px] font-normal outline-none transition-all duration-150 focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25 disabled:opacity-60"
      />
      <label className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA] transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[14px] peer-focus:top-2 peer-focus:text-[11px]">
        {label}
      </label>
      {rightElement && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  );
}

export function FloatingSelect({
  label,
  value,
  onChange,
  options,
  className = '',
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[#0A0A0A] dark:text-[#FAFAFA] text-[15px] font-normal outline-none appearance-none transition-all duration-150 focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
        {label}
      </label>
    </div>
  );
}

export function FloatingTextarea({
  label,
  value,
  onChange,
  rows = 4,
  maxWords = 150,
}) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="relative">
      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full px-6 pt-7 pb-8 rounded-[20px] bg-[#F4F4F5] dark:bg-[#151515] text-[#0A0A0A] dark:text-[#FAFAFA] text-[15px] leading-relaxed outline-none resize-none transition-all duration-150 focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25"
      />
      <label className="pointer-events-none absolute left-6 top-2.5 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
        {label}
      </label>
      <span className="absolute right-5 bottom-3 text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
        {words} / {maxWords} words
      </span>
    </div>
  );
}

export function SelectableTile({
  icon: Icon,
  title,
  subtitle,
  selected,
  onClick,
  className = '',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-6 rounded-[24px] transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'bg-white dark:bg-[#151515] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA] shadow-soft'
          : 'bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] ring-1 ring-transparent'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] shadow-soft shrink-0">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {selected && (
          <span className="w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center animate-pop-in">
            <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-[16px] font-semibold tracking-[-0.01em] text-[#0A0A0A] dark:text-[#FAFAFA]">
          {title}
        </div>
        {subtitle && (
          <div className="mt-1 text-[13px] text-[#52525B] dark:text-[#A1A1AA] leading-snug">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  );
}

export function StatusChip({ status, label }) {
  const styles = {
    verified: {
      cls: 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]',
      Icon: Check,
      text: label || 'Verified',
    },
    locked: {
      cls: 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]',
      Icon: Check,
      text: label || 'Locked',
    },
    pending: {
      cls: 'bg-[#ECECEE] text-[#52525B] dark:bg-[#262626] dark:text-[#A1A1AA]',
      Icon: Clock,
      text: label || 'Pending',
    },
    uploaded: {
      cls: 'bg-[#ECECEE] text-[#0A0A0A] dark:bg-[#262626] dark:text-[#FAFAFA]',
      Icon: Clock,
      text: label || 'Uploaded',
    },
    needs_review: {
      cls: 'border border-[#0A0A0A]/40 text-[#0A0A0A] dark:border-[#FAFAFA]/40 dark:text-[#FAFAFA]',
      Icon: Clock,
      text: label || 'Needs review',
    },
    rejected: {
      cls: 'border border-[#0A0A0A] text-[#0A0A0A] dark:border-[#FAFAFA] dark:text-[#FAFAFA]',
      Icon: X,
      text: label || 'Rejected',
    },
    not_uploaded: {
      cls: 'border border-dashed border-[#52525B] text-[#52525B] dark:border-[#A1A1AA] dark:text-[#A1A1AA]',
      Icon: null,
      text: label || 'Not uploaded',
    },
    // Plain label (exam, donor type, band): no status icon.
    info: {
      cls: 'bg-[#ECECEE] text-[#0A0A0A] dark:bg-[#262626] dark:text-[#FAFAFA]',
      Icon: null,
      text: label || '',
    },
  };
  const cfg = styles[status] || styles.pending;
  const Icon = cfg.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap animate-pop-in ${cfg.cls}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2} />}
      <span>{cfg.text}</span>
    </span>
  );
}

export function ProgressBar({ percent }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full h-2 rounded-full bg-[#ECECEE] dark:bg-[#262626] overflow-hidden">
      <div
        className="h-full rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function StatusTracker({ currentStepIndex = 4 }) {
  return (
    <div className="w-full">
      {/* Mobile compact view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-[13px] mb-2.5">
          <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">
            Step {currentStepIndex + 1} of {STATUS_STEPS.length} ·{' '}
            {STATUS_STEPS[currentStepIndex]}
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1.5">
          {STATUS_STEPS.map((step, idx) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-colors duration-300 ${
                idx <= currentStepIndex
                  ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]'
                  : 'bg-[#ECECEE] dark:bg-[#262626]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop 8-step horizontal tracker */}
      <div className="hidden md:flex items-start justify-between gap-1">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={step}
              className="flex-1 flex flex-col items-center relative"
            >
              {idx > 0 && (
                <div
                  className={`absolute top-3 right-1/2 w-full h-[1.5px] -z-0 ${
                    idx <= currentStepIndex
                      ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]'
                      : 'bg-[#ECECEE] dark:bg-[#262626]'
                  }`}
                />
              )}
              <div className="relative z-10 flex items-center justify-center h-6">
                {isDone ? (
                  <span className="w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
                  </span>
                ) : isCurrent ? (
                  <span className="w-7 h-7 rounded-full bg-white dark:bg-[#0A0A0A] ring-[2.5px] ring-[#0A0A0A] dark:ring-[#FAFAFA] flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA]" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-white dark:bg-[#0A0A0A] border-2 border-[#D4D4D8] dark:border-[#3F3F46]" />
                )}
              </div>
              <span
                className={`mt-2 text-[11px] text-center leading-tight ${
                  isCurrent
                    ? 'font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]'
                    : isDone
                    ? 'font-medium text-[#52525B] dark:text-[#A1A1AA]'
                    : 'font-normal text-[#A1A1AA] dark:text-[#52525B]'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BottomSheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative z-10 w-full md:max-w-lg bg-white dark:bg-[#151515] rounded-t-[32px] md:rounded-[32px] p-6 md:p-8 shadow-soft-lg border border-[#ECECEE]/60 dark:border-[#262626] animate-sheet-up max-h-[88vh] overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-[#D4D4D8] dark:bg-[#3F3F46] mx-auto mb-5 md:mb-6" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#0A0A0A] dark:text-[#FAFAFA]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hit-44 w-9 h-9 rounded-full bg-[#F4F4F5] dark:bg-[#222224] flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#ECECEE] dark:hover:bg-[#2E2E32] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ===========================================================================
// PART 1 PRIMITIVES — built only from the existing tokens (see README).
// ===========================================================================

const T = {
  text: 'text-[#0A0A0A] dark:text-[#FAFAFA]',
  muted: 'text-[#52525B] dark:text-[#A1A1AA]',
  surface: 'bg-[#F4F4F5] dark:bg-[#151515]',
  raised: 'bg-white dark:bg-[#222224]',
  hairline: 'border-[#ECECEE] dark:border-[#262626]',
  label: 'text-[13px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]',
};
export const TOKENS = T;

export function SectionLabel({ children, className = '' }) {
  return <div className={`${T.label} ${className}`}>{children}</div>;
}

export function StatTile({ label, value, hint, icon: Icon, onClick, className = '', children }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`min-w-0 text-left rounded-[28px] ${T.surface} p-5 sm:p-6 flex flex-col justify-between gap-4 ${
        onClick ? 'hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`text-[13px] font-medium ${T.muted}`}>{label}</span>
        {Icon && (
          <span className={`w-10 h-10 rounded-full ${T.raised} shadow-soft flex items-center justify-center ${T.text} shrink-0`}>
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div>
        <div className={`text-[24px] sm:text-[32px] md:text-[36px] font-bold tracking-[-0.03em] leading-none [overflow-wrap:anywhere] ${T.text}`}>{value}</div>
        {hint && <div className={`mt-2 text-[13px] ${T.muted}`}>{hint}</div>}
        {children}
      </div>
    </Comp>
  );
}

export function Segmented({ options, value, onChange, className = '', size = 'md' }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div role="tablist" className={`inline-flex max-w-full overflow-x-auto p-1 rounded-full ${T.surface} gap-1 ${className}`}>
      {opts.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`shrink-0 whitespace-nowrap rounded-full font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25 ${
              size === 'sm' ? 'px-3.5 h-11 text-[12px]' : 'px-4 h-11 text-[13px]'
            } ${
              active
                ? 'bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-[#FAFAFA] shadow-soft font-semibold'
                : 'text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]'
            }`}
          >
            {o.label}
            {o.count != null && <span className="ml-1.5 opacity-70">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, body, action }) {
  return (
    <div className={`rounded-[28px] ${T.surface} px-6 py-12 text-center flex flex-col items-center`}>
      <span className={`w-12 h-12 rounded-full ${T.raised} shadow-soft flex items-center justify-center ${T.text}`}>
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </span>
      <div className={`mt-4 text-[16px] font-semibold ${T.text}`}>{title}</div>
      {body && <p className={`mt-1.5 text-[14px] max-w-sm ${T.muted}`}>{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Timeline({ items }) {
  if (!items || !items.length) return null;
  return (
    <ol className="relative">
      {items.map((it, i) => (
        <li key={it.id || i} className="relative pl-7 pb-5 last:pb-0">
          {i < items.length - 1 && <span className="absolute left-[5px] top-3 bottom-0 w-[1.5px] bg-[#ECECEE] dark:bg-[#262626]" />}
          <span
            className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
              it.muted ? 'bg-white dark:bg-[#0A0A0A] border-2 border-[#D4D4D8] dark:border-[#3F3F46]' : 'bg-[#0A0A0A] dark:bg-[#FAFAFA]'
            }`}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className={`text-[14px] font-medium ${it.muted ? T.muted : T.text}`}>{it.title}</span>
            {it.time && <span className={`text-[12px] ${T.muted}`}>{it.time}</span>}
          </div>
          {it.detail && <p className={`mt-0.5 text-[13px] ${T.muted}`}>{it.detail}</p>}
        </li>
      ))}
    </ol>
  );
}

export function Stepper({ steps, current }) {
  return (
    <div className="w-full">
      <div className="md:hidden">
        <div className={`text-[13px] font-semibold mb-2.5 ${T.text}`}>
          Step {current + 1} of {steps.length} · {steps[current]}
        </div>
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => (
            <div key={s} className={`h-1.5 rounded-full ${i <= current ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#ECECEE] dark:bg-[#262626]'}`} />
          ))}
        </div>
      </div>
      <div className="hidden md:flex items-center gap-3">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold ${
                  i < current
                    ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]'
                    : i === current
                    ? 'ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA] text-[#0A0A0A] dark:text-[#FAFAFA]'
                    : 'bg-[#F4F4F5] dark:bg-[#151515] text-[#A1A1AA] dark:text-[#52525B]'
                }`}
              >
                {i < current ? <Check className="w-3.5 h-3.5" strokeWidth={2.25} /> : i + 1}
              </span>
              <span className={`text-[13px] ${i === current ? `font-semibold ${T.text}` : i < current ? `font-medium ${T.muted}` : 'text-[#A1A1AA] dark:text-[#52525B]'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <span className={`flex-1 h-[1.5px] ${i < current ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#ECECEE] dark:bg-[#262626]'}`} />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function ConfirmSheet({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  reasonRequired = false,
  reasonLabel = 'Reason',
  destructive = false,
  children,
}) {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) setReason('');
  }, [open]);
  const blocked = reasonRequired && reason.trim().length < 3;
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        {body && <p className={`text-[15px] leading-relaxed ${T.muted}`}>{body}</p>}
        {children}
        {reasonRequired && (
          <div>
            <FloatingTextarea label={reasonLabel} value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxWords={80} />
            {blocked && <p className={`mt-2 text-[12px] ${T.muted}`}>A written reason is required.</p>}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          {destructive ? (
            <DestructiveButton onClick={() => !blocked && onConfirm(reason.trim())} className={`flex-1 h-14 ${blocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {confirmLabel}
            </DestructiveButton>
          ) : (
            <PrimaryButton onClick={() => onConfirm(reason.trim())} disabled={blocked} className="flex-1">
              {confirmLabel}
            </PrimaryButton>
          )}
          <SecondaryButton onClick={onClose} className="flex-1">
            {cancelLabel}
          </SecondaryButton>
        </div>
      </div>
    </BottomSheet>
  );
}

/** Bottom-centre pill. Render with a message; it calls onDone after 3 s. */
export function Toast({ message, onDone, duration = 3000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => onDone && onDone(), duration);
    return () => clearTimeout(t);
  }, [message, onDone, duration]);
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 bottom-24 md:bottom-8 z-[60] flex justify-center px-4 pointer-events-none">
      <div role="status" aria-live="polite" className="pointer-events-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A] text-[14px] font-medium shadow-soft-lg animate-sheet-up">
        <Check className="w-4 h-4 shrink-0" strokeWidth={2} />
        <span>{message}</span>
      </div>
    </div>
  );
}

export function Money({ value, strong = false, className = '' }) {
  return <span className={`${strong ? 'font-bold' : 'font-semibold'} tabular-nums ${className}`}>{formatINR(value)}</span>;
}

const groupINR = (n) => (n === '' || n == null ? '' : Number(n).toLocaleString('en-IN'));

/** Amount input: formats with en-IN commas as you type. onChange receives a number. */
export function Amount({ label = 'Amount (₹)', value, onChange, max, min, helper, disabled = false, className = '' }) {
  const display = value === '' || value == null ? '' : groupINR(value);
  const over = max != null && Number(value) > max;
  const under = min != null && value !== '' && Number(value) < min;
  return (
    <div className={className}>
      <div className="relative">
        <span className={`absolute left-6 top-[27px] text-[15px] ${T.text}`}>₹</span>
        <input
          inputMode="numeric"
          value={display}
          disabled={disabled}
          placeholder=" "
          aria-label={label}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '');
            onChange(digits === '' ? '' : Number(digits));
          }}
          className="peer w-full h-14 pl-10 pr-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[#0A0A0A] dark:text-[#FAFAFA] text-[15px] tabular-nums outline-none focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25 disabled:opacity-60"
        />
        <label className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">{label}</label>
      </div>
      {(helper || over || under) && (
        <p className={`mt-2 px-2 text-[12px] ${over || under ? `font-medium ${T.text}` : T.muted}`}>
          {over ? `Maximum is ${formatINR(max)}.` : under ? `Minimum is ${formatINR(min)}.` : helper}
        </p>
      )}
    </div>
  );
}

// --- DataTable -------------------------------------------------------------
/**
 * columns: [{ key, label, render?(row), sortValue?(row), sortable?, className?, hideOnMobile? }]
 * filter:  { options: [{value,label}], getValue(row) } — 'All' is added automatically
 * searchText(row) -> string used by the search box
 */
export function DataTable({
  columns,
  rows,
  searchText,
  searchPlaceholder = 'Search',
  filter,
  initialFilter = 'All',
  onRowClick,
  pageSize = 10,
  empty = { title: 'Nothing here yet', body: 'Records will appear here as they come in.' },
  toolbar,
  rowKey = (r) => r.id,
}) {
  const [q, setQ] = useState('');
  const [f, setF] = useState(initialFilter);
  const [sort, setSort] = useState({ key: null, dir: 1 });
  const [page, setPage] = useState(0);

  useEffect(() => setF(initialFilter), [initialFilter]);
  useEffect(() => setPage(0), [q, f, rows.length]);

  const filtered = useMemo(() => {
    let out = rows;
    if (filter && f !== 'All') out = out.filter((r) => filter.getValue(r) === f);
    if (q.trim() && searchText) {
      const needle = q.trim().toLowerCase();
      out = out.filter((r) => searchText(r).toLowerCase().includes(needle));
    }
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      const val = col.sortValue || ((r) => r[col.key]);
      out = [...out].sort((a, b) => {
        const x = val(a);
        const y = val(b);
        return (x > y ? 1 : x < y ? -1 : 0) * sort.dir;
      });
    }
    return out;
  }, [rows, f, q, sort, columns, filter, searchText]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const view = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const grid = { gridTemplateColumns: columns.map((c) => c.width || 'minmax(0,1fr)').join(' ') };

  return (
    <div className="space-y-4">
      {(searchText || filter || toolbar) && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {searchText && (
            <div className="relative lg:w-72 shrink-0">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 ${T.muted}`} strokeWidth={1.75} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full h-12 pl-12 pr-5 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[14px] text-[#0A0A0A] dark:text-[#FAFAFA] placeholder:text-[#A1A1AA] dark:placeholder:text-[#52525B] outline-none focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25"
              />
            </div>
          )}
          {filter && (
            <Segmented
              size="sm"
              value={f}
              onChange={setF}
              options={[{ value: 'All', label: 'All' }, ...filter.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))]}
            />
          )}
          {toolbar && <div className="lg:ml-auto flex gap-2">{toolbar}</div>}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={empty.icon} title={empty.title} body={empty.body} action={empty.action} />
      ) : (
        <>
          {/* Desktop rows */}
          <div className="hidden md:block">
            <div className="grid gap-4 px-5 pb-2" style={grid}>
              {columns.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  disabled={c.sortable === false}
                  onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? -s.dir : 1 }))}
                  className={`text-left inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider ${T.muted} ${c.align === 'right' ? 'justify-end' : ''}`}
                >
                  {c.label}
                  {sort.key === c.key && (sort.dir === 1 ? <ChevronUp className="w-3 h-3" strokeWidth={2} /> : <ChevronDown className="w-3 h-3" strokeWidth={2} />)}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              {view.map((r) => (
                <div
                  key={rowKey(r)}
                  role={onRowClick ? 'button' : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(r)) : undefined}
                  className={`grid gap-4 items-center px-5 py-4 rounded-[20px] text-[14px] ${T.text} ${
                    onRowClick ? 'cursor-pointer hover:bg-[#F4F4F5] dark:hover:bg-[#151515] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25' : ''
                  } transition-colors`}
                  style={grid}
                >
                  {columns.map((c) => (
                    <div key={c.key} className={`min-w-0 ${c.align === 'right' ? 'text-right' : ''} ${c.className || ''}`}>
                      {c.render ? c.render(r) : r[c.key]}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {view.map((r) => (
              <div
                key={rowKey(r)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={`p-5 rounded-[24px] ${T.surface} space-y-2.5 ${onRowClick ? 'active:scale-[0.99] transition-transform' : ''}`}
              >
                {columns
                  .filter((c) => !c.hideOnMobile)
                  .map((c, i) => (
                    <div key={c.key} className={i === 0 ? `text-[15px] font-semibold ${T.text}` : 'flex items-center justify-between gap-3 text-[13px]'}>
                      {i === 0 ? (
                        c.render ? c.render(r) : r[c.key]
                      ) : (
                        <>
                          <span className={T.muted}>{c.label}</span>
                          <span className={`text-right min-w-0 ${T.text}`}>{c.render ? c.render(r) : r[c.key]}</span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className={`text-[13px] ${T.muted}`}>
                {page * pageSize + 1}–{Math.min(filtered.length, (page + 1) * pageSize)} of {filtered.length}
              </span>
              <div className="flex gap-2">
                <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className={`w-11 h-11 rounded-full ${T.surface} flex items-center justify-center ${T.text} disabled:opacity-40`}>
                  <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                </button>
                <button type="button" aria-label="Next page" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className={`w-11 h-11 rounded-full ${T.surface} flex items-center justify-center ${T.text} disabled:opacity-40`}>
                  <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- Charts (inline SVG, monochrome; series differ by dash, not colour) -------
const compactINR = (n) => {
  const v = Math.abs(n);
  if (v >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${Math.round(n / 1000)}k`;
  return `₹${n}`;
};
export { compactINR };

export function BarChart({ data, height = 180, format = compactINR, ariaLabel = 'Bar chart' }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.value2 || 0)));
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label={ariaLabel}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height / 2 - 12);
        const h2 = d.value2 != null ? (d.value2 / max) * (height / 2 - 12) : 0;
        const x = i * w + w * 0.18;
        const bw = d.value2 != null ? w * 0.3 : w * 0.64;
        return (
          <g key={d.label}>
            <title>{`${d.label}: ${format(d.value)}${d.value2 != null ? ` / ${format(d.value2)}` : ''}`}</title>
            <rect x={x} y={height / 2 - 8 - h} width={bw} height={Math.max(h, 0.6)} rx="1.2" className="fill-[#0A0A0A] dark:fill-[#FAFAFA]" />
            {d.value2 != null && (
              <rect x={x + bw + w * 0.04} y={height / 2 - 8 - h2} width={bw} height={Math.max(h2, 0.6)} rx="1.2" className="fill-[#A1A1AA] dark:fill-[#52525B]" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ChartAxis({ labels }) {
  return (
    <div className="flex justify-between px-1 mt-1">
      {labels.map((l) => (
        <span key={l} className={`text-[11px] font-medium flex-1 text-center ${T.muted}`}>
          {l}
        </span>
      ))}
    </div>
  );
}

export function ChartLegend({ items }) {
  return (
    <div className="flex flex-wrap gap-4">
      {items.map((it) => (
        <span key={it.label} className={`inline-flex items-center gap-2 text-[12px] font-medium ${T.muted}`}>
          <svg width="22" height="8" aria-hidden="true">
            <line x1="1" y1="4" x2="21" y2="4" strokeWidth="2" strokeDasharray={it.dashed ? '4 3' : undefined} strokeLinecap="round" className={it.secondary ? 'stroke-[#A1A1AA] dark:stroke-[#52525B]' : 'stroke-[#0A0A0A] dark:stroke-[#FAFAFA]'} />
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** series: [{ name, values: number[], dashed?, secondary? }] */
export function LineChart({ series, labels, height = 180, ariaLabel = 'Line chart' }) {
  const W = 300;
  const H = 120;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(1, ...all);
  const n = labels.length;
  const pt = (v, i) => [n === 1 ? W / 2 : (i / (n - 1)) * (W - 16) + 8, H - 10 - (v / max) * (H - 22)];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label={ariaLabel}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H - 10 - g * (H - 22)} y2={H - 10 - g * (H - 22)} strokeWidth="1" className="stroke-[#ECECEE] dark:stroke-[#262626]" />
        ))}
        {series.map((s) => {
          const pts = s.values.map((v, i) => pt(v, i));
          return (
            <g key={s.name}>
              <polyline
                fill="none"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.dashed ? '5 4' : undefined}
                points={pts.map((p) => p.join(',')).join(' ')}
                className={s.secondary ? 'stroke-[#A1A1AA] dark:stroke-[#52525B]' : 'stroke-[#0A0A0A] dark:stroke-[#FAFAFA]'}
              />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" className={s.secondary ? 'fill-white dark:fill-[#151515] stroke-[#A1A1AA] dark:stroke-[#52525B]' : 'fill-[#0A0A0A] dark:fill-[#FAFAFA]'} strokeWidth="1.5">
                  <title>{`${s.name}, ${labels[i]}: ${s.values[i].toLocaleString('en-IN')}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      <ChartAxis labels={labels} />
    </div>
  );
}

// Monochrome series from the token greys only (never the track colour).
const DONUT_SHADES = ['#0A0A0A', '#52525B', '#A1A1AA', '#D4D4D8', '#3F3F46', '#E4E4E7', '#262626', '#1D1D1F'];
const DONUT_SHADES_DARK = ['#FAFAFA', '#A1A1AA', '#52525B', '#3F3F46', '#D4D4D8', '#E4E4E7', '#ECECEE', '#222224'];

export function Donut({ segments, size = 160, label, sublabel, isDark }) {
  const dark = isDark ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const shades = dark ? DONUT_SHADES_DARK : DONUT_SHADES;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 15.9155;
  let offset = 25;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 42 42" className="w-full h-full -rotate-0" role="img" aria-label={label || 'Donut chart'}>
          <circle cx="21" cy="21" r={r} fill="none" strokeWidth="5" className="stroke-[#ECECEE] dark:stroke-[#262626]" />
          {segments.map((sg, i) => {
            const pct = (sg.value / total) * 100;
            const el = (
              <circle key={sg.label} cx="21" cy="21" r={r} fill="none" stroke={shades[i % shades.length]} strokeWidth="5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset}>
                <title>{`${sg.label}: ${sg.value}`}</title>
              </circle>
            );
            offset -= pct;
            return el;
          })}
        </svg>
        {label && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-[24px] font-bold tracking-[-0.03em] ${T.text}`}>{label}</span>
            {sublabel && <span className={`text-[11px] ${T.muted}`}>{sublabel}</span>}
          </div>
        )}
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-5 gap-y-1.5 w-full">
        {segments.map((sg, i) => (
          <li key={sg.label} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="inline-flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: shades[i % shades.length] }} />
              <span className={`truncate ${T.muted}`}>{sg.label}</span>
            </span>
            <span className={`font-semibold tabular-nums ${T.text}`}>{sg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Files -------------------------------------------------------------------
const fmtSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Mock upload: keeps only name + size, nothing leaves the browser. */
export function FileDrop({ label = 'Attach a file (PDF, JPG, PNG)', file, onFile, accept = '.pdf,.jpg,.jpeg,.png' }) {
  const ref = useRef(null);
  const [over, setOver] = useState(false);
  const pick = (f) => f && onFile({ name: f.name, size: f.size, sizeLabel: fmtSize(f.size), at: new Date().toISOString() });
  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current && ref.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={`w-full border-2 border-dashed rounded-[20px] p-5 text-center text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25 ${
          over ? 'border-[#0A0A0A] dark:border-[#FAFAFA] bg-[#F4F4F5] dark:bg-[#151515]' : 'border-[#D4D4D8] dark:border-[#3F3F46]'
        } ${T.muted}`}
      >
        {file ? (
          <span className={`inline-flex items-center gap-2 font-medium ${T.text}`}>
            <FileText className="w-4 h-4" strokeWidth={1.75} />
            {file.name} · {file.sizeLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <UploadCloud className="w-4 h-4" strokeWidth={1.75} />
            {label}
          </span>
        )}
      </button>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => pick(e.target.files[0])} />
    </div>
  );
}

export function DocViewer({ open, onClose, doc }) {
  return (
    <BottomSheet open={open} onClose={onClose} title={doc?.name || 'Document'}>
      <div className="space-y-5">
        <div className={`aspect-[3/4] max-h-[46vh] mx-auto rounded-[24px] ${T.surface} flex flex-col items-center justify-center gap-3 p-6 text-center`}>
          <span className={`w-12 h-12 rounded-full ${T.raised} shadow-soft flex items-center justify-center ${T.text}`}>
            <FileText className="w-5 h-5" strokeWidth={1.75} />
          </span>
          <div className={`text-[14px] font-semibold ${T.text}`}>{doc?.fileName || `${(doc?.type || 'document').replace('_', '-')}.pdf`}</div>
          <div className={`text-[12px] ${T.muted}`}>{doc?.source === 'digilocker' ? 'Fetched from DigiLocker (sandbox)' : 'Uploaded by the applicant'}</div>
          {doc?.status && <StatusChip status={doc.status} />}
        </div>
        <p className={`text-[12px] text-center ${T.muted}`}>Preview only in this prototype. Files are not stored.</p>
        <SecondaryButton disabled className="w-full">
          <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
          Open in new tab
        </SecondaryButton>
      </div>
    </BottomSheet>
  );
}

// --- OTP -----------------------------------------------------------------------
export function OtpInput({ value = '', onChange, length = 6, demo = true, autoFocus = true }) {
  const refs = useRef([]);
  const chars = Array.from({ length }, (_, i) => value[i] || '');
  useEffect(() => {
    if (autoFocus && refs.current[0]) refs.current[0].focus();
  }, [autoFocus]);
  const setAt = (i, ch) => {
    const next = chars.slice();
    next[i] = ch;
    onChange(next.join('').slice(0, length));
  };
  return (
    <div>
      <div className="flex gap-2 sm:gap-2.5 justify-between">
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={c}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, '');
              if (d.length > 1) {
                onChange(d.slice(0, length));
                refs.current[Math.min(d.length, length) - 1]?.focus();
                return;
              }
              setAt(i, d);
              if (d && i < length - 1) refs.current[i + 1]?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !c && i > 0) refs.current[i - 1]?.focus();
            }}
            className="w-full min-w-0 max-w-[56px] h-14 rounded-[16px] text-center text-[20px] font-semibold bg-[#F4F4F5] dark:bg-[#151515] text-[#0A0A0A] dark:text-[#FAFAFA] outline-none focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25"
          />
        ))}
      </div>
      {demo && <p className={`mt-3 text-[12px] ${T.muted}`}>Demo OTP: 123456</p>}
    </div>
  );
}

// --- Printable documents --------------------------------------------------------
/** Prints only the given element (see .print-target in index.css). */
export function printElement(el) {
  if (!el) return;
  el.classList.add('print-target');
  document.body.classList.add('printing');
  const done = () => {
    el.classList.remove('print-target');
    document.body.classList.remove('printing');
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.print();
  setTimeout(done, 1000);
}

function PrintableShell({ children, kind, number }) {
  const ref = useRef(null);
  return (
    <div className="space-y-4">
      <div ref={ref} className="print-doc bg-white text-[#0A0A0A] rounded-[28px] border border-[#ECECEE] dark:border-[#262626] p-7 md:p-10 aspect-[210/297] max-w-[560px] mx-auto flex flex-col shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logo className="w-8 h-8" />
            <div>
              <div className="text-[15px] font-semibold tracking-[-0.02em]">Sikshit Bharat</div>
              <div className="text-[10px] text-[#52525B]">{TRUST.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-[#52525B]">{kind}</div>
            <div className="text-[11px] font-semibold">{number}</div>
          </div>
        </div>
        {children}
        <div className="mt-auto pt-4 border-t border-[#ECECEE] text-[9px] leading-snug text-[#52525B]">
          {TRUST.name} · {TRUST.regNo} · PAN {TRUST.pan} · 80G {TRUST.reg80G}
          <br />
          {TRUST.address}
        </div>
      </div>
      <div className="flex justify-center">
        <SecondaryButton onClick={() => printElement(ref.current)} className="h-12 px-6 text-[14px]">
          <Download className="w-4 h-4" strokeWidth={1.75} />
          Download PDF
        </SecondaryButton>
      </div>
    </div>
  );
}

const CERT_TITLES = {
  sponsorship: 'Sponsorship Certificate',
  constituency_impact: 'Constituency Impact Certificate',
  utilisation: 'Utilisation Certificate',
  annual_sip: 'Annual Giving Certificate',
};

/** Certificates never show student surnames, photos or contact details. */
export function CertificateCard({ certificate, sponsorName, lines = [], signedBy = 'Trustee' }) {
  return (
    <PrintableShell kind="Certificate" number={certificate.number}>
      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#52525B]">This certifies that</div>
        <div className="mt-3 text-[24px] md:text-[28px] font-semibold tracking-[-0.03em] leading-tight">{sponsorName}</div>
        <div className="mt-4 text-[12px] font-semibold uppercase tracking-wider">{CERT_TITLES[certificate.type] || 'Certificate'}</div>
        <div className="mt-5 space-y-1.5 text-[12px] text-[#52525B] max-w-[340px]">
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <p className="pt-1">
            Amount: <span className="font-semibold text-[#0A0A0A]">{formatINR(certificate.amount)}</span> · Issued {formatDate(certificate.issuedAt)}
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between gap-4 pb-4">
        <div className="w-16 h-16 border border-dashed border-[#A1A1AA] rounded-[10px] flex items-center justify-center text-[8px] text-[#A1A1AA]">QR</div>
        <div className="text-right">
          <div className="w-36 border-b border-[#0A0A0A] mb-1 h-6" />
          <div className="text-[10px] text-[#52525B]">{signedBy}</div>
        </div>
      </div>
    </PrintableShell>
  );
}

export function ReceiptCard({ receipt, donorName, paymentRef, date }) {
  const rows = [
    ['Receipt no.', receipt.number],
    ['Donor', donorName],
    ['PAN', receipt.panMasked],
    ['Amount received', formatINR(receipt.amount)],
    ['Date', formatDate(date || receipt.issuedAt)],
    ['Payment reference', paymentRef],
    ['Section', `${receipt.section} of the Income Tax Act, 1961`],
  ];
  return (
    <PrintableShell kind="80G Receipt" number={receipt.number}>
      <div className="flex-1 py-6">
        <div className="text-[18px] font-semibold tracking-[-0.02em]">Donation receipt</div>
        <div className="mt-5 divide-y divide-[#ECECEE]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5 text-[12px]">
              <span className="text-[#52525B]">{k}</span>
              <span className="font-semibold text-right">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[10px] leading-relaxed text-[#52525B]">
          Donations to {TRUST.name} are eligible for deduction under Section 80G. The receipt covers the full amount paid, including the platform fee. The trust files Form 10BD each year and issues Form 10BE. Wording to be confirmed by the trust’s CA.
        </p>
      </div>
    </PrintableShell>
  );
}
