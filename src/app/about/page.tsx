import Link from 'next/link';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PILLARS } from '@/data/pillars';
import { districts } from '@/data/districts';
import { courses } from '@/data/courses';
import { skills } from '@/data/skills';
import { GOV_ROLES, ALL_PERMISSIONS, GovRole } from '@/lib/rbac';
import { formatNumber } from '@/lib/utils';

export const metadata = {
  title: 'About the Mission',
  description: 'How प्रgati works, who runs it, and the rules the portal follows.',
};

const INSTITUTIONS = [
  { name: 'Department of Skill, Employment, Entrepreneurship & Innovation', role: 'Administrative department. Owns the portal and the state skill mission.', level: 'State' },
  { name: 'Maharashtra State Skill Development Society (MSSDS)', role: 'Implementing agency. Runs the seat matrix, subsidy release and scheme convergence.', level: 'State' },
  { name: 'Directorate of Vocational Education & Training (DVET)', role: 'Runs the ITI network and the sensor-verified practical infrastructure.', level: 'State' },
  { name: 'District Skill Development & Entrepreneurship Offices (DSDEO)', role: 'District-level demand verification, seat allocation and machine brokerage.', level: 'District' },
  { name: 'Ministry of Skill Development & Entrepreneurship (MSDE)', role: 'Central scheme owner: PMKVY 4.0 and SANKALP.', level: 'Central' },
  { name: 'Directorate General of Training (DGT)', role: 'Craftsmen Training Scheme, NCVT certification and NSQF alignment.', level: 'Central' },
  { name: 'Employees’ Provident Fund Organisation (EPFO)', role: 'Payroll reconciliation partner. Placement verification is drawn from UAN contribution records.', level: 'Central' },
  { name: 'National Council for Vocational Education & Training (NCVET)', role: 'Regulates awarding bodies and assessment agencies, including RPL assessment.', level: 'Central' },
];

const POLICIES = [
  { t: 'Terms & Conditions', d: 'Use of this portal is subject to the Information Technology Act, 2000 and the rules made thereunder. Furnishing false information in a registration or a placement claim is an offence.' },
  { t: 'Privacy Policy', d: 'Aadhaar numbers are not stored. Only the last four digits are retained, and only where the user supplies them. UAN is used solely for payroll reconciliation against a declared placement, with consent taken at registration.' },
  { t: 'Data Sharing', d: 'Aggregate labour market data is published openly on the Labour Market Dashboard. Individual candidate and establishment records are not published and are shared between departments only for scheme administration and audit.' },
  { t: 'Copyright Policy', d: 'Material on this portal may be reproduced free of charge in any format provided it is reproduced accurately and not used in a misleading context. Where material is being republished, the source must be prominently acknowledged.' },
  { t: 'Hyperlinking Policy', d: 'Links to external sites are provided for convenience. The Department is not responsible for the content of external websites and does not endorse the views expressed on them.' },
  { t: 'Accessibility Statement', d: 'This portal is built to conform to WCAG 2.1 Level AA and the Guidelines for Indian Government Websites (GIGW). It supports keyboard navigation, screen readers, text resizing and a high-contrast mode.' },
];

export default function AboutPage() {
  const roles = Object.keys(GOV_ROLES) as GovRole[];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <PageHeader
            eyebrow="About"
            title="About the Mission"
            description="What the mission does, who runs it, and the rules it follows."
            breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About' }]}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Stat label="Pilot districts" value={districts.length} sub="Phase-I coverage" accent="var(--gov-navy)" />
            <Stat label="Courses on offer" value={courses.length} sub="ITI, Polytechnic and PMKVY 4.0" accent="var(--gov-navy)" />
            <Stat label="Trades tracked" value={skills.length} sub="Across five sectors" accent="var(--gov-navy)" />
            <Stat label="Seats this year"
              value={formatNumber(courses.reduce((a, c) => a + c.currentSeats, 0))}
              sub="Capped at what each district can actually run" accent="var(--gov-navy)" />
          </div>

          {/* ---- The problem ---- */}
          <Card title="The problem this addresses" className="mb-6">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                ['Training is planned against claimed demand', 'Job-board counts get padded by duplicates, bulk reposts and firms that never hire. Seat plans built on them fund training for work that does not exist.'],
                ['Syllabi rot behind healthy trade names', 'A trade rarely dies. Individual tasks inside it do: carburettor tuning, CRT repair, chain surveying. The trade name survives and the syllabus keeps teaching them.'],
                ['Placement is measured on paper', 'A placement certificate proves a form was filled. Without checking the salary record, fake jobs look the same as real ones, and subsidy follows both.'],
              ].map(([t, d]) => (
                <div key={t}>
                  <p className="text-[13.5px] font-bold text-[var(--gov-maroon)] leading-snug mb-1.5">{t}</p>
                  <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ---- Pillars ---- */}
          <h2 id="pillars" className="text-[20px] font-bold text-[var(--gov-navy)] gov-rule mb-5 scroll-mt-24">
            Six Operating Pillars
          </h2>
          <div className="grid lg:grid-cols-2 gap-4 mb-8">
            {PILLARS.map(p => (
              <Card key={p.id} title={`${String(p.number).padStart(2, '0')} · ${p.name}`}>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {p.mechanisms.map(m => <Badge key={m} variant="officer">{m}</Badge>)}
                </div>
                <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed mb-4">{p.summary}</p>
                <dl className="space-y-2 pt-3 border-t border-[var(--border)]">
                  {([
                    ['Candidate', p.outcomes.student, 'var(--accent-student)'],
                    ['Industry', p.outcomes.business, 'var(--accent-employer)'],
                    ['State', p.outcomes.government, 'var(--accent-officer)'],
                  ] as const).map(([k, v, c]) => (
                    <div key={k} className="flex gap-2.5 text-[12px]">
                      <dt className="w-[66px] shrink-0 font-bold" style={{ color: c }}>{k}</dt>
                      <dd className="text-[var(--ink-secondary)] leading-snug">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            ))}
          </div>

          {/* ---- How the portals are separated ---- */}
          <Card title="How access is separated" className="mb-6"
            subtitle="Two portals, three audiences, same look and feel">
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  t: 'Candidates', c: 'var(--accent-student)',
                  d: 'Register on the public portal. You get a candidate home: check jobs, get a certificate for work you already do, switch trades, try a job on the shop floor, book machine time, and ask by speaking.',
                  href: '/register?role=student', cta: 'Candidate registration',
                },
                {
                  t: 'Enterprises & MSMEs', c: 'var(--accent-employer)',
                  d: 'Register on the same public portal. You get a different home: post who you need, share a training batch, score a trial, say what should be taught, rent idle machines, and file payroll.',
                  href: '/register?role=business', cta: 'Enterprise registration',
                },
                {
                  t: 'Departmental officers', c: 'var(--gov-navy)',
                  d: 'Sign in on a separate, restricted portal. Access depends on your role, what you are allowed to do, and which district or centre you cover. Nothing outside that slice is loaded. Every action is written down.',
                  href: '/gov', cta: 'Departmental portal',
                },
              ].map(x => (
                <div key={x.t} className="border border-[var(--border)] rounded-sm overflow-hidden flex flex-col">
                  <div className="h-1.5" style={{ background: x.c }} />
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[14px] font-bold text-[var(--ink)] mb-2">{x.t}</p>
                    <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed flex-1">{x.d}</p>
                    <Link href={x.href} className="text-[12.5px] font-bold mt-3 focus-ring" style={{ color: x.c }}>
                      {x.cta} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-[var(--border)]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-3">
                Departmental roles and their authority
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map(r => {
                  const d = GOV_ROLES[r];
                  return (
                    <div key={r} className="border border-[var(--border)] rounded-sm p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[12.5px] font-bold text-[var(--ink)] leading-snug">{d.title}</p>
                        <Badge variant={d.scope === 'state' ? 'officer' : d.scope === 'district' ? 'warn' : 'default'}>
                          {d.scope}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-[var(--ink-tertiary)] mb-1.5">{d.designation}</p>
                      <p className="text-[11.5px] text-[var(--ink-secondary)] leading-snug">{d.description}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)] mt-2">
                        {d.permissions.length} of {ALL_PERMISSIONS.length} permissions
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* ---- Institutions ---- */}
          <h2 id="institutions" className="text-[20px] font-bold text-[var(--gov-navy)] gov-rule mb-5 scroll-mt-24">
            Implementing Institutions
          </h2>
          <Card className="mb-6" dense>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="gov-th">Institution</th>
                    <th className="gov-th">Role on this portal</th>
                    <th className="gov-th">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {INSTITUTIONS.map((i, n) => (
                    <tr key={i.name} className={n % 2 ? 'bg-[var(--surface)]' : 'bg-white'}>
                      <td className="gov-td font-semibold">{i.name}</td>
                      <td className="gov-td text-[var(--ink-secondary)]">{i.role}</td>
                      <td className="gov-td">
                        <Badge variant={i.level === 'Central' ? 'officer' : i.level === 'State' ? 'employer' : 'default'}>
                          {i.level}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ---- Policies ---- */}
          <h2 className="text-[20px] font-bold text-[var(--gov-navy)] gov-rule mb-5">Policies</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {POLICIES.map(p => (
              <div key={p.t} className="gov-card p-4">
                <h3 className="text-[13.5px] font-bold text-[var(--gov-navy)] mb-1.5">{p.t}</h3>
                <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>

          <Note tone="warn" title="Prototype notice">
            Smart India Hackathon 2026, Problem Statement 26134. The mechanisms are real and run on the
            data shown. The data is representative, not live government records.
          </Note>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
