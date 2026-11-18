// Shared building blocks for the admin pages. Only existing tokens.
import React, { useCallback, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { StatusChip, Toast, SecondaryButton, ConfirmSheet } from '../../components/ui';

export function PageHeader({ title, sub, actions, onBack, backLabel = 'Back' }) {
  return (
    <div className="space-y-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          {backLabel}
        </button>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em] leading-tight">{title}</h1>
          {sub && <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">{sub}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] ${className}`}>{children}</div>;
}

/** Inputs inside grey cards need the raised surface to stay visible. */
export const RAISED_INPUTS =
  '[&_input]:bg-white [&_select]:bg-white [&_textarea]:bg-white dark:[&_input]:bg-[#222224] dark:[&_select]:bg-[#222224] dark:[&_textarea]:bg-[#222224]';

export function KV({ label, value, strong = false }) {
  return (
    <div className="flex justify-between gap-4 text-[14px] py-1">
      <span className="text-[#52525B] dark:text-[#A1A1AA] shrink-0">{label}</span>
      <span className={`${strong ? 'font-bold' : 'font-semibold'} text-right min-w-0 break-words`}>{value ?? '—'}</span>
    </div>
  );
}

export function SmallButton({ children, onClick, primary = false, disabled = false, className = '', ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25 disabled:opacity-40 disabled:active:scale-100 ${
        primary
          ? 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A] hover:bg-[#1F1F1F] dark:hover:bg-[#E4E4E7]'
          : 'bg-white dark:bg-[#222224] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#ECECEE] dark:hover:bg-[#2E2E32]'
      } ${className}`}
    >
      {children}
    </button>
  );
}

const STUDENT_CHIP = {
  Draft: 'not_uploaded',
  'Consent pending': 'pending',
  'Under verification': 'pending',
  'Info requested': 'needs_review',
  Listed: 'uploaded',
  'Partially funded': 'uploaded',
  'Fully funded': 'verified',
  Enrolled: 'verified',
  Completed: 'verified',
  Rejected: 'rejected',
  Dropped: 'rejected',
};
export const StudentStatusChip = ({ status }) => <StatusChip status={STUDENT_CHIP[status] || 'pending'} label={status} />;

const KYC_CHIP = {
  not_required: ['verified', 'PAN + OTP'],
  pending: ['pending', 'KYC pending'],
  verified: ['verified', 'Verified'],
  rejected: ['rejected', 'Rejected'],
};
export const KycChip = ({ status }) => {
  const [s, l] = KYC_CHIP[status] || KYC_CHIP.pending;
  return <StatusChip status={s} label={l} />;
};

const DONATION_CHIP = {
  created: ['not_uploaded', 'Created'],
  pending: ['pending', 'Pending'],
  success: ['verified', 'Success'],
  failed: ['rejected', 'Failed'],
};
export const DonationChip = ({ status }) => {
  const [s, l] = DONATION_CHIP[status] || DONATION_CHIP.pending;
  return <StatusChip status={s} label={l} />;
};

const RECO_CHIP = {
  pending: ['pending', 'To match'],
  matched: ['verified', 'Matched'],
  mismatch: ['needs_review', 'Mismatch'],
  resolved: ['verified', 'Resolved'],
};
export const RecoChip = ({ state }) => {
  const [s, l] = RECO_CHIP[state] || RECO_CHIP.pending;
  return <StatusChip status={s} label={l} />;
};

export const PAYOUT_CHIP = {
  draft: ['not_uploaded', 'Draft'],
  pending_trustee: ['pending', 'Awaiting trustee'],
  approved: ['uploaded', 'Approved'],
  paid: ['verified', 'Paid'],
  confirmed: ['verified', 'Confirmed'],
  rejected: ['rejected', 'Rejected'],
  failed: ['needs_review', 'Failed'],
};
export const PayoutChip = ({ status }) => {
  const [s, l] = PAYOUT_CHIP[status] || PAYOUT_CHIP.draft;
  return <StatusChip status={s} label={l} />;
};

/** const [toastEl, showToast] = useToast(); */
export function useToast() {
  const [msg, setMsg] = useState('');
  const done = useCallback(() => setMsg(''), []);
  return [<Toast key="toast" message={msg} onDone={done} />, setMsg];
}

/**
 * Every approve / reject / destructive action goes through a ConfirmSheet.
 * const [confirmEl, confirm] = useConfirm();
 * confirm({ title, body, confirmLabel, reasonRequired, destructive, onConfirm: (reason) => ... })
 */
export function useConfirm() {
  const [opts, setOpts] = useState(null);
  const el = (
    <ConfirmSheet
      key="confirm"
      open={!!opts}
      title={opts?.title || ''}
      body={opts?.body}
      confirmLabel={opts?.confirmLabel || 'Confirm'}
      reasonRequired={!!opts?.reasonRequired}
      reasonLabel={opts?.reasonLabel}
      destructive={!!opts?.destructive}
      onClose={() => setOpts(null)}
      onConfirm={(reason) => {
        const fn = opts.onConfirm;
        setOpts(null);
        fn(reason);
      }}
    />
  );
  return [el, setOpts];
}

/** Client-side CSV download. rows: array of objects; columns: [{key,label}] */
export function downloadCSV(filename, columns, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(typeof c.value === 'function' ? c.value(r) : r[c.key])).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function CsvButton({ onClick, label = 'Export CSV' }) {
  return (
    <SecondaryButton onClick={onClick} className="h-11 px-5 text-[13px]">
      <Download className="w-4 h-4" strokeWidth={1.75} />
      {label}
    </SecondaryButton>
  );
}

/** Select used in toolbars (rounded-full, compact). */
export function MiniSelect({ label, value, onChange, options }) {
  return (
    <label className="relative inline-flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-11 pl-4 pr-9 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[13px] font-medium text-[#0A0A0A] dark:text-[#FAFAFA] outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25"
      >
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value;
          const l = typeof o === 'string' ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-[#52525B] dark:text-[#A1A1AA]">▾</span>
    </label>
  );
}

export const STAGES = [
  'Draft',
  'Consent pending',
  'Under verification',
  'Info requested',
  'Listed',
  'Partially funded',
  'Fully funded',
  'Enrolled',
  'Completed',
  'Rejected',
  'Dropped',
];
