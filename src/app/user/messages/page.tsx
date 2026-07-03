"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, MoreVertical, Send, Check, CheckCheck, Search, PhoneOff, Mic, MicOff, VideoOff, Volume2, VolumeX, Paperclip, Image as ImageIcon, X, MapPin, Briefcase, Ruler, SmilePlus, Gift, Palette, Lock, Sparkles, CreditCard, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 DropdownMenuSub,
 DropdownMenuSubTrigger,
 DropdownMenuSubContent,
 DropdownMenuPortal,
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
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const VOICE_MESSAGE_PREFIX = "__voice_message__:";
const PHOTO_MESSAGE_PREFIX = "__photo_message__:";
const VIDEO_MESSAGE_PREFIX = "__video_message__:";
const GIFT_MESSAGE_PREFIX = "__gift_message__:";
const CHAT_THEME_MESSAGE_PREFIX = "__chat_theme__:";
const MAX_VOICE_SECONDS = 60;
const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const CHAT_THEME_STORAGE_KEY = "connect-love-chat-theme";
type ChatTheme = {
 id: string;
 name: string;
 tier: "free" | "premium";
 price?: number;
 is3d?: boolean;
 colors: {
   accent: string;
   outgoing: string;
   incoming: string;
   panel: string;
   input: string;
   background: string;
 };
};

const FREE_CHAT_THEMES: ChatTheme[] = [
  { id: "free-rose", name: "Soft Rose", tier: "free", colors: { accent: "#fb7185", outgoing: "#fb7185", incoming: "#f4f4f5", panel: "#ffffff", input: "#fdf2f8", background: "linear-gradient(135deg,#fff7f9,#ffffff)" } },
  { id: "free-sky", name: "Clear Sky", tier: "free", colors: { accent: "#0ea5e9", outgoing: "#0ea5e9", incoming: "#e0f2fe", panel: "#ffffff", input: "#f0f9ff", background: "linear-gradient(135deg,#f0f9ff,#ffffff)" } },
  { id: "free-mint", name: "Fresh Mint", tier: "free", colors: { accent: "#10b981", outgoing: "#10b981", incoming: "#dcfce7", panel: "#ffffff", input: "#ecfdf5", background: "linear-gradient(135deg,#ecfdf5,#ffffff)" } },
  { id: "free-amber", name: "Warm Amber", tier: "free", colors: { accent: "#f59e0b", outgoing: "#f59e0b", incoming: "#fef3c7", panel: "#ffffff", input: "#fffbeb", background: "linear-gradient(135deg,#fffbeb,#ffffff)" } },
  { id: "free-violet", name: "Sweet Violet", tier: "free", colors: { accent: "#8b5cf6", outgoing: "#8b5cf6", incoming: "#ede9fe", panel: "#ffffff", input: "#f5f3ff", background: "linear-gradient(135deg,#f5f3ff,#ffffff)" } },
  { id: "free-ruby", name: "Classic Ruby", tier: "free", colors: { accent: "#e11d48", outgoing: "#e11d48", incoming: "#ffe4e6", panel: "#ffffff", input: "#fff1f2", background: "linear-gradient(135deg,#fff1f2,#ffffff)" } },
  { id: "free-teal", name: "Deep Teal", tier: "free", colors: { accent: "#14b8a6", outgoing: "#14b8a6", incoming: "#ccfbf1", panel: "#ffffff", input: "#f0fdfa", background: "linear-gradient(135deg,#f0fdfa,#ffffff)" } },
  { id: "free-slate", name: "Cool Slate", tier: "free", colors: { accent: "#475569", outgoing: "#475569", incoming: "#e2e8f0", panel: "#ffffff", input: "#f8fafc", background: "linear-gradient(135deg,#f8fafc,#ffffff)" } },
  { id: "free-cyan", name: "Bright Cyan", tier: "free", colors: { accent: "#06b6d4", outgoing: "#06b6d4", incoming: "#cffafe", panel: "#ffffff", input: "#ecfeff", background: "linear-gradient(135deg,#ecfeff,#ffffff)" } },
  { id: "free-peach", name: "Ripe Peach", tier: "free", colors: { accent: "#fb923c", outgoing: "#fb923c", incoming: "#fed7aa", panel: "#ffffff", input: "#fff7ed", background: "linear-gradient(135deg,#fff7ed,#ffffff)" } },
];

const PREMIUM_CHAT_THEMES: ChatTheme[] = [
  { id: "3d-hearts", name: "Lovely Hearts", tier: "premium", price: 49, is3d: true, colors: { accent: "#ff2d75", outgoing: "linear-gradient(135deg,#ff2d75,#7c3aed)", incoming: "rgba(255,255,255,.78)", panel: "rgba(255,255,255,.76)", input: "rgba(255,255,255,.82)", background: "linear-gradient(135deg,#ffe4e6,#ffedf0)" } },
  { id: "3d-roses", name: "Rose Garden", tier: "premium", price: 59, is3d: true, colors: { accent: "#be123c", outgoing: "linear-gradient(135deg,#be123c,#fda4af)", incoming: "rgba(255,255,255,.8)", panel: "rgba(255,255,255,.75)", input: "rgba(255,255,255,.85)", background: "linear-gradient(135deg,#fdf2f8,#ffe4e6)" } },
  { id: "3d-stars", name: "Starry Night", tier: "premium", price: 79, is3d: true, colors: { accent: "#facc15", outgoing: "linear-gradient(135deg,#facc15,#d97706)", incoming: "rgba(30,41,59,.8)", panel: "rgba(15,23,42,.85)", input: "rgba(30,41,59,.85)", background: "linear-gradient(135deg,#020617,#1e1b4b)" } },
  { id: "3d-clouds", name: "Dreamy Clouds", tier: "premium", price: 49, is3d: true, colors: { accent: "#38bdf8", outgoing: "linear-gradient(135deg,#38bdf8,#0284c7)", incoming: "rgba(255,255,255,.82)", panel: "rgba(255,255,255,.75)", input: "rgba(255,255,255,.85)", background: "linear-gradient(135deg,#e0f2fe,#bae6fd)" } },
  { id: "3d-love-letter", name: "Love Notes", tier: "premium", price: 59, is3d: true, colors: { accent: "#ec4899", outgoing: "linear-gradient(135deg,#ec4899,#f472b6)", incoming: "rgba(255,255,255,.8)", panel: "rgba(255,255,255,.75)", input: "rgba(255,255,255,.82)", background: "linear-gradient(135deg,#fdf2f8,#faf5ff)" } },
  { id: "3d-bubble", name: "Bubble Pop", tier: "premium", price: 49, is3d: true, colors: { accent: "#2dd4bf", outgoing: "linear-gradient(135deg,#2dd4bf,#0ea5e9)", incoming: "rgba(255,255,255,.8)", panel: "rgba(255,255,255,.75)", input: "rgba(255,255,255,.85)", background: "linear-gradient(135deg,#ccfbf1,#e0f2fe)" } },
  { id: "3d-diamond", name: "Diamond Sparkle", tier: "premium", price: 99, is3d: true, colors: { accent: "#60a5fa", outgoing: "linear-gradient(135deg,#60a5fa,#3b82f6)", incoming: "rgba(255,255,255,.82)", panel: "rgba(255,255,255,.78)", input: "rgba(255,255,255,.88)", background: "linear-gradient(135deg,#eff6ff,#e0e7ff)" } },
  { id: "3d-fire", name: "Warm Fire", tier: "premium", price: 69, is3d: true, colors: { accent: "#ea580c", outgoing: "linear-gradient(135deg,#ea580c,#9a3412)", incoming: "rgba(30,41,59,.8)", panel: "rgba(15,23,42,.85)", input: "rgba(30,41,59,.85)", background: "linear-gradient(135deg,#450a0a,#0f172a)" } },
  { id: "3d-cupid", name: "Cupid Arrow", tier: "premium", price: 89, is3d: true, colors: { accent: "#db2777", outgoing: "linear-gradient(135deg,#db2777,#c084fc)", incoming: "rgba(255,255,255,.8)", panel: "rgba(255,255,255,.75)", input: "rgba(255,255,255,.82)", background: "linear-gradient(135deg,#ffe4e6,#fae8ff)" } },
  { id: "3d-galaxy", name: "Cosmic Galaxy", tier: "premium", price: 99, is3d: true, colors: { accent: "#a78bfa", outgoing: "linear-gradient(135deg,#a78bfa,#4c1d95)", incoming: "rgba(30,41,59,.8)", panel: "rgba(15,23,42,.85)", input: "rgba(30,41,59,.85)", background: "linear-gradient(135deg,#030712,#120024)" } },
];

const CHAT_THEMES = [...FREE_CHAT_THEMES, ...PREMIUM_CHAT_THEMES];
const chatThemeStorageKey = (conversationId: string) => `${CHAT_THEME_STORAGE_KEY}:${conversationId}`;
const FREE_EMOJI_CATEGORIES = [
 {
   id: "love",
   icon: "💖",
   label: "Love",
   emojis: ["❤️", "🩷", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "❣️", "💔", "❤️‍🔥", "❤️‍🩹", "💌", "💋"],
 },
 {
   id: "faces",
   icon: "🥰",
   label: "Faces",
   emojis: ["😍", "🥰", "😘", "😗", "😙", "😚", "☺️", "😊", "😇", "🙂", "😉", "😌", "🤩", "🥳", "😋", "😜", "😝", "😛", "🤭", "🙈", "🥹", "😭", "😔", "😏", "🤗", "🫠"],
 },
 {
   id: "hands",
   icon: "🫶",
   label: "Hands",
   emojis: ["🫶", "🤗", "🤝", "🤲", "🙏", "👏", "🙌", "👌", "🤌", "👍", "👎", "👋", "✌️", "🤞", "🫰", "🤟", "🤘", "💪", "👐", "🙋", "💁", "🙆", "🙇", "👀"],
 },
 {
   id: "flowers",
   icon: "🌸",
   label: "Flowers",
   emojis: ["🌹", "💮", "🌷", "🌺", "🌸", "🌼", "🌻", "💐", "🌿", "🍀", "☘️", "🍃", "🌱", "🪷", "✨", "💫", "⭐", "🌟", "🔥", "🌈", "☀️", "🌙", "🦋"],
 },
 {
   id: "fun",
   icon: "🎉",
   label: "Fun",
   emojis: ["🎉", "🎊", "🎀", "🎁", "🎂", "🍰", "🍫", "🍬", "🍭", "🍩", "🍓", "🍒", "🍦", "☕", "🥂", "🍷", "🎵", "🎶", "🎧", "📸", "🎬", "🏆", "💎", "👑"],
 },
 {
   id: "symbols",
   icon: "💯",
   label: "Symbols",
   emojis: ["💯", "✅", "☑️", "✔️", "❌", "💤", "💢", "💥", "💦", "💨", "🕊️", "🔐", "🔒", "🔑", "📍", "📌", "📎", "📝", "🔔", "🔕", "♾️", "🔱", "⚜️", "🔆"],
 },
];
const PREMIUM_GIFTS = [
  { emoji: "🌹", label: "Red Rose", price: 29 },
  { emoji: "🌹", label: "Burgundy Rose", price: 39 },
  { emoji: "🌹", label: "White Rose", price: 39 },
  { emoji: "🌹", label: "Pink Rose", price: 29 },
  { emoji: "🌹", label: "Yellow Rose", price: 29 },
  { emoji: "🌹", label: "Red-tipped Rose", price: 49 },
  { emoji: "🌹", label: "Orange Rose", price: 39 },
  { emoji: "🌹", label: "Peach Rose", price: 29 },
  { emoji: "🌹", label: "Lavender Rose", price: 59 },
  { emoji: "🌹", label: "Blue Rose", price: 79 },
  { emoji: "🌹", label: "Black Rose", price: 99 },
  { emoji: "🍬", label: "Toffee Candy", price: 19 },
  { emoji: "🍫", label: "Chocolate Box", price: 49 },
  { emoji: "🧸", label: "Teddy Bear", price: 79 },
  { emoji: "💐", label: "Flower Bouquet", price: 119 },
  { emoji: "🥂", label: "Champagne Bottle", price: 149 },
  { emoji: "💍", label: "Diamond Ring", price: 249 },
  { emoji: "🎈", label: "Heart Balloon", price: 29 },
];

type GiftVisualConfig = {
  emoji: string;
  bg: string;
  glow: string;
  meaning?: string;
  petal?: string;
  petalDark?: string;
  petalLight?: string;
  center?: string;
  tip?: string;
  imageSrc?: string;
};

const giftVisuals: Record<string, GiftVisualConfig> = {
  Rose: { emoji: "🌹", bg: "from-pink-50 via-rose-100 to-white", glow: "shadow-pink-200/80", meaning: "Love, romance, respect & passion", imageSrc: "/images/roses/red_rose.png" },
  "Red Rose": { emoji: "🌹", bg: "from-pink-50 via-rose-100 to-white", glow: "shadow-pink-200/80", meaning: "Love, romance, respect & passion", imageSrc: "/images/roses/red_rose.png" },
  "Burgundy Rose": { emoji: "🌹", bg: "from-purple-50 via-rose-200 to-purple-100", glow: "shadow-purple-200/80", meaning: "Unconscious beauty", imageSrc: "/images/roses/burgundy_rose.png" },
  "White Rose": { emoji: "🌹", bg: "from-slate-50 via-slate-100 to-white", glow: "shadow-slate-200/80", meaning: "Purity, innocence & commitment", imageSrc: "/images/roses/white_rose.png" },
  "Pink Rose": { emoji: "🌹", bg: "from-pink-50 via-pink-100 to-white", glow: "shadow-pink-100/80", meaning: "Happiness, sweetness & admiration", imageSrc: "/images/roses/pink_rose.png" },
  "Yellow Rose": { emoji: "🌹", bg: "from-amber-50 via-yellow-100 to-white", glow: "shadow-yellow-100/80", meaning: "Friendship, warmth & delight", imageSrc: "/images/roses/yellow_rose.png" },
  "Red-tipped Rose": { emoji: "🌹", bg: "from-yellow-50 via-orange-100 to-rose-50", glow: "shadow-orange-200/80", meaning: "Taking relation to the next level", imageSrc: "/images/roses/red_tipped_rose.png" },
  "Orange Rose": { emoji: "🌹", bg: "from-orange-50 via-orange-100 to-white", glow: "shadow-orange-200/80", meaning: "Desire, passion & enthusiasm", imageSrc: "/images/roses/orange_rose.png" },
  "Peach Rose": { emoji: "🌹", bg: "from-amber-50 via-orange-50 to-pink-50", glow: "shadow-amber-100/80", meaning: "Sincere appreciation & gratitude", imageSrc: "/images/roses/peach_rose.png" },
  "Lavender Rose": { emoji: "🌹", bg: "from-purple-50 via-fuchsia-100 to-white", glow: "shadow-fuchsia-200/80", meaning: "Love at first sight & enchantment", imageSrc: "/images/roses/lavender_rose.png" },
  "Blue Rose": { emoji: "🌹", bg: "from-blue-50 via-indigo-100 to-white", glow: "shadow-blue-200/80", meaning: "Unattainable or mysterious", imageSrc: "/images/roses/blue_rose.png" },
  "Black Rose": { emoji: "🌹", bg: "from-zinc-800 via-neutral-900 to-zinc-950", glow: "shadow-black/80", meaning: "Mystery, rebirth or death", imageSrc: "/images/roses/black_rose.png" },
  "Toffee Candy": { emoji: "🍬", bg: "from-orange-50 via-amber-100 to-white", glow: "shadow-orange-100/80", meaning: "Sweet treats for a sweet person", imageSrc: "/images/gifts/toffee.png" },
  "Chocolate Box": { emoji: "🍫", bg: "from-yellow-950/20 via-amber-100 to-white", glow: "shadow-amber-900/40", meaning: "Indulgent sweetness & love", imageSrc: "/images/gifts/chocolate_box.png" },
  "Teddy Bear": { emoji: "🧸", bg: "from-orange-100 via-amber-50 to-white", glow: "shadow-amber-200/80", meaning: "A warm, cuddly hug in a gift", imageSrc: "/images/gifts/teddy_bear.png" },
  "Flower Bouquet": { emoji: "💐", bg: "from-emerald-50 via-rose-100 to-white", glow: "shadow-emerald-200/80", meaning: "A beautiful bunch of joy", imageSrc: "/images/gifts/flower_bouquet.png" },
  "Champagne Bottle": { emoji: "🥂", bg: "from-amber-100 via-yellow-50 to-white", glow: "shadow-yellow-200/80", meaning: "Let's celebrate us", imageSrc: "/images/gifts/champagne_bottle.png" },
  "Diamond Ring": { emoji: "💍", bg: "from-blue-50 via-indigo-100 to-white", glow: "shadow-blue-200/80", meaning: "A promise of commitment", imageSrc: "/images/gifts/diamond_ring.png" },
  "Heart Balloon": { emoji: "🎈", bg: "from-red-50 via-rose-100 to-white", glow: "shadow-red-200/80", meaning: "Floating on cloud nine" },
};

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

function isChatThemeMessage(content?: string) {
 return !!content?.startsWith(CHAT_THEME_MESSAGE_PREFIX);
}

function chatThemePayload(content: string) {
 return content.slice(CHAT_THEME_MESSAGE_PREFIX.length);
}

function messagePreview(content?: string) {
 if (isChatThemeMessage(content)) return "Chat theme changed";
 if (isVoiceMessage(content)) return "Voice message";
 if (isPhotoMessage(content)) return "Photo";
 if (isVideoMessage(content)) return "Video";
 if (isGiftMessage(content)) return "Premium gift";
 return content || "No messages yet.";
}

function RealRoseSvg({ label, visual, size }: { label: string; visual: GiftVisualConfig; size: "sm" | "lg" }) {
 const petal = visual.petal || "#fb7185";
 const dark = visual.petalDark || "#be123c";
 const light = visual.petalLight || "#fecdd3";
 const center = visual.center || dark;
 const tip = visual.tip;
 const gradientId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

 return (
   <svg viewBox="0 0 96 96" className="relative z-10 h-[96%] w-[96%] drop-shadow-[0_8px_10px_rgba(15,23,42,0.24)]" aria-hidden="true">
     <defs>
       <radialGradient id={`rose-petal-${gradientId}`} cx="44%" cy="28%" r="70%">
         <stop offset="0%" stopColor={light} />
         <stop offset="50%" stopColor={petal} />
         <stop offset="100%" stopColor={dark} />
       </radialGradient>
       <linearGradient id={`rose-edge-${gradientId}`} x1="0" x2="1" y1="0" y2="1">
         <stop stopColor={light} />
         <stop offset="0.52" stopColor={petal} />
         <stop offset="1" stopColor={dark} />
       </linearGradient>
       <linearGradient id={`rose-stem-${gradientId}`} x1="0" x2="1">
         <stop stopColor="#166534" />
         <stop offset="1" stopColor="#22c55e" />
       </linearGradient>
     </defs>
     <path d="M50 45 C49 58 47 72 45 92" fill="none" stroke="#14532d" strokeWidth="7" strokeLinecap="round" />
     <path d="M51 45 C50 59 49 73 47 92" fill="none" stroke={`url(#rose-stem-${gradientId})`} strokeWidth="4.3" strokeLinecap="round" />
     <path d="M45 70 C26 60 18 70 13 82 C28 84 40 80 48 70" fill="#166534" />
     <path d="M47 68 C30 64 23 72 18 79 C32 79 41 75 47 68" fill="#22c55e" opacity="0.65" />
     <path d="M51 62 C69 50 81 59 86 70 C70 74 58 70 51 62" fill="#15803d" />
     <path d="M55 62 C69 56 76 62 81 68 C69 69 61 66 55 62" fill="#4ade80" opacity="0.5" />

     <path d="M35 45 C29 53 22 46 25 36 C28 28 36 29 39 37Z" fill="#166534" />
     <path d="M61 45 C69 53 76 45 71 35 C68 28 61 30 58 38Z" fill="#15803d" />
     <path d="M40 48 C39 56 50 58 55 48 C50 52 45 52 40 48Z" fill="#166534" />

     <path d="M19 34 C16 17 32 6 46 15 C54 0 76 5 80 24 C94 29 90 52 72 58 C62 72 34 67 26 52 C14 51 10 39 19 34Z" fill={`url(#rose-petal-${gradientId})`} stroke={dark} strokeWidth="1.45" strokeLinejoin="round" />
     <path d="M25 33 C28 15 44 11 52 25 C40 23 31 26 25 33Z" fill={`url(#rose-edge-${gradientId})`} stroke={dark} strokeWidth="1.1" opacity="0.98" />
     <path d="M73 32 C65 18 49 17 43 28 C56 24 66 25 73 32Z" fill={light} stroke={dark} strokeWidth="1.05" opacity="0.96" />
     <path d="M17 38 C29 31 44 34 50 45 C37 49 25 47 17 38Z" fill={petal} stroke={dark} strokeWidth="1.15" opacity="0.98" />
     <path d="M81 37 C69 30 53 34 46 45 C60 50 73 47 81 37Z" fill={petal} stroke={dark} strokeWidth="1.15" opacity="0.98" />
     <path d="M28 55 C34 39 59 35 70 51 C60 66 38 68 28 55Z" fill={petal} stroke={dark} strokeWidth="1.25" />
     <path d="M34 45 C41 30 60 30 66 44 C58 56 42 57 34 45Z" fill={center} stroke={dark} strokeWidth="1.2" opacity="0.92" />
     <path d="M40 41 C45 32 56 33 60 41 C55 49 45 50 40 41Z" fill={petal} stroke={dark} strokeWidth="1" />
     <path d="M45 38 C49 32 55 33 58 39 C53 44 48 44 45 38Z" fill={light} opacity="0.95" />
     <path d="M31 27 C41 19 55 20 64 29" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" opacity="0.35" />
     <path d="M30 48 C40 52 57 52 66 46" fill="none" stroke={light} strokeWidth="1.3" strokeLinecap="round" opacity="0.38" />
     {tip && (
       <>
         <path d="M20 34 C22 20 35 11 49 15" fill="none" stroke={tip} strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
         <path d="M80 36 C86 43 79 54 68 57" fill="none" stroke={tip} strokeWidth="4.5" strokeLinecap="round" opacity="0.9" />
       </>
     )}
   </svg>
 );
}

function GiftVisual({ label, emoji, size = "sm", bare = false }: { label: string; emoji?: string; size?: "sm" | "lg"; bare?: boolean }) {
  const visual = giftVisuals[label] || { emoji: emoji || "🎁", bg: "from-rose-50 via-white to-pink-100", glow: "shadow-rose-200/80" };
  const isLarge = size === "lg";
  const isRoseGift = label.toLowerCase().includes("rose");
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden",
        isRoseGift && "gift-rose-perspective",
        bare ? "bg-transparent shadow-none ring-0 rounded-none" : "rounded-full border border-white/80 bg-gradient-to-br shadow-md ring-1 ring-rose-100",
        !bare && visual.bg,
        !bare && visual.glow,
        isLarge ? "mx-auto h-28 w-28" : "h-[50px] w-[50px]",
      )}
    >
      {visual.imageSrc ? (
        <img
          src={visual.imageSrc}
          alt={label}
          className={cn(
            "relative z-10 object-contain select-none pointer-events-none filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]",
            isLarge ? "h-[90%] w-[90%] group-hover:scale-105 transition-transform duration-500" : "h-[86%] w-[86%] group-hover:scale-110 transition-transform duration-300"
          )}
          style={{ mixBlendMode: "multiply" }}
        />
      ) : isRoseGift ? (
        <RealRoseSvg label={label} visual={visual} size={size} />
      ) : (
        <>
          <span className="absolute left-1 top-1 h-4 w-7 rounded-full bg-white/80 blur-[1px]" />
          <span className="absolute inset-x-1 bottom-1 h-2 rounded-full bg-black/10 blur-sm" />
          <span
            className={cn("relative z-10 select-none leading-none drop-shadow-[0_3px_3px_rgba(0,0,0,0.28)]", isLarge ? "text-5xl" : "text-[30px]")}
            style={{ fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' }}
          >
            {visual.emoji}
          </span>
        </>
      )}
      {!bare && <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/45 via-transparent to-black/10" />}
    </span>
  );
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
    const visual = giftVisuals[gift.label] || { emoji: gift.emoji || "🌹", bg: "from-pink-50 to-white" };
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-white/95 via-rose-50/90 to-pink-100/50 p-4 text-center backdrop-blur-md shadow-xl ring-1 ring-rose-100/40 min-w-[160px] max-w-[200px] mx-auto transition-transform duration-500 hover:scale-[1.03] cursor-default">
        {/* Glow behind the card */}
        <span className="absolute -left-4 -top-4 h-12 w-12 rounded-full bg-pink-300/10 blur-xl pointer-events-none" />
        <span className="absolute -right-4 -bottom-4 h-12 w-12 rounded-full bg-rose-400/10 blur-xl pointer-events-none" />
        
        {/* Large rose SVG inside dynamic circular frame */}
        <div className="relative mx-auto mb-3.5 grid h-24 w-24 place-items-center rounded-full bg-white/90 shadow-inner">
          <GiftVisual label={gift.label} emoji={gift.emoji} size="lg" bare />
          {/* Dotted border loop */}
          <span className="absolute inset-0.5 rounded-full border border-dashed border-rose-200/80 animate-spin [animation-duration:12s]" />
        </div>
        
        <div className="space-y-1.5">
          <span className="inline-block rounded-full bg-rose-500 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white shadow-sm shadow-rose-200">
            Gift Received
          </span>
          <h4 className="text-[11px] font-extrabold text-slate-800 leading-tight">
            {gift.label}
          </h4>
          {visual.meaning && (
            <p className="text-[9px] font-bold italic leading-tight text-rose-500 bg-rose-50/60 rounded-xl py-1.5 px-2 border border-rose-100/30">
              "{visual.meaning}"
            </p>
          )}
        </div>
      </div>
    );
  }

 return <span className={cn("whitespace-pre-wrap break-words", isMe ? "text-white" : "text-foreground")}>{content}</span>;
}

function ChatThemeParticles({ themeId }: { themeId: string }) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    let emojiPool = ["✨"];
    let animType = "float-up";
    
    if (themeId === "3d-hearts") {
      emojiPool = ["❤️", "💖", "💝", "💕", "😍"];
      animType = "float-up";
    } else if (themeId === "3d-roses") {
      emojiPool = ["🌹", "🌸", "💮", "🌺"];
      animType = "float-down";
    } else if (themeId === "3d-stars") {
      emojiPool = ["✨", "⭐", "🌟"];
      animType = "twinkle";
    } else if (themeId === "3d-clouds") {
      emojiPool = ["☁️", "🌥️", "🌧️"];
      animType = "float-left-right";
    } else if (themeId === "3d-love-letter") {
      emojiPool = ["✉️", "💌", "❤️"];
      animType = "float-up";
    } else if (themeId === "3d-bubble") {
      emojiPool = ["🫧"];
      animType = "float-up";
    } else if (themeId === "3d-diamond") {
      emojiPool = ["💎", "✨"];
      animType = "float-down";
    } else if (themeId === "3d-fire") {
      emojiPool = ["🔥", "✨", "💥"];
      animType = "float-up";
    } else if (themeId === "3d-cupid") {
      emojiPool = ["💘", "🏹", "❤️"];
      animType = "float-up";
    } else if (themeId === "3d-galaxy") {
      emojiPool = ["🪐", "☄️", "⭐", "✨"];
      animType = "twinkle";
    } else {
      setParticles([]);
      return;
    }

    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
      left: `${Math.random() * 100}%`,
      top: animType === "float-down" ? "-10%" : animType === "float-up" ? "110%" : `${Math.random() * 100}%`,
      size: `${Math.random() * 1.5 + 0.8}rem`,
      delay: `${Math.random() * 10}s`,
      duration: `${Math.random() * 15 + 10}s`,
      animType,
    }));
    setParticles(items);
  }, [themeId]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className={cn("absolute select-none opacity-25", `animate-${p.animType}`)}
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            animationIterationCount: "infinite",
            animationTimingFunction: "linear",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
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
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState(FREE_CHAT_THEMES[0].id);
  const [disappearingMode, setDisappearingMode] = useState<'after-view' | '24h' | '7d' | 'off'>("off");
  const [activePickerTab, setActivePickerTab] = useState<"emoji" | "gift">("emoji");
 const [activeEmojiCategory, setActiveEmojiCategory] = useState(FREE_EMOJI_CATEGORIES[0].id);
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
 const selectedTheme = CHAT_THEMES.find((theme) => theme.id === selectedThemeId) || FREE_CHAT_THEMES[0];
 const isDarkTheme = selectedTheme.id === "3d-stars" || selectedTheme.id === "3d-fire" || selectedTheme.id === "3d-galaxy";
 const chatThemeStyle = {
   "--chat-accent": selectedTheme.colors.accent,
   "--chat-outgoing": selectedTheme.colors.outgoing,
   "--chat-incoming": selectedTheme.colors.incoming,
   "--chat-panel": selectedTheme.colors.panel,
   "--chat-input": selectedTheme.colors.input,
   "--chat-bg": selectedTheme.colors.background,
   "--chat-text": isDarkTheme ? "#f8fafc" : "#0f172a",
   "--chat-text-muted": isDarkTheme ? "#94a3b8" : "#64748b",
 } as React.CSSProperties;

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
   if (!activeId) return;
   const savedTheme = window.localStorage.getItem(chatThemeStorageKey(activeId)) || window.localStorage.getItem(CHAT_THEME_STORAGE_KEY);
   if (savedTheme && CHAT_THEMES.some((theme) => theme.id === savedTheme)) {
     setSelectedThemeId(savedTheme);
   } else {
     setSelectedThemeId(FREE_CHAT_THEMES[0].id);
   }

   const savedDisappearing = window.localStorage.getItem("disappearing:" + activeId);
   if (savedDisappearing === "after-view" || savedDisappearing === "24h" || savedDisappearing === "7d") {
     setDisappearingMode(savedDisappearing);
   } else {
     setDisappearingMode("off");
   }
 }, [activeId]);

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
 // Disappearing messages filter
 const visibleMessages = messages.filter((m: any) => {
   if (isChatThemeMessage(m.content)) return false;

   // Load active disappearing mode
   const savedDisappearing = activeId ? (window.localStorage.getItem("disappearing:" + activeId) || disappearingMode) : disappearingMode;

   if (savedDisappearing === "24h") {
     const isExpired = new Date().getTime() - new Date(m.createdAt).getTime() > 24 * 60 * 60 * 1000;
     if (isExpired) return false;
   } else if (savedDisappearing === "7d") {
     const isExpired = new Date().getTime() - new Date(m.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000;
     if (isExpired) return false;
   } else if (savedDisappearing === "after-view") {
     if (m.isRead && !m.content.startsWith("[CONTROL:DISAPPEARING_MODE:")) {
       return false;
     }
   }
   return true;
 });

 // Sync disappearing mode when receiving websocket control message
 useEffect(() => {
   if (!messages.length || !activeId) return;
   const lastMsg = messages[messages.length - 1];
   if (lastMsg.content.startsWith("[CONTROL:DISAPPEARING_MODE:")) {
     const match = lastMsg.content.match(/\[CONTROL:DISAPPEARING_MODE:(.+)\]/);
     if (match) {
       const mode = match[1];
       setDisappearingMode(mode);
       window.localStorage.setItem("disappearing:" + activeId, mode);
     }
   }
 }, [messages, activeId]);

 // Background cleanup loop for expired / viewed messages
 useEffect(() => {
   if (!activeId || !token || !messages.length) return;
   const now = new Date().getTime();
   const savedDisappearing = window.localStorage.getItem("disappearing:" + activeId) || disappearingMode;

   messages.forEach((m: any) => {
     if (m.content.startsWith("[CONTROL:DISAPPEARING_MODE:") || isChatThemeMessage(m.content)) return;

     let shouldDelete = false;
     if (savedDisappearing === "24h") {
       shouldDelete = now - new Date(m.createdAt).getTime() > 24 * 60 * 60 * 1000;
     } else if (savedDisappearing === "7d") {
       shouldDelete = now - new Date(m.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000;
     } else if (savedDisappearing === "after-view") {
       shouldDelete = m.isRead;
     }

     if (shouldDelete) {
       fetch(API_URL + "/messages/" + m.id, {
         method: 'DELETE',
         headers: { Authorization: "Bearer " + token }
       }).catch(() => {});
     }
   });
 }, [messages, activeId, token, disappearingMode]);

 // Function to change disappearing messages mode
 const changeDisappearingMode = (mode: "after-view" | "24h" | "7d" | "off") => {
   if (!activeId || !socket) return;
   setDisappearingMode(mode);
   window.localStorage.setItem("disappearing:" + activeId, mode);

   const activeMatch = activeMatches.find((m: any) => m.id === activeId);
   if (!activeMatch) return;
   const receiverId = activeMatch.senderId === myId ? activeMatch.receiverId : activeMatch.senderId;

   socket.emit("sendMessage", {
     conversationId: activeId,
     receiverId,
     content: "[CONTROL:DISAPPEARING_MODE:" + mode + "]"
   });
 };

 useEffect(() => {
   if (!activeId) return;
   const latestThemeMessage = [...messages].reverse().find((message: any) => isChatThemeMessage(message.content));
   if (!latestThemeMessage) return;
   const themeId = chatThemePayload(latestThemeMessage.content);
   if (!CHAT_THEMES.some((theme) => theme.id === themeId)) return;
   setSelectedThemeId(themeId);
   window.localStorage.setItem(chatThemeStorageKey(activeId), themeId);
   window.localStorage.setItem(CHAT_THEME_STORAGE_KEY, themeId);
 }, [activeId, messages]);

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
 }, [visibleMessages]);

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
 };

 const sendPremiumGift = (gift: { emoji: string; label: string; price: number }) => {
   if (!active) return;
   const ok = confirm(`Send ${gift.label} for ₹${gift.price}?`);
   if (!ok) return;
   sendMessage(active.userId, `${GIFT_MESSAGE_PREFIX}${gift.emoji}|${gift.label}|${gift.price}`);
   setShowEmojiPicker(false);
 };

 const applyChatTheme = (theme: ChatTheme) => {
   if (!activeId || !active) return;
   if (theme.tier === "premium") {
     const ok = confirm(`Pay Rs ${theme.price} to unlock and apply ${theme.name} 3D chat theme?`);
     if (!ok) return;
     toast.success(`${theme.name} theme unlocked for Rs ${theme.price}.`);
   } else {
     toast.success(`${theme.name} theme applied.`);
   }
   setSelectedThemeId(theme.id);
   window.localStorage.setItem(chatThemeStorageKey(activeId), theme.id);
   window.localStorage.setItem(CHAT_THEME_STORAGE_KEY, theme.id);
   sendMessage(active.userId, `${CHAT_THEME_MESSAGE_PREFIX}${theme.id}`);
   setShowThemePicker(false);
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
 <div
 className={cn("chat-theme-surface grid h-[calc(100dvh-10rem)] min-h-[420px] gap-4 rounded-2xl p-0 md:h-[calc(100dvh-8rem)] lg:grid-cols-[320px_1fr]", selectedTheme.is3d && "chat-theme-3d")}
 style={chatThemeStyle}
 >
 <aside className={cn("flex flex-col overflow-hidden rounded-2xl bg-[var(--chat-panel)] shadow-sm backdrop-blur", active && "hidden lg:flex")}>
 <div className="flex flex-col gap-3 border-b border-border p-4">
 <h2 className="text-lg font-semibold text-[var(--chat-text)]">Messages</h2>
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-[16px] w-[16px] text-[var(--chat-text-muted)]" />
 <Input
 placeholder="Search matches..."
 className="pl-9 h-[36px] bg-muted/50 border-none text-[var(--chat-text)] placeholder:text-[var(--chat-text-muted)]/60"
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
 <p className="truncate text-sm font-semibold text-[var(--chat-text)]">{m.name}</p>
 {m.unread > 0 && activeId !== m.id && (
 <span className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[var(--chat-accent)] px-1.5 text-[10px] font-semibold text-white">
 {m.unread}
 </span>
 )}
 </div>
 <p className="truncate text-xs text-[var(--chat-text-muted)]">
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
  <section className="flex flex-col overflow-hidden rounded-2xl bg-[var(--chat-panel)] shadow-sm backdrop-blur relative">
    {selectedTheme.is3d && (
      <ChatThemeParticles themeId={selectedTheme.id} />
    )}
  <header className="flex items-center justify-between border-b border-border px-5 py-3 relative z-10">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" onClick={() => setActiveId(null)} className="lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></Button>
 <Avatar className="h-[40px] w-[40px]">
 <AvatarImage src={active.photo} />
 <AvatarFallback>{active.name[0]}</AvatarFallback>
 </Avatar>
 <div>
 <p className="text-sm font-semibold text-[var(--chat-text)]">{active.name}, {active.age}</p>
 <p className="text-xs text-[var(--chat-text-muted)]">{active.online ? "Online now" : (active.lastSeen ? `Last seen at ${new Date(active.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline")}</p>
 </div>
 </div>
 <div className="flex items-center gap-1 text-[var(--chat-text)]">
 <Button variant="ghost" size="icon" onClick={() => startCall("audio")} disabled={!socket}><Phone className="h-[16px] w-[16px]" /></Button>
 <Button variant="ghost" size="icon" onClick={() => startCall("video")} disabled={!socket}><Video className="h-[16px] w-[16px]" /></Button>

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon"><MoreVertical className="h-[16px] w-[16px]" /></Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={handleViewProfile}>View Profile</DropdownMenuItem>
 <DropdownMenuItem onClick={() => setShowThemePicker(true)}>
 <Palette className="mr-2 h-4 w-4" />
 Chat Themes
 </DropdownMenuItem>
 <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
 <DropdownMenuSub>
    <DropdownMenuSubTrigger>
      <Clock className="mr-2 h-4 w-4" />
      <span>Disappearing Messages</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuPortal>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => changeDisappearingMode('after-view')}>
          <span>After View</span>
          {disappearingMode === 'after-view' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeDisappearingMode('24h')}>
          <span>24 Hours</span>
          {disappearingMode === '24h' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeDisappearingMode('7d')}>
          <span>7 Days</span>
          {disappearingMode === '7d' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeDisappearingMode('off')}>
          <span>Off</span>
          {disappearingMode === 'off' && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuPortal>
  </DropdownMenuSub>
 <DropdownMenuItem className="text-red-500" onClick={handleBlockUser}>Block User</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </header>

 <div className="flex-1 space-y-3 overflow-y-auto px-5 py-6">
{visibleMessages.map((m: any) => {
  const isMe = String(m.senderId) === String(myId);
  const isGift = isGiftMessage(m.content);

  if (m.content.startsWith("[CONTROL:DISAPPEARING_MODE:")) {
    const modeMatch = m.content.match(/\[CONTROL:DISAPPEARING_MODE:(.+)\]/);
    const mode = modeMatch ? modeMatch[1] : "off";
    const modeText = mode === "after-view" ? "After View" : mode === "24h" ? "24 Hours" : mode === "7d" ? "7 Days" : "Off";
    const displaySender = isMe ? "You" : active.name;
    return (
      <div key={m.id} className="flex justify-center w-full my-2 relative z-10">
        <span className="bg-slate-100/80 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200/50 shadow-sm backdrop-blur-sm">
          ⚙️ {displaySender} set messages to disappear: <strong className="text-slate-800">{modeText}</strong>
        </span>
      </div>
    );
  }

  return (
 <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
 {isMe ? (
 <ContextMenu>
 <ContextMenuTrigger asChild>
 <div className={cn(
 "max-w-[70%] rounded-2xl text-sm relative cursor-context-menu select-none",
 isGift ? "bg-transparent px-1 py-1 text-white" : "[background:var(--chat-outgoing)] px-4 py-2 text-white rounded-br-sm shadow-sm"
 )}>
 <MessageContent content={m.content} isMe={isMe} onOpenPhoto={setPhotoViewerSrc} />
 <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", isGift ? "text-white/80 drop-shadow-sm" : "opacity-90")}>
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
 <div className={cn(
 "max-w-[70%] rounded-2xl text-sm relative",
 isGift ? "bg-transparent px-1 py-1 text-foreground" : "bg-[var(--chat-incoming)] px-4 py-2 text-foreground rounded-bl-sm shadow-sm"
 )}>
 <MessageContent content={m.content} isMe={isMe} onOpenPhoto={setPhotoViewerSrc} />
 <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", isGift ? "text-muted-foreground" : "opacity-70")}>
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
 <div className="relative flex items-center gap-2 text-[var(--chat-text)]">
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
 <div className="absolute bottom-14 left-0 z-30 flex h-[430px] w-80 flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl">
 <div className="grid grid-cols-2 border-b border-rose-100 bg-rose-50/40 p-1.5">
 <button
 type="button"
 onClick={() => setActivePickerTab("emoji")}
 className={cn(
 "flex h-9 items-center justify-center gap-2 rounded-full text-sm font-bold transition",
 activePickerTab === "emoji" ? "bg-white text-rose-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
 )}
 >
 <SmilePlus className="h-4 w-4" />
 Emoji
 </button>
 <button
 type="button"
 onClick={() => setActivePickerTab("gift")}
 className={cn(
 "flex h-9 items-center justify-center gap-2 rounded-full text-sm font-bold transition",
 activePickerTab === "gift" ? "bg-white text-rose-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
 )}
 >
 <Gift className="h-4 w-4" />
 Gifts
 </button>
 </div>
 {activePickerTab === "emoji" ? (
 <>
 <div className="border-b border-border px-3 py-2">
 <div className="flex gap-2 overflow-x-auto pb-1">
 {FREE_EMOJI_CATEGORIES.map((category) => (
 <button
 key={category.id}
 type="button"
 onClick={() => setActiveEmojiCategory(category.id)}
 title={category.label}
 className={cn(
 "grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl transition hover:scale-105",
 activeEmojiCategory === category.id ? "bg-rose-100 ring-2 ring-rose-300" : "bg-muted hover:bg-rose-50"
 )}
 >
 {category.icon}
 </button>
 ))}
 </div>
 </div>
 <div className="min-h-0 flex-1 overflow-y-auto p-3">
 <div className="grid grid-cols-6 gap-2">
 {(FREE_EMOJI_CATEGORIES.find((category) => category.id === activeEmojiCategory)?.emojis ?? FREE_EMOJI_CATEGORIES[0].emojis).map((emoji) => (
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
 </>
 ) : (
    <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-rose-50/20 to-white/40 p-3">
      <div className="grid grid-cols-2 gap-2.5">
        {PREMIUM_GIFTS.map((gift) => {
          const visual = giftVisuals[gift.label] || { emoji: "🌹", bg: "from-pink-50 to-white" };
          const isRare = ["Burgundy Rose", "Lavender Rose", "Blue Rose", "Black Rose", "Red-tipped Rose"].includes(gift.label);
          return (
            <button
              key={gift.label}
              type="button"
              onClick={() => sendPremiumGift(gift)}
              className="group relative flex flex-col justify-between items-center rounded-2xl border border-rose-100 bg-white/80 p-2.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-md hover:shadow-rose-100/40"
            >
              {/* Status / Available Badge */}
              <span className={cn(
                "absolute top-2 right-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[7px] font-bold tracking-wide border",
                isRare 
                  ? "bg-purple-50 text-purple-600 border-purple-100" 
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
              )}>
                <span className={cn("h-1 w-1 rounded-full animate-pulse", isRare ? "bg-purple-500" : "bg-emerald-500")} />
                {isRare ? "Premium" : "In Stock"}
              </span>

              {/* Glowing SVG Center Container */}
              <div className="relative my-2.5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-rose-50 to-pink-100/30 group-hover:scale-110 transition-transform duration-300">
                <span className={cn("absolute inset-0 rounded-full blur-md opacity-25 transition-opacity group-hover:opacity-40", visual.bg)} />
                <GiftVisual label={gift.label} emoji={gift.emoji} />
              </div>

              {/* Title & Meaning */}
              <div className="w-full flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-[11px] font-extrabold text-slate-800 group-hover:text-rose-600 transition-colors leading-tight">
                    {gift.label}
                  </h4>
                  {visual.meaning && (
                    <p className="mt-1 text-[8px] font-medium leading-tight text-slate-400 italic line-clamp-2 px-0.5">
                      "{visual.meaning}"
                    </p>
                  )}
                </div>

                {/* Price Container */}
                <div className="mt-2.5 flex items-center justify-center">
                  <span className="flex items-center gap-0.5 rounded-full bg-rose-50 px-2 py-0.5 border border-rose-100 text-[10px] font-black text-rose-600 shadow-sm group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all duration-300">
                    ₹{gift.price}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  )}
 </div>
 )}
 <Input
 value={draft}
 onChange={(e) => setDraft(e.target.value)}
 placeholder={isRecordingVoice ? `Recording voice ${formatRecordingTime(recordingSeconds)}` : "Type a message..."}
 disabled={isRecordingVoice || !!selectedMedia}
 className="h-[40px] rounded-full px-4 border-none bg-[var(--chat-input)] text-[var(--chat-text)] placeholder:text-[var(--chat-text-muted)]/60"
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
 <Button type="submit" size="icon" disabled={!draft.trim() && !selectedMedia} className="h-[40px] w-[40px] shrink-0 rounded-full bg-[var(--chat-accent)] hover:opacity-90 text-white disabled:opacity-50">
 {selectedMedia ? <ImageIcon className="h-[16px] w-[16px]" /> : <Send className="h-[16px] w-[16px]" />}
 </Button>
 </div>
 </form>
 </section>
 ) : (
 <section className="flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--chat-panel)] shadow-sm text-muted-foreground p-8 text-center backdrop-blur">
 <div className="h-[80px] w-[80px] rounded-full bg-muted flex items-center justify-center mb-4">
 <Search className="h-[32px] w-[32px] text-muted-foreground/50" />
 </div>
 <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
 <p>Select a conversation from the sidebar to start chatting.</p>
 </section>
 )}
 </div>
 {showThemePicker && (
 <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 p-4">
 <div className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
 <div className="flex items-center justify-between border-b border-border px-5 py-4">
 <div className="flex items-center gap-3">
 <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-rose-600">
 <Palette className="h-5 w-5" />
 </span>
 <div>
 <h3 className="text-base font-bold text-foreground">Chat Themes</h3>
 <p className="text-xs text-muted-foreground">10 free colors and 10 paid 3D themes</p>
 </div>
 </div>
 <Button type="button" variant="ghost" size="icon" onClick={() => setShowThemePicker(false)} className="rounded-full">
 <X className="h-4 w-4" />
 </Button>
 </div>
 <div className="min-h-0 flex-1 overflow-y-auto p-5">
 <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
 <div>
 <p className="text-sm font-semibold text-foreground">Active: {selectedTheme.name}</p>
 <p className="text-xs text-muted-foreground">{selectedTheme.tier === "premium" ? "Premium 3D theme" : "Free normal color theme"}</p>
 </div>
 <span className="rounded-full bg-[var(--chat-accent)] px-3 py-1 text-xs font-bold text-white">Applied</span>
 </div>

 <section>
 <div className="mb-3 flex items-center justify-between">
 <h4 className="text-sm font-bold text-foreground">Free Color Themes</h4>
 <span className="text-xs font-semibold text-emerald-600">10 free</span>
 </div>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {FREE_CHAT_THEMES.map((theme) => (
 <button
 key={theme.id}
 type="button"
 onClick={() => applyChatTheme(theme)}
 className={cn(
 "overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
 selectedThemeId === theme.id ? "border-rose-400 ring-2 ring-rose-200" : "border-border"
 )}
 >
 <span className="block h-16" style={{ background: theme.colors.background }} />
 <span className="flex items-center gap-2 px-3 py-2">
 <span className="h-5 w-5 rounded-full shadow-inner" style={{ background: theme.colors.accent }} />
 <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{theme.name}</span>
 <span className="text-[10px] font-bold uppercase text-emerald-600">Free</span>
 </span>
 </button>
 ))}
 </div>
 </section>

 <section className="mt-7">
 <div className="mb-3 flex items-center justify-between">
  <h4 className="text-sm font-bold text-foreground">Premium 3D Themes</h4>
  <span className="text-xs font-semibold text-rose-600">10 paid</span>
 </div>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
 {PREMIUM_CHAT_THEMES.map((theme) => (
 <button
 key={theme.id}
 type="button"
 onClick={() => applyChatTheme(theme)}
 className={cn(
 "chat-theme-card-3d group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
 selectedThemeId === theme.id ? "border-rose-400 ring-2 ring-rose-200" : "border-border"
 )}
 >
 <span className="relative block h-24 overflow-hidden" style={{ background: theme.colors.background }}>
 <span className="chat-theme-preview-panel left-5 top-5 h-11 w-24" style={{ background: theme.colors.incoming }} />
 <span className="chat-theme-preview-panel right-5 top-9 h-12 w-28 text-white" style={{ background: theme.colors.outgoing }} />
 <span className="absolute bottom-3 left-4 rounded-2xl px-3 py-1 text-xs font-bold text-white shadow-lg" style={{ background: theme.colors.accent }}>
 3D
 </span>
 </span>
 <span className="flex items-center gap-2 px-3 py-3">
 <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-50 text-rose-600">
 {selectedThemeId === theme.id ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
 </span>
 <span className="min-w-0 flex-1">
 <span className="block truncate text-sm font-bold text-foreground">{theme.name}</span>
 <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
 <Sparkles className="h-3 w-3" />
 Premium depth
 </span>
 </span>
 <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600">
 <CreditCard className="h-3 w-3" />
 Rs {theme.price}
 </span>
 </span>
 </button>
 ))}
 </div>
 </section>
 </div>
 </div>
 </div>
 )}
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
