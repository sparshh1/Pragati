'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { GapBars, TrendArea, DistrictLines, StackedBars, C } from '@/components/charts/Charts';
import { districts } from '@/data/districts';
import { skills, getSkill } from '@/data/skills';
import { computeGapForDistrict } from '@/data/compute/gapAnalysis';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { MONTHS } from '@/data/jobPostings';
import { filterImpact, dyingTasks, uncoveredSkills } from '@/data/signals';
import { allSeatCalculations, CONSTRAINT_LABEL } from '@/data/capacity';
import { SECTOR_LABELS, Sector, GapAnalysisResult } from '@/types';
import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';

const SECTOR_COLOURS: Record<Sector, string> = {
  'auto-ev': C.navy, electrical: C.teal, textile: C.saffron,
  'retail-bpo': C.grey, construction: C.green,
};

export function PublicDemand() {
  const params = useSearchParams();
  // Seeded from ?district= so a link from the homepage district cards lands correctly.
  const [districtId, setDistrictId] = useState(() => {
    const d = params.get('district');
    return d && districts.some(x => x.id === d) ? d : 'pune';
  });
  const [skillId, setSkillId] = useState('ev-battery-diagnostics');

  const district = districts.find(d => d.id === districtId)!;
  const gaps = computeGapForDistrict(districtId);
  const trend = computeDemandTrend(skillId, districtId);
  const calc = allSeatCalculations().find(c => c.districtId === districtId)!;
  const impact = filterImpact();

  const comparison = useMemo(() => MONTHS.map(month => {
    const row: Record<string, string | number> = { month };
    for (const d of districts) {
      row[d.id] = computeDemandTrend(skillId, d.id).timeSeries.find(s => s.month === month)?.postingsCount ?? 0;
    }
    return row;
  }), [skillId]);

  const sectorStack = useMemo(() => districts.map(d => {
    const g = computeGapForDistrict(d.id);
    const row: Record<string, string | number> = { name: d.name };
    for (const s of Object.keys(SECTOR_LABELS) as Sector[]) {
      row[s] = g.filter(x => x.sector === s && x.gap > 0).reduce((a, x) => a + x.gap, 0);
    }
    return row;
  }), []);

  const totalUnmet = gaps.filter(g => g.gap > 0).reduce((a, g) => a + g.gap, 0);
  const rising = gaps.filter(g => g.trend === 'rising').length;
  const declining = gaps.filter(g => g.trend === 'declining').length;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <PageHeader
        eyebrow="Open Data"
        title="Labour Market Dashboard"
        description="Verified hiring demand by district and trade."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Labour Market Data' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Claims screened" value={formatNumber(impact.raw)}
          sub="Raw vacancy claims received" accent="var(--gov-navy)" />
        <Stat label="Counted as demand" value={formatNumber(impact.weighted)}
          sub={`${impact.removedPercent}% removed as noise`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Unmet demand here" value={formatNumber(totalUnmet)}
          sub={`across ${gaps.filter(g => g.gap > 0).length} trades in ${district.name}`}
          tone="warn" accent="var(--gov-navy)" />
        <Stat label="Growing / contracting" value={`${rising} / ${declining}`}
          sub="Trades by direction of travel" accent="var(--gov-navy)" />
        <Stat label="Seat ceiling" value={formatNumber(calc.hardLimit)}
          sub={`bound by ${CONSTRAINT_LABEL[calc.bindingConstraint].toLowerCase()}`}
          tone="warn" accent="var(--gov-navy)" />
      </div>

      <div className="gov-card p-4 mb-5 flex flex-wrap items-end gap-4">
        <div className="min-w-[200px]">
          <label className="gov-label" htmlFor="pd-dist">District</label>
          <select id="pd-dist" className="gov-input" value={districtId} onChange={e => setDistrictId(e.target.value)}>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="min-w-[240px]">
          <label className="gov-label" htmlFor="pd-skill">Trade</label>
          <select id="pd-skill" className="gov-input" value={skillId} onChange={e => setSkillId(e.target.value)}>
            {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="pb-0.5 flex flex-wrap gap-2">
          <Badge variant={trend.direction === 'rising' ? 'rising' : trend.direction === 'declining' ? 'declining' : 'stable'} dot>
            {formatPercent(trend.yoyChangePercent)} year on year
          </Badge>
          <Badge variant="default">
            {formatCurrency(getSkill(skillId)!.salaryRange[0])}–{formatCurrency(getSkill(skillId)!.salaryRange[1])}/mo
          </Badge>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mb-5">
        <Card title={`${getSkill(skillId)?.name} — ${district.name}`}
          subtitle="Vacancies vs training supply">
          <TrendArea data={trend.timeSeries}
            supplyLine={Math.round((gaps.find(g => g.skillId === skillId)?.currentSupply ?? 0) / 12)}
            height={270} />
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            <div>
              <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Current</p>
              <p className="text-[19px] font-bold mono">{formatNumber(trend.currentMonthlyDemand)}<span className="text-[11px] font-normal text-[var(--ink-tertiary)]">/mo</span></p>
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">6-month forecast</p>
              <p className="text-[19px] font-bold mono">{formatNumber(trend.forecast6m)}<span className="text-[11px] font-normal text-[var(--ink-tertiary)]">/mo</span></p>
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Trend slope</p>
              <p className="text-[19px] font-bold mono">{trend.slope > 0 ? '+' : ''}{trend.slope.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        <Card title="Same trade across all six districts"
          subtitle="Where the work actually is">
          <DistrictLines data={comparison}
            series={districts.map((d, i) => ({
              key: d.id, name: d.name,
              color: [C.navy, C.green, C.saffron, C.teal, C.red, C.grey][i % 6],
            }))}
            height={270} />
        </Card>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mb-5">
        <Card title={`Demand vs supply — ${district.name}`}
          subtitle="Positive bars are unmet demand; negative bars are training surplus">
          <GapBars data={gaps.slice(0, 14).map(g => ({ skillName: g.skillName, gap: g.gap, trend: g.trend }))}
            height={400} />
        </Card>

        <div className="space-y-5">
          <Card title="Unmet demand by sector" subtitle="Composition of the shortfall across districts">
            <StackedBars data={sectorStack}
              series={(Object.keys(SECTOR_LABELS) as Sector[]).map(s => ({
                key: s, name: SECTOR_LABELS[s], color: SECTOR_COLOURS[s],
              }))}
              height={280} />
          </Card>

          <Card title="Skills with demand and no course"
            subtitle="In the onboarding queue">
            <ul className="space-y-2">
              {uncoveredSkills.slice(0, 5).map(u => (
                <li key={u.id} className="flex items-start justify-between gap-3 border border-[var(--border)] rounded-sm px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-[var(--ink)]">{u.skillName}</p>
                    <p className="text-[11px] text-[var(--ink-tertiary)]">
                      {districts.find(d => d.id === u.districtId)?.name} · {formatCurrency(u.medianWageOffered)}/mo ·{' '}
                      {u.evidenceSignalCount} corroborated signals
                    </p>
                  </div>
                  <Badge variant={u.status === 'live' ? 'rising' : u.status === 'unaddressed' ? 'declining' : 'warn'} dot>
                    {u.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <Card title={`Full trade register — ${district.name}`} subtitle="Demand and trajectory" dense>
          <Table
            columns={[
              { key: 'skill', header: 'Trade', render: (g: GapAnalysisResult) => (
                <div>
                  <p className="text-[12.5px] font-semibold">{g.skillName}</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)]">{SECTOR_LABELS[g.sector]}</p>
                </div>
              ), sortValue: g => g.skillName },
              { key: 'demand', header: 'Demand/yr', align: 'right',
                render: g => <span className="mono">{formatNumber(g.annualDemand)}</span>, sortValue: g => g.annualDemand },
              { key: 'supply', header: 'Seats/yr', align: 'right', hideBelow: 'sm',
                render: g => <span className="mono">{formatNumber(g.currentSupply)}</span>, sortValue: g => g.currentSupply },
              { key: 'gap', header: 'Gap', align: 'right',
                render: g => (
                  <span className={`mono font-bold ${g.gap > 0 ? 'text-[var(--signal-warn)]' : 'text-[var(--signal-stable)]'}`}>
                    {g.gap > 0 ? formatNumber(g.gap) : `(${formatNumber(Math.abs(g.gap))})`}
                  </span>
                ), sortValue: g => g.gap },
              { key: 'trend', header: 'Trend',
                render: g => (
                  <Badge variant={g.trend === 'rising' ? 'rising' : g.trend === 'declining' ? 'declining' : 'stable'} dot>
                    {formatPercent(g.yoyChangePercent)}
                  </Badge>
                ), sortValue: g => g.yoyChangePercent },
            ]}
            rows={gaps}
            rowKey={g => g.skillId}
            onRowClick={g => setSkillId(g.skillId)}
            highlight={g => g.skillId === skillId ? 'var(--gov-navy)' : undefined}
          />
        </Card>

        <Card title="Dying Task Watch" subtitle="Decline tracked below the trade name">
          <ul className="space-y-2.5">
            {dyingTasks.filter(t => t.affectedDistrictIds.includes(districtId)).map(t => (
              <li key={t.id} className="border border-[var(--border)] rounded-sm p-3"
                style={{ boxShadow: `inset 3px 0 0 ${t.severity === 'critical' ? 'var(--signal-declining)' : 'var(--signal-warn)'}` }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">{t.taskName}</p>
                  <Badge variant={t.severity === 'critical' ? 'declining' : 'warn'}>{t.hoursChangeYoY}%</Badge>
                </div>
                <p className="text-[11.5px] text-[var(--ink-secondary)] leading-snug">
                  Displaced by {t.displacedBy}
                </p>
              </li>
            ))}
          </ul>
          <Link href="/courses" className="text-[12.5px] gov-link font-semibold mt-3 inline-block">
            See which courses still teach these →
          </Link>
        </Card>
      </div>
    </div>
  );
}
