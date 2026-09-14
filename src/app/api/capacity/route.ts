import { NextRequest, NextResponse } from 'next/server';
import {
  computeSeatCalculation, allSeatCalculations, capacityConstraints,
  idleHoursByDistrict, CONSTRAINT_LABEL,
} from '@/data/capacity';

/**
 * Pillar 4 — the Hard-Limit Seat Calculator.
 *
 * GET  /api/capacity                 — every district
 * GET  /api/capacity?district=pune   — one district, with its idle machine pool
 * POST /api/capacity                 — what-if: override one or more ceilings
 */
export async function GET(request: NextRequest) {
  const district = new URL(request.url).searchParams.get('district');

  if (!district) {
    return NextResponse.json({ districts: allSeatCalculations() });
  }

  const constraint = capacityConstraints.find(c => c.districtId === district);
  if (!constraint) {
    return NextResponse.json({ error: `Unknown district "${district}".` }, { status: 404 });
  }

  const calc = computeSeatCalculation(district);
  return NextResponse.json({
    ...calc,
    bindingConstraintLabel: CONSTRAINT_LABEL[calc.bindingConstraint],
    seatsNotified: constraint.seatsNotified,
    constraint,
    idleMachineCapacity: idleHoursByDistrict(district),
  });
}

export async function POST(request: NextRequest) {
  let body: {
    districtId?: string;
    certifiedTrainers?: number;
    labStations?: number;
    labShiftsPerDay?: number;
    hostelBeds?: number;
    annualBudgetLakh?: number;
    demandOverride?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { districtId, ...overrides } = body;
  if (!districtId) {
    return NextResponse.json({ error: '`districtId` is required.' }, { status: 400 });
  }
  if (!capacityConstraints.some(c => c.districtId === districtId)) {
    return NextResponse.json({ error: `Unknown district "${districtId}".` }, { status: 404 });
  }

  const baseline = computeSeatCalculation(districtId);
  const revised = computeSeatCalculation(districtId, overrides);

  return NextResponse.json({
    baseline,
    revised,
    seatDelta: revised.hardLimit - baseline.hardLimit,
    bindingConstraintChanged: revised.bindingConstraint !== baseline.bindingConstraint,
    bindingConstraintLabel: CONSTRAINT_LABEL[revised.bindingConstraint],
  });
}
