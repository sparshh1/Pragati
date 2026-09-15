'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { HelpTip, GLOSSARY } from '@/components/ui/Plain';
import {
  recommendCourses, recommendJobs, heldSkillsFor, CandidateProfile, CourseRecommendation,
} from '@/data/recommend';
import { districts } from '@/data/districts';
import { getSyllabus } from '@/data/syllabus';
import { SECTOR_LABELS, Sector } from '@/types';
import { formatCurrency } from '@/lib/utils';

const BAND_STYLE = {
  strong: { label: 'Strong match', tone: 'rising' as const, colour: 'var(--signal-rising)' },
  good: { label: 'Good match', tone: 'officer' as const, colour: 'var(--gov-navy)' },
  possible: { label: 'Worth considering', tone: 'warn' as const, colour: 'var(--signal-warn)' },
  weak: { label: 'Not recommended', tone: 'declining' as const, colour: 'var(--signal-declining)' },
};

export default function RecommendPage() {
  const { account } = useCitizen();

  const [wage, setWage] = useState(0);
  const [relocate, setRelocate] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [openReasons, setOpenReasons] = useState<string | null>(null);

  const profile: CandidateProfile | null = useMemo(() => {
    if (!account) return null;
    return {
      districtId: account.districtId,
      currentNsqfLevel: account.currentNsqfLevel ?? 3,
      yearsInformalWork: account.yearsInformalWork ?? 0,
      qualification: account.qualification ?? '',
      enrolledCourseId: account.enrolledCourseId ?? null,
      preferredSectors: sectors.length ? sectors : undefined,
      currentMonthlyWage: wage,
      willingToRelocate: relocate,
    };
  }, [account, wage, relocate, sectors]);

  const recs = useMemo(() => (profile ? recommendCourses(profile, 8) : []), [profile]);
  const jobs = useMemo(
    () => (profile ? recommendJobs(profile, heldSkillsFor(profile.enrolledCourseId), 4) : []),
    [profile],
  );

  if (!account || !profile) return null;
  const district = districts.find(d => d.id === account.districtId)!;
  const strong = recs.filter(r => r.band === 'strong').length;

  return (
    <>
      <PageHeader
        eyebrow="Recommended for you"
        title="Which course should I do?"
        description="Every course you could join, scored for you."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Recommended for you' }]}
      />

      <PageGuide />

      {/* ---- Tell us a bit more ---- */}
      <Card
        title="Tell us a little more: the list updates as you do"
        subtitle="All optional"
        className="mb-6"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="gov-label" htmlFor="cur-wage">
              What do you earn now, per month?
            </label>
            <input
              id="cur-wage" type="number" min={0} step={500} className="gov-input mono"
              value={wage} onChange={e => setWage(Math.max(0, Number(e.target.value)))}
              placeholder="0 if you are not earning"
            />
            <p className="text-[13px] text-[var(--ink-tertiary)] mt-1.5">
              Used to work out how much more each course would pay you.
            </p>
          </div>

          <div>
            <span className="gov-label">Can you travel to another district?</span>
            <div className="flex gap-2">
              {[['No, near home only', false], ['Yes, I can move', true]].map(([label, val]) => (
                <button
                  key={String(val)}
                  onClick={() => setRelocate(val as boolean)}
                  className={`flex-1 text-[14px] font-semibold py-2.5 border rounded-sm transition-colors focus-ring ${
                    relocate === val
                      ? 'bg-[var(--accent-student)] text-white border-[var(--accent-student)]'
                      : 'border-[var(--border-strong)] hover:bg-[var(--surface-alt)]'
                  }`}
                >
                  {label as string}
                </button>
              ))}
            </div>
            <p className="text-[13px] text-[var(--ink-tertiary)] mt-1.5">
              {relocate
                ? `Showing courses from all ${districts.length} districts.`
                : `Showing ${district.name} courses only.`}
            </p>
          </div>

          <div>
            <span className="gov-label">Any field you prefer?</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(SECTOR_LABELS) as Sector[]).map(s => (
                <button
                  key={s}
                  onClick={() =>
                    setSectors(x => (x.includes(s) ? x.filter(y => y !== s) : [...x, s]))
                  }
                  className={`text-[13px] font-semibold px-3 py-2 border rounded-sm transition-colors focus-ring ${
                    sectors.includes(s)
                      ? 'bg-[var(--accent-student)] text-white border-[var(--accent-student)]'
                      : 'border-[var(--border-strong)] hover:bg-[var(--surface-alt)]'
                  }`}
                >
                  {SECTOR_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Courses scored for you" value={recs.length}
          sub={relocate ? 'Across all districts' : `In ${district.name}`} accent="var(--accent-student)" />
        <Stat label="Strong matches" value={strong}
          sub={strong ? 'Employers hiring, seats open' : 'Try allowing travel'}
          tone={strong ? 'positive' : 'warn'} accent="var(--accent-student)" />
        <Stat label="Best pay in this list"
          value={recs.length ? formatCurrency(Math.max(...recs.map(r => r.entryWage))) : '-'}
          sub="Starting pay, per month" tone="positive" accent="var(--accent-student)" />
        <Stat label="Jobs matched to you" value={jobs.filter(j => j.matchPercent >= 50).length}
          sub={`of ${jobs.length} open hiring pools`} tone="positive" accent="var(--accent-student)" />
      </div>

      {/* ---- Course recommendations ---- */}
      <h2 className="text-[20px] font-bold text-[var(--gov-navy)] gov-rule mb-5">
        Courses ranked for you
      </h2>

      <div className="space-y-4 mb-8">
        {recs.map((r, i) => (
          <RecCard
            key={r.course.id}
            rec={r}
            rank={i + 1}
            open={openReasons === r.course.id}
            onToggle={() => setOpenReasons(o => (o === r.course.id ? null : r.course.id))}
          />
        ))}
        {recs.length === 0 && (
          <Card>
            <p className="text-[15px] text-[var(--ink-secondary)]">
              No courses to score yet. Try allowing travel to another district.
            </p>
          </Card>
        )}
      </div>

      {/* ---- Job matches ---- */}
      <h2 className="text-[20px] font-bold text-[var(--gov-navy)] gov-rule mb-5">
        Jobs matched to you
      </h2>

      <div className="grid lg:grid-cols-2 gap-4">
        {jobs.map(j => (
          <Card
            key={j.poolId}
            title={j.poolName}
            subtitle={`${j.skillName} · ${j.districtName} · ${j.employers} employer(s) signed`}
            action={
              <Badge variant={j.matchPercent >= 70 ? 'rising' : j.matchPercent >= 45 ? 'warn' : 'stable'} dot>
                {j.matchPercent}% match
              </Badge>
            }
          >
            <Progress
              value={j.matchPercent}
              color={j.matchPercent >= 70 ? 'var(--signal-rising)' : j.matchPercent >= 45 ? 'var(--signal-warn)' : 'var(--signal-stable)'}
              height={10}
              label="How well you fit this opening"
              showValue
            />

            <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-[var(--border)]">
              <div>
                <p className="text-[12px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">
                  Minimum pay
                </p>
                <p className="text-[20px] font-bold mono text-[var(--signal-rising)]">
                  {formatCurrency(j.wageFloor)}
                </p>
                <p className="text-[12px] text-[var(--ink-tertiary)]">per month, guaranteed in writing</p>
              </div>
              <div>
                <p className="text-[12px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">
                  Places open
                </p>
                <p className="text-[20px] font-bold mono">{j.seatsOpen}</p>
                <p className="text-[12px] text-[var(--ink-tertiary)]">{j.status.replace('-', ' ')}</p>
              </div>
            </div>

            {j.matchReasons.length > 0 && (
              <div className="mb-3">
                <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                  Why you fit
                </p>
                <ul className="space-y-1.5">
                  {j.matchReasons.map(m => (
                    <li key={m} className="flex gap-2 text-[14px] text-[var(--ink-secondary)]">
                      <span className="text-[var(--signal-rising)] font-bold shrink-0">✓</span>{m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {j.gaps.length > 0 && (
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                  What is missing
                </p>
                <ul className="space-y-1.5">
                  {j.gaps.map(g => (
                    <li key={g} className="flex gap-2 text-[14px] text-[var(--ink-secondary)]">
                      <span className="text-[var(--signal-warn)] font-bold shrink-0">!</span>{g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              href="/dashboard/student/jobs"
              className="block text-center text-white font-bold text-[15px] py-3 rounded-sm mt-4 focus-ring"
              style={{ background: 'var(--accent-student)' }}
            >
              See this opening →
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}

function RecCard({
  rec, rank, open, onToggle,
}: {
  rec: CourseRecommendation; rank: number; open: boolean; onToggle: () => void;
}) {
  const style = BAND_STYLE[rec.band];
  const syl = getSyllabus(rec.course.id);
  const district = districts.find(d => d.id === rec.course.districtId)!;

  return (
    <article className="gov-card overflow-hidden" style={{ borderLeft: `5px solid ${style.colour}` }}>
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <span
              className="w-10 h-10 shrink-0 grid place-items-center rounded-full text-white text-[17px] font-bold mono"
              style={{ background: style.colour }}
            >
              {rank}
            </span>
            <div className="min-w-0">
              <h3 className="text-[18px] font-bold text-[var(--ink)] leading-snug">
                {rec.course.name}
              </h3>
              <p className="text-[13.5px] text-[var(--ink-tertiary)] mt-1">
                {district.name} · {rec.course.type} · {rec.course.durationMonths} months ·{' '}
                <HelpTip term={`NSQF Level ${syl.nsqfLevel}`} {...pick(GLOSSARY.nsqf)} />
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <Badge variant={style.tone} dot>{style.label}</Badge>
            <p className="text-[26px] font-bold mono mt-1.5" style={{ color: style.colour }}>
              {rec.score}
              <span className="text-[14px] font-normal text-[var(--ink-tertiary)]">/100</span>
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 py-3.5 border-y border-[var(--border)]">
          <Figure label="Starting pay" value={formatCurrency(rec.entryWage)} note="per month" />
          <Figure
            label="Hiring demand"
            value={`${rec.demandYoY >= 0 ? '+' : ''}${rec.demandYoY}%`}
            note="change this year"
            tone={rec.demandYoY > 0 ? 'good' : rec.demandYoY < -10 ? 'bad' : undefined}
          />
          <Figure
            label="Employers signed up"
            value={rec.employerCommittedSeats ? `${rec.employerCommittedSeats} seats` : 'None yet'}
            note="promised in writing"
            tone={rec.employerCommittedSeats ? 'good' : 'bad'}
          />
          <Figure
            label="Seats left"
            value={String(rec.seatsVacant)}
            note={`of ${rec.course.currentSeats}`}
            tone={rec.seatsVacant > 0 ? undefined : 'bad'}
          />
        </div>

        {/* The two or three reasons that mattered most, always visible. */}
        <ul className="mt-3.5 space-y-2">
          {rec.reasons.slice(0, 3).map(r => (
            <li key={r.label} className="flex gap-2.5">
              <span
                className="shrink-0 font-bold text-[16px] leading-tight"
                style={{ color: r.positive ? 'var(--signal-rising)' : 'var(--signal-declining)' }}
              >
                {r.positive ? '✓' : '✕'}
              </span>
              <span className="text-[14.5px] text-[var(--ink-secondary)] leading-relaxed">
                <strong className="text-[var(--ink)]">{r.label}.</strong> {r.detail}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-[var(--border)]">
          <Link
            href={`/courses?id=${rec.course.id}`}
            className="text-white font-bold text-[15px] px-5 py-2.5 rounded-sm focus-ring"
            style={{ background: 'var(--accent-student)' }}
          >
            See this course →
          </Link>
          <button
            onClick={onToggle}
            aria-expanded={open}
            className="font-semibold text-[14px] px-4 py-2.5 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring"
          >
            {open ? 'Hide full scoring' : `Why score ${rec.score}? Show all ${rec.reasons.length} reasons`}
          </button>
          {rec.rplEligible && (
            <span className="text-[13.5px] text-[var(--signal-rising)] font-semibold">
              Your experience can shorten this
            </span>
          )}
        </div>

        {open && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2.5">
              Full scoring: every point, added and subtracted
            </p>
            <ul className="space-y-2.5">
              {rec.reasons.map(r => (
                <li
                  key={r.label}
                  className="flex items-start justify-between gap-4 border border-[var(--border)] rounded-sm px-3.5 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block text-[14.5px] font-bold text-[var(--ink)]">{r.label}</span>
                    <span className="block text-[14px] text-[var(--ink-secondary)] leading-relaxed mt-0.5">
                      {r.detail}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-[16px] font-bold mono"
                    style={{ color: r.points >= 0 ? 'var(--signal-rising)' : 'var(--signal-declining)' }}
                  >
                    {r.points >= 0 ? '+' : ''}{r.points}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

function Figure({
  label, value, note, tone,
}: {
  label: string; value: string; note: string; tone?: 'good' | 'bad';
}) {
  return (
    <div>
      <p className="text-[12px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">{label}</p>
      <p
        className="text-[19px] font-bold mono leading-tight mt-0.5"
        style={{
          color: tone === 'good' ? 'var(--signal-rising)' : tone === 'bad' ? 'var(--signal-declining)' : 'var(--ink)',
        }}
      >
        {value}
      </p>
      <p className="text-[12px] text-[var(--ink-tertiary)]">{note}</p>
    </div>
  );
}

function pick(g: { term: string; plain: string; marathi: string; hindi: string }) {
  return { plain: g.plain, marathi: g.marathi, hindi: g.hindi };
}
