/* ------------------------------------------------------------------ */
/*  Guided tours and per-page guides                                   */
/*                                                                     */
/*  Written for someone who has never used a government portal before.  */
/*  Every step says what the thing is, then what to do with it, in     */
/*  that order, in everyday language, with the Marathi line carried     */
/*  alongside rather than hidden behind a language switch.              */
/* ------------------------------------------------------------------ */

export interface TourStep {
  /** Matches a data-guide="…" attribute in the DOM. Omit to centre the card. */
  target?: string;
  title: string;
  body: string;
  marathi?: string;
  /** Where to put the callout relative to the target. */
  placement?: 'auto' | 'right' | 'left' | 'bottom' | 'top' | 'centre';
}

export interface Tour {
  id: string;
  /** Route this tour belongs to. */
  route: string;
  title: string;
  subtitle: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  /* ---------------- Candidate ---------------- */
  {
    id: 'student-welcome',
    route: '/dashboard/student',
    title: 'Welcome to your dashboard',
    subtitle: 'Six quick steps. You can stop any time and start again later.',
    steps: [
      {
        placement: 'centre',
        title: 'Why this portal exists',
        body: 'So you do not train for work that is not there. What you see here comes from what employers in your district are actually hiring for, not from a brochure. A short walk-through follows. You can stop any time.',
        marathi: 'तुमच्या जिल्ह्यात प्रत्यक्ष मागणी असलेलेच प्रशिक्षण तुम्हाला मिळावे, हाच या पोर्टलचा उद्देश आहे.',
      },
      {
        target: 'next-steps',
        title: 'Start here, every time',
        body: 'This is the most useful part of the page. We look at your profile and tell you two or three things worth doing now, in ordinary words. If you only read one block, read this one.',
        marathi: 'इथून सुरुवात करा. तुमच्यासाठी आत्ता काय करणे योग्य आहे ते सोप्या शब्दांत सांगितले जाते.',
        placement: 'bottom',
      },
      {
        target: 'best-match',
        title: 'Your best course match',
        body: 'Of every course you could join, this one scored highest for you. The score is out of 100. Tap "See all my matches" to open any course and see why it scored that: every point added and subtracted.',
        marathi: 'तुमच्यासाठी सर्वोत्तम कोर्स. गुण कसे मिळाले हे तुम्ही पूर्णपणे पाहू शकता.',
        placement: 'top',
      },
      {
        target: 'nav',
        title: 'Your services live here',
        body: 'Nine sections, in the order most people need them. Not sure where to go? "Courses for you" and "My CV" are the two most people open first.',
        marathi: 'तुमच्या सर्व सेवा इथे आहेत. सुरुवातीला "Recommended for you" पहा.',
        placement: 'right',
      },
      {
        target: 'stats',
        title: 'Your numbers at a glance',
        body: 'Your skill level, your work experience, how many trades near you are growing, and how many employers are currently hiring. If a number looks wrong, it is because your profile needs updating.',
        marathi: 'तुमची पातळी, अनुभव आणि जवळपासच्या नोकऱ्यांची संख्या.',
        placement: 'bottom',
      },
      {
        target: 'guide-launcher',
        title: 'Lost? Press this',
        body: 'This button is on every page. It reopens this tour, and on other pages it explains what that particular page is for. You can also call 1800-233-0202 and simply speak your question in Marathi, Hindi, English or Urdu.',
        marathi: 'अडचण आल्यास हे बटण दाबा, किंवा १८००-२३३-०२०२ वर फोन करून मराठीत विचारा.',
        placement: 'left',
      },
    ],
  },

  /* ---------------- Enterprise ---------------- */
  {
    id: 'business-welcome',
    route: '/dashboard/business',
    title: 'Welcome to your business dashboard',
    subtitle: 'Five steps covering what this portal does for an employer.',
    steps: [
      {
        placement: 'centre',
        title: 'What this portal does for you',
        body: 'Two things a job board cannot do. What you post here changes how many training seats your district opens next year. And people reach you through a paid trial on your own floor, so you hire after you have watched them work.',
        marathi: 'तुम्ही इथे नोंदवलेली मागणी जिल्ह्याच्या प्रशिक्षण जागा ठरवते.',
      },
      {
        target: 'stats',
        title: 'Where you stand today',
        body: 'Batches you can still join, people currently on trial, idle machine hours near you, and trades where jobs are growing faster than training.',
        placement: 'bottom',
      },
      {
        target: 'nav',
        title: 'Six things you can do',
        body: 'Post who you need, join a shared batch, flag outdated topics, rent idle machine time, certify workers you already employ, and file the payroll that releases your subsidy.',
        placement: 'right',
      },
      {
        target: 'pipeline',
        title: 'Shared batches',
        body: 'A twelve-person unit cannot fill a training batch alone. Several small firms join one batch. Each promises only the people they will actually take, at a wage each names. The State pays for the training.',
        placement: 'top',
      },
      {
        target: 'guide-launcher',
        title: 'Help is on every page',
        body: 'Press this on any screen for an explanation of what that page does and how to use it.',
        placement: 'left',
      },
    ],
  },

  /* ---------------- Departmental ---------------- */
  {
    id: 'gov-welcome',
    route: '/gov/console',
    title: 'Departmental portal: a short orientation',
    subtitle: 'Four steps on how access and the alert queue work.',
    steps: [
      {
        placement: 'centre',
        title: 'This is not the public portal',
        body: 'Access here is three things at once: the role you signed in with, the permissions that role carries, and the slice of data it is allowed to see. All three are enforced on every screen, and every action you take is written to the audit register.',
      },
      {
        target: 'scope',
        title: 'Your data scope is always visible',
        body: 'State-wide, a single district, or a single training centre. Nothing outside that slice is loaded. A district officer cannot open another district’s records.',
        placement: 'bottom',
      },
      {
        target: 'nav',
        title: 'Locked sections name what is missing',
        body: 'Where your role lacks a permission, the section is shown locked with the exact permission it needs rather than hidden. You always know what exists and who to refer it to.',
        placement: 'right',
      },
      {
        target: 'alerts',
        title: 'One queue across all six pillars',
        body: 'Alerts are raised by the system, never typed in by hand. Each one names the permission needed to close it. If you cannot act, it goes to the role that can, instead of sitting untouched.',
        placement: 'top',
      },
    ],
  },
];

export function tourForRoute(route: string): Tour | undefined {
  return TOURS.find(t => t.route === route);
}

/* ------------------------------------------------------------------ */
/*  Per-page guides: what this page is for, and how to use it           */
/* ------------------------------------------------------------------ */

export interface PageGuide {
  route: string;
  what: string;
  marathi?: string;
  steps: string[];
  tip?: string;
}

export const PAGE_GUIDES: PageGuide[] = [
  {
    route: '/dashboard/student/recommend',
    what: 'Every course you could join, scored out of 100 against what employers near you are actually hiring for.',
    marathi: 'तुम्ही करू शकता अशा प्रत्येक कोर्सला १०० पैकी गुण दिले आहेत.',
    steps: [
      'Fill the three optional boxes at the top: what you earn now, whether you can travel, and any field you prefer. The list re-sorts as you type.',
      'Look at the top three cards first. A green "Strong match" means employers have signed up to hire and seats are still open.',
      'On any card, press "Show all reasons" to see every point that was added or subtracted. Nothing is hidden from you.',
      'Found one you like? Press "See this course" for the full syllabus, hours and tools.',
    ],
    tip: 'A course with high pay but no employers signed up is riskier than it looks. The score already accounts for that.',
  },
  {
    route: '/dashboard/student/cv',
    what: 'A one-page profile employers trust, because the department filled most of it in, not you.',
    marathi: 'एक पानाचा बायोडाटा, जो सरकारने तपासला आहे.',
    steps: [
      'Look at "Card strength" on the right. It tells you exactly what is still missing.',
      'Write two or three plain sentences about the work you want. That is the only writing you have to do.',
      'Tick the languages you speak and add anything else useful: your own tools, a driving licence, night-shift availability.',
      'Press "Print / Save as PDF" and send it, or just give an employer your KSID so they can look it up themselves.',
    ],
    tip: 'Items with a green tick were recorded by the department: a machine log, an employer scorecard, a payroll entry. Those are what make this different from an ordinary CV.',
  },
  {
    route: '/dashboard/student/demand',
    what: 'Whether a trade is growing or shrinking where you live, and which tasks inside it are disappearing.',
    marathi: 'तुमच्या भागात कोणता ट्रेड वाढतोय आणि कोणता कमी होतोय.',
    steps: [
      'Pick your trade and district at the top.',
      'Read the coloured box first. It gives you a straight answer about whether the trade is worth learning.',
      'Scroll to "Dying Task Watch". A trade rarely dies all at once; particular tasks inside it do, while the trade name survives.',
      'If your trade is shrinking, that is not a dead end. Open Certificate for my work for a short bridge into a growing one.',
    ],
  },
  {
    route: '/dashboard/student/pathways',
    what: 'Two ways forward: get certified for work you already do, or move into a growing trade by learning only the difference.',
    marathi: 'आधीच्या कामाचे प्रमाणपत्र मिळवा, किंवा थोडे शिकून नवीन ट्रेडमध्ये जा.',
    steps: [
      'On the first tab, drag the years slider and tick the evidence you can actually produce.',
      'The right-hand panel updates as you go: the level you would be certified at, the hours you would still need, and how much more you would likely earn.',
      'The second tab shows trade-shift tracks. These teach only the gap between your trade and the new one, so they take weeks rather than years.',
    ],
    tip: 'An employer letter and a tool test together are worth more than years alone. Evidence is what decides the level.',
  },
  {
    route: '/dashboard/student/jobs',
    what: 'Openings where an employer has already promised in writing to hire, and the paid trial that decides it.',
    steps: [
      'Each pool card lists the employers who signed and how many seats each committed.',
      'Check the wage floor. That is the minimum they are legally bound to pay you.',
      'Press "Apply to this pool". You will be called for counselling.',
      'Lower down, click any row to see a real trial scorecard so you know what you will be judged on.',
    ],
    tip: 'The State pays you ₹380 to ₹420 every day of the trial, whether or not you are hired at the end.',
  },
  {
    route: '/dashboard/student/syllabus',
    what: 'Exactly what you will be taught, hour by hour, and the machine evidence behind every practical mark.',
    steps: [
      'Click any module row to open it. You will see the hours, the actual tools used, and what you are assessed on.',
      'Modules marked "stale" teach work that is disappearing. The department publishes this openly instead of hiding it.',
      'Scroll to the experiments section to see two versions of the course being trialled and what happened to each group.',
    ],
  },
  {
    route: '/dashboard/student/labs',
    what: 'Every machine you can book time on, including private factory equipment the State has rented for training.',
    steps: [
      'Green "Open" means slots are free this week. Red means fully booked.',
      'Press a time slot to request it. Confirmation comes by SMS within 24 hours.',
      'Machines marked "Private industry" cost you nothing. The State pays the factory for your hours.',
    ],
  },
  {
    route: '/dashboard/student/assist',
    what: 'Ask anything on this portal by speaking, in your own language.',
    marathi: 'मराठीत बोलून काहीही विचारा.',
    steps: [
      'Choose your language and whether you are using the browser, a phone call, or WhatsApp.',
      'Tap one of the example questions to hear how the assistant answers.',
      'On a real phone call there is no menu. You just say what you need in full sentences.',
    ],
    tip: 'If a centre has recorded you as placed but you were never paid, say so here. Your payroll record is checked the same day and you do not have to prove anything yourself.',
  },
  {
    route: '/dashboard/business/signals',
    what: 'Post a vacancy and watch, live, how much weight it will carry in next year’s district seat plan.',
    steps: [
      'Fill in the role, the number of people and the wage. The right-hand panel updates as you type.',
      'Watch the "claimed vs counted" figures. Anything that trips an integrity check is discounted, and the reason is named.',
      'Tick the EPFO and GST boxes if they apply. Both raise your weight a lot.',
      'Submit. Signals from establishments that actually hire carry several times the weight of an anonymous job-board posting.',
    ],
    tip: 'Your weight is earned, not given. Every posting that turns into a real payroll entry raises it for next time.',
  },
  {
    route: '/dashboard/business/hiring',
    what: 'Join a training batch with other employers, then decide on each candidate after watching them work.',
    steps: [
      'On the pools tab, enter how many seats you will genuinely absorb and the minimum wage you will pay.',
      'Sign the commitment. The batch is notified only once commitments cover the seat plan.',
      'On the trials tab, drag the sliders to score a candidate on the five gate criteria.',
      'Seventy out of a hundred is the pass mark. Below it, no placement is recorded and no subsidy moves.',
    ],
  },
  {
    route: '/dashboard/business/machines',
    what: 'Earn from machine time you are not using, on second and third shift.',
    steps: [
      'Describe the machine, the trade it can train, the free hours and the rate you want.',
      'The panel shows what that would earn you across a year.',
      'Approve or decline booking requests from training centres on the right.',
    ],
    tip: 'Lab capacity is the binding constraint in most of these districts. Idle hours you list are bought, not borrowed.',
  },
  {
    route: '/dashboard/business/compliance',
    what: 'The one filing that releases your subsidy, and keeps your vacancy posts trusted.',
    steps: [
      'Enter the candidate’s KSID, their UAN, the wage and the first contribution month.',
      'If the wage is below the floor you committed to, you will be warned before you file.',
      'Filed declarations reconcile against EPFO automatically. Clean records clear in one cycle.',
    ],
  },
  {
    route: '/gov/signals',
    what: 'Every vacancy claim before it is allowed to move the seat plan, and what the filter did to it.',
    steps: [
      'Click any row in the register to see the evidence behind that signal.',
      'The claimed-versus-admitted figures show how much of it survived weighting.',
      'Sources below a trust score of 30 can be blacklisted, if your role holds that permission.',
      'The Dying Task Watch at the bottom is about tasks, not whole trades. That is where outdated syllabus actually shows up.',
    ],
  },
  {
    route: '/gov/capacity',
    what: 'How many seats this district can genuinely deliver, and how many it has notified above that line.',
    steps: [
      'The chart shows four independent physical ceilings. The red bar is whichever one binds.',
      'Drag the sliders on the right to test lifting a limit. Watch which ceiling takes over.',
      'Seats notified above the hard limit are ghost classes: no trainer, bench, bed or rupee behind them.',
      'The machine pool below is how the lab ceiling gets lifted without buying equipment.',
    ],
  },
  {
    route: '/gov/districts',
    what: 'Where jobs and training seats do not match, by district and sector, and the skills nobody is teaching.',
    steps: [
      'Use the district selector top-right. If you hold district scope, only your own is available.',
      'The gap chart shows unmet demand as positive bars and training surplus as negative.',
      'The onboarding queue lists skills with verified demand and no course behind them anywhere.',
    ],
  },
  {
    route: '/gov/audit',
    what: 'Placement claims reconciled against EPFO payroll, and the voice grievances that corroborate them.',
    steps: [
      'Run the reconciliation, then click any row for the side-by-side claim-versus-payroll comparison.',
      'A claim with no EPFO record at all is a ghost placement. Those hold their subsidy automatically.',
      'The voice register is the other half. Candidates are the only party with no reason to lie about not being paid.',
    ],
  },
  {
    route: '/courses',
    what: 'Every notified course in the pilot districts, with its full syllabus published openly.',
    steps: [
      'Use the sort control to order the list by whatever matters to you: job growth, pay, duration or seats left.',
      'Each card shows the value it was ranked on, so the ordering is never a mystery.',
      'Open any course for the module-by-module breakdown, the tools used and the assessment weighting.',
    ],
  },
  {
    route: '/demand',
    what: 'The state’s verified labour market data, published for anyone to read.',
    steps: [
      'Pick a district and a trade at the top.',
      'The first chart is monthly verified vacancies against annual training supply.',
      'Every figure here has already been checked. These are not raw job-board counts.',
    ],
  },
];

export function pageGuideFor(route: string): PageGuide | undefined {
  return PAGE_GUIDES.find(g => g.route === route);
}
