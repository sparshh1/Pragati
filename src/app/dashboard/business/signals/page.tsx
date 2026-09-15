'use client';

import { useState, useMemo } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { TrustScatter } from '@/components/charts/Charts';
import {
  signalSources, demandSignals, computeTrustWeight, verdictFor, filterImpact,
} from '@/data/signals';
import { skills, getSkill } from '@/data/skills';
import { districts } from '@/data/districts';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { PILLARS } from '@/data/pillars';
import { DemandSignal, SignalSource } from '@/types';

const VERDICT_TONE = {
  verified: 'rising', 'under-review': 'warn', quarantined: 'warn', rejected: 'declining',
} as const;

/** District wage floors used by the filter to catch below-floor postings. */
const WAGE_FLOOR = 14000;

export default function BusinessSignalsPage() {
  const { account } = useCitizen();
  const pillar = PILLARS[0];

  const [skillId, setSkillId] = useState('ev-battery-diagnostics');
  const [vacancies, setVacancies] = useState(24);
  const [wage, setWage] = useState(26000);
  const [hasGstin, setHasGstin] = useState(Boolean(account?.gstin));
  const [onEpfo, setOnEpfo] = useState(true);
  const [submitted, setSubmitted] = useState<DemandSignal | null>(null);

  const impact = filterImpact();

  /**
   * Your establishment's own source profile. A newly-registered MSME starts near
   * the middle of the trust range and earns its way up as its postings convert
   * into payroll entries.
   */
  const mySource: SignalSource = useMemo(() => ({
    id: 'src-self',
    name: account?.name ?? 'Your establishment',
    kind: 'employer-direct',
    trustScore: 62 + (hasGstin ? 14 : 0) + (onEpfo ? 16 : 0),
    signalsSubmitted: 18,
    signalsConfirmedByPayroll: onEpfo ? 15 : 6,
    duplicateRate: 0.0,
    ghostPostingRate: onEpfo ? 0.04 : 0.22,
    lastAuditedOn: '2026-09-01',
  }), [account?.name, hasGstin, onEpfo]);

  const preview = useMemo(() => {
    const flags: string[] = [];
    if (wage === 0) flags.push('no-wage-disclosed');
    if (wage > 0 && wage < WAGE_FLOOR) flags.push('wage-below-district-floor');
    if (!onEpfo) flags.push('employer-not-in-epfo');
    if (vacancies > 200) flags.push('bulk-identical-posting');

    const weight = computeTrustWeight(mySource, flags);
    return {
      flags,
      weight,
      counted: Math.round(vacancies * weight),
      verdict: verdictFor(weight, flags),
    };
  }, [wage, onEpfo, vacancies, mySource]);

  function submit() {
    setSubmitted({
      id: `SIG-${Math.floor(24200 + Math.random() * 700)}`,
      sourceId: mySource.id,
      skillId,
      districtId: account?.districtId ?? 'pune',
      reportedVacancies: vacancies,
      postedOn: new Date().toISOString().slice(0, 10),
      wageOffered: wage,
      trustWeight: preview.weight,
      weightedVacancies: preview.counted,
      verdict: preview.verdict,
      flags: preview.flags,
      corroboration: {
        epfoJoiners: null,
        gstTurnoverTrend: hasGstin ? 'up' : null,
        repeatEmployer: true,
        duplicateOf: null,
      },
    });
  }

  const scatterData = [...signalSources, mySource].map(s => ({
    name: s.name,
    trust: s.trustScore,
    confirmRate: Math.round((s.signalsConfirmedByPayroll / s.signalsSubmitted) * 100),
    volume: s.signalsSubmitted,
  }));

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number}: ${pillar.short}`}
        title="Post hiring demand"
        description="Post a vacancy. Watch the weight it earns, live."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/business' }, { label: 'Post Hiring Demand' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Your trust score" value={mySource.trustScore}
          sub={mySource.trustScore >= 80 ? 'High: signals count near full weight' : 'Building: improve by hiring what you post'}
          tone={mySource.trustScore >= 80 ? 'positive' : 'warn'} accent="var(--accent-employer)" />
        <Stat label="Your payroll confirmation rate"
          value={`${Math.round((mySource.signalsConfirmedByPayroll / mySource.signalsSubmitted) * 100)}%`}
          sub={`${mySource.signalsConfirmedByPayroll} of ${mySource.signalsSubmitted} past postings became real hires`}
          tone="positive" accent="var(--accent-employer)" />
        <Stat label="State-wide noise removed" value={`${impact.removedPercent}%`}
          sub={`${formatNumber(impact.raw)} claimed → ${formatNumber(impact.weighted)} counted`}
          tone="warn" accent="var(--accent-employer)" />
        <Stat label="Sources blocked this cycle" value={impact.signalsBlocked}
          sub={`of ${impact.signalsScreened} signals screened`} tone="negative" accent="var(--accent-employer)" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-5 mb-5">
        {/* ---- Submission form with live weighting ---- */}
        <Card title="Submit a demand signal" subtitle="The weight is computed live as you type">
          <div className="space-y-4">
            <div>
              <label className="gov-label" htmlFor="sig-skill">Role you are hiring for</label>
              <select id="sig-skill" className="gov-input" value={skillId} onChange={e => setSkillId(e.target.value)}>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="gov-label" htmlFor="sig-vac">Vacancies over the next 12 months</label>
                <input id="sig-vac" type="number" min={1} className="gov-input mono"
                  value={vacancies} onChange={e => setVacancies(Math.max(0, Number(e.target.value)))} />
              </div>
              <div>
                <label className="gov-label" htmlFor="sig-wage">Monthly wage offered (₹)</label>
                <input id="sig-wage" type="number" min={0} step={500} className="gov-input mono"
                  value={wage} onChange={e => setWage(Math.max(0, Number(e.target.value)))} />
                <p className="text-[11px] text-[var(--ink-tertiary)] mt-1">
                  District floor for this trade: {formatCurrency(WAGE_FLOOR)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                <input type="checkbox" checked={onEpfo} onChange={e => setOnEpfo(e.target.checked)}
                  className="mt-0.5 accent-[var(--accent-employer)]" />
                <span>This establishment files EPFO returns and will place hires on payroll within 30 days</span>
              </label>
              <label className="flex items-start gap-2.5 text-[12.5px] text-[var(--ink-secondary)]">
                <input type="checkbox" checked={hasGstin} onChange={e => setHasGstin(e.target.checked)}
                  className="mt-0.5 accent-[var(--accent-employer)]" />
                <span>Allow GST turnover corroboration of this signal</span>
              </label>
            </div>

            <button onClick={submit}
              className="w-full text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring"
              style={{ background: 'var(--accent-employer)' }}>
              Submit signal →
            </button>
          </div>
        </Card>

        {/* ---- Live filter preview ---- */}
        <Card title="Trust-Weighted Quality Filter"
          subtitle="What the engine will do with this submission"
          action={<Badge variant={VERDICT_TONE[preview.verdict]} dot>{preview.verdict.replace('-', ' ')}</Badge>}>

          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div>
              <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">You claim</p>
              <p className="text-[30px] font-bold mono text-[var(--ink-tertiary)] leading-tight">{vacancies}</p>
            </div>
            <svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="var(--ink-tertiary)" strokeWidth="2">
              <line x1="2" y1="10" x2="26" y2="10" strokeLinecap="round" />
              <path d="M22 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-right">
              <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Counted in the plan</p>
              <p className="text-[30px] font-bold mono leading-tight"
                style={{ color: preview.weight >= 0.55 ? 'var(--signal-rising)' : 'var(--signal-warn)' }}>
                {preview.counted}
              </p>
            </div>
          </div>

          <div className="py-4 border-b border-[var(--border)]">
            <Progress value={preview.weight * 100}
              color={preview.weight >= 0.55 ? 'var(--signal-rising)' : preview.weight >= 0.3 ? 'var(--signal-warn)' : 'var(--signal-declining)'}
              label={`Trust weight applied: ${preview.weight.toFixed(3)}`} showValue height={10} />
          </div>

          <div className="py-4 border-b border-[var(--border)]">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
              How the weight was built
            </p>
            <ul className="space-y-1.5 text-[12px]">
              <li className="flex justify-between gap-2">
                <span className="text-[var(--ink-secondary)]">Declared trust score</span>
                <span className="mono font-semibold">{mySource.trustScore}/100</span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--ink-secondary)]">Observed payroll confirmation rate</span>
                <span className="mono font-semibold">
                  {Math.round((mySource.signalsConfirmedByPayroll / mySource.signalsSubmitted) * 100)}%
                </span>
              </li>
              <li className="flex justify-between gap-2">
                <span className="text-[var(--ink-secondary)]">Ghost-posting penalty on this channel</span>
                <span className="mono font-semibold text-[var(--signal-declining)]">
                  −{Math.round(mySource.ghostPostingRate * 80)}%
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
              Integrity flags on this submission
            </p>
            {preview.flags.length === 0 ? (
              <p className="text-[12.5px] text-[var(--signal-rising)] font-semibold">
                ✓ No flags. This signal will pass straight into the district demand curve.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {preview.flags.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[12px]">
                    <span className="text-[var(--signal-declining)] font-bold">!</span>
                    <span>
                      <span className="font-semibold text-[var(--signal-declining)]">{f.replace(/-/g, ' ')}</span>
                      <span className="block text-[11.5px] text-[var(--ink-secondary)] leading-snug">
                        {FLAG_EXPLAIN[f]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {submitted && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <Note tone={submitted.verdict === 'verified' ? 'success' : 'warn'}
                title={`Signal ${submitted.id} submitted`}>
                Recorded against {getSkill(submitted.skillId)?.name} in{' '}
                {districts.find(d => d.id === submitted.districtId)?.name}. Status:{' '}
                <strong>{submitted.verdict.replace('-', ' ')}</strong>. {submitted.weightedVacancies} of{' '}
                {submitted.reportedVacancies} claimed vacancies have entered the district demand curve.
                {submitted.verdict !== 'verified' &&
                  ' A district officer will review this before it is fully counted.'}
              </Note>
            </div>
          )}
        </Card>
      </div>

      {/* ---- Source landscape ---- */}
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <Card title="Where you sit among all signal sources"
          subtitle="Size = volume · height = confirmed hires">
          <TrustScatter data={scatterData} height={320} />
          <p className="text-[12px] text-[var(--ink-secondary)] mt-3 leading-relaxed">
            The two largest bubbles at the bottom-left are aggregator job boards: enormous volume, almost
            nothing confirmed. Weighting by confirmation rather than volume is what stops them from
            setting the state&rsquo;s training budget.
          </p>
        </Card>

        <Card title="Signals currently in the register" subtitle="Every submission, and what the filter did to it" dense>
          <Table
            columns={[
              { key: 'id', header: 'Signal', render: (s: DemandSignal) => (
                <div>
                  <p className="mono text-[11.5px] font-semibold">{s.id}</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)] truncate max-w-[130px]">
                    {signalSources.find(x => x.id === s.sourceId)?.name}
                  </p>
                </div>
              ) },
              { key: 'skill', header: 'Role', hideBelow: 'md', render: (s: DemandSignal) => (
                <span className="text-[12px]">{getSkill(s.skillId)?.name}</span>
              ) },
              { key: 'claimed', header: 'Claimed', align: 'right',
                render: (s: DemandSignal) => <span className="mono text-[var(--ink-tertiary)]">{formatNumber(s.reportedVacancies)}</span>,
                sortValue: s => s.reportedVacancies },
              { key: 'counted', header: 'Counted', align: 'right',
                render: (s: DemandSignal) => <span className="mono font-bold">{formatNumber(s.weightedVacancies)}</span>,
                sortValue: s => s.weightedVacancies },
              { key: 'weight', header: 'Weight', align: 'right', hideBelow: 'sm',
                render: (s: DemandSignal) => <span className="mono">{s.trustWeight.toFixed(2)}</span>,
                sortValue: s => s.trustWeight },
              { key: 'verdict', header: 'Verdict',
                render: (s: DemandSignal) => <Badge variant={VERDICT_TONE[s.verdict]}>{s.verdict.replace('-', ' ')}</Badge> },
            ]}
            rows={demandSignals}
            rowKey={s => s.id}
            highlight={s => (s.verdict === 'rejected' ? 'var(--signal-declining)' : undefined)}
          />
        </Card>
      </div>
    </>
  );
}

const FLAG_EXPLAIN: Record<string, string> = {
  'no-wage-disclosed': 'A vacancy with no wage cannot be checked against the district floor, so it is discounted heavily.',
  'wage-below-district-floor': 'Below-floor postings persistently fail to fill and distort the seat plan. Weight is cut by 40%.',
  'employer-not-in-epfo': 'Without an EPFO establishment record, no hire from this posting can ever be confirmed.',
  'bulk-identical-posting': 'Very large identical postings are the signature of aggregator padding rather than real demand.',
  'duplicate-listing': 'The same vacancy already counted from another source. Rejected outright to prevent double-counting.',
  'reposted-unfilled-6m': 'The same role has been reposted unfilled for six months: the constraint is wage or conditions, not supply.',
  'unverified-contact': 'The contact point could not be verified against the Udyam record.',
};
