import { Syllabus, SyllabusModule } from '@/types';
import { courses } from './courses';

/* ------------------------------------------------------------------ */
/*  Course syllabi                                                      */
/*                                                                      */
/*  Structured to the DGT / NSQF pattern: every module carries hours,    */
/*  a delivery type, the tools actually used on the bench, and the       */
/*  learning outcomes an assessor signs against. Modules flagged with    */
/*  `decayFlag` are the ones the Dying Task Watch (Pillar 1) has         */
/*  matched to a shrinking task — this is where the two pillars meet.    */
/* ------------------------------------------------------------------ */

const ASSESSMENT_STANDARD = [
  { component: 'Theory examination', weight: 25 },
  { component: 'Sensor-verified practical', weight: 45 },
  { component: 'On-the-job training record', weight: 20 },
  { component: 'Employability & soft skills', weight: 10 },
];

const ASSESSMENT_SHORT_TERM = [
  { component: 'Theory examination', weight: 30 },
  { component: 'Sensor-verified practical', weight: 50 },
  { component: 'Employability & soft skills', weight: 20 },
];

const DETAILED: Record<string, Omit<Syllabus, 'courseId'>> = {
  /* ---------------- Mechanic Motor Vehicle (ITI, 24 months) --------- */
  'pune-mmv-01': {
    version: 'v4.2',
    effectiveFrom: '2024-08-01',
    totalHours: 2400,
    nsqfLevel: 4,
    assessmentPattern: ASSESSMENT_STANDARD,
    modules: [
      { code: 'MMV-01', title: 'Workshop Safety, Hand Tools & Measurement', hours: 160, type: 'practical',
        tools: ['Vernier caliper', 'Micrometer', 'Torque wrench', 'Bore gauge'],
        outcomes: ['Apply LOTO and PPE protocol on a live bay', 'Measure to 0.01 mm and record deviation'] },
      { code: 'MMV-02', title: 'Automotive Fundamentals & Vehicle Layout', hours: 180, type: 'theory',
        tools: ['Cutaway chassis model', 'Service manuals'],
        outcomes: ['Trace power flow from engine to wheel', 'Read an OEM wiring schematic'] },
      { code: 'MMV-03', title: 'Engine Systems: Construction & Dismantling', hours: 320, type: 'practical',
        tools: ['Engine stand', 'Dial gauge', 'Compression tester', 'Cylinder hone'],
        outcomes: ['Strip and reassemble a 4-cylinder engine to spec', 'Measure ring-gap and bearing clearance'] },
      { code: 'MMV-04', title: 'Carburettor Systems & Float-Bowl Overhaul', hours: 120, type: 'practical',
        tools: ['Carburettor synchroniser', 'Jet cleaning kit', 'Float gauge'],
        outcomes: ['Overhaul a variable-venturi carburettor', 'Set idle mixture by CO reading'],
        decayFlag: 'DT-01' },
      { code: 'MMV-05', title: 'Fuel Feed, Filters & Mechanical Pumps', hours: 100, type: 'practical',
        tools: ['Fuel pressure gauge', 'Vacuum pump'],
        outcomes: ['Diagnose fuel starvation faults on mechanical feed systems'],
        decayFlag: 'DT-01' },
      { code: 'MMV-06', title: 'Transmission, Clutch & Differential', hours: 260, type: 'practical',
        tools: ['Gearbox jack', 'Snap-ring pliers', 'Backlash gauge'],
        outcomes: ['Overhaul a constant-mesh gearbox', 'Set crown-wheel and pinion backlash'] },
      { code: 'MMV-07', title: 'Braking, Steering & Suspension', hours: 240, type: 'practical',
        tools: ['Brake bleeder', 'Wheel aligner', 'Spring compressor'],
        outcomes: ['Bleed and balance a dual-circuit hydraulic system', 'Set camber, caster and toe'] },
      { code: 'MMV-08', title: 'Auto Electrical & Battery Systems', hours: 220, type: 'practical',
        tools: ['Multimeter', 'Clamp meter', 'Battery load tester', 'Oscilloscope'],
        outcomes: ['Trace a parasitic drain', 'Test alternator ripple under load'] },
      { code: 'MMV-09', title: 'Electronic Fuel Injection & OBD-II Diagnostics', hours: 180, type: 'practical',
        tools: ['OBD-II scan tool', 'Injector tester', 'Lambda probe simulator'],
        outcomes: ['Read and interpret live PIDs', 'Isolate a lean-bank fault to component level'] },
      { code: 'MMV-10', title: 'HVAC & Comfort Systems', hours: 140, type: 'practical',
        tools: ['Recovery-recharge station', 'Leak detector'],
        outcomes: ['Evacuate, recharge and leak-test an R-134a circuit'] },
      { code: 'MMV-11', title: 'On-the-Job Training (Authorised Service Centre)', hours: 400, type: 'ojt',
        tools: ['Live workshop equipment'],
        outcomes: ['Complete 60 supervised job cards', 'Maintain a verified OJT logbook'] },
      { code: 'MMV-12', title: 'Employability Skills & Customer Handling', hours: 80, type: 'soft-skill',
        tools: ['Role-play scripts', 'DMS software'],
        outcomes: ['Explain a repair estimate to a customer in Marathi and Hindi'] },
    ],
  },

  /* ---------------- Advanced EV Technician (PMKVY, 6 months) -------- */
  'pune-ev-01': {
    version: 'v2.1',
    effectiveFrom: '2026-01-15',
    totalHours: 720,
    nsqfLevel: 4,
    assessmentPattern: ASSESSMENT_SHORT_TERM,
    modules: [
      { code: 'EV-01', title: 'High-Voltage Safety & Isolation Procedure', hours: 60, type: 'practical',
        tools: ['Class-0 HV gloves', 'Insulation resistance tester', 'HV lockout kit'],
        outcomes: ['Execute a compliant HV isolation and proving sequence', 'Respond to a thermal-runaway drill'] },
      { code: 'EV-02', title: 'Cell Chemistry, Pack Architecture & Ageing', hours: 80, type: 'theory',
        tools: ['Cut-section LFP and NMC modules'],
        outcomes: ['Compare LFP vs NMC degradation behaviour', 'Interpret a capacity-fade curve'] },
      { code: 'EV-03', title: 'Battery Management Systems & CAN Diagnostics', hours: 120, type: 'practical',
        tools: ['CAN bus analyser', 'BMS development kit', 'Laptop diagnostics suite'],
        outcomes: ['Decode BMS fault frames on CAN', 'Identify a cell-imbalance fault from log data'] },
      { code: 'EV-04', title: 'Pack Assembly, Balancing & Thermal Management', hours: 140, type: 'practical',
        tools: ['Spot welder', 'Cell balancer', 'Thermal imaging camera', 'Battery analyser'],
        outcomes: ['Build and balance a 48 V module to ±20 mV', 'Map hotspots under 1C discharge'] },
      { code: 'EV-05', title: 'Traction Motors, Controllers & Regen', hours: 100, type: 'practical',
        tools: ['Motor dynamometer', 'Controller programming tool'],
        outcomes: ['Parameterise a BLDC controller', 'Verify regen braking energy recovery'] },
      { code: 'EV-06', title: 'Charging Infrastructure: AC, DC & Protocols', hours: 80, type: 'practical',
        tools: ['AC Type-2 charger', 'DC fast-charge simulator', 'OCPP test harness'],
        outcomes: ['Commission a 22 kW AC point', 'Trace an OCPP handshake failure'] },
      { code: 'EV-07', title: 'Workshop Placement (OEM / Fleet Depot)', hours: 120, type: 'ojt',
        tools: ['Live fleet vehicles'],
        outcomes: ['Complete 30 supervised service interventions'] },
      { code: 'EV-08', title: 'Digital Job-Card & Customer Communication', hours: 20, type: 'soft-skill',
        tools: ['Fleet management software'],
        outcomes: ['Raise a compliant digital job card with evidence photos'] },
    ],
  },

  /* ---------------- Electrician (ITI, 24 months) -------------------- */
  'pune-elec-01': {
    version: 'v3.8',
    effectiveFrom: '2025-07-01',
    totalHours: 2400,
    nsqfLevel: 4,
    assessmentPattern: ASSESSMENT_STANDARD,
    modules: [
      { code: 'ELE-01', title: 'Electrical Safety, First Aid & Earthing', hours: 140, type: 'practical',
        tools: ['Earth resistance tester', 'Insulation megger', 'Rescue hook'],
        outcomes: ['Measure and certify earth pit resistance', 'Perform CPR on a shock casualty manikin'] },
      { code: 'ELE-02', title: 'DC & AC Circuit Fundamentals', hours: 200, type: 'theory',
        tools: ['Breadboard trainer', 'Function generator'],
        outcomes: ['Apply Kirchhoff analysis to a mesh network', 'Compute power factor in RLC loads'] },
      { code: 'ELE-03', title: 'Domestic & Industrial Wiring Practice', hours: 320, type: 'practical',
        tools: ['Conduit bender', 'Crimping set', 'Cable tester'],
        outcomes: ['Install a 3-phase distribution board to IS 732', 'Size cable for a declared load'] },
      { code: 'ELE-04', title: 'Transformers, Motors & Generators', hours: 300, type: 'practical',
        tools: ['Motor test bench', 'Growler', 'Tachometer'],
        outcomes: ['Rewind a single-phase induction motor', 'Run OC and SC tests on a transformer'] },
      { code: 'ELE-05', title: 'Contactor-Relay Control & Hard-Wired Logic', hours: 180, type: 'practical',
        tools: ['Contactor panel', 'Timer relays', 'Overload relays'],
        outcomes: ['Wire a star-delta starter from a ladder diagram'],
        decayFlag: 'DT-06' },
      { code: 'ELE-06', title: 'PLC Fundamentals & Ladder Programming', hours: 200, type: 'practical',
        tools: ['Siemens S7-1200', 'TIA Portal', 'Simulation rack'],
        outcomes: ['Write and commission a 12-rung ladder program', 'Force I/O safely during commissioning'] },
      { code: 'ELE-07', title: 'VFDs, Soft Starters & Drive Parameterisation', hours: 160, type: 'practical',
        tools: ['ABB ACS580 drive', 'Clamp-on power analyser'],
        outcomes: ['Parameterise a VFD for constant-torque load', 'Diagnose a DC-bus overvoltage trip'] },
      { code: 'ELE-08', title: 'Illumination, Solar PV & Energy Efficiency', hours: 180, type: 'practical',
        tools: ['Lux meter', 'Solar irradiance meter', 'String tester'],
        outcomes: ['Design a lighting layout to required lux', 'Commission a 5 kW rooftop string'] },
      { code: 'ELE-09', title: 'Industrial Attachment (OJT)', hours: 620, type: 'ojt',
        tools: ['Host plant equipment'],
        outcomes: ['Complete a supervised shutdown maintenance cycle'] },
      { code: 'ELE-10', title: 'Employability Skills & Estimation', hours: 100, type: 'soft-skill',
        tools: ['Estimation spreadsheets'],
        outcomes: ['Prepare a material estimate and quotation for a wiring job'] },
    ],
  },

  /* ---------------- Industrial Automation (Polytechnic, 36 months) -- */
  'pune-plc-01': {
    version: 'v2.4',
    effectiveFrom: '2025-08-01',
    totalHours: 3240,
    nsqfLevel: 5,
    assessmentPattern: ASSESSMENT_STANDARD,
    modules: [
      { code: 'IA-01', title: 'Engineering Mathematics & Control Theory', hours: 360, type: 'theory',
        tools: ['MATLAB/Octave'], outcomes: ['Model a first-order process and tune a PID loop'] },
      { code: 'IA-02', title: 'Sensors, Transducers & Signal Conditioning', hours: 280, type: 'practical',
        tools: ['RTD/thermocouple trainers', 'Loop calibrator', '4-20 mA simulator'],
        outcomes: ['Calibrate a 4-20 mA transmitter to ±0.5% FS'] },
      { code: 'IA-03', title: 'PLC Hardware, I/O & Networking', hours: 400, type: 'practical',
        tools: ['Siemens S7-1500', 'Allen-Bradley CompactLogix', 'Profinet switch'],
        outcomes: ['Configure a distributed I/O rack over Profinet'] },
      { code: 'IA-04', title: 'Advanced Ladder, SFC & Structured Text', hours: 360, type: 'practical',
        tools: ['TIA Portal', 'Studio 5000'],
        outcomes: ['Implement a batch sequence in SFC with safe-state handling'] },
      { code: 'IA-05', title: 'SCADA, HMI Design & Historians', hours: 320, type: 'practical',
        tools: ['WinCC', 'Ignition', 'SQL historian'],
        outcomes: ['Build an alarm-rationalised HMI to ISA-101 principles'] },
      { code: 'IA-06', title: 'Industrial Communication & Cybersecurity', hours: 240, type: 'theory',
        tools: ['Modbus TCP analyser', 'OPC-UA client'],
        outcomes: ['Segment an OT network to the Purdue model'] },
      { code: 'IA-07', title: 'Pneumatics, Hydraulics & Motion Control', hours: 280, type: 'practical',
        tools: ['Festo pneumatic trainer', 'Servo drive kit'],
        outcomes: ['Commission a 2-axis pick-and-place cycle'] },
      { code: 'IA-08', title: 'Industrial Robotics & Teach-Pendant Operation', hours: 260, type: 'practical',
        tools: ['6-axis cobot', 'Teach pendant', 'Gripper toolset'],
        outcomes: ['Program a palletising routine with collision zones'] },
      { code: 'IA-09', title: 'Industry Internship', hours: 560, type: 'ojt',
        tools: ['Host plant automation systems'],
        outcomes: ['Deliver one commissioning or retrofit project with documentation'] },
      { code: 'IA-10', title: 'Project Work, Documentation & Communication', hours: 180, type: 'soft-skill',
        tools: ['CAD-E', 'Technical writing templates'],
        outcomes: ['Produce a complete I/O schedule and as-built document set'] },
    ],
  },

  /* ---------------- Welder (ITI, 12 months) ------------------------- */
  'csn-weld-01': {
    version: 'v3.1',
    effectiveFrom: '2025-04-01',
    totalHours: 1200,
    nsqfLevel: 4,
    assessmentPattern: ASSESSMENT_STANDARD,
    modules: [
      { code: 'WLD-01', title: 'Welding Safety, Fumes & Fire Watch', hours: 80, type: 'practical',
        tools: ['PPE set', 'Fume extractor', 'Gas detector'],
        outcomes: ['Set up a compliant hot-work permit area'] },
      { code: 'WLD-02', title: 'Joint Preparation, Symbols & Metallurgy', hours: 140, type: 'theory',
        tools: ['Bevelling machine', 'Weld gauges'],
        outcomes: ['Read AWS weld symbols', 'Select filler for dissimilar joints'] },
      { code: 'WLD-03', title: 'SMAW — Flat, Horizontal & Vertical', hours: 240, type: 'practical',
        tools: ['Inverter welding set', 'Electrode oven', 'Chipping hammer'],
        outcomes: ['Deposit a 3G fillet passing visual and bend test'] },
      { code: 'WLD-04', title: 'GMAW / MIG for Automotive Sheet', hours: 220, type: 'practical',
        tools: ['MIG inverter', 'Wire feeder', 'Shielding gas mixer'],
        outcomes: ['Weld 1.2 mm sheet without burn-through', 'Hold arc-on time within takt'] },
      { code: 'WLD-05', title: 'GTAW / TIG for Stainless & Aluminium', hours: 220, type: 'practical',
        tools: ['AC/DC TIG set', 'Purge kit', 'Tungsten grinder'],
        outcomes: ['Produce a purged stainless butt weld to X-ray quality'] },
      { code: 'WLD-06', title: 'Inspection, NDT & Defect Analysis', hours: 120, type: 'practical',
        tools: ['Dye-penetrant kit', 'Ultrasonic flaw detector', 'Weld gauge set'],
        outcomes: ['Classify porosity, undercut and lack-of-fusion defects'] },
      { code: 'WLD-07', title: 'Shop-Floor Attachment', hours: 140, type: 'ojt',
        tools: ['Production welding cells'],
        outcomes: ['Complete 40 production coupons at accepted reject rate'] },
      { code: 'WLD-08', title: 'Employability & Productivity Discipline', hours: 40, type: 'soft-skill',
        tools: ['5S boards'], outcomes: ['Sustain a 5S audit score above 80%'] },
    ],
  },

  /* ---------------- Solar PV Installer (PMKVY, 3 months) ------------ */
  'nsk-solar-01': {
    version: 'v1.9',
    effectiveFrom: '2026-02-01',
    totalHours: 420,
    nsqfLevel: 4,
    assessmentPattern: ASSESSMENT_SHORT_TERM,
    modules: [
      { code: 'SOL-01', title: 'Work-at-Height & Electrical Safety', hours: 40, type: 'practical',
        tools: ['Full-body harness', 'Anchor line', 'DC isolator'],
        outcomes: ['Complete a rooftop fall-arrest setup and rescue drill'] },
      { code: 'SOL-02', title: 'Solar Resource, Shading & Site Survey', hours: 50, type: 'practical',
        tools: ['Irradiance meter', 'Shading analyser', 'Inclinometer'],
        outcomes: ['Produce a shade-corrected generation estimate for a rooftop'] },
      { code: 'SOL-03', title: 'Module, Inverter & BOS Selection', hours: 60, type: 'theory',
        tools: ['Datasheets', 'String sizing calculators'],
        outcomes: ['Size a string within inverter MPPT voltage window across temperature'] },
      { code: 'SOL-04', title: 'Mounting Structure & Mechanical Installation', hours: 80, type: 'practical',
        tools: ['Torque wrench', 'Structure jig', 'Anti-corrosive kit'],
        outcomes: ['Erect a wind-rated mounting structure to drawing'] },
      { code: 'SOL-05', title: 'DC/AC Wiring, Earthing & Protection', hours: 90, type: 'practical',
        tools: ['MC4 crimper', 'SPD kit', 'Earth tester'],
        outcomes: ['Terminate strings and verify polarity before energisation'] },
      { code: 'SOL-06', title: 'Commissioning, Net-Metering & O&M', hours: 70, type: 'practical',
        tools: ['IV curve tracer', 'Clamp meter', 'Thermal camera'],
        outcomes: ['Trace an IV curve and diagnose a mismatched string'] },
      { code: 'SOL-07', title: 'MSEDCL Paperwork & Customer Handover', hours: 30, type: 'soft-skill',
        tools: ['Net-metering application portal'],
        outcomes: ['File a complete net-metering application without rework'] },
    ],
  },

  /* ---------------- CAD Pattern Design (short-term) ----------------- */
  'tha-cad-01': {
    version: 'v2.0',
    effectiveFrom: '2026-03-01',
    totalHours: 480,
    nsqfLevel: 5,
    assessmentPattern: ASSESSMENT_SHORT_TERM,
    modules: [
      { code: 'CAD-01', title: 'Anthropometry & Size Charts', hours: 50, type: 'theory',
        tools: ['Size chart datasets'], outcomes: ['Build an Indian-fit size set from body measurements'] },
      { code: 'CAD-02', title: 'Manual Pattern Drafting Foundations', hours: 70, type: 'practical',
        tools: ['Pattern paper', 'French curve', 'Notcher'],
        outcomes: ['Draft a bodice and sleeve block to measurement'] },
      { code: 'CAD-03', title: 'Digital Pattern Making (Tukatech / Gerber)', hours: 120, type: 'practical',
        tools: ['Tukatech TUKAcad', 'Digitiser tablet'],
        outcomes: ['Digitise and true a block within 2 mm tolerance'] },
      { code: 'CAD-04', title: 'Grading & Size-Set Generation', hours: 90, type: 'practical',
        tools: ['Grading rules library'],
        outcomes: ['Grade a style across 6 sizes with consistent balance'] },
      { code: 'CAD-05', title: 'Marker Making & Fabric Utilisation', hours: 90, type: 'practical',
        tools: ['Marker planning software', 'Plotter'],
        outcomes: ['Achieve above 82% marker efficiency on a live order'] },
      { code: 'CAD-06', title: '3D Virtual Sampling & Fit Simulation', hours: 40, type: 'practical',
        tools: ['CLO 3D'], outcomes: ['Run a tension-map fit check before first physical sample'] },
      { code: 'CAD-07', title: 'Buyer Tech-Packs & Communication', hours: 20, type: 'soft-skill',
        tools: ['Tech-pack templates'], outcomes: ['Respond to a buyer fit comment with a revised pattern'] },
    ],
  },

  /* ---------------- Drone Survey Operations ------------------------- */
  'pune-drone-01': {
    version: 'v1.4',
    effectiveFrom: '2026-04-01',
    totalHours: 360,
    nsqfLevel: 5,
    assessmentPattern: ASSESSMENT_SHORT_TERM,
    modules: [
      { code: 'DRN-01', title: 'DGCA Regulation, Airspace & Digital Sky', hours: 50, type: 'theory',
        tools: ['Digital Sky portal'], outcomes: ['File a compliant flight plan in a yellow zone'] },
      { code: 'DRN-02', title: 'Airframe, Payload & Pre-Flight Checks', hours: 50, type: 'practical',
        tools: ['Quadcopter platform', 'RTK module', 'Payload gimbal'],
        outcomes: ['Complete a documented pre-flight and compass calibration'] },
      { code: 'DRN-03', title: 'Manual & Autonomous Flight Operations', hours: 90, type: 'practical',
        tools: ['Ground control station', 'Simulator'],
        outcomes: ['Fly a lawnmower grid with 75% overlap', 'Recover from a GPS-denied event'] },
      { code: 'DRN-04', title: 'Photogrammetry & Point-Cloud Processing', hours: 90, type: 'practical',
        tools: ['Pix4D / WebODM', 'GCP kit'],
        outcomes: ['Produce an orthomosaic within 5 cm horizontal accuracy'] },
      { code: 'DRN-05', title: 'Volumetrics, Cadastral & Crop Analytics', hours: 60, type: 'practical',
        tools: ['QGIS', 'NDVI processing chain'],
        outcomes: ['Compute stockpile volume and validate against survey'] },
      { code: 'DRN-06', title: 'Client Reporting & Data Handover', hours: 20, type: 'soft-skill',
        tools: ['Report templates'], outcomes: ['Deliver a survey report with accuracy statement'] },
    ],
  },
};

/* ------------------------------------------------------------------ */
/*  Fallback generator                                                  */
/*                                                                      */
/*  Every course in the catalogue must open to a syllabus. Courses       */
/*  without a hand-authored breakdown get a structurally valid one       */
/*  derived from their duration and NSQF level.                         */
/* ------------------------------------------------------------------ */

const GENERIC_SHAPE: { title: string; share: number; type: SyllabusModule['type']; tools: string[]; outcome: string }[] = [
  { title: 'Trade Safety, Tools & Workplace Practice', share: 0.10, type: 'practical',
    tools: ['PPE set', 'Hand tools', 'Measuring instruments'], outcome: 'Work safely to trade-specific protocol' },
  { title: 'Trade Theory & Applied Science', share: 0.18, type: 'theory',
    tools: ['Trade manuals', 'Charts and cut-sections'], outcome: 'Explain the working principle of core trade equipment' },
  { title: 'Core Practical — Foundation Operations', share: 0.22, type: 'practical',
    tools: ['Trade workbench', 'Primary machinery'], outcome: 'Complete foundation jobs within stated tolerance' },
  { title: 'Core Practical — Advanced Operations', share: 0.20, type: 'practical',
    tools: ['Advanced trade machinery', 'Diagnostic instruments'], outcome: 'Diagnose and correct process faults independently' },
  { title: 'Digital Tools & Documentation', share: 0.08, type: 'practical',
    tools: ['Job-card software', 'Spreadsheets'], outcome: 'Record work digitally against a job card' },
  { title: 'On-the-Job Training', share: 0.16, type: 'ojt',
    tools: ['Host industry equipment'], outcome: 'Complete supervised production work at industry pace' },
  { title: 'Employability Skills', share: 0.06, type: 'soft-skill',
    tools: ['Communication labs'], outcome: 'Handle workplace communication in Marathi, Hindi and basic English' },
];

function generateSyllabus(courseId: string): Syllabus {
  const course = courses.find(c => c.id === courseId);
  const months = course?.durationMonths ?? 6;
  const totalHours = months * 100;
  const prefix = (course?.name ?? 'GEN').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

  const modules: SyllabusModule[] = GENERIC_SHAPE.map((m, i) => ({
    code: `${prefix}-${String(i + 1).padStart(2, '0')}`,
    title: m.title,
    hours: Math.round((totalHours * m.share) / 10) * 10,
    type: m.type,
    tools: m.tools,
    outcomes: [m.outcome],
  }));

  return {
    courseId,
    version: 'v1.0',
    effectiveFrom: '2025-07-01',
    totalHours: modules.reduce((a, m) => a + m.hours, 0),
    nsqfLevel: course?.type === 'Polytechnic' ? 5 : course?.type === 'ITI' ? 4 : 3,
    assessmentPattern: months >= 12 ? ASSESSMENT_STANDARD : ASSESSMENT_SHORT_TERM,
    modules,
  };
}

export function getSyllabus(courseId: string): Syllabus {
  const detailed = DETAILED[courseId];
  if (detailed) return { courseId, ...detailed };
  return generateSyllabus(courseId);
}

export function hasDetailedSyllabus(courseId: string): boolean {
  return courseId in DETAILED;
}

/** Modules across the whole catalogue that still teach a dying task. */
export function decayingModules() {
  return courses.flatMap(c =>
    getSyllabus(c.id).modules
      .filter(m => m.decayFlag)
      .map(m => ({ course: c, module: m })),
  );
}

export const MODULE_TYPE_LABEL: Record<SyllabusModule['type'], string> = {
  theory: 'Theory',
  practical: 'Practical',
  ojt: 'On-the-Job',
  'soft-skill': 'Employability',
};
