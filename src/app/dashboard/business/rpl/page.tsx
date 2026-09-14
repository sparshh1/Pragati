'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { rplApplications, rplStats, creditedHours } from '@/data/rpl';
import { tradeShifts } from '@/data/tradeShifts';
import { getSkill, skills } from '@/data/skills';
import { districts } from '@/data/districts';
import { formatCurrency } from '@/lib/utils';
import { PILLARS } from '@/data/pillars';

const STATUS_TONE = {
  submitted: 'warn', 'assessment-scheduled': 'officer', certified: 'rising', rejected: 'declining',
} as const;

export default function BusinessRplPage() {
  const pillar = PILLARS[4];

  const [endorsed, setEndorsed] = useState<Record<string, boolean>>({});
  const [nominee, setNominee] = useState({ name: '', skillId: skills[0].id, years: 6, wage: 13000 });
  const [nominated, setNominated] = useState<typeof nominee[]>([]);

  const stats = rplStats();
  const awaiting = rplApplications.filter(r => r.status === 'submitted' || r.status === 'assessment-scheduled');

  const projectedUplift = Math.round(
    (getSkill(nominee.skillId)?.salaryRange[0] ?? 15000) * 1.35 - nominee.wage,
  );

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number} — ${pillar.short}`}
        title="Endorse prior learning"
        description="Certify the skilled workers already on your floor."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/business' }, { label: 'Endorse Prior Learning' }]}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Awaiting employer endorsement" value={awaiting.length}
          sub="Applications that name an employer" tone="warn" accent="var(--accent-employer)" />
        <Stat label="Certified state-wide" value={stats.certified}
          sub={`${stats.rejected} rejected on evidence`} tone="positive" accent="var(--accent-employer)" />
        <Stat label="Average uplift on certification" value={`+${formatCurrency(stats.avgMonthlyUplift)}`}
          sub="per month, per worker" tone="positive" accent="var(--accent-employer)" />
        <Stat label="Average bridge hours" value={`${stats.avgBridgeHours} h`}
          sub="Worker stays on your floor throughout" tone="positive" accent="var(--accent-employer)" />
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        <div className="space-y-5">
          <Card title="Applications naming an employer" subtitle="Confirm or dispute the experience claimed">
            <ul className="space-y-3">
              {rplApplications.map(r => {
                const skill = getSkill(r.claimedSkillId);
                const done = endorsed[r.id];
                const actionable = r.status === 'submitted' || r.status === 'assessment-scheduled';
                return (
                  <li key={r.id} className="border border-[var(--border)] rounded-sm p-3.5">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-bold text-[var(--ink)]">{r.candidateName}</p>
                        <p className="text-[11px] mono text-[var(--ink-tertiary)]">
                          {r.id} · {r.candidateKsid} · {districts.find(d => d.id === r.districtId)?.name}
                        </p>
                      </div>
                      <Badge variant={STATUS_TONE[r.status]} dot>{r.status.replace('-', ' ')}</Badge>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 py-2.5 border-y border-[var(--border)] text-center">
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Trade claimed</p>
                        <p className="text-[12.5px] font-semibold">{skill?.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Experience</p>
                        <p className="text-[12.5px] font-semibold mono">{r.yearsOfExperience} years</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Level</p>
                        <p className="text-[12.5px] font-semibold mono">
                          claims L{r.claimedNsqfLevel}
                          {r.assessedNsqfLevel !== null && ` → assessed L${r.assessedNsqfLevel}`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                        Evidence on file
                      </p>
                      <ul className="space-y-1">
                        {r.evidence.map(e => (
                          <li key={e.kind} className="flex items-start gap-2 text-[11.5px]">
                            <span className={e.verified ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'}>
                              {e.verified ? '✓' : '✗'}
                            </span>
                            <span>
                              <span className="font-semibold text-[var(--ink)]">{e.kind}</span>
                              <span className="text-[var(--ink-secondary)]"> — {e.detail}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {r.status === 'certified' && (
                      <div className="mt-2.5 pt-2.5 border-t border-[var(--border)]">
                        <Progress value={creditedHours(r)} max={2400} color="var(--signal-rising)" height={7}
                          label={`${creditedHours(r).toLocaleString('en-IN')} of 2,400 course hours credited — only ${r.bridgeHoursRequired} h of bridge training required`} />
                        <p className="text-[12px] mono mt-2">
                          <span className="text-[var(--ink-tertiary)] line-through">{formatCurrency(r.currentMonthlyWage)}</span>
                          {' → '}
                          <span className="font-bold text-[var(--signal-rising)]">{formatCurrency(r.projectedMonthlyWage)}</span>
                          <span className="text-[10.5px] text-[var(--ink-tertiary)] ml-1.5">per month</span>
                        </p>
                      </div>
                    )}

                    {actionable && (
                      <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        {done ? (
                          <p className="text-[12px] font-semibold text-[var(--signal-rising)]">
                            ✓ Endorsement recorded. The assessor has been notified and will schedule within 14 days.
                          </p>
                        ) : (
                          <div className="flex gap-2">
                            <button onClick={() => setEndorsed(e => ({ ...e, [r.id]: true }))}
                              className="flex-1 text-white font-bold text-[12.5px] py-2 rounded-sm focus-ring"
                              style={{ background: 'var(--accent-employer)' }}>
                              Endorse this experience
                            </button>
                            <button className="flex-1 font-semibold text-[12.5px] py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                              Dispute
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Nominate a worker on your floor"
            subtitle="Has the skill, not the paper">
            <div className="space-y-4">
              <div>
                <label className="gov-label" htmlFor="n-name">Worker name</label>
                <input id="n-name" className="gov-input" value={nominee.name}
                  onChange={e => setNominee(n => ({ ...n, name: e.target.value }))}
                  placeholder="As on Aadhaar" />
              </div>
              <div>
                <label className="gov-label" htmlFor="n-skill">Work they actually do</label>
                <select id="n-skill" className="gov-input" value={nominee.skillId}
                  onChange={e => setNominee(n => ({ ...n, skillId: e.target.value }))}>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gov-label" htmlFor="n-years">Years with you</label>
                  <input id="n-years" type="number" min={0} max={40} className="gov-input mono"
                    value={nominee.years} onChange={e => setNominee(n => ({ ...n, years: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="gov-label" htmlFor="n-wage">Current wage (₹)</label>
                  <input id="n-wage" type="number" min={0} step={500} className="gov-input mono"
                    value={nominee.wage} onChange={e => setNominee(n => ({ ...n, wage: Number(e.target.value) }))} />
                </div>
              </div>

              {nominee.years >= 2 && (
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-3">
                  <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)]">
                    Likely outcome
                  </p>
                  <p className="text-[12.5px] text-[var(--ink-secondary)] mt-1 leading-relaxed">
                    NSQF L{nominee.years >= 4 ? 4 : 3} certification with roughly{' '}
                    {Math.max(40, 2400 - nominee.years * 220)} hours of bridge training, delivered on
                    evenings and weekends. Indicative wage effect{' '}
                    <strong className="text-[var(--signal-rising)]">
                      {projectedUplift > 0 ? `+${formatCurrency(projectedUplift)}` : 'no change'}
                    </strong>{' '}
                    per month.
                  </p>
                </div>
              )}

              <button disabled={!nominee.name.trim() || nominee.years < 2}
                onClick={() => { setNominated(n => [...n, nominee]); setNominee(x => ({ ...x, name: '' })); }}
                className="w-full text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring disabled:opacity-45"
                style={{ background: 'var(--accent-employer)' }}>
                Nominate for RPL assessment →
              </button>
              {nominee.years < 2 && (
                <p className="text-[11.5px] text-[var(--signal-warn)]">
                  RPL requires at least two years of documented experience.
                </p>
              )}
            </div>

            {nominated.length > 0 && (
              <ul className="mt-4 pt-4 border-t border-[var(--border)] space-y-1.5">
                {nominated.map((n, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12px] border border-[var(--border)] rounded-sm px-3 py-2">
                    <span className="text-[var(--signal-rising)] font-bold">✓</span>
                    <span className="flex-1 min-w-0 truncate">
                      <strong>{n.name}</strong> — {getSkill(n.skillId)?.name}, {n.years} yrs
                    </span>
                    <span className="text-[10.5px] mono text-[var(--ink-tertiary)] shrink-0">submitted</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Trade-shift tracks for your existing workforce"
            subtitle="Contracting trade → growing trade">
            <ul className="space-y-2">
              {tradeShifts.slice(0, 5).map(s => (
                <li key={`${s.fromSkillId}>${s.toSkillId}`} className="border border-[var(--border)] rounded-sm px-3 py-2.5">
                  <p className="text-[12.5px] text-[var(--ink)]">
                    <span className="font-semibold">{getSkill(s.fromSkillId)?.name}</span>
                    <span className="text-[var(--ink-tertiary)] mx-1.5">→</span>
                    <span className="font-semibold">{getSkill(s.toSkillId)?.name}</span>
                  </p>
                  <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">
                    {s.bridgeModuleName} · {s.bridgeDurationWeeks} weeks
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-[var(--ink-secondary)] mt-3 leading-relaxed">
              Modernising the people you already employ is faster than replacing them. A bridge module runs
              part-time, so the worker stays productive on your floor throughout.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
