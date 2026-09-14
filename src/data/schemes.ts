import { Scheme } from '@/types';

export const schemes: Scheme[] = [
  {
    code: 'PMKVY-4.0',
    name: 'Pradhan Mantri Kaushal Vikas Yojana 4.0',
    ministry: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    description: 'Outcome-based, free-of-cost skill development scheme focusing on Industry 4.0, green energy, drones, and AI-driven skills.',
    funds: '100% of training and assessment fees paid to training providers. Boarding/lodging stipends for women and PwD candidates.',
    eligibility: 'Indian youth aged 15-45 with Aadhaar. School/college dropouts or unemployed seeking industry-aligned certification.',
  },
  {
    code: 'SANKALP',
    name: 'Skills Acquisition and Knowledge Awareness for Livelihood Promotion',
    ministry: 'MSDE with World Bank support',
    description: 'Institutional strengthening program funding system-level quality improvement, market connectivity, and decentralized district skill planning.',
    funds: 'Disbursement-linked grants to State Skill Missions and District Skill Committees for infrastructure, monitoring, and inclusion.',
    eligibility: 'State Skill Missions, District Collectors, ITIs. End beneficiaries: disadvantaged youth and women.',
  },
  {
    code: 'DGT-CTS',
    name: 'Craftsmen Training Scheme (DGT)',
    ministry: 'Directorate General of Training (DGT), MSDE',
    description: 'Foundational 1-2 year ITI trades leading to National Trade Certificates (NTC). Covers Electrician, Fitter, Welder, MMV, and 150+ trades.',
    funds: 'Government budgetary grants for ITI infrastructure, machinery, instructor salaries. Nominal tuition fees (₹1,000-₹2,500/year).',
    eligibility: 'Age 14+, 8th or 10th pass depending on trade. Admission through DVET CAP.',
  },
  {
    code: 'NAPS',
    name: 'National Apprenticeship Promotion Scheme',
    ministry: 'MSDE',
    description: 'Incentivizes employers, especially MSMEs, to hire and train apprentices with government stipend co-funding via DBT.',
    funds: '25% of prescribed monthly stipend (max ₹1,500/month) per apprentice via Direct Benefit Transfer. Basic training cost sharing up to ₹7,500.',
    eligibility: 'Apprentices: Age 14-35 with ITI/Diploma/Degree certificates. Employers: Establishments with ≥4 employees.',
  },
];

export function getScheme(code: string): Scheme | undefined {
  return schemes.find(s => s.code === code);
}
