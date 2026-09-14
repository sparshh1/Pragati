'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  hiringPools, workTrials, poolSeatsCommitted, poolWageFloor,
  trialScore, poolTrialStats, TRIAL_PASS_THRESHOLD, OUTCOME_LABEL,
} from '@/data/hiring';
import { employers } from '@/data/employers';
import { getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { PILLARS } from '@/data/pillars';
import { WorkTrial } from '@/types';

export default function BusinessHiringPage() {
  const { account } = useCitizen();
  const pillar = PILLARS[1];
  const districtId = account?.districtId ?? 'pune';

  const [tab, setTab] = useState<'pools' | 'trials'>('pools');
  const [joinSeats, setJoinSeats] = useState<Record<string, number>>({});
  const [joinWage, setJoinWage] = useState<Record<string, number>>({});
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const [scoring, setScoring] = useState<WorkTrial | null>(
    workTrials.find(t => t.outcome === 'in-progress') ?? workTrials[0],
  );
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const pools = hiringPools.filter(p => p.districtId === districtId);
  const openPools = pools.filter(p => p.status === 'forming' || p.status === 'locked');

  const liveScores = scoring
    ? scoring.scorecard.map(c => ({ ...c, score: scores[c.criterion] ?? c.score }))
    : [];
  const liveTotal = liveScores.length && liveScores.every(c => c.score !== null)
    ? Math.round(
        liveScores.reduce((a, c) => a + c.weight * (c.score as number), 0) /
        liveScores.reduce((a, c) => a + c.weight, 0),
      )
    : null;

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number} — ${pillar.short}`}
        title="Hiring pools and work trials"
        description="Commit seats, then judge candidates on your own floor."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/business' }, { label: 'Hiring Pools & Trials' }]}
      />

      <PageGuide />

      <div className="flex gap-1 mb-5 border-b border-[var(--border)]" role="tablist">
        {([['pools', 'MSME Hiring Pools'], ['trials', 'Work-Trial Gate']] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition-colors focus-ring ${
              tab === id ? 'border-[var(--accent-employer)] text-[var(--accent-employer)]'
              : 'border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink)]'
            }`}>{label}</button>
        ))}
      </div>

      {tab === 'pools' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat label="Pools open to you" value={openPools.length}
              sub={`in ${districts.find(d => d.id === districtId)?.name}`} accent="var(--accent-employer)" />
            <Stat label="Seats still uncommitted"
              value={formatNumber(openPools.reduce((a, p) => a + Math.max(0, p.seatsRequired - poolSeatsCommitted(p)), 0))}
              sub="Across all open pools here" tone="warn" accent="var(--accent-employer)" />
            <Stat label="State subsidy per seat"
              value={pools.length ? formatCurrency(Math.max(...pools.map(p => p.subsidyPerSeat))) : '—'}
              sub="Released against verified placement" tone="positive" accent="var(--accent-employer)" />
            <Stat label="Employers already signed"
              value={pools.reduce((a, p) => a + p.members.length, 0)}
              sub="Across pools in your district" accent="var(--accent-employer)" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            {pools.map(p => {
              const committed = poolSeatsCommitted(p);
              const remaining = Math.max(0, p.seatsRequired - committed);
              const stats = poolTrialStats(p.id);
              const canJoin = (p.status === 'forming' || p.status === 'locked') && remaining > 0;
              const seats = joinSeats[p.id] ?? Math.min(6, remaining || 6);
              const wage = joinWage[p.id] ?? poolWageFloor(p);

              return (
                <Card key={p.id} title={p.name}
                  subtitle={`${getSkill(p.skillId)?.name} · ${p.trainingCentreId} · batch ${p.batchStartDate}`}
                  action={<Badge variant={p.status === 'forming' ? 'warn' : p.status === 'placed' ? 'rising' : 'officer'} dot>
                    {p.status.replace('-', ' ')}
                  </Badge>}>

                  <Progress value={committed} max={p.seatsRequired}
                    color={committed >= p.seatsRequired ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                    label={`${committed} of ${p.seatsRequired} seats committed · ${remaining} still open`}
                    showValue height={9} />

                  <table className="w-full mt-3.5 text-[12px]">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-1 font-semibold text-[var(--ink-tertiary)] text-[10.5px] uppercase tracking-wide">Employer</th>
                        <th className="text-right py-1 font-semibold text-[var(--ink-tertiary)] text-[10.5px] uppercase tracking-wide">Seats</th>
                        <th className="text-right py-1 font-semibold text-[var(--ink-tertiary)] text-[10.5px] uppercase tracking-wide">Wage floor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.members.map(m => (
                        <tr key={m.employerId} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-1.5 text-[var(--ink)]">
                            {employers.find(e => e.id === m.employerId)?.name ?? m.employerId}
                          </td>
                          <td className="py-1.5 text-right mono">{m.seatsCommitted}</td>
                          <td className="py-1.5 text-right mono">{formatCurrency(m.wageFloor)}</td>
                        </tr>
                      ))}
                      {joined[p.id] && (
                        <tr className="bg-[var(--signal-rising-light)]">
                          <td className="py-1.5 font-bold text-[var(--signal-rising)]">
                            {account?.name} (you)
                          </td>
                          <td className="py-1.5 text-right mono font-bold">{seats}</td>
                          <td className="py-1.5 text-right mono font-bold">{formatCurrency(wage)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {stats.concluded > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border)] text-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Gate pass rate</p>
                        <p className="text-[15px] font-bold mono text-[var(--signal-rising)]">{stats.passRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">On payroll</p>
                        <p className="text-[15px] font-bold mono">{stats.epfoConfirmed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Subsidy releasable</p>
                        <p className="text-[15px] font-bold mono">{formatCurrency(stats.subsidyReleasable * p.subsidyPerSeat)}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-3.5 pt-3.5 border-t border-[var(--border)]">
                    {joined[p.id] ? (
                      <div className="flex items-start gap-2 bg-[var(--signal-rising-light)] border border-[var(--signal-rising)]/40 rounded-sm px-3 py-2.5">
                        <span className="text-[var(--signal-rising)] font-bold">✓</span>
                        <span className="text-[12.5px] text-[var(--signal-rising)]">
                          Commitment signed — {seats} seats at {formatCurrency(wage)} minimum. You will be
                          notified when candidates are ready for trial.
                        </span>
                      </div>
                    ) : canJoin ? (
                      <>
                        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                          Join this pool
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-[var(--ink-secondary)]" htmlFor={`seats-${p.id}`}>
                              Seats you will absorb
                            </label>
                            <input id={`seats-${p.id}`} type="number" min={1} max={remaining}
                              className="gov-input mono py-1.5" value={seats}
                              onChange={e => setJoinSeats(s => ({ ...s, [p.id]: Number(e.target.value) }))} />
                          </div>
                          <div>
                            <label className="text-[11px] text-[var(--ink-secondary)]" htmlFor={`wage-${p.id}`}>
                              Your wage floor (₹/month)
                            </label>
                            <input id={`wage-${p.id}`} type="number" min={0} step={500}
                              className="gov-input mono py-1.5" value={wage}
                              onChange={e => setJoinWage(s => ({ ...s, [p.id]: Number(e.target.value) }))} />
                          </div>
                        </div>
                        <button onClick={() => setJoined(j => ({ ...j, [p.id]: true }))}
                          className="w-full mt-3 text-white font-bold text-[13px] py-2.5 rounded-sm focus-ring"
                          style={{ background: 'var(--accent-employer)' }}>
                          Sign commitment for {seats} seats →
                        </button>
                      </>
                    ) : (
                      <p className="text-[12px] text-[var(--ink-tertiary)]">
                        This pool is closed to new commitments — the batch is already{' '}
                        {p.status === 'placed' ? 'placed' : 'under way'}.
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {tab === 'trials' && (
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
          <Card title="Candidates on your floor" subtitle="Select a candidate to score their gate">
            <ul className="space-y-2">
              {workTrials.map(t => {
                const s = trialScore(t);
                const active = scoring?.id === t.id;
                return (
                  <li key={t.id}>
                    <button onClick={() => { setScoring(t); setScores({}); setSaved(false); }}
                      className={`w-full text-left border rounded-sm px-3 py-2.5 transition-colors focus-ring ${
                        active ? 'border-[var(--accent-employer)] bg-[var(--accent-employer-light)]'
                        : 'border-[var(--border)] hover:bg-[var(--surface)]'
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[var(--ink)]">{t.candidateName}</p>
                          <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">
                            {t.id} · {getSkill(t.skillId)?.name}
                          </p>
                          <p className="text-[10.5px] text-[var(--ink-tertiary)]">
                            {employers.find(e => e.id === t.employerId)?.name}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge variant={
                            t.outcome === 'passed' ? 'rising' : t.outcome === 'failed' ? 'declining'
                            : t.outcome === 'in-progress' ? 'warn' : 'stable'
                          }>{OUTCOME_LABEL[t.outcome]}</Badge>
                          {s !== null && (
                            <p className={`text-[15px] font-bold mono mt-1 ${
                              s >= TRIAL_PASS_THRESHOLD ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'
                            }`}>{s}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title={scoring ? `Score the gate — ${scoring.candidateName}` : 'Scorecard'}
            subtitle={scoring ? `${scoring.durationDays}-day trial from ${scoring.startDate} · stipend ${formatCurrency(scoring.stipendPerDay)}/day paid by the State` : undefined}>
            {!scoring ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">Select a candidate.</p>
            ) : (
              <>
                <div className="space-y-4">
                  {liveScores.map(c => (
                    <div key={c.criterion}>
                      <div className="flex justify-between items-baseline gap-2 mb-1.5">
                        <label className="text-[12.5px] text-[var(--ink)]" htmlFor={`sc-${c.criterion}`}>
                          {c.criterion}
                          <span className="text-[10.5px] text-[var(--ink-tertiary)] ml-1.5">weight {c.weight}</span>
                        </label>
                        <span className={`text-[14px] font-bold mono ${
                          c.score === null ? 'text-[var(--ink-tertiary)]'
                          : c.score >= TRIAL_PASS_THRESHOLD ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'
                        }`}>{c.score ?? '—'}</span>
                      </div>
                      <input id={`sc-${c.criterion}`} type="range" min={0} max={100}
                        value={c.score ?? 50}
                        onChange={e => { setScores(s => ({ ...s, [c.criterion]: Number(e.target.value) })); setSaved(false); }}
                        className="w-full accent-[var(--accent-employer)]" />
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] font-bold uppercase tracking-wide text-[var(--ink-secondary)]">
                      Weighted gate score
                    </span>
                    <span className="text-[28px] font-bold mono"
                      style={{ color: (liveTotal ?? 0) >= TRIAL_PASS_THRESHOLD ? 'var(--signal-rising)' : 'var(--signal-declining)' }}>
                      {liveTotal ?? '—'}
                    </span>
                  </div>
                  <Progress value={liveTotal ?? 0}
                    color={(liveTotal ?? 0) >= TRIAL_PASS_THRESHOLD ? 'var(--signal-rising)' : 'var(--signal-declining)'}
                    height={10} />
                  <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-1.5">
                    Pass mark {TRIAL_PASS_THRESHOLD}.{' '}
                    {liveTotal !== null && liveTotal >= TRIAL_PASS_THRESHOLD
                      ? 'This candidate clears the gate. Declining them now reassigns your seat commitment.'
                      : liveTotal !== null
                        ? 'Below the gate. No placement is recorded and no subsidy moves.'
                        : 'Score every criterion to compute the gate.'}
                  </p>
                </div>

                <button onClick={() => setSaved(true)} disabled={liveTotal === null}
                  className="w-full mt-4 text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring disabled:opacity-45 disabled:cursor-not-allowed"
                  style={{ background: 'var(--accent-employer)' }}>
                  Submit scorecard →
                </button>

                {saved && (
                  <div className="mt-3">
                    <Note tone={liveTotal! >= TRIAL_PASS_THRESHOLD ? 'success' : 'warn'} title="Scorecard recorded">
                      {liveTotal! >= TRIAL_PASS_THRESHOLD
                        ? `${scoring.candidateName} has cleared the gate at ${liveTotal}. On issuing an offer, place them on payroll within 30 days — EPFO confirmation is what releases the ${formatCurrency(hiringPools.find(p => p.id === scoring.poolId)?.subsidyPerSeat ?? 0)} subsidy against this seat.`
                        : `${scoring.candidateName} scored ${liveTotal}, below the gate. The candidate returns to the centre for remedial hours and may re-trial once. Your seat commitment remains open.`}
                    </Note>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <label className="gov-label" htmlFor="remarks">Supervisor remarks</label>
                  <textarea id="remarks" rows={3} className="gov-input"
                    defaultValue={scoring.supervisorRemarks === '—' ? '' : scoring.supervisorRemarks}
                    placeholder="What did you actually observe on the floor?" />
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
