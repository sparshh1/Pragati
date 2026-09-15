'use client';

/**
 * Browser speech: recognition (STT) and synthesis (TTS).
 *
 * Both come from the Web Speech API, which is available in Chromium browsers
 * and Safari but not Firefox. Everything here degrades to "unsupported" rather
 * than throwing, because a candidate on an unsupported browser must still be
 * able to type the question and read the answer.
 */

/* ---- Minimal typings. The DOM lib does not ship these. ---- */
interface SpeechRecognitionAlternative { transcript: string; confidence: number }
interface SpeechRecognitionResult {
  readonly length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEventLike extends Event { error: string }

export interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function sttSupported(): boolean {
  return recognitionCtor() !== null;
}

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** BCP-47 tags. Indian variants first — they carry the right accent models. */
export const SPEECH_LANG: Record<string, string> = {
  mr: 'mr-IN',
  hi: 'hi-IN',
  en: 'en-IN',
  ur: 'ur-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
};

/* ------------------------------------------------------------------ */
/*  Speech to text                                                     */
/* ------------------------------------------------------------------ */

export interface ListenHandlers {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (code: string) => void;
  onEnd?: () => void;
}

/**
 * Starts listening and returns a stop function. Interim results stream in so
 * the user can see the machine is hearing them — silence for three seconds
 * during a slow sentence is otherwise indistinguishable from a broken mic.
 */
export function listen(langCode: string, h: ListenHandlers): () => void {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    h.onError?.('unsupported');
    return () => {};
  }

  const rec = new Ctor();
  rec.lang = SPEECH_LANG[langCode] ?? 'en-IN';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  let settled = false;

  rec.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (interim) h.onInterim?.(interim);
    if (final.trim()) {
      settled = true;
      h.onFinal(final.trim());
    }
  };

  rec.onerror = (e) => h.onError?.(e.error);
  rec.onend = () => {
    // Ending with nothing final usually means the user said nothing audible.
    if (!settled) h.onError?.('no-speech');
    h.onEnd?.();
  };

  try {
    rec.start();
  } catch {
    h.onError?.('already-started');
  }

  return () => { try { rec.abort(); } catch { /* already stopped */ } };
}

/* ------------------------------------------------------------------ */
/*  Text to speech                                                     */
/* ------------------------------------------------------------------ */

/**
 * Picks the closest installed voice. Indian-language voices are not present on
 * every device, so this falls back down the chain — exact tag, then the base
 * language, then whatever the browser defaults to — rather than going silent.
 */
function pickVoice(tag: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const base = tag.split('-')[0];
  return (
    voices.find(v => v.lang.toLowerCase() === tag.toLowerCase()) ??
    voices.find(v => v.lang.toLowerCase().startsWith(base)) ??
    null
  );
}

export function speak(
  text: string,
  langCode: string,
  opts: { onStart?: () => void; onEnd?: () => void; rate?: number } = {},
): void {
  if (!ttsSupported()) { opts.onEnd?.(); return; }

  window.speechSynthesis.cancel();

  const tag = SPEECH_LANG[langCode] ?? 'en-IN';
  const u = new SpeechSynthesisUtterance(text);
  u.lang = tag;
  // Government information read aloud to a first-time listener; slightly under
  // natural pace is easier to follow than the default.
  u.rate = opts.rate ?? 0.92;
  u.pitch = 1;

  const v = pickVoice(tag);
  if (v) u.voice = v;

  u.onstart = () => opts.onStart?.();
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();

  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

/**
 * Voice lists load asynchronously in Chrome. Resolves once they are available
 * so the first utterance is not spoken in the wrong accent.
 */
export function primeVoices(): Promise<void> {
  return new Promise(resolve => {
    if (!ttsSupported()) return resolve();
    if (window.speechSynthesis.getVoices().length) return resolve();
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    setTimeout(resolve, 1200);
  });
}
