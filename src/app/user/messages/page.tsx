"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical, Send, Check, CheckCheck, Search, PhoneOff, Mic, MicOff, VideoOff, Volume2, VolumeX } from "lucide-react";
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
const MAX_VOICE_SECONDS = 60;

function isVoiceMessage(content?: string) {
 return !!content?.startsWith(VOICE_MESSAGE_PREFIX);
}

function voiceMessageSrc(content: string) {
 return content.slice(VOICE_MESSAGE_PREFIX.length);
}

function formatRecordingTime(seconds: number) {
 const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
 const secs = (seconds % 60).toString().padStart(2, "0");
 return `${mins}:${secs}`;
}

type ActiveCall = {
 id: string;
 conversationId: string;
 otherUserId: string;
 direction: "incoming" | "outgoing";
 status: "ringing" | "active";
};

export default function Messages() {
 const [activeId, setActiveId] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [draft, setDraft] = useState("");
 const [incomingCall, setIncomingCall] = useState<any | null>(null);
 const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
 const [isMicOn, setIsMicOn] = useState(true);
 const [isCameraOn, setIsCameraOn] = useState(true);
 const [isSpeakerOn, setIsSpeakerOn] = useState(true);
 const [isRecordingVoice, setIsRecordingVoice] = useState(false);
 const [recordingSeconds, setRecordingSeconds] = useState(0);
 const bottomRef = useRef<HTMLDivElement>(null);
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
        lastMessage: m.lastMessage || "No messages yet.",
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

 const ensureLocalMedia = useCallback(async () => {
   if (!localStreamRef.current) {
     localStreamRef.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
   }
   localStreamRef.current.getAudioTracks().forEach((track) => { track.enabled = isMicOn; });
   localStreamRef.current.getVideoTracks().forEach((track) => { track.enabled = isCameraOn; });
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

 const startVideoCall = useCallback(async () => {
   if (!socket || !active) return;
   try {
     await ensureLocalMedia();
     socket.emit("startVideoCall", { conversationId: active.id, receiverId: active.userId });
   } catch {
     alert("Camera or microphone permission is required for video calls.");
   }
 }, [active, ensureLocalMedia, socket]);

 const acceptIncomingCall = useCallback(async () => {
   if (!socket || !incomingCall) return;
   try {
     await ensureLocalMedia();
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
     });
     setIncomingCall(null);
   } catch {
     alert("Camera or microphone permission is required for video calls.");
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
   if (!draft.trim() || !activeId || !active) return;
   sendMessage(active.userId, draft.trim());
   setDraft("");
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
   };
 }, []);

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

 return (
 <>
 <div className="grid h-[calc(100vh-7rem)] gap-4 lg:grid-cols-[320px_1fr]">
 <aside className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm">
 <div className="flex flex-col gap-3 border-b border-border p-4">
 <h2 className="text-lg font-semibold">Messages</h2>
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-[1.111vw] w-[1.111vw] text-muted-foreground" />
 <Input 
 placeholder="Search matches..." 
 className="pl-9 h-[2.5vw] bg-muted/50 border-none" 
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
 <Avatar className="h-[3.056vw] w-[3.056vw]">
 <AvatarImage src={m.photo} />
 <AvatarFallback>{m.name[0]}</AvatarFallback>
 </Avatar>
 {m.online && <span className="absolute bottom-0 right-0 h-[0.833vw] w-[0.833vw] rounded-full border-2 border-card bg-emerald-500" />}
 </div>
 <div className="min-w-[0vw] flex-1">
 <div className="flex items-center justify-between">
 <p className="truncate text-sm font-semibold">{m.name}</p>
 {m.unread > 0 && activeId !== m.id && (
 <span className="grid h-[1.389vw] min-w-[1.389vw] place-items-center rounded-full bg-[color:var(--brand)] px-1.5 text-[10px] font-semibold text-white">
 {m.unread}
 </span>
 )}
 </div>
 <p className="truncate text-xs text-muted-foreground">
 {isVoiceMessage(m.lastMessage) ? "Voice message" : m.lastMessage}
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
 <Avatar className="h-[2.778vw] w-[2.778vw]">
 <AvatarImage src={active.photo} />
 <AvatarFallback>{active.name[0]}</AvatarFallback>
 </Avatar>
 <div>
 <p className="text-sm font-semibold">{active.name}, {active.age}</p>
 <p className="text-xs text-muted-foreground">{active.online ? "Online now" : (active.lastSeen ? `Last seen at ${new Date(active.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline")}</p>
 </div>
 </div>
 <div className="flex items-center gap-1 text-muted-foreground">
 <Button variant="ghost" size="icon" onClick={startVideoCall} disabled={!socket}><Phone className="h-[1.111vw] w-[1.111vw]" /></Button>
 <Button variant="ghost" size="icon" onClick={startVideoCall} disabled={!socket}><Video className="h-[1.111vw] w-[1.111vw]" /></Button>
 
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon"><MoreVertical className="h-[1.111vw] w-[1.111vw]" /></Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem>View Profile</DropdownMenuItem>
 <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
 <DropdownMenuItem className="text-red-500">Block User</DropdownMenuItem>
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
 {isVoiceMessage(m.content) ? (
 <audio controls src={voiceMessageSrc(m.content)} className="h-9 w-60 max-w-full" />
 ) : (
 m.content
 )}
 <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-90">
 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 {m.isRead ? <CheckCheck className="h-[1.1vw] w-[1.1vw] text-white" /> : <Check className="h-[1.1vw] w-[1.1vw]" />}
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
 {isVoiceMessage(m.content) ? (
 <audio controls src={voiceMessageSrc(m.content)} className="h-9 w-60 max-w-full" />
 ) : (
 m.content
 )}
 <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 )}
 </div>
 )})}
 <div ref={bottomRef} />
 </div>

 <form
 onSubmit={handleSend}
 className="flex items-center gap-2 border-t border-border p-3"
 >
 <Input 
 value={draft} 
 onChange={(e) => setDraft(e.target.value)} 
 placeholder={isRecordingVoice ? `Recording voice ${formatRecordingTime(recordingSeconds)}` : "Type a message..."} 
 disabled={isRecordingVoice}
 className="h-[2.778vw] rounded-full px-4 border-none bg-muted/50" 
 />
 <Button
 type="button"
 size="icon"
 onClick={toggleVoiceRecording}
 className={cn(
 "h-[2.778vw] w-[2.778vw] shrink-0 rounded-full text-white",
 isRecordingVoice ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-slate-700 hover:bg-slate-800"
 )}
 title={isRecordingVoice ? "Stop and send voice message" : "Record voice message"}
 >
 {isRecordingVoice ? <MicOff className="h-[1.111vw] w-[1.111vw]" /> : <Mic className="h-[1.111vw] w-[1.111vw]" />}
 </Button>
 <Button type="submit" size="icon" className="h-[2.778vw] w-[2.778vw] shrink-0 rounded-full bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90 text-white">
 <Send className="h-[1.111vw] w-[1.111vw]" />
 </Button>
 </form>
 </section>
 ) : (
 <section className="flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-card shadow-sm text-muted-foreground p-8 text-center">
 <div className="h-[5.556vw] w-[5.556vw] rounded-full bg-muted flex items-center justify-center mb-4">
 <Search className="h-[2.222vw] w-[2.222vw] text-muted-foreground/50" />
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
 <Video className="h-7 w-7" />
 </div>
 <h3 className="text-lg font-semibold text-foreground">Incoming video call</h3>
 <p className="mt-1 text-sm text-muted-foreground">A matched user wants to start a video call.</p>
 <div className="mt-6 flex justify-center gap-3">
 <Button variant="outline" className="rounded-full" onClick={() => endVideoCall("rejected")}>
 <PhoneOff className="mr-2 h-4 w-4" />
 Decline
 </Button>
 <Button className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={acceptIncomingCall}>
 <Video className="mr-2 h-4 w-4" />
 Accept
 </Button>
 </div>
 </div>
 </div>
 )}
 {activeCall && (
 <div className="fixed inset-0 z-50 bg-slate-950 text-white">
 <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full bg-black object-cover" />
 <div className="absolute right-5 top-5 h-36 w-24 overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl md:h-48 md:w-32">
 {isCameraOn ? (
 <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-slate-900 text-white">
 <VideoOff className="h-8 w-8 opacity-80" />
 </div>
 )}
 </div>
 <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 bg-gradient-to-t from-black/80 to-transparent px-4 py-8">
 <div className="rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
 {activeCall.status === "ringing" ? "Ringing..." : "Video call active"}
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
 <Button
 type="button"
 onClick={toggleCamera}
 className={cn(
 "h-12 w-12 rounded-full p-0 text-white",
 isCameraOn ? "bg-white/15 hover:bg-white/25" : "bg-white text-slate-950 hover:bg-white/90"
 )}
 title={isCameraOn ? "Turn camera off" : "Turn camera on"}
 >
 {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
 </Button>
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
 </>
 );
}
