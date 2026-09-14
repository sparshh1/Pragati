import { RplApplication } from '@/types';

/* ------------------------------------------------------------------ */
/*  Recognition of Prior Learning                                       */
/*                                                                      */
/*  Most of the district's workforce already has the skill and none of   */
/*  the paper. RPL assesses what they can actually do, certifies them    */
/*  at the NSQF level the evidence supports, and prescribes only the     */
/*  bridge hours needed to close the remainder — so a 9-year informal    */
/*  mechanic does not sit through a 2-year course to become employable.  */
/* ------------------------------------------------------------------ */

export const rplApplications: RplApplication[] = [
  {
    id: 'RPL-3301',
    candidateName: 'Suresh Gaikwad',
    candidateKsid: 'MH-CD-2026-422014',
    districtId: 'kolhapur',
    claimedSkillId: 'ice-engine-overhaul',
    yearsOfExperience: 9,
    currentEmployerName: 'Roadside garage (unregistered)',
    evidence: [
      { kind: 'Employer letter', detail: 'Signed statement from garage owner, 9 years continuous', verified: true },
      { kind: 'Work samples', detail: '14 photographed job cards with customer contact', verified: true },
      { kind: 'Tool proficiency test', detail: 'Micrometer & bore gauge to 0.01 mm — passed', verified: true },
      { kind: 'Bank statement', detail: 'Monthly cash deposits consistent with declared income', verified: false },
    ],
    claimedNsqfLevel: 4,
    assessedNsqfLevel: 4,
    bridgeHoursRequired: 120,
    status: 'certified',
    currentMonthlyWage: 13500,
    projectedMonthlyWage: 21000,
    submittedOn: '2026-05-14',
  },
  {
    id: 'RPL-3302',
    candidateName: 'Anita Kamble',
    candidateKsid: 'MH-CD-2026-420233',
    districtId: 'csn',
    claimedSkillId: 'sewing-machine-operation',
    yearsOfExperience: 6,
    currentEmployerName: 'Home-based piece-rate contractor',
    evidence: [
      { kind: 'Piece-rate records', detail: 'Contractor ledger, 6 years, avg 240 pieces/week', verified: true },
      { kind: 'Practical assessment', detail: 'Single-needle lockstitch, 18 SPM at accepted reject rate', verified: true },
      { kind: 'Self-declaration', detail: 'Affidavit of informal experience', verified: true },
    ],
    claimedNsqfLevel: 4,
    assessedNsqfLevel: 3,
    bridgeHoursRequired: 200,
    status: 'certified',
    currentMonthlyWage: 9800,
    projectedMonthlyWage: 15400,
    submittedOn: '2026-06-02',
  },
  {
    id: 'RPL-3303',
    candidateName: 'Ramesh More',
    candidateKsid: 'MH-CD-2026-421055',
    districtId: 'nashik',
    claimedSkillId: 'industrial-electrician',
    yearsOfExperience: 11,
    currentEmployerName: 'Deshmukh Electrical Services',
    evidence: [
      { kind: 'EPFO record', detail: 'UAN shows 7 years contributory service as "helper"', verified: true },
      { kind: 'Employer endorsement', detail: 'Proprietor confirms independent panel wiring since 2019', verified: true },
      { kind: 'Practical assessment', detail: 'Star-delta starter wired and commissioned from schematic', verified: true },
      { kind: 'Safety assessment', detail: 'Earth pit measurement & LOTO — passed', verified: true },
    ],
    claimedNsqfLevel: 4,
    assessedNsqfLevel: 4,
    bridgeHoursRequired: 80,
    status: 'certified',
    currentMonthlyWage: 16200,
    projectedMonthlyWage: 24800,
    submittedOn: '2026-04-21',
  },
  {
    id: 'RPL-3304',
    candidateName: 'Vijay Bhosale',
    candidateKsid: 'MH-CD-2026-419002',
    districtId: 'nagpur',
    claimedSkillId: 'masonry',
    yearsOfExperience: 14,
    currentEmployerName: 'Labour chowk — daily wage',
    evidence: [
      { kind: 'Site supervisor references', detail: '3 contractors, cumulative 11 years', verified: true },
      { kind: 'Practical assessment', detail: 'Brick bond, plumb and level within tolerance', verified: true },
      { kind: 'Identity & residence', detail: 'Aadhaar seeded, district resident', verified: true },
    ],
    claimedNsqfLevel: 4,
    assessedNsqfLevel: null,
    bridgeHoursRequired: 60,
    status: 'assessment-scheduled',
    currentMonthlyWage: 12000,
    projectedMonthlyWage: 19500,
    submittedOn: '2026-08-28',
  },
  {
    id: 'RPL-3305',
    candidateName: 'Meena Kulkarni',
    candidateKsid: 'MH-CD-2026-420190',
    districtId: 'kolhapur',
    claimedSkillId: 'handloom-weaving',
    yearsOfExperience: 18,
    currentEmployerName: 'Family handloom unit',
    evidence: [
      { kind: 'Co-operative membership', detail: 'Weavers co-op member since 2009', verified: true },
      { kind: 'Product samples', detail: '6 woven samples assessed for count and finish', verified: true },
    ],
    claimedNsqfLevel: 4,
    assessedNsqfLevel: 4,
    bridgeHoursRequired: 160,
    status: 'certified',
    currentMonthlyWage: 8400,
    projectedMonthlyWage: 17200,
    submittedOn: '2026-03-09',
  },
  {
    id: 'RPL-3306',
    candidateName: 'Neha Thakur',
    candidateKsid: 'MH-CD-2026-423011',
    districtId: 'thane',
    claimedSkillId: 'voice-call-center',
    yearsOfExperience: 3,
    currentEmployerName: 'Unregistered tele-calling unit',
    evidence: [
      { kind: 'Call recordings', detail: '20 sampled calls assessed for handling quality', verified: true },
      { kind: 'Employer letter', detail: 'Unit not registered with EPFO — letter unverifiable', verified: false },
    ],
    claimedNsqfLevel: 4,
    assessedNsqfLevel: null,
    bridgeHoursRequired: 120,
    status: 'submitted',
    currentMonthlyWage: 11000,
    projectedMonthlyWage: 18000,
    submittedOn: '2026-09-06',
  },
  {
    id: 'RPL-3307',
    candidateName: 'Vikram Sawant',
    candidateKsid: 'MH-CD-2026-422088',
    districtId: 'pune',
    claimedSkillId: 'plc-scada',
    yearsOfExperience: 2,
    currentEmployerName: 'Freelance panel wiring',
    evidence: [
      { kind: 'Self-declaration', detail: 'Claims independent SCADA commissioning', verified: false },
      { kind: 'Practical assessment', detail: 'Could not complete a 12-rung program within time', verified: false },
    ],
    claimedNsqfLevel: 5,
    assessedNsqfLevel: 3,
    bridgeHoursRequired: 400,
    status: 'rejected',
    currentMonthlyWage: 14000,
    projectedMonthlyWage: 14000,
    submittedOn: '2026-07-11',
  },
];

export function rplStats(districtId?: string) {
  const list = districtId ? rplApplications.filter(r => r.districtId === districtId) : rplApplications;
  const certified = list.filter(r => r.status === 'certified');
  const uplift = certified.reduce((a, r) => a + (r.projectedMonthlyWage - r.currentMonthlyWage), 0);
  return {
    total: list.length,
    certified: certified.length,
    pending: list.filter(r => r.status === 'submitted' || r.status === 'assessment-scheduled').length,
    rejected: list.filter(r => r.status === 'rejected').length,
    avgMonthlyUplift: certified.length ? Math.round(uplift / certified.length) : 0,
    avgBridgeHours: certified.length
      ? Math.round(certified.reduce((a, r) => a + r.bridgeHoursRequired, 0) / certified.length)
      : 0,
  };
}

/**
 * Bridge hours are what remains after prior learning is credited. A full ITI
 * course is ~2400 h; RPL typically discharges 90%+ of it.
 */
export function creditedHours(app: RplApplication, fullCourseHours = 2400): number {
  return Math.max(0, fullCourseHours - app.bridgeHoursRequired);
}
