'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGov } from '@/lib/session';
import { GOV_ROLES, GovRole, ALL_PERMISSIONS } from '@/lib/rbac';
import { districts } from '@/data/districts';
import { Emblem } from '@/components/gov/Emblem';
import { AccessibilityBar } from '@/components/gov/AccessibilityBar';

const CENTRES = [
  'ITI-PUNE-AUNDH', 'ITI-NASHIK-SATPUR', 'ITI-CSN-CHIKALTHANA',
  'ITI-NAGPUR-KALMESHWAR', 'ITI-THANE-WAGLE', 'ITI-KOLHAPUR-SHIVAJI',
];

const DEMO_OFFICERS: Record<GovRole, { employeeId: string; name: string; districtId: string | null; centreId: string | null }> = {
  'state-admin': { employeeId: 'MH-MSDE-0001', name: 'Sunita Rathod', districtId: null, centreId: null },
  'district-officer': { employeeId: 'MH-DSDEO-PN-014', name: 'Anil Karve', districtId: 'pune', centreId: null },
  'centre-head': { employeeId: 'MH-DVET-CSN-207', name: 'Prakash Ingle', districtId: 'csn', centreId: 'ITI-CSN-CHIKALTHANA' },
  'audit-officer': { employeeId: 'MH-FIN-AUD-032', name: 'Farida Sheikh', districtId: null, centreId: null },
  'scheme-manager': { employeeId: 'MH-PMKVY-CC-009', name: 'Rohit Gawande', districtId: null, centreId: null },
};

export default function GovLoginPage() {
  const router = useRouter();
  const { signIn } = useGov();
  const [role, setRole] = useState<GovRole>('district-officer');
  const [employeeId, setEmployeeId] = useState(DEMO_OFFICERS['district-officer'].employeeId);
  const [name, setName] = useState(DEMO_OFFICERS['district-officer'].name);
  const [districtId, setDistrictId] = useState<string>('pune');
  const [centreId, setCentreId] = useState<string>(CENTRES[2]);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const def = GOV_ROLES[role];

  function pickRole(r: GovRole) {
    setRole(r);
    const demo = DEMO_OFFICERS[r];
    setEmployeeId(demo.employeeId);
    setName(demo.name);
    if (demo.districtId) setDistrictId(demo.districtId);
    if (demo.centreId) setCentreId(demo.centreId);
  }

  function submit() {
    if (otp !== '123456') {
      setError('Incorrect authenticator code. For this demonstration, enter 123456.');
      return;
    }
    signIn({
      employeeId,
      name,
      role,
      districtId: def.scope === 'state' ? null : districtId,
      centreId: def.scope === 'centre' ? centreId : null,
    });
    router.push('/gov/console');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--gov-navy-dark)]">
      <AccessibilityBar variant="gov" />

      <div className="bg-[var(--gov-maroon)] text-white text-[11px]">
        <div className="mx-auto max-w-[1400px] px-4 py-1.5 text-center font-bold uppercase tracking-[0.1em]">
          Restricted access: authorised departmental users only
        </div>
      </div>

      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-[1400px] px-4 py-10 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
          {/* ---- Left: identity and explanation ---- */}
          <div className="text-white">
            <div className="flex items-center gap-4 mb-6">
              <Emblem size={46} className="text-white" />
              <div>
                <h1 className="text-[24px] font-bold leading-tight">प्रgati</h1>
                <p className="text-[13px] text-slate-300">Departmental Portal · विभागीय पोर्टल</p>
                <p className="text-[11px] text-slate-400 uppercase tracking-[0.06em] mt-0.5">
                  Government of Maharashtra
                </p>
              </div>
            </div>

            <div className="h-[3px] tricolour-bar w-28 mb-6" />

            <p className="text-[14px] text-slate-300 leading-relaxed max-w-xl">
              This is a separate portal from the public one. Access is granted by role, and each role
              carries a fixed set of permissions and a fixed data scope: state-wide, a single district,
              or a single training centre. Nothing on this portal is visible or actionable outside the
              scope of the role you sign in with.
            </p>

            <div className="mt-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-[var(--gov-saffron)] mb-3">
                Select your role to sign in
              </p>
              <div className="space-y-2">
                {(Object.keys(GOV_ROLES) as GovRole[]).map(r => {
                  const d = GOV_ROLES[r];
                  const active = role === r;
                  return (
                    <button key={r} onClick={() => pickRole(r)}
                      className={`w-full text-left border rounded-sm px-4 py-3 transition-all focus-ring ${
                        active
                          ? 'bg-white/10 border-[var(--gov-saffron)]'
                          : 'bg-white/[0.03] border-white/15 hover:bg-white/[0.07]'
                      }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-white">{d.title}</p>
                          <p className="text-[11.5px] text-slate-400">{d.titleHi} · {d.designation}</p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm ${
                          d.scope === 'state' ? 'bg-[var(--gov-saffron)] text-[var(--gov-navy-dark)]'
                          : d.scope === 'district' ? 'bg-white/15 text-white' : 'bg-white/10 text-slate-300'
                        }`}>
                          {d.scope} scope
                        </span>
                      </div>
                      {active && (
                        <>
                          <p className="text-[12px] text-slate-300 mt-2 leading-relaxed">{d.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {d.permissions.map(p => (
                              <span key={p} className="text-[9px] mono bg-black/25 border border-white/10 px-1.5 py-0.5 rounded-sm text-slate-300">
                                {p}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-2">
                            {d.permissions.length} of {ALL_PERMISSIONS.length} permissions ·{' '}
                            {ALL_PERMISSIONS.length - d.permissions.length} withheld
                          </p>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ---- Right: sign-in form ---- */}
          <div className="gov-card overflow-hidden">
            <div className="px-5 py-3 bg-[var(--gov-navy)] text-white">
              <h2 className="text-[15px] font-bold">Departmental Sign-in</h2>
              <p className="text-[11.5px] text-slate-300 mt-0.5">
                Signing in as: <strong className="text-white">{def.title}</strong>
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="gov-label" htmlFor="emp-id">Employee / Officer ID</label>
                <input id="emp-id" className="gov-input mono" value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)} />
              </div>
              <div>
                <label className="gov-label" htmlFor="off-name">Officer name</label>
                <input id="off-name" className="gov-input" value={name} onChange={e => setName(e.target.value)} />
              </div>

              {def.scope !== 'state' && (
                <div>
                  <label className="gov-label" htmlFor="off-district">Assigned district</label>
                  <select id="off-district" className="gov-input" value={districtId}
                    onChange={e => setDistrictId(e.target.value)}>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <p className="text-[11px] text-[var(--ink-tertiary)] mt-1">
                    You will see data for this district only.
                  </p>
                </div>
              )}

              {def.scope === 'centre' && (
                <div>
                  <label className="gov-label" htmlFor="off-centre">Training centre</label>
                  <select id="off-centre" className="gov-input mono" value={centreId}
                    onChange={e => setCentreId(e.target.value)}>
                    {CENTRES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="gov-label" htmlFor="gov-otp">Authenticator code</label>
                <input id="gov-otp" className="gov-input mono tracking-[0.35em] text-center text-[17px]"
                  maxLength={6} inputMode="numeric" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••" />
                <p className="text-[11px] text-[var(--ink-tertiary)] mt-1">
                  Six-digit code from your departmental authenticator. For this demonstration, enter{' '}
                  <span className="mono font-bold">123456</span>.
                </p>
              </div>

              {error && <p className="text-[12px] text-[var(--signal-declining)]">{error}</p>}

              <button onClick={submit}
                className="w-full bg-[var(--gov-navy)] text-white font-bold text-[14.5px] py-3 rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring">
                Sign in to Departmental Portal →
              </button>

              <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                  What this role can and cannot do
                </p>
                <ul className="space-y-1 max-h-[190px] overflow-y-auto pr-1">
                  {ALL_PERMISSIONS.map(p => {
                    const held = def.permissions.includes(p.id);
                    return (
                      <li key={p.id} className="flex items-start gap-2 text-[11.5px]">
                        <span className={held ? 'text-[var(--signal-rising)] font-bold' : 'text-[var(--ink-tertiary)]'}>
                          {held ? '✓' : '✗'}
                        </span>
                        <span className={held ? 'text-[var(--ink)]' : 'text-[var(--ink-tertiary)] line-through'}>
                          {p.label}
                          <span className="text-[10px] mono text-[var(--ink-tertiary)] ml-1.5 no-underline inline-block">
                            {p.id}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <p className="text-[11px] text-[var(--ink-tertiary)] leading-relaxed pt-2 border-t border-[var(--border)]">
                Citizens and enterprises do not sign in here.{' '}
                <Link href="/login" className="gov-link font-semibold">Public portal login →</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black/30 text-slate-400 text-[11.5px]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex flex-wrap justify-between gap-2">
          <p>© {new Date().getFullYear()} Government of Maharashtra · Departmental Portal</p>
          <p>Unauthorised access is an offence under the Information Technology Act, 2000</p>
        </div>
      </footer>
    </div>
  );
}
