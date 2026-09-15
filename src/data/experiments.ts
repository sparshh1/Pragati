import { SyllabusExperiment, SensorPractical } from '@/types';

/* ------------------------------------------------------------------ */
/*  Live Syllabus A/B Testing                                           */
/*                                                                      */
/*  A syllabus revision normally takes years and is judged by committee  */
/*  opinion. Here two cohorts in the same trade run different content    */
/*  concurrently, and the winner is decided by what actually happened    */
/*  to the candidates - work-trial pass rate, placement and wage.        */
/* ------------------------------------------------------------------ */

export const syllabusExperiments: SyllabusExperiment[] = [
  {
    id: 'EXP-2026-014',
    courseId: 'pune-mmv-01',
    hypothesis:
      'Replacing 120 h of carburettor content (MMV-04) with EFI & OBD-II diagnostics raises work-trial pass rate by at least 10 points without harming theory results.',
    status: 'concluded',
    startedOn: '2026-01-08',
    concludesOn: '2026-08-30',
    primaryMetric: 'trial-pass-rate',
    armA: {
      label: 'Control: v4.2 (carburettor retained)',
      syllabusVersion: 'v4.2',
      cohortSize: 120,
      changeSummary: 'Existing DGT syllabus. MMV-04 carburettor overhaul, 120 h.',
      trialPassRate: 61,
      placementRate: 54,
      medianWage: 17200,
      practicalHours: 1340,
    },
    armB: {
      label: 'Variant: v4.3-EFI',
      syllabusVersion: 'v4.3-EFI',
      cohortSize: 118,
      changeSummary: 'MMV-04 retired. 120 h reallocated to EFI, OBD-II live-PID diagnosis and sensor bench work.',
      trialPassRate: 79,
      placementRate: 72,
      medianWage: 19800,
      practicalHours: 1340,
    },
    liftPercent: 29.5,
    pValue: 0.003,
    decision: 'Promote v4.3-EFI state-wide from the January 2027 intake. Retire MMV-04 and MMV-05.',
    districtIds: ['pune', 'kolhapur', 'csn'],
  },
  {
    id: 'EXP-2026-021',
    courseId: 'pune-elec-01',
    hypothesis:
      'Halving contactor-relay hours (ELE-05) in favour of mandatory PLC fundamentals lifts median entry wage by ₹2,000/month.',
    status: 'running',
    startedOn: '2026-04-01',
    concludesOn: '2026-12-15',
    primaryMetric: 'median-wage',
    armA: {
      label: 'Control: v3.8',
      syllabusVersion: 'v3.8',
      cohortSize: 160,
      changeSummary: 'ELE-05 hard-wired logic at full 180 h; PLC as 200 h elective.',
      trialPassRate: 71,
      placementRate: 66,
      medianWage: 19400,
      practicalHours: 1420,
    },
    armB: {
      label: 'Variant: v3.9-PLC',
      syllabusVersion: 'v3.9-PLC',
      cohortSize: 158,
      changeSummary: 'ELE-05 compressed to 90 h. PLC fundamentals made core; 90 h added to VFD parameterisation.',
      trialPassRate: 77,
      placementRate: 70,
      medianWage: 21600,
      practicalHours: 1420,
    },
    liftPercent: 11.3,
    pValue: 0.041,
    decision: null,
    districtIds: ['pune', 'nashik', 'thane'],
  },
  {
    id: 'EXP-2026-029',
    courseId: 'pune-ev-01',
    hypothesis:
      'Front-loading HV safety and running pack thermal work on shared factory analysers raises trial pass rate above 85%.',
    status: 'running',
    startedOn: '2026-06-10',
    concludesOn: '2027-01-20',
    primaryMetric: 'trial-pass-rate',
    armA: {
      label: 'Control: v2.1',
      syllabusVersion: 'v2.1',
      cohortSize: 54,
      changeSummary: 'HV safety 60 h delivered mid-course on centre equipment.',
      trialPassRate: 74,
      placementRate: 69,
      medianWage: 25400,
      practicalHours: 500,
    },
    armB: {
      label: 'Variant: v2.2-Thermal',
      syllabusVersion: 'v2.2-Thermal',
      cohortSize: 52,
      changeSummary: 'HV safety moved to week 1. 40 h thermal-management practical added on MahaEV factory analysers via machine-sharing.',
      trialPassRate: 88,
      placementRate: 81,
      medianWage: 28200,
      practicalHours: 540,
    },
    liftPercent: 18.9,
    pValue: 0.018,
    decision: null,
    districtIds: ['pune', 'nagpur'],
  },
  {
    id: 'EXP-2026-008',
    courseId: 'csn-weld-01',
    hypothesis:
      'Assessing weld quality from inverter telemetry rather than visual inspection alone reduces employer rejection after placement.',
    status: 'promoted',
    startedOn: '2025-09-01',
    concludesOn: '2026-05-30',
    primaryMetric: 'placement-rate',
    armA: {
      label: 'Control: visual assessment',
      syllabusVersion: 'v3.0',
      cohortSize: 96,
      changeSummary: 'Practical graded by instructor visual inspection and bend test.',
      trialPassRate: 64,
      placementRate: 58,
      medianWage: 18100,
      practicalHours: 780,
    },
    armB: {
      label: 'Variant: sensor-verified',
      syllabusVersion: 'v3.1',
      cohortSize: 94,
      changeSummary: 'Arc-on time, current stability and heat input logged from the inverter and used as 45% of practical marks.',
      trialPassRate: 83,
      placementRate: 77,
      medianWage: 20400,
      practicalHours: 780,
    },
    liftPercent: 32.8,
    pValue: 0.001,
    decision: 'Promoted. Sensor-verified practicals are now mandatory for all welding trades state-wide.',
    districtIds: ['csn', 'kolhapur', 'nashik'],
  },
  {
    id: 'EXP-2025-033',
    courseId: 'csn-data-01',
    hypothesis:
      'Adding 60 h of spreadsheet automation to data entry raises placement rate.',
    status: 'rolled-back',
    startedOn: '2025-06-01',
    concludesOn: '2026-02-28',
    primaryMetric: 'placement-rate',
    armA: {
      label: 'Control: v1.2',
      syllabusVersion: 'v1.2',
      cohortSize: 88,
      changeSummary: 'Standard data entry and document handling.',
      trialPassRate: 68,
      placementRate: 41,
      medianWage: 12800,
      practicalHours: 220,
    },
    armB: {
      label: 'Variant: v1.3-Automation',
      syllabusVersion: 'v1.3-Automation',
      cohortSize: 86,
      changeSummary: '60 h spreadsheet macro automation added.',
      trialPassRate: 70,
      placementRate: 43,
      medianWage: 13100,
      practicalHours: 280,
    },
    liftPercent: 4.9,
    pValue: 0.38,
    decision:
      'Rolled back: lift not significant. The constraint is the trade itself, not the content. Referred to Dying Task Watch (DT-04); trade flagged for redesign, not tuning.',
    districtIds: ['csn', 'nagpur'],
  },
];

export function experimentsForCourse(courseId: string) {
  return syllabusExperiments.filter(e => e.courseId === courseId);
}

export function significanceLabel(p: number): { label: string; tone: 'rising' | 'stable' | 'declining' } {
  if (p < 0.01) return { label: 'Highly significant (p < 0.01)', tone: 'rising' };
  if (p < 0.05) return { label: `Significant (p = ${p.toFixed(3)})`, tone: 'rising' };
  if (p < 0.1) return { label: `Weak evidence (p = ${p.toFixed(2)})`, tone: 'stable' };
  return { label: `Not significant (p = ${p.toFixed(2)})`, tone: 'declining' };
}

/* ------------------------------------------------------------------ */
/*  Sensor-Verified Practicals                                          */
/*                                                                      */
/*  The practical mark is derived from what the machine recorded, not    */
/*  from a tick in a register. Where an instructor's score diverges from */
/*  the telemetry by more than 15 points, the record is flagged for      */
/*  audit - this is how ghost practicals surface.                        */
/* ------------------------------------------------------------------ */

export const DISCREPANCY_THRESHOLD = 15;

function mk(
  id: string, candidateName: string, candidateKsid: string, courseId: string, moduleCode: string,
  centreId: string, machineId: string, sensorKind: SensorPractical['sensorKind'], performedOn: string,
  telemetry: SensorPractical['telemetry'], machineMinutes: number, autoScore: number,
  instructorScore: number | null,
): SensorPractical {
  const discrepancyFlag =
    instructorScore !== null && Math.abs(instructorScore - autoScore) > DISCREPANCY_THRESHOLD;
  return {
    id, candidateName, candidateKsid, courseId, moduleCode, centreId, machineId, sensorKind,
    performedOn, telemetry, machineMinutes, autoScore, instructorScore, discrepancyFlag,
    verified: !discrepancyFlag && machineMinutes > 0,
  };
}

export const sensorPracticals: SensorPractical[] = [
  mk('SP-88201', 'Rahul Deshmukh', 'MH-CD-2026-418203', 'pune-ev-01', 'EV-04', 'ITI-PUNE-AUNDH', 'MCH-EV-021', 'ev-battery-analyser', '2026-08-04',
    [
      { metric: 'Cell voltage spread after balancing', value: 14, unit: 'mV', tolerance: '≤ 20 mV', pass: true },
      { metric: 'Peak module temperature at 1C', value: 41.2, unit: '°C', tolerance: '≤ 45 °C', pass: true },
      { metric: 'Insulation resistance', value: 62, unit: 'MΩ', tolerance: '≥ 50 MΩ', pass: true },
      { metric: 'HV isolation sequence steps completed', value: 7, unit: 'of 7', tolerance: '7 of 7', pass: true },
    ], 214, 88, 85),

  mk('SP-88202', 'Priya Kadam', 'MH-CD-2026-418244', 'pune-ev-01', 'EV-04', 'ITI-PUNE-AUNDH', 'MCH-EV-021', 'ev-battery-analyser', '2026-08-04',
    [
      { metric: 'Cell voltage spread after balancing', value: 9, unit: 'mV', tolerance: '≤ 20 mV', pass: true },
      { metric: 'Peak module temperature at 1C', value: 38.6, unit: '°C', tolerance: '≤ 45 °C', pass: true },
      { metric: 'Insulation resistance', value: 78, unit: 'MΩ', tolerance: '≥ 50 MΩ', pass: true },
      { metric: 'HV isolation sequence steps completed', value: 7, unit: 'of 7', tolerance: '7 of 7', pass: true },
    ], 226, 95, 93),

  mk('SP-88203', 'Amit Patil', 'MH-CD-2026-418310', 'pune-ev-01', 'EV-01', 'ITI-PUNE-AUNDH', 'MCH-EV-021', 'ev-battery-analyser', '2026-08-05',
    [
      { metric: 'HV isolation sequence steps completed', value: 4, unit: 'of 7', tolerance: '7 of 7', pass: false },
      { metric: 'Proving-unit verification before touch', value: 0, unit: 'events', tolerance: '≥ 1', pass: false },
      { metric: 'Insulation resistance', value: 55, unit: 'MΩ', tolerance: '≥ 50 MΩ', pass: true },
    ], 96, 46, 78),

  mk('SP-88204', 'Ganesh Joshi', 'MH-CD-2026-420117', 'csn-weld-01', 'WLD-04', 'ITI-CSN-CHIKALTHANA', 'MCH-WLD-108', 'weld-inverter', '2026-08-19',
    [
      { metric: 'Arc-on time', value: 412, unit: 's', tolerance: '≥ 360 s', pass: true },
      { metric: 'Current stability (σ)', value: 4.1, unit: 'A', tolerance: '≤ 6 A', pass: true },
      { metric: 'Heat input', value: 1.18, unit: 'kJ/mm', tolerance: '0.8–1.4 kJ/mm', pass: true },
      { metric: 'Travel speed variance', value: 8, unit: '%', tolerance: '≤ 12 %', pass: true },
    ], 188, 89, 86),

  mk('SP-88205', 'Anita Kamble', 'MH-CD-2026-420233', 'csn-weld-01', 'WLD-04', 'ITI-CSN-CHIKALTHANA', 'MCH-WLD-108', 'weld-inverter', '2026-08-19',
    [
      { metric: 'Arc-on time', value: 196, unit: 's', tolerance: '≥ 360 s', pass: false },
      { metric: 'Current stability (σ)', value: 11.8, unit: 'A', tolerance: '≤ 6 A', pass: false },
      { metric: 'Heat input', value: 1.62, unit: 'kJ/mm', tolerance: '0.8–1.4 kJ/mm', pass: false },
      { metric: 'Travel speed variance', value: 24, unit: '%', tolerance: '≤ 12 %', pass: false },
    ], 74, 41, 72),

  mk('SP-88206', 'Meena Kulkarni', 'MH-CD-2026-420190', 'csn-weld-01', 'WLD-05', 'ITI-CSN-CHIKALTHANA', 'MCH-WLD-109', 'weld-inverter', '2026-08-21',
    [
      { metric: 'Arc-on time', value: 388, unit: 's', tolerance: '≥ 360 s', pass: true },
      { metric: 'Current stability (σ)', value: 5.2, unit: 'A', tolerance: '≤ 6 A', pass: true },
      { metric: 'Purge oxygen at root', value: 180, unit: 'ppm', tolerance: '≤ 200 ppm', pass: true },
    ], 171, 82, 80),

  mk('SP-88207', 'Suresh Gaikwad', 'MH-CD-2026-422014', 'csn-cnc-01', 'CNC-03', 'ITI-CSN-CHIKALTHANA', 'MCH-CNC-044', 'cnc-controller', '2026-08-26',
    [
      { metric: 'Spindle run hours logged', value: 3.4, unit: 'h', tolerance: '≥ 3.0 h', pass: true },
      { metric: 'Dimensional deviation (CMM)', value: 0.018, unit: 'mm', tolerance: '≤ 0.03 mm', pass: true },
      { metric: 'Tool-change cycles executed', value: 22, unit: 'cycles', tolerance: '≥ 15', pass: true },
      { metric: 'Feed override deviations', value: 3, unit: 'events', tolerance: '≤ 5', pass: true },
    ], 204, 91, 88),

  mk('SP-88208', 'Vikram Sawant', 'MH-CD-2026-422088', 'csn-cnc-01', 'CNC-03', 'ITI-CSN-CHIKALTHANA', 'MCH-CNC-044', 'cnc-controller', '2026-08-26',
    [
      { metric: 'Spindle run hours logged', value: 0.0, unit: 'h', tolerance: '≥ 3.0 h', pass: false },
      { metric: 'Dimensional deviation (CMM)', value: 0, unit: 'mm', tolerance: '≤ 0.03 mm', pass: false },
      { metric: 'Tool-change cycles executed', value: 0, unit: 'cycles', tolerance: '≥ 15', pass: false },
    ], 0, 0, 84),

  mk('SP-88209', 'Neha Thakur', 'MH-CD-2026-423011', 'nsk-solar-01', 'SOL-06', 'ITI-NASHIK-SATPUR', 'MCH-SOL-012', 'clamp-meter', '2026-09-01',
    [
      { metric: 'String open-circuit voltage', value: 612, unit: 'V', tolerance: '580–640 V', pass: true },
      { metric: 'Earth continuity resistance', value: 0.38, unit: 'Ω', tolerance: '≤ 1 Ω', pass: true },
      { metric: 'Polarity verification before energisation', value: 1, unit: 'events', tolerance: '≥ 1', pass: true },
      { metric: 'IV curve fill factor', value: 0.74, unit: '-', tolerance: '≥ 0.70', pass: true },
    ], 142, 86, 84),

  mk('SP-88210', 'Aishwarya Chavan', 'MH-CD-2026-421008', 'tha-cad-01', 'CAD-05', 'ITI-KOLHAPUR-SHIVAJI', 'MCH-CAD-003', 'loom-counter', '2026-04-18',
    [
      { metric: 'Marker efficiency achieved', value: 84.2, unit: '%', tolerance: '≥ 82 %', pass: true },
      { metric: 'Plot-to-cut discrepancies', value: 1, unit: 'events', tolerance: '≤ 3', pass: true },
      { metric: 'Software active time', value: 198, unit: 'min', tolerance: '≥ 150 min', pass: true },
    ], 198, 92, 90),

  mk('SP-88211', 'Pooja Shinde', 'MH-CD-2026-419044', 'ngp-ev-01', 'EV-06', 'ITI-NAGPUR-KALMESHWAR', 'MCH-EV-033', 'ev-battery-analyser', '2026-08-12',
    [
      { metric: 'OCPP handshake completions', value: 6, unit: 'sessions', tolerance: '≥ 5', pass: true },
      { metric: 'DC fast-charge commissioning steps', value: 11, unit: 'of 12', tolerance: '≥ 11', pass: true },
      { metric: 'Earth leakage at energisation', value: 12, unit: 'mA', tolerance: '≤ 30 mA', pass: true },
    ], 176, 83, 81),

  mk('SP-88212', 'Sanjay Pawar', 'MH-CD-2026-418401', 'pune-plc-01', 'IA-04', 'ITI-PUNE-AUNDH', 'MCH-PLC-017', 'plc-rack', '2026-08-28',
    [
      { metric: 'Rungs compiled without error', value: 14, unit: 'rungs', tolerance: '≥ 12', pass: true },
      { metric: 'Forced I/O left active at end', value: 0, unit: 'points', tolerance: '0', pass: true },
      { metric: 'Safe-state transition verified', value: 1, unit: 'events', tolerance: '≥ 1', pass: true },
      { metric: 'PLC connected time', value: 164, unit: 'min', tolerance: '≥ 120 min', pass: true },
    ], 164, 90, 87),
];

export function practicalsForCandidate(ksid: string) {
  return sensorPracticals.filter(p => p.candidateKsid === ksid);
}

export function practicalStats() {
  const total = sensorPracticals.length;
  const flagged = sensorPracticals.filter(p => p.discrepancyFlag).length;
  const zeroMachineTime = sensorPracticals.filter(p => p.machineMinutes === 0).length;
  return {
    total,
    verified: sensorPracticals.filter(p => p.verified).length,
    flagged,
    zeroMachineTime,
    flaggedPercent: Math.round((flagged / total) * 100),
  };
}
