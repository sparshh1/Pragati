import { HiringPool, WorkTrial, TrialOutcome } from '@/types';

/* ------------------------------------------------------------------ */
/*  MSME Hiring Pools                                                   */
/*                                                                      */
/*  A 12-person unit cannot justify a training batch on its own. Several */
/*  MSMEs in the same district and trade co-sign one batch: each member  */
/*  legally commits to absorb N seats at a declared wage floor BEFORE    */
/*  the batch is notified. That commitment is what "employer-locked"     */
/*  means — seats exist only against signed demand.                     */
/* ------------------------------------------------------------------ */

export const hiringPools: HiringPool[] = [
  {
    id: 'POOL-PN-EV-01',
    name: 'Pune EV Service Cluster Pool',
    districtId: 'pune',
    skillId: 'ev-battery-diagnostics',
    status: 'trialling',
    members: [
      { employerId: 'emp-pune-02', seatsCommitted: 24, wageFloor: 26000, signedOn: '2026-04-12' },
      { employerId: 'emp-pune-04', seatsCommitted: 8, wageFloor: 22000, signedOn: '2026-04-15' },
      { employerId: 'emp-tha-02', seatsCommitted: 10, wageFloor: 23500, signedOn: '2026-04-19' },
      { employerId: 'emp-ngp-01', seatsCommitted: 12, wageFloor: 24000, signedOn: '2026-04-22' },
    ],
    seatsRequired: 54,
    batchStartDate: '2026-05-06',
    trainingCentreId: 'ITI-PUNE-AUNDH',
    subsidyPerSeat: 28000,
    candidatesEnrolled: 54,
  },
  {
    id: 'POOL-CSN-WLD-01',
    name: 'Marathwada Fabrication Pool',
    districtId: 'csn',
    skillId: 'automotive-welding',
    status: 'in-training',
    members: [
      { employerId: 'emp-csn-01', seatsCommitted: 30, wageFloor: 20000, signedOn: '2026-06-02' },
      { employerId: 'emp-csn-02', seatsCommitted: 14, wageFloor: 19000, signedOn: '2026-06-05' },
      { employerId: 'emp-csn-03', seatsCommitted: 6, wageFloor: 18500, signedOn: '2026-06-08' },
    ],
    seatsRequired: 50,
    batchStartDate: '2026-07-01',
    trainingCentreId: 'ITI-CSN-CHIKALTHANA',
    subsidyPerSeat: 24000,
    candidatesEnrolled: 48,
  },
  {
    id: 'POOL-NSK-SOL-01',
    name: 'Nashik Rooftop Solar Consortium',
    districtId: 'nashik',
    skillId: 'solar-pv-installation',
    status: 'locked',
    members: [
      { employerId: 'emp-nsk-02', seatsCommitted: 22, wageFloor: 21000, signedOn: '2026-08-14' },
      { employerId: 'emp-nsk-01', seatsCommitted: 10, wageFloor: 19500, signedOn: '2026-08-16' },
      { employerId: 'emp-nsk-04', seatsCommitted: 8, wageFloor: 19000, signedOn: '2026-08-21' },
    ],
    seatsRequired: 40,
    batchStartDate: '2026-10-01',
    trainingCentreId: 'ITI-NASHIK-SATPUR',
    subsidyPerSeat: 22000,
    candidatesEnrolled: 31,
  },
  {
    id: 'POOL-THA-IOT-01',
    name: 'Thane Smart-Building Integrators Pool',
    districtId: 'thane',
    skillId: 'iot-device-tech',
    status: 'forming',
    members: [
      { employerId: 'emp-tha-04', seatsCommitted: 16, wageFloor: 23000, signedOn: '2026-09-02' },
      { employerId: 'emp-tha-03', seatsCommitted: 6, wageFloor: 21000, signedOn: '2026-09-05' },
    ],
    seatsRequired: 35,
    batchStartDate: '2026-11-10',
    trainingCentreId: 'ITI-THANE-WAGLE',
    subsidyPerSeat: 25000,
    candidatesEnrolled: 0,
  },
  {
    id: 'POOL-KOL-CAD-01',
    name: 'Kolhapur Garment CAD Pool',
    districtId: 'kolhapur',
    skillId: 'cad-pattern-design',
    status: 'placed',
    members: [
      { employerId: 'emp-ngp-03', seatsCommitted: 12, wageFloor: 24000, signedOn: '2026-01-10' },
      { employerId: 'emp-tha-03', seatsCommitted: 8, wageFloor: 25000, signedOn: '2026-01-14' },
    ],
    seatsRequired: 20,
    batchStartDate: '2026-02-03',
    trainingCentreId: 'ITI-KOLHAPUR-SHIVAJI',
    subsidyPerSeat: 26000,
    candidatesEnrolled: 20,
  },
  {
    id: 'POOL-NGP-EVC-01',
    name: 'Vidarbha Charging Infrastructure Pool',
    districtId: 'nagpur',
    skillId: 'ev-charging-tech',
    status: 'in-training',
    members: [
      { employerId: 'emp-ngp-01', seatsCommitted: 26, wageFloor: 23000, signedOn: '2026-05-20' },
      { employerId: 'emp-ngp-04', seatsCommitted: 6, wageFloor: 20000, signedOn: '2026-05-24' },
      { employerId: 'emp-csn-03', seatsCommitted: 8, wageFloor: 21500, signedOn: '2026-05-28' },
    ],
    seatsRequired: 40,
    batchStartDate: '2026-06-15',
    trainingCentreId: 'ITI-NAGPUR-KALMESHWAR',
    subsidyPerSeat: 24000,
    candidatesEnrolled: 40,
  },
];

export function poolSeatsCommitted(p: HiringPool): number {
  return p.members.reduce((a, m) => a + m.seatsCommitted, 0);
}

export function poolWageFloor(p: HiringPool): number {
  return Math.min(...p.members.map(m => m.wageFloor));
}

export function getPool(id: string) {
  return hiringPools.find(p => p.id === id);
}

/* ------------------------------------------------------------------ */
/*  The Work-Trial Gate                                                 */
/*                                                                      */
/*  Certification alone has never told an employer whether someone can   */
/*  hold a shift. Every pool candidate serves a state-stipended paid     */
/*  trial on the employer's own floor. The trial scorecard — not the     */
/*  exam mark — decides placement, and the subsidy tranche is released   */
/*  only against trials that were passed AND later confirmed by EPFO.    */
/* ------------------------------------------------------------------ */

const GATE_CRITERIA = [
  { criterion: 'Shift discipline & punctuality', weight: 15 },
  { criterion: 'Safety protocol adherence (PPE, LOTO)', weight: 25 },
  { criterion: 'Tool & instrument handling', weight: 20 },
  { criterion: 'Task completion within takt time', weight: 25 },
  { criterion: 'Escalation & communication', weight: 15 },
];

function scorecard(scores: (number | null)[]) {
  return GATE_CRITERIA.map((c, i) => ({ ...c, score: scores[i] ?? null }));
}

export const workTrials: WorkTrial[] = [
  {
    id: 'WT-4401', poolId: 'POOL-PN-EV-01', candidateName: 'Rahul Deshmukh', candidateKsid: 'MH-CD-2026-418203',
    employerId: 'emp-pune-02', skillId: 'ev-battery-diagnostics', startDate: '2026-08-18', durationDays: 14,
    stipendPerDay: 420, outcome: 'passed', scorecard: scorecard([88, 92, 85, 79, 90]),
    supervisorRemarks: 'Reads pack-level BMS logs without prompting. Cleared HV safety drill first attempt.',
    epfoConfirmedOn: '2026-09-01', offerCtc: 312000,
  },
  {
    id: 'WT-4402', poolId: 'POOL-PN-EV-01', candidateName: 'Priya Kadam', candidateKsid: 'MH-CD-2026-418244',
    employerId: 'emp-pune-02', skillId: 'ev-battery-diagnostics', startDate: '2026-08-18', durationDays: 14,
    stipendPerDay: 420, outcome: 'passed', scorecard: scorecard([95, 96, 91, 88, 93]),
    supervisorRemarks: 'Top of batch. Recommended for cell-balancing specialisation.',
    epfoConfirmedOn: '2026-09-01', offerCtc: 348000,
  },
  {
    id: 'WT-4403', poolId: 'POOL-PN-EV-01', candidateName: 'Amit Patil', candidateKsid: 'MH-CD-2026-418310',
    employerId: 'emp-pune-04', skillId: 'ev-battery-diagnostics', startDate: '2026-08-18', durationDays: 14,
    stipendPerDay: 420, outcome: 'failed', scorecard: scorecard([62, 48, 70, 55, 66]),
    supervisorRemarks: 'Repeated HV glove lapses. Must re-run safety module before any re-trial.',
    epfoConfirmedOn: null, offerCtc: null,
  },
  {
    id: 'WT-4404', poolId: 'POOL-PN-EV-01', candidateName: 'Sneha Jadhav', candidateKsid: 'MH-CD-2026-418377',
    employerId: 'emp-tha-02', skillId: 'ev-battery-diagnostics', startDate: '2026-09-01', durationDays: 14,
    stipendPerDay: 420, outcome: 'in-progress', scorecard: scorecard([84, 88, null, null, 81]),
    supervisorRemarks: 'Day 8 of 14. Tracking above cohort median.',
    epfoConfirmedOn: null, offerCtc: null,
  },
  {
    id: 'WT-4405', poolId: 'POOL-PN-EV-01', candidateName: 'Sanjay Pawar', candidateKsid: 'MH-CD-2026-418401',
    employerId: 'emp-ngp-01', skillId: 'ev-battery-diagnostics', startDate: '2026-09-08', durationDays: 14,
    stipendPerDay: 420, outcome: 'pending', scorecard: scorecard([null, null, null, null, null]),
    supervisorRemarks: '—', epfoConfirmedOn: null, offerCtc: null,
  },
  {
    id: 'WT-4406', poolId: 'POOL-NGP-EVC-01', candidateName: 'Vijay Bhosale', candidateKsid: 'MH-CD-2026-419002',
    employerId: 'emp-ngp-01', skillId: 'ev-charging-tech', startDate: '2026-08-25', durationDays: 10,
    stipendPerDay: 400, outcome: 'passed', scorecard: scorecard([90, 87, 82, 86, 79]),
    supervisorRemarks: 'Commissioned two 60 kW DC units under supervision without rework.',
    epfoConfirmedOn: '2026-09-05', offerCtc: 288000,
  },
  {
    id: 'WT-4407', poolId: 'POOL-NGP-EVC-01', candidateName: 'Pooja Shinde', candidateKsid: 'MH-CD-2026-419044',
    employerId: 'emp-ngp-04', skillId: 'ev-charging-tech', startDate: '2026-08-25', durationDays: 10,
    stipendPerDay: 400, outcome: 'withdrawn', scorecard: scorecard([72, 80, null, null, null]),
    supervisorRemarks: 'Candidate withdrew on day 5 — relocated to Pune for family reasons.',
    epfoConfirmedOn: null, offerCtc: null,
  },
  {
    id: 'WT-4408', poolId: 'POOL-CSN-WLD-01', candidateName: 'Ganesh Joshi', candidateKsid: 'MH-CD-2026-420117',
    employerId: 'emp-csn-01', skillId: 'automotive-welding', startDate: '2026-09-02', durationDays: 12,
    stipendPerDay: 380, outcome: 'in-progress', scorecard: scorecard([86, 90, 88, null, null]),
    supervisorRemarks: 'Weld bead consistency verified on inverter telemetry — within tolerance.',
    epfoConfirmedOn: null, offerCtc: null,
  },
  {
    id: 'WT-4409', poolId: 'POOL-CSN-WLD-01', candidateName: 'Meena Kulkarni', candidateKsid: 'MH-CD-2026-420190',
    employerId: 'emp-csn-02', skillId: 'automotive-welding', startDate: '2026-09-02', durationDays: 12,
    stipendPerDay: 380, outcome: 'in-progress', scorecard: scorecard([79, 84, 76, null, null]),
    supervisorRemarks: 'Needs support on positional welding; theory strong.',
    epfoConfirmedOn: null, offerCtc: null,
  },
  {
    id: 'WT-4410', poolId: 'POOL-KOL-CAD-01', candidateName: 'Aishwarya Chavan', candidateKsid: 'MH-CD-2026-421008',
    employerId: 'emp-ngp-03', skillId: 'cad-pattern-design', startDate: '2026-05-12', durationDays: 10,
    stipendPerDay: 400, outcome: 'passed', scorecard: scorecard([92, 85, 94, 90, 88]),
    supervisorRemarks: 'Graded marker efficiency 84% on first live order — above house standard.',
    epfoConfirmedOn: '2026-06-01', offerCtc: 324000,
  },
  {
    id: 'WT-4411', poolId: 'POOL-KOL-CAD-01', candidateName: 'Ramesh More', candidateKsid: 'MH-CD-2026-421055',
    employerId: 'emp-tha-03', skillId: 'cad-pattern-design', startDate: '2026-05-12', durationDays: 10,
    stipendPerDay: 400, outcome: 'passed', scorecard: scorecard([81, 83, 87, 84, 80]),
    supervisorRemarks: 'Solid grader. Slower on size-set nesting, improving.',
    epfoConfirmedOn: '2026-06-01', offerCtc: 300000,
  },
  {
    id: 'WT-4412', poolId: 'POOL-CSN-WLD-01', candidateName: 'Anita Kamble', candidateKsid: 'MH-CD-2026-420233',
    employerId: 'emp-csn-03', skillId: 'automotive-welding', startDate: '2026-09-02', durationDays: 12,
    stipendPerDay: 380, outcome: 'failed', scorecard: scorecard([58, 61, 64, 49, 60]),
    supervisorRemarks: 'Porosity outside tolerance on 6 of 10 coupons. Recommend 40 h remedial practical.',
    epfoConfirmedOn: null, offerCtc: null,
  },
];

/** Weighted gate score. Null until every criterion has been scored. */
export function trialScore(t: WorkTrial): number | null {
  if (t.scorecard.some(c => c.score === null)) return null;
  const total = t.scorecard.reduce((a, c) => a + c.weight * (c.score as number), 0);
  const weights = t.scorecard.reduce((a, c) => a + c.weight, 0);
  return Math.round(total / weights);
}

/** The gate threshold. Below this, no placement is recorded and no subsidy moves. */
export const TRIAL_PASS_THRESHOLD = 70;

export function poolTrialStats(poolId: string) {
  const trials = workTrials.filter(t => t.poolId === poolId);
  const concluded = trials.filter(t => t.outcome === 'passed' || t.outcome === 'failed');
  const passed = trials.filter(t => t.outcome === 'passed');
  const epfoConfirmed = trials.filter(t => t.epfoConfirmedOn !== null);
  return {
    total: trials.length,
    concluded: concluded.length,
    passed: passed.length,
    passRate: concluded.length ? Math.round((passed.length / concluded.length) * 100) : 0,
    epfoConfirmed: epfoConfirmed.length,
    /** Subsidy is released per EPFO-confirmed placement, not per certificate issued. */
    subsidyReleasable: epfoConfirmed.length,
  };
}

export const OUTCOME_LABEL: Record<TrialOutcome, string> = {
  pending: 'Not started',
  'in-progress': 'On floor',
  passed: 'Gate cleared',
  failed: 'Gate not cleared',
  withdrawn: 'Withdrawn',
};
