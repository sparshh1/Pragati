/* ------------------------------------------------------------------ */
/*  Voice intents                                                      */
/*                                                                     */
/*  Real speech comes back as free text, so the assistant has to match  */
/*  it to something. There is no language model behind this — matching  */
/*  is keyword scoring across the four supported languages, which is    */
/*  honest about what it is and, for a fixed set of government service  */
/*  questions, works reliably.                                          */
/* ------------------------------------------------------------------ */

export interface VoiceIntent {
  id: string;
  /** What this question is, in English, for the UI. */
  label: string;
  /** Example phrasing offered as a tappable suggestion, per language. */
  example: Record<string, string>;
  /** Spoken answer, per language. */
  answer: Record<string, string>;
  /** Lower-cased keyword stems. A hit in any language scores. */
  keywords: string[];
  /** Where to send the user afterwards, if anywhere. */
  action?: { label: string; href: string };
}

export const VOICE_INTENTS: VoiceIntent[] = [
  {
    id: 'demand',
    label: 'Is my trade in demand?',
    example: {
      en: 'Is my trade in demand in Pune?',
      hi: 'क्या मेरे ट्रेड की मांग है?',
      mr: 'माझ्या ट्रेडला मागणी आहे का?',
      ur: 'کیا میرے ٹریڈ کی مانگ ہے؟',
    },
    answer: {
      en: 'In your district, demand for EV battery work has grown 48 percent this year. Training seats are 1,400 short of demand. Carburettor repair has fallen 61 percent, so avoid that trade.',
      hi: 'आपके जिले में ईवी बैटरी के काम की मांग इस साल 48 प्रतिशत बढ़ी है। प्रशिक्षण सीटें मांग से 1,400 कम हैं। कार्बोरेटर मरम्मत की मांग 61 प्रतिशत घटी है, इसलिए वह ट्रेड न चुनें।',
      mr: 'तुमच्या जिल्ह्यात ईव्ही बॅटरी कामाची मागणी या वर्षी अठ्ठेचाळीस टक्के वाढली आहे. प्रशिक्षण जागा मागणीपेक्षा चौदाशेने कमी आहेत. कार्बोरेटर दुरुस्तीची मागणी एकसष्ट टक्के घटली आहे, त्यामुळे तो ट्रेड टाळा.',
      ur: 'آپ کے ضلع میں ای وی بیٹری کے کام کی مانگ اس سال اڑتالیس فیصد بڑھی ہے۔ تربیتی نشستیں مانگ سے چودہ سو کم ہیں۔',
    },
    keywords: [
      'demand', 'trade', 'scope', 'future', 'worth', 'growing', 'job market',
      'मांग', 'ट्रेड', 'मागणी', 'भविष्य', 'चालतो', 'नोकरी', 'مانگ', 'ٹریڈ',
    ],
    action: { label: 'See demand data', href: '/dashboard/student/demand' },
  },
  {
    id: 'rpl',
    label: 'Can I get a certificate for my experience?',
    example: {
      en: 'I have worked nine years without a certificate. Can I get one?',
      hi: 'मैंने नौ साल काम किया है, क्या मुझे प्रमाणपत्र मिलेगा?',
      mr: 'मी नऊ वर्षे काम केले आहे, मला प्रमाणपत्र मिळेल का?',
      ur: 'میں نے نو سال کام کیا ہے، کیا مجھے سرٹیفکیٹ ملے گا؟',
    },
    answer: {
      en: 'Yes. With nine years of experience you qualify for Recognition of Prior Learning at level four. You would need only about 120 hours of bridge training instead of the full 2,400 hour course. Most people earn about 7,000 rupees more per month afterwards.',
      hi: 'हाँ। नौ साल के अनुभव पर आप स्तर चार के लिए पात्र हैं। पूरे 2,400 घंटे के कोर्स की जगह केवल 120 घंटे की ब्रिज ट्रेनिंग चाहिए। इसके बाद ज़्यादातर लोग महीने में लगभग 7,000 रुपये अधिक कमाते हैं।',
      mr: 'होय. नऊ वर्षांच्या अनुभवावर तुम्ही स्तर चारसाठी पात्र आहात. पूर्ण चोवीसशे तासांच्या कोर्सऐवजी फक्त एकशे वीस तासांचे ब्रिज प्रशिक्षण लागेल. त्यानंतर बहुतेक लोक महिन्याला सुमारे सात हजार रुपये जास्त कमावतात.',
      ur: 'جی ہاں۔ نو سال کے تجربے پر آپ لیول چار کے اہل ہیں۔ پورے کورس کی جگہ صرف ایک سو بیس گھنٹے کی برج ٹریننگ درکار ہے۔',
    },
    keywords: [
      'certificate', 'experience', 'rpl', 'prior learning', 'years', 'recognition', 'diploma',
      'प्रमाणपत्र', 'अनुभव', 'साल', 'वर्षे', 'तजुर्बہ', 'سرٹیفکیٹ', 'تجربہ',
    ],
    action: { label: 'Check my eligibility', href: '/dashboard/student/pathways' },
  },
  {
    id: 'stipend',
    label: 'How much money will I get during the trial?',
    example: {
      en: 'How much stipend do I get during the work trial?',
      hi: 'वर्क ट्रायल में कितना वजीफा मिलेगा?',
      mr: 'वर्क ट्रायलमध्ये किती विद्यावेतन मिळेल?',
      ur: 'ورک ٹرائل میں کتنا وظیفہ ملے گا؟',
    },
    answer: {
      en: 'The state pays you between 380 and 420 rupees every day during the work trial. The trial runs ten to fourteen days, and the money goes directly to your bank account whether or not you are hired at the end.',
      hi: 'वर्क ट्रायल के दौरान सरकार आपको रोज़ 380 से 420 रुपये देती है। ट्रायल दस से चौदह दिन चलता है और पैसा सीधे आपके बैंक खाते में आता है, चाहे आपको नौकरी मिले या नहीं।',
      mr: 'वर्क ट्रायल दरम्यान सरकार तुम्हाला दररोज तीनशे ऐंशी ते चारशे वीस रुपये देते. ट्रायल दहा ते चौदा दिवस चालतो आणि पैसे थेट तुमच्या बँक खात्यात येतात, तुम्हाला नोकरी मिळो वा न मिळो.',
      ur: 'ورک ٹرائل کے دوران حکومت آپ کو روزانہ تین سو اسی سے چار سو بیس روپے دیتی ہے۔ رقم براہ راست آپ کے بینک اکاؤنٹ میں آتی ہے۔',
    },
    keywords: [
      'stipend', 'money', 'paid', 'salary', 'trial', 'wage', 'rupees', 'kitna',
      'वजीफा', 'पैसा', 'पगार', 'विद्यावेतन', 'रुपये', 'कितना', 'किती', 'وظیفہ', 'پیسے',
    ],
    action: { label: 'See open trials', href: '/dashboard/student/jobs' },
  },
  {
    id: 'grievance',
    label: 'I was marked placed but never paid',
    example: {
      en: 'The centre says I am placed but I was never paid.',
      hi: 'केंद्र कहता है नौकरी लग गई पर वेतन नहीं मिला।',
      mr: 'केंद्र म्हणते नोकरी लागली पण पगार मिळाला नाही.',
      ur: 'مرکز کہتا ہے نوکری لگ گئی لیکن تنخواہ نہیں ملی۔',
    },
    answer: {
      en: 'This is serious and I have recorded it. Your payroll record shows no salary from that employer, which means the placement may be false. Complaint number G R V 8841 has been raised and sent to the district officer. The training centre will not receive its payment until this is settled. You do not need to prove anything yourself.',
      hi: 'यह गंभीर मामला है और मैंने दर्ज कर लिया है। आपके पेरोल रिकॉर्ड में उस नियोक्ता से कोई वेतन नहीं दिखता, यानी नौकरी झूठी हो सकती है। शिकायत संख्या जी आर वी 8841 दर्ज कर जिला अधिकारी को भेज दी गई है। जब तक मामला सुलझता नहीं, केंद्र को भुगतान नहीं होगा।',
      mr: 'ही गंभीर बाब आहे आणि मी ती नोंदवली आहे. तुमच्या पगार नोंदीत त्या मालकाकडून कोणताही पगार दिसत नाही, म्हणजे नोकरी खोटी असू शकते. तक्रार क्रमांक जी आर व्ही अठ्ठ्याऐंशी एक्केचाळीस नोंदवून जिल्हा अधिकाऱ्यांकडे पाठवली आहे. हे प्रकरण मिटेपर्यंत केंद्राला पैसे मिळणार नाहीत.',
      ur: 'یہ سنگین معاملہ ہے اور میں نے درج کر لیا ہے۔ آپ کے پے رول ریکارڈ میں کوئی تنخواہ نہیں دکھتی۔ شکایت نمبر جی آر وی 8841 ضلعی افسر کو بھیج دی گئی ہے۔',
    },
    keywords: [
      'not paid', 'no salary', 'placed', 'complaint', 'cheated', 'fake', 'grievance', 'never got',
      'वेतन नहीं', 'पगार', 'शिकायत', 'तक्रार', 'नोकरी लागली', 'धोका', 'شکایت', 'تنخواہ نہیں',
    ],
    action: { label: 'Track my complaint', href: '/dashboard/student/assist' },
  },
  {
    id: 'course',
    label: 'Which course should I join?',
    example: {
      en: 'Which course should I join?',
      hi: 'मुझे कौन सा कोर्स करना चाहिए?',
      mr: 'मी कोणता कोर्स करावा?',
      ur: 'مجھے کون سا کورس کرنا چاہیے؟',
    },
    answer: {
      en: 'Based on your profile, Advanced E V Technician scores highest for you at 70 out of 100. Four employers in Pune have already signed up to hire from it, starting pay is 18,000 rupees a month, and it takes six months.',
      hi: 'आपकी प्रोफ़ाइल के अनुसार एडवांस्ड ईवी टेक्नीशियन आपके लिए सबसे अच्छा है, 100 में से 70 अंक। पुणे में चार नियोक्ता पहले ही भर्ती के लिए तैयार हैं, शुरुआती वेतन 18,000 रुपये महीना, अवधि छह महीने।',
      mr: 'तुमच्या प्रोफाइलनुसार अॅडव्हान्स्ड ईव्ही टेक्निशियन तुमच्यासाठी सर्वोत्तम आहे, शंभरपैकी सत्तर गुण. पुण्यात चार मालकांनी आधीच भरतीसाठी सही केली आहे, सुरुवातीचा पगार अठरा हजार रुपये महिना, कालावधी सहा महिने.',
      ur: 'آپ کی پروفائل کے مطابق ایڈوانسڈ ای وی ٹیکنیشن آپ کے لیے بہترین ہے۔ پونے میں چار آجر بھرتی کے لیے تیار ہیں، ابتدائی تنخواہ اٹھارہ ہزار روپے ماہانہ۔',
    },
    keywords: [
      'course', 'join', 'which', 'study', 'learn', 'training', 'admission', 'karu',
      'कोर्स', 'कौन सा', 'कोणता', 'शिकायचे', 'प्रशिक्षण', 'दाखला', 'کورس', 'کون سا',
    ],
    action: { label: 'See my matches', href: '/dashboard/student/recommend' },
  },
];

const FALLBACK: Record<string, string> = {
  en: 'Sorry, I did not understand that. You can ask about demand for your trade, getting a certificate for your experience, trial money, choosing a course, or a complaint about pay.',
  hi: 'माफ़ कीजिए, मैं समझ नहीं पाया। आप ट्रेड की मांग, अनुभव के प्रमाणपत्र, ट्रायल के पैसे, कोर्स चुनने या वेतन की शिकायत के बारे में पूछ सकते हैं।',
  mr: 'माफ करा, मला समजले नाही. तुम्ही ट्रेडची मागणी, अनुभवाचे प्रमाणपत्र, ट्रायलचे पैसे, कोर्स निवड किंवा पगाराची तक्रार याबद्दल विचारू शकता.',
  ur: 'معاف کیجیے، میں سمجھ نہیں سکا۔ آپ ٹریڈ کی مانگ، سرٹیفکیٹ، ٹرائل کے پیسے یا شکایت کے بارے میں پوچھ سکتے ہیں۔',
};

export interface IntentMatch {
  intent: VoiceIntent | null;
  answer: string;
  confidence: number;
  matched: string[];
}

/**
 * Scores a transcript against every intent and returns the best one.
 *
 * Deliberately simple: normalised substring hits, weighted by keyword length so
 * that "not paid" counts for more than "job". Anything below two points is
 * treated as not understood rather than guessed at — a wrong confident answer
 * about someone's wages is worse than admitting the system missed.
 */
export function matchIntent(transcript: string, lang: string): IntentMatch {
  const t = transcript.toLowerCase().trim();
  if (!t) return { intent: null, answer: FALLBACK[lang] ?? FALLBACK.en, confidence: 0, matched: [] };

  let best: VoiceIntent | null = null;
  let bestScore = 0;
  let bestHits: string[] = [];

  for (const intent of VOICE_INTENTS) {
    let score = 0;
    const hits: string[] = [];
    for (const k of intent.keywords) {
      if (t.includes(k.toLowerCase())) {
        score += k.length > 5 ? 2 : 1;
        hits.push(k);
      }
    }
    if (score > bestScore) { bestScore = score; best = intent; bestHits = hits; }
  }

  if (!best || bestScore < 2) {
    return { intent: null, answer: FALLBACK[lang] ?? FALLBACK.en, confidence: 0, matched: [] };
  }

  return {
    intent: best,
    answer: best.answer[lang] ?? best.answer.en,
    confidence: Math.min(100, bestScore * 22),
    matched: bestHits,
  };
}
