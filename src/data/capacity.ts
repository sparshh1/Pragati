import { CapacityConstraint, SeatCalculation, Machine, MachineBooking } from '@/types';
import { districts } from './districts';
import { courses } from './courses';

/* ------------------------------------------------------------------ */
/*  Hard-Limit Seat Calculator                                          */
/*                                                                      */
/*  Seat plans are usually drawn from demand alone, which is why        */
/*  districts notify batches that physically cannot run — no trainer,    */
/*  no bench, no bed, no money. Here demand proposes; the binding        */
/*  physical constraint disposes. Seats notified above the hard limit    */
/*  are ghost classes and are reported as such.                         */
/* ------------------------------------------------------------------ */

export const capacityConstraints: CapacityConstraint[] = [
  { districtId: 'pune',     certifiedTrainers: 412, traineesPerTrainerMax: 24, labStations: 1180, labShiftsPerDay: 2, labDaysPerYear: 240, hostelBeds: 2800, annualBudgetLakh: 1850, costPerSeatLakh: 0.42, seatsNotified: 9400 },
  { districtId: 'nashik',   certifiedTrainers: 268, traineesPerTrainerMax: 24, labStations: 760,  labShiftsPerDay: 2, labDaysPerYear: 240, hostelBeds: 1900, annualBudgetLakh: 1220, costPerSeatLakh: 0.40, seatsNotified: 6800 },
  { districtId: 'csn',      certifiedTrainers: 196, traineesPerTrainerMax: 24, labStations: 540,  labShiftsPerDay: 2, labDaysPerYear: 240, hostelBeds: 1500, annualBudgetLakh: 980,  costPerSeatLakh: 0.38, seatsNotified: 5900 },
  { districtId: 'nagpur',   certifiedTrainers: 241, traineesPerTrainerMax: 24, labStations: 690,  labShiftsPerDay: 2, labDaysPerYear: 240, hostelBeds: 1800, annualBudgetLakh: 1100, costPerSeatLakh: 0.39, seatsNotified: 7200 },
  { districtId: 'thane',    certifiedTrainers: 352, traineesPerTrainerMax: 24, labStations: 980,  labShiftsPerDay: 2, labDaysPerYear: 240, hostelBeds: 2400, annualBudgetLakh: 1550, costPerSeatLakh: 0.44, seatsNotified: 8600 },
  { districtId: 'kolhapur', certifiedTrainers: 164, traineesPerTrainerMax: 24, labStations: 440,  labShiftsPerDay: 2, labDaysPerYear: 240, hostelBeds: 1200, annualBudgetLakh: 800,  costPerSeatLakh: 0.36, seatsNotified: 4900 },
];

export function getConstraint(districtId: string) {
  return capacityConstraints.find(c => c.districtId === districtId);
}

/** Annual demand-driven seat ask per district, from weighted signals. */
export const demandDrivenAsk: Record<string, number> = {
  pune: 12400,
  nashik: 7900,
  csn: 7100,
  nagpur: 8300,
  thane: 10200,
  kolhapur: 5400,
};

/**
 * Each ceiling is computed independently; the hard limit is their minimum.
 * A seat plan that ignores the binding constraint produces ghost classes —
 * seats on paper that no trainer, bench, bed or rupee can actually deliver.
 */
export function computeSeatCalculation(
  districtId: string,
  opts?: Partial<Pick<CapacityConstraint, 'certifiedTrainers' | 'labStations' | 'hostelBeds' | 'annualBudgetLakh' | 'labShiftsPerDay'>> & { demandOverride?: number },
): SeatCalculation {
  const base = getConstraint(districtId)!;
  const c = { ...base, ...opts };
  const demand = opts?.demandOverride ?? demandDrivenAsk[districtId] ?? 0;

  const trainerCeiling = c.certifiedTrainers * c.traineesPerTrainerMax;
  // Each station serves one trainee per shift; a course occupies a station for
  // roughly a third of the training year, so annual throughput is 3x the
  // concurrent station-shift capacity.
  const labCeiling = Math.round(c.labStations * c.labShiftsPerDay * 3);
  // Only the residential share of candidates needs a bed — assume 45%.
  const hostelCeiling = Math.round(c.hostelBeds / 0.45);
  const budgetCeiling = Math.floor(c.annualBudgetLakh / c.costPerSeatLakh);

  const ceilings: { key: SeatCalculation['bindingConstraint']; value: number }[] = [
    { key: 'trainer', value: trainerCeiling },
    { key: 'lab', value: labCeiling },
    { key: 'hostel', value: hostelCeiling },
    { key: 'budget', value: budgetCeiling },
    { key: 'demand', value: demand },
  ];
  const binding = ceilings.reduce((min, x) => (x.value < min.value ? x : min));
  const hardLimit = binding.value;

  return {
    districtId,
    demandDrivenSeats: demand,
    trainerCeiling,
    labCeiling,
    hostelCeiling,
    budgetCeiling,
    hardLimit,
    bindingConstraint: binding.key,
    ghostSeats: Math.max(0, base.seatsNotified - hardLimit),
    utilisationPercent: Math.round((base.seatsNotified / hardLimit) * 100),
  };
}

export function allSeatCalculations(): SeatCalculation[] {
  return districts.map(d => computeSeatCalculation(d.id));
}

export const CONSTRAINT_LABEL: Record<SeatCalculation['bindingConstraint'], string> = {
  trainer: 'Certified trainers',
  lab: 'Lab bench-shifts',
  hostel: 'Residential beds',
  budget: 'Annual budget',
  demand: 'Verified demand',
};

/* ------------------------------------------------------------------ */
/*  Idle Machine Sharing                                                */
/*                                                                      */
/*  The lab ceiling above is the binding constraint in four of six       */
/*  districts — and meanwhile private factories sit on idle capacity     */
/*  on second and third shift. Both sides are listed in one pool and     */
/*  brokered by the district officer, so the state buys hours instead    */
/*  of buying machines.                                                  */
/* ------------------------------------------------------------------ */

export const machines: Machine[] = [
  { id: 'MCH-CNC-044', name: 'Haas VF-2 Vertical Machining Centre', kind: 'cnc-controller', ownerType: 'iti', ownerName: 'ITI Chikalthana, CSN', districtId: 'csn', skillIds: ['automotive-welding'], capacityHoursPerWeek: 60, bookedHoursPerWeek: 54, status: 'saturated', sharedRatePerHour: 0, contactCell: 'Workshop Supt., ITI Chikalthana', lastServicedOn: '2026-07-14' },
  { id: 'MCH-CNC-102', name: 'DMG Mori CLX 350 Turning Centre', kind: 'cnc-controller', ownerType: 'private-factory', ownerName: 'Precision CNC Machining MSME', districtId: 'csn', skillIds: ['automotive-welding'], capacityHoursPerWeek: 126, bookedHoursPerWeek: 64, status: 'partially-used', sharedRatePerHour: 340, contactCell: 'Plant Manager — 2nd/3rd shift only', lastServicedOn: '2026-08-02' },
  { id: 'MCH-WLD-108', name: 'Fronius TransSteel 2700 Inverter Bay ×6', kind: 'weld-inverter', ownerType: 'iti', ownerName: 'ITI Chikalthana, CSN', districtId: 'csn', skillIds: ['automotive-welding'], capacityHoursPerWeek: 72, bookedHoursPerWeek: 70, status: 'saturated', sharedRatePerHour: 0, contactCell: 'Welding Instructor', lastServicedOn: '2026-06-30' },
  { id: 'MCH-WLD-109', name: 'EWM Tetrix 300 AC/DC TIG ×4', kind: 'weld-inverter', ownerType: 'private-factory', ownerName: 'Aurangabad Auto Parts', districtId: 'csn', skillIds: ['automotive-welding'], capacityHoursPerWeek: 96, bookedHoursPerWeek: 31, status: 'idle', sharedRatePerHour: 220, contactCell: 'HR & Training Cell', lastServicedOn: '2026-08-20' },
  { id: 'MCH-EV-021', name: 'Chroma 17020 Battery Pack Analyser', kind: 'ev-battery-analyser', ownerType: 'iti', ownerName: 'ITI Aundh, Pune', districtId: 'pune', skillIds: ['ev-battery-diagnostics', 'ev-charging-tech'], capacityHoursPerWeek: 60, bookedHoursPerWeek: 59, status: 'saturated', sharedRatePerHour: 0, contactCell: 'EV Lab In-charge', lastServicedOn: '2026-07-28' },
  { id: 'MCH-EV-030', name: 'Arbin LBT21084 Cell Cycler Bank', kind: 'ev-battery-analyser', ownerType: 'private-factory', ownerName: 'Bajaj EV Assembly Unit', districtId: 'pune', skillIds: ['ev-battery-diagnostics'], capacityHoursPerWeek: 140, bookedHoursPerWeek: 46, status: 'idle', sharedRatePerHour: 480, contactCell: 'CSR & Skilling Cell', lastServicedOn: '2026-09-01' },
  { id: 'MCH-EV-033', name: 'DC Fast-Charge Commissioning Rig (60 kW)', kind: 'ev-battery-analyser', ownerType: 'private-factory', ownerName: 'Vidarbha EV Hub', districtId: 'nagpur', skillIds: ['ev-charging-tech'], capacityHoursPerWeek: 110, bookedHoursPerWeek: 72, status: 'partially-used', sharedRatePerHour: 390, contactCell: 'Depot Engineering', lastServicedOn: '2026-08-11' },
  { id: 'MCH-PLC-017', name: 'Siemens S7-1500 Training Rack ×10', kind: 'plc-rack', ownerType: 'polytechnic', ownerName: 'Govt. Polytechnic, Pune', districtId: 'pune', skillIds: ['plc-scada', 'iot-device-tech'], capacityHoursPerWeek: 80, bookedHoursPerWeek: 48, status: 'partially-used', sharedRatePerHour: 0, contactCell: 'Automation Dept.', lastServicedOn: '2026-08-08' },
  { id: 'MCH-PLC-025', name: 'Rockwell CompactLogix Commissioning Cell', kind: 'plc-rack', ownerType: 'private-factory', ownerName: 'TechNova Solutions Pvt. Ltd.', districtId: 'pune', skillIds: ['plc-scada'], capacityHoursPerWeek: 90, bookedHoursPerWeek: 22, status: 'idle', sharedRatePerHour: 410, contactCell: 'Engineering Training', lastServicedOn: '2026-08-26' },
  { id: 'MCH-SOL-012', name: 'Rooftop PV Commissioning Mock-Up (8 kW)', kind: 'clamp-meter', ownerType: 'iti', ownerName: 'ITI Satpur, Nashik', districtId: 'nashik', skillIds: ['solar-pv-installation'], capacityHoursPerWeek: 60, bookedHoursPerWeek: 38, status: 'partially-used', sharedRatePerHour: 0, contactCell: 'Solar Lab', lastServicedOn: '2026-07-19' },
  { id: 'MCH-SOL-019', name: 'String IV Curve Tracer & Thermal Kit', kind: 'clamp-meter', ownerType: 'private-factory', ownerName: 'SunPower Solar Solutions', districtId: 'nashik', skillIds: ['solar-pv-installation'], capacityHoursPerWeek: 70, bookedHoursPerWeek: 12, status: 'idle', sharedRatePerHour: 180, contactCell: 'Service Head', lastServicedOn: '2026-09-04' },
  { id: 'MCH-LOM-007', name: 'Picanol Rapier Loom with Electronic Jacquard', kind: 'loom-counter', ownerType: 'private-factory', ownerName: 'Nagpur Handloom Co-op', districtId: 'kolhapur', skillIds: ['power-loom-operation', 'cad-pattern-design'], capacityHoursPerWeek: 120, bookedHoursPerWeek: 88, status: 'partially-used', sharedRatePerHour: 260, contactCell: 'Production Supervisor', lastServicedOn: '2026-08-15' },
  { id: 'MCH-CAD-003', name: 'TUKAcad Workstation Lab ×12 + Plotter', kind: 'loom-counter', ownerType: 'iti', ownerName: 'ITI Shivaji, Kolhapur', districtId: 'kolhapur', skillIds: ['cad-pattern-design'], capacityHoursPerWeek: 96, bookedHoursPerWeek: 44, status: 'partially-used', sharedRatePerHour: 0, contactCell: 'Garment Tech Dept.', lastServicedOn: '2026-06-25' },
  { id: 'MCH-DRN-002', name: 'RTK Survey Drone Fleet (DJI M300 ×3)', kind: 'rtk-drone', ownerType: 'private-factory', ownerName: 'City Surveyors & Co.', districtId: 'nagpur', skillIds: ['drone-survey'], capacityHoursPerWeek: 45, bookedHoursPerWeek: 9, status: 'idle', sharedRatePerHour: 620, contactCell: 'Chief Surveyor', lastServicedOn: '2026-09-02' },
  { id: 'MCH-IOT-011', name: 'Smart-Building IoT Integration Bench', kind: 'plc-rack', ownerType: 'private-factory', ownerName: 'SmartHome Integrations', districtId: 'thane', skillIds: ['iot-device-tech'], capacityHoursPerWeek: 84, bookedHoursPerWeek: 18, status: 'idle', sharedRatePerHour: 290, contactCell: 'Technical Head', lastServicedOn: '2026-08-29' },
  { id: 'MCH-ELE-055', name: 'Motor Rewinding & Test Bench ×4', kind: 'clamp-meter', ownerType: 'iti', ownerName: 'ITI Wagle Estate, Thane', districtId: 'thane', skillIds: ['industrial-electrician'], capacityHoursPerWeek: 72, bookedHoursPerWeek: 71, status: 'saturated', sharedRatePerHour: 0, contactCell: 'Electrical Dept.', lastServicedOn: '2026-05-30' },
  { id: 'MCH-ELE-061', name: 'VFD & Drive Parameterisation Panel ×6', kind: 'plc-rack', ownerType: 'private-factory', ownerName: 'Deshmukh Electrical Services', districtId: 'nashik', skillIds: ['industrial-electrician', 'plc-scada'], capacityHoursPerWeek: 66, bookedHoursPerWeek: 66, status: 'under-maintenance', sharedRatePerHour: 240, contactCell: 'Proprietor', lastServicedOn: '2026-04-12' },
];

export function machineUtilisation(m: Machine): number {
  return Math.round((m.bookedHoursPerWeek / m.capacityHoursPerWeek) * 100);
}

/** Weekly hours sitting idle across the shared pool, by district. */
export function idleHoursByDistrict(districtId?: string) {
  const list = districtId ? machines.filter(m => m.districtId === districtId) : machines;
  const idle = list
    .filter(m => m.status !== 'under-maintenance')
    .reduce((a, m) => a + Math.max(0, m.capacityHoursPerWeek - m.bookedHoursPerWeek), 0);
  const capex = list
    .filter(m => m.ownerType === 'private-factory' && m.status === 'idle')
    .length;
  return {
    idleHoursPerWeek: idle,
    /** Annualised, at 44 working weeks */
    idleHoursPerYear: idle * 44,
    privateMachinesAvailable: capex,
    /** Bench-equivalent seats those idle hours could deliver per year */
    additionalSeatsUnlocked: Math.round((idle * 44) / 180),
  };
}

export const machineBookings: MachineBooking[] = [
  { id: 'BK-7701', machineId: 'MCH-EV-030', requestedBy: 'ITI Aundh, Pune', requesterType: 'iti', courseId: 'pune-ev-01', hoursPerWeek: 24, weeks: 12, status: 'approved', requestedOn: '2026-06-02' },
  { id: 'BK-7702', machineId: 'MCH-WLD-109', requestedBy: 'ITI Chikalthana, CSN', requesterType: 'iti', courseId: 'csn-weld-01', hoursPerWeek: 30, weeks: 16, status: 'approved', requestedOn: '2026-06-18' },
  { id: 'BK-7703', machineId: 'MCH-PLC-025', requestedBy: 'Govt. Polytechnic, Pune', requesterType: 'iti', courseId: 'pune-plc-01', hoursPerWeek: 16, weeks: 20, status: 'requested', requestedOn: '2026-09-04' },
  { id: 'BK-7704', machineId: 'MCH-SOL-019', requestedBy: 'ITI Satpur, Nashik', requesterType: 'iti', courseId: 'nsk-solar-01', hoursPerWeek: 12, weeks: 10, status: 'approved', requestedOn: '2026-08-06' },
  { id: 'BK-7705', machineId: 'MCH-DRN-002', requestedBy: 'Sahyadri Farms FPO', requesterType: 'msme', courseId: null, hoursPerWeek: 8, weeks: 6, status: 'requested', requestedOn: '2026-09-07' },
  { id: 'BK-7706', machineId: 'MCH-IOT-011', requestedBy: 'ITI Wagle Estate, Thane', requesterType: 'iti', courseId: 'tha-iot-01', hoursPerWeek: 20, weeks: 14, status: 'requested', requestedOn: '2026-09-08' },
  { id: 'BK-7707', machineId: 'MCH-CNC-102', requestedBy: 'Marathwada Stampings', requesterType: 'msme', courseId: null, hoursPerWeek: 18, weeks: 8, status: 'rejected', requestedOn: '2026-07-22' },
  { id: 'BK-7708', machineId: 'MCH-EV-033', requestedBy: 'ITI Kalmeshwar, Nagpur', requesterType: 'iti', courseId: 'ngp-ev-01', hoursPerWeek: 22, weeks: 12, status: 'completed', requestedOn: '2026-05-30' },
];

/** Courses whose lab hours currently have nowhere to run in their district. */
export function unservedPracticalDemand(districtId: string) {
  const local = courses.filter(c => c.districtId === districtId);
  const saturated = machines.filter(m => m.districtId === districtId && m.status === 'saturated');
  return { coursesInDistrict: local.length, saturatedMachines: saturated.length, machines: saturated };
}
