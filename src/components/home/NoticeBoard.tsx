import Link from 'next/link';

const NOTICES = [
  { date: '10 Sep 2026', text: 'Winter 2026 intake — online registration for ITI and PMKVY 4.0 short-term courses opens across all six pilot districts.', isNew: true, href: '/courses' },
  { date: '09 Sep 2026', text: 'Welding practicals will now be marked by machine readings, not by hand.', isNew: true, href: '/about' },
  { date: '06 Sep 2026', text: 'Thane smart-building batch: businesses can still join until 30 September 2026.', isNew: true, href: '/register?role=business' },
  { date: '02 Sep 2026', text: 'Free skill-certification camps in Kolhapur and Chhatrapati Sambhajinagar, 21–28 September.', isNew: false, href: '/register?role=student' },
  { date: '30 Aug 2026', text: 'Motor mechanic course updated: carburettor topics replaced with modern fuel-injection.', isNew: false, href: '/about#pillars' },
  { date: '25 Aug 2026', text: 'Factories can now rent out machines they are not using for training.', isNew: false, href: '/register?role=business' },
  { date: '18 Aug 2026', text: 'Multilingual IVR helpline 1800-233-0202 now live in Marathi, Hindi, English and Urdu.', isNew: false, href: '/help' },
];

export function NoticeBoard() {
  return (
    <div className="gov-card h-full flex flex-col">
      <header className="gov-card-head">
        <h2 className="gov-card-title">Notices &amp; Circulars</h2>
        <Link href="/about" className="text-[11.5px] gov-link font-semibold">View all</Link>
      </header>

      {/* Vertical auto-scroll marquee, as on most departmental notice boards */}
      <div className="relative h-[290px] overflow-hidden flex-1">
        <div className="marquee-track">
          {[0, 1].map(dup => (
            <ul key={dup} aria-hidden={dup === 1}>
              {NOTICES.map(n => (
                <li key={`${dup}-${n.date}-${n.text.slice(0, 12)}`} className="border-b border-[var(--border)] last:border-0">
                  <Link href={n.href} className="block px-4 py-3 hover:bg-[var(--accent-officer-light)] focus-ring">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10.5px] mono text-[var(--ink-tertiary)]">{n.date}</span>
                      {n.isNew && (
                        <span className="blink-new text-[9.5px] font-bold uppercase tracking-wide text-white bg-[var(--signal-declining)] px-1.5 py-[1px] rounded-sm">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] leading-snug text-[var(--ink)]">{n.text}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white to-transparent" />
      </div>
    </div>
  );
}
