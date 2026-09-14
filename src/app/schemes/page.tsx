import Link from 'next/link';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { schemes } from '@/data/schemes';
import { courses } from '@/data/courses';
import { hiringPools } from '@/data/hiring';
import { formatCurrency, formatNumber } from '@/lib/utils';

export const metadata = {
  title: 'Schemes',
  description: 'Central and state skill development schemes — PMKVY 4.0, SANKALP, DGT-CTS and NAPS — and how this portal routes candidates and employers through them.',
};

export default function SchemesPage() {
  const totalSubsidy = hiringPools.reduce((a, p) => a + p.subsidyPerSeat * p.seatsRequired, 0);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <PageHeader
            eyebrow="Convergence"
            title="Central & State Schemes"
            description="How PMKVY 4.0, SANKALP, DGT-CTS and NAPS are routed here."
            breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Schemes' }]}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat label="Schemes converged" value={schemes.length}
              sub="Routed automatically per course" accent="var(--gov-navy)" />
            <Stat label="Courses mapped to a scheme"
              value={`${courses.filter(c => c.scheme).length}/${courses.length}`}
              sub="Remainder funded by the State" accent="var(--gov-navy)" />
            <Stat label="Subsidy committed across pools" value={formatCurrency(totalSubsidy)}
              sub="Released only against EPFO-verified placement" tone="positive" accent="var(--gov-navy)" />
            <Stat label="Seats under scheme funding"
              value={formatNumber(courses.filter(c => c.scheme).reduce((a, c) => a + c.currentSeats, 0))}
              sub="Current intake" accent="var(--gov-navy)" />
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-6">
            {schemes.map(s => {
              const mapped = courses.filter(c => c.scheme === s.code);
              return (
                <Card key={s.code} title={s.name}
                  subtitle={s.ministry}
                  action={<Badge variant="officer">{s.code}</Badge>}>
                  <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed mb-4">{s.description}</p>

                  <dl className="space-y-3 pb-4 border-b border-[var(--border)]">
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)]">
                        Financial support
                      </dt>
                      <dd className="text-[12.5px] text-[var(--ink)] mt-0.5">{s.funds}</dd>
                    </div>
                    <div>
                      <dt className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)]">
                        Eligibility
                      </dt>
                      <dd className="text-[12.5px] text-[var(--ink)] mt-0.5">{s.eligibility}</dd>
                    </div>
                  </dl>

                  <div className="pt-4">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                      Courses routed through this scheme ({mapped.length})
                    </p>
                    {mapped.length === 0 ? (
                      <p className="text-[12px] text-[var(--ink-tertiary)]">
                        No course in the pilot districts currently routes through {s.code}.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {mapped.slice(0, 5).map(c => (
                          <li key={c.id}>
                            <Link href={`/courses?id=${c.id}`}
                              className="flex items-center justify-between gap-2 text-[12px] hover:bg-[var(--surface)] px-2 py-1 rounded-sm focus-ring">
                              <span className="text-[var(--ink)] truncate">{c.name}</span>
                              <span className="mono text-[10.5px] text-[var(--ink-tertiary)] shrink-0">
                                {c.durationMonths} mo · {c.currentSeats} seats
                              </span>
                            </Link>
                          </li>
                        ))}
                        {mapped.length > 5 && (
                          <li className="text-[11.5px] text-[var(--ink-tertiary)] px-2">
                            and {mapped.length - 5} more
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card title="Where scheme money actually goes on this portal"
            subtitle="Same conditions for every scheme">
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                ['Seat is notified', 'Only against signed employer commitments.'],
                ['Training is delivered', 'Practicals verified by machine, not by register entry.'],
                ['Work-trial is cleared', 'Scorecard of 70 or above, from the employer.'],
                ['Payroll confirms it', 'EPFO shows them paid at or above the committed floor.'],
              ].map(([t, d], i) => (
                <li key={t} className="border border-[var(--border)] rounded-sm p-4">
                  <span className="w-7 h-7 grid place-items-center rounded-full bg-[var(--gov-navy)] text-white text-[12px] font-bold mono mb-2">
                    {i + 1}
                  </span>
                  <p className="text-[13px] font-bold text-[var(--ink)] leading-snug">{t}</p>
                  <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed mt-1.5">{d}</p>
                </li>
              ))}
            </ol>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div className="gov-card p-5">
              <h2 className="text-[15px] font-bold text-[var(--gov-navy)] mb-2">For candidates</h2>
              <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed mb-4">
                You do not apply to a scheme. Register once, pick a course or an RPL route, and the portal
                routes your seat to whichever scheme funds it.
              </p>
              <Link href="/register?role=student"
                className="inline-block text-white font-bold text-[13px] px-5 py-2.5 rounded-sm focus-ring"
                style={{ background: 'var(--accent-student)' }}>
                Register as a candidate →
              </Link>
            </div>
            <div className="gov-card p-5">
              <h2 className="text-[15px] font-bold text-[var(--gov-navy)] mb-2">For enterprises</h2>
              <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed mb-4">
                Apprenticeship reimbursement under NAPS and pool subsidy under PMKVY 4.0 are claimed from a
                single payroll declaration on your dashboard.
              </p>
              <Link href="/register?role=business"
                className="inline-block text-white font-bold text-[13px] px-5 py-2.5 rounded-sm focus-ring"
                style={{ background: 'var(--accent-employer)' }}>
                Register your enterprise →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
