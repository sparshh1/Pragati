'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useCitizen } from '@/lib/session';
import { CitizenRole } from '@/lib/rbac';
import { districts } from '@/data/districts';
import { courses } from '@/data/courses';
import { SECTOR_LABELS } from '@/types';
import { Note } from '@/components/ui/Card';

const STEPS = ['Select role', 'Identity & contact', 'Role details', 'Verify & submit'] as const;

const QUALIFICATIONS = [
  '8th standard or below', '10th standard (SSC)', '12th standard (HSC)',
  'ITI certificate (NCVT/SCVT)', 'Diploma / Polytechnic', 'Graduate', 'No formal schooling',
];

export function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { register } = useCitizen();

  const preset = params.get('role');
  const [step, setStep] = useState(preset === 'student' || preset === 'business' ? 1 : 0);
  const [role, setRole] = useState<CitizenRole | null>(
    preset === 'student' || preset === 'business' ? (preset as CitizenRole) : null,
  );

  const [form, setForm] = useState({
    name: '', mobile: '', email: '', districtId: 'pune', language: 'mr',
    aadhaarLast4: '',
    // student
    qualification: '10th standard (SSC)', currentNsqfLevel: 3, enrolledCourseId: '', yearsInformalWork: 0,
    // business
    udyamNumber: '', entityType: 'MSME' as 'MSME' | 'Enterprise', sector: 'auto-ev',
    employeeCount: 10, gstin: '',
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [issued, setIssued] = useState<string | null>(null);

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  function validateStep1() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'Enter your full name as on Aadhaar.';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.aadhaarLast4 && !/^\d{4}$/.test(form.aadhaarLast4)) e.aadhaarLast4 = 'Enter the last 4 digits only.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (role === 'business') {
      if (!/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(form.udyamNumber.toUpperCase()))
        e.udyamNumber = 'Format: UDYAM-MH-01-1234567';
      if (form.gstin && form.gstin.length !== 15) e.gstin = 'GSTIN must be 15 characters.';
      if (form.employeeCount < 1) e.employeeCount = 'Enter at least 1.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (otp !== '123456') {
      setErrors({ otp: 'Incorrect OTP. For this demonstration the OTP is 123456.' });
      return;
    }
    const base = {
      role: role!, name: form.name.trim(), mobile: form.mobile, email: form.email,
      districtId: form.districtId, language: form.language,
    };
    const account =
      role === 'student'
        ? register({
            ...base,
            qualification: form.qualification,
            currentNsqfLevel: Number(form.currentNsqfLevel),
            enrolledCourseId: form.enrolledCourseId || null,
            yearsInformalWork: Number(form.yearsInformalWork),
          })
        : register({
            ...base,
            udyamNumber: form.udyamNumber.toUpperCase(),
            entityType: form.entityType,
            sector: form.sector,
            employeeCount: Number(form.employeeCount),
            gstin: form.gstin.toUpperCase(),
          });
    setIssued(account.ksid);
    setStep(4);
  }

  const accent = role === 'business' ? 'var(--accent-employer)' : 'var(--accent-student)';

  /* ------------------------------ success ------------------------------ */
  if (step === 4 && issued) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="gov-card overflow-hidden">
          <div className="h-1.5" style={{ background: accent }} />
          <div className="p-8 text-center">
            <span className="w-14 h-14 mx-auto grid place-items-center rounded-full bg-[var(--signal-rising-light)] text-[var(--signal-rising)] mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5 5L20 7" />
              </svg>
            </span>
            <h1 className="text-[22px] font-bold text-[var(--gov-navy)]">Registration Successful</h1>
            <p className="text-[13.5px] text-[var(--ink-secondary)] mt-2">
              Your Kaushal Setu ID has been issued. Keep this number — it is your reference for all
              services on this portal.
            </p>

            <div className="my-6 py-4 border-y border-dashed border-[var(--border-strong)]">
              <p className="text-[11px] uppercase tracking-[0.1em] font-bold text-[var(--ink-tertiary)]">
                Kaushal Setu ID (KSID)
              </p>
              <p className="text-[26px] font-bold mono tracking-wider mt-1" style={{ color: accent }}>
                {issued}
              </p>
              <p className="text-[12px] text-[var(--ink-tertiary)] mt-1">
                Registered as {role === 'student' ? 'Candidate / Student' : 'Enterprise / MSME'} ·{' '}
                {districts.find(d => d.id === form.districtId)?.name} district
              </p>
            </div>

            <Note tone="info" title="What happens next">
              Taking you to your {role === 'student' ? 'candidate' : 'enterprise'} dashboard.
            </Note>

            <button
              onClick={() => router.push(`/dashboard/${role}`)}
              className="mt-6 w-full text-white font-bold text-[15px] py-3 rounded-sm hover:brightness-110 focus-ring"
              style={{ background: accent }}
            >
              Continue to My Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ form ------------------------------ */
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-3">
        <ol className="flex gap-1.5 text-[11.5px] text-[var(--ink-tertiary)]">
          <li><Link href="/" className="gov-link">Home</Link></li>
          <li aria-hidden>›</li>
          <li className="text-[var(--ink-secondary)]">New Registration</li>
        </ol>
      </nav>

      <h1 className="text-[26px] font-bold text-[var(--gov-navy)] mb-1">New Registration</h1>
      <p className="text-[13.5px] text-[var(--ink-secondary)] mb-6">
        Candidates and enterprises register through this single form. One mobile number may hold one role.
      </p>

      {/* Stepper */}
      <ol className="flex items-center gap-0 mb-6 overflow-x-auto">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center shrink-0">
            <div className="flex items-center gap-2 px-3 py-2">
              <span
                className={`w-6 h-6 grid place-items-center rounded-full text-[11px] font-bold border-2 ${
                  i < step ? 'bg-[var(--signal-rising)] border-[var(--signal-rising)] text-white'
                  : i === step ? 'text-white' : 'bg-white border-[var(--border-strong)] text-[var(--ink-tertiary)]'
                }`}
                style={i === step ? { background: 'var(--gov-navy)', borderColor: 'var(--gov-navy)' } : undefined}
              >
                {i < step ? '✓' : i + 1}
              </span>
              <span className={`text-[12px] font-semibold ${i === step ? 'text-[var(--gov-navy)]' : 'text-[var(--ink-tertiary)]'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className="w-6 h-px bg-[var(--border-strong)]" />}
          </li>
        ))}
      </ol>

      <div className="gov-card p-6">
        {/* ---------------- Step 0: role ---------------- */}
        {step === 0 && (
          <>
            <h2 className="text-[17px] font-bold text-[var(--ink)] mb-1">Who is registering?</h2>
            <p className="text-[13px] text-[var(--ink-secondary)] mb-5">
              This choice determines your dashboard, your feature list and the services you may access.
              It cannot be changed later without a fresh registration.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {([
                { r: 'student' as const, t: 'Candidate / Student', hi: 'उमेदवार', c: 'var(--accent-student)', tint: 'var(--accent-student-light)',
                  d: 'You are looking for training, certification of experience you already have, or a job.' },
                { r: 'business' as const, t: 'Enterprise / MSME', hi: 'उद्योग', c: 'var(--accent-employer)', tint: 'var(--accent-employer-light)',
                  d: 'You are an establishment that hires skilled workers, or wants to shape what is taught.' },
              ]).map(o => (
                <button
                  key={o.r}
                  onClick={() => { setRole(o.r); setStep(1); }}
                  className={`text-left border-2 rounded-sm p-5 transition-all hover:shadow-sm focus-ring ${
                    role === o.r ? '' : 'border-[var(--border)]'
                  }`}
                  style={role === o.r ? { borderColor: o.c, background: o.tint } : undefined}
                >
                  <span className="block text-[16px] font-bold text-[var(--ink)]">{o.t}</span>
                  <span className="block text-[12px] text-[var(--ink-tertiary)] mt-0.5">{o.hi}</span>
                  <span className="block text-[12.5px] text-[var(--ink-secondary)] mt-3 leading-relaxed">{o.d}</span>
                  <span className="inline-block mt-4 text-[13px] font-bold" style={{ color: o.c }}>Select →</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ---------------- Step 1: identity ---------------- */}
        {step === 1 && (
          <>
            <h2 className="text-[17px] font-bold text-[var(--ink)] mb-4">
              Identity &amp; contact details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full name (as on Aadhaar)" required error={errors.name}>
                <input className="gov-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Sunil Deshmukh" />
              </Field>
              <Field label="Mobile number" required error={errors.mobile} hint="Your login identifier and OTP destination">
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-[var(--border-strong)] bg-[var(--surface-alt)] text-[13px] mono rounded-l-sm">+91</span>
                  <input className="gov-input rounded-l-none" inputMode="numeric" maxLength={10}
                    value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/g, ''))} placeholder="9876543210" />
                </div>
              </Field>
              <Field label="Email address" error={errors.email} hint="Optional">
                <input className="gov-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" />
              </Field>
              <Field label="Aadhaar — last 4 digits" error={errors.aadhaarLast4} hint="Optional. Full Aadhaar is never stored on this portal.">
                <input className="gov-input mono" inputMode="numeric" maxLength={4}
                  value={form.aadhaarLast4} onChange={e => set('aadhaarLast4', e.target.value.replace(/\D/g, ''))} placeholder="••••" />
              </Field>
              <Field label="District" required>
                <select className="gov-input" value={form.districtId} onChange={e => set('districtId', e.target.value)}>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field label="Preferred language" required hint="Used for voice assist, SMS and portal content">
                <select className="gov-input" value={form.language} onChange={e => set('language', e.target.value)}>
                  <option value="mr">मराठी — Marathi</option>
                  <option value="hi">हिन्दी — Hindi</option>
                  <option value="en">English</option>
                  <option value="ur">اردو — Urdu</option>
                </select>
              </Field>
            </div>
            <Nav onBack={() => setStep(0)} onNext={() => { if (validateStep1()) setStep(2); }} accent={accent} />
          </>
        )}

        {/* ---------------- Step 2: role-specific ---------------- */}
        {step === 2 && role === 'student' && (
          <>
            <h2 className="text-[17px] font-bold text-[var(--ink)] mb-1">Candidate details</h2>
            <p className="text-[13px] text-[var(--ink-secondary)] mb-4">
              Informal work experience matters here — it is the basis of your Recognition of Prior
              Learning claim, and it can discharge most of a course.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Highest qualification" required>
                <select className="gov-input" value={form.qualification} onChange={e => set('qualification', e.target.value)}>
                  {QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}
                </select>
              </Field>
              <Field label="Current NSQF level" hint="Leave at 3 if you hold no vocational certificate">
                <select className="gov-input" value={form.currentNsqfLevel} onChange={e => set('currentNsqfLevel', Number(e.target.value))}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Level {n}</option>)}
                </select>
              </Field>
              <Field label="Currently enrolled course" hint="Optional — select if you are already in training">
                <select className="gov-input" value={form.enrolledCourseId} onChange={e => set('enrolledCourseId', e.target.value)}>
                  <option value="">Not currently enrolled</option>
                  {courses.filter(c => c.districtId === form.districtId).map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.type}, {c.durationMonths} months</option>
                  ))}
                </select>
              </Field>
              <Field label="Years of informal / unregistered work" hint="Counted towards RPL credit">
                <input className="gov-input mono" type="number" min={0} max={40}
                  value={form.yearsInformalWork} onChange={e => set('yearsInformalWork', Number(e.target.value))} />
              </Field>
            </div>
            {form.yearsInformalWork >= 2 && (
              <div className="mt-4">
                <Note tone="success" title="You may be eligible for RPL">
                  {form.yearsInformalWork} years qualifies you for RPL instead of a full course. Average
                  uplift after certification: ₹7,000 a month.
                </Note>
              </div>
            )}
            <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} accent={accent} />
          </>
        )}

        {step === 2 && role === 'business' && (
          <>
            <h2 className="text-[17px] font-bold text-[var(--ink)] mb-1">Enterprise details</h2>
            <p className="text-[13px] text-[var(--ink-secondary)] mb-4">
              Your Udyam registration and GSTIN are what give your hiring signals their trust weight.
              Signals from establishments visible on EPFO carry materially more weight than anonymous postings.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Udyam registration number" required error={errors.udyamNumber} hint="Format: UDYAM-MH-01-1234567">
                <input className="gov-input mono uppercase" value={form.udyamNumber}
                  onChange={e => set('udyamNumber', e.target.value)} placeholder="UDYAM-MH-01-0042318" />
              </Field>
              <Field label="GSTIN" error={errors.gstin} hint="Optional. Enables turnover corroboration of your signals.">
                <input className="gov-input mono uppercase" maxLength={15} value={form.gstin}
                  onChange={e => set('gstin', e.target.value)} placeholder="27AABCU9603R1ZM" />
              </Field>
              <Field label="Establishment type" required>
                <select className="gov-input" value={form.entityType} onChange={e => set('entityType', e.target.value)}>
                  <option value="MSME">MSME (micro, small or medium)</option>
                  <option value="Enterprise">Large enterprise</option>
                </select>
              </Field>
              <Field label="Primary sector" required>
                <select className="gov-input" value={form.sector} onChange={e => set('sector', e.target.value)}>
                  {Object.entries(SECTOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </Field>
              <Field label="Employees on roll" required error={errors.employeeCount}>
                <input className="gov-input mono" type="number" min={1}
                  value={form.employeeCount} onChange={e => set('employeeCount', Number(e.target.value))} />
              </Field>
            </div>
            {form.entityType === 'MSME' && form.employeeCount < 50 && (
              <div className="mt-4">
                <Note tone="info" title="You qualify for MSME Hiring Pools">
                  Co-sign a batch with other units in {districts.find(d => d.id === form.districtId)?.name}.
                  You commit only the seats you will absorb.
                </Note>
              </div>
            )}
            <Nav onBack={() => setStep(1)} onNext={() => { if (validateStep2()) setStep(3); }} accent={accent} />
          </>
        )}

        {/* ---------------- Step 3: verify ---------------- */}
        {step === 3 && (
          <>
            <h2 className="text-[17px] font-bold text-[var(--ink)] mb-4">Verify and submit</h2>

            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-5 pb-5 border-b border-[var(--border)]">
              <Row k="Registering as" v={role === 'student' ? 'Candidate / Student' : 'Enterprise / MSME'} />
              <Row k="Name" v={form.name || '—'} />
              <Row k="Mobile" v={`+91 ${form.mobile || '—'}`} />
              <Row k="District" v={districts.find(d => d.id === form.districtId)?.name ?? '—'} />
              {role === 'student' ? (
                <>
                  <Row k="Qualification" v={form.qualification} />
                  <Row k="Informal experience" v={`${form.yearsInformalWork} year(s)`} />
                </>
              ) : (
                <>
                  <Row k="Udyam number" v={form.udyamNumber.toUpperCase() || '—'} />
                  <Row k="Employees on roll" v={String(form.employeeCount)} />
                </>
              )}
            </dl>

            <div className="max-w-sm">
              <Field label="One-time password" required error={errors.otp}
                hint={otpSent ? `OTP sent to +91 ${form.mobile}. For this demonstration, enter 123456.` : 'Request an OTP to continue.'}>
                <div className="flex gap-2">
                  <input className="gov-input mono tracking-[0.3em]" maxLength={6} inputMode="numeric"
                    value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••" disabled={!otpSent} />
                  <button
                    onClick={() => setOtpSent(true)}
                    className="shrink-0 px-3 border border-[var(--gov-navy)] text-[var(--gov-navy)] text-[12.5px] font-semibold rounded-sm hover:bg-[var(--accent-officer-light)] focus-ring"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
              </Field>
            </div>

            <label className="flex items-start gap-2.5 mt-5 text-[12.5px] text-[var(--ink-secondary)]">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              <span>
                I declare that the information furnished is true. I consent to this portal reconciling my
                declared placement and payroll data with EPFO records for verification and audit purposes.
              </span>
            </label>

            <Nav onBack={() => setStep(2)} onNext={submit} nextLabel="Submit Registration" accent={accent} />
          </>
        )}
      </div>

      <p className="text-center text-[12.5px] text-[var(--ink-secondary)] mt-5">
        Already registered? <Link href="/login" className="gov-link font-semibold">Login here</Link>
      </p>
    </div>
  );
}

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="gov-label">
        {label} {required && <span className="text-[var(--signal-declining)]">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11.5px] text-[var(--signal-declining)] mt-1">{error}</p>
      ) : hint ? (
        <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 text-[13px]">
      <dt className="text-[var(--ink-tertiary)]">{k}</dt>
      <dd className="font-semibold text-[var(--ink)] text-right">{v}</dd>
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel = 'Continue', accent }: {
  onBack: () => void; onNext: () => void; nextLabel?: string; accent: string;
}) {
  return (
    <div className="flex justify-between gap-3 mt-6 pt-5 border-t border-[var(--border)]">
      <button onClick={onBack}
        className="px-5 py-2.5 text-[13.5px] font-semibold border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
        ← Back
      </button>
      <button onClick={onNext}
        className="px-6 py-2.5 text-[13.5px] font-bold text-white rounded-sm hover:brightness-110 focus-ring"
        style={{ background: accent }}>
        {nextLabel} →
      </button>
    </div>
  );
}
