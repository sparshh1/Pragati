'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const SLIDES = [
  {
    kicker: 'Registration open — Winter 2026 intake',
    title: 'Train for work that actually exists.',
    body:
      'Every seat on this portal is opened against verified hiring demand. Courses with no employer behind them are not notified.',
    cta: { label: 'Register as a Candidate', href: '/register?role=student' },
    alt: { label: 'View Course Catalogue', href: '/courses' },
    tone: '#0b2d5c',
  },
  {
    kicker: 'For MSMEs & Enterprises',
    title: 'Pool your hiring. Get operators, not certificates.',
    body:
      'Four units that each need six people can co-sign one batch. Candidates reach you through a paid work-trial, so you hire what you have already seen on your own floor.',
    cta: { label: 'Register your Enterprise', href: '/register?role=business' },
    alt: { label: 'How hiring pools work', href: '/about#pillars' },
    tone: '#1b5e3f',
  },
  {
    kicker: 'Recognition of Prior Learning',
    title: 'Nine years on the job is a qualification.',
    body:
      'If you already do the work, RPL certifies you at the level your evidence supports and prescribes only the bridge hours you still need.',
    cta: { label: 'Check RPL Eligibility', href: '/register?role=student' },
    alt: { label: 'Talk to us in Marathi', href: '/help' },
    tone: '#a8420b',
  },
];

export function HeroBanner() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI(x => (x + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  const s = SLIDES[i];

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)]"
      style={{ background: `linear-gradient(105deg, ${s.tone} 0%, #07203f 68%, #051729 100%)` }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Portal highlights"
    >
      {/* Faint engineering-grid texture, as on departmental banners */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-4 py-12 md:py-16 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
        <div key={i} className="text-white">
          <p className="inline-block text-[11px] font-bold uppercase tracking-[0.12em] bg-[var(--gov-saffron)] text-[var(--gov-navy-dark)] px-2.5 py-1 rounded-sm mb-4">
            {s.kicker}
          </p>
          <h2 className="text-[28px] sm:text-[38px] lg:text-[44px] font-bold leading-[1.12] tracking-tight max-w-2xl">
            {s.title}
          </h2>
          <p className="text-[14.5px] sm:text-[16px] text-slate-200 mt-4 max-w-2xl leading-relaxed">
            {s.body}
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link
              href={s.cta.href}
              className="bg-white text-[var(--gov-navy)] px-5 py-2.5 text-[14px] font-bold rounded-sm hover:bg-slate-100 focus-ring"
            >
              {s.cta.label} →
            </Link>
            <Link
              href={s.alt.href}
              className="border border-white/60 text-white px-5 py-2.5 text-[14px] font-semibold rounded-sm hover:bg-white/10 focus-ring"
            >
              {s.alt.label}
            </Link>
          </div>

          <div className="flex items-center gap-2 mt-8" role="tablist" aria-label="Choose slide">
            {SLIDES.map((sl, n) => (
              <button
                key={sl.title}
                role="tab"
                aria-selected={n === i}
                aria-label={`Slide ${n + 1}`}
                onClick={() => setI(n)}
                className={`h-1.5 rounded-full transition-all focus-ring ${
                  n === i ? 'w-9 bg-[var(--gov-saffron)]' : 'w-4 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live figures panel — the kind of summary box departmental sites carry */}
        <div className="bg-white/95 backdrop-blur-sm border border-white/30 rounded-sm p-5 shadow-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--gov-navy)] pb-2 mb-3 border-b border-[var(--border)]">
            Portal at a glance
          </p>
          <dl className="space-y-3">
            {[
              { k: 'Candidates registered', v: '4,82,610', s: '+12,418 this month' },
              { k: 'Enterprises & MSMEs onboarded', v: '11,247', s: '1,860 in active hiring pools' },
              { k: 'Seats opened against signed demand', v: '38,900', s: 'Across 6 pilot districts' },
              { k: 'Placements confirmed on EPFO payroll', v: '26,431', s: 'Verified, not self-declared' },
            ].map(x => (
              <div key={x.k} className="flex items-baseline justify-between gap-3">
                <dt className="text-[12.5px] text-[var(--ink-secondary)]">{x.k}</dt>
                <dd className="text-right">
                  <span className="block text-[18px] font-bold mono text-[var(--gov-navy)] leading-tight">{x.v}</span>
                  <span className="block text-[10.5px] text-[var(--ink-tertiary)]">{x.s}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
