'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { payrollAudits, auditStats, VERDICT_LABEL } from '@/data/audit';
import { workTrials, hiringPools } from '@/data/hiring';
import { schemes } from '@/data/schemes';
import { formatCurrency } from '@/lib/utils';
import { PILLARS } from '@/data/pillars';
import { PayrollAudit } from '@/types';

const VERDICT_TONE = {
  clean: 'rising', mismatch: 'warn', 'ghost-placement': 'declining',
  'wage-shortfall': 'warn', 'awaiting-data': 'stable',
} as const;

export default function BusinessCompliancePage() {
  const { account } = useCitizen();
  const pillar = PILLARS[5];

  const [decl, setDecl] = useState({ ksid: '', uan: '', wage: 26000, joinMonth: '2026-09' });
  const [filed, setFiled] = useState<{ ksid: string; wage: number; ok: boolean }[]>([]);

  const stats = auditStats();
  const confirmedTrials = workTrials.filter(t => t.epfoConfirmedOn);
  const passedNotConfirmed = workTrials.filter(t => t.outcome === 'passed' && !t.epfoConfirmedOn);

  // The declaration is checked against the pool wage floor before it is accepted.
  const relatedPool = hiringPools.find(p => p.districtId === account?.districtId);
  const floor = relatedPool ? Math.min(...relatedPool.members.map(m => m.wageFloor)) : 20000;
  const meetsFloor = decl.wage >= floor;

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number} — ${pillar.short}`}
        title="Payroll declaration and compliance"
        description="File payroll declarations. Subsidy follows EPFO records, not certificates."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/business' }, { label: 'Payroll & Compliance' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Clean reconciliation rate" value={`${stats.cleanRate}%`}
          sub={`${stats.clean} of ${stats.total - stats.awaiting} decided claims`}
          tone="positive" accent="var(--accent-employer)" />
        <Stat label="Placements confirmed on payroll" value={confirmedTrials.length}
          sub={`${passedNotConfirmed.length} cleared the gate but not yet on payroll`}
          tone={passedNotConfirmed.length ? 'warn' : 'positive'} accent="var(--accent-employer)" />
        <Stat label="Subsidy held state-wide" value={formatCurrency(stats.subsidyAtRisk)}
          sub={`${stats.ghost} ghost claims, ${stats.mismatch} mismatches`}
          tone="negative" accent="var(--accent-employer)" />
        <Stat label="Awaiting EPFO sync" value={stats.awaiting}
          sub="Quarterly filers — next sync 15 Oct 2026" accent="var(--accent-employer)" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-5">
        <div className="space-y-5">
          <Card title="File a payroll declaration" subtitle="One declaration per candidate you have taken on">
            <div className="space-y-4">
              <div>
                <label className="gov-label" htmlFor="c-ksid">Candidate KSID</label>
                <input id="c-ksid" className="gov-input mono" value={decl.ksid}
                  onChange={e => setDecl(d => ({ ...d, ksid: e.target.value }))}
                  placeholder="MH-CD-2026-418203" />
              </div>
              <div>
                <label className="gov-label" htmlFor="c-uan">Universal Account Number (UAN)</label>
                <input id="c-uan" className="gov-input mono" maxLength={12} value={decl.uan}
                  onChange={e => setDecl(d => ({ ...d, uan: e.target.value.replace(/\D/g, '') }))}
                  placeholder="101400008821" />
                <p className="text-[11px] text-[var(--ink-tertiary)] mt-1">
                  Used to reconcile your declaration against the EPFO contribution record.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gov-label" htmlFor="c-wage">Monthly wage declared (₹)</label>
                  <input id="c-wage" type="number" min={0} step={500} className="gov-input mono"
                    value={decl.wage} onChange={e => setDecl(d => ({ ...d, wage: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="gov-label" htmlFor="c-month">First contribution month</label>
                  <input id="c-month" type="month" className="gov-input mono"
                    value={decl.joinMonth} onChange={e => setDecl(d => ({ ...d, joinMonth: e.target.value }))} />
                </div>
              </div>

              {!meetsFloor && (
                <Note tone="warn" title="Below the committed wage floor">
                  You committed to {formatCurrency(floor)}. Filing below that holds the subsidy and cuts
                  your trust weight.
                </Note>
              )}

              <button
                disabled={!decl.ksid.trim() || decl.uan.length < 12}
                onClick={() => {
                  setFiled(f => [...f, { ksid: decl.ksid, wage: decl.wage, ok: meetsFloor }]);
                  setDecl(d => ({ ...d, ksid: '', uan: '' }));
                }}
                className="w-full text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring disabled:opacity-45"
                style={{ background: 'var(--accent-employer)' }}>
                File declaration →
              </button>
            </div>

            {filed.length > 0 && (
              <ul className="mt-4 pt-4 border-t border-[var(--border)] space-y-1.5">
                {filed.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12px] border border-[var(--border)] rounded-sm px-3 py-2">
                    <span className={f.ok ? 'text-[var(--signal-rising)] font-bold' : 'text-[var(--signal-warn)] font-bold'}>
                      {f.ok ? '✓' : '!'}
                    </span>
                    <span className="flex-1 min-w-0 truncate mono">{f.ksid}</span>
                    <span className="mono text-[var(--ink-secondary)] shrink-0">{formatCurrency(f.wage)}</span>
                    <Badge variant={f.ok ? 'rising' : 'warn'}>
                      {f.ok ? 'queued for sync' : 'shortfall flagged'}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Subsidy release conditions" subtitle="What has to be true before money moves">
            <ol className="space-y-3">
              {[
                ['Trial gate cleared', 'Weighted scorecard of 70 or above, signed by your supervisor.', true],
                ['Offer issued at or above the wage floor', 'The floor you yourself named when joining the pool.', true],
                ['EPFO contribution visible', 'First contribution filed under your establishment code.', true],
                ['Retention at 6 months', 'Continuous contribution. Tranche 2 depends on this.', false],
              ].map(([t, d, done]) => (
                <li key={t as string} className="flex gap-3">
                  <span className={`w-5 h-5 shrink-0 grid place-items-center rounded-full text-[10.5px] font-bold mt-0.5 ${
                    done ? 'bg-[var(--signal-rising)] text-white' : 'bg-[var(--surface-alt)] text-[var(--ink-tertiary)] border border-[var(--border-strong)]'
                  }`}>{done ? '✓' : '·'}</span>
                  <span>
                    <span className="block text-[12.5px] font-bold text-[var(--ink)]">{t as string}</span>
                    <span className="block text-[11.5px] text-[var(--ink-secondary)] leading-snug mt-0.5">{d as string}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                Schemes your claims are routed through
              </p>
              <ul className="space-y-1.5">
                {schemes.map(s => (
                  <li key={s.code} className="text-[11.5px]">
                    <span className="font-bold text-[var(--gov-navy)] mono">{s.code}</span>
                    <span className="text-[var(--ink-secondary)]"> — {s.funds}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <Card title="EPFO reconciliation register"
          subtitle="Claims checked against payroll" dense>
          <Table
            columns={[
              { key: 'cand', header: 'Candidate', render: (a: PayrollAudit) => (
                <div>
                  <p className="text-[12.5px] font-semibold">{a.candidateName}</p>
                  <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">UAN {a.uan}</p>
                </div>
              ), sortValue: a => a.candidateName },
              { key: 'claimed', header: 'Claimed', hideBelow: 'md', render: (a: PayrollAudit) => (
                <div className="text-[11.5px]">
                  <p className="truncate max-w-[150px]">{a.claimedEmployerName}</p>
                  <p className="mono text-[var(--ink-tertiary)]">{formatCurrency(a.claimedMonthlyWage)}</p>
                </div>
              ) },
              { key: 'epfo', header: 'EPFO shows', hideBelow: 'lg', render: (a: PayrollAudit) => (
                <div className="text-[11.5px]">
                  <p className="truncate max-w-[150px]">{a.epfoEmployerName ?? '— no record —'}</p>
                  <p className="mono text-[var(--ink-tertiary)]">
                    {a.epfoDeclaredWage ? formatCurrency(a.epfoDeclaredWage) : '—'}
                    {a.monthsContributed > 0 && ` · ${a.monthsContributed} mo`}
                  </p>
                </div>
              ) },
              { key: 'verdict', header: 'Verdict', render: (a: PayrollAudit) => (
                <Badge variant={VERDICT_TONE[a.verdict]}>{VERDICT_LABEL[a.verdict]}</Badge>
              ), sortValue: a => a.verdict },
              { key: 'risk', header: 'At risk', align: 'right', render: (a: PayrollAudit) => (
                <span className={`mono ${a.subsidyAtRisk ? 'font-bold text-[var(--signal-declining)]' : 'text-[var(--ink-tertiary)]'}`}>
                  {a.subsidyAtRisk ? formatCurrency(a.subsidyAtRisk) : '—'}
                </span>
              ), sortValue: a => a.subsidyAtRisk },
            ]}
            rows={payrollAudits}
            rowKey={a => a.id}
            highlight={a => a.verdict === 'ghost-placement' ? 'var(--signal-declining)'
              : a.verdict === 'clean' ? 'var(--signal-rising)' : undefined}
          />

          <div className="p-4 border-t border-[var(--border)]">
            <Progress value={stats.clean} max={stats.total - stats.awaiting}
              color="var(--signal-rising)" height={10}
              label={`${stats.clean} of ${stats.total - stats.awaiting} decided claims reconcile cleanly`} showValue />
            <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2.5 leading-relaxed">
              Establishments with a clean record clear subsidy in a single cycle. Repeated mismatches
              reduce the trust weight applied to your future hiring signals, which in turn reduces how
              much the district seat plan responds to your demand.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
