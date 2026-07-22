"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, Heart, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { API_ORIGIN } from "@/config/runtime";

type Language = "en" | "hi";
type ChatMessage = { id: number; sender: "bot" | "user"; text: string };

const copy = {
  en: {
    title: "ConnectLove Assistant",
    online: "Online · Here to help",
    welcome: "Hi! I can help with matches, messages, profile safety, and Gold or Diamond plans.",
    placeholder: "Ask me anything...",
    error: "Sorry, I could not respond. Please try again.",
    suggestions: ["How do matches work?", "Tell me about Diamond", "How do I stay safe?"],
  },
  hi: {
    title: "ConnectLove सहायक",
    online: "ऑनलाइन · आपकी मदद के लिए",
    welcome: "नमस्ते! मैं matches, messages, profile safety और Gold या Diamond plans में आपकी मदद कर सकता हूँ।",
    placeholder: "अपना सवाल लिखें...",
    error: "माफ़ कीजिए, जवाब नहीं मिल पाया। कृपया दोबारा कोशिश करें।",
    suggestions: ["मैच कैसे बनता है?", "Diamond प्लान बताएं", "सुरक्षित कैसे रहें?"],
  },
} as const;

export function ConnectLoveChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: "bot", text: copy.en.welcome },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const visible = pathname === "/user" || pathname.startsWith("/user/");
  const text = copy[language];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    setMessages([{ id: Date.now(), sender: "bot", text: copy[next].welcome }]);
  };

  const sendMessage = async (messageInput: string) => {
    const message = messageInput.trim();
    if (!message || sending) return;

    setMessages((current) => [...current, { id: Date.now(), sender: "user", text: message }]);
    setInput("");
    setSending(true);
    try {
      const response = await fetch(`${API_ORIGIN}/chatbot/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, language }),
      });
      if (!response.ok) throw new Error("Chatbot request failed");
      const body = await response.json();
      setMessages((current) => [...current, { id: Date.now() + 1, sender: "bot", text: body.reply }]);
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, sender: "bot", text: text.error }]);
    } finally {
      setSending(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:bottom-7 sm:right-7">
      {open && (
        <section className="mb-3 flex h-[min(500px,calc(100vh-125px))] w-[calc(100vw-38px)] max-w-[340px] flex-col overflow-hidden rounded-[24px] border border-rose-200 bg-white shadow-[0_20px_55px_rgba(244,63,94,0.22)]">
          <header className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 px-4 pb-3 pt-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/95 text-rose-500 shadow-lg">
                  <Heart className="h-4 w-4 fill-current" />
                  <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-yellow-300" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black">{text.title}</h2>
                  <p className="text-[11px] font-medium text-rose-50">{text.online}</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chatbot" className="rounded-full p-2 transition hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 rounded-lg bg-white/15 p-1 text-[11px] font-bold backdrop-blur-sm">
              <button type="button" onClick={() => changeLanguage("en")} className={`rounded-md py-1.5 transition ${language === "en" ? "bg-white text-rose-600 shadow" : "text-white"}`}>English</button>
              <button type="button" onClick={() => changeLanguage("hi")} className={`rounded-md py-1.5 transition ${language === "hi" ? "bg-white text-rose-600 shadow" : "text-white"}`}>हिन्दी</button>
            </div>
          </header>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-gradient-to-b from-rose-50/70 to-white p-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "bot" && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500"><Bot className="h-4 w-4" /></span>}
                <p className={`max-w-[84%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed shadow-sm ${message.sender === "user" ? "rounded-br-md bg-gradient-to-r from-rose-500 to-pink-500 text-white" : "rounded-bl-md border border-rose-100 bg-white text-slate-700"}`}>{message.text}</p>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pl-9">
                {text.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="rounded-full border border-rose-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50">{suggestion}</button>)}
              </div>
            )}
            {sending && <div className="flex items-center gap-2 pl-9 text-xs font-semibold text-rose-500"><Loader2 className="h-4 w-4 animate-spin" /> Typing...</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-rose-100 bg-white p-2.5">
            <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder={text.placeholder} className="h-10 min-w-0 flex-1 rounded-full border border-rose-200 bg-rose-50/60 px-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? "Close chatbot" : "Open chatbot"} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-[0_10px_30px_rgba(244,63,94,0.38)] transition hover:scale-105 active:scale-95">
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6 fill-white/20" />}
      </button>
    </div>
  );
}
