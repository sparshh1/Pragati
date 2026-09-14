import { Skill, TrendDirection } from '@/types';

export const skills: Skill[] = [
  // Auto/EV sector
  { id: 'carburettor-repair', name: 'Carburettor Repair', sector: 'auto-ev', nsqfLevel: 3, salaryRange: [10000, 16000] },
  { id: 'ice-engine-overhaul', name: 'ICE Engine Overhaul', sector: 'auto-ev', nsqfLevel: 4, salaryRange: [14000, 20000] },
  { id: 'ev-battery-diagnostics', name: 'EV Battery Diagnostics', sector: 'auto-ev', nsqfLevel: 4, salaryRange: [18000, 28000] },
  { id: 'ev-charging-tech', name: 'EV Charging Technician', sector: 'auto-ev', nsqfLevel: 4, salaryRange: [16000, 25000] },
  { id: 'automotive-welding', name: 'Automotive Welding', sector: 'auto-ev', nsqfLevel: 4, salaryRange: [14000, 22000] },

  // Electrical sector
  { id: 'crt-analog-repair', name: 'CRT & Analog TV Repair', sector: 'electrical', nsqfLevel: 3, salaryRange: [8000, 14000] },
  { id: 'industrial-electrician', name: 'Industrial Electrician', sector: 'electrical', nsqfLevel: 4, salaryRange: [17000, 27000] },
  { id: 'solar-pv-installation', name: 'Solar PV Installation', sector: 'electrical', nsqfLevel: 4, salaryRange: [16000, 26000] },
  { id: 'plc-scada', name: 'PLC & SCADA Operations', sector: 'electrical', nsqfLevel: 5, salaryRange: [24000, 40000] },
  { id: 'iot-device-tech', name: 'IoT Device Technician', sector: 'electrical', nsqfLevel: 4, salaryRange: [16000, 26000] },

  // Textile sector
  { id: 'handloom-weaving', name: 'Handloom Weaving', sector: 'textile', nsqfLevel: 3, salaryRange: [6000, 12000] },
  { id: 'power-loom-operation', name: 'Power Loom Operation', sector: 'textile', nsqfLevel: 4, salaryRange: [15000, 22000] },
  { id: 'sewing-machine-operation', name: 'Sewing Machine Operation', sector: 'textile', nsqfLevel: 3, salaryRange: [13000, 19000] },
  { id: 'cad-pattern-design', name: 'CAD Pattern Design', sector: 'textile', nsqfLevel: 5, salaryRange: [22000, 34000] },

  // Retail/BPO sector
  { id: 'manual-data-entry', name: 'Manual Data Entry', sector: 'retail-bpo', nsqfLevel: 3, salaryRange: [10000, 16000] },
  { id: 'voice-call-center', name: 'Voice Call Center Operations', sector: 'retail-bpo', nsqfLevel: 4, salaryRange: [16000, 26000] },
  { id: 'digital-marketing', name: 'Digital Marketing', sector: 'retail-bpo', nsqfLevel: 5, salaryRange: [18000, 30000] },
  { id: 'warehouse-operations', name: 'Warehouse Operations', sector: 'retail-bpo', nsqfLevel: 4, salaryRange: [15000, 22000] },

  // Construction sector
  { id: 'manual-surveying', name: 'Manual Surveying', sector: 'construction', nsqfLevel: 3, salaryRange: [12000, 18000] },
  { id: 'masonry', name: 'Masonry', sector: 'construction', nsqfLevel: 3, salaryRange: [14000, 22000] },
  { id: 'plumbing', name: 'Plumbing', sector: 'construction', nsqfLevel: 4, salaryRange: [14000, 22000] },
  { id: 'drone-survey', name: 'Drone Survey Operations', sector: 'construction', nsqfLevel: 5, salaryRange: [20000, 35000] },
];

export function getSkill(id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

const seedHints: Record<string, TrendDirection> = {
  'carburettor-repair': 'declining',
  'ice-engine-overhaul': 'declining',
  'ev-battery-diagnostics': 'rising',
  'ev-charging-tech': 'rising',
  'automotive-welding': 'stable',
  'crt-analog-repair': 'declining',
  'industrial-electrician': 'stable',
  'solar-pv-installation': 'rising',
  'plc-scada': 'rising',
  'iot-device-tech': 'rising',
  'handloom-weaving': 'declining',
  'power-loom-operation': 'stable',
  'sewing-machine-operation': 'stable',
  'cad-pattern-design': 'rising',
  'manual-data-entry': 'declining',
  'voice-call-center': 'stable',
  'digital-marketing': 'rising',
  'warehouse-operations': 'rising',
  'manual-surveying': 'declining',
  'masonry': 'stable',
  'plumbing': 'stable',
  'drone-survey': 'rising',
};

export function getSkillTrendHint(id: string): TrendDirection {
  return seedHints[id] || 'stable';
}
