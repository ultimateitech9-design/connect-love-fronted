"use client";

import { useState, useEffect, useRef } from "react";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical, Send, Check, CheckCheck, Search } from "lucide-react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Messages() {
 const [activeId, setActiveId] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [draft, setDraft] = useState("");
 const bottomRef = useRef<HTMLDivElement>(null);
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
 const { messages, sendMessage } = useChatWebSocket(token, activeId);

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

 useEffect(() => {
   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

 const handleSend = async (e?: React.FormEvent) => {
   if (e) e.preventDefault();
   if (!draft.trim() || !activeId || !active) return;
   sendMessage(active.userId, draft.trim());
   setDraft("");
 };

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
 {m.lastMessage}
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
 <Button variant="ghost" size="icon" onClick={() => alert("Calling...")}><Phone className="h-[1.111vw] w-[1.111vw]" /></Button>
 <Button variant="ghost" size="icon" onClick={() => alert("Starting video...")}><Video className="h-[1.111vw] w-[1.111vw]" /></Button>
 
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
 {m.content}
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
 {m.content}
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
 placeholder="Type a message…" 
 className="h-[2.778vw] rounded-full px-4 border-none bg-muted/50" 
 />
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
 );
}
