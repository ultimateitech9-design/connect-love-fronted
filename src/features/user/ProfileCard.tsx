import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { MapPin, X, Heart, Star, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  photo?: string;
  photos?: string[];
  images?: string[];
  avatarUrl?: string;
  profession: string;
  distanceKm?: number | null;
  distanceMi?: number | null;
  goals?: string | null;
  bio?: string;
  height?: string;
  city?: string;
  personality?: string[];
  hobbies?: string[];
  verified?: boolean;
  isVerified?: boolean;
  interests?: string[];
  showDistance?: boolean;
  photosVisibleToNonMatches?: boolean;
}

export interface ProfileCardProps {
  profiles: Profile[];
  onAction?: (id: string, action: string) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

type Action = "pass" | "like" | "super";

export function ProfileCard({ profiles, onAction }: ProfileCardProps) {
  const [idx, setIdx] = useState(0);

  // Hold-to-view state
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailedProfile, setDetailedProfile] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [instructionVisible, setInstructionVisible] = useState(true);
  const [isSuperLiking, setIsSuperLiking] = useState(false);

  // Photo carousel state
  const [photoIndex, setPhotoIndex] = useState(0);
  const pointerDownTime = useRef<number>(0);
  const pointerDownPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIdx(0);
  }, [profiles]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [idx]);

  useEffect(() => {
    // Show instruction briefly on new profile
    setInstructionVisible(true);
    const t = setTimeout(() => setInstructionVisible(false), 3000);
    return () => clearTimeout(t);
  }, [idx]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [40, 160], [0, 1]);
  const nopeOpacity = useTransform(x, [-160, -40], [1, 0]);

  if (profiles.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full max-w-[min(92vw,460px)] flex-col items-center justify-center rounded-3xl bg-card p-6 text-center shadow-xl border border-border sm:p-8">
        <div className="mb-4 grid h-[64px] w-[64px] place-items-center rounded-full bg-rose-50 dark:bg-rose-950/30">
          <X className="h-[32px] w-[32px] text-rose-300 dark:text-rose-500" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">No matches found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters to see more people.</p>
      </div>
    );
  }

  const profile = profiles[idx % profiles.length];
  const next = profiles[(idx + 1) % profiles.length];

  const currentPhotos = profile.photos && profile.photos.length > 0 ? profile.photos : (profile.photo ? [profile.photo] : []);
  const currentDisplayPhoto = currentPhotos[photoIndex] || currentPhotos[0] || null;
  const nextPhotos = next.photos && next.photos.length > 0 ? next.photos : (next.photo ? [next.photo] : []);
  const nextDisplayPhoto = nextPhotos[0] || null;
  const profileDistanceKm = profile.distanceKm ?? profile.distanceMi ?? null;



  const advance = (action: Action) => {
    if (action === "like") toast.success(`You liked ${profile.name}`);
    if (action === "super") toast.success(`Super liked ${profile.name}`);
    if (action === "pass") toast(`Passed on ${profile.name}`);
    if (onAction) onAction(profile.id, action);
    setIdx((i) => i + 1);
    x.set(0);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 120;
    if (info.offset.x > threshold) advance("like");
    else if (info.offset.x < -threshold) advance("pass");
  };

  const triggerSwipe = (action: Action) => {
    if (action === "super") {
      setIsSuperLiking(true);
      setTimeout(() => {
        advance("super");
        setIsSuperLiking(false);
      }, 1000);
      return;
    }
    const target = action === "like" ? 600 : action === "pass" ? -600 : 0;
    x.set(target);
    setTimeout(() => advance(action), 180);
  };

  // --- Hold-to-view interaction ---
  const fetchDetails = async () => {
    setLoadingDetails(true);
    try {
      const token = getToken();
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API}/users/${profile.id}/details`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDetailedProfile(data);
      } else {
        setDetailedProfile(profile);
      }
    } catch (e) {
      setDetailedProfile(profile);
    } finally {
      setLoadingDetails(false);
    }
  };

  const startHold = (e: React.PointerEvent) => {
    pointerDownTime.current = Date.now();
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    setInstructionVisible(false);

    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    holdTimeoutRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
      }
      setShowDetails(true);
      fetchDetails();
    }, 200);
  };

  const cancelHold = (e?: React.PointerEvent) => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    if (e && !showDetails && pointerDownTime.current > 0 && e.type !== 'pointerleave' && e.type !== 'pointercancel') {
      const timeElapsed = Date.now() - pointerDownTime.current;
      const dx = Math.abs(e.clientX - pointerDownPos.current.x);
      const dy = Math.abs(e.clientY - pointerDownPos.current.y);

      // Tap threshold: < 200ms and minimal movement
      if (timeElapsed < 200 && dx < 10 && dy < 10) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const xPos = e.clientX - rect.left;

        if (xPos > rect.width * 0.4) {
          // Tap right
          setPhotoIndex(prev => Math.min(prev + 1, currentPhotos.length - 1));
        } else {
          // Tap left
          setPhotoIndex(prev => Math.max(prev - 1, 0));
        }
      }
    }

    pointerDownTime.current = 0;
    if (showDetails && e && e.type === 'pointerup') {
      setShowDetails(false);
    }
  };

  const handleDragStart = () => {
    pointerDownTime.current = 0;
    cancelHold();
  };

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,460px)]">

      {/* Particle Explosion for Super Like */}
      <AnimatePresence>
        {isSuperLiking && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    x: Math.cos((angle * Math.PI) / 180) * 200,
                    y: Math.sin((angle * Math.PI) / 180) * 200,
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute"
                >
                  <Star className="h-6 w-6 fill-cyan-400 text-cyan-200" />
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 -z-10 scale-[0.96] opacity-70">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-lg">
          {nextDisplayPhoto ? (
            <img src={nextDisplayPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={profile.id + idx}
          drag={showDetails ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          style={{
            x: showDetails || isSuperLiking ? 0 : x,
            rotate: showDetails || isSuperLiking ? 0 : rotate
          }}
          onDragEnd={onDragEnd}
          onDragStart={handleDragStart}
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={
            isSuperLiking
              ? {
                  scale: [1, 0.9, 1.1],
                  y: [0, 20, -800],
                  opacity: [1, 1, 0],
                  boxShadow: [
                    "0 0 0px 0px rgba(6, 182, 212, 0)",
                    "0 0 60px 20px rgba(6, 182, 212, 0.8)",
                    "0 0 60px 20px rgba(6, 182, 212, 0)"
                  ],
                  zIndex: 60
                }
              : {
                  scale: showDetails ? 1.05 : 1,
                  opacity: 1,
                  y: 0,
                  boxShadow: "0 0 0px 0px rgba(6, 182, 212, 0)",
                  zIndex: showDetails ? 50 : 10
                }
          }
          exit={{ opacity: 0 }}
          transition={
            isSuperLiking
              ? { duration: 1, times: [0, 0.3, 1], ease: "easeInOut" }
              : { type: "spring", stiffness: 300, damping: 28 }
          }
          className="relative aspect-[4/5] w-full cursor-grab overflow-hidden rounded-3xl bg-slate-900 shadow-2xl active:cursor-grabbing border border-white/5"
        >
          {currentDisplayPhoto ? (
            <img src={currentDisplayPhoto} alt={profile.name} draggable={false} className="h-full w-full select-none object-cover" />
          ) : (
            <div className="h-full w-full bg-slate-800" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Top Segments */}
          {!showDetails && currentPhotos.length > 1 && (
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-20 pointer-events-none">
              {currentPhotos.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full ${i === photoIndex ? 'bg-pink-500 shadow-sm' : 'bg-white/30'}`}
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {instructionVisible && !showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            className="absolute left-1/2 top-4 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-center text-xs font-medium text-white backdrop-blur-md sm:top-6 sm:px-4"
              >
                Hold to view full bio
              </motion.div>
            )}
          </AnimatePresence>

          {!showDetails && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="pointer-events-none absolute left-5 top-6 rotate-[-12deg] rounded-lg border-[3px] border-emerald-500 px-3 py-1 text-xl font-extrabold tracking-wider text-emerald-500"
              >
                LIKE
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="pointer-events-none absolute right-5 top-6 rotate-[12deg] rounded-lg border-[3px] border-rose-500 px-3 py-1 text-xl font-extrabold tracking-wider text-rose-500"
              >
                NOPE
              </motion.div>
            </>
          )}

          <motion.div
            animate={{ opacity: showDetails ? 0 : 1 }}
            className="absolute inset-x-0 bottom-0 p-4 text-white pointer-events-none sm:p-6"
          >
            <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="min-w-0 max-w-full text-2xl font-semibold leading-tight tracking-tight drop-shadow-sm sm:text-3xl">
                {profile.name}{profile.age ? `, ${profile.age}` : ""}
              </h3>
              {(profile.verified || profile.isVerified) && (
                <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-400 drop-shadow-sm sm:h-[22px] sm:w-[22px]" strokeWidth={2.6} />
              )}
            </div>
            {(profile.verified || profile.isVerified) && (
              <div className="mt-0.5 text-sm font-medium text-white/90">
                Verified &middot; Free Member
              </div>
            )}
            <div className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
              {profile.showDistance !== false && typeof profileDistanceKm === "number" && (
                <>
                  <MapPin className="h-4 w-4" />
                  {profileDistanceKm} km away ·
                </>
              )}
              {profile.profession}
            </div>
            {profile.goals && <div className="mt-1 inline-block rounded-md bg-white/20 dark:bg-black/40 px-2 py-0.5 text-xs font-medium backdrop-blur-sm">
            {profile.goals}
          </div>}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(profile.interests ?? []).map((t) => (
              <span key={t} className="rounded-full bg-white/20 dark:bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur-sm border border-white/10 dark:border-white/5">
                {t}
              </span>
            ))}
          </div>
          </motion.div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="absolute inset-x-0 bottom-0 flex h-[78%] flex-col rounded-t-3xl bg-card/95 p-4 text-foreground shadow-2xl backdrop-blur-xl sm:h-[75%] sm:p-6"
          >
            <div className="mx-auto mb-4 h-[6px] w-[48px] rounded-full bg-slate-300 dark:bg-slate-700" />

            <div className="flex-1 overflow-y-auto pr-2 pb-10">
              {loadingDetails && !detailedProfile ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-[32px] w-[32px] animate-spin text-rose-500" />
                </div>
              ) : detailedProfile ? (
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <div className="flex max-w-full flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="min-w-0 max-w-full text-2xl font-bold leading-tight text-foreground">
                        {detailedProfile.name}{detailedProfile.age ? `, ${detailedProfile.age}` : ""}
                      </h2>
                      {(detailedProfile.isVerified || detailedProfile.verified) && (
                        <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-400 sm:h-[22px] sm:w-[22px]" strokeWidth={2.6} />
                      )}
                    </div>
                    {(detailedProfile.isVerified || detailedProfile.verified) && (
                      <div className="mt-1 text-sm font-medium text-blue-900/80 dark:text-white/70">
                        Verified &middot; Free Member
                      </div>
                    )}
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {detailedProfile.profession}
                    </p>
                  </div>

                      <div className="flex flex-wrap gap-3">
                    {detailedProfile.height && (
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                        📏 {detailedProfile.height}
                      </div>
                    )}
                    {detailedProfile.city && (
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                        📍 {detailedProfile.city}
                      </div>
                    )}
                  </div>

                  {detailedProfile.bio && <div>
                    <h4 className="text-sm font-bold text-foreground mb-2">About Me</h4>
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                          {detailedProfile.bio}
                        </p>
                      </div>}

                      {detailedProfile.personality && detailedProfile.personality.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">Personality</h4>
                      <div className="flex flex-wrap gap-2">
                        {detailedProfile.personality.map((p: string) => (
                          <span key={p} className="rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900 px-3 py-1 text-xs font-semibold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                      {detailedProfile.hobbies && detailedProfile.hobbies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-2">Interests & Hobbies</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {detailedProfile.hobbies.map((h: string) => (
                          <div key={h} className="rounded-lg bg-muted/50 border border-border p-2 text-center text-xs font-medium text-foreground/90">
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mt-5 flex items-center justify-center gap-4 sm:mt-6 sm:gap-5">
        <button
          onClick={() => triggerSwipe("pass")}
          className="grid h-12 w-12 place-items-center rounded-full border-2 border-border bg-card text-muted-foreground shadow-md transition hover:scale-105 hover:border-rose-300 hover:text-rose-400 sm:h-[56px] sm:w-[56px]"
          aria-label="Pass"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => triggerSwipe("super")}
          className="grid h-11 w-11 place-items-center rounded-full border-2 border-border bg-card text-blue-400 shadow-md transition hover:scale-105 hover:border-blue-300 sm:h-[48px] sm:w-[48px]"
          aria-label="Super like"
        >
          <Star className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => triggerSwipe("like")}
          className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20 transition hover:scale-105 sm:h-14 sm:w-14"
          aria-label="Like"
        >
          <Heart className="h-6 w-6" strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Swipe right to like · Swipe left to pass
      </p>
    </div>
  );
}
