// Trust, trustee and finance (Part 8). Finance (or admin) is the maker,
// a trustee is the checker. Money always goes from the trust account to the
// institute's verified bank account against its fee invoice.
import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Check, X, Eye, Wallet, Scale, ShieldCheck, FileText, Banknote, RotateCcw, Clock, History as HistoryIcon } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate, timeAgo } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  DocViewer,
  Amount,
  FloatingInput,
  FileDrop,
  Timeline,
  StatTile,
  EmptyState,
  SectionLabel,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, PayoutChip, useToast } from '../admin/AdminShared';

const nameOf = (state, id) => (id === 'system' ? 'System' : sel.getUser(state, id)?.name || '—');

function CheckList({ checks }) {
  return (
    <div className="space-y-2.5">
      {checks.map((c) => (
        <div key={c.key} className="flex items-start gap-3">
          <span className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${c.ok ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40'}`}>
            {c.ok ? <Check className="w-3 h-3" strokeWidth={2.5} /> : <X className="w-3 h-3" strokeWidth={2} />}
          </span>
          <div>
            <div className="text-[14px] font-medium">{c.label}</div>
            {!c.ok && c.why && <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{c.why}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function payoutTimeline(state, d) {
  return [
    { title: `Prepared by ${nameOf(state, d.createdBy)}`, detail: d.status === 'draft' ? 'Draft, not yet sent' : null, time: formatDate(d.createdAt) },
    {
      title: d.status === 'rejected' ? `Rejected by ${nameOf(state, d.approvedBy)}` : d.approvedBy ? `Approved by ${nameOf(state, d.approvedBy)}` : 'Trustee approval',
      detail: d.status === 'rejected' ? d.rejectReason : d.status === 'pending_trustee' ? 'Waiting for a trustee' : null,
      time: d.approvedAt ? formatDate(d.approvedAt) : null,
      muted: !d.approvedBy,
    },
    {
      title: d.status === 'failed' ? 'Bank returned the transfer' : d.utr ? `Paid by NEFT/RTGS · UTR ${d.utr}` : 'Paid to the institute',
      detail: d.status === 'failed' ? `${d.rejectReason}. Amount back in the student's balance.` : null,
      time: d.paidOn ? formatDate(d.paidOn) : null,
      muted: !d.utr && d.status !== 'failed',
    },
    { title: 'Institute confirmed fee receipt', detail: d.receiptFile ? d.receiptFile.name : null, time: d.confirmedAt ? formatDate(d.confirmedAt) : null, muted: !d.confirmedAt },
  ];
}

// --- Shared detail with role-based actions ---------------------------------------------
export function PayoutDetail({ id, user, onBack }) {
  const { state, dispatch } = useStore();
  const [viewInvoice, setViewInvoice] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [utrOpen, setUtrOpen] = useState(false);
  const [utr, setUtr] = useState('');
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [failOpen, setFailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refund, setRefund] = useState('');
  const [discardOpen, setDiscardOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const d = state.disbursements.find((x) => x.id === id);
  if (!d) return <EmptyState title="Payout not found" action={<SecondaryButton onClick={onBack}>Back</SecondaryButton>} />;
  const st = sel.getStudent(state, d.studentId);
  const inst = sel.getInstitute(state, d.instituteId);
  const invoice = state.invoices.find((i) => i.invoiceNo === d.invoiceNo);
  const checks = sel.payoutChecks(state, { studentId: d.studentId, instalmentNo: d.instalmentNo, amount: d.amount, instituteId: d.instituteId, invoiceNo: d.invoiceNo, excludeId: d.id });
  const isMaker = ['finance', 'admin'].includes(user.role);
  const isTrustee = user.role === 'trustee';
  const sameAsMaker = d.createdBy === user.id;
  const others = state.disbursements.filter((x) => x.studentId === d.studentId && x.id !== d.id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const refunded = (state.refunds || []).filter((r) => r.disbursementId === d.id).reduce((n, r) => n + r.amount, 0);

  return (
    <div className="space-y-8 pb-12 max-w-[920px]">
      <PageHeader onBack={onBack} backLabel="Back" title={`${formatINR(d.amount)} to ${inst?.name}`} sub={`${st?.fullName} · instalment ${d.instalmentNo} · invoice ${d.invoiceNo}`} actions={<PayoutChip status={d.status} />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Request</SectionLabel>
          <KV label="Student" value={`${st?.fullName} · ${st?.id}`} />
          <KV label="Stage" value={st?.status} />
          <KV label="Institute" value={`${inst?.name}, ${inst?.city}`} />
          <KV label="Pay to" value={inst?.bank ? `${inst.bank.name} · ${inst.bank.account} · ${inst.bank.ifsc}` : '—'} />
          <KV label="Invoice" value={d.invoiceNo} />
          <KV label="Instalment" value={`#${d.instalmentNo}${checks.instalment ? ` · due ${formatDate(checks.instalment.dueDate)} · catalogue ${formatINR(checks.instalment.amount)}` : ''}`} />
          <KV label="Amount" value={formatINR(d.amount)} strong />
          {checks.instalment && d.amount !== checks.instalment.amount && <p className="text-[12px] font-medium pt-1">Amount differs from the catalogue instalment.</p>}
          <div className="pt-3">
            <SmallButton onClick={() => setViewInvoice(true)} className="bg-white dark:bg-[#222224]"><Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View invoice</SmallButton>
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionLabel>Balance check</SectionLabel>
            <span className="text-[13px] font-semibold">Available {formatINR(Math.max(0, checks.available))}</span>
          </div>
          <KV label="Held for the student" value={formatINR(sel.studentBalance(state, d.studentId))} />
          {['draft', 'pending_trustee', 'approved'].includes(d.status) && <CheckList checks={checks.all} />}
        </Card>
      </div>

      <Card className="space-y-4">
        <SectionLabel>History</SectionLabel>
        <Timeline items={payoutTimeline(state, d)} />
        {others.length > 0 && (
          <div className="pt-3 border-t border-[#ECECEE] dark:border-[#262626] space-y-1">
            <div className="text-[13px] font-semibold mb-1">Other payouts for this student</div>
            {others.map((o) => <KV key={o.id} label={`#${o.instalmentNo} · ${o.invoiceNo} · ${formatDate(o.createdAt)}`} value={`${formatINR(o.amount)} · ${o.status.replace('_', ' ')}`} />)}
          </div>
        )}
        {refunded > 0 && <KV label="Refunded by institute" value={formatINR(refunded)} />}
      </Card>

      {/* Role-based actions */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {isMaker && d.status === 'draft' && (
          <>
            <PrimaryButton disabled={!checks.ok} onClick={() => { dispatch('submitDisbursement', { disbursementId: d.id }); toast('Sent to the trustee'); }}>Send to trustee</PrimaryButton>
            <SecondaryButton onClick={() => setDiscardOpen(true)}>Discard draft</SecondaryButton>
          </>
        )}
        {isTrustee && d.status === 'pending_trustee' && (
          <>
            <PrimaryButton disabled={sameAsMaker} onClick={() => setApproveOpen(true)}><ShieldCheck className="w-4 h-4" strokeWidth={1.75} /> Approve payout</PrimaryButton>
            <SecondaryButton disabled={sameAsMaker} onClick={() => setRejectOpen(true)}>Reject</SecondaryButton>
          </>
        )}
        {isMaker && d.status === 'pending_trustee' && <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Waiting for a trustee. {user.role === 'admin' ? 'Admin can see payouts but cannot approve them.' : ''}</p>}
        {isMaker && d.status === 'approved' && <PrimaryButton onClick={() => setUtrOpen(true)}><Banknote className="w-4 h-4" strokeWidth={1.75} /> Enter UTR</PrimaryButton>}
        {isMaker && d.status === 'paid' && (
          <>
            <PrimaryButton onClick={() => setConfirmOpen(true)}>Record institute confirmation</PrimaryButton>
            <SecondaryButton onClick={() => setFailOpen(true)}>Bank returned it</SecondaryButton>
          </>
        )}
        {isMaker && d.status === 'failed' && <PrimaryButton onClick={() => { dispatch('retryPayout', { disbursementId: d.id }); toast('Ready to pay again'); }}><RotateCcw className="w-4 h-4" strokeWidth={1.75} /> Pay again</PrimaryButton>}
        {isMaker && ['paid', 'confirmed'].includes(d.status) && st?.status === 'Dropped' && <SecondaryButton onClick={() => { setRefund(d.amount - refunded); setRefundOpen(true); }}>Record refund from institute</SecondaryButton>}
      </div>
      {isTrustee && d.status === 'pending_trustee' && sameAsMaker && <p className="text-[14px] font-medium">Maker and checker must be different people. Another trustee has to approve this.</p>}

      <DocViewer open={viewInvoice} onClose={() => setViewInvoice(false)} doc={{ name: `Invoice ${d.invoiceNo}`, fileName: invoice?.file?.name || `${d.invoiceNo.replace(/\//g, '-')}.pdf`, source: 'manual', status: invoice?.status === 'paid' ? 'verified' : 'uploaded' }} />
      <ConfirmSheet
        open={approveOpen}
        title={`Approve ${formatINR(d.amount)}?`}
        body={`Finance will pay ${inst?.name} (${inst?.bank?.account}) by NEFT/RTGS and enter the UTR. The student's held balance reduces when it is paid.`}
        confirmLabel="Approve payout"
        onClose={() => setApproveOpen(false)}
        onConfirm={() => { setApproveOpen(false); dispatch('trusteeDecision', { disbursementId: d.id, decision: 'approved' }); toast('Approved. Finance notified.'); }}
      />
      <ConfirmSheet
        open={rejectOpen}
        title="Reject this payout?"
        body="Finance sees your reason and can prepare a corrected request."
        confirmLabel="Reject payout"
        destructive
        reasonRequired
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => { setRejectOpen(false); dispatch('trusteeDecision', { disbursementId: d.id, decision: 'rejected', reason }); toast('Rejected. Finance notified.'); }}
      />
      <ConfirmSheet
        open={discardOpen}
        title="Discard this draft?"
        body="Nothing was sent to the trustee. The invoice becomes available again."
        confirmLabel="Discard"
        destructive
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => { setDiscardOpen(false); dispatch('discardDisbursement', { disbursementId: d.id }); onBack(); }}
      />
      <BottomSheet open={utrOpen} onClose={() => setUtrOpen(false)} title="Enter the transfer details">
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">At launch, finance pays the institute by NEFT/RTGS from the trust account outside the app, then records it here.</p>
          <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] space-y-1">
            <KV label="Pay" value={formatINR(d.amount)} strong />
            <KV label="To" value={`${inst?.bank?.name} · ${inst?.bank?.account}`} />
            <KV label="IFSC" value={inst?.bank?.ifsc} />
          </div>
          <FloatingInput label="UTR number" value={utr} onChange={(e) => setUtr(e.target.value.toUpperCase())} />
          <FloatingInput label="Paid on" type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
          <PrimaryButton disabled={utr.trim().length < 8 || !paidOn} onClick={() => { dispatch('markPaid', { disbursementId: d.id, utr: utr.trim(), paidOn }); setUtrOpen(false); toast('Marked paid. Institute asked to confirm.'); }} className="w-full">Mark as paid</PrimaryButton>
          <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">UTR is usually 12 to 22 characters.</p>
        </div>
      </BottomSheet>
      <ConfirmSheet
        open={failOpen}
        title="Record a bank return?"
        body={`The ${formatINR(d.amount)} goes back to the student's held balance. The trustee approval stays, so you can pay again after fixing the details.`}
        confirmLabel="Record bank return"
        destructive
        reasonRequired
        reasonLabel="What did the bank say?"
        onClose={() => setFailOpen(false)}
        onConfirm={(reason) => { setFailOpen(false); dispatch('markPaymentFailed', { disbursementId: d.id, reason }); toast('Recorded. Amount back in the balance.'); }}
      />
      <BottomSheet open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Institute confirmation">
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Record that {inst?.name} received the fee, on its behalf. Attach the fee receipt in the student&apos;s name. This counts as utilised and issues the sponsors&apos; Sponsorship Certificates.</p>
          <FileDrop label="Fee receipt (PDF, JPG, PNG)" file={receiptFile} onFile={setReceiptFile} />
          <PrimaryButton disabled={!receiptFile} onClick={() => { dispatch('instituteConfirm', { disbursementId: d.id, receiptFile }); setConfirmOpen(false); toast('Confirmed. Certificates issued.'); }} className="w-full">Confirm fee received</PrimaryButton>
        </div>
      </BottomSheet>
      <BottomSheet open={refundOpen} onClose={() => setRefundOpen(false)} title="Refund from institute">
        <div className="space-y-4">
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">The student dropped out after this payout. Money the institute returns comes back to the trust account and goes to the general pool.</p>
          <Amount value={refund} onChange={setRefund} max={d.amount - refunded} />
          <PrimaryButton disabled={!refund || refund > d.amount - refunded} onClick={() => { dispatch('recordRefund', { studentId: d.studentId, disbursementId: d.id, amount: refund, note: 'Refund after drop-out' }); setRefundOpen(false); toast('Refund recorded to the pool'); }} className="w-full">Record {refund ? formatINR(refund) : ''}</PrimaryButton>
        </div>
      </BottomSheet>
      {toastEl}
    </div>
  );
}

// --- Create payout (maker) -------------------------------------------------------------------
function CreatePayoutSheet({ open, onClose, onCreated }) {
  const { state, dispatch } = useStore();
  const candidates = state.students.filter((s) => s.courseId && ['Enrolled', 'Fully funded', 'Partially funded'].includes(s.status));
  const [studentId, setStudentId] = useState('');
  const [instNo, setInstNo] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  useEffect(() => {
    if (open) { setStudentId(''); setInstNo(''); setInvoiceId(''); setInvoiceNo(''); setAmount(''); setFile(null); }
  }, [open]);
  const st = studentId && sel.getStudent(state, studentId);
  const course = st && sel.getCourse(state, st.courseId);
  const paidNos = state.disbursements.filter((d) => d.studentId === studentId && !['rejected', 'failed'].includes(d.status)).map((d) => d.instalmentNo);
  const openInst = course ? course.instalments.filter((i) => !paidNos.includes(i.no)) : [];
  const invoices = state.invoices.filter((i) => i.studentId === studentId && i.instalmentNo === Number(instNo) && i.status === 'submitted');
  const chosenInvoice = invoices.find((i) => i.id === invoiceId);
  const effInvoiceNo = chosenInvoice ? chosenInvoice.invoiceNo : invoiceNo;
  const checks = st && instNo ? sel.payoutChecks(state, { studentId, instalmentNo: Number(instNo), amount, instituteId: course?.instituteId, invoiceNo: effInvoiceNo }) : null;
  const hasInvoice = !!chosenInvoice || (invoiceNo.trim() && file);

  const pickInstalment = (no) => {
    setInstNo(no);
    const i = course.instalments.find((x) => x.no === Number(no));
    setAmount(i ? i.amount : '');
    const inv = state.invoices.find((x) => x.studentId === studentId && x.instalmentNo === Number(no) && x.status === 'submitted');
    setInvoiceId(inv ? inv.id : '');
    if (inv) setAmount(inv.amount);
  };
  const create = (submit) => {
    const inst = course.instalments.find((x) => x.no === Number(instNo));
    dispatch('createDisbursement', {
      submit,
      disbursement: { studentId, instituteId: course.instituteId, invoiceNo: effInvoiceNo.trim(), instalmentNo: Number(instNo), amount: Number(amount) },
      invoice: chosenInvoice
        ? { id: chosenInvoice.id }
        : { instituteId: course.instituteId, studentId, instalmentNo: Number(instNo), invoiceNo: invoiceNo.trim(), amount: Number(amount), dueDate: inst?.dueDate, file, onBehalf: true },
    });
    onCreated(submit ? 'Sent to the trustee for approval' : 'Saved as draft');
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Create a payout">
      <div className="space-y-4">
        <label className="relative block">
          <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setInstNo(''); setInvoiceId(''); }} aria-label="Student" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
            <option value="">Choose a student</option>
            {candidates.map((s) => <option key={s.id} value={s.id}>{s.fullName} · {s.status} · held {formatINR(sel.studentBalance(state, s.id))}</option>)}
          </select>
          <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Student</span>
        </label>
        {st && (
          <label className="relative block">
            <select value={instNo} onChange={(e) => pickInstalment(e.target.value)} aria-label="Instalment" className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none">
              <option value="">Choose an instalment</option>
              {openInst.map((i) => <option key={i.no} value={i.no}>#{i.no} · {formatINR(i.amount)} · due {formatDate(i.dueDate)}</option>)}
            </select>
            <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Instalment · {sel.getInstitute(state, course.instituteId)?.name}</span>
          </label>
        )}
        {st && instNo && (
          <>
            {invoices.length > 0 ? (
              <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] space-y-2">
                <div className="text-[13px] font-semibold">Invoice uploaded by the institute</div>
                {invoices.map((i) => (
                  <button key={i.id} type="button" onClick={() => { setInvoiceId(i.id); setAmount(i.amount); }} className={`w-full text-left px-4 py-3 rounded-[16px] flex items-center justify-between gap-3 text-[14px] ${invoiceId === i.id ? 'bg-white dark:bg-[#151515] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA]' : 'bg-white/60 dark:bg-[#151515]/60'}`}>
                    <span className="inline-flex items-center gap-2"><FileText className="w-4 h-4" strokeWidth={1.75} /> {i.invoiceNo}</span>
                    <span className="font-semibold">{formatINR(i.amount)}</span>
                  </button>
                ))}
                <button type="button" onClick={() => setInvoiceId('')} className="text-[12px] font-medium underline underline-offset-4">Upload a different invoice on their behalf</button>
              </div>
            ) : null}
            {!chosenInvoice && (
              <>
                <FloatingInput label="Invoice number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
                <FileDrop label="Fee invoice from the institute (uploaded on its behalf)" file={file} onFile={setFile} />
              </>
            )}
            <Amount label="Amount (₹)" value={amount} onChange={setAmount} />
            {checks && (
              <div className="p-4 rounded-[20px] border border-[#ECECEE] dark:border-[#262626] space-y-3">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">Trigger rule</div>
                <CheckList checks={checks.trigger} />
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA] pt-1">System checks</div>
                <CheckList checks={checks.system} />
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <PrimaryButton disabled={!checks?.ok || !hasInvoice} onClick={() => create(true)} className="flex-1">Send to trustee</PrimaryButton>
              <SecondaryButton disabled={!hasInvoice || !amount || !effInvoiceNo} onClick={() => create(false)} className="flex-1">Save draft</SecondaryButton>
            </div>
            {checks && !checks.ok && <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">You can save a draft now and send it once every check passes.</p>}
          </>
        )}
      </div>
    </BottomSheet>
  );
}

// --- Finance / admin payouts page -------------------------------------------------------------
export function FinancePayouts({ user, params = {} }) {
  const { state } = useStore();
  const [openId, setOpenId] = useState(params.payoutId || null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toastEl, toast] = useToast();
  useEffect(() => setOpenId(params.payoutId || null), [params]);
  if (openId) return <PayoutDetail id={openId} user={user} onBack={() => setOpenId(null)} />;
  const by = (st) => state.disbursements.filter((d) => d.status === st);
  const rows = state.disbursements.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const isAdmin = user.role === 'admin';
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Payouts"
        sub="Money goes from the trust account to the institute against its fee invoice, after a trustee approves."
        actions={<PrimaryButton onClick={() => setCreateOpen(true)} className="h-12 px-6 text-[14px]"><Plus className="w-4 h-4" strokeWidth={1.75} /> Create payout</PrimaryButton>}
      />
      <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
        <p className="text-[14px]">
          {isAdmin ? 'Admin can prepare payouts and see everything, but cannot approve. ' : ''}You prepare the request; a trustee approves it. Maker and checker must be different people.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Drafts" value={by('draft').length} icon={FileText} />
        <StatTile label="Awaiting trustee" value={by('pending_trustee').length} icon={Clock} />
        <StatTile label="Approved, to pay" value={by('approved').length} hint={formatINR(by('approved').reduce((n, d) => n + d.amount, 0))} icon={Banknote} />
        <StatTile label="Paid, awaiting institute" value={by('paid').length} icon={Wallet} />
      </div>
      <div className="flex items-center justify-between gap-3 p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#151515]">
        <div>
          <div className="text-[14px] font-semibold">Payout API</div>
          <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Phase 2. At launch, transfers are made by NEFT/RTGS outside the app and the UTR is entered here.</div>
        </div>
        <span aria-disabled="true" className="relative inline-flex h-7 w-12 shrink-0 rounded-full bg-[#ECECEE] dark:bg-[#1C1C1C] opacity-60"><span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-white dark:bg-[#52525B]" /></span>
      </div>
      <DataTable
        rows={rows}
        searchText={(r) => `${sel.getStudent(state, r.studentId)?.fullName} ${r.invoiceNo} ${sel.getInstitute(state, r.instituteId)?.name}`}
        searchPlaceholder="Search student, invoice or institute"
        filter={{ options: [{ value: 'draft', label: 'Draft' }, { value: 'pending_trustee', label: 'Awaiting trustee' }, { value: 'approved', label: 'Approved' }, { value: 'paid', label: 'Paid' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'rejected', label: 'Rejected' }, { value: 'failed', label: 'Failed' }], getValue: (r) => r.status }}
        onRowClick={(r) => setOpenId(r.id)}
        empty={{ icon: Wallet, title: 'No payouts here' }}
        columns={[
          { key: 'student', label: 'Student', width: 'minmax(0,1.3fr)', sortValue: (r) => sel.getStudent(state, r.studentId)?.fullName, render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{sel.getStudent(state, r.studentId)?.fullName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Instalment {r.instalmentNo} · {r.invoiceNo}</div></div> },
          { key: 'institute', label: 'Institute', sortValue: (r) => sel.getInstitute(state, r.instituteId)?.name, render: (r) => <span className="truncate block">{sel.getInstitute(state, r.instituteId)?.name}</span> },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
          { key: 'createdAt', label: 'Prepared', render: (r) => `${formatDate(r.createdAt)} · ${nameOf(state, r.createdBy).split(' ')[0]}` },
          { key: 'status', label: 'Status', render: (r) => <PayoutChip status={r.status} /> },
        ]}
      />
      <CreatePayoutSheet open={createOpen} onClose={() => setCreateOpen(false)} onCreated={toast} />
      {toastEl}
    </div>
  );
}

// --- Trustee pages ---------------------------------------------------------------------------------
export function TrusteeApprovals({ user, params = {} }) {
  const { state } = useStore();
  const [openId, setOpenId] = useState(params.payoutId || null);
  useEffect(() => setOpenId(params.payoutId || null), [params]);
  if (openId) return <PayoutDetail id={openId} user={user} onBack={() => setOpenId(null)} />;
  const pending = state.disbursements.filter((d) => d.status === 'pending_trustee').sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const total = pending.reduce((n, d) => n + d.amount, 0);
  const t = sel.ledgerTotals(state);
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Approvals" sub={`Hello, ${user.name.replace(/^Dr\.\s*/, '').split(' ')[0]}. Every payout to an institute needs a trustee's approval.`} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile label="Awaiting your approval" value={pending.length} hint={formatINR(total)} icon={Scale} />
        <StatTile label="Trust bank balance" value={formatINR(t.bank)} hint={t.balanced ? 'Ledger balanced' : 'Ledger out of balance'} icon={Wallet} />
        <StatTile label="Held for students" value={formatINR(t.students)} icon={ShieldCheck} />
      </div>
      {pending.length === 0 ? (
        <EmptyState icon={Scale} title="Nothing to approve" body="Payout requests from finance appear here." />
      ) : (
        <div className="space-y-3">
          {pending.map((d) => {
            const st = sel.getStudent(state, d.studentId);
            const checks = sel.payoutChecks(state, { studentId: d.studentId, instalmentNo: d.instalmentNo, amount: d.amount, instituteId: d.instituteId, invoiceNo: d.invoiceNo, excludeId: d.id });
            return (
              <button key={d.id} type="button" onClick={() => setOpenId(d.id)} className="w-full text-left p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] active:scale-[0.99] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold">{formatINR(d.amount)} · {sel.getInstitute(state, d.instituteId)?.name}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{st?.fullName} · instalment {d.instalmentNo} · {d.invoiceNo} · prepared by {nameOf(state, d.createdBy)} {timeAgo(d.createdAt)}</div>
                </div>
                <StatusChip status={checks.ok ? 'verified' : 'needs_review'} label={checks.ok ? 'All checks pass' : `${checks.all.filter((c) => !c.ok).length} check(s) failing`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TrusteeHistory({ user }) {
  const { state } = useStore();
  const [openId, setOpenId] = useState(null);
  if (openId) return <PayoutDetail id={openId} user={user} onBack={() => setOpenId(null)} />;
  const rows = state.disbursements.filter((d) => d.status !== 'draft').sort((a, b) => ((a.approvedAt || a.createdAt) < (b.approvedAt || b.createdAt) ? 1 : -1));
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Payout history" sub="Every payout request and its decision." />
      <DataTable
        rows={rows}
        searchText={(r) => `${sel.getStudent(state, r.studentId)?.fullName} ${r.invoiceNo}`}
        filter={{ options: [{ value: 'pending_trustee', label: 'Awaiting' }, { value: 'approved', label: 'Approved' }, { value: 'paid', label: 'Paid' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'rejected', label: 'Rejected' }, { value: 'failed', label: 'Failed' }], getValue: (r) => r.status }}
        onRowClick={(r) => setOpenId(r.id)}
        empty={{ icon: HistoryIcon, title: 'No payouts yet' }}
        columns={[
          { key: 'student', label: 'Student', width: 'minmax(0,1.3fr)', sortValue: (r) => sel.getStudent(state, r.studentId)?.fullName, render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{sel.getStudent(state, r.studentId)?.fullName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.invoiceNo}</div></div> },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
          { key: 'approvedBy', label: 'Decided by', sortValue: (r) => nameOf(state, r.approvedBy), render: (r) => (r.approvedBy ? nameOf(state, r.approvedBy) : '—') },
          { key: 'utr', label: 'UTR', render: (r) => <span className="text-[13px] break-all">{r.utr || '—'}</span> },
          { key: 'status', label: 'Status', render: (r) => <PayoutChip status={r.status} /> },
        ]}
      />
    </div>
  );
}
