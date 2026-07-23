import { API_ORIGIN } from "@/config/runtime";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, X, Heart, Star, BadgeCheck, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";
import { BoostDialog } from "@/features/boost/BoostDialog";
import { formatDistance } from "@/lib/distance";

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  photo?: string;
  photos?: string[];
  photoCount?: number;
  images?: string[];
  avatarUrl?: string;
  profession: string;
  religion?: string;
  zodiac?: string;
  birthDate?: string;
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

const ZODIAC_RANGES = [
  { sign: "Capricorn", emoji: "♑", from: 1222 }, { sign: "Aquarius", emoji: "♒", from: 120 },
  { sign: "Pisces", emoji: "♓", from: 219 }, { sign: "Aries", emoji: "♈", from: 321 },
  { sign: "Taurus", emoji: "♉", from: 420 }, { sign: "Gemini", emoji: "♊", from: 521 },
  { sign: "Cancer", emoji: "♋", from: 621 }, { sign: "Leo", emoji: "♌", from: 723 },
  { sign: "Virgo", emoji: "♍", from: 823 }, { sign: "Libra", emoji: "♎", from: 923 },
  { sign: "Scorpio", emoji: "♏", from: 1023 }, { sign: "Sagittarius", emoji: "♐", from: 1122 },
] as const;

function zodiacDisplay(sign?: string, birthDate?: string) {
  let resolvedSign = sign;
  if (!resolvedSign && birthDate) {
    const date = new Date(`${birthDate.slice(0, 10)}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      const monthDay = (date.getMonth() + 1) * 100 + date.getDate();
      resolvedSign = ([...ZODIAC_RANGES].reverse().find((item) => monthDay >= item.from) ?? ZODIAC_RANGES[0]).sign;
    }
  }
  const zodiac = ZODIAC_RANGES.find((item) => item.sign === resolvedSign);
  return zodiac ? `${zodiac.emoji} ${zodiac.sign}` : null;
}

const API = API_ORIGIN;

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
  const [boostOpen, setBoostOpen] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(true);
  const isDraggingRef = useRef(false);
  const keyboardActionsRef = useRef({
    pass: () => {},
    like: () => {},
    superLike: () => {},
    openProfile: () => {},
    closeProfile: () => {},
    nextPhoto: () => {},
  });

  // Photo carousel state
  const [photoIndex, setPhotoIndex] = useState(0);
  const pointerDownTime = useRef<number>(0);
  const pointerDownPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIdx(0);
  }, [profiles]);

  useEffect(() => {
    setPhotoIndex(0);
    setDetailedProfile(null);
    setShowDetails(false);
  }, [idx]);

  useEffect(() => {
    // Show instruction briefly on new profile
    setInstructionVisible(true);
    const t = setTimeout(() => setInstructionVisible(false), 1800);
    return () => clearTimeout(t);
  }, [idx]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") return;
      if (event.repeat) return;

      const actions = keyboardActionsRef.current;
      if (event.key === "ArrowLeft") actions.pass();
      else if (event.key === "ArrowRight") actions.like();
      else if (event.key === "ArrowUp") actions.openProfile();
      else if (event.key === "ArrowDown") actions.closeProfile();
      else if (event.key === "Enter") actions.superLike();
      else if (event.code === "Space") actions.nextPhoto();
      else return;

      event.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [40, 160], [0, 1]);
  const nopeOpacity = useTransform(x, [-160, -40], [1, 0]);
  const superLikeOpacity = useTransform(y, [-160, -40], [1, 0]);

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
  const profileDistanceLabel = formatDistance(profileDistanceKm);
  const profileReligion = profile.religion?.trim();



  const advance = (action: Action) => {
    if (action === "like") toast.success(`You liked ${profile.name}`);
    if (action === "super") toast.success(`Super liked ${profile.name}`);
    if (action === "pass") toast(`Passed on ${profile.name}`);
    if (onAction) onAction(profile.id, action);
    setIdx((i) => i + 1);
    x.set(0);
    y.set(0);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const horizontalThreshold = 120;
    const upwardThreshold = 100;
    const isUpwardSwipe = info.offset.y < -upwardThreshold
      && Math.abs(info.offset.y) > Math.abs(info.offset.x);

    if (isUpwardSwipe) triggerSwipe("super");
    else if (info.offset.x > horizontalThreshold) advance("like");
    else if (info.offset.x < -horizontalThreshold) advance("pass");
    window.setTimeout(() => {
      isDraggingRef.current = false;
    }, 0);
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


  const cancelHold = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    pointerDownTime.current = 0;
  };

  const handleDragStart = () => {
    isDraggingRef.current = true;
    pointerDownTime.current = 0;
    setInstructionVisible(false);
    cancelHold();
  };

  const openProfileDetails = () => {
    if (showDetails || isDraggingRef.current) return;
    setInstructionVisible(false);
    setShowDetails(true);
    if (!detailedProfile) fetchDetails();
  };

  keyboardActionsRef.current = {
    pass: () => triggerSwipe("pass"),
    like: () => triggerSwipe("like"),
    superLike: () => triggerSwipe("super"),
    openProfile: openProfileDetails,
    closeProfile: () => setShowDetails(false),
    nextPhoto: () => {
      if (showDetails || currentPhotos.length < 2) return;
      setPhotoIndex((current) => (current + 1) % currentPhotos.length);
    },
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

      <div className="absolute inset-0 -z-10 hidden scale-[0.96] opacity-70 sm:block">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-lg">
          {nextDisplayPhoto ? (
            <img
              src={nextDisplayPhoto}
              alt=""
              width={460}
              height={575}
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={profile.id + idx}
          drag={showDetails || isSuperLiking ? false : true}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.6}
          style={{
            x: showDetails || isSuperLiking ? 0 : x,
            y: showDetails || isSuperLiking ? 0 : y,
            rotate: showDetails || isSuperLiking ? 0 : rotate
          }}
          onDragEnd={onDragEnd}
          onDragStart={handleDragStart}
          onClick={openProfileDetails}
          initial={false}
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
            <img
              src={currentDisplayPhoto}
              alt={profile.name}
              width={460}
              height={575}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              className="h-full w-full select-none object-cover"
            />
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
                Click to view full profile
              </motion.div>
            )}
          </AnimatePresence>

          {!showDetails && currentPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex((prev) => Math.max(prev - 1, 0));
                }}
                disabled={photoIndex === 0}
                className="absolute left-3 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setPhotoIndex((prev) => Math.min(prev + 1, currentPhotos.length - 1));
                }}
                disabled={photoIndex >= currentPhotos.length - 1}
                className="absolute right-3 top-1/2 z-30 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

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
              <motion.div
                style={{ opacity: superLikeOpacity }}
                className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 rounded-lg border-[3px] border-cyan-400 px-3 py-1 text-xl font-extrabold tracking-wider text-cyan-300"
              >
                SUPER LIKE
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
              {profile.showDistance !== false && profileDistanceLabel && (
                <>
                  <MapPin className="h-4 w-4" />
                  {profileDistanceLabel} ·
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="h-[6px] w-[48px] rounded-full bg-slate-300 dark:bg-slate-700" />
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowDetails(false);
                }}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
                aria-label="Close profile details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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
                    {(detailedProfile.religion || profileReligion) && (
                      <p className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/50">
                        Religion: {detailedProfile.religion || profileReligion}
                      </p>
                    )}
                  </div>

                      <div className="flex flex-wrap gap-3">
                    {detailedProfile.height && (
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                        📏 {detailedProfile.height}
                      </div>
                    )}
                    {detailedProfile.religion && (
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                        🙏 {detailedProfile.religion}
                      </div>
                    )}
                    {zodiacDisplay(detailedProfile.zodiac || profile.zodiac, detailedProfile.birthDate || profile.birthDate) && (
                      <div className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 ring-1 ring-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-900/50">
                        {zodiacDisplay(detailedProfile.zodiac || profile.zodiac, detailedProfile.birthDate || profile.birthDate)}
                      </div>
                    )}
                    {detailedProfile.city && (
                      <div className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-foreground">
                        📍 {detailedProfile.city}
                      </div>
                    )}
                    {detailedProfile.showDistance !== false && formatDistance(detailedProfile.distanceKm) && (
                      <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{formatDistance(detailedProfile.distanceKm)} from you</span>
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

      <div className="relative z-10 mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-6 sm:gap-4">
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
        <button type="button" onClick={() => setBoostOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border-2 border-amber-300 bg-card text-amber-500 shadow-md transition hover:scale-105 sm:h-[48px] sm:w-[48px]" aria-label="Boost your profile" title="Boost your profile">
          <Zap className="h-5 w-5" strokeWidth={2.5} fill="currentColor" />
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
        Swipe right to like · Swipe left to pass · Swipe up to super like
      </p>
      <div className="mt-4 flex min-h-8 items-center justify-center border-t border-border/60 pt-3 text-[10px] font-semibold text-muted-foreground">
        {showKeyboardHints ? (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={() => setShowKeyboardHints(false)}
              className="rounded-full bg-foreground px-3 py-1 text-background transition-opacity hover:opacity-80"
            >
              Hide
            </button>
            {[
              ["←", "Nope"],
              ["→", "Like"],
              ["↑", "Open Profile"],
              ["↵", "Super Like"],
              ["↓", "Close Profile"],
              ["Space", "Next Photo"],
            ].map(([key, label]) => (
              <span key={label} className="inline-flex items-center gap-1 whitespace-nowrap">
                <kbd className="grid min-h-4 min-w-4 place-items-center rounded border border-border bg-muted px-1 text-[9px] leading-none text-foreground shadow-sm">
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowKeyboardHints(true)}
            className="rounded-full border border-border bg-muted px-3 py-1 transition-colors hover:text-foreground"
          >
            Show keyboard controls
          </button>
        )}
      </div>
      <BoostDialog open={boostOpen} onClose={() => setBoostOpen(false)} />
    </div>
  );
}
