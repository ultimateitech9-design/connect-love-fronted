"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Ban, Clock, Sparkles, Star, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; 
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type MatchStatus = "PENDING" | "MATCHED" | "DECLINED" | "BLOCKED";
type DBMatch = { id: string; senderId: string; receiverId: string; status: MatchStatus; isSuperLike?: boolean; createdAt?: string };

export default function MatchesDashboard() {
 const [activeMatches, setActiveMatches] = useState<DBMatch[]>([]);
 const [sentLikes, setSentLikes] = useState<DBMatch[]>([]);
 const [receivedLikes, setReceivedLikes] = useState<DBMatch[]>([]);
 const [blockedUsers, setBlockedUsers] = useState<DBMatch[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [pendingTab, setPendingTab] = useState<"sent" | "received" | "super">("sent");
 const [myId, setMyId] = useState<string | null>(null);

 useEffect(() => {
   const token = getToken();
   if (token) {
     try {
       const payload = JSON.parse(atob(token.split('.')[1]));
       setMyId(payload.userId || payload.sub);
     } catch(e) {}
   }
 }, []);

 const getProfile = (m: any) => {
   if (!myId) return null;
   const targetId = m.senderId === myId ? m.receiverId : m.senderId;
   const realProfile = m.senderId === myId ? m.receiver : m.sender;
   if (!realProfile) return null;
   return {
     ...realProfile,
     name: realProfile.name || "Unknown",
     age: realProfile.age || 25,
     photo: (realProfile.photos && realProfile.photos.length > 0) ? realProfile.photos[0] : (realProfile.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"),
     online: realProfile.showOnlineStatus === false ? false : !!realProfile.isOnline
   };
 };

 const fetchMatches = async () => {
   try {
     const token = getToken();
     if (!token) return;
     
     // Fetch all categories simultaneously
     const [activeRes, sentRes, receivedRes, blockedRes] = await Promise.all([
       fetch("http://localhost:3001/matches?filter=active", { headers: { Authorization: `Bearer ${token}` } }),
       fetch("http://localhost:3001/matches?filter=sent", { headers: { Authorization: `Bearer ${token}` } }),
       fetch("http://localhost:3001/matches?filter=received", { headers: { Authorization: `Bearer ${token}` } }),
       fetch("http://localhost:3001/matches?filter=blocked", { headers: { Authorization: `Bearer ${token}` } })
     ]);

     const [active, sent, received, blocked] = await Promise.all([
       activeRes.json(), sentRes.json(), receivedRes.json(), blockedRes.json()
     ]);

     if (!Array.isArray(active)) {
         setIsLoading(false);
         return;
     }

     setActiveMatches(active);
     setSentLikes(sent);
     setReceivedLikes(received);
     setBlockedUsers(blocked);
   } catch (error) {
     console.error("Failed to fetch matches", error);
   } finally {
     setIsLoading(false);
   }
 };

 useEffect(() => {
   fetchMatches();
 }, []);

 const handleBlock = async (id: string) => {
   try {
     await fetch(`http://localhost:3001/matches/block/${id}`, {
       method: "PATCH",
       headers: { "Authorization": `Bearer ${getToken()}` },
     });
     toast.success("User blocked successfully");
     fetchMatches(); // refresh all lists
   } catch (error) {
     console.error("Failed to block user", error);
   }
 };

 const handleUnblock = async (id: string) => {
   try {
     await fetch(`http://localhost:3001/matches/unblock/${id}`, {
       method: "PATCH",
       headers: { "Authorization": `Bearer ${getToken()}` },
     });
     toast.success("User unblocked successfully");
     fetchMatches();
   } catch (error) {
     console.error("Failed to unblock user", error);
   }
 };

 const handleWithdrawLike = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/matches/unblock/${id}`, { // Using unblock (delete) to withdraw
        method: "PATCH",
        headers: { "Authorization": `Bearer ${getToken()}` },
      });
      toast.success("Like withdrawn");
      setSentLikes(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to withdraw", error);
    }
 };

 const handleAcceptMatch = async (matchId: string, profileName: string) => {
   try {
     await fetch(`http://localhost:3001/matches/respond`, {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
       body: JSON.stringify({ matchId, action: "accept" }),
     });
     toast.success(`It's a Match! You and ${profileName} are now connected.`);
     fetchMatches();
   } catch (error) {
     console.error("Failed to accept match", error);
   }
 };

 const handlePassMatch = async (matchId: string) => {
   try {
     await fetch(`http://localhost:3001/matches/respond`, {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
       body: JSON.stringify({ matchId, action: "decline" }),
     });
     toast.success("Passed on profile.");
     setReceivedLikes(prev => prev.filter(m => m.id !== matchId));
   } catch (error) {
     console.error("Failed to pass match", error);
   }
 };

 const totalPending = sentLikes.length + receivedLikes.length;
 const superLikes = sentLikes.filter(m => m.isSuperLike);
 const normalSentLikes = sentLikes.filter(m => !m.isSuperLike);

 if (isLoading) return <div className="p-8 flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>;

 return (
 <div className="space-y-6">
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
     <div>
       <h1 className="text-2xl font-semibold text-slate-800">Your Matches</h1>
       <p className="text-sm text-muted-foreground mt-1">Manage your active conversations, pending likes, and restricted accounts.</p>
     </div>
   </div>

   <Tabs defaultValue="active" className="w-full">
     <TabsList className="mb-6 inline-flex h-auto rounded-full bg-slate-100 p-1 text-slate-500">
       <TabsTrigger value="active" className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm transition-all">
         Active Matches ({activeMatches.length})
       </TabsTrigger>
       <TabsTrigger value="pending" className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm transition-all">
         Pending Requests ({totalPending})
       </TabsTrigger>
       <TabsTrigger value="blocked" className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm transition-all">
         Blocked Users ({blockedUsers.length})
       </TabsTrigger>
     </TabsList>

     {/* ACTIVE MATCHES */}
     <TabsContent value="active" className="mt-0 focus-visible:outline-none">
       <div className="mb-6"><p className="text-sm text-muted-foreground">You have {activeMatches.length} active matches. Say hello!</p></div>
       {activeMatches.length === 0 ? (
         <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-muted-foreground">No active matches yet.</div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {activeMatches.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all">
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <Avatar className="h-12 w-12">
                       <AvatarImage src={profile.photo} />
                       <AvatarFallback>{profile.name[0]}</AvatarFallback>
                     </Avatar>
                     {profile.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                   </div>
                   <div>
                     <p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age}</p>
                     <p className="text-xs text-slate-400">Matched recently</p>
                   </div>
                 </div>
                 <p className="mt-4 line-clamp-2 text-sm text-slate-500">{profile.lastMessage || profile.bio || "No messages yet. Send a message to start the conversation!"}</p>
                 <div className="mt-5 flex gap-2 items-center">
                   <Link href={`/user/messages?id=${m.id}`} className="flex-1">
                     <Button className="w-full rounded-xl bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90 text-white shadow-sm">
                       <MessageSquare className="mr-2 h-4 w-4" /> Message
                     </Button>
                   </Link>
                   <Button onClick={() => handleBlock(m.id)} variant="outline" size="icon" className="rounded-full w-10 h-10 border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors shrink-0">
                     <Ban className="h-4 w-4" />
                   </Button>
                 </div>
               </motion.div>
             );
           })}
         </div>
       )}
     </TabsContent>

     {/* PENDING REQUESTS */}
     <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
       <div className="mb-4"><p className="text-sm text-muted-foreground">Manage likes you have sent and received.</p></div>
       
       <div className="flex gap-2 mb-6">
         <button onClick={() => setPendingTab('sent')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", pendingTab === 'sent' ? "bg-rose-100 text-[color:var(--brand)]" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           Sent Likes ({normalSentLikes.length})
         </button>
         <button onClick={() => setPendingTab('received')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", pendingTab === 'received' ? "bg-rose-100 text-[color:var(--brand)]" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           Likes Received ({receivedLikes.length})
         </button>
         <button onClick={() => setPendingTab('super')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center", pendingTab === 'super' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           <Star className="w-3.5 h-3.5 mr-1.5 fill-current" /> Super Likes ({superLikes.length})
         </button>
       </div>

       {pendingTab === 'sent' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {normalSentLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12 grayscale-[20%]">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age}</p>
                     <p className="text-xs text-slate-400">Liked recently</p>
                   </div>
                 </div>
                 <p className="mt-4 line-clamp-2 text-sm text-slate-500">{profile.bio}</p>
                 <div className="mt-5 flex flex-col gap-2">
                   <div className="w-full flex items-center justify-center rounded-full border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-400">
                     <Clock className="mr-2 h-4 w-4 opacity-70" /> Pending Approval
                   </div>
                   <button onClick={() => handleWithdrawLike(m.id)} className="text-xs text-slate-400 hover:text-slate-600 text-center py-1 mt-1 transition-colors">
                     Withdraw Like
                   </button>
                 </div>
               </motion.div>
             );
           })}
           {normalSentLikes.length === 0 && <div className="col-span-full text-slate-400 text-sm py-4">No sent likes yet.</div>}
         </div>
       )}

       {pendingTab === 'received' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {receivedLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             const isSuper = m.isSuperLike;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={cn(
                 "relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all",
                 isSuper ? "border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border border-slate-100 border-l-4 border-l-[color:var(--brand)]"
               )}>
                 {isSuper && (
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent pointer-events-none" />
                 )}
                 <div className="relative z-10 flex items-center gap-3">
                   <Avatar className={cn("h-12 w-12", isSuper && "ring-2 ring-blue-300 ring-offset-2")}>
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-800">
                       {profile.name}, {profile.age} {isSuper && <Star className="inline-block w-4 h-4 ml-1 mb-0.5 text-blue-500 fill-blue-500" />}
                     </p>
                     <p className={cn("text-xs font-medium", isSuper ? "text-blue-500" : "text-[color:var(--brand)]")}>
                       {isSuper ? "Super Liked you!" : "Liked you!"}
                     </p>
                   </div>
                 </div>
                 <p className="relative z-10 mt-4 line-clamp-2 text-sm text-slate-500">{profile.bio}</p>
                 <div className="relative z-10 mt-5 flex gap-2">
                   <Button className={cn("flex-1 rounded-full text-white shadow-sm", isSuper ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" : "bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90")} onClick={() => handleAcceptMatch(m.id, profile.name)}>
                     Match
                   </Button>
                   <Button variant="outline" className="rounded-full border-slate-200 text-slate-400 hover:text-red-500 shrink-0" onClick={() => handlePassMatch(m.id)}>
                     Pass
                   </Button>
                 </div>
               </motion.div>
             );
           })}
           {receivedLikes.length === 0 && <div className="col-span-full text-slate-400 text-sm py-4">No pending likes received.</div>}
         </div>
       )}

       {pendingTab === 'super' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {superLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={m.id} className="relative group rounded-2xl bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-[0_4px_20px_rgb(251,191,36,0.15)] border border-amber-200 transition-all hover:shadow-[0_8px_30px_rgb(251,191,36,0.25)] hover:-translate-y-1 overflow-hidden">
                 <div className="absolute -right-4 -top-4 opacity-10 rotate-12 pointer-events-none">
                   <Star className="w-24 h-24 text-amber-500 fill-amber-500" />
                 </div>
                 <div className="relative z-10 flex items-center gap-3">
                   <Avatar className="h-12 w-12 ring-2 ring-amber-300 shadow-md">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age}</p>
                     <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                       <Star className="w-3 h-3 fill-current" /> Super Liked!
                     </p>
                   </div>
                 </div>
                 <p className="relative z-10 mt-4 line-clamp-2 text-sm text-slate-600">{profile.bio}</p>
                 <div className="relative z-10 mt-5 flex flex-col gap-2">
                   <div className="w-full flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-sm font-bold text-white shadow-sm animate-pulse">
                     <Star className="mr-1.5 h-4 w-4 fill-current" /> Awaiting Match
                   </div>
                   <button onClick={() => handleWithdrawLike(m.id)} className="text-xs text-slate-400 hover:text-slate-600 text-center py-1 mt-1 transition-colors">
                     Withdraw Super Like
                   </button>
                 </div>
               </motion.div>
             );
           })}
           {superLikes.length === 0 && <div className="col-span-full text-amber-600/60 text-sm py-4 font-medium">You haven't super liked anyone yet.</div>}
         </div>
       )}
     </TabsContent>

     {/* BLOCKED USERS */}
     <TabsContent value="blocked" className="mt-0 focus-visible:outline-none">
       <div className="mb-6"><p className="text-sm text-muted-foreground">Users you have blocked ({blockedUsers.length}).</p></div>
       {blockedUsers.length === 0 ? (
         <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-muted-foreground">You haven't blocked anyone.</div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {blockedUsers.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={m.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-5 shadow-sm grayscale opacity-70 transition-all hover:opacity-100">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-700 line-through decoration-slate-400">{profile.name}, {profile.age}</p>
                     <p className="text-xs font-medium text-slate-500">Blocked</p>
                   </div>
                 </div>
                 <div className="mt-5">
                   <Button onClick={() => handleUnblock(m.id)} className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm">
                     <UserCheck className="mr-2 h-4 w-4" /> Unblock User
                   </Button>
                 </div>
               </motion.div>
             );
           })}
         </div>
       )}
     </TabsContent>
   </Tabs>
 </div>
 );
}
