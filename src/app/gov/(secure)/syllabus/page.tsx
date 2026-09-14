'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { ExperimentBars } from '@/components/charts/Charts';
import {
  syllabusExperiments, significanceLabel, sensorPracticals, practicalStats,
} from '@/data/experiments';
import { decayingModules } from '@/data/syllabus';
import { courses } from '@/data/courses';
import { dyingTasks } from '@/data/signals';
import { formatCurrency } from '@/lib/utils';
import { SensorPractical, SyllabusExperiment } from '@/types';

const STATUS_TONE = {
  running: 'warn', concluded: 'officer', promoted: 'rising', 'rolled-back': 'declining',
} as const;

export default function GovSyllabusPage() {
  const { can } = useGov();
  const [tab, setTab] = useState<'experiments' | 'practicals'>('experiments');
  const [selected, setSelected] = useState<SyllabusExperiment>(syllabusExperiments[0]);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [audited, setAudited] = useState<Record<string, string>>({});
  const [openPractical, setOpenPractical] = useState<SensorPractical | null>(
    sensorPracticals.find(p => p.discrepancyFlag) ?? sensorPracticals[0],
  );

  const stats = practicalStats();
  const decaying = decayingModules();
  const running = syllabusExperiments.filter(e => e.status === 'running');
  const awaitingDecision = syllabusExperiments.filter(e => e.status === 'concluded' && !e.decision?.startsWith('Promoted'));

  return (
    <>
      <PageHeader
        eyebrow="Pillar 3 — Adaptive Syllabus & Evidence-Based Evaluation"
        title="Syllabus experiments and practical audit"
        description="Live A/B experiments and sensor-practical audit."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'Syllabus Experiments' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Experiments running" value={running.length}
          sub={`${syllabusExperiments.length} total on record`} tone="warn" accent="var(--gov-navy)" />
        <Stat label="Awaiting promotion decision" value={awaitingDecision.length}
          sub="Significance reached, decision pending" tone="warn" accent="var(--gov-navy)" />
        <Stat label="Modules teaching dying tasks" value={decaying.length}
          sub="Across the whole catalogue" tone="negative" accent="var(--gov-navy)" />
        <Stat label="Practicals flagged" value={`${stats.flagged} of ${stats.total}`}
          sub={`${stats.flaggedPercent}% discrepancy rate`} tone="negative" accent="var(--gov-navy)" />
        <Stat label="Zero machine time" value={stats.zeroMachineTime}
          sub="Scored by an instructor with no telemetry" tone="negative" accent="var(--gov-navy)" />
      </div>

      <div className="flex gap-1 mb-5 border-b border-[var(--border)]" role="tablist">
        {([['experiments', 'Live A/B Experiments'], ['practicals', 'Sensor-Verified Practicals']] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition-colors focus-ring ${
              tab === id ? 'border-[var(--gov-navy)] text-[var(--gov-navy)]'
              : 'border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink)]'
            }`}>{label}</button>
        ))}
      </div>

      {tab === 'experiments' && (
        <div className="grid xl:grid-cols-[1fr_1.35fr] gap-5">
          <Card title="Experiment register">
            <ul className="space-y-2.5">
              {syllabusExperiments.map(e => {
                const active = selected.id === e.id;
                const course = courses.find(c => c.id === e.courseId);
                return (
                  <li key={e.id}>
                    <button onClick={() => setSelected(e)}
                      className={`w-full text-left border rounded-sm p-3 transition-colors focus-ring ${
                        active ? 'border-[var(--gov-navy)] bg-[var(--accent-officer-light)]'
                        : 'border-[var(--border)] hover:bg-[var(--surface)]'
                      }`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="mono text-[11px] text-[var(--ink-tertiary)]">{e.id}</p>
                          <p className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">{course?.name}</p>
                        </div>
                        <Badge variant={STATUS_TONE[e.status]} dot>{e.status.replace('-', ' ')}</Badge>
                      </div>
                      <p className="text-[11px] text-[var(--ink-secondary)] leading-snug line-clamp-2">{e.hypothesis}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)] mt-1">
                        lift +{e.liftPercent}% · p = {e.pValue}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="space-y-5">
            <Card title={`${selected.id} — ${courses.find(c => c.id === selected.courseId)?.name}`}
              subtitle={`${selected.startedOn} → ${selected.concludesOn} · districts: ${selected.districtIds.join(', ')}`}
              action={<PermTag permission="syllabus.promote" />}>

              <p className="text-[12.5px] text-[var(--ink-secondary)] italic leading-relaxed pb-4 border-b border-[var(--border)]">
                {selected.hypothesis}
              </p>

              <div className="py-4">
                <ExperimentBars
                  data={[
                    { metric: 'Trial pass %', 'Arm A': selected.armA.trialPassRate, 'Arm B': selected.armB.trialPassRate },
                    { metric: 'Placement %', 'Arm A': selected.armA.placementRate, 'Arm B': selected.armB.placementRate },
                    { metric: 'Median wage (₹k)', 'Arm A': Math.round(selected.armA.medianWage / 1000), 'Arm B': Math.round(selected.armB.medianWage / 1000) },
                  ]}
                  height={230}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[selected.armA, selected.armB].map((arm, i) => (
                  <div key={arm.label} className="border border-[var(--border)] rounded-sm p-3"
                    style={{ background: i === 1 ? 'var(--signal-rising-light)' : 'var(--surface)' }}>
                    <p className="text-[12px] font-bold text-[var(--ink)]">{arm.label}</p>
                    <p className="text-[10.5px] mono text-[var(--ink-tertiary)] mt-0.5">
                      {arm.syllabusVersion} · n = {arm.cohortSize} · {arm.practicalHours} practical hours
                    </p>
                    <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2 leading-snug">{arm.changeSummary}</p>
                    <dl className="mt-2 space-y-0.5 text-[11.5px]">
                      <div className="flex justify-between"><dt className="text-[var(--ink-tertiary)]">Gate pass</dt><dd className="mono font-semibold">{arm.trialPassRate}%</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--ink-tertiary)]">Placement</dt><dd className="mono font-semibold">{arm.placementRate}%</dd></div>
                      <div className="flex justify-between"><dt className="text-[var(--ink-tertiary)]">Median wage</dt><dd className="mono font-semibold">{formatCurrency(arm.medianWage)}</dd></div>
                    </dl>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                <span className="text-[12.5px]">
                  Lift on {selected.primaryMetric.replace(/-/g, ' ')}:{' '}
                  <strong className="mono text-[var(--signal-rising)] text-[15px]">+{selected.liftPercent}%</strong>
                </span>
                <Badge variant={significanceLabel(selected.pValue).tone}>
                  {significanceLabel(selected.pValue).label}
                </Badge>
              </div>

              {selected.decision && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                    Recorded decision
                  </p>
                  <p className="text-[12.5px] text-[var(--ink-secondary)]">{selected.decision}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                {decisions[selected.id] ? (
                  <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">✓ {decisions[selected.id]}</p>
                ) : selected.status === 'promoted' || selected.status === 'rolled-back' ? (
                  <p className="text-[12.5px] text-[var(--ink-tertiary)]">
                    This experiment is closed. No further action available.
                  </p>
                ) : can('syllabus.promote') ? (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDecisions(d => ({ ...d, [selected.id]: `Variant ${selected.armB.syllabusVersion} promoted state-wide from the next intake` }))}
                      disabled={selected.pValue > 0.05}
                      className="text-[12.5px] font-bold px-4 py-2 rounded-sm focus-ring disabled:opacity-45 disabled:cursor-not-allowed"
                      style={{ background: 'var(--signal-rising)', color: '#fff' }}>
                      Promote Arm B state-wide
                    </button>
                    <button onClick={() => setDecisions(d => ({ ...d, [selected.id]: 'Experiment extended for a further cohort' }))}
                      className="text-[12.5px] font-semibold px-4 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                      Extend another cohort
                    </button>
                    <button onClick={() => setDecisions(d => ({ ...d, [selected.id]: 'Variant rolled back; control retained' }))}
                      className="text-[12.5px] font-bold px-4 py-2 bg-[var(--signal-declining)] text-white rounded-sm focus-ring">
                      Roll back
                    </button>
                  </div>
                ) : (
                  <Gated permission="syllabus.promote" label="Variant promotion"><span /></Gated>
                )}
                {selected.pValue > 0.05 && can('syllabus.promote') && (
                  <p className="text-[11.5px] text-[var(--signal-warn)] mt-2">
                    Promotion is blocked while p &gt; 0.05 — the observed lift is not distinguishable from noise.
                  </p>
                )}
              </div>
            </Card>

            <Card title="Modules still teaching dying tasks"
              subtitle="Watch × syllabus register" dense>
              <Table
                columns={[
                  { key: 'course', header: 'Course', render: r => (
                    <div>
                      <p className="text-[12.5px] font-semibold">{r.course.name}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{r.course.id}</p>
                    </div>
                  ) },
                  { key: 'module', header: 'Module', render: r => (
                    <div>
                      <p className="mono text-[11.5px] font-semibold">{r.module.code}</p>
                      <p className="text-[10.5px] text-[var(--ink-tertiary)] truncate max-w-[170px]">{r.module.title}</p>
                    </div>
                  ) },
                  { key: 'hours', header: 'Hours', align: 'right',
                    render: r => <span className="mono">{r.module.hours}</span>, sortValue: r => r.module.hours },
                  { key: 'decline', header: 'Task decline', align: 'right', render: r => {
                    const t = dyingTasks.find(x => x.id === r.module.decayFlag);
                    return <span className="mono font-bold text-[var(--signal-declining)]">{t?.hoursChangeYoY}%</span>;
                  } },
                ]}
                rows={decaying}
                rowKey={r => `${r.course.id}-${r.module.code}`}
                highlight={() => 'var(--signal-declining)'}
              />
            </Card>
          </div>
        </div>
      )}

      {tab === 'practicals' && (
        <>

          <div className="grid xl:grid-cols-[1.2fr_1fr] gap-5">
            <Card title="Practical evidence register" subtitle="Select a record to inspect its telemetry" dense>
              <Table
                columns={[
                  { key: 'cand', header: 'Candidate', render: (p: SensorPractical) => (
                    <div>
                      <p className="text-[12.5px] font-semibold">{p.candidateName}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{p.id} · {p.moduleCode}</p>
                    </div>
                  ) },
                  { key: 'machine', header: 'Machine', hideBelow: 'md', render: (p: SensorPractical) => (
                    <div className="text-[11px]">
                      <p className="mono">{p.machineId}</p>
                      <p className="text-[var(--ink-tertiary)]">{p.sensorKind.replace(/-/g, ' ')}</p>
                    </div>
                  ) },
                  { key: 'mins', header: 'Machine time', align: 'right', sortValue: p => p.machineMinutes,
                    render: (p: SensorPractical) => (
                      <span className={`mono ${p.machineMinutes === 0 ? 'font-bold text-[var(--signal-declining)]' : ''}`}>
                        {p.machineMinutes} min
                      </span>
                    ) },
                  { key: 'scores', header: 'Machine / instructor', align: 'right',
                    render: (p: SensorPractical) => (
                      <span className="mono text-[11.5px]">
                        <strong>{p.autoScore}</strong>
                        <span className="text-[var(--ink-tertiary)]"> / </span>
                        <strong className={p.discrepancyFlag ? 'text-[var(--signal-declining)]' : ''}>
                          {p.instructorScore ?? '—'}
                        </strong>
                      </span>
                    ), sortValue: p => Math.abs((p.instructorScore ?? 0) - p.autoScore) },
                  { key: 'v', header: 'Status',
                    render: (p: SensorPractical) => (
                      <Badge variant={p.verified ? 'rising' : 'declining'}>
                        {p.verified ? 'verified' : 'flagged'}
                      </Badge>
                    ) },
                ]}
                rows={sensorPracticals}
                rowKey={p => p.id}
                onRowClick={setOpenPractical}
                highlight={p => p.id === openPractical?.id ? 'var(--gov-navy)'
                  : p.discrepancyFlag ? 'var(--signal-declining)' : undefined}
              />
            </Card>

            <Card title={openPractical ? `Telemetry — ${openPractical.id}` : 'Telemetry'}
              subtitle={openPractical
                ? `${openPractical.candidateName} · ${openPractical.moduleCode} · ${openPractical.centreId} · ${openPractical.performedOn}`
                : undefined}
              action={<PermTag permission="practical.audit" />}>
              {!openPractical ? (
                <p className="text-[13px] text-[var(--ink-tertiary)]">Select a record.</p>
              ) : (
                <>
                  <ul className="space-y-2">
                    {openPractical.telemetry.map(t => (
                      <li key={t.metric} className="flex items-start justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-0">
                        <span className="text-[12px] text-[var(--ink-secondary)] min-w-0">{t.metric}</span>
                        <span className="shrink-0 text-right">
                          <span className={`block text-[13px] mono font-bold ${
                            t.pass ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'
                          }`}>
                            {t.value} {t.unit}
                          </span>
                          <span className="block text-[10.5px] mono text-[var(--ink-tertiary)]">
                            tolerance {t.tolerance}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)] text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Machine time</p>
                      <p className={`text-[18px] font-bold mono ${openPractical.machineMinutes === 0 ? 'text-[var(--signal-declining)]' : ''}`}>
                        {openPractical.machineMinutes}m
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Machine score</p>
                      <p className="text-[18px] font-bold mono">{openPractical.autoScore}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Instructor</p>
                      <p className={`text-[18px] font-bold mono ${openPractical.discrepancyFlag ? 'text-[var(--signal-declining)]' : ''}`}>
                        {openPractical.instructorScore ?? '—'}
                      </p>
                    </div>
                  </div>

                  {openPractical.discrepancyFlag && (
                    <div className="mt-4">
                      <Note tone="danger" title="Discrepancy referred for audit">
                        The instructor scored this practical at {openPractical.instructorScore} against a
                        machine-derived score of {openPractical.autoScore}
                        {openPractical.machineMinutes === 0
                          ? ', with no recorded machine time at all. The session either did not take place or was performed on unlogged equipment.'
                          : `, a gap of ${Math.abs((openPractical.instructorScore ?? 0) - openPractical.autoScore)} points.`}
                        {' '}This record cannot be certified until resolved.
                      </Note>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    {audited[openPractical.id] ? (
                      <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">
                        ✓ {audited[openPractical.id]}
                      </p>
                    ) : can('practical.audit') ? (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setAudited(a => ({ ...a, [openPractical.id]: 'Record voided; candidate to re-sit the practical under supervision' }))}
                          className="text-[12.5px] font-bold px-3.5 py-2 bg-[var(--signal-declining)] text-white rounded-sm focus-ring">
                          Void and re-sit
                        </button>
                        <button onClick={() => setAudited(a => ({ ...a, [openPractical.id]: 'Machine score upheld; instructor score overridden' }))}
                          className="text-[12.5px] font-bold px-3.5 py-2 bg-[var(--gov-navy)] text-white rounded-sm focus-ring">
                          Uphold machine score
                        </button>
                        <button onClick={() => setAudited(a => ({ ...a, [openPractical.id]: 'Centre issued a show-cause notice' }))}
                          className="text-[12.5px] font-semibold px-3.5 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                          Issue show-cause to centre
                        </button>
                      </div>
                    ) : (
                      <Gated permission="practical.audit" label="Practical audit"><span /></Gated>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  );
}
