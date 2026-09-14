import { GapAnalysisResult } from '@/types';
import { skills } from '@/data/skills';
import { courses } from '@/data/courses';
import { computeDemandTrend } from './demandTrend';

// NOTE: In production, the L3 GoLLIE-based curriculum extractor would parse actual
// course syllabi to determine skill coverage. This prototype uses explicit skill-to-course
// mappings in the seed data.

export function computeGapForDistrict(districtId: string): GapAnalysisResult[] {
  const districtCourses = courses.filter(c => c.districtId === districtId);
  
  return skills.map(skill => {
    const trend = computeDemandTrend(skill.id, districtId);
    
    // Supply: total seats in courses teaching this skill in this district
    const supply = districtCourses
      .filter(c => c.skillIds.includes(skill.id))
      .reduce((sum, c) => sum + c.currentSeats, 0);
    
    // Demand: annualized from current monthly demand
    const annualDemand = trend.currentMonthlyDemand * 12;
    
    const gap = annualDemand - supply;
    const gapRatio = annualDemand === 0 ? 0 : gap / annualDemand;
    
    return {
      skillId: skill.id,
      skillName: skill.name,
      sector: skill.sector,
      districtId,
      annualDemand,
      currentSupply: supply,
      gap,
      gapRatio: Math.round(gapRatio * 100) / 100,
      trend: trend.direction,
      yoyChangePercent: trend.yoyChangePercent,
    };
  }).sort((a, b) => b.gapRatio - a.gapRatio);
}

export function getTopGaps(districtId: string, limit = 10): GapAnalysisResult[] {
  return computeGapForDistrict(districtId)
    .filter(g => g.gap > 0 && g.trend !== 'declining')
    .slice(0, limit);
}

export function getObsoleteCoursesForDistrict(districtId: string) {
  // Courses where ALL taught skills are declining
  const districtCourses = courses.filter(c => c.districtId === districtId);
  
  return districtCourses.filter(course => {
    if (course.skillIds.length === 0) return false;
    return course.skillIds.every(skillId => {
      const trend = computeDemandTrend(skillId, districtId);
      return trend.direction === 'declining';
    });
  }).map(course => {
    const skillTrends = course.skillIds.map(sid => {
      const trend = computeDemandTrend(sid, districtId);
      const skill = skills.find(s => s.id === sid);
      return { skillName: skill?.name || sid, yoyChange: trend.yoyChangePercent };
    });
    return {
      courseId: course.id,
      courseName: course.name,
      courseType: course.type,
      currentSeats: course.currentSeats,
      enrolled: course.enrolled,
      decliningSkills: skillTrends,
      avgDemandDrop: Math.round(skillTrends.reduce((s, t) => s + t.yoyChange, 0) / skillTrends.length),
    };
  });
}
