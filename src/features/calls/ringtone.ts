"use client";

// Call sounds.
// - incoming: /sounds/incoming-call.mp3 on loop; if the browser refuses to
//   play it, a synthesised marimba-style melody is used instead
// - outgoing: the standard telephone ringback tone (400+450 Hz, ring-ring),
//   synthesised with Web Audio
const INCOMING_RINGTONE_URL = "/sounds/incoming-call.mp3";
let ringtoneElement: HTMLAudioElement | null = null;

function ringtone(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!ringtoneElement) {
    ringtoneElement = new Audio(INCOMING_RINGTONE_URL);
    ringtoneElement.loop = true;
    ringtoneElement.preload = "auto";
  }
  return ringtoneElement;
}

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  return context;
}

// Browsers only allow sound after the user has interacted with the page.
// Resume the shared context on the first interaction so a call that arrives
// later can ring.
if (typeof window !== "undefined") {
  const unlock = () => {
    void audioContext()?.resume().catch(() => undefined);
    // iOS Safari only lets an <audio> element play later if it was started
    // once during a user gesture: play it silently and stop straight away.
    const audio = ringtone();
    if (audio && audio.paused) {
      audio.muted = true;
      void audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }).catch(() => { audio.muted = false; });
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

function marimbaNote(ctx: AudioContext, out: AudioNode, frequency: number, at: number) {
  // A woody mallet sound: fundamental plus a quieter 4th harmonic, fast attack, quick decay.
  for (const [ratio, level, decay] of [[1, 0.5, 0.9], [4, 0.12, 0.25]] as const) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(level, at + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
}

// Notes in Hz (G5, D6, B5, G6, D6, B5 ...) with start offsets in seconds.
const INCOMING_PATTERN: Array<[number, number]> = [
  [783.99, 0], [1174.66, 0.14], [987.77, 0.28], [1567.98, 0.42],
  [1174.66, 0.7], [987.77, 0.84], [1318.51, 0.98], [987.77, 1.12],
];
const INCOMING_LOOP_SECONDS = 2.4;

function ringbackBurst(ctx: AudioContext, out: AudioNode, at: number, duration: number) {
  for (const frequency of [400, 450]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.08, at + 0.02);
    gain.gain.setValueAtTime(0.08, at + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, at + duration);
    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + duration);
  }
}
const RINGBACK_LOOP_SECONDS = 3;

/** Starts a looping call sound and returns a function that stops it. */
export function startCallSound(kind: "incoming" | "outgoing"): () => void {
  if (kind === "outgoing") return startSynthSound("outgoing");

  const audio = ringtone();
  if (!audio) return startSynthSound("incoming");
  let stopped = false;
  let stopFallback: (() => void) | null = null;
  audio.currentTime = 0;
  audio.muted = false;
  audio.volume = 1;
  void audio.play().catch(() => {
    if (!stopped) stopFallback = startSynthSound("incoming");
  });
  if ("vibrate" in navigator) {
    navigator.vibrate?.([400, 200, 400, 1400, 400, 200, 400, 1400, 400, 200, 400]);
  }
  return () => {
    stopped = true;
    audio.pause();
    audio.currentTime = 0;
    stopFallback?.();
    if ("vibrate" in navigator) navigator.vibrate?.(0);
  };
}

function startSynthSound(kind: "incoming" | "outgoing"): () => void {
  const ctx = audioContext();
  if (!ctx) return () => undefined;
  void ctx.resume().catch(() => undefined);

  const master = ctx.createGain();
  master.gain.value = kind === "incoming" ? 0.9 : 1;
  master.connect(ctx.destination);

  const loopSeconds = kind === "incoming" ? INCOMING_LOOP_SECONDS : RINGBACK_LOOP_SECONDS;
  let nextStart = ctx.currentTime + 0.05;
  const schedule = () => {
    // Keep about one loop scheduled ahead so timer jitter never causes gaps.
    while (nextStart < ctx.currentTime + loopSeconds) {
      if (kind === "incoming") {
        for (const [frequency, offset] of INCOMING_PATTERN) marimbaNote(ctx, master, frequency, nextStart + offset);
      } else {
        ringbackBurst(ctx, master, nextStart, 0.4);
        ringbackBurst(ctx, master, nextStart + 0.6, 0.4);
      }
      nextStart += loopSeconds;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, 500);

  if (kind === "incoming" && "vibrate" in navigator) {
    navigator.vibrate?.([400, 200, 400, 1400, 400, 200, 400, 1400, 400, 200, 400]);
  }

  return () => {
    window.clearInterval(timer);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    window.setTimeout(() => master.disconnect(), 100);
    if ("vibrate" in navigator) navigator.vibrate?.(0);
  };
}
