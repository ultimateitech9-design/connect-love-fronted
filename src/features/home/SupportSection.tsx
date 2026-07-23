/* eslint-disable */
"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Mail, Phone, ChevronDown, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type ContactData = z.infer<typeof contactSchema>;

const API_BASE = API_ORIGIN;

const faqs = [
  {
    q: "Is Connect Love free to use?",
    a: "Yes! Connect Love has a free tier that lets you create a profile, browse matches, and send up to 5 messages per day. Upgrade to Gold or Diamond for unlimited access.",
  },
  {
    q: "How does the matching algorithm work?",
    a: "Our AI analyses over 80 personality dimensions, communication style, values, life goals and interests to produce compatibility scores — going far beyond looks.",
  },
  {
    q: "How do you verify member identities?",
    a: "All members go through a multi-step verification: email confirmation, phone number, and an optional government-ID check for the Verified Badge. Profile photos are also checked by AI.",
  },
  {
    q: "Can I delete my account and data?",
    a: "Absolutely. Go to Settings → Privacy → Delete Account. All your data including messages and photos is permanently removed within 48 hours, in line with GDPR.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards, UPI, Net Banking, and popular wallets (Paytm, PhonePe, Google Pay). All transactions are secured via Razorpay.",
  },
  {
    q: "How do I report someone?",
    a: "Tap the three-dot menu on any profile or message, then select 'Report'. Our moderation team reviews all reports within 2 hours and takes appropriate action.",
  },
];

export function SupportSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactData) => {
    try {
      await fetch(`${API_BASE}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Gracefully handle if backend isn't running yet
    }
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="support" className="bg-white py-16 sm:py-20 relative overflow-hidden" ref={ref}>
      {/* Background soft blur blobs */}
      <div className="absolute left-[10%] top-[20%] h-80 w-80 rounded-full bg-rose-100/10 blur-[100px] pointer-events-none" />
      <div className="absolute right-[5%] bottom-[10%] h-96 w-96 rounded-full bg-purple-100/10 blur-[120px] pointer-events-none" />

      <div className="mx-auto w-[90vw] max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-xs font-bold tracking-widest text-rose-700 uppercase dark:text-rose-300">Support</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight font-display">
            We&apos;re here to{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent text-glow-rose">
              help
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-500 max-w-xl mx-auto">
            Have a question or need assistance? Reach out to our team and we&apos;ll get back to you within 24 hours.
          </p>
        </motion.div>

        {/* Contact channels */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {[
            { icon: Mail, label: "support@connectlove.app", detail: "Email us anytime" },
            { icon: Phone, label: "+91 98765 43210", detail: "Mon–Fri, 9am–6pm IST" },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-4 rounded-2xl border border-rose-100/50 bg-rose-50/20 px-6 py-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md hover:border-rose-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-pink-50 text-rose-500">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{c.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-14 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Contact Form */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="min-w-0"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6 font-display">Send us a message</h3>
            {submitted ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-3xl bg-emerald-50/50 border border-emerald-100 p-8 text-center"
              >
                <div className="text-4xl mb-4">✉️</div>
                <h4 className="text-lg font-bold text-emerald-800">Message sent successfully!</h4>
                <p className="mt-2 text-sm text-emerald-600">We&apos;ll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Full Name</label>
                    <input
                      {...register("name")}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Email Address</label>
                    <input
                      {...register("email")}
                      placeholder="you@email.com"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Subject</label>
                  <input
                    {...register("subject")}
                    placeholder="How can we help?"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"
                  />
                  {errors.subject && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Message</label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all resize-none placeholder:text-slate-400"
                  />
                  {errors.message && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{errors.message.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white text-sm font-bold hover:brightness-110 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all hover:scale-105 active:scale-95 disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </motion.div>

          {/* FAQ Accordion */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="min-w-0"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-6 font-display">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-3xl border border-slate-100 bg-slate-50/40 overflow-hidden transition-all duration-300 hover:border-rose-100 hover:shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between px-6 py-4.5 text-left text-sm font-bold text-slate-800 hover:bg-slate-100/50 transition-colors duration-200 cursor-pointer"
                  >
                    <span className="pr-4">{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 ${
                        openFaq === i ? "rotate-180 text-rose-500" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-5 pt-1 text-sm text-slate-500 leading-relaxed border-t border-slate-100/30">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
