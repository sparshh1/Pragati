import { SignalSource, DemandSignal, DyingTask, UncoveredSkill, SignalVerdict } from '@/types';

/* ------------------------------------------------------------------ */
/*  Signal sources and their learned trust scores                      */
/*                                                                     */
/*  Trust is not declared - it is earned. Each source's score is a      */
/*  function of how many of its past postings were later confirmed by   */
/*  an EPFO payroll entry, minus penalties for duplicates and ghosts.   */
/* ------------------------------------------------------------------ */

export const signalSources: SignalSource[] = [
  {
    id: 'src-epfo',
    name: 'EPFO Establishment Feed',
    kind: 'epfo-payroll',
    trustScore: 98,
    signalsSubmitted: 4820,
    signalsConfirmedByPayroll: 4812,
    duplicateRate: 0.001,
    ghostPostingRate: 0.002,
    lastAuditedOn: '2026-08-30',
  },
  {
    id: 'src-naps',
    name: 'Apprenticeship Portal (NAPS)',
    kind: 'apprenticeship-portal',
    trustScore: 92,
    signalsSubmitted: 2110,
    signalsConfirmedByPayroll: 1902,
    duplicateRate: 0.01,
    ghostPostingRate: 0.04,
    lastAuditedOn: '2026-08-28',
  },
  {
    id: 'src-bharat-forge',
    name: 'Bharat Precision Forge Pvt Ltd',
    kind: 'employer-direct',
    trustScore: 94,
    signalsSubmitted: 186,
    signalsConfirmedByPayroll: 171,
    duplicateRate: 0.005,
    ghostPostingRate: 0.03,
    lastAuditedOn: '2026-09-01',
  },
  {
    id: 'src-gst',
    name: 'GST Turnover Correlator (State)',
    kind: 'gst-invoice',
    trustScore: 88,
    signalsSubmitted: 1340,
    signalsConfirmedByPayroll: 1108,
    duplicateRate: 0.0,
    ghostPostingRate: 0.06,
    lastAuditedOn: '2026-08-22',
  },
  {
    id: 'src-mahaev',
    name: 'MahaEV Mobility Cluster',
    kind: 'employer-direct',
    trustScore: 86,
    signalsSubmitted: 244,
    signalsConfirmedByPayroll: 204,
    duplicateRate: 0.02,
    ghostPostingRate: 0.07,
    lastAuditedOn: '2026-09-03',
  },
  {
    id: 'src-field',
    name: 'DSDEO Field Survey Teams',
    kind: 'field-survey',
    trustScore: 79,
    signalsSubmitted: 880,
    signalsConfirmedByPayroll: 642,
    duplicateRate: 0.03,
    ghostPostingRate: 0.11,
    lastAuditedOn: '2026-08-18',
  },
  {
    id: 'src-jobboard-a',
    name: 'RozgaarKart Job Board',
    kind: 'job-board',
    trustScore: 54,
    signalsSubmitted: 9640,
    signalsConfirmedByPayroll: 4820,
    duplicateRate: 0.24,
    ghostPostingRate: 0.31,
    lastAuditedOn: '2026-09-05',
  },
  {
    id: 'src-staffing-x',
    name: 'Sahyadri Staffing Solutions',
    kind: 'staffing-agency',
    trustScore: 31,
    signalsSubmitted: 3210,
    signalsConfirmedByPayroll: 742,
    duplicateRate: 0.41,
    ghostPostingRate: 0.58,
    lastAuditedOn: '2026-09-07',
  },
  {
    id: 'src-jobboard-b',
    name: 'QuickHire Aggregator',
    kind: 'job-board',
    trustScore: 22,
    signalsSubmitted: 12400,
    signalsConfirmedByPayroll: 1860,
    duplicateRate: 0.52,
    ghostPostingRate: 0.71,
    lastAuditedOn: '2026-09-08',
  },
];

export function getSignalSource(id: string) {
  return signalSources.find(s => s.id === id);
}

/**
 * Trust-Weighted Quality Filter.
 *
 * A raw vacancy count is never fed straight into the demand curve. It is
 * multiplied by a weight derived from the source's payroll-confirmation
 * history, then reduced further for each integrity flag the signal trips.
 */
export function computeTrustWeight(
  source: SignalSource,
  flags: string[],
): number {
  const confirmRate = source.signalsSubmitted
    ? source.signalsConfirmedByPayroll / source.signalsSubmitted
    : 0;

  // Base weight blends the declared trust score with the observed confirm rate.
  let weight = 0.5 * (source.trustScore / 100) + 0.5 * confirmRate;

  // Penalise structural unreliability of the channel itself.
  weight *= 1 - source.duplicateRate;
  weight *= 1 - source.ghostPostingRate * 0.8;

  // Per-signal integrity penalties.
  const PENALTY: Record<string, number> = {
    'duplicate-listing': 0.25,
    'no-wage-disclosed': 0.9,
    'wage-below-district-floor': 0.6,
    'bulk-identical-posting': 0.35,
    'employer-not-in-epfo': 0.4,
    'reposted-unfilled-6m': 0.5,
    'unverified-contact': 0.75,
  };
  for (const f of flags) weight *= PENALTY[f] ?? 1;

  return Math.max(0, Math.min(1, Number(weight.toFixed(3))));
}

export function verdictFor(weight: number, flags: string[]): SignalVerdict {
  if (flags.includes('duplicate-listing') || weight < 0.12) return 'rejected';
  if (weight < 0.3) return 'quarantined';
  if (flags.length > 0 || weight < 0.55) return 'under-review';
  return 'verified';
}

/* ------------------------------------------------------------------ */
/*  Raw signals awaiting / having passed the filter                     */
/* ------------------------------------------------------------------ */

interface RawSignal {
  id: string; sourceId: string; skillId: string; districtId: string;
  reportedVacancies: number; postedOn: string; wageOffered: number;
  flags: string[];
  corroboration: DemandSignal['corroboration'];
}

const RAW: RawSignal[] = [
  { id: 'SIG-24101', sourceId: 'src-bharat-forge', skillId: 'plc-scada', districtId: 'pune', reportedVacancies: 48, postedOn: '2026-09-08', wageOffered: 31000, flags: [],
    corroboration: { epfoJoiners: 41, gstTurnoverTrend: 'up', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24102', sourceId: 'src-jobboard-b', skillId: 'plc-scada', districtId: 'pune', reportedVacancies: 900, postedOn: '2026-09-08', wageOffered: 0, flags: ['no-wage-disclosed', 'bulk-identical-posting', 'employer-not-in-epfo'],
    corroboration: { epfoJoiners: 0, gstTurnoverTrend: null, repeatEmployer: false, duplicateOf: null } },
  { id: 'SIG-24103', sourceId: 'src-staffing-x', skillId: 'warehouse-operations', districtId: 'thane', reportedVacancies: 1200, postedOn: '2026-09-07', wageOffered: 11000, flags: ['wage-below-district-floor', 'reposted-unfilled-6m'],
    corroboration: { epfoJoiners: 26, gstTurnoverTrend: 'flat', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24104', sourceId: 'src-mahaev', skillId: 'ev-battery-diagnostics', districtId: 'pune', reportedVacancies: 120, postedOn: '2026-09-06', wageOffered: 26500, flags: [],
    corroboration: { epfoJoiners: 96, gstTurnoverTrend: 'up', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24105', sourceId: 'src-jobboard-a', skillId: 'ev-battery-diagnostics', districtId: 'pune', reportedVacancies: 140, postedOn: '2026-09-06', wageOffered: 26000, flags: ['duplicate-listing'],
    corroboration: { epfoJoiners: null, gstTurnoverTrend: null, repeatEmployer: false, duplicateOf: 'SIG-24104' } },
  { id: 'SIG-24106', sourceId: 'src-epfo', skillId: 'industrial-electrician', districtId: 'nashik', reportedVacancies: 210, postedOn: '2026-09-05', wageOffered: 22400, flags: [],
    corroboration: { epfoJoiners: 210, gstTurnoverTrend: 'up', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24107', sourceId: 'src-field', skillId: 'solar-pv-installation', districtId: 'nashik', reportedVacancies: 320, postedOn: '2026-09-05', wageOffered: 21000, flags: ['unverified-contact'],
    corroboration: { epfoJoiners: 148, gstTurnoverTrend: 'up', repeatEmployer: false, duplicateOf: null } },
  { id: 'SIG-24108', sourceId: 'src-naps', skillId: 'automotive-welding', districtId: 'csn', reportedVacancies: 180, postedOn: '2026-09-04', wageOffered: 19800, flags: [],
    corroboration: { epfoJoiners: 162, gstTurnoverTrend: 'flat', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24109', sourceId: 'src-jobboard-b', skillId: 'manual-data-entry', districtId: 'nagpur', reportedVacancies: 2400, postedOn: '2026-09-04', wageOffered: 9000, flags: ['bulk-identical-posting', 'wage-below-district-floor', 'reposted-unfilled-6m'],
    corroboration: { epfoJoiners: 4, gstTurnoverTrend: 'down', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24110', sourceId: 'src-gst', skillId: 'cad-pattern-design', districtId: 'kolhapur', reportedVacancies: 86, postedOn: '2026-09-03', wageOffered: 27000, flags: [],
    corroboration: { epfoJoiners: 61, gstTurnoverTrend: 'up', repeatEmployer: false, duplicateOf: null } },
  { id: 'SIG-24111', sourceId: 'src-staffing-x', skillId: 'sewing-machine-operation', districtId: 'kolhapur', reportedVacancies: 640, postedOn: '2026-09-03', wageOffered: 12500, flags: ['bulk-identical-posting', 'unverified-contact'],
    corroboration: { epfoJoiners: 38, gstTurnoverTrend: 'flat', repeatEmployer: false, duplicateOf: null } },
  { id: 'SIG-24112', sourceId: 'src-bharat-forge', skillId: 'automotive-welding', districtId: 'pune', reportedVacancies: 64, postedOn: '2026-09-02', wageOffered: 23000, flags: [],
    corroboration: { epfoJoiners: 58, gstTurnoverTrend: 'up', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24113', sourceId: 'src-mahaev', skillId: 'ev-charging-tech', districtId: 'nagpur', reportedVacancies: 95, postedOn: '2026-09-02', wageOffered: 23500, flags: [],
    corroboration: { epfoJoiners: 72, gstTurnoverTrend: 'up', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24114', sourceId: 'src-jobboard-a', skillId: 'voice-call-center', districtId: 'nagpur', reportedVacancies: 780, postedOn: '2026-09-01', wageOffered: 17500, flags: ['reposted-unfilled-6m'],
    corroboration: { epfoJoiners: 214, gstTurnoverTrend: 'flat', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24115', sourceId: 'src-field', skillId: 'drone-survey', districtId: 'csn', reportedVacancies: 54, postedOn: '2026-09-01', wageOffered: 29000, flags: [],
    corroboration: { epfoJoiners: 31, gstTurnoverTrend: 'up', repeatEmployer: false, duplicateOf: null } },
  { id: 'SIG-24116', sourceId: 'src-epfo', skillId: 'iot-device-tech', districtId: 'thane', reportedVacancies: 168, postedOn: '2026-08-31', wageOffered: 24000, flags: [],
    corroboration: { epfoJoiners: 168, gstTurnoverTrend: 'up', repeatEmployer: true, duplicateOf: null } },
  { id: 'SIG-24117', sourceId: 'src-jobboard-b', skillId: 'carburettor-repair', districtId: 'kolhapur', reportedVacancies: 310, postedOn: '2026-08-30', wageOffered: 10500, flags: ['bulk-identical-posting', 'employer-not-in-epfo'],
    corroboration: { epfoJoiners: 2, gstTurnoverTrend: 'down', repeatEmployer: false, duplicateOf: null } },
  { id: 'SIG-24118', sourceId: 'src-naps', skillId: 'plumbing', districtId: 'thane', reportedVacancies: 240, postedOn: '2026-08-29', wageOffered: 18600, flags: [],
    corroboration: { epfoJoiners: 198, gstTurnoverTrend: 'flat', repeatEmployer: true, duplicateOf: null } },
];

export const demandSignals: DemandSignal[] = RAW.map(r => {
  const source = signalSources.find(s => s.id === r.sourceId)!;
  const trustWeight = computeTrustWeight(source, r.flags);
  return {
    ...r,
    trustWeight,
    weightedVacancies: Math.round(r.reportedVacancies * trustWeight),
    verdict: verdictFor(trustWeight, r.flags),
  };
});

/** How much raw noise the filter removed - the headline number for Pillar 1. */
export function filterImpact() {
  const raw = demandSignals.reduce((a, s) => a + s.reportedVacancies, 0);
  const weighted = demandSignals.reduce((a, s) => a + s.weightedVacancies, 0);
  const rejected = demandSignals.filter(s => s.verdict === 'rejected' || s.verdict === 'quarantined').length;
  return {
    raw,
    weighted,
    removed: raw - weighted,
    removedPercent: Math.round(((raw - weighted) / raw) * 100),
    signalsScreened: demandSignals.length,
    signalsBlocked: rejected,
  };
}

/* ------------------------------------------------------------------ */
/*  Dying Task Watch                                                    */
/*                                                                      */
/*  A whole trade rarely dies. Individual TASKS inside it die, while     */
/*  the trade name survives - which is exactly why syllabi rot silently. */
/* ------------------------------------------------------------------ */

export const dyingTasks: DyingTask[] = [
  {
    id: 'DT-01',
    taskName: 'Carburettor tuning & float-bowl overhaul',
    skillId: 'carburettor-repair',
    shareOfTradeHours: 0.22,
    hoursChangeYoY: -61,
    displacedBy: 'Electronic fuel injection (EFI) diagnostics via OBD-II',
    affectedDistrictIds: ['pune', 'kolhapur', 'csn', 'nashik'],
    traineesExposed: 1840,
    syllabusModulesStillTeaching: ['MMV-04', 'MMV-05'],
    recommendedAction: 'Retire MMV-04; replace 120 h with EFI & OBD-II diagnostics module.',
    severity: 'critical',
  },
  {
    id: 'DT-02',
    taskName: 'CRT deflection-yoke & flyback replacement',
    skillId: 'crt-analog-repair',
    shareOfTradeHours: 0.34,
    hoursChangeYoY: -78,
    displacedBy: 'LED panel / SMPS board-level repair and display driver ICs',
    affectedDistrictIds: ['nagpur', 'csn', 'kolhapur'],
    traineesExposed: 620,
    syllabusModulesStillTeaching: ['ELX-07'],
    recommendedAction: 'Retire trade variant; migrate cohort to IoT Device Technician bridge.',
    severity: 'critical',
  },
  {
    id: 'DT-03',
    taskName: 'Manual chain-survey & dumpy-level traversing',
    skillId: 'manual-surveying',
    shareOfTradeHours: 0.41,
    hoursChangeYoY: -44,
    displacedBy: 'RTK-GNSS rovers and drone photogrammetry',
    affectedDistrictIds: ['csn', 'nagpur', 'nashik'],
    traineesExposed: 970,
    syllabusModulesStillTeaching: ['SUR-02', 'SUR-03'],
    recommendedAction: 'Compress to 40 h fundamentals; add Drone Survey Ops as elective.',
    severity: 'high',
  },
  {
    id: 'DT-04',
    taskName: 'Manual double-entry ledger posting',
    skillId: 'manual-data-entry',
    shareOfTradeHours: 0.29,
    hoursChangeYoY: -52,
    displacedBy: 'OCR ingestion + GST-linked auto-reconciliation',
    affectedDistrictIds: ['nagpur', 'thane', 'pune'],
    traineesExposed: 2310,
    syllabusModulesStillTeaching: ['BPO-03'],
    recommendedAction: 'Replace with exception-handling & reconciliation QC module.',
    severity: 'high',
  },
  {
    id: 'DT-05',
    taskName: 'Pit-loom shedding & manual shuttle changeover',
    skillId: 'handloom-weaving',
    shareOfTradeHours: 0.38,
    hoursChangeYoY: -33,
    displacedBy: 'Shuttleless rapier looms with electronic jacquard',
    affectedDistrictIds: ['kolhapur'],
    traineesExposed: 410,
    syllabusModulesStillTeaching: ['TEX-02'],
    recommendedAction: 'Retain as heritage elective; redirect 60% of seats to rapier operation.',
    severity: 'watch',
  },
  {
    id: 'DT-06',
    taskName: 'Contactor-relay ladder wiring (hard-wired logic)',
    skillId: 'industrial-electrician',
    shareOfTradeHours: 0.18,
    hoursChangeYoY: -27,
    displacedBy: 'PLC-based soft logic and VFD parameterisation',
    affectedDistrictIds: ['pune', 'nashik', 'thane'],
    traineesExposed: 3120,
    syllabusModulesStillTeaching: ['ELE-05'],
    recommendedAction: 'Halve hours; introduce mandatory 60 h PLC fundamentals.',
    severity: 'high',
  },
  {
    id: 'DT-07',
    taskName: 'Cold-call script reading without CRM context',
    skillId: 'voice-call-center',
    shareOfTradeHours: 0.24,
    hoursChangeYoY: -36,
    displacedBy: 'AI-assisted call handling; human escalation-only workflows',
    affectedDistrictIds: ['nagpur', 'pune', 'thane'],
    traineesExposed: 1560,
    syllabusModulesStillTeaching: ['BPO-01', 'BPO-02'],
    recommendedAction: 'Pivot to escalation handling, sentiment de-escalation and QA audit.',
    severity: 'high',
  },
];

/* ------------------------------------------------------------------ */
/*  Uncovered skills - demand with no matching course in the district   */
/* ------------------------------------------------------------------ */

export const uncoveredSkills: UncoveredSkill[] = [
  {
    id: 'UNC-01',
    skillName: 'Battery Pack Thermal Management Technician',
    sector: 'auto-ev',
    districtId: 'pune',
    weightedAnnualDemand: 1420,
    nearestExistingCourse: 'Advanced EV Technician (pune-ev-01)',
    bridgeGapWeeks: 8,
    requestingEmployers: ['MahaEV Mobility Cluster', 'Bharat Precision Forge', 'Volt Drive Systems'],
    medianWageOffered: 29500,
    proposedNsqfLevel: 5,
    status: 'proposed',
    evidenceSignalCount: 34,
  },
  {
    id: 'UNC-02',
    skillName: 'Green Hydrogen Electrolyser Maintenance',
    sector: 'electrical',
    districtId: 'nashik',
    weightedAnnualDemand: 380,
    nearestExistingCourse: null,
    bridgeGapWeeks: 24,
    requestingEmployers: ['Sahyadri Green Energy', 'NTPC Renewables (Nashik)'],
    medianWageOffered: 34000,
    proposedNsqfLevel: 5,
    status: 'unaddressed',
    evidenceSignalCount: 11,
  },
  {
    id: 'UNC-03',
    skillName: 'Industrial Robot Teach-Pendant Operation',
    sector: 'auto-ev',
    districtId: 'csn',
    weightedAnnualDemand: 890,
    nearestExistingCourse: 'Diploma in Industrial Automation (pune-plc-01)',
    bridgeGapWeeks: 10,
    requestingEmployers: ['Ashoka Auto Components', 'Marathwada Stampings', 'Endurance Systems'],
    medianWageOffered: 31000,
    proposedNsqfLevel: 5,
    status: 'approved',
    evidenceSignalCount: 27,
  },
  {
    id: 'UNC-04',
    skillName: 'Cold-Chain Refrigeration Technician (Pharma)',
    sector: 'construction',
    districtId: 'thane',
    weightedAnnualDemand: 1120,
    nearestExistingCourse: 'Electrician (tha-elec-01)',
    bridgeGapWeeks: 6,
    requestingEmployers: ['Cipla Logistics', 'BlueStar Cold Chain', 'Sun Pharma Warehousing'],
    medianWageOffered: 24000,
    proposedNsqfLevel: 4,
    status: 'proposed',
    evidenceSignalCount: 19,
  },
  {
    id: 'UNC-05',
    skillName: 'Agri-Drone Spraying Operator (DGCA Cert.)',
    sector: 'construction',
    districtId: 'nashik',
    weightedAnnualDemand: 1640,
    nearestExistingCourse: 'Drone Survey Operations (pune-drone-01)',
    bridgeGapWeeks: 4,
    requestingEmployers: ['Sahyadri Farms FPO', 'Nashik Grape Growers Assn.', 'AgriWings Services'],
    medianWageOffered: 26000,
    proposedNsqfLevel: 4,
    status: 'live',
    evidenceSignalCount: 41,
  },
  {
    id: 'UNC-06',
    skillName: 'Foundry Sand-Reclamation Plant Operator',
    sector: 'construction',
    districtId: 'kolhapur',
    weightedAnnualDemand: 470,
    nearestExistingCourse: null,
    bridgeGapWeeks: 14,
    requestingEmployers: ['Kolhapur Foundry Cluster (48 units)', 'Menon Castings'],
    medianWageOffered: 22500,
    proposedNsqfLevel: 4,
    status: 'unaddressed',
    evidenceSignalCount: 16,
  },
  {
    id: 'UNC-07',
    skillName: 'Railway Signalling & Telecom Assistant',
    sector: 'electrical',
    districtId: 'nagpur',
    weightedAnnualDemand: 740,
    nearestExistingCourse: 'Electrician (ngp-elec-01)',
    bridgeGapWeeks: 12,
    requestingEmployers: ['MAHA-Metro Nagpur', 'RVNL Central', 'Siemens Mobility'],
    medianWageOffered: 27500,
    proposedNsqfLevel: 5,
    status: 'proposed',
    evidenceSignalCount: 23,
  },
];
