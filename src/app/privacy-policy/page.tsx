"use client";

import Link from "next/link";
import { Database, Eye, FileText, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";

const EFFECTIVE_DATE = "15 July 2026";

const contents = [
  ["scope", "1. Scope and acceptance"],
  ["collection", "2. Information we collect"],
  ["use", "3. How we use information"],
  ["visibility", "4. Profile visibility and interactions"],
  ["sharing", "5. How information is shared"],
  ["legal", "6. Legal grounds and consent"],
  ["retention", "7. Retention and deletion"],
  ["security", "8. Security and incident response"],
  ["choices", "9. Your choices and rights"],
  ["children", "10. Age restrictions"],
  ["transfers", "11. International processing"],
  ["updates", "12. Policy updates"],
  ["contact", "13. Contact and grievances"],
] as const;

function PolicySection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-slate-200 py-9 last:border-b-0 dark:border-slate-800">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Section {number}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3">
          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090910] dark:[&_h3]:text-slate-100 dark:[&_strong]:text-slate-100">
      <Navbar onLoginClick={() => { window.location.href = "/login"; }} onSignupClick={() => { window.location.href = "/register"; }} />

      <main className="pt-20">
        <section className="border-b border-rose-100 bg-gradient-to-b from-rose-50 via-white to-slate-50 pb-16 pt-4 dark:border-slate-800 dark:from-[#160b18] dark:via-[#0f0b12] dark:to-[#090910] md:pb-24 md:pt-4">
          <div className="mx-auto w-[90vw] max-w-5xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-rose-600 shadow-sm ring-1 ring-rose-100 dark:bg-slate-900 dark:text-rose-400 dark:ring-slate-700">
              <ShieldCheck className="h-4 w-4" /> Privacy & data protection
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">ConnectLove Privacy Policy</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              This policy explains what personal information ConnectLove collects, why we use it, when it may be shared, how long it may be kept, and the controls available to you.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span>Effective: {EFFECTIVE_DATE}</span>
              <span>Applies to the ConnectLove website, app, and support services</span>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-slate-950 py-8 text-white">
          <div className="mx-auto grid w-[90vw] max-w-5xl gap-5 md:grid-cols-3">
            {[
              { icon: Eye, title: "Clear choices", text: "Control profile visibility, discovery preferences, privacy settings, and account status." },
              { icon: LockKeyhole, title: "Restricted access", text: "Personal data is limited to authorized people and providers who need it for a defined purpose." },
              { icon: Database, title: "No data sale", text: "ConnectLove does not sell your personal information for money." },
            ].map((item) => {
              const Icon = item.icon;
              return <div key={item.title} className="flex gap-4"><Icon className="mt-1 h-5 w-5 shrink-0 text-rose-300" /><div><h2 className="font-bold">{item.title}</h2><p className="mt-1 text-xs leading-5 text-white/60">{item.text}</p></div></div>;
            })}
          </div>
        </section>

        <div className="mx-auto grid w-[90vw] max-w-6xl gap-10 py-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-16">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-24">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Contents</p>
            <nav className="mt-4 space-y-1" aria-label="Privacy policy contents">
              {contents.map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300">{label}</a>)}
            </nav>
          </aside>

          <article className="rounded-3xl border border-slate-200 bg-white px-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:px-10">
            <div className="border-b border-slate-200 py-9 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><FileText className="h-6 w-6" /></div>
              <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-slate-50">Please read this policy carefully</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                “ConnectLove”, “we”, “us”, and “our” refer to the operator of the ConnectLove service. “You” means a visitor, registered member, or another person whose information we process. This policy should be read with our <Link href="/terms-of-service" className="font-semibold text-rose-600 hover:underline">Terms of Service</Link>.
              </p>
            </div>

            <PolicySection id="scope" number="1" title="Scope and acceptance">
              <p>This policy applies when you browse our public pages, register, create or verify a profile, use discovery and filters, like or match with members, exchange messages, use video or safety tools, purchase a subscription, contact support, or otherwise interact with ConnectLove.</p>
              <p>By using the service, you acknowledge this policy. Where applicable law requires consent for a specific activity, we will request it separately and you may withdraw that consent through the available setting or by contacting us. Withdrawing consent does not affect processing already lawfully completed, and some features may stop working if their required data is no longer available.</p>
            </PolicySection>

            <PolicySection id="collection" number="2" title="Information we collect">
              <h3 className="font-bold text-slate-900">Information you provide</h3>
              <BulletList items={[
                <><strong>Account data:</strong> name, email address, password hash, phone number where requested, date of birth, gender, city, and login details.</>,
                <><strong>Profile data:</strong> photos, bio, profession, height, religion, zodiac sign, interests, hobbies, personality words, relationship goals, and discovery preferences such as age, distance, and the genders you are interested in.</>,
                <><strong>Identity and safety data:</strong> verification status, live or submitted verification images, match results, reports, blocks, safety complaints, and supporting evidence. Verification material may involve biometric characteristics depending on how the verification feature is used.</>,
                <><strong>Communications:</strong> messages sent through the service, support requests, call-back details, survey responses, reports, and files or screenshots you upload.</>,
                <><strong>Payment and subscription data:</strong> selected plan, price, currency, transaction identifiers, payment status, invoices, refunds, and fraud or chargeback information. Full card, UPI PIN, or banking credentials should be handled by the payment provider and should never be entered in profile, message, or support fields.</>,
              ]} />
              <h3 className="pt-2 font-bold text-slate-900">Information collected automatically</h3>
              <BulletList items={[
                "Device, browser, operating system, language, IP address, session identifiers, access time, referring page, and application logs.",
                "Approximate or precise location when you permit location access. Location supports distance calculation and nearby discovery; your settings may limit whether distance is shown to others.",
                "Usage activity such as pages viewed, filters used, likes, passes, matches, feature interactions, subscription events, crashes, and security signals.",
                "Cookies and similar technologies used for authentication, preferences, security, performance, and analytics as described in this policy and available browser controls.",
              ]} />
              <p>We may also receive information from payment processors, identity-verification providers, authentication services, other members who report an interaction, and public authorities where legally required. Please do not provide personal information about another person unless you are authorized to do so.</p>
            </PolicySection>

            <PolicySection id="use" number="3" title="How we use information">
              <BulletList items={[
                "Create and secure your account, authenticate sessions, complete onboarding, and maintain your profile.",
                "Operate discovery, search, interested-in and relationship-goal filters, distance ordering, recommendations, likes, matches, chat, calls, gifts, boosts, and premium features.",
                "Display information you choose for your dating profile to eligible members and apply your visibility, online-status, photo, and distance settings.",
                "Process subscriptions, payments, invoices, cancellations, refunds, promotions, and fraud checks.",
                "Verify accounts, prevent fake or duplicate profiles, detect abuse, enforce rules, investigate reports, block harmful activity, and protect members and the public.",
                "Respond to support and privacy requests, communicate service notices, and send optional marketing where permitted. You can opt out of promotional communication without losing essential account notices.",
                "Debug, measure, audit, research, and improve service reliability, accessibility, matching quality, safety, and user experience using aggregated or appropriately de-identified information where feasible.",
                "Comply with legal duties, respond to valid government or court requests, establish or defend legal claims, and maintain required business records.",
              ]} />
              <p>We do not use highly sensitive profile traits to make decisions that produce legal or similarly significant effects about employment, credit, housing, insurance, or public benefits.</p>
            </PolicySection>

            <PolicySection id="visibility" number="4" title="Profile visibility and member interactions">
              <p>ConnectLove is a social discovery service. Information placed on your profile—including your name, age, photos, bio, city, profession, interests, relationship goal, verification badge, and selected status indicators—may be visible to other members according to product and privacy settings. Members you match with may see additional content or communicate with you.</p>
              <p>Other members can save or share information they see, including by taking screenshots. We prohibit misuse, but cannot control information after another person has copied it outside the service. Avoid placing your home address, financial information, passwords, government identification numbers, or other unnecessary sensitive information in your profile or messages.</p>
              <p>Blocking or reporting a member limits future interaction but may not erase copies of prior messages needed for safety, dispute resolution, or legal compliance.</p>
            </PolicySection>

            <PolicySection id="sharing" number="5" title="How information is shared">
              <p>We may disclose only the information reasonably needed for the following purposes:</p>
              <BulletList items={[
                <><strong>Other members:</strong> profile and interaction information as described above.</>,
                <><strong>Service providers:</strong> hosting, storage, email, communications, payments, identity verification, customer support, analytics, security, and professional advisers acting under contractual or legal obligations.</>,
                <><strong>Safety and legal disclosures:</strong> law enforcement, regulators, courts, affected persons, or advisers when we reasonably believe disclosure is required by law, necessary to protect life or safety, investigate fraud or abuse, enforce agreements, or defend legal rights.</>,
                <><strong>Business transactions:</strong> a prospective or completed merger, financing, acquisition, reorganization, or sale of assets, subject to confidentiality safeguards and applicable notice requirements.</>,
                <><strong>At your direction:</strong> when you request or clearly authorize a disclosure.</>,
              ]} />
              <p><strong className="text-slate-900">We do not sell personal information for money.</strong> We also do not permit providers to use ConnectLove personal data for their own unrelated advertising or commercial purposes.</p>
            </PolicySection>

            <PolicySection id="legal" number="6" title="Legal grounds and consent">
              <p>Depending on the feature and applicable law, we process information to provide the service you requested, with your consent, to meet legal obligations, for specified legitimate uses recognized by law, and to protect users, ConnectLove, or others from fraud, abuse, and security threats.</p>
              <p>Consent requests should be clear and specific. You may withdraw consent as easily as it was given where the product provides that control. We will not make access to an unrelated feature conditional on unnecessary personal data. Some processing remains necessary to perform your request, keep required records, resolve disputes, or comply with law.</p>
              <p>ConnectLove is designed with India’s Digital Personal Data Protection framework in mind and will apply the requirements that are in force and applicable to the service. Nothing in this policy limits rights that cannot lawfully be waived.</p>
            </PolicySection>

            <PolicySection id="retention" number="7" title="Retention and deletion">
              <p>We retain personal information only for as long as reasonably necessary for the purposes described here, including providing an active account, maintaining security, meeting accounting or legal requirements, resolving disputes, and enforcing agreements. Retention varies by data type and context.</p>
              <BulletList items={[
                "Active profile and preference data is generally kept while your account remains active.",
                "Messages and match records may remain available to participants and may be retained for safety, moderation, dispute, or legal purposes after a match ends.",
                "Payment, tax, invoice, refund, and fraud records may be kept for legally required accounting and limitation periods.",
                "Reports, blocks, verification outcomes, and enforcement records may be retained to prevent repeat abuse and protect the platform.",
                "Backups and logs are deleted or overwritten on controlled schedules and may not disappear immediately from every recovery system.",
              ]} />
              <p>You may request account deletion through Settings or the contact route. We will delete or de-identify information not required for an ongoing lawful purpose. Deactivation pauses your profile but is not the same as deletion. We do not promise a fixed deletion period where verification, security, legal preservation, or backup constraints apply; we will provide information about the request as required by applicable law.</p>
            </PolicySection>

            <PolicySection id="security" number="8" title="Security and incident response">
              <p>We use reasonable technical and organizational safeguards appropriate to the nature and risk of the information, including access controls, password hashing, authentication controls, role-based permissions, logging, input validation, provider review, backups, and secure transport where supported.</p>
              <p>No website, app, transmission, or storage system is completely secure. Protect your password, use a unique credential, sign out on shared devices, and notify us immediately about suspected unauthorized access. Do not send passwords, OTPs, payment PINs, or full card information through messages or support forms.</p>
              <p>If a personal-data breach occurs, we will investigate, contain, document, and notify affected persons and competent authorities when and in the manner required by applicable law.</p>
            </PolicySection>

            <PolicySection id="choices" number="9" title="Your choices and rights">
              <p>Subject to applicable law, identity verification, and lawful exceptions, you may ask to:</p>
              <BulletList items={[
                "Access a summary of personal information being processed and information about relevant processing or sharing.",
                "Correct inaccurate or misleading information, complete incomplete information, and update profile details.",
                "Erase personal information that is no longer required for a lawful purpose.",
                "Withdraw consent for consent-based processing and manage optional notifications or marketing.",
                "Raise a grievance about data handling and receive a response through the applicable grievance process.",
                "Nominate another person to exercise applicable rights in the event of death or incapacity where the law provides this right.",
              ]} />
              <p>You can edit many details in Profile and Settings. For other requests, use our <Link href="/contact-us" className="font-semibold text-rose-600 hover:underline">Contact Us form</Link> and state “Privacy Request” as the problem type. We may request information needed to verify your identity and protect the account. We will not discriminate against you for exercising a legal privacy right.</p>
            </PolicySection>

            <PolicySection id="children" number="10" title="Age restrictions">
              <p>ConnectLove is intended only for adults aged 18 or older. We do not knowingly permit children to register or intentionally collect their personal information for dating services. Date of birth is used to enforce age eligibility.</p>
              <p>If you believe a person under 18 has created an account or provided personal information, contact us promptly. We may suspend the profile, request age verification, and delete information subject to safety and legal preservation requirements.</p>
            </PolicySection>

            <PolicySection id="transfers" number="11" title="International processing and storage">
              <p>ConnectLove and its providers may process or store information in locations different from where you live. Privacy and government-access laws may vary between countries. Where cross-border processing occurs, we use contractual, technical, and organizational safeguards required by applicable law and comply with any transfer restrictions notified by competent authorities.</p>
            </PolicySection>

            <PolicySection id="updates" number="12" title="Changes to this policy">
              <p>We may update this policy when the product, providers, security practices, or law changes. The “Effective” date above shows the latest version. For material changes, we will provide a prominent in-product, website, or direct notice when required and obtain fresh consent where applicable. Continued use after an update does not replace consent where law specifically requires it.</p>
            </PolicySection>

            <PolicySection id="contact" number="13" title="Contact, privacy requests, and grievances">
              <p>For questions, corrections, deletion requests, consent withdrawal, safety concerns, or privacy grievances, contact the ConnectLove privacy/support team through the form below. Include the email linked to your account and enough detail to identify the request, but do not include your password, OTP, payment PIN, or unnecessary identification documents.</p>
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-rose-600" /><h3 className="font-bold text-slate-900">Submit a privacy request</h3></div>
                <p className="mt-2 text-sm leading-6">Open the support form and select or enter <strong>Privacy Request</strong> as the problem type. We will acknowledge and handle the request under the process and timeframe required by applicable law.</p>
                <Link href="/contact-us" className="mt-4 inline-flex rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500">Contact privacy team</Link>
              </div>
              <p>If you are not satisfied with our response, you may use any escalation or regulatory remedy available under applicable law. Please give us a reasonable opportunity to address the grievance first where the law requires that step.</p>
            </PolicySection>

            <div className="py-9 text-xs leading-6 text-slate-500 dark:text-slate-400">
              This policy is intended to provide transparent information about ConnectLove’s data practices. It does not create rights beyond applicable law or reduce any non-waivable legal right.
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
