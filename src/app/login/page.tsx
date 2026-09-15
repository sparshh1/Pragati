'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { useCitizen } from '@/lib/session';
import { Note } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCitizen();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'identify' | 'otp'>('identify');
  const [error, setError] = useState('');

  function proceed() {
    if (!identifier.trim()) { setError('Enter your mobile number, email or प्रgati ID.'); return; }
    setError('');
    setStage('otp');
  }

  function submit() {
    if (otp !== '123456') { setError('Incorrect OTP. For this demonstration the OTP is 123456.'); return; }
    const account = login(identifier);
    if (!account) {
      setError('No registration found against this identifier. Please register first.');
      setStage('identify');
      return;
    }
    // The role decided at registration is what routes the user — this is the
    // single point where the two audiences are separated.
    router.push(`/dashboard/${account.role}`);
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <div className="mx-auto max-w-5xl px-4 py-12 grid md:grid-cols-[1fr_1.1fr] gap-8 items-start">
          <div>
            <h1 className="text-[26px] font-bold text-[var(--gov-navy)] gov-rule">Portal Login</h1>
            <p className="text-[13.5px] text-[var(--ink-secondary)] mt-4 leading-relaxed">
              Candidates and enterprises log in here. You will be taken to the dashboard for the role you
              registered under — the two dashboards carry entirely different services.
            </p>

            <div className="mt-6 space-y-3">
              <Note tone="info" title="Government officers">
                Departmental users do not log in here. Use the{' '}
                <Link href="/gov" className="gov-link font-semibold">restricted departmental portal</Link>,
                where access is role-based and permission-gated.
              </Note>
              <Note tone="warn" title="No registration yet?">
                Registration takes about three minutes.{' '}
                <Link href="/register" className="gov-link font-semibold">Register now →</Link>
              </Note>
            </div>

            <div className="mt-6 gov-card p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-secondary)] mb-2">
                Having trouble?
              </p>
              <ul className="text-[12.5px] text-[var(--ink-secondary)] space-y-1.5">
                <li>Helpline <span className="mono font-semibold">1800-233-0202</span> — Marathi, Hindi, English, Urdu</li>
                <li>Voice login assistance available over IVR for candidates without a smartphone</li>
                <li>Visit any ITI or DSDEO office in your district with your Aadhaar</li>
              </ul>
            </div>
          </div>

          <div className="gov-card overflow-hidden">
            <div className="h-1.5 tricolour-bar" />
            <div className="p-6">
              {stage === 'identify' ? (
                <>
                  <h2 className="text-[17px] font-bold text-[var(--ink)] mb-1">Sign in</h2>
                  <p className="text-[12.5px] text-[var(--ink-secondary)] mb-5">
                    Use the mobile number, email or ID you registered with.
                  </p>
                  <label className="gov-label">Mobile number, email or प्रgati ID</label>
                  <input
                    className="gov-input"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="9876543210 · name@example.com · MH-CD-2026-418203"
                    onKeyDown={e => e.key === 'Enter' && proceed()}
                  />
                  {error && <p className="text-[11.5px] text-[var(--signal-declining)] mt-1.5">{error}</p>}
                  <button
                    onClick={proceed}
                    className="w-full mt-4 bg-[var(--gov-navy)] text-white font-bold text-[14.5px] py-3 rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring"
                  >
                    Send OTP →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setStage('identify'); setError(''); }}
                    className="text-[12px] gov-link mb-3">← Change identifier</button>
                  <h2 className="text-[17px] font-bold text-[var(--ink)] mb-1">Enter OTP</h2>
                  <p className="text-[12.5px] text-[var(--ink-secondary)] mb-5">
                    Sent to <span className="mono font-semibold">{identifier}</span>.
                    For this demonstration, enter <span className="mono font-bold">123456</span>.
                  </p>
                  <label className="gov-label">One-time password</label>
                  <input
                    className="gov-input mono tracking-[0.35em] text-center text-[18px]"
                    maxLength={6}
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    autoFocus
                  />
                  {error && <p className="text-[11.5px] text-[var(--signal-declining)] mt-1.5">{error}</p>}
                  <button
                    onClick={submit}
                    className="w-full mt-4 bg-[var(--gov-navy)] text-white font-bold text-[14.5px] py-3 rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring"
                  >
                    Login →
                  </button>
                </>
              )}

              <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-5 pt-4 border-t border-[var(--border)] leading-relaxed">
                By signing in you accept the portal terms and consent to verification of declared
                information against EPFO and Udyam records. Unauthorised access to this system is an
                offence under the Information Technology Act, 2000.
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
