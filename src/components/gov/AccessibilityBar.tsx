'use client';

import { useEffect, useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ur', label: 'اردو' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
];

/**
 * The thin utility strip that sits above the masthead on every Government of
 * India portal: Government of India wordmark, skip links, text resizer,
 * high-contrast toggle and language switcher.
 */
export function AccessibilityBar({ variant = 'citizen' }: { variant?: 'citizen' | 'gov' }) {
  const [scale, setScale] = useState<'sm' | 'md' | 'lg'>('md');
  const [contrast, setContrast] = useState<'normal' | 'high'>('normal');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    document.documentElement.dataset.fontscale = scale;
  }, [scale]);

  useEffect(() => {
    document.documentElement.dataset.contrast = contrast;
  }, [contrast]);

  const barTone =
    variant === 'gov'
      ? 'bg-[var(--gov-navy-dark)] text-slate-300 border-b border-white/10'
      : 'bg-[var(--surface-alt)] text-[var(--ink-secondary)] border-b border-[var(--border)]';

  const btn =
    variant === 'gov'
      ? 'px-1.5 hover:text-white focus-ring'
      : 'px-1.5 hover:text-[var(--gov-navy)] focus-ring';

  return (
    <div className={`${barTone} text-[11.5px] no-print`}>
      <div className="mx-auto max-w-[1400px] px-4 h-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-semibold whitespace-nowrap">
            भारत सरकार <span className="opacity-50">|</span> Government of India
          </span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:inline whitespace-nowrap">
            महाराष्ट्र शासन <span className="opacity-50">|</span> Government of Maharashtra
          </span>
        </div>

        <div className="flex items-center gap-1">
          <a href="#main-content" className="hidden md:inline px-1.5 hover:underline focus-ring">
            Skip to Main Content
          </a>
          <span className="hidden md:inline opacity-30">|</span>

          <span className="hidden sm:flex items-center" role="group" aria-label="Text size">
            <button onClick={() => setScale('sm')} className={btn} aria-label="Decrease text size"
              aria-pressed={scale === 'sm'}>A-</button>
            <button onClick={() => setScale('md')} className={`${btn} font-semibold`} aria-label="Normal text size"
              aria-pressed={scale === 'md'}>A</button>
            <button onClick={() => setScale('lg')} className={btn} aria-label="Increase text size"
              aria-pressed={scale === 'lg'}>A+</button>
          </span>

          <span className="hidden sm:inline opacity-30">|</span>

          <button
            onClick={() => setContrast(c => (c === 'high' ? 'normal' : 'high'))}
            className={`${btn} inline-flex items-center gap-1`}
            aria-pressed={contrast === 'high'}
            aria-label="Toggle high contrast"
          >
            <span
              className="inline-block w-3 h-3 rounded-full border border-current"
              style={{ background: 'linear-gradient(to right, currentColor 50%, transparent 50%)' }}
            />
            <span className="hidden lg:inline">Contrast</span>
          </button>

          <span className="opacity-30">|</span>

          <label className="sr-only" htmlFor="lang-select">Select language</label>
          <select
            id="lang-select"
            value={lang}
            onChange={e => setLang(e.target.value)}
            className={`bg-transparent text-[11.5px] focus-ring cursor-pointer ${
              variant === 'gov' ? 'text-slate-300' : 'text-[var(--ink-secondary)]'
            }`}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="text-[var(--ink)] bg-white">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
