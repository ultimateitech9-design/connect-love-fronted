"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { io, type Socket } from "socket.io-client";
import { Flag, FlipHorizontal2, Maximize2, Mic, MicOff, Minimize2, Phone, PhoneOff, Repeat2, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { API_ORIGIN, SOCKET_ORIGIN, WEBRTC_ICE_SERVERS, fetchIceServers } from "@/config/runtime";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { startCallSound } from "./ringtone";
import { UpgradeCallsDialog, type UpgradeReason } from "./UpgradeCallsDialog";
import { ReportCallDialog } from "./ReportCallDialog";
import { useCallDevices } from "./useCallDevices";

type CallType = "audio" | "video";

export type CallParticipant = { id: string; name: string; photo?: string | null };

type ActiveCall = {
  id: string;
  /** Null for direct (paid, no match) calls. */
  conversationId: string | null;
  otherUser: CallParticipant;
  direction: "incoming" | "outgoing";
  status: "ringing" | "active";
  callType: CallType;
  connectedAt: number | null;
};

type IncomingCall = {
  callId: string;
  conversationId: string | null;
  caller: CallParticipant;
  callType: CallType;
  /** True for a direct call from someone the user has not matched with. */
  direct: boolean;
};

type StartCallOptions = {
  conversationId: string;
  otherUser: CallParticipant;
  callType: CallType;
};

type StartDirectCallOptions = {
  otherUser: CallParticipant;
  callType: CallType;
};

type CallLimit = {
  endsAt: number;
  isFreeTrial: boolean;
  ratePerMinute?: number;
  /** Only the caller pays, so only the caller is offered more coins. */
  canTopUp: boolean;
};

type PendingStart = { conversationId: string | null; otherUser: CallParticipant; callType: CallType };

/** error: shown to the user. upgrade: the upgrade popup was opened instead. */
type StartResult = { error?: string; upgrade?: boolean };

type CallContextValue = {
  /** Call between matched users (Messages). */
  startCall: (options: StartCallOptions) => Promise<StartResult>;
  /** Paid call to someone without a match (Discover). */
  startDirectCall: (options: StartDirectCallOptions) => Promise<StartResult>;
  /** Open the coin-pack popup, e.g. from a "Buy coins" link. */
  openUpgrade: () => void;
  ready: boolean;
  inCall: boolean;
};

const CallContext = createContext<CallContextValue>({
  startCall: async () => ({ error: "Calls are not available on this page." }),
  startDirectCall: async () => ({ error: "Calls are not available on this page." }),
  openUpgrade: () => undefined,
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
// Both tiles are mirrored like a selfie view. A plain transform works in every
// mobile browser (the CSS "scale" property did not on some phones).
const MIRRORED = { transform: "scaleX(-1)" } as const;

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
  const [isCallAudioOn, setIsCallAudioOn] = useState(true);
  const [needsAudioGesture, setNeedsAudioGesture] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [swapped, setSwapped] = useState(false);
  // "contain" when the video and its tile differ in orientation (a phone's
  // portrait video on a landscape laptop screen), so nothing is cropped.
  const [fit, setFit] = useState<{ main: "cover" | "contain"; pip: "cover" | "contain" }>({ main: "cover", pip: "cover" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  // Time limit of a direct call, from the server: when the free allowance or
  // the caller's coins run out. Null when the call has no limit.
  const [callLimit, setCallLimit] = useState<CallLimit | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const lowTimeWarnedRef = useRef(false);

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
  const isCallAudioOnRef = useRef(true);
  const pendingStartRef = useRef<PendingStart | null>(null);
  const pendingResolveRef = useRef<((result: StartResult) => void) | null>(null);
  const myUserIdRef = useRef("");
  // Why the coin-pack popup is open (null = closed).
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
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
    pendingResolveRef.current?.({});
    pendingResolveRef.current = null;
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
    myUserIdRef.current = userId;
    const nextSocket = io(SOCKET_ORIGIN, { auth: { token }, query: { userId, token } });
    setSocket(nextSocket);
    return () => {
      const call = activeCallRef.current;
      if (call) nextSocket.emit("endVideoCall", { callId: call.id, otherUserId: call.otherUser.id, status: "ended" });
      peerRef.current?.close();
      peerRef.current = null;
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      activeCallRef.current = null;
      pendingStartRef.current = null;
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
      audio.muted = !isCallAudioOnRef.current;
      audio.volume = isCallAudioOnRef.current ? 1 : 0;
      if (isCallAudioOnRef.current) void audio.play().then(() => setNeedsAudioGesture(false)).catch(() => { if (activeCallRef.current && audio.srcObject === remote && isCallAudioOnRef.current) setNeedsAudioGesture(true); });
    }
  }, []);

  const callDevices = useCallDevices({ callId: activeCall?.id, localStream: localStreamRef, peer: peerRef, audio: remoteAudioRef, onStreamsChanged: attachStreams });

  useEffect(() => {
    swappedRef.current = swapped;
    attachStreams();
  }, [activeCall, isCameraOn, swapped, attachStreams]);

  const stopCallMedia = useCallback(() => {
    pendingStartRef.current = null;
    if (typeof window !== "undefined") window.dispatchEvent(new Event("connect-love-wallet-changed"));
    setFit({ main: "cover", pip: "cover" });
    peerRef.current?.close();
    peerRef.current = null;
    pendingIceCandidatesRef.current = [];
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    isCallAudioOnRef.current = true;
    setIsMicOn(true);
    setIsCameraOn(true);
    setIsCallAudioOn(true);
    setNeedsAudioGesture(false);
    setSwapped(false);
    setCallLimit(null);
    lowTimeWarnedRef.current = false;
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

  // Emits a call-start event. Errors arrive as the acknowledgement; success as
  // the "videoCallStarted" event (handled by markStarted, which resolves too).
  const beginCall = useCallback(async (event: "startVideoCall" | "startDirectCall", data: Record<string, unknown>, pending: PendingStart): Promise<StartResult> => {
    if (!socket) return { error: "Connecting… please try again in a moment." };
    if (activeCallRef.current) return { error: "You are already in a call." };
    try {
      await ensureLocalMedia(pending.callType);
    } catch {
      return {
        error: pending.callType === "video"
          ? "Camera or microphone permission is required for video calls."
          : "Microphone permission is required for audio calls.",
      };
    }
    iceServersRef.current = await fetchIceServers(tokenRef.current);
    pendingStartRef.current = pending;
    return new Promise<StartResult>((resolve) => {
      pendingResolveRef.current = resolve;
      socket.emit(event, data, (response: any) => {
        if (response?.error) {
          pendingStartRef.current = null;
          pendingResolveRef.current = null;
          stopCallMedia();
          if (response.code === "UPGRADE_REQUIRED") {
            setUpgradeReason("free_used");
            resolve({ error: response.error, upgrade: true });
            return;
          }
          resolve({ error: response.error });
          return;
        }
        markStarted(response?.data?.call ?? response?.call);
      });
    });
  }, [ensureLocalMedia, markStarted, socket, stopCallMedia]);

  const startCall = useCallback(({ conversationId, otherUser, callType }: StartCallOptions) => (
    beginCall("startVideoCall", { conversationId, receiverId: otherUser.id, callType }, { conversationId, otherUser, callType })
  ), [beginCall]);

  const startDirectCall = useCallback(({ otherUser, callType }: StartDirectCallOptions) => (
    beginCall("startDirectCall", { receiverId: otherUser.id, callType }, { conversationId: null, otherUser, callType })
  ), [beginCall]);

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

  useEffect(() => {
    setFullscreenAvailable(Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen));
  }, []);

  const toggleCallAudio = useCallback(() => {
    const next = !isCallAudioOn;
    isCallAudioOnRef.current = next;
    setIsCallAudioOn(next);
    attachStreams();
  }, [attachStreams, isCallAudioOn]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else {
      void overlayRef.current?.requestFullscreen?.().catch(() => toast.error("Full screen is not available in this browser."));
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
        direct: payload.mode === "direct" || payload.call?.mode === "direct",
      });
    };

    const handleAccepted = async (payload: any) => {
      // Direct calls: the server says how long this call can last.
      const billing = payload?.billing;
      const forThisCall = payload?.call?.id === activeCallRef.current?.id;
      if (billing && forThisCall) {
        const iAmCaller = payload.call.callerId === myUserIdRef.current;
        if (billing.isFreeTrial && billing.limitSeconds) {
          setCallLimit({ endsAt: Date.now() + billing.limitSeconds * 1000, isFreeTrial: true, canTopUp: iAmCaller });
        } else if (iAmCaller && typeof billing.minutesLeft === "number") {
          // The first minute was just charged; each later minute is charged a
          // minute apart, and the call ends when one cannot be paid.
          setCallLimit({ endsAt: Date.now() + (1 + billing.minutesLeft) * 60_000, isFreeTrial: false, ratePerMinute: billing.ratePerMinute, canTopUp: true });
        }
      }
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
        // Direct calls cut by the server: offer coins to the caller, inform the receiver.
        const iAmCaller = payload?.call?.callerId === myUserIdRef.current;
        if (payload?.endedBy === "free_limit" || payload?.endedBy === "coins_exhausted") {
          if (iAmCaller) setUpgradeReason(payload.endedBy);
          else toast.info("Call ended: the caller's call time ran out.");
        } else if (payload?.endedBy === "disconnected") {
          toast.info("Call ended: the other person went offline.");
        }
        stopCallMedia();
      }
    };

    // A paid minute was charged: recompute when the coins run out.
    const handleBilling = (payload: any) => {
      if (payload?.callId !== activeCallRef.current?.id || typeof payload.minutesLeft !== "number") return;
      setCallLimit({ endsAt: Date.now() + (1 + payload.minutesLeft) * 60_000, isFreeTrial: false, ratePerMinute: payload.ratePerMinute, canTopUp: true });
      if (payload.minutesLeft > 0) lowTimeWarnedRef.current = false;
    };

    const handleAnsweredElsewhere = (payload: { callId: string }) => {
      setIncomingCall((incoming) => (incoming?.callId === payload.callId ? null : incoming));
    };

    socket.on("videoCallStarted", handleStarted);
    socket.on("incomingVideoCall", handleIncoming);
    socket.on("videoCallAccepted", handleAccepted);
    socket.on("videoSignal", handleSignal);
    socket.on("videoCallEnded", handleEnded);
    socket.on("callBilling", handleBilling);
    socket.on("videoCallAnsweredElsewhere", handleAnsweredElsewhere);
    return () => {
      socket.off("videoCallStarted", handleStarted);
      socket.off("incomingVideoCall", handleIncoming);
      socket.off("videoCallAccepted", handleAccepted);
      socket.off("videoSignal", handleSignal);
      socket.off("videoCallEnded", handleEnded);
      socket.off("callBilling", handleBilling);
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
          direct: call.mode === "direct",
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

  const updateFit = useCallback(() => {
    const fitFor = (video: HTMLVideoElement | null): "cover" | "contain" => {
      if (!video?.videoWidth || !video.videoHeight || !video.clientWidth || !video.clientHeight) return "cover";
      const videoIsPortrait = video.videoHeight > video.videoWidth;
      const tileIsPortrait = video.clientHeight > video.clientWidth;
      return videoIsPortrait === tileIsPortrait ? "cover" : "contain";
    };
    const next = { main: fitFor(mainVideoRef.current), pip: fitFor(pipVideoRef.current) };
    setFit((current) => (current.main === next.main && current.pip === next.pip ? current : next));
  }, []);

  // Re-check when streams swap or the window is resized/rotated. Video
  // "resize" events (the sender rotating the phone) call updateFit directly.
  useEffect(() => {
    if (!activeCall) return;
    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [activeCall, swapped, updateFit]);

  // --- UI -------------------------------------------------------------------
  // Call screens sit above every other overlay (the chatbot uses z-[9999]).

  const statusLabel = !activeCall
    ? ""
    : activeCall.status === "ringing"
      ? "Ringing…"
      : activeCall.connectedAt
        ? formatDuration(Math.max(0, Math.floor((now - activeCall.connectedAt) / 1000)))
        : "Connecting…";

  const secondsLeft = callLimit ? Math.max(0, Math.ceil((callLimit.endsAt - now) / 1000)) : null;
  const lowTime = secondsLeft !== null && secondsLeft <= 30;
  const limitLabel = !callLimit || secondsLeft === null
    ? ""
    : callLimit.isFreeTrial
      ? `Free call · ${formatDuration(secondsLeft)} left`
      : `₹${callLimit.ratePerMinute}/min · ${formatDuration(secondsLeft)} left`;

  // Warn once when 30 seconds remain on a time-limited call.
  useEffect(() => {
    if (!lowTime || lowTimeWarnedRef.current || !callLimit) return;
    lowTimeWarnedRef.current = true;
    toast.warning(callLimit.canTopUp
      ? (callLimit.isFreeTrial ? "Free call ends in 30 seconds." : "Your coins run out in 30 seconds. Add coins to keep talking.")
      : "This call will end in 30 seconds.");
  }, [callLimit, lowTime]);

  const localVideoVisible = activeCall?.callType === "video" && isCameraOn;
  // Which tile shows the local camera, so it can be hidden when the camera is off.
  const mainIsLocal = swapped;

  const controlCaption = "pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[9px] font-medium text-white/85";
  const controlButton = (active: boolean) => cn(
    "relative h-11 w-11 shrink-0 rounded-full p-0 text-white sm:h-12 sm:w-12",
    active ? "bg-white/15 hover:bg-white/25" : "bg-white text-slate-950 hover:bg-white/90",
  );

  return (
    <CallContext.Provider value={{ startCall, startDirectCall, openUpgrade: () => setUpgradeReason("manual"), ready: Boolean(socket), inCall: Boolean(activeCall) }}>
      {children}

      <UpgradeCallsDialog reason={upgradeReason} onClose={() => setUpgradeReason(null)} />
      {reportOpen && activeCall && (
        <ReportCallDialog
          callId={activeCall.id}
          otherUser={activeCall.otherUser}
          onClose={() => setReportOpen(false)}
          onDone={() => { setReportOpen(false); endCall(); }}
        />
      )}

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
              {incomingCall.direct ? " · from Discover" : ""}
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
                style={MIRRORED}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={updateFit}
                onResize={updateFit}
                className={cn(
                  // Both tiles are mirrored, like a selfie view, on both sides of the call.
                  "absolute inset-0 block !h-full !w-full object-center",
                  fit.main === "contain" ? "object-contain" : "object-cover",
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
                  style={MIRRORED}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={updateFit}
                  onResize={updateFit}
                  className={cn(
                    "absolute inset-0 block !h-full !w-full object-center",
                    fit.pip === "contain" ? "object-contain" : "object-cover",
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

          <div className={cn("absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-2xl bg-black/40 px-3 py-1.5 text-sm backdrop-blur-md sm:left-5 sm:top-[max(1.25rem,env(safe-area-inset-top))]", activeCall.callType === "video" ? "max-w-[calc(100%-9rem)] sm:max-w-[60vw]" : "max-w-[calc(100%-1.5rem)]")}>
            <span className="block truncate font-semibold">{activeCall.otherUser.name}</span>
            <span className="block text-xs tabular-nums text-white/80">{statusLabel}</span>
            {limitLabel && (
              <span
                role={lowTime ? "status" : undefined}
                className={cn(
                  "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                  lowTime ? "animate-pulse bg-rose-600 text-white" : "bg-white/15 text-white/90",
                )}
              >
                {limitLabel}
              </span>
            )}
            {/* Topping up extends a paid call; a free call's time is fixed by the server. */}
            {lowTime && callLimit?.canTopUp && !callLimit.isFreeTrial && (
              <button
                type="button"
                onClick={() => setUpgradeReason("low_time")}
                className="mt-1 ml-1 inline-flex rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-rose-600 hover:bg-white/90"
              >
                Add coins
              </button>
            )}
          </div>


          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 sm:gap-4 sm:px-4 sm:pb-[max(2rem,env(safe-area-inset-bottom))] sm:pt-24">
            {needsAudioGesture && <Button type="button" className="rounded-full bg-rose-600 text-white hover:bg-rose-500" onClick={() => { isCallAudioOnRef.current = true; setIsCallAudioOn(true); attachStreams(); }}>Enable call sound</Button>}
            {callDevices.error && <p role="alert" className="max-w-md rounded-xl bg-slate-900/95 px-4 py-2 text-xs text-rose-200">{callDevices.error}</p>}
            <div role="toolbar" aria-label="Call controls" className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-6 rounded-2xl bg-black/40 px-1.5 pb-5 pt-1.5 backdrop-blur-md sm:gap-x-3 sm:px-2 sm:pt-2">
              <Button type="button" disabled={callDevices.busy} onClick={toggleMicrophone} className={controlButton(isMicOn)} aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"} title={isMicOn ? "Mute microphone" : "Unmute microphone"} aria-pressed={!isMicOn}>
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}<span className={controlCaption}>Mic</span>
              </Button>
              {activeCall.callType === "video" && <>
                <Button type="button" disabled={callDevices.busy} onClick={toggleCamera} className={controlButton(isCameraOn)} aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"} title={isCameraOn ? "Turn camera off" : "Turn camera on"} aria-pressed={!isCameraOn}>
                  {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}<span className={controlCaption}>Camera</span>
                </Button>
                {callDevices.cameras.length > 1 && <Button type="button" disabled={callDevices.busy || !isCameraOn} onClick={() => void callDevices.flipCamera()} className={controlButton(true)} aria-label="Switch front / back camera" title="Switch front / back camera"><FlipHorizontal2 className="h-5 w-5" /><span className={controlCaption}>Flip</span></Button>}
              </>}
              <Button type="button" onClick={toggleCallAudio} className={controlButton(isCallAudioOn)} aria-label={isCallAudioOn ? "Mute call audio" : "Unmute call audio"} title={isCallAudioOn ? "Mute call audio" : "Unmute call audio"} aria-pressed={!isCallAudioOn}>
                {isCallAudioOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}<span className={controlCaption}>Sound</span>
              </Button>
              {fullscreenAvailable && <Button type="button" onClick={toggleFullscreen} className={controlButton(true)} aria-label={isFullscreen ? "Exit full screen" : "Full screen"} title={isFullscreen ? "Exit full screen" : "Full screen"}>{isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}<span className={controlCaption}>{isFullscreen ? "Shrink" : "Expand"}</span></Button>}
              <Button type="button" onClick={() => setReportOpen(true)} className={controlButton(true)} aria-label="Report or block" title="Report or block"><Flag className="h-5 w-5" /><span className={controlCaption}>Report</span></Button>
              <Button type="button" onClick={() => endCall()} className="relative h-11 w-11 shrink-0 rounded-full bg-red-600 p-0 text-white hover:bg-red-500 sm:h-12 sm:w-12" aria-label="End call" title="End call"><PhoneOff className="h-5 w-5" /><span className={controlCaption}>End</span></Button>
            </div>
          </div>
        </div>
      ), document.body)}
    </CallContext.Provider>
  );
}
