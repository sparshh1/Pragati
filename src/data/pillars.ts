import { CitizenRole } from '@/lib/rbac';

/* ------------------------------------------------------------------ */
/*  The six operating pillars                                          */
/*                                                                     */
/*  Every dashboard route in this portal — candidate, enterprise and    */
/*  departmental — is an expression of one of these six. This file is   */
/*  the single place where a pillar's identity, its mechanisms and its  */
/*  three-sided outcome are declared.                                   */
/* ------------------------------------------------------------------ */

export interface Pillar {
  id: string;
  number: number;
  name: string;
  short: string;
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
    short: 'Demand Intelligence',
    mechanisms: ['Trust-Weighted Quality Filter', 'Dying Task Watch'],
    summary:
      'Raw vacancy claims are never trusted. Each source carries a trust weight earned from how many of its past postings became real EPFO payroll entries, and the Dying Task Watch tracks decline at task level — below the trade name — so a syllabus cannot rot behind a healthy-looking title.',
    outcomes: {
      student: 'Youth are trained on skills that are actually being hired for.',
      business: 'MSMEs get vetted talent instead of a queue of unfiltered applicants.',
      government: 'The State spends zero budget on demand that never existed.',
    },
    routes: { student: '/dashboard/student/demand', business: '/dashboard/business/signals', gov: '/gov/signals' },
  },
  {
    id: 'hiring-pipeline',
    number: 2,
    name: 'Employer-Locked Work & Hiring Pipeline',
    short: 'Hiring Pipeline',
    mechanisms: ['MSME Hiring Pools', 'Work-Trial Gate'],
    summary:
      'Small units too small to train alone co-sign one batch, each legally committing seats at a declared wage floor before training is notified. Every candidate then serves a paid work-trial on the employer’s own floor, and subsidy moves only against trials that were passed and later confirmed on payroll.',
    outcomes: {
      student: 'A fast route to a real job, with a stipend during the trial.',
      business: 'Factories receive operators who have already worked their shift.',
      government: 'Subsidy is released against verified outcomes, not certificates.',
    },
    routes: { student: '/dashboard/student/jobs', business: '/dashboard/business/hiring', gov: '/gov/pipeline' },
  },
  {
    id: 'adaptive-syllabus',
    number: 3,
    name: 'Adaptive Syllabus & Evidence-Based Evaluation',
    short: 'Adaptive Syllabus',
    mechanisms: ['Live Syllabus A/B Testing', 'Sensor-Verified Practicals'],
    summary:
      'Two cohorts in the same trade run different content concurrently and the winner is decided by work-trial pass rate, placement and wage — not by committee. Practical marks are derived from machine telemetry, so a practical that never happened cannot be signed off.',
    outcomes: {
      student: 'Students learn on the tools industry is running today.',
      business: 'Factories receive job-ready talent, not exam-ready talent.',
      government: 'Every practical mark carries audit-proof machine evidence.',
    },
    routes: { student: '/dashboard/student/syllabus', business: '/dashboard/business/syllabus', gov: '/gov/syllabus' },
  },
  {
    id: 'capacity-planner',
    number: 4,
    name: 'Constraint-Aware District Capacity Planner',
    short: 'Capacity Planner',
    mechanisms: ['Hard-Limit Seat Calculator', 'Idle Machine Sharing'],
    summary:
      'Demand proposes, but trainers, benches, beds and budget dispose. The planner computes each ceiling independently and notifies only up to the binding constraint — while idle second-shift capacity in private factories is brokered into the same pool, so the State buys hours instead of buying machines.',
    outcomes: {
      student: 'Guaranteed lab time — the bench exists before the seat is sold.',
      business: 'Surplus shift capacity earns revenue instead of depreciating.',
      government: 'Capex saved and ghost classes eliminated at the plan stage.',
    },
    routes: { student: '/dashboard/student/labs', business: '/dashboard/business/machines', gov: '/gov/capacity' },
  },
  {
    id: 'pathways-rpl',
    number: 5,
    name: 'Precision Career Pathways & RPL Engine',
    short: 'Pathways & RPL',
    mechanisms: ['Recognition of Prior Learning', 'Trade Shift Tracks (ICE → EV)'],
    summary:
      'Recognition of Prior Learning certifies what a worker can already do and prescribes only the remaining bridge hours. Trade-shift tracks carry workers out of contracting trades into adjacent growing ones by teaching the delta, not the whole trade again.',
    outcomes: {
      student: 'Higher wages without repeating years of training already lived.',
      business: 'Employers modernise their existing workforce in weeks, not years.',
      government: 'District labour is formalised and becomes visible to payroll.',
    },
    routes: { student: '/dashboard/student/pathways', business: '/dashboard/business/rpl', gov: '/gov/rpl' },
  },
  {
    id: 'control-tower',
    number: 6,
    name: 'Multilingual Control Tower & Audit Engine',
    short: 'Control Tower & Audit',
    mechanisms: ['Multilingual Voice Access', 'EPFO Payroll Audits'],
    summary:
      'Rural candidates reach the portal by voice in their own language, over IVR or WhatsApp. On the other side, every placement claim is reconciled against the candidate’s UAN — employer, first contribution month, declared wage and continuity — so ghost placements surface before money moves.',
    outcomes: {
      student: 'Access by voice, in Marathi, without literacy or a smartphone.',
      business: 'A single compliant payroll declaration clears subsidy faster.',
      government: 'Fraud-proof compliance with a complete audit trail.',
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
/*  and the feature set diverge completely — this is that divergence.  */
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
    { href: '/dashboard/student', label: 'Overview', description: 'Your enrolment, trials and next actions', pillarId: null, icon: 'grid' },
    { href: '/dashboard/student/recommend', label: 'Recommended for you', description: 'Courses and jobs ranked for your profile, with the reasons shown', pillarId: 'demand-intelligence', icon: 'star' },
    { href: '/dashboard/student/cv', label: 'My CV & Job-Fit Card', description: 'A one-page profile employers trust, built from verified records', pillarId: 'pathways-rpl', icon: 'card' },
    { href: '/dashboard/student/demand', label: 'Demand & Dying Tasks', description: 'Is this trade growing — and which tasks inside it are dying?', pillarId: 'demand-intelligence', icon: 'chart' },
    { href: '/dashboard/student/jobs', label: 'Jobs & Work Trials', description: 'Employer-locked seats, pools and your paid trial', pillarId: 'hiring-pipeline', icon: 'briefcase' },
    { href: '/dashboard/student/syllabus', label: 'My Syllabus & Practicals', description: 'Module plan and sensor-verified practical evidence', pillarId: 'adaptive-syllabus', icon: 'book' },
    { href: '/dashboard/student/labs', label: 'Lab & Machine Slots', description: 'Book bench time, including private factory machines', pillarId: 'capacity-planner', icon: 'cog' },
    { href: '/dashboard/student/pathways', label: 'Career Pathways & RPL', description: 'Certify experience you have; shift trade with bridge modules', pillarId: 'pathways-rpl', icon: 'route' },
    { href: '/dashboard/student/assist', label: 'Voice Assist & Grievance', description: 'Ask in Marathi, Hindi or Urdu — by voice', pillarId: 'control-tower', icon: 'mic' },
  ],
  business: [
    { href: '/dashboard/business', label: 'Overview', description: 'Your pools, trials and compliance standing', pillarId: null, icon: 'grid' },
    { href: '/dashboard/business/signals', label: 'Post Hiring Demand', description: 'Submit a signal and see the trust weight it earns', pillarId: 'demand-intelligence', icon: 'signal' },
    { href: '/dashboard/business/hiring', label: 'Hiring Pools & Trials', description: 'Co-sign a batch; score candidates on your own floor', pillarId: 'hiring-pipeline', icon: 'briefcase' },
    { href: '/dashboard/business/syllabus', label: 'Syllabus Endorsement', description: 'Flag stale modules; vote on live A/B variants', pillarId: 'adaptive-syllabus', icon: 'book' },
    { href: '/dashboard/business/machines', label: 'Idle Machine Exchange', description: 'List surplus shift capacity and approve bookings', pillarId: 'capacity-planner', icon: 'cog' },
    { href: '/dashboard/business/rpl', label: 'Endorse Prior Learning', description: 'Certify the informal workers already on your floor', pillarId: 'pathways-rpl', icon: 'route' },
    { href: '/dashboard/business/compliance', label: 'Payroll & Compliance', description: 'EPFO declarations that release subsidy', pillarId: 'control-tower', icon: 'shield' },
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
