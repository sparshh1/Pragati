'use client';

import Link from 'next/link';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { CITIZEN_NAV, PILLARS, NAV_ICONS } from '@/data/pillars';
import { districts } from '@/data/districts';
import { hiringPools, workTrials, poolSeatsCommitted, poolTrialStats, trialScore, TRIAL_PASS_THRESHOLD } from '@/data/hiring';
import { computeGapForDistrict } from '@/data/compute/gapAnalysis';
import { machines, idleHoursByDistrict } from '@/data/capacity';
import { payrollAudits } from '@/data/audit';
import { formatNumber } from '@/lib/utils';
import { SECTOR_LABELS, Sector } from '@/types';

export default function BusinessOverview() {
  const { account } = useCitizen();
  if (!account) return null;

  const district = districts.find(d => d.id === account.districtId)!;
  const gaps = computeGapForDistrict(account.districtId);
  const shortages = gaps.filter(g => g.gap > 0 && g.trend !== 'declining').slice(0, 4);

  const localPools = hiringPools.filter(p => p.districtId === account.districtId);
  const activeTrials = workTrials.filter(t => t.outcome === 'in-progress' || t.outcome === 'pending');
  const idle = idleHoursByDistrict(account.districtId);
  const myMachines = machines.filter(m => m.districtId === account.districtId && m.ownerType === 'private-factory');

  const clean = payrollAudits.filter(a => a.verdict === 'clean').length;

  return (
    <>
      <PageHeader
        eyebrow={`${account.entityType} · ${account.udyamNumber ?? account.ksid}`}
        title={account.name}
        description={
          <>
            {SECTOR_LABELS[(account.sector as Sector) ?? 'auto-ev']} · {account.employeeCount} on roll ·{' '}
            <strong>{district.name}</strong>
          </>
        }
      />

      <PageGuide />

      <div data-guide="stats" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 ks-stagger">
        <Stat label="Pools you can join" value={localPools.filter(p => p.status === 'forming').length}
          sub={`${localPools.length} pools in ${district.name}`} accent="var(--accent-employer)" />
        <Stat label="Candidates on trial" value={activeTrials.length}
          sub="On employer floors right now" tone="positive" accent="var(--accent-employer)" />
        <Stat label="Idle machine hours nearby" value={formatNumber(idle.idleHoursPerWeek)}
          sub={`${myMachines.length} private units already listed`} accent="var(--accent-employer)" />
        <Stat label="Verified skill shortages" value={shortages.length}
          sub="Trades where demand outruns training here" tone="warn" accent="var(--accent-employer)" />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          {/* ---- Hiring pools ---- */}
          <div data-guide="pipeline">
          <Card title="Your hiring pipeline"
            subtitle="Batches co-signed by employers in your district"
            action={<Link href="/dashboard/business/hiring" className="text-[12px] gov-link font-semibold">Manage pools →</Link>}>
            {localPools.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">No pools open in {district.name} yet.</p>
            ) : (
              <div className="space-y-3">
                {localPools.slice(0, 3).map(p => {
                  const committed = poolSeatsCommitted(p);
                  const stats = poolTrialStats(p.id);
                  return (
                    <div key={p.id} className="border border-[var(--border)] rounded-sm p-3.5">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-[var(--ink)]">{p.name}</p>
                          <p className="text-[11px] mono text-[var(--ink-tertiary)]">{p.id} · {p.members.length} employers signed</p>
                        </div>
                        <Badge variant={p.status === 'forming' ? 'warn' : p.status === 'placed' ? 'rising' : 'officer'} dot>
                          {p.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <Progress value={committed} max={p.seatsRequired}
                        color={committed >= p.seatsRequired ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                        label={`${committed}/${p.seatsRequired} seats committed`} showValue height={8} />
                      {stats.concluded > 0 && (
                        <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2">
                          {stats.passed} of {stats.concluded} candidates have cleared the work-trial gate ·{' '}
                          {stats.epfoConfirmed} confirmed on payroll
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          </div>

          {/* ---- Feature list ---- */}
          <Card title="Your services" subtitle="Everything you can do from this account">
            <div className="grid sm:grid-cols-2 gap-2.5">
              {CITIZEN_NAV.business.filter(n => n.pillarId).map(item => {
                const pillar = PILLARS.find(p => p.id === item.pillarId)!;
                return (
                  <Link key={item.href} href={item.href}
                    className="border border-[var(--border)] rounded-sm p-3.5 hover:border-[var(--accent-employer)] hover:shadow-sm transition-all group focus-ring">
                    <div className="flex items-start gap-2.5">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                        strokeLinecap="round" strokeLinejoin="round"
                        className="shrink-0 mt-0.5 text-[var(--accent-employer)]" stroke="currentColor">
                        <path d={NAV_ICONS[item.icon]} />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[var(--ink)] group-hover:text-[var(--accent-employer)] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11.5px] text-[var(--ink-secondary)] mt-1 leading-snug">{item.description}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mt-1.5">
                          {pillar.plain}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* ---- Shortages ---- */}
          <Card title={`Verified skill shortages in ${district.name}`}
            subtitle="Where a pool would fill fastest">
            <div className="space-y-2">
              {shortages.map(g => (
                <div key={g.skillId} className="flex items-center justify-between gap-3 border border-[var(--border)] rounded-sm px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--ink)]">{g.skillName}</p>
                    <p className="text-[11px] text-[var(--ink-tertiary)]">
                      {formatNumber(g.annualDemand)} verified vacancies/yr · {formatNumber(g.currentSupply)} seats
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-bold mono text-[var(--signal-warn)]">{formatNumber(g.gap)}</p>
                    <p className="text-[10px] text-[var(--ink-tertiary)]">short/yr</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/business/signals" className="text-[12.5px] gov-link font-semibold mt-3 inline-block">
              Post your own hiring demand →
            </Link>
          </Card>
        </div>

        <div className="space-y-5">

          <Card title="Recent work-trial outcomes" subtitle="Candidates scored on employers' own floors">
            <ul className="space-y-2.5">
              {workTrials.filter(t => t.outcome === 'passed' || t.outcome === 'failed').slice(0, 5).map(t => {
                const s = trialScore(t);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 border border-[var(--border)] rounded-sm px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-[var(--ink)] truncate">{t.candidateName}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{t.id}</p>
                    </div>
                    <span className={`shrink-0 text-[15px] font-bold mono ${
                      (s ?? 0) >= TRIAL_PASS_THRESHOLD ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'
                    }`}>{s}</span>
                  </li>
                );
              })}
            </ul>
            <Link href="/dashboard/business/hiring" className="text-[12.5px] gov-link font-semibold mt-3 inline-block">
              Score a candidate →
            </Link>
          </Card>

          <Card title="What you get out of this portal">
            <ol className="space-y-3">
              {[
                ['Vetted, not filtered', 'Cleared a shop-floor gate, not an exam hall.'],
                ['You set the wage floor', 'Your signed minimum. No race to the bottom.'],
                ['Shared training cost', 'Four MSMEs, one batch, a quarter each. State carries the subsidy.'],
                ['Idle capacity earns', 'Surplus shift time brokered at a rate you set.'],
                ['Faster subsidy clearance', 'One EPFO declaration reconciles automatically.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 grid place-items-center rounded-full text-[10.5px] font-bold text-white mt-0.5"
                    style={{ background: 'var(--accent-employer)' }}>{i + 1}</span>
                  <span>
                    <span className="block text-[12.5px] font-bold text-[var(--ink)]">{t}</span>
                    <span className="block text-[11.5px] text-[var(--ink-secondary)] leading-snug mt-0.5">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Stat label="Payroll declarations reconciled" value={`${clean}/${payrollAudits.length}`}
            sub="Clean reconciliations across the state this quarter" tone="positive"
            accent="var(--accent-employer)" />
        </div>
      </div>
    </>
  );
}
