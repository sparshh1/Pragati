import { TradeShift } from '@/types';

export const tradeShifts: TradeShift[] = [
  {
    fromSkillId: 'carburettor-repair',
    toSkillId: 'ev-battery-diagnostics',
    bridgeModuleName: 'EV Fundamentals & Battery Systems (Add-on)',
    bridgeDurationWeeks: 12,
    bridgeCourseAvailableDistrictIds: ['pune', 'csn'],
  },
  {
    fromSkillId: 'ice-engine-overhaul',
    toSkillId: 'ev-charging-tech',
    bridgeModuleName: 'EV Charging Infrastructure & EVSE Maintenance',
    bridgeDurationWeeks: 8,
    bridgeCourseAvailableDistrictIds: ['pune', 'nashik', 'thane'],
  },
  {
    fromSkillId: 'crt-analog-repair',
    toSkillId: 'solar-pv-installation',
    bridgeModuleName: 'Solar PV Systems: Design, Install & Commission',
    bridgeDurationWeeks: 10,
    bridgeCourseAvailableDistrictIds: ['nashik', 'pune', 'nagpur'],
  },
  {
    fromSkillId: 'crt-analog-repair',
    toSkillId: 'iot-device-tech',
    bridgeModuleName: 'IoT Device Installation & Basic Networking',
    bridgeDurationWeeks: 14,
    bridgeCourseAvailableDistrictIds: ['pune', 'thane'],
  },
  {
    fromSkillId: 'handloom-weaving',
    toSkillId: 'cad-pattern-design',
    bridgeModuleName: 'Computer-Aided Textile Design & Pattern Grading',
    bridgeDurationWeeks: 16,
    bridgeCourseAvailableDistrictIds: ['kolhapur', 'thane'],
  },
  {
    fromSkillId: 'manual-data-entry',
    toSkillId: 'digital-marketing',
    bridgeModuleName: 'Digital Marketing, SEO & Social Media Management',
    bridgeDurationWeeks: 10,
    bridgeCourseAvailableDistrictIds: ['pune', 'thane', 'nagpur'],
  },
  {
    fromSkillId: 'manual-surveying',
    toSkillId: 'drone-survey',
    bridgeModuleName: 'Drone Operations, Aerial Survey & GIS Mapping',
    bridgeDurationWeeks: 12,
    bridgeCourseAvailableDistrictIds: ['pune', 'nagpur'],
  },
];

export function getTradeShiftForSkill(fromSkillId: string): TradeShift | undefined {
  return tradeShifts.find(ts => ts.fromSkillId === fromSkillId);
}

export function getTradeShiftsForSkill(fromSkillId: string): TradeShift[] {
  return tradeShifts.filter(ts => ts.fromSkillId === fromSkillId);
}
