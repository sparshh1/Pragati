'use client';

import { useState } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Table } from '@/components/ui/Table';
import { machines, machineBookings, machineUtilisation, idleHoursByDistrict } from '@/data/capacity';
import { districts } from '@/data/districts';
import { skills, getSkill } from '@/data/skills';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { PILLARS } from '@/data/pillars';
import { Machine } from '@/types';

const STATUS_TONE = {
  idle: 'rising', 'partially-used': 'warn', saturated: 'declining', 'under-maintenance': 'stable',
} as const;

export default function BusinessMachinesPage() {
  const { account } = useCitizen();
  const pillar = PILLARS[3];
  const districtId = account?.districtId ?? 'pune';

  const [listing, setListing] = useState({
    name: '', skillId: skills[0].id, hours: 20, rate: 300, shift: '2nd shift (18:00–02:00)',
  });
  const [listed, setListed] = useState<typeof listing[]>([]);
  const [decisions, setDecisions] = useState<Record<string, 'approved' | 'rejected'>>({});

  const local = machines.filter(m => m.districtId === districtId);
  const mine = local.filter(m => m.ownerType === 'private-factory');
  const idle = idleHoursByDistrict(districtId);

  const pendingBookings = machineBookings.filter(
    b => b.status === 'requested' && local.some(m => m.id === b.machineId),
  );

  const annualEarnings = listed.reduce((a, l) => a + l.hours * l.rate * 44, 0);

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number} — ${pillar.short}`}
        title="Idle machine exchange"
        description="Earn from machine time you are not using."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/business' }, { label: 'Idle Machine Exchange' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Your listed machines" value={mine.length + listed.length}
          sub={`${local.length} total in ${districts.find(d => d.id === districtId)?.name}`}
          accent="var(--accent-employer)" />
        <Stat label="Idle hours in this district" value={formatNumber(idle.idleHoursPerWeek)}
          sub="per week, across the shared pool" tone="warn" accent="var(--accent-employer)" />
        <Stat label="Seats those hours unlock" value={formatNumber(idle.additionalSeatsUnlocked)}
          sub="per year, with zero new capex" tone="positive" accent="var(--accent-employer)" />
        <Stat label="Booking requests awaiting you" value={pendingBookings.length}
          sub={pendingBookings.length ? 'Needs your decision' : 'Nothing pending'}
          tone={pendingBookings.length ? 'warn' : 'neutral'} accent="var(--accent-employer)" />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.25fr] gap-5">
        <div className="space-y-5">
          <Card title="List idle capacity" subtitle="Hours you are not using, at a rate you set">
            <div className="space-y-4">
              <div>
                <label className="gov-label" htmlFor="m-name">Machine or bench</label>
                <input id="m-name" className="gov-input" value={listing.name}
                  onChange={e => setListing(l => ({ ...l, name: e.target.value }))}
                  placeholder="e.g. Fronius TransSteel 2700 MIG bay ×3" />
              </div>
              <div>
                <label className="gov-label" htmlFor="m-skill">Trade it can train</label>
                <select id="m-skill" className="gov-input" value={listing.skillId}
                  onChange={e => setListing(l => ({ ...l, skillId: e.target.value }))}>
                  {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="gov-label" htmlFor="m-hours">Free hours per week</label>
                  <input id="m-hours" type="number" min={1} max={120} className="gov-input mono"
                    value={listing.hours} onChange={e => setListing(l => ({ ...l, hours: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="gov-label" htmlFor="m-rate">Rate per hour (₹)</label>
                  <input id="m-rate" type="number" min={0} step={10} className="gov-input mono"
                    value={listing.rate} onChange={e => setListing(l => ({ ...l, rate: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="gov-label" htmlFor="m-shift">Shift window offered</label>
                <select id="m-shift" className="gov-input" value={listing.shift}
                  onChange={e => setListing(l => ({ ...l, shift: e.target.value }))}>
                  <option>2nd shift (18:00–02:00)</option>
                  <option>3rd shift (02:00–08:00)</option>
                  <option>Weekends only</option>
                  <option>Weekday daytime — surplus bays</option>
                </select>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-3">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)]">
                  Indicative annual receipt
                </p>
                <p className="text-[22px] font-bold mono text-[var(--signal-rising)]">
                  {formatCurrency(listing.hours * listing.rate * 44)}
                </p>
                <p className="text-[11px] text-[var(--ink-tertiary)]">
                  {listing.hours} h/week × {formatCurrency(listing.rate)}/h × 44 working weeks, paid by the State
                </p>
              </div>

              <button
                disabled={!listing.name.trim()}
                onClick={() => { setListed(l => [...l, listing]); setListing(x => ({ ...x, name: '' })); }}
                className="w-full text-white font-bold text-[13.5px] py-2.5 rounded-sm focus-ring disabled:opacity-45"
                style={{ background: 'var(--accent-employer)' }}>
                List this machine →
              </button>
            </div>

            {listed.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                  Listed this session — {formatCurrency(annualEarnings)}/year combined
                </p>
                <ul className="space-y-1.5">
                  {listed.map((l, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 border border-[var(--border)] rounded-sm px-3 py-2 text-[12px]">
                      <span className="min-w-0 truncate">
                        <span className="font-semibold text-[var(--ink)]">{l.name}</span>
                        <span className="text-[var(--ink-tertiary)]"> — {getSkill(l.skillId)?.name}</span>
                      </span>
                      <span className="shrink-0 mono text-[var(--ink-secondary)]">
                        {l.hours} h @ {formatCurrency(l.rate)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Booking requests" subtitle="Centres requesting machine time">
            {pendingBookings.length === 0 ? (
              <p className="text-[13px] text-[var(--ink-tertiary)]">No requests pending.</p>
            ) : (
              <ul className="space-y-3">
                {pendingBookings.map(b => {
                  const m = machines.find(x => x.id === b.machineId)!;
                  const decision = decisions[b.id];
                  return (
                    <li key={b.id} className="border border-[var(--border)] rounded-sm p-3.5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[var(--ink)]">{b.requestedBy}</p>
                          <p className="text-[11px] mono text-[var(--ink-tertiary)]">{b.id} · requested {b.requestedOn}</p>
                        </div>
                        <Badge variant={b.requesterType === 'iti' ? 'officer' : 'employer'}>
                          {b.requesterType === 'iti' ? 'Govt. ITI' : b.requesterType}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-[var(--ink-secondary)]">
                        <strong>{m.name}</strong> — {b.hoursPerWeek} h/week for {b.weeks} weeks
                      </p>
                      <p className="text-[12px] mono text-[var(--signal-rising)] font-semibold mt-1">
                        {formatCurrency(b.hoursPerWeek * b.weeks * m.sharedRatePerHour)} total receipt
                      </p>

                      {decision ? (
                        <p className={`text-[12px] font-semibold mt-2.5 ${
                          decision === 'approved' ? 'text-[var(--signal-rising)]' : 'text-[var(--signal-declining)]'
                        }`}>
                          {decision === 'approved'
                            ? '✓ Approved — slot confirmed and the district officer has been notified.'
                            : '✗ Declined — the request returns to the district officer to re-broker.'}
                        </p>
                      ) : (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setDecisions(d => ({ ...d, [b.id]: 'approved' }))}
                            className="flex-1 text-white font-bold text-[12.5px] py-2 rounded-sm focus-ring"
                            style={{ background: 'var(--signal-rising)' }}>
                            Approve
                          </button>
                          <button onClick={() => setDecisions(d => ({ ...d, [b.id]: 'rejected' }))}
                            className="flex-1 font-semibold text-[12.5px] py-2 border border-[var(--border-strong)] rounded-sm hover:bg-[var(--surface-alt)] focus-ring">
                            Decline
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card title={`Shared machine pool — ${districts.find(d => d.id === districtId)?.name}`}
            subtitle="Government and private capacity in one register" dense>
            <Table
              columns={[
                { key: 'name', header: 'Machine', render: (m: Machine) => (
                  <div>
                    <p className="text-[12.5px] font-semibold">{m.name}</p>
                    <p className="text-[10.5px] text-[var(--ink-tertiary)]">
                      {m.ownerName} · <span className="mono">{m.id}</span>
                    </p>
                  </div>
                ) },
                { key: 'util', header: 'Utilisation', align: 'right', sortValue: m => machineUtilisation(m),
                  render: (m: Machine) => (
                    <div className="w-[86px] ml-auto">
                      <Progress value={machineUtilisation(m)}
                        color={machineUtilisation(m) >= 95 ? 'var(--signal-declining)'
                          : machineUtilisation(m) >= 70 ? 'var(--signal-warn)' : 'var(--signal-rising)'}
                        height={6} />
                      <p className="text-[10.5px] mono text-right mt-0.5">{machineUtilisation(m)}%</p>
                    </div>
                  ) },
                { key: 'free', header: 'Free h/wk', align: 'right', hideBelow: 'sm',
                  render: (m: Machine) => <span className="mono">{Math.max(0, m.capacityHoursPerWeek - m.bookedHoursPerWeek)}</span>,
                  sortValue: m => m.capacityHoursPerWeek - m.bookedHoursPerWeek },
                { key: 'rate', header: 'Rate', align: 'right', hideBelow: 'md',
                  render: (m: Machine) => <span className="mono">{m.sharedRatePerHour ? formatCurrency(m.sharedRatePerHour) : 'Govt.'}</span> },
                { key: 'status', header: 'Status',
                  render: (m: Machine) => <Badge variant={STATUS_TONE[m.status]}>{m.status.replace('-', ' ')}</Badge> },
              ]}
              rows={local}
              rowKey={m => m.id}
              highlight={m => (m.status === 'idle' ? 'var(--signal-rising)' : m.status === 'saturated' ? 'var(--signal-declining)' : undefined)}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
