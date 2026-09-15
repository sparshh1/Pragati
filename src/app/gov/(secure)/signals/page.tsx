'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { TrustScatter } from '@/components/charts/Charts';
import { signalSources, demandSignals, dyingTasks, filterImpact } from '@/data/signals';
import { getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { GOV_ROLES } from '@/lib/rbac';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { DemandSignal, SignalSource, DyingTask } from '@/types';

const VERDICT_TONE = {
  verified: 'rising', 'under-review': 'warn', quarantined: 'warn', rejected: 'declining',
} as const;

export default function GovSignalsPage() {
  const { officer, can } = useGov();
  const role = officer ? GOV_ROLES[officer.role] : null;

  const [selected, setSelected] = useState<DemandSignal | null>(demandSignals[1]);
  const [actions, setActions] = useState<Record<string, string>>({});
  const [blacklisted, setBlacklisted] = useState<Record<string, boolean>>({});

  const impact = filterImpact();

  const scoped = role?.scope === 'state'
    ? demandSignals
    : demandSignals.filter(s => s.districtId === officer?.districtId);

  const scatter = signalSources.map(s => ({
    name: s.name,
    trust: s.trustScore,
    confirmRate: Math.round((s.signalsConfirmedByPayroll / s.signalsSubmitted) * 100),
    volume: s.signalsSubmitted,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Pillar 1: Demand Intelligence"
        title="Signal verification console"
        description="Every vacancy claim, before it reaches the seat plan."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'Signal Verification' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Claims screened" value={formatNumber(impact.raw)}
          sub={`${impact.signalsScreened} signals this cycle`} accent="var(--gov-navy)" />
        <Stat label="Admitted to the curve" value={formatNumber(impact.weighted)}
          sub={`${impact.removedPercent}% removed as noise`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Blocked outright" value={impact.signalsBlocked}
          sub="Rejected or quarantined" tone="negative" accent="var(--gov-navy)" />
        <Stat label="Sources below threshold" value={signalSources.filter(s => s.trustScore < 55).length}
          sub={`of ${signalSources.length} registered sources`} tone="warn" accent="var(--gov-navy)" />
        <Stat label="Tasks in critical decline" value={dyingTasks.filter(t => t.severity === 'critical').length}
          sub={`${formatNumber(dyingTasks.reduce((a, t) => a + t.traineesExposed, 0))} trainees exposed`}
          tone="negative" accent="var(--gov-navy)" />
      </div>

      <div className="grid xl:grid-cols-[1.25fr_1fr] gap-5 mb-5">
        <Card title="Signal register" subtitle="Select a signal to inspect the evidence behind it" dense>
          <Table
            columns={[
              { key: 'id', header: 'Signal', render: (s: DemandSignal) => (
                <div>
                  <p className="mono text-[11.5px] font-semibold">{s.id}</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)] truncate max-w-[140px]">
                    {signalSources.find(x => x.id === s.sourceId)?.name}
                  </p>
                </div>
              ) },
              { key: 'role', header: 'Trade / district', hideBelow: 'md', render: (s: DemandSignal) => (
                <div className="text-[11.5px]">
                  <p>{getSkill(s.skillId)?.name}</p>
                  <p className="text-[var(--ink-tertiary)]">{districts.find(d => d.id === s.districtId)?.name}</p>
                </div>
              ) },
              { key: 'claimed', header: 'Claimed', align: 'right',
                render: (s: DemandSignal) => <span className="mono text-[var(--ink-tertiary)]">{formatNumber(s.reportedVacancies)}</span>,
                sortValue: s => s.reportedVacancies },
              { key: 'counted', header: 'Counted', align: 'right',
                render: (s: DemandSignal) => <span className="mono font-bold">{formatNumber(s.weightedVacancies)}</span>,
                sortValue: s => s.weightedVacancies },
              { key: 'w', header: 'Weight', align: 'right', hideBelow: 'sm',
                render: (s: DemandSignal) => <span className="mono">{s.trustWeight.toFixed(2)}</span>,
                sortValue: s => s.trustWeight },
              { key: 'verdict', header: 'Verdict',
                render: (s: DemandSignal) => <Badge variant={VERDICT_TONE[s.verdict]}>{s.verdict.replace('-', ' ')}</Badge>,
                sortValue: s => s.verdict },
            ]}
            rows={scoped}
            rowKey={s => s.id}
            onRowClick={setSelected}
            highlight={s => s.id === selected?.id ? 'var(--gov-navy)'
              : s.verdict === 'rejected' ? 'var(--signal-declining)' : undefined}
          />
        </Card>

        <Card title={selected ? `Evidence: ${selected.id}` : 'Evidence'}
          subtitle={selected ? `${getSkill(selected.skillId)?.name} · ${districts.find(d => d.id === selected.districtId)?.name} · posted ${selected.postedOn}` : undefined}>
          {!selected ? (
            <p className="text-[13px] text-[var(--ink-tertiary)]">Select a signal from the register.</p>
          ) : (
            <SignalDetail
              signal={selected}
              source={signalSources.find(s => s.id === selected.sourceId)!}
              canVerify={can('signal.verify')}
              action={actions[selected.id]}
              onAction={(label) => setActions(a => ({ ...a, [selected.id]: label }))}
            />
          )}
        </Card>
      </div>

      <div className="grid xl:grid-cols-[1fr_1.2fr] gap-5 mb-5">
        <Card title="Source trust landscape"
          subtitle="Size = volume · height = confirmed hires">
          <TrustScatter data={scatter} height={320} />
          <p className="text-[12px] text-[var(--ink-secondary)] mt-3 leading-relaxed">
            Two aggregators account for over 22,000 of the postings in this register and under 6,700
            confirmed hires between them. Weighting by confirmation rather than by volume is the single
            change that stops them from setting the state&rsquo;s training budget.
          </p>
        </Card>

        <Card title="Registered sources" subtitle="Trust is recomputed after each audit cycle" dense>
          <Table
            columns={[
              { key: 'name', header: 'Source', render: (s: SignalSource) => (
                <div>
                  <p className="text-[12.5px] font-semibold">{s.name}</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)]">{s.kind.replace(/-/g, ' ')} · audited {s.lastAuditedOn}</p>
                </div>
              ), sortValue: s => s.name },
              { key: 'trust', header: 'Trust', align: 'right', sortValue: s => s.trustScore,
                render: (s: SignalSource) => (
                  <div className="w-[84px] ml-auto">
                    <Progress value={s.trustScore}
                      color={s.trustScore >= 80 ? 'var(--signal-rising)' : s.trustScore >= 55 ? 'var(--gov-navy-light)'
                        : s.trustScore >= 30 ? 'var(--signal-warn)' : 'var(--signal-declining)'}
                      height={6} />
                    <p className="text-[10.5px] mono text-right mt-0.5">{s.trustScore}</p>
                  </div>
                ) },
              { key: 'confirm', header: 'Confirmed', align: 'right', hideBelow: 'sm',
                render: (s: SignalSource) => (
                  <span className="mono text-[11.5px]">
                    {Math.round((s.signalsConfirmedByPayroll / s.signalsSubmitted) * 100)}%
                  </span>
                ),
                sortValue: s => s.signalsConfirmedByPayroll / s.signalsSubmitted },
              { key: 'ghost', header: 'Ghost rate', align: 'right', hideBelow: 'md',
                render: (s: SignalSource) => (
                  <span className={`mono text-[11.5px] ${s.ghostPostingRate > 0.3 ? 'font-bold text-[var(--signal-declining)]' : ''}`}>
                    {Math.round(s.ghostPostingRate * 100)}%
                  </span>
                ),
                sortValue: s => s.ghostPostingRate },
              { key: 'act', header: 'Action', align: 'right', render: (s: SignalSource) => {
                if (blacklisted[s.id]) {
                  return <span className="text-[11px] font-bold text-[var(--signal-declining)]">blacklisted</span>;
                }
                if (s.trustScore >= 30) return <span className="text-[11px] text-[var(--ink-tertiary)]">: </span>;
                return can('signal.blacklist') ? (
                  <button onClick={() => setBlacklisted(b => ({ ...b, [s.id]: true }))}
                    className="text-[11px] font-bold px-2.5 py-1 bg-[var(--signal-declining)] text-white rounded-sm focus-ring">
                    Blacklist
                  </button>
                ) : (
                  <span className="text-[10px] mono text-[var(--ink-tertiary)]" title="requires signal.blacklist">🔒 gated</span>
                );
              } },
            ]}
            rows={signalSources}
            rowKey={s => s.id}
            highlight={s => s.trustScore < 30 ? 'var(--signal-declining)' : s.trustScore >= 90 ? 'var(--signal-rising)' : undefined}
          />
        </Card>
      </div>

      {/* ---- Dying Task Watch ---- */}
      <Card title="Skills that are disappearing"
        subtitle="Task-level decline and exposure">
        <div className="grid lg:grid-cols-2 gap-4">
          {dyingTasks.map(t => <DyingTaskCard key={t.id} t={t} />)}
        </div>
      </Card>
    </>
  );
}

function SignalDetail({
  signal, source, canVerify, action, onAction,
}: {
  signal: DemandSignal; source: SignalSource; canVerify: boolean;
  action?: string; onAction: (label: string) => void;
}) {
  const confirmRate = Math.round((source.signalsConfirmedByPayroll / source.signalsSubmitted) * 100);
  return (
    <>
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Claimed</p>
          <p className="text-[28px] font-bold mono text-[var(--ink-tertiary)] leading-tight">
            {formatNumber(signal.reportedVacancies)}
          </p>
        </div>
        <svg width="32" height="18" viewBox="0 0 34 20" fill="none" stroke="var(--ink-tertiary)" strokeWidth="2">
          <line x1="2" y1="10" x2="26" y2="10" strokeLinecap="round" />
          <path d="M22 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="text-right">
          <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Admitted</p>
          <p className="text-[28px] font-bold mono leading-tight"
            style={{ color: signal.trustWeight >= 0.55 ? 'var(--signal-rising)' : 'var(--signal-declining)' }}>
            {formatNumber(signal.weightedVacancies)}
          </p>
        </div>
      </div>

      <div className="py-4 border-b border-[var(--border)]">
        <Progress value={signal.trustWeight * 100}
          color={signal.trustWeight >= 0.55 ? 'var(--signal-rising)' : signal.trustWeight >= 0.3 ? 'var(--signal-warn)' : 'var(--signal-declining)'}
          label={`Trust weight ${signal.trustWeight.toFixed(3)}`} showValue height={10} />
        <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2">
          Source <strong>{source.name}</strong>: trust {source.trustScore}/100, {confirmRate}% of its past
          postings reached payroll, {Math.round(source.ghostPostingRate * 100)}% ghost rate.
        </p>
      </div>

      <div className="py-4 border-b border-[var(--border)]">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
          Corroborating evidence
        </p>
        <ul className="space-y-1.5 text-[12px]">
          <li className="flex justify-between gap-2">
            <span className="text-[var(--ink-secondary)]">EPFO joiners traced to this posting</span>
            <span className={`mono font-semibold ${signal.corroboration.epfoJoiners ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}`}>
              {signal.corroboration.epfoJoiners ?? 'none'}
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-[var(--ink-secondary)]">GST turnover trend</span>
            <span className="mono font-semibold">{signal.corroboration.gstTurnoverTrend ?? 'not available'}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-[var(--ink-secondary)]">Repeat employer on this portal</span>
            <span className="mono font-semibold">{signal.corroboration.repeatEmployer ? 'yes' : 'no'}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-[var(--ink-secondary)]">Duplicate of</span>
            <span className="mono font-semibold">{signal.corroboration.duplicateOf ?? '-'}</span>
          </li>
          <li className="flex justify-between gap-2">
            <span className="text-[var(--ink-secondary)]">Wage offered</span>
            <span className="mono font-semibold">
              {signal.wageOffered ? formatCurrency(signal.wageOffered) : 'not disclosed'}
            </span>
          </li>
        </ul>
      </div>

      <div className="py-4">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
          Integrity flags
        </p>
        {signal.flags.length === 0 ? (
          <p className="text-[12.5px] text-[var(--signal-rising)] font-semibold">
            ✓ Clean: no flags raised against this signal.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {signal.flags.map(f => (
              <span key={f} className="text-[10.5px] font-semibold bg-[var(--signal-declining-light)] text-[var(--signal-declining)] px-2 py-0.5 rounded-sm">
                {f.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-[var(--border)]">
        {action ? (
          <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">✓ {action}</p>
        ) : canVerify ? (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onAction('Signal admitted at full weight and logged')}
              className="text-[12px] font-bold px-3.5 py-2 bg-[var(--signal-rising)] text-white rounded-sm focus-ring">
              Admit at full weight
            </button>
            <button onClick={() => onAction('Re-weighted downward pending field verification')}
              className="text-[12px] font-semibold px-3.5 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
              Re-weight
            </button>
            <button onClick={() => onAction('Signal rejected and excluded from the seat plan')}
              className="text-[12px] font-bold px-3.5 py-2 bg-[var(--signal-declining)] text-white rounded-sm focus-ring">
              Reject
            </button>
          </div>
        ) : (
          <Gated permission="signal.verify" label="Signal verification" ><span /></Gated>
        )}
        <div className="mt-2"><PermTag permission="signal.verify" /></div>
      </div>
    </>
  );
}

function DyingTaskCard({ t }: { t: DyingTask }) {
  return (
    <div className="border border-[var(--border)] rounded-sm p-3.5"
      style={{ boxShadow: `inset 3px 0 0 ${
        t.severity === 'critical' ? 'var(--signal-declining)'
        : t.severity === 'high' ? 'var(--signal-warn)' : 'var(--signal-stable)'
      }` }}>
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-[var(--ink)] leading-snug">{t.taskName}</p>
          <p className="text-[10.5px] mono text-[var(--ink-tertiary)] mt-0.5">
            {t.id} · parent trade {getSkill(t.skillId)?.name}
          </p>
        </div>
        <Badge variant={t.severity === 'critical' ? 'declining' : t.severity === 'high' ? 'warn' : 'stable'} dot>
          {t.severity}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 py-2.5 border-y border-[var(--border)] text-center">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Hours YoY</p>
          <p className="text-[16px] font-bold mono text-[var(--signal-declining)]">{t.hoursChangeYoY}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Trade hours</p>
          <p className="text-[16px] font-bold mono">{Math.round(t.shareOfTradeHours * 100)}%</p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Exposed</p>
          <p className="text-[16px] font-bold mono">{formatNumber(t.traineesExposed)}</p>
        </div>
      </div>

      <dl className="mt-2.5 space-y-1 text-[11.5px]">
        <div className="flex gap-2">
          <dt className="w-[92px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Displaced by</dt>
          <dd className="text-[var(--ink)]">{t.displacedBy}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-[92px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Modules</dt>
          <dd className="mono text-[var(--ink)]">{t.syllabusModulesStillTeaching.join(', ')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-[92px] shrink-0 font-semibold text-[var(--ink-tertiary)]">Districts</dt>
          <dd className="text-[var(--ink)]">
            {t.affectedDistrictIds.map(d => districts.find(x => x.id === d)?.name).join(', ')}
          </dd>
        </div>
      </dl>

      <p className="text-[12px] text-[var(--ink-secondary)] mt-2.5 pt-2.5 border-t border-[var(--border)] leading-relaxed">
        <span className="font-bold text-[var(--gov-navy)]">Recommended: </span>{t.recommendedAction}
      </p>
    </div>
  );
}
