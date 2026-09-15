'use client';

import { useState } from 'react';

/**
 * Plain-language support for candidates who are not comfortable with the
 * portal's administrative vocabulary.
 *
 * The portal has to use official terms (NSQF, RPL, EPFO, trust weight) because
 * those are what appear on certificates and in scheme rules. But a first-time
 * user should never be blocked by one. `HelpTip` puts the official term on the
 * page and the everyday explanation one tap away, in the user's own language.
 */
export function HelpTip({
  term,
  plain,
  hindi,
  marathi,
}: {
  term: string;
  plain: string;
  hindi?: string;
  marathi?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex items-baseline gap-1 relative">
      <span>{term}</span>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`What does "${term}" mean?`}
        className="inline-grid place-items-center w-[18px] h-[18px] shrink-0 rounded-full border border-[var(--gov-navy)] text-[var(--gov-navy)] text-[11px] font-bold leading-none hover:bg-[var(--gov-navy)] hover:text-white transition-colors focus-ring translate-y-[1px]"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full mt-1.5 z-30 w-[280px] sm:w-[340px] bg-white border-2 border-[var(--gov-navy)] rounded-sm shadow-lg p-3.5 text-left font-normal normal-case tracking-normal"
        >
          <span className="block text-[13px] font-bold text-[var(--gov-navy)] mb-1.5">
            {term}: in plain words
          </span>
          <span className="block text-[14px] text-[var(--ink)] leading-relaxed">{plain}</span>
          {marathi && (
            <span className="block text-[13.5px] text-[var(--ink-secondary)] leading-relaxed mt-2 pt-2 border-t border-[var(--border)]">
              <strong className="text-[var(--ink-tertiary)]">मराठी: </strong>{marathi}
            </span>
          )}
          {hindi && (
            <span className="block text-[13.5px] text-[var(--ink-secondary)] leading-relaxed mt-1.5">
              <strong className="text-[var(--ink-tertiary)]">हिन्दी: </strong>{hindi}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2.5 text-[12.5px] font-bold text-[var(--gov-navy)] underline focus-ring"
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}

/** The glossary behind every HelpTip on the candidate side. */
export const GLOSSARY = {
  nsqf: {
    term: 'NSQF Level',
    plain: 'A number from 1 to 10 that says how skilled a job is. Level 3 is a helper, Level 4 is a trained technician, Level 5 is a supervisor. Moving up one level usually means better pay.',
    marathi: 'तुमच्या कौशल्याची सरकारी पातळी. ३ म्हणजे मदतनीस, ४ म्हणजे प्रशिक्षित कारागीर, ५ म्हणजे पर्यवेक्षक.',
    hindi: 'आपके कौशल का सरकारी स्तर। 3 यानी सहायक, 4 यानी प्रशिक्षित कारीगर, 5 यानी पर्यवेक्षक।',
  },
  rpl: {
    term: 'Recognition of Prior Learning',
    plain: 'If you already do a job well but have no certificate, the government can test you and give you one. You do not sit through the whole course again.',
    marathi: 'तुम्ही आधीच काम करत असाल पण प्रमाणपत्र नसेल, तर सरकार तुमची परीक्षा घेऊन प्रमाणपत्र देते. पूर्ण कोर्स पुन्हा करावा लागत नाही.',
    hindi: 'अगर आप पहले से काम करते हैं पर सर्टिफिकेट नहीं है, तो सरकार आपकी परीक्षा लेकर सर्टिफिकेट देती है। पूरा कोर्स दोबारा नहीं करना पड़ता।',
  },
  workTrial: {
    term: 'Work Trial',
    plain: 'Ten to fourteen days working at a real company before they decide to hire you. The government pays you ₹380 to ₹420 every day during this time.',
    marathi: 'नोकरी मिळण्यापूर्वी १० ते १४ दिवस खऱ्या कंपनीत काम. या काळात सरकार रोज ₹३८०–₹४२० देते.',
    hindi: 'नौकरी मिलने से पहले 10 से 14 दिन असली कंपनी में काम। इस दौरान सरकार रोज ₹380–₹420 देती है।',
  },
  epfo: {
    term: 'EPFO',
    plain: 'The government office that keeps a record of everyone who gets a salary. If your name is there, it proves you really got the job and really got paid.',
    marathi: 'पगार मिळणाऱ्या सर्वांची नोंद ठेवणारे सरकारी कार्यालय. तिथे नाव असेल तर नोकरी खरी आहे हे सिद्ध होते.',
    hindi: 'वेतन पाने वालों का रिकॉर्ड रखने वाला सरकारी दफ्तर। वहाँ नाम होने का मतलब नौकरी सच में मिली।',
  },
  jobFitCard: {
    term: 'Job-Fit Card',
    plain: 'A one-page summary of what you can do, which the government has checked and stamped. Employers trust it more than a normal CV because you did not write it yourself.',
    marathi: 'तुम्ही काय करू शकता याचा एक पानाचा सरकारी तपासलेला सारांश. सामान्य बायोडाटापेक्षा कंपन्या यावर जास्त विश्वास ठेवतात.',
    hindi: 'आप क्या कर सकते हैं, इसका एक पन्ने का सरकारी जाँचा हुआ सारांश। सामान्य बायोडाटा से ज़्यादा भरोसेमंद।',
  },
  tradeShift: {
    term: 'Trade-Shift Track',
    plain: 'A short course that moves you from work that is disappearing to similar work that is growing. For example, petrol engine repair to electric vehicle repair. It only teaches the new part.',
    marathi: 'कमी होत चाललेल्या कामातून वाढत्या कामाकडे नेणारा छोटा कोर्स. फक्त नवीन भाग शिकवला जातो.',
    hindi: 'घटते काम से बढ़ते काम की ओर ले जाने वाला छोटा कोर्स। सिर्फ़ नया हिस्सा सिखाया जाता है।',
  },
  sensorPractical: {
    term: 'Sensor-Verified Practical',
    plain: 'The machine itself records what you did: how long you welded, how accurate your cut was. Your marks come from the machine, not from someone ticking a box.',
    marathi: 'मशीन स्वतः तुमचे काम नोंदवते. गुण मशीनकडून मिळतात, कोणाच्या सहीने नाही.',
    hindi: 'मशीन खुद आपका काम रिकॉर्ड करती है। नंबर मशीन से आते हैं, किसी के दस्तख़त से नहीं।',
  },
  hiringPool: {
    term: 'Hiring Pool',
    plain: 'Several small companies join together and promise in writing to hire a certain number of people before the training even starts. That promise is why the seat exists.',
    marathi: 'अनेक लहान कंपन्या एकत्र येऊन प्रशिक्षण सुरू होण्यापूर्वीच ठराविक लोकांना नोकरी देण्याचे लेखी वचन देतात.',
    hindi: 'कई छोटी कंपनियाँ मिलकर ट्रेनिंग शुरू होने से पहले ही तय लोगों को नौकरी देने का लिखित वादा करती हैं।',
  },
} as const;

/**
 * A large, high-contrast action card. Used at the top of candidate screens so
 * the single most useful next action is impossible to miss, with the reasoning
 * written in everyday language rather than administrative English.
 */
export function BigAction({
  step,
  title,
  plain,
  cta,
  href,
  urgency = 'medium',
  onClick,
}: {
  step?: number;
  title: string;
  plain: string;
  cta: string;
  href?: string;
  urgency?: 'high' | 'medium' | 'low';
  onClick?: () => void;
}) {
  const accent =
    urgency === 'high' ? 'var(--accent-student)'
    : urgency === 'medium' ? 'var(--gov-navy)'
    : 'var(--signal-stable)';

  const inner = (
    <>
      <div className="flex items-start gap-3.5">
        {step !== undefined && (
          <span
            className="w-9 h-9 shrink-0 grid place-items-center rounded-full text-white text-[16px] font-bold mono"
            style={{ background: accent }}
          >
            {step}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[17px] font-bold text-[var(--ink)] leading-snug">{title}</p>
          <p className="text-[14.5px] text-[var(--ink-secondary)] leading-relaxed mt-1.5">{plain}</p>
        </div>
      </div>
      <span
        className="mt-4 inline-block text-white font-bold text-[15px] px-5 py-3 rounded-sm"
        style={{ background: accent }}
      >
        {cta} →
      </span>
    </>
  );

  const cls =
    'gov-card p-5 flex flex-col items-start text-left focus-ring w-full ks-lift';

  if (href) {
    return (
      <a href={href} className={cls} style={{ borderLeft: `5px solid ${accent}` }}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls} style={{ borderLeft: `5px solid ${accent}` }}>
      {inner}
    </button>
  );
}
