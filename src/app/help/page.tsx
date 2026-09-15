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
  description: 'Helpline, common questions, and how to file a complaint. Speak in Marathi, Hindi, English or Urdu.',
};

const FAQ = [
  {
    q: 'How do I know whether a trade is worth learning?',
    a: 'Open Jobs in your district, pick your trade and your district. You will see how many real vacancies there were, how many seats are being taught, whether numbers are going up or down, and which tasks inside that trade are fading even if the trade name still sounds healthy.',
  },
  {
    q: 'I have worked for years without a certificate. Does that count?',
    a: 'Yes. If you already do the work, you can sit a test and get a government certificate for what you know. You only study the missing bits, not the whole course again. People who got this certificate this year earned about ₹7,000 more a month on average. Register as a candidate and open Certificate for my work.',
  },
  {
    q: 'What is a work trial, and am I paid during it?',
    a: 'A work trial is 10 to 14 days at a real company, at the end of training. The State pays ₹380 to ₹420 a day into your bank. They score you on safety, tools, speed and how you work with people. You need 70 out of 100. That score decides the job, not the exam.',
  },
  {
    q: 'The centre says I am placed, but I have not been paid. What do I do?',
    a: 'Call the helpline or say so on Ask by speaking in your dashboard. We check your salary record the same day. If there is no pay, the centre’s money is held while we look into it. You do not have to prove anything yourself. The pay record is the proof.',
  },
  {
    q: 'I run a small unit and cannot fill a whole training batch. Can I still hire here?',
    a: 'Yes. That is what sharing a batch is for. Several small firms in the same district and trade join one batch. Each promises only the people they will actually take, at a wage each names. Register as a business and open Hire together.',
  },
  {
    q: 'Can I use this portal without a smartphone or without reading?',
    a: 'Yes. Dial 1800-233-0202 from any phone, choose your language, and say what you need in full sentences. There is no button maze. The answer is read back to you and also sent as an SMS in your language, with a reference number.',
  },
  {
    q: 'How is my Aadhaar and payroll data handled?',
    a: 'Full Aadhaar numbers are never stored. Only the last four digits are kept, and only if you give them. Your UAN is used only to check a claimed job against the salary record, with your consent at registration. Individual records are never published.',
  },
];

const GRIEVANCE_STEPS = [
  ['Raise it', 'By helpline, by speaking on the portal, or in writing at any ITI or district skill office. You get a reference number at once.'],
  ['Acknowledged in 3 working days', 'The district office records the complaint against the centre or company concerned.'],
  ['Resolved in 21 working days', 'If money is involved, payment on the disputed claim is held while the enquiry runs.'],
  ['Escalate', 'If it is still open, take it to the State Mission Directorate. Fake-job complaints go straight to Internal Audit.'],
];

const OFFICES: Record<string, { address: string; phone: string }> = {
  pune: { address: 'DSDEO, Central Building, Pune, 411001', phone: '020-2612-XXXX' },
  nashik: { address: 'DSDEO, Collector Office Campus, Nashik, 422001', phone: '0253-257-XXXX' },
  csn: { address: 'DSDEO, Divisional Commissioner Campus, Chhatrapati Sambhajinagar, 431001', phone: '0240-233-XXXX' },
  nagpur: { address: 'DSDEO, Civil Lines, Nagpur, 440001', phone: '0712-256-XXXX' },
  thane: { address: 'DSDEO, Collector Office, Thane, 400601', phone: '022-2534-XXXX' },
  kolhapur: { address: 'DSDEO, Collector Office Campus, Kolhapur, 416001', phone: '0231-265-XXXX' },
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
            title="Help"
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
                  Speak your question in Marathi, Hindi, English or Urdu. There is no button maze.
                  Say what you need in full sentences. A missed call is returned within 60 seconds.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {languages.filter(l => l.ivrAvailable).map(l => (
                    <Badge key={l.code} variant="officer">{l.nativeName}</Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Answered without staff" value={`${stats.botResolutionRate}%`}
                  sub="Across all spoken questions" tone="positive" accent="var(--gov-navy)" />
                <Stat label="Average satisfaction" value={`${stats.avgSatisfaction}/5`}
                  sub="Rated by the caller" tone="positive" accent="var(--gov-navy)" />
                <Stat label="Languages on the phone line" value={languages.filter(l => l.ivrAvailable).length}
                  sub={`${languages.length} in total`} accent="var(--gov-navy)" />
                <Stat label="Sent to an officer" value={stats.escalated}
                  sub="When a person needs to decide" tone="warn" accent="var(--gov-navy)" />
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
                          ? <Badge variant="rising">Phone</Badge>
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
              Recorded as placed but never paid? Report it. Your salary record is checked the same day and the
              centre&rsquo;s money is held. The pay record is the proof. You produce nothing.
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
