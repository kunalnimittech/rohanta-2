// Sponsor onboarding (Part 6.1), reached from the role select screen.
// Individuals can donate right after PAN + mobile OTP. Corporate, NGO/Trust and
// MP/MLA donors also upload documents; admin verifies them within 48 hours.
import React, { useState } from 'react';
import { ArrowLeft, Check, Shield } from 'lucide-react';
import { useStore, uid } from '../../store/StoreProvider';
import { SPONSOR_TYPES } from '../../data/rules';
import {
  Logo,
  ThemeToggle,
  PrimaryButton,
  SecondaryButton,
  FloatingInput,
  FloatingSelect,
  Segmented,
  OtpInput,
  Stepper,
  FileDrop,
  SectionLabel,
} from '../../components/ui';

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const DEMO_OTP = '123456';

const ORG_FIELDS = {
  corporate: [
    ['name', 'Company name'], ['cin', 'CIN'], ['gstin', 'GSTIN'], ['registeredAddress', 'Registered address'],
    ['signatory', 'CSR contact person'], ['designation', 'Designation'], ['committeeRef', 'CSR committee approval reference'], ['csrNo', 'CSR-1 number (if any)'],
  ],
  ngo: [
    ['name', 'Organisation name'], ['registrationNo', 'Registration number'], ['registrationType', 'Registration type'],
    ['reg12A', '12A number'], ['reg80G', '80G number'], ['csrNo', 'CSR-1 number'], ['signatory', 'Authorised signatory'],
  ],
  mp_mla: [['name', 'Name of the MP / MLA'], ['constituency', 'Constituency'], ['state', 'State'], ['officeContact', 'Office contact'], ['pa', 'PA name and mobile']],
};
const OPTIONAL = ['csrNo'];
const DOCS = {
  corporate: ['Certificate of incorporation', 'Company PAN', 'GST certificate', 'CSR committee resolution', 'Authorisation letter'],
  ngo: ['Registration certificate', '12A certificate', '80G certificate', 'CSR-1 registration', 'Trust PAN'],
  mp_mla: ['Official ID or letterhead', 'PAN', 'Authorisation for PA'],
};
const SAMPLE = {
  individual: { displayName: 'Meera N.', email: 'meera.n@example.in', mobile: '+91 98860 33412', pan: 'BQTPN4410K', address: 'Jayanagar, Bengaluru 560041', org: {} },
  corporate: {
    displayName: 'Brightline Infra', email: 'csr@brightline.example', mobile: '+91 33 4060 2200', pan: 'AAKCB5521Q', address: 'Sector V, Salt Lake, Kolkata 700091',
    org: { name: 'Brightline Infra Pvt Ltd', cin: 'U45200WB2009PTC138821', gstin: '19AAKCB5521Q1Z8', registeredAddress: 'Sector V, Salt Lake, Kolkata 700091', signatory: 'Ananya Ghosh', designation: 'CSR Lead', committeeRef: 'BIPL/CSR/2026/04', csrNo: '', preferredStates: 'Jharkhand, Odisha', preferredExams: 'JEE' },
  },
  ngo: {
    displayName: 'Shiksha Saathi Foundation', email: 'office@shikshasaathi.example', mobile: '+91 651 220 1188', pan: 'AAATS7781L', address: 'Doranda, Ranchi 834002',
    org: { name: 'Shiksha Saathi Foundation', registrationNo: 'JH/TR/2015/0291', registrationType: 'Public Charitable Trust', reg12A: 'AAATS7781LE20215', reg80G: 'AAATS7781LF20215', csrNo: 'CSR00021145', signatory: 'Ravi Toppo' },
  },
  mp_mla: {
    displayName: 'Office of the MLA, Gaya Town', email: 'mla.gayatown@example.in', mobile: '+91 631 222 0145', pan: 'AHRPK2210M', address: 'Civil Lines, Gaya 823001',
    org: { name: 'Shri Prem Kumar, MLA', house: 'Vidhan Sabha', constituency: 'Gaya Town', state: 'Bihar', officeContact: '+91 631 222 0145', pa: 'Sanjay Pandey, +91 94311 77210' },
  },
};

export function SponsorOnboarding({ sponsorType = 'individual', isDark, onToggleTheme, onBack, onDone, onUseDemo, demoMode = true }) {
  const { dispatch } = useStore();
  const isOrg = sponsorType !== 'individual';
  const steps = isOrg ? ['Your details', 'Verify mobile', 'Documents'] : ['Your details', 'Verify mobile'];
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ displayName: '', email: '', mobile: '', pan: '', address: '', public: 'public', comms: true, org: { house: 'Lok Sabha' } });
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [docs, setDocs] = useState({});
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const setOrg = (k) => (e) => setF((x) => ({ ...x, org: { ...x.org, [k]: e.target.value } }));
  const panOk = PAN_RE.test(f.pan.trim().toUpperCase());
  const orgOk = !isOrg || (ORG_FIELDS[sponsorType] || []).every(([k]) => OPTIONAL.includes(k) || (f.org[k] || '').trim());
  const detailsOk = f.displayName.trim().length > 1 && f.email.includes('@') && f.mobile.replace(/\D/g, '').length >= 10 && panOk && f.address.trim() && orgOk;
  const docsOk = !isOrg || DOCS[sponsorType].every((d) => docs[d]);

  const finish = () => {
    const userId = `u-sp-${uid('s').slice(-6)}`;
    const id = `sp-${uid('p').slice(-6)}`;
    const org = isOrg
      ? {
          ...f.org,
          ...(sponsorType === 'corporate'
            ? {
                preferredStates: String(f.org.preferredStates || '').split(',').map((x) => x.trim()).filter(Boolean),
                preferredExams: String(f.org.preferredExams || '').split(',').map((x) => x.trim()).filter(Boolean),
              }
            : {}),
        }
      : undefined;
    dispatch('registerSponsor', {
      sponsor: {
        id, userId, type: sponsorType, displayName: f.displayName.trim(), public: f.public === 'public', pan: f.pan.trim().toUpperCase(),
        email: f.email.trim(), mobile: f.mobile.trim(), address: f.address.trim(), commsConsent: f.comms, leaderboardOptIn: false,
        org, documents: isOrg ? Object.fromEntries(Object.entries(docs).map(([k, v]) => [k, v.name])) : undefined,
      },
    });
    setDone({ userId });
  };

  const header = (
    <header className="max-w-[1280px] w-full mx-auto px-5 md:px-8 h-16 md:h-20 flex items-center justify-between">
      <div className="inline-flex items-center gap-2.5">
        <Logo className="w-7 h-7" />
        <span className="text-[17px] font-semibold tracking-[-0.02em]">Sikshit Bharat</span>
      </div>
      <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
    </header>
  );

  if (done) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA]">
        {header}
        <main className="max-w-[600px] mx-auto px-5 md:px-8 py-10 text-center space-y-6 animate-slide-in">
          <div className="w-20 h-20 rounded-full bg-[#F4F4F5] dark:bg-[#151515] flex items-center justify-center mx-auto shadow-soft">
            <span className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] flex items-center justify-center animate-pop-in">
              <Check className="w-6 h-6" strokeWidth={2.25} />
            </span>
          </div>
          <h1 className="text-[28px] md:text-[36px] font-semibold tracking-[-0.03em]">{isOrg ? 'Documents submitted' : 'You are ready to give'}</h1>
          <p className="text-[16px] text-[#52525B] dark:text-[#A1A1AA]">
            {isOrg
              ? 'The trust verifies organisations within 48 hours. You can make a normal donation now. Your name stays private, and cohort or constituency programmes and CSR certificates unlock after verification.'
              : 'Your mobile and PAN are verified, so your donations get an 80G receipt. Browse verified students and fund one today.'}
          </p>
          {isOrg && (
            <div className="p-5 rounded-[24px] border border-[#0A0A0A]/40 dark:border-[#FAFAFA]/40 text-left flex items-start gap-3 text-[14px]">
              <Shield className="w-5 h-5 shrink-0 mt-0.5" strokeWidth={1.75} /> Verification pending
            </div>
          )}
          <PrimaryButton onClick={() => onDone(done.userId)} className="min-w-[240px]">Go to my dashboard</PrimaryButton>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA]">
      {header}
      <main className="max-w-[720px] mx-auto px-5 md:px-8 py-6 md:py-10 pb-28 space-y-8">
        <button type="button" onClick={step === 0 ? onBack : () => setStep(step - 1)} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} /> Back
        </button>
        <div className="space-y-2">
          <h1 className="text-[32px] md:text-[40px] font-semibold tracking-[-0.03em]">Join as {SPONSOR_TYPES[sponsorType]}</h1>
          <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">
            {isOrg ? 'We verify every organisation before its name is public.' : 'PAN is needed for your 80G tax receipt.'}
          </p>
        </div>
        <Stepper steps={steps} current={step} />

        {step === 0 && (
          <div className="space-y-6 animate-slide-in">
            {demoMode && (
              <button type="button" onClick={() => setF((x) => ({ ...x, ...SAMPLE[sponsorType], org: { ...x.org, ...SAMPLE[sponsorType].org } }))} className="text-[13px] font-medium underline underline-offset-4 text-[#52525B] dark:text-[#A1A1AA]">
                Fill sample details (demo)
              </button>
            )}
            <section className="space-y-4">
              <SectionLabel>Your details</SectionLabel>
              <FloatingInput label={isOrg ? 'Display name (shown to students)' : 'Display name'} value={f.displayName} onChange={set('displayName')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput label="Email" type="email" value={f.email} onChange={set('email')} />
                <FloatingInput label="Mobile" value={f.mobile} onChange={set('mobile')} />
                <div>
                  <FloatingInput label="PAN" value={f.pan} onChange={(e) => setF((x) => ({ ...x, pan: e.target.value.toUpperCase() }))} />
                  {f.pan && !panOk && <p className="mt-2 px-2 text-[12px] font-medium">PAN looks like ABCDE1234F.</p>}
                </div>
                <FloatingInput label="Postal address" value={f.address} onChange={set('address')} />
              </div>
            </section>

            {isOrg && (
              <section className="space-y-4">
                <SectionLabel>{sponsorType === 'corporate' ? 'Company' : sponsorType === 'ngo' ? 'Organisation' : 'Office'}</SectionLabel>
                {sponsorType === 'mp_mla' && (
                  <FloatingSelect label="House" value={f.org.house || 'Lok Sabha'} onChange={setOrg('house')} options={['Lok Sabha', 'Rajya Sabha', 'Vidhan Sabha', 'Vidhan Parishad']} />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ORG_FIELDS[sponsorType].map(([k, l]) => (
                    <FloatingInput key={k} label={l} value={f.org[k] || ''} onChange={setOrg(k)} />
                  ))}
                  {sponsorType === 'corporate' && (
                    <>
                      <FloatingInput label="Preferred states (optional)" value={f.org.preferredStates || ''} onChange={setOrg('preferredStates')} />
                      <FloatingInput label="Preferred exams (optional)" value={f.org.preferredExams || ''} onChange={setOrg('preferredExams')} />
                    </>
                  )}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <SectionLabel>How you appear</SectionLabel>
              <Segmented value={f.public} onChange={(v) => setF((x) => ({ ...x, public: v }))} options={[{ value: 'public', label: 'Show my name' }, { value: 'anonymous', label: 'Stay anonymous' }]} />
              <button type="button" aria-pressed={f.comms} onClick={() => setF((x) => ({ ...x, comms: !x.comms }))} className="flex items-start gap-3 text-left">
                <span className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${f.comms ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'border border-[#D4D4D8] dark:border-[#3F3F46]'}`}>
                  {f.comms && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </span>
                <span className="text-[14px]">Send me updates about the students I support by SMS and email.</span>
              </button>
            </section>

            <div className="flex flex-col sm:flex-row gap-3">
              <PrimaryButton disabled={!detailsOk} onClick={() => setStep(1)}>Continue</PrimaryButton>
              {onUseDemo && <SecondaryButton onClick={onUseDemo}>Use a demo account instead</SecondaryButton>}
            </div>
            {!detailsOk && <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">All fields above are required{isOrg ? ' (CSR-1 and preferences are optional)' : ''}.</p>}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 max-w-[440px] animate-slide-in">
            <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">Enter the 6-digit code sent to {f.mobile}.</p>
            <OtpInput value={otp} demo={demoMode} onChange={(v) => { setOtp(v); setOtpError(false); }} />
            {otpError && <p className="text-[13px] font-medium">That code is not right. Please try again.</p>}
            <PrimaryButton
              disabled={otp.length !== 6}
              onClick={() => {
                if (otp !== DEMO_OTP) return setOtpError(true);
                if (isOrg) setStep(2);
                else finish();
              }}
              className="w-full"
            >
              {isOrg ? 'Verify and continue' : 'Verify and finish'}
            </PrimaryButton>
          </div>
        )}

        {step === 2 && isOrg && (
          <div className="space-y-5 animate-slide-in">
            <p className="text-[15px] text-[#52525B] dark:text-[#A1A1AA]">Upload these so the trust can verify your organisation. Files stay in your browser in this prototype.</p>
            {DOCS[sponsorType].map((d) => (
              <div key={d} className="space-y-2">
                <div className="text-[14px] font-semibold">{d}</div>
                <FileDrop file={docs[d]} onFile={(file) => setDocs((x) => ({ ...x, [d]: file }))} />
              </div>
            ))}
            <PrimaryButton disabled={!docsOk} onClick={finish}>Submit for verification</PrimaryButton>
          </div>
        )}
      </main>
    </div>
  );
}
