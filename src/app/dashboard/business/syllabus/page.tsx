'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { ExperimentBars } from '@/components/charts/Charts';
import { courses } from '@/data/courses';
import { getSyllabus, MODULE_TYPE_LABEL, decayingModules } from '@/data/syllabus';
import { syllabusExperiments, significanceLabel } from '@/data/experiments';
import { dyingTasks } from '@/data/signals';
import { formatCurrency } from '@/lib/utils';
import { PILLARS } from '@/data/pillars';

type Verdict = 'current' | 'stale' | 'missing';

export default function BusinessSyllabusPage() {
  const { account } = useCitizen();
  const pillar = PILLARS[2];
  const districtId = account?.districtId ?? 'pune';

  const localCourses = courses.filter(c => c.districtId === districtId);
  const [courseId, setCourseId] = useState(localCourses[0]?.id ?? 'pune-mmv-01');
  const syllabus = getSyllabus(courseId);

  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [missingSkill, setMissingSkill] = useState('');
  const [reported, setReported] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, 'A' | 'B'>>({});

  const stale = Object.values(verdicts).filter(v => v === 'stale').length;
  const decaying = decayingModules();

  const running = syllabusExperiments.filter(e => e.status === 'running');

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number}: ${pillar.short}`}
        title="Syllabus endorsement"
        description="Flag stale modules. Vote on live syllabus experiments."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/business' }, { label: 'Syllabus Endorsement' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Courses in your district" value={localCourses.length}
          sub="All open to employer endorsement" accent="var(--accent-employer)" />
        <Stat label="Experiments running now" value={running.length}
          sub="Awaiting employer input before promotion" tone="warn" accent="var(--accent-employer)" />
        <Stat label="Modules already flagged state-wide" value={decaying.length}
          sub="Teaching tasks the watch says are dying" tone="negative" accent="var(--accent-employer)" />
        <Stat label="Your flags this session" value={stale + reported.length}
          sub={stale + reported.length ? 'Submitted to the district officer' : 'None yet'}
          accent="var(--accent-employer)" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <div className="space-y-5">
          <Card title="Review a syllabus" subtitle="Mark each module against the work you actually do">
            <div className="mb-4">
              <label className="gov-label" htmlFor="bs-course">Course</label>
              <select id="bs-course" className="gov-input" value={courseId} onChange={e => { setCourseId(e.target.value); setVerdicts({}); }}>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}: {c.type}, {c.durationMonths} mo ({c.districtId})</option>
                ))}
              </select>
              <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-1.5">
                Version {syllabus.version} · {syllabus.totalHours.toLocaleString('en-IN')} hours ·
                NSQF L{syllabus.nsqfLevel} · effective {syllabus.effectiveFrom}
              </p>
            </div>

            <div className="space-y-2">
              {syllabus.modules.map(m => {
                const dt = m.decayFlag ? dyingTasks.find(t => t.id === m.decayFlag) : null;
                const v = verdicts[m.code];
                return (
                  <div key={m.code} className="border border-[var(--border)] rounded-sm p-3"
                    style={v === 'stale' || dt ? { boxShadow: 'inset 3px 0 0 var(--signal-declining)' }
                      : v === 'current' ? { boxShadow: 'inset 3px 0 0 var(--signal-rising)' } : undefined}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="mono text-[11px] font-bold text-[var(--gov-navy)] bg-[var(--accent-officer-light)] px-1.5 py-0.5 rounded-sm">
                            {m.code}
                          </span>
                          <span className="text-[13px] font-semibold text-[var(--ink)]">{m.title}</span>
                          <span className="mono text-[11.5px] text-[var(--ink-tertiary)]">{m.hours} h</span>
                          <Badge variant="default">{MODULE_TYPE_LABEL[m.type]}</Badge>
                          {dt && <Badge variant="declining" dot>watch-flagged</Badge>}
                        </div>
                        <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-1">
                          Tools: {m.tools.join(' · ')}
                        </p>
                        {dt && (
                          <p className="text-[11.5px] text-[var(--signal-declining)] mt-1 leading-snug">
                            {dt.taskName}: {Math.abs(dt.hoursChangeYoY)}% work-hours YoY, displaced by {dt.displacedBy}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1 shrink-0">
                        {([
                          ['current', 'Still used', 'var(--signal-rising)'],
                          ['stale', 'Obsolete', 'var(--signal-declining)'],
                        ] as const).map(([id, label, colour]) => (
                          <button key={id}
                            onClick={() => setVerdicts(x => ({ ...x, [m.code]: id }))}
                            className="text-[11px] font-semibold px-2.5 py-1.5 border rounded-sm transition-colors focus-ring"
                            style={v === id
                              ? { background: colour, color: '#fff', borderColor: colour }
                              : { borderColor: 'var(--border-strong)', color: 'var(--ink-secondary)' }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stale > 0 && (
              <div className="mt-4">
                <Note tone="warn" title={`You have flagged ${stale} module${stale > 1 ? 's' : ''} as obsolete`}>
                  Employer flags are aggregated across all establishments in the district. Where enough
                  employers flag the same module, the Dying Task Watch cross-checks it against posting
                  data and the department opens an A/B experiment on a replacement.
                </Note>
              </div>
            )}
          </Card>

          <Card title="Name a skill nobody is teaching"
            subtitle="Goes into the state onboarding queue">
            <div className="flex flex-wrap gap-2">
              <input className="gov-input flex-1 min-w-[240px]" value={missingSkill}
                onChange={e => setMissingSkill(e.target.value)}
                placeholder="e.g. Battery pack thermal management, robot teach-pendant operation" />
              <button
                disabled={!missingSkill.trim()}
                onClick={() => { setReported(r => [...r, missingSkill.trim()]); setMissingSkill(''); }}
                className="text-white font-bold text-[13px] px-5 rounded-sm focus-ring disabled:opacity-45"
                style={{ background: 'var(--accent-employer)' }}>
                Report gap
              </button>
            </div>
            {reported.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {reported.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12.5px] text-[var(--ink-secondary)] border border-[var(--border)] rounded-sm px-3 py-2">
                    <span className="text-[var(--signal-rising)] font-bold">✓</span>
                    <span className="flex-1">{r}</span>
                    <span className="text-[10.5px] mono text-[var(--ink-tertiary)]">
                      queued · UNC-{String(90 + i)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-3 leading-relaxed">
              Reports are corroborated against wage and posting data before a course is designed. Where
              multiple employers report the same skill, it is escalated to the State for skill onboarding.
            </p>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Vote on live experiments"
            subtitle="Counts toward promotion decisions">
            {running.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">No experiments currently open for endorsement.</p>
            ) : (
              <div className="space-y-5">
                {running.map(e => {
                  const sig = significanceLabel(e.pValue);
                  const vote = votes[e.id];
                  return (
                    <div key={e.id} className="border border-[var(--border)] rounded-sm p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="mono text-[11px] text-[var(--ink-tertiary)]">{e.id}</p>
                        <Badge variant="warn" dot>running</Badge>
                      </div>
                      <p className="text-[12.5px] text-[var(--ink-secondary)] italic leading-relaxed mb-3">
                        {e.hypothesis}
                      </p>

                      <ExperimentBars
                        data={[
                          { metric: 'Trial pass %', 'Arm A': e.armA.trialPassRate, 'Arm B': e.armB.trialPassRate },
                          { metric: 'Placement %', 'Arm A': e.armA.placementRate, 'Arm B': e.armB.placementRate },
                          { metric: 'Wage (₹k)', 'Arm A': Math.round(e.armA.medianWage / 1000), 'Arm B': Math.round(e.armB.medianWage / 1000) },
                        ]}
                        height={190}
                      />

                      <div className="space-y-2 mt-3">
                        {([['A', e.armA], ['B', e.armB]] as const).map(([key, arm]) => (
                          <button key={key} onClick={() => setVotes(v => ({ ...v, [e.id]: key }))}
                            className={`w-full text-left border rounded-sm px-3 py-2.5 transition-colors focus-ring ${
                              vote === key
                                ? 'border-[var(--accent-employer)] bg-[var(--accent-employer-light)]'
                                : 'border-[var(--border)] hover:bg-[var(--surface)]'
                            }`}>
                            <p className="text-[12px] font-bold text-[var(--ink)]">{arm.label}</p>
                            <p className="text-[11px] text-[var(--ink-secondary)] mt-0.5 leading-snug">{arm.changeSummary}</p>
                            <p className="text-[11px] mono text-[var(--ink-tertiary)] mt-1">
                              {arm.trialPassRate}% gate · {formatCurrency(arm.medianWage)} median
                            </p>
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                        <Badge variant={sig.tone}>{sig.label}</Badge>
                        <span className="text-[11.5px] text-[var(--ink-secondary)]">
                          lift <strong className="mono text-[var(--signal-rising)]">+{e.liftPercent}%</strong>
                        </span>
                      </div>

                      {vote && (
                        <p className="text-[11.5px] text-[var(--signal-rising)] font-semibold mt-2">
                          ✓ Endorsement recorded for Arm {vote}. Concludes {e.concludesOn}.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Assessment weighting on these courses">
            <div className="space-y-3">
              {syllabus.assessmentPattern.map(a => (
                <Progress key={a.component} value={a.weight} color="var(--accent-employer)"
                  label={a.component} showValue height={8} />
              ))}
            </div>
            <p className="text-[12px] text-[var(--ink-secondary)] mt-3 leading-relaxed">
              The practical component is scored from machine telemetry: arc-on time, spindle hours,
              cell-voltage spread. When you receive a candidate from this course, the practical mark on
              their certificate is backed by a machine log you can ask to see.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
