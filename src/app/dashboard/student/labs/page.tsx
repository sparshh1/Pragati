'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { machines, machineUtilisation, idleHoursByDistrict, computeSeatCalculation, CONSTRAINT_LABEL } from '@/data/capacity';
import { districts } from '@/data/districts';
import { getSkill } from '@/data/skills';
import { formatNumber, formatCurrency } from '@/lib/utils';

const STATUS_TONE = {
  idle: 'rising', 'partially-used': 'warn', saturated: 'declining', 'under-maintenance': 'stable',
} as const;

const STATUS_COPY = {
  idle: 'Open — slots available now',
  'partially-used': 'Some slots left this week',
  saturated: 'Fully booked',
  'under-maintenance': 'Out of service',
} as const;

const OWNER_COPY = {
  iti: 'Government ITI', polytechnic: 'Government Polytechnic', 'private-factory': 'Private industry (shared)',
} as const;

export default function StudentLabsPage() {
  const { account } = useCitizen();
  const [districtId, setDistrictId] = useState(account?.districtId ?? 'pune');
  const [booked, setBooked] = useState<Record<string, string>>({});

  const local = machines.filter(m => m.districtId === districtId);
  const idle = idleHoursByDistrict(districtId);
  const calc = computeSeatCalculation(districtId);
  const districtName = districts.find(d => d.id === districtId)?.name;

  const SLOTS = ['Mon 14:00–17:00', 'Wed 09:00–12:00', 'Thu 18:00–21:00 (2nd shift)', 'Sat 09:00–13:00'];

  return (
    <>
      <PageHeader
        eyebrow="Practice time"
        title="Book machine time"
        description="Book bench time, including private factory machines."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Lab & Machine Slots' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Machines you can use" value={local.length}
          sub={`${local.filter(m => m.ownerType === 'private-factory').length} from private industry`}
          accent="var(--accent-student)" />
        <Stat label="Free hours this week" value={formatNumber(idle.idleHoursPerWeek)}
          sub="Bench time nobody is using right now" tone="positive" accent="var(--accent-student)" />
        <Stat label="Extra places this creates" value={formatNumber(idle.additionalSeatsUnlocked)}
          sub="Per year, without buying a single machine" tone="positive" accent="var(--accent-student)" />
        <Stat label={`${districtName} bound by`} value={CONSTRAINT_LABEL[calc.bindingConstraint]}
          sub={`Hard limit ${formatNumber(calc.hardLimit)} seats/yr`}
          tone="warn" accent="var(--accent-student)" />
      </div>

      <div className="gov-card p-4 mb-5">
        <label className="gov-label" htmlFor="lab-district">District</label>
        <select id="lab-district" className="gov-input max-w-xs" value={districtId} onChange={e => setDistrictId(e.target.value)}>
          {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {local.map(m => {
          const util = machineUtilisation(m);
          const free = Math.max(0, m.capacityHoursPerWeek - m.bookedHoursPerWeek);
          const bookable = m.status === 'idle' || m.status === 'partially-used';
          return (
            <Card key={m.id} title={m.name}
              subtitle={`${OWNER_COPY[m.ownerType]} · ${m.ownerName}`}
              action={<Badge variant={STATUS_TONE[m.status]} dot>{STATUS_COPY[m.status]}</Badge>}
            >
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="mono text-[10.5px] bg-[var(--surface-alt)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm">
                  {m.id}
                </span>
                {m.skillIds.map(s => (
                  <span key={s} className="text-[10.5px] bg-[var(--accent-student-light)] text-[var(--accent-student)] px-2 py-0.5 rounded-sm font-semibold">
                    {getSkill(s)?.name ?? s}
                  </span>
                ))}
              </div>

              <Progress value={util}
                color={util >= 95 ? 'var(--signal-declining)' : util >= 70 ? 'var(--signal-warn)' : 'var(--signal-rising)'}
                label={`${m.bookedHoursPerWeek} of ${m.capacityHoursPerWeek} hours booked this week`}
                showValue height={9} />

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[var(--border)] text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Free hours</p>
                  <p className="text-[15px] font-bold mono" style={{ color: free > 0 ? 'var(--signal-rising)' : 'var(--ink-tertiary)' }}>
                    {free}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Cost to you</p>
                  <p className="text-[15px] font-bold mono">
                    {m.sharedRatePerHour === 0 ? 'Free' : formatCurrency(0)}
                  </p>
                  <p className="text-[9.5px] text-[var(--ink-tertiary)]">
                    {m.sharedRatePerHour === 0 ? 'Govt. facility' : 'State pays the owner'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wide text-[var(--ink-tertiary)]">Last serviced</p>
                  <p className="text-[12px] font-semibold mono">{m.lastServicedOn}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                {booked[m.id] ? (
                  <div className="flex items-center gap-2 bg-[var(--signal-rising-light)] border border-[var(--signal-rising)]/40 rounded-sm px-3 py-2.5">
                    <span className="text-[var(--signal-rising)] font-bold">✓</span>
                    <span className="text-[12.5px] text-[var(--signal-rising)] font-semibold">
                      Slot requested — {booked[m.id]}. Confirmation by SMS within 24 hours.
                    </span>
                  </div>
                ) : bookable ? (
                  <>
                    <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                      Request a slot
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SLOTS.slice(0, m.status === 'idle' ? 4 : 2).map(s => (
                        <button key={s} onClick={() => setBooked(b => ({ ...b, [m.id]: s }))}
                          className="text-[11.5px] border border-[var(--border-strong)] px-2.5 py-1.5 rounded-sm hover:bg-[var(--accent-student-light)] hover:border-[var(--accent-student)] focus-ring">
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-2">
                      Contact point: {m.contactCell}
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-[var(--ink-tertiary)]">
                    {m.status === 'saturated'
                      ? 'This machine is fully booked. Your district officer can broker equivalent private capacity — ask at your centre.'
                      : `Out of service since last check. Next service due after ${m.lastServicedOn}.`}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {local.length === 0 && (
        <Card><p className="text-[13px] text-[var(--ink-tertiary)]">No machines listed in this district yet.</p></Card>
      )}
    </>
  );
}
