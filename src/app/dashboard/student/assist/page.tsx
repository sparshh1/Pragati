'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useCitizen } from '@/lib/session';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageGuide } from '@/components/guide/PageGuide';
import { Card, Stat, Note } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { languages, voiceSessions, voiceStats } from '@/data/audit';
import { districts } from '@/data/districts';
import { VOICE_INTENTS, matchIntent } from '@/data/voiceIntents';
import {
  listen, speak, stopSpeaking, sttSupported, ttsSupported, primeVoices,
} from '@/lib/speech';
import Link from 'next/link';

interface Msg {
  from: 'you' | 'assistant';
  text: string;
  action?: { label: string; href: string };
  understood?: boolean;
}

const LANG_LABEL: Record<string, string> = {
  mr: 'मराठी', hi: 'हिन्दी', en: 'English', ur: 'اردو',
};

const MIC_ERROR: Record<string, string> = {
  'not-allowed': 'Microphone blocked. Allow microphone access in your browser, then try again.',
  'no-speech': 'I did not hear anything. Tap the button and speak clearly.',
  'audio-capture': 'No microphone found. Plug one in, or type your question instead.',
  network: 'Speech needs an internet connection. Check your connection and try again.',
  unsupported: 'This browser cannot listen. Try Chrome, or type your question instead.',
  'already-started': 'Already listening.',
};

export default function AssistPage() {
  const { account } = useCitizen();

  const [lang, setLang] = useState(account?.language ?? 'mr');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [typed, setTyped] = useState('');
  const [micError, setMicError] = useState('');
  const [canSTT, setCanSTT] = useState(true);
  const [canTTS, setCanTTS] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const stopRef = useRef<(() => void) | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const stats = voiceStats();
  const langInfo = languages.find(l => l.code === lang)!;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCanSTT(sttSupported());
    setCanTTS(ttsSupported());
    primeVoices();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, interim]);

  // Leaving the page must not leave a voice talking into an empty room.
  useEffect(() => () => { stopSpeaking(); stopRef.current?.(); }, []);

  const answer = useCallback((question: string) => {
    const result = matchIntent(question, lang);
    setMessages(m => [
      ...m,
      {
        from: 'assistant',
        text: result.answer,
        action: result.intent?.action,
        understood: result.intent !== null,
      },
    ]);
    if (autoSpeak && ttsSupported()) {
      speak(result.answer, lang, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
    }
  }, [lang, autoSpeak]);

  const ask = useCallback((question: string) => {
    if (!question.trim()) return;
    setMessages(m => [...m, { from: 'you', text: question }]);
    setTimeout(() => answer(question), 350);
  }, [answer]);

  function startListening() {
    if (listening) { stopRef.current?.(); setListening(false); return; }
    stopSpeaking();
    setSpeaking(false);
    setMicError('');
    setInterim('');
    setListening(true);

    stopRef.current = listen(lang, {
      onInterim: setInterim,
      onFinal: (text) => { setInterim(''); ask(text); },
      onError: (code) => {
        setMicError(MIC_ERROR[code] ?? `Could not listen (${code}). Type your question instead.`);
        setInterim('');
      },
      onEnd: () => { setListening(false); setInterim(''); },
    });
  }

  function replay(text: string) {
    stopSpeaking();
    speak(text, lang, { onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false) });
  }

  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Ask by voice"
        description="Speak your question. No typing needed."
        breadcrumb={[{ label: 'Dashboard', href: '/dashboard/student' }, { label: 'Ask by voice' }]}
      />

      <PageGuide />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Languages" value={languages.filter(l => l.ivrAvailable).length}
          sub="You can speak any of these" accent="var(--accent-student)" />
        <Stat label="Answered without staff" value={`${stats.botResolutionRate}%`}
          sub={`${stats.escalated} sent to an officer`} tone="positive" accent="var(--accent-student)" />
        <Stat label="Understands your speech" value={`${Math.round(langInfo.sttModelAccuracy * 100)}%`}
          sub={`in ${langInfo.nativeName}`} tone="positive" accent="var(--accent-student)" />
        <Stat label="Free phone line" value="1800-233-0202" sub="7 am to 9 pm, every day"
          accent="var(--accent-student)" />
      </div>

      <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5">
        <div className="space-y-5">
          <Card title="Talk to the assistant" subtitle="Tap the microphone and speak">
            {/* ---- Language picker ---- */}
            <div className="mb-4 pb-4 border-b border-[var(--border)]">
              <span className="gov-label">I want to speak in</span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(LANG_LABEL).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => { stopSpeaking(); setSpeaking(false); setLang(code); }}
                    className={`text-[15px] font-semibold px-4 py-2.5 border rounded-sm transition-colors focus-ring ${
                      lang === code
                        ? 'bg-[var(--accent-student)] text-white border-[var(--accent-student)]'
                        : 'border-[var(--border-strong)] hover:bg-[var(--surface-alt)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ---- Conversation ---- */}
            <div className="border border-[var(--border)] rounded-sm bg-[var(--surface)] h-[300px] overflow-y-auto p-4">
              {messages.length === 0 && !interim && (
                <div className="h-full grid place-items-center text-center px-6">
                  <p className="text-[15px] text-[var(--ink-secondary)] leading-relaxed">
                    Tap the microphone below and ask your question out loud.
                  </p>
                </div>
              )}
              <ul className="space-y-3">
                {messages.map((m, i) => (
                  <li key={i} className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-sm px-4 py-3 ${
                      m.from === 'you'
                        ? 'bg-[var(--accent-student)] text-white'
                        : 'bg-white border border-[var(--border)]'
                    }`}>
                      <p className="text-[15px] leading-relaxed">{m.text}</p>

                      {m.from === 'assistant' && (
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2.5 border-t border-[var(--border)]">
                          {canTTS && (
                            <button
                              onClick={() => replay(m.text)}
                              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--gov-navy)] focus-ring"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M11 5L6 9H3v6h3l5 4zM16 9a4 4 0 010 6" />
                              </svg>
                              Hear it again
                            </button>
                          )}
                          {m.action && (
                            <Link href={m.action.href}
                              className="text-[13.5px] font-bold text-[var(--accent-student)] underline underline-offset-2 focus-ring">
                              {m.action.label} →
                            </Link>
                          )}
                          {m.understood === false && (
                            <Badge variant="warn">Not understood</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}

                {interim && (
                  <li className="flex justify-end">
                    <div className="max-w-[85%] rounded-sm px-4 py-3 bg-[var(--accent-student)]/50 text-white">
                      <p className="text-[15px] leading-relaxed italic">{interim}</p>
                    </div>
                  </li>
                )}
              </ul>
              <div ref={endRef} />
            </div>

            {/* ---- Mic ---- */}
            <div className="mt-4 flex flex-col items-center gap-3">
              <button
                onClick={startListening}
                disabled={!canSTT}
                aria-label={listening ? 'Stop listening' : 'Start listening'}
                className={`w-20 h-20 rounded-full grid place-items-center text-white shadow-lg transition-transform focus-ring disabled:opacity-40 disabled:cursor-not-allowed ${
                  listening ? 'ks-halo scale-105' : 'hover:scale-105'
                }`}
                style={{ background: listening ? 'var(--signal-declining)' : 'var(--accent-student)' }}
              >
                {listening ? (
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 15a3 3 0 003-3V6a3 3 0 10-6 0v6a3 3 0 003 3zM5 11a7 7 0 0014 0M12 18v3" />
                  </svg>
                )}
              </button>

              <p className="text-[15px] font-semibold text-[var(--ink)]">
                {listening ? 'Listening — speak now' : 'Tap to speak'}
              </p>

              {speaking && (
                <button onClick={() => { stopSpeaking(); setSpeaking(false); }}
                  className="text-[13.5px] font-semibold text-[var(--gov-navy)] underline underline-offset-2 focus-ring">
                  Stop the voice
                </button>
              )}

              {canTTS && (
                <label className="flex items-center gap-2 text-[14px] text-[var(--ink-secondary)]">
                  <input type="checkbox" checked={autoSpeak}
                    onChange={e => { setAutoSpeak(e.target.checked); if (!e.target.checked) stopSpeaking(); }}
                    className="w-4 h-4 accent-[var(--accent-student)]" />
                  Read answers out loud
                </label>
              )}

              {micError && (
                <p className="text-[14px] text-[var(--signal-declining)] text-center max-w-sm">{micError}</p>
              )}
              {!canSTT && (
                <p className="text-[14px] text-[var(--signal-warn)] text-center max-w-sm">
                  This browser cannot hear you. Use Chrome, or type below.
                </p>
              )}
            </div>

            {/* ---- Typing fallback ---- */}
            <form
              onSubmit={e => { e.preventDefault(); ask(typed); setTyped(''); }}
              className="mt-4 pt-4 border-t border-[var(--border)] flex gap-2"
            >
              <input
                className="gov-input flex-1"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                placeholder="Or type your question here"
                aria-label="Type your question"
              />
              <button type="submit" disabled={!typed.trim()}
                className="px-5 text-white font-bold text-[15px] rounded-sm focus-ring disabled:opacity-40"
                style={{ background: 'var(--gov-navy)' }}>
                Ask
              </button>
            </form>

            {/* ---- Suggestions ---- */}
            <div className="mt-4">
              <p className="text-[13px] font-bold uppercase tracking-wide text-[var(--ink-tertiary)] mb-2">
                Try asking
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {VOICE_INTENTS.map(intent => (
                  <button key={intent.id}
                    onClick={() => ask(intent.example[lang] ?? intent.example.en)}
                    className="text-left border border-[var(--border)] rounded-sm px-3.5 py-3 hover:border-[var(--accent-student)] hover:bg-[var(--accent-student-light)] transition-colors focus-ring">
                    <span className="block text-[14.5px] text-[var(--ink)] leading-snug">
                      {intent.example[lang] ?? intent.example.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="If you have no smartphone">
            <ol className="space-y-3">
              {[
                ['Give a missed call', '1800-233-0202. Called back within 60 seconds.'],
                ['Choose your language', '1 Marathi · 2 Hindi · 3 English · 4 Urdu.'],
                ['Speak your question', 'No menu tree. Full sentences.'],
                ['Get an SMS summary', 'The answer, in your language, with a reference number.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-6 h-6 shrink-0 grid place-items-center rounded-full text-[12px] font-bold text-white mt-0.5"
                    style={{ background: 'var(--accent-student)' }}>{i + 1}</span>
                  <span>
                    <span className="block text-[14.5px] font-bold text-[var(--ink)]">{t}</span>
                    <span className="block text-[13.5px] text-[var(--ink-secondary)] leading-snug mt-0.5">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Languages" subtitle="How well each one works">
            <div className="space-y-3.5">
              {languages.map(l => (
                <div key={l.code}>
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-[14px] font-semibold text-[var(--ink)]">
                      {l.nativeName}{' '}
                      <span className="text-[13px] font-normal text-[var(--ink-tertiary)]">{l.name}</span>
                    </span>
                    {l.ivrAvailable ? <Badge variant="rising">Voice</Badge> : <Badge variant="stable">Text only</Badge>}
                  </div>
                  <Progress value={l.contentTranslatedPercent}
                    color={l.contentTranslatedPercent === 100 ? 'var(--signal-rising)' : 'var(--signal-warn)'}
                    height={6} />
                </div>
              ))}
            </div>
          </Card>

          <Note tone="warn" title="Told you were placed but never paid?">
            Say so here. Your pay record is checked the same day and the centre&rsquo;s money is held. You
            prove nothing yourself.
          </Note>

          <Card title="Recent questions from your area">
            <ul className="space-y-2.5">
              {voiceSessions.slice(0, 4).map(v => (
                <li key={v.id} className="border border-[var(--border)] rounded-sm p-3">
                  <p className="text-[14px] font-semibold text-[var(--ink)]">{v.intent}</p>
                  <p className="text-[13px] text-[var(--ink-secondary)] leading-relaxed mt-1">
                    &ldquo;{v.transcript}&rdquo;
                  </p>
                  <p className="text-[12.5px] text-[var(--ink-tertiary)] mt-1.5">
                    {languages.find(l => l.code === v.languageCode)?.nativeName} ·{' '}
                    {districts.find(d => d.id === v.districtId)?.name} ·{' '}
                    {v.resolvedBy === 'bot' ? 'answered instantly' : 'sent to an officer'}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
