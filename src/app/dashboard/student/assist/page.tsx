'use client';

import { useState, useRef, useEffect } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { languages, voiceSessions, voiceStats } from '@/data/audit';
import { districts } from '@/data/districts';
import { PILLARS } from '@/data/pillars';

interface Msg { from: 'user' | 'bot'; text: string; translation?: string }

/** Canned intents the assistant recognises, in four languages. */
const INTENTS: Record<string, { prompt: Record<string, string>; reply: Record<string, string>; en: string }> = {
  demand: {
    en: 'Is my trade in demand?',
    prompt: {
      mr: 'माझा ट्रेड मागणीत आहे का?',
      hi: 'क्या मेरे ट्रेड की मांग है?',
      ur: 'کیا میرے ٹریڈ کی مانگ ہے؟',
      en: 'Is my trade in demand?',
    },
    reply: {
      mr: 'तुमच्या जिल्ह्यात ईव्ही बॅटरी डायग्नोस्टिक्सची मागणी वर्षभरात ४२% वाढली आहे. प्रशिक्षण जागा मागणीपेक्षा १,४०० ने कमी आहेत. कार्बोरेटर दुरुस्तीची मागणी ६१% घटली आहे.',
      hi: 'आपके जिले में ईवी बैटरी डायग्नोस्टिक्स की मांग साल भर में 42% बढ़ी है। प्रशिक्षण सीटें मांग से 1,400 कम हैं। कार्बोरेटर मरम्मत की मांग 61% घटी है।',
      ur: 'آپ کے ضلع میں ای وی بیٹری ڈائیگناسٹکس کی مانگ سال بھر میں 42% بڑھی ہے۔ تربیتی نشستیں مانگ سے 1,400 کم ہیں۔',
      en: 'In your district, demand for EV Battery Diagnostics is up 42% year on year and training seats are 1,400 short of demand. Carburettor repair is down 61%.',
    },
  },
  rpl: {
    en: 'I have 9 years of experience — can I get a certificate?',
    prompt: {
      mr: 'मी नऊ वर्षे गॅरेजमध्ये काम केले आहे, मला प्रमाणपत्र मिळेल का?',
      hi: 'मैंने नौ साल गैराज में काम किया है, क्या मुझे प्रमाणपत्र मिलेगा?',
      ur: 'میں نے نو سال گیراج میں کام کیا ہے، کیا مجھے سرٹیفکیٹ ملے گا؟',
      en: 'I have worked nine years in a garage — can I get a certificate?',
    },
    reply: {
      mr: 'होय. नऊ वर्षांच्या अनुभवावर तुम्ही RPL अंतर्गत NSQF स्तर ४ साठी पात्र आहात. फक्त १२० तासांचे ब्रिज प्रशिक्षण लागेल — पूर्ण २,४०० तासांचा कोर्स नाही. सरासरी पगारवाढ ₹७,५०० प्रति महिना.',
      hi: 'हाँ। नौ साल के अनुभव पर आप RPL के तहत NSQF स्तर 4 के लिए पात्र हैं। केवल 120 घंटे का ब्रिज प्रशिक्षण चाहिए — पूरा 2,400 घंटे का कोर्स नहीं। औसत वेतन वृद्धि ₹7,500 प्रति माह।',
      ur: 'جی ہاں۔ نو سال کے تجربے پر آپ RPL کے تحت NSQF لیول 4 کے اہل ہیں۔ صرف 120 گھنٹے کی برج ٹریننگ درکار ہے۔',
      en: 'Yes. With nine years you are eligible for NSQF Level 4 under RPL. You would need only 120 hours of bridge training, not the full 2,400-hour course. Average uplift is ₹7,500 per month.',
    },
  },
  stipend: {
    en: 'How much stipend will I get during the work trial?',
    prompt: {
      mr: 'वर्क ट्रायल दरम्यान किती विद्यावेतन मिळेल?',
      hi: 'वर्क ट्रायल के दौरान कितना वजीफा मिलेगा?',
      ur: 'ورک ٹرائل کے دوران کتنا وظیفہ ملے گا؟',
      en: 'How much stipend during the work trial?',
    },
    reply: {
      mr: 'वर्क ट्रायल दरम्यान राज्य सरकार दररोज ₹३८० ते ₹४२० विद्यावेतन देते. ट्रायल १० ते १४ दिवसांचा असतो. ही रक्कम थेट तुमच्या बँक खात्यात जमा होते.',
      hi: 'वर्क ट्रायल के दौरान राज्य सरकार प्रतिदिन ₹380 से ₹420 वजीफा देती है। ट्रायल 10 से 14 दिन का होता है। यह राशि सीधे आपके बैंक खाते में जमा होती है।',
      ur: 'ورک ٹرائل کے دوران ریاستی حکومت روزانہ ₹380 سے ₹420 وظیفہ دیتی ہے۔ ٹرائل 10 سے 14 دن کا ہوتا ہے۔',
      en: 'The State pays ₹380–₹420 per day during the work trial, which runs 10–14 days. It is credited directly to your bank account.',
    },
  },
  grievance: {
    en: 'The centre says I am placed but I have not been paid.',
    prompt: {
      mr: 'केंद्राने नोकरी लागली असे सांगितले पण मला पगार मिळाला नाही.',
      hi: 'केंद्र ने कहा नौकरी लग गई पर मुझे वेतन नहीं मिला।',
      ur: 'مرکز نے کہا نوکری لگ گئی لیکن مجھے تنخواہ نہیں ملی۔',
      en: 'The centre says I am placed but I have not been paid.',
    },
    reply: {
      mr: 'ही तक्रार गंभीर आहे. तुमच्या UAN वर EPFO मध्ये कोणतेही योगदान दिसत नाही — म्हणजे ही "घोस्ट प्लेसमेंट" असू शकते. तक्रार क्रमांक GRV-2026-8841 तयार केला असून जिल्हा कौशल विकास अधिकाऱ्यांकडे पाठवला आहे. केंद्राचे अनुदान रोखले जाईल.',
      hi: 'यह शिकायत गंभीर है। आपके UAN पर EPFO में कोई योगदान नहीं दिख रहा — यह "घोस्ट प्लेसमेंट" हो सकती है। शिकायत संख्या GRV-2026-8841 बनाई गई और जिला अधिकारी को भेजी गई है। केंद्र का अनुदान रोका जाएगा।',
      ur: 'یہ شکایت سنگین ہے۔ آپ کے UAN پر EPFO میں کوئی کنٹریبیوشن نظر نہیں آ رہا۔ شکایت نمبر GRV-2026-8841 بنا کر ضلعی افسر کو بھیج دی گئی ہے۔',
      en: 'This is serious. Your UAN shows no EPFO contribution, which indicates a possible ghost placement. Grievance GRV-2026-8841 has been raised and escalated to the District Skill Development Officer. The centre’s subsidy will be held.',
    },
  },
};

export default function StudentAssistPage() {
  const { account } = useCitizen();
  const pillar = PILLARS[5];
  const [lang, setLang] = useState(account?.language ?? 'mr');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [channel, setChannel] = useState<'portal-mic' | 'ivr-call' | 'whatsapp-voice'>('portal-mic');
  const endRef = useRef<HTMLDivElement>(null);

  const stats = voiceStats();
  const districtId = account?.districtId ?? 'pune';
  const langInfo = languages.find(l => l.code === lang)!;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function ask(intentId: string) {
    const intent = INTENTS[intentId];
    setListening(true);
    setMessages(m => [...m, { from: 'user', text: intent.prompt[lang] ?? intent.prompt.en, translation: intent.en }]);
    setTimeout(() => {
      setListening(false);
      setMessages(m => [...m, { from: 'bot', text: intent.reply[lang] ?? intent.reply.en, translation: intent.reply.en }]);
    }, 900);
  }

  return (
    <>
      <PageHeader
        eyebrow={`Pillar ${pillar.number} — ${pillar.short}`}
        title="Voice assist and grievance"
        description="Ask anything by voice, in your own language."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Voice Assist & Grievance' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Languages supported" value={languages.filter(l => l.ivrAvailable).length}
          sub={`${languages.length} in the pipeline`} accent="var(--accent-student)" />
        <Stat label="Resolved without a human" value={`${stats.botResolutionRate}%`}
          sub={`${stats.escalated} escalated to an officer`} tone="positive" accent="var(--accent-student)" />
        <Stat label="Speech recognition accuracy" value={`${Math.round(langInfo.sttModelAccuracy * 100)}%`}
          sub={`for ${langInfo.nativeName}`} tone="positive" accent="var(--accent-student)" />
        <Stat label="Helpline" value="1800-233-0202" sub="Toll-free, 7 am – 9 pm, all days"
          accent="var(--accent-student)" />
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr] gap-5">
        <div className="space-y-5">
          <Card title="Voice assistant" subtitle="Choose a channel and a language, then speak">
            <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b border-[var(--border)]">
              <div className="min-w-[180px]">
                <label className="gov-label" htmlFor="assist-lang">Language</label>
                <select id="assist-lang" className="gov-input" value={lang} onChange={e => setLang(e.target.value)}>
                  {languages.filter(l => l.ivrAvailable).map(l => (
                    <option key={l.code} value={l.code}>{l.nativeName} — {l.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 min-w-[220px]">
                <span className="gov-label">Channel</span>
                <div className="flex gap-1.5">
                  {([
                    ['portal-mic', 'This browser'],
                    ['ivr-call', 'IVR call'],
                    ['whatsapp-voice', 'WhatsApp voice'],
                  ] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setChannel(id)}
                      className={`text-[12px] px-3 py-2 border rounded-sm transition-colors focus-ring ${
                        channel === id
                          ? 'border-[var(--accent-student)] bg-[var(--accent-student-light)] text-[var(--accent-student)] font-semibold'
                          : 'border-[var(--border-strong)] hover:bg-[var(--surface)]'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div className="border border-[var(--border)] rounded-sm bg-[var(--surface)] h-[330px] overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="h-full grid place-items-center text-center px-6">
                  <div>
                    <span className="w-12 h-12 mx-auto grid place-items-center rounded-full bg-[var(--accent-student-light)] text-[var(--accent-student)] mb-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zM5 11a7 7 0 0014 0M12 18v3" />
                      </svg>
                    </span>
                    <p className="text-[13px] text-[var(--ink-secondary)]">
                      Tap a question below to hear how the assistant answers in {langInfo.nativeName}.
                    </p>
                  </div>
                </div>
              )}
              <ul className="space-y-3">
                {messages.map((m, i) => (
                  <li key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-sm px-3.5 py-2.5 ${
                      m.from === 'user'
                        ? 'bg-[var(--accent-student)] text-white'
                        : 'bg-white border border-[var(--border)]'
                    }`}>
                      <p className="text-[13px] leading-relaxed">{m.text}</p>
                      {m.translation && lang !== 'en' && (
                        <p className={`text-[11px] mt-1.5 pt-1.5 border-t italic ${
                          m.from === 'user' ? 'border-white/25 text-white/80' : 'border-[var(--border)] text-[var(--ink-tertiary)]'
                        }`}>
                          {m.translation}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
                {listening && (
                  <li className="flex justify-start">
                    <div className="bg-white border border-[var(--border)] rounded-sm px-3.5 py-2.5 flex items-center gap-2">
                      <span className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--accent-student)] animate-bounce"
                            style={{ animationDelay: `${i * 0.12}s` }} />
                        ))}
                      </span>
                      <span className="text-[12px] text-[var(--ink-tertiary)]">
                        Transcribing {langInfo.nativeName} speech…
                      </span>
                    </div>
                  </li>
                )}
              </ul>
              <div ref={endRef} />
            </div>

            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                Try asking
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {Object.entries(INTENTS).map(([id, intent]) => (
                  <button key={id} onClick={() => ask(id)}
                    className="text-left border border-[var(--border)] rounded-sm px-3 py-2.5 hover:border-[var(--accent-student)] hover:bg-[var(--accent-student-light)] transition-colors focus-ring">
                    <span className="block text-[12.5px] text-[var(--ink)]">{intent.prompt[lang] ?? intent.prompt.en}</span>
                    {lang !== 'en' && (
                      <span className="block text-[10.5px] text-[var(--ink-tertiary)] italic mt-0.5">{intent.en}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Recent grievances and queries from your district"
            subtitle="Logged, and escalated where needed">
            <ul className="space-y-2.5">
              {voiceSessions.filter(v => v.districtId === districtId || true).slice(0, 6).map(v => (
                <li key={v.id} className="border border-[var(--border)] rounded-sm p-3"
                  style={v.resolvedBy === 'escalated-to-officer' ? { boxShadow: 'inset 3px 0 0 var(--signal-warn)' } : undefined}>
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-[var(--ink)]">{v.intent}</p>
                      <p className="text-[10.5px] mono text-[var(--ink-tertiary)]">
                        {v.id} · {v.channel.replace('-', ' ')} · {languages.find(l => l.code === v.languageCode)?.nativeName}
                        {' · '}{districts.find(d => d.id === v.districtId)?.name}
                      </p>
                    </div>
                    <Badge variant={v.resolvedBy === 'bot' ? 'rising' : 'warn'}>
                      {v.resolvedBy === 'bot' ? 'auto-resolved' : 'escalated'}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[var(--ink-secondary)] leading-relaxed">&ldquo;{v.transcript}&rdquo;</p>
                  <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-1.5">
                    {v.durationSeconds}s · {v.occurredOn}
                    {v.satisfactionScore !== null && ` · rated ${v.satisfactionScore}/5`}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Language coverage" subtitle="Translation completeness and recognition accuracy">
            <div className="space-y-4">
              {languages.map(l => (
                <div key={l.code}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                      {l.nativeName} <span className="text-[11px] font-normal text-[var(--ink-tertiary)]">{l.name}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      {l.ivrAvailable
                        ? <Badge variant="rising">IVR live</Badge>
                        : <Badge variant="stable">text only</Badge>}
                    </span>
                  </div>
                  <Progress value={l.contentTranslatedPercent}
                    color={l.contentTranslatedPercent === 100 ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                    height={6} />
                  <p className="text-[10.5px] text-[var(--ink-tertiary)] mt-1">
                    {l.contentTranslatedPercent}% of portal content translated ·{' '}
                    {Math.round(l.sttModelAccuracy * 100)}% speech accuracy ·{' '}
                    {Math.round((l.speakerShare[districtId] ?? 0) * 100)}% of your district speaks it
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="If you have no smartphone">
            <ol className="space-y-3">
              {[
                ['Give a missed call', '1800-233-0202. Called back within 60 seconds.'],
                ['Choose your language', '1 Marathi · 2 Hindi · 3 English · 4 Urdu.'],
                ['Speak your question', 'No menu tree. Full sentences.'],
                ['Get an SMS summary', 'The answer, in your language, with a reference number.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-5 h-5 shrink-0 grid place-items-center rounded-full text-[10.5px] font-bold text-white mt-0.5"
                    style={{ background: 'var(--accent-student)' }}>{i + 1}</span>
                  <span>
                    <span className="block text-[12.5px] font-bold text-[var(--ink)]">{t}</span>
                    <span className="block text-[11.5px] text-[var(--ink-secondary)] leading-snug mt-0.5">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Note tone="warn" title="Raising a placement grievance">
            Recorded as placed but never paid? Say so here. Your UAN is checked the same day and the
            centre&rsquo;s subsidy is held. You prove nothing yourself.
          </Note>
        </div>
      </div>
    </>
  );
}
