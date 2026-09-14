import { JobPosting } from '@/types';

// Simple Linear Congruential Generator for deterministic randomness
function LCG(seed: number) {
  let state = seed;
  return function() {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const prng = LCG(12345); // Seeded PRNG

// Random functions based on PRNG
function random() {
  return prng();
}

function randomInRange(min: number, max: number) {
  return min + random() * (max - min);
}

export const MONTHS: string[] = [
  '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
  '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
  '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'
];

const SKILL_GROUPS: Record<string, string[]> = {
  'auto-ev': ['ev-battery-diagnostics', 'ev-charging-tech', 'automotive-welding', 'carburettor-repair', 'ice-engine-overhaul'],
  'electrical': ['solar-pv-installation', 'plc-scada', 'iot-device-tech', 'crt-analog-repair', 'industrial-electrician'],
  'textile': ['cad-pattern-design', 'handloom-weaving', 'power-loom-operation', 'sewing-machine-operation'],
  'retail-bpo': ['digital-marketing', 'warehouse-operations', 'manual-data-entry', 'voice-call-center'],
  'construction': ['drone-survey', 'manual-surveying', 'masonry', 'plumbing']
};

const RISING = ['ev-battery-diagnostics', 'ev-charging-tech', 'solar-pv-installation', 'plc-scada', 'iot-device-tech', 'cad-pattern-design', 'digital-marketing', 'warehouse-operations', 'drone-survey'];
const DECLINING = ['carburettor-repair', 'ice-engine-overhaul', 'crt-analog-repair', 'handloom-weaving', 'manual-data-entry', 'manual-surveying'];
const STABLE = ['automotive-welding', 'industrial-electrician', 'power-loom-operation', 'sewing-machine-operation', 'voice-call-center', 'masonry', 'plumbing'];

const DISTRICT_WEIGHTS: Record<string, { factor: number } & Record<string, number>> = {
  pune: { factor: 1.4, 'auto-ev': 1.5, 'electrical': 1.5, 'textile': 1.0, 'retail-bpo': 1.5, 'construction': 1.2 },
  thane: { factor: 1.3, 'auto-ev': 1.0, 'electrical': 1.5, 'textile': 1.5, 'retail-bpo': 1.5, 'construction': 1.2 },
  nashik: { factor: 1.0, 'auto-ev': 1.0, 'electrical': 1.5, 'textile': 1.0, 'retail-bpo': 1.0, 'construction': 1.0 },
  nagpur: { factor: 0.9, 'auto-ev': 1.0, 'electrical': 1.0, 'textile': 1.0, 'retail-bpo': 1.5, 'construction': 1.0 },
  csn: { factor: 0.8, 'auto-ev': 1.5, 'electrical': 1.0, 'textile': 1.5, 'retail-bpo': 1.0, 'construction': 1.0 },
  kolhapur: { factor: 0.7, 'auto-ev': 1.5, 'electrical': 1.0, 'textile': 1.5, 'retail-bpo': 1.0, 'construction': 1.0 },
};

function getSkillGroup(skillId: string): string {
  for (const [group, skills] of Object.entries(SKILL_GROUPS)) {
    if (skills.includes(skillId)) return group;
  }
  return 'retail-bpo'; // Default fallback
}

export const jobPostings: JobPosting[] = [];

// Generate data
for (const [districtId, districtData] of Object.entries(DISTRICT_WEIGHTS)) {
  const allSkills = [...RISING, ...DECLINING, ...STABLE];
  
  for (const skillId of allSkills) {
    const group = getSkillGroup(skillId);
    const industryWeight = districtData[group] || 1.0;
    const baseMultiplier = districtData.factor * industryWeight;
    
    let currentCount = 0;
    let monthlyRate = 0;
    
    if (RISING.includes(skillId)) {
      currentCount = randomInRange(15, 40) * baseMultiplier;
      monthlyRate = randomInRange(0.03, 0.06); // +3% to +6%
    } else if (DECLINING.includes(skillId)) {
      currentCount = randomInRange(20, 35) * baseMultiplier;
      monthlyRate = randomInRange(-0.05, -0.02); // -2% to -5%
    } else {
      currentCount = randomInRange(25, 45) * baseMultiplier;
      monthlyRate = 0; // Handled as flat fluctuation
    }
    
    for (const month of MONTHS) {
      let noise = 0;
      if (RISING.includes(skillId) || DECLINING.includes(skillId)) {
        noise = currentCount * randomInRange(-0.10, 0.10);
      } else {
        noise = currentCount * randomInRange(-0.08, 0.08);
        currentCount = currentCount * (1 + randomInRange(-0.01, 0.01)); // ±1% monthly drift
      }
      
      const finalCount = Math.max(0, Math.round(currentCount + noise));
      
      jobPostings.push({
        skillId,
        districtId,
        month,
        postingsCount: finalCount,
      });
      
      if (RISING.includes(skillId) || DECLINING.includes(skillId)) {
        currentCount = currentCount * (1 + monthlyRate);
      }
    }
  }
}

export function getPostingsForSkillDistrict(skillId: string, districtId: string): JobPosting[] {
  return jobPostings.filter(jp => jp.skillId === skillId && jp.districtId === districtId);
}

export function getPostingsForDistrict(districtId: string): JobPosting[] {
  return jobPostings.filter(jp => jp.districtId === districtId);
}
