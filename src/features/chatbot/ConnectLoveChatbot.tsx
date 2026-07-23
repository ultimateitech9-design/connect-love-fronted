"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, ChevronLeft, Heart, Headphones, Loader2, MessageCircle, Send, Sparkles, TicketCheck, X } from "lucide-react";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";

type Language = "en" | "hi";
type ChatMessage = { id: number; sender: "bot" | "user"; text: string; supportSuggested?: boolean };
type SupportIdentity = { id: string; name: string; email: string };

const supportCategories = [
  "Account access",
  "Payments or refund",
  "Safety report",
  "Matches or messages",
  "Technical issue",
  "Other",
];

const copy = {
  en: {
    title: "ConnectLove Assistant",
    online: "Online · Here to help",
    welcome: "Hi! I can help with matches, messages, profile safety, and Gold or Diamond plans.",
    placeholder: "Ask me anything...",
    error: "Sorry, I could not respond. Please try again.",
    contactSupport: "Contact support",
    backToAssistant: "Back to assistant",
    supportTitle: "Create a support ticket",
    supportHint: "Your account details will be attached automatically. Never share your password, OTP, PIN or CVV.",
    issueType: "Issue type",
    issuePlaceholder: "Explain what happened, what you expected, and any error you saw...",
    submitTicket: "Send to support",
    loadingAccount: "Loading your account...",
    accountError: "Your signed-in account could not be loaded. Please refresh and try again.",
    detailsError: "Please enter at least 10 characters so Support can understand the issue.",
    ticketError: "Support ticket could not be created. Please try again.",
    ticketCreated: "Ticket created",
    ticketFollowUp: "Support can now see it in the live queue and will follow up on your account email.",
    suggestions: ["How do matches work?", "Tell me about Diamond", "How do I stay safe?"],
  },
  hi: {
    title: "ConnectLove सहायक",
    online: "ऑनलाइन · आपकी मदद के लिए",
    welcome: "नमस्ते! मैं matches, messages, profile safety और Gold या Diamond plans में आपकी मदद कर सकता हूँ।",
    placeholder: "अपना सवाल लिखें...",
    error: "माफ़ कीजिए, जवाब नहीं मिल पाया। कृपया दोबारा कोशिश करें।",
    contactSupport: "सपोर्ट से संपर्क करें",
    backToAssistant: "सहायक पर वापस जाएं",
    supportTitle: "सपोर्ट टिकट बनाएं",
    supportHint: "आपकी account details अपने-आप जुड़ेंगी। Password, OTP, PIN या CVV कभी साझा न करें।",
    issueType: "समस्या का प्रकार",
    issuePlaceholder: "क्या हुआ, आप क्या चाहते थे और कौन-सी error आई, पूरी जानकारी लिखें...",
    submitTicket: "सपोर्ट को भेजें",
    loadingAccount: "आपका account load हो रहा है...",
    accountError: "Signed-in account load नहीं हुआ। Page refresh करके दोबारा कोशिश करें।",
    detailsError: "Support को समस्या समझाने के लिए कम से कम 10 अक्षर लिखें।",
    ticketError: "Support ticket नहीं बन पाया। कृपया दोबारा कोशिश करें।",
    ticketCreated: "टिकट बन गया",
    ticketFollowUp: "Support की live queue में ticket पहुंच गया है और account email पर follow-up होगा।",
    suggestions: ["मैच कैसे बनता है?", "Diamond प्लान बताएं", "सुरक्षित कैसे रहें?"],
  },
} as const;

export function ConnectLoveChatbot() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [supportMode, setSupportMode] = useState(false);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportIdentity, setSupportIdentity] = useState<SupportIdentity | null>(null);
  const [supportCategory, setSupportCategory] = useState(supportCategories[0]);
  const [supportDetails, setSupportDetails] = useState("");
  const [supportError, setSupportError] = useState("");
  const [supportTicketId, setSupportTicketId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: "bot", text: copy.en.welcome },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

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
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        sender: "bot",
        text: body.reply,
        supportSuggested: Boolean(body.supportSuggested),
      }]);
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

  const openSupport = async () => {
    setSupportMode(true);
    setSupportError("");
    setSupportTicketId(null);
    if (supportIdentity || supportLoading) return;
    setSupportLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Missing user token");
      const response = await fetch(`${API_ORIGIN}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to load account");
      const user = await response.json();
      if (!user?.id || !user?.name || !user?.email) throw new Error("Incomplete account");
      setSupportIdentity({ id: String(user.id), name: String(user.name), email: String(user.email) });
    } catch {
      setSupportError(text.accountError);
    } finally {
      setSupportLoading(false);
    }
  };

  const submitSupportTicket = async (event: FormEvent) => {
    event.preventDefault();
    setSupportError("");
    if (!supportIdentity) {
      setSupportError(text.accountError);
      return;
    }
    if (supportDetails.trim().length < 10) {
      setSupportError(text.detailsError);
      return;
    }
    setSupportSubmitting(true);
    try {
      const response = await fetch(`${API_ORIGIN}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: supportIdentity.name,
          email: supportIdentity.email,
          subject: `Chatbot · ${supportCategory}`,
          message: `Account ID: ${supportIdentity.id}\nSource: User dashboard support chatbot\n\n${supportDetails.trim()}`,
        }),
      });
      if (!response.ok) throw new Error("Unable to create support ticket");
      const result = await response.json();
      setSupportTicketId(Number(result.id));
      setSupportDetails("");
    } catch {
      setSupportError(text.ticketError);
    } finally {
      setSupportSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-[9999] md:bottom-7 md:right-7">
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
            <button type="button" onClick={supportMode ? () => setSupportMode(false) : () => void openSupport()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white/15 py-2 text-[11px] font-bold text-white transition hover:bg-white/25">
              {supportMode ? <ChevronLeft className="h-3.5 w-3.5" /> : <Headphones className="h-3.5 w-3.5" />}
              {supportMode ? text.backToAssistant : text.contactSupport}
            </button>
          </header>

          {supportMode ? (
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-rose-50/70 to-white p-4">
              {supportTicketId ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-600"><TicketCheck className="h-7 w-7" /></span>
                  <h3 className="mt-4 text-lg font-black text-slate-900">{text.ticketCreated} #{supportTicketId}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{text.ticketFollowUp}</p>
                  <button type="button" onClick={() => setSupportMode(false)} className="mt-5 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white">{text.backToAssistant}</button>
                </div>
              ) : (
                <form onSubmit={submitSupportTicket} className="space-y-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">{text.supportTitle}</h3>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">{text.supportHint}</p>
                  </div>
                  {supportLoading ? (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-white p-3 text-xs font-semibold text-rose-600"><Loader2 className="h-4 w-4 animate-spin" />{text.loadingAccount}</div>
                  ) : supportIdentity ? (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                      <p className="text-xs font-bold text-emerald-800">{supportIdentity.name}</p>
                      <p className="truncate text-[11px] text-emerald-700">{supportIdentity.email}</p>
                    </div>
                  ) : null}
                  <label className="block text-[11px] font-bold text-slate-600">
                    <span className="mb-1 block">{text.issueType}</span>
                    <select value={supportCategory} onChange={(event) => setSupportCategory(event.target.value)} className="h-10 w-full rounded-xl border border-rose-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-rose-400">
                      {supportCategories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                  <textarea value={supportDetails} onChange={(event) => setSupportDetails(event.target.value)} maxLength={2000} rows={6} placeholder={text.issuePlaceholder} className="w-full resize-none rounded-xl border border-rose-200 bg-white p-3 text-xs leading-5 text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
                  {supportError && <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] font-semibold text-rose-700"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{supportError}</div>}
                  <button type="submit" disabled={!supportIdentity || supportSubmitting || supportLoading} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-xs font-black text-white shadow-lg shadow-rose-200 disabled:cursor-not-allowed disabled:opacity-50">
                    {supportSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headphones className="h-4 w-4" />}{text.submitTicket}
                  </button>
                </form>
              )}
            </div>
          ) : <div className="flex-1 space-y-2.5 overflow-y-auto bg-gradient-to-b from-rose-50/70 to-white p-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-end gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "bot" && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500"><Bot className="h-4 w-4" /></span>}
                <div className={`max-w-[84%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed shadow-sm ${message.sender === "user" ? "rounded-br-md bg-gradient-to-r from-rose-500 to-pink-500 text-white" : "rounded-bl-md border border-rose-100 bg-white text-slate-700"}`}>
                  <p>{message.text}</p>
                  {message.sender === "bot" && message.supportSuggested ? <button type="button" onClick={() => void openSupport()} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 ring-1 ring-rose-100"><Headphones className="h-3.5 w-3.5" />{text.contactSupport}</button> : null}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pl-9">
                {text.suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => void sendMessage(suggestion)} className="rounded-full border border-rose-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50">{suggestion}</button>)}
              </div>
            )}
            {sending && <div className="flex items-center gap-2 pl-9 text-xs font-semibold text-rose-500"><Loader2 className="h-4 w-4 animate-spin" /> Typing...</div>}
            <div ref={endRef} />
          </div>}

          {!supportMode && <form onSubmit={submit} className="flex items-center gap-2 border-t border-rose-100 bg-white p-2.5">
            <input value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} placeholder={text.placeholder} className="h-10 min-w-0 flex-1 rounded-full border border-rose-200 bg-rose-50/60 px-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100" />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send message" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </form>}
        </section>
      )}

      <button type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? "Close chatbot" : "Open chatbot"} className="group relative ml-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-[0_12px_34px_rgba(244,63,94,0.48)] transition hover:scale-105 active:scale-95">
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-rose-400/45" aria-hidden="true" />}
        {!open && <span className="absolute right-[calc(100%+0.5rem)] whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-white shadow-lg dark:bg-white dark:text-slate-950">Need help?</span>}
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6 fill-white/20" />}
      </button>
    </div>
  );
}
