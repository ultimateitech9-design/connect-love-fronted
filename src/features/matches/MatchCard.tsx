import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Ban, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchCardProps {
 matchId: string;
 profile: any;
 showOnlineStatus: boolean;
 isSuperLike?: boolean;
 onBlock: (id: string) => void;
}

export function MatchCard({ matchId, profile, showOnlineStatus, isSuperLike, onBlock }: MatchCardProps) {
 return (
 <div className={cn(
 "rounded-2xl p-5 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
 isSuperLike 
 ? "bg-cyan-500/5 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.35)]" 
 : "bg-card hover:shadow-md"
 )}>
 <div className="flex items-center gap-3">
 <div className="relative">
 <Avatar className="h-[3.889vw] w-[3.889vw]">
 <AvatarImage src={profile.photo || profile.avatarUrl} />
 <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
 </Avatar>
 {showOnlineStatus && profile.online && (
 <span className="absolute bottom-0 right-0 h-[0.972vw] w-[0.972vw] rounded-full border-2 border-card bg-emerald-500" />
 )}
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <p className="text-base font-semibold">{profile.name}, {profile.age}</p>
 {isSuperLike && <Star className="h-[1.111vw] w-[1.111vw] text-cyan-500 fill-cyan-500 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />}
 </div>
 <p className={cn("text-xs", isSuperLike ? "text-cyan-600 font-medium" : "text-muted-foreground")}>
 {isSuperLike ? "Super Match!" : "Matched recently"}
 </p>
 </div>
 </div>
 <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
 No messages yet. Send a message to start the conversation!
 </p>
 <div className="mt-4 flex gap-2">
 <Link href={`/user/messages?id=${profile.id}`} className="flex-1">
 <Button className="w-full bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90 text-white">
 <MessageSquare className="mr-2 h-[1.111vw] w-[1.111vw]" /> Message
 </Button>
 </Link>
 <Button onClick={() => onBlock(matchId)} variant="outline" size="icon" className="hover:text-red-500 hover:border-red-500 transition-colors">
 <Ban className="h-[1.111vw] w-[1.111vw]" />
 </Button>
 </div>
 </div>
 );
}
