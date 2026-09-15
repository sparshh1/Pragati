import { NextRequest, NextResponse } from 'next/server';
import {
  demandSignals, signalSources, filterImpact, computeTrustWeight, verdictFor,
} from '@/data/signals';

/**
 * Pillar 1 - the Trust-Weighted Quality Filter.
 *
 * GET  /api/signals?district=pune&verdict=verified   - read the register
 * POST /api/signals                                   - score a signal without storing it
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const verdict = searchParams.get('verdict');
  const skill = searchParams.get('skill');

  let rows = demandSignals;
  if (district) rows = rows.filter(s => s.districtId === district);
  if (skill) rows = rows.filter(s => s.skillId === skill);
  if (verdict) rows = rows.filter(s => s.verdict === verdict);

  return NextResponse.json({
    impact: filterImpact(),
    count: rows.length,
    signals: rows,
  });
}

export async function POST(request: NextRequest) {
  let body: { sourceId?: string; reportedVacancies?: number; flags?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { sourceId, reportedVacancies, flags = [] } = body;
  if (!sourceId || typeof reportedVacancies !== 'number') {
    return NextResponse.json(
      { error: '`sourceId` and numeric `reportedVacancies` are required.' },
      { status: 400 },
    );
  }

  const source = signalSources.find(s => s.id === sourceId);
  if (!source) {
    return NextResponse.json({ error: `Unknown source "${sourceId}".` }, { status: 404 });
  }

  const trustWeight = computeTrustWeight(source, flags);
  return NextResponse.json({
    source: source.name,
    reportedVacancies,
    trustWeight,
    weightedVacancies: Math.round(reportedVacancies * trustWeight),
    verdict: verdictFor(trustWeight, flags),
    flags,
  });
}
