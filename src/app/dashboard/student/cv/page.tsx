'use client';

import { useState, useMemo } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { HelpTip, GLOSSARY } from '@/components/ui/Plain';
import { Emblem } from '@/components/gov/Emblem';
import { courses } from '@/data/courses';
import { districts } from '@/data/districts';
import { getSkill } from '@/data/skills';
import { getSyllabus } from '@/data/syllabus';
import { sensorPracticals } from '@/data/experiments';
import { workTrials, trialScore, TRIAL_PASS_THRESHOLD } from '@/data/hiring';
import { rplApplications } from '@/data/rpl';
import { payrollAudits } from '@/data/audit';
import { employers } from '@/data/employers';
import { hiringPools } from '@/data/hiring';
import { recommendJobs, heldSkillsFor } from '@/data/recommend';
import { formatCurrency } from '@/lib/utils';

const LANGUAGE_OPTIONS = ['Marathi', 'Hindi', 'English', 'Urdu', 'Gujarati', 'Telugu'];

export default function CvPage() {
  const { account } = useCitizen();

  const [objective, setObjective] = useState('');
  const [extraLangs, setExtraLangs] = useState<string[]>(['Marathi', 'Hindi']);
  const [extraExp, setExtraExp] = useState('');
  const [phoneVisible, setPhoneVisible] = useState(true);

  /* ------------------------------------------------------------------ */
  /*  The card is assembled from records the department already holds.    */
  /*  The candidate supplies only the three optional free-text fields     */
  /*  above - everything else is pulled, and carries a verified mark.     */
  /* ------------------------------------------------------------------ */
  const dossier = useMemo(() => {
    if (!account) return null;
    const ksid = account.ksid;

    const course = account.enrolledCourseId
      ? courses.find(c => c.id === account.enrolledCourseId) ?? null
      : null;
    const syllabus = course ? getSyllabus(course.id) : null;

    // Demonstration records are keyed to the seeded IDs; a freshly registered
    // candidate legitimately has an empty evidence file, which the page says so.
    const practicals = sensorPracticals.filter(p => p.candidateKsid === ksid);
    const trials = workTrials.filter(t => t.candidateKsid === ksid);
    const rpl = rplApplications.filter(r => r.candidateKsid === ksid);
    const payroll = payrollAudits.filter(a => a.candidateKsid === ksid);

    const verifiedPracticals = practicals.filter(p => p.verified);
    const passedTrials = trials.filter(t => t.outcome === 'passed');
    const certifiedRpl = rpl.filter(r => r.status === 'certified');
    const cleanPayroll = payroll.filter(a => a.verdict === 'clean');

    const skillIds = course?.skillIds ?? [];

    // Completeness drives the "how strong is this card" meter.
    const checks = [
      { key: 'Identity verified', done: true, weight: 10 },
      { key: 'Enrolled in a course', done: Boolean(course), weight: 15 },
      { key: 'Machine-verified practicals on file', done: verifiedPracticals.length > 0, weight: 25 },
      { key: 'Work trial cleared', done: passedTrials.length > 0, weight: 25 },
      { key: 'Prior learning certified', done: certifiedRpl.length > 0, weight: 10 },
      { key: 'Payroll history on record', done: cleanPayroll.length > 0, weight: 10 },
      { key: 'Career objective written', done: objective.trim().length > 20, weight: 5 },
    ];
    const strength = checks.filter(c => c.done).reduce((a, c) => a + c.weight, 0);

    return {
      course, syllabus, practicals, verifiedPracticals, trials, passedTrials,
      rpl, certifiedRpl, payroll, cleanPayroll, skillIds, checks, strength,
    };
  }, [account, objective]);

  const jobMatches = useMemo(() => {
    if (!account) return [];
    return recommendJobs(
      {
        districtId: account.districtId,
        currentNsqfLevel: account.currentNsqfLevel ?? 3,
        yearsInformalWork: account.yearsInformalWork ?? 0,
        qualification: account.qualification ?? '',
        enrolledCourseId: account.enrolledCourseId ?? null,
      },
      heldSkillsFor(account.enrolledCourseId ?? null),
      3,
    );
  }, [account]);

  if (!account || !dossier) return null;

  const district = districts.find(d => d.id === account.districtId)!;
  const issuedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <>
      <div className="no-print">
      <PageHeader
        eyebrow="My documents"
        title="My CV"
        description={
          <>
            A{' '}
            <HelpTip term="Job-Fit Card" plain={GLOSSARY.jobFitCard.plain}
              marathi={GLOSSARY.jobFitCard.marathi} hindi={GLOSSARY.jobFitCard.hindi} />{' '}
            the department fills in for you.
          </>
        }
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'My CV' }]}
        actions={
          <button
            onClick={() => window.print()}
            className="text-[15px] font-bold px-5 py-3 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring no-print"
          >
            Print / Save as PDF
          </button>
        }
      />
      </div>

      <PageGuide />

      <div data-guide="stats" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 no-print ks-stagger">
        <Stat label="CV completeness" value={`${dossier.strength}%`}
          sub={dossier.strength >= 70 ? 'Strong: ready to send' : 'Add more evidence below'}
          tone={dossier.strength >= 70 ? 'positive' : 'warn'} accent="var(--accent-student)" />
        <Stat label="Practicals checked" value={dossier.verifiedPracticals.length}
          sub="Recorded by the machine, not an instructor" tone="positive" accent="var(--accent-student)" />
        <Stat label="Trials passed" value={dossier.passedTrials.length}
          sub={`Pass mark is ${TRIAL_PASS_THRESHOLD} out of 100`} tone="positive" accent="var(--accent-student)" />
        <Stat label="Jobs you match now" value={jobMatches.filter(j => j.matchPercent >= 50).length}
          sub="Openings near you" tone="positive" accent="var(--accent-student)" />
      </div>

      <div className="grid lg:grid-cols-[1.45fr_1fr] gap-5 print-hide-layout">
        {/* ================= THE CARD ================= */}
        <div className="print-hide-layout">
          <div className="gov-card overflow-hidden print-sheet" id="job-fit-card">
            <div className="h-1.5 tricolour-bar" />

            {/* Card masthead */}
            <div className="px-6 py-5 border-b border-[var(--border)] flex items-start gap-4">
              <Emblem size={38} className="text-[var(--gov-navy)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold uppercase tracking-[0.09em] text-[var(--gov-saffron)]">
                  Verified Job-Fit Card
                </p>
                <h2 className="text-[26px] font-bold text-[var(--gov-navy)] leading-tight mt-0.5">
                  {account.name}
                </h2>
                <p className="text-[14px] text-[var(--ink-secondary)] mt-1">
                  {dossier.course
                    ? `${dossier.course.name} · ${district.name}`
                    : `${account.qualification ?? 'Candidate'} · ${district.name}`}
                </p>
                <p className="text-[13px] mono text-[var(--ink-tertiary)] mt-1.5">
                  KSID {account.ksid}
                  {phoneVisible && ` · +91 ${account.mobile}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--signal-rising)] bg-[var(--signal-rising-light)] border border-[var(--signal-rising)]/40 px-2.5 py-1.5 rounded-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M4 12.5l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Govt. verified
                </span>
                <p className="text-[12px] text-[var(--ink-tertiary)] mt-1.5">Issued {issuedOn}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Objective */}
              {objective.trim() && (
                <Section title="Career objective">
                  <p className="text-[15px] text-[var(--ink)] leading-relaxed">{objective}</p>
                </Section>
              )}

              {/* Qualification */}
              <Section title="Qualification">
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                  <Row k="Highest education" v={account.qualification ?? '-'} />
                  <Row
                    k="Skill level"
                    v={`Level ${account.currentNsqfLevel ?? 3} (NSQF)`}
                    verified
                  />
                  {dossier.course && dossier.syllabus && (
                    <>
                      <Row k="Trade" v={dossier.course.name} verified />
                      <Row
                        k="Training hours"
                        v={`${dossier.syllabus.totalHours.toLocaleString('en-IN')} hours over ${dossier.course.durationMonths} months`}
                        verified
                      />
                    </>
                  )}
                  <Row k="Informal work experience" v={`${account.yearsInformalWork ?? 0} years`} />
                  <Row k="District" v={district.name} verified />
                </dl>
              </Section>

              {/* Skills */}
              {dossier.skillIds.length > 0 && (
                <Section title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {dossier.skillIds.map(sid => {
                      const s = getSkill(sid);
                      if (!s) return null;
                      return (
                        <span
                          key={sid}
                          className="inline-flex items-center gap-2 text-[14px] font-semibold bg-[var(--accent-student-light)] text-[var(--accent-student)] border border-[var(--accent-student)]/30 px-3 py-1.5 rounded-sm"
                        >
                          {s.name}
                          <span className="text-[12px] font-normal opacity-75">L{s.nsqfLevel}</span>
                        </span>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* Machine-verified practicals */}
              <Section
                title="Practical work, checked by machine"
                note="Each line below was recorded by the equipment itself, not signed off by a person."
              >
                {dossier.verifiedPracticals.length === 0 ? (
                  <Empty>
                    No machine-verified practicals on file yet. These appear automatically once you complete
                    practical sessions on instrumented equipment at your centre.
                  </Empty>
                ) : (
                  <ul className="space-y-3">
                    {dossier.verifiedPracticals.map(p => {
                      const passed = p.telemetry.filter(t => t.pass).length;
                      return (
                        <li key={p.id} className="border border-[var(--border)] rounded-sm p-3.5 print-block">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-[15px] font-bold text-[var(--ink)]">
                                {p.moduleCode}: {p.sensorKind.replace(/-/g, ' ')}
                              </p>
                              <p className="text-[13px] mono text-[var(--ink-tertiary)]">
                                {p.machineId} · {p.machineMinutes} minutes of machine time · {p.performedOn}
                              </p>
                            </div>
                            <span className="text-[20px] font-bold mono text-[var(--signal-rising)] shrink-0">
                              {p.autoScore}
                              <span className="text-[13px] font-normal text-[var(--ink-tertiary)]">/100</span>
                            </span>
                          </div>
                          <p className="text-[14px] text-[var(--ink-secondary)]">
                            {passed} of {p.telemetry.length} measurements within tolerance : {' '}
                            {p.telemetry.slice(0, 2).map(t => `${t.metric.toLowerCase()} ${t.value}${t.unit}`).join(', ')}.
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>

              {/* Work trials */}
              <Section
                title="Work you did at a company"
                note="Days actually worked on a company floor, scored by the supervising employer."
              >
                {dossier.trials.length === 0 ? (
                  <Empty>
                    No work trial on record yet. Trials are arranged at the end of training, and the State
                    pays you a daily stipend throughout.
                  </Empty>
                ) : (
                  <ul className="space-y-3">
                    {dossier.trials.map(t => {
                      const s = trialScore(t);
                      const emp = employers.find(e => e.id === t.employerId);
                      const pool = hiringPools.find(p => p.id === t.poolId);
                      return (
                        <li key={t.id} className="border border-[var(--border)] rounded-sm p-3.5 print-block">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <p className="text-[15px] font-bold text-[var(--ink)]">{emp?.name}</p>
                              <p className="text-[13px] text-[var(--ink-tertiary)]">
                                {getSkill(t.skillId)?.name} · {t.durationDays} days from {t.startDate}
                                {pool && ` · ${pool.name}`}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <Badge variant={t.outcome === 'passed' ? 'rising' : t.outcome === 'failed' ? 'declining' : 'warn'}>
                                {t.outcome === 'passed' ? 'Cleared' : t.outcome === 'failed' ? 'Not cleared' : t.outcome}
                              </Badge>
                              {s !== null && (
                                <p
                                  className="text-[20px] font-bold mono mt-1"
                                  style={{ color: s >= TRIAL_PASS_THRESHOLD ? 'var(--signal-rising)' : 'var(--signal-declining)' }}
                                >
                                  {s}<span className="text-[13px] font-normal text-[var(--ink-tertiary)]">/100</span>
                                </p>
                              )}
                            </div>
                          </div>
                          {t.outcome === 'passed' && (
                            <p className="text-[14px] text-[var(--ink-secondary)] italic leading-relaxed">
                              Supervisor: &ldquo;{t.supervisorRemarks}&rdquo;
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Section>

              {/* RPL */}
              {dossier.certifiedRpl.length > 0 && (
                <Section title="Certificate for work you already do">
                  {dossier.certifiedRpl.map(r => (
                    <div key={r.id} className="border border-[var(--border)] rounded-sm p-3.5">
                      <p className="text-[15px] font-bold text-[var(--ink)]">
                        {getSkill(r.claimedSkillId)?.name}: certified at NSQF Level {r.assessedNsqfLevel}
                      </p>
                      <p className="text-[14px] text-[var(--ink-secondary)] mt-1 leading-relaxed">
                        {r.yearsOfExperience} years of experience assessed and formally recognised.
                        {r.evidence.filter(e => e.verified).length} of {r.evidence.length} evidence items
                        independently verified.
                      </p>
                    </div>
                  ))}
                </Section>
              )}

              {/* Employment history */}
              {dossier.cleanPayroll.length > 0 && (
                <Section
                  title="Employment history"
                  note="Checked against official salary records: not just your word."
                >
                  <ul className="space-y-2.5">
                    {dossier.cleanPayroll.map(a => (
                      <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--border)] pb-2.5 last:border-0">
                        <span className="text-[15px] font-semibold text-[var(--ink)]">
                          {a.epfoEmployerName}
                        </span>
                        <span className="text-[14px] mono text-[var(--ink-secondary)]">
                          from {a.epfoFirstContributionMonth} · {a.monthsContributed} month(s) ·{' '}
                          {formatCurrency(a.epfoDeclaredWage ?? 0)}/month
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Self-declared */}
              {(extraExp.trim() || extraLangs.length > 0) && (
                <Section
                  title="Additional information"
                  note="Provided by the candidate. Not independently verified."
                >
                  {extraLangs.length > 0 && (
                    <p className="text-[15px] text-[var(--ink)] mb-2">
                      <strong>Languages: </strong>{extraLangs.join(', ')}
                    </p>
                  )}
                  {extraExp.trim() && (
                    <p className="text-[15px] text-[var(--ink)] leading-relaxed whitespace-pre-line">
                      {extraExp}
                    </p>
                  )}
                </Section>
              )}

              <p className="text-[12.5px] text-[var(--ink-tertiary)] leading-relaxed pt-4 border-t border-[var(--border)]">
                Items marked <strong className="text-[var(--signal-rising)]">verified</strong> are drawn from
                departmental records: training enrolment, machine telemetry, employer trial scorecards,
                skill assessment and salary records. An employer can check this card using your प्रgati ID{' '}
                <span className="mono">{account.ksid}</span> on the प्रgati portal.
              </p>
            </div>
          </div>
        </div>

        {/* ================= EDITOR ================= */}
        <div className="space-y-5 no-print">
          <Card title="Make your card stronger" subtitle="Each item you add makes employers more confident">
            <Progress
              value={dossier.strength}
              color={dossier.strength >= 70 ? 'var(--signal-rising)' : 'var(--signal-warn)'}
              height={12}
              label="CV completeness"
              showValue
            />
            <ul className="space-y-2.5 mt-4">
              {dossier.checks.map(c => (
                <li key={c.key} className="flex items-start gap-2.5">
                  <span
                    className={`w-5 h-5 shrink-0 grid place-items-center rounded-full text-[12px] font-bold mt-0.5 ${
                      c.done
                        ? 'bg-[var(--signal-rising)] text-white'
                        : 'bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--ink-tertiary)]'
                    }`}
                  >
                    {c.done ? '✓' : '·'}
                  </span>
                  <span className="text-[14px] text-[var(--ink-secondary)]">
                    {c.key}
                    <span className="text-[12.5px] text-[var(--ink-tertiary)] ml-1.5">+{c.weight}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Your own words" subtitle="The only parts of the card you write yourself">
            <div className="space-y-4">
              <div>
                <label className="gov-label" htmlFor="obj">
                  What kind of work are you looking for?
                </label>
                <textarea
                  id="obj" rows={3} className="gov-input" value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="e.g. I want to work as an EV battery technician in a service centre near Pune. I have worked on petrol engines for six years and want to move to electric vehicles."
                />
                <p className="text-[13px] text-[var(--ink-tertiary)] mt-1.5">
                  Two or three plain sentences. Say what work you want and what you have done before.
                </p>
              </div>

              <div>
                <span className="gov-label">Languages you speak</span>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(l => (
                    <button
                      key={l}
                      onClick={() =>
                        setExtraLangs(x => (x.includes(l) ? x.filter(y => y !== l) : [...x, l]))
                      }
                      className={`text-[14px] font-semibold px-3.5 py-2 border rounded-sm transition-colors focus-ring ${
                        extraLangs.includes(l)
                          ? 'bg-[var(--accent-student)] text-white border-[var(--accent-student)]'
                          : 'border-[var(--border-strong)] hover:bg-[var(--surface-alt)]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="gov-label" htmlFor="extra">
                  Anything else an employer should know
                </label>
                <textarea
                  id="extra" rows={3} className="gov-input" value={extraExp}
                  onChange={e => setExtraExp(e.target.value)}
                  placeholder="e.g. I have my own tools. I hold a light motor vehicle driving licence. I can work night shifts."
                />
              </div>

              <label className="flex items-start gap-2.5 text-[14px] text-[var(--ink-secondary)]">
                <input
                  type="checkbox" checked={phoneVisible}
                  onChange={e => setPhoneVisible(e.target.checked)}
                  className="mt-1 accent-[var(--accent-student)] w-4 h-4"
                />
                <span>Show my phone number on the card so employers can call me directly</span>
              </label>
            </div>
          </Card>

          {jobMatches.length > 0 && (
            <Card title="Where this card would be useful now" subtitle="Openings you already match">
              <ul className="space-y-3">
                {jobMatches.map(j => (
                  <li key={j.poolId} className="border border-[var(--border)] rounded-sm p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-[14.5px] font-bold text-[var(--ink)] leading-snug">{j.skillName}</p>
                      <Badge variant={j.matchPercent >= 70 ? 'rising' : 'warn'} dot>
                        {j.matchPercent}%
                      </Badge>
                    </div>
                    <p className="text-[13.5px] text-[var(--ink-tertiary)]">
                      {j.employers} employer(s) in {j.districtName} · at least{' '}
                      {formatCurrency(j.wageFloor)}/month
                    </p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="print-block">
      <h3 className="text-[13px] font-bold uppercase tracking-[0.07em] text-[var(--gov-navy)] pb-2 mb-3 border-b-2 border-[var(--gov-navy)]">
        {title}
      </h3>
      {note && <p className="text-[13px] text-[var(--ink-tertiary)] mb-3 leading-relaxed">{note}</p>}
      {children}
    </section>
  );
}

function Row({ k, v, verified }: { k: string; v: string; verified?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[14px] text-[var(--ink-tertiary)] shrink-0">{k}</dt>
      <dd className="text-[14.5px] font-semibold text-[var(--ink)] text-right">
        {v}
        {verified && (
          <span className="text-[var(--signal-rising)] ml-1.5" title="Verified from departmental records">✓</span>
        )}
      </dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[14px] text-[var(--ink-tertiary)] leading-relaxed bg-[var(--surface)] border border-dashed border-[var(--border-strong)] rounded-sm px-4 py-3">
      {children}
    </p>
  );
}
