import { PayrollAudit, ControlTowerAlert, LanguageSupport, VoiceSession } from '@/types';

/* ------------------------------------------------------------------ */
/*  EPFO Payroll Audit                                                  */
/*                                                                      */
/*  A placement certificate proves a form was filled. An EPFO            */
/*  contribution proves someone was actually paid. Every placement       */
/*  claim is reconciled against the candidate's UAN: employer name,      */
/*  first contribution month, declared wage and months of continuity.    */
/*  Subsidy follows the payroll record, never the certificate.           */
/* ------------------------------------------------------------------ */

export const payrollAudits: PayrollAudit[] = [
  {
    id: 'AUD-9101', candidateName: 'Rahul Deshmukh', candidateKsid: 'MH-CD-2026-418203', uan: '1014•••••8821',
    claimedEmployerName: 'Bajaj EV Assembly Unit', claimedEmployerId: 'emp-pune-02', courseId: 'pune-ev-01',
    districtId: 'pune', claimedPlacementDate: '2026-09-01', claimedMonthlyWage: 26000,
    epfoEmployerName: 'Bajaj EV Assembly Unit', epfoFirstContributionMonth: '2026-09', epfoDeclaredWage: 26000,
    monthsContributed: 1, verdict: 'clean', subsidyAtRisk: 0,
    notes: 'Employer, wage and month all reconcile. Tranche 1 cleared for release.',
  },
  {
    id: 'AUD-9102', candidateName: 'Priya Kadam', candidateKsid: 'MH-CD-2026-418244', uan: '1014•••••8847',
    claimedEmployerName: 'Bajaj EV Assembly Unit', claimedEmployerId: 'emp-pune-02', courseId: 'pune-ev-01',
    districtId: 'pune', claimedPlacementDate: '2026-09-01', claimedMonthlyWage: 29000,
    epfoEmployerName: 'Bajaj EV Assembly Unit', epfoFirstContributionMonth: '2026-09', epfoDeclaredWage: 29000,
    monthsContributed: 1, verdict: 'clean', subsidyAtRisk: 0,
    notes: 'Clean. Above pool wage floor of ₹26,000.',
  },
  {
    id: 'AUD-9103', candidateName: 'Kiran Salunkhe', candidateKsid: 'MH-CD-2025-401882', uan: '1009•••••3310',
    claimedEmployerName: 'Marathwada Logistics', claimedEmployerId: 'emp-csn-03', courseId: 'csn-ware-01',
    districtId: 'csn', claimedPlacementDate: '2026-02-01', claimedMonthlyWage: 18000,
    epfoEmployerName: null, epfoFirstContributionMonth: null, epfoDeclaredWage: null,
    monthsContributed: 0, verdict: 'ghost-placement', subsidyAtRisk: 24000,
    notes: 'No EPFO contribution in 7 months against a claim of full-time placement. Centre has been asked to show cause.',
  },
  {
    id: 'AUD-9104', candidateName: 'Deepak Wagh', candidateKsid: 'MH-CD-2025-402117', uan: '1009•••••4402',
    claimedEmployerName: 'Reliance Retail Logistics', claimedEmployerId: 'emp-tha-01', courseId: 'tha-ware-01',
    districtId: 'thane', claimedPlacementDate: '2026-01-15', claimedMonthlyWage: 21000,
    epfoEmployerName: 'Sahyadri Staffing Solutions', epfoFirstContributionMonth: '2026-02', epfoDeclaredWage: 13500,
    monthsContributed: 5, verdict: 'mismatch', subsidyAtRisk: 22000,
    notes: 'Placed with a staffing agency, not the named principal employer, at 64% of the claimed wage. Counts as placement but not at declared terms.',
  },
  {
    id: 'AUD-9105', candidateName: 'Sunita Raut', candidateKsid: 'MH-CD-2025-403044', uan: '1009•••••5518',
    claimedEmployerName: 'Classic BPO', claimedEmployerId: 'emp-csn-04', courseId: 'csn-data-01',
    districtId: 'csn', claimedPlacementDate: '2026-03-01', claimedMonthlyWage: 15000,
    epfoEmployerName: 'Classic BPO', epfoFirstContributionMonth: '2026-03', epfoDeclaredWage: 11200,
    monthsContributed: 6, verdict: 'wage-shortfall', subsidyAtRisk: 9000,
    notes: 'Real placement, but declared wage is ₹3,800 below the claim and below the district floor for the trade.',
  },
  {
    id: 'AUD-9106', candidateName: 'Aishwarya Chavan', candidateKsid: 'MH-CD-2026-421008', uan: '1014•••••6620',
    claimedEmployerName: 'Nagpur Handloom Co-op', claimedEmployerId: 'emp-ngp-03', courseId: 'tha-cad-01',
    districtId: 'kolhapur', claimedPlacementDate: '2026-06-01', claimedMonthlyWage: 27000,
    epfoEmployerName: 'Nagpur Handloom Co-op', epfoFirstContributionMonth: '2026-06', epfoDeclaredWage: 27000,
    monthsContributed: 4, verdict: 'clean', subsidyAtRisk: 0,
    notes: 'Four months of continuous contribution. Tranche 2 eligible.',
  },
  {
    id: 'AUD-9107', candidateName: 'Imran Shaikh', candidateKsid: 'MH-CD-2025-404201', uan: '1009•••••7731',
    claimedEmployerName: 'Precision CNC Machining MSME', claimedEmployerId: 'emp-csn-02', courseId: 'csn-cnc-01',
    districtId: 'csn', claimedPlacementDate: '2026-04-01', claimedMonthlyWage: 22000,
    epfoEmployerName: 'Precision CNC Machining MSME', epfoFirstContributionMonth: '2026-04', epfoDeclaredWage: 22000,
    monthsContributed: 2, verdict: 'mismatch', subsidyAtRisk: 18000,
    notes: 'Contributions stopped after 2 months. Retention condition for tranche 2 (6 months) not met.',
  },
  {
    id: 'AUD-9108', candidateName: 'Vijay Bhosale', candidateKsid: 'MH-CD-2026-419002', uan: '1014•••••8890',
    claimedEmployerName: 'Vidarbha EV Hub', claimedEmployerId: 'emp-ngp-01', courseId: 'ngp-ev-01',
    districtId: 'nagpur', claimedPlacementDate: '2026-09-05', claimedMonthlyWage: 24000,
    epfoEmployerName: 'Vidarbha EV Hub', epfoFirstContributionMonth: '2026-09', epfoDeclaredWage: 24000,
    monthsContributed: 1, verdict: 'clean', subsidyAtRisk: 0,
    notes: 'Clean. Work-trial gate cleared at 85 before placement.',
  },
  {
    id: 'AUD-9109', candidateName: 'Rekha Pawar', candidateKsid: 'MH-CD-2025-405118', uan: '1009•••••9902',
    claimedEmployerName: 'Digital Horizons Media', claimedEmployerId: 'emp-tha-03', courseId: 'tha-digi-01',
    districtId: 'thane', claimedPlacementDate: '2026-07-01', claimedMonthlyWage: 20000,
    epfoEmployerName: null, epfoFirstContributionMonth: null, epfoDeclaredWage: null,
    monthsContributed: 0, verdict: 'awaiting-data', subsidyAtRisk: 0,
    notes: 'Employer files quarterly. Next EPFO sync 15 Oct 2026.',
  },
  {
    id: 'AUD-9110', candidateName: 'Santosh Jadhav', candidateKsid: 'MH-CD-2025-406002', uan: '1009•••••1123',
    claimedEmployerName: 'Marathwada Logistics', claimedEmployerId: 'emp-csn-03', courseId: 'csn-ware-01',
    districtId: 'csn', claimedPlacementDate: '2026-02-01', claimedMonthlyWage: 18000,
    epfoEmployerName: null, epfoFirstContributionMonth: null, epfoDeclaredWage: null,
    monthsContributed: 0, verdict: 'ghost-placement', subsidyAtRisk: 24000,
    notes: 'Second ghost claim against the same employer and batch. Pattern escalated: see alert ALT-004.',
  },
  {
    id: 'AUD-9111', candidateName: 'Ramesh More', candidateKsid: 'MH-CD-2026-421055', uan: '1014•••••2234',
    claimedEmployerName: 'Deshmukh Electrical Services', claimedEmployerId: 'emp-nsk-01', courseId: 'nsk-elec-01',
    districtId: 'nashik', claimedPlacementDate: '2026-06-01', claimedMonthlyWage: 24800,
    epfoEmployerName: 'Deshmukh Electrical Services', epfoFirstContributionMonth: '2026-06', epfoDeclaredWage: 24800,
    monthsContributed: 4, verdict: 'clean', subsidyAtRisk: 0,
    notes: 'RPL-certified candidate. Wage uplift of ₹8,600 over pre-certification earnings confirmed.',
  },
  {
    id: 'AUD-9112', candidateName: 'Farhan Qureshi', candidateKsid: 'MH-CD-2025-407311', uan: '1009•••••3345',
    claimedEmployerName: 'Aurangabad Auto Parts', claimedEmployerId: 'emp-csn-01', courseId: 'csn-weld-01',
    districtId: 'csn', claimedPlacementDate: '2026-05-01', claimedMonthlyWage: 20000,
    epfoEmployerName: 'Aurangabad Auto Parts', epfoFirstContributionMonth: '2026-05', epfoDeclaredWage: 20400,
    monthsContributed: 5, verdict: 'clean', subsidyAtRisk: 0,
    notes: 'Declared wage marginally above claim. Clean.',
  },
];

export function auditStats(districtId?: string) {
  const list = districtId ? payrollAudits.filter(a => a.districtId === districtId) : payrollAudits;
  const byVerdict = (v: PayrollAudit['verdict']) => list.filter(a => a.verdict === v).length;
  const atRisk = list.reduce((a, x) => a + x.subsidyAtRisk, 0);
  const decided = list.filter(a => a.verdict !== 'awaiting-data');
  return {
    total: list.length,
    clean: byVerdict('clean'),
    ghost: byVerdict('ghost-placement'),
    mismatch: byVerdict('mismatch'),
    shortfall: byVerdict('wage-shortfall'),
    awaiting: byVerdict('awaiting-data'),
    subsidyAtRisk: atRisk,
    cleanRate: decided.length ? Math.round((byVerdict('clean') / decided.length) * 100) : 0,
  };
}

export const VERDICT_LABEL: Record<PayrollAudit['verdict'], string> = {
  clean: 'Reconciled',
  mismatch: 'Employer / retention mismatch',
  'ghost-placement': 'Ghost placement',
  'wage-shortfall': 'Wage shortfall',
  'awaiting-data': 'Awaiting EPFO sync',
};

/* ------------------------------------------------------------------ */
/*  Multilingual access                                                 */
/* ------------------------------------------------------------------ */

export const languages: LanguageSupport[] = [
  {
    code: 'mr', name: 'Marathi', nativeName: 'मराठी',
    speakerShare: { pune: 0.74, nashik: 0.81, csn: 0.78, nagpur: 0.69, thane: 0.58, kolhapur: 0.88 },
    ivrAvailable: true, sttModelAccuracy: 0.94, contentTranslatedPercent: 100,
  },
  {
    code: 'hi', name: 'Hindi', nativeName: 'हिन्दी',
    speakerShare: { pune: 0.14, nashik: 0.09, csn: 0.11, nagpur: 0.22, thane: 0.26, kolhapur: 0.05 },
    ivrAvailable: true, sttModelAccuracy: 0.96, contentTranslatedPercent: 100,
  },
  {
    code: 'en', name: 'English', nativeName: 'English',
    speakerShare: { pune: 0.06, nashik: 0.03, csn: 0.03, nagpur: 0.04, thane: 0.07, kolhapur: 0.02 },
    ivrAvailable: true, sttModelAccuracy: 0.97, contentTranslatedPercent: 100,
  },
  {
    code: 'ur', name: 'Urdu', nativeName: 'اردو',
    speakerShare: { pune: 0.04, nashik: 0.04, csn: 0.07, nagpur: 0.04, thane: 0.06, kolhapur: 0.03 },
    ivrAvailable: true, sttModelAccuracy: 0.89, contentTranslatedPercent: 84,
  },
  {
    code: 'bn', name: 'Bengali', nativeName: 'বাংলা',
    speakerShare: { pune: 0.01, nashik: 0.01, csn: 0.005, nagpur: 0.005, thane: 0.02, kolhapur: 0.005 },
    ivrAvailable: false, sttModelAccuracy: 0.86, contentTranslatedPercent: 41,
  },
  {
    code: 'ta', name: 'Tamil', nativeName: 'தமிழ்',
    speakerShare: { pune: 0.01, nashik: 0.005, csn: 0.005, nagpur: 0.005, thane: 0.01, kolhapur: 0.005 },
    ivrAvailable: false, sttModelAccuracy: 0.91, contentTranslatedPercent: 38,
  },
];

export const voiceSessions: VoiceSession[] = [
  { id: 'VS-55021', channel: 'ivr-call', languageCode: 'mr', districtId: 'kolhapur', intent: 'Check if my trade is in demand',
    transcript: 'माझा फिटर ट्रेड कोल्हापूरमध्ये चालतो का?', resolvedBy: 'bot', durationSeconds: 96, satisfactionScore: 5, occurredOn: '2026-09-09' },
  { id: 'VS-55022', channel: 'whatsapp-voice', languageCode: 'mr', districtId: 'nashik', intent: 'RPL eligibility for informal experience',
    transcript: 'मी नऊ वर्षे गॅरेजमध्ये काम केले आहे, मला प्रमाणपत्र मिळेल का?', resolvedBy: 'bot', durationSeconds: 142, satisfactionScore: 4, occurredOn: '2026-09-09' },
  { id: 'VS-55023', channel: 'ivr-call', languageCode: 'hi', districtId: 'nagpur', intent: 'Stipend not credited',
    transcript: 'मेरा वजीफा दो महीने से नहीं आया है', resolvedBy: 'escalated-to-officer', durationSeconds: 214, satisfactionScore: 3, occurredOn: '2026-09-08' },
  { id: 'VS-55024', channel: 'portal-mic', languageCode: 'mr', districtId: 'pune', intent: 'Which EV course should I join',
    transcript: 'मला ईव्ही बॅटरीचा कोर्स करायचा आहे, कुठे मिळेल?', resolvedBy: 'bot', durationSeconds: 78, satisfactionScore: 5, occurredOn: '2026-09-08' },
  { id: 'VS-55025', channel: 'ivr-call', languageCode: 'ur', districtId: 'csn', intent: 'Work-trial stipend query',
    transcript: 'ٹرائل کے دوران روزانہ کتنا وظیفہ ملے گا؟', resolvedBy: 'bot', durationSeconds: 118, satisfactionScore: 4, occurredOn: '2026-09-07' },
  { id: 'VS-55026', channel: 'whatsapp-voice', languageCode: 'mr', districtId: 'csn', intent: 'Placement claimed but no salary received',
    transcript: 'केंद्राने नोकरी लागली असे सांगितले पण मला पगार मिळाला नाही', resolvedBy: 'escalated-to-officer', durationSeconds: 268, satisfactionScore: 2, occurredOn: '2026-09-07' },
  { id: 'VS-55027', channel: 'ivr-call', languageCode: 'hi', districtId: 'thane', intent: 'Course fee and duration',
    transcript: 'सोलर का कोर्स कितने महीने का है और फीस कितनी है?', resolvedBy: 'bot', durationSeconds: 84, satisfactionScore: 5, occurredOn: '2026-09-06' },
  { id: 'VS-55028', channel: 'portal-mic', languageCode: 'mr', districtId: 'kolhapur', intent: 'Trade shift from handloom',
    transcript: 'हातमाग बंद पडतोय, दुसरा कोणता कोर्स करू?', resolvedBy: 'bot', durationSeconds: 156, satisfactionScore: 4, occurredOn: '2026-09-05' },
];

export function voiceStats() {
  const total = voiceSessions.length;
  const bot = voiceSessions.filter(v => v.resolvedBy === 'bot').length;
  const scored = voiceSessions.filter(v => v.satisfactionScore !== null);
  return {
    total,
    botResolved: bot,
    botResolutionRate: Math.round((bot / total) * 100),
    escalated: total - bot,
    avgSatisfaction: scored.length
      ? (scored.reduce((a, v) => a + (v.satisfactionScore ?? 0), 0) / scored.length).toFixed(1)
      : '-',
    languagesUsed: new Set(voiceSessions.map(v => v.languageCode)).size,
  };
}

/* ------------------------------------------------------------------ */
/*  Control Tower alert queue                                           */
/*                                                                      */
/*  One queue across all six pillars. Each alert declares the permission */
/*  required to act on it, so an officer sees everything but can only    */
/*  action what their role allows.                                       */
/* ------------------------------------------------------------------ */

export const controlTowerAlerts: ControlTowerAlert[] = [
  {
    id: 'ALT-001', severity: 'critical', pillar: 'Demand Intelligence', districtId: null,
    title: 'Source trust collapse: QuickHire Aggregator',
    detail: 'Payroll confirmation rate has fallen to 15%. 12,400 postings from this source now carry a trust weight below 0.25. Recommend blacklisting pending audit.',
    raisedOn: '2026-09-09', requiredPermission: 'signal.blacklist', status: 'open',
  },
  {
    id: 'ALT-002', severity: 'critical', pillar: 'Adaptive Syllabus', districtId: 'csn',
    title: 'Sensor practical logged with zero machine time',
    detail: 'SP-88208 (Vikram Sawant, CNC-03) carries an instructor score of 84 against 0 minutes of spindle time on MCH-CNC-044. Practical record cannot be certified.',
    raisedOn: '2026-08-27', requiredPermission: 'practical.audit', status: 'open',
  },
  {
    id: 'ALT-003', severity: 'high', pillar: 'Capacity Planner', districtId: 'pune',
    title: 'Ghost seats notified above hard limit',
    detail: 'Pune has notified 9,400 seats against a binding lab-shift ceiling. Seats above the hard limit have no bench to run on.',
    raisedOn: '2026-09-02', requiredPermission: 'seats.allocate', status: 'acknowledged',
  },
  {
    id: 'ALT-004', severity: 'critical', pillar: 'Control Tower & Audit', districtId: 'csn',
    title: 'Repeat ghost-placement pattern: Marathwada Logistics',
    detail: 'Two candidates from batch csn-ware-01 show placement claims with no EPFO contribution in 7 months. ₹48,000 subsidy at risk. Recommend freezing disbursal for this centre pending enquiry.',
    raisedOn: '2026-09-06', requiredPermission: 'audit.freeze', status: 'open',
  },
  {
    id: 'ALT-005', severity: 'high', pillar: 'Demand Intelligence', districtId: 'nashik',
    title: 'Uncovered skill with sustained demand: Green Hydrogen Electrolyser Maintenance',
    detail: 'Weighted demand of 380 seats/year with no course anywhere in the state. 11 corroborated signals over 5 months.',
    raisedOn: '2026-08-30', requiredPermission: 'skill.onboard', status: 'open',
  },
  {
    id: 'ALT-006', severity: 'high', pillar: 'Adaptive Syllabus', districtId: null,
    title: 'Experiment EXP-2026-014 has reached significance',
    detail: 'EFI variant shows a 29.5% lift in work-trial pass rate (p = 0.003). Awaiting promotion decision before the January 2027 intake.',
    raisedOn: '2026-08-30', requiredPermission: 'syllabus.promote', status: 'open',
  },
  {
    id: 'ALT-007', severity: 'medium', pillar: 'Capacity Planner', districtId: 'csn',
    title: 'Welding bays saturated while private TIG capacity sits idle',
    detail: 'MCH-WLD-108 is at 97% utilisation; MCH-WLD-109 at Aurangabad Auto Parts has 65 idle hours per week available at ₹220/hour.',
    raisedOn: '2026-09-01', requiredPermission: 'machine.broker', status: 'open',
  },
  {
    id: 'ALT-008', severity: 'high', pillar: 'Hiring Pipeline', districtId: 'thane',
    title: 'Pool below commitment threshold 9 weeks before batch start',
    detail: 'POOL-THA-IOT-01 has 22 of 35 required seats committed. Batch cannot be notified until commitments cover the seat plan.',
    raisedOn: '2026-09-05', requiredPermission: 'pipeline.lock', status: 'open',
  },
  {
    id: 'ALT-009', severity: 'medium', pillar: 'Pathways & RPL', districtId: 'nagpur',
    title: 'RPL assessment backlog beyond 14 days',
    detail: '1 application scheduled but not assessed within SLA. Candidate is a daily-wage worker; delay carries direct income cost.',
    raisedOn: '2026-09-08', requiredPermission: 'rpl.certify', status: 'open',
  },
  {
    id: 'ALT-010', severity: 'info', pillar: 'Control Tower & Audit', districtId: 'csn',
    title: 'Voice grievance escalated in Marathi',
    detail: 'VS-55026: candidate reports placement recorded without salary. Auto-linked to audit AUD-9103.',
    raisedOn: '2026-09-07', requiredPermission: 'audit.view', status: 'acknowledged',
  },
  {
    id: 'ALT-011', severity: 'medium', pillar: 'Demand Intelligence', districtId: 'kolhapur',
    title: 'Dying task still taught to 410 trainees',
    detail: 'DT-05 pit-loom shedding is down 33% YoY but remains 38% of TEX-02 contact hours.',
    raisedOn: '2026-08-25', requiredPermission: 'signal.verify', status: 'acknowledged',
  },
  {
    id: 'ALT-012', severity: 'high', pillar: 'Hiring Pipeline', districtId: 'pune',
    title: 'Subsidy tranche ready for release: POOL-PN-EV-01',
    detail: '3 candidates have cleared the work-trial gate and been confirmed on EPFO payroll. ₹84,000 releasable against verified outcomes.',
    raisedOn: '2026-09-09', requiredPermission: 'subsidy.release', status: 'open',
  },
];

export const SEVERITY_TONE: Record<ControlTowerAlert['severity'], string> = {
  critical: 'var(--signal-declining)',
  high: 'var(--signal-warn)',
  medium: 'var(--gov-navy-light)',
  info: 'var(--signal-stable)',
};
