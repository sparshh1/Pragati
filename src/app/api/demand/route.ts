import { NextRequest, NextResponse } from 'next/server';
import { computeDemandTrend } from '@/data/compute/demandTrend';
import { dyingTasks } from '@/data/signals';

/**
 * Pillar 1 — demand trajectory for one trade in one district, plus any tasks
 * inside that trade the Dying Task Watch has flagged.
 *
 * GET /api/demand?district=pune&skill=ev-battery-diagnostics
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const skill = searchParams.get('skill');

  if (!district || !skill) {
    return NextResponse.json(
      { error: 'Both `district` and `skill` query parameters are required.' },
      { status: 400 },
    );
  }

  const trend = computeDemandTrend(skill, district);
  if (trend.timeSeries.length === 0) {
    return NextResponse.json(
      { error: `No posting series held for skill "${skill}" in district "${district}".` },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ...trend,
    dyingTasks: dyingTasks
      .filter(t => t.skillId === skill && t.affectedDistrictIds.includes(district))
      .map(t => ({
        id: t.id,
        taskName: t.taskName,
        hoursChangeYoY: t.hoursChangeYoY,
        shareOfTradeHours: t.shareOfTradeHours,
        displacedBy: t.displacedBy,
        modulesStillTeaching: t.syllabusModulesStillTeaching,
        severity: t.severity,
      })),
  });
}
