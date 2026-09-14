import { Course } from '@/types';

export const courses: Course[] = [
  // Pune District
  {
    id: 'pune-mmv-01',
    name: 'Mechanic Motor Vehicle',
    districtId: 'pune',
    skillIds: ['carburettor-repair', 'ice-engine-overhaul'],
    currentSeats: 60,
    enrolled: 58,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'pune-ev-01',
    name: 'Advanced EV Technician',
    districtId: 'pune',
    skillIds: ['ev-battery-diagnostics', 'ev-charging-tech'],
    currentSeats: 30,
    enrolled: 30,
    durationMonths: 6,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'pune-elec-01',
    name: 'Electrician',
    districtId: 'pune',
    skillIds: ['industrial-electrician'],
    currentSeats: 120,
    enrolled: 115,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'pune-plc-01',
    name: 'Diploma in Industrial Automation',
    districtId: 'pune',
    skillIds: ['plc-scada', 'iot-device-tech'],
    currentSeats: 60,
    enrolled: 45,
    durationMonths: 36,
    type: 'Polytechnic',
    scheme: null
  },
  {
    id: 'pune-retail-01',
    name: 'BPO Executive Voice',
    districtId: 'pune',
    skillIds: ['voice-call-center', 'manual-data-entry'],
    currentSeats: 40,
    enrolled: 38,
    durationMonths: 3,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'pune-digi-01',
    name: 'Digital Marketing Specialist',
    districtId: 'pune',
    skillIds: ['digital-marketing'],
    currentSeats: 40,
    enrolled: 40,
    durationMonths: 6,
    type: 'Private',
    scheme: null
  },
  {
    id: 'pune-drone-01',
    name: 'Drone Survey Technician',
    districtId: 'pune',
    skillIds: ['drone-survey'],
    currentSeats: 30,
    enrolled: 15,
    durationMonths: 3,
    type: 'Private',
    scheme: null
  },

  // Nashik District
  {
    id: 'nsk-mmv-01',
    name: 'Mechanic Motor Vehicle',
    districtId: 'nashik',
    skillIds: ['carburettor-repair', 'ice-engine-overhaul'],
    currentSeats: 60,
    enrolled: 55,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'nsk-weld-01',
    name: 'Automotive Welding',
    districtId: 'nashik',
    skillIds: ['automotive-welding'],
    currentSeats: 40,
    enrolled: 35,
    durationMonths: 12,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'nsk-elec-01',
    name: 'Electrician',
    districtId: 'nashik',
    skillIds: ['industrial-electrician'],
    currentSeats: 80,
    enrolled: 75,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'nsk-solar-01',
    name: 'Suryamitra Solar Installer',
    districtId: 'nashik',
    skillIds: ['solar-pv-installation'],
    currentSeats: 30,
    enrolled: 30,
    durationMonths: 3,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'nsk-mason-01',
    name: 'Mason General',
    districtId: 'nashik',
    skillIds: ['masonry', 'plumbing'],
    currentSeats: 40,
    enrolled: 30,
    durationMonths: 6,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'nsk-bpo-01',
    name: 'Call Center Operator',
    districtId: 'nashik',
    skillIds: ['voice-call-center'],
    currentSeats: 40,
    enrolled: 20,
    durationMonths: 3,
    type: 'Private',
    scheme: null
  },
  {
    id: 'nsk-ana-01',
    name: 'Analog Electronics Repair',
    districtId: 'nashik',
    skillIds: ['crt-analog-repair'],
    currentSeats: 30,
    enrolled: 10,
    durationMonths: 12,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },

  // Chhatrapati Sambhajinagar (CSN)
  {
    id: 'csn-mmv-01',
    name: 'Mechanic Motor Vehicle',
    districtId: 'csn',
    skillIds: ['carburettor-repair', 'ice-engine-overhaul'],
    currentSeats: 60,
    enrolled: 60,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'csn-weld-01',
    name: 'Welder (Gas & Electric)',
    districtId: 'csn',
    skillIds: ['automotive-welding'],
    currentSeats: 40,
    enrolled: 38,
    durationMonths: 12,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'csn-elec-01',
    name: 'Electrician',
    districtId: 'csn',
    skillIds: ['industrial-electrician'],
    currentSeats: 80,
    enrolled: 80,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'csn-cnc-01',
    name: 'Diploma in Mechatronics',
    districtId: 'csn',
    skillIds: ['plc-scada'],
    currentSeats: 60,
    enrolled: 55,
    durationMonths: 36,
    type: 'Polytechnic',
    scheme: null
  },
  {
    id: 'csn-data-01',
    name: 'Data Entry Operator',
    districtId: 'csn',
    skillIds: ['manual-data-entry'],
    currentSeats: 40,
    enrolled: 35,
    durationMonths: 3,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'csn-ware-01',
    name: 'Warehouse Picker/Packer',
    districtId: 'csn',
    skillIds: ['warehouse-operations'],
    currentSeats: 40,
    enrolled: 40,
    durationMonths: 3,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  
  // Nagpur District
  {
    id: 'ngp-mmv-01',
    name: 'Mechanic Auto Electrical & Electronics',
    districtId: 'nagpur',
    skillIds: ['ice-engine-overhaul', 'carburettor-repair'],
    currentSeats: 60,
    enrolled: 45,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'ngp-ev-01',
    name: 'EV Charging Infra Tech',
    districtId: 'nagpur',
    skillIds: ['ev-charging-tech'],
    currentSeats: 30,
    enrolled: 28,
    durationMonths: 6,
    type: 'Private',
    scheme: null
  },
  {
    id: 'ngp-elec-01',
    name: 'Electrician',
    districtId: 'nagpur',
    skillIds: ['industrial-electrician'],
    currentSeats: 100,
    enrolled: 95,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'ngp-plumb-01',
    name: 'Plumber',
    districtId: 'nagpur',
    skillIds: ['plumbing'],
    currentSeats: 40,
    enrolled: 38,
    durationMonths: 12,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'ngp-surv-01',
    name: 'Surveyor',
    districtId: 'nagpur',
    skillIds: ['manual-surveying'],
    currentSeats: 40,
    enrolled: 15,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'ngp-text-01',
    name: 'Sewing Machine Operator',
    districtId: 'nagpur',
    skillIds: ['sewing-machine-operation'],
    currentSeats: 30,
    enrolled: 30,
    durationMonths: 3,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'ngp-handloom-01',
    name: 'Handloom Weaver',
    districtId: 'nagpur',
    skillIds: ['handloom-weaving'],
    currentSeats: 30,
    enrolled: 5,
    durationMonths: 6,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },

  // Thane District
  {
    id: 'tha-mmv-01',
    name: 'Mechanic Motor Vehicle',
    districtId: 'thane',
    skillIds: ['ice-engine-overhaul', 'carburettor-repair'],
    currentSeats: 60,
    enrolled: 60,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'tha-elec-01',
    name: 'Electrician',
    districtId: 'thane',
    skillIds: ['industrial-electrician'],
    currentSeats: 80,
    enrolled: 80,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'tha-digi-01',
    name: 'Advanced Digital Marketing',
    districtId: 'thane',
    skillIds: ['digital-marketing'],
    currentSeats: 60,
    enrolled: 60,
    durationMonths: 6,
    type: 'Private',
    scheme: null
  },
  {
    id: 'tha-iot-01',
    name: 'IoT Devices & Smart Homes',
    districtId: 'thane',
    skillIds: ['iot-device-tech'],
    currentSeats: 40,
    enrolled: 38,
    durationMonths: 6,
    type: 'Private',
    scheme: null
  },
  {
    id: 'tha-ware-01',
    name: 'Logistics and Warehouse Management',
    districtId: 'thane',
    skillIds: ['warehouse-operations'],
    currentSeats: 50,
    enrolled: 50,
    durationMonths: 6,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'tha-cad-01',
    name: 'CAD Pattern Making',
    districtId: 'thane',
    skillIds: ['cad-pattern-design'],
    currentSeats: 30,
    enrolled: 25,
    durationMonths: 12,
    type: 'Polytechnic',
    scheme: null
  },

  // Kolhapur District
  {
    id: 'kol-mmv-01',
    name: 'Mechanic Motor Vehicle',
    districtId: 'kolhapur',
    skillIds: ['ice-engine-overhaul', 'carburettor-repair'],
    currentSeats: 60,
    enrolled: 58,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'kol-elec-01',
    name: 'Electrician',
    districtId: 'kolhapur',
    skillIds: ['industrial-electrician'],
    currentSeats: 80,
    enrolled: 78,
    durationMonths: 24,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'kol-loom-01',
    name: 'Power Loom Operator',
    districtId: 'kolhapur',
    skillIds: ['power-loom-operation'],
    currentSeats: 40,
    enrolled: 35,
    durationMonths: 6,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'kol-text-01',
    name: 'Sewing Machine Operator',
    districtId: 'kolhapur',
    skillIds: ['sewing-machine-operation'],
    currentSeats: 40,
    enrolled: 38,
    durationMonths: 3,
    type: 'PMKVY',
    scheme: 'PMKVY-4.0'
  },
  {
    id: 'kol-foundry-01',
    name: 'Welder',
    districtId: 'kolhapur',
    skillIds: ['automotive-welding'],
    currentSeats: 40,
    enrolled: 40,
    durationMonths: 12,
    type: 'ITI',
    scheme: 'DGT-CTS'
  },
  {
    id: 'kol-mason-01',
    name: 'Mason Building Constructor',
    districtId: 'kolhapur',
    skillIds: ['masonry'],
    currentSeats: 40,
    enrolled: 25,
    durationMonths: 12,
    type: 'ITI',
    scheme: 'DGT-CTS'
  }
];

export function getCoursesByDistrict(districtId: string): Course[] {
  return courses.filter(c => c.districtId === districtId);
}
