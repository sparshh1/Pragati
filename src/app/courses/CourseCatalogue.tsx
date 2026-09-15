'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { TrendArea } from '@/components/charts/Charts';
import { courses } from '@/data/courses';
import { districts } from '@/data/districts';
import { getSkill } from '@/data/skills';
import { getSyllabus, hasDetailedSyllabus, MODULE_TYPE_LABEL } from '@/data/syllabus';
import { experimentsForCourse, significanceLabel } from '@/data/experiments';
import { dyingTasks } from '@/data/signals';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { schemes } from '@/data/schemes';
import { CourseType } from '@/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

const TYPE_TONE: Record<CourseType, 'officer' | 'employer' | 'student' | 'default'> = {
  ITI: 'officer', Polytechnic: 'employer', PMKVY: 'student', Private: 'default',
};

const MODULE_TONE = {
  theory: 'officer', practical: 'student', ojt: 'employer', 'soft-skill': 'default',
} as const;


/* ------------------------------------------------------------------ */
/*  Course sort orders                                                  */
/*                                                                      */
/*  Sorting here is not cosmetic. Each order answers a different planning */
/*  question, so the options are grouped by who is asking it - a         */
/*  candidate deciding what to enrol in, or an officer deciding what to  */
/*  notify. `value` pulls the number the order ranks on, and `unit`      */
/*  renders it on the card so the ordering is legible rather than magic. */
/* ------------------------------------------------------------------ */

interface CourseMetrics {
  demandYoY: number;
  wageCeiling: number;
  durationMonths: number;
  totalHours: number;
  practicalShare: number;
  seatsVacant: number;
  fillRate: number;
  staleModules: number;
  nsqfLevel: number;
}

interface SortOrder {
  id: string;
  label: string;
  group: 'Career planning' | 'Course quality' | 'Seat planning' | 'Reference';
  /** Explains what the order is for - shown under the control. */
  rationale: string;
  value: (m: CourseMetrics) => number;
  /** desc = highest first */
  direction: 'asc' | 'desc';
  /** How the ranked value reads on the card. */
  format: (m: CourseMetrics) => string;
}

const SORT_ORDERS: SortOrder[] = [
  {
    id: 'demand', label: 'Demand growth: fastest growing first', group: 'Career planning',
    rationale: 'Ranks by the year-on-year change in verified vacancies for the course’s primary trade. The default, because enrolling into a contracting trade is the costliest mistake on this portal.',
    value: m => m.demandYoY, direction: 'desc',
    format: m => `${m.demandYoY >= 0 ? '+' : ''}${m.demandYoY}% demand YoY`,
  },
  {
    id: 'wage', label: 'Wage ceiling: highest first', group: 'Career planning',
    rationale: 'Ranks by the top of the salary band for the best-paying skill the course teaches.',
    value: m => m.wageCeiling, direction: 'desc',
    format: m => `up to ${formatCurrency(m.wageCeiling)}/mo`,
  },
  {
    id: 'duration', label: 'Time to qualify: shortest first', group: 'Career planning',
    rationale: 'For candidates who need to be earning quickly. A 3-month PMKVY course and a 24-month ITI trade are very different commitments.',
    value: m => m.durationMonths, direction: 'asc',
    format: m => `${m.durationMonths} months`,
  },
  {
    id: 'vacancy', label: 'Seats still vacant: most first', group: 'Career planning',
    rationale: 'Where you can realistically still get admitted this intake.',
    value: m => m.seatsVacant, direction: 'desc',
    format: m => `${m.seatsVacant} seats vacant`,
  },
  {
    id: 'practical', label: 'Hands-on share: most practical first', group: 'Course quality',
    rationale: 'Practical and on-the-job hours as a share of total contact hours. Employers hire on bench time, not theory marks.',
    value: m => m.practicalShare, direction: 'desc',
    format: m => `${Math.round(m.practicalShare * 100)}% hands-on`,
  },
  {
    id: 'stale', label: 'Stale content: worst first', group: 'Course quality',
    rationale: 'Ranks by how many modules still teach a task the Dying Task Watch has flagged. This is the revision queue.',
    value: m => m.staleModules, direction: 'desc',
    format: m => (m.staleModules ? `${m.staleModules} stale module${m.staleModules > 1 ? 's' : ''}` : 'no stale modules'),
  },
  {
    id: 'hours', label: 'Total contact hours: most first', group: 'Course quality',
    rationale: 'Depth of the programme, independent of how many months it is spread across.',
    value: m => m.totalHours, direction: 'desc',
    format: m => `${formatNumber(m.totalHours)} hours`,
  },
  {
    id: 'fill', label: 'Oversubscription: most contested first', group: 'Seat planning',
    rationale: 'Enrolment against notified seats. A course at 100% with demand still rising is where seats should be added.',
    value: m => m.fillRate, direction: 'desc',
    format: m => `${Math.round(m.fillRate * 100)}% filled`,
  },
  {
    id: 'underfilled', label: 'Under-subscription: emptiest first', group: 'Seat planning',
    rationale: 'The other half of the same question. Courses that cannot fill are candidates for closure or redesign.',
    value: m => m.fillRate, direction: 'asc',
    format: m => `${Math.round(m.fillRate * 100)}% filled`,
  },
  {
    id: 'nsqf', label: 'NSQF level: highest first', group: 'Reference',
    rationale: 'Exit qualification level, for mapping progression routes.',
    value: m => m.nsqfLevel, direction: 'desc',
    format: m => `NSQF Level ${m.nsqfLevel}`,
  },
];

const SORT_GROUPS = ['Career planning', 'Course quality', 'Seat planning', 'Reference'] as const;

export function CourseCatalogue() {
  const params = useSearchParams();
  const router = useRouter();

  const [districtId, setDistrictId] = useState('all');
  const [query, setQuery] = useState('');
  const [sortId, setSortId] = useState('demand');

  // The URL is the source of truth for the open course and the type filter, so a
  // shared link (/courses?id=pune-ev-01) opens the right syllabus directly.
  const openId = params.get('id');
  const type = (params.get('type') as CourseType | null) ?? 'all';

  function setType(next: CourseType | 'all') {
    const q = new URLSearchParams(params.toString());
    if (next === 'all') q.delete('type'); else q.set('type', next);
    q.delete('id');
    router.push(`/courses${q.toString() ? `?${q}` : ''}`);
  }

  const sort = SORT_ORDERS.find(o => o.id === sortId) ?? SORT_ORDERS[0];

  /**
   * Filter, then measure, then sort. The metrics are computed once per course
   * rather than inside the comparator - the demand trend runs a regression over
   * a 24-month series and must not be recomputed on every comparison.
   */
  const filtered = useMemo(() => {
    const matches = courses.filter(c => {
      if (districtId !== 'all' && c.districtId !== districtId) return false;
      if (type !== 'all' && c.type !== type) return false;
      if (query) {
        const q = query.toLowerCase();
        const skillNames = c.skillIds.map(s => getSkill(s)?.name.toLowerCase() ?? '').join(' ');
        if (!c.name.toLowerCase().includes(q) && !skillNames.includes(q)) return false;
      }
      return true;
    });

    const measured = matches.map(c => {
      const syl = getSyllabus(c.id);
      const practicalHours = syl.modules
        .filter(m => m.type === 'practical' || m.type === 'ojt')
        .reduce((a, m) => a + m.hours, 0);
      const primary = c.skillIds[0];

      const metrics: CourseMetrics = {
        demandYoY: primary ? computeDemandTrend(primary, c.districtId).yoyChangePercent : 0,
        wageCeiling: Math.max(0, ...c.skillIds.map(s => getSkill(s)?.salaryRange[1] ?? 0)),
        durationMonths: c.durationMonths,
        totalHours: syl.totalHours,
        practicalShare: syl.totalHours ? practicalHours / syl.totalHours : 0,
        seatsVacant: Math.max(0, c.currentSeats - c.enrolled),
        fillRate: c.currentSeats ? c.enrolled / c.currentSeats : 0,
        staleModules: syl.modules.filter(m => m.decayFlag).length,
        nsqfLevel: syl.nsqfLevel,
      };
      return { course: c, syllabus: syl, metrics };
    });

    return measured.sort((a, b) => {
      const delta = sort.value(a.metrics) - sort.value(b.metrics);
      // Ties fall back to course name so the order is stable and predictable.
      if (delta === 0) return a.course.name.localeCompare(b.course.name);
      return sort.direction === 'asc' ? delta : -delta;
    });
  }, [districtId, type, query, sort]);

  const open = openId ? courses.find(c => c.id === openId) : null;

  /* ---------------- Detail view ---------------- */
  if (open) {
    const syllabus = getSyllabus(open.id);
    const district = districts.find(d => d.id === open.districtId)!;
    const experiments = experimentsForCourse(open.id);
    const scheme = schemes.find(s => s.code === open.scheme);
    const practicalHours = syllabus.modules
      .filter(m => m.type === 'practical' || m.type === 'ojt')
      .reduce((a, m) => a + m.hours, 0);
    const decaying = syllabus.modules.filter(m => m.decayFlag);
    const primarySkill = open.skillIds[0];
    const trend = primarySkill ? computeDemandTrend(primarySkill, open.districtId) : null;

    return (
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <PageHeader
          eyebrow={`${open.type} · ${district.name} District`}
          title={open.name}
          description={
            <>
              {open.durationMonths} months · {syllabus.totalHours.toLocaleString('en-IN')} contact hours ·
              NSQF Level {syllabus.nsqfLevel} · syllabus {syllabus.version} effective {syllabus.effectiveFrom}
            </>
          }
          breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Course Catalogue', href: '/courses' },
            { label: open.name },
          ]}
          actions={
            <button onClick={() => router.push('/courses')}
              className="text-[13px] font-semibold px-4 py-2.5 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
              ← Back to catalogue
            </button>
          }
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
          <Stat label="Duration" value={`${open.durationMonths} mo`}
            sub={`${syllabus.totalHours.toLocaleString('en-IN')} contact hours`} accent="var(--gov-navy)" />
          <Stat label="Hands-on share" value={`${Math.round((practicalHours / syllabus.totalHours) * 100)}%`}
            sub={`${practicalHours.toLocaleString('en-IN')} hours on the bench`} tone="positive" accent="var(--gov-navy)" />
          <Stat label="Seats" value={`${open.enrolled}/${open.currentSeats}`}
            sub={`${open.currentSeats - open.enrolled} vacant this intake`}
            tone={open.enrolled >= open.currentSeats ? 'warn' : 'positive'} accent="var(--gov-navy)" />
          <Stat label="Exit level" value={`NSQF L${syllabus.nsqfLevel}`}
            sub={`${syllabus.modules.length} modules`} accent="var(--gov-navy)" />
          <Stat label="Funded under" value={open.scheme ?? 'State'}
            sub={scheme?.ministry ?? 'Government of Maharashtra'} accent="var(--gov-navy)" />
        </div>

        {decaying.length > 0 && (
          <div className="mb-5">
            <Note tone="warn" title="Part of this syllabus teaches work that is disappearing">
              {decaying.map(m => m.code).join(', ')} teach tasks that are disappearing. Replacement
              content is under trial: results below.
            </Note>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          <div className="space-y-5">
            <Card title="Syllabus: module breakdown"
              subtitle={hasDetailedSyllabus(open.id)
                ? 'Published module plan with hours, tools and assessable outcomes'
                : 'Indicative module plan derived from the notified duration and NSQF level'}>
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
                        <Badge variant={MODULE_TONE[m.type]}>{MODULE_TYPE_LABEL[m.type]}</Badge>
                        <span className="mono text-[12px] font-bold text-[var(--ink-secondary)] w-14 text-right">{m.hours} h</span>
                        {dt && <Badge variant="declining" dot>stale</Badge>}
                        <svg width="12" height="12" viewBox="0 0 12 12" className="text-[var(--ink-tertiary)] group-open:rotate-180 transition-transform" fill="currentColor">
                          <path d="M1 4l5 5 5-5z" />
                        </svg>
                      </summary>
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-[var(--border)] bg-[var(--surface)]">
                        <Progress value={m.hours} max={syllabus.totalHours}
                          color={dt ? 'var(--signal-declining)' : 'var(--gov-navy)'} height={5}
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
                            Assessable outcomes
                          </p>
                          <ul className="space-y-1">
                            {m.outcomes.map(o => (
                              <li key={o} className="flex gap-2 text-[12px] text-[var(--ink-secondary)]">
                                <span className="text-[var(--gov-navy)] font-bold">›</span>{o}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {dt && (
                          <div className="mt-3 pt-3 border-t border-[var(--border)]">
                            <p className="text-[11px] font-bold text-[var(--signal-declining)] uppercase tracking-wide mb-1">
                              Dying Task Watch: {dt.id}
                            </p>
                            <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">
                              <strong>{dt.taskName}</strong> is down {Math.abs(dt.hoursChangeYoY)}% in work-hours
                              year on year, displaced by {dt.displacedBy}. {dt.recommendedAction}
                            </p>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            </Card>

            {experiments.length > 0 && (
              <Card title="Live syllabus experiments on this course"
                subtitle="Decided by cohort outcomes">
                <div className="space-y-4">
                  {experiments.map(e => {
                    const sig = significanceLabel(e.pValue);
                    return (
                      <div key={e.id} className="border border-[var(--border)] rounded-sm p-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <p className="mono text-[11px] text-[var(--ink-tertiary)]">{e.id}</p>
                          <Badge variant={
                            e.status === 'promoted' ? 'rising' : e.status === 'running' ? 'warn'
                            : e.status === 'rolled-back' ? 'declining' : 'officer'
                          } dot>{e.status.replace('-', ' ')}</Badge>
                        </div>
                        <p className="text-[12.5px] text-[var(--ink-secondary)] italic leading-relaxed mb-3">{e.hypothesis}</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[e.armA, e.armB].map((arm, i) => (
                            <div key={arm.label} className="border border-[var(--border)] rounded-sm p-3"
                              style={{ background: i === 1 ? 'var(--signal-rising-light)' : 'var(--surface)' }}>
                              <p className="text-[12px] font-bold">{arm.label}</p>
                              <p className="text-[11px] text-[var(--ink-secondary)] mt-1 leading-snug">{arm.changeSummary}</p>
                              <p className="text-[11.5px] mono mt-2">
                                {arm.trialPassRate}% gate · {arm.placementRate}% placed · {formatCurrency(arm.medianWage)}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-[12px]">
                            Lift <strong className="mono text-[var(--signal-rising)]">+{e.liftPercent}%</strong>
                          </span>
                          <Badge variant={sig.tone}>{sig.label}</Badge>
                        </div>
                        {e.decision && (
                          <p className="text-[12px] text-[var(--ink-secondary)] mt-2 pt-2 border-t border-[var(--border)]">
                            <strong className="text-[var(--gov-navy)]">Decision: </strong>{e.decision}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <Card title="Assessment pattern">
              <div className="space-y-3">
                {syllabus.assessmentPattern.map(a => (
                  <Progress key={a.component} value={a.weight} color="var(--gov-navy)"
                    label={a.component} showValue height={8} />
                ))}
              </div>
              <p className="text-[12px] text-[var(--ink-secondary)] mt-3 leading-relaxed">
                The practical component is scored from machine telemetry rather than an instructor&rsquo;s
                tick-box, so the mark on the certificate is backed by an equipment log.
              </p>
            </Card>

            <Card title="Skills taught">
              <ul className="space-y-2">
                {open.skillIds.map(sid => {
                  const s = getSkill(sid);
                  if (!s) return null;
                  const t = computeDemandTrend(sid, open.districtId);
                  return (
                    <li key={sid} className="border border-[var(--border)] rounded-sm px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[var(--ink)]">{s.name}</p>
                          <p className="text-[11px] text-[var(--ink-tertiary)]">
                            NSQF L{s.nsqfLevel} · {formatCurrency(s.salaryRange[0])}–{formatCurrency(s.salaryRange[1])}/mo
                          </p>
                        </div>
                        <Badge variant={t.direction === 'rising' ? 'rising' : t.direction === 'declining' ? 'declining' : 'stable'} dot>
                          {formatPercent(t.yoyChangePercent)}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {trend && trend.timeSeries.length > 0 && (
              <Card title={`Demand in ${district.name}`}
                subtitle={`Verified monthly vacancies for ${getSkill(primarySkill)?.name}`}>
                <TrendArea data={trend.timeSeries} height={200} />
                <p className="text-[12px] text-[var(--ink-secondary)] mt-3">
                  Current demand <strong className="mono">{formatNumber(trend.currentMonthlyDemand)}</strong>/month,
                  moving <strong className="mono">{formatPercent(trend.yoyChangePercent)}</strong> year on year.
                  Six-month forecast <strong className="mono">{formatNumber(trend.forecast6m)}</strong>/month.
                </p>
              </Card>
            )}

            {scheme && (
              <Card title={`Funded under ${scheme.code}`} subtitle={scheme.ministry}>
                <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{scheme.description}</p>
                <dl className="mt-3 space-y-2 text-[12px]">
                  <div><dt className="text-[var(--ink-tertiary)] font-semibold">Support</dt><dd>{scheme.funds}</dd></div>
                  <div><dt className="text-[var(--ink-tertiary)] font-semibold">Eligibility</dt><dd>{scheme.eligibility}</dd></div>
                </dl>
              </Card>
            )}

            <div className="gov-card p-4">
              <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed mb-3">
                Applications for this course are made through your candidate dashboard.
              </p>
              <Link href="/register?role=student"
                className="block text-center text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring"
                style={{ background: 'var(--gov-navy)' }}>
                Register &amp; apply →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Listing ---------------- */
  const totalSeats = filtered.reduce((a, r) => a + r.course.currentSeats, 0);
  const totalHours = filtered.reduce((a, r) => a + r.syllabus.totalHours, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <PageHeader
        eyebrow="Notified Courses"
        title="Course Catalogue & Syllabus"
        description="Every notified course, with its full syllabus published openly."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Course Catalogue' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Courses listed" value={filtered.length} sub={`of ${courses.length} notified state-wide`} accent="var(--gov-navy)" />
        <Stat label="Seats in this view" value={formatNumber(totalSeats)} sub="Current intake" accent="var(--gov-navy)" />
        <Stat label="Contact hours published" value={formatNumber(totalHours)} sub="Module-level detail for every course" accent="var(--gov-navy)" />
        <Stat label="Districts covered" value={districts.length} sub="Phase-I pilot" accent="var(--gov-navy)" />
      </div>

      <div className="gov-card p-4 mb-5 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[220px]">
          <label className="gov-label" htmlFor="q">Search course or skill</label>
          <input id="q" className="gov-input" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="e.g. electrician, EV, welding, CAD" />
        </div>
        <div className="min-w-[180px]">
          <label className="gov-label" htmlFor="f-dist">District</label>
          <select id="f-dist" className="gov-input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
            <option value="all">All districts</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="min-w-[170px]">
          <label className="gov-label" htmlFor="f-type">Course type</label>
          <select id="f-type" className="gov-input" value={type} onChange={e => setType(e.target.value as CourseType | 'all')}>
            <option value="all">All types</option>
            <option value="ITI">ITI (NCVT/SCVT)</option>
            <option value="Polytechnic">Polytechnic diploma</option>
            <option value="PMKVY">PMKVY 4.0 short-term</option>
            <option value="Private">Private / other</option>
          </select>
        </div>
        <div className="min-w-[270px]">
          <label className="gov-label" htmlFor="f-sort">Sort by</label>
          <select id="f-sort" className="gov-input" value={sortId} onChange={e => setSortId(e.target.value)}>
            {SORT_GROUPS.map(g => (
              <optgroup key={g} label={g}>
                {SORT_ORDERS.filter(o => o.group === g).map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 px-1">
        <p className="text-[12.5px] text-[var(--ink-secondary)]">
          <span className="font-semibold text-[var(--ink)]">{filtered.length}</span>{' '}
          course{filtered.length === 1 ? '' : 's'}, sorted by{' '}
          <span className="font-semibold text-[var(--gov-navy)]">{sort.label.split(': ')[0].toLowerCase()}</span>.{' '}
          <span className="text-[var(--ink-tertiary)]">{sort.rationale}</span>
        </p>
        {sortId !== 'demand' && (
          <button onClick={() => setSortId('demand')}
            className="shrink-0 text-[11.5px] gov-link font-semibold">
            Reset to default sort
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card><p className="text-[13px] text-[var(--ink-tertiary)]">No courses match these filters.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(({ course: c, syllabus: syl, metrics }, rank) => {
            const d = districts.find(x => x.id === c.districtId)!;
            const fill = Math.round(metrics.fillRate * 100);
            const stale = metrics.staleModules;
            const primary = c.skillIds[0];
            const trend = primary ? computeDemandTrend(primary, c.districtId) : null;
            return (
              <button key={c.id} onClick={() => router.push(`/courses?id=${c.id}`)}
                className="gov-card p-4 text-left hover:border-[var(--gov-navy)] hover:shadow-sm transition-all focus-ring flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h2 className="text-[14.5px] font-bold text-[var(--ink)] leading-snug">{c.name}</h2>
                    <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">
                      {d.name} · <span className="mono">{c.id}</span>
                    </p>
                  </div>
                  <Badge variant={TYPE_TONE[c.type]}>{c.type}</Badge>
                </div>

                {/* The value this card was ranked on, so the ordering is legible. */}
                <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-dashed border-[var(--border)]">
                  <span className="w-5 h-5 shrink-0 grid place-items-center rounded-sm bg-[var(--gov-navy)] text-white text-[10px] font-bold mono">
                    {rank + 1}
                  </span>
                  <span className="text-[12px] font-bold text-[var(--gov-navy)] mono">
                    {sort.format(metrics)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.skillIds.slice(0, 3).map(s => (
                    <span key={s} className="text-[10.5px] bg-[var(--surface-alt)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm text-[var(--ink-secondary)]">
                      {getSkill(s)?.name}
                    </span>
                  ))}
                </div>

                <dl className="grid grid-cols-3 gap-2 text-center py-2.5 border-y border-[var(--border)] mb-3">
                  <div>
                    <dt className="text-[9.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Duration</dt>
                    <dd className="text-[13.5px] font-bold mono">{c.durationMonths} mo</dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Hours</dt>
                    <dd className="text-[13.5px] font-bold mono">{formatNumber(syl.totalHours)}</dd>
                  </div>
                  <div>
                    <dt className="text-[9.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">NSQF</dt>
                    <dd className="text-[13.5px] font-bold mono">L{syl.nsqfLevel}</dd>
                  </div>
                </dl>

                <Progress value={c.enrolled} max={c.currentSeats}
                  color={fill >= 95 ? 'var(--signal-declining)' : fill >= 70 ? 'var(--signal-warn)' : 'var(--signal-rising)'}
                  label={`${c.enrolled} of ${c.currentSeats} seats filled`} height={6} />

                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                  {c.scheme && <Badge variant="default">{c.scheme}</Badge>}
                  <Badge variant="default">{syl.modules.length} modules</Badge>
                  {trend && (
                    <Badge variant={trend.direction === 'rising' ? 'rising' : trend.direction === 'declining' ? 'declining' : 'stable'} dot>
                      {formatPercent(trend.yoyChangePercent)} demand
                    </Badge>
                  )}
                  {stale > 0 && <Badge variant="declining" dot>{stale} stale module{stale > 1 ? 's' : ''}</Badge>}
                </div>

                <span className="text-[12.5px] font-bold text-[var(--gov-navy)] mt-3">View full syllabus →</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
