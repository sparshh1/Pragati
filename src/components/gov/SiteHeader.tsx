'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Emblem, SetuMark } from './Emblem';
import { AccessibilityBar } from './AccessibilityBar';
import { useCitizen } from '@/lib/session';

const NAV: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
  { href: '/', label: 'Home' },
  {
    href: '/about',
    label: 'About',
    children: [
      { href: '/about', label: 'About the Mission' },
      { href: '/about#pillars', label: 'Six Operating Pillars' },
      { href: '/about#institutions', label: 'Implementing Institutions' },
    ],
  },
  {
    href: '/courses',
    label: 'Courses & Syllabus',
    children: [
      { href: '/courses', label: 'Course Catalogue' },
      { href: '/courses?type=ITI', label: 'ITI Trades (NCVT)' },
      { href: '/courses?type=PMKVY', label: 'PMKVY 4.0 Short-Term' },
      { href: '/courses?type=Polytechnic', label: 'Polytechnic Diplomas' },
    ],
  },
  { href: '/demand', label: 'Labour Market Data' },
  { href: '/schemes', label: 'Schemes' },
  { href: '/help', label: 'Help & Grievance' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { account, ready, logout } = useCitizen();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashHref = account ? `/dashboard/${account.role}` : '/login';

  return (
    <header className="no-print">
      <AccessibilityBar />

      {/* ---------------- Masthead ---------------- */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 focus-ring shrink-0">
            <Emblem size={38} className="text-[var(--gov-navy)]" />
            <span className="hidden sm:block w-px h-12 bg-[var(--border)]" />
            <SetuMark size={42} className="hidden sm:block" />
            <span className="leading-tight">
              <span className="block text-[19px] sm:text-[22px] font-bold text-[var(--gov-navy)] tracking-tight">
                Kaushal Setu
              </span>
              <span className="block text-[12px] sm:text-[13px] text-[var(--ink-secondary)]">
                कौशल सेतु — Skill Bridge Portal
              </span>
              <span className="hidden md:block text-[10.5px] text-[var(--ink-tertiary)] uppercase tracking-[0.07em] mt-0.5">
                Skill Development &amp; Entrepreneurship Dept., Govt. of Maharashtra
              </span>
            </span>
          </Link>

          <div className="flex-1" />

          <form
            className="hidden lg:flex items-center"
            role="search"
            onSubmit={e => e.preventDefault()}
          >
            <label htmlFor="site-search" className="sr-only">Search the portal</label>
            <input
              id="site-search"
              type="search"
              placeholder="Search courses, skills, schemes…"
              className="w-60 border border-[var(--border-strong)] rounded-l-sm px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--gov-navy)]/25"
            />
            <button
              type="submit"
              className="bg-[var(--gov-navy)] text-white px-3 py-[7px] rounded-r-sm text-[13px] hover:bg-[var(--gov-navy-light)] focus-ring"
              aria-label="Search"
            >
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <line x1="12.8" y1="12.8" x2="17.5" y2="17.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          {ready && !account && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 text-[13px] font-semibold text-[var(--gov-navy)] border border-[var(--gov-navy)] rounded-sm hover:bg-[var(--accent-officer-light)] focus-ring"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-2 text-[13px] font-semibold text-white bg-[var(--gov-navy)] rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring"
              >
                Register
              </Link>
            </div>
          )}

          {ready && account && (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href={dashHref}
                className="flex items-center gap-2.5 px-3 py-1.5 border border-[var(--border-strong)] rounded-sm hover:border-[var(--gov-navy)] focus-ring"
              >
                <span
                  className="w-8 h-8 rounded-full grid place-items-center text-[12px] font-bold text-white"
                  style={{
                    background: account.role === 'student' ? 'var(--accent-student)' : 'var(--accent-employer)',
                  }}
                >
                  {account.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="leading-tight text-left">
                  <span className="block text-[12.5px] font-semibold text-[var(--ink)] max-w-[130px] truncate">
                    {account.name}
                  </span>
                  <span className="block text-[10.5px] text-[var(--ink-tertiary)] mono">{account.ksid}</span>
                </span>
              </Link>
              <button
                onClick={logout}
                className="px-2.5 py-2 text-[12px] text-[var(--ink-secondary)] border border-[var(--border)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring"
              >
                Logout
              </button>
            </div>
          )}

          <button
            className="md:hidden p-2 border border-[var(--border-strong)] rounded-sm"
            onClick={() => setMobileOpen(o => !o)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="5.5" x2="17" y2="5.5" /><line x1="3" y1="10" x2="17" y2="10" /><line x1="3" y1="14.5" x2="17" y2="14.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------------- Primary navigation ---------------- */}
      <nav className="bg-[var(--gov-navy)] text-white" aria-label="Primary">
        <div className="mx-auto max-w-[1400px] px-4">
          <ul className="hidden md:flex items-stretch">
            {NAV.map(item => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('?')[0]);
              return (
                <li
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-[13.5px] font-medium border-r border-white/15 transition-colors focus-ring ${
                      active ? 'bg-[var(--gov-saffron)] text-[var(--gov-navy-dark)] font-semibold' : 'hover:bg-[var(--gov-navy-light)]'
                    }`}
                  >
                    {item.label}
                    {item.children && (
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                        <path d="M1 3l4 4 4-4z" />
                      </svg>
                    )}
                  </Link>
                  {item.children && openMenu === item.label && (
                    <ul className="absolute left-0 top-full z-40 w-64 bg-white border border-[var(--border)] shadow-lg py-1">
                      {item.children.map(c => (
                        <li key={c.href + c.label}>
                          <Link
                            href={c.href}
                            className="block px-4 py-2 text-[13px] text-[var(--ink)] hover:bg-[var(--accent-officer-light)] hover:text-[var(--gov-navy)] focus-ring"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            <li className="ml-auto">
              <Link
                href="/gov"
                className="flex items-center gap-2 h-full px-4 py-2.5 text-[13px] font-semibold bg-[var(--gov-navy-dark)] hover:bg-black/40 border-l border-white/15 focus-ring"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="7" width="10" height="7" rx="1" />
                  <path d="M5.5 7V4.8a2.5 2.5 0 015 0V7" />
                </svg>
                Departmental Login
              </Link>
            </li>
          </ul>

          {/* Mobile menu */}
          {mobileOpen && (
            <ul className="md:hidden py-2">
              {NAV.map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-2 py-2 text-[14px] border-b border-white/10"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="flex gap-2 pt-3 pb-2">
                {account ? (
                  <Link href={dashHref} onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center bg-white text-[var(--gov-navy)] font-semibold py-2 text-[13px] rounded-sm">
                    My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center border border-white py-2 text-[13px] rounded-sm">Login</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 text-center bg-white text-[var(--gov-navy)] font-semibold py-2 text-[13px] rounded-sm">Register</Link>
                  </>
                )}
              </li>
              <li>
                <Link href="/gov" onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-[13px] bg-[var(--gov-navy-dark)] rounded-sm">
                  Departmental Login →
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <div className="h-[3px] tricolour-bar" />
    </header>
  );
}
