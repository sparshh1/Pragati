import Link from 'next/link';
import { SiteHeader } from '@/components/gov/SiteHeader';
import { SiteFooter } from '@/components/gov/SiteFooter';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { languages, voiceStats } from '@/data/audit';
import { districts } from '@/data/districts';

export const metadata = {
  title: 'Help & Grievance',
  description: 'Multilingual helpline, voice access over IVR and WhatsApp, grievance redressal and district office contacts.',
};

const FAQ = [
  {
    q: 'How do I know whether a trade is worth learning?',
    a: 'Open the Labour Market Dashboard and select your trade and district. It shows verified monthly vacancies against training supply, the year-on-year direction of travel, and — importantly — which tasks inside that trade are contracting even where the trade itself looks healthy.',
  },
  {
    q: 'I have worked for years without a certificate. Does that count?',
    a: 'Yes. Recognition of Prior Learning assesses what you can already do and certifies you at the NSQF level your evidence supports, prescribing only the bridge hours genuinely missing. Candidates certified this year averaged a wage increase of about ₹7,000 a month. Register as a candidate and open Career Pathways & RPL.',
  },
  {
    q: 'What is a work trial, and am I paid during it?',
    a: 'A work trial is ten to fourteen days on the employer’s own shop floor, at the end of the training. The State pays a stipend of ₹380–₹420 per day directly to your bank account. A weighted scorecard covering safety, tool handling, takt time and communication decides the placement — the pass mark is 70 out of 100.',
  },
  {
    q: 'The centre says I am placed, but I have not been paid. What do I do?',
    a: 'Report it on the helpline or through voice assist on your dashboard. The system immediately checks your UAN against EPFO. Where no contribution exists, the centre’s subsidy is held pending enquiry. You do not have to prove anything yourself — the payroll record is the evidence.',
  },
  {
    q: 'I run a small unit and cannot fill a whole training batch. Can I still hire here?',
    a: 'Yes — that is what MSME hiring pools are for. Several units in the same district and trade co-sign one batch, each committing only the seats they will actually absorb, at a wage floor each names. Register as an enterprise and open Hiring Pools & Trials.',
  },
  {
    q: 'Can I use this portal without a smartphone or without reading?',
    a: 'Yes. Dial 1800-233-0202 from any phone, choose your language, and speak your question in full sentences — there is no menu tree to navigate. The answer is read back to you and also sent as an SMS in your language with a reference number.',
  },
  {
    q: 'How is my Aadhaar and payroll data handled?',
    a: 'Full Aadhaar numbers are never stored. Only the last four digits are retained, and only if you supply them. Your UAN is used solely to reconcile a declared placement against EPFO, with consent taken at registration. Individual records are never published.',
  },
];

const GRIEVANCE_STEPS = [
  ['Raise it', 'By helpline, voice assist, or in writing at any ITI or DSDEO office. You receive a reference number immediately.'],
  ['Acknowledged in 3 working days', 'The District Skill Development Office records the grievance against the centre or establishment concerned.'],
  ['Resolved in 21 working days', 'Where money is involved, disbursal against the disputed claim is held while the enquiry runs.'],
  ['Escalate', 'If unresolved, escalate to the State Mission Directorate. Placement-fraud grievances go directly to the Internal Audit Wing.'],
];

const OFFICES: Record<string, { address: string; phone: string }> = {
  pune: { address: 'DSDEO, Central Building, Pune — 411001', phone: '020-2612-XXXX' },
  nashik: { address: 'DSDEO, Collector Office Campus, Nashik — 422001', phone: '0253-257-XXXX' },
  csn: { address: 'DSDEO, Divisional Commissioner Campus, Chhatrapati Sambhajinagar — 431001', phone: '0240-233-XXXX' },
  nagpur: { address: 'DSDEO, Civil Lines, Nagpur — 440001', phone: '0712-256-XXXX' },
  thane: { address: 'DSDEO, Collector Office, Thane — 400601', phone: '022-2534-XXXX' },
  kolhapur: { address: 'DSDEO, Collector Office Campus, Kolhapur — 416001', phone: '0231-265-XXXX' },
};

export default function HelpPage() {
  const stats = voiceStats();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-[var(--surface)]">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <PageHeader
            eyebrow="Support"
            title="Help & Grievance Redressal"
            description="Voice helpline, common questions and grievance redressal."
            breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Help & Grievance' }]}
          />

          {/* Helpline banner */}
          <div className="gov-card overflow-hidden mb-6">
            <div className="h-1.5 tricolour-bar" />
            <div className="p-6 grid md:grid-cols-[1.2fr_1fr] gap-6 items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--gov-saffron)] mb-2">
                  Toll-free helpline · 7 am to 9 pm, all days
                </p>
                <p className="text-[34px] sm:text-[42px] font-bold mono text-[var(--gov-navy)] leading-none">
                  1800-233-0202
                </p>
                <p className="text-[13px] text-[var(--ink-secondary)] mt-3 leading-relaxed max-w-lg">
                  Speak your question in Marathi, Hindi, English or Urdu. There is no menu tree — say what
                  you need in full sentences and the system answers. A missed call is returned within
                  60 seconds.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {languages.filter(l => l.ivrAvailable).map(l => (
                    <Badge key={l.code} variant="officer">{l.nativeName}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Resolved without a human" value={`${stats.botResolutionRate}%`}
                  sub="Across all voice sessions" tone="positive" accent="var(--gov-navy)" />
                <Stat label="Average satisfaction" value={`${stats.avgSatisfaction}/5`}
                  sub="Caller-rated" tone="positive" accent="var(--gov-navy)" />
                <Stat label="Languages live on IVR" value={languages.filter(l => l.ivrAvailable).length}
                  sub={`${languages.length} in the pipeline`} accent="var(--gov-navy)" />
                <Stat label="Escalated to an officer" value={stats.escalated}
                  sub="Where a human decision is required" tone="warn" accent="var(--gov-navy)" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 mb-6">
            <Card title="Frequently asked questions">
              <div className="space-y-2">
                {FAQ.map(f => (
                  <details key={f.q} className="border border-[var(--border)] rounded-sm group">
                    <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--surface)] list-none">
                      <span className="text-[13.5px] font-semibold text-[var(--ink)] flex-1">{f.q}</span>
                      <svg width="13" height="13" viewBox="0 0 12 12"
                        className="text-[var(--ink-tertiary)] group-open:rotate-180 transition-transform shrink-0" fill="currentColor">
                        <path d="M1 4l5 5 5-5z" />
                      </svg>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] bg-[var(--surface)]">
                      <p className="text-[12.5px] text-[var(--ink-secondary)] leading-relaxed">{f.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </Card>

            <div className="space-y-5">
              <Card title="Grievance redressal procedure">
                <ol className="space-y-3">
                  {GRIEVANCE_STEPS.map(([t, d], i) => (
                    <li key={t} className="flex gap-3">
                      <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full bg-[var(--gov-navy)] text-white text-[11px] font-bold mono mt-0.5">
                        {i + 1}
                      </span>
                      <span>
                        <span className="block text-[13px] font-bold text-[var(--ink)]">{t}</span>
                        <span className="block text-[12px] text-[var(--ink-secondary)] leading-snug mt-0.5">{d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card title="Language coverage" subtitle="Translation completeness and speech recognition accuracy">
                <div className="space-y-3.5">
                  {languages.map(l => (
                    <div key={l.code}>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                          {l.nativeName}{' '}
                          <span className="text-[11px] font-normal text-[var(--ink-tertiary)]">{l.name}</span>
                        </span>
                        {l.ivrAvailable
                          ? <Badge variant="rising">IVR live</Badge>
                          : <Badge variant="stable">text only</Badge>}
                      </div>
                      <Progress value={l.contentTranslatedPercent}
                        color={l.contentTranslatedPercent === 100 ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                        height={6} />
                      <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-1">
                        {l.contentTranslatedPercent}% content translated · {Math.round(l.sttModelAccuracy * 100)}% speech accuracy
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="mb-6">
            <Note tone="warn" title="Reporting a false placement">
              Recorded as placed but never paid? Report it. Your UAN is checked the same day and the
              centre&rsquo;s subsidy is frozen. The payroll record is the proof — you produce nothing.
            </Note>
          </div>

          <Card title="District office contacts" subtitle="Walk-in support at any DSDEO">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {districts.map(d => (
                <div key={d.id} className="border border-[var(--border)] rounded-sm p-3.5">
                  <p className="text-[13.5px] font-bold text-[var(--gov-navy)]">{d.name}</p>
                  <p className="text-[12px] text-[var(--ink-secondary)] mt-1 leading-snug">
                    {OFFICES[d.id]?.address}
                  </p>
                  <p className="text-[12px] mono text-[var(--ink)] mt-1.5">{OFFICES[d.id]?.phone}</p>
                  <Link href={`/demand?district=${d.id}`} className="text-[11.5px] gov-link font-semibold mt-2 inline-block">
                    District labour market data →
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
