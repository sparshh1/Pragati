/**
 * Role-based access control for the Government Portal.
 *
 * The citizen portal (students / businesses) is segregated by ROLE only -
 * each role sees a different dashboard and feature list.
 * The government portal is segregated by ROLE *and* by PERMISSION *and* by
 * DATA SCOPE (state-wide vs a single district vs a single training centre).
 */

export type CitizenRole = 'student' | 'business';

export type GovRole =
  | 'state-admin'
  | 'district-officer'
  | 'centre-head'
  | 'audit-officer'
  | 'scheme-manager';

export type Permission =
  // Pillar 1 - Demand Intelligence & Signal Verification
  | 'signal.view'
  | 'signal.verify'
  | 'signal.blacklist'
  | 'skill.onboard'
  // Pillar 2 - Employer-Locked Work & Hiring Pipeline
  | 'pipeline.view'
  | 'pipeline.lock'
  | 'subsidy.release'
  // Pillar 3 - Adaptive Syllabus & Evidence-Based Evaluation
  | 'syllabus.view'
  | 'syllabus.experiment'
  | 'syllabus.promote'
  | 'practical.audit'
  // Pillar 4 - Constraint-Aware District Capacity Planner
  | 'capacity.view'
  | 'seats.allocate'
  | 'machine.broker'
  // Pillar 5 - Precision Career Pathways & RPL
  | 'rpl.view'
  | 'rpl.certify'
  | 'pathway.publish'
  // Pillar 6 - Multilingual Control Tower & Audit
  | 'audit.view'
  | 'audit.epfo'
  | 'audit.freeze'
  // Administration
  | 'access.manage'
  | 'district.all';

export interface GovRoleDefinition {
  id: GovRole;
  title: string;
  titleHi: string;
  designation: string;
  scope: 'state' | 'district' | 'centre';
  permissions: Permission[];
  description: string;
}

export const ALL_PERMISSIONS: { id: Permission; label: string; pillar: string }[] = [
  { id: 'signal.view', label: 'View demand signals', pillar: 'Demand Intelligence' },
  { id: 'signal.verify', label: 'Verify / re-weight signals', pillar: 'Demand Intelligence' },
  { id: 'signal.blacklist', label: 'Blacklist a signal source', pillar: 'Demand Intelligence' },
  { id: 'skill.onboard', label: 'Onboard an uncovered skill', pillar: 'Demand Intelligence' },
  { id: 'pipeline.view', label: 'View hiring pipeline', pillar: 'Hiring Pipeline' },
  { id: 'pipeline.lock', label: 'Lock employer seats', pillar: 'Hiring Pipeline' },
  { id: 'subsidy.release', label: 'Release subsidy tranche', pillar: 'Hiring Pipeline' },
  { id: 'syllabus.view', label: 'View syllabus versions', pillar: 'Adaptive Syllabus' },
  { id: 'syllabus.experiment', label: 'Run A/B syllabus experiment', pillar: 'Adaptive Syllabus' },
  { id: 'syllabus.promote', label: 'Promote winning variant', pillar: 'Adaptive Syllabus' },
  { id: 'practical.audit', label: 'Audit sensor practicals', pillar: 'Adaptive Syllabus' },
  { id: 'capacity.view', label: 'View district capacity', pillar: 'Capacity Planner' },
  { id: 'seats.allocate', label: 'Allocate / freeze seats', pillar: 'Capacity Planner' },
  { id: 'machine.broker', label: 'Broker idle machine time', pillar: 'Capacity Planner' },
  { id: 'rpl.view', label: 'View RPL applications', pillar: 'Pathways & RPL' },
  { id: 'rpl.certify', label: 'Certify RPL level', pillar: 'Pathways & RPL' },
  { id: 'pathway.publish', label: 'Publish trade-shift track', pillar: 'Pathways & RPL' },
  { id: 'audit.view', label: 'View audit register', pillar: 'Control Tower & Audit' },
  { id: 'audit.epfo', label: 'Run EPFO payroll audit', pillar: 'Control Tower & Audit' },
  { id: 'audit.freeze', label: 'Freeze disbursal on fraud', pillar: 'Control Tower & Audit' },
  { id: 'access.manage', label: 'Manage users & roles', pillar: 'Administration' },
  { id: 'district.all', label: 'State-wide data access', pillar: 'Administration' },
];

export const GOV_ROLES: Record<GovRole, GovRoleDefinition> = {
  'state-admin': {
    id: 'state-admin',
    title: 'State Mission Director',
    titleHi: 'राज्य मिशन निदेशक',
    designation: 'MSDE: Maharashtra State Skill Development Society',
    scope: 'state',
    description:
      'Full state-wide authority. Approves seat matrices, promotes syllabus variants, releases subsidy tranches and manages portal access.',
    permissions: [
      'signal.view', 'signal.verify', 'signal.blacklist', 'skill.onboard',
      'pipeline.view', 'pipeline.lock', 'subsidy.release',
      'syllabus.view', 'syllabus.experiment', 'syllabus.promote', 'practical.audit',
      'capacity.view', 'seats.allocate', 'machine.broker',
      'rpl.view', 'rpl.certify', 'pathway.publish',
      'audit.view', 'audit.epfo', 'audit.freeze',
      'access.manage', 'district.all',
    ],
  },
  'district-officer': {
    id: 'district-officer',
    title: 'District Skill Development Officer',
    titleHi: 'जिला कौशल विकास अधिकारी',
    designation: 'DSDEO: District Skill Development & Entrepreneurship Office',
    scope: 'district',
    description:
      'Operates within one assigned district. Can verify signals, allocate seats and broker machine time for own district only. Cannot release subsidy or promote syllabus variants.',
    permissions: [
      'signal.view', 'signal.verify', 'skill.onboard',
      'pipeline.view', 'pipeline.lock',
      'syllabus.view', 'practical.audit',
      'capacity.view', 'seats.allocate', 'machine.broker',
      'rpl.view', 'rpl.certify',
      'audit.view',
    ],
  },
  'centre-head': {
    id: 'centre-head',
    title: 'ITI / Training Centre Principal',
    titleHi: 'आईटीआई प्राचार्य',
    designation: 'Directorate of Vocational Education & Training (DVET)',
    scope: 'centre',
    description:
      'Operates within one training centre. Runs syllabus experiments, uploads sensor-verified practicals and offers idle machine time. No financial or access authority.',
    permissions: [
      'signal.view',
      'pipeline.view',
      'syllabus.view', 'syllabus.experiment', 'practical.audit',
      'capacity.view', 'machine.broker',
      'rpl.view',
    ],
  },
  'audit-officer': {
    id: 'audit-officer',
    title: 'Internal Audit Officer',
    titleHi: 'आंतरिक लेखा परीक्षा अधिकारी',
    designation: 'Finance Department: Internal Audit Wing',
    scope: 'state',
    description:
      'Read-only across the state, plus exclusive authority to run EPFO payroll audits and freeze disbursal where placement fraud is detected. Cannot allocate seats.',
    permissions: [
      'signal.view', 'pipeline.view', 'syllabus.view', 'practical.audit',
      'capacity.view', 'rpl.view',
      'audit.view', 'audit.epfo', 'audit.freeze',
      'district.all',
    ],
  },
  'scheme-manager': {
    id: 'scheme-manager',
    title: 'Scheme Convergence Manager',
    titleHi: 'योजना अभिसरण प्रबंधक',
    designation: 'PMKVY 4.0 / SANKALP / NAPS Convergence Cell',
    scope: 'state',
    description:
      'Maps demand to the right central scheme and releases subsidy tranches against verified placement outcomes. No seat or syllabus authority.',
    permissions: [
      'signal.view', 'pipeline.view', 'subsidy.release',
      'syllabus.view', 'capacity.view',
      'rpl.view', 'pathway.publish',
      'audit.view', 'district.all',
    ],
  },
};

export function roleHas(role: GovRole, permission: Permission): boolean {
  return GOV_ROLES[role].permissions.includes(permission);
}

/** Human-readable explanation shown when an action is blocked. */
export function denialReason(role: GovRole, permission: Permission): string {
  const perm = ALL_PERMISSIONS.find(p => p.id === permission);
  return `${GOV_ROLES[role].title} does not hold the “${perm?.label ?? permission}” permission (${permission}).`;
}
