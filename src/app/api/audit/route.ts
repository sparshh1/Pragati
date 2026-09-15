import { NextRequest, NextResponse } from 'next/server';
import { payrollAudits, auditStats, VERDICT_LABEL } from '@/data/audit';
import { workTrials, hiringPools, poolTrialStats, TRIAL_PASS_THRESHOLD } from '@/data/hiring';

/**
 * Pillars 2 and 6 - the placement chain, end to end: work-trial gate outcome,
 * then EPFO payroll reconciliation, then whether subsidy may be released.
 *
 * GET /api/audit?district=csn&verdict=ghost-placement
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get('district');
  const verdict = searchParams.get('verdict');

  let rows = payrollAudits;
  if (district) rows = rows.filter(a => a.districtId === district);
  if (verdict) rows = rows.filter(a => a.verdict === verdict);

  return NextResponse.json({
    summary: auditStats(district ?? undefined),
    gate: {
      threshold: TRIAL_PASS_THRESHOLD,
      concluded: workTrials.filter(t => t.outcome === 'passed' || t.outcome === 'failed').length,
      passed: workTrials.filter(t => t.outcome === 'passed').length,
      confirmedOnPayroll: workTrials.filter(t => t.epfoConfirmedOn !== null).length,
    },
    subsidyReleasable: hiringPools.reduce(
      (a, p) => a + poolTrialStats(p.id).subsidyReleasable * p.subsidyPerSeat, 0,
    ),
    count: rows.length,
    audits: rows.map(a => ({ ...a, verdictLabel: VERDICT_LABEL[a.verdict] })),
  });
}
