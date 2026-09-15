import { CitizenRole } from '@/lib/rbac';

/* ------------------------------------------------------------------ */
/*  The six operating pillars                                          */
/*                                                                     */
/*  Every dashboard route in this portal - candidate, enterprise and    */
/*  departmental - is an expression of one of these six. This file is   */
/*  the single place where a pillar's identity, its mechanisms and its  */
/*  three-sided outcome are declared.                                   */
/* ------------------------------------------------------------------ */

export interface Pillar {
  id: string;
  number: number;
  name: string;
  short: string;
  /** Plain headline used on public pages. The formal `name` stays for About. */
  plain: string;
  mechanisms: string[];
  summary: string;
  outcomes: { student: string; business: string; government: string };
  routes: { student?: string; business?: string; gov: string };
}

export const PILLARS: Pillar[] = [
  {
    id: 'demand-intelligence',
    number: 1,
    name: 'Demand Intelligence & Signal Verification Engine',
    plain: 'Real jobs, not fake adverts',
    short: 'Real jobs',
    mechanisms: ['Only real vacancies counted', 'Tasks that are disappearing'],
    summary:
      'A job advert counts only if someone later gets paid for it. We also watch which tasks inside a trade are fading, so courses stop teaching them.',
    outcomes: {
      student: 'You train for jobs that are actually open near you.',
      business: 'You get people who have already been checked, not a pile of unread CVs.',
      government: 'The State does not spend money on demand that never existed.',
    },
    routes: { student: '/dashboard/student/demand', business: '/dashboard/business/signals', gov: '/gov/signals' },
  },
  {
    id: 'hiring-pipeline',
    number: 2,
    name: 'Employer-Locked Work & Hiring Pipeline',
    plain: 'A job promised before you train',
    short: 'Hiring',
    mechanisms: ['Small firms hiring together', 'Paid work trial'],
    summary:
      "Small firms club together and promise in writing to hire, before training starts. Everyone then does a paid trial at the employer's factory. That trial decides the job, not the exam.",
    outcomes: {
      student: 'A fast route to a real job, with a daily payment during the trial.',
      business: 'You meet people who have already worked a shift on your floor.',
      government: 'Subsidy is paid when someone is actually employed, not when a certificate is printed.',
    },
    routes: { student: '/dashboard/student/jobs', business: '/dashboard/business/hiring', gov: '/gov/pipeline' },
  },
  {
    id: 'adaptive-syllabus',
    number: 3,
    name: 'Adaptive Syllabus & Evidence-Based Evaluation',
    plain: 'Courses that keep up with industry',
    short: 'Courses',
    mechanisms: ['Courses tested on real results', 'Machine-checked practicals'],
    summary:
      'Two groups are taught slightly different content. Whichever group gets more jobs decides what everyone is taught next. Practical marks come from the machine, not from a signature.',
    outcomes: {
      student: 'You practise on the tools factories are running today.',
      business: 'You get people ready for the job, not just ready for an exam.',
      government: 'Every practical mark has a machine record behind it.',
    },
    routes: { student: '/dashboard/student/syllabus', business: '/dashboard/business/syllabus', gov: '/gov/syllabus' },
  },
  {
    id: 'capacity-planner',
    number: 4,
    name: 'Constraint-Aware District Capacity Planner',
    plain: 'No seat without a machine',
    short: 'Seats and machines',
    mechanisms: ['Honest seat limits', 'Shared factory machines'],
    summary:
      'Seats stop at whatever runs out first: teachers, benches, hostel beds or money. Spare machines in private factories are hired so more people get practice time.',
    outcomes: {
      student: 'The bench exists before anyone sells you the seat.',
      business: 'Idle night-shift machines can earn a fee instead of sitting unused.',
      government: 'Paper seats with no teacher or machine behind them are stopped at the plan.',
    },
    routes: { student: '/dashboard/student/labs', business: '/dashboard/business/machines', gov: '/gov/capacity' },
  },
  {
    id: 'pathways-rpl',
    number: 5,
    name: 'Precision Career Pathways & RPL Engine',
    plain: 'Credit for what you already know',
    short: 'Certificates and switches',
    mechanisms: ['Credit for work you already do', 'Switch to a growing trade'],
    summary:
      'If you already do the work, you get certified for it instead of repeating a whole course. If your trade is shrinking, a short course moves you into a growing one.',
    outcomes: {
      student: 'Better pay without repeating years of work you have already done.',
      business: 'You can upskill the people you already employ in weeks, not years.',
      government: 'More workers show up on the official payroll.',
    },
    routes: { student: '/dashboard/student/pathways', business: '/dashboard/business/rpl', gov: '/gov/rpl' },
  },
  {
    id: 'control-tower',
    number: 6,
    name: 'Multilingual Control Tower & Audit Engine',
    plain: 'Works by voice, checked for fraud',
    short: 'Speak and check',
    mechanisms: ['Use it by speaking', 'Checked against salary records'],
    summary:
      'You can use the whole portal by speaking, in your own language. On the other side, every "job placed" claim is checked against real salary records.',
    outcomes: {
      student: 'Ask in Marathi even if you do not read well, or if you only have a basic phone.',
      business: 'One honest payroll filing clears your subsidy faster.',
      government: 'False placement claims are caught against the pay record.',
    },
    routes: { student: '/dashboard/student/assist', business: '/dashboard/business/compliance', gov: '/gov/audit' },
  },
];

export function getPillar(id: string): Pillar {
  return PILLARS.find(p => p.id === id)!;
}

/* ------------------------------------------------------------------ */
/*  Role-segregated feature lists                                      */
/*                                                                     */
/*  Both citizen roles share the same portal and the same homepage.    */
/*  From the moment a role is chosen at registration, the navigation   */
/*  and the feature set diverge completely - this is that divergence.  */
/* ------------------------------------------------------------------ */

export interface FeatureLink {
  href: string;
  label: string;
  description: string;
  pillarId: string | null;
  icon: string;
}

export const CITIZEN_NAV: Record<CitizenRole, FeatureLink[]> = {
  student: [
    { href: '/dashboard/student', label: 'Home', description: 'Your course and what to do next', pillarId: null, icon: 'grid' },
    { href: '/dashboard/student/recommend', label: 'Courses for you', description: 'Picked for you, with reasons', pillarId: 'demand-intelligence', icon: 'star' },
    { href: '/dashboard/student/cv', label: 'My CV', description: 'A CV the government has checked', pillarId: 'pathways-rpl', icon: 'card' },
    { href: '/dashboard/student/demand', label: 'Which trades have jobs', description: 'See if a trade is growing or shrinking', pillarId: 'demand-intelligence', icon: 'chart' },
    { href: '/dashboard/student/jobs', label: 'Jobs near me', description: 'Where employers promised to hire', pillarId: 'hiring-pipeline', icon: 'briefcase' },
    { href: '/dashboard/student/syllabus', label: 'What I am learning', description: 'Your subjects, hours and marks', pillarId: 'adaptive-syllabus', icon: 'book' },
    { href: '/dashboard/student/labs', label: 'Book machine time', description: 'Reserve a machine to practise on', pillarId: 'capacity-planner', icon: 'cog' },
    { href: '/dashboard/student/pathways', label: 'Certificate for my work', description: 'Get certified, or change trade', pillarId: 'pathways-rpl', icon: 'route' },
    { href: '/dashboard/student/assist', label: 'Ask by speaking', description: 'Say your question in your language', pillarId: 'control-tower', icon: 'mic' },
  ],
  business: [
    { href: '/dashboard/business', label: 'Home', description: 'Your hiring and payroll at a glance', pillarId: null, icon: 'grid' },
    { href: '/dashboard/business/signals', label: 'Post a vacancy', description: 'Tell us who you need to hire', pillarId: 'demand-intelligence', icon: 'signal' },
    { href: '/dashboard/business/hiring', label: 'Hire together', description: 'Share a training batch; try people first', pillarId: 'hiring-pipeline', icon: 'briefcase' },
    { href: '/dashboard/business/syllabus', label: 'What should be taught', description: 'Flag outdated topics; vote on changes', pillarId: 'adaptive-syllabus', icon: 'book' },
    { href: '/dashboard/business/machines', label: 'Rent out machines', description: 'Earn from machines you are not using', pillarId: 'capacity-planner', icon: 'cog' },
    { href: '/dashboard/business/rpl', label: 'Certify your workers', description: 'Get your skilled staff official papers', pillarId: 'pathways-rpl', icon: 'route' },
    { href: '/dashboard/business/compliance', label: 'Payroll & subsidy', description: 'File pay records to release your subsidy', pillarId: 'control-tower', icon: 'shield' },
  ],
};

export const GOV_NAV: { href: string; label: string; description: string; pillarId: string | null; permission: string; icon: string }[] = [
  { href: '/gov/console', label: 'Control Tower', description: 'Cross-pillar alert queue', pillarId: 'control-tower', permission: 'audit.view', icon: 'grid' },
  { href: '/gov/signals', label: 'Signal Verification', description: 'Trust-weighted quality filter & dying task watch', pillarId: 'demand-intelligence', permission: 'signal.view', icon: 'signal' },
  { href: '/gov/districts', label: 'District Analysis', description: 'Plots, gaps and uncovered-skill onboarding', pillarId: 'demand-intelligence', permission: 'signal.view', icon: 'map' },
  { href: '/gov/pipeline', label: 'Hiring Pipeline', description: 'Pools, work-trial gate and subsidy release', pillarId: 'hiring-pipeline', permission: 'pipeline.view', icon: 'briefcase' },
  { href: '/gov/syllabus', label: 'Syllabus Experiments', description: 'Live A/B testing and sensor practical audit', pillarId: 'adaptive-syllabus', permission: 'syllabus.view', icon: 'book' },
  { href: '/gov/capacity', label: 'Capacity Planner', description: 'Hard-limit seat calculator and machine brokerage', pillarId: 'capacity-planner', permission: 'capacity.view', icon: 'cog' },
  { href: '/gov/rpl', label: 'RPL & Pathways', description: 'Prior-learning certification and trade-shift tracks', pillarId: 'pathways-rpl', permission: 'rpl.view', icon: 'route' },
  { href: '/gov/audit', label: 'EPFO Audit Engine', description: 'Payroll reconciliation and voice grievance register', pillarId: 'control-tower', permission: 'audit.view', icon: 'shield' },
  { href: '/gov/access', label: 'Access Control', description: 'Roles, permissions and data scope', pillarId: null, permission: 'access.manage', icon: 'key' },
];

export const NAV_ICONS: Record<string, string> = {
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  chart: 'M4 20h16M7 16V9m5 7V4m5 12v-5',
  signal: 'M4 18v-3M9 18v-7M14 18v-11M19 18V6',
  briefcase: 'M3 8h18v12H3zM9 8V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V8',
  book: 'M4 5.5A1.5 1.5 0 015.5 4H11v15H5.5A1.5 1.5 0 014 17.5zM20 5.5A1.5 1.5 0 0018.5 4H13v15h5.5a1.5 1.5 0 001.5-1.5z',
  cog: 'M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3',
  route: 'M6 20a3 3 0 100-6 3 3 0 000 6zM18 10a3 3 0 100-6 3 3 0 000 6zM15 7H9a3 3 0 000 6h6a3 3 0 010 6',
  mic: 'M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zM5 11a7 7 0 0014 0M12 18v3',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6z',
  map: 'M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5zM9 4v13M15 6.5v13',
  key: 'M14.5 10.5a4 4 0 10-3.6 4L12 16h2v2h2v2h3.5l.5-.5v-2.7l-5.3-5.3z',
};
