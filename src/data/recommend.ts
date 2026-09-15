import { courses } from './courses';
import { getSkill, skills } from './skills';
import { getSyllabus } from './syllabus';
import { hiringPools, poolSeatsCommitted, poolWageFloor } from './hiring';
import { tradeShifts } from './tradeShifts';
import { districts } from './districts';
import { computeDemandTrend } from './compute/demandTrend';
import { computeGapForDistrict } from './compute/gapAnalysis';
import { Course, Sector } from '@/types';

/* ------------------------------------------------------------------ */
/*  Recommendation engine                                              */
/*                                                                     */
/*  Deliberately NOT a black box. Every recommendation carries the      */
/*  list of reasons that produced it, each with the points it           */
/*  contributed, so a candidate - or an officer auditing the portal -   */
/*  can see exactly why a course was put in front of them. A ranking    */
/*  nobody can explain is a ranking nobody should trust.                */
/* ------------------------------------------------------------------ */

export interface CandidateProfile {
  districtId: string;
  currentNsqfLevel: number;
  yearsInformalWork: number;
  qualification: string;
  enrolledCourseId: string | null;
  /** Optional steer from the candidate; absent means "show me anything". */
  preferredSectors?: Sector[];
  /** Monthly earnings today, used to compute uplift. 0 if not earning. */
  currentMonthlyWage?: number;
  /** Willing to travel to another district for the right course. */
  willingToRelocate?: boolean;
}

export interface Reason {
  label: string;
  detail: string;
  points: number;
  /** false = this reason counted against the course */
  positive: boolean;
}

export interface CourseRecommendation {
  course: Course;
  score: number;
  band: 'strong' | 'good' | 'possible' | 'weak';
  reasons: Reason[];
  entryWage: number;
  wageUplift: number;
  demandYoY: number;
  seatsVacant: number;
  employerCommittedSeats: number;
  monthsToQualify: number;
  rplEligible: boolean;
}

const MAX_SCORE = 100;

function band(score: number): CourseRecommendation['band'] {
  if (score >= 72) return 'strong';
  if (score >= 55) return 'good';
  if (score >= 38) return 'possible';
  return 'weak';
}

/**
 * Score one course against one candidate.
 *
 * The weights below are the policy, stated in the open: demand and signed
 * employer commitment together carry half the score, because a course with
 * neither is exactly what this portal exists to stop people from enrolling in.
 */
export function scoreCourse(course: Course, profile: CandidateProfile): CourseRecommendation {
  const reasons: Reason[] = [];
  const syllabus = getSyllabus(course.id);
  const primarySkillId = course.skillIds[0];
  const primarySkill = primarySkillId ? getSkill(primarySkillId) : undefined;
  const trend = primarySkillId ? computeDemandTrend(primarySkillId, course.districtId) : null;
  const demandYoY = trend?.yoyChangePercent ?? 0;

  const entryWage = Math.max(0, ...course.skillIds.map(s => getSkill(s)?.salaryRange[0] ?? 0));
  const ceilingWage = Math.max(0, ...course.skillIds.map(s => getSkill(s)?.salaryRange[1] ?? 0));
  const currentWage = profile.currentMonthlyWage ?? 0;
  const wageUplift = entryWage - currentWage;

  const seatsVacant = Math.max(0, course.currentSeats - course.enrolled);

  const pools = hiringPools.filter(
    p => p.districtId === course.districtId
      && course.skillIds.includes(p.skillId)
      && p.status !== 'placed',
  );
  const employerCommittedSeats = pools.reduce((a, p) => a + poolSeatsCommitted(p), 0);

  /* ---- 1. Verified demand (30) ---------------------------------- */
  if (demandYoY >= 25) {
    reasons.push({
      label: 'Demand is growing fast',
      detail: `Vacancies up ${demandYoY}% this year in ${districtName(course.districtId)}.`,
      points: 30, positive: true,
    });
  } else if (demandYoY >= 8) {
    reasons.push({
      label: 'Demand is growing',
      detail: `Vacancies up ${demandYoY}% this year.`,
      points: 20, positive: true,
    });
  } else if (demandYoY <= -15) {
    reasons.push({
      label: 'Demand is shrinking',
      detail: `Down ${Math.abs(demandYoY)}% this year here. A trade-shift track may suit you better.`,
      points: -25, positive: false,
    });
  } else {
    reasons.push({
      label: 'Demand is steady',
      detail: `${demandYoY >= 0 ? '+' : ''}${demandYoY}% this year. Work available, slow wage growth.`,
      points: 8, positive: true,
    });
  }

  /* ---- 2. Signed employer commitment (20) ----------------------- */
  if (employerCommittedSeats > 0) {
    reasons.push({
      label: 'Employers have already committed to hire',
      detail: `${pools.reduce((a, p) => a + p.members.length, 0)} employer(s) signed for ${employerCommittedSeats} seats at ${inr(Math.min(...pools.map(poolWageFloor)))}+.`,
      points: 20, positive: true,
    });
  } else {
    reasons.push({
      label: 'No hiring pool behind this course yet',
      detail: 'No signed commitment here this cycle. Open market only.',
      points: -6, positive: false,
    });
  }

  /* ---- 3. Wage effect (15) -------------------------------------- */
  if (currentWage > 0 && wageUplift > 0) {
    reasons.push({
      label: 'Higher pay than you earn now',
      detail: `${inr(entryWage)} to start, ${inr(wageUplift)} more than now, up to ${inr(ceilingWage)} later.`,
      points: Math.min(15, Math.round((wageUplift / Math.max(currentWage, 1)) * 30)), positive: true,
    });
  } else if (currentWage > 0 && wageUplift <= 0) {
    reasons.push({
      label: 'No pay rise at entry',
      detail: `${inr(entryWage)} is at or below what you earn now.`,
      points: -10, positive: false,
    });
  } else {
    reasons.push({
      label: 'Pay band',
      detail: `${inr(entryWage)}–${inr(ceilingWage)} a month at Level ${syllabus.nsqfLevel}.`,
      points: Math.min(15, Math.round(entryWage / 2200)), positive: true,
    });
  }

  /* ---- 4. Can you actually get a seat (10) ---------------------- */
  if (seatsVacant >= 10) {
    reasons.push({
      label: 'Seats are available',
      detail: `${seatsVacant} of ${course.currentSeats} seats vacant.`,
      points: 10, positive: true,
    });
  } else if (seatsVacant > 0) {
    reasons.push({
      label: 'Few seats left',
      detail: `Only ${seatsVacant} left. Apply early.`,
      points: 5, positive: true,
    });
  } else {
    reasons.push({
      label: 'Currently full',
      detail: 'Full. You would apply for the next intake.',
      points: -8, positive: false,
    });
  }

  /* ---- 5. Level fit (10) ---------------------------------------- */
  const step = syllabus.nsqfLevel - profile.currentNsqfLevel;
  if (step === 1) {
    reasons.push({
      label: 'The right next step for you',
      detail: `Level ${profile.currentNsqfLevel} → ${syllabus.nsqfLevel}. One clean step up.`,
      points: 10, positive: true,
    });
  } else if (step === 2) {
    reasons.push({
      label: 'A stretch, but reachable',
      detail: `Level ${profile.currentNsqfLevel} → ${syllabus.nsqfLevel}. Demanding, but reachable.`,
      points: 5, positive: true,
    });
  } else if (step <= 0) {
    reasons.push({
      label: 'Not a step up',
      detail: `Finishes at Level ${syllabus.nsqfLevel}, which is not above your Level ${profile.currentNsqfLevel}.`,
      points: -12, positive: false,
    });
  } else {
    reasons.push({
      label: 'A long way above your current level',
      detail: `A ${step}-level jump. Take something in between first.`,
      points: -5, positive: false,
    });
  }

  /* ---- 6. Prior learning credit (10) ---------------------------- */
  const rplEligible = profile.yearsInformalWork >= 2;
  if (rplEligible) {
    reasons.push({
      label: 'Your experience can shorten this',
      detail: `${profile.yearsInformalWork} years of work can count. Most of the ${syllabus.totalHours.toLocaleString('en-IN')} hours can be credited.`,
      points: 10, positive: true,
    });
  }

  /* ---- 7. Content freshness (−8) -------------------------------- */
  const stale = syllabus.modules.filter(m => m.decayFlag).length;
  if (stale > 0) {
    reasons.push({
      label: 'Some content is out of date',
      detail: `${stale} module(s) teach tasks that are disappearing.`,
      points: -Math.min(8, stale * 4), positive: false,
    });
  }

  /* ---- 8. Travel (−10) ------------------------------------------ */
  if (course.districtId !== profile.districtId) {
    const penalty = profile.willingToRelocate ? -3 : -10;
    reasons.push({
      label: 'Outside your district',
      detail: `Runs in ${districtName(course.districtId)}, not ${districtName(profile.districtId)}.`,
      points: penalty, positive: false,
    });
  }

  /* ---- 9. Sector preference (8) --------------------------------- */
  if (profile.preferredSectors?.length && primarySkill) {
    if (profile.preferredSectors.includes(primarySkill.sector)) {
      reasons.push({
        label: 'Matches the field you asked for',
        detail: 'In a field you said you prefer.',
        points: 8, positive: true,
      });
    }
  }

  /* ---- 10. Hands-on share (7) ----------------------------------- */
  const practicalHours = syllabus.modules
    .filter(m => m.type === 'practical' || m.type === 'ojt')
    .reduce((a, m) => a + m.hours, 0);
  const practicalShare = syllabus.totalHours ? practicalHours / syllabus.totalHours : 0;
  if (practicalShare >= 0.6) {
    reasons.push({
      label: 'Mostly hands-on',
      detail: `${Math.round(practicalShare * 100)}% bench and on-the-job work.`,
      points: 7, positive: true,
    });
  }

  const raw = reasons.reduce((a, r) => a + r.points, 0);
  // Normalise into 0–100 against the achievable maximum.
  const score = Math.max(0, Math.min(MAX_SCORE, Math.round((raw / 110) * 100)));

  return {
    course, score, band: band(score),
    reasons: reasons.sort((a, b) => Math.abs(b.points) - Math.abs(a.points)),
    entryWage, wageUplift, demandYoY, seatsVacant, employerCommittedSeats,
    monthsToQualify: course.durationMonths,
    rplEligible,
  };
}

/** Ranked course recommendations for one candidate. */
export function recommendCourses(profile: CandidateProfile, limit = 6): CourseRecommendation[] {
  const pool = profile.willingToRelocate
    ? courses
    : courses.filter(c => c.districtId === profile.districtId);

  // Never recommend the course the candidate is already enrolled in.
  const candidates = pool.filter(c => c.id !== profile.enrolledCourseId);

  return candidates
    .map(c => scoreCourse(c, profile))
    .sort((a, b) => b.score - a.score || a.course.name.localeCompare(b.course.name))
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/*  Job matching - open pools ranked against a candidate               */
/* ------------------------------------------------------------------ */

export interface JobRecommendation {
  poolId: string;
  poolName: string;
  skillName: string;
  districtName: string;
  wageFloor: number;
  seatsOpen: number;
  employers: number;
  status: string;
  matchPercent: number;
  matchReasons: string[];
  gaps: string[];
}

export function recommendJobs(
  profile: CandidateProfile,
  heldSkillIds: string[],
  limit = 5,
): JobRecommendation[] {
  return hiringPools
    .filter(p => p.status !== 'placed')
    .map(p => {
      const skill = getSkill(p.skillId);
      const matchReasons: string[] = [];
      const gaps: string[] = [];
      let match = 0;

      if (heldSkillIds.includes(p.skillId)) {
        match += 45;
        matchReasons.push(`You are trained in ${skill?.name}`);
      } else {
        const shift = tradeShifts.find(
          t => t.toSkillId === p.skillId && heldSkillIds.includes(t.fromSkillId),
        );
        if (shift) {
          match += 28;
          matchReasons.push(`A ${shift.bridgeDurationWeeks}-week bridge module connects your trade to this one`);
          gaps.push(shift.bridgeModuleName);
        } else {
          gaps.push(`You are not yet trained in ${skill?.name}`);
        }
      }

      if (p.districtId === profile.districtId) {
        match += 25;
        matchReasons.push('In your own district');
      } else if (profile.willingToRelocate) {
        match += 10;
        matchReasons.push(`In ${districtName(p.districtId)}. You said you can travel.`);
      } else {
        gaps.push(`Runs in ${districtName(p.districtId)}, outside your district`);
      }

      const levelOk = (skill?.nsqfLevel ?? 4) <= profile.currentNsqfLevel + 1;
      if (levelOk) {
        match += 15;
        matchReasons.push(`Level ${skill?.nsqfLevel} is within reach of your Level ${profile.currentNsqfLevel}`);
      } else {
        gaps.push(`Requires NSQF Level ${skill?.nsqfLevel}; you are at Level ${profile.currentNsqfLevel}`);
      }

      const seatsOpen = Math.max(0, p.seatsRequired - p.candidatesEnrolled);
      if (seatsOpen > 0) {
        match += 15;
        matchReasons.push(`${seatsOpen} place(s) still open in this batch`);
      } else {
        gaps.push('This batch is full. You would join the next one');
      }

      return {
        poolId: p.id,
        poolName: p.name,
        skillName: skill?.name ?? p.skillId,
        districtName: districtName(p.districtId),
        wageFloor: poolWageFloor(p),
        seatsOpen,
        employers: p.members.length,
        status: p.status,
        matchPercent: Math.min(100, match),
        matchReasons,
        gaps,
      };
    })
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/*  "What should I do next?" - a single prioritised action              */
/* ------------------------------------------------------------------ */

export interface NextStep {
  title: string;
  plain: string;
  href: string;
  cta: string;
  urgency: 'high' | 'medium' | 'low';
}

export function nextSteps(profile: CandidateProfile, heldSkillIds: string[]): NextStep[] {
  const steps: NextStep[] = [];

  if (profile.yearsInformalWork >= 2) {
    steps.push({
      title: 'Get certified for work you already do',
      plain: `You have worked ${profile.yearsInformalWork} years without a certificate. You can get official papers for that without doing a full course again.`,
      href: '/dashboard/student/pathways',
      cta: 'Check what you would get',
      urgency: 'high',
    });
  }

  if (!profile.enrolledCourseId) {
    steps.push({
      title: 'Find a course that leads to a real job',
      plain: 'Every course near you, ranked by whether employers are actually hiring. Look at the top three.',
      href: '/dashboard/student/recommend',
      cta: 'See my matches',
      urgency: 'high',
    });
  } else {
    const enrolled = courses.find(c => c.id === profile.enrolledCourseId);
    const stale = enrolled ? getSyllabus(enrolled.id).modules.filter(m => m.decayFlag).length : 0;
    if (stale > 0) {
      steps.push({
        title: 'Part of your course is out of date',
        plain: `${stale} topic(s) in your course teach work that is disappearing from the market. See which ones, and what is replacing them.`,
        href: '/dashboard/student/syllabus',
        cta: 'See which topics',
        urgency: 'medium',
      });
    }
  }

  const jobs = recommendJobs(profile, heldSkillIds, 1);
  if (jobs.length && jobs[0].matchPercent >= 60) {
    steps.push({
      title: 'Employers near you are hiring',
      plain: `${jobs[0].employers} employer(s) in ${jobs[0].districtName} have committed to hire for ${jobs[0].skillName}, paying at least ${inr(jobs[0].wageFloor)} a month.`,
      href: '/dashboard/student/jobs',
      cta: 'See the openings',
      urgency: 'high',
    });
  }

  steps.push({
    title: 'Make your CV',
    plain: 'A one-page CV employers trust, because the government fills in most of it: your practicals, your trial scores and your pay record.',
    href: '/dashboard/student/cv',
    cta: 'Make my CV',
    urgency: 'medium',
  });

  const order = { high: 0, medium: 1, low: 2 };
  return steps.sort((a, b) => order[a.urgency] - order[b.urgency]).slice(0, 4);
}

/* ------------------------------------------------------------------ */

function districtName(id: string): string {
  return districts.find(d => d.id === id)?.name ?? id;
}

function inr(n: number): string {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(n));
}

/** Skills a candidate can claim, derived from their enrolled course. */
export function heldSkillsFor(enrolledCourseId: string | null): string[] {
  if (!enrolledCourseId) return [];
  return courses.find(c => c.id === enrolledCourseId)?.skillIds ?? [];
}

/** The trades in a district with the biggest verified shortfall - used as a fallback steer. */
export function topShortages(districtId: string, limit = 3) {
  return computeGapForDistrict(districtId)
    .filter(g => g.gap > 0 && g.trend !== 'declining')
    .slice(0, limit);
}

export const ALL_SECTORS = [...new Set(skills.map(s => s.sector))] as Sector[];
