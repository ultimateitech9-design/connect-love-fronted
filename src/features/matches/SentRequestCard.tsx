import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock } from "lucide-react";

interface SentRequestCardProps {
 matchId: string;
 profile: any;
 onWithdraw: (id: string) => void;
}

export function SentRequestCard({ matchId, profile, onWithdraw }: SentRequestCardProps) {
 return (
 <div className="rounded-2xl bg-card p-5 shadow-sm opacity-80 transition-all hover:opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
 <div className="flex items-center gap-3">
 <div className="relative">
 <Avatar className="h-[3.889vw] w-[3.889vw] grayscale-[30%]">
 <AvatarImage src={profile.photo || profile.avatarUrl} />
 <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
 </Avatar>
 </div>
 <div>
 <p className="text-base font-semibold">{profile.name}, {profile.age}</p>
 <p className="text-xs text-muted-foreground">Liked recently</p>
 </div>
 </div>
 <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
 {profile.bio || "Waiting for them to like you back."}
 </p>
 <div className="mt-4 flex flex-col gap-2">
 <div className="flex-1 flex items-center justify-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
 <Clock className="mr-2 h-[1.111vw] w-[1.111vw] opacity-50" /> Pending Approval
 </div>
 {/* <button onClick={() => onWithdraw(matchId)} className="text-xs text-muted-foreground hover:text-red-500 hover:underline transition-colors mt-1 text-center">
 Withdraw Like
 </button> */}
 </div>
 </div>
 );
}
