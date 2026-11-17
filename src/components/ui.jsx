import React from 'react';
import { Check, Clock, X, Sun, Moon } from 'lucide-react';
import { STATUS_STEPS } from '../data/mockData';

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
      className="relative inline-flex items-center h-9 w-[66px] rounded-full p-1 bg-[#F4F4F5] dark:bg-[#151515] border border-[#ECECEE] dark:border-[#262626] transition-colors duration-200 active:scale-[0.96]"
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
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
            className="w-9 h-9 rounded-full bg-[#F4F4F5] dark:bg-[#222224] flex items-center justify-center text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#ECECEE] dark:hover:bg-[#2E2E32] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
