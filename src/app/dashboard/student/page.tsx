'use client';

import Link from 'next/link';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { CITIZEN_NAV, PILLARS, NAV_ICONS } from '@/data/pillars';
import { districts } from '@/data/districts';
import { courses } from '@/data/courses';
import { getSyllabus } from '@/data/syllabus';
import { hiringPools, poolSeatsCommitted } from '@/data/hiring';
import { dyingTasks } from '@/data/signals';
import { computeGapForDistrict } from '@/data/compute/gapAnalysis';
import { rplStats } from '@/data/rpl';
import { formatCurrency } from '@/lib/utils';
import { BigAction } from '@/components/ui/Plain';
import { PageGuide } from '@/components/guide/PageGuide';
import { nextSteps, heldSkillsFor, recommendCourses } from '@/data/recommend';

export default function StudentOverview() {
  const { account } = useCitizen();
  if (!account) return null;

  const district = districts.find(d => d.id === account.districtId)!;
  const course = account.enrolledCourseId ? courses.find(c => c.id === account.enrolledCourseId) : null;
  const syllabus = course ? getSyllabus(course.id) : null;

  const gaps = computeGapForDistrict(account.districtId);
  const topGaps = gaps.filter(g => g.gap > 0 && g.trend === 'rising').slice(0, 3);

  // Dying tasks that touch the trade this candidate is enrolled in.
  const myDyingTasks = course
    ? dyingTasks.filter(t => course.skillIds.includes(t.skillId))
    : [];

  const localPools = hiringPools.filter(p => p.districtId === account.districtId && p.status !== 'placed');
  const rpl = rplStats(account.districtId);
  const years = account.yearsInformalWork ?? 0;

  // Progress through the course, if enrolled.
  const modulesDone = syllabus ? Math.min(syllabus.modules.length, 4) : 0;

  // Plain-language next actions, ranked. This is the first thing a candidate
  // who is not comfortable with the portal's vocabulary should see.
  const profile = {
    districtId: account.districtId,
    currentNsqfLevel: account.currentNsqfLevel ?? 3,
    yearsInformalWork: years,
    qualification: account.qualification ?? '',
    enrolledCourseId: account.enrolledCourseId ?? null,
  };
  const steps = nextSteps(profile, heldSkillsFor(profile.enrolledCourseId));
  const topPick = recommendCourses(profile, 1)[0];

  return (
    <>
      <PageHeader
        eyebrow={`Candidate · ${account.ksid}`}
        title={`नमस्कार, ${account.name.split(' ')[0]}`}
        description={<>Your services in <strong>{district.name}</strong> district.</>}
      />

      <PageGuide />

      {/* ---- Plain-language guidance, before any jargon ---- */}
      <section data-guide="next-steps" className="mb-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-[20px] font-bold text-[var(--gov-navy)]">
            What should I do next?
          </h2>
          <p className="text-[14px] text-[var(--ink-tertiary)]">
            पुढे काय करावे · आगे क्या करें
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 ks-stagger">
          {steps.map((s, i) => (
            <div key={s.title} style={{ ['--i' as string]: i }}>
              <BigAction step={i + 1} title={s.title} plain={s.plain}
                cta={s.cta} href={s.href} urgency={s.urgency} />
            </div>
          ))}
        </div>

        {topPick && (
          <div data-guide="best-match" className="gov-card p-5 mt-4 flex flex-wrap items-center justify-between gap-4 ks-rise"
            style={{ borderLeft: '5px solid var(--signal-rising)' }}>
            <div className="min-w-0">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.07em] text-[var(--signal-rising)] mb-1">
                Your best match right now
              </p>
              <p className="text-[18px] font-bold text-[var(--ink)] leading-snug">
                {topPick.course.name}
              </p>
              <p className="text-[14.5px] text-[var(--ink-secondary)] leading-relaxed mt-1.5 max-w-2xl">
                {topPick.reasons[0]?.detail}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-[32px] font-bold mono text-[var(--signal-rising)] leading-none">
                  {topPick.score}
                  <span className="text-[15px] font-normal text-[var(--ink-tertiary)]">/100</span>
                </p>
                <p className="text-[12.5px] text-[var(--ink-tertiary)] mt-1">match score</p>
              </div>
              <Link href="/dashboard/student/recommend"
                className="text-white font-bold text-[15px] px-5 py-3 rounded-sm focus-ring"
                style={{ background: 'var(--signal-rising)' }}>
                See all my matches →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ---- Action items: what this candidate should do next ---- */}
      <div data-guide="stats" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 ks-stagger">
        <Stat label="Your skill level" value={`Level ${account.currentNsqfLevel ?? 3}`}
          sub={course ? `Enrolled in ${course.type}` : 'Not enrolled in a course yet'} accent="var(--accent-student)" />
        <Stat label="Years you have worked" value={`${years} yr`}
          sub={years >= 2 ? 'You can get a certificate without a full course' : 'Two years of work unlocks a certificate'}
          tone={years >= 2 ? 'positive' : 'neutral'} accent="var(--accent-student)" />
        <Stat label="Growing trades near you" value={topGaps.length}
          sub={`${gaps.filter(g => g.trend === 'declining').length} trades with fewer jobs`}
          tone="positive" accent="var(--accent-student)" />
        <Stat label="Employers hiring" value={localPools.length}
          sub={`${localPools.reduce((a, p) => a + poolSeatsCommitted(p), 0)} seats they have promised`}
          tone="positive" accent="var(--accent-student)" />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
        <div className="space-y-5">
          {/* ---- Enrolment / next step ---- */}
          {course && syllabus ? (
            <Card
              title="Your current enrolment"
              subtitle={`${course.name} · ${course.type} · ${course.durationMonths} months · ${syllabus.totalHours} hours`}
              action={<Link href="/dashboard/student/syllabus" className="text-[12px] gov-link font-semibold">Open syllabus →</Link>}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="student">NSQF Level {syllabus.nsqfLevel}</Badge>
                <Badge variant="default">Syllabus {syllabus.version}</Badge>
                {course.scheme && <Badge variant="officer">{course.scheme}</Badge>}
                <Badge variant="default">{syllabus.modules.length} modules</Badge>
              </div>

              <Progress
                value={modulesDone} max={syllabus.modules.length}
                color="var(--accent-student)" height={10}
                label={`Modules finished: ${modulesDone} of ${syllabus.modules.length}`} showValue
              />

              {myDyingTasks.length > 0 && (
                <div className="mt-4">
                  <Note tone="warn" title="Part of your syllabus is teaching work that is disappearing">
                    <p className="mb-2">
                      Your whole trade is not dying. {myDyingTasks.length} task
                      {myDyingTasks.length > 1 ? 's' : ''} inside it {myDyingTasks.length > 1 ? 'are' : 'is'}.
                    </p>
                    <ul className="space-y-1.5 mt-2">
                      {myDyingTasks.map(t => (
                        <li key={t.id} className="flex flex-wrap items-baseline gap-x-2 text-[12px]">
                          <span className="font-semibold text-[var(--ink)]">{t.taskName}</span>
                          <span className="mono text-[var(--signal-declining)] font-bold">{t.hoursChangeYoY}% this year</span>
                          <span className="text-[var(--ink-tertiary)]">
                            still in modules {t.syllabusModulesStillTeaching.join(', ')}; replaced by {t.displacedBy}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/dashboard/student/pathways" className="gov-link font-semibold text-[12px] inline-block mt-2">
                      See the short course that covers this →
                    </Link>
                  </Note>
                </div>
              )}
            </Card>
          ) : (
            <Card title="You are not enrolled in a course yet" subtitle="Check jobs before you choose">
              <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed mb-4">
                Three trades in {district.name} have more real vacancies than training seats.
                Joining one of these means an employer has already said they will hire.
              </p>
              <ul className="space-y-2">
                {topGaps.map(g => (
                  <li key={g.skillId} className="flex items-center justify-between gap-3 border border-[var(--border)] rounded-sm px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-[var(--ink)]">{g.skillName}</p>
                      <p className="text-[11.5px] text-[var(--ink-tertiary)]">
                        {g.annualDemand.toLocaleString('en-IN')} real vacancies a year ·{' '}
                        {g.currentSupply.toLocaleString('en-IN')} training seats
                      </p>
                    </div>
                    <Badge variant="rising" dot>{g.gap.toLocaleString('en-IN')} short</Badge>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 mt-4">
                <Link href="/dashboard/student/demand"
                  className="text-[13px] font-bold text-white px-4 py-2 rounded-sm focus-ring"
                  style={{ background: 'var(--accent-student)' }}>
                  Check jobs in my district →
                </Link>
                <Link href="/courses"
                  className="text-[13px] font-semibold px-4 py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                  Browse course catalogue
                </Link>
              </div>
            </Card>
          )}

          {/* ---- Feature list for this role ---- */}
          <Card title="Your services" subtitle="Everything you can do from this account">
            <div className="grid sm:grid-cols-2 gap-2.5">
              {CITIZEN_NAV.student.filter(n => n.pillarId).map(item => {
                const pillar = PILLARS.find(p => p.id === item.pillarId)!;
                return (
                  <Link key={item.href} href={item.href}
                    className="border border-[var(--border)] rounded-sm p-3.5 hover:border-[var(--accent-student)] hover:shadow-sm transition-all group focus-ring">
                    <div className="flex items-start gap-2.5">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="1.7"
                        strokeLinecap="round" strokeLinejoin="round"
                        className="shrink-0 mt-0.5 text-[var(--accent-student)]" stroke="currentColor">
                        <path d={NAV_ICONS[item.icon]} />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[var(--ink)] group-hover:text-[var(--accent-student)] transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[11.5px] text-[var(--ink-secondary)] mt-1 leading-snug">{item.description}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mt-1.5">
                          {pillar.plain}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* ---- RPL prompt ---- */}
          <Card title="Certificate for work you already do">
            {years >= 2 ? (
              <>
                <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
                  You declared <strong>{years} years</strong> of work without a certificate. We test what
                  you can already do and ask you to study only the missing bits. You do not repeat a
                  full course.
                </p>
                <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-[var(--border)]">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wide font-bold text-[var(--ink-tertiary)]">Avg wage uplift</p>
                    <p className="text-[19px] font-bold mono text-[var(--signal-rising)]">
                      +{formatCurrency(rpl.avgMonthlyUplift)}
                    </p>
                    <p className="text-[10.5px] text-[var(--ink-tertiary)]">per month, after certification</p>
                  </div>
                  <div>
                    <p className="text-[10.5px] uppercase tracking-wide font-bold text-[var(--ink-tertiary)]">Hours you still study</p>
                    <p className="text-[19px] font-bold mono text-[var(--ink)]">{rpl.avgBridgeHours} h</p>
                    <p className="text-[10.5px] text-[var(--ink-tertiary)]">instead of 2,400 hours</p>
                  </div>
                </div>
                <Link href="/dashboard/student/pathways"
                  className="block text-center text-[13px] font-bold text-white py-2.5 rounded-sm focus-ring"
                  style={{ background: 'var(--accent-student)' }}>
                  Apply for my certificate →
                </Link>
              </>
            ) : (
              <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
                RPL needs at least two years of work you can show. If you have been working
                without a certificate, update your profile. {rpl.certified} people in {district.name} got
                papers this year.
              </p>
            )}
          </Card>

          {/* ---- Work trial explainer ---- */}
          <Card title="How you get hired here">
            <ol className="space-y-3">
              {[
                ['Employers promise first', 'They name a wage and sign before training starts.'],
                ['You train against that promise', 'A named employer already agreed to take people from your batch.'],
                ['You work a paid trial', '10 to 14 days on their floor. ₹380 to ₹420 a day from the State.'],
                ['The trial decides the job', 'Pass mark 70. Safety, tools, speed, and how you work with people.'],
                ['Your pay confirms it', 'Counted only when your salary record shows you were paid.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 grid place-items-center rounded-full text-[10.5px] font-bold text-white mt-0.5"
                    style={{ background: 'var(--accent-student)' }}>{i + 1}</span>
                  <span>
                    <span className="block text-[12.5px] font-bold text-[var(--ink)]">{t}</span>
                    <span className="block text-[11.5px] text-[var(--ink-secondary)] leading-snug mt-0.5">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/dashboard/student/jobs" className="text-[12.5px] gov-link font-semibold mt-4 inline-block">
              View openings and my trials →
            </Link>
          </Card>

          {/* ---- Voice access ---- */}
          <Card title="Prefer to speak?">
            <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed">
              Ask anything on this portal by speaking, in Marathi, Hindi, English or Urdu.
              Call from any phone, or use the microphone here. You do not need to type.
            </p>
            <p className="mt-3 text-[15px] font-bold mono text-[var(--gov-navy)]">1800-233-0202</p>
            <Link href="/dashboard/student/assist" className="text-[12.5px] gov-link font-semibold mt-2 inline-block">
              Open speak-to-us →
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
