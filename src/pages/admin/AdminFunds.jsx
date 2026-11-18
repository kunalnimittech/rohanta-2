import React, { useEffect, useState } from 'react';
import { Banknote, Landmark, Receipt as ReceiptIcon, ArrowRightLeft, Send, Eye } from 'lucide-react';
import { useStore } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR, formatDate } from '../../data/mockData';
import {
  PrimaryButton,
  SecondaryButton,
  StatusChip,
  BottomSheet,
  ConfirmSheet,
  DataTable,
  Segmented,
  Amount,
  FloatingTextarea,
  ReceiptCard,
  EmptyState,
  SectionLabel,
} from '../../components/ui';
import { Card, KV, PageHeader, SmallButton, DonationChip, RecoChip, useToast, CsvButton, downloadCSV } from './AdminShared';
import { OfflineDonationSheet } from './AdminSponsors';
import { ReceiptView } from '../shared/ReceiptView';

const targetName = (state, d) =>
  d.studentId
    ? sel.getStudent(state, d.studentId)?.fullName
    : d.cohortId
    ? state.cohorts.find((c) => c.id === d.cohortId)?.name
    : state.pools.find((p) => p.id === d.poolId)?.name || 'General pool';

function DonationsTab() {
  const { state, dispatch } = useStore();
  const [confirm, setConfirm] = useState(null);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const rows = state.donations.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return (
    <div className="space-y-4">
      <DataTable
        rows={rows}
        searchText={(r) => `${sel.getSponsor(state, r.sponsorId)?.displayName} ${r.paymentRef} ${targetName(state, r)}`}
        searchPlaceholder="Search donor, reference or target"
        filter={{ options: [{ value: 'success', label: 'Success' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'created', label: 'Created' }], getValue: (r) => r.status }}
        toolbar={
          <>
            <SecondaryButton onClick={() => setOfflineOpen(true)} className="h-11 px-5 text-[13px]"><Banknote className="w-4 h-4" strokeWidth={1.75} /> Offline</SecondaryButton>
            <CsvButton
              onClick={() =>
                downloadCSV('donations.csv', [
                  { label: 'Date', value: (r) => formatDate(r.createdAt) },
                  { label: 'Donor', value: (r) => sel.getSponsor(state, r.sponsorId)?.displayName },
                  { label: 'Target', value: (r) => targetName(state, r) },
                  { label: 'To students', key: 'amount' },
                  { label: 'Fee', key: 'fee' },
                  { label: 'Total', key: 'total' },
                  { label: 'Status', key: 'status' },
                  { label: 'Reference', key: 'paymentRef' },
                  { label: 'Receipt', key: 'receiptNo' },
                ], rows)
              }
            />
          </>
        }
        columns={[
          { key: 'createdAt', label: 'Date', width: 'minmax(0,0.8fr)', render: (r) => formatDate(r.createdAt) },
          { key: 'sponsor', label: 'Donor', width: 'minmax(0,1.2fr)', sortValue: (r) => sel.getSponsor(state, r.sponsorId)?.displayName, render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{sel.getSponsor(state, r.sponsorId)?.displayName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] truncate">{r.offline ? r.offlineMode : r.sip ? 'SIP' : 'Online'} · {r.paymentRef}</div></div> },
          { key: 'target', label: 'Target', width: 'minmax(0,1.2fr)', sortValue: (r) => targetName(state, r), render: (r) => <span className="truncate block">{targetName(state, r)}</span> },
          { key: 'total', label: 'Total', align: 'right', render: (r) => <div><div className="font-semibold">{formatINR(r.total)}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{formatINR(r.amount)} + {formatINR(r.fee)}</div></div> },
          { key: 'status', label: 'Status', render: (r) => (
            <div className="flex flex-wrap items-center gap-2">
              <DonationChip status={r.status} />
              {r.offline && r.status === 'pending' && (
                <SmallButton primary onClick={(e) => { e.stopPropagation(); setConfirm(r); }}>Confirm received</SmallButton>
              )}
              {!r.offline && r.status === 'pending' && state.settings.demoMode && (
                <SmallButton onClick={(e) => { e.stopPropagation(); dispatch('gatewayWebhookSuccess', { donationId: r.id }); toast('Webhook received (demo)'); }}>Simulate webhook</SmallButton>
              )}
            </div>
          ) },
        ]}
      />
      <ConfirmSheet
        open={!!confirm}
        title="Confirm money received?"
        body={confirm ? `${formatINR(confirm.total)} by ${confirm.offlineMode} (${confirm.paymentRef}) from ${sel.getSponsor(state, confirm.sponsorId)?.displayName}. This allocates the money, issues the 80G receipt and adds a reconciliation row.` : ''}
        confirmLabel="Confirm received"
        onClose={() => setConfirm(null)}
        onConfirm={() => { dispatch('confirmOfflineDonation', { donationId: confirm.id }); setConfirm(null); toast('Confirmed. Receipt issued.'); }}
      />
      <OfflineDonationSheet open={offlineOpen} onClose={() => setOfflineOpen(false)} onSaved={toast} />
      {toastEl}
    </div>
  );
}

function ReconciliationTab() {
  const { state, dispatch } = useStore();
  const [match, setMatch] = useState(null);
  const [bank, setBank] = useState('');
  const [note, setNote] = useState('');
  const [resolve, setResolve] = useState(null);
  const [toastEl, toast] = useToast();
  const rows = state.reconciliation
    .map((r) => ({ ...r, d: state.donations.find((x) => x.id === r.donationId) }))
    .filter((r) => r.d)
    .sort((a, b) => ({ mismatch: 0, pending: 1 }[a.state] ?? 2) - ({ mismatch: 0, pending: 1 }[b.state] ?? 2) || (a.d.createdAt < b.d.createdAt ? 1 : -1));
  const differs = match && Number(bank) !== match.gatewayAmount;

  return (
    <div className="space-y-4">
      <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
        Compare the gateway settlement report with the bank statement. A match confirms the allocation; students see the money as received. A mismatch holds it; students see “Confirming”.
      </p>
      <DataTable
        rows={rows}
        initialFilter="All"
        searchText={(r) => `${sel.getSponsor(state, r.d.sponsorId)?.displayName} ${r.d.paymentRef}`}
        filter={{ options: [{ value: 'pending', label: 'To match' }, { value: 'mismatch', label: 'Mismatch' }, { value: 'matched', label: 'Matched' }, { value: 'resolved', label: 'Resolved' }], getValue: (r) => r.state }}
        columns={[
          { key: 'date', label: 'Date', width: 'minmax(0,0.8fr)', sortValue: (r) => r.d.createdAt, render: (r) => formatDate(r.d.createdAt) },
          { key: 'donor', label: 'Donor', width: 'minmax(0,1.3fr)', sortValue: (r) => sel.getSponsor(state, r.d.sponsorId)?.displayName, render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{sel.getSponsor(state, r.d.sponsorId)?.displayName}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA] truncate">{r.d.paymentRef}</div></div> },
          { key: 'gatewayAmount', label: 'Gateway', align: 'right', render: (r) => formatINR(r.gatewayAmount) },
          { key: 'bankAmount', label: 'Bank', align: 'right', render: (r) => (r.bankAmount == null ? '—' : formatINR(r.bankAmount)) },
          { key: 'state', label: 'State', width: 'minmax(0,1.4fr)', render: (r) => (
            <div className="flex flex-wrap items-center gap-2">
              <RecoChip state={r.state} />
              {r.state === 'pending' && <SmallButton primary onClick={() => { setMatch(r); setBank(r.gatewayAmount); setNote(''); }}>Check</SmallButton>}
              {r.state === 'mismatch' && <SmallButton onClick={() => { setResolve(r); }}>Resolve</SmallButton>}
            </div>
          ) },
        ]}
        empty={{ title: 'Nothing to reconcile', body: 'Successful payments appear here for a bank match.' }}
      />
      {rows.filter((r) => r.note).length > 0 && (
        <Card className="space-y-2">
          <SectionLabel>Notes</SectionLabel>
          {rows.filter((r) => r.note).map((r) => <KV key={r.id} label={`${sel.getSponsor(state, r.d.sponsorId)?.displayName} · ${formatDate(r.d.createdAt)}`} value={r.note} />)}
        </Card>
      )}

      <BottomSheet open={!!match} onClose={() => setMatch(null)} title="Match with bank statement">
        {match && (
          <div className="space-y-4">
            <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] space-y-1">
              <KV label="Donor" value={sel.getSponsor(state, match.d.sponsorId)?.displayName} />
              <KV label="Reference" value={match.d.paymentRef} />
              <KV label="Gateway report" value={formatINR(match.gatewayAmount)} strong />
            </div>
            <Amount label="Amount on bank statement (₹)" value={bank} onChange={setBank} />
            {differs && (
              <FloatingTextarea label="Mismatch note (required)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxWords={60} />
            )}
            <PrimaryButton
              disabled={bank === '' || (differs && note.trim().length < 3)}
              onClick={() => {
                dispatch('reconcileDonation', { donationId: match.donationId, state: differs ? 'mismatch' : 'matched', bankAmount: Number(bank), note: differs ? note.trim() : '' });
                setMatch(null);
                toast(differs ? 'Held as mismatch. Admin notified.' : 'Matched. Allocation confirmed.');
              }}
              className="w-full"
            >
              {differs ? 'Hold as mismatch' : 'Amounts match. Confirm.'}
            </PrimaryButton>
          </div>
        )}
      </BottomSheet>
      <ConfirmSheet
        open={!!resolve}
        title="Resolve mismatch"
        body={resolve ? `Gateway ${formatINR(resolve.gatewayAmount)}, bank ${formatINR(resolve.bankAmount)}. Resolving confirms the allocation.` : ''}
        confirmLabel="Resolve and confirm"
        reasonRequired
        reasonLabel="How was it resolved?"
        onClose={() => setResolve(null)}
        onConfirm={(n) => { dispatch('reconcileDonation', { donationId: resolve.donationId, state: 'resolved', bankAmount: resolve.gatewayAmount, note: n }); setResolve(null); toast('Resolved. Allocation confirmed.'); }}
      />
      {toastEl}
    </div>
  );
}

function LedgerTab() {
  const { state } = useStore();
  const t = sel.ledgerTotals(state);
  const studentIds = [...new Set(state.allocations.filter((a) => a.targetType === 'student').map((a) => a.targetId))];
  const studentRows = studentIds
    .map((id) => ({ id, name: sel.getStudent(state, id)?.fullName, status: sel.getStudent(state, id)?.status, allocated: sel.studentAllocated(state, id), balance: sel.studentBalance(state, id) }))
    .sort((a, b) => b.balance - a.balance);
  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[15px] font-semibold">Invariant</div>
          <StatusChip status={t.balanced ? 'verified' : 'rejected'} label={t.balanced ? 'Total of balances = trust bank balance' : 'Out of balance'} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <SectionLabel className="mb-1">Balances</SectionLabel>
            <KV label="Students (allocated, not yet paid)" value={formatINR(t.students)} />
            <KV label="Cohorts" value={formatINR(t.cohorts)} />
            <KV label="Pools (general + constituency)" value={formatINR(t.pools)} />
            <KV label="Operations (10% fee)" value={formatINR(t.operations)} />
            <KV label="Total of balances" value={formatINR(t.balances)} strong />
          </div>
          <div className="space-y-1">
            <SectionLabel className="mb-1">Trust bank account</SectionLabel>
            <KV label="Money in (successful donations)" value={formatINR(t.moneyIn)} />
            <KV label="Paid to institutes" value={`− ${formatINR(t.paidOut)}`} />
            <KV label="Moved to operating account" value={`− ${formatINR(t.opsOut)}`} />
            <KV label="Trust bank balance" value={formatINR(t.bank)} strong />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Pools</SectionLabel>
          {state.pools.map((p) => <KV key={p.id} label={p.name} value={formatINR(sel.poolBalance(state, p.id))} />)}
        </Card>
        <Card className="space-y-1">
          <SectionLabel className="mb-2">Cohorts</SectionLabel>
          {state.cohorts.map((c) => <KV key={c.id} label={`${c.name} (${formatINR(c.target)} target)`} value={formatINR(sel.cohortBalance(state, c.id))} />)}
        </Card>
      </div>
      <DataTable
        rows={studentRows}
        searchText={(r) => r.name || ''}
        searchPlaceholder="Search student balances"
        columns={[
          { key: 'name', label: 'Student', width: 'minmax(0,1.5fr)', render: (r) => <div className="min-w-0"><div className="font-semibold truncate">{r.name}</div><div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">{r.status}</div></div> },
          { key: 'allocated', label: 'Allocated', align: 'right', render: (r) => formatINR(r.allocated) },
          { key: 'paid', label: 'Paid out', align: 'right', sortValue: (r) => r.allocated - r.balance, render: (r) => formatINR(r.allocated - r.balance) },
          { key: 'balance', label: 'Balance', align: 'right', render: (r) => <span className="font-semibold">{formatINR(r.balance)}</span> },
        ]}
      />
    </div>
  );
}

function TopUpTab() {
  const { state, dispatch } = useStore();
  const [poolId, setPoolId] = useState('general');
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [toastEl, toast] = useToast();
  const candidates = state.students.filter((s) => ['Listed', 'Partially funded'].includes(s.status) && sel.studentRemainingNeed(state, s.id) > 0);
  const pool = sel.poolBalance(state, poolId);
  const remaining = studentId ? sel.studentRemainingNeed(state, studentId) : 0;
  const max = Math.min(pool, remaining);
  const recent = state.allocations.filter((a) => a.fromPool).slice(-5).reverse();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <Card className="lg:col-span-3 space-y-4 [&_select]:bg-white dark:[&_select]:bg-[#222224] [&_input]:bg-white dark:[&_input]:bg-[#222224] [&_textarea]:bg-white dark:[&_textarea]:bg-[#222224]">
        <div className="text-[15px] font-semibold">Move pool money to a partly funded student</div>
        <label className="relative block">
          <select value={poolId} onChange={(e) => setPoolId(e.target.value)} aria-label="From pool" className="w-full h-14 px-6 pt-4 pb-1 rounded-full text-[15px] outline-none appearance-none">
            {state.pools.map((p) => <option key={p.id} value={p.id}>{p.name} · {formatINR(sel.poolBalance(state, p.id))}</option>)}
          </select>
          <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">From pool</span>
        </label>
        <label className="relative block">
          <select value={studentId} onChange={(e) => { setStudentId(e.target.value); setAmount(''); }} aria-label="To student" className="w-full h-14 px-6 pt-4 pb-1 rounded-full text-[15px] outline-none appearance-none">
            <option value="">Choose a student</option>
            {candidates.map((s) => <option key={s.id} value={s.id}>{s.fullName} · {s.district} · needs {formatINR(sel.studentRemainingNeed(state, s.id))}</option>)}
          </select>
          <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">To student</span>
        </label>
        <Amount value={amount} onChange={setAmount} max={studentId ? max : undefined} helper={studentId ? `Up to ${formatINR(max)} (pool and remaining need)` : 'Choose a student first'} disabled={!studentId} />
        <FloatingTextarea label="Reason (audit log)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} maxWords={50} />
        <PrimaryButton
          disabled={!studentId || !amount || amount > max || reason.trim().length < 3}
          onClick={() => {
            dispatch('allocateDonation', { poolId, studentId, amount, reason: reason.trim() });
            toast(`${formatINR(amount)} moved to ${sel.getStudent(state, studentId)?.fullName}`);
            setAmount('');
            setReason('');
          }}
        >
          <ArrowRightLeft className="w-4 h-4" strokeWidth={1.75} /> Move money
        </PrimaryButton>
      </Card>
      <Card className="lg:col-span-2 space-y-2">
        <SectionLabel className="mb-1">Recent top-ups</SectionLabel>
        {recent.length === 0 && <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">None yet.</p>}
        {recent.map((a) => <KV key={a.id} label={`${sel.getStudent(state, a.targetId)?.fullName} · ${formatDate(a.createdAt)}`} value={formatINR(a.amount)} />)}
      </Card>
      {toastEl}
    </div>
  );
}

function ReceiptsTab() {
  const { state, dispatch } = useStore();
  const [view, setView] = useState(null);
  const [toastEl, toast] = useToast();
  const rows = state.receipts
    .map((r) => ({ ...r, d: state.donations.find((x) => x.id === r.donationId) }))
    .filter((r) => r.d)
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1));
  return (
    <div className="space-y-4">
      <DataTable
        rows={rows}
        searchText={(r) => `${r.number} ${sel.getSponsor(state, r.d.sponsorId)?.displayName}`}
        searchPlaceholder="Search receipt or donor"
        columns={[
          { key: 'number', label: 'Receipt', width: 'minmax(0,1.3fr)', render: (r) => <span className="font-semibold">{r.number}</span> },
          { key: 'donor', label: 'Donor', sortValue: (r) => sel.getSponsor(state, r.d.sponsorId)?.displayName, render: (r) => sel.getSponsor(state, r.d.sponsorId)?.displayName },
          { key: 'issuedAt', label: 'Date', render: (r) => formatDate(r.issuedAt) },
          { key: 'amount', label: 'Amount', align: 'right', render: (r) => formatINR(r.amount) },
          { key: 'actions', label: '', sortable: false, width: 'minmax(0,1.2fr)', render: (r) => (
            <div className="flex gap-2 justify-end">
              <SmallButton ariaLabel={`View receipt ${r.number}`} onClick={() => setView(r)}><Eye className="w-3.5 h-3.5" strokeWidth={1.75} /> View</SmallButton>
              <SmallButton ariaLabel={`Resend receipt ${r.number}`} onClick={() => { dispatch('resendReceipt', { receiptId: r.id }); toast('Receipt sent again'); }}><Send className="w-3.5 h-3.5" strokeWidth={1.75} /> Resend</SmallButton>
            </div>
          ) },
        ]}
        empty={{ icon: ReceiptIcon, title: 'No receipts yet' }}
      />
      <BottomSheet open={!!view} onClose={() => setView(null)} title="80G receipt">
        {view && <ReceiptView receipt={view} />}
      </BottomSheet>
      {toastEl}
    </div>
  );
}

function OperationsTab() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);
  const [toastEl, toast] = useToast();
  const bal = sel.operationsBalance(state);
  const collected = state.allocations.filter((a) => a.targetType === 'operations').reduce((s, a) => s + a.amount, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Fees collected</div><div className="text-[28px] font-bold mt-1">{formatINR(collected)}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Moved to operating account</div><div className="text-[28px] font-bold mt-1">{formatINR(collected - bal)}</div></Card>
        <Card><div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Held in trust account</div><div className="text-[28px] font-bold mt-1">{formatINR(bal)}</div></Card>
      </div>
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold">Monthly transfer to the operating account</div>
          <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">Only the 10% platform fee moves. Student and pool money never does. Mock transfer in this prototype.</div>
        </div>
        <PrimaryButton disabled={bal <= 0} onClick={() => setOpen(true)} className="h-12 px-6 text-[14px] shrink-0">
          <Landmark className="w-4 h-4" strokeWidth={1.75} /> Transfer {formatINR(bal)}
        </PrimaryButton>
      </Card>
      <Card className="space-y-1">
        <SectionLabel className="mb-2">Transfer history</SectionLabel>
        {state.opsTransfers.length === 0 && <p className="text-[14px] text-[#52525B] dark:text-[#A1A1AA]">No transfers yet.</p>}
        {state.opsTransfers.slice().reverse().map((t) => <KV key={t.id} label={`${formatDate(t.at)} · ${t.note}`} value={formatINR(t.amount)} />)}
      </Card>
      <ConfirmSheet
        open={open}
        title={`Transfer ${formatINR(bal)}?`}
        body="Moves the collected platform fee from the trust account to the operating account and writes an audit entry."
        confirmLabel="Transfer"
        onClose={() => setOpen(false)}
        onConfirm={() => { setOpen(false); dispatch('transferOperations', { amount: bal, note: `Fees to ${formatDate(new Date().toISOString())}` }); toast('Transferred to operating account'); }}
      />
      {toastEl}
    </div>
  );
}

export function AdminFunds({ params = {}, title = 'Funds', sub = 'Donations, bank reconciliation, the ledger and receipts.', tabs }) {
  const all = [
    { value: 'donations', label: 'Donations' },
    { value: 'reconciliation', label: 'Reconciliation' },
    { value: 'ledger', label: 'Ledger' },
    { value: 'topup', label: 'Pool top-up' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'operations', label: 'Operations' },
  ];
  const shown = tabs ? all.filter((t) => tabs.includes(t.value)) : all;
  const [tab, setTab] = useState(params.tab || shown[0].value);
  useEffect(() => { if (params.tab) setTab(params.tab); }, [params]);
  const { state } = useStore();
  const c = sel.pendingCountsForAdmin(state);
  const opts = shown.map((t) => ({ ...t, count: t.value === 'reconciliation' ? c.mismatches + c.reconPending || undefined : undefined }));
  return (
    <div className="space-y-8 pb-12">
      <PageHeader title={title} sub={sub} />
      {opts.length > 1 && <Segmented value={tab} onChange={setTab} options={opts} />}
      {tab === 'donations' && <DonationsTab />}
      {tab === 'reconciliation' && <ReconciliationTab />}
      {tab === 'ledger' && <LedgerTab />}
      {tab === 'topup' && <TopUpTab />}
      {tab === 'receipts' && <ReceiptsTab />}
      {tab === 'operations' && <OperationsTab />}
    </div>
  );
}
