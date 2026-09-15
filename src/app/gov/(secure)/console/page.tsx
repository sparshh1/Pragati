'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { controlTowerAlerts, auditStats, voiceStats } from '@/data/audit';
import { filterImpact, uncoveredSkills, dyingTasks } from '@/data/signals';
import { allSeatCalculations } from '@/data/capacity';
import { hiringPools, workTrials, poolTrialStats } from '@/data/hiring';
import { practicalStats, syllabusExperiments } from '@/data/experiments';
import { rplStats } from '@/data/rpl';
import { districts } from '@/data/districts';
import { GOV_ROLES, Permission } from '@/lib/rbac';
import { PILLARS } from '@/data/pillars';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ControlTowerAlert } from '@/types';

const SEVERITY_TONE = {
  critical: 'declining', high: 'warn', medium: 'officer', info: 'stable',
} as const;

export default function GovConsolePage() {
  const { officer, can, scopeLabel } = useGov();
  const [acted, setActed] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'actionable'>('all');

  if (!officer) return null;
  const role = GOV_ROLES[officer.role];

  // Data scope is enforced here, not just in the UI: a district officer never
  // sees another district's alerts.
  const inScope = (a: ControlTowerAlert) =>
    role.scope === 'state' || a.districtId === null || a.districtId === officer.districtId;

  const visible = controlTowerAlerts.filter(inScope);
  const actionable = visible.filter(a => can(a.requiredPermission as Permission));
  const shown = filter === 'actionable' ? actionable : visible;

  const audit = auditStats(role.scope === 'state' ? undefined : officer.districtId ?? undefined);
  const impact = filterImpact();
  const calcs = allSeatCalculations().filter(c => role.scope === 'state' || c.districtId === officer.districtId);
  const ghost = calcs.reduce((a, c) => a + c.ghostSeats, 0);
  const practicals = practicalStats();
  const voice = voiceStats();
  const rpl = rplStats(role.scope === 'state' ? undefined : officer.districtId ?? undefined);

  const placementsConfirmed = workTrials.filter(t => t.epfoConfirmedOn).length;
  const releasable = hiringPools.reduce(
    (a, p) => a + poolTrialStats(p.id).subsidyReleasable * p.subsidyPerSeat, 0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Multilingual Control Tower"
        title={`Control Tower: ${role.title}`}
        description={<>One queue, all six pillars · scope: <strong>{scopeLabel}</strong></>}
        actions={
          <div className="flex gap-1">
            {(['all', 'actionable'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-[12px] font-semibold px-3 py-2 border rounded-sm focus-ring ${
                  filter === f
                    ? 'bg-[var(--gov-navy)] text-white border-[var(--gov-navy)]'
                    : 'border-[var(--border-strong)] hover:bg-[var(--surface-alt)]'
                }`}>
                {f === 'all' ? `All in scope (${visible.length})` : `I can act on (${actionable.length})`}
              </button>
            ))}
          </div>
        }
      />

      <PageGuide />

      {/* ---- Cross-pillar KPI strip ---- */}
      <div data-guide="stats" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-5 ks-stagger">
        <Stat label="Demand noise removed" value={`${impact.removedPercent}%`}
          sub={`${formatNumber(impact.raw)} → ${formatNumber(impact.weighted)}`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Placements on payroll" value={placementsConfirmed}
          sub={`${formatCurrency(releasable)} releasable`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Practicals flagged" value={`${practicals.flaggedPercent}%`}
          sub={`${practicals.zeroMachineTime} with zero machine time`} tone="negative" accent="var(--gov-navy)" />
        <Stat label="Ghost seats" value={formatNumber(ghost)}
          sub="Notified above the hard limit" tone="negative" accent="var(--gov-navy)" />
        <Stat label="RPL certified" value={rpl.certified}
          sub={`avg +${formatCurrency(rpl.avgMonthlyUplift)}/mo`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Subsidy at risk" value={formatCurrency(audit.subsidyAtRisk)}
          sub={`${audit.ghost} ghost placements`} tone="negative" accent="var(--gov-navy)" />
      </div>

      <div className="grid lg:grid-cols-[1.55fr_1fr] gap-5">
        {/* ---- Alert queue ---- */}
        <div data-guide="alerts" className="space-y-3">
          {shown.length === 0 && (
            <Card><p className="text-[13px] text-[var(--ink-tertiary)]">No alerts match this filter.</p></Card>
          )}

          {shown.map(a => {
            const allowed = can(a.requiredPermission as Permission);
            const done = acted[a.id];
            return (
              <article key={a.id} className="gov-card overflow-hidden"
                style={{ boxShadow: `inset 4px 0 0 ${
                  a.severity === 'critical' ? 'var(--signal-declining)'
                  : a.severity === 'high' ? 'var(--signal-warn)'
                  : a.severity === 'medium' ? 'var(--gov-navy-light)' : 'var(--signal-stable)'
                }` }}>
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="mono text-[10.5px] text-[var(--ink-tertiary)]">{a.id}</span>
                        <Badge variant={SEVERITY_TONE[a.severity]} dot>{a.severity}</Badge>
                        <span className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--gov-navy)] bg-[var(--accent-officer-light)] px-1.5 py-0.5 rounded-sm">
                          {a.pillar}
                        </span>
                        {a.districtId && (
                          <span className="text-[10.5px] text-[var(--ink-tertiary)]">
                            {districts.find(d => d.id === a.districtId)?.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[14.5px] font-bold text-[var(--ink)] leading-snug">{a.title}</h3>
                    </div>
                    <Badge variant={a.status === 'open' ? 'warn' : a.status === 'resolved' ? 'rising' : 'default'}>
                      {done ? 'actioned' : a.status}
                    </Badge>
                  </div>

                  <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{a.detail}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <PermTag permission={a.requiredPermission as Permission} />
                      <span className="text-[10.5px] text-[var(--ink-tertiary)]">raised {a.raisedOn}</span>
                    </div>

                    {done ? (
                      <span className="text-[12px] font-semibold text-[var(--signal-rising)]">✓ {done}</span>
                    ) : allowed ? (
                      <div className="flex gap-2">
                        <button onClick={() => setActed(x => ({ ...x, [a.id]: 'Acknowledged' }))}
                          className="text-[12px] font-semibold px-3 py-1.5 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                          Acknowledge
                        </button>
                        <button onClick={() => setActed(x => ({ ...x, [a.id]: 'Action taken and logged' }))}
                          className="text-[12px] font-bold px-3 py-1.5 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring">
                          Take action
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11.5px] text-[var(--ink-tertiary)]">
                        Referred to a role holding <span className="mono">{a.requiredPermission}</span>
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ---- Right rail ---- */}
        <div className="space-y-5">
          <Card title="Pillar status" subtitle="Live readings across the six mechanisms">
            <ul className="space-y-3">
              {PILLARS.map(p => {
                const reading = PILLAR_READING(p.id, {
                  impact, audit, ghost, practicals, rpl, voice,
                  experiments: syllabusExperiments.filter(e => e.status === 'running').length,
                  uncovered: uncoveredSkills.filter(u => u.status === 'unaddressed').length,
                  dying: dyingTasks.filter(d => d.severity === 'critical').length,
                  pools: hiringPools.filter(h => h.status === 'forming').length,
                });
                return (
                  <li key={p.id} className="border border-[var(--border)] rounded-sm p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">
                        <span className="mono text-[var(--ink-tertiary)] mr-1.5">{String(p.number).padStart(2, '0')}</span>
                        {p.short}
                      </p>
                      <Badge variant={reading.tone}>{reading.label}</Badge>
                    </div>
                    <p className="text-[11.5px] text-[var(--ink-secondary)] leading-snug">{reading.detail}</p>
                    <Link href={p.routes.gov} className="text-[11.5px] gov-link font-semibold mt-1.5 inline-block">
                      Open console →
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card title="Voice channel" subtitle="Rural access and grievance intake">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Auto-resolved</p>
                <p className="text-[20px] font-bold mono text-[var(--signal-rising)]">{voice.botResolutionRate}%</p>
              </div>
              <div>
                <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Escalated to you</p>
                <p className="text-[20px] font-bold mono text-[var(--signal-warn)]">{voice.escalated}</p>
              </div>
            </div>
            <Progress value={voice.botResolutionRate} color="var(--signal-rising)" height={8}
              label={`${voice.total} voice sessions across ${voice.languagesUsed} languages`} />
            <Gated permission="audit.view">
              <Link href="/gov/audit" className="text-[12px] gov-link font-semibold mt-3 inline-block">
                Open grievance register →
              </Link>
            </Gated>
          </Card>
        </div>
      </div>
    </>
  );
}

/* Derives a one-line status per pillar from the live data. */
function PILLAR_READING(
  id: string,
  d: {
    impact: ReturnType<typeof filterImpact>;
    audit: ReturnType<typeof auditStats>;
    ghost: number;
    practicals: ReturnType<typeof practicalStats>;
    rpl: ReturnType<typeof rplStats>;
    voice: ReturnType<typeof voiceStats>;
    experiments: number;
    uncovered: number;
    dying: number;
    pools: number;
  },
): { label: string; tone: 'rising' | 'warn' | 'declining' | 'stable'; detail: string } {
  switch (id) {
    case 'demand-intelligence':
      return {
        label: d.uncovered ? 'attention' : 'healthy',
        tone: d.uncovered ? 'warn' : 'rising',
        detail: `${d.impact.removedPercent}% of claims filtered out · ${d.dying} tasks in critical decline · ${d.uncovered} skills with demand and no course`,
      };
    case 'hiring-pipeline':
      return {
        label: d.pools ? 'forming' : 'healthy',
        tone: d.pools ? 'warn' : 'rising',
        detail: `${d.pools} pool(s) still below their seat commitment before batch start`,
      };
    case 'adaptive-syllabus':
      return {
        label: d.practicals.flagged ? 'audit needed' : 'healthy',
        tone: d.practicals.flagged ? 'declining' : 'rising',
        detail: `${d.experiments} experiment(s) running · ${d.practicals.flagged} practical record(s) flagged for discrepancy`,
      };
    case 'capacity-planner':
      return {
        label: d.ghost ? 'over-notified' : 'within limits',
        tone: d.ghost ? 'declining' : 'rising',
        detail: `${formatNumber(d.ghost)} seats notified above the binding physical constraint`,
      };
    case 'pathways-rpl':
      return {
        label: d.rpl.pending ? 'backlog' : 'clear',
        tone: d.rpl.pending ? 'warn' : 'rising',
        detail: `${d.rpl.certified} certified · ${d.rpl.pending} awaiting assessment · avg uplift ${formatCurrency(d.rpl.avgMonthlyUplift)}/mo`,
      };
    default:
      return {
        label: d.audit.ghost ? 'fraud detected' : 'clean',
        tone: d.audit.ghost ? 'declining' : 'rising',
        detail: `${d.audit.cleanRate}% of claims reconcile · ${formatCurrency(d.audit.subsidyAtRisk)} held pending enquiry`,
      };
  }
}
