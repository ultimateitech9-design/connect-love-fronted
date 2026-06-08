import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface BlockedCardProps {
 matchId: string;
 profile: any;
 onUnblock: (id: string) => void;
}

export function BlockedCard({ matchId, profile, onUnblock }: BlockedCardProps) {
 return (
 <div className="rounded-2xl bg-muted/50 border border-border p-5 shadow-sm opacity-90 transition-all hover:opacity-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
 <div className="flex items-center gap-3">
 <div className="relative">
 <Avatar className="h-[3.889vw] w-[3.889vw] grayscale opacity-80">
 <AvatarImage src={profile.photo || profile.avatarUrl} />
 <AvatarFallback>{profile.name?.[0]}</AvatarFallback>
 </Avatar>
 </div>
 <div>
 <p className="text-base font-semibold text-foreground">{profile.name}, {profile.age}</p>
 <p className="text-xs text-muted-foreground">Blocked Account</p>
 </div>
 </div>
 <p className="mt-3 line-clamp-2 text-sm text-muted-foreground italic">
 This account is currently blocked and cannot contact you.
 </p>
 <div className="mt-4 flex gap-2">
 <Button 
 onClick={() => onUnblock(matchId)} 
 variant="outline" 
 className="w-full bg-card border-border text-foreground hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
 >
 Unblock Account
 </Button>
 </div>
 </div>
 );
}
