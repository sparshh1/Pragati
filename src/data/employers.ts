import { Employer } from '@/types';

export const employers: Employer[] = [
  // Pune District
  {
    id: 'emp-pune-01',
    name: 'TechNova Solutions Pvt. Ltd.',
    districtId: 'pune',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'electrical',
    hiringSkillIds: ['iot-device-tech', 'plc-scada'],
    pledgeStatus: 'committed',
    pledgeCount: 45
  },
  {
    id: 'emp-pune-02',
    name: 'Bajaj EV Assembly Unit',
    districtId: 'pune',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'auto-ev',
    hiringSkillIds: ['ev-battery-diagnostics', 'ev-charging-tech'],
    pledgeStatus: 'committed',
    pledgeCount: 120
  },
  {
    id: 'emp-pune-03',
    name: 'Infosys BPO Services',
    districtId: 'pune',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'retail-bpo',
    hiringSkillIds: ['voice-call-center', 'manual-data-entry'],
    pledgeStatus: 'interested',
    pledgeCount: 0
  },
  {
    id: 'emp-pune-04',
    name: 'Patil Auto Works',
    districtId: 'pune',
    type: 'MSME',
    employeeCount: 50,
    sector: 'auto-ev',
    hiringSkillIds: ['ice-engine-overhaul', 'automotive-welding'],
    pledgeStatus: 'none',
    pledgeCount: 0
  },

  // Nashik District
  {
    id: 'emp-nsk-01',
    name: 'Deshmukh Electrical Services',
    districtId: 'nashik',
    type: 'MSME',
    employeeCount: 50,
    sector: 'electrical',
    hiringSkillIds: ['industrial-electrician'],
    pledgeStatus: 'committed',
    pledgeCount: 5
  },
  {
    id: 'emp-nsk-02',
    name: 'SunPower Solar Solutions',
    districtId: 'nashik',
    type: 'MSME',
    employeeCount: 50,
    sector: 'electrical',
    hiringSkillIds: ['solar-pv-installation'],
    pledgeStatus: 'interested',
    pledgeCount: 0
  },
  {
    id: 'emp-nsk-03',
    name: 'Nashik Forging Enterprises',
    districtId: 'nashik',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'auto-ev',
    hiringSkillIds: ['automotive-welding'],
    pledgeStatus: 'committed',
    pledgeCount: 25
  },
  {
    id: 'emp-nsk-04',
    name: 'Rao Construction Co.',
    districtId: 'nashik',
    type: 'MSME',
    employeeCount: 50,
    sector: 'construction',
    hiringSkillIds: ['masonry', 'plumbing'],
    pledgeStatus: 'none',
    pledgeCount: 0
  },

  // Chhatrapati Sambhajinagar (CSN)
  {
    id: 'emp-csn-01',
    name: 'Aurangabad Auto Parts',
    districtId: 'csn',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'auto-ev',
    hiringSkillIds: ['automotive-welding', 'ice-engine-overhaul'],
    pledgeStatus: 'committed',
    pledgeCount: 50
  },
  {
    id: 'emp-csn-02',
    name: 'Precision CNC Machining MSME',
    districtId: 'csn',
    type: 'MSME',
    employeeCount: 50,
    sector: 'electrical',
    hiringSkillIds: ['plc-scada', 'industrial-electrician'],
    pledgeStatus: 'interested',
    pledgeCount: 0
  },
  {
    id: 'emp-csn-03',
    name: 'Marathwada Logistics',
    districtId: 'csn',
    type: 'MSME',
    employeeCount: 50,
    sector: 'retail-bpo',
    hiringSkillIds: ['warehouse-operations'],
    pledgeStatus: 'committed',
    pledgeCount: 15
  },
  {
    id: 'emp-csn-04',
    name: 'Classic BPO',
    districtId: 'csn',
    type: 'MSME',
    employeeCount: 50,
    sector: 'retail-bpo',
    hiringSkillIds: ['manual-data-entry'],
    pledgeStatus: 'none',
    pledgeCount: 0
  },

  // Nagpur District
  {
    id: 'emp-ngp-01',
    name: 'Vidarbha EV Hub',
    districtId: 'nagpur',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'auto-ev',
    hiringSkillIds: ['ev-charging-tech'],
    pledgeStatus: 'committed',
    pledgeCount: 30
  },
  {
    id: 'emp-ngp-02',
    name: 'Haldiram Foods Manufacturing',
    districtId: 'nagpur',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'electrical',
    hiringSkillIds: ['industrial-electrician', 'plc-scada'],
    pledgeStatus: 'interested',
    pledgeCount: 0
  },
  {
    id: 'emp-ngp-03',
    name: 'Nagpur Handloom Co-op',
    districtId: 'nagpur',
    type: 'MSME',
    employeeCount: 50,
    sector: 'textile',
    hiringSkillIds: ['handloom-weaving', 'sewing-machine-operation'],
    pledgeStatus: 'none',
    pledgeCount: 0
  },
  {
    id: 'emp-ngp-04',
    name: 'City Surveyors & Co.',
    districtId: 'nagpur',
    type: 'MSME',
    employeeCount: 50,
    sector: 'construction',
    hiringSkillIds: ['manual-surveying'],
    pledgeStatus: 'none',
    pledgeCount: 0
  },

  // Thane District
  {
    id: 'emp-tha-01',
    name: 'Reliance Retail Logistics',
    districtId: 'thane',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'retail-bpo',
    hiringSkillIds: ['warehouse-operations'],
    pledgeStatus: 'committed',
    pledgeCount: 200
  },
  {
    id: 'emp-tha-02',
    name: 'Mumbai Suburbs Auto Works',
    districtId: 'thane',
    type: 'MSME',
    employeeCount: 50,
    sector: 'auto-ev',
    hiringSkillIds: ['ice-engine-overhaul', 'carburettor-repair'],
    pledgeStatus: 'none',
    pledgeCount: 0
  },
  {
    id: 'emp-tha-03',
    name: 'Digital Horizons Media',
    districtId: 'thane',
    type: 'MSME',
    employeeCount: 50,
    sector: 'retail-bpo',
    hiringSkillIds: ['digital-marketing'],
    pledgeStatus: 'committed',
    pledgeCount: 10
  },
  {
    id: 'emp-tha-04',
    name: 'SmartHome Integrations',
    districtId: 'thane',
    type: 'MSME',
    employeeCount: 50,
    sector: 'electrical',
    hiringSkillIds: ['iot-device-tech'],
    pledgeStatus: 'interested',
    pledgeCount: 0
  },

  // Kolhapur District
  {
    id: 'emp-kol-01',
    name: 'Kolhapur Foundry & Engineering',
    districtId: 'kolhapur',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'auto-ev',
    hiringSkillIds: ['automotive-welding'],
    pledgeStatus: 'committed',
    pledgeCount: 40
  },
  {
    id: 'emp-kol-02',
    name: 'Shree Ganesh Textiles',
    districtId: 'kolhapur',
    type: 'Enterprise',
    employeeCount: 500,
    sector: 'textile',
    hiringSkillIds: ['power-loom-operation'],
    pledgeStatus: 'committed',
    pledgeCount: 60
  },
  {
    id: 'emp-kol-03',
    name: 'Ichalkaranji Garment Exports',
    districtId: 'kolhapur',
    type: 'MSME',
    employeeCount: 50,
    sector: 'textile',
    hiringSkillIds: ['sewing-machine-operation'],
    pledgeStatus: 'interested',
    pledgeCount: 0
  },
  {
    id: 'emp-kol-04',
    name: 'Kadam Construction Builders',
    districtId: 'kolhapur',
    type: 'MSME',
    employeeCount: 50,
    sector: 'construction',
    hiringSkillIds: ['masonry'],
    pledgeStatus: 'none',
    pledgeCount: 0
  }
];

export function getEmployersByDistrict(districtId: string): Employer[] {
  return employers.filter(e => e.districtId === districtId);
}

export function getEmployer(id: string): Employer | undefined {
  return employers.find(e => e.id === id);
}
