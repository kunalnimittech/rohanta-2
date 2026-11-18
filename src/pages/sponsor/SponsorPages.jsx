// Sponsor module (Part 6): one shell for Individual, Corporate (CSR), NGO/Trust
// and MP/MLA donors. Sponsors only ever see the sponsor-safe student view
// (first name + surname initial, bands, story). Never contact details,
// Aadhaar, bank details, exact marks or full surname.
import React, { useMemo, useRef, useState } from 'react';
import {
  GraduationCap,
  HeartHandshake,
  Sparkles,
  CalendarDays,
  Lock,
  Shield,
  ArrowRight,
  User,
  BookOpen,
  Repeat,
  Building2,
  MapPin,
  Link2,
  Copy,
  Check,
  Eye,
  Download,
  Award,
  Receipt as ReceiptIcon,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate, timeAgo } from '../../data/mockData';
import { SPONSOR_TYPES } from '../../data/rules';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  ProgressBar,
  BottomSheet,
  ConfirmSheet,
  Segmented,
  Amount,
  EmptyState,
  StatTile,
  LineChart,
  SectionLabel,
  CertificateCard,
  ReceiptCard,
  Logo,
  printElement,
  FloatingSelect,
  compactINR,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, MiniSelect, DonationChip, useToast, downloadCSV, CsvButton } from '../admin/AdminShared';
import { CertificateView, certificateLines, CERT_LABEL } from '../shared/CertificatePages';
import { ReceiptView } from '../shared/ReceiptView';

const useSponsor = (user) => {
  const { state } = useStore();
  return { state, sp: sel.getSponsorByUser(state, user.id) };
};

export function KycBanner({ sp }) {
  if (!sp || sp.kycStatus === 'verified' || sp.kycStatus === 'not_required') return null;
  const rejected = sp.kycStatus === 'rejected';
  return (
    <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 flex items-start gap-3">
      <Shield className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} />
      <div className="text-[14px]">
        <div className="font-semibold">{rejected ? 'Verification needs attention' : 'Verification pending'}</div>
        <p className="text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
          {rejected
            ? `${sp.kycRejectReason || 'Please resubmit your documents.'} You can still make a normal donation.`
            : 'The trust verifies organisations within 48 hours. Until then you can make a normal donation, but your name is not public, and cohort or constituency programmes and CSR certificates are locked.'}
        </p>
      </div>
    </div>
  );
}

function Avatar({ ps, size = 'w-12 h-12' }) {
  return (
    <span className={`${size} rounded-full bg-white dark:bg-[#222224] shadow-soft flex items-center justify-center shrink-0 text-[14px] font-semibold`} aria-hidden="true">
      {ps.hasPhoto ? <User className="w-5 h-5" strokeWidth={1.75} /> : ps.initials}
    </span>
  );
}

const studentDisplayClass = (c) => (c === 'Dropper' ? 'Dropper' : `Class ${c}`);

// --- 6.3 Overview ------------------------------------------------------------------
export function SponsorOverview({ user, onNavigate }) {
  const { state, sp } = useSponsor(user);
  if (!sp) return <EmptyState title="Sponsor profile not found" />;
  const t = sel.sponsorTotals(state, sp.id);
  const impact = sel.donorImpactScore(state, sp.id);
  const utilPct = t.toStudents ? Math.round((t.utilised / t.toStudents) * 100) : 0;
  const myStudents = sel.sponsorStudents(state, sp.id);
  const sipNext = sel.nextSipDate(sp.sip);
  const lastSip = sel.sponsorDonations(state, sp.id).filter((d) => d.sip).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];

  let next = { title: 'Discover students who are close to being fully funded', cta: 'Discover', go: () => onNavigate('discover', { nearly: true }) };
  if (lastSip && lastSip.status === 'failed' && sp.sip?.status === 'active') next = { title: `Your ${formatDate(lastSip.createdAt)} SIP debit failed. Check your mandate.`, cta: 'My giving', go: () => onNavigate('giving') };
  else if (sipNext) next = { title: `SIP renews on ${formatDate(sipNext)} · ${formatINR(sp.sip.amount)} + fee`, cta: 'Manage SIP', go: () => onNavigate('giving') };

  // Updates only from students this sponsor funded.
  const ids = myStudents.map((x) => x.id);
  const updates = [
    ...state.progress
      .filter((p) => ids.includes(p.studentId) && p.status === 'verified')
      .map((p) => ({ id: p.id, at: p.verifiedAt || '', who: sel.publicStudent(state, p.studentId).displayName, text: `${p.type}: ${p.score}${p.attendance != null ? ` · attendance ${p.attendance}%` : ''}`, month: p.month })),
    ...state.students
      .filter((x) => ids.includes(x.id) && x.outcome)
      .map((x) => ({ id: `o-${x.id}`, at: x.outcome.at, who: sel.publicStudent(state, x.id).displayName, text: `${x.outcome.exam}: ${x.outcome.qualified ? 'qualified' : 'completed'}${x.outcome.college ? ` · ${x.outcome.college}` : ''}`, month: formatDate(x.outcome.at) })),
  ].slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title={`Hello, ${sp.displayName}`} sub={`${SPONSOR_TYPES[sp.type]} sponsor`} />
      <KycBanner sp={sp} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-2 md:row-span-2 p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Total given</div>
            <div className="mt-4 text-[44px] md:text-[52px] leading-none font-bold tracking-[-0.035em]">{formatINR(t.given)}</div>
            <div className="mt-2 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">{formatINR(t.toStudents)} to students and pools</div>
          </div>
          <div className="space-y-3 mt-8">
            <div className="flex justify-between gap-3 text-[13px] font-semibold">
              <span>{formatINR(t.utilised)} paid to institutes</span>
              <span>{formatINR(t.held)} held</span>
            </div>
            <ProgressBar percent={utilPct} />
            <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Held money stays in the trust account until an institute fee is due.</div>
          </div>
        </div>
        <StatTile className="md:col-span-1" label="Students supported" value={t.studentsSupported} icon={GraduationCap} onClick={() => onNavigate('impact')} />
        <StatTile className="md:col-span-1" label="Impact score" value={impact.score} hint={`${impact.level}${impact.nextLevel ? ` · ${impact.toNext} to ${impact.nextLevel}` : ''}`} icon={Sparkles} onClick={() => onNavigate('impact')} />
        <div className="md:col-span-2 p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between gap-4">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Next action</div>
            <div className="mt-1.5 text-[16px] font-semibold leading-snug">{next.title}</div>
          </div>
          <div>
            <SecondaryButton onClick={next.go} className="h-11 px-5 text-[13px] bg-white dark:bg-[#222224]">
              {next.cta} <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </SecondaryButton>
          </div>
        </div>
      </div>
      <Card className="space-y-3">
        <div className="text-[15px] font-semibold">Recent updates from students you support</div>
        {updates.length === 0 ? (
          <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Progress and results appear here once your students start their course.</p>
        ) : (
          updates.map((u) => (
            <div key={u.id} className="flex items-start justify-between gap-3 text-[14px]">
              <span><span className="font-semibold">{u.who}</span> · {u.text}</span>
              <span className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] shrink-0">{u.month}</span>
            </div>
          ))
        )}
      </Card>
      <p className="flex items-center gap-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
        <Shield className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        Students are mostly minors. You see first names, bands and progress, never contact details.
      </p>
    </div>
  );
}

// --- SIP sheet (shared) -------------------------------------------------------------
function SipSheet({ open, onClose, sp, onNavigate, backTo = 'discover', backParams }) {
  const { state } = useStore();
  const product = state.packageProducts.find((p) => p.type === 'SIP');
  const [amount, setAmount] = useState(product?.fixedAmount || 2000);
  const [day, setDay] = useState('5');
  const min = product?.minAmount || 500;
  return (
    <BottomSheet open={open} onClose={onClose} title="Monthly SIP">
      <div className="space-y-4">
        {sp?.sip && sp.sip.status !== 'cancelled' && (
          <p className="text-[13px] font-medium">You already have a {sp.sip.status} SIP of {formatINR(sp.sip.amount)}. A new one replaces it.</p>
        )}
        <Amount label="Monthly amount (₹)" value={amount} onChange={setAmount} min={min} />
        <FloatingSelect label="Debit day" value={day} onChange={(e) => setDay(e.target.value)} options={['1', '5', '10', '15', '20', '25']} />
        <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] text-[13px] space-y-1">
          <KV label="To students each month" value={formatINR(amount || 0)} />
          <KV label={`Platform fee ${product?.platformFeePercent ?? 10}%`} value={formatINR(Math.round(((amount || 0) * (product?.platformFeePercent ?? 10)) / 100))} />
        </div>
        <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">SIP money goes to the general pool, so no student is left mid-course if a debit fails. One consolidated certificate each year.</p>
        <PrimaryButton
          disabled={!amount || amount < min}
          onClick={() => { onClose(); onNavigate('checkout', { productId: product.id, poolId: 'general', amount, sip: true, sipDay: Number(day), backTo, backParams }); }}
          className="w-full"
        >
          Continue to checkout
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

// --- 6.5 Student detail ---------------------------------------------------------------
function StudentDetail({ id, sp, onBack, onNavigate }) {
  const { state } = useStore();
  const ps = sel.publicStudent(state, id);
  const pkg = sel.getPackage(state, id);
  const partial = state.packageProducts.find((p) => p.id === 'pp-partial');
  const full = state.packageProducts.find((p) => p.id === 'pp-sponsor');
  const [amount, setAmount] = useState(Math.min(10000, ps?.remaining || 0));
  const [sipOpen, setSipOpen] = useState(false);
  if (!ps) return null;
  const extras = (pkg?.extras || []).filter((e) => e.state === 'normal' && !e.excluded);
  const min = partial?.minAmount || 1000;
  const spill = Math.max(0, (amount || 0) - ps.remaining);
  const back = { backTo: 'discover', backParams: { studentId: id } };
  const done = ps.remaining <= 0;

  return (
    <div className="space-y-8 pb-12 max-w-[880px]">
      <PageHeader onBack={onBack} backLabel="Discover" title={ps.displayName} sub={`${studentDisplayClass(ps.studentClass)} · ${ps.district}, ${ps.state} · ${ps.exam}`} actions={<StatusChip status="verified" label="Verified by the trust" />} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar ps={ps} size="w-14 h-14" />
            <div className="min-w-0">
              <div className="text-[15px] font-semibold">{ps.institute}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{ps.course}</div>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed">{ps.story}</p>
          <div className="flex flex-wrap gap-2">
            <StatusChip status="info" label={`Class 10: ${ps.marksBand}`} />
            <StatusChip status="info" label={`Family income ${ps.incomeBand}`} />
          </div>
        </Card>
        <Card className="lg:col-span-2 space-y-1">
          <SectionLabel className="mb-2">Need</SectionLabel>
          <KV label="Course fee" value={formatINR(pkg?.courseFee || 0)} />
          {extras.map((e) => <KV key={e.id} label={`${e.category} (approved)`} value={formatINR(e.amount)} />)}
          <KV label="Discount" value={`− ${formatINR(pkg?.discount || 0)}`} />
          <KV label="Family contribution" value={`− ${formatINR(pkg?.familyContribution || 0)}`} />
          <KV label="Verified need" value={formatINR(ps.need)} strong />
          <KV label="Funded so far" value={formatINR(ps.raised)} />
          <KV label="Remaining" value={formatINR(ps.remaining)} strong />
          <div className="pt-3"><ProgressBar percent={ps.percent} /></div>
        </Card>
      </div>

      {done ? (
        <EmptyState icon={HeartHandshake} title="Fully funded" body="Thank you. This student no longer needs funding. You can support others from Discover." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="text-[15px] font-semibold">Fund the full remaining need</div>
              <div className="text-[28px] font-bold tracking-[-0.02em] mt-2">{formatINR(ps.remaining)}</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">+ platform fee. Sponsorship certificate after the fee is paid to the institute.</div>
            </div>
            <PrimaryButton onClick={() => onNavigate('checkout', { productId: full.id, studentId: id, amount: ps.remaining, ...back })} className="w-full">Fund {formatINR(ps.remaining)}</PrimaryButton>
          </Card>
          <Card className="space-y-4 flex flex-col justify-between [&_input]:bg-white dark:[&_input]:bg-[#222224]">
            <div className="space-y-3">
              <div className="text-[15px] font-semibold">Fund part of it</div>
              <Amount value={amount} onChange={setAmount} min={min} helper={`Minimum ${formatINR(min)}`} />
              {spill > 0 && <p className="text-[12px] font-medium">{formatINR(ps.remaining)} goes to {ps.displayName}. Extra goes to the general pool ({formatINR(spill)}).</p>}
            </div>
            <SecondaryButton disabled={!amount || amount < min} onClick={() => onNavigate('checkout', { productId: partial.id, studentId: id, amount, ...back })} className="w-full bg-white dark:bg-[#222224]">Continue</SecondaryButton>
          </Card>
          <Card className="space-y-4 flex flex-col justify-between">
            <div>
              <div className="text-[15px] font-semibold">Add to monthly SIP</div>
              <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-2">SIP goes to the general pool. The trust uses it to complete students like {ps.displayName} so nobody is left mid-course.</div>
            </div>
            <SecondaryButton onClick={() => setSipOpen(true)} className="w-full bg-white dark:bg-[#222224]"><Repeat className="w-4 h-4" strokeWidth={1.75} /> Start a SIP</SecondaryButton>
          </Card>
        </div>
      )}
      <p className="flex items-center gap-2 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
        <Shield className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        Contact details, Aadhaar, bank details, exact marks and the full surname are never shown to sponsors. {ps.hasPhoto ? 'The guardian allowed a photo.' : 'No photo is shown without guardian consent.'}
      </p>
      <SipSheet open={sipOpen} onClose={() => setSipOpen(false)} sp={sp} onNavigate={onNavigate} backTo="discover" backParams={{ studentId: id }} />
    </div>
  );
}

// --- 6.4 Discover -----------------------------------------------------------------------
const NEED_BANDS = [
  ['any', 'Any amount needed'],
  ['lt25', 'Under ₹25,000'],
  ['25to50', '₹25,000 – ₹50,000'],
  ['gt50', 'Above ₹50,000'],
];

export function visibleProducts(state, sp) {
  return state.packageProducts.filter(
    (p) => p.allowedDonorTypes.includes(sp.type) && (p.visibility === 'PUBLIC' || p.privateDonorId === sp.id)
  );
}

export function SponsorDiscover({ user, params = {}, onNavigate }) {
  const { state, sp } = useSponsor(user);
  const [openId, setOpenId] = useState(params.studentId || null);
  const [exam, setExam] = useState('All exams');
  const [st8, setSt8] = useState('All states');
  const [district, setDistrict] = useState('All districts');
  const [need, setNeed] = useState('any');
  const [nearly, setNearly] = useState(!!params.nearly);
  const [sipOpen, setSipOpen] = useState(false);
  const [lockNote, setLockNote] = useState(null);
  React.useEffect(() => { setOpenId(params.studentId || null); if (params.nearly) setNearly(true); }, [params]);

  const listed = useMemo(
    () =>
      state.students
        .filter((x) => ['Listed', 'Partially funded'].includes(x.status) && sel.studentRemainingNeed(state, x.id) > 0)
        .map((x) => sel.publicStudent(state, x.id)),
    [state]
  );
  if (!sp) return null;
  if (openId) return <StudentDetail id={openId} sp={sp} onBack={() => setOpenId(null)} onNavigate={onNavigate} />;

  const rows = listed
    .filter((p) => exam === 'All exams' || p.exam === exam)
    .filter((p) => st8 === 'All states' || p.state === st8)
    .filter((p) => district === 'All districts' || p.district === district)
    .filter((p) => need === 'any' || (need === 'lt25' ? p.remaining < 25000 : need === '25to50' ? p.remaining >= 25000 && p.remaining <= 50000 : p.remaining > 50000))
    .filter((p) => !nearly || p.percent >= 50)
    .sort((a, b) => (nearly ? b.percent - a.percent : a.remaining - b.remaining));
  const states = ['All states', ...new Set(listed.map((p) => p.state))];
  const districts = ['All districts', ...new Set(listed.filter((p) => st8 === 'All states' || p.state === st8).map((p) => p.district))];
  const products = visibleProducts(state, sp);
  const verified = sel.sponsorVerified(sp);

  const openProduct = (p) => {
    if (p.visibility === 'PRIVATE' && !verified) return setLockNote(p);
    if (p.type === 'SIP') return setSipOpen(true);
    if (p.type === 'COHORT') return onNavigate('csr');
    if (p.type === 'CONSTITUENCY') return onNavigate('constituency');
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Discover" sub="Students verified by the trust, with the amount they still need." />
      <KycBanner sp={sp} />
      <div className="flex flex-wrap gap-2">
        {products.map((p) => {
          const locked = p.visibility === 'PRIVATE' && !verified;
          return (
            <button key={p.id} type="button" onClick={() => openProduct(p)} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[13px] font-medium hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] active:scale-[0.97] transition-all">
              {locked && <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />}
              {p.name}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <MiniSelect label="Exam" value={exam} onChange={setExam} options={['All exams', 'JEE', 'NEET', 'CUET']} />
        <MiniSelect label="State" value={st8} onChange={(v) => { setSt8(v); setDistrict('All districts'); }} options={states} />
        <MiniSelect label="District" value={district} onChange={setDistrict} options={districts} />
        <MiniSelect label="Amount needed" value={need} onChange={setNeed} options={NEED_BANDS.map(([value, label]) => ({ value, label }))} />
        <button type="button" aria-pressed={nearly} onClick={() => setNearly((v) => !v)} className={`h-11 px-4 rounded-full text-[13px] font-medium transition-colors ${nearly ? 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]' : 'bg-[#F4F4F5] dark:bg-[#151515]'}`}>
          Nearly funded
        </button>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={Compass} title="No students match" body="Try clearing a filter. Fully funded students leave this list." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((p) => (
            <button key={p.id} type="button" onClick={() => setOpenId(p.id)} className="text-left p-6 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] hover:bg-[#ECECEE] dark:hover:bg-[#1D1D1F] active:scale-[0.99] transition-all space-y-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 dark:focus-visible:ring-[#FAFAFA]/25">
              <div className="flex items-start gap-3.5">
                <Avatar ps={p} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[17px] font-semibold">{p.displayName}</span>
                    <StatusChip status="info" label={p.exam} />
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">{studentDisplayClass(p.studentClass)} · {p.district}, {p.state}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] truncate">{p.institute} · {p.course}</div>
                </div>
              </div>
              <p className="text-[14px] leading-relaxed line-clamp-2">{p.story}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-[13px] font-semibold">
                  <span>{formatINR(p.raised)} of {formatINR(p.need)}</span>
                  <span>{formatINR(p.remaining)} to go</span>
                </div>
                <ProgressBar percent={p.percent} />
              </div>
              <div className="flex flex-wrap gap-2 text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                <span>Class 10 {p.marksBand}</span>·<span>Income {p.incomeBand}</span>
              </div>
            </button>
          ))}
        </div>
      )}
      <SipSheet open={sipOpen} onClose={() => setSipOpen(false)} sp={sp} onNavigate={onNavigate} />
      <BottomSheet open={!!lockNote} onClose={() => setLockNote(null)} title={lockNote?.name || ''}>
        <div className="space-y-4">
          <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">This programme unlocks after the trust verifies your organisation&apos;s documents (usually within 48 hours). You can make a normal donation to any student meanwhile.</p>
          <PrimaryButton onClick={() => setLockNote(null)} className="w-full">OK</PrimaryButton>
        </div>
      </BottomSheet>
    </div>
  );
}

// --- 6.6 My giving ---------------------------------------------------------------------
const targetLabel = (state, d) =>
  d.studentId ? sel.publicStudent(state, d.studentId)?.displayName : d.cohortId ? state.cohorts.find((c) => c.id === d.cohortId)?.name : state.pools.find((p) => p.id === d.poolId)?.name || 'General pool';

export function SponsorGiving({ user, onNavigate }) {
  const { state, sp } = useSponsor(user);
  const { dispatch } = useStore();
  const [receipt, setReceipt] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [sipOpen, setSipOpen] = useState(false);
  const [toastEl, toast] = useToast();
  if (!sp) return null;
  const donations = sel.sponsorDonations(state, sp.id).slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const sip = sp.sip;
  const sipDebits = donations.filter((d) => d.sip);
  const lastSip = sipDebits[0];
  const sipNext = sel.nextSipDate(sip);
  const certFor = (d) => state.certificates.find((c) => c.donationId === d.id);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="My giving" sub="Every payment, its receipt and where the money went." />
      {sip && sip.status !== 'cancelled' ? (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] shadow-soft flex items-center justify-center"><Repeat className="w-4 h-4" strokeWidth={1.75} /></span>
              <div>
                <div className="text-[15px] font-semibold">Monthly SIP · {formatINR(sip.amount)} + {formatINR(Math.round(sip.amount * state.settings.platformFeePercent / 100))} fee</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                  {sip.status === 'active' ? `Next debit ${formatDate(sipNext)}` : 'Paused'} · {sipDebits.filter((d) => d.status === 'success').length} months given · to the general pool
                </div>
              </div>
            </div>
            <StatusChip status={sip.status === 'active' ? 'verified' : 'pending'} label={sip.status === 'active' ? 'Active' : 'Paused'} />
          </div>
          {lastSip && lastSip.status === 'failed' && (
            <div className="p-4 rounded-[20px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 text-[14px]">
              Your {formatDate(lastSip.createdAt)} debit of {formatINR(lastSip.total)} did not go through ({lastSip.failReason || 'bank declined'}). Please check your UPI or bank mandate. We will try again on the next debit date.
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {sip.status === 'active' ? (
              <SmallButton onClick={() => { dispatch('updateSip', { sponsorId: sp.id, status: 'paused' }); toast('SIP paused'); }}>Pause</SmallButton>
            ) : (
              <SmallButton primary onClick={() => { dispatch('updateSip', { sponsorId: sp.id, status: 'active' }); toast('SIP resumed'); }}>Resume</SmallButton>
            )}
            <SmallButton onClick={() => setCancelOpen(true)}>Cancel SIP</SmallButton>
          </div>
          <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Money already received stays allocated. SIP goes to the pool, so no student is left mid-course. One consolidated certificate is issued each year.</p>
          {state.settings.demoMode && sip.status === 'active' && (
            <div className="p-4 rounded-[20px] border border-dashed border-[#D4D4D8] dark:border-[#3F3F46] space-y-2">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#52525B] dark:text-[#A1A1AA]">Demo</div>
              <div className="flex flex-wrap gap-2">
                <SmallButton onClick={() => { dispatch('sipCycle', { sponsorId: sp.id }); toast('Next month debited. Receipt issued.'); }}>Simulate next month</SmallButton>
                <SmallButton onClick={() => { dispatch('sipCycle', { sponsorId: sp.id, fail: true }); toast('Debit failed. Reminder sent, admin notified.'); }}>Simulate failed debit</SmallButton>
                <SmallButton
                  disabled={state.certificates.some((c) => c.sponsorId === sp.id && c.type === 'annual_sip')}
                  onClick={() => {
                    const ok = sipDebits.filter((d) => d.status === 'success');
                    dispatch('issueCertificate', { certificate: { sponsorId: sp.id, type: 'annual_sip', studentIds: [], amount: ok.reduce((n, d) => n + d.total, 0), period: 'FY 2026–27', donationIds: ok.map((d) => d.id) } });
                    toast('Annual SIP certificate issued');
                  }}
                >
                  Issue annual certificate
                </SmallButton>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[15px] font-semibold">Give every month</div>
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{sip?.status === 'cancelled' ? 'Your SIP is cancelled. ' : ''}A small monthly SIP keeps students funded through their whole course.</div>
          </div>
          <SecondaryButton onClick={() => setSipOpen(true)} className="h-11 px-5 text-[14px] bg-white dark:bg-[#222224] shrink-0"><Repeat className="w-4 h-4" strokeWidth={1.75} /> Start a SIP</SecondaryButton>
        </Card>
      )}

      {donations.length === 0 ? (
        <EmptyState icon={HeartHandshake} title="No donations yet" body="When you fund a student or start a SIP, it appears here with its receipt." action={<PrimaryButton onClick={() => onNavigate('discover')} className="h-12 px-6 text-[14px]">Discover students</PrimaryButton>} />
      ) : (
        <div className="space-y-3">
          {donations.map((d) => {
            const rc = state.receipts.find((r) => r.donationId === d.id);
            const cert = certFor(d);
            return (
              <div key={d.id} className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-semibold">{targetLabel(state, d)}</span>
                    <DonationChip status={d.status} />
                    {d.sip && <StatusChip status="info" label="SIP" />}
                    {d.tranche && <StatusChip status="info" label={`Tranche ${d.tranche}`} />}
                  </div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA] mt-0.5">
                    {formatDate(d.createdAt)} · {formatINR(d.amount)} + {formatINR(d.fee)} fee · {d.offline ? d.offlineMode : d.paymentRef}
                  </div>
                  {d.status === 'pending' && (
                    <div className="text-[12px] mt-1 flex flex-wrap items-center gap-2">
                      We will confirm this payment in a few minutes.
                      {state.settings.demoMode && !d.offline && (
                        <button type="button" onClick={() => { dispatch('gatewayWebhookSuccess', { donationId: d.id }); toast('Gateway confirmed the payment'); }} className="font-medium underline underline-offset-4">Simulate gateway confirmation (demo)</button>
                      )}
                    </div>
                  )}
                  {d.status === 'failed' && <div className="text-[12px] mt-1">No money was taken. {d.failReason || ''}</div>}
                </div>
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <span className="text-[17px] font-bold mr-1">{formatINR(d.total)}</span>
                  {rc && <SmallButton ariaLabel={`Receipt ${rc.number}`} onClick={() => setReceipt({ rc, d })}><ReceiptIcon className="w-3.5 h-3.5" strokeWidth={1.75} /> Receipt</SmallButton>}
                  {cert && <SmallButton onClick={() => onNavigate('certificates', { tab: 'certificates' })}><Award className="w-3.5 h-3.5" strokeWidth={1.75} /> Certificate</SmallButton>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <BottomSheet open={!!receipt} onClose={() => setReceipt(null)} title="80G receipt">
        {receipt && <ReceiptView receipt={receipt.rc} />}
      </BottomSheet>
      <ConfirmSheet
        open={cancelOpen}
        title="Cancel your SIP?"
        body="No further debits will be taken. Money already received stays allocated, and SIP money is in the pool, so no student is left mid-course."
        confirmLabel="Cancel SIP"
        destructive
        cancelLabel="Keep SIP"
        onClose={() => setCancelOpen(false)}
        onConfirm={() => { setCancelOpen(false); dispatch('updateSip', { sponsorId: sp.id, status: 'cancelled' }); toast('SIP cancelled'); }}
      />
      <SipSheet open={sipOpen} onClose={() => setSipOpen(false)} sp={sp} onNavigate={onNavigate} backTo="giving" />
      {toastEl}
    </div>
  );
}

// --- 6.7 Impact ------------------------------------------------------------------------
const PART_LABELS = [
  ['utilisation', 'Utilisation', '1 point per ₹1,000 actually paid to institutes'],
  ['students', 'Students supported', '+10 per fully funded student'],
  ['attendance', 'Attendance', '+2 per verified month at 85% or more'],
  ['improvement', 'Test improvement', '+1 per percentage point gained'],
  ['outcomes', 'Results', '+50 qualified, +10 completed'],
  ['consistency', 'Consistency', '+5 per SIP month, +20 for a second year'],
];

function ShareCard({ sp, impact, totals }) {
  const ref = useRef(null);
  return (
    <div className="space-y-3">
      <div ref={ref} className="print-doc bg-[#0A0A0A] text-white rounded-[28px] p-7 max-w-[420px] space-y-6">
        <div className="flex items-center gap-2.5">
          <Logo className="w-7 h-7" />
          <span className="text-[15px] font-semibold">Sikshit Bharat</span>
        </div>
        <div>
          <div className="text-[13px] text-[#A1A1AA]">{sp.public ? sp.displayName : 'A Sikshit Bharat sponsor'}</div>
          <div className="text-[52px] font-bold tracking-[-0.035em] leading-none mt-2">{impact.score}</div>
          <div className="text-[15px] font-semibold mt-1">{impact.level}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[13px]">
          <div><div className="text-[#A1A1AA]">Students supported</div><div className="text-[18px] font-semibold">{totals.studentsSupported}</div></div>
          <div><div className="text-[#A1A1AA]">Paid to institutes</div><div className="text-[18px] font-semibold">{compactINR(totals.utilised)}</div></div>
        </div>
        <div className="text-[11px] text-[#A1A1AA]">Fees paid directly to coaching institutes for verified students.</div>
      </div>
      <SecondaryButton onClick={() => printElement(ref.current)} className="h-11 px-5 text-[13px]"><Download className="w-4 h-4" strokeWidth={1.75} /> Download share card</SecondaryButton>
      <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">The share card never includes student names or photos.</p>
    </div>
  );
}

export function SponsorImpact({ user }) {
  const { state, sp } = useSponsor(user);
  const { dispatch } = useStore();
  const [type, setType] = useState(sp?.type || 'individual');
  const [st8, setSt8] = useState('All states');
  const [year, setYear] = useState('All years');
  if (!sp) return null;
  const impact = sel.donorImpactScore(state, sp.id);
  const trend = sel.impactTrend(state, sp.id, 6);
  const totals = sel.sponsorTotals(state, sp.id);
  const students = sel.sponsorStudents(state, sp.id);
  const max = Math.max(1, ...Object.values(impact.parts));

  // Opt-in leaderboard: anonymous donors and those who did not opt in never appear.
  const years = ['All years', ...new Set(state.donations.map((d) => d.createdAt.slice(0, 4)))];
  const states = ['All states', ...new Set(state.students.map((x) => x.state).filter(Boolean))];
  const board = state.sponsors
    .filter((x) => x.type === type && x.leaderboardOptIn && x.public && sel.sponsorVerified(x))
    .filter((x) => {
      const ds = sel.sponsorDonations(state, x.id).filter((d) => d.status === 'success');
      return (year === 'All years' || ds.some((d) => d.createdAt.startsWith(year))) && (st8 === 'All states' || ds.some((d) => d.studentId && sel.getStudent(state, d.studentId)?.state === st8));
    })
    .map((x) => ({ id: x.id, name: x.displayName, score: sel.donorImpactScore(state, x.id).score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Impact" sub="Your score is for you and is read-only. It never affects verification, allocation or payouts." />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2 space-y-5">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Impact score</div>
            <div className="text-[52px] font-bold tracking-[-0.035em] leading-none mt-3">{impact.score}</div>
            <div className="text-[15px] font-semibold mt-2">{impact.level}</div>
            {impact.nextLevel && <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{impact.toNext} points to {impact.nextLevel}</div>}
          </div>
          <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Supporter 0–99 · Champion 100–499 · Changemaker 500+. Co-funded students share points in proportion to what each sponsor gave.</div>
        </Card>
        <Card className="lg:col-span-3 space-y-3">
          <div className="text-[15px] font-semibold">How it adds up</div>
          {PART_LABELS.map(([k, l, hint]) => (
            <div key={k} className="space-y-1.5">
              <div className="flex justify-between gap-3 text-[14px]">
                <span><span className="font-medium">{l}</span> <span className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">· {hint}</span></span>
                <span className="font-semibold">{impact.parts[k]}</span>
              </div>
              <ProgressBar percent={(impact.parts[k] / max) * 100} />
            </div>
          ))}
        </Card>
      </div>
      <Card className="space-y-3">
        <div className="text-[15px] font-semibold">Monthly snapshot</div>
        <LineChart labels={trend.map((t) => t.label)} series={[{ name: 'Impact score', values: trend.map((t) => t.score) }]} ariaLabel="Impact score over the last six months" />
      </Card>
      <section className="space-y-3">
        <SectionLabel>Students you support</SectionLabel>
        {students.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students yet" body="Gifts to the pool support many students; they do not appear here individually." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {students.map((p) => (
              <div key={p.id} className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[15px] font-semibold">{p.displayName}</span>
                  <StatusChip status={['Enrolled', 'Fully funded', 'Completed'].includes(p.status) ? 'verified' : 'uploaded'} label={p.status} />
                </div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{p.exam} · {p.institute}</div>
                <ProgressBar percent={p.percent} />
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-[15px] font-semibold">Leaderboard</div>
            <button type="button" aria-pressed={!!sp.leaderboardOptIn} onClick={() => dispatch('updateSponsor', { sponsorId: sp.id, patch: { leaderboardOptIn: !sp.leaderboardOptIn } })} className="text-[13px] font-medium underline underline-offset-4">
              {sp.leaderboardOptIn ? 'Leave leaderboard' : 'Join leaderboard'}
            </button>
          </div>
          <Segmented size="sm" value={type} onChange={setType} options={Object.entries(SPONSOR_TYPES).map(([value, label]) => ({ value, label }))} />
          <div className="flex flex-wrap gap-2 [&_select]:bg-white dark:[&_select]:bg-[#222224]">
            <MiniSelect label="State" value={st8} onChange={setSt8} options={states} />
            <MiniSelect label="Year" value={year} onChange={setYear} options={years} />
          </div>
          {board.length === 0 ? (
            <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">No opted-in donors here yet.</p>
          ) : (
            <ol className="space-y-1.5">
              {board.map((b, i) => (
                <li key={b.id} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[16px] text-[14px] ${b.id === sp.id ? 'bg-white dark:bg-[#222224] ring-2 ring-[#0A0A0A] dark:ring-[#FAFAFA]' : ''}`}>
                  <span><span className="font-semibold mr-2">{i + 1}</span>{b.name}{b.id === sp.id ? ' (you)' : ''}</span>
                  <span className="font-semibold">{b.score}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Opt-in only. Anonymous donors never appear.</p>
        </Card>
        <Card className="space-y-3">
          <div className="text-[15px] font-semibold">Share your impact</div>
          <ShareCard sp={sp} impact={impact} totals={totals} />
        </Card>
      </div>
    </div>
  );
}

// --- Certificates & receipts --------------------------------------------------------------
const CSR_TYPES = ['corporate', 'ngo'];

export function SponsorCertificates({ user, params = {} }) {
  const { state, sp } = useSponsor(user);
  const [tab, setTab] = useState(params.tab || 'receipts');
  const [view, setView] = useState(null);
  React.useEffect(() => { if (params.tab) setTab(params.tab); }, [params]);
  if (!sp) return null;
  const donations = sel.sponsorDonations(state, sp.id);
  const receipts = state.receipts.filter((r) => donations.some((d) => d.id === r.donationId)).sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  const certs = state.certificates.filter((c) => c.sponsorId === sp.id);
  const locked = CSR_TYPES.includes(sp.type) && !sel.sponsorVerified(sp);
  const certLines = (c) => certificateLines(state, c);

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Certificates & receipts" sub="Certificates are issued by package type after the fee is paid to the institute." />
      <Segmented value={tab} onChange={setTab} options={[{ value: 'receipts', label: 'Receipts', count: receipts.length }, { value: 'certificates', label: 'Certificates', count: certs.length }]} />
      {tab === 'receipts' ? (
        <div className="space-y-3">
          <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">80G receipts cover the full amount paid, including the platform fee. The trust files Form 10BD each year and issues Form 10BE.</p>
          {receipts.length === 0 && <EmptyState icon={ReceiptIcon} title="No receipts yet" />}
          {receipts.map((r) => {
            const d = state.donations.find((x) => x.id === r.donationId);
            return (
              <div key={r.id} className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-semibold">{r.number}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{formatDate(r.issuedAt)} · {targetLabel(state, d)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{formatINR(r.amount)}</span>
                  <SmallButton ariaLabel={`View receipt ${r.number}`} onClick={() => setView({ kind: 'receipt', r, d })}><Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View</SmallButton>
                </div>
              </div>
            );
          })}
        </div>
      ) : locked ? (
        <EmptyState icon={Lock} title="CSR certificates are locked" body="They unlock once the trust verifies your organisation's documents. Your 80G receipts are available now." />
      ) : (
        <div className="space-y-3">
          {certs.length === 0 && <EmptyState icon={Award} title="No certificates yet" body="Your certificate is issued when the trust pays the institute and the institute confirms it." />}
          {certs.map((c) => (
            <div key={c.id} className="p-5 md:px-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[15px] font-semibold">{c.number}</div>
                <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{CERT_LABEL[c.type]} · {formatDate(c.issuedAt)} · {certLines(c).join('; ')}</div>
              </div>
              <SmallButton onClick={() => setView({ kind: 'cert', c })}><Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View</SmallButton>
            </div>
          ))}
        </div>
      )}
      <BottomSheet open={!!view} onClose={() => setView(null)} title={view?.kind === 'cert' ? 'Certificate' : '80G receipt'}>
        {view?.kind === 'receipt' && <ReceiptView receipt={view.r} />}
        {view?.kind === 'cert' && <CertificateView certificate={view.c} />}
      </BottomSheet>
    </div>
  );
}

// --- 6.8 Corporate: CSR programmes ------------------------------------------------------------
export function SponsorCsr({ user, onNavigate }) {
  const { state, sp } = useSponsor(user);
  const reportRef = useRef(null);
  if (!sp) return null;
  const verified = sel.sponsorVerified(sp);
  const cohorts = state.cohorts.filter((c) => c.sponsorId === sp.id);
  const privateProducts = state.packageProducts.filter((p) => p.privateDonorId === sp.id && p.type === 'COHORT');
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="CSR programmes" sub="Private cohort packages set up for your company by the trust." />
      <KycBanner sp={sp} />
      {!verified ? (
        <EmptyState icon={Lock} title="Locked until verification" body="Cohort programmes, tranche payments and the Utilisation Certificate unlock once your CSR documents are verified (usually within 48 hours)." />
      ) : cohorts.length === 0 && privateProducts.length === 0 ? (
        <EmptyState icon={Building2} title="No CSR programme yet" body="Write to csr@sikshitbharat.org and the trust will set up a private cohort for you, for example 10 NEET students in Bihar." />
      ) : (
        cohorts.map((c) => {
          const tranches = state.donations.filter((d) => d.cohortId === c.id).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
          const received = tranches.filter((d) => d.status === 'success').reduce((n, d) => n + d.amount, 0);
          const product = state.packageProducts.find((p) => p.id === c.productId);
          const remaining = Math.max(0, c.target - received);
          const paidOut = 0;
          const rows = tranches.map((d, i) => ({
            tranche: d.tranche || i + 1,
            date: formatDate(d.createdAt),
            amount: d.amount,
            fee: d.fee,
            total: d.total,
            status: d.status,
            receipt: state.receipts.find((r) => r.donationId === d.id)?.number || '',
          }));
          return (
            <div key={c.id} className="space-y-5">
              <Card className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[18px] font-semibold">{product?.name || c.name}</div>
                    <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{c.exam} · {c.state} · {c.seats} students · reports {product?.reportingFrequency?.toLowerCase()}</div>
                  </div>
                  <StatusChip status="locked" label="Private" />
                </div>
                <div className="flex justify-between text-[13px] font-semibold"><span>{formatINR(received)} of {formatINR(c.target)}</span><span>{formatINR(remaining)} to go</span></div>
                <ProgressBar percent={(received / c.target) * 100} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
                  <KV label="Students placed" value={`${c.studentIds.length} of ${c.seats}`} />
                  <KV label="Held for cohort" value={formatINR(sel.cohortBalance(state, c.id))} />
                  <KV label="Paid to institutes" value={formatINR(paidOut)} />
                  <KV label="Utilisation certificate" value={paidOut > 0 ? 'Available' : 'After first payout'} />
                </div>
                {c.studentIds.length === 0 && <p className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">The trust assigns verified students from the {c.state} {c.exam} intake to this cohort. You will see them here by first name.</p>}
                <div className="flex flex-wrap gap-2 pt-1">
                  {remaining > 0 && (
                    <PrimaryButton onClick={() => onNavigate('checkout', { productId: c.productId, cohortId: c.id, amount: Math.min(remaining, c.target / 2), tranche: tranches.length + 1, backTo: 'csr' })} className="h-12 px-6 text-[14px]">
                      Pay tranche {tranches.length + 1} · {formatINR(Math.min(remaining, c.target / 2))}
                    </PrimaryButton>
                  )}
                  <CsvButton label="CSR report (CSV)" onClick={() => downloadCSV(`${c.id}-csr-report.csv`, [{ key: 'tranche', label: 'Tranche' }, { key: 'date', label: 'Date' }, { key: 'amount', label: 'To students' }, { key: 'fee', label: 'Platform fee' }, { key: 'total', label: 'Paid' }, { key: 'status', label: 'Status' }, { key: 'receipt', label: 'Receipt no.' }], rows)} />
                  <SecondaryButton onClick={() => printElement(reportRef.current)} className="h-11 px-5 text-[13px]"><Download className="w-4 h-4" strokeWidth={1.75} /> Print view</SecondaryButton>
                </div>
              </Card>
              <section className="space-y-2">
                <SectionLabel>Tranches</SectionLabel>
                {rows.map((r) => (
                  <div key={r.tranche} className="px-5 py-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-wrap items-center justify-between gap-3">
                    <div><div className="text-[14px] font-semibold">Tranche {r.tranche} · {r.date}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.receipt ? `Receipt ${r.receipt}` : 'Receipt after confirmation'}</div></div>
                    <div className="flex items-center gap-3"><DonationChip status={r.status} /><span className="font-bold">{formatINR(r.total)}</span></div>
                  </div>
                ))}
              </section>
              {/* Printable CSR report */}
              <div className="hidden print:block">
                <div ref={reportRef} className="print-doc bg-white text-[#0A0A0A] p-8 space-y-4">
                  <div className="flex items-center gap-2"><Logo className="w-7 h-7" /><span className="text-[16px] font-semibold">Sikshit Bharat · CSR report</span></div>
                  <div className="text-[14px]">{sp.org?.name} · {product?.name}</div>
                  <div className="text-[13px]">Received {formatINR(received)} of {formatINR(c.target)} · {c.studentIds.length} of {c.seats} students placed · generated {formatDate(new Date().toISOString())}</div>
                  <table className="w-full text-[12px]"><thead><tr><th className="text-left">Tranche</th><th className="text-left">Date</th><th className="text-right">To students</th><th className="text-right">Fee</th><th className="text-right">Paid</th><th className="text-left">Receipt</th></tr></thead>
                    <tbody>{rows.map((r) => <tr key={r.tranche}><td>{r.tranche}</td><td>{r.date}</td><td className="text-right">{formatINR(r.amount)}</td><td className="text-right">{formatINR(r.fee)}</td><td className="text-right">{formatINR(r.total)}</td><td>{r.receipt}</td></tr>)}</tbody></table>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// --- 6.8 MP / MLA: Constituency -------------------------------------------------------------------
export function SponsorConstituency({ user, onNavigate }) {
  const { state, sp } = useSponsor(user);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState(100000);
  if (!sp) return null;
  const verified = sel.sponsorVerified(sp);
  const pools = state.pools.filter((p) => p.sponsorId === sp.id);
  const product = state.packageProducts.find((p) => p.type === 'CONSTITUENCY' && (!p.privateDonorId || p.privateDonorId === sp.id));
  const link = `https://sikshitbharat.org/patron/${(sp.org?.constituency || 'constituency').toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title="Constituency" sub={`${sp.org?.constituency || ''}${sp.org?.state ? `, ${sp.org.state}` : ''} · pooled funds allocated by the trust to verified local students.`} />
      <KycBanner sp={sp} />
      {!verified ? (
        <EmptyState icon={Lock} title="Locked until verification" body="The constituency fund opens once the trust verifies your office's documents." />
      ) : (
        pools.map((p) => {
          const lines = state.allocations.filter((a) => a.targetType === 'pool' && a.targetId === p.id);
          const received = lines.filter((a) => a.amount > 0).reduce((n, a) => n + a.amount, 0);
          const balance = sel.poolBalance(state, p.id);
          const funded = state.allocations.filter((a) => a.fromPool === p.id).map((a) => ({ a, ps: sel.publicStudent(state, a.targetId) }));
          return (
            <div key={p.id} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatTile label="Pooled so far" value={compactINR(received)} hint={formatINR(received)} icon={MapPin} />
                <StatTile label="Allocated to students" value={compactINR(received - balance)} hint={`${funded.length} allocation${funded.length === 1 ? '' : 's'}`} icon={GraduationCap} />
                <StatTile label="Available" value={compactINR(balance)} hint="Held in the trust account" icon={HeartHandshake} />
              </div>
              <Card className="space-y-3">
                <div className="text-[15px] font-semibold">Students funded from your constituency pool</div>
                {funded.length === 0 ? (
                  <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">The trust allocates pool money to verified students from {sp.org?.constituency}. They will appear here by first name.</p>
                ) : (
                  funded.map(({ a, ps }) => <KV key={a.id} label={`${ps?.displayName} · ${ps?.exam}, ${ps?.district}`} value={formatINR(a.amount)} />)
                )}
              </Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="space-y-3 [&_input]:bg-white dark:[&_input]:bg-[#222224]">
                  <div className="text-[15px] font-semibold">Add to the constituency fund</div>
                  <Amount value={amount} onChange={setAmount} min={product?.minAmount} helper={product?.minAmount ? `Minimum ${formatINR(product.minAmount)}` : undefined} />
                  <PrimaryButton disabled={!amount || (product?.minAmount && amount < product.minAmount)} onClick={() => onNavigate('checkout', { productId: product.id, poolId: p.id, amount, backTo: 'constituency' })} className="h-12 px-6 text-[14px]">Continue</PrimaryButton>
                </Card>
                <Card className="space-y-3">
                  <div className="text-[15px] font-semibold">Annual Constituency Impact Certificate</div>
                  <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Issued each April with the number of students, amount utilised and results.</p>
                  <StatusChip status="pending" label="Next: April 2027" />
                </Card>
              </div>
              <Card className="space-y-3">
                <div className="text-[15px] font-semibold">Invite local donors (patron tool)</div>
                <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">Share this link. Donations through it go to the {p.name}.</p>
                <div className="flex items-center gap-2 p-4 rounded-[20px] bg-white dark:bg-[#222224]">
                  <Link2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  <span className="text-[13px] font-medium truncate flex-1">{link}</span>
                  <SmallButton ariaLabel="Copy patron link" onClick={() => { try { navigator.clipboard.writeText(link); } catch { /* ignore */ } setCopied(true); }} className="bg-[#F4F4F5] dark:bg-[#151515]">
                    {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />} {copied ? 'Copied' : 'Copy'}
                  </SmallButton>
                </div>
                <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">Sharing is mocked in this prototype.</p>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}

/** Extra section on the shared Settings page. */
export function SponsorSettingsSection({ user }) {
  const { state, sp } = useSponsor(user);
  const { dispatch } = useStore();
  if (!sp) return null;
  const Row = ({ on, label, sub, onClick }) => (
    <button type="button" onClick={onClick} aria-pressed={on} className="w-full flex items-center justify-between gap-4 text-left">
      <span><span className="block text-[15px] font-semibold">{label}</span><span className="block text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{sub}</span></span>
      <span className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#D4D4D8] dark:bg-[#3F3F46]'}`}>
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white dark:bg-[#0A0A0A] transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
    </button>
  );
  const upd = (patch) => dispatch('updateSponsor', { sponsorId: sp.id, patch });
  return (
    <section className="space-y-4">
      <h2 className="text-[18px] font-semibold">Sponsor preferences</h2>
      <div className="p-6 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-5">
        <Row on={sp.public} label="Show my name" sub={sel.sponsorVerified(sp) ? 'Students and impact pages show your display name.' : 'Takes effect after verification.'} onClick={() => upd({ public: !sp.public })} />
        <Row on={!!sp.commsConsent} label="Updates by SMS and email" sub="Receipts and certificates are always sent." onClick={() => upd({ commsConsent: !sp.commsConsent })} />
        <Row on={!!sp.leaderboardOptIn} label="Appear on the leaderboard" sub="Only if your name is public." onClick={() => upd({ leaderboardOptIn: !sp.leaderboardOptIn })} />
        <div className="pt-2 border-t border-[#ECECEE] dark:border-[#262626] text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
          {SPONSOR_TYPES[sp.type]} · PAN {sp.pan ? `XXXXX${sp.pan.slice(5, 9)}X` : 'not added'} · KYC {sp.kycStatus.replace('_', ' ')}
          {sp.kycSubmittedAt ? ` · documents submitted ${timeAgo(sp.kycSubmittedAt)}` : ''}
        </div>
      </div>
    </section>
  );
}
