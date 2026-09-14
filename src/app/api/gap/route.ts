import { NextRequest, NextResponse } from 'next/server';
import { computeGapForDistrict } from '@/data/compute/gapAnalysis';
import { uncoveredSkills } from '@/data/signals';

/**
 * Demand-supply gap register for one district, plus the skills with verified
 * demand that no course in that district covers.
 *
 * GET /api/gap?district=pune&limit=20
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const limit = Number(searchParams.get('limit') ?? 50);

  if (!district) {
    return NextResponse.json({ error: 'A `district` query parameter is required.' }, { status: 400 });
  }

  const gaps = computeGapForDistrict(district);
  if (gaps.length === 0) {
    return NextResponse.json({ error: `Unknown district "${district}".` }, { status: 404 });
  }

  return NextResponse.json({
    district,
    totalUnmetDemand: gaps.filter(g => g.gap > 0).reduce((a, g) => a + g.gap, 0),
    gaps: gaps.slice(0, limit),
    uncoveredSkills: uncoveredSkills.filter(u => u.districtId === district),
  });
}
