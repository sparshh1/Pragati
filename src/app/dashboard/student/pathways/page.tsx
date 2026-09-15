'use client';

import { useState, useMemo } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { SkillRadar } from '@/components/charts/Charts';
import { skills, getSkill } from '@/data/skills';
import { tradeShifts } from '@/data/tradeShifts';
import { districts } from '@/data/districts';
import { rplApplications, rplStats, creditedHours } from '@/data/rpl';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { formatCurrency, formatPercent } from '@/lib/utils';

const EVIDENCE_TYPES = [
  { id: 'employer-letter', label: 'A letter from an employer', weight: 25 },
  { id: 'work-samples', label: 'Photos of work you have done', weight: 20 },
  { id: 'epfo', label: 'Official salary record from a past job', weight: 30 },
  { id: 'tool-test', label: 'A short skills test at a centre', weight: 35 },
  { id: 'peer', label: 'A letter from a certified tradesperson', weight: 15 },
  { id: 'ledger', label: 'Contractor records of your work', weight: 18 },
];

const FULL_COURSE_HOURS = 2400;

export default function StudentPathwaysPage() {
  const { account } = useCitizen();

  const [tab, setTab] = useState<'rpl' | 'shift'>('rpl');

  // ---- RPL estimator state ----
  const [claimSkill, setClaimSkill] = useState('ice-engine-overhaul');
  const [years, setYears] = useState(account?.yearsInformalWork || 6);
  const [evidence, setEvidence] = useState<string[]>(['employer-letter', 'work-samples']);

  // ---- Trade-shift state ----
  const [fromSkill, setFromSkill] = useState('carburettor-repair');
  const districtId = account?.districtId ?? 'pune';

  const assessment = useMemo(() => {
    const skill = getSkill(claimSkill)!;
    const evidenceScore = evidence.reduce(
      (a, id) => a + (EVIDENCE_TYPES.find(e => e.id === id)?.weight ?? 0), 0,
    );
    // Experience sets the ceiling; evidence decides how much of it can be credited.
    const experienceLevel = years >= 8 ? 4 : years >= 4 ? 4 : years >= 2 ? 3 : 2;
    const evidenceCap = evidenceScore >= 70 ? 5 : evidenceScore >= 45 ? 4 : evidenceScore >= 25 ? 3 : 2;
    const assessedLevel = Math.min(experienceLevel, evidenceCap, skill.nsqfLevel);

    // Bridge hours shrink with experience and with the strength of the evidence.
    const raw = FULL_COURSE_HOURS * (1 - Math.min(0.92, years * 0.085 + evidenceScore * 0.004));
    const bridgeHours = Math.max(40, Math.round(raw / 20) * 20);

    const uplift = Math.round((skill.salaryRange[1] - skill.salaryRange[0]) * 0.55 + skill.salaryRange[0] * 0.22);

    return {
      skill, evidenceScore, assessedLevel, bridgeHours,
      credited: FULL_COURSE_HOURS - bridgeHours,
      weeks: Math.ceil(bridgeHours / 40),
      uplift,
      eligible: years >= 2 && evidenceScore >= 25,
    };
  }, [claimSkill, years, evidence]);

  const shifts = tradeShifts.filter(s => s.fromSkillId === fromSkill);
  const fromTrend = computeDemandTrend(fromSkill, districtId);
  const stats = rplStats();

  const radarData = useMemo(() => {
    if (shifts.length === 0) return [];
    const to = getSkill(shifts[0].toSkillId)!;
    return [
      { axis: 'Safety', a: 78, b: 92 },
      { axis: 'Diagnostics', a: 62, b: 88 },
      { axis: 'Electrical', a: 41, b: 90 },
      { axis: 'Digital tools', a: 30, b: 76 },
      { axis: 'Mechanical', a: 88, b: 64 },
      { axis: `${to.name.split(' ')[0]} systems`, a: 18, b: 85 },
    ];
  }, [shifts]);

  const toggleEvidence = (id: string) =>
    setEvidence(e => (e.includes(id) ? e.filter(x => x !== id) : [...e, id]));

  return (
    <>
      <PageHeader
        eyebrow="Your options"
        title="Get certified, or change trade"
        description="Certify what you already do, or switch to a growing trade."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Career Pathways & RPL' }]}
      />

      <PageGuide />

      <div className="flex gap-1 mb-5 border-b border-[var(--border)]" role="tablist">
        {([
          ['rpl', 'Certificate for my experience'],
          ['shift', 'Change to a growing trade'],
        ] as const).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-[13.5px] font-semibold border-b-[3px] -mb-px transition-colors focus-ring ${
              tab === id
                ? 'border-[var(--accent-student)] text-[var(--accent-student)]'
                : 'border-transparent text-[var(--ink-tertiary)] hover:text-[var(--ink)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* =================== RPL =================== */}
      {tab === 'rpl' && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Stat label="Certified so far" value={stats.certified} sub={`${stats.pending} awaiting assessment`}
              accent="var(--accent-student)" />
            <Stat label="Average wage uplift" value={`+${formatCurrency(stats.avgMonthlyUplift)}`}
              sub="per month, after certification" tone="positive" accent="var(--accent-student)" />
            <Stat label="Extra training needed" value={`${stats.avgBridgeHours} h`}
              sub={`instead of ${FULL_COURSE_HOURS.toLocaleString('en-IN')} h`} tone="positive" accent="var(--accent-student)" />
            <Stat label="Your experience" value={`${years} yr`}
              sub={years >= 2 ? 'Meets the 2-year minimum' : 'Below the 2-year minimum'}
              tone={years >= 2 ? 'positive' : 'warn'} accent="var(--accent-student)" />
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
            <Card title="Check what you would get" subtitle="Adjust the inputs to see what would be credited">
              <div className="space-y-4">
                <div>
                  <label className="gov-label" htmlFor="rpl-skill">Work you already do</label>
                  <select id="rpl-skill" className="gov-input" value={claimSkill} onChange={e => setClaimSkill(e.target.value)}>
                    {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="gov-label" htmlFor="rpl-years">
                    Years you have worked — <span className="mono font-bold text-[var(--ink)]">{years}</span>
                  </label>
                  <input id="rpl-years" type="range" min={0} max={20} value={years}
                    onChange={e => setYears(Number(e.target.value))}
                    className="w-full accent-[var(--accent-student)]" />
                  <div className="flex justify-between text-[10.5px] text-[var(--ink-tertiary)] mono">
                    <span>0</span><span>10</span><span>20</span>
                  </div>
                </div>

                <div>
                  <span className="gov-label">Proof you can show</span>
                  <div className="space-y-1.5">
                    {EVIDENCE_TYPES.map(e => (
                      <label key={e.id}
                        className={`flex items-start gap-2.5 px-3 py-2 border rounded-sm cursor-pointer transition-colors ${
                          evidence.includes(e.id)
                            ? 'border-[var(--accent-student)] bg-[var(--accent-student-light)]'
                            : 'border-[var(--border)] hover:bg-[var(--surface)]'
                        }`}>
                        <input type="checkbox" checked={evidence.includes(e.id)}
                          onChange={() => toggleEvidence(e.id)} className="mt-0.5 accent-[var(--accent-student)]" />
                        <span className="flex-1 text-[12.5px] text-[var(--ink)]">{e.label}</span>
                        <span className="text-[10.5px] mono text-[var(--ink-tertiary)] shrink-0">+{e.weight}</span>
                      </label>
                    ))}
                  </div>
                  <Progress value={assessment.evidenceScore} max={143}
                    color={assessment.evidenceScore >= 70 ? 'var(--signal-rising)' : assessment.evidenceScore >= 25 ? 'var(--signal-warn)' : 'var(--signal-declining)'}
                    label="How strong your proof is" showValue height={8} />
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card title="What you would likely get">
                {!assessment.eligible ? (
                  <Note tone="warn" title="Not yet eligible">
                    RPL needs two years of work and an evidence score of 25. Add more evidence, or take a
                    regular course.
                  </Note>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--border)]">
                      <div>
                        <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">
                          You would get
                        </p>
                        <p className="text-[28px] font-bold mono text-[var(--accent-student)] leading-tight">
                          Level {assessment.assessedLevel}
                        </p>
                        <p className="text-[11px] text-[var(--ink-tertiary)]">{assessment.skill.name}</p>
                      </div>
                      <div>
                        <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">
                          Extra training needed
                        </p>
                        <p className="text-[28px] font-bold mono text-[var(--ink)] leading-tight">
                          {assessment.bridgeHours} h
                        </p>
                        <p className="text-[11px] text-[var(--ink-tertiary)]">about {assessment.weeks} weeks part-time</p>
                      </div>
                    </div>

                    <div className="py-4 border-b border-[var(--border)]">
                      <Progress value={assessment.credited} max={FULL_COURSE_HOURS}
                        color="var(--signal-rising)" height={12}
                        label={`${assessment.credited.toLocaleString('en-IN')} of ${FULL_COURSE_HOURS.toLocaleString('en-IN')} course hours you would not have to repeat`}
                        showValue />
                      <p className="text-[11.5px] text-[var(--ink-secondary)] mt-2 leading-relaxed">
                        You would not repeat those hours. The assessment credits the work you have already
                        done and prescribes only what is genuinely missing.
                      </p>
                    </div>

                    <div className="pt-4">
                      <p className="text-[10.5px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">
                        What you would earn
                      </p>
                      <p className="text-[20px] font-bold mono text-[var(--signal-rising)]">
                        +{formatCurrency(assessment.uplift)}<span className="text-[12px] font-normal text-[var(--ink-tertiary)]">/month</span>
                      </p>
                      <p className="text-[11.5px] text-[var(--ink-secondary)] mt-1 leading-relaxed">
                        Formalisation moves you from cash wages into a payroll record — which is also what
                        makes EPF, ESI and future credit accessible.
                      </p>
                    </div>

                    <button className="w-full mt-4 text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring"
                      style={{ background: 'var(--accent-student)' }}>
                      Apply for my certificate →
                    </button>
                    <p className="text-[10.5px] text-[var(--ink-tertiary)] text-center mt-1.5">
                      Assessment is scheduled within 14 days at your nearest centre
                    </p>
                  </>
                )}
              </Card>

              <Card title="People certified recently" subtitle="Real outcomes from the RPL register">
                <ul className="space-y-2.5">
                  {rplApplications.filter(r => r.status === 'certified').slice(0, 4).map(r => (
                    <li key={r.id} className="border border-[var(--border)] rounded-sm p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-[var(--ink)]">{r.candidateName}</p>
                          <p className="text-[11px] text-[var(--ink-tertiary)]">
                            {getSkill(r.claimedSkillId)?.name} · {r.yearsOfExperience} yrs ·{' '}
                            {districts.find(d => d.id === r.districtId)?.name}
                          </p>
                        </div>
                        <Badge variant="rising">NSQF L{r.assessedNsqfLevel}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[11.5px] mono">
                        <span className="text-[var(--ink-tertiary)] line-through">{formatCurrency(r.currentMonthlyWage)}</span>
                        <span aria-hidden>→</span>
                        <span className="font-bold text-[var(--signal-rising)]">{formatCurrency(r.projectedMonthlyWage)}</span>
                        <span className="text-[10.5px] text-[var(--ink-tertiary)]">
                          · {creditedHours(r).toLocaleString('en-IN')} h credited
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* =================== Trade shift =================== */}
      {tab === 'shift' && (
        <>

          <div className="gov-card p-4 mb-5">
            <label className="gov-label" htmlFor="from-skill">Your current trade</label>
            <select id="from-skill" className="gov-input max-w-xl" value={fromSkill} onChange={e => setFromSkill(e.target.value)}>
              {[...new Set(tradeShifts.map(s => s.fromSkillId))].map(id => (
                <option key={id} value={id}>{getSkill(id)?.name}</option>
              ))}
            </select>
            <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-1.5">
              Demand for {getSkill(fromSkill)?.name} in {districts.find(d => d.id === districtId)?.name}:{' '}
              <strong className={fromTrend.direction === 'declining' ? 'text-[var(--signal-declining)]' : ''}>
                {formatPercent(fromTrend.yoyChangePercent)} year on year
              </strong>
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="space-y-4">
              {shifts.length === 0 ? (
                <Card><p className="text-[13px] text-[var(--ink-tertiary)]">No published shift track from this trade yet.</p></Card>
              ) : shifts.map(s => {
                const from = getSkill(s.fromSkillId)!;
                const to = getSkill(s.toSkillId)!;
                const toTrend = computeDemandTrend(s.toSkillId, districtId);
                const available = s.bridgeCourseAvailableDistrictIds.includes(districtId);
                const wageGain = to.salaryRange[0] - from.salaryRange[0];
                return (
                  <Card key={`${s.fromSkillId}-${s.toSkillId}`} title={s.bridgeModuleName}
                    subtitle={`${s.bridgeDurationWeeks}-week bridge · ${available ? 'Available in your district' : 'Not yet offered in your district'}`}
                    action={<Badge variant={available ? 'rising' : 'warn'} dot>{available ? 'Open' : 'Nearest district'}</Badge>}>

                    {/* The transition, drawn */}
                    <div className="flex items-stretch gap-3 mb-4">
                      <div className="flex-1 border border-[var(--border)] rounded-sm p-3 bg-[var(--signal-declining-light)]">
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--signal-declining)]">From</p>
                        <p className="text-[13.5px] font-bold text-[var(--ink)] mt-0.5 leading-snug">{from.name}</p>
                        <p className="text-[11px] text-[var(--ink-secondary)] mt-1">NSQF L{from.nsqfLevel}</p>
                        <p className="text-[13px] mono font-bold text-[var(--ink)] mt-1.5">
                          {formatCurrency(from.salaryRange[0])}–{formatCurrency(from.salaryRange[1])}
                        </p>
                        <p className="text-[11px] mono text-[var(--signal-declining)] mt-1">
                          {formatPercent(fromTrend.yoyChangePercent)} YoY
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1">
                          {s.bridgeDurationWeeks} wk
                        </span>
                        <svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="var(--accent-student)" strokeWidth="2">
                          <line x1="2" y1="10" x2="28" y2="10" strokeLinecap="round" />
                          <path d="M24 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[9.5px] text-[var(--ink-tertiary)] mt-1">bridge</span>
                      </div>

                      <div className="flex-1 border border-[var(--border)] rounded-sm p-3 bg-[var(--signal-rising-light)]">
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--signal-rising)]">To</p>
                        <p className="text-[13.5px] font-bold text-[var(--ink)] mt-0.5 leading-snug">{to.name}</p>
                        <p className="text-[11px] text-[var(--ink-secondary)] mt-1">NSQF L{to.nsqfLevel}</p>
                        <p className="text-[13px] mono font-bold text-[var(--ink)] mt-1.5">
                          {formatCurrency(to.salaryRange[0])}–{formatCurrency(to.salaryRange[1])}
                        </p>
                        <p className="text-[11px] mono text-[var(--signal-rising)] mt-1">
                          {formatPercent(toTrend.yoyChangePercent)} YoY
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Entry wage gain</p>
                        <p className="text-[16px] font-bold mono text-[var(--signal-rising)]">
                          +{formatCurrency(wageGain)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Time to switch</p>
                        <p className="text-[16px] font-bold mono">{s.bridgeDurationWeeks} wk</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Offered in</p>
                        <p className="text-[12px] font-semibold pt-1">
                          {s.bridgeCourseAvailableDistrictIds
                            .map(d => districts.find(x => x.id === d)?.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    <button className="w-full mt-3.5 font-bold text-[13px] py-2.5 rounded-sm focus-ring"
                      style={available
                        ? { background: 'var(--accent-student)', color: '#fff' }
                        : { background: 'var(--surface-alt)', color: 'var(--ink-secondary)', border: '1px solid var(--border-strong)' }}>
                      {available ? 'Enrol in this bridge module →' : 'Request this track in my district'}
                    </button>
                  </Card>
                );
              })}
            </div>

            <div className="space-y-5">
              {radarData.length > 0 && (
                <Card title="What you already have, and what is missing"
                  subtitle={`${getSkill(fromSkill)?.name} vs ${getSkill(shifts[0].toSkillId)?.name}`}>
                  <SkillRadar data={radarData} height={280}
                    seriesA="Your current profile" seriesB="Target trade requirement" />
                  <p className="text-[12px] text-[var(--ink-secondary)] mt-3 leading-relaxed">
                    The gap between the two shapes is the bridge module. Where your current profile already
                    meets the target — safety, mechanical work, diagnostic method — nothing is retaught.
                  </p>
                </Card>
              )}

              <Card title="All the trade changes available">
                <ul className="space-y-2">
                  {tradeShifts.map(s => (
                    <li key={`${s.fromSkillId}>${s.toSkillId}`}>
                      <button onClick={() => setFromSkill(s.fromSkillId)}
                        className={`w-full text-left border rounded-sm px-3 py-2 transition-colors focus-ring ${
                          s.fromSkillId === fromSkill
                            ? 'border-[var(--accent-student)] bg-[var(--accent-student-light)]'
                            : 'border-[var(--border)] hover:bg-[var(--surface)]'
                        }`}>
                        <p className="text-[12.5px] text-[var(--ink)]">
                          <span className="font-semibold">{getSkill(s.fromSkillId)?.name}</span>
                          <span className="text-[var(--ink-tertiary)] mx-1.5">→</span>
                          <span className="font-semibold">{getSkill(s.toSkillId)?.name}</span>
                        </p>
                        <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-0.5">
                          {s.bridgeDurationWeeks}-week bridge
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
