'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useCitizen } from '@/lib/session';
import { CitizenRole } from '@/lib/rbac';
import { CITIZEN_NAV, NAV_ICONS, PILLARS } from '@/data/pillars';
import { districts } from '@/data/districts';
import { AccessibilityBar } from '@/components/gov/AccessibilityBar';
import { Emblem, SetuMark } from '@/components/gov/Emblem';
import { GuideOverlay } from '@/components/guide/GuideOverlay';
import { GuideLauncher } from '@/components/guide/GuideLauncher';

const ROLE_META: Record<CitizenRole, { label: string; labelHi: string; accent: string; tint: string }> = {
  student: { label: 'Candidate Dashboard', labelHi: 'उमेदवार डॅशबोर्ड', accent: 'var(--accent-student)', tint: 'var(--accent-student-light)' },
  business: { label: 'Enterprise Dashboard', labelHi: 'उद्योग डॅशबोर्ड', accent: 'var(--accent-employer)', tint: 'var(--accent-employer-light)' },
};

export function DashboardShell({ role, children }: { role: CitizenRole; children: ReactNode }) {
  const { account, ready, logout } = useCitizen();
  const router = useRouter();
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);

  // Route guard. Unregistered visitors are sent to login; a user who lands on
  // the wrong role's dashboard is moved to their own — the two never mix.
  useEffect(() => {
    if (!ready) return;
    if (!account) { router.replace('/login'); return; }
    if (account.role !== role) router.replace(`/dashboard/${account.role}`);
  }, [ready, account, role, router]);

  if (!ready || !account || account.role !== role) {
    return (
      <div className="min-h-screen grid place-items-center bg-[var(--surface)]">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto border-2 border-[var(--gov-navy)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[var(--ink-tertiary)] mt-3">Verifying your session…</p>
        </div>
      </div>
    );
  }

  const meta = ROLE_META[role];
  const nav = CITIZEN_NAV[role];
  const district = districts.find(d => d.id === account.districtId);

  return (
    <div className="min-h-screen flex flex-col">
      <AccessibilityBar />

      {/* Compact dashboard masthead */}
      <header className="bg-white border-b border-[var(--border)] no-print">
        <div className="mx-auto max-w-[1600px] px-4 py-2.5 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 focus-ring shrink-0">
            <Emblem size={28} className="text-[var(--gov-navy)]" />
            <SetuMark size={30} className="hidden sm:block" />
            <span className="leading-tight hidden sm:block">
              <span className="block text-[15px] font-bold text-[var(--gov-navy)]">Kaushal Setu</span>
              <span className="block text-[10px] text-[var(--ink-tertiary)] uppercase tracking-[0.06em]">
                Govt. of Maharashtra
              </span>
            </span>
          </Link>

          <span className="hidden md:block w-px h-8 bg-[var(--border)]" />
          <span className="hidden md:inline-block text-[13px] font-bold px-2.5 py-1 rounded-sm"
            style={{ background: meta.tint, color: meta.accent }}>
            {meta.label}
          </span>

          <div className="flex-1" />

          <div className="hidden lg:flex items-center gap-2 text-[11.5px] text-[var(--ink-tertiary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--signal-rising)]" />
            <span>{district?.name} district</span>
          </div>

          <div className="flex items-center gap-2 border-l border-[var(--border)] pl-3">
            <span className="w-8 h-8 rounded-full grid place-items-center text-[11.5px] font-bold text-white"
              style={{ background: meta.accent }}>
              {account.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="leading-tight hidden sm:block">
              <span className="block text-[12.5px] font-semibold max-w-[150px] truncate">{account.name}</span>
              <span className="block text-[10px] mono text-[var(--ink-tertiary)]">{account.ksid}</span>
            </span>
            <button onClick={() => { logout(); router.push('/'); }}
              className="ml-1 px-2.5 py-1.5 text-[11.5px] border border-[var(--border)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
              Logout
            </button>
          </div>

          <button className="lg:hidden p-2 border border-[var(--border-strong)] rounded-sm"
            onClick={() => setNavOpen(o => !o)} aria-label="Toggle dashboard menu" aria-expanded={navOpen}>
            <svg width="18" height="18" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="5.5" x2="17" y2="5.5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14.5" x2="17" y2="14.5" />
            </svg>
          </button>
        </div>
        <div className="h-[3px] tricolour-bar" />
      </header>

      <div className="flex-1 mx-auto max-w-[1600px] w-full px-4 py-5 flex gap-5">
        {/* ---------------- Role-specific feature list ---------------- */}
        <aside className={`${navOpen ? 'block' : 'hidden'} lg:block w-full lg:w-[268px] shrink-0 no-print`}>
          <nav data-guide="nav" className="gov-card sticky top-4 overflow-hidden" aria-label="Dashboard sections">
            <div className="px-4 py-3 border-b border-[var(--border)]" style={{ background: meta.tint }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: meta.accent }}>
                {role === 'student' ? 'Candidate Services' : 'Enterprise Services'}
              </p>
              <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
                {nav.length} modules · {meta.labelHi}
              </p>
            </div>

            <ul>
              {nav.map(item => {
                const active = pathname === item.href;
                const pillar = item.pillarId ? PILLARS.find(p => p.id === item.pillarId) : null;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      className={`flex items-start gap-2.5 px-3.5 py-2.5 border-b border-[var(--border)] last:border-0 transition-colors focus-ring ${
                        active ? 'bg-[var(--surface-alt)]' : 'hover:bg-[var(--surface)]'
                      }`}
                      style={active ? { boxShadow: `inset 3px 0 0 ${meta.accent}` } : undefined}
                      aria-current={active ? 'page' : undefined}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                        strokeLinecap="round" strokeLinejoin="round"
                        className="shrink-0 mt-0.5"
                        style={{ stroke: active ? meta.accent : 'var(--ink-tertiary)' }}>
                        <path d={NAV_ICONS[item.icon]} />
                      </svg>
                      <span className="min-w-0">
                        <span className={`block text-[13px] leading-snug ${active ? 'font-bold text-[var(--ink)]' : 'font-semibold text-[var(--ink-secondary)]'}`}>
                          {item.label}
                        </span>
                        <span className="block text-[10.5px] text-[var(--ink-tertiary)] leading-snug mt-0.5">
                          {item.description}
                        </span>
                        {pillar && (
                          <span className="inline-block mt-1 text-[9.5px] font-bold uppercase tracking-wide text-[var(--gov-navy)] bg-[var(--accent-officer-light)] px-1.5 py-[1px] rounded-sm">
                            Pillar {pillar.number}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="px-3.5 py-3 bg-[var(--surface-alt)] border-t border-[var(--border)]">
              <p className="text-[10.5px] text-[var(--ink-tertiary)] leading-relaxed">
                Registered {new Date(account.registeredOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                {' · '}
                {role === 'student' ? 'Candidate' : account.entityType} role
              </p>
              <Link href="/" className="text-[11.5px] gov-link font-semibold mt-1 inline-block">
                ← Back to public portal
              </Link>
            </div>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <GuideOverlay />
      <GuideLauncher />

      <footer className="border-t border-[var(--border)] bg-white no-print">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[var(--ink-tertiary)]">
          <p>© {new Date().getFullYear()} Dept. of Skill, Employment, Entrepreneurship &amp; Innovation, Govt. of Maharashtra</p>
          <p>Helpline <span className="mono">1800-233-0202</span> · Prototype for SIH 2026 (PS 26134)</p>
        </div>
      </footer>
    </div>
  );
}
