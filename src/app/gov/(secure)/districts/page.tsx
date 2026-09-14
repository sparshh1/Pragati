'use client';

import { useState, useMemo } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { GapBars, DistrictLines, StackedBars, C } from '@/components/charts/Charts';
import { districts } from '@/data/districts';
import { skills, getSkill } from '@/data/skills';
import { courses } from '@/data/courses';
import { uncoveredSkills, dyingTasks } from '@/data/signals';
import { computeGapForDistrict } from '@/data/compute/gapAnalysis';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { allSeatCalculations, CONSTRAINT_LABEL, demandDrivenAsk } from '@/data/capacity';
import { MONTHS } from '@/data/jobPostings';
import { GOV_ROLES } from '@/lib/rbac';
import { SECTOR_LABELS, Sector, UncoveredSkill } from '@/types';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';

const STATUS_TONE = {
  unaddressed: 'declining', proposed: 'warn', approved: 'officer', live: 'rising',
} as const;

const SECTOR_COLOURS: Record<Sector, string> = {
  'auto-ev': C.navy,
  electrical: C.teal,
  textile: C.saffron,
  'retail-bpo': C.grey,
  construction: C.green,
};

export default function GovDistrictsPage() {
  const { officer, can } = useGov();
  const role = officer ? GOV_ROLES[officer.role] : null;

  const scopedDistricts = role?.scope === 'state'
    ? districts
    : districts.filter(d => d.id === officer?.districtId);

  const [districtId, setDistrictId] = useState(scopedDistricts[0]?.id ?? 'pune');
  const [onboarded, setOnboarded] = useState<Record<string, boolean>>({});
  const [sectorFilter, setSectorFilter] = useState<Sector | 'all'>('all');

  const district = districts.find(d => d.id === districtId)!;
  const gaps = computeGapForDistrict(districtId);
  const filteredGaps = sectorFilter === 'all' ? gaps : gaps.filter(g => g.sector === sectorFilter);
  const calc = allSeatCalculations().find(c => c.districtId === districtId)!;

  const localUncovered = uncoveredSkills.filter(u => u.districtId === districtId);
  const localCourses = courses.filter(c => c.districtId === districtId);
  const localDying = dyingTasks.filter(t => t.affectedDistrictIds.includes(districtId));

  // Multi-district comparison of one high-signal skill over time.
  const [compareSkill, setCompareSkill] = useState('ev-battery-diagnostics');
  const comparison = useMemo(() => {
    return MONTHS.map(month => {
      const row: Record<string, string | number> = { month };
      for (const d of scopedDistricts) {
        const series = computeDemandTrend(compareSkill, d.id).timeSeries;
        row[d.id] = series.find(s => s.month === month)?.postingsCount ?? 0;
      }
      return row;
    });
  }, [compareSkill, scopedDistricts]);

  const districtSeries = scopedDistricts.map((d, i) => ({
    key: d.id,
    name: d.name,
    color: [C.navy, C.green, C.saffron, C.teal, C.red, C.grey][i % 6],
  }));

  // Sector composition of unmet demand, per district.
  const sectorStack = useMemo(() => {
    return scopedDistricts.map(d => {
      const g = computeGapForDistrict(d.id);
      const row: Record<string, string | number> = { name: d.name };
      for (const s of Object.keys(SECTOR_LABELS) as Sector[]) {
        row[s] = g.filter(x => x.sector === s && x.gap > 0).reduce((a, x) => a + x.gap, 0);
      }
      return row;
    });
  }, [scopedDistricts]);

  const totalUnmet = gaps.filter(g => g.gap > 0).reduce((a, g) => a + g.gap, 0);

  return (
    <>
      <PageHeader
        eyebrow="Demand Intelligence · District Analysis"
        title="District analysis and skill onboarding"
        description="Where demand and training supply diverge."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'District Analysis' }]}
        actions={
          <div className="min-w-[190px]">
            <label className="gov-label" htmlFor="dist-pick">District</label>
            <select id="dist-pick" className="gov-input" value={districtId}
              onChange={e => setDistrictId(e.target.value)}
              disabled={scopedDistricts.length === 1}>
              {scopedDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        }
      />

      <PageGuide />

      {role?.scope !== 'state' && (
        <div className="mb-5">
          <Note tone="info" title="Scoped view">
            As {role?.title} you hold district scope. Only {district.name} data is loaded — state-wide
            comparison requires the <span className="mono">district.all</span> permission.
          </Note>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Population" value={`${(district.population / 10000000).toFixed(2)} Cr`}
          sub={district.industries.slice(0, 2).join(' · ')} accent="var(--gov-navy)" />
        <Stat label="Verified demand ask" value={formatNumber(demandDrivenAsk[districtId] ?? 0)}
          sub="seats/year, after trust weighting" accent="var(--gov-navy)" />
        <Stat label="Hard seat limit" value={formatNumber(calc.hardLimit)}
          sub={`bound by ${CONSTRAINT_LABEL[calc.bindingConstraint].toLowerCase()}`}
          tone="warn" accent="var(--gov-navy)" />
        <Stat label="Unmet demand" value={formatNumber(totalUnmet)}
          sub={`across ${gaps.filter(g => g.gap > 0).length} trades`} tone="negative" accent="var(--gov-navy)" />
        <Stat label="Uncovered skills" value={localUncovered.length}
          sub={`${localUncovered.filter(u => u.status === 'unaddressed').length} with no course anywhere`}
          tone="negative" accent="var(--gov-navy)" />
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mb-5">
        <Card title={`Demand vs supply — ${district.name}`}
          subtitle="Positive is unmet demand; negative is training surplus"
          action={
            <select className="gov-input py-1 text-[12px] w-auto" value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value as Sector | 'all')}>
              <option value="all">All sectors</option>
              {(Object.keys(SECTOR_LABELS) as Sector[]).map(s => (
                <option key={s} value={s}>{SECTOR_LABELS[s]}</option>
              ))}
            </select>
          }>
          <GapBars data={filteredGaps.map(g => ({ skillName: g.skillName, gap: g.gap, trend: g.trend }))}
            height={420} />
        </Card>

        <div className="space-y-5">
          <Card title="Cross-district demand trajectory"
            subtitle="One trade, across your districts"
            action={
              <select className="gov-input py-1 text-[12px] w-auto max-w-[190px]" value={compareSkill}
                onChange={e => setCompareSkill(e.target.value)}>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            }>
            <DistrictLines data={comparison} series={districtSeries} height={250} />
          </Card>

          <Card title="Unmet demand by sector"
            subtitle="Shortfall by sector">
            <StackedBars
              data={sectorStack}
              series={(Object.keys(SECTOR_LABELS) as Sector[]).map(s => ({
                key: s, name: SECTOR_LABELS[s], color: SECTOR_COLOURS[s],
              }))}
              height={270}
            />
          </Card>
        </div>
      </div>

      {/* ---- Skill onboarding queue ---- */}
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-5">
        <Card title="Skill onboarding queue"
          subtitle="Demand with no course behind it"
          action={<PermTag permission="skill.onboard" />}>
          {localUncovered.length === 0 ? (
            <p className="text-[13px] text-[var(--ink-tertiary)]">
              Every trade with verified demand in {district.name} has at least one course behind it.
            </p>
          ) : (
            <div className="space-y-3">
              {localUncovered.map(u => (
                <UncoveredCard key={u.id} u={u}
                  onboarded={Boolean(onboarded[u.id])}
                  canOnboard={can('skill.onboard')}
                  onOnboard={() => setOnboarded(o => ({ ...o, [u.id]: true }))} />
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Dying tasks affecting this district"
            subtitle="Decline below the trade name">
            {localDying.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">No tasks flagged in this district.</p>
            ) : (
              <ul className="space-y-2.5">
                {localDying.map(t => (
                  <li key={t.id} className="border border-[var(--border)] rounded-sm p-3"
                    style={{ boxShadow: `inset 3px 0 0 ${t.severity === 'critical' ? 'var(--signal-declining)' : 'var(--signal-warn)'}` }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">{t.taskName}</p>
                      <Badge variant={t.severity === 'critical' ? 'declining' : 'warn'}>{t.severity}</Badge>
                    </div>
                    <p className="text-[11.5px] text-[var(--ink-secondary)] leading-snug">
                      {t.hoursChangeYoY}% work-hours YoY · still {Math.round(t.shareOfTradeHours * 100)}% of
                      trade hours · {formatNumber(t.traineesExposed)} trainees exposed
                    </p>
                    <p className="text-[11px] text-[var(--ink-tertiary)] mt-1">
                      Modules: <span className="mono">{t.syllabusModulesStillTeaching.join(', ')}</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Course inventory" subtitle={`${localCourses.length} notified courses in ${district.name}`} dense>
            <Table
              columns={[
                { key: 'name', header: 'Course', render: c => (
                  <div>
                    <p className="text-[12.5px] font-semibold">{c.name}</p>
                    <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{c.id}</p>
                  </div>
                ) },
                { key: 'type', header: 'Type', hideBelow: 'sm',
                  render: c => <Badge variant="default">{c.type}</Badge> },
                { key: 'seats', header: 'Seats', align: 'right',
                  render: c => (
                    <div className="w-[74px] ml-auto">
                      <Progress value={c.enrolled} max={c.currentSeats}
                        color={c.enrolled / c.currentSeats > 0.9 ? 'var(--signal-declining)' : 'var(--signal-rising)'}
                        height={5} />
                      <p className="text-[10.5px] mono text-right mt-0.5">{c.enrolled}/{c.currentSeats}</p>
                    </div>
                  ),
                  sortValue: c => c.currentSeats },
              ]}
              rows={localCourses}
              rowKey={c => c.id}
            />
          </Card>
        </div>
      </div>

      <Card title={`Full gap register — ${district.name}`} subtitle="Demand, supply and trajectory" dense>
        <Table
          columns={[
            { key: 'skill', header: 'Trade', render: g => (
              <div>
                <p className="text-[12.5px] font-semibold">{g.skillName}</p>
                <p className="text-[10.5px] text-[var(--ink-tertiary)]">{SECTOR_LABELS[g.sector]}</p>
              </div>
            ), sortValue: g => g.skillName },
            { key: 'demand', header: 'Verified demand/yr', align: 'right',
              render: g => <span className="mono">{formatNumber(g.annualDemand)}</span>, sortValue: g => g.annualDemand },
            { key: 'supply', header: 'Seats/yr', align: 'right',
              render: g => <span className="mono">{formatNumber(g.currentSupply)}</span>, sortValue: g => g.currentSupply },
            { key: 'gap', header: 'Gap', align: 'right',
              render: g => (
                <span className={`mono font-bold ${g.gap > 0 ? 'text-[var(--signal-warn)]' : 'text-[var(--signal-stable)]'}`}>
                  {g.gap > 0 ? formatNumber(g.gap) : `(${formatNumber(Math.abs(g.gap))})`}
                </span>
              ), sortValue: g => g.gap },
            { key: 'yoy', header: 'YoY', align: 'right', hideBelow: 'sm',
              render: g => (
                <span className={`mono ${g.yoyChangePercent > 0 ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}`}>
                  {formatPercent(g.yoyChangePercent)}
                </span>
              ), sortValue: g => g.yoyChangePercent },
            { key: 'trend', header: 'Trend',
              render: g => (
                <Badge variant={g.trend === 'rising' ? 'rising' : g.trend === 'declining' ? 'declining' : 'stable'} dot>
                  {g.trend}
                </Badge>
              ) },
            { key: 'wage', header: 'Wage band', align: 'right', hideBelow: 'lg',
              render: g => {
                const s = getSkill(g.skillId);
                return <span className="mono text-[11.5px]">
                  {s ? `${formatCurrency(s.salaryRange[0])}–${formatCurrency(s.salaryRange[1])}` : '—'}
                </span>;
              } },
          ]}
          rows={gaps}
          rowKey={g => g.skillId}
          highlight={g => g.gap > 500 ? 'var(--signal-warn)' : g.trend === 'declining' ? 'var(--signal-declining)' : undefined}
        />
      </Card>
    </>
  );
}

function UncoveredCard({
  u, onboarded, canOnboard, onOnboard,
}: {
  u: UncoveredSkill; onboarded: boolean; canOnboard: boolean; onOnboard: () => void;
}) {
  return (
    <div className="border border-[var(--border)] rounded-sm p-3.5"
      style={{ boxShadow: `inset 3px 0 0 ${
        u.status === 'unaddressed' ? 'var(--signal-declining)'
        : u.status === 'live' ? 'var(--signal-rising)' : 'var(--signal-warn)'
      }` }}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-[var(--ink)]">{u.skillName}</p>
          <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">
            {u.id} · {SECTOR_LABELS[u.sector]} · NSQF L{u.proposedNsqfLevel} proposed
          </p>
        </div>
        <Badge variant={STATUS_TONE[u.status]} dot>{u.status}</Badge>
      </div>

      <div className="grid sm:grid-cols-4 gap-3 py-2.5 border-y border-[var(--border)] text-center">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Weighted demand</p>
          <p className="text-[15px] font-bold mono">{formatNumber(u.weightedAnnualDemand)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Median wage</p>
          <p className="text-[15px] font-bold mono">{formatCurrency(u.medianWageOffered)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Content gap</p>
          <p className="text-[15px] font-bold mono">{u.bridgeGapWeeks} wk</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Evidence</p>
          <p className="text-[15px] font-bold mono">{u.evidenceSignalCount}</p>
        </div>
      </div>

      <dl className="mt-2.5 space-y-1 text-[11.5px]">
        <div className="flex gap-2">
          <dt className="w-[120px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Nearest course</dt>
          <dd className="text-[var(--ink)]">
            {u.nearestExistingCourse ?? (
              <span className="text-[var(--signal-declining)] font-semibold">
                None in the state — this would be a new trade
              </span>
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-[120px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Requested by</dt>
          <dd className="text-[var(--ink)]">{u.requestingEmployers.join(', ')}</dd>
        </div>
      </dl>

      <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
        <PermTag permission="skill.onboard" />
        {onboarded ? (
          <span className="text-[12px] font-semibold text-[var(--signal-rising)]">
            ✓ Onboarding initiated — curriculum cell notified, NSQF alignment requested
          </span>
        ) : u.status === 'live' ? (
          <span className="text-[12px] text-[var(--signal-rising)] font-semibold">Already running</span>
        ) : canOnboard ? (
          <button onClick={onOnboard}
            className="text-[12px] font-bold px-3.5 py-1.5 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring">
            Onboard this skill →
          </button>
        ) : (
          <Gated permission="skill.onboard" label="Skill onboarding"><span /></Gated>
        )}
      </div>
    </div>
  );
}
