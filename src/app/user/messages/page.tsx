"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Check, CheckCheck, Search, PhoneOff, Mic, MicOff, VideoOff, Volume2, VolumeX, Paperclip, Image as ImageIcon, X, MapPin, Briefcase, Ruler, SmilePlus, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 ContextMenu,
 ContextMenuContent,
 ContextMenuItem,
 ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMatches } from "@/hooks/useMatches";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { useQueryClient } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const VOICE_MESSAGE_PREFIX = "__voice_message__:";
const PHOTO_MESSAGE_PREFIX = "__photo_message__:";
const VIDEO_MESSAGE_PREFIX = "__video_message__:";
const GIFT_MESSAGE_PREFIX = "__gift_message__:";
const MAX_VOICE_SECONDS = 60;
const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const FREE_DATING_EMOJIS = ["❤️", "😍", "😘", "🥰", "💕", "💖", "💘", "💌", "🌹", "🔥", "😉", "😏", "🤗", "✨", "💫", "💋", "🫶", "💞"];
const PREMIUM_GIFTS = [
 { emoji: "🌹", label: "Rose", price: 9 },
 { emoji: "🍫", label: "Chocolate", price: 19 },
 { emoji: "💐", label: "Bouquet", price: 49 },
 { emoji: "💍", label: "Ring", price: 99 },
 { emoji: "🧸", label: "Teddy", price: 149 },
 { emoji: "👑", label: "Queen", price: 199 },
];

function isVoiceMessage(content?: string) {
 return !!content?.startsWith(VOICE_MESSAGE_PREFIX);
}

function voiceMessageSrc(content: string) {
 return content.slice(VOICE_MESSAGE_PREFIX.length);
}

function isPhotoMessage(content?: string) {
 return !!content?.startsWith(PHOTO_MESSAGE_PREFIX);
}

function photoMessageSrc(content: string) {
 return content.slice(PHOTO_MESSAGE_PREFIX.length);
}

function isVideoMessage(content?: string) {
 return !!content?.startsWith(VIDEO_MESSAGE_PREFIX);
}

function videoMessageSrc(content: string) {
 return content.slice(VIDEO_MESSAGE_PREFIX.length);
}

function isGiftMessage(content?: string) {
 return !!content?.startsWith(GIFT_MESSAGE_PREFIX);
}

function giftPayload(content: string) {
 const [emoji = "🎁", label = "Gift", price = "0"] = content.slice(GIFT_MESSAGE_PREFIX.length).split("|");
 return { emoji, label, price };
}

function messagePreview(content?: string) {
 if (isVoiceMessage(content)) return "Voice message";
 if (isPhotoMessage(content)) return "Photo";
 if (isVideoMessage(content)) return "Video";
 if (isGiftMessage(content)) return "Premium gift";
 return content || "No messages yet.";
}

function formatRecordingTime(seconds: number) {
 const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
 const secs = (seconds % 60).toString().padStart(2, "0");
 return `${mins}:${secs}`;
}

function MessageContent({ content, isMe, onOpenPhoto }: { content: string; isMe: boolean; onOpenPhoto: (src: string) => void }) {
 if (isVoiceMessage(content)) {
   return <audio controls src={voiceMessageSrc(content)} className="h-9 w-60 max-w-full" />;
 }

 if (isPhotoMessage(content)) {
   const src = photoMessageSrc(content);
   return (
     <button type="button" onClick={() => onOpenPhoto(src)} className="block w-full cursor-zoom-in">
       <img
         src={src}
         alt="Shared photo"
         className="max-h-80 w-full rounded-xl object-cover"
       />
     </button>
   );
 }

 if (isVideoMessage(content)) {
   return (
     <video
       controls
       src={videoMessageSrc(content)}
       className="max-h-80 w-full rounded-xl bg-black"
     />
   );
 }

 if (isGiftMessage(content)) {
   const gift = giftPayload(content);
   return (
     <div className={cn("min-w-40 rounded-2xl border p-3 text-center shadow-sm", isMe ? "border-white/20 bg-white/10 text-white" : "border-rose-100 bg-rose-50 text-rose-700")}>
       <div className="text-4xl leading-none">{gift.emoji}</div>
       <div className="mt-2 text-sm font-bold">{gift.label}</div>
       <div className={cn("mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold", isMe ? "bg-white/20 text-white" : "bg-white text-rose-600")}>
         ₹{gift.price}
       </div>
     </div>
   );
 }

 return <span className={cn("whitespace-pre-wrap break-words", isMe ? "text-white" : "text-foreground")}>{content}</span>;
}

type ActiveCall = {
 id: string;
 conversationId: string;
 otherUserId: string;
 direction: "incoming" | "outgoing";
 status: "ringing" | "active";
 callType: "audio" | "video";
};

export default function Messages() {
 const [activeId, setActiveId] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [draft, setDraft] = useState("");
 const [incomingCall, setIncomingCall] = useState<any | null>(null);
 const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
 const [profileModal, setProfileModal] = useState<any | null>(null);
 const [profileLoading, setProfileLoading] = useState(false);
 const [photoViewerSrc, setPhotoViewerSrc] = useState<string | null>(null);
 const [isMicOn, setIsMicOn] = useState(true);
 const [isCameraOn, setIsCameraOn] = useState(true);
 const [isSpeakerOn, setIsSpeakerOn] = useState(true);
 const [isRecordingVoice, setIsRecordingVoice] = useState(false);
 const [recordingSeconds, setRecordingSeconds] = useState(0);
 const [selectedMedia, setSelectedMedia] = useState<{ file: File; url: string; type: "photo" | "video" } | null>(null);
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 const bottomRef = useRef<HTMLDivElement>(null);
 const mediaInputRef = useRef<HTMLInputElement>(null);
 const localVideoRef = useRef<HTMLVideoElement>(null);
 const remoteVideoRef = useRef<HTMLVideoElement>(null);
 const localStreamRef = useRef<MediaStream | null>(null);
 const remoteStreamRef = useRef<MediaStream | null>(null);
 const voiceRecorderRef = useRef<MediaRecorder | null>(null);
 const voiceChunksRef = useRef<Blob[]>([]);
 const voiceStreamRef = useRef<MediaStream | null>(null);
 const peerRef = useRef<RTCPeerConnection | null>(null);
 const queryClient = useQueryClient();

 const token = getToken() || "";

 const [myId, setMyId] = useState<string | null>(null);
 useEffect(() => {
   if (token) {
     try {
       const payload = JSON.parse(atob(token.split('.')[1]));
       setMyId(payload.userId || payload.sub);
     } catch(e) {}
   }
 }, [token]);

 useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get("id");
  if (matchId) setActiveId(matchId);
 }, []);

 useEffect(() => {
   if (activeId && token) {
     fetch(`${API_URL}/messages/${activeId}/read`, {
       method: 'PATCH',
       headers: { Authorization: `Bearer ${token}` }
     }).then(() => {
       queryClient.invalidateQueries({ queryKey: ['matches', 'active'] });
     }).catch(() => {});
   }
 }, [activeId, token, queryClient]);

 const { matches: activeMatches } = useMatches(token, "active");
 const { messages, sendMessage, socket } = useChatWebSocket(token, activeId);

 const displayMatches = Array.from(new Map(activeMatches.map((m: any) => {
      const targetId = m.senderId === myId ? m.receiverId : m.senderId;
      return [m.id, { ...m, targetId }];
    })).values()).map((m: any) => {
      const realProfile = m.senderId === myId ? m.receiver : m.sender;
      const profile = realProfile ? {
          name: realProfile.name || "Unknown",
          age: realProfile.age || "",
          photo: (realProfile.photos && realProfile.photos.length > 0) ? realProfile.photos[0] : (realProfile.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"),
          online: realProfile.showOnlineStatus === false ? false : !!realProfile.isOnline,
          lastSeen: realProfile.lastSeen
        } : {};
      return {
        id: m.id,
        userId: m.targetId,
        name: profile.name || "Unknown",
        age: profile.age || "",
        photo: profile.photo || "",
        online: profile.online || false,
        lastSeen: profile.lastSeen || null,
        lastMessage: messagePreview(m.lastMessage),
        lastMessageTime: m.lastMessageTime || m.createdAt,
        unread: m.unreadCount || 0,
      };
    });

 const sortedMatches = [...displayMatches]
   .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
   .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

 const active = displayMatches.find((m) => m.id === activeId);

 const attachVideoStreams = useCallback(() => {
   if (localVideoRef.current && localStreamRef.current) {
     localVideoRef.current.srcObject = localStreamRef.current;
   }
   if (remoteVideoRef.current && remoteStreamRef.current) {
     remoteVideoRef.current.srcObject = remoteStreamRef.current;
     remoteVideoRef.current.muted = !isSpeakerOn;
     remoteVideoRef.current.volume = isSpeakerOn ? 1 : 0;
   }
 }, [isSpeakerOn]);

 useEffect(() => {
   attachVideoStreams();
 }, [activeCall, isCameraOn, attachVideoStreams]);

 const stopCallMedia = useCallback(() => {
   peerRef.current?.close();
   peerRef.current = null;
   localStreamRef.current?.getTracks().forEach((track) => track.stop());
   localStreamRef.current = null;
   remoteStreamRef.current = null;
   setIsMicOn(true);
   setIsCameraOn(true);
   setIsSpeakerOn(true);
   setActiveCall(null);
   setIncomingCall(null);
 }, []);

 const ensureLocalMedia = useCallback(async (callType: "audio" | "video") => {
   if (!localStreamRef.current) {
     localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: callType === "video", audio: true });
   }
   localStreamRef.current.getAudioTracks().forEach((track) => { track.enabled = isMicOn; });
   localStreamRef.current.getVideoTracks().forEach((track) => { track.enabled = callType === "video" && isCameraOn; });
   setIsCameraOn(callType === "video");
   attachVideoStreams();
   return localStreamRef.current;
 }, [attachVideoStreams, isCameraOn, isMicOn]);

 const toggleMicrophone = useCallback(() => {
   const next = !isMicOn;
   localStreamRef.current?.getAudioTracks().forEach((track) => {
     track.enabled = next;
   });
   setIsMicOn(next);
 }, [isMicOn]);

 const toggleCamera = useCallback(() => {
   const next = !isCameraOn;
   localStreamRef.current?.getVideoTracks().forEach((track) => {
     track.enabled = next;
   });
   setIsCameraOn(next);
 }, [isCameraOn]);

 const toggleSpeaker = useCallback(() => {
   const next = !isSpeakerOn;
   if (remoteVideoRef.current) {
     remoteVideoRef.current.muted = !next;
     remoteVideoRef.current.volume = next ? 1 : 0;
   }
   setIsSpeakerOn(next);
 }, [isSpeakerOn]);

 const createPeer = useCallback((otherUserId: string, callId: string) => {
   peerRef.current?.close();
   const peer = new RTCPeerConnection({
     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
   });
   peerRef.current = peer;

   localStreamRef.current?.getTracks().forEach((track) => {
     if (localStreamRef.current) peer.addTrack(track, localStreamRef.current);
   });

   peer.ontrack = (event) => {
     const [stream] = event.streams;
     remoteStreamRef.current = stream;
     attachVideoStreams();
   };

   peer.onicecandidate = (event) => {
     if (event.candidate && socket) {
       socket.emit("videoSignal", {
         receiverId: otherUserId,
         callId,
         signalType: "ice",
         payload: event.candidate,
       });
     }
   };

   return peer;
 }, [attachVideoStreams, socket]);

 const startCall = useCallback(async (callType: "audio" | "video") => {
   if (!socket || !active) return;
   try {
     await ensureLocalMedia(callType);
     socket.emit("startVideoCall", { conversationId: active.id, receiverId: active.userId, callType });
   } catch {
     alert(callType === "video" ? "Camera or microphone permission is required for video calls." : "Microphone permission is required for audio calls.");
   }
 }, [active, ensureLocalMedia, socket]);

 const acceptIncomingCall = useCallback(async () => {
   if (!socket || !incomingCall) return;
   const callType = incomingCall.callType === "audio" ? "audio" : "video";
   try {
     await ensureLocalMedia(callType);
     socket.emit("acceptVideoCall", {
       callId: incomingCall.call.id,
       callerId: incomingCall.callerId,
     });
     setActiveCall({
       id: incomingCall.call.id,
       conversationId: incomingCall.conversationId,
       otherUserId: incomingCall.callerId,
       direction: "incoming",
       status: "active",
       callType,
     });
     setIncomingCall(null);
   } catch {
     alert(callType === "video" ? "Camera or microphone permission is required for video calls." : "Microphone permission is required for audio calls.");
   }
 }, [ensureLocalMedia, incomingCall, socket]);

 const endVideoCall = useCallback((status: "ended" | "rejected" | "missed" = "ended") => {
   if (socket && activeCall) {
     socket.emit("endVideoCall", {
       callId: activeCall.id,
       otherUserId: activeCall.otherUserId,
       status,
     });
   } else if (socket && incomingCall) {
     socket.emit("endVideoCall", {
       callId: incomingCall.call.id,
       otherUserId: incomingCall.callerId,
       status: "rejected",
     });
   }
   stopCallMedia();
 }, [activeCall, incomingCall, socket, stopCallMedia]);

 useEffect(() => {
   if (!socket) return;

   const handleStarted = (payload: any) => {
     setActiveCall({
       id: payload.call.id,
       conversationId: payload.conversationId,
       otherUserId: payload.call.receiverId,
       direction: "outgoing",
       status: "ringing",
       callType: payload.callType === "audio" ? "audio" : "video",
     });
   };

   const handleIncoming = (payload: any) => {
     setIncomingCall(payload);
   };

   const handleAccepted = async (payload: any) => {
     setActiveCall((current) => current ? { ...current, status: "active" } : current);
     const current = activeCall;
     if (!current || current.direction !== "outgoing") return;
     const peer = createPeer(current.otherUserId, current.id);
     const offer = await peer.createOffer();
     await peer.setLocalDescription(offer);
     socket.emit("videoSignal", {
       receiverId: current.otherUserId,
       callId: current.id,
       signalType: "offer",
       payload: offer,
     });
   };

   const handleSignal = async (signal: any) => {
     const call = activeCall;
     if (!call) return;

     if (signal.signalType === "offer") {
       const peer = createPeer(signal.senderId, signal.callId);
       await peer.setRemoteDescription(new RTCSessionDescription(signal.payload));
       const answer = await peer.createAnswer();
       await peer.setLocalDescription(answer);
       socket.emit("videoSignal", {
         receiverId: signal.senderId,
         callId: signal.callId,
         signalType: "answer",
         payload: answer,
       });
     }

     if (signal.signalType === "answer" && peerRef.current) {
       await peerRef.current.setRemoteDescription(new RTCSessionDescription(signal.payload));
     }

     if (signal.signalType === "ice" && peerRef.current) {
       await peerRef.current.addIceCandidate(new RTCIceCandidate(signal.payload));
     }
   };

   const handleEnded = () => {
     stopCallMedia();
   };

   socket.on("videoCallStarted", handleStarted);
   socket.on("incomingVideoCall", handleIncoming);
   socket.on("videoCallAccepted", handleAccepted);
   socket.on("videoSignal", handleSignal);
   socket.on("videoCallEnded", handleEnded);

   return () => {
     socket.off("videoCallStarted", handleStarted);
     socket.off("incomingVideoCall", handleIncoming);
     socket.off("videoCallAccepted", handleAccepted);
     socket.off("videoSignal", handleSignal);
     socket.off("videoCallEnded", handleEnded);
   };
 }, [activeCall, createPeer, socket, stopCallMedia]);

 useEffect(() => {
   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSend = async (e?: React.FormEvent) => {
   if (e) e.preventDefault();
   if (!activeId || !active) return;

   if (selectedMedia) {
     const media = selectedMedia;
     const reader = new FileReader();
     reader.onloadend = () => {
       const dataUrl = typeof reader.result === "string" ? reader.result : "";
       if (dataUrl) {
         const prefix = media.type === "photo" ? PHOTO_MESSAGE_PREFIX : VIDEO_MESSAGE_PREFIX;
         sendMessage(active.userId, `${prefix}${dataUrl}`);
       }
     };
     reader.readAsDataURL(media.file);
     URL.revokeObjectURL(media.url);
     setSelectedMedia(null);
     setDraft("");
     return;
   }

   if (!draft.trim()) return;
   sendMessage(active.userId, draft.trim());
   setDraft("");
 };

 const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
   const file = event.target.files?.[0];
   event.target.value = "";
   if (!file) return;

   const type = file.type.startsWith("image/") ? "photo" : file.type.startsWith("video/") ? "video" : null;
   if (!type) {
     alert("Please select a photo or video file.");
     return;
   }
   if (file.size > MAX_MEDIA_BYTES) {
     alert("Please select a photo or video under 8 MB.");
     return;
   }

   if (selectedMedia) URL.revokeObjectURL(selectedMedia.url);
   setSelectedMedia({ file, type, url: URL.createObjectURL(file) });
 };

 const clearSelectedMedia = () => {
   if (selectedMedia) URL.revokeObjectURL(selectedMedia.url);
   setSelectedMedia(null);
 };

 const addEmojiToDraft = (emoji: string) => {
   setDraft((value) => `${value}${emoji}`);
   setShowEmojiPicker(false);
 };

 const sendPremiumGift = (gift: { emoji: string; label: string; price: number }) => {
   if (!active) return;
   const ok = confirm(`Send ${gift.label} for ₹${gift.price}?`);
   if (!ok) return;
   sendMessage(active.userId, `${GIFT_MESSAGE_PREFIX}${gift.emoji}|${gift.label}|${gift.price}`);
   setShowEmojiPicker(false);
 };

 const sendVoiceBlob = useCallback((blob: Blob) => {
   if (!active) return;
   const reader = new FileReader();
   reader.onloadend = () => {
     const dataUrl = typeof reader.result === "string" ? reader.result : "";
     if (dataUrl) sendMessage(active.userId, `${VOICE_MESSAGE_PREFIX}${dataUrl}`);
   };
   reader.readAsDataURL(blob);
 }, [active, sendMessage]);

 const stopVoiceRecording = useCallback(() => {
   voiceRecorderRef.current?.stop();
 }, []);

 const startVoiceRecording = useCallback(async () => {
   if (!active) return;
   if (!("MediaRecorder" in window)) {
     alert("Voice recording is not supported in this browser.");
     return;
   }

   try {
     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
     const recorder = new MediaRecorder(stream);
     voiceChunksRef.current = [];
     voiceStreamRef.current = stream;
     voiceRecorderRef.current = recorder;

     recorder.ondataavailable = (event) => {
       if (event.data.size > 0) voiceChunksRef.current.push(event.data);
     };

     recorder.onstop = () => {
       const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || "audio/webm" });
       voiceChunksRef.current = [];
       voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
       voiceStreamRef.current = null;
       voiceRecorderRef.current = null;
       setIsRecordingVoice(false);
       setRecordingSeconds(0);
       if (blob.size > 0) sendVoiceBlob(blob);
     };

     recorder.start();
     setRecordingSeconds(0);
     setIsRecordingVoice(true);
   } catch {
     alert("Microphone permission is required to send a voice message.");
   }
 }, [active, sendVoiceBlob]);

 const toggleVoiceRecording = useCallback(() => {
   if (isRecordingVoice) {
     stopVoiceRecording();
   } else {
     startVoiceRecording();
   }
 }, [isRecordingVoice, startVoiceRecording, stopVoiceRecording]);

 useEffect(() => {
   if (!isRecordingVoice) return;
   const timer = window.setInterval(() => {
     setRecordingSeconds((seconds) => {
       if (seconds + 1 >= MAX_VOICE_SECONDS) {
         window.clearInterval(timer);
         stopVoiceRecording();
         return MAX_VOICE_SECONDS;
       }
       return seconds + 1;
     });
   }, 1000);
   return () => window.clearInterval(timer);
 }, [isRecordingVoice, stopVoiceRecording]);

 useEffect(() => {
   return () => {
     if (voiceRecorderRef.current?.state === "recording") voiceRecorderRef.current.stop();
     voiceStreamRef.current?.getTracks().forEach((track) => track.stop());
     if (selectedMedia) URL.revokeObjectURL(selectedMedia.url);
   };
 }, [selectedMedia]);

 const handleUnsend = async (msgId: string) => {
   if (!activeId) return;
   try {
     await fetch(`${API_URL}/messages/${msgId}`, {
       method: 'DELETE',
       headers: { Authorization: `Bearer ${token}` }
     });
     queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
     queryClient.invalidateQueries({ queryKey: ['matches', 'active'] });
   } catch (err) {
     console.error("Failed to unsend message:", err);
   }
 };

 const handleSelectMatch = (id: string) => {
   setActiveId(id);
   queryClient.invalidateQueries({ queryKey: ['messages', id] });
 };

 const handleViewProfile = async () => {
   if (!active) return;
   setProfileLoading(true);
   setProfileModal({ name: active.name, age: active.age, photos: active.photo ? [active.photo] : [] });
   try {
     const res = await fetch(`${API_URL}/users/${active.userId}/details`, {
       headers: { Authorization: `Bearer ${token}` },
     });
     if (res.ok) setProfileModal(await res.json());
   } catch (err) {
     console.error("Failed to load profile", err);
   } finally {
     setProfileLoading(false);
   }
 };

 const handleBlockUser = async () => {
   if (!active) return;
   if (!confirm(`Block ${active.name}? You will no longer see this user in messages.`)) return;
   try {
     const res = await fetch(`${API_URL}/matches/block/${active.id}`, {
       method: "PATCH",
       headers: { Authorization: `Bearer ${token}` },
     });
     if (!res.ok) throw new Error("Block failed");
     queryClient.invalidateQueries({ queryKey: ['matches', 'active'] });
     queryClient.invalidateQueries({ queryKey: ['matches', 'blocked'] });
     setActiveId(null);
   } catch (err) {
     console.error("Failed to block user", err);
     alert("Could not block this user. Please try again.");
   }
 };

 return (
 <>
 <div className="grid h-[calc(100dvh-10rem)] min-h-[420px] gap-4 md:h-[calc(100dvh-8rem)] lg:grid-cols-[320px_1fr]">
 <aside className={cn("flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm", active && "hidden lg:flex")}>
 <div className="flex flex-col gap-3 border-b border-border p-4">
 <h2 className="text-lg font-semibold">Messages</h2>
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-[16px] w-[16px] text-muted-foreground" />
 <Input
 placeholder="Search matches..."
 className="pl-9 h-[36px] bg-muted/50 border-none"
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 <ul className="flex-1 overflow-y-auto divide-y divide-border">
 {sortedMatches.map((m) => {
 return (
 <li key={m.id}>
 <button
 onClick={() => handleSelectMatch(m.id)}
 className={cn(
 "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
 activeId === m.id ? "bg-muted" : "hover:bg-muted/50",
 )}
 >
 <div className="relative">
 <Avatar className="h-[44px] w-[44px]">
 <AvatarImage src={m.photo} />
 <AvatarFallback>{m.name[0]}</AvatarFallback>
 </Avatar>
 {m.online && <span className="absolute bottom-0 right-0 h-[12px] w-[12px] rounded-full border-2 border-card bg-emerald-500" />}
 </div>
 <div className="min-w-[0px] flex-1">
 <div className="flex items-center justify-between">
 <p className="truncate text-sm font-semibold">{m.name}</p>
 {m.unread > 0 && activeId !== m.id && (
 <span className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[color:var(--brand)] px-1.5 text-[10px] font-semibold text-white">
 {m.unread}
 </span>
 )}
 </div>
 <p className="truncate text-xs text-muted-foreground">
 {messagePreview(m.lastMessage)}
 </p>
 </div>
 </button>
 </li>
 );
 })}
 </ul>
 </aside>

 {active ? (
 <section className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm">
 <header className="flex items-center justify-between border-b border-border px-5 py-3">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" onClick={() => setActiveId(null)} className="lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></Button>
 <Avatar className="h-[40px] w-[40px]">
 <AvatarImage src={active.photo} />
 <AvatarFallback>{active.name[0]}</AvatarFallback>
 </Avatar>
 <div>
 <p className="text-sm font-semibold">{active.name}, {active.age}</p>
 <p className="text-xs text-muted-foreground">{active.online ? "Online now" : (active.lastSeen ? `Last seen at ${new Date(active.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline")}</p>
 </div>
 </div>
 <div className="flex items-center gap-1 text-muted-foreground">
 <Button variant="ghost" size="icon" onClick={() => startCall("audio")} disabled={!socket}><Phone className="h-[16px] w-[16px]" /></Button>
 <Button variant="ghost" size="icon" onClick={() => startCall("video")} disabled={!socket}><Video className="h-[16px] w-[16px]" /></Button>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon"><MoreVertical className="h-[16px] w-[16px]" /></Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={handleViewProfile}>View Profile</DropdownMenuItem>
 <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
 <DropdownMenuItem className="text-red-500" onClick={handleBlockUser}>Block User</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </header>

 <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
 {messages.map((m: any) => {
  const isMe = String(m.senderId) === String(myId);
  return (
 <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
 {isMe ? (
 <ContextMenu>
 <ContextMenuTrigger asChild>
 <div className="max-w-[70%] rounded-2xl px-4 py-2 text-sm relative bg-[color:var(--brand)] text-white rounded-br-sm cursor-context-menu select-none">
 <MessageContent content={m.content} isMe={isMe} onOpenPhoto={setPhotoViewerSrc} />
 <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-90">
 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 {m.isRead ? <CheckCheck className="h-[16px] w-[16px] text-white" /> : <Check className="h-[16px] w-[16px]" />}
 </div>
 </div>
 </ContextMenuTrigger>
 <ContextMenuContent>
 <ContextMenuItem className="text-red-500 cursor-pointer" onClick={() => handleUnsend(m.id)}>
 Unsend Message
 </ContextMenuItem>
 </ContextMenuContent>
 </ContextMenu>
 ) : (
 <div className="max-w-[70%] rounded-2xl px-4 py-2 text-sm relative bg-muted text-foreground rounded-bl-sm">
 <MessageContent content={m.content} isMe={isMe} onOpenPhoto={setPhotoViewerSrc} />
 <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 )}
 </div>
 )})}
 <div ref={bottomRef} />
 </div>

 <form onSubmit={handleSend} className="border-t border-border p-3">
 {selectedMedia && (
 <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-2">
 <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
 {selectedMedia.type === "photo" ? (
 <img src={selectedMedia.url} alt="Selected media preview" className="h-full w-full object-cover" />
 ) : (
 <video src={selectedMedia.url} className="h-full w-full object-cover" muted />
 )}
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-foreground">{selectedMedia.file.name}</p>
 <p className="text-xs text-muted-foreground">{selectedMedia.type === "photo" ? "Photo" : "Video"} ready to send</p>
 </div>
 <Button type="button" variant="ghost" size="icon" onClick={clearSelectedMedia} className="rounded-full">
 <X className="h-4 w-4" />
 </Button>
 </div>
 )}
 <div className="relative flex items-center gap-2">
 <input
 ref={mediaInputRef}
 type="file"
 accept="image/*,video/*"
 className="hidden"
 onChange={handleMediaSelect}
 />
 <Button
 type="button"
 size="icon"
 variant="ghost"
 onClick={() => mediaInputRef.current?.click()}
 disabled={isRecordingVoice}
 className="h-[40px] w-[40px] shrink-0 rounded-full"
 title="Send photo or video"
 >
 <Paperclip className="h-[16px] w-[16px]" />
 </Button>
 <Button
 type="button"
 size="icon"
 variant="ghost"
 onClick={() => setShowEmojiPicker((value) => !value)}
 disabled={isRecordingVoice}
 className="h-[40px] w-[40px] shrink-0 rounded-full"
 title="Send dating emoji"
 >
 <SmilePlus className="h-[16px] w-[16px]" />
 </Button>
 {showEmojiPicker && (
 <div className="absolute bottom-14 left-0 z-30 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
 <div className="border-b border-border p-3">
 <div className="flex items-center gap-2 text-sm font-bold text-foreground">
 <SmilePlus className="h-4 w-4 text-rose-500" />
 Dating emojis
 </div>
 <div className="mt-3 grid grid-cols-6 gap-2">
 {FREE_DATING_EMOJIS.map((emoji) => (
 <button
 key={emoji}
 type="button"
 onClick={() => addEmojiToDraft(emoji)}
 className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-xl transition hover:bg-rose-50 hover:scale-105"
 >
 {emoji}
 </button>
 ))}
 </div>
 </div>
 <div className="p-3">
 <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
 <Gift className="h-4 w-4 text-rose-500" />
 Premium gifts
 </div>
 <div className="grid grid-cols-2 gap-2">
 {PREMIUM_GIFTS.map((gift) => (
 <button
 key={gift.label}
 type="button"
 onClick={() => sendPremiumGift(gift)}
 className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-left transition hover:border-rose-300 hover:bg-rose-100"
 >
 <span className="text-2xl">{gift.emoji}</span>
 <span className="min-w-0 flex-1">
 <span className="block truncate text-xs font-bold text-rose-700">{gift.label}</span>
 <span className="text-[10px] font-semibold text-rose-500">₹{gift.price}</span>
 </span>
 </button>
 ))}
 </div>
 </div>
 </div>
 )}
 <Input
 value={draft}
 onChange={(e) => setDraft(e.target.value)}
 placeholder={isRecordingVoice ? `Recording voice ${formatRecordingTime(recordingSeconds)}` : "Type a message..."}
 disabled={isRecordingVoice || !!selectedMedia}
 className="h-[40px] rounded-full px-4 border-none bg-muted/50"
 />
 <Button
 type="button"
 size="icon"
 onClick={toggleVoiceRecording}
 className={cn(
 "h-[40px] w-[40px] shrink-0 rounded-full text-white",
 isRecordingVoice ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-slate-700 hover:bg-slate-800"
 )}
 title={isRecordingVoice ? "Stop and send voice message" : "Record voice message"}
 >
 {isRecordingVoice ? <MicOff className="h-[16px] w-[16px]" /> : <Mic className="h-[16px] w-[16px]" />}
 </Button>
 <Button type="submit" size="icon" disabled={!draft.trim() && !selectedMedia} className="h-[40px] w-[40px] shrink-0 rounded-full bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90 text-white disabled:opacity-50">
 {selectedMedia ? <ImageIcon className="h-[16px] w-[16px]" /> : <Send className="h-[16px] w-[16px]" />}
 </Button>
 </div>
 </form>
 </section>
 ) : (
 <section className="flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-card shadow-sm text-muted-foreground p-8 text-center">
 <div className="h-[80px] w-[80px] rounded-full bg-muted flex items-center justify-center mb-4">
 <Search className="h-[32px] w-[32px] text-muted-foreground/50" />
 </div>
 <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
 <p>Select a conversation from the sidebar to start chatting.</p>
 </section>
 )}
 </div>
 {incomingCall && !activeCall && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
 <div className="w-full max-w-sm rounded-2xl bg-card p-6 text-center shadow-2xl">
 <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-100 text-rose-600">
 {incomingCall.callType === "audio" ? <Phone className="h-7 w-7" /> : <Video className="h-7 w-7" />}
 </div>
 <h3 className="text-lg font-semibold text-foreground">Incoming {incomingCall.callType === "audio" ? "audio" : "video"} call</h3>
 <p className="mt-1 text-sm text-muted-foreground">A matched user wants to start a {incomingCall.callType === "audio" ? "audio" : "video"} call.</p>
 <div className="mt-6 flex justify-center gap-3">
 <Button variant="outline" className="rounded-full" onClick={() => endVideoCall("rejected")}>
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
 )}
 {activeCall && (
 <div className="fixed inset-0 z-50 bg-slate-950 text-white">
 <video ref={remoteVideoRef} autoPlay playsInline className={activeCall.callType === "video" ? "h-full w-full bg-black object-cover" : "hidden"} />
 {activeCall.callType === "audio" && (
 <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-950">
 <Avatar className="h-28 w-28 border border-white/20">
 <AvatarImage src={active?.photo} />
 <AvatarFallback>{active?.name?.[0] || "U"}</AvatarFallback>
 </Avatar>
 <div className="text-center">
 <p className="text-xl font-semibold">{active?.name || "Audio call"}</p>
 <p className="mt-1 text-sm text-white/60">{activeCall.status === "ringing" ? "Ringing..." : "Audio call active"}</p>
 </div>
 </div>
 )}
 {activeCall.callType === "video" && (
 <div className="absolute right-5 top-5 h-36 w-24 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl md:h-48 md:w-32">
 {isCameraOn ? (
 <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
 <VideoOff className="h-8 w-8 opacity-80" />
 </div>
 )}
 </div>
 )}
 <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 to-transparent px-4 py-8">
 <div className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
 {activeCall.status === "ringing" ? "Ringing..." : `${activeCall.callType === "audio" ? "Audio" : "Video"} call active`}
 </div>
 <div className="flex items-center gap-3 rounded-full bg-black/30 p-2 backdrop-blur">
 <Button
 type="button"
 onClick={toggleMicrophone}
 className={cn(
 "h-12 w-12 rounded-full p-0 text-white",
 isMicOn ? "bg-white/15 hover:bg-white/25" : "bg-white text-slate-950 hover:bg-white/90"
 )}
 title={isMicOn ? "Mute microphone" : "Unmute microphone"}
 >
 {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
 </Button>
 {activeCall.callType === "video" && <Button
 type="button"
 onClick={toggleCamera}
 className={cn(
 "h-12 w-12 rounded-full p-0 text-white",
 isCameraOn ? "bg-white/15 hover:bg-white/25" : "bg-white text-slate-950 hover:bg-white/90"
 )}
 title={isCameraOn ? "Turn camera off" : "Turn camera on"}
 >
 {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
 </Button>}
 <Button
 type="button"
 onClick={toggleSpeaker}
 className={cn(
 "h-12 w-12 rounded-full p-0 text-white",
 isSpeakerOn ? "bg-white/15 hover:bg-white/25" : "bg-white text-slate-950 hover:bg-white/90"
 )}
 title={isSpeakerOn ? "Mute speaker" : "Turn speaker on"}
 >
 {isSpeakerOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
 </Button>
 <Button onClick={() => endVideoCall("ended")} className="h-12 w-12 rounded-full bg-red-600 p-0 text-white hover:bg-red-700" title="End call">
 <PhoneOff className="h-6 w-6" />
 </Button>
 </div>
 </div>
 </div>
 )}
 {profileModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
 <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl">
 <button type="button" onClick={() => setProfileModal(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted">
 <X className="h-4 w-4" />
 </button>
 <div className="pr-10">
 <h3 className="text-xl font-bold text-foreground">{profileModal.name || active?.name}{profileModal.age ? `, ${profileModal.age}` : ""}</h3>
 <p className="mt-1 text-sm text-muted-foreground">{profileLoading ? "Loading profile..." : profileModal.bio || "Profile details"}</p>
 </div>
 <div className="mt-4 grid grid-cols-2 gap-2">
 {(profileModal.photos?.length ? profileModal.photos : active?.photo ? [active.photo] : []).slice(0, 4).map((photo: string, index: number) => (
 <img key={`${photo}-${index}`} src={photo} alt={`${profileModal.name || "Profile"} photo ${index + 1}`} className="aspect-[3/4] w-full rounded-xl object-cover" />
 ))}
 </div>
 <div className="mt-4 space-y-2 text-sm text-muted-foreground">
 {profileModal.profession && <p className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> {profileModal.profession}</p>}
 {profileModal.city && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {profileModal.city}</p>}
 {profileModal.height && <p className="flex items-center gap-2"><Ruler className="h-4 w-4" /> {profileModal.height}</p>}
 </div>
 {profileModal.interests?.length > 0 && (
 <div className="mt-4 flex flex-wrap gap-2">
 {profileModal.interests.map((interest: string) => (
 <span key={interest} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">{interest}</span>
 ))}
 </div>
 )}
 </div>
 </div>
 )}
 {photoViewerSrc && (
 <div
 className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
 onClick={() => setPhotoViewerSrc(null)}
 >
 <button
 type="button"
 onClick={() => setPhotoViewerSrc(null)}
 className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
 aria-label="Close photo"
 >
 <X className="h-5 w-5" />
 </button>
 <img
 src={photoViewerSrc}
 alt="Shared photo enlarged"
 onClick={(event) => event.stopPropagation()}
 className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain shadow-2xl"
 />
 </div>
 )}
 </>
 );
}
