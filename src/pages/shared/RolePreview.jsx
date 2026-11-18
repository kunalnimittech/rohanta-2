// Foundation overview for each non-student role (Part 1). The full role
// dashboards replace these screens in Parts 3–9; until then every role lands
// on a real, store-driven overview so the demo switcher has somewhere to go.
import React from 'react';
import {
  Inbox,
  ClipboardCheck,
  IndianRupee,
  Users,
  ShieldCheck,
  Landmark,
  HeartHandshake,
  Hammer,
  Wallet,
  Scale,
  Receipt,
  GraduationCap,
} from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { STATUS_STEPS, formatINR, formatDate, firstNameInitial, timeAgo } from '../../data/mockData';
import {
  StatTile,
  StatusTracker,
  ProgressBar,
  StatusChip,
  EmptyState,
  Timeline,
  Donut,
  LineChart,
  ChartLegend,
  SectionLabel,
  compactINR,
} from '../../components/ui';

const PART_FOR = { guardian: 3, admin: 4, verifier: 5, sponsor: 6, trustee: 8, finance: 8, institute: 9 };

function Header({ title, sub }) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-[32px] md:text-[44px] font-semibold tracking-[-0.03em]">{title}</h1>
      {sub && <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">{sub}</p>}
    </div>
  );
}

function LedgerCheck({ state }) {
  const t = sel.ledgerTotals(state);
  return (
    <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[15px] font-semibold">Ledger</div>
        <StatusChip status={t.balanced ? 'verified' : 'rejected'} label={t.balanced ? 'Balances = bank balance' : 'Ledger out of balance'} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-[13px]">
        {[
          ['Students', t.students],
          ['Cohorts', t.cohorts],
          ['Pools', t.pools],
          ['Operations', t.operations],
          ['Trust bank', t.bank],
        ].map(([k, v]) => (
          <div key={k}>
            <div className="text-[#52525B] dark:text-[#A1A1AA]">{k}</div>
            <div className="font-semibold text-[15px] mt-0.5">{formatINR(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundsChart({ state }) {
  const months = sel.fundsByMonth(state, 6);
  return (
    <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[15px] font-semibold">Funds in vs out</div>
        <ChartLegend items={[{ label: 'In' }, { label: 'Paid to institutes', dashed: true, secondary: true }]} />
      </div>
      <LineChart
        labels={months.map((m) => m.label)}
        series={[
          { name: 'In', values: months.map((m) => m.in) },
          { name: 'Out', values: months.map((m) => m.out), dashed: true, secondary: true },
        ]}
        ariaLabel="Funds in versus paid out, last six months"
      />
      <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
        Peak month in: {compactINR(Math.max(...months.map((m) => m.in)))}
      </div>
    </div>
  );
}

function AuditTimeline({ state, limit = 6 }) {
  const items = state.auditLog.slice(0, limit).map((a) => ({
    id: a.id,
    title: a.action,
    detail: `${sel.getUser(state, a.actorId)?.name || 'System'} · ${a.entity} ${a.entityId}`,
    time: timeAgo(a.at),
  }));
  return (
    <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
      <div className="text-[15px] font-semibold">Latest activity</div>
      <Timeline items={items} />
    </div>
  );
}

function AdminOverview({ state, user }) {
  const c = sel.pendingCountsForAdmin(state);
  const stages = sel.studentsByStage(state);
  const segments = [...STATUS_STEPS, 'Rejected', 'Info requested', 'Dropped']
    .filter((st) => stages[st])
    .map((st) => ({ label: st, value: stages[st] }));
  return (
    <div className="space-y-8 pb-12">
      <Header title={`Hello, ${user.name.split(' ')[0]}`} sub="Here is what needs your attention today." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="Unassigned applications" value={c.unassigned} icon={Inbox} />
        <StatTile label="Overdue verifier tasks" value={c.overdue} icon={ClipboardCheck} />
        <StatTile label="Extras to review" value={c.extras} icon={Scale} />
        <StatTile label="Sponsor KYC pending" value={c.sponsorKyc} icon={ShieldCheck} />
        <StatTile label="Reconciliation mismatches" value={c.mismatches} icon={Receipt} />
        <StatTile label="Payouts awaiting trustee" value={c.payoutsAwaitingTrustee} icon={Wallet} />
        <StatTile label="General pool" value={compactINR(sel.poolBalance(state, 'general'))} hint={formatINR(sel.poolBalance(state, 'general'))} icon={Landmark} />
        <StatTile label="Operations" value={compactINR(sel.operationsBalance(state))} hint="10% platform fee held" icon={IndianRupee} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-6 md:p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] space-y-4">
          <div className="text-[15px] font-semibold">Students by stage</div>
          <Donut segments={segments} label={String(state.students.length)} sublabel="students" />
        </div>
        <FundsChart state={state} />
      </div>
      <LedgerCheck state={state} />
      <AuditTimeline state={state} />
    </div>
  );
}

function GuardianOverview({ state, user }) {
  const g = state.guardians.find((x) => x.userId === user.id);
  const st = g && sel.getStudent(state, g.studentId);
  if (!st) return <EmptyState title="No linked student" body="Your consent link connects you to your child's application." />;
  const t = sel.studentPackageTotals(state, st.id);
  return (
    <div className="space-y-8 pb-12">
      <Header title={`Hello, ${user.name.split(' ')[0]}`} sub={`${st.fullName.split(' ')[0]}'s application · ID ${st.id}`} />
      <StatusTracker currentStepIndex={sel.studentStatusIndex(state, st.id)} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatTile label="Package total" value={formatINR(t.total)} hint={`${formatINR(t.monthlyNeed)} a month`} icon={GraduationCap} />
        <StatTile label="Funded" value={`${sel.studentFundingPercent(state, st.id)}%`} icon={HeartHandshake}>
          <div className="mt-3">
            <ProgressBar percent={sel.studentFundingPercent(state, st.id)} />
          </div>
        </StatTile>
        <StatTile label="Your consent" value={g.consentState === 'approved' ? 'Given' : g.consentState === 'pending' ? 'Pending' : g.consentState} icon={ShieldCheck} />
      </div>
    </div>
  );
}

function VerifierOverview({ state, user }) {
  const mine = state.reviews.filter((r) => r.verifierId === user.id);
  const open = mine.filter((r) => !r.recommendation);
  const overdue = open.filter((r) => r.slaDueAt && new Date(r.slaDueAt) < new Date());
  return (
    <div className="space-y-8 pb-12">
      <Header title={`Hello, ${user.name.split(' ')[0]}`} sub={`Districts: ${(user.districts || []).join(', ')}`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="Open tasks" value={open.length} icon={ClipboardCheck} />
        <StatTile label="Overdue" value={overdue.length} icon={Inbox} />
        <StatTile label="Completed" value={mine.length - open.length} icon={ShieldCheck} />
        <StatTile label="SLA" value={`${state.settings.verifierSlaDays} days`} icon={Hammer} />
      </div>
      <div className="space-y-3">
        <SectionLabel>Open tasks</SectionLabel>
        {open.length === 0 ? (
          <EmptyState title="No open tasks" body="New assignments from the admin appear here." />
        ) : (
          open.map((r) => {
            const st = sel.getStudent(state, r.studentId);
            return (
              <div key={r.id} className="p-5 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold">{firstNameInitial(st.fullName)}</div>
                  <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                    {st.district} · {st.exam} · due {formatDate(r.slaDueAt)}
                  </div>
                </div>
                <StatusChip status={overdue.includes(r) ? 'rejected' : 'pending'} label={overdue.includes(r) ? 'Overdue' : 'Open'} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SponsorOverview({ state, user }) {
  const sp = sel.getSponsorByUser(state, user.id);
  if (!sp) return <EmptyState title="Sponsor profile not found" />;
  const t = sel.sponsorTotals(state, sp.id);
  const impact = sel.donorImpactScore(state, sp.id);
  const utilPct = t.toStudents ? Math.round((t.utilised / t.toStudents) * 100) : 0;
  return (
    <div className="space-y-8 pb-12">
      <Header title={`Hello, ${sp.displayName}`} sub={sp.kycStatus === 'pending' ? 'Verification pending. Admin verifies organisations within 48 hours.' : null} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="md:col-span-2 md:row-span-2 p-7 rounded-[28px] bg-[#F4F4F5] dark:bg-[#151515] flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Total given</div>
            <div className="mt-4 text-[44px] md:text-[52px] leading-none font-bold tracking-[-0.035em]">{formatINR(t.given)}</div>
            <div className="mt-2 text-[15px] text-[#52525B] dark:text-[#A1A1AA]">{formatINR(t.toStudents)} to students and pools</div>
          </div>
          <div className="space-y-3 mt-8">
            <div className="flex justify-between text-[13px] font-semibold">
              <span>{utilPct}% utilised</span>
              <span>{formatINR(t.held)} held in trust</span>
            </div>
            <ProgressBar percent={utilPct} />
          </div>
        </div>
        <StatTile className="md:col-span-2" label="Students supported" value={t.studentsSupported} icon={GraduationCap} />
        <StatTile className="md:col-span-2" label="Impact score" value={impact.score} hint={impact.level} icon={HeartHandshake} />
      </div>
    </div>
  );
}

function TrusteeOverview({ state, user }) {
  const pending = state.disbursements.filter((d) => d.status === 'pending_trustee');
  return (
    <div className="space-y-8 pb-12">
      <Header title={`Hello, ${user.name.replace(/^Dr\.\s*/, '').split(' ')[0]}`} sub="Every payout to an institute needs a trustee's approval." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <StatTile label="Awaiting approval" value={pending.length} icon={Wallet} />
        <StatTile label="Amount awaiting" value={compactINR(pending.reduce((s, d) => s + d.amount, 0))} icon={IndianRupee} />
        <StatTile label="Trust bank balance" value={compactINR(sel.ledgerTotals(state).bank)} icon={Landmark} />
      </div>
      <LedgerCheck state={state} />
    </div>
  );
}

function FinanceOverview({ state, user }) {
  const c = sel.pendingCountsForAdmin(state);
  return (
    <div className="space-y-8 pb-12">
      <Header title={`Hello, ${user.name.split(' ')[0]}`} sub="Reconcile donations, prepare payouts, enter UTRs." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="To reconcile" value={c.reconPending} icon={Receipt} />
        <StatTile label="Mismatches" value={c.mismatches} icon={Scale} />
        <StatTile label="Awaiting trustee" value={c.payoutsAwaitingTrustee} icon={Wallet} />
        <StatTile label="Approved, to pay" value={state.disbursements.filter((d) => d.status === 'approved').length} icon={IndianRupee} />
      </div>
      <LedgerCheck state={state} />
      <FundsChart state={state} />
    </div>
  );
}

function InstituteOverview({ state, user }) {
  const inst = sel.getInstitute(state, user.orgId);
  const students = state.students.filter((s) => s.instituteId === user.orgId && ['Fully funded', 'Enrolled', 'Partially funded'].includes(s.status));
  const ds = state.disbursements.filter((d) => d.instituteId === user.orgId);
  return (
    <div className="space-y-8 pb-12">
      <Header title={inst?.name || user.name} sub={`${inst?.city} · ${inst?.approvalStatus === 'approved' ? 'Approved partner' : 'Approval pending'}`} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <StatTile label="Funded students" value={students.length} icon={Users} />
        <StatTile label="Invoices in progress" value={ds.filter((d) => ['draft', 'pending_trustee', 'approved'].includes(d.status)).length} icon={Receipt} />
        <StatTile label="Received" value={compactINR(ds.filter((d) => ['paid', 'confirmed'].includes(d.status)).reduce((s, d) => s + d.amount, 0))} icon={IndianRupee} />
      </div>
    </div>
  );
}

const OVERVIEWS = {
  admin: AdminOverview,
  guardian: GuardianOverview,
  verifier: VerifierOverview,
  sponsor: SponsorOverview,
  trustee: TrusteeOverview,
  finance: FinanceOverview,
  institute: InstituteOverview,
};

export function RolePreviewPage({ role, user, navItem, isHome }) {
  const { state } = useStore();
  if (isHome) {
    const Comp = OVERVIEWS[role];
    return <Comp state={state} user={user} />;
  }
  return (
    <div className="space-y-8 pb-12">
      <Header title={navItem.label} />
      <EmptyState
        icon={navItem.icon}
        title="Coming in the next build step"
        body={`The ${navItem.label.toLowerCase()} screen for this role is built in Part ${PART_FOR[role]}. The data behind it is already in the store.`}
      />
    </div>
  );
}
