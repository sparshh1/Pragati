import Link from 'next/link';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { HeroBanner } from '@/components/home/HeroBanner';
import { NoticeBoard } from '@/components/home/NoticeBoard';
import { PILLARS } from '@/data/pillars';
import { districts } from '@/data/districts';
import { allSeatCalculations } from '@/data/capacity';
import { filterImpact } from '@/data/signals';
import { auditStats } from '@/data/audit';
import { formatNumber, formatCurrency } from '@/lib/utils';

const QUICK_LINKS = [
  { label: 'All courses and what they teach', sub: '39 courses · full subject list', href: '/courses', icon: 'book' },
  { label: 'Jobs in your district', sub: 'Real hiring numbers, not job-board noise', href: '/demand', icon: 'chart' },
  { label: 'Certificate for work I already do', sub: 'No need to repeat a full course', href: '/register?role=student', icon: 'badge' },
  { label: 'Hire together with other firms', sub: 'Share one training batch', href: '/register?role=business', icon: 'factory' },
  { label: 'Central & State Schemes', sub: 'PMKVY 4.0 · SANKALP · NAPS · DGT-CTS', href: '/schemes', icon: 'doc' },
  { label: 'Help & complaints', sub: 'Speak to us in 4 languages', href: '/help', icon: 'phone' },
];

const ICONS: Record<string, React.ReactNode> = {
  book: <path d="M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5zM20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5z" />,
  chart: <path d="M4 20h16M7 16V9m5 7V4m5 12v-5" />,
  badge: <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z" />,
  factory: <path d="M3 20h18M5 20V9l5 3.5V9l5 3.5V6h4v14" />,
  doc: <path d="M6 3h8l4 4v14H6zM14 3v4h4" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a12 12 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z" />,
};

export default function HomePage() {
  const seatCalcs = allSeatCalculations();
  const impact = filterImpact();
  const audit = auditStats();
  const totalGhost = seatCalcs.reduce((a, s) => a + s.ghostSeats, 0);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <SiteHeader />

      <main id="main-content" className="flex-1">
        <HeroBanner />

        {/* ---------- Registration split: the one decision that segregates the portal ---------- */}
        <section className="bg-white border-b border-[var(--border)]">
          <div className="mx-auto max-w-[1400px] px-4 py-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-[22px] font-bold text-[var(--gov-navy)] inline-block gov-rule">
                Register on the Portal
              </h2>
              <p className="text-[13.5px] text-[var(--ink-secondary)] mt-4 leading-relaxed">
                Pick who you are. Students and businesses fill the same form, then see different screens.
                One mobile number can only hold one role.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
              <RoleCard
                role="student"
                accent="var(--accent-student)"
                tint="var(--accent-student-light)"
                title="Candidate / Student"
                titleHi="उमेदवार / विद्यार्थी"
                who="School-leavers, ITI students, job-seekers, and people who already work but have no certificate."
                services={[
                  'See which trades actually have jobs near you',
                  'Get a certificate for work you already do',
                  'Move from a shrinking trade to a growing one',
                  'Jobs where the employer has already promised to hire',
                  'Book machine time to practise on',
                  'Ask questions by speaking, in your own language',
                ]}
              />
              <RoleCard
                role="business"
                accent="var(--accent-employer)"
                tint="var(--accent-employer-light)"
                title="Enterprise / MSME"
                titleHi="उद्योग / सूक्ष्म, लघु व मध्यम उद्योग"
                who="Small and medium businesses that need trained people in the six pilot districts."
                services={[
                  'Tell us who you need to hire',
                  'Share a training batch with other small firms',
                  'Try people on your own floor before hiring them',
                  'Say what should and should not be taught',
                  'Earn from machines you are not using',
                  'Get your existing workers officially certified',
                ]}
              />
            </div>

            <p className="text-center text-[12.5px] text-[var(--ink-secondary)] mt-6">
              Already registered?{' '}
              <Link href="/login" className="gov-link font-semibold">Login to your dashboard</Link>
              {'  ·  '}
              Government officer?{' '}
              <Link href="/gov" className="gov-link font-semibold">Departmental portal</Link>
            </p>
          </div>
        </section>

        {/* ---------- Quick links + notices ---------- */}
        <section className="mx-auto max-w-[1400px] px-4 py-10 grid lg:grid-cols-[1.9fr_1fr] gap-6">
          <div>
            <h2 className="text-[19px] font-bold text-[var(--gov-navy)] gov-rule mb-5">Citizen Services</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {QUICK_LINKS.map(q => (
                <Link
                  key={q.label}
                  href={q.href}
                  className="gov-card p-4 flex items-start gap-3 hover:border-[var(--gov-navy)] hover:shadow-sm transition-all group focus-ring"
                >
                  <span className="w-9 h-9 shrink-0 grid place-items-center rounded-sm bg-[var(--accent-officer-light)] text-[var(--gov-navy)] group-hover:bg-[var(--gov-navy)] group-hover:text-white transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      {ICONS[q.icon]}
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-semibold text-[var(--ink)] leading-snug">{q.label}</span>
                    <span className="block text-[11.5px] text-[var(--ink-tertiary)] mt-1 leading-snug">{q.sub}</span>
                  </span>
                </Link>
              ))}
            </div>

            {/* Evidence strip: what the engine has actually done */}
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              {[
                { v: `${impact.removedPercent}%`, k: 'of job adverts found to be fake', s: `${formatNumber(impact.raw)} claims screened down to ${formatNumber(impact.weighted)}` },
                { v: formatNumber(totalGhost), k: 'training places with nothing behind them', s: 'Seats notified above the districts’ hard physical limits' },
                { v: formatCurrency(audit.subsidyAtRisk), k: 'held back from centres that faked results', s: `${audit.ghost} 'jobs' where no salary was ever paid` },
              ].map(x => (
                <div key={x.k} className="gov-card p-4 border-t-[3px]" style={{ borderTopColor: 'var(--gov-saffron)' }}>
                  <p className="text-[24px] font-bold mono text-[var(--gov-navy)] leading-none">{x.v}</p>
                  <p className="text-[12px] font-semibold text-[var(--ink)] mt-1.5">{x.k}</p>
                  <p className="text-[11px] text-[var(--ink-tertiary)] mt-1 leading-snug">{x.s}</p>
                </div>
              ))}
            </div>
          </div>

          <NoticeBoard />
        </section>

        {/* ---------- Six operating pillars ---------- */}
        <section id="pillars" className="bg-white border-y border-[var(--border)]">
          <div className="mx-auto max-w-[1400px] px-4 py-12">
            <div className="max-w-3xl mb-8">
              <h2 className="text-[22px] font-bold text-[var(--gov-navy)] gov-rule">How the Portal Works</h2>
              <p className="text-[13.5px] text-[var(--ink-secondary)] mt-4 leading-relaxed">
                Six things run behind every screen. Each one has a clear result for the candidate,
                for industry, and for the State, and you can try each one in the relevant dashboard.
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PILLARS.map((p, i) => (
                <article key={p.id} className="gov-card p-5 flex flex-col hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-8 h-8 shrink-0 grid place-items-center rounded-sm bg-[var(--gov-navy)] text-white text-[13px] font-bold mono">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-[14.5px] font-bold text-[var(--gov-navy)] leading-snug pt-0.5">{p.plain}</h3>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.mechanisms.map(m => (
                      <span key={m} className="text-[10.5px] font-semibold bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--ink-secondary)] px-2 py-0.5 rounded-sm">
                        {m}
                      </span>
                    ))}
                  </div>

                  <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed flex-1">{p.summary}</p>

                  <dl className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5">
                    {[
                      ['Candidate', p.outcomes.student, 'var(--accent-student)'],
                      ['Industry', p.outcomes.business, 'var(--accent-employer)'],
                      ['State', p.outcomes.government, 'var(--accent-officer)'],
                    ].map(([k, v, c]) => (
                      <div key={k as string} className="flex gap-2 text-[11.5px]">
                        <dt className="w-[62px] shrink-0 font-bold" style={{ color: c as string }}>{k}</dt>
                        <dd className="text-[var(--ink-secondary)] leading-snug">{v as string}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- District snapshot ---------- */}
        <section className="mx-auto max-w-[1400px] px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-[19px] font-bold text-[var(--gov-navy)] gov-rule">Pilot Districts</h2>
              <p className="text-[13px] text-[var(--ink-secondary)] mt-3">
                Phase I. Seat numbers below stop at what each district can actually run: teachers, benches, beds or money.
              </p>
            </div>
            <Link href="/demand" className="text-[13px] gov-link font-semibold">
              Open the jobs dashboard →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {districts.map(d => {
              const calc = seatCalcs.find(s => s.districtId === d.id)!;
              return (
                <Link
                  key={d.id}
                  href={`/demand?district=${d.id}`}
                  className="gov-card p-4 hover:border-[var(--gov-navy)] transition-colors focus-ring"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-[15px] font-bold text-[var(--gov-navy)]">{d.name}</h3>
                    <span className="text-[11px] mono text-[var(--ink-tertiary)]">
                      {(d.population / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-1 line-clamp-1">
                    {d.industries.slice(0, 3).join(' · ')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--ink-tertiary)] font-semibold">Honest seat limit</p>
                      <p className="text-[16px] font-bold mono text-[var(--ink)]">{formatNumber(calc.hardLimit)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--ink-tertiary)] font-semibold">What runs out first</p>
                      <p className="text-[13px] font-semibold text-[var(--signal-warn)] capitalize pt-0.5">
                        {calc.bindingConstraint}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ---------- Departmental portal callout ---------- */}
        <section className="bg-[var(--gov-navy-dark)] text-white">
          <div className="mx-auto max-w-[1400px] px-4 py-9 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-4 max-w-2xl">
              <span className="w-11 h-11 shrink-0 grid place-items-center rounded-sm bg-white/10 border border-white/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="4" y="10" width="16" height="11" rx="1.5" />
                  <path d="M8 10V6.8a4 4 0 018 0V10" />
                </svg>
              </span>
              <div>
                <h2 className="text-[17px] font-bold">Officer login (restricted)</h2>
                <p className="text-[12.5px] text-slate-300 mt-1.5 leading-relaxed">
                  Access is by role. Every action is written down. A district officer cannot open
                  another district&rsquo;s records.
                </p>
              </div>
            </div>
            <Link
              href="/gov"
              className="shrink-0 bg-[var(--gov-saffron)] text-[var(--gov-navy-dark)] px-6 py-3 text-[14px] font-bold rounded-sm hover:brightness-105 focus-ring"
            >
              Officer Login →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function RoleCard({
  role, accent, tint, title, titleHi, who, services,
}: {
  role: 'student' | 'business';
  accent: string; tint: string; title: string; titleHi: string; who: string; services: string[];
}) {
  return (
    <div className="gov-card flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5" style={{ background: accent }} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          <span className="w-11 h-11 shrink-0 grid place-items-center rounded-sm" style={{ background: tint, color: accent }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {role === 'student'
                ? <><path d="M12 4L2.5 9 12 14l9.5-5z" /><path d="M6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" /></>
                : <><path d="M3 21h18M5 21V8l5 3.2V8l5 3.2V5h4v16" /><path d="M9 21v-4h3v4" /></>}
            </svg>
          </span>
          <div>
            <h3 className="text-[17px] font-bold text-[var(--ink)] leading-tight">{title}</h3>
            <p className="text-[12px] text-[var(--ink-tertiary)] mt-0.5">{titleHi}</p>
          </div>
        </div>

        <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed mb-4">{who}</p>

        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--ink-secondary)] mb-2">
          Services on your dashboard
        </p>
        <ul className="space-y-1.5 flex-1">
          {services.map(s => (
            <li key={s} className="flex gap-2 text-[12.5px] text-[var(--ink-secondary)] leading-snug">
              <svg width="14" height="14" viewBox="0 0 16 16" className="shrink-0 mt-0.5" style={{ color: accent }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8.5l3.2 3.2L13 5" />
              </svg>
              {s}
            </li>
          ))}
        </ul>

        <Link
          href={`/register?role=${role}`}
          className="mt-5 block text-center text-white font-bold text-[14px] py-2.5 rounded-sm hover:brightness-110 focus-ring"
          style={{ background: accent }}
        >
          Register as {role === 'student' ? 'a Candidate' : 'an Enterprise'} →
        </Link>
      </div>
    </div>
  );
}
