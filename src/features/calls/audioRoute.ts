"use client";

// Choosing between the phone's earpiece and loudspeaker from a web page.
// Browsers expose this only partly, so this is best effort:
// - Safari (iOS 17+): the Audio Session API. "play-and-record" is the VoIP
//   session and plays through the earpiece; "auto" lets Safari use the
//   loudspeaker as it does by default during calls.
// - Browsers that list the earpiece as an audio output device: pick it with
//   HTMLMediaElement.setSinkId().
// Anywhere else (e.g. desktop) routing is unsupported and the caller falls
// back to muting/unmuting.

export type AudioRoute = "earpiece" | "speaker";

export type RoutingSupport =
  | { mode: "audio-session" }
  | { mode: "sink"; earpieceId: string; speakerId: string }
  | { mode: "none" };

type AudioSession = { type: string };
type MediaElementWithSink = HTMLMediaElement & { setSinkId?: (id: string) => Promise<void> };

function audioSession(): AudioSession | null {
  if (typeof navigator === "undefined") return null;
  return (navigator as Navigator & { audioSession?: AudioSession }).audioSession ?? null;
}

/** Call after getUserMedia has been granted, so device labels are available. */
export async function detectRouting(): Promise<RoutingSupport> {
  if (audioSession()) return { mode: "audio-session" };

  const canSetSink = typeof HTMLMediaElement !== "undefined"
    && typeof (HTMLMediaElement.prototype as MediaElementWithSink).setSinkId === "function";
  if (!canSetSink || !navigator.mediaDevices?.enumerateDevices) return { mode: "none" };

  try {
    const outputs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audiooutput");
    const earpiece = outputs.find((d) => /earpiece|receiver|handset/i.test(d.label));
    if (!earpiece) return { mode: "none" };
    const speaker = outputs.find((d) => /speaker/i.test(d.label) && d.deviceId !== earpiece.deviceId);
    return { mode: "sink", earpieceId: earpiece.deviceId, speakerId: speaker?.deviceId ?? "" };
  } catch {
    return { mode: "none" };
  }
}

export async function applyRoute(support: RoutingSupport, route: AudioRoute, audio: HTMLAudioElement | null) {
  try {
    if (support.mode === "audio-session") {
      const session = audioSession();
      if (session) session.type = route === "earpiece" ? "play-and-record" : "auto";
    } else if (support.mode === "sink" && audio) {
      await (audio as MediaElementWithSink).setSinkId?.(route === "earpiece" ? support.earpieceId : support.speakerId);
    }
  } catch {
    // The browser refused the change; audio keeps playing on the current output.
  }
}

/** Restore the browser's default audio behaviour after a call. */
export function resetRoute() {
  const session = audioSession();
  if (session) {
    try { session.type = "auto"; } catch { /* ignore */ }
  }
}
