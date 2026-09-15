'use client';

import { useState } from 'react';
import { useGov } from '@/lib/session';
import { Gated, PermTag } from '@/components/gov/GovShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { GOV_ROLES, ALL_PERMISSIONS, GovRole } from '@/lib/rbac';
import { districts } from '@/data/districts';

const DIRECTORY: { employeeId: string; name: string; role: GovRole; districtId: string | null; lastActive: string }[] = [
  { employeeId: 'MH-MSDE-0001', name: 'Sunita Rathod', role: 'state-admin', districtId: null, lastActive: '2026-09-12 09:14' },
  { employeeId: 'MH-DSDEO-PN-014', name: 'Anil Karve', role: 'district-officer', districtId: 'pune', lastActive: '2026-09-12 08:52' },
  { employeeId: 'MH-DSDEO-NSK-021', name: 'Vaishali Pagare', role: 'district-officer', districtId: 'nashik', lastActive: '2026-09-11 17:40' },
  { employeeId: 'MH-DSDEO-CSN-008', name: 'Sadanand Bhosle', role: 'district-officer', districtId: 'csn', lastActive: '2026-09-12 07:31' },
  { employeeId: 'MH-DVET-CSN-207', name: 'Prakash Ingle', role: 'centre-head', districtId: 'csn', lastActive: '2026-09-11 19:05' },
  { employeeId: 'MH-DVET-PN-118', name: 'Manisha Kolte', role: 'centre-head', districtId: 'pune', lastActive: '2026-09-12 08:10' },
  { employeeId: 'MH-FIN-AUD-032', name: 'Farida Sheikh', role: 'audit-officer', districtId: null, lastActive: '2026-09-12 09:02' },
  { employeeId: 'MH-PMKVY-CC-009', name: 'Rohit Gawande', role: 'scheme-manager', districtId: null, lastActive: '2026-09-11 15:22' },
];

const PILLAR_ORDER = [
  'Demand Intelligence', 'Hiring Pipeline', 'Adaptive Syllabus',
  'Capacity Planner', 'Pathways & RPL', 'Control Tower & Audit', 'Administration',
];

export default function GovAccessPage() {
  const { officer, can } = useGov();
  const [focusRole, setFocusRole] = useState<GovRole>('district-officer');
  const [changes, setChanges] = useState<string[]>([]);

  if (!officer) return null;

  const roles = Object.keys(GOV_ROLES) as GovRole[];
  const focus = GOV_ROLES[focusRole];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Access control: roles, permissions and data scope"
        description="Roles, permissions and data scope: the full authority map."
        breadcrumb={[{ label: 'Control Tower', href: '/gov/console' }, { label: 'Access Control' }]}
        actions={<PermTag permission="access.manage" />}
      />

      {!can('access.manage') && (
        <div className="mb-5">
          <Gated permission="access.manage" label="User and role administration">
            <span />
          </Gated>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Roles defined" value={roles.length} sub="Fixed at the policy level" accent="var(--gov-navy)" />
        <Stat label="Permissions" value={ALL_PERMISSIONS.length}
          sub={`across ${PILLAR_ORDER.length} functional areas`} accent="var(--gov-navy)" />
        <Stat label="Officers provisioned" value={DIRECTORY.length}
          sub={`${DIRECTORY.filter(d => d.districtId).length} district-scoped`} accent="var(--gov-navy)" />
        <Stat label="Your permissions" value={GOV_ROLES[officer.role].permissions.length}
          sub={`${ALL_PERMISSIONS.length - GOV_ROLES[officer.role].permissions.length} withheld from your role`}
          accent="var(--gov-navy)" />
      </div>

      {/* ---- Permission matrix ---- */}
      <Card title="Role × permission matrix"
        subtitle="Columns are roles; rows are permissions"
        className="mb-5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[760px]">
            <thead>
              <tr>
                <th className="gov-th sticky left-0 z-10" style={{ minWidth: 260 }}>Permission</th>
                {roles.map(r => (
                  <th key={r} className="gov-th text-center" style={{ minWidth: 104 }}>
                    <span className="block leading-tight">{GOV_ROLES[r].title.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="block text-[9px] font-normal opacity-80 normal-case">
                      {GOV_ROLES[r].scope} scope
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PILLAR_ORDER.map(pillar => (
                <>
                  <tr key={`h-${pillar}`}>
                    <td colSpan={roles.length + 1}
                      className="px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-[var(--gov-navy)] bg-[var(--accent-officer-light)] border-b border-[var(--border)]">
                      {pillar}
                    </td>
                  </tr>
                  {ALL_PERMISSIONS.filter(p => p.pillar === pillar).map((p, i) => (
                    <tr key={p.id} className={i % 2 ? 'bg-[var(--surface)]' : 'bg-white'}>
                      <td className="gov-td sticky left-0 z-10"
                        style={{ background: i % 2 ? 'var(--surface)' : '#fff' }}>
                        <span className="block text-[12.5px] font-medium">{p.label}</span>
                        <span className="block text-[10px] mono text-[var(--ink-tertiary)]">{p.id}</span>
                      </td>
                      {roles.map(r => {
                        const held = GOV_ROLES[r].permissions.includes(p.id);
                        const isMine = r === officer.role;
                        return (
                          <td key={r} className="gov-td text-center"
                            style={isMine ? { background: 'var(--accent-officer-light)' } : undefined}>
                            {held ? (
                              <span className="inline-block w-5 h-5 leading-5 rounded-sm bg-[var(--signal-rising)] text-white text-[11px] font-bold">✓</span>
                            ) : (
                              <span className="inline-block w-5 h-5 leading-5 rounded-sm bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--ink-tertiary)] text-[11px]">: </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11.5px] text-[var(--ink-tertiary)] mt-3">
          The highlighted column is your own role ({GOV_ROLES[officer.role].title}).
        </p>
      </Card>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
        <Card title="Role definitions" subtitle="Select a role to read its remit">
          <div className="space-y-2 mb-4">
            {roles.map(r => {
              const d = GOV_ROLES[r];
              const active = focusRole === r;
              return (
                <button key={r} onClick={() => setFocusRole(r)}
                  className={`w-full text-left border rounded-sm px-3.5 py-2.5 transition-colors focus-ring ${
                    active ? 'border-[var(--gov-navy)] bg-[var(--accent-officer-light)]'
                    : 'border-[var(--border)] hover:bg-[var(--surface)]'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[var(--ink)]">{d.title}</p>
                      <p className="text-[11px] text-[var(--ink-tertiary)]">{d.titleHi}</p>
                    </div>
                    <Badge variant={d.scope === 'state' ? 'officer' : d.scope === 'district' ? 'warn' : 'default'}>
                      {d.scope}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-[13.5px] font-bold text-[var(--ink)]">{focus.title}</p>
            <p className="text-[11.5px] text-[var(--ink-tertiary)] mb-2">{focus.designation}</p>
            <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{focus.description}</p>

            <div className="mt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                Holds ({focus.permissions.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {focus.permissions.map(p => (
                  <span key={p} className="text-[9.5px] mono bg-[var(--signal-rising-light)] text-[var(--signal-rising)] border border-[var(--signal-rising)]/30 px-1.5 py-0.5 rounded-sm">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-1.5">
                Withheld ({ALL_PERMISSIONS.length - focus.permissions.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {ALL_PERMISSIONS.filter(p => !focus.permissions.includes(p.id)).map(p => (
                  <span key={p.id} className="text-[9.5px] mono bg-[var(--surface-alt)] text-[var(--ink-tertiary)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm line-through">
                    {p.id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="Officer directory" subtitle="Role and data scope" dense>
            <Table
              columns={[
                { key: 'name', header: 'Officer', render: o => (
                  <div>
                    <p className="text-[12.5px] font-semibold">{o.name}</p>
                    <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">{o.employeeId}</p>
                  </div>
                ), sortValue: o => o.name },
                { key: 'role', header: 'Role', render: o => (
                  <span className="text-[11.5px]">{GOV_ROLES[o.role].title}</span>
                ), sortValue: o => o.role },
                { key: 'scope', header: 'Scope', render: o => (
                  <Badge variant={o.districtId ? 'warn' : 'officer'}>
                    {o.districtId ? districts.find(d => d.id === o.districtId)?.name : 'State-wide'}
                  </Badge>
                ) },
                { key: 'perms', header: 'Perms', align: 'right', hideBelow: 'sm',
                  render: o => <span className="mono">{GOV_ROLES[o.role].permissions.length}</span>,
                  sortValue: o => GOV_ROLES[o.role].permissions.length },
                { key: 'act', header: 'Last active', align: 'right', hideBelow: 'md',
                  render: o => <span className="mono text-[11px] text-[var(--ink-tertiary)]">{o.lastActive}</span>,
                  sortValue: o => o.lastActive },
              ]}
              rows={DIRECTORY}
              rowKey={o => o.employeeId}
              highlight={o => o.employeeId === officer.employeeId ? 'var(--gov-navy)' : undefined}
            />
          </Card>

          <Card title="Provision a new officer" subtitle="Set at provisioning; not self-elevated">
            {can('access.manage') ? (
              <NewOfficerForm onSubmit={s => setChanges(c => [...c, s])} />
            ) : (
              <Gated permission="access.manage" label="User provisioning"><span /></Gated>
            )}
            {changes.length > 0 && (
              <ul className="mt-4 pt-4 border-t border-[var(--border)] space-y-1.5">
                {changes.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[var(--ink-secondary)]">
                    <span className="text-[var(--signal-rising)] font-bold">✓</span>{c}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function NewOfficerForm({ onSubmit }: { onSubmit: (summary: string) => void }) {
  const [form, setForm] = useState({
    name: '', employeeId: '', role: 'district-officer' as GovRole, districtId: 'pune',
  });
  const def = GOV_ROLES[form.role];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="gov-label" htmlFor="no-name">Officer name</label>
          <input id="no-name" className="gov-input" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
        </div>
        <div>
          <label className="gov-label" htmlFor="no-id">Employee ID</label>
          <input id="no-id" className="gov-input mono" value={form.employeeId}
            onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} placeholder="MH-DSDEO-XX-000" />
        </div>
      </div>
      <div>
        <label className="gov-label" htmlFor="no-role">Role</label>
        <select id="no-role" className="gov-input" value={form.role}
          onChange={e => setForm(f => ({ ...f, role: e.target.value as GovRole }))}>
          {(Object.keys(GOV_ROLES) as GovRole[]).map(r => (
            <option key={r} value={r}>{GOV_ROLES[r].title}</option>
          ))}
        </select>
        <p className="text-[11px] text-[var(--ink-tertiary)] mt-1">
          Grants {def.permissions.length} permissions at {def.scope} scope.
        </p>
      </div>
      {def.scope !== 'state' && (
        <div>
          <label className="gov-label" htmlFor="no-dist">Assigned district</label>
          <select id="no-dist" className="gov-input" value={form.districtId}
            onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))}>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      )}
      <button
        disabled={!form.name.trim() || !form.employeeId.trim()}
        onClick={() => {
          onSubmit(
            `${form.name} (${form.employeeId}) provisioned as ${def.title}` +
            (def.scope !== 'state' ? `, scoped to ${districts.find(d => d.id === form.districtId)?.name}` : ', state-wide') +
            `: ${def.permissions.length} permissions granted.`,
          );
          setForm(f => ({ ...f, name: '', employeeId: '' }));
        }}
        className="w-full text-white font-bold text-[13.5px] py-2.5 bg-[var(--gov-navy)] rounded-sm hover:bg-[var(--gov-navy-light)] focus-ring disabled:opacity-45">
        Provision officer →
      </button>
    </div>
  );
}
