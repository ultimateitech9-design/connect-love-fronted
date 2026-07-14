"use client";
import { API_ORIGIN } from "@/config/runtime";

import { cloneElement, createContext, isValidElement, useContext, useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BellOff, Coins, Phone, Video, MoreVertical, Send, Check, CheckCheck, Search, PhoneOff, Mic, MicOff, VideoOff, Volume2, VolumeX, Paperclip, Image as ImageIcon, X, MapPin, Briefcase, Ruler, SmilePlus, Gift, Palette, Lock, Sparkles, CreditCard, Clock, Info, Reply, Copy, Pin, Star, Edit3, CheckSquare, Trash2, Flag, Plus } from "lucide-react";
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
import { useMatches } from "@/hooks/useMatches";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MESSAGE_REACTIONS, reportMessage } from "@/features/messages/messageActionsApi";

const API_URL = API_ORIGIN;
const VOICE_MESSAGE_PREFIX = "__voice_message__:";
const PHOTO_MESSAGE_PREFIX = "__photo_message__:";
const VIDEO_MESSAGE_PREFIX = "__video_message__:";
const GIFT_MESSAGE_PREFIX = "__gift_message__:";
const CHAT_THEME_MESSAGE_PREFIX = "__chat_theme__:";
const GIF_MESSAGE_PREFIX = "__gif_message__:";
const MAX_VOICE_SECONDS = 60;
const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const CHAT_THEME_STORAGE_KEY = "connect-love-chat-theme";
const DELETED_CHATS_STORAGE_KEY = "connect-love-deleted-chats";
const MUTED_CHATS_STORAGE_KEY = "connect-love-muted-chats";
const INITIAL_MESSAGE_RENDER_LIMIT = 80;

type LightweightMenuContextValue = {
  open: boolean;
  x: number;
  y: number;
  anchor?: { top: number; right: number; bottom: number; left: number };
  setMenu: (menu: {
    open: boolean;
    x: number;
    y: number;
    anchor?: { top: number; right: number; bottom: number; left: number };
  }) => void;
};

const LightweightMenuContext = createContext<LightweightMenuContextValue | null>(null);

function ContextMenu({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<{
    open: boolean;
    x: number;
    y: number;
    anchor?: { top: number; right: number; bottom: number; left: number };
  }>({ open: false, x: 0, y: 0 });

  useEffect(() => {
    if (!menu.open) return;
    const close = () => setMenu((current) => ({ ...current, open: false }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("scroll", close, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu.open]);

  return (
    <LightweightMenuContext.Provider value={{ open: menu.open, x: menu.x, y: menu.y, anchor: menu.anchor, setMenu }}>
      {children}
    </LightweightMenuContext.Provider>
  );
}

function ContextMenuTrigger({ children, openOnClick = true }: { asChild?: boolean; children: ReactNode; openOnClick?: boolean }) {
  const context = useContext(LightweightMenuContext);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressStartRef = useRef({ x: 0, y: 0 });
  const suppressNextClickRef = useRef(false);

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => cancelLongPress, []);

  if (!context || !isValidElement(children)) return <>{children}</>;
  const child = children as any;
  const openMenu = (x: number, y: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    context.setMenu({
      open: true,
      x,
      y,
      anchor: { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
    });
  };

  return cloneElement(children, {
    onContextMenu: (event: React.MouseEvent) => {
      child.props.onContextMenu?.(event);
      event.preventDefault();
      event.stopPropagation();
      openMenu(event.clientX, event.clientY, event.currentTarget as HTMLElement);
    },
    onPointerDown: (event: React.PointerEvent) => {
      child.props.onPointerDown?.(event);
      if (event.button !== 0) return;
      cancelLongPress();
      pressStartRef.current = { x: event.clientX, y: event.clientY };
      longPressTimerRef.current = setTimeout(() => {
        suppressNextClickRef.current = true;
        openMenu(event.clientX, event.clientY, event.currentTarget as HTMLElement);
        if (navigator.vibrate) navigator.vibrate(25);
        longPressTimerRef.current = null;
      }, 500);
    },
    onPointerMove: (event: React.PointerEvent) => {
      child.props.onPointerMove?.(event);
      const distance = Math.hypot(
        event.clientX - pressStartRef.current.x,
        event.clientY - pressStartRef.current.y
      );
      if (distance > 10) cancelLongPress();
    },
    onPointerUp: (event: React.PointerEvent) => {
      child.props.onPointerUp?.(event);
      cancelLongPress();
      const target = event.target as HTMLElement;
      const isInteractiveContent = !!target.closest("button, a, input, textarea, audio, video, img");
      if (openOnClick && !event.defaultPrevented && !isInteractiveContent) {
        event.stopPropagation();
        openMenu(event.clientX, event.clientY, event.currentTarget as HTMLElement);
      }
    },
    onPointerCancel: (event: React.PointerEvent) => {
      child.props.onPointerCancel?.(event);
      cancelLongPress();
    },
    onPointerLeave: (event: React.PointerEvent) => {
      child.props.onPointerLeave?.(event);
      cancelLongPress();
    },
    onClick: (event: React.MouseEvent) => {
      if (suppressNextClickRef.current) {
        suppressNextClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      child.props.onClick?.(event);
    },
  } as Partial<HTMLElement>);
}

function ContextMenuContent({ children, className }: { children: ReactNode; className?: string }) {
  const context = useContext(LightweightMenuContext);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8, ready: false });

  useLayoutEffect(() => {
    if (!context?.open || !menuRef.current) return;
    const menu = menuRef.current;
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const gap = 8;
    const margin = 8;
    const anchor = context.anchor;

    let left = context.x;
    let top = context.y;

    if (anchor) {
      const alignRight = (anchor.left + anchor.right) / 2 > window.innerWidth / 2;
      left = alignRight ? anchor.right - width : anchor.left;

      const roomBelow = window.innerHeight - anchor.bottom - margin;
      const roomAbove = anchor.top - margin;
      const placeBelow = roomBelow >= height || roomBelow >= roomAbove;
      top = placeBelow ? anchor.bottom + gap : anchor.top - height - gap;
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - height - margin));
    setPosition({ left, top, ready: true });
  }, [context?.open, context?.x, context?.y, context?.anchor]);

  if (!context?.open) return null;
  return createPortal(
    <div
      ref={menuRef}
      className={cn("fixed z-[100] max-h-[calc(100vh-16px)] overflow-y-auto border border-slate-200 bg-white p-1 text-slate-800 shadow-xl", className)}
      style={{
        left: position.left,
        top: position.top,
        visibility: position.ready ? "visible" : "hidden",
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}

function ContextMenuItem({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const context = useContext(LightweightMenuContext);
  return (
    <button
      type="button"
      className={cn("flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-rose-50 focus:bg-rose-50", className)}
      onClick={() => {
        onClick?.();
        context?.setMenu({ open: false, x: 0, y: 0 });
      }}
    >
      {children}
    </button>
  );
}

function ContextMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100" />;
}

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
  { id: "3d-hearts", name: "Lovely Hearts", tier: "premium", price: 49, is3d: true, colors: { accent: "#ff2d75", outgoing: "linear-gradient(135deg,#ff2d75,#7c3aed)", incoming: "rgba(255,255,255,.38)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#ffe4e6,#ffedf0)" } },
  { id: "3d-roses", name: "Rose Garden", tier: "premium", price: 59, is3d: true, colors: { accent: "#be123c", outgoing: "linear-gradient(135deg,#be123c,#fda4af)", incoming: "rgba(255,255,255,.38)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#fdf2f8,#ffe4e6)" } },
  { id: "3d-stars", name: "Starry Night", tier: "premium", price: 79, is3d: true, colors: { accent: "#facc15", outgoing: "linear-gradient(135deg,#facc15,#d97706)", incoming: "rgba(30,41,59,.45)", panel: "rgba(15,23,42,.32)", input: "rgba(30,41,59,.45)", background: "linear-gradient(135deg,#020617,#1e1b4b)" } },
  { id: "3d-clouds", name: "Dreamy Clouds", tier: "premium", price: 49, is3d: true, colors: { accent: "#38bdf8", outgoing: "linear-gradient(135deg,#38bdf8,#0284c7)", incoming: "rgba(255,255,255,.4)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#e0f2fe,#bae6fd)" } },
  { id: "3d-love-letter", name: "Love Notes", tier: "premium", price: 59, is3d: true, colors: { accent: "#ec4899", outgoing: "linear-gradient(135deg,#ec4899,#f472b6)", incoming: "rgba(255,255,255,.38)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#fdf2f8,#faf5ff)" } },
  { id: "3d-bubble", name: "Bubble Pop", tier: "premium", price: 49, is3d: true, colors: { accent: "#2dd4bf", outgoing: "linear-gradient(135deg,#2dd4bf,#0ea5e9)", incoming: "rgba(255,255,255,.38)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#ccfbf1,#e0f2fe)" } },
  { id: "3d-diamond", name: "Diamond Sparkle", tier: "premium", price: 99, is3d: true, colors: { accent: "#60a5fa", outgoing: "linear-gradient(135deg,#60a5fa,#3b82f6)", incoming: "rgba(255,255,255,.4)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#eff6ff,#e0e7ff)" } },
  { id: "3d-fire", name: "Warm Fire", tier: "premium", price: 69, is3d: true, colors: { accent: "#ea580c", outgoing: "linear-gradient(135deg,#ea580c,#9a3412)", incoming: "rgba(30,41,59,.45)", panel: "rgba(15,23,42,.32)", input: "rgba(30,41,59,.45)", background: "linear-gradient(135deg,#450a0a,#0f172a)" } },
  { id: "3d-cupid", name: "Cupid Arrow", tier: "premium", price: 89, is3d: true, colors: { accent: "#db2777", outgoing: "linear-gradient(135deg,#db2777,#c084fc)", incoming: "rgba(255,255,255,.38)", panel: "rgba(255,255,255,.24)", input: "rgba(255,255,255,.45)", background: "linear-gradient(135deg,#ffe4e6,#fae8ff)" } },
  { id: "3d-galaxy", name: "Cosmic Galaxy", tier: "premium", price: 99, is3d: true, colors: { accent: "#a78bfa", outgoing: "linear-gradient(135deg,#a78bfa,#4c1d95)", incoming: "rgba(30,41,59,.45)", panel: "rgba(15,23,42,.32)", input: "rgba(30,41,59,.45)", background: "linear-gradient(135deg,#030712,#120024)" } },
];

const CHAT_THEMES = [...FREE_CHAT_THEMES, ...PREMIUM_CHAT_THEMES];
const chatThemeStorageKey = (conversationId: string) => `${CHAT_THEME_STORAGE_KEY}:${conversationId}`;
const LEGACY_EMOJI_CATEGORIES = [
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
const FREE_EMOJI_CATEGORIES = [
  {
    id: "faces",
    icon: "😀",
    label: "Smileys & People",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "🥹", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂",
      "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪",
      "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳", "🙂‍↕️", "😏", "😒", "🙂‍↔️", "😞", "😔", "😟",
      "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
      "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🫢",
      "🫡", "🤫", "🫠", "🤥", "😶", "😶‍🌫️", "😐", "😑", "😬", "🫨", "🙄", "😯", "😦", "😧",
      "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷",
      "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽",
      "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"
    ],
  },
  {
    id: "hands",
    icon: "👋",
    label: "Hands & Gestures",
    emojis: [
      "👋", "🤚", "🖐️", "✋", "🖖", "🫱", "🫲", "🫳", "🫴", "👌", "🤌", "🤏", "✌️", "🤞",
      "🫰", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "🫵", "👍", "👎", "✊",
      "👊", "🤛", "🤜", "👏", "🙌", "🫶", "👐", "🤲", "🤝", "🙏", "✍️", "💅", "🤳", "💪",
      "🦾", "🦿", "🦵", "🦶", "👂", "👃", "🧠", "🫀", "🫁", "🦷", "👀", "👁️", "👅", "👄"
    ],
  },
  {
    id: "love",
    icon: "❤️",
    label: "Love & Hearts",
    emojis: [
      "❤️", "🩷", "🧡", "💛", "💚", "💙", "🩵", "💜", "🤎", "🖤", "🩶", "🤍", "💔", "❤️‍🔥",
      "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "♥️", "💋", "💌", "🫶",
      "😍", "🥰", "😘", "😻", "🌹", "💐", "🌷", "🌸", "💍", "👩‍❤️‍👨", "👩‍❤️‍👩", "👨‍❤️‍👨"
    ],
  },
  {
    id: "animals",
    icon: "🐱",
    label: "Animals & Nature",
    emojis: [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐻‍❄️", "🐨", "🐯", "🦁", "🐮", "🐷",
      "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🦄", "🐝", "🦋", "🐌",
      "🐞", "🐢", "🐍", "🦎", "🐙", "🦑", "🦀", "🐠", "🐟", "🐬", "🐳", "🌸", "🌹", "🌻",
      "🌞", "🌝", "⭐", "🌟", "✨", "🔥", "🌈", "☀️", "🌙", "❄️", "☁️", "⚡"
    ],
  },
  {
    id: "food",
    icon: "🍕",
    label: "Food & Activities",
    emojis: [
      "🍏", "🍎", "🍊", "🍋", "🍉", "🍇", "🍓", "🫐", "🍒", "🥭", "🍍", "🥥", "🥝", "🍅",
      "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🍿", "🍩", "🍪", "🎂", "🍰", "🧁", "🍫", "🍬",
      "☕", "🧋", "🥤", "🍺", "🍻", "🥂", "🍷", "⚽", "🏀", "🏏", "🎾", "🏆", "🎮", "🎯",
      "🎨", "🎭", "🎤", "🎧", "🎸", "🎹", "🎬", "🎉", "🎊", "🎁", "🎈"
    ],
  },
  {
    id: "symbols",
    icon: "💯",
    label: "Objects & Symbols",
    emojis: [
      "💯", "✅", "❌", "⚠️", "❓", "❗", "‼️", "💤", "💥", "💫", "💦", "💨", "🔔", "🔕",
      "📌", "📍", "📎", "✏️", "📝", "📱", "💻", "⌚", "📷", "🎥", "🔒", "🔑", "💡", "💎",
      "🚗", "🚕", "🚌", "🚲", "✈️", "🚀", "🏠", "🏢", "🏖️", "⛰️", "🌍", "🇮🇳", "🏳️", "🏁"
    ],
  },
];

void LEGACY_EMOJI_CATEGORIES;

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
  { emoji: "❤️", label: "True Love Heart", price: 29 },
  { emoji: "💔", label: "Broken Heart", price: 19 },
  { emoji: "💖", label: "Sparkling Heart", price: 39 },
  { emoji: "💛", label: "Gold Heart", price: 99 },
];

const CURATED_GIFS = [
  { id: "g1", label: "Tears of Joy", category: "funny", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20with%20Tears%20of%20Joy.png" },
  { id: "g2", label: "Rolling Laughter", category: "funny", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Rolling%20on%20the%20Floor%20Laughing.png" },
  { id: "g3", label: "Zany Face", category: "funny", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Zany%20Face.png" },
  { id: "g4", label: "Clown Face", category: "funny", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Clown%20Face.png" },
  { id: "g5", label: "Alien Dance", category: "funny", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Alien.png" },
  { id: "g6", label: "Sweating Smile", category: "funny", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Grinning%20Face%20with%20Sweat.png" },
  
  { id: "l1", label: "Red Heart", category: "love", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hearts/Red%20Heart.png" },
  { id: "l2", label: "Sparkling Heart", category: "love", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hearts/Sparkling%20Heart.png" },
  { id: "l3", label: "Blowing Kiss", category: "love", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Face%20Blowing%20a%20Kiss.png" },
  { id: "l4", label: "Heart Eyes", category: "love", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Heart-Eyes.png" },
  { id: "l5", label: "Floating Hearts", category: "love", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Smiling%20Face%20with%20Hearts.png" },
  { id: "l6", label: "Ribbon Heart", category: "love", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hearts/Heart%20with%20Ribbon.png" },

  { id: "c1", label: "Cute Puppy", category: "cute", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Dog%20Face.png" },
  { id: "c2", label: "Kitten Wink", category: "cute", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Cat%20Face.png" },
  { id: "c3", label: "Cute Panda", category: "cute", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Panda.png" },
  { id: "c4", label: "Cute Hamster", category: "cute", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Hamster.png" },
  { id: "c5", label: "Cuddly Bear", category: "cute", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png" },
  { id: "c6", label: "Monkey Face", category: "cute", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Monkey%20Face.png" },

  { id: "d1", label: "Sparkles", category: "live", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Sparkles.png" },
  { id: "d2", label: "Arrow Heart", category: "live", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hearts/Heart%20with%20Arrow.png" },
  { id: "d3", label: "Balloon Flight", category: "live", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Balloon.png" },
  { id: "d4", label: "Party Popper", category: "live", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Party%20Popper.png" },
  { id: "d5", label: "Fire Flame", category: "live", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20&%20Places/Fire.png" }
];

const generateTextSvgBase64 = (text: string, styleId: string) => {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const lowercase = text.toLowerCase();
  let keyword = 'none';
  if (lowercase.match(/\b(house|home|gar|ghar|room|stay|flat|apart)\b/) || lowercase.includes("आओ कभी घर")) {
    keyword = 'house';
  } else if (lowercase.match(/\b(cafe|coffee|tea|chai|cup|drink|mug|boba|starbucks)\b/)) {
    keyword = 'cafe';
  } else if (lowercase.match(/\b(love|heart|dil|pyar|pyaar|ishq|mohabbat|gf|bf|kiss|muah|love-you)\b/)) {
    keyword = 'love';
  } else if (lowercase.match(/\b(fire|flame|hot|burn|jal|garam|tandoori)\b/)) {
    keyword = 'fire';
  } else if (lowercase.match(/\b(star|gold|sparkle|shine|premium|sone|chandi)\b/)) {
    keyword = 'star';
  } else if (lowercase.match(/\b(music|song|sound|audio|gana|sing|mic|concert|tune)\b/)) {
    keyword = 'music';
  } else if (lowercase.match(/\b(party|celebrate|dance|fun|nach|masti|club)\b/)) {
    keyword = 'party';
  }

  let keywordStyles = '';
  let keywordSvg = '';

  if (keyword === 'house') {
    keywordStyles = `
      @keyframes houseDraw {
        0%, 100% { stroke-dashoffset: 0; opacity: 0.12; }
        50% { stroke-dashoffset: 15; opacity: 0.22; }
      }
      @keyframes windowGlow {
        0%, 100% { opacity: 0.2; fill: #ffcc00; }
        50% { opacity: 0.9; fill: #ffe875; }
      }
      .house-outline {
        stroke: currentColor;
        stroke-width: 5;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
        stroke-dasharray: 400;
        animation: houseDraw 4s ease-in-out infinite;
      }
      .house-window {
        animation: windowGlow 2.5s ease-in-out infinite;
      }
    `;
    keywordSvg = `
      <g class="keyword-graphic" style="color: currentColor;">
        <path d="M100 80 L150 35 L200 80 Z M115 80 L185 80 L185 125 L115 125 Z M142 125 L142 100 L158 100 L158 125 Z" class="house-outline" />
        <rect x="146" y="88" width="8" height="8" class="house-window" />
      </g>
    `;
  } else if (keyword === 'cafe') {
    keywordStyles = `
      @keyframes riseSteam {
        0% { transform: translateY(5px); opacity: 0; }
        50% { opacity: 0.4; }
        100% { transform: translateY(-10px); opacity: 0; }
      }
      .steam {
        fill: none;
        stroke: currentColor;
        stroke-width: 4;
        stroke-linecap: round;
        animation: riseSteam 2s infinite ease-in-out;
      }
      .steam-1 { animation-delay: 0s; }
      .steam-2 { animation-delay: 0.6s; }
      .steam-3 { animation-delay: 1.2s; }
      .cup-outline {
        stroke: currentColor;
        stroke-width: 5;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
        opacity: 0.15;
      }
    `;
    keywordSvg = `
      <g class="keyword-graphic" style="color: currentColor;">
        <path d="M115 75 H185 L175 120 C175 125 125 125 125 120 Z M180 83 C196 83 196 105 178 105" class="cup-outline" />
        <path d="M135 63 Q130 51 135 38" class="steam steam-1" />
        <path d="M150 63 Q145 51 150 38" class="steam steam-2" />
        <path d="M165 63 Q160 51 165 38" class="steam steam-3" />
      </g>
    `;
  } else if (keyword === 'love') {
    keywordStyles = `
      @keyframes heartBgPulse {
        0%, 100% { transform: scale(0.93); opacity: 0.08; }
        50% { transform: scale(1.07); opacity: 0.22; }
      }
      .heart-pulse {
        fill: #ff2d55;
        transform-origin: 150px 75px;
        animation: heartBgPulse 1.2s ease-in-out infinite;
      }
    `;
    keywordSvg = `
      <g class="keyword-graphic">
        <path d="M150 45 C140 25 100 25 100 55 C100 85 150 115 150 115 C150 115 200 85 200 55 C200 25 160 25 150 45 Z" class="heart-pulse" />
      </g>
    `;
  } else if (keyword === 'fire') {
    keywordStyles = `
      @keyframes fireFlicker {
        0%, 100% { transform: scaleY(0.92) skewX(-1.5deg); opacity: 0.1; }
        50% { transform: scaleY(1.08) skewX(1.5deg); opacity: 0.25; }
      }
      .flame-bg {
        fill: #ff5500;
        transform-origin: 150px 130px;
        animation: fireFlicker 0.6s ease-in-out infinite;
      }
    `;
    keywordSvg = `
      <g class="keyword-graphic">
        <path d="M150 30 C130 50 110 70 110 95 C110 117 128 135 150 135 C172 135 190 117 190 95 C190 65 165 45 150 30 Z" class="flame-bg" />
      </g>
    `;
  } else if (keyword === 'star') {
    keywordStyles = `
      @keyframes starTwinkle {
        0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.08; }
        50% { transform: scale(1.15) rotate(90deg); opacity: 0.25; }
      }
      .star-sparkle {
        fill: #ffe259;
        transform-origin: 150px 75px;
        animation: starTwinkle 2s ease-in-out infinite;
      }
    `;
    keywordSvg = `
      <g class="keyword-graphic">
        <path d="M150 30 Q150 75 105 75 Q150 75 150 120 Q150 75 195 75 Q150 75 150 30 Z" class="star-sparkle" />
      </g>
    `;
  } else if (keyword === 'music') {
    keywordStyles = `
      @keyframes floatNote {
        0% { transform: translateY(8px) rotate(-10deg); opacity: 0; }
        50% { opacity: 0.25; }
        100% { transform: translateY(-15px) rotate(10deg); opacity: 0; }
      }
      .note {
        fill: none;
        stroke: currentColor;
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
        animation: floatNote 2.5s infinite ease-in-out;
      }
      .note-1 { animation-delay: 0s; transform-origin: 115px 70px; }
      .note-2 { animation-delay: 1.25s; transform-origin: 180px 80px; }
    `;
    keywordSvg = `
      <g class="keyword-graphic" style="color: currentColor;">
        <path d="M110 90 A10 8 0 1 1 100 78 V45 H130 V78 A10 8 0 1 1 120 66 M100 52 H130" class="note note-1" />
        <path d="M175 100 A10 8 0 1 1 165 88 V55 H195 V88 A10 8 0 1 1 185 76 M165 62 H195" class="note note-2" />
      </g>
    `;
  } else if (keyword === 'party') {
    keywordStyles = `
      @keyframes popConfetti {
        0%, 100% { transform: translateY(0) scale(0.8); opacity: 0.1; }
        50% { transform: translateY(-15px) scale(1.15); opacity: 0.35; }
      }
      .confetti {
        animation: popConfetti 1.5s ease-in-out infinite;
      }
      .confetti-1 { animation-delay: 0s; }
      .confetti-2 { animation-delay: 0.4s; }
      .confetti-3 { animation-delay: 0.8s; }
      .confetti-4 { animation-delay: 1.2s; }
    `;
    keywordSvg = `
      <g class="keyword-graphic">
        <circle cx="90" cy="50" r="5" class="confetti confetti-1" fill="#ff2d55" />
        <circle cx="210" cy="100" r="4" class="confetti confetti-2" fill="#00ffff" />
        <polygon points="120,110 126,118 114,118" class="confetti confetti-3" fill="#ffcc00" />
        <polygon points="180,40 188,40 184,48" class="confetti confetti-4" fill="#ff9500" />
      </g>
    `;
  }

  let svgContent = '';

  if (styleId === 'neon') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <defs>
    <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff007f" />
      <stop offset="100%" stop-color="#7f00ff" />
    </linearGradient>
  </defs>
  <style>
    @keyframes neonGlow {
      0%, 100% {
        text-shadow: 0 0 5px #ff007f, 0 0 10px #ff007f, 0 0 20px #ff007f, 0 0 40px #ff007f;
        fill: #ffffff;
      }
      50% {
        text-shadow: 0 0 2px #7f00ff, 0 0 5px #7f00ff, 0 0 10px #7f00ff, 0 0 20px #7f00ff;
        fill: #ff80df;
      }
    }
    .neon-text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 26px;
      font-weight: 900;
      text-anchor: middle;
      dominant-baseline: middle;
      animation: neonGlow 1.5s ease-in-out infinite;
    }
    .bg {
      fill: #0c0a0f;
      rx: 15;
    }
    ${keywordStyles}
  </style>
  <rect width="100%" height="100%" class="bg" />
  ${keywordSvg}
  <text x="150" y="75" class="neon-text">${escapedText}</text>
</svg>`;
  } else if (styleId === 'love') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <style>
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }
    @keyframes floatHearts {
      0% { transform: translateY(0px) scale(0.6); opacity: 0; }
      50% { opacity: 0.8; }
      100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
    }
    .main-text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 24px;
      font-weight: 800;
      fill: #ffffff;
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .heart-icon {
      fill: #ff2d55;
      transform-origin: 150px 75px;
      animation: heartbeat 1.2s ease-in-out infinite;
    }
    .bg {
      fill: #1e0b11;
      rx: 15;
    }
    .particle-heart {
      fill: #ff4d6d;
      animation: floatHearts 2s ease-in-out infinite;
      opacity: 0;
    }
    ${keywordStyles}
  </style>
  <rect width="100%" height="100%" class="bg" />
  <g class="heart-icon">
    <path d="M120 75 C120 50 150 45 150 70 C150 45 180 50 180 75 C180 100 150 115 150 120 C150 115 120 100 120 75 Z" opacity="0.15" fill="#ff2d55" />
  </g>
  <path d="M70 100 C70 90 80 88 80 96 C80 88 90 90 90 100 C90 110 80 115 80 117 C80 115 70 110 70 100 Z" class="particle-heart" style="animation-delay: 0s; transform-origin: 80px 100px;" />
  <path d="M220 50 C220 40 230 38 230 46 C230 38 240 40 240 50 C240 60 230 65 230 67 C230 65 220 60 220 50 Z" class="particle-heart" style="animation-delay: 1s; transform-origin: 230px 50px;" />
  ${keywordSvg}
  <text x="150" y="75" class="main-text">${escapedText}</text>
</svg>`;
  } else if (styleId === 'glitch') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <style>
    @keyframes glitch {
      0% { clip-path: inset(40% 0 61% 0); transform: skew(0.3deg); }
      20% { clip-path: inset(92% 0 1% 0); transform: skew(-0.5deg); }
      40% { clip-path: inset(15% 0 80% 0); transform: skew(0.5deg); }
      60% { clip-path: inset(80% 0 5% 0); transform: skew(-0.3deg); }
      80% { clip-path: inset(3% 0 92% 0); transform: skew(0.8deg); }
      100% { clip-path: inset(40% 0 61% 0); transform: skew(0deg); }
    }
    .glitch-text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 26px;
      font-weight: 900;
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .text-base {
      fill: #ffffff;
    }
    .text-glitch-1 {
      fill: #00ffff;
      animation: glitch 1s linear infinite;
    }
    .text-glitch-2 {
      fill: #ff00ff;
      animation: glitch 1.5s linear infinite reverse;
    }
    .bg {
      fill: #080f14;
      rx: 15;
    }
    ${keywordStyles}
  </style>
  <rect width="100%" height="100%" class="bg" />
  ${keywordSvg}
  <text x="153" y="77" class="glitch-text text-glitch-1">${escapedText}</text>
  <text x="147" y="73" class="glitch-text text-glitch-2">${escapedText}</text>
  <text x="150" y="75" class="glitch-text text-base">${escapedText}</text>
</svg>`;
  } else if (styleId === 'rainbow') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <defs>
    <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff0000" />
      <stop offset="20%" stop-color="#ff7f00" />
      <stop offset="40%" stop-color="#ffff00" />
      <stop offset="60%" stop-color="#00ff00" />
      <stop offset="80%" stop-color="#0000ff" />
      <stop offset="100%" stop-color="#8b00ff" />
    </linearGradient>
  </defs>
  <style>
    @keyframes colorWave {
      0% { stop-color: #ff0000; }
      17% { stop-color: #ff7f00; }
      33% { stop-color: #ffff00; }
      50% { stop-color: #00ff00; }
      67% { stop-color: #0000ff; }
      83% { stop-color: #8b00ff; }
      100% { stop-color: #ff0000; }
    }
    .rainbow-text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 26px;
      font-weight: 900;
      fill: url(#rainbowGrad);
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .bg {
      fill: #111111;
      rx: 15;
    }
    #rainbowGrad stop {
      animation: colorWave 5s linear infinite;
    }
    #rainbowGrad stop:nth-child(1) { animation-delay: 0s; }
    #rainbowGrad stop:nth-child(2) { animation-delay: -0.83s; }
    #rainbowGrad stop:nth-child(3) { animation-delay: -1.66s; }
    #rainbowGrad stop:nth-child(4) { animation-delay: -2.5s; }
    #rainbowGrad stop:nth-child(5) { animation-delay: -3.33s; }
    #rainbowGrad stop:nth-child(6) { animation-delay: -4.16s; }
    ${keywordStyles}
  </style>
  <rect width="100%" height="100%" class="bg" />
  ${keywordSvg}
  <text x="150" y="75" class="rainbow-text">${escapedText}</text>
</svg>`;
  } else if (styleId === 'fire') {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <style>
    @keyframes fireGlow {
      0%, 100% { text-shadow: 0 0 4px #ff3300, 0 -2px 8px #ff9900, 0 -4px 15px #ffcc00; }
      50% { text-shadow: 0 0 6px #ff3300, 0 -4px 12px #ffaa00, 0 -8px 25px #ffea00; transform: translateY(-1px) scale(1.02); }
    }
    .fire-text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 26px;
      font-weight: 900;
      fill: #ffffff;
      text-anchor: middle;
      dominant-baseline: middle;
      transform-origin: 150px 75px;
      animation: fireGlow 0.8s ease-in-out infinite;
    }
    .bg {
      fill: #1a0500;
      rx: 15;
    }
    ${keywordStyles}
  </style>
  <rect width="100%" height="100%" class="bg" />
  ${keywordSvg}
  <text x="150" y="75" class="fire-text">${escapedText}</text>
</svg>`;
  } else {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe259" />
      <stop offset="100%" stop-color="#ffa751" />
    </linearGradient>
  </defs>
  <style>
    @keyframes sparkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8) rotate(0deg); }
      50% { opacity: 1; transform: scale(1.3) rotate(45deg); }
    }
    .gold-text {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 26px;
      font-weight: 900;
      fill: url(#goldGrad);
      text-anchor: middle;
      dominant-baseline: middle;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }
    .bg {
      fill: #15110a;
      rx: 15;
    }
    .star {
      fill: #ffe259;
      animation: sparkle 1.5s ease-in-out infinite;
    }
    ${keywordStyles}
  </style>
  <rect width="100%" height="100%" class="bg" />
  <polygon points="50,40 52,48 60,50 52,52 50,60 48,52 40,50 48,48" class="star" style="animation-delay: 0s; transform-origin: 50px 50px;" />
  <polygon points="250,100 252,108 260,110 252,112 250,120 248,112 240,110 248,108" class="star" style="animation-delay: 0.7s; transform-origin: 250px 110px;" />
  <polygon points="240,30 241,34 245,35 241,36 240,40 239,36 235,35 239,34" class="star" style="animation-delay: 0.3s; transform-origin: 240px 35px;" />
  ${keywordSvg}
  <text x="150" y="75" class="gold-text">${escapedText}</text>
</svg>`;
  }

  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgContent)));
};

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
  "True Love Heart": { emoji: "❤️", bg: "from-red-50 via-rose-100 to-white", glow: "shadow-red-200/80", meaning: "Deep, sincere & pure love", imageSrc: "/images/gifts/red_heart.png" },
  "Broken Heart": { emoji: "💔", bg: "from-slate-100 via-neutral-200 to-slate-50", glow: "shadow-slate-300/80", meaning: "Healing a wounded connection", imageSrc: "/images/gifts/broken_heart.png" },
  "Sparkling Heart": { emoji: "💖", bg: "from-pink-50 via-pink-100 to-white", glow: "shadow-pink-200/80", meaning: "Exciting, vibrant affection", imageSrc: "/images/gifts/sparkling_heart.png" },
  "Gold Heart": { emoji: "💛", bg: "from-amber-50 via-yellow-100 to-white", glow: "shadow-yellow-200/80", meaning: "Luxurious, precious and pure bond", imageSrc: "/images/gifts/gold_heart.png" },
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

function isGifMessage(content?: string) {
  return !!content?.startsWith(GIF_MESSAGE_PREFIX);
}

function gifMessageSrc(content: string) {
  return content.slice(GIF_MESSAGE_PREFIX.length);
}

function messagePreview(content?: string) {
  if (isChatThemeMessage(content)) return "Chat theme changed";
  if (isVoiceMessage(content)) return "Voice message";
  if (isPhotoMessage(content)) return "Photo";
  if (isVideoMessage(content)) return "Video";
  if (isGiftMessage(content)) return "Premium gift";
  if (isGifMessage(content)) return "GIF";
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

function TransparentImage({ src, alt, className, style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src) return;
    
    // Only process local gift/rose images that are JPEGs
    if (!src.includes('/images/')) {
      setProcessedSrc(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        // Key out bright, low-saturated pixels (whites, grays, and soft shadows)
        if (max > 185 && diff < 35) {
          let alphaFactor = 0;
          if (max < 240) {
            alphaFactor = (240 - max) / (240 - 185);
          }
          data[i+3] = Math.round(data[i+3] * Math.max(0, Math.min(1, alphaFactor)));
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      setProcessedSrc(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      setProcessedSrc(src);
    };
  }, [src]);

  return <img src={processedSrc} alt={alt} className={className} style={style} loading="lazy" decoding="async" />;
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
        <TransparentImage
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

interface GiftAnimationOverlayProps {
  gift: {
    emoji: string;
    label: string;
    imageSrc?: string;
    bg?: string;
    glow?: string;
    meaning?: string;
  } | null;
}

function GiftAnimationOverlay({ gift }: GiftAnimationOverlayProps) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (!gift) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 28 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 180 + 60;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotate: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 0.35,
      };
    });
    setParticles(newParticles);
  }, [gift]);

  return (
    <>
      {gift && (
        <div className="gift-animation-overlay absolute inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <div className={`gift-animation-flash absolute inset-0 bg-gradient-to-br ${gift.bg || 'from-pink-100 to-rose-200'} mix-blend-screen`} />

          <div className="absolute inset-0 flex items-center justify-center">
            {particles.map((p) => (
              <div
                key={p.id}
                className="gift-animation-particle absolute flex items-center justify-center"
                style={{
                  "--gift-x": `${p.x}px`,
                  "--gift-y": `${p.y}px`,
                  "--gift-rotate": `${p.rotate + 180}deg`,
                  "--gift-scale": p.scale,
                  animationDelay: `${p.delay}s`,
                } as CSSProperties}
              >
                {gift.imageSrc ? (
                  <img
                    src={gift.imageSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]"
                  />
                ) : (
                  <span className="text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)]">
                    {gift.emoji}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div
            className="gift-animation-card relative flex flex-col items-center justify-center p-6 rounded-3xl bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 shadow-2xl backdrop-blur-xl max-w-[240px] text-center"
          >
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gift.bg || 'from-pink-400 to-rose-600'} opacity-25 blur-xl pointer-events-none`} />

            <div className="relative w-28 h-28 flex items-center justify-center mb-3">
              {gift.imageSrc ? (
                <img
                  src={gift.imageSrc}
                  alt={gift.label}
                  loading="lazy"
                  decoding="async"
                  width={96}
                  height={96}
                  className="relative z-10 w-24 h-24 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] animate-bounce [animation-duration:3s]"
                />
              ) : (
                <span className="relative z-10 text-6xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] animate-bounce [animation-duration:3s]">
                  {gift.emoji}
                </span>
              )}
            </div>


          </div>
        </div>
      )}
    </>
  );
}

function formatRecordingTime(seconds: number) {
 const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
 const secs = (seconds % 60).toString().padStart(2, "0");
 return `${mins}:${secs}`;
}

function isEmojiOnlyMessage(content: string) {
 const value = content.trim();
 if (!value || !/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}]/u.test(value)) return false;
 return value.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Regional_Indicator}\p{Emoji_Modifier}\uFE0E\uFE0F\u200D\u20E3\s]/gu, "").length === 0;
}

function isSingleEmojiMessage(content: string) {
 const value = content.trim();
 if (!isEmojiOnlyMessage(value)) return false;
 const Segmenter = (Intl as any).Segmenter;
 if (Segmenter) {
   return [...new Segmenter(undefined, { granularity: "grapheme" }).segment(value)].length === 1;
 }
 return Array.from(value).length <= 2;
}

function emojiGraphemes(content: string): string[] {
 const value = content.trim();
 const Segmenter = (Intl as any).Segmenter;
 if (Segmenter) {
   return [...new Segmenter(undefined, { granularity: "grapheme" }).segment(value)].map((part: any) => part.segment);
 }
 return Array.from(value);
}

function emojiReactionClass(emoji: string) {
 if (/[❤🩷🧡💛💚💙🩵💜🤎🖤🩶🤍💕💞💓💗💖💘💝😍🥰]/u.test(emoji)) return "chat-emoji-heartbeat";
 if (/[😂🤣😹😆😁😄😃😀]/u.test(emoji)) return "chat-emoji-laugh";
 if (/[😭😢🥹😿😥😰]/u.test(emoji)) return "chat-emoji-cry";
 if (/[😡😠🤬👿😤]/u.test(emoji)) return "chat-emoji-angry";
 if (/[👋🤚🖐✋🖖]/u.test(emoji)) return "chat-emoji-wave";
 if (/[😘😗😙😚💋]/u.test(emoji)) return "chat-emoji-kiss";
 if (/[🥳🎉🎊🎈🤩]/u.test(emoji)) return "chat-emoji-party";
 if (/[😱😲😮🤯]/u.test(emoji)) return "chat-emoji-surprise";
 if (/[😴😪🥱]/u.test(emoji)) return "chat-emoji-sleep";
 if (/[👍👎👏🙌🙏💪]/u.test(emoji)) return "chat-emoji-gesture";
 return "chat-single-emoji";
}

function emojiCodepoints(emoji: string, separator: string) {
 return Array.from(emoji.trim())
   .filter((character) => character.codePointAt(0) !== 0xfe0f)
   .map((character) => character.codePointAt(0)!.toString(16))
   .join(separator);
}

function HdEmoji({ emoji, className }: { emoji: string; className?: string }) {
 const [sourceIndex, setSourceIndex] = useState(0);
 const sources = [
   `https://cdn.jsdelivr.net/gh/googlefonts/noto-emoji/svg/emoji_u${emojiCodepoints(emoji, "_")}.svg`,
   `https://cdn.jsdelivr.net/gh/jdecked/twemoji@16.0.1/assets/svg/${emojiCodepoints(emoji, "-")}.svg`,
 ];
 if (sourceIndex >= sources.length) return <span className={className}>{emoji}</span>;
 return (
   <img
     src={sources[sourceIndex]}
     alt={emoji}
     draggable={false}
     loading="lazy"
     decoding="async"
     onError={() => setSourceIndex((current) => current + 1)}
     className={cn("block object-contain", className)}
   />
 );
}

function MessageContent({ content, isMe, onOpenPhoto }: { content: string; isMe: boolean; onOpenPhoto: (src: string) => void }) {
 if (isSingleEmojiMessage(content)) {
   const emoji = content.trim();
   return <HdEmoji emoji={emoji} className={cn("h-14 w-14 drop-shadow-sm", emojiReactionClass(emoji))} />;
 }

 if (isEmojiOnlyMessage(content)) {
   return (
     <div className="flex flex-wrap items-center gap-0.5 py-0.5">
       {emojiGraphemes(content).map((emoji, index) => (
         <HdEmoji key={`${emoji}-${index}`} emoji={emoji} className="h-7 w-7" />
       ))}
     </div>
   );
 }

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
         loading="lazy"
         decoding="async"
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
    return (
      <div className="flex justify-center p-1.5 cursor-default select-none">
        <GiftVisual label={gift.label} emoji={gift.emoji} size="lg" bare />
      </div>
    );
  }

  if (isGifMessage(content)) {
    const src = gifMessageSrc(content);
    return (
      <div className="relative overflow-hidden rounded-xl bg-transparent">
        <img
          src={src}
          alt="GIF"
          loading="lazy"
          decoding="async"
          width={240}
          height={160}
          referrerPolicy="no-referrer"
          className="max-h-60 max-w-[240px] rounded-xl object-contain border border-white/10 shadow-md transition-transform duration-300 hover:scale-[1.04]"
        />
      </div>
    );
  }

  return <span className={cn("whitespace-pre-wrap break-words", isMe ? "text-white" : "text-foreground")}>{content}</span>;
}

function ChatThemeParticles({ themeId }: { themeId: string }) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    let animType = "float-up";
    if (themeId === "3d-roses" || themeId === "3d-diamond") {
      animType = "float-down";
    } else if (themeId === "3d-stars" || themeId === "3d-galaxy") {
      animType = "twinkle";
    } else if (themeId === "3d-clouds") {
      animType = "float-left-right";
    }

    const items = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      seed: Math.random(),
      left: `${Math.random() * 100}%`,
      top: animType === "float-down" ? "-10%" : animType === "float-up" ? "110%" : `${Math.random() * 80 + 10}%`,
      size: `${Math.random() * 1.8 + 1.2}rem`,
      delay: `${Math.random() * 8}s`,
      duration: animType === "twinkle" ? `${Math.random() * 4 + 3}s` : `${Math.random() * 12 + 10}s`,
      animType,
    }));
    setParticles(items);
  }, [themeId]);

  const renderParticleSVG = (seed: number) => {
    switch (themeId) {
      case "3d-stars": {
        if (seed < 0.6) {
          return (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-yellow-200 filter drop-shadow-[0_0_8px_rgba(254,240,138,0.9)] opacity-80">
              <path d="M12 0 L15.5 8.5 L24 12 L15.5 15.5 L12 24 L8.5 15.5 L0 12 L8.5 8.5 Z" />
            </svg>
          );
        } else if (seed < 0.85) {
          return (
            <svg viewBox="0 0 32 32" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]">
              <circle cx="16" cy="16" r="6.5" fill="#f97316" />
              <ellipse cx="16" cy="16" rx="13" ry="3.5" fill="none" stroke="#ffedd5" strokeWidth="2" transform="rotate(-15 16 16)" />
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 40 40" className="w-full h-full select-none pointer-events-none">
              <line x1="0" y1="40" x2="40" y2="0" stroke="url(#star-shoot-trail)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="40" cy="0" r="3" fill="#ffffff" className="filter drop-shadow-[0_0_8px_#ffffff]" />
              <defs>
                <linearGradient id="star-shoot-trail" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
                  <stop offset="70%" stopColor="#facc15" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          );
        }
      }
      case "3d-galaxy": {
        if (seed < 0.5) {
          return (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-indigo-200 filter drop-shadow-[0_0_6px_rgba(167,139,250,0.8)] opacity-90">
              <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
            </svg>
          );
        } else if (seed < 0.85) {
          return (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-fuchsia-400 filter drop-shadow-[0_0_8px_rgba(240,82,185,0.8)]">
              <path d="M12 2 C10 8 2 10 2 12 C2 14 10 16 12 22 C14 16 22 14 22 12 C22 10 14 8 12 2 Z" />
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 32 32" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]">
              <path d="M16 8 C18 12, 22 12, 24 16 C26 20, 22 22, 16 24 C10 26, 8 24, 6 20 C4 16, 8 12, 16 8 Z" fill="url(#gal-grad)" className="animate-spin" style={{ transformOrigin: "center", animationDuration: "12s" }} />
              <circle cx="16" cy="16" r="4.5" fill="#ffffff" className="filter drop-shadow-[0_0_6px_#ffffff]" />
              <defs>
                <radialGradient id="gal-grad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="1" />
                  <stop offset="60%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          );
        }
      }
      case "3d-hearts":
      case "3d-cupid": {
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-500 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] transition-transform duration-300 hover:scale-125">
            <path d="M12 21.35 l-1.45-1.32 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 c1.74 0 3.41.81 4.5 2.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 c0 3.78-3.4 6.86-8.55 11.54 L12 21.35 z" />
          </svg>
        );
      }
      case "3d-love-letter": {
        if (seed < 0.5) {
          return (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-pink-400 filter drop-shadow-[0_2px_6px_rgba(244,114,182,0.4)]">
              <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
            </svg>
          );
        } else {
          return (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]">
              <path d="M12 21.35 l-1.45-1.32 C5.4 15.36 2 12.28 2 8.5 C2 5.42 4.42 3 7.5 3 c1.74 0 3.41.81 4.5 2.09 C13.09 3.81 14.76 3 16.5 3 C19.58 3 22 5.42 22 8.5 c0 3.78-3.4 6.86-8.55 11.54 L12 21.35 z" />
            </svg>
          );
        }
      }
      case "3d-roses": {
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-600 filter drop-shadow-[0_3px_5px_rgba(159,18,57,0.35)]">
            <path d="M12,2 C9,4.5 6,5 4.5,7.5 C3,10 4,13 6,15 C8.5,17.5 12,19.5 13,20 C14,19.5 17.5,17.5 20,15 C22,13 23,10 21.5,7.5 C20,5 17,4.5 14,2 C13,3 11,3 12,2 Z" opacity="0.95" />
            <path d="M12,5 C10,7 8,7.5 7,9 C6,10.5 6.5,12 8,13 C9.5,14 12,15.5 13,16 C14,15.5 16.5,14 18,13 C19.5,12 20,10.5 19,9 C18,7.5 16,7 14,5 C13.5,5.5 12.5,5.5 12,5 Z" fill="#be123c" opacity="0.8" />
          </svg>
        );
      }
      case "3d-fire": {
        return (
          <div className="w-full h-full rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 filter blur-[1.5px] shadow-[0_0_8px_#f97316]" />
        );
      }
      case "3d-bubble": {
        return (
          <div className="relative w-full h-full rounded-full border border-white/25 shadow-[inset_0_0_8px_rgba(255,255,255,0.7)]" style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%), radial-gradient(circle, rgba(45,212,191,0.08) 0%, rgba(14,165,233,0.18) 100%)"
          }}>
            <span className="absolute left-[20%] top-[20%] w-[18%] h-[12%] bg-white/70 rounded-full rotate-45" />
          </div>
        );
      }
      case "3d-diamond": {
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full fill-cyan-200 filter drop-shadow-[0_0_10px_rgba(56,189,248,0.75)] animate-pulse">
            <path d="M12 2 L22 12 L12 22 L2 12 Z" />
            <path d="M12 6 L18 12 L12 18 L6 12 Z" fill="#ffffff" opacity="0.5" />
          </svg>
        );
      }
      case "3d-clouds": {
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full fill-white/80 filter drop-shadow-[0_4px_10px_rgba(255,255,255,0.3)]">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
          </svg>
        );
      }
      default:
        return <span className="text-yellow-200">✨</span>;
    }
  };

  const renderThemeGlows = () => {
    switch (themeId) {
      case "3d-stars":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen overflow-hidden">
            <div className="absolute -top-1/4 -left-1/4 w-[85%] h-[85%] rounded-full bg-indigo-500/20 blur-[130px] animate-[pulse_10s_infinite]" />
            <div className="absolute -bottom-1/4 -right-1/4 w-[85%] h-[85%] rounded-full bg-violet-600/15 blur-[130px] animate-[pulse_14s_infinite]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[60%] rounded-full bg-amber-500/10 blur-[110px] animate-[pulse_12s_infinite]" />
          </div>
        );
      case "3d-galaxy":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen overflow-hidden">
            <div className="absolute -top-1/3 right-[-10%] w-[95%] h-[95%] rounded-full bg-fuchsia-600/20 blur-[150px] animate-[pulse_12s_infinite_alternate]" />
            <div className="absolute -bottom-1/3 left-[-10%] w-[95%] h-[95%] rounded-full bg-violet-600/20 blur-[150px] animate-[pulse_16s_infinite_alternate]" />
            <div className="absolute top-1/4 left-1/3 w-[55%] h-[55%] rounded-full bg-cyan-500/10 blur-[110px]" />
          </div>
        );
      case "3d-hearts":
      case "3d-cupid":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply overflow-hidden">
            <div className="absolute -top-10 left-10 w-96 h-96 rounded-full bg-rose-200/40 blur-[90px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pink-200/40 blur-[90px]" />
          </div>
        );
      case "3d-fire":
        return (
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen overflow-hidden">
            <div className="absolute -bottom-[20%] left-[-10%] w-[120%] h-[65%] rounded-full bg-gradient-to-t from-orange-600/25 via-red-600/10 to-transparent blur-[90px] animate-[pulse_6s_infinite]" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {renderThemeGlows()}
      {particles.map((p) => {
        const isDark = themeId === "3d-stars" || themeId === "3d-galaxy" || themeId === "3d-fire";
        const opacityClass = isDark ? "opacity-60" : "opacity-85";
        return (
          <div
            key={p.id}
            className={cn("absolute select-none pointer-events-none", opacityClass, `animate-${p.animType}`)}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
              animationIterationCount: "infinite",
              animationTimingFunction: "linear",
            }}
          >
            {renderParticleSVG(p.seed)}
          </div>
        );
      })}
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
 const [deletedChats, setDeletedChats] = useState<Record<string, number>>({});
 const [mutedChatIds, setMutedChatIds] = useState<Set<string>>(new Set());
 const [coinBalance, setCoinBalance] = useState(0);
 const [coinActionPending, setCoinActionPending] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [draft, setDraft] = useState("");
 const [incomingCall, setIncomingCall] = useState<any | null>(null);
 const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
 const [profileModal, setProfileModal] = useState<any | null>(null);
 const [profileLoading, setProfileLoading] = useState(false);
 const [photoViewerSrc, setPhotoViewerSrc] = useState<string | null>(null);
 const [deleteDialogMessage, setDeleteDialogMessage] = useState<any | null>(null);
 const [deleteDialogNow, setDeleteDialogNow] = useState(() => Date.now());
 const [messageInfo, setMessageInfo] = useState<any | null>(null);
 const [replyToMessage, setReplyToMessage] = useState<any | null>(null);
 const [editingMessage, setEditingMessage] = useState<any | null>(null);
 const [reactionPickerMessage, setReactionPickerMessage] = useState<any | null>(null);
 const [reactionEmojiCategory, setReactionEmojiCategory] = useState(FREE_EMOJI_CATEGORIES[0].id);
 const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
 const [isMicOn, setIsMicOn] = useState(true);
 const [isCameraOn, setIsCameraOn] = useState(true);
 const [isSpeakerOn, setIsSpeakerOn] = useState(true);
 const [isRecordingVoice, setIsRecordingVoice] = useState(false);
 const [recordingSeconds, setRecordingSeconds] = useState(0);
 const [selectedMedia, setSelectedMedia] = useState<{ file: File; url: string; type: "photo" | "video" } | null>(null);
 const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState(FREE_CHAT_THEMES[0].id);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [disappearingMode, setDisappearingMode] = useState<'after-view' | '24h' | '7d' | 'off'>("off");
  const [activePickerTab, setActivePickerTab] = useState<"emoji" | "gift" | "gif">("emoji");
  const [activeEmojiCategory, setActiveEmojiCategory] = useState(FREE_EMOJI_CATEGORIES[0].id);
  const [activeGifCategory, setActiveGifCategory] = useState<string>("funny");
  const [gifSearchQuery, setGifSearchQuery] = useState<string>("");
  const [textToGifVal, setTextToGifVal] = useState<string>("");
  const [activeGifSubTab, setActiveGifSubTab] = useState<"library" | "text-to-gif">("library");
  const [activeGiftAnim, setActiveGiftAnim] = useState<{
    emoji: string;
    label: string;
    imageSrc?: string;
    bg?: string;
    glow?: string;
    meaning?: string;
  } | null>(null);
  const lastGiftMsgIdRef = useRef<string | null>(null);
  const initialMessageIdsRef = useRef<Set<string>>(new Set());
  const hasLoadedHistoryRef = useRef<boolean>(false);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerTriggerRef = useRef<HTMLButtonElement>(null);
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

 useEffect(() => {
   try {
     const saved = JSON.parse(window.localStorage.getItem(DELETED_CHATS_STORAGE_KEY) || "{}");
     if (saved && typeof saved === "object") setDeletedChats(saved);
   } catch {}
 }, []);

 useEffect(() => {
   try {
     const saved = JSON.parse(window.localStorage.getItem(MUTED_CHATS_STORAGE_KEY) || "[]");
     if (Array.isArray(saved)) setMutedChatIds(new Set(saved.map(String)));
   } catch {}
 }, []);

 useEffect(() => {
   if (!showEmojiPicker) return;

   const closePickerOnOutsideClick = (event: PointerEvent) => {
     const target = event.target as Node;
     if (
       !emojiPickerRef.current?.contains(target) &&
       !emojiPickerTriggerRef.current?.contains(target)
     ) {
       setShowEmojiPicker(false);
     }
   };

   document.addEventListener("pointerdown", closePickerOnOutsideClick);
   return () => document.removeEventListener("pointerdown", closePickerOnOutsideClick);
 }, [showEmojiPicker]);

 const token = getToken() || "";

 useEffect(() => {
   if (!token) return;
   fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
     .then((response) => response.ok ? response.json() : null)
     .then((user) => {
       if (user) setCoinBalance(Number(user.coinBalance) || 0);
     })
     .catch(() => {});
 }, [token]);
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
    if (activePickerTab === "gif" && draft.trim()) {
      setTextToGifVal(draft.trim());
    }
  }, [activePickerTab, draft]);

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

  const { matches: activeMatches } = useMatches(token, "active");
  const {
    messages,
    sendMessage,
    socket,
    toggleReaction,
    sendTypingStatus,
    sendRecordingStatus,
    markMessagesRead,
    isTyping,
    isRecording,
    editMessage,
    deleteMessage,
    togglePin,
    toggleStar,
  } = useChatWebSocket(token, activeId);

 useEffect(() => {
   if (activeId && token) {
     markMessagesRead();
     fetch(`${API_URL}/messages/${activeId}/read`, {
       method: 'PATCH',
       headers: { Authorization: `Bearer ${token}` }
     }).then(() => {
       queryClient.invalidateQueries({ queryKey: ['matches', 'active'] });
     }).catch(() => {});
   }
 }, [activeId, token, queryClient, markMessagesRead]);
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
 const hiddenOlderMessageCount = Math.max(0, visibleMessages.length - INITIAL_MESSAGE_RENDER_LIMIT);
 const renderedMessages = showFullHistory || hiddenOlderMessageCount === 0
   ? visibleMessages
   : visibleMessages.slice(-INITIAL_MESSAGE_RENDER_LIMIT);

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

  // Reset history tracking when active chat conversation changes
  useEffect(() => {
    initialMessageIdsRef.current = new Set();
    hasLoadedHistoryRef.current = false;
    setShowFullHistory(false);
  }, [activeId]);

  // Capture initial history message IDs
  useEffect(() => {
    if (!messages.length) return;
    if (!hasLoadedHistoryRef.current) {
      initialMessageIdsRef.current = new Set(messages.map((m: any) => m.id));
      hasLoadedHistoryRef.current = true;
    }
  }, [messages]);

  // Listen for new gift messages to trigger overlay animation in chat
  useEffect(() => {
    if (!messages.length || !activeId) return;
    const lastMsg = messages[messages.length - 1];

    // Check if this message was received live (not loaded from initial history)
    if (hasLoadedHistoryRef.current && !initialMessageIdsRef.current.has(lastMsg.id)) {
      // Prevent duplicate triggers
      initialMessageIdsRef.current.add(lastMsg.id);

      if (lastMsg.id !== lastGiftMsgIdRef.current) {
        lastGiftMsgIdRef.current = lastMsg.id;

        if (isGiftMessage(lastMsg.content)) {
          const gift = giftPayload(lastMsg.content);
          const visual = giftVisuals[gift.label] || { emoji: gift.emoji || "🎁", bg: "from-pink-50 to-white", glow: "shadow-rose-200/80" };
          setActiveGiftAnim({
            emoji: gift.emoji,
            label: gift.label,
            imageSrc: visual.imageSrc,
            bg: visual.bg,
            glow: visual.glow,
            meaning: visual.meaning
          });
        }
      }
    }
  }, [messages, activeId]);

  // Clear active gift animation overlay after 3.5 seconds
  useEffect(() => {
    if (!activeGiftAnim) return;
    const timer = setTimeout(() => {
      setActiveGiftAnim(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [activeGiftAnim]);

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
         headers: {
           "Content-Type": "application/json",
           Authorization: "Bearer " + token,
         },
         body: JSON.stringify({ scope: "me" }),
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

 const displayMatches = useMemo(() => Array.from(new Map(activeMatches.map((m: any) => {
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
    }).filter((match: any) => {
      const deletedAt = deletedChats[match.id];
      if (!deletedAt) return true;
      return new Date(match.lastMessageTime).getTime() > deletedAt;
    }), [activeMatches, deletedChats, myId]);

 const sortedMatches = [...displayMatches]
   .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
   .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

 const active = displayMatches.find((m) => m.id === activeId);
 const activeUserId = active?.userId;
 const activePresenceText = isRecording
   ? "Recording Audio..."
   : isTyping
     ? "Typing..."
     : active?.online
       ? "Online now"
       : (active?.lastSeen ? `Last seen at ${new Date(active.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Offline");

 const parseUserIdList = (value?: string | null) => {
   if (!value) return [];
   try {
     const parsed = JSON.parse(value);
     return Array.isArray(parsed) ? parsed.map(String) : [];
   } catch {
     return [];
   }
 };

 const isMessagePinned = (message: any) => !!myId && parseUserIdList(message.pinnedByUserIds).includes(String(myId));
 const isMessageStarred = (message: any) => !!myId && parseUserIdList(message.starredByUserIds).includes(String(myId));

 const messageTextForActions = (message: any) => {
   if (message.deletedForEveryone) return "This message was deleted";
   return messagePreview(message.content);
 };

 const getReplyMessage = (message: any) => {
   if (!message.replyToMessageId) return null;
   return messages.find((candidate: any) => candidate.id === message.replyToMessageId) || null;
 };

 const copyMessage = async (message: any) => {
   try {
     await navigator.clipboard.writeText(messageTextForActions(message));
     toast.success("Message copied.");
   } catch {
     toast.error("Copy failed.");
   }
 };

 const openMessageInfo = (message: any) => {
   setMessageInfo(message);
 };

 const reportReceivedMessage = async (message: any) => {
   try {
     await reportMessage(API_URL, message.id, messageTextForActions(message));
     toast.success("Message report support team ko bhej di gayi.");
   } catch {
     toast.error("Message report nahi ho payi.");
   }
 };

 const addCustomReaction = (message: any) => {
   if (!active) return;
   document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
   setReactionEmojiCategory(FREE_EMOJI_CATEGORIES[0].id);
   window.setTimeout(() => setReactionPickerMessage(message), 0);
 };

 const selectCustomReaction = (emoji: string) => {
   if (!active || !reactionPickerMessage) return;
   toggleReaction(reactionPickerMessage.id, active.userId, emoji);
   setReactionPickerMessage(null);
 };

 const startReply = (message: any) => {
   if (message.deletedForEveryone) return;
   setReplyToMessage(message);
 };

 const startEdit = (message: any) => {
   if (message.deletedForEveryone) return;
   setEditingMessage(message);
   setDraft(message.content);
 };

 const toggleSelectMessage = (message: any) => {
   setSelectedMessageIds((current) => {
     const next = new Set(current);
     if (next.has(message.id)) next.delete(message.id);
     else next.add(message.id);
     return next;
   });
 };

 const confirmDeleteMessage = (scope: "me" | "everyone") => {
   if (!deleteDialogMessage || !active) return;
   deleteMessage(deleteDialogMessage.id, active.userId, scope);
   setDeleteDialogMessage(null);
 };

 useEffect(() => {
   if (!deleteDialogMessage) return;
   setDeleteDialogNow(Date.now());
   const timer = window.setInterval(() => setDeleteDialogNow(Date.now()), 1000);
   return () => window.clearInterval(timer);
 }, [deleteDialogMessage]);

 const deleteForEveryoneDeadline = deleteDialogMessage
   ? new Date(deleteDialogMessage.createdAt).getTime() + 10 * 60 * 1000
   : 0;
 const canDeleteForEveryone =
   !!deleteDialogMessage &&
   String(deleteDialogMessage.senderId) === String(myId) &&
   Number.isFinite(deleteForEveryoneDeadline) &&
   deleteDialogNow <= deleteForEveryoneDeadline;

 const deleteSelectedMessages = async () => {
   if (!activeId || !token || selectedMessageIds.size === 0) return;
   const count = selectedMessageIds.size;
   if (!confirm(`Delete ${count} selected message${count > 1 ? "s" : ""} for you?`)) return;
   const ids = Array.from(selectedMessageIds);
   try {
     const res = await fetch(`${API_URL}/messages/batch-delete`, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ messageIds: ids }),
     });
     if (!res.ok) throw new Error("Batch delete failed");
     queryClient.setQueryData(["messages", activeId], (old: any[] | undefined) => {
       if (!old) return old;
       const deletedIds = new Set(ids);
       return old.filter((message) => !deletedIds.has(message.id));
     });
     setSelectedMessageIds(new Set());
     queryClient.invalidateQueries({ queryKey: ["matches", "active"] });
     toast.success(`${count} message${count > 1 ? "s" : ""} deleted.`);
   } catch (error) {
     console.error("Failed to delete selected messages", error);
     toast.error("Selected messages delete nahi ho paye.");
   }
 };

 const clearSelectedMessages = () => {
   setSelectedMessageIds(new Set());
 };

 const selectedMessages = () => {
   const selectedIds = new Set(selectedMessageIds);
   return visibleMessages.filter((message: any) => selectedIds.has(message.id));
 };

 const copySelectedMessages = async () => {
   const text = selectedMessages().map((message: any) => messageTextForActions(message)).join("\n");
   if (!text) return;
   try {
     await navigator.clipboard.writeText(text);
     toast.success("Selected messages copied.");
   } catch {
     toast.error("Copy failed.");
   }
 };

 const starSelectedMessages = () => {
   if (!active) return;
   selectedMessages().forEach((message: any) => toggleStar(message.id, active.userId));
   toast.success("Selected messages starred.");
 };

 const clearChat = async () => {
   if (!activeId || !active || !token) return;
   if (!confirm(`Delete chat with ${active.name}? The messages will be removed only for you.`)) return;
   try {
     const res = await fetch(`${API_URL}/messages/conversation/${activeId}`, {
       method: "DELETE",
       headers: { Authorization: `Bearer ${token}` },
     });
     if (!res.ok) throw new Error("Clear chat failed");
     queryClient.setQueryData(["messages", activeId], []);
     setSelectedMessageIds(new Set());
     queryClient.invalidateQueries({ queryKey: ["matches", "active"] });
     toast.success("Chat deleted for you.");
   } catch (error) {
     console.error("Failed to clear chat", error);
     toast.error("Chat clear nahi ho payi.");
   }
 };

 const deleteChatFromList = async (conversationId: string, name: string) => {
   if (!token) return;
   if (!confirm(`Delete chat with ${name}? The messages will be removed only for you.`)) return;
   try {
     const res = await fetch(`${API_URL}/messages/conversation/${conversationId}`, {
       method: "DELETE",
       headers: { Authorization: `Bearer ${token}` },
     });
     if (!res.ok) throw new Error("Delete chat failed");

     const nextDeletedChats = { ...deletedChats, [conversationId]: Date.now() };
     setDeletedChats(nextDeletedChats);
     window.localStorage.setItem(DELETED_CHATS_STORAGE_KEY, JSON.stringify(nextDeletedChats));
     queryClient.setQueryData(["messages", conversationId], []);
     if (activeId === conversationId) setActiveId(null);
     toast.success("Chat deleted for you.");
   } catch {
     toast.error("Chat delete nahi ho payi.");
   }
 };

 const renderMessageMenuItems = (message: any, isMe: boolean) => {
   const reactionEmojis = MESSAGE_REACTIONS;
   const deleted = !!message.deletedForEveryone;
   const selected = selectedMessageIds.has(message.id);
   return (
     <>
       {false && !deleted && (
         <div className="flex items-center justify-around gap-1 border-b border-slate-100 p-1.5 bg-rose-50/20 rounded-t-lg">
           {reactionEmojis.map((emoji) => {
             let reactions: Record<string, string[]> = {};
             try { reactions = message.reactions ? JSON.parse(message.reactions) : {}; } catch(e) {}
             const userIds = reactions[emoji] || [];
             const hasReacted = myId ? userIds.includes(myId) : false;
             return (
               <button
                 key={emoji}
                 type="button"
                 onClick={() => active && toggleReaction(message.id, active.userId, emoji)}
                 className={cn(
                   "flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:scale-125 duration-150 active:scale-95",
                   hasReacted ? "bg-rose-100/80 scale-110" : "hover:bg-slate-100"
                 )}
               >
                 {emoji}
               </button>
             );
           })}
         </div>
       )}
       {isMe && (
         <ContextMenuItem className="cursor-pointer gap-2" onClick={() => openMessageInfo(message)}>
           <Info className="h-4 w-4" /> Message info
         </ContextMenuItem>
       )}
       {!deleted && (
         <ContextMenuItem className="cursor-pointer gap-2" onClick={() => startReply(message)}>
           <Reply className="h-4 w-4" /> Reply
         </ContextMenuItem>
       )}
       <ContextMenuItem className="cursor-pointer gap-2" onClick={() => copyMessage(message)}>
         <Copy className="h-4 w-4" /> Copy
       </ContextMenuItem>
       <ContextMenuItem className="cursor-pointer gap-2" onClick={() => active && togglePin(message.id, active.userId)}>
         <Pin className="h-4 w-4" /> {isMessagePinned(message) ? "Unpin" : "Pin"}
       </ContextMenuItem>
       <ContextMenuItem className="cursor-pointer gap-2" onClick={() => active && toggleStar(message.id, active.userId)}>
         <Star className="h-4 w-4" /> {isMessageStarred(message) ? "Unstar" : "Star"}
       </ContextMenuItem>
       {isMe && !deleted && (
         <ContextMenuItem className="cursor-pointer gap-2" onClick={() => startEdit(message)}>
           <Edit3 className="h-4 w-4" /> Edit
         </ContextMenuItem>
       )}
       <ContextMenuSeparator />
       <ContextMenuItem className="cursor-pointer gap-2" onClick={() => toggleSelectMessage(message)}>
         <CheckSquare className="h-4 w-4" /> {selected ? "Unselect" : "Select"}
       </ContextMenuItem>
       {!isMe && !deleted && (
         <ContextMenuItem className="cursor-pointer gap-2" onClick={() => reportReceivedMessage(message)}>
           <Flag className="h-4 w-4" /> Report
         </ContextMenuItem>
       )}
       <ContextMenuSeparator />
       <ContextMenuItem className="cursor-pointer gap-2 text-red-600 focus:text-red-600" onClick={() => setDeleteDialogMessage(message)}>
         <Trash2 className="h-4 w-4" /> Delete
       </ContextMenuItem>
     </>
   );
 };

 useEffect(() => {
   if (!activeUserId || isRecordingVoice) return;

   const hasDraft = draft.trim().length > 0;
   sendTypingStatus(activeUserId, hasDraft);

   if (!hasDraft) return;
   const timer = window.setTimeout(() => {
     sendTypingStatus(activeUserId, false);
   }, 1500);

   return () => {
     window.clearTimeout(timer);
     sendTypingStatus(activeUserId, false);
   };
 }, [activeUserId, draft, isRecordingVoice, sendTypingStatus]);

 useEffect(() => {
   if (!activeUserId) return;
   sendRecordingStatus(activeUserId, isRecordingVoice);
   return () => {
     sendRecordingStatus(activeUserId, false);
   };
 }, [activeUserId, isRecordingVoice, sendRecordingStatus]);

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

  useLayoutEffect(() => {
    const messagesList = messagesListRef.current;
    if (!messagesList) return;

    messagesList.scrollTop = messagesList.scrollHeight;
    const frame = window.requestAnimationFrame(() => {
      messagesList.scrollTop = messagesList.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId, visibleMessages.length, isTyping, isRecording]);

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
   if (editingMessage) {
     editMessage(editingMessage.id, active.userId, draft.trim());
     setEditingMessage(null);
     setDraft("");
     return;
   }
   sendMessage(active.userId, draft.trim(), replyToMessage?.id || null);
   setReplyToMessage(null);
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
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ scope: "me" }),
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

 const rechargeCoins = async () => {
   if (!token || coinActionPending) return;
   const input = prompt("How many coins do you want to recharge?", "100");
   if (input === null) return;
   const amount = Number(input);
   if (!Number.isInteger(amount) || amount < 1 || amount > 100000) {
     toast.error("Enter a valid coin amount between 1 and 100000.");
     return;
   }
   setCoinActionPending(true);
   try {
     const response = await fetch(`${API_URL}/users/me/coins/recharge`, {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
       body: JSON.stringify({ amount }),
     });
     const data = await response.json().catch(() => null);
     if (!response.ok) throw new Error(data?.message || "Recharge failed.");
     setCoinBalance(Number(data.coinBalance) || 0);
     toast.success(`${amount} coins added.`);
   } catch (error) {
     toast.error(error instanceof Error ? error.message : "Recharge failed.");
   } finally {
     setCoinActionPending(false);
   }
 };

 const sendGiftWithCoins = async (gift: { emoji: string; label: string; price: number }) => {
   if (!active || !token || coinActionPending) return;
   if (coinBalance < gift.price) {
     toast.error(`You need ${gift.price - coinBalance} more coins. Please recharge.`);
     return;
   }
   if (!confirm(`Send ${gift.label} for ${gift.price} coins?`)) return;
   setCoinActionPending(true);
   try {
     const response = await fetch(`${API_URL}/users/me/coins/spend`, {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
       body: JSON.stringify({ amount: gift.price }),
     });
     const data = await response.json().catch(() => null);
     if (!response.ok) throw new Error(data?.message || "Not enough coins.");
     setCoinBalance(Number(data.coinBalance) || 0);
     sendMessage(active.userId, `${GIFT_MESSAGE_PREFIX}${gift.emoji}|${gift.label}|${gift.price}`);
     setShowEmojiPicker(false);
   } catch (error) {
     toast.error(error instanceof Error ? error.message : "Gift could not be sent.");
   } finally {
     setCoinActionPending(false);
   }
 };

 const toggleMuteActiveChat = () => {
   if (!activeId) return;
   const next = new Set(mutedChatIds);
   const willMute = !next.has(activeId);
   if (willMute) next.add(activeId);
   else next.delete(activeId);
   setMutedChatIds(next);
   window.localStorage.setItem(MUTED_CHATS_STORAGE_KEY, JSON.stringify([...next]));
   toast.success(willMute ? "Notifications muted." : "Notifications unmuted.");
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
 className={cn("chat-theme-surface grid h-full min-h-0 gap-4 rounded-2xl p-0 lg:grid-cols-[320px_1fr]", selectedTheme.is3d && "chat-theme-3d")}
 style={chatThemeStyle}
 >
 <aside className={cn("flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[var(--chat-panel)] shadow-sm backdrop-blur", active && "hidden lg:flex")}>
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
 <ContextMenu>
 <ContextMenuTrigger openOnClick={false}>
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
 <div className="ml-2 flex shrink-0 items-center gap-1.5">
   {mutedChatIds.has(m.id) && <BellOff className="h-3.5 w-3.5 text-[var(--chat-text-muted)]" aria-label="Muted" />}
   {m.unread > 0 && activeId !== m.id && (
     <span className="grid h-[20px] min-w-[20px] place-items-center rounded-full bg-[var(--chat-accent)] px-1.5 text-[10px] font-semibold text-white">
       {m.unread}
     </span>
   )}
 </div>
 </div>
 <p className="truncate text-xs text-[var(--chat-text-muted)]">
 {messagePreview(m.lastMessage)}
 </p>
 </div>
 </button>
 </ContextMenuTrigger>
 <ContextMenuContent className="min-w-[170px]">
   <ContextMenuItem className="text-red-600 hover:bg-red-50" onClick={() => deleteChatFromList(m.id, m.name)}>
     <Trash2 className="h-4 w-4" />
     <span>Delete chat</span>
   </ContextMenuItem>
 </ContextMenuContent>
 </ContextMenu>
 </li>
 );
 })}
 </ul>
 </aside>

 {active ? (
  <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[var(--chat-panel)] shadow-sm backdrop-blur">
    {selectedTheme.is3d && (
      <ChatThemeParticles themeId={selectedTheme.id} />
    )}
    <GiftAnimationOverlay gift={activeGiftAnim} />
   <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
 <div className="flex items-center gap-3">
 <Button variant="ghost" size="icon" onClick={() => setActiveId(null)} className="lg:hidden" aria-label="Back to conversations"><ArrowLeft className="h-5 w-5" /></Button>
 <Avatar className="h-[40px] w-[40px]">
 <AvatarImage src={active.photo} />
 <AvatarFallback>{active.name[0]}</AvatarFallback>
 </Avatar>
 <div>
 <p className="text-sm font-semibold text-[var(--chat-text)]">{active.name}, {active.age}</p>
 <p className={cn("text-xs", (isTyping || isRecording) ? "font-semibold text-rose-500" : "text-[var(--chat-text-muted)]")}>{activePresenceText}</p>
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
 <DropdownMenuItem onClick={toggleMuteActiveChat}>
   <BellOff className="mr-2 h-4 w-4" />
   {activeId && mutedChatIds.has(activeId) ? "Unmute Notifications" : "Mute Notifications"}
 </DropdownMenuItem>
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
 <DropdownMenuItem className="text-red-500" onClick={clearChat}>
 <Trash2 className="mr-2 h-4 w-4" />
 Clear Chat
 </DropdownMenuItem>
 <DropdownMenuItem className="text-red-500" onClick={handleBlockUser}>Block User</DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </header>

 <div ref={messagesListRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-6">
{hiddenOlderMessageCount > 0 && !showFullHistory && (
  <div className="flex justify-center">
    <button
      type="button"
      onClick={() => setShowFullHistory(true)}
      className="rounded-full border border-rose-100 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-rose-50"
    >
      Load {hiddenOlderMessageCount} older messages
    </button>
  </div>
)}
{renderedMessages.map((m: any) => {
  const isMe = String(m.senderId) === String(myId);
  const isGift = isGiftMessage(m.content);
  const isGif = isGifMessage(m.content);
  const replyMessage = getReplyMessage(m);
  const isDeleted = !!m.deletedForEveryone;
  const isSingleEmoji = !replyMessage && !isDeleted && isSingleEmojiMessage(m.content);
  const isSelected = selectedMessageIds.has(m.id);

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
  isMe ? (
 <div key={m.id} className={cn("relative flex w-full my-2 items-center justify-end gap-2 rounded-lg px-1 py-1", isSelected && "bg-emerald-100/35")}>
   {selectedMessageIds.size > 0 && (
     <button
       type="button"
       onClick={() => toggleSelectMessage(m)}
       className={cn(
         "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
         isSelected ? "border-[var(--chat-accent)] bg-[var(--chat-accent)] text-white" : "border-slate-300 bg-white/80 text-transparent"
       )}
       aria-label={isSelected ? "Unselect message" : "Select message"}
     >
       <Check className="h-4 w-4" />
     </button>
   )}
   <ContextMenu>
   <ContextMenuTrigger asChild openOnClick={selectedMessageIds.size === 0}>
   <div className={cn(
   "max-w-[70%] rounded-2xl text-sm relative cursor-context-menu select-none",
   (isGift || isGif || isSingleEmoji) ? "bg-transparent px-1 py-1 text-white" : "[background:var(--chat-outgoing)] px-4 py-2 text-white rounded-br-sm shadow-sm",
   isSelected && "ring-2 ring-rose-300"
   )}
   onClick={() => {
     if (selectedMessageIds.size > 0) toggleSelectMessage(m);
   }}
   >
   {replyMessage && !isDeleted && (
     <div className="mb-1 rounded-lg border-l-2 border-white/80 bg-white/20 px-2 py-1 text-[11px] leading-tight text-white/90">
       <span className="block font-bold">{String(replyMessage.senderId) === String(myId) ? "You" : active.name}</span>
       <span className="line-clamp-1 opacity-90">{messageTextForActions(replyMessage)}</span>
     </div>
   )}
   {isDeleted ? <p className="italic opacity-80">This message was deleted</p> : <MessageContent content={m.content} isMe={isMe} onOpenPhoto={setPhotoViewerSrc} />}
   <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", (isGift || isGif || isSingleEmoji) ? "text-[var(--chat-text-muted)] font-semibold" : "text-white opacity-90")}>
   {isMessagePinned(m) && <Pin className="h-[12px] w-[12px]" />}
   {isMessageStarred(m) && <Star className="h-[12px] w-[12px] fill-current" />}
   {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
   {m.editedAt && !isDeleted && <span>edited</span>}
   {!isDeleted && (() => {
     const status = m.deliveryStatus === "failed"
       ? "failed"
       : m.deliveryStatus === "sending"
         ? "sending"
         : m.isRead || m.deliveryStatus === "seen"
           ? "seen"
           : m.deliveryStatus === "delivered"
             ? "delivered"
             : "sent";
     const label = status === "failed"
       ? "Failed to Send"
       : status === "sending"
         ? "Sending..."
         : status === "seen"
           ? "Seen"
           : status === "delivered"
             ? "Delivered"
             : "Sent";
     const statusColor = status === "failed" ? "text-red-200" : (status === "seen" || status === "delivered") ? "text-emerald-300" : (isGift ? "text-[var(--chat-text-muted)]" : "text-white/85");

     return (
       <span className={cn("inline-flex items-center gap-0.5 font-semibold", statusColor)}>
         {label}
         {status === "failed" ? (
           <X className="h-[13px] w-[13px]" />
         ) : status === "seen" || status === "delivered" ? (
           <CheckCheck className="h-[16px] w-[16px]" />
         ) : (
           <Check className="h-[16px] w-[16px]" />
         )}
       </span>
     );
   })()}
   </div>

   {/* Reactions badges */}
   {(() => {
     if (!m.reactions) return null;
     try {
       const reactions = JSON.parse(m.reactions);
       const entries = Object.entries(reactions);
       if (entries.length === 0) return null;
       return (
         <div className="absolute -bottom-2.5 right-3 z-10 flex items-center gap-1 rounded-full border border-slate-100 bg-white px-2 py-0.5 shadow-sm text-[10px] font-bold select-none text-slate-800">
           {entries.map(([emoji, userIds]: [string, any]) => {
             const hasReacted = myId ? userIds.includes(myId) : false;
             return (
               <button
                 key={emoji}
                 type="button"
                 onClick={() => toggleReaction(m.id, active.userId, emoji)}
                 className={cn(
                   "flex items-center gap-0.5 transition duration-200 active:scale-95 hover:scale-115",
                   hasReacted ? "text-rose-600 font-extrabold" : "text-slate-500"
                 )}
               >
                 <span>{emoji}</span>
                 {userIds.length > 1 && <span>{userIds.length}</span>}
               </button>
             );
           })}
         </div>
       );
     } catch (e) {
       return null;
     }
   })()}
   </div>
   </ContextMenuTrigger>
   <ContextMenuContent className="p-1 min-w-[220px] rounded-xl">
     {/* Reactions row inside ContextMenu */}
     <div className="flex items-center justify-around gap-1 border-b border-slate-100 p-1.5 bg-rose-50/20 rounded-t-lg">
       {MESSAGE_REACTIONS.map((emoji) => {
         let reactions: Record<string, string[]> = {};
         try { reactions = m.reactions ? JSON.parse(m.reactions) : {}; } catch(e) {}
         const userIds = reactions[emoji] || [];
         const hasReacted = myId ? userIds.includes(myId) : false;
         return (
           <button
             key={emoji}
             type="button"
             onClick={() => toggleReaction(m.id, active.userId, emoji)}
             className={cn(
               "flex h-7 w-7 items-center justify-center rounded-full text-base transition hover:scale-125 duration-150 active:scale-95",
               hasReacted ? "bg-rose-100/80 scale-110" : "hover:bg-slate-100"
             )}
           >
             {emoji}
           </button>
         );
       })}
       <button
         type="button"
         onClick={() => addCustomReaction(m)}
         className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:scale-125 hover:bg-slate-100"
         aria-label="Add another reaction"
       >
         <Plus className="h-4 w-4" />
       </button>
     </div>
     {renderMessageMenuItems(m, isMe)}
   </ContextMenuContent>
   </ContextMenu>
 </div>
 ) : (
 <div key={m.id} className={cn("relative flex w-full my-2 items-center justify-start gap-2 rounded-lg px-1 py-1", isSelected && "bg-emerald-100/35")}>
   {selectedMessageIds.size > 0 && (
     <button
       type="button"
       onClick={() => toggleSelectMessage(m)}
       className={cn(
         "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition",
         isSelected ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white/80 text-transparent"
       )}
       aria-label={isSelected ? "Unselect message" : "Select message"}
     >
       <Check className="h-4 w-4" />
     </button>
   )}
   <ContextMenu>
   <ContextMenuTrigger asChild openOnClick={selectedMessageIds.size === 0}>
   <div className={cn(
   "max-w-[70%] rounded-2xl text-sm relative cursor-context-menu select-none",
    (isGift || isGif || isSingleEmoji) ? "bg-transparent px-1 py-1 text-foreground" : "bg-[var(--chat-incoming)] px-4 py-2 text-foreground rounded-bl-sm shadow-sm",
    isSelected && "ring-2 ring-rose-300"
   )}
   onClick={() => {
     if (selectedMessageIds.size > 0) toggleSelectMessage(m);
   }}
   >
   {replyMessage && !isDeleted && (
     <div className="mb-1 rounded-lg border-l-2 border-rose-400 bg-white/45 px-2 py-1 text-[11px] leading-tight text-foreground">
       <span className="block font-bold">{String(replyMessage.senderId) === String(myId) ? "You" : active.name}</span>
       <span className="line-clamp-1 opacity-80">{messageTextForActions(replyMessage)}</span>
     </div>
   )}
   {isDeleted ? <p className="italic opacity-70">This message was deleted</p> : <MessageContent content={m.content} isMe={isMe} onOpenPhoto={setPhotoViewerSrc} />}
    <div className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", (isGift || isGif || isSingleEmoji) ? "text-muted-foreground" : "opacity-70")}>
   {isMessagePinned(m) && <Pin className="h-[12px] w-[12px]" />}
   {isMessageStarred(m) && <Star className="h-[12px] w-[12px] fill-current" />}
   {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
   {m.editedAt && !isDeleted && <span>edited</span>}
   </div>

   {/* Reactions badges */}
   {!isDeleted && (() => {
     if (!m.reactions) return null;
     try {
       const reactions = JSON.parse(m.reactions);
       const entries = Object.entries(reactions);
       if (entries.length === 0) return null;
       return (
         <div className="absolute -bottom-2.5 left-3 z-10 flex items-center gap-1 rounded-full border border-slate-100 bg-white px-2 py-0.5 shadow-sm text-[10px] font-bold select-none text-slate-800">
           {entries.map(([emoji, userIds]: [string, any]) => {
             const hasReacted = myId ? userIds.includes(myId) : false;
             return (
               <button
                 key={emoji}
                 type="button"
                 onClick={() => toggleReaction(m.id, active.userId, emoji)}
                 className={cn(
                   "flex items-center gap-0.5 transition duration-200 active:scale-95 hover:scale-115",
                   hasReacted ? "text-rose-600 font-extrabold" : "text-slate-500"
                 )}
               >
                 <span>{emoji}</span>
                 {userIds.length > 1 && <span>{userIds.length}</span>}
               </button>
             );
           })}
         </div>
       );
     } catch (e) {
       return null;
     }
   })()}
   </div>
   </ContextMenuTrigger>
   <ContextMenuContent className="p-1 min-w-[220px] rounded-xl">
     {/* Reactions row inside ContextMenu */}
     <div className="flex items-center justify-around gap-1 border-b border-slate-100 p-1.5 bg-rose-50/20 rounded-t-lg">
       {MESSAGE_REACTIONS.map((emoji) => {
         let reactions: Record<string, string[]> = {};
         try { reactions = m.reactions ? JSON.parse(m.reactions) : {}; } catch(e) {}
         const userIds = reactions[emoji] || [];
         const hasReacted = myId ? userIds.includes(myId) : false;
         return (
           <button
             key={emoji}
             type="button"
             onClick={() => toggleReaction(m.id, active.userId, emoji)}
             className={cn(
               "flex h-7 w-7 items-center justify-center rounded-full text-base transition hover:scale-125 duration-150 active:scale-95",
               hasReacted ? "bg-rose-100/80 scale-110" : "hover:bg-slate-100"
             )}
           >
             {emoji}
           </button>
         );
       })}
       <button
         type="button"
         onClick={() => addCustomReaction(m)}
         className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition hover:scale-125 hover:bg-slate-100"
         aria-label="Add another reaction"
       >
         <Plus className="h-4 w-4" />
       </button>
     </div>
     {renderMessageMenuItems(m, isMe)}
   </ContextMenuContent>
   </ContextMenu>
 </div>
 )
  );
})}
 {(isTyping || isRecording) && (
   <div className="relative z-10 flex w-full justify-start">
     <div className="rounded-2xl rounded-bl-sm bg-[var(--chat-incoming)] px-4 py-2 text-xs font-semibold text-[var(--chat-text-muted)] shadow-sm">
       {isRecording ? "Recording Audio..." : "Typing..."}
     </div>
   </div>
 )}
 <div ref={bottomRef} />
 </div>

 {selectedMessageIds.size > 0 ? (
 <div className="flex h-16 items-center justify-between border-t border-border bg-white px-4 text-slate-950 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
 <div className="flex min-w-0 items-center gap-4">
 <button type="button" onClick={clearSelectedMessages} className="grid h-10 w-10 place-items-center rounded-full text-slate-900 hover:bg-slate-100" aria-label="Cancel selection">
 <X className="h-6 w-6" />
 </button>
 <span className="truncate text-sm font-semibold">{selectedMessageIds.size} selected</span>
 </div>
 <div className="flex items-center gap-2 sm:gap-4">
 <button type="button" onClick={copySelectedMessages} className="grid h-10 w-10 place-items-center rounded-full text-slate-900 hover:bg-slate-100" title="Copy">
 <Copy className="h-5 w-5" />
 </button>
 <button type="button" onClick={starSelectedMessages} className="grid h-10 w-10 place-items-center rounded-full text-slate-900 hover:bg-slate-100" title="Star">
 <Star className="h-5 w-5" />
 </button>
 <button type="button" onClick={deleteSelectedMessages} className="grid h-10 w-10 place-items-center rounded-full text-slate-900 hover:bg-red-50 hover:text-red-600" title="Delete">
 <Trash2 className="h-5 w-5" />
 </button>
 </div>
 </div>
 ) : (
 <form onSubmit={handleSend} className="shrink-0 border-t border-border p-3">
 {replyToMessage && !editingMessage && (
 <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-xs text-slate-700">
 <Reply className="h-4 w-4 text-rose-500" />
 <div className="min-w-0 flex-1">
 <p className="font-bold text-slate-900">Replying to {String(replyToMessage.senderId) === String(myId) ? "yourself" : active.name}</p>
 <p className="truncate">{messageTextForActions(replyToMessage)}</p>
 </div>
 <button type="button" onClick={() => setReplyToMessage(null)} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white">
 <X className="h-4 w-4" />
 </button>
 </div>
 )}
 {editingMessage && (
 <div className="mb-2 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/90 px-3 py-2 text-xs text-slate-700">
 <Edit3 className="h-4 w-4 text-amber-600" />
 <div className="min-w-0 flex-1">
 <p className="font-bold text-slate-900">Editing message</p>
 <p className="truncate">{messageTextForActions(editingMessage)}</p>
 </div>
 <button type="button" onClick={() => { setEditingMessage(null); setDraft(""); }} className="grid h-7 w-7 place-items-center rounded-full hover:bg-white">
 <X className="h-4 w-4" />
 </button>
 </div>
 )}
 {selectedMedia && (
 <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-2">
 <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900">
 {selectedMedia.type === "photo" ? (
 <img src={selectedMedia.url} alt="Selected media preview" loading="lazy" decoding="async" className="h-full w-full object-cover" />
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
 ref={emojiPickerTriggerRef}
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
    <div ref={emojiPickerRef} className="absolute bottom-14 left-0 z-30 flex h-[430px] w-80 flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl transition-all duration-300">
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
      {activePickerTab !== "gift" ? (
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
 <HdEmoji emoji={category.icon} className="h-6 w-6" />
 </button>
 ))}
 </div>
 </div>
 <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
 <div className="mb-2 px-1 text-xs font-semibold text-slate-500">
   {FREE_EMOJI_CATEGORIES.find((category) => category.id === activeEmojiCategory)?.label}
 </div>
 <div className="grid grid-cols-7 gap-x-1 gap-y-2">
 {(FREE_EMOJI_CATEGORIES.find((category) => category.id === activeEmojiCategory)?.emojis ?? FREE_EMOJI_CATEGORIES[0].emojis).map((emoji) => (
 <button
 key={emoji}
 type="button"
 onClick={() => addEmojiToDraft(emoji)}
 className="chat-picker-emoji grid h-10 w-10 place-items-center rounded-lg bg-transparent text-[28px] leading-none transition hover:scale-125 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
 >
 <HdEmoji emoji={emoji} className="h-8 w-8" />
 </button>
 ))}
 </div>
 </div>
 </>
      ) : activePickerTab === "gift" ? (
        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-rose-50/20 to-white/40 p-3">
          <div className="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
              <Coins className="h-5 w-5 text-amber-500" />
              <span>{coinBalance.toLocaleString()} coins</span>
            </div>
            <Button type="button" size="sm" onClick={rechargeCoins} disabled={coinActionPending} className="h-8 rounded-full bg-amber-500 px-3 text-xs font-bold text-white hover:bg-amber-600">
              {coinActionPending ? "Please wait..." : "Recharge"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {PREMIUM_GIFTS.map((gift) => {
              const visual = giftVisuals[gift.label] || { emoji: "🌹", bg: "from-pink-50 to-white" };
              return (
                <button
                  key={gift.label}
                  type="button"
                  onClick={() => sendGiftWithCoins(gift)}
                  className="group relative flex flex-col justify-between items-center rounded-2xl border border-rose-100 bg-white/80 p-2.5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-md hover:shadow-rose-100/40"
                >
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
                        <Coins className="h-3 w-3" /> {gift.price}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-rose-50/10 to-white/30">
          <div className="flex border-b border-rose-100 bg-rose-50/20 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveGifSubTab("library")}
              className={cn(
                "flex-1 h-8 rounded-lg text-xs font-bold transition",
                activeGifSubTab === "library" ? "bg-white text-rose-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              GIF Library
            </button>
            <button
              type="button"
              onClick={() => setActiveGifSubTab("text-to-gif")}
              className={cn(
                "flex-1 h-8 rounded-lg text-xs font-bold transition",
                activeGifSubTab === "text-to-gif" ? "bg-white text-rose-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Text to GIF
            </button>
          </div>

          {activeGifSubTab === "library" ? (
            <>
              <div className="flex gap-1.5 overflow-x-auto p-2 border-b border-border bg-slate-50/50 dark:bg-zinc-900/50 shrink-0 scrollbar-none">
                {[
                  { id: "funny", label: "😂 Funny" },
                  { id: "love", label: "💖 Love" },
                  { id: "cute", label: "🐱 Cute" },
                  { id: "live", label: "✨ Live" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveGifCategory(cat.id);
                      setGifSearchQuery("");
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-300 flex items-center gap-1 shrink-0 select-none",
                      activeGifCategory === cat.id 
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-[1.03]" 
                        : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-zinc-800/80 hover:bg-rose-50 dark:hover:bg-zinc-800 hover:text-rose-500 hover:scale-[1.01]"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="px-3 py-2 border-b border-border bg-white dark:bg-zinc-900 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-[14px] w-[14px] text-slate-400" />
                  <Input
                    placeholder={`Search ${activeGifCategory} GIFs...`}
                    className="pl-8 h-8 text-xs bg-slate-50 dark:bg-zinc-800/80 border-none rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    value={gifSearchQuery}
                    onChange={(e) => setGifSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-zinc-800">
                <div className="grid grid-cols-2 gap-3">
                  {CURATED_GIFS
                    .filter((g) => g.category === activeGifCategory && g.label.toLowerCase().includes(gifSearchQuery.toLowerCase()))
                    .map((gif) => (
                      <div
                        key={gif.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800 bg-gradient-to-tr from-slate-50 to-rose-50/20 dark:from-zinc-900 dark:to-zinc-800/20 aspect-video flex items-center justify-center transition-all duration-300 hover:scale-[1.04] hover:rotate-1 hover:shadow-lg hover:border-rose-300 dark:hover:border-rose-500/30"
                      >
                        <img 
                          src={gif.url} 
                          alt={gif.label} 
                          loading="lazy"
                          decoding="async"
                          width={160}
                          height={90}
                          referrerPolicy="no-referrer" 
                          className="h-full w-full object-contain p-1 select-none pointer-events-none transition-transform duration-500 group-hover:scale-105" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (active) {
                              sendMessage(active.userId, `${GIF_MESSAGE_PREFIX}${gif.url}`);
                              setShowEmojiPicker(false);
                            }
                          }}
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/25 flex items-center justify-center transition-all duration-300"
                        >
                          <span className="scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 bg-white/95 dark:bg-zinc-900/95 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-1.5 select-none">
                            ⚡ Send Emoji
                          </span>
                        </button>
                        <span className="absolute bottom-2 left-2 right-2 truncate rounded-lg bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[9px] text-white text-center font-bold pointer-events-none opacity-90 group-hover:opacity-0 transition-opacity duration-200">
                          {gif.label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-border bg-white shrink-0 flex flex-col gap-1.5">
                <Input
                  placeholder="Type to create live sticker..."
                  maxLength={25}
                  className="h-8 text-xs bg-muted/40 border-rose-100 focus-visible:ring-rose-200 text-slate-800"
                  value={textToGifVal}
                  onChange={(e) => setTextToGifVal(e.target.value)}
                />
                <p className="text-[9px] text-muted-foreground leading-tight">
                  Type custom words (up to 25 chars) to see animated text presets!
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {textToGifVal.trim() ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'neon', label: 'Neon Glow', desc: 'Glowing colors' },
                      { id: 'love', label: 'Heart Beat', desc: 'Floating hearts' },
                      { id: 'glitch', label: 'Retro Glitch', desc: 'Shifting cyberpunk' },
                      { id: 'rainbow', label: 'Rainbow Wave', desc: 'Smooth gradient' },
                      { id: 'fire', label: 'Fire Flame', desc: 'Fiery shake' },
                      { id: 'gold', label: 'Gold Sparkle', desc: 'Glittering stars' }
                    ].map((style) => {
                      const svgData = generateTextSvgBase64(textToGifVal, style.id);
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => {
                            if (active) {
                              sendMessage(active.userId, `${GIF_MESSAGE_PREFIX}${svgData}`);
                              setShowEmojiPicker(false);
                              setTextToGifVal("");
                            }
                          }}
                          className="group relative overflow-hidden rounded-xl border border-rose-100/50 bg-slate-950 p-1 flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] hover:shadow-lg"
                        >
                          <img src={svgData} alt={style.label} loading="lazy" decoding="async" width={160} height={80} className="w-full aspect-[2/1] object-contain rounded-lg shadow-inner pointer-events-none" />
                          <div className="mt-1 text-center">
                            <span className="block text-[10px] font-black text-rose-500 group-hover:text-rose-400 transition-colors uppercase tracking-wider">{style.label}</span>
                            <span className="block text-[8px] text-slate-400 leading-none">{style.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                    <span className="text-3xl mb-1">✨</span>
                    <p className="text-xs font-semibold">Live Text-to-GIF Converter</p>
                    <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
                      Type some text in the box above to generate unique live anim GIFs!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
 </div>
 )}
 <Input
 value={draft}
 onChange={(e) => setDraft(e.target.value)}
 placeholder={isRecordingVoice ? `Recording voice ${formatRecordingTime(recordingSeconds)}` : editingMessage ? "Edit message..." : replyToMessage ? "Type a reply..." : "Type a message..."}
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
 )}
 </section>
 ) : (
 <section className="flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-2xl bg-[var(--chat-panel)] p-8 text-center text-muted-foreground shadow-sm backdrop-blur">
 <div className="h-[80px] w-[80px] rounded-full bg-muted flex items-center justify-center mb-4">
 <Search className="h-[32px] w-[32px] text-muted-foreground/50" />
 </div>
 <h3 className="text-xl font-semibold text-foreground mb-2">Your Messages</h3>
 <p>Select a conversation from the sidebar to start chatting.</p>
 </section>
 )}
 </div>
 {deleteDialogMessage && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
 <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
 <h3 className="text-lg font-semibold text-slate-950">Delete message?</h3>
 <div className="mt-12 flex flex-col items-end gap-3">
 {canDeleteForEveryone && (
 <Button type="button" variant="outline" className="rounded-full px-6 text-emerald-700" onClick={() => confirmDeleteMessage("everyone")}>
 Delete for everyone
 </Button>
 )}
 <Button type="button" variant="outline" className="rounded-full px-6 text-emerald-700" onClick={() => confirmDeleteMessage("me")}>
 Delete for me
 </Button>
 <Button type="button" variant="outline" className="rounded-full px-6 text-emerald-700" onClick={() => setDeleteDialogMessage(null)}>
 Cancel
 </Button>
 </div>
 </div>
 </div>
 )}
 {messageInfo && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
 <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl">
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-bold text-foreground">Message info</h3>
 <Button type="button" variant="ghost" size="icon" onClick={() => setMessageInfo(null)} className="rounded-full">
 <X className="h-4 w-4" />
 </Button>
 </div>
 <div className="mt-4 rounded-xl bg-muted/40 p-3 text-sm text-foreground">
 {messageTextForActions(messageInfo)}
 </div>
 <div className="mt-4 space-y-2 text-sm text-muted-foreground">
 <p>Sent: {new Date(messageInfo.createdAt).toLocaleString()}</p>
 {messageInfo.editedAt && <p>Edited: {new Date(messageInfo.editedAt).toLocaleString()}</p>}
 <p>Status: {messageInfo.deletedForEveryone ? "Deleted for everyone" : messageInfo.isRead ? "Seen" : "Sent"}</p>
 {isMessagePinned(messageInfo) && <p>Pinned in your chat</p>}
 {isMessageStarred(messageInfo) && <p>Starred by you</p>}
 </div>
 </div>
 </div>
 )}
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
 <img key={`${photo}-${index}`} src={photo} alt={`${profileModal.name || "Profile"} photo ${index + 1}`} loading="lazy" decoding="async" className="aspect-[3/4] w-full rounded-xl object-cover" />
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
 {reactionPickerMessage && (
 <div
 className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[1px]"
 onClick={() => setReactionPickerMessage(null)}
 >
 <div
 role="dialog"
 aria-modal="true"
 aria-label="Choose a message reaction"
 onClick={(event) => event.stopPropagation()}
 className="flex max-h-[min(520px,85vh)] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl"
 >
 <div className="flex items-center justify-between border-b border-rose-100 px-4 py-3">
 <div>
 <h3 className="font-bold text-slate-900">Choose reaction</h3>
 <p className="text-xs text-slate-500">All these emoji reactions are free.</p>
 </div>
 <button type="button" onClick={() => setReactionPickerMessage(null)} className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-rose-50" aria-label="Close reaction picker">
 <X className="h-4 w-4" />
 </button>
 </div>
 <div className="flex gap-1 overflow-x-auto border-b border-rose-100 bg-rose-50/50 p-2">
 {FREE_EMOJI_CATEGORIES.map((category) => (
 <button
 key={category.id}
 type="button"
 onClick={() => setReactionEmojiCategory(category.id)}
 title={category.label}
 className={cn(
 "grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg transition",
 reactionEmojiCategory === category.id ? "bg-white shadow ring-1 ring-rose-300" : "hover:bg-white/80"
 )}
 >
 <HdEmoji emoji={category.icon} className="h-6 w-6" />
 </button>
 ))}
 </div>
 <div className="grid grid-cols-7 gap-2 overflow-y-auto p-4 sm:grid-cols-8">
 {(FREE_EMOJI_CATEGORIES.find((category) => category.id === reactionEmojiCategory)?.emojis ?? FREE_EMOJI_CATEGORIES[0].emojis).map((emoji) => (
 <button
 key={emoji}
 type="button"
 onClick={() => selectCustomReaction(emoji)}
 className="grid aspect-square min-h-10 place-items-center rounded-full bg-rose-50 text-xl transition hover:scale-110 hover:bg-rose-100 active:scale-95"
 aria-label={`React with ${emoji}`}
 >
 <HdEmoji emoji={emoji} className="h-8 w-8" />
 </button>
 ))}
 </div>
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
 loading="lazy"
 decoding="async"
 onClick={(event) => event.stopPropagation()}
 className="max-h-[92vh] max-w-[96vw] rounded-2xl object-contain shadow-2xl"
 />
 </div>
 )}
 </>
 );
}
