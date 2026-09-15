'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import {
  hiringPools, workTrials, poolSeatsCommitted, poolWageFloor,
  trialScore, poolTrialStats, TRIAL_PASS_THRESHOLD, OUTCOME_LABEL,
} from '@/data/hiring';
import { employers } from '@/data/employers';
import { getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { WorkTrial, HiringPool } from '@/types';

const STATUS_TONE = {
  forming: 'warn', locked: 'officer', 'in-training': 'officer', trialling: 'student', placed: 'rising',
} as const;

const STATUS_COPY: Record<HiringPool['status'], string> = {
  forming: 'Employers still signing: seats not yet notified',
  locked: 'Commitments complete: batch notified',
  'in-training': 'Batch in classroom and workshop',
  trialling: 'Candidates on employer floors',
  placed: 'Placements confirmed on payroll',
};

export default function StudentJobsPage() {
  const { account } = useCitizen();
  const [districtId, setDistrictId] = useState(account?.districtId ?? 'pune');
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [openTrial, setOpenTrial] = useState<WorkTrial | null>(workTrials[0]);

  const pools = hiringPools.filter(p => p.districtId === districtId);
  const stipendRange = '₹380 – ₹420';

  const allConcluded = workTrials.filter(t => t.outcome === 'passed' || t.outcome === 'failed');
  const passRate = Math.round(
    (workTrials.filter(t => t.outcome === 'passed').length / (allConcluded.length || 1)) * 100,
  );

  return (
    <>
      <PageHeader
        eyebrow="Jobs"
        title="Jobs near you"
        description="Openings where an employer has already committed to hire."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Jobs & Work Trials' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Open pools near you" value={pools.filter(p => p.status !== 'placed').length}
          sub={`${formatNumber(pools.reduce((a, p) => a + poolSeatsCommitted(p), 0))} seats employer-committed`}
          accent="var(--accent-student)" />
        <Stat label="Daily pay during trial" value={stipendRange} sub="per day, paid by the State" tone="positive"
          accent="var(--accent-student)" />
        <Stat label="How many pass" value={`${passRate}%`} sub={`Pass mark is ${TRIAL_PASS_THRESHOLD} of 100`}
          tone={passRate >= 70 ? 'positive' : 'warn'} accent="var(--accent-student)" />
        <Stat label="Lowest pay guaranteed" value={pools.length ? formatCurrency(Math.min(...pools.map(poolWageFloor))) : '-'}
          sub="Employers cannot offer below their signed floor" accent="var(--accent-student)" />
      </div>

      <div className="mb-5">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <h2 className="text-[17px] font-bold text-[var(--gov-navy)]">MSME Hiring Pools</h2>
          <div className="min-w-[180px]">
            <label className="gov-label" htmlFor="pool-district">District</label>
            <select id="pool-district" className="gov-input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {pools.length === 0 ? (
          <Card><p className="text-[13px] text-[var(--ink-tertiary)]">No pools are currently open in this district.</p></Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {pools.map(p => {
              const skill = getSkill(p.skillId);
              const committed = poolSeatsCommitted(p);
              const stats = poolTrialStats(p.id);
              const canApply = p.status === 'forming' || p.status === 'locked';
              return (
                <Card key={p.id} title={p.name}
                  subtitle={`${skill?.name} · batch starts ${new Date(p.batchStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                  action={<Badge variant={STATUS_TONE[p.status]} dot>{p.status.replace('-', ' ')}</Badge>}
                >
                  <p className="text-[11.5px] text-[var(--ink-secondary)] mb-3">{STATUS_COPY[p.status]}</p>

                  <Progress
                    value={committed} max={p.seatsRequired}
                    color={committed >= p.seatsRequired ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                    label={`${committed} of ${p.seatsRequired} seats committed by employers`} showValue height={9}
                  />

                  <div className="mt-3.5">
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                      Employers who have signed
                    </p>
                    <ul className="space-y-1">
                      {p.members.map(m => {
                        const emp = employers.find(e => e.id === m.employerId);
                        return (
                          <li key={m.employerId} className="flex items-center justify-between gap-2 text-[12px]">
                            <span className="text-[var(--ink)] min-w-0 truncate">
                              {emp?.name ?? m.employerId}
                              <span className="text-[10.5px] text-[var(--ink-tertiary)] ml-1.5">({emp?.type})</span>
                            </span>
                            <span className="shrink-0 mono text-[var(--ink-secondary)]">
                              {m.seatsCommitted} seats @ {formatCurrency(m.wageFloor)}+
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-[var(--border)] text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Wage floor</p>
                      <p className="text-[13.5px] font-bold mono">{formatCurrency(poolWageFloor(p))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Trials cleared</p>
                      <p className="text-[13.5px] font-bold mono">{stats.passed}/{stats.concluded || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Centre</p>
                      <p className="text-[11px] font-semibold mono truncate" title={p.trainingCentreId}>
                        {p.trainingCentreId.replace('ITI-', '')}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={!canApply || applied[p.id]}
                    onClick={() => setApplied(a => ({ ...a, [p.id]: true }))}
                    className="w-full mt-3.5 text-[13px] font-bold py-2.5 rounded-sm focus-ring disabled:cursor-not-allowed transition-colors"
                    style={
                      applied[p.id]
                        ? { background: 'var(--signal-rising-light)', color: 'var(--signal-rising)', border: '1px solid var(--signal-rising)' }
                        : canApply
                          ? { background: 'var(--accent-student)', color: '#fff' }
                          : { background: 'var(--surface-alt)', color: 'var(--ink-tertiary)', border: '1px solid var(--border)' }
                    }
                  >
                    {applied[p.id]
                      ? '✓ Application submitted: you will be called for counselling'
                      : canApply
                        ? 'Apply to this pool →'
                        : 'Applications closed for this batch'}
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Work-trial gate ---- */}
      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
        <Card title="How people are being scored" subtitle="Click a row for the scorecard">
          <Table
            columns={[
              { key: 'name', header: 'Candidate', render: (t: WorkTrial) => (
                <div>
                  <p className="font-semibold">{t.candidateName}</p>
                  <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{t.candidateKsid}</p>
                </div>
              ), sortValue: t => t.candidateName },
              { key: 'emp', header: 'Employer', hideBelow: 'md', render: (t: WorkTrial) => (
                <span className="text-[12px]">{employers.find(e => e.id === t.employerId)?.name ?? t.employerId}</span>
              ) },
              { key: 'score', header: 'Gate score', align: 'right', render: (t: WorkTrial) => {
                const s = trialScore(t);
                return s === null
                  ? <span className="text-[var(--ink-tertiary)]">in progress</span>
                  : <span className={`mono font-bold ${s >= TRIAL_PASS_THRESHOLD ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}`}>{s}</span>;
              }, sortValue: t => trialScore(t) ?? -1 },
              { key: 'outcome', header: 'Outcome', render: (t: WorkTrial) => (
                <Badge variant={
                  t.outcome === 'passed' ? 'rising' : t.outcome === 'failed' ? 'declining'
                  : t.outcome === 'in-progress' ? 'warn' : 'stable'
                }>{OUTCOME_LABEL[t.outcome]}</Badge>
              ) },
              { key: 'epfo', header: 'On payroll', align: 'center', hideBelow: 'lg', render: (t: WorkTrial) =>
                t.epfoConfirmedOn
                  ? <span className="text-[var(--signal-rising)] font-bold" title={`Confirmed ${t.epfoConfirmedOn}`}>✓</span>
                  : <span className="text-[var(--ink-tertiary)]">: </span> },
            ]}
            rows={workTrials}
            rowKey={t => t.id}
            onRowClick={setOpenTrial}
            highlight={t => (t.id === openTrial?.id ? 'var(--accent-student)' : undefined)}
          />
        </Card>

        <Card title={openTrial ? `Scorecard: ${openTrial.candidateName}` : 'Scorecard'}
          subtitle={openTrial ? `${openTrial.id} · ${openTrial.durationDays}-day trial from ${openTrial.startDate}` : undefined}>
          {!openTrial ? (
            <p className="text-[13px] text-[var(--ink-tertiary)]">Select a trial to view its scorecard.</p>
          ) : (
            <>
              <div className="space-y-2.5">
                {openTrial.scorecard.map(c => (
                  <div key={c.criterion}>
                    <div className="flex justify-between items-baseline gap-2 mb-1">
                      <span className="text-[12px] text-[var(--ink-secondary)]">{c.criterion}</span>
                      <span className="text-[11px] mono shrink-0">
                        <span className="text-[var(--ink-tertiary)]">w{c.weight}</span>{' '}
                        <span className="font-bold text-[var(--ink)]">{c.score ?? '-'}</span>
                      </span>
                    </div>
                    <Progress
                      value={c.score ?? 0}
                      color={c.score === null ? 'var(--border-strong)'
                        : c.score >= TRIAL_PASS_THRESHOLD ? 'var(--signal-rising)' : 'var(--signal-declining)'}
                      height={6}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <div className="flex items-baseline justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wide text-[var(--ink-secondary)]">
                    Weighted gate score
                  </span>
                  <span className="text-[24px] font-bold mono"
                    style={{ color: (trialScore(openTrial) ?? 0) >= TRIAL_PASS_THRESHOLD ? 'var(--signal-rising)' : 'var(--signal-declining)' }}>
                    {trialScore(openTrial) ?? '-'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--ink-tertiary)]">
                  Pass mark {TRIAL_PASS_THRESHOLD}. Below this, no placement is recorded and no subsidy moves.
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                  Supervisor remarks
                </p>
                <p className="text-[12.5px] text-[var(--ink-secondary)] italic leading-relaxed">
                  &ldquo;{openTrial.supervisorRemarks}&rdquo;
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)]">Stipend earned</p>
                  <p className="text-[15px] font-bold mono">
                    {formatCurrency(openTrial.stipendPerDay * openTrial.durationDays)}
                  </p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)]">
                    {formatCurrency(openTrial.stipendPerDay)}/day × {openTrial.durationDays}
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)]">Offer</p>
                  <p className="text-[15px] font-bold mono">
                    {openTrial.offerCtc ? `${(openTrial.offerCtc / 100000).toFixed(2)} L` : '-'}
                  </p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)]">
                    {openTrial.epfoConfirmedOn ? `EPFO confirmed ${openTrial.epfoConfirmedOn}` : 'Not yet on payroll'}
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
