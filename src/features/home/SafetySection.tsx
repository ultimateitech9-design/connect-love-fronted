/* eslint-disable */
import { ShieldCheck, Lock, Eye, BadgeCheck, Fingerprint, UserCheck } from "lucide-react";

const safetyFeatures = [
 {
 icon: BadgeCheck,
 title: "ID Verification",
 desc: "Every member is verified through our multi-stage AI authentication. Meet only real, genuine people.",
 color: "from-emerald-50 to-teal-50",
 iconBg: "from-emerald-400 to-teal-500",
 },
 {
 icon: Lock,
 title: "Privacy Shield",
 desc: "End-to-end encrypted messages. Your conversations are only ever between you and your match.",
 color: "from-blue-50 to-indigo-50",
 iconBg: "from-blue-400 to-indigo-500",
 },
 {
 icon: Eye,
 title: "Photo Moderation",
 desc: "AI-powered image scanning removes inappropriate content before it ever reaches another member.",
 color: "from-violet-50 to-purple-50",
 iconBg: "from-violet-400 to-purple-500",
 },
 {
 icon: Fingerprint,
 title: "Biometric Login",
 desc: "Face ID and fingerprint authentication keep your account secure, even if your device is lost.",
 color: "from-rose-50 to-pink-50",
 iconBg: "from-rose-400 to-pink-500",
 },
 {
 icon: UserCheck,
 title: "Safe Date Mode",
 desc: "Share your date details with a trusted contact. Auto-check-in alerts if you don't respond.",
 color: "from-amber-50 to-orange-50",
 iconBg: "from-amber-400 to-orange-500",
 },
 {
 icon: ShieldCheck,
 title: "24/7 Moderation",
 desc: "Our safety team monitors the platform around the clock and responds to all reports within 2 hours.",
 color: "from-slate-50 to-gray-50",
 iconBg: "from-slate-500 to-gray-600",
 },
];

export function SafetySection() {
 return (
 <section id="safety" className="marketing-deferred-section relative overflow-hidden py-10 sm:py-12"
 style={{ background: "linear-gradient(150deg, #0D0B2B 0%, #1F0B35 50%, #0E1940 100%)" }}
 >
 {/* BG blobs */}
 <div className="pointer-events-none absolute inset-0">
 <div className="absolute top-0 left-1/4 h-[20vw] w-[20vw] rounded-full bg-rose-600/15 blur-[100px]" />
 <div className="absolute bottom-0 right-1/4 h-[20vw] w-[20vw] rounded-full bg-purple-600/15 blur-[100px]" />
 </div>

 <div className="relative z-10 mx-auto w-[90vw]">
 {/* Header */}
 <div className="text-center">
 <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold text-white/70 uppercase tracking-widest backdrop-blur-sm">
 <ShieldCheck className="h-[14px] w-[14px] text-emerald-400" />
 Secure by Design
 </span>
 <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white leading-tight">
 Safe Haven{" "}
 <span className="bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent">
 for Hearts
 </span>
 </h2>
 <p className="mt-3 mx-auto max-w-5xl text-base leading-relaxed text-white/55 sm:text-lg">
 Every member is verified through our multi-stage AI authentication. We protect your privacy while ensuring the person you talk to is exactly who they claim to be.
 </p>
 </div>

 {/* Feature grid */}
 <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:mt-8">
 {safetyFeatures.map((feat, i) => (
 <div
 key={feat.title}
 className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-1 transition-all"
 >
 <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feat.iconBg} shadow-lg`}>
 <feat.icon className="h-5 w-5 text-white" />
 </div>
 <h3 className="mt-3 font-semibold text-white">{feat.title}</h3>
 <p className="mt-1.5 text-sm text-white/55 leading-relaxed">{feat.desc}</p>
 </div>
 ))}
 </div>

 {/* Trust badges row */}
 <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
 {["GDPR Compliant", "256-bit Encryption", "ISO 27001 Certified", "No Data Selling"].map((badge) => (
 <div key={badge} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 backdrop-blur-sm">
 <ShieldCheck className="h-[14px] w-[14px] text-emerald-400" />
 <span className="text-xs font-medium text-white/70">{badge}</span>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}
