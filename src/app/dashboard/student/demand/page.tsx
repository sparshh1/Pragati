'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { TrendArea, GapBars } from '@/components/charts/Charts';
import { skills, getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { dyingTasks, demandSignals, filterImpact, signalSources } from '@/data/signals';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { computeGapForDistrict } from '@/data/compute/gapAnalysis';
import { courses } from '@/data/courses';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';

export default function StudentDemandPage() {
  const { account } = useCitizen();
  const [districtId, setDistrictId] = useState(account?.districtId ?? 'pune');
  const [skillId, setSkillId] = useState('ev-battery-diagnostics');
  const skill = getSkill(skillId)!;
  const trend = computeDemandTrend(skillId, districtId);
  const gaps = computeGapForDistrict(districtId);
  const gap = gaps.find(g => g.skillId === skillId);
  const impact = filterImpact();

  const tasksInThisTrade = dyingTasks.filter(t => t.skillId === skillId);
  const coursesTeaching = courses.filter(c => c.districtId === districtId && c.skillIds.includes(skillId));

  // Every signal that fed this skill's curve, and what the filter did to it.
  const relevantSignals = demandSignals.filter(s => s.skillId === skillId && s.districtId === districtId);

  const verdictTone = { verified: 'rising', 'under-review': 'warn', quarantined: 'warn', rejected: 'declining' } as const;

  return (
    <>
      <PageHeader
        eyebrow="Before you choose"
        title="Does this trade have jobs?"
        description="Is this trade growing or shrinking where you live?"
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Demand & Dying Tasks' }]}
      />

      <PageGuide />

      {/* ---- Selector ---- */}
      <div className="gov-card p-4 mb-5 flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1">
          <label className="gov-label" htmlFor="skill-select">Trade / skill</label>
          <select id="skill-select" className="gov-input" value={skillId} onChange={e => setSkillId(e.target.value)}>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="min-w-[180px]">
          <label className="gov-label" htmlFor="district-select">District</label>
          <select id="district-select" className="gov-input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="pb-0.5">
          <Badge variant={trend.direction === 'rising' ? 'rising' : trend.direction === 'declining' ? 'declining' : 'stable'} dot>
            {trend.direction === 'rising' ? 'Growing' : trend.direction === 'declining' ? 'Contracting' : 'Stable'}
            {' · '}{formatPercent(trend.yoyChangePercent)} YoY
          </Badge>
        </div>
      </div>

      {/* ---- Verdict ---- */}
      <div className="mb-5">
        {trend.direction === 'rising' ? (
          <Note tone="success" title={`${skill.name} is worth learning in ${districts.find(d => d.id === districtId)?.name}`}>
            Verified vacancies have grown {formatPercent(trend.yoyChangePercent)} year on year, and training
            supply is {gap && gap.gap > 0 ? `${formatNumber(gap.gap)} seats short of demand` : 'roughly matched to demand'}.
            Entry wages run {formatCurrency(skill.salaryRange[0])}–{formatCurrency(skill.salaryRange[1])} per month at NSQF level {skill.nsqfLevel}.
          </Note>
        ) : trend.direction === 'declining' ? (
          <Note tone="danger" title={`Think carefully before enrolling in ${skill.name}`}>
            Verified vacancies have fallen {formatPercent(trend.yoyChangePercent)} year on year in this district.
            This does not mean the trade has no future everywhere: but in {districts.find(d => d.id === districtId)?.name},
            demand is contracting. A trade-shift track can take you into an adjacent growing trade by
            teaching only the difference.{' '}
            <Link href="/dashboard/student/pathways" className="gov-link font-semibold">See trade-shift tracks →</Link>
          </Note>
        ) : (
          <Note tone="info" title={`${skill.name} is stable in this district`}>
            Vacancies have moved {formatPercent(trend.yoyChangePercent)} year on year: neither growing nor
            contracting materially. Employment is available, but wage growth is likely to be slow.
          </Note>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.45fr_1fr] gap-5">
        <div className="space-y-5">
          <Card
            title="Jobs posted each month"
            subtitle={`${skill.name} · ${districts.find(d => d.id === districtId)?.name} · after trust weighting`}
            action={
              <span className="text-[11.5px] text-[var(--ink-tertiary)]">
                6-month forecast: <strong className="mono text-[var(--ink)]">{formatNumber(trend.forecast6m)}</strong>/mo
              </span>
            }
          >
            <TrendArea
              data={trend.timeSeries}
              supplyLine={gap ? Math.round(gap.currentSupply / 12) : undefined}
              height={270}
            />
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Current demand</p>
                <p className="text-[19px] font-bold mono">{formatNumber(trend.currentMonthlyDemand)}<span className="text-[12px] font-normal text-[var(--ink-tertiary)]">/mo</span></p>
              </div>
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Training seats here</p>
                <p className="text-[19px] font-bold mono">{gap ? formatNumber(gap.currentSupply) : '-'}<span className="text-[12px] font-normal text-[var(--ink-tertiary)]">/yr</span></p>
              </div>
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Annual shortfall</p>
                <p className={`text-[19px] font-bold mono ${gap && gap.gap > 0 ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}`}>
                  {gap ? (gap.gap > 0 ? formatNumber(gap.gap) : `${formatNumber(Math.abs(gap.gap))} surplus`) : '-'}
                </p>
              </div>
            </div>
          </Card>

          {/* ---- Dying Task Watch ---- */}
          <Card
            title="Skills that are disappearing"
            subtitle="Decline tracked below the trade name"
          >
            {tasksInThisTrade.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
                No task inside <strong>{skill.name}</strong> is currently flagged as contracting. Every
                task in this trade is either holding or growing in work-hour share.
              </p>
            ) : (
              <div className="space-y-4">
                {tasksInThisTrade.map(t => (
                  <div key={t.id} className="border border-[var(--border)] rounded-sm p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-[var(--ink)]">{t.taskName}</p>
                        <p className="text-[11.5px] text-[var(--ink-tertiary)] mono mt-0.5">{t.id}</p>
                      </div>
                      <Badge variant={t.severity === 'critical' ? 'declining' : t.severity === 'high' ? 'warn' : 'stable'} dot>
                        {t.severity === 'critical' ? 'Critical decline' : t.severity === 'high' ? 'High decline' : 'On watch'}
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <Progress
                          value={t.shareOfTradeHours * 100}
                          color="var(--signal-declining)"
                          label={`Still ${Math.round(t.shareOfTradeHours * 100)}% of your trade's contact hours`}
                          height={9}
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-[var(--ink-secondary)]">Work-hours change, year on year</p>
                        <p className="text-[20px] font-bold mono text-[var(--signal-declining)] leading-tight">
                          {t.hoursChangeYoY}%
                        </p>
                      </div>
                    </div>

                    <dl className="space-y-1.5 text-[12px]">
                      <div className="flex gap-2">
                        <dt className="w-[110px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Displaced by</dt>
                        <dd className="text-[var(--ink)]">{t.displacedBy}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-[110px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Still taught in</dt>
                        <dd className="mono text-[var(--ink)]">{t.syllabusModulesStillTeaching.join(', ')}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-[110px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Trainees exposed</dt>
                        <dd className="text-[var(--ink)]">{formatNumber(t.traineesExposed)} across the state</dd>
                      </div>
                    </dl>

                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                        What the department is doing
                      </p>
                      <p className="text-[12.5px] text-[var(--ink-secondary)]">{t.recommendedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title={`Demand vs supply across all trades in ${districts.find(d => d.id === districtId)?.name}`}
            subtitle="Positive bars are unmet demand; negative bars are training surplus">
            <GapBars
              data={gaps.slice(0, 14).map(g => ({ skillName: g.skillName, gap: g.gap, trend: g.trend }))}
              height={380}
            />
          </Card>
        </div>

        <div className="space-y-5">
          {/* ---- Trust filter explainer ---- */}
          <Card title="Why our numbers look smaller">
            <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed mb-4">
              Job boards count postings. This portal counts postings that turned into someone actually
              being paid. Each source carries a trust weight earned from its own payroll-confirmation
              history, and that weight is applied before any vacancy reaches the curve above.
            </p>
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[var(--border)]">
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Claimed</p>
                <p className="text-[20px] font-bold mono text-[var(--ink-tertiary)] line-through decoration-[var(--signal-declining)]">
                  {formatNumber(impact.raw)}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Counted</p>
                <p className="text-[20px] font-bold mono text-[var(--signal-rising)]">{formatNumber(impact.weighted)}</p>
              </div>
            </div>
            <p className="text-[12px] text-[var(--ink-secondary)] mt-3">
              <strong className="text-[var(--signal-declining)]">{impact.removedPercent}%</strong> of raw
              vacancy claims were removed as duplicates, ghost postings, bulk reposts or below-floor wages.
            </p>
          </Card>

          {/* ---- Signals behind this skill ---- */}
          <Card title="Where this number comes from" subtitle={`${relevantSignals.length} submissions for this trade & district`}>
            {relevantSignals.length === 0 ? (
              <p className="text-[12.5px] text-[var(--ink-tertiary)]">
                No individual signals on record for this combination in the current window. The curve
                above is built from the historical postings series.
              </p>
            ) : (
              <ul className="space-y-3">
                {relevantSignals.map(s => {
                  const src = signalSources.find(x => x.id === s.sourceId)!;
                  return (
                    <li key={s.id} className="border border-[var(--border)] rounded-sm p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-[12.5px] font-bold text-[var(--ink)] min-w-0">{src.name}</p>
                        <Badge variant={verdictTone[s.verdict]}>{s.verdict.replace('-', ' ')}</Badge>
                      </div>
                      <div className="flex items-baseline gap-2 text-[12px]">
                        <span className="mono text-[var(--ink-tertiary)] line-through">{formatNumber(s.reportedVacancies)} claimed</span>
                        <span aria-hidden>→</span>
                        <span className="mono font-bold text-[var(--ink)]">{formatNumber(s.weightedVacancies)} counted</span>
                        <span className="text-[10.5px] text-[var(--ink-tertiary)]">(weight {s.trustWeight})</span>
                      </div>
                      {s.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.flags.map(f => (
                            <span key={f} className="text-[9.5px] font-semibold bg-[var(--signal-declining-light)] text-[var(--signal-declining)] px-1.5 py-0.5 rounded-sm">
                              {f.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* ---- Where to train ---- */}
          <Card title={`Where to train for this in ${districts.find(d => d.id === districtId)?.name}`}>
            {coursesTeaching.length === 0 ? (
              <>
                <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">
                  No notified course in this district currently teaches {skill.name}. Where demand is
                  verified but no course exists, the district officer can raise it for skill onboarding.
                </p>
                <Link href="/courses" className="text-[12.5px] gov-link font-semibold mt-3 inline-block">
                  Search the state-wide catalogue →
                </Link>
              </>
            ) : (
              <ul className="space-y-2">
                {coursesTeaching.map(c => (
                  <li key={c.id} className="border border-[var(--border)] rounded-sm px-3 py-2.5">
                    <Link href={`/courses?id=${c.id}`} className="block group focus-ring">
                      <p className="text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--gov-navy)]">{c.name}</p>
                      <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-0.5">
                        {c.type} · {c.durationMonths} months · {c.currentSeats} seats ({c.enrolled} filled)
                        {c.scheme && ` · ${c.scheme}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Stat
            label="Entry wage band for this trade"
            value={`${formatCurrency(skill.salaryRange[0])} – ${formatCurrency(skill.salaryRange[1])}`}
            sub={`Monthly, at NSQF level ${skill.nsqfLevel}`}
            accent="var(--accent-student)"
          />
        </div>
      </div>
    </>
  );
}
