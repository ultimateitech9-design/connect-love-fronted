"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { io, type Socket } from "socket.io-client";
import { Maximize2, Mic, MicOff, Minimize2, Phone, PhoneOff, Repeat2, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { API_ORIGIN, SOCKET_ORIGIN, WEBRTC_ICE_SERVERS, fetchIceServers } from "@/config/runtime";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startCallSound } from "./ringtone";

type CallType = "audio" | "video";

export type CallParticipant = { id: string; name: string; photo?: string | null };

type ActiveCall = {
  id: string;
  conversationId: string;
  otherUser: CallParticipant;
  direction: "incoming" | "outgoing";
  status: "ringing" | "active";
  callType: CallType;
  connectedAt: number | null;
};

type IncomingCall = {
  callId: string;
  conversationId: string;
  caller: CallParticipant;
  callType: CallType;
};

type StartCallOptions = {
  conversationId: string;
  otherUser: CallParticipant;
  callType: CallType;
};

type CallContextValue = {
  /** Resolves with the server's error message when the call could not start. */
  startCall: (options: StartCallOptions) => Promise<{ error?: string }>;
  ready: boolean;
  inCall: boolean;
};

const CallContext = createContext<CallContextValue>({
  startCall: async () => ({ error: "Calls are not available on this page." }),
  ready: false,
  inCall: false,
});

export const useCall = () => useContext(CallContext);

// 720p at up to 30 fps is a good balance for mobile data; the browser lowers
// it automatically when bandwidth drops.
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30, max: 30 },
  facingMode: "user",
};
const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};
const VIDEO_MAX_BITRATE = 1_500_000;

function userIdFromToken(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return String(payload.sub || payload.userId || "");
  } catch {
    return "";
  }
}

function participantFrom(profile: any, fallbackId: string): CallParticipant {
  return {
    id: String(profile?.id || fallbackId),
    name: profile?.name || "ConnectLove user",
    photo: profile?.photo || null,
  };
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours ? `${hours}:${mmss}` : mmss;
}

// Chrome starts a new call at ~300 kbps and takes 15-20 s to reach HD. Hint a
// higher starting bitrate (it still backs off on slow networks). Other browsers
// ignore these parameters.
const START_BITRATE_KBPS = 1000;
const MIN_BITRATE_KBPS = 300;
function withVideoBitrateHints(description: RTCSessionDescriptionInit): RTCSessionDescriptionInit {
  if (!description.sdp) return description;
  const lines = description.sdp.split("\r\n");
  const out: string[] = [];
  let inVideo = false;
  const hint = `x-google-start-bitrate=${START_BITRATE_KBPS};x-google-min-bitrate=${MIN_BITRATE_KBPS}`;
  const videoCodecs = /^a=rtpmap:(\d+) (VP8|VP9|H264|AV1)\//;
  const hasFmtp = new Set(lines.filter((l) => l.startsWith("a=fmtp:")).map((l) => l.slice(7).split(" ")[0]));
  for (const line of lines) {
    if (line.startsWith("m=")) inVideo = line.startsWith("m=video");
    if (inVideo && line.startsWith("a=fmtp:") && !line.includes("x-google-start-bitrate")) {
      const pt = line.slice(7).split(" ")[0];
      const codecLine = lines.find((l) => l.startsWith(`a=rtpmap:${pt} `)) || "";
      out.push(videoCodecs.test(codecLine) ? `${line};${hint}` : line);
      continue;
    }
    out.push(line);
    const codec = inVideo ? line.match(videoCodecs) : null;
    if (codec && !hasFmtp.has(codec[1])) out.push(`a=fmtp:${codec[1]} ${hint}`);
  }
  return { type: description.type, sdp: out.join("\r\n") };
}

async function tuneSenders(peer: RTCPeerConnection) {
  for (const sender of peer.getSenders()) {
    if (sender.track?.kind !== "video") continue;
    try {
      const params = sender.getParameters();
      if (!params.encodings?.length) params.encodings = [{}];
      params.encodings[0].maxBitrate = VIDEO_MAX_BITRATE;
      params.encodings[0].maxFramerate = 30;
      params.degradationPreference = "balanced";
      await sender.setParameters(params);
    } catch {
      // Older browsers reject some parameters; defaults still work.
    }
  }
}

export function CallProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [swapped, setSwapped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const tokenRef = useRef("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const activeCallRef = useRef<ActiveCall | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const iceServersRef = useRef<RTCIceServer[]>(WEBRTC_ICE_SERVERS);
  const isSpeakerOnRef = useRef(true);
  const pendingStartRef = useRef<StartCallOptions | null>(null);
  const swappedRef = useRef(false);

  const setCall = useCallback((call: ActiveCall | null) => {
    activeCallRef.current = call;
    setActiveCall(call);
  }, []);

  // The server confirms a started call both as the emit acknowledgement and as
  // a "videoCallStarted" event; whichever arrives first opens the call screen.
  const markStarted = useCallback((call: any) => {
    const pending = pendingStartRef.current;
    if (!pending || !call?.id || activeCallRef.current) return;
    pendingStartRef.current = null;
    setCall({
      id: call.id,
      conversationId: pending.conversationId,
      otherUser: pending.otherUser,
      direction: "outgoing",
      status: "ringing",
      callType: pending.callType,
      connectedAt: null,
    });
  }, [setCall]);

  // --- Socket -------------------------------------------------------------

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    tokenRef.current = token;
    const userId = userIdFromToken(token);
    const nextSocket = io(SOCKET_ORIGIN, { auth: { token }, query: { userId, token } });
    setSocket(nextSocket);
    return () => {
      nextSocket.disconnect();
      setSocket(null);
    };
  }, []);

  // --- Media --------------------------------------------------------------

  const attachStreams = useCallback(() => {
    const local = localStreamRef.current;
    const remote = remoteStreamRef.current;
    const main = swappedRef.current ? local : remote;
    const pip = swappedRef.current ? remote : local;
    for (const [element, stream] of [[mainVideoRef.current, main], [pipVideoRef.current, pip]] as const) {
      if (!element) continue;
      if (element.srcObject !== stream) element.srcObject = stream;
      // Video elements stay muted; remote sound plays through the <audio> element.
      element.muted = true;
      if (stream) void element.play().catch(() => undefined);
    }
    const audio = remoteAudioRef.current;
    if (audio && remote) {
      if (audio.srcObject !== remote) audio.srcObject = remote;
      audio.muted = !isSpeakerOnRef.current;
      audio.volume = isSpeakerOnRef.current ? 1 : 0;
      if (isSpeakerOnRef.current) void audio.play().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    swappedRef.current = swapped;
    attachStreams();
  }, [activeCall, isCameraOn, swapped, attachStreams]);

  const stopCallMedia = useCallback(() => {
    pendingStartRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    pendingIceCandidatesRef.current = [];
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    isSpeakerOnRef.current = true;
    setIsMicOn(true);
    setIsCameraOn(true);
    setIsSpeakerOn(true);
    setSwapped(false);
    setCall(null);
    setIncomingCall(null);
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    }
  }, [setCall]);

  const ensureLocalMedia = useCallback(async (callType: CallType) => {
    if (!localStreamRef.current) {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
        video: callType === "video" ? VIDEO_CONSTRAINTS : false,
      });
      localStreamRef.current.getVideoTracks().forEach((track) => {
        // Faces in motion: keep the frame rate smooth rather than maximum sharpness.
        track.contentHint = "motion";
      });
    }
    setIsCameraOn(callType === "video");
    return localStreamRef.current;
  }, []);

  // --- Peer connection ----------------------------------------------------

  const createPeer = useCallback((otherUserId: string, callId: string) => {
    peerRef.current?.close();
    const peer = new RTCPeerConnection({ iceServers: iceServersRef.current });
    peerRef.current = peer;

    localStreamRef.current?.getTracks().forEach((track) => {
      if (localStreamRef.current) peer.addTrack(track, localStreamRef.current);
    });
    void tuneSenders(peer);

    peer.ontrack = (event) => {
      const stream = event.streams[0] || remoteStreamRef.current || new MediaStream();
      if (!event.streams[0] && !stream.getTracks().some((track) => track.id === event.track.id)) {
        stream.addTrack(event.track);
      }
      remoteStreamRef.current = stream;
      // The overlay and the remote track can arrive in either order.
      window.requestAnimationFrame(attachStreams);
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("videoSignal", { receiverId: otherUserId, callId, signalType: "ice", payload: event.candidate });
      }
    };

    peer.oniceconnectionstatechange = async () => {
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
        const call = activeCallRef.current;
        if (call && !call.connectedAt) setCall({ ...call, connectedAt: Date.now() });
        attachStreams();
        return;
      }
      const call = activeCallRef.current;
      if (peer.iceConnectionState === "failed" && call?.direction === "outgoing" && socket) {
        try {
          const restartOffer = withVideoBitrateHints(await peer.createOffer({ iceRestart: true }));
          await peer.setLocalDescription(restartOffer);
          socket.emit("videoSignal", { receiverId: otherUserId, callId, signalType: "offer", payload: restartOffer });
        } catch {
          // A later call attempt can create a fresh peer if ICE restart is unavailable.
        }
      }
    };

    return peer;
  }, [attachStreams, setCall, socket]);

  // --- Actions ------------------------------------------------------------

  const startCall = useCallback(async ({ conversationId, otherUser, callType }: StartCallOptions) => {
    if (!socket) return { error: "Connecting… please try again in a moment." };
    if (activeCallRef.current) return { error: "You are already in a call." };
    try {
      await ensureLocalMedia(callType);
    } catch {
      return {
        error: callType === "video"
          ? "Camera or microphone permission is required for video calls."
          : "Microphone permission is required for audio calls.",
      };
    }
    iceServersRef.current = await fetchIceServers(tokenRef.current);
    pendingStartRef.current = { conversationId, otherUser, callType };
    return new Promise<{ error?: string }>((resolve) => {
      socket.emit("startVideoCall", { conversationId, receiverId: otherUser.id, callType }, (response: any) => {
        if (response?.error) {
          pendingStartRef.current = null;
          stopCallMedia();
          resolve({ error: response.error });
          return;
        }
        markStarted(response?.data?.call ?? response?.call);
        resolve({});
      });
    });
  }, [ensureLocalMedia, markStarted, socket, stopCallMedia]);

  const acceptIncomingCall = useCallback(async () => {
    if (!socket || !incomingCall) return;
    const { callId, conversationId, caller, callType } = incomingCall;
    try {
      await ensureLocalMedia(callType);
    } catch {
      toast.error(callType === "video"
        ? "Camera or microphone permission is required for video calls."
        : "Microphone permission is required for audio calls.");
      return;
    }
    iceServersRef.current = await fetchIceServers(tokenRef.current);
    // Store the active call before notifying the caller: the caller sends its
    // offer as soon as it hears we accepted, and it must not be discarded.
    setCall({ id: callId, conversationId, otherUser: caller, direction: "incoming", status: "active", callType, connectedAt: null });
    setIncomingCall(null);
    socket.emit("acceptVideoCall", { callId, callerId: caller.id });
  }, [ensureLocalMedia, incomingCall, setCall, socket]);

  const endCall = useCallback((status: "ended" | "rejected" = "ended") => {
    const call = activeCallRef.current;
    if (socket && call) {
      socket.emit("endVideoCall", { callId: call.id, otherUserId: call.otherUser.id, status });
    } else if (socket && incomingCall) {
      socket.emit("endVideoCall", { callId: incomingCall.callId, otherUserId: incomingCall.caller.id, status: "rejected" });
    }
    stopCallMedia();
  }, [incomingCall, socket, stopCallMedia]);

  const toggleMicrophone = useCallback(() => {
    const next = !isMicOn;
    localStreamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setIsMicOn(next);
  }, [isMicOn]);

  const toggleCamera = useCallback(() => {
    const next = !isCameraOn;
    localStreamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setIsCameraOn(next);
  }, [isCameraOn]);

  const toggleSpeaker = useCallback(() => {
    const next = !isSpeakerOn;
    isSpeakerOnRef.current = next;
    setIsSpeakerOn(next);
    attachStreams();
  }, [attachStreams, isSpeakerOn]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void overlayRef.current?.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // --- Socket events --------------------------------------------------------

  useEffect(() => {
    if (!socket) return;

    const handleStarted = (payload: any) => markStarted(payload?.call);

    const handleIncoming = (payload: any) => {
      if (activeCallRef.current) return;
      setIncomingCall({
        callId: payload.call.id,
        conversationId: payload.conversationId,
        caller: participantFrom(payload.caller, payload.callerId),
        callType: payload.callType === "audio" ? "audio" : "video",
      });
    };

    const handleAccepted = async () => {
      const current = activeCallRef.current;
      if (!current || current.direction !== "outgoing" || current.status === "active") return;
      setCall({ ...current, status: "active" });
      const peer = createPeer(current.otherUser.id, current.id);
      const offer = withVideoBitrateHints(await peer.createOffer());
      await peer.setLocalDescription(offer);
      socket.emit("videoSignal", { receiverId: current.otherUser.id, callId: current.id, signalType: "offer", payload: offer });
    };

    const handleSignal = async (signal: any) => {
      const call = activeCallRef.current;
      if (!call || signal.callId !== call.id) return;

      if (signal.signalType === "offer") {
        const peer = createPeer(signal.senderId, signal.callId);
        await peer.setRemoteDescription(new RTCSessionDescription(withVideoBitrateHints(signal.payload)));
        for (const candidate of pendingIceCandidatesRef.current.splice(0)) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }
        const answer = withVideoBitrateHints(await peer.createAnswer());
        await peer.setLocalDescription(answer);
        socket.emit("videoSignal", { receiverId: signal.senderId, callId: signal.callId, signalType: "answer", payload: answer });
      }

      if (signal.signalType === "answer" && peerRef.current) {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(withVideoBitrateHints(signal.payload)));
        for (const candidate of pendingIceCandidatesRef.current.splice(0)) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

      if (signal.signalType === "ice") {
        const candidate = signal.payload as RTCIceCandidateInit;
        if (peerRef.current?.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingIceCandidatesRef.current.push(candidate);
        }
      }
    };

    const handleEnded = (payload: any) => {
      const endedId = payload?.call?.id;
      const call = activeCallRef.current;
      setIncomingCall((incoming) => (incoming && (!endedId || incoming.callId === endedId) ? null : incoming));
      if (call && (!endedId || call.id === endedId)) {
        if (payload?.endedBy === "plan_limit") toast.info("Call ended: your plan's call time limit was reached.");
        stopCallMedia();
      }
    };

    const handleAnsweredElsewhere = (payload: { callId: string }) => {
      setIncomingCall((incoming) => (incoming?.callId === payload.callId ? null : incoming));
    };

    socket.on("videoCallStarted", handleStarted);
    socket.on("incomingVideoCall", handleIncoming);
    socket.on("videoCallAccepted", handleAccepted);
    socket.on("videoSignal", handleSignal);
    socket.on("videoCallEnded", handleEnded);
    socket.on("videoCallAnsweredElsewhere", handleAnsweredElsewhere);
    return () => {
      socket.off("videoCallStarted", handleStarted);
      socket.off("incomingVideoCall", handleIncoming);
      socket.off("videoCallAccepted", handleAccepted);
      socket.off("videoSignal", handleSignal);
      socket.off("videoCallEnded", handleEnded);
      socket.off("videoCallAnsweredElsewhere", handleAnsweredElsewhere);
    };
  }, [createPeer, markStarted, setCall, socket, stopCallMedia]);

  // Socket delivery is primary; polling recovers a ringing call after a reconnect.
  useEffect(() => {
    const token = tokenRef.current;
    if (!token || activeCall || incomingCall) return;
    let cancelled = false;
    const recover = async () => {
      try {
        const response = await fetch(`${API_ORIGIN}/video-calls/incoming`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;
        const call = await response.json();
        if (!call?.id || cancelled || activeCallRef.current) return;
        setIncomingCall({
          callId: call.id,
          conversationId: call.conversationId,
          caller: participantFrom(call.callerProfile, call.callerId),
          callType: call.callType === "audio" ? "audio" : "video",
        });
      } catch {
        // Ignore: the next poll or a socket event will deliver the call.
      }
    };
    void recover();
    const timer = window.setInterval(recover, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeCall, incomingCall, socket]);

  // Ringtone for an incoming call; ringback while our outgoing call rings.
  const soundKind = incomingCall && !activeCall
    ? "incoming"
    : activeCall?.direction === "outgoing" && activeCall.status === "ringing"
      ? "outgoing"
      : null;
  useEffect(() => {
    if (!soundKind) return;
    return startCallSound(soundKind);
  }, [soundKind]);

  // Lock page scroll and tick the call timer while a call is on screen.
  useEffect(() => {
    if (!activeCall) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearInterval(timer);
    };
  }, [activeCall]);

  // --- UI -------------------------------------------------------------------
  // Call screens sit above every other overlay (the chatbot uses z-[9999]).

  const statusLabel = !activeCall
    ? ""
    : activeCall.status === "ringing"
      ? "Ringing…"
      : activeCall.connectedAt
        ? formatDuration(Math.max(0, Math.floor((now - activeCall.connectedAt) / 1000)))
        : "Connecting…";

  const localVideoVisible = activeCall?.callType === "video" && isCameraOn;
  // Which tile shows the local camera, so it can be hidden when the camera is off.
  const mainIsLocal = swapped;

  const controlButton = (active: boolean) => cn(
    "h-11 w-11 rounded-full p-0 text-white sm:h-12 sm:w-12",
    active ? "bg-white/15 hover:bg-white/25" : "bg-white text-slate-950 hover:bg-white/90",
  );

  return (
    <CallContext.Provider value={{ startCall, ready: Boolean(socket), inCall: Boolean(activeCall) }}>
      {children}

      {incomingCall && !activeCall && typeof document !== "undefined" && createPortal((
        <div className="fixed inset-0 z-[10060] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl">
            <Avatar className="mx-auto mb-3 h-16 w-16 border-2 border-rose-100 shadow-md">
              <AvatarImage src={incomingCall.caller.photo || undefined} alt={incomingCall.caller.name} />
              <AvatarFallback className="bg-rose-100 text-xl font-bold text-rose-600">
                {incomingCall.caller.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold text-foreground">{incomingCall.caller.name}</h3>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Incoming {incomingCall.callType === "audio" ? "voice" : "video"} call
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => endCall("rejected")}>
                <PhoneOff className="mr-2 h-4 w-4" />
                Decline
              </Button>
              <Button className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={acceptIncomingCall}>
                {incomingCall.callType === "audio" ? <Phone className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                Accept
              </Button>
            </div>
          </div>
        </div>
      ), document.body)}

      {activeCall && typeof document !== "undefined" && createPortal((
        <div ref={overlayRef} className="fixed inset-0 z-[10050] h-dvh min-h-dvh w-screen overflow-hidden bg-slate-950 text-white">
          <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

          {activeCall.callType === "video" ? (
            <>
              <video
                ref={mainVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  // Both tiles are mirrored, like a selfie view, on both sides of the call.
                  "absolute inset-0 block !h-full !w-full -scale-x-100 object-cover object-center",
                  mainIsLocal && !localVideoVisible && "invisible",
                )}
              />
              {mainIsLocal && !localVideoVisible && (
                <div className="absolute inset-0 flex items-center justify-center"><VideoOff className="h-12 w-12 opacity-70" /></div>
              )}
              <button
                type="button"
                onClick={() => setSwapped((value) => !value)}
                title="Swap video"
                className="group absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] aspect-[3/4] w-28 overflow-hidden rounded-2xl border border-white/30 bg-slate-900 shadow-2xl sm:right-5 sm:top-[max(1.25rem,env(safe-area-inset-top))] sm:aspect-[4/3] sm:w-44 lg:w-56"
              >
                <video
                  ref={pipVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "absolute inset-0 block !h-full !w-full -scale-x-100 object-cover object-center",
                    !mainIsLocal && !localVideoVisible && "invisible",
                  )}
                />
                {!mainIsLocal && !localVideoVisible && (
                  <span className="absolute inset-0 flex items-center justify-center"><VideoOff className="h-7 w-7 opacity-80" /></span>
                )}
                <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/50 p-1 opacity-80 transition group-hover:opacity-100">
                  <Repeat2 className="h-3.5 w-3.5" />
                </span>
              </button>
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,_#334155_0%,_#0f172a_55%,_#020617_100%)] px-5">
              <Avatar className="h-24 w-24 border border-white/20 sm:h-28 sm:w-28">
                <AvatarImage src={activeCall.otherUser.photo || undefined} />
                <AvatarFallback>{activeCall.otherUser.name[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <p className="text-xl font-semibold">{activeCall.otherUser.name}</p>
            </div>
          )}

          <div className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-full bg-black/40 px-3 py-1.5 text-sm backdrop-blur-md sm:left-5 sm:top-[max(1.25rem,env(safe-area-inset-top))]">
            <span className="font-semibold">{activeCall.otherUser.name}</span>
            <span className="ml-2 tabular-nums text-white/80">{statusLabel}</span>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:gap-4 sm:px-4 sm:pb-[max(2rem,env(safe-area-inset-bottom))] sm:pt-24">
            <div className="flex items-center gap-2 rounded-full bg-black/40 p-1.5 backdrop-blur-md sm:gap-3 sm:p-2">
              <Button type="button" onClick={toggleMicrophone} className={controlButton(isMicOn)} title={isMicOn ? "Mute microphone" : "Unmute microphone"}>
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              {activeCall.callType === "video" && (
                <Button type="button" onClick={toggleCamera} className={controlButton(isCameraOn)} title={isCameraOn ? "Turn camera off" : "Turn camera on"}>
                  {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              )}
              <Button type="button" onClick={toggleSpeaker} className={controlButton(isSpeakerOn)} title={isSpeakerOn ? "Mute speaker" : "Turn speaker on"}>
                {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
              {activeCall.callType === "video" && (
                <Button type="button" onClick={toggleFullscreen} className={controlButton(true)} title={isFullscreen ? "Exit full screen" : "Full screen"}>
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
              )}
              <Button type="button" onClick={() => endCall("ended")} className="h-11 w-11 rounded-full bg-red-600 p-0 text-white hover:bg-red-700 sm:h-12 sm:w-12" title="End call">
                <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </div>
          </div>
        </div>
      ), document.body)}
    </CallContext.Provider>
  );
}
