import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReceivedRequestCardProps {
 matchId: string;
 profile: any;
 isSuperLike?: boolean;
 onAccept: (id: string) => void;
 onDecline: (id: string) => void;
}

export function ReceivedRequestCard({ matchId, profile, isSuperLike, onAccept, onDecline }: ReceivedRequestCardProps) {
 return (
 <div className={cn(
 "rounded-2xl p-5 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
 isSuperLike 
 ? "border-2 border-cyan-400 bg-cyan-500/5 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]" 
 : "border border-primary/20 bg-primary/5 hover:shadow-md"
 )}>
 <div className="flex items-center gap-3">
 <div className="relative">
 <Avatar className="h-[3.889vw] w-[3.889vw]">
 <AvatarImage src={profile.photo || profile.avatarUrl} />
 <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
 </Avatar>
 </div>
 <div>
 <div className="flex items-center gap-1.5">
 <p className="text-base font-semibold text-foreground">{profile.name}, {profile.age}</p>
 {isSuperLike && <Star className="h-[1.111vw] w-[1.111vw] text-cyan-500 fill-cyan-500 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />}
 </div>
 <p className={cn("text-xs font-medium", isSuperLike ? "text-cyan-600" : "text-primary")}>
 {isSuperLike ? "Super Liked you!" : "Likes you!"}
 </p>
 </div>
 </div>
 <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
 {profile.bio || "They liked you! Accept the match to start chatting."}
 </p>
 <div className="mt-4 flex gap-2">
 <Button onClick={() => onAccept(matchId)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
 <Heart className="mr-2 h-[1.111vw] w-[1.111vw]" /> Accept Match
 </Button>
 <Button onClick={() => onDecline(matchId)} variant="outline" size="icon" className="hover:text-destructive hover:border-destructive transition-colors bg-card text-foreground">
 <X className="h-[1.111vw] w-[1.111vw]" />
 </Button>
 </div>
 </div>
 );
}
