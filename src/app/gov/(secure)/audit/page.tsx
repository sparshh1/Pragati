'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { StackedBars, C } from '@/components/charts/Charts';
import {
  payrollAudits, auditStats, VERDICT_LABEL, voiceSessions, voiceStats, languages,
} from '@/data/audit';
import { districts } from '@/data/districts';
import { courses } from '@/data/courses';
import { GOV_ROLES } from '@/lib/rbac';
import { formatCurrency } from '@/lib/utils';
import { PayrollAudit, VoiceSession } from '@/types';

const VERDICT_TONE = {
  clean: 'rising', mismatch: 'warn', 'ghost-placement': 'declining',
  'wage-shortfall': 'warn', 'awaiting-data': 'stable',
} as const;

export default function GovAuditPage() {
  const { officer, can } = useGov();
  const role = officer ? GOV_ROLES[officer.role] : null;

  const [tab, setTab] = useState<'payroll' | 'voice'>('payroll');
  const [selected, setSelected] = useState<PayrollAudit | null>(
    payrollAudits.find(a => a.verdict === 'ghost-placement') ?? payrollAudits[0],
  );
  const [actions, setActions] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);

  const scoped = role?.scope === 'state'
    ? payrollAudits
    : payrollAudits.filter(a => a.districtId === officer?.districtId);

  const stats = auditStats(role?.scope === 'state' ? undefined : officer?.districtId ?? undefined);
  const voice = voiceStats();

  const byDistrict = districts
    .filter(d => role?.scope === 'state' || d.id === officer?.districtId)
    .map(d => {
      const list = payrollAudits.filter(a => a.districtId === d.id);
      return {
        name: d.name,
        clean: list.filter(a => a.verdict === 'clean').length,
        mismatch: list.filter(a => a.verdict === 'mismatch' || a.verdict === 'wage-shortfall').length,
        ghost: list.filter(a => a.verdict === 'ghost-placement').length,
      };
    });

  function runSync() {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSynced(true); }, 1400);
  }

  return (
    <>
      <PageHeader
        eyebrow="Pillar 6: Control Tower & Audit Engine"
        title="EPFO payroll audit and voice grievance register"
        description="Placement claims reconciled against EPFO payroll."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'EPFO Audit Engine' }]}
        actions={
          can('audit.epfo') ? (
            <button onClick={runSync} disabled={syncing}
              className="text-[13px] font-bold px-4 py-2.5 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring disabled:opacity-60">
              {syncing ? 'Running reconciliation…' : synced ? 'Re-run EPFO reconciliation' : 'Run EPFO reconciliation'}
            </button>
          ) : undefined
        }
      />

      <PageGuide />

      {synced && (
        <div className="mb-5">
          <Note tone="success" title="Reconciliation complete">
            {scoped.length} claims checked against EPFO. {stats.clean} reconciled cleanly,{' '}
            {stats.ghost} showed no payroll record at all, {stats.mismatch + stats.shortfall} showed an
            employer or wage mismatch. {formatCurrency(stats.subsidyAtRisk)} has been held pending enquiry.
          </Note>
        </div>
      )}

      {!can('audit.epfo') && (
        <div className="mb-5">
          <Note tone="info" title="Read-only access">
            Running an audit and freezing disbursal are reserved to the Internal Audit Officer.
          </Note>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Claims reconciled" value={`${stats.cleanRate}%`}
          sub={`${stats.clean} of ${stats.total - stats.awaiting} decided`} tone="positive" accent="var(--gov-navy)" />
        <Stat label="Ghost placements" value={stats.ghost}
          sub="Claimed, with no payroll record at all" tone="negative" accent="var(--gov-navy)" />
        <Stat label="Employer / retention mismatch" value={stats.mismatch}
          sub="Wrong employer or contribution stopped early" tone="warn" accent="var(--gov-navy)" />
        <Stat label="Wage shortfall" value={stats.shortfall}
          sub="Real placement, below declared terms" tone="warn" accent="var(--gov-navy)" />
        <Stat label="Subsidy held" value={formatCurrency(stats.subsidyAtRisk)}
          sub="Pending enquiry" tone="negative" accent="var(--gov-navy)" />
      </div>

      <div className="flex gap-1 mb-5 border-b border-[var(--border)]" role="tablist">
        {([['payroll', 'EPFO Reconciliation'], ['voice', 'Multilingual Voice Register']] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition-colors focus-ring ${
              tab === id ? 'border-[var(--gov-navy)] text-[var(--gov-navy)]'
              : 'border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink)]'
            }`}>{label}</button>
        ))}
      </div>

      {tab === 'payroll' && (
        <div className="grid xl:grid-cols-[1.3fr_1fr] gap-5">
          <div className="space-y-5">
            <Card title="Reconciliation register" subtitle="Select a claim to see the side-by-side comparison" dense>
              <Table
                columns={[
                  { key: 'cand', header: 'Candidate', render: (a: PayrollAudit) => (
                    <div>
                      <p className="text-[12.5px] font-semibold">{a.candidateName}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{a.id} · UAN {a.uan}</p>
                    </div>
                  ), sortValue: a => a.candidateName },
                  { key: 'claimed', header: 'Claimed employer', hideBelow: 'md',
                    render: (a: PayrollAudit) => (
                      <span className="text-[11.5px] truncate block max-w-[160px]">{a.claimedEmployerName}</span>
                    ) },
                  { key: 'months', header: 'Months paid', align: 'right', sortValue: a => a.monthsContributed,
                    render: (a: PayrollAudit) => (
                      <span className={`mono ${a.monthsContributed === 0 ? 'font-bold text-[var(--signal-declining)]' : ''}`}>
                        {a.monthsContributed}
                      </span>
                    ) },
                  { key: 'verdict', header: 'Verdict',
                    render: (a: PayrollAudit) => <Badge variant={VERDICT_TONE[a.verdict]}>{VERDICT_LABEL[a.verdict]}</Badge>,
                    sortValue: a => a.verdict },
                  { key: 'risk', header: 'At risk', align: 'right', sortValue: a => a.subsidyAtRisk,
                    render: (a: PayrollAudit) => (
                      <span className={`mono ${a.subsidyAtRisk ? 'font-bold text-[var(--signal-declining)]' : 'text-[var(--ink-tertiary)]'}`}>
                        {a.subsidyAtRisk ? formatCurrency(a.subsidyAtRisk) : '-'}
                      </span>
                    ) },
                ]}
                rows={scoped}
                rowKey={a => a.id}
                onRowClick={setSelected}
                highlight={a => a.id === selected?.id ? 'var(--gov-navy)'
                  : a.verdict === 'ghost-placement' ? 'var(--signal-declining)' : undefined}
              />
            </Card>

            {byDistrict.length > 1 && (
              <Card title="Reconciliation outcomes by district" subtitle="Where claims fail, and how">
                <StackedBars
                  data={byDistrict}
                  series={[
                    { key: 'clean', name: 'Reconciled', color: C.green },
                    { key: 'mismatch', name: 'Mismatch / shortfall', color: C.amber },
                    { key: 'ghost', name: 'Ghost placement', color: C.red },
                  ]}
                  height={260}
                />
              </Card>
            )}
          </div>

          <Card title={selected ? `Claim vs payroll: ${selected.candidateName}` : 'Claim detail'}
            subtitle={selected ? `${selected.id} · ${courses.find(c => c.id === selected.courseId)?.name ?? selected.courseId}` : undefined}
            action={<PermTag permission="audit.freeze" />}>
            {!selected ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">Select a claim.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-0 border border-[var(--border)] rounded-sm overflow-hidden">
                  <div className="p-3 border-r border-[var(--border)] bg-[var(--surface)]">
                    <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)] mb-2">
                      Centre claimed
                    </p>
                    <dl className="space-y-2 text-[12px]">
                      <div><dt className="text-[var(--ink-tertiary)] text-[10.5px]">Employer</dt><dd className="font-semibold">{selected.claimedEmployerName}</dd></div>
                      <div><dt className="text-[var(--ink-tertiary)] text-[10.5px]">Placement date</dt><dd className="font-semibold mono">{selected.claimedPlacementDate}</dd></div>
                      <div><dt className="text-[var(--ink-tertiary)] text-[10.5px]">Monthly wage</dt><dd className="font-semibold mono">{formatCurrency(selected.claimedMonthlyWage)}</dd></div>
                    </dl>
                  </div>
                  <div className="p-3" style={{
                    background: selected.verdict === 'clean' ? 'var(--signal-rising-light)' : 'var(--signal-declining-light)',
                  }}>
                    <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)] mb-2">
                      EPFO shows
                    </p>
                    <dl className="space-y-2 text-[12px]">
                      <div>
                        <dt className="text-[var(--ink-tertiary)] text-[10.5px]">Employer</dt>
                        <dd className={`font-semibold ${!selected.epfoEmployerName ? 'text-[var(--signal-declining)]' : ''}`}>
                          {selected.epfoEmployerName ?? 'No record'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[var(--ink-tertiary)] text-[10.5px]">First contribution</dt>
                        <dd className="font-semibold mono">{selected.epfoFirstContributionMonth ?? '-'}</dd>
                      </div>
                      <div>
                        <dt className="text-[var(--ink-tertiary)] text-[10.5px]">Declared wage</dt>
                        <dd className={`font-semibold mono ${
                          selected.epfoDeclaredWage && selected.epfoDeclaredWage < selected.claimedMonthlyWage
                            ? 'text-[var(--signal-declining)]' : ''
                        }`}>
                          {selected.epfoDeclaredWage ? formatCurrency(selected.epfoDeclaredWage) : '-'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={selected.monthsContributed} max={12}
                    color={selected.monthsContributed >= 6 ? 'var(--signal-rising)'
                      : selected.monthsContributed > 0 ? 'var(--signal-warn)' : 'var(--signal-declining)'}
                    label={`${selected.monthsContributed} months of continuous contribution (6 required for tranche 2)`}
                    height={9} />
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={VERDICT_TONE[selected.verdict]} dot>{VERDICT_LABEL[selected.verdict]}</Badge>
                    {selected.subsidyAtRisk > 0 && (
                      <span className="text-[13px] font-bold mono text-[var(--signal-declining)]">
                        {formatCurrency(selected.subsidyAtRisk)} at risk
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{selected.notes}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  {actions[selected.id] ? (
                    <p className="text-[12.5px] font-semibold text-[var(--signal-rising)]">✓ {actions[selected.id]}</p>
                  ) : selected.verdict === 'clean' ? (
                    <p className="text-[12.5px] text-[var(--signal-rising)] font-semibold">
                      ✓ Nothing to action: this claim reconciles.
                    </p>
                  ) : can('audit.freeze') ? (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setActions(a => ({ ...a, [selected.id]: `Disbursal frozen; ${formatCurrency(selected.subsidyAtRisk)} withheld pending enquiry` }))}
                        className="text-[12.5px] font-bold px-3.5 py-2 bg-[var(--signal-declining)] text-white rounded-sm focus-ring">
                        Freeze disbursal
                      </button>
                      <button onClick={() => setActions(a => ({ ...a, [selected.id]: 'Show-cause notice issued to the training centre' }))}
                        className="text-[12.5px] font-semibold px-3.5 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                        Issue show-cause
                      </button>
                      <button onClick={() => setActions(a => ({ ...a, [selected.id]: 'Referred for field verification before next sync' }))}
                        className="text-[12.5px] font-semibold px-3.5 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                        Field verification
                      </button>
                    </div>
                  ) : (
                    <Gated permission="audit.freeze" label="Disbursal freeze"><span /></Gated>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {tab === 'voice' && (
        <div className="grid xl:grid-cols-[1.3fr_1fr] gap-5">
          <Card title="Voice grievance register"
            subtitle={`${voice.total} sessions · ${voice.botResolutionRate}% resolved without a human · ${voice.escalated} escalated`}>
            <ul className="space-y-3">
              {voiceSessions.map((v: VoiceSession) => (
                <li key={v.id} className="border border-[var(--border)] rounded-sm p-3.5"
                  style={v.resolvedBy === 'escalated-to-officer' ? { boxShadow: 'inset 3px 0 0 var(--signal-warn)' } : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[var(--ink)]">{v.intent}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">
                        {v.id} · {v.channel.replace(/-/g, ' ')} ·{' '}
                        {languages.find(l => l.code === v.languageCode)?.nativeName} ·{' '}
                        {districts.find(d => d.id === v.districtId)?.name} · {v.occurredOn}
                      </p>
                    </div>
                    <Badge variant={v.resolvedBy === 'bot' ? 'rising' : 'warn'} dot>
                      {v.resolvedBy === 'bot' ? 'auto-resolved' : 'escalated'}
                    </Badge>
                  </div>
                  <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">&ldquo;{v.transcript}&rdquo;</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-1.5">
                    {v.durationSeconds}s
                    {v.satisfactionScore !== null && ` · satisfaction ${v.satisfactionScore}/5`}
                    {v.resolvedBy === 'escalated-to-officer' && ' · requires officer response'}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-5">
            <Card title="Language coverage" subtitle="Voice reach by language">
              <div className="space-y-4">
                {languages.map(l => (
                  <div key={l.code}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                        {l.nativeName} <span className="text-[11px] font-normal text-[var(--ink-tertiary)]">{l.name}</span>
                      </span>
                      {l.ivrAvailable ? <Badge variant="rising">IVR live</Badge> : <Badge variant="stable">text only</Badge>}
                    </div>
                    <Progress value={l.contentTranslatedPercent}
                      color={l.contentTranslatedPercent === 100 ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                      height={6} />
                    <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-1">
                      {l.contentTranslatedPercent}% content translated · {Math.round(l.sttModelAccuracy * 100)}% speech accuracy
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Why the voice channel is part of the audit engine">
              <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">
                The candidate is the only party with no incentive to misreport a placement. When someone
                calls to say the centre recorded them as placed but no salary arrived, that call is
                auto-linked to the corresponding EPFO reconciliation: which is exactly how the
                Marathwada Logistics ghost-placement pattern was found.
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Avg satisfaction</p>
                  <p className="text-[20px] font-bold mono">{voice.avgSatisfaction}<span className="text-[12px] font-normal text-[var(--ink-tertiary)]">/5</span></p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Languages in use</p>
                  <p className="text-[20px] font-bold mono">{voice.languagesUsed}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
