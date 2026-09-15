'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { ExperimentBars } from '@/components/charts/Charts';
import { courses } from '@/data/courses';
import { getSyllabus, MODULE_TYPE_LABEL } from '@/data/syllabus';
import { experimentsForCourse, significanceLabel, sensorPracticals, DISCREPANCY_THRESHOLD } from '@/data/experiments';
import { dyingTasks } from '@/data/signals';
import { formatCurrency } from '@/lib/utils';

const TYPE_TONE = {
  theory: 'officer', practical: 'student', ojt: 'employer', 'soft-skill': 'default',
} as const;

export default function StudentSyllabusPage() {
  const { account } = useCitizen();

  const defaultCourse =
    account?.enrolledCourseId ??
    courses.find(c => c.districtId === account?.districtId)?.id ??
    'pune-mmv-01';

  const [courseId, setCourseId] = useState(defaultCourse);
  const course = courses.find(c => c.id === courseId)!;
  const syllabus = getSyllabus(courseId);
  const experiments = experimentsForCourse(courseId);
  const myPracticals = sensorPracticals.filter(p => p.courseId === courseId);

  const practicalHours = syllabus.modules.filter(m => m.type === 'practical' || m.type === 'ojt')
    .reduce((a, m) => a + m.hours, 0);
  const decaying = syllabus.modules.filter(m => m.decayFlag);

  return (
    <>
      <PageHeader
        eyebrow="My course"
        title="What I am learning"
        description="Your module plan, hour by hour, with the machine evidence."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Syllabus & Practicals' }]}
      />

      <PageGuide />

      <div className="gov-card p-4 mb-5">
        <label className="gov-label" htmlFor="course-pick">Course</label>
        <select id="course-pick" className="gov-input max-w-xl" value={courseId} onChange={e => setCourseId(e.target.value)}>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.type}, {c.durationMonths} months ({c.districtId})
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Total hours" value={syllabus.totalHours.toLocaleString('en-IN')}
          sub={`${course.durationMonths} months · ${syllabus.modules.length} modules`} accent="var(--accent-student)" />
        <Stat label="Practical hours" value={practicalHours.toLocaleString('en-IN')}
          sub={`${Math.round((practicalHours / syllabus.totalHours) * 100)}% of the course is on the bench`}
          tone="positive" accent="var(--accent-student)" />
        <Stat label="Level when you finish" value={`L${syllabus.nsqfLevel}`}
          sub={`Syllabus version ${syllabus.version}, effective ${syllabus.effectiveFrom}`} accent="var(--accent-student)" />
        <Stat label="Outdated topics" value={decaying.length}
          sub={decaying.length ? 'Teaching tasks that are disappearing' : 'No decaying content'}
          tone={decaying.length ? 'negative' : 'positive'} accent="var(--accent-student)" />
      </div>

      {decaying.length > 0 && (
        <div className="mb-5">
          <Note tone="warn" title="Some of these hours are teaching work that is going away">
            {decaying.map(m => m.code).join(', ')} teach tasks that are contracting. Replacements are
            being A/B tested — results below.
          </Note>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          {/* ---- Module breakdown ---- */}
          <Card title="Module breakdown" subtitle="Hours, tools and assessment">
            <div className="space-y-2.5">
              {syllabus.modules.map(m => {
                const dt = m.decayFlag ? dyingTasks.find(t => t.id === m.decayFlag) : null;
                return (
                  <details key={m.code} className="border border-[var(--border)] rounded-sm group"
                    style={dt ? { boxShadow: 'inset 3px 0 0 var(--signal-declining)' } : undefined}>
                    <summary className="flex flex-wrap items-center gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-[var(--surface)] list-none">
                      <span className="mono text-[11px] font-bold text-[var(--gov-navy)] bg-[var(--accent-officer-light)] px-1.5 py-0.5 rounded-sm">
                        {m.code}
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--ink)] flex-1 min-w-0">{m.title}</span>
                      <Badge variant={TYPE_TONE[m.type]}>{MODULE_TYPE_LABEL[m.type]}</Badge>
                      <span className="mono text-[12px] font-bold text-[var(--ink-secondary)] w-14 text-right">{m.hours} h</span>
                      {dt && <Badge variant="declining" dot>stale</Badge>}
                      <svg width="12" height="12" viewBox="0 0 12 12" className="text-[var(--ink-tertiary)] group-open:rotate-180 transition-transform" fill="currentColor">
                        <path d="M1 4l5 5 5-5z" />
                      </svg>
                    </summary>
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-[var(--border)] bg-[var(--surface)]">
                      <Progress value={m.hours} max={syllabus.totalHours}
                        color={dt ? 'var(--signal-declining)' : 'var(--accent-student)'} height={5}
                        label={`${Math.round((m.hours / syllabus.totalHours) * 100)}% of total course hours`} />

                      <div className="mt-3">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                          Tools &amp; equipment
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.tools.map(t => (
                            <span key={t} className="text-[11px] bg-white border border-[var(--border)] px-2 py-0.5 rounded-sm text-[var(--ink-secondary)]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                          You will be assessed on
                        </p>
                        <ul className="space-y-1">
                          {m.outcomes.map(o => (
                            <li key={o} className="flex gap-2 text-[12px] text-[var(--ink-secondary)]">
                              <span className="text-[var(--accent-student)] font-bold">›</span>{o}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {dt && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]">
                          <p className="text-[11px] font-bold text-[var(--signal-declining)] uppercase tracking-wide mb-1">
                            Flagged by Dying Task Watch ({dt.id})
                          </p>
                          <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
                            <strong>{dt.taskName}</strong> is down {Math.abs(dt.hoursChangeYoY)}% in work-hours
                            year on year, displaced by {dt.displacedBy}. Departmental recommendation: {dt.recommendedAction}
                          </p>
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}
            </div>
          </Card>

          {/* ---- Live A/B experiments ---- */}
          <Card title="Live syllabus experiments on this trade"
            subtitle="Two cohorts, decided by outcomes">
            {experiments.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
                No experiment is currently running on this course. Experiments are opened where the Dying
                Task Watch flags decaying content or where employers report a persistent skills mismatch.
              </p>
            ) : (
              <div className="space-y-5">
                {experiments.map(e => {
                  const sig = significanceLabel(e.pValue);
                  return (
                    <div key={e.id} className="border border-[var(--border)] rounded-sm p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="mono text-[11px] text-[var(--ink-tertiary)]">{e.id}</p>
                          <p className="text-[13.5px] font-bold text-[var(--ink)] mt-0.5">Hypothesis</p>
                        </div>
                        <Badge variant={
                          e.status === 'promoted' ? 'rising' : e.status === 'running' ? 'warn'
                          : e.status === 'rolled-back' ? 'declining' : 'officer'
                        } dot>{e.status.replace('-', ' ')}</Badge>
                      </div>
                      <p className="text-[12.5px] text-[var(--ink-secondary)] italic leading-relaxed mb-3">
                        {e.hypothesis}
                      </p>

                      <ExperimentBars
                        data={[
                          { metric: 'Trial pass %', 'Arm A': e.armA.trialPassRate, 'Arm B': e.armB.trialPassRate },
                          { metric: 'Placement %', 'Arm A': e.armA.placementRate, 'Arm B': e.armB.placementRate },
                          { metric: 'Median wage (₹k)', 'Arm A': Math.round(e.armA.medianWage / 1000), 'Arm B': Math.round(e.armB.medianWage / 1000) },
                        ]}
                        height={210}
                      />

                      <div className="grid sm:grid-cols-2 gap-3 mt-3">
                        {[e.armA, e.armB].map((arm, i) => (
                          <div key={arm.label} className="border border-[var(--border)] rounded-sm p-3"
                            style={{ background: i === 1 ? 'var(--signal-rising-light)' : 'var(--surface)' }}>
                            <p className="text-[12px] font-bold text-[var(--ink)]">{arm.label}</p>
                            <p className="text-[11px] text-[var(--ink-tertiary)] mono mt-0.5">
                              {arm.syllabusVersion} · n = {arm.cohortSize}
                            </p>
                            <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2 leading-snug">{arm.changeSummary}</p>
                            <p className="text-[12px] mt-2 mono">
                              Median wage <strong>{formatCurrency(arm.medianWage)}</strong>
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-[var(--border)]">
                        <span className="text-[12px]">
                          Lift on {e.primaryMetric.replace(/-/g, ' ')}:{' '}
                          <strong className="mono text-[var(--signal-rising)]">+{e.liftPercent}%</strong>
                        </span>
                        <Badge variant={sig.tone}>{sig.label}</Badge>
                      </div>

                      {e.decision && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)]">
                          <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                            Decision
                          </p>
                          <p className="text-[12.5px] text-[var(--ink-secondary)]">{e.decision}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* ---- Assessment pattern ---- */}
          <Card title="How you are assessed">
            <div className="space-y-3">
              {syllabus.assessmentPattern.map(a => (
                <Progress key={a.component} value={a.weight} color="var(--gov-navy)"
                  label={a.component} showValue height={8} />
              ))}
            </div>
          </Card>

          {/* ---- Practical evidence log ---- */}
          <Card title="Practical evidence log" subtitle={`${myPracticals.length} recorded sessions on this course`}>
            {myPracticals.length === 0 ? (
              <p className="text-[12.5px] text-[var(--ink-tertiary)]">
                No sensor-verified practicals recorded for this course yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myPracticals.map(p => (
                  <div key={p.id} className="border border-[var(--border)] rounded-sm p-3"
                    style={p.discrepancyFlag ? { boxShadow: 'inset 3px 0 0 var(--signal-declining)' } : undefined}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold text-[var(--ink)]">{p.candidateName}</p>
                        <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">
                          {p.moduleCode} · {p.machineId} · {p.performedOn}
                        </p>
                      </div>
                      <Badge variant={p.verified ? 'rising' : 'declining'}>
                        {p.verified ? 'verified' : 'flagged'}
                      </Badge>
                    </div>

                    <ul className="space-y-1 mb-2">
                      {p.telemetry.map(t => (
                        <li key={t.metric} className="flex items-baseline justify-between gap-2 text-[11.5px]">
                          <span className="text-[var(--ink-secondary)] min-w-0 truncate">{t.metric}</span>
                          <span className="shrink-0 mono">
                            <span className={t.pass ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)] font-bold'}>
                              {t.value} {t.unit}
                            </span>
                            <span className="text-[var(--ink-tertiary)]"> / {t.tolerance}</span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-[11.5px]">
                      <span className="text-[var(--ink-tertiary)]">
                        Machine time <strong className="mono text-[var(--ink)]">{p.machineMinutes} min</strong>
                      </span>
                      <span className="mono">
                        machine <strong>{p.autoScore}</strong>
                        {' · '}
                        instructor <strong>{p.instructorScore ?? '—'}</strong>
                      </span>
                    </div>

                    {p.discrepancyFlag && (
                      <p className="text-[11px] text-[var(--signal-declining)] mt-2 leading-snug">
                        Instructor score differs from machine telemetry by more than {DISCREPANCY_THRESHOLD} points.
                        This record has been referred to the district officer and cannot be certified until resolved.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
