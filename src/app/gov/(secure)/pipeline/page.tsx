'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import {
  hiringPools, workTrials, poolSeatsCommitted, poolWageFloor,
  poolTrialStats, trialScore, TRIAL_PASS_THRESHOLD, OUTCOME_LABEL,
} from '@/data/hiring';
import { employers } from '@/data/employers';
import { getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { schemes } from '@/data/schemes';
import { GOV_ROLES } from '@/lib/rbac';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { HiringPool, WorkTrial } from '@/types';

export default function GovPipelinePage() {
  const { officer, can } = useGov();
  const role = officer ? GOV_ROLES[officer.role] : null;

  const scoped = role?.scope === 'state'
    ? hiringPools
    : hiringPools.filter(p => p.districtId === officer?.districtId);

  const [selected, setSelected] = useState<HiringPool | null>(scoped[0] ?? null);
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [released, setReleased] = useState<Record<string, boolean>>({});

  const stats = selected ? poolTrialStats(selected.id) : null;
  const poolTrials = selected ? workTrials.filter(t => t.poolId === selected.id) : [];

  const totalCommitted = scoped.reduce((a, p) => a + poolSeatsCommitted(p), 0);
  const totalRequired = scoped.reduce((a, p) => a + p.seatsRequired, 0);
  const confirmed = workTrials.filter(t => t.epfoConfirmedOn).length;
  const releasableTotal = scoped.reduce(
    (a, p) => a + poolTrialStats(p.id).subsidyReleasable * p.subsidyPerSeat, 0,
  );
  const allConcluded = workTrials.filter(t => t.outcome === 'passed' || t.outcome === 'failed');
  const passRate = Math.round((workTrials.filter(t => t.outcome === 'passed').length / (allConcluded.length || 1)) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Pillar 2: Employer-Locked Hiring Pipeline"
        title="Hiring pools, work-trial gate and subsidy release"
        description="Pools, the work-trial gate, and subsidy release."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'Hiring Pipeline' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Active pools" value={scoped.length}
          sub={`${scoped.filter(p => p.status === 'forming').length} still forming`} accent="var(--gov-navy)" />
        <Stat label="Seats employer-committed" value={`${formatNumber(totalCommitted)}/${formatNumber(totalRequired)}`}
          sub={`${Math.round((totalCommitted / totalRequired) * 100)}% of the seat plan is signed`}
          tone={totalCommitted >= totalRequired ? 'positive' : 'warn'} accent="var(--gov-navy)" />
        <Stat label="Work-trial pass rate" value={`${passRate}%`}
          sub={`gate threshold ${TRIAL_PASS_THRESHOLD}/100`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Confirmed on payroll" value={confirmed}
          sub="EPFO-verified placements" tone="positive" accent="var(--gov-navy)" />
        <Stat label="Subsidy releasable" value={formatCurrency(releasableTotal)}
          sub="Against verified outcomes only" tone="positive" accent="var(--gov-navy)" />
      </div>

      <div className="grid xl:grid-cols-[1fr_1.3fr] gap-5">
        <Card title="Pool register" subtitle="Select a pool">
          <ul className="space-y-2.5">
            {scoped.map(p => {
              const committed = poolSeatsCommitted(p);
              const active = selected?.id === p.id;
              return (
                <li key={p.id}>
                  <button onClick={() => setSelected(p)}
                    className={`w-full text-left border rounded-sm p-3 transition-colors focus-ring ${
                      active ? 'border-[var(--gov-navy)] bg-[var(--accent-officer-light)]'
                      : 'border-[var(--border)] hover:bg-[var(--surface)]'
                    }`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[var(--ink)]">{p.name}</p>
                        <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">
                          {p.id} · {districts.find(d => d.id === p.districtId)?.name}
                        </p>
                      </div>
                      <Badge variant={
                        p.status === 'forming' ? 'warn' : p.status === 'placed' ? 'rising' : 'officer'
                      } dot>{p.status.replace('-', ' ')}</Badge>
                    </div>
                    <Progress value={committed} max={p.seatsRequired}
                      color={committed >= p.seatsRequired ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                      height={6} />
                    <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-1">
                      {committed}/{p.seatsRequired} seats · {p.members.length} employers ·{' '}
                      floor {formatCurrency(poolWageFloor(p))}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {selected && stats && (
          <div className="space-y-5">
            <Card title={selected.name}
              subtitle={`${getSkill(selected.skillId)?.name} · ${selected.trainingCentreId} · batch ${selected.batchStartDate}`}
              action={<PermTag permission="pipeline.lock" />}>

              <div className="grid sm:grid-cols-4 gap-3 pb-4 border-b border-[var(--border)] text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Committed</p>
                  <p className="text-[17px] font-bold mono">{poolSeatsCommitted(selected)}/{selected.seatsRequired}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Gate cleared</p>
                  <p className="text-[17px] font-bold mono text-[var(--signal-rising)]">{stats.passed}/{stats.concluded || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">On payroll</p>
                  <p className="text-[17px] font-bold mono">{stats.epfoConfirmed}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Releasable</p>
                  <p className="text-[17px] font-bold mono text-[var(--signal-rising)]">
                    {formatCurrency(stats.subsidyReleasable * selected.subsidyPerSeat)}
                  </p>
                </div>
              </div>

              <div className="py-4 border-b border-[var(--border)]">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                  Signed commitments
                </p>
                <table className="w-full text-[12px]">
                  <tbody>
                    {selected.members.map(m => (
                      <tr key={m.employerId} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-1.5">{employers.find(e => e.id === m.employerId)?.name ?? m.employerId}</td>
                        <td className="py-1.5 text-right mono">{m.seatsCommitted} seats</td>
                        <td className="py-1.5 text-right mono">{formatCurrency(m.wageFloor)}</td>
                        <td className="py-1.5 text-right text-[10.5px] text-[var(--ink-tertiary)]">{m.signedOn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 space-y-2">
                {/* Gate 1: lock the seats */}
                {locked[selected.id] ? (
                  <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">
                    ✓ Seats locked against signed commitments. Batch cleared for notification.
                  </p>
                ) : can('pipeline.lock') ? (
                  <button onClick={() => setLocked(l => ({ ...l, [selected.id]: true }))}
                    disabled={poolSeatsCommitted(selected) < selected.seatsRequired}
                    className="w-full text-[13px] font-bold py-2.5 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring disabled:opacity-45 disabled:cursor-not-allowed">
                    {poolSeatsCommitted(selected) >= selected.seatsRequired
                      ? 'Lock seats and notify the batch →'
                      : `Cannot notify: ${selected.seatsRequired - poolSeatsCommitted(selected)} seats still uncommitted`}
                  </button>
                ) : (
                  <Gated permission="pipeline.lock" label="Seat locking"><span /></Gated>
                )}

                {/* Gate 3: release the subsidy */}
                {released[selected.id] ? (
                  <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">
                    ✓ Tranche of {formatCurrency(stats.subsidyReleasable * selected.subsidyPerSeat)} released
                    against {stats.epfoConfirmed} payroll-confirmed placements.
                  </p>
                ) : can('subsidy.release') ? (
                  <button onClick={() => setReleased(r => ({ ...r, [selected.id]: true }))}
                    disabled={stats.subsidyReleasable === 0}
                    className="w-full text-[13px] font-bold py-2.5 rounded-sm focus-ring disabled:opacity-45 disabled:cursor-not-allowed"
                    style={{ background: 'var(--signal-rising)', color: '#fff' }}>
                    {stats.subsidyReleasable > 0
                      ? `Release ${formatCurrency(stats.subsidyReleasable * selected.subsidyPerSeat)} against verified placements →`
                      : 'No payroll-confirmed placements yet: nothing releasable'}
                  </button>
                ) : (
                  <Gated permission="subsidy.release" label="Subsidy release"><span /></Gated>
                )}
              </div>
            </Card>

            <Card title="Work-trial gate for this pool"
              subtitle="Scored by the employer" dense>
              <Table
                columns={[
                  { key: 'cand', header: 'Candidate', render: (t: WorkTrial) => (
                    <div>
                      <p className="text-[12.5px] font-semibold">{t.candidateName}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{t.candidateKsid}</p>
                    </div>
                  ) },
                  { key: 'emp', header: 'Employer', hideBelow: 'md',
                    render: (t: WorkTrial) => (
                      <span className="text-[11.5px]">{employers.find(e => e.id === t.employerId)?.name}</span>
                    ) },
                  { key: 'score', header: 'Gate', align: 'right', sortValue: t => trialScore(t) ?? -1,
                    render: (t: WorkTrial) => {
                      const s = trialScore(t);
                      return s === null
                        ? <span className="text-[var(--ink-tertiary)] text-[11.5px]">pending</span>
                        : <span className={`mono font-bold ${s >= TRIAL_PASS_THRESHOLD ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}`}>{s}</span>;
                    } },
                  { key: 'out', header: 'Outcome',
                    render: (t: WorkTrial) => (
                      <Badge variant={
                        t.outcome === 'passed' ? 'rising' : t.outcome === 'failed' ? 'declining'
                        : t.outcome === 'in-progress' ? 'warn' : 'stable'
                      }>{OUTCOME_LABEL[t.outcome]}</Badge>
                    ) },
                  { key: 'epfo', header: 'EPFO', align: 'center',
                    render: (t: WorkTrial) => t.epfoConfirmedOn
                      ? <span className="text-[var(--signal-rising)] font-bold" title={t.epfoConfirmedOn}>✓</span>
                      : <span className="text-[var(--ink-tertiary)]">: </span> },
                  { key: 'ctc', header: 'Offer', align: 'right', hideBelow: 'lg',
                    render: (t: WorkTrial) => (
                      <span className="mono text-[11.5px]">
                        {t.offerCtc ? `${(t.offerCtc / 100000).toFixed(2)} L` : '-'}
                      </span>
                    ) },
                ]}
                rows={poolTrials}
                rowKey={t => t.id}
                empty="No trials recorded for this pool yet."
                highlight={t => t.outcome === 'passed' ? 'var(--signal-rising)' : t.outcome === 'failed' ? 'var(--signal-declining)' : undefined}
              />
            </Card>

            <Card title="Scheme routing" subtitle="Which central scheme funds this pool's subsidy">
              <ul className="space-y-2">
                {schemes.map(s => (
                  <li key={s.code} className="border border-[var(--border)] rounded-sm p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-[var(--gov-navy)] mono">{s.code}</p>
                        <p className="text-[11.5px] text-[var(--ink)]">{s.name}</p>
                      </div>
                      <span className="text-[10.5px] text-[var(--ink-tertiary)] shrink-0">{s.ministry}</span>
                    </div>
                    <p className="text-[11.5px] text-[var(--ink-secondary)] mt-1.5">{s.funds}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
