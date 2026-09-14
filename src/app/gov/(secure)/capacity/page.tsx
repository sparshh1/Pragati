'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { CeilingBars } from '@/components/charts/Charts';
import {
  capacityConstraints, computeSeatCalculation, allSeatCalculations, CONSTRAINT_LABEL,
  machines, machineBookings, machineUtilisation, idleHoursByDistrict,
} from '@/data/capacity';
import { districts } from '@/data/districts';
import { getSkill } from '@/data/skills';
import { GOV_ROLES } from '@/lib/rbac';
import { formatNumber, formatCurrency } from '@/lib/utils';
import { Machine, MachineBooking, SeatCalculation } from '@/types';

const STATUS_TONE = {
  idle: 'rising', 'partially-used': 'warn', saturated: 'declining', 'under-maintenance': 'stable',
} as const;

export default function GovCapacityPage() {
  const { officer, can } = useGov();
  const role = officer ? GOV_ROLES[officer.role] : null;

  const scopedDistricts = role?.scope === 'state'
    ? districts
    : districts.filter(d => d.id === officer?.districtId);

  const [districtId, setDistrictId] = useState(scopedDistricts[0]?.id ?? 'pune');
  const base = capacityConstraints.find(c => c.districtId === districtId)!;

  // Live what-if levers on the four physical ceilings.
  const [trainers, setTrainers] = useState(base.certifiedTrainers);
  const [labs, setLabs] = useState(base.labStations);
  const [beds, setBeds] = useState(base.hostelBeds);
  const [budget, setBudget] = useState(base.annualBudgetLakh);
  const [shifts, setShifts] = useState(base.labShiftsPerDay);
  const [brokered, setBrokered] = useState<Record<string, boolean>>({});
  const [notified, setNotified] = useState<string | null>(null);

  function reset(id: string) {
    const b = capacityConstraints.find(c => c.districtId === id)!;
    setTrainers(b.certifiedTrainers); setLabs(b.labStations);
    setBeds(b.hostelBeds); setBudget(b.annualBudgetLakh); setShifts(b.labShiftsPerDay);
    setNotified(null);
  }

  const calc = computeSeatCalculation(districtId, {
    certifiedTrainers: trainers, labStations: labs, hostelBeds: beds,
    annualBudgetLakh: budget, labShiftsPerDay: shifts,
  });
  const baseline = computeSeatCalculation(districtId);
  const all = allSeatCalculations().filter(c => role?.scope === 'state' || c.districtId === officer?.districtId);

  const localMachines = machines.filter(m => m.districtId === districtId);
  const idle = idleHoursByDistrict(districtId);
  const pending = machineBookings.filter(b => b.status === 'requested');

  const ceilingData = [
    { name: 'Trainers', value: calc.trainerCeiling, binding: calc.bindingConstraint === 'trainer' },
    { name: 'Lab shifts', value: calc.labCeiling, binding: calc.bindingConstraint === 'lab' },
    { name: 'Hostel beds', value: calc.hostelCeiling, binding: calc.bindingConstraint === 'hostel' },
    { name: 'Budget', value: calc.budgetCeiling, binding: calc.bindingConstraint === 'budget' },
    { name: 'Verified demand', value: calc.demandDrivenSeats, binding: calc.bindingConstraint === 'demand' },
  ];

  const delta = calc.hardLimit - baseline.hardLimit;

  return (
    <>
      <PageHeader
        eyebrow="Pillar 4 — Constraint-Aware Capacity Planner"
        title="Hard-limit seat calculator"
        description="How many seats this district can actually deliver."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'Capacity Planner' }]}
        actions={
          <div className="min-w-[190px]">
            <label className="gov-label" htmlFor="cap-dist">District</label>
            <select id="cap-dist" className="gov-input" value={districtId}
              onChange={e => { setDistrictId(e.target.value); reset(e.target.value); }}
              disabled={scopedDistricts.length === 1}>
              {scopedDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        }
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        <Stat label="Demand-driven ask" value={formatNumber(calc.demandDrivenSeats)}
          sub="seats/yr, trust-weighted" accent="var(--gov-navy)" />
        <Stat label="Hard limit" value={formatNumber(calc.hardLimit)}
          sub={`bound by ${CONSTRAINT_LABEL[calc.bindingConstraint].toLowerCase()}`}
          tone="warn" accent="var(--gov-navy)" />
        <Stat label="Currently notified" value={formatNumber(base.seatsNotified)}
          sub={`${calc.utilisationPercent}% of the hard limit`}
          tone={base.seatsNotified > calc.hardLimit ? 'negative' : 'positive'} accent="var(--gov-navy)" />
        <Stat label="Ghost seats" value={formatNumber(calc.ghostSeats)}
          sub={calc.ghostSeats ? 'No bench, trainer, bed or rupee behind them' : 'Plan is within limits'}
          tone={calc.ghostSeats ? 'negative' : 'positive'} accent="var(--gov-navy)" />
        <Stat label="Idle machine hours" value={formatNumber(idle.idleHoursPerWeek)}
          sub={`could unlock ${formatNumber(idle.additionalSeatsUnlocked)} seats/yr`}
          tone="positive" accent="var(--gov-navy)" />
      </div>

      <div className="grid xl:grid-cols-[1.15fr_1fr] gap-5 mb-5">
        <Card title={`Binding constraint — ${districts.find(d => d.id === districtId)?.name}`}
          subtitle="Red bar = the binding limit">
          <CeilingBars data={ceilingData} hardLimit={calc.hardLimit} notified={base.seatsNotified} height={290} />

          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            {calc.ghostSeats > 0 ? (
              <Note tone="danger" title={`${formatNumber(calc.ghostSeats)} ghost seats in the current notification`}>
                {districts.find(d => d.id === districtId)?.name} has notified {formatNumber(base.seatsNotified)} seats
                against a binding {CONSTRAINT_LABEL[calc.bindingConstraint].toLowerCase()} ceiling of{' '}
                {formatNumber(calc.hardLimit)}. Those seats will either not fill, or will fill and then fail
                to deliver contact hours. Reduce the notification, or lift the binding constraint below.
              </Note>
            ) : (
              <Note tone="success" title="Plan is deliverable">
                Notified seats sit within every physical ceiling. Every admitted candidate has a trainer, a
                bench, a bed where required, and funded cost.
              </Note>
            )}
          </div>
        </Card>

        <Card title="What-if: lift a constraint"
          subtitle="Move a lever, watch the limit shift"
          action={<PermTag permission="seats.allocate" />}>
          <div className="space-y-4">
            <Lever label="Certified trainers" value={trainers} min={80} max={700} step={10}
              onChange={setTrainers} baseline={base.certifiedTrainers}
              note={`× ${base.traineesPerTrainerMax} trainees each = ${formatNumber(calc.trainerCeiling)} seat ceiling`} />
            <Lever label="Lab stations" value={labs} min={200} max={1800} step={20}
              onChange={setLabs} baseline={base.labStations}
              note={`× ${shifts} shifts × 3 cycles = ${formatNumber(calc.labCeiling)} seat ceiling`} />
            <Lever label="Lab shifts per day" value={shifts} min={1} max={3} step={1}
              onChange={setShifts} baseline={base.labShiftsPerDay}
              note="A third shift is the cheapest way to lift the lab ceiling" />
            <Lever label="Hostel beds" value={beds} min={400} max={4000} step={50}
              onChange={setBeds} baseline={base.hostelBeds}
              note={`÷ 45% residential share = ${formatNumber(calc.hostelCeiling)} seat ceiling`} />
            <Lever label="Annual budget (₹ lakh)" value={budget} min={300} max={3000} step={25}
              onChange={setBudget} baseline={base.annualBudgetLakh}
              note={`÷ ${base.costPerSeatLakh} L per seat = ${formatNumber(calc.budgetCeiling)} seat ceiling`} />
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--border)]">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[12px] font-bold uppercase tracking-wide text-[var(--ink-secondary)]">
                Resulting hard limit
              </span>
              <span className="text-[26px] font-bold mono text-[var(--gov-navy)]">
                {formatNumber(calc.hardLimit)}
              </span>
            </div>
            <p className="text-[12px] text-[var(--ink-secondary)]">
              Now bound by <strong>{CONSTRAINT_LABEL[calc.bindingConstraint].toLowerCase()}</strong>
              {delta !== 0 && (
                <span className={delta > 0 ? 'text-[var(--signal-rising)] font-bold' : 'text-[var(--signal-declining)] font-bold'}>
                  {' '}({delta > 0 ? '+' : ''}{formatNumber(delta)} vs current)
                </span>
              )}
            </p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => reset(districtId)}
                className="flex-1 text-[12.5px] font-semibold py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                Reset to actual
              </button>
              {can('seats.allocate') ? (
                <button onClick={() => setNotified(`Seat matrix revised to ${formatNumber(calc.hardLimit)} — sent for notification`)}
                  className="flex-1 text-[12.5px] font-bold py-2 bg-[var(--gov-navy)] text-white rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring">
                  Notify this seat matrix
                </button>
              ) : (
                <div className="flex-1"><Gated permission="seats.allocate" label="Seat notification"><span /></Gated></div>
              )}
            </div>
            {notified && (
              <p className="text-[12px] font-semibold text-[var(--signal-rising)] mt-2">✓ {notified}</p>
            )}
          </div>
        </Card>
      </div>

      {role?.scope === 'state' && (
        <Card title="State-wide seat plan" subtitle="Binding constraint and ghost seats" dense>
          <Table
            columns={[
              { key: 'district', header: 'District',
                render: (c: SeatCalculation) => (
                  <span className="text-[12.5px] font-semibold">
                    {districts.find(d => d.id === c.districtId)?.name}
                  </span>
                ), sortValue: c => c.districtId },
              { key: 'demand', header: 'Demand ask', align: 'right',
                render: c => <span className="mono">{formatNumber(c.demandDrivenSeats)}</span>,
                sortValue: c => c.demandDrivenSeats },
              { key: 'limit', header: 'Hard limit', align: 'right',
                render: c => <span className="mono font-bold">{formatNumber(c.hardLimit)}</span>,
                sortValue: c => c.hardLimit },
              { key: 'binding', header: 'Bound by',
                render: c => <Badge variant="warn">{CONSTRAINT_LABEL[c.bindingConstraint]}</Badge> },
              { key: 'notified', header: 'Notified', align: 'right', hideBelow: 'sm',
                render: c => (
                  <span className="mono">
                    {formatNumber(capacityConstraints.find(x => x.districtId === c.districtId)!.seatsNotified)}
                  </span>
                ) },
              { key: 'ghost', header: 'Ghost seats', align: 'right',
                render: c => (
                  <span className={`mono font-bold ${c.ghostSeats ? 'text-[var(--signal-declining)]' : 'text-[var(--signal-rising)]'}`}>
                    {c.ghostSeats ? formatNumber(c.ghostSeats) : '—'}
                  </span>
                ), sortValue: c => c.ghostSeats },
              { key: 'util', header: 'Utilisation', align: 'right', hideBelow: 'md',
                render: c => (
                  <div className="w-[80px] ml-auto">
                    <Progress value={Math.min(150, c.utilisationPercent)} max={150}
                      color={c.utilisationPercent > 100 ? 'var(--signal-declining)' : 'var(--signal-rising)'}
                      height={6} />
                    <p className="text-[10.5px] mono text-right mt-0.5">{c.utilisationPercent}%</p>
                  </div>
                ), sortValue: c => c.utilisationPercent },
            ]}
            rows={all}
            rowKey={c => c.districtId}
            onRowClick={c => { setDistrictId(c.districtId); reset(c.districtId); }}
            highlight={c => c.ghostSeats > 1000 ? 'var(--signal-declining)' : undefined}
          />
        </Card>
      )}

      {/* ---- Idle machine brokerage ---- */}
      <div className="grid xl:grid-cols-[1.2fr_1fr] gap-5 mt-5">
        <Card title="Idle Machine Sharing"
          subtitle={`${formatNumber(idle.idleHoursPerWeek)} idle hours per week in this district — ${formatNumber(idle.idleHoursPerYear)} a year`}
          dense>
          <Table
            columns={[
              { key: 'name', header: 'Machine', render: (m: Machine) => (
                <div>
                  <p className="text-[12.5px] font-semibold">{m.name}</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)]">
                    {m.ownerName} · <span className="mono">{m.id}</span>
                  </p>
                  <p className="text-[10px] text-[var(--ink-tertiary)]">
                    {m.skillIds.map(s => getSkill(s)?.name).join(' · ')}
                  </p>
                </div>
              ) },
              { key: 'owner', header: 'Owner', hideBelow: 'md',
                render: (m: Machine) => (
                  <Badge variant={m.ownerType === 'private-factory' ? 'employer' : 'officer'}>
                    {m.ownerType === 'private-factory' ? 'private' : 'govt'}
                  </Badge>
                ) },
              { key: 'util', header: 'Utilisation', align: 'right', sortValue: m => machineUtilisation(m),
                render: (m: Machine) => (
                  <div className="w-[84px] ml-auto">
                    <Progress value={machineUtilisation(m)}
                      color={machineUtilisation(m) >= 95 ? 'var(--signal-declining)'
                        : machineUtilisation(m) >= 70 ? 'var(--signal-warn)' : 'var(--signal-rising)'}
                      height={6} />
                    <p className="text-[10.5px] mono text-right mt-0.5">
                      {m.bookedHoursPerWeek}/{m.capacityHoursPerWeek} h
                    </p>
                  </div>
                ) },
              { key: 'rate', header: 'Rate/h', align: 'right', hideBelow: 'sm',
                render: (m: Machine) => (
                  <span className="mono">{m.sharedRatePerHour ? formatCurrency(m.sharedRatePerHour) : 'Govt.'}</span>
                ) },
              { key: 'status', header: 'Status',
                render: (m: Machine) => <Badge variant={STATUS_TONE[m.status]}>{m.status.replace('-', ' ')}</Badge> },
            ]}
            rows={localMachines}
            rowKey={m => m.id}
            highlight={m => m.status === 'idle' ? 'var(--signal-rising)' : m.status === 'saturated' ? 'var(--signal-declining)' : undefined}
          />
        </Card>

        <div className="space-y-5">
          <Card title="Brokerage requests awaiting decision" action={<PermTag permission="machine.broker" />}>
            {pending.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">No requests pending.</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((b: MachineBooking) => {
                  const m = machines.find(x => x.id === b.machineId)!;
                  const done = brokered[b.id];
                  return (
                    <li key={b.id} className="border border-[var(--border)] rounded-sm p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-bold text-[var(--ink)]">{b.requestedBy}</p>
                          <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{b.id} · {b.requestedOn}</p>
                        </div>
                        <Badge variant={b.requesterType === 'iti' ? 'officer' : 'employer'}>{b.requesterType}</Badge>
                      </div>
                      <p className="text-[11.5px] text-[var(--ink-secondary)]">
                        {m.name} — {b.hoursPerWeek} h/week × {b.weeks} weeks
                        {m.sharedRatePerHour > 0 && (
                          <> · {formatCurrency(b.hoursPerWeek * b.weeks * m.sharedRatePerHour)} payable to {m.ownerName}</>
                        )}
                      </p>
                      {done ? (
                        <p className="text-[12px] font-semibold text-[var(--signal-rising)] mt-2">
                          ✓ Brokered — slot allocated and the owner notified.
                        </p>
                      ) : can('machine.broker') ? (
                        <div className="flex gap-2 mt-2.5">
                          <button onClick={() => setBrokered(x => ({ ...x, [b.id]: true }))}
                            className="flex-1 text-[12px] font-bold py-1.5 bg-[var(--gov-navy)] text-white rounded-sm focus-ring">
                            Broker this slot
                          </button>
                          <button className="flex-1 text-[12px] font-semibold py-1.5 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2"><Gated permission="machine.broker" label="Machine brokerage"><span /></Gated></div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Lever({
  label, value, min, max, step, onChange, baseline, note,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; baseline: number; note: string;
}) {
  const changed = value !== baseline;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="text-[12.5px] text-[var(--ink)]" htmlFor={`lev-${label}`}>{label}</label>
        <span className="text-[13px] mono font-bold" style={{ color: changed ? 'var(--gov-navy)' : 'var(--ink)' }}>
          {formatNumber(value)}
          {changed && (
            <span className="text-[10.5px] font-normal text-[var(--ink-tertiary)] ml-1">
              (was {formatNumber(baseline)})
            </span>
          )}
        </span>
      </div>
      <input id={`lev-${label}`} type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--gov-navy)]" />
      <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-0.5">{note}</p>
    </div>
  );
}
