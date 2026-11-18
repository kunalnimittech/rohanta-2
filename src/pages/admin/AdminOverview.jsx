import React from 'react';
import {
  Inbox,
  ClipboardCheck,
  Scale,
  ShieldCheck,
  Receipt,
  Wallet,
  MessageSquareHeart,
  Landmark,
  IndianRupee,
  Repeat,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, timeAgo } from '../../data/mockData';
import { StatTile, Donut, LineChart, ChartLegend, Timeline, StatusChip, compactINR, SectionLabel } from '../../components/ui';
import { Card, PageHeader, STAGES } from './AdminShared';

export function donorStats(state) {
  const ok = state.donations.filter((d) => d.status === 'success');
  const bySponsor = {};
  ok.forEach((d) => {
    (bySponsor[d.sponsorId] = bySponsor[d.sponsorId] || new Set()).add(d.createdAt.slice(0, 7));
  });
  const donors = Object.keys(bySponsor).length;
  const repeat = Object.values(bySponsor).filter((m) => m.size > 1).length;
  const sipFailures = state.donations.filter((d) => d.sip && d.status === 'failed').length;
  const sipActive = state.sponsors.filter((s) => s.sip && s.sip.status === 'active').length;
  return { donors, repeat, retention: donors ? Math.round((repeat / donors) * 100) : 0, sipFailures, sipActive };
}

export function AdminOverview({ user, onNavigate }) {
  const { state } = useStore();
  const c = sel.pendingCountsForAdmin(state);
  const stages = sel.studentsByStage(state);
  const segments = STAGES.filter((st) => stages[st]).map((st) => ({ label: st, value: stages[st] }));
  const months = sel.fundsByMonth(state, 6);
  const t = sel.ledgerTotals(state);
  const ds = donorStats(state);
  const openChanges = state.changeRequests.filter((r) => r.state === 'open').length + state.instituteRequests.filter((r) => r.state === 'open').length;

  const attention = [
    { label: 'Unassigned applications', value: c.unassigned, icon: Inbox, go: () => onNavigate('applications', { filter: 'unassigned' }) },
    { label: 'Overdue verifier tasks', value: c.overdue, icon: ClipboardCheck, go: () => onNavigate('applications', { filter: 'overdue' }) },
    { label: 'Ready for your decision', value: c.awaitingDecision, icon: ShieldCheck, go: () => onNavigate('applications', { filter: 'decision' }) },
    { label: 'Extras to review', value: c.extras, icon: Scale, go: () => onNavigate('applications', { filter: 'extras' }) },
    { label: 'Sponsor KYC pending', value: c.sponsorKyc, icon: ShieldCheck, go: () => onNavigate('sponsors', { filter: 'pending' }) },
    { label: 'Reconciliation mismatches', value: c.mismatches, icon: Receipt, go: () => onNavigate('funds', { tab: 'reconciliation' }) },
    { label: 'Payouts awaiting trustee', value: c.payoutsAwaitingTrustee, icon: Wallet, go: () => onNavigate('payouts') },
    { label: 'Thank-you notes to moderate', value: c.thankYouNotes, icon: MessageSquareHeart, go: () => onNavigate('moderation') },
    { label: 'Requests from students', value: openChanges, icon: Building2, go: () => onNavigate('moderation', { tab: 'requests' }) },
    { label: 'Institutes to approve', value: c.instituteApprovals, icon: Building2, go: () => onNavigate('institutes') },
  ];

  const activity = state.auditLog.slice(0, 7).map((a) => ({
    id: a.id,
    title: a.action,
    detail: `${sel.getUser(state, a.actorId)?.name || (a.actorId === 'gateway' ? 'Payment gateway' : 'System')} · ${a.entity}`,
    time: timeAgo(a.at),
  }));

  return (
    <div className="space-y-8 pb-12">
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} sub="Here is what needs your attention today." />

      <section className="space-y-4">
        <SectionLabel>Needs attention</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {attention.map((a) => (
            <StatTile key={a.label} label={a.label} value={a.value} icon={a.icon} onClick={a.go} className={a.value ? '' : 'opacity-70'} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[15px] font-semibold">Students by stage</div>
            <button type="button" onClick={() => onNavigate('applications')} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]">
              All applications <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
          <Donut segments={segments} label={String(state.students.length)} sublabel="students" />
        </Card>
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[15px] font-semibold">Funds in vs out · 6 months</div>
            <ChartLegend items={[{ label: 'In' }, { label: 'Paid to institutes', dashed: true, secondary: true }]} />
          </div>
          <LineChart
            labels={months.map((m) => m.label)}
            series={[
              { name: 'In', values: months.map((m) => m.in) },
              { name: 'Paid out', values: months.map((m) => m.out), dashed: true, secondary: true },
            ]}
            ariaLabel="Funds in versus paid out for the last six months"
          />
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatTile label="General pool" value={compactINR(sel.poolBalance(state, 'general'))} hint={formatINR(sel.poolBalance(state, 'general'))} icon={Landmark} onClick={() => onNavigate('funds', { tab: 'ledger' })} />
        <StatTile label="Operations (10% fee)" value={compactINR(sel.operationsBalance(state))} hint={formatINR(sel.operationsBalance(state))} icon={IndianRupee} onClick={() => onNavigate('funds', { tab: 'ledger' })} />
        <StatTile label="Donor retention" value={`${ds.retention}%`} hint={`${ds.repeat} of ${ds.donors} donors gave again`} icon={Repeat} />
        <StatTile label="SIP failures" value={ds.sipFailures} hint={`${ds.sipActive} active SIP${ds.sipActive === 1 ? '' : 's'}`} icon={Repeat} onClick={() => onNavigate('funds', { tab: 'donations' })} />
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold">Ledger check</div>
          <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            Balances {formatINR(t.balances)} · Trust bank {formatINR(t.bank)}
          </div>
        </div>
        <StatusChip status={t.balanced ? 'verified' : 'rejected'} label={t.balanced ? 'Total of balances = trust bank balance' : 'Out of balance'} />
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[15px] font-semibold">Latest activity</div>
          <button type="button" onClick={() => onNavigate('audit')} className="inline-flex items-center gap-1 text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]">
            Audit log <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <Timeline items={activity} />
      </Card>
    </div>
  );
}
