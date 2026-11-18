import React, { useState } from 'react';
import { Plus, Package, Lock, Globe } from 'lucide-react';
import { useStore, uid } from '../../store/StoreProvider';
import * as sel from '../../store/selectors';
import { formatINR } from '../../data/mockData';
import { calcCheckout } from '../../store/ledger';
import { PrimaryButton, StatusChip, BottomSheet, Segmented, FloatingInput, FloatingSelect, Amount, SectionLabel, EmptyState } from '../../components/ui';
import { PageHeader, SmallButton, KV, useToast } from './AdminShared';

const TYPES = [
  ['SPONSOR_STUDENT', 'Sponsor a student'],
  ['PARTIAL', 'Partial support'],
  ['SIP', 'Monthly SIP'],
  ['CONSTITUENCY', 'Constituency fund'],
  ['COHORT', 'Cohort / CSR'],
];
const RULES = [
  ['FULL_REMAINING_NEED', 'Full remaining need'],
  ['MIN_AMOUNT', 'Any amount above a minimum'],
  ['FIXED', 'Fixed amount'],
  ['MONTHLY_FIXED', 'Fixed monthly amount'],
];
const TARGETS = [
  ['SPECIFIC_STUDENT', 'A specific student'],
  ['COHORT', 'A cohort'],
  ['CONSTITUENCY_POOL', 'Constituency pool'],
  ['GENERAL_POOL', 'General pool'],
];
const DONORS = [
  ['individual', 'Individual'],
  ['corporate', 'Corporate'],
  ['ngo', 'NGO / Trust'],
  ['mp_mla', 'MP / MLA'],
];
const CERTS = [
  ['sponsorship', 'Sponsorship certificate'],
  ['utilisation', 'Utilisation certificate'],
  ['constituency_impact', 'Constituency impact certificate'],
  ['annual_sip', 'Annual SIP certificate'],
];
const label = (list, v) => (list.find(([k]) => k === v) || [, v])[1];

function Picker({ title, list, value, onChange }) {
  return (
    <label className="relative block">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={title} className="w-full h-14 px-6 pt-4 pb-1 rounded-full bg-[#F4F4F5] dark:bg-[#151515] text-[15px] outline-none appearance-none focus:ring-2 focus:ring-[#0A0A0A]/20 dark:focus:ring-[#FAFAFA]/25">
        {list.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <span className="pointer-events-none absolute left-6 top-2 text-[11px] font-medium text-[#52525B] dark:text-[#A1A1AA]">{title}</span>
    </label>
  );
}

const BLANK = {
  name: '', type: 'COHORT', amountRule: 'MIN_AMOUNT', minAmount: 100000, fixedAmount: 0, allocationTarget: 'COHORT', allowedDonorTypes: ['corporate'],
  platformFeePercent: 10, feeMode: 'ON_TOP', receiptType: '80G', certificateTemplate: 'utilisation', reportingFrequency: 'Quarterly', visibility: 'PRIVATE', privateDonorId: '',
};

function ProductForm({ open, onClose, initial, onSaved }) {
  const { state, dispatch } = useStore();
  const [f, setF] = useState(BLANK);
  const [loadedFor, setLoadedFor] = useState(null);
  if (open && loadedFor !== (initial?.id || 'new')) {
    setLoadedFor(initial?.id || 'new');
    setF(initial ? { ...BLANK, ...initial } : BLANK);
  }
  if (!open && loadedFor) setLoadedFor(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const verifiedOrgs = state.sponsors.filter((s) => s.kycStatus === 'verified' && f.allowedDonorTypes.includes(s.type));
  const privateOk = f.visibility === 'PUBLIC' || !!f.privateDonorId;
  const valid = f.name.trim() && f.allowedDonorTypes.length && privateOk && Number(f.platformFeePercent) >= 0;
  const example = calcCheckout(f.amountRule === 'FIXED' ? f.fixedAmount || 100000 : 100000, Number(f.platformFeePercent) || 0, f.feeMode);

  return (
    <BottomSheet open={open} onClose={onClose} title={initial ? 'Edit product' : 'New product'}>
      <div className="space-y-4">
        <FloatingInput label="Product name" value={f.name} onChange={(e) => set('name')(e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Picker title="Type" list={TYPES} value={f.type} onChange={set('type')} />
          <Picker title="Amount rule" list={RULES} value={f.amountRule} onChange={set('amountRule')} />
        </div>
        {f.amountRule === 'MIN_AMOUNT' && <Amount label="Minimum amount (₹)" value={f.minAmount} onChange={set('minAmount')} />}
        {(f.amountRule === 'FIXED' || f.amountRule === 'MONTHLY_FIXED') && <Amount label={f.amountRule === 'FIXED' ? 'Fixed amount (₹)' : 'Monthly amount (₹)'} value={f.fixedAmount} onChange={set('fixedAmount')} />}
        <Picker title="Allocation target" list={TARGETS} value={f.allocationTarget} onChange={set('allocationTarget')} />
        <div className="space-y-2">
          <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Allowed donor types</div>
          <div className="flex flex-wrap gap-2">
            {DONORS.map(([k, l]) => {
              const on = f.allowedDonorTypes.includes(k);
              return (
                <button key={k} type="button" aria-pressed={on} onClick={() => setF((x) => ({ ...x, allowedDonorTypes: on ? x.allowedDonorTypes.filter((d) => d !== k) : [...x.allowedDonorTypes, k] }))}
                  className={`h-11 px-4 rounded-full text-[13px] font-medium ${on ? 'bg-[#0A0A0A] text-white dark:bg-[#FAFAFA] dark:text-[#0A0A0A]' : 'bg-[#F4F4F5] dark:bg-[#222224]'}`}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FloatingInput label="Platform fee %" type="number" value={f.platformFeePercent} onChange={(e) => set('platformFeePercent')(e.target.value)} />
          <FloatingSelect label="Fee mode" value={f.feeMode} onChange={(e) => set('feeMode')(e.target.value)} options={['ON_TOP', 'DEDUCTED']} />
          <FloatingSelect label="Receipt type" value={f.receiptType} onChange={(e) => set('receiptType')(e.target.value)} options={['80G', 'CSR receipt', 'None']} />
          <FloatingSelect label="Reporting" value={f.reportingFrequency} onChange={(e) => set('reportingFrequency')(e.target.value)} options={['On payout', 'Monthly', 'Quarterly', 'Annual']} />
        </div>
        <Picker title="Certificate template" list={CERTS} value={f.certificateTemplate} onChange={set('certificateTemplate')} />
        <div className="space-y-2">
          <div className="text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">Visibility</div>
          <Segmented value={f.visibility} onChange={set('visibility')} options={[{ value: 'PUBLIC', label: 'Public' }, { value: 'PRIVATE', label: 'Private' }]} />
        </div>
        {f.visibility === 'PRIVATE' && (
          <div>
            <Picker
              title="Assigned donor (verified only)"
              list={[['', 'Choose a verified donor'], ...verifiedOrgs.map((s) => [s.id, s.displayName])]}
              value={f.privateDonorId || ''}
              onChange={set('privateDonorId')}
            />
            {verifiedOrgs.length === 0 && <p className="mt-2 px-2 text-[12px]">No verified donor of the allowed types yet.</p>}
          </div>
        )}
        <div className="p-4 rounded-[20px] bg-[#F4F4F5] dark:bg-[#222224] text-[13px]">
          Example: {formatINR(example.amount)} chosen → fee {formatINR(example.fee)}, donor pays {formatINR(example.total)}, {formatINR(example.toStudents)} to students.
        </div>
        <PrimaryButton
          disabled={!valid}
          onClick={() => {
            dispatch('upsertProduct', {
              product: {
                ...f, id: initial?.id || `pp-${uid('p').slice(-6)}`, name: f.name.trim(), platformFeePercent: Number(f.platformFeePercent),
                minAmount: Number(f.minAmount) || 0, fixedAmount: Number(f.fixedAmount) || 0, privateDonorId: f.visibility === 'PRIVATE' ? f.privateDonorId : undefined,
              },
            });
            onSaved(initial ? 'Product updated' : 'Product created');
            onClose();
          }}
          className="w-full"
        >
          {initial ? 'Save product' : 'Create product'}
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}

function ProductCard({ p, onEdit }) {
  const { state } = useStore();
  const donor = p.privateDonorId && sel.getSponsor(state, p.privateDonorId);
  const raised = state.donations.filter((d) => d.packageProductId === p.id && d.status === 'success').reduce((s, d) => s + d.amount, 0);
  return (
    <div className="p-5 md:p-6 rounded-[24px] bg-[#F4F4F5] dark:bg-[#151515] space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="w-10 h-10 rounded-full bg-white dark:bg-[#222224] flex items-center justify-center shrink-0">
            {p.visibility === 'PRIVATE' ? <Lock className="w-4 h-4" strokeWidth={1.75} /> : <Globe className="w-4 h-4" strokeWidth={1.75} />}
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold">{p.name}</div>
            <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">{label(TYPES, p.type)} · {label(TARGETS, p.allocationTarget)}</div>
          </div>
        </div>
        <SmallButton onClick={onEdit}>Edit</SmallButton>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 text-[13px]">
        <KV label="Rule" value={p.amountRule === 'FIXED' ? formatINR(p.fixedAmount) : p.amountRule === 'MIN_AMOUNT' ? `Min ${formatINR(p.minAmount)}` : p.amountRule === 'MONTHLY_FIXED' ? `${formatINR(p.fixedAmount)}/mo` : 'Full need'} />
        <KV label="Fee" value={`${p.platformFeePercent}% ${p.feeMode === 'ON_TOP' ? 'on top' : 'deducted'}`} />
        <KV label="Certificate" value={label(CERTS, p.certificateTemplate).replace(' certificate', '')} />
        <KV label="Raised" value={formatINR(raised)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {p.allowedDonorTypes.map((d) => <StatusChip key={d} status="info" label={label(DONORS, d)} />)}
        {donor && <StatusChip status="locked" label={`For ${donor.displayName}`} />}
      </div>
    </div>
  );
}

export function AdminProducts() {
  const { state } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toastEl, toast] = useToast();
  const pub = state.packageProducts.filter((p) => p.visibility === 'PUBLIC');
  const priv = state.packageProducts.filter((p) => p.visibility !== 'PUBLIC');
  const edit = (p) => { setEditing(p); setFormOpen(true); };
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Packages & products"
        sub="Templates sponsors choose from. Cohort and constituency products are private and tied to a verified donor."
        actions={<PrimaryButton onClick={() => edit(null)} className="h-12 px-6 text-[14px]"><Plus className="w-4 h-4" strokeWidth={1.75} /> New product</PrimaryButton>}
      />
      <section className="space-y-3">
        <SectionLabel>Standard · public</SectionLabel>
        {pub.map((p) => <ProductCard key={p.id} p={p} onEdit={() => edit(p)} />)}
      </section>
      <section className="space-y-3">
        <SectionLabel>Private</SectionLabel>
        {priv.length === 0 ? <EmptyState icon={Package} title="No private products" /> : priv.map((p) => <ProductCard key={p.id} p={p} onEdit={() => edit(p)} />)}
      </section>
      <ProductForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSaved={toast} />
      {toastEl}
    </div>
  );
}
