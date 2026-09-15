'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { rplApplications, rplStats, creditedHours } from '@/data/rpl';
import { tradeShifts } from '@/data/tradeShifts';
import { getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { GOV_ROLES } from '@/lib/rbac';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { RplApplication } from '@/types';

const STATUS_TONE = {
  submitted: 'warn', 'assessment-scheduled': 'officer', certified: 'rising', rejected: 'declining',
} as const;

export default function GovRplPage() {
  const { officer, can } = useGov();
  const role = officer ? GOV_ROLES[officer.role] : null;

  const scoped = role?.scope === 'state'
    ? rplApplications
    : rplApplications.filter(r => r.districtId === officer?.districtId);

  const [selected, setSelected] = useState<RplApplication | null>(
    scoped.find(r => r.status !== 'certified') ?? scoped[0] ?? null,
  );
  const [decided, setDecided] = useState<Record<string, string>>({});
  const [published, setPublished] = useState<Record<string, boolean>>({});
  const [level, setLevel] = useState(4);

  const stats = rplStats(role?.scope === 'state' ? undefined : officer?.districtId ?? undefined);

  return (
    <>
      <PageHeader
        eyebrow="Pillar 5: Precision Career Pathways & RPL"
        title="Prior-learning certification and trade-shift tracks"
        description="Prior-learning certification and published trade-shift tracks."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'RPL & Pathways' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Applications in scope" value={stats.total}
          sub={`${stats.pending} awaiting decision`} accent="var(--gov-navy)" />
        <Stat label="Certified" value={stats.certified}
          sub={`${stats.rejected} rejected on evidence`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Average wage uplift" value={`+${formatCurrency(stats.avgMonthlyUplift)}`}
          sub="per certified worker, per month" tone="positive" accent="var(--gov-navy)" />
        <Stat label="Extra training needed" value={`${stats.avgBridgeHours} h`}
          sub="against a 2,400 h full course" tone="positive" accent="var(--gov-navy)" />
        <Stat label="Published shift tracks" value={tradeShifts.length}
          sub="ICE → EV and six others" accent="var(--gov-navy)" />
      </div>

      <div className="grid xl:grid-cols-[1.2fr_1fr] gap-5 mb-5">
        <Card title="RPL application register" subtitle="Select an application to assess" dense>
          <Table
            columns={[
              { key: 'cand', header: 'Candidate', render: (r: RplApplication) => (
                <div>
                  <p className="text-[12.5px] font-semibold">{r.candidateName}</p>
                  <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{r.id} · {r.candidateKsid}</p>
                </div>
              ), sortValue: r => r.candidateName },
              { key: 'trade', header: 'Trade claimed', hideBelow: 'md', render: (r: RplApplication) => (
                <div className="text-[11.5px]">
                  <p>{getSkill(r.claimedSkillId)?.name}</p>
                  <p className="text-[var(--ink-tertiary)]">{districts.find(d => d.id === r.districtId)?.name}</p>
                </div>
              ) },
              { key: 'exp', header: 'Years', align: 'right',
                render: (r: RplApplication) => <span className="mono">{r.yearsOfExperience}</span>,
                sortValue: r => r.yearsOfExperience },
              { key: 'lvl', header: 'Level', align: 'center', render: (r: RplApplication) => (
                <span className="mono text-[11.5px]">
                  L{r.claimedNsqfLevel}
                  {r.assessedNsqfLevel !== null && (
                    <>
                      <span className="text-[var(--ink-tertiary)]"> → </span>
                      <strong className={r.assessedNsqfLevel >= r.claimedNsqfLevel ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}>
                        L{r.assessedNsqfLevel}
                      </strong>
                    </>
                  )}
                </span>
              ) },
              { key: 'bridge', header: 'Bridge', align: 'right', hideBelow: 'sm',
                render: (r: RplApplication) => <span className="mono">{r.bridgeHoursRequired} h</span>,
                sortValue: r => r.bridgeHoursRequired },
              { key: 'status', header: 'Status',
                render: (r: RplApplication) => <Badge variant={STATUS_TONE[r.status]}>{r.status.replace('-', ' ')}</Badge>,
                sortValue: r => r.status },
            ]}
            rows={scoped}
            rowKey={r => r.id}
            onRowClick={r => { setSelected(r); setLevel(r.assessedNsqfLevel ?? r.claimedNsqfLevel); }}
            highlight={r => r.id === selected?.id ? 'var(--gov-navy)'
              : r.status === 'submitted' ? 'var(--signal-warn)' : undefined}
          />
        </Card>

        <Card title={selected ? `Assessment: ${selected.candidateName}` : 'Assessment'}
          subtitle={selected ? `${selected.id} · submitted ${selected.submittedOn}` : undefined}
          action={<PermTag permission="rpl.certify" />}>
          {!selected ? (
            <p className="text-[13px] text-[var(--ink-tertiary)]">Select an application.</p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 pb-4 border-b border-[var(--border)] text-[12.5px]">
                <div><dt className="text-[var(--ink-tertiary)]">Trade claimed</dt><dd className="font-semibold">{getSkill(selected.claimedSkillId)?.name}</dd></div>
                <div><dt className="text-[var(--ink-tertiary)]">Experience</dt><dd className="font-semibold mono">{selected.yearsOfExperience} years</dd></div>
                <div><dt className="text-[var(--ink-tertiary)]">Current employer</dt><dd className="font-semibold">{selected.currentEmployerName ?? '-'}</dd></div>
                <div><dt className="text-[var(--ink-tertiary)]">District</dt><dd className="font-semibold">{districts.find(d => d.id === selected.districtId)?.name}</dd></div>
              </dl>

              <div className="py-4 border-b border-[var(--border)]">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                  Evidence on file
                </p>
                <ul className="space-y-1.5">
                  {selected.evidence.map(e => (
                    <li key={e.kind} className="flex items-start gap-2 text-[12px]">
                      <span className={e.verified ? 'text-[var(--signal-rising)] font-bold' : 'text-[var(--signal-declining)] font-bold'}>
                        {e.verified ? '✓' : '✗'}
                      </span>
                      <span>
                        <span className="font-semibold text-[var(--ink)]">{e.kind}</span>
                        <span className="block text-[11.5px] text-[var(--ink-secondary)] leading-snug">{e.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-2">
                  {selected.evidence.filter(e => e.verified).length} of {selected.evidence.length} evidence
                  items independently verified.
                </p>
              </div>

              <div className="py-4 border-b border-[var(--border)]">
                <Progress value={creditedHours(selected)} max={2400} color="var(--signal-rising)" height={10}
                  label={`${creditedHours(selected).toLocaleString('en-IN')} of 2,400 hours discharged by prior learning`}
                  showValue />
                <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2">
                  Bridge requirement: <strong className="mono">{selected.bridgeHoursRequired} hours</strong>{' '}
                  (about {Math.ceil(selected.bridgeHoursRequired / 40)} weeks part-time, delivered without the
                  candidate leaving work).
                </p>
              </div>

              <div className="py-4 border-b border-[var(--border)]">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[12px] font-semibold text-[var(--ink-secondary)]">Wage effect on certification</span>
                </div>
                <p className="text-[13px] mono">
                  <span className="text-[var(--ink-tertiary)] line-through">{formatCurrency(selected.currentMonthlyWage)}</span>
                  <span className="mx-2" aria-hidden>→</span>
                  <span className="font-bold text-[var(--signal-rising)] text-[17px]">{formatCurrency(selected.projectedMonthlyWage)}</span>
                  <span className="text-[11px] text-[var(--ink-tertiary)] ml-2">
                    ({formatPercent(Math.round(((selected.projectedMonthlyWage - selected.currentMonthlyWage) / selected.currentMonthlyWage) * 100))})
                  </span>
                </p>
              </div>

              <div className="py-4">
                <label className="gov-label" htmlFor="assess-level">Certify at NSQF level</label>
                <div className="flex gap-1.5">
                  {[2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setLevel(n)}
                      className={`flex-1 text-[13px] font-bold py-2 border rounded-sm focus-ring transition-colors ${
                        level === n
                          ? 'bg-[var(--gov-navy)] text-white border-[var(--gov-navy)]'
                          : 'border-[var(--border-strong)] hover:bg-[var(--surface-alt)]'
                      }`}>
                      L{n}
                    </button>
                  ))}
                </div>
                {level > selected.claimedNsqfLevel && (
                  <p className="text-[11.5px] text-[var(--signal-warn)] mt-1.5">
                    Certifying above the claimed level requires a written justification on the file.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--border)]">
                {decided[selected.id] ? (
                  <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">✓ {decided[selected.id]}</p>
                ) : selected.status === 'certified' || selected.status === 'rejected' ? (
                  <p className="text-[12.5px] text-[var(--ink-tertiary)]">
                    This application is closed ({selected.status}).
                  </p>
                ) : can('rpl.certify') ? (
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setDecided(d => ({ ...d, [selected.id]: `Certified at NSQF L${level} with ${selected.bridgeHoursRequired} h bridge prescribed` }))}
                      className="text-[12.5px] font-bold px-4 py-2 rounded-sm focus-ring"
                      style={{ background: 'var(--signal-rising)', color: '#fff' }}>
                      Certify at L{level}
                    </button>
                    <button onClick={() => setDecided(d => ({ ...d, [selected.id]: 'Assessment scheduled at the district centre within 14 days' }))}
                      className="text-[12.5px] font-semibold px-4 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                      Schedule assessment
                    </button>
                    <button onClick={() => setDecided(d => ({ ...d, [selected.id]: 'Rejected: evidence insufficient; candidate advised to apply through a regular course' }))}
                      className="text-[12.5px] font-bold px-4 py-2 bg-[var(--signal-declining)] text-white rounded-sm focus-ring">
                      Reject
                    </button>
                  </div>
                ) : (
                  <Gated permission="rpl.certify" label="RPL certification"><span /></Gated>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title="Trade-shift tracks"
        subtitle="Contracting trade → growing trade"
        action={<PermTag permission="pathway.publish" />}>
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {tradeShifts.map(s => {
            const from = getSkill(s.fromSkillId)!;
            const to = getSkill(s.toSkillId)!;
            const refDistrict = s.bridgeCourseAvailableDistrictIds[0];
            const fromTrend = computeDemandTrend(s.fromSkillId, refDistrict);
            const toTrend = computeDemandTrend(s.toSkillId, refDistrict);
            const key = `${s.fromSkillId}>${s.toSkillId}`;
            return (
              <div key={key} className="border border-[var(--border)] rounded-sm p-3.5">
                <p className="text-[13px] font-bold text-[var(--ink)] leading-snug mb-2">{s.bridgeModuleName}</p>

                <div className="flex items-center gap-2 text-[12px] mb-3">
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{from.name}</span>
                    <span className="block mono text-[10.5px] text-[var(--signal-declining)]">
                      {formatPercent(fromTrend.yoyChangePercent)} YoY
                    </span>
                  </span>
                  <svg width="22" height="14" viewBox="0 0 34 20" fill="none" stroke="var(--gov-navy)" strokeWidth="2.4" className="shrink-0">
                    <line x1="2" y1="10" x2="26" y2="10" strokeLinecap="round" />
                    <path d="M22 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="flex-1 min-w-0 text-right">
                    <span className="block font-semibold truncate">{to.name}</span>
                    <span className="block mono text-[10.5px] text-[var(--signal-rising)]">
                      {formatPercent(toTrend.yoyChangePercent)} YoY
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-[var(--border)] text-center">
                  <div>
                    <p className="text-[9.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Bridge</p>
                    <p className="text-[14px] font-bold mono">{s.bridgeDurationWeeks} wk</p>
                  </div>
                  <div>
                    <p className="text-[9.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Wage gain</p>
                    <p className="text-[14px] font-bold mono text-[var(--signal-rising)]">
                      +{formatCurrency(to.salaryRange[0] - from.salaryRange[0])}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Districts</p>
                    <p className="text-[14px] font-bold mono">{s.bridgeCourseAvailableDistrictIds.length}</p>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--ink-tertiary)] mt-2">
                  Offered in {s.bridgeCourseAvailableDistrictIds.map(d => districts.find(x => x.id === d)?.name).join(', ')}
                </p>

                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  {published[key] ? (
                    <p className="text-[11.5px] font-semibold text-[var(--signal-rising)]">
                      ✓ Published state-wide: now visible on every candidate dashboard
                    </p>
                  ) : can('pathway.publish') ? (
                    <button onClick={() => setPublished(p => ({ ...p, [key]: true }))}
                      className="w-full text-[12px] font-bold py-2 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring">
                      Publish to remaining districts
                    </button>
                  ) : (
                    <Gated permission="pathway.publish" label="Track publication"><span /></Gated>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
