// Checkout (7.1) + mock payment gateway (7.2) + result screens (7.3).
// IMPORTANT: the result is read from the donation record in the store, which
// only the (mock) gateway webhook action updates. Never from the redirect.
import React, { useEffect, useRef, useState } from 'react';
import {
  Info,
  ShieldCheck,
  ArrowLeft,
  Lock,
  X,
  Check,
  Clock,
  AlertCircle,
  Smartphone,
  CreditCard,
  Landmark,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { useStore, uid } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import { calcCheckout } from '../../store/ledger';
import {
  PrimaryButton,
  SecondaryButton,
  BottomSheet,
  Segmented,
  StatusChip,
  FloatingInput,
  FloatingSelect,
  ReceiptCard,
  Timeline,
  Logo,
} from '../../components/ui';
import { Card, KV } from '../admin/AdminShared';
import { ReceiptView } from '../shared/ReceiptView';

export const WEBHOOK_DELAY_MS = 1500;

/** Resolves what a checkout request is for (student, cohort or pool). */
export function describeTarget(state, req) {
  if (req.studentId) {
    const ps = sel.publicStudent(state, req.studentId);
    return { label: ps ? `${ps.displayName} · ${ps.exam}, ${ps.district}` : 'Student', remaining: ps ? ps.remaining : 0, kind: 'student', name: ps?.displayName };
  }
  if (req.cohortId) {
    const c = state.cohorts.find((x) => x.id === req.cohortId);
    return { label: c ? c.name : 'Cohort', remaining: null, kind: 'cohort' };
  }
  const pool = state.pools.find((p) => p.id === (req.poolId || 'general'));
  return { label: pool ? pool.name : 'General pool', remaining: null, kind: 'pool' };
}

// --- 7.2 Mock gateway ----------------------------------------------------------------
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda'];

function GatewaySheet({ open, total, demoMode, onClose, onPay, processing }) {
  const [tab, setTab] = useState('upi');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState(BANKS[0]);
  const [outcome, setOutcome] = useState('success');
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && !processing && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, processing, onClose]);
  if (!open) return null;
  const valid =
    tab === 'upi' ? /^[\w.\-]{2,}@[a-z]{2,}$/i.test(upi.trim()) : tab === 'card' ? card.number.replace(/\D/g, '').length >= 12 && /^\d{2}\/\d{2}$/.test(card.expiry) && card.cvv.length >= 3 && card.name.trim() : !!bank;
  const fillDemo = () => {
    if (tab === 'upi') setUpi('sponsor@okhdfcbank');
    if (tab === 'card') setCard({ number: '4111 1111 1111 1111', expiry: '12/29', cvv: '123', name: 'Demo Sponsor' });
  };
  const method = tab === 'upi' ? `UPI ${upi.trim()}` : tab === 'card' ? `Card •••• ${card.number.replace(/\D/g, '').slice(-4)}` : `Net banking · ${bank}`;

  return (
    <div className="fixed inset-0 z-[55] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] overflow-y-auto animate-sheet-up" role="dialog" aria-modal="true" aria-label="Payment">
      <div className="max-w-[520px] mx-auto px-5 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center"><Lock className="w-4 h-4" strokeWidth={1.75} /></span>
            <div>
              <div className="text-[14px] font-semibold">Secure payment</div>
              <div className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">Mock gateway · no real money moves</div>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={processing} aria-label="Close payment" className="hit-44 w-10 h-10 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center disabled:opacity-40">
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
        <div className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-between">
          <div className="inline-flex items-center gap-2"><Logo className="w-6 h-6" /><span className="text-[14px] font-medium">Sikshit Bharat Educational Trust</span></div>
          <span className="text-[20px] font-bold">{formatINR(total)}</span>
        </div>

        {processing ? (
          <div className="py-16 text-center space-y-4">
            <span className="inline-block w-12 h-12 rounded-full border-[3px] border-[#ECECEE] dark:border-[#262626] border-t-[#0A0A0A] dark:border-t-[#FAFAFA] animate-spin" aria-hidden="true" />
            <div className="text-[16px] font-semibold">Processing your payment</div>
            <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Waiting for the bank to confirm. Please do not close this screen.</p>
          </div>
        ) : (
          <>
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: 'upi', label: 'UPI' },
                { value: 'card', label: 'Card' },
                { value: 'netbanking', label: 'Net banking' },
              ]}
            />
            {tab === 'upi' && (
              <div className="space-y-4">
                <div className="p-5 rounded-[24px] border border-[#ECECEE] dark:border-[#262626] flex items-center gap-4">
                  <span className="w-16 h-16 rounded-[16px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center shrink-0"><QrCode className="w-8 h-8" strokeWidth={1.75} /></span>
                  <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Scan with any UPI app, or enter your UPI ID below.</p>
                </div>
                <FloatingInput label="UPI ID" value={upi} onChange={(e) => setUpi(e.target.value)} rightElement={<Smartphone className="w-4 h-4 text-[#52525B] dark:text-[#A1A1AA]" strokeWidth={1.75} />} />
              </div>
            )}
            {tab === 'card' && (
              <div className="space-y-4">
                <FloatingInput label="Card number" value={card.number} onChange={(e) => setCard((c) => ({ ...c, number: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) }))} rightElement={<CreditCard className="w-4 h-4 text-[#52525B] dark:text-[#A1A1AA]" strokeWidth={1.75} />} />
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput label="Expiry (MM/YY)" value={card.expiry} onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value.slice(0, 5) }))} />
                  <FloatingInput label="CVV" type="password" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))} />
                </div>
                <FloatingInput label="Name on card" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
              </div>
            )}
            {tab === 'netbanking' && (
              <div className="space-y-4">
                <FloatingSelect label="Bank" value={bank} onChange={(e) => setBank(e.target.value)} options={BANKS} />
                <div className="flex items-center gap-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]"><Landmark className="w-4 h-4" strokeWidth={1.75} /> You would be redirected to your bank to log in.</div>
              </div>
            )}
            {demoMode && tab !== 'netbanking' && (
              <button type="button" onClick={fillDemo} className="text-[13px] font-medium underline underline-offset-4 text-[#52525B] dark:text-[#A1A1AA]">Fill demo details</button>
            )}

            {demoMode && (
              <div className="p-4 rounded-[20px] border border-dashed border-[#D4D4D8] dark:border-[#3F3F46] space-y-2">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">Demo · simulate outcome</div>
                <Segmented size="sm" value={outcome} onChange={setOutcome} options={[{ value: 'success', label: 'Success' }, { value: 'failed', label: 'Failed' }, { value: 'pending', label: 'Pending' }]} />
              </div>
            )}

            <PrimaryButton disabled={!valid} onClick={() => onPay({ method, outcome: demoMode ? outcome : 'success' })} className="w-full">
              Pay {formatINR(total)}
            </PrimaryButton>
            <p className="text-[11px] text-center text-[#52525B] dark:text-[#A1A1AA]">The payment is confirmed only when the gateway notifies the trust (webhook), not when you return to this page.</p>
          </>
        )}
      </div>
    </div>
  );
}

// --- 7.3 What happens next -------------------------------------------------------------
export function donationJourney(state, donation) {
  const reco = state.reconciliation.find((r) => r.donationId === donation.id);
  const matched = reco && ['matched', 'resolved'].includes(reco.state);
  const paid = donation.studentId
    ? state.disbursements.filter((d) => d.studentId === donation.studentId && ['paid', 'confirmed'].includes(d.status)).sort((a, b) => (a.paidOn > b.paidOn ? -1 : 1))[0]
    : null;
  const cert = state.certificates.find((c) => c.donationId === donation.id || (donation.studentId && c.sponsorId === donation.sponsorId && c.studentIds.includes(donation.studentId)));
  const target = donation.studentId ? 'the institute' : 'students from the pool';
  return [
    { title: 'Trust received your payment', detail: donation.status === 'success' ? `${formatINR(donation.total)} is held in the trust account` : 'Waiting for the gateway', time: donation.status === 'success' ? formatDate(donation.paidAt || donation.createdAt) : null, muted: donation.status !== 'success' },
    { title: 'Admin verified it with the bank', detail: reco?.state === 'mismatch' ? 'Being checked with the bank' : matched ? 'Matched with the bank statement' : 'Usually within 1 working day', time: matched ? formatDate(reco.checkedAt) : null, muted: !matched },
    { title: `Paid to ${target}`, detail: paid ? `UTR ${paid.utr}` : 'When the next fee instalment is due, after a trustee approves it', time: paid ? formatDate(paid.paidOn) : null, muted: !paid },
    { title: 'Certificate issued', detail: cert ? cert.number : 'After the institute confirms the fee', time: cert ? formatDate(cert.issuedAt) : null, muted: !cert },
  ];
}

function ResultScreen({ donation, sp, target, onAgain, onNavigate }) {
  const { state } = useStore();
  const receipt = state.receipts.find((r) => r.donationId === donation.id);
  if (donation.status === 'failed') {
    return (
      <div className="max-w-[600px] mx-auto text-center py-8 space-y-6 animate-slide-in">
        <div className="w-20 h-20 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center mx-auto shadow-soft"><AlertCircle className="w-8 h-8" strokeWidth={1.75} /></div>
        <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">The payment did not go through</h1>
        <p className="text-[16px] text-[#52525B] dark:text-[#A1A1AA]">No money was taken from your account. You can try again, or use a different method.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <PrimaryButton onClick={onAgain}>Try again</PrimaryButton>
          <SecondaryButton onClick={() => onNavigate('giving')}>My giving</SecondaryButton>
        </div>
      </div>
    );
  }
  if (donation.status !== 'success') {
    return (
      <div className="max-w-[600px] mx-auto text-center py-8 space-y-6 animate-slide-in">
        <div className="w-20 h-20 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center mx-auto shadow-soft"><Clock className="w-8 h-8" strokeWidth={1.75} /></div>
        <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">We will confirm in a few minutes</h1>
        <p className="text-[16px] text-[#52525B] dark:text-[#A1A1AA]">Your bank has not confirmed the payment yet. It shows as Pending in My giving. If it fails, no money is taken.</p>
        <div className="flex justify-center"><PrimaryButton onClick={() => onNavigate('giving')}>Go to My giving</PrimaryButton></div>
      </div>
    );
  }
  return (
    <div className="space-y-8 pb-12 max-w-[720px] animate-slide-in">
      <div className="text-center space-y-4 pt-4">
        <div className="w-20 h-20 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto animate-pop-in"><Check className="w-10 h-10" strokeWidth={2.25} /></div>
        <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">Thank you</h1>
        <p className="text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
          {formatINR(donation.total)} received{target.kind === 'student' ? ` for ${target.name}` : ` for the ${target.label}`}.{donation.sip ? ' Your monthly SIP is set up.' : ''}
        </p>
      </div>
      <Card className="space-y-4">
        <div className="text-[15px] font-semibold">What happens next</div>
        <Timeline items={donationJourney(state, donation)} />
      </Card>
      {receipt && <ReceiptView receipt={receipt} />}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <PrimaryButton onClick={() => onNavigate('giving')}>My giving <ArrowRight className="w-4 h-4" strokeWidth={1.75} /></PrimaryButton>
        <SecondaryButton onClick={() => onNavigate('discover')}>Support another student</SecondaryButton>
      </div>
    </div>
  );
}

// --- 7.1 Checkout ---------------------------------------------------------------------
export function CheckoutPage({ user, params = {}, onNavigate }) {
  const { state, dispatch } = useStore();
  const sp = sel.getSponsorByUser(state, user.id);
  const product = state.packageProducts.find((p) => p.id === params.productId) || state.packageProducts.find((p) => p.id === 'pp-partial');
  const [display, setDisplay] = useState(sp && sp.public ? 'public' : 'anonymous');
  const [whyOpen, setWhyOpen] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [donationId, setDonationId] = useState(null);
  const [processing, setProcessing] = useState(false);
  // Not cleared on unmount: like a real gateway, the webhook still arrives if the sponsor navigates away.
  const timer = useRef(null);

  // The live record (updated only by the webhook action).
  const donation = donationId ? state.donations.find((d) => d.id === donationId) : null;
  useEffect(() => {
    if (donation && ['success', 'failed'].includes(donation.status)) {
      setProcessing(false);
      setGatewayOpen(false);
    }
  }, [donation?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!sp) return null;
  const feePercent = product.platformFeePercent ?? state.settings.platformFeePercent;
  const feeMode = state.settings.feeMode;
  const c = calcCheckout(params.amount || 0, feePercent, feeMode);
  const target = describeTarget(state, params);
  const toTarget = target.kind === 'student' ? Math.min(c.toStudents, target.remaining) : c.toStudents;
  const spill = c.toStudents - toTarget;
  const verified = sel.sponsorVerified(sp);
  const back = () => onNavigate(params.backTo || 'discover', params.backParams || {});

  const pay = ({ method, outcome }) => {
    const id = uid('don');
    dispatch('createDonation', {
      id, sponsorId: sp.id, packageProductId: product.id, amount: params.amount, studentId: params.studentId, cohortId: params.cohortId,
      poolId: params.poolId, sip: !!params.sip, sipDay: params.sipDay, tranche: params.tranche, anonymous: display === 'anonymous', method,
      feePercent, feeMode,
    });
    dispatch('markDonationPending', { donationId: id });
    setDonationId(id);
    setProcessing(true);
    // Mock gateway: the webhook fires after a short delay. The screen waits for the record.
    timer.current = setTimeout(() => {
      if (outcome === 'success') dispatch('gatewayWebhookSuccess', { donationId: id });
      else if (outcome === 'failed') dispatch('gatewayWebhookFailure', { donationId: id, reason: 'Declined by the bank (simulated)' });
      else {
        setProcessing(false);
        setGatewayOpen(false);
      }
    }, WEBHOOK_DELAY_MS);
  };

  if (donation && !processing && !gatewayOpen) {
    return <ResultScreen donation={donation} sp={sp} target={target} onNavigate={onNavigate} onAgain={() => { setDonationId(null); }} />;
  }

  return (
    <div className="space-y-8 pb-12 max-w-[720px] animate-slide-in">
      <button type="button" onClick={back} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} /> Change amount
      </button>
      <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">Checkout</h1>

      {!verified && (
        <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 text-[14px]">
          Your organisation is still being verified (up to 48 hours). You can make this donation now. Your name stays private until verification is complete.
        </div>
      )}

      <Card className="space-y-1">
        <KV label="Package" value={params.sip ? `${product.name} · monthly` : product.name} />
        <KV label={target.kind === 'student' ? 'Student' : target.kind === 'cohort' ? 'Cohort' : 'Goes to'} value={target.label} />
        <div className="h-3" />
        {feeMode === 'DEDUCTED' ? (
          <>
            <KV label="You pay" value={formatINR(c.total)} strong />
            <KV label="Reaches students" value={formatINR(c.toStudents)} />
            <div className="flex justify-between gap-4 text-[14px] py-1">
              <button type="button" onClick={() => setWhyOpen(true)} className="inline-flex items-center gap-1.5 text-[#52525B] dark:text-[#A1A1AA] underline underline-offset-4">
                Platform fee {feePercent}% <Info className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
              <span className="font-semibold">{formatINR(c.fee)}</span>
            </div>
          </>
        ) : (
          <>
            <KV label={target.kind === 'student' ? 'Amount to the student' : 'Amount to students'} value={formatINR(c.toStudents)} />
            <div className="flex justify-between gap-4 text-[14px] py-1">
              <button type="button" onClick={() => setWhyOpen(true)} className="inline-flex items-center gap-1.5 text-[#52525B] dark:text-[#A1A1AA] underline underline-offset-4">
                Platform fee {feePercent}% <Info className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
              <span className="font-semibold">{formatINR(c.fee)}</span>
            </div>
            <div className="pt-4 mt-3 border-t border-[#ECECEE] dark:border-[#262626] flex items-baseline justify-between gap-4">
              <span className="text-[15px] font-semibold">Total to pay{params.sip ? ' each month' : ''}</span>
              <span className="text-[32px] font-bold tracking-[-0.03em]">{formatINR(c.total)}</span>
            </div>
          </>
        )}
        {spill > 0 && (
          <p className="pt-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            {formatINR(toTarget)} completes this student&apos;s need. The extra {formatINR(spill)} goes to the general pool.
          </p>
        )}
      </Card>

      <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">You receive an 80G receipt for the full {formatINR(c.total)}.</p>

      <Card className="space-y-3">
        <div className="text-[15px] font-semibold">How should we show your name?</div>
        <Segmented value={display} onChange={setDisplay} options={[{ value: 'public', label: sp.displayName }, { value: 'anonymous', label: 'Anonymous sponsor' }]} />
        <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
          {display === 'public'
            ? verified
              ? 'The student and the public impact pages can show your display name.'
              : 'Your name will show once verification is complete. Until then it shows as Anonymous sponsor.'
            : 'You appear as “Anonymous sponsor” everywhere, including the leaderboard.'}
        </p>
      </Card>

      <div className="flex items-start gap-2.5 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.75} />
        <span>Money goes to the trust account and is paid only to the institute against its fee invoice, after a trustee approves it. It never goes to the student or family.</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <PrimaryButton disabled={!c.total} onClick={() => setGatewayOpen(true)} className="sm:min-w-[260px]">
          <Lock className="w-4 h-4" strokeWidth={1.75} />
          Pay {formatINR(c.total)}
        </PrimaryButton>
        <SecondaryButton onClick={back}>Back</SecondaryButton>
      </div>

      <BottomSheet open={whyOpen} onClose={() => setWhyOpen(false)} title="Why we charge this">
        <div className="space-y-4 text-[15px] leading-relaxed text-[#52525B] dark:text-[#A1A1AA]">
          <p>The {feePercent}% platform fee pays for verifying every student (document checks, phone calls with families), payment and bank charges, and the trust team that pays institutes and tracks progress.</p>
          <p>
            {feeMode === 'DEDUCTED'
              ? `It comes out of your donation, so ${formatINR(c.toStudents)} of ${formatINR(c.total)} reaches students.`
              : `It is added on top, so every rupee you chose (${formatINR(c.toStudents)}) reaches students.`}{' '}
            The fee is held separately as “operations” and moved to the trust&apos;s operating account each month.
          </p>
          <PrimaryButton onClick={() => setWhyOpen(false)} className="w-full">Got it</PrimaryButton>
        </div>
      </BottomSheet>
      <GatewaySheet open={gatewayOpen} total={c.total} demoMode={state.settings.demoMode} processing={processing} onClose={() => setGatewayOpen(false)} onPay={pay} />
    </div>
  );
}
