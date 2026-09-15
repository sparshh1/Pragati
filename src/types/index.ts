export type Sector = 'auto-ev' | 'electrical' | 'textile' | 'retail-bpo' | 'construction';
export type TrendDirection = 'rising' | 'stable' | 'declining';
export type SchemeCode = 'PMKVY-4.0' | 'SANKALP' | 'DGT-CTS' | 'NAPS';
export type CourseType = 'ITI' | 'Polytechnic' | 'PMKVY' | 'Private';
export type PledgeStatus = 'none' | 'interested' | 'committed';
export type EmployerType = 'MSME' | 'Enterprise';
export type IntegrityStatus = 'verified' | 'flagged' | 'pending';

export interface District {
  id: string;
  name: string;
  population: number;
  industries: string[];
  trainerCapacity: number;
  labCapacity: number;
  hostelCapacity: number;
  budgetLakhsCr: number;
}

export interface Skill {
  id: string;
  name: string;
  sector: Sector;
  nsqfLevel: number;
  salaryRange: [number, number]; // monthly INR [min, max]
}

export interface Course {
  id: string;
  name: string;
  districtId: string;
  skillIds: string[];
  currentSeats: number;
  enrolled: number;
  durationMonths: number;
  type: CourseType;
  scheme: SchemeCode | null;
}

export interface JobPosting {
  skillId: string;
  districtId: string;
  month: string; // "2025-01" format
  postingsCount: number;
}

export interface Employer {
  id: string;
  name: string;
  districtId: string;
  type: EmployerType;
  sector: Sector;
  employeeCount: number;
  hiringSkillIds: string[];
  pledgeStatus: PledgeStatus;
  pledgeCount: number;
}

export interface Student {
  id: string;
  name: string;
  districtId: string;
  enrolledCourseId: string | null;
  informalExperience: InformalExp[];
  currentNsqfLevel: number;
}

export interface InformalExp {
  skillTag: string;
  yearsOfExperience: number;
  toolsUsed: string[];
}

export interface TradeShift {
  fromSkillId: string;
  toSkillId: string;
  bridgeModuleName: string;
  bridgeDurationWeeks: number;
  bridgeCourseAvailableDistrictIds: string[];
}

export interface Scheme {
  code: SchemeCode;
  name: string;
  ministry: string;
  description: string;
  funds: string;
  eligibility: string;
}

export interface PlacementClaim {
  id: string;
  studentName: string;
  courseId: string;
  employerName: string;
  claimDate: string; // ISO date
  payrollMatch: boolean;
  status: IntegrityStatus;
}

// Computed types
export interface DemandTrendResult {
  skillId: string;
  districtId: string;
  slope: number; // postings per month change
  currentMonthlyDemand: number; // avg of last 3 months
  yoyChangePercent: number;
  forecast6m: number;
  direction: TrendDirection;
  timeSeries: { month: string; postingsCount: number }[];
}

export interface GapAnalysisResult {
  skillId: string;
  skillName: string;
  sector: Sector;
  districtId: string;
  annualDemand: number;
  currentSupply: number;
  gap: number;
  gapRatio: number;
  trend: TrendDirection;
  yoyChangePercent: number;
}

export interface SeatAllocation {
  courseId: string;
  courseName: string;
  skillId: string;
  skillName: string;
  currentSeats: number;
  recommendedSeats: number;
  change: number;
  blockingFactor: 'capacity' | 'budget' | 'none';
  mappedScheme: SchemeCode | null;
}

export interface RplResult {
  currentLevel: number;
  targetLevel: number;
  shortestPathHours: number;
  recommendedCourse: string;
  mappedSkills: string[];
}

export const SECTOR_LABELS: Record<Sector, string> = {
  'auto-ev': 'Automobile / EV',
  'electrical': 'Electrical / Electronics',
  'textile': 'Textile / Garment',
  'retail-bpo': 'Retail / BPO',
  'construction': 'Construction',
};

/* =================================================================== */
/*  PILLAR 1 - Demand Intelligence & Signal Verification Engine        */
/* =================================================================== */

export type SignalSourceKind =
  | 'employer-direct'
  | 'job-board'
  | 'staffing-agency'
  | 'epfo-payroll'
  | 'gst-invoice'
  | 'field-survey'
  | 'apprenticeship-portal';

export type SignalVerdict = 'verified' | 'under-review' | 'rejected' | 'quarantined';

export interface SignalSource {
  id: string;
  name: string;
  kind: SignalSourceKind;
  /** 0–100. Learned from how past signals from this source resolved. */
  trustScore: number;
  signalsSubmitted: number;
  signalsConfirmedByPayroll: number;
  /** Postings that were duplicated across boards by the same source. */
  duplicateRate: number;
  /** Postings that never converted into an EPFO-visible hire. */
  ghostPostingRate: number;
  lastAuditedOn: string;
}

/** One raw hiring signal before it is allowed to move the demand curve. */
export interface DemandSignal {
  id: string;
  sourceId: string;
  skillId: string;
  districtId: string;
  reportedVacancies: number;
  postedOn: string;
  wageOffered: number;
  /** Quality-filter outputs */
  trustWeight: number;        // 0–1 applied to reportedVacancies
  weightedVacancies: number;  // reportedVacancies × trustWeight
  verdict: SignalVerdict;
  flags: string[];
  /** Corroborating evidence found by the engine */
  corroboration: {
    epfoJoiners: number | null;
    gstTurnoverTrend: 'up' | 'flat' | 'down' | null;
    repeatEmployer: boolean;
    duplicateOf: string | null;
  };
}

/** Pillar 1 - Dying Task Watch operates at TASK level, below the skill. */
export interface DyingTask {
  id: string;
  taskName: string;
  skillId: string;
  /** Share of the parent skill's total work-hours this task still accounts for */
  shareOfTradeHours: number;
  /** Negative = shrinking */
  hoursChangeYoY: number;
  displacedBy: string;
  /** Districts where the decline is already visible in postings */
  affectedDistrictIds: string[];
  /** Candidates currently being trained on this dying task */
  traineesExposed: number;
  /** Modules in the live syllabus that still teach it */
  syllabusModulesStillTeaching: string[];
  recommendedAction: string;
  severity: 'critical' | 'high' | 'watch';
}

/** A skill the market demands but no course in the district covers. */
export interface UncoveredSkill {
  id: string;
  skillName: string;
  sector: Sector;
  districtId: string;
  weightedAnnualDemand: number;
  nearestExistingCourse: string | null;
  /** Weeks of new content needed on top of the nearest course */
  bridgeGapWeeks: number;
  requestingEmployers: string[];
  medianWageOffered: number;
  proposedNsqfLevel: number;
  status: 'unaddressed' | 'proposed' | 'approved' | 'live';
  evidenceSignalCount: number;
}

/* =================================================================== */
/*  PILLAR 2 - Employer-Locked Work & Hiring Pipeline                  */
/* =================================================================== */

export type PoolStatus = 'forming' | 'locked' | 'in-training' | 'trialling' | 'placed';

/** Several MSMEs too small to train alone pool one batch between them. */
export interface HiringPool {
  id: string;
  name: string;
  districtId: string;
  skillId: string;
  status: PoolStatus;
  /** Seats each member has legally committed to absorb */
  members: { employerId: string; seatsCommitted: number; wageFloor: number; signedOn: string }[];
  seatsRequired: number;
  batchStartDate: string;
  trainingCentreId: string;
  /** Only released when work-trial pass-rate clears the gate */
  subsidyPerSeat: number;
  candidatesEnrolled: number;
}

export type TrialOutcome = 'pending' | 'in-progress' | 'passed' | 'failed' | 'withdrawn';

/** The Work-Trial Gate: nobody is counted as "placed" until they clear it. */
export interface WorkTrial {
  id: string;
  poolId: string;
  candidateName: string;
  candidateKsid: string;
  employerId: string;
  skillId: string;
  startDate: string;
  durationDays: number;
  /** Stipend is paid by the state during the trial window */
  stipendPerDay: number;
  outcome: TrialOutcome;
  /** Gate criteria, each scored by the supervising employer */
  scorecard: { criterion: string; weight: number; score: number | null }[];
  supervisorRemarks: string;
  /** Set once EPFO shows the candidate on the employer's payroll */
  epfoConfirmedOn: string | null;
  offerCtc: number | null;
}

/* =================================================================== */
/*  PILLAR 3 - Adaptive Syllabus & Evidence-Based Evaluation           */
/* =================================================================== */

export interface SyllabusModule {
  code: string;
  title: string;
  hours: number;
  type: 'theory' | 'practical' | 'ojt' | 'soft-skill';
  tools: string[];
  outcomes: string[];
  /** Set when the Dying Task Watch has flagged this module's content */
  decayFlag?: string;
}

export interface Syllabus {
  courseId: string;
  version: string;
  effectiveFrom: string;
  totalHours: number;
  nsqfLevel: number;
  assessmentPattern: { component: string; weight: number }[];
  modules: SyllabusModule[];
  /** Variant label when this syllabus is part of a live A/B experiment */
  variant?: 'A' | 'B';
}

export type ExperimentStatus = 'running' | 'concluded' | 'promoted' | 'rolled-back';

/** Live Syllabus A/B Testing - two cohorts, same trade, different content. */
export interface SyllabusExperiment {
  id: string;
  courseId: string;
  hypothesis: string;
  status: ExperimentStatus;
  startedOn: string;
  concludesOn: string;
  armA: ExperimentArm;
  armB: ExperimentArm;
  primaryMetric: 'placement-rate' | 'trial-pass-rate' | 'median-wage';
  /** Statistical read-out */
  liftPercent: number;
  pValue: number;
  decision: string | null;
  districtIds: string[];
}

export interface ExperimentArm {
  label: string;
  syllabusVersion: string;
  cohortSize: number;
  changeSummary: string;
  trialPassRate: number;
  placementRate: number;
  medianWage: number;
  practicalHours: number;
}

export type SensorKind = 'cnc-controller' | 'weld-inverter' | 'ev-battery-analyser' | 'plc-rack' | 'loom-counter' | 'rtk-drone' | 'clamp-meter';

/** Sensor-Verified Practicals - machine telemetry, not an instructor's tick-box. */
export interface SensorPractical {
  id: string;
  candidateName: string;
  candidateKsid: string;
  courseId: string;
  moduleCode: string;
  centreId: string;
  machineId: string;
  sensorKind: SensorKind;
  performedOn: string;
  /** Raw machine readings the evaluation is derived from */
  telemetry: { metric: string; value: number; unit: string; tolerance: string; pass: boolean }[];
  machineMinutes: number;
  autoScore: number;
  instructorScore: number | null;
  /** Set where instructor score and machine telemetry disagree materially */
  discrepancyFlag: boolean;
  verified: boolean;
}

/* =================================================================== */
/*  PILLAR 4 - Constraint-Aware District Capacity Planner              */
/* =================================================================== */

/** The hard physical ceilings a seat plan may not exceed. */
export interface CapacityConstraint {
  districtId: string;
  certifiedTrainers: number;
  traineesPerTrainerMax: number;
  labStations: number;
  labShiftsPerDay: number;
  labDaysPerYear: number;
  hostelBeds: number;
  annualBudgetLakh: number;
  costPerSeatLakh: number;
  /** Seats currently notified across all courses */
  seatsNotified: number;
}

export interface SeatCalculation {
  districtId: string;
  demandDrivenSeats: number;
  trainerCeiling: number;
  labCeiling: number;
  hostelCeiling: number;
  budgetCeiling: number;
  /** The binding constraint - the minimum of the ceilings */
  hardLimit: number;
  bindingConstraint: 'trainer' | 'lab' | 'hostel' | 'budget' | 'demand';
  /** Seats notified above the hard limit - these are the "ghost classes" */
  ghostSeats: number;
  utilisationPercent: number;
}

export type MachineStatus = 'idle' | 'partially-used' | 'saturated' | 'under-maintenance';

/** Idle Machine Sharing - private factory + ITI capacity brokered as one pool. */
export interface Machine {
  id: string;
  name: string;
  kind: SensorKind;
  ownerType: 'iti' | 'polytechnic' | 'private-factory';
  ownerName: string;
  districtId: string;
  skillIds: string[];
  /** Hours the machine is technically available per week */
  capacityHoursPerWeek: number;
  bookedHoursPerWeek: number;
  status: MachineStatus;
  /** Offered to the shared pool at this rate */
  sharedRatePerHour: number;
  contactCell: string;
  lastServicedOn: string;
}

export interface MachineBooking {
  id: string;
  machineId: string;
  requestedBy: string;
  requesterType: 'iti' | 'msme' | 'candidate';
  courseId: string | null;
  hoursPerWeek: number;
  weeks: number;
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requestedOn: string;
}

/* =================================================================== */
/*  PILLAR 5 - Precision Career Pathways & RPL Engine                  */
/* =================================================================== */

export interface RplApplication {
  id: string;
  candidateName: string;
  candidateKsid: string;
  districtId: string;
  claimedSkillId: string;
  yearsOfExperience: number;
  currentEmployerName: string | null;
  /** Evidence the assessor weighs */
  evidence: { kind: string; detail: string; verified: boolean }[];
  assessedNsqfLevel: number | null;
  claimedNsqfLevel: number;
  bridgeHoursRequired: number;
  status: 'submitted' | 'assessment-scheduled' | 'certified' | 'rejected';
  /** Wage before and projected after formal certification */
  currentMonthlyWage: number;
  projectedMonthlyWage: number;
  submittedOn: string;
}

/* =================================================================== */
/*  PILLAR 6 - Multilingual Control Tower & Audit Engine               */
/* =================================================================== */

export interface LanguageSupport {
  code: string;
  name: string;
  nativeName: string;
  /** Share of the district population reporting this as first language */
  speakerShare: Record<string, number>;
  ivrAvailable: boolean;
  sttModelAccuracy: number;
  contentTranslatedPercent: number;
}

export interface VoiceSession {
  id: string;
  channel: 'ivr-call' | 'whatsapp-voice' | 'portal-mic';
  languageCode: string;
  districtId: string;
  intent: string;
  transcript: string;
  resolvedBy: 'bot' | 'escalated-to-officer';
  durationSeconds: number;
  satisfactionScore: number | null;
  occurredOn: string;
}

export type AuditVerdict = 'clean' | 'mismatch' | 'ghost-placement' | 'wage-shortfall' | 'awaiting-data';

/** EPFO Payroll Audit - placement claims reconciled against actual UAN payroll. */
export interface PayrollAudit {
  id: string;
  candidateName: string;
  candidateKsid: string;
  uan: string;
  claimedEmployerName: string;
  claimedEmployerId: string;
  courseId: string;
  districtId: string;
  claimedPlacementDate: string;
  claimedMonthlyWage: number;
  /** What EPFO actually shows */
  epfoEmployerName: string | null;
  epfoFirstContributionMonth: string | null;
  epfoDeclaredWage: number | null;
  monthsContributed: number;
  verdict: AuditVerdict;
  subsidyAtRisk: number;
  notes: string;
}

export interface ControlTowerAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  pillar: string;
  districtId: string | null;
  title: string;
  detail: string;
  raisedOn: string;
  requiredPermission: string;
  status: 'open' | 'acknowledged' | 'resolved';
}
