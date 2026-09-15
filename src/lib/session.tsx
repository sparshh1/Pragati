'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CitizenRole, GovRole, Permission, GOV_ROLES, roleHas } from './rbac';

/* ------------------------------------------------------------------ */
/*  Citizen session - one portal, two roles, two different dashboards  */
/* ------------------------------------------------------------------ */

export interface CitizenAccount {
  /** PID - प्रgati ID issued at registration */
  ksid: string;
  role: CitizenRole;
  name: string;
  mobile: string;
  email: string;
  districtId: string;
  registeredOn: string;
  /** Student-only */
  qualification?: string;
  currentNsqfLevel?: number;
  enrolledCourseId?: string | null;
  yearsInformalWork?: number;
  /** Business-only */
  udyamNumber?: string;
  entityType?: 'MSME' | 'Enterprise';
  sector?: string;
  employeeCount?: number;
  gstin?: string;
  /** Preferences */
  language: string;
}

const CITIZEN_KEY = 'ks.citizen.session.v1';
const CITIZEN_DB_KEY = 'ks.citizen.accounts.v1';

interface CitizenCtx {
  account: CitizenAccount | null;
  ready: boolean;
  register: (a: Omit<CitizenAccount, 'ksid' | 'registeredOn'>) => CitizenAccount;
  login: (identifier: string) => CitizenAccount | null;
  logout: () => void;
  update: (patch: Partial<CitizenAccount>) => void;
}

const CitizenContext = createContext<CitizenCtx | null>(null);

function readAccounts(): CitizenAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CITIZEN_DB_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeAccounts(list: CitizenAccount[]) {
  window.localStorage.setItem(CITIZEN_DB_KEY, JSON.stringify(list));
}

function issueKsid(role: CitizenRole): string {
  const prefix = role === 'student' ? 'MH-CD' : 'MH-EM';
  const n = Math.floor(100000 + Math.random() * 899999);
  return `${prefix}-${new Date().getFullYear()}-${n}`;
}

export function CitizenProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<CitizenAccount | null>(null);
  const [ready, setReady] = useState(false);

  // Browser storage is unavailable during SSR, so the session can only be restored
  // after mount. `ready` gates every consumer until that has happened.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CITIZEN_KEY);
      if (raw) setAccount(JSON.parse(raw));
    } catch { /* first visit */ }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const persist = useCallback((a: CitizenAccount | null) => {
    setAccount(a);
    if (a) window.localStorage.setItem(CITIZEN_KEY, JSON.stringify(a));
    else window.localStorage.removeItem(CITIZEN_KEY);
  }, []);

  const register: CitizenCtx['register'] = useCallback((input) => {
    const full: CitizenAccount = {
      ...input,
      ksid: issueKsid(input.role),
      registeredOn: new Date().toISOString(),
    };
    const all = readAccounts().filter(a => a.mobile !== full.mobile);
    writeAccounts([...all, full]);
    persist(full);
    return full;
  }, [persist]);

  const login: CitizenCtx['login'] = useCallback((identifier) => {
    const key = identifier.trim().toLowerCase();
    const found = readAccounts().find(
      a => a.mobile === key || a.email.toLowerCase() === key || a.ksid.toLowerCase() === key,
    );
    if (found) persist(found);
    return found ?? null;
  }, [persist]);

  const logout = useCallback(() => persist(null), [persist]);

  const update: CitizenCtx['update'] = useCallback((patch) => {
    setAccount(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      window.localStorage.setItem(CITIZEN_KEY, JSON.stringify(next));
      writeAccounts(readAccounts().map(a => (a.ksid === next.ksid ? next : a)));
      return next;
    });
  }, []);

  return (
    <CitizenContext.Provider value={{ account, ready, register, login, logout, update }}>
      {children}
    </CitizenContext.Provider>
  );
}

export function useCitizen(): CitizenCtx {
  const ctx = useContext(CitizenContext);
  if (!ctx) throw new Error('useCitizen must be used inside <CitizenProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Government session - separate portal, separate store, RBAC-gated    */
/* ------------------------------------------------------------------ */

export interface GovOfficer {
  employeeId: string;
  name: string;
  role: GovRole;
  /** null = state-wide scope */
  districtId: string | null;
  centreId: string | null;
  signedInAt: string;
}

const GOV_KEY = 'ks.gov.session.v1';

interface GovCtx {
  officer: GovOfficer | null;
  ready: boolean;
  signIn: (o: Omit<GovOfficer, 'signedInAt'>) => void;
  signOut: () => void;
  can: (p: Permission) => boolean;
  scopeLabel: string;
}

const GovContext = createContext<GovCtx | null>(null);

export function GovProvider({ children }: { children: ReactNode }) {
  const [officer, setOfficer] = useState<GovOfficer | null>(null);
  const [ready, setReady] = useState(false);

  // As above - sessionStorage is only readable after mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(GOV_KEY);
      if (raw) setOfficer(JSON.parse(raw));
    } catch { /* no active session */ }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const signIn: GovCtx['signIn'] = useCallback((o) => {
    const full: GovOfficer = { ...o, signedInAt: new Date().toISOString() };
    setOfficer(full);
    // Government sessions are deliberately non-persistent across browser restarts.
    window.sessionStorage.setItem(GOV_KEY, JSON.stringify(full));
  }, []);

  const signOut = useCallback(() => {
    setOfficer(null);
    window.sessionStorage.removeItem(GOV_KEY);
  }, []);

  const can = useCallback(
    (p: Permission) => (officer ? roleHas(officer.role, p) : false),
    [officer],
  );

  const scopeLabel = officer
    ? GOV_ROLES[officer.role].scope === 'state'
      ? 'State-wide (Maharashtra)'
      : GOV_ROLES[officer.role].scope === 'district'
        ? `District: ${officer.districtId ?? '-'}`
        : `Centre: ${officer.centreId ?? '-'}`
    : '';

  return (
    <GovContext.Provider value={{ officer, ready, signIn, signOut, can, scopeLabel }}>
      {children}
    </GovContext.Provider>
  );
}

export function useGov(): GovCtx {
  const ctx = useContext(GovContext);
  if (!ctx) throw new Error('useGov must be used inside <GovProvider>');
  return ctx;
}
