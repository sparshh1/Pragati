import Link from 'next/link';
import { Emblem } from './Emblem';

const COLUMNS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'Citizen Services',
    links: [
      { label: 'New Registration', href: '/register' },
      { label: 'Candidate Login', href: '/login' },
      { label: 'Course Catalogue', href: '/courses' },
      { label: 'Certificate for work you do', href: '/register?role=student' },
      { label: 'Grievance Redressal', href: '/help' },
    ],
  },
  {
    title: 'For Industry',
    links: [
      { label: 'MSME / Enterprise Registration', href: '/register?role=business' },
      { label: 'Post a vacancy', href: '/login' },
      { label: 'Share a training batch', href: '/login' },
      { label: 'Rent out your machines', href: '/login' },
      { label: 'Apprenticeship (NAPS) Benefits', href: '/schemes' },
    ],
  },
  {
    title: 'Departmental',
    links: [
      { label: 'Officer Login', href: '/gov' },
      { label: 'Hiring data by district', href: '/demand' },
      { label: 'Scheme Guidelines', href: '/schemes' },
      { label: 'Tenders & Circulars', href: '/about' },
      { label: 'Right to Information', href: '/about' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { label: 'Terms & Conditions', href: '/about' },
      { label: 'Privacy Policy', href: '/about' },
      { label: 'Copyright Policy', href: '/about' },
      { label: 'Hyperlinking Policy', href: '/about' },
      { label: 'Accessibility Statement', href: '/about' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto no-print">
      <div className="h-[3px] tricolour-bar" />
      <div className="bg-[var(--gov-navy)] text-slate-200">
        <div className="mx-auto max-w-[1400px] px-4 py-10 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="flex items-start gap-3">
              <Emblem size={34} className="text-white shrink-0" />
              <div>
                <p className="font-bold text-white text-[15px] leading-tight">प्रgati</p>
                <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">
                  Department of Skill, Employment, Entrepreneurship &amp; Innovation,
                  Government of Maharashtra, Mantralaya, Mumbai — 400032
                </p>
                <p className="text-[12px] text-slate-300 mt-2">
                  Helpline: <span className="mono text-white">1800-233-0202</span>
                  <br />
                  Email: <span className="text-white">support-pragati[at]maharashtra[dot]gov[dot]in</span>
                </p>
              </div>
            </div>
          </div>

          {COLUMNS.map(col => (
            <div key={col.title}>
              <h3 className="text-[12px] font-bold uppercase tracking-[0.07em] text-[var(--gov-saffron)] mb-3">
                {col.title}
              </h3>
              <ul className="space-y-1.5">
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[12.5px] text-slate-300 hover:text-white hover:underline underline-offset-2 focus-ring"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15">
          <div className="mx-auto max-w-[1400px] px-4 py-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-slate-400">
            {['india.gov.in', 'msde.gov.in', 'skillindiadigital.gov.in', 'ncs.gov.in', 'apprenticeshipindia.gov.in', 'dgt.gov.in', 'epfindia.gov.in'].map(s => (
              <span key={s} className="hover:text-white">{s}</span>
            ))}
          </div>
        </div>

        <div className="bg-[var(--gov-navy-dark)]">
          <div className="mx-auto max-w-[1400px] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11.5px] text-slate-400">
            <p>
              © {new Date().getFullYear()} Department of Skill, Employment, Entrepreneurship &amp; Innovation,
              Government of Maharashtra. All Rights Reserved.
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Last updated: 12 Sep 2026</span>
              <span className="opacity-40">|</span>
              <span>Visitors: <span className="mono text-slate-200">28,41,097</span></span>
              <span className="opacity-40">|</span>
              <span>Best viewed in 1280×1024</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#fef7e8] border-t border-[var(--border)] text-center py-2.5 px-4">
        <p className="text-[11.5px] text-[var(--ink-secondary)]">
          <strong className="text-[var(--gov-maroon)]">Prototype notice:</strong> Smart India Hackathon 2026 · Problem Statement 26134.
          This is a functional demonstration. Datasets are representative, not live government records.
        </p>
      </div>
    </footer>
  );
}
