import { District } from '@/types';

export const districts: District[] = [
  {
    id: 'pune',
    name: 'Pune',
    population: 11800000,
    industries: ['Automotive & EV', 'IT/ITeS', 'Precision Engineering', 'Heavy Machinery', 'Biotechnology'],
    trainerCapacity: 4200,
    labCapacity: 3800,
    hostelCapacity: 2800,
    budgetLakhsCr: 18.5,
  },
  {
    id: 'nashik',
    name: 'Nashik',
    population: 7300000,
    industries: ['Electrical & Power Equipment', 'Automotive & Ancillary', 'Aerospace & Defense', 'Wine & Agro-processing', 'Pharmaceuticals'],
    trainerCapacity: 2800,
    labCapacity: 2400,
    hostelCapacity: 1900,
    budgetLakhsCr: 12.2,
  },
  {
    id: 'csn',
    name: 'Chhatrapati Sambhajinagar',
    population: 4400000,
    industries: ['Automobile & Auto-components', 'Pharmaceuticals & Biotech', 'Heavy Engineering', 'Smart Manufacturing'],
    trainerCapacity: 2200,
    labCapacity: 1800,
    hostelCapacity: 1500,
    budgetLakhsCr: 9.8,
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    population: 5300000,
    industries: ['Multi-modal Logistics', 'Aerospace & Defense MRO', 'Thermal Power & Transmission', 'Steel & Heavy Fabrication', 'IT/BPO'],
    trainerCapacity: 2600,
    labCapacity: 2200,
    hostelCapacity: 1800,
    budgetLakhsCr: 11.0,
  },
  {
    id: 'thane',
    name: 'Thane',
    population: 9900000,
    industries: ['Specialty Chemicals', 'Bulk Drugs & Pharmaceuticals', 'Logistics & E-Commerce', 'BPO & IT Services', 'Electrical Equipment'],
    trainerCapacity: 3600,
    labCapacity: 3200,
    hostelCapacity: 2400,
    budgetLakhsCr: 15.5,
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    population: 4300000,
    industries: ['Ferrous & Non-Ferrous Foundries', 'Automotive Castings & Forging', 'Textiles & Powerlooms', 'Sugar & Agro-machinery', 'Pumps & Diesel Engines'],
    trainerCapacity: 1800,
    labCapacity: 1500,
    hostelCapacity: 1200,
    budgetLakhsCr: 8.0,
  },
];

export function getDistrict(id: string): District | undefined {
  return districts.find(d => d.id === id);
}
