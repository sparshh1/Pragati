# प्रgati — प्रgati

**Skill Bridge Portal, Department of Skill, Employment, Entrepreneurship & Innovation, Government of Maharashtra**

Smart India Hackathon 2026 · Problem Statement 26134

A working demonstration of a `.gov.in`-style skill development portal built around one idea: close the
distance between what a district's employers are actually hiring for and what its training institutions
are actually teaching.

---

## Two portals, three audiences

| | Who | Entry | Segregation |
|---|---|---|---|
| **Citizen Portal** | Candidates / students **and** enterprises / MSMEs | `/` — one homepage, one registration form | The **role chosen at registration** decides the dashboard and the entire feature list. The two never overlap. |
| **Government Portal** | State Mission Directorate, DSDEOs, ITI principals, Internal Audit, Scheme Convergence Cell | `/gov` — separate restricted login | Role **and** permission **and** data scope (state / district / centre). |

Both portals share one typography and component system (IBM Plex Sans/Mono, the same cards, tables,
tricolour rules and emblem treatment) so the departmental portal reads as the same government family —
but it is visually distinct: dark navy chrome, a restricted-access banner, a visible data-scope chip, and
a permission-gated navigation where locked sections state exactly which permission is missing.

### Citizen role segregation

Registration (`/register`) is a four-step flow: pick a role → identity & contact → role-specific fields →
OTP. The role determines everything afterwards.

- **Candidate** (`/dashboard/student/*`) — 9 modules: Overview, **Recommended for you**, **My CV &
  Job-Fit Card**, Demand & Dying Tasks, Jobs & Work Trials, My Syllabus & Practicals, Lab & Machine
  Slots, Career Pathways & RPL, Voice Assist & Grievance.
- **Enterprise / MSME** (`/dashboard/business/*`) — 7 modules: Overview, Post Hiring Demand, Hiring Pools
  & Trials, Syllabus Endorsement, Idle Machine Exchange, Endorse Prior Learning, Payroll & Compliance.

A route guard sends an unregistered visitor to `/login`, and moves anyone who lands on the wrong role's
dashboard to their own.

### Government RBAC

Five roles, 22 permissions, three scopes — declared in `src/lib/rbac.ts` and enforced in every console.

| Role | Scope | Permissions |
|---|---|---|
| State Mission Director | State | 22 / 22 |
| District Skill Development Officer | One district | 13 / 22 |
| ITI / Training Centre Principal | One centre | 7 / 22 |
| Internal Audit Officer | State (read + audit) | 10 / 22 |
| Scheme Convergence Manager | State | 9 / 22 |

Enforcement is three-layered: navigation items lock with the required permission named; privileged
controls are replaced by a `<Gated>` explanation rather than hidden; and data is filtered by scope before
render — a district officer's Control Tower literally never loads another district's alerts.

The full role × permission matrix is browsable at `/gov/access`.

---

## The six operating pillars

Every screen in the portal is an expression of one of these. They are declared once in
`src/data/pillars.ts`, which also drives both navigation systems.

| # | Pillar | Mechanisms | Candidate route | Enterprise route | Departmental route |
|---|---|---|---|---|---|
| 1 | Demand Intelligence & Signal Verification | Trust-Weighted Quality Filter · Dying Task Watch | `/dashboard/student/demand` | `/dashboard/business/signals` | `/gov/signals`, `/gov/districts` |
| 2 | Employer-Locked Work & Hiring Pipeline | MSME Hiring Pools · Work-Trial Gate | `/dashboard/student/jobs` | `/dashboard/business/hiring` | `/gov/pipeline` |
| 3 | Adaptive Syllabus & Evidence-Based Evaluation | Live Syllabus A/B Testing · Sensor-Verified Practicals | `/dashboard/student/syllabus` | `/dashboard/business/syllabus` | `/gov/syllabus` |
| 4 | Constraint-Aware District Capacity Planner | Hard-Limit Seat Calculator · Idle Machine Sharing | `/dashboard/student/labs` | `/dashboard/business/machines` | `/gov/capacity` |
| 5 | Precision Career Pathways & RPL Engine | Recognition of Prior Learning · Trade-Shift Tracks (ICE→EV) | `/dashboard/student/pathways` | `/dashboard/business/rpl` | `/gov/rpl` |
| 6 | Multilingual Control Tower & Audit Engine | Multilingual Voice Access · EPFO Payroll Audits | `/dashboard/student/assist` | `/dashboard/business/compliance` | `/gov/audit`, `/gov/console` |

### What actually computes (not mocked UI)

- **Trust weighting** (`src/data/signals.ts`) — a source's weight is derived from its payroll-confirmation
  history, then reduced per integrity flag. 18 signals across 9 sources; the filter removes ~87% of raw
  vacancy claims. Employers see the weight computed live as they type a posting.
- **Hard-limit seat calculation** (`src/data/capacity.ts`) — trainer, lab-shift, hostel and budget ceilings
  computed independently; the minimum binds, and seats notified above it are reported as ghost classes.
  `/gov/capacity` exposes live what-if levers on all five inputs.
- **Work-trial gate** (`src/data/hiring.ts`) — a 5-criterion weighted scorecard with a pass mark of 70.
  Employers score candidates on sliders and see the gate recompute.
- **Sensor practicals** (`src/data/experiments.ts`) — telemetry per metric with tolerances; records where
  the instructor score diverges from the machine by >15 points, or where machine time is zero, are flagged
  and cannot be certified.
- **RPL estimator** (`/dashboard/student/pathways`) — experience × evidence strength → assessed NSQF level,
  bridge hours and credited hours against a 2,400-hour course.
- **Demand trend** (`src/data/compute/demandTrend.ts`) — linear regression over a 24-month posting series
  with YoY classification and 6-month projection.
- **Recommendation engine** (`src/data/recommend.ts`) — ranks every course a candidate could join on ten
  weighted factors, and ranks open hiring pools against their held skills and bridge-module reachability.

### Recommendations are explainable by construction

`recommendCourses()` returns a score *and the list of reasons that produced it*, each with the points it
contributed. The candidate sees the top three reasons on the card and can expand the full arithmetic —
every `+30` and `−8`. A ranking nobody can explain is a ranking nobody should trust, and a government
portal that steers a school-leaver into a two-year commitment owes them the reasoning.

Half the weight sits on two factors: whether vacancies for that trade are actually growing in the
candidate's district, and whether employers have signed a written seat commitment for it. That is the
policy, stated in the open rather than buried in a model.

### The Job-Fit Card (`/dashboard/student/cv`)

Module 8 of the architecture. A normal CV is self-declared and uncheckable; this one is assembled from
records the department already holds — course enrolment, machine telemetry from sensor-verified
practicals, employer work-trial scorecards with supervisor remarks, RPL certification, and EPFO payroll
history. The candidate writes only three optional free-text fields; everything else is pulled and carries
a verified mark. A card-strength meter shows what is still missing, and the page prints to PDF.

### Guided help

Three layers, because people get stuck in three different ways.

1. **Guided tours** (`src/lib/guide.tsx`, `src/components/guide/GuideOverlay.tsx`) — a spotlight
   walkthrough that runs once automatically on a first visit and can be reopened any time. Six steps for
   candidates, five for enterprises, four for departmental officers, each written for someone who has
   never used a government portal, with the Marathi line carried alongside rather than hidden behind a
   language switch. Arrow keys move between steps, Escape exits, the page behind is scroll-locked, and
   completion is remembered per browser.
2. **Per-page written guides** (`PageGuide`) — a collapsed strip under every page header answering "what
   is this page for" in one sentence, expanding to numbered steps and a "worth knowing" tip. Covers 19
   routes. Some people would rather read at their own pace than be walked through.
3. **The `Guide me` launcher** — persistent, bottom-right, on every signed-in screen. Offers whichever
   help the current route actually has: the walkthrough, the written guide, or the voice helpline. It
   pulses gently until the tour has been seen once.

All tour and guide copy lives in one file, `src/data/guides.ts`.

### Motion

Movement is functional, not decorative: staggered entrances show where content came from, the spotlight
draws the eye to the one control being explained, progress bars grow from zero, and figures count up so a
number that changed looks like it changed (`CountUp` passes through anything that is not a number — ₹
prefixes, `3/12`, `L4`). Everything is disabled outright under `prefers-reduced-motion`, which GIGW and
WCAG 2.3.3 both expect.

### Plain-language layer

`src/components/ui/Plain.tsx` carries a `HelpTip` component and a glossary covering the eight terms a
first-time user will not know — NSQF, RPL, work trial, EPFO, Job-Fit Card, trade-shift track,
sensor-verified practical, hiring pool — each with an everyday English explanation plus Marathi and
Hindi. The candidate overview opens with a ranked **"What should I do next?"** block written entirely in
plain language, before any administrative vocabulary appears.

---

## Course & syllabus data

`src/data/syllabus.ts` carries full module-level syllabi — code, title, contact hours, delivery type,
tools actually used on the bench, and assessable outcomes — hand-authored to the DGT/NSQF pattern for
eight anchor courses (Mechanic Motor Vehicle, Advanced EV Technician, Electrician, Industrial Automation,
Welder, Solar PV Installer, CAD Pattern Design, Drone Survey Operations). Every other notified course gets
a structurally valid generated syllabus derived from its duration and type, so **every course in the
catalogue opens to a syllabus**.

Modules carrying a `decayFlag` are cross-linked to the Dying Task Watch, which is where Pillars 1 and 3
meet: you can see a specific module, its hours, and the task inside it that is disappearing.

Browse at `/courses` — filter by district, type or skill; open any course for the full breakdown,
assessment weighting, live A/B experiments and the demand curve for its primary trade.

---

## Public pages

| Route | Purpose |
|---|---|
| `/` | Generic `.gov.in` homepage — accessibility bar, emblem masthead, primary nav, hero carousel, quick links, scrolling notice board, six-pillar explainer, district cards |
| `/courses` | Course catalogue + full syllabus detail |
| `/demand` | Open labour market dashboard — trends, gaps, sector composition, cross-district comparison, dying tasks |
| `/schemes` | PMKVY 4.0 / SANKALP / DGT-CTS / NAPS convergence |
| `/about` | Mission, six pillars, access model, implementing institutions, policies |
| `/help` | Multilingual helpline, FAQ, grievance procedure, district offices |
| `/register`, `/login` | Citizen registration and login |
| `/gov` | Departmental login (role selection with full permission preview) |

---

## API

Read-only JSON endpoints over the same engines.

```
GET  /api/demand?district=pune&skill=ev-battery-diagnostics
GET  /api/signals?district=thane&verdict=rejected
POST /api/signals          { sourceId, reportedVacancies, flags[] }   → trust weight + verdict
GET  /api/gap?district=csn&limit=20
GET  /api/capacity                                                     → all districts
GET  /api/capacity?district=csn                                        → one district + idle machines
POST /api/capacity         { districtId, labStations, ... }            → what-if seat calculation
GET  /api/audit?verdict=ghost-placement
```

---

## Running it

```bash
npm install
npm run dev
```

Demonstration credentials — the OTP / authenticator code is **`123456`** everywhere.

Register a fresh candidate or enterprise at `/register`, or sign in at `/gov` as any of the five
departmental roles to see how the same data looks under different permissions and scopes.

---

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Recharts ·
IBM Plex Sans / Mono. Sessions are client-side (`localStorage` for citizens, `sessionStorage` for
departmental users) — there is no backend database in this prototype.

Accessibility: WCAG 2.1 AA / GIGW-oriented — skip links, keyboard navigation, ARIA roles on tabs and
tables, a text resizer (A− A A+), a high-contrast mode, and a six-language switcher in the utility bar.

## Prototype notice

The mechanisms, computations and workflows are real and run on the data shown. The datasets are
representative of Maharashtra's six pilot districts but are **not** live government records, and no real
candidate, establishment or EPFO data is held.
