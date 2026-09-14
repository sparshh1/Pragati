import { DemandTrendResult, TrendDirection } from '@/types';
import { jobPostings } from '@/data/jobPostings';
import { skills } from '@/data/skills';
import { districts } from '@/data/districts';

// Simple linear regression: y = mx + b
function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: yMean - slope * xMean };
}

function classifyTrend(yoyChange: number): TrendDirection {
  if (yoyChange > 15) return 'rising';
  if (yoyChange < -15) return 'declining';
  return 'stable';
}

export function computeDemandTrend(skillId: string, districtId: string): DemandTrendResult {
  const series = jobPostings
    .filter(p => p.skillId === skillId && p.districtId === districtId)
    .sort((a, b) => a.month.localeCompare(b.month));
  
  if (series.length === 0) {
    return {
      skillId, districtId,
      slope: 0, currentMonthlyDemand: 0, yoyChangePercent: 0,
      forecast6m: 0, direction: 'stable',
      timeSeries: [],
    };
  }

  const values = series.map(s => s.postingsCount);
  const { slope } = linearRegression(values);
  
  // Current monthly demand: average of last 3 months
  const last3 = values.slice(-3);
  const currentMonthlyDemand = Math.round(last3.reduce((a, b) => a + b, 0) / last3.length);
  
  // YoY change: last 6 months avg vs first 6 months avg
  const first6Avg = values.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
  const last6Avg = values.slice(-6).reduce((a, b) => a + b, 0) / 6;
  const yoyChangePercent = first6Avg === 0 ? 0 : Math.round(((last6Avg - first6Avg) / first6Avg) * 100);
  
  // Forecast 6 months out (naive linear projection)
  const forecast6m = Math.max(0, Math.round(currentMonthlyDemand + slope * 6));
  
  return {
    skillId, districtId, slope: Math.round(slope * 100) / 100,
    currentMonthlyDemand, yoyChangePercent, forecast6m,
    direction: classifyTrend(yoyChangePercent),
    timeSeries: series.map(s => ({ month: s.month, postingsCount: s.postingsCount })),
  };
}

// NOTE: In the production system, this would be replaced by the L2 Kalman-filter/DFM
// demand nowcast (see architecture doc §3.2). The prototype uses simple linear regression
// for deterministic, reproducible demo numbers.

export function computeAllTrends(): DemandTrendResult[] {
  const results: DemandTrendResult[] = [];
  for (const skill of skills) {
    for (const district of districts) {
      const trend = computeDemandTrend(skill.id, district.id);
      if (trend.timeSeries.length > 0) {
        results.push(trend);
      }
    }
  }
  return results;
}

export function getTrendsForDistrict(districtId: string): DemandTrendResult[] {
  return skills.map(s => computeDemandTrend(s.id, districtId)).filter(t => t.timeSeries.length > 0);
}
