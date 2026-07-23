"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { ReceiptText } from "lucide-react";

export default function RefundPolicyPage() {
  const page: PublicPageData = {
    eyebrow: "Billing support",
    title: "Subscription Cancellation & Refund Policy",
    description:
      "How to cancel a ConnectLove subscription, prevent future renewals, and request review of duplicate, unauthorized, or service-related charges.",
    icon: ReceiptText,
    cta: { label: "Contact Billing Support", href: "/contact-us" },
    secondaryCta: { label: "View Premium Plans", href: "/user/premium" },
    highlights: [
      "Cancel renewal through the platform where you purchased your plan.",
      "Refund eligibility depends on the payment channel, applicable law, and charge circumstances.",
      "Billing support can investigate duplicate or unrecognized charges.",
    ],
    metrics: [
      { value: "3", label: "steps to submit a request" },
      { value: "Secure", label: "billing support route" },
      { value: "Never", label: "share an OTP or payment PIN" },
    ],
    sections: [
      {
        title: "Cancel a renewal",
        body: "Cancellation stops the next renewal but normally does not erase the access already included in the paid billing period.",
        points: [
          "Use the subscription settings in the purchase channel.",
          "Cancel before the renewal date shown in your account.",
          "Keep the cancellation confirmation for your records.",
        ],
      },
      {
        title: "Request a charge review",
        body: "Contact support promptly when a charge appears duplicated, unauthorized, or linked to a confirmed service problem.",
        points: [
          "Provide the account email and transaction reference.",
          "Describe the charge and the date it occurred.",
          "Do not send a full card number, OTP, CVV, UPI PIN, or password.",
        ],
      },
      {
        title: "Third-party purchases",
        body: "Apple App Store, Google Play, or another payment provider may control cancellation and refund decisions for purchases processed by that provider.",
        points: [
          "Open the relevant store purchase history.",
          "Follow that provider's refund process.",
          "Send ConnectLove support the non-sensitive order reference if help is needed.",
        ],
      },
    ],
    longForm: [
      {
        title: "When a refund may be reviewed",
        paragraphs: [
          "Billing support can review issues such as duplicate charges, an unrecognized transaction, an incorrect amount, or a documented technical failure that prevented access to the paid service. A request is not an automatic approval.",
          "The final outcome depends on the facts, the payment processor's rules, the plan terms accepted at checkout, and consumer law that applies to the transaction.",
        ],
        points: [
          "Duplicate or incorrect charge.",
          "Potential unauthorized payment.",
          "Confirmed paid-service access issue.",
          "A right required by applicable consumer law.",
        ],
      },
      {
        title: "What to include in your request",
        paragraphs: [
          "Use the Contact Us form and select the payment or subscription topic. Include enough detail to locate the payment without exposing financial credentials.",
          "Support may ask for additional non-sensitive evidence. ConnectLove will never ask for your password, CVV, card PIN, UPI PIN, or one-time password.",
        ],
        points: [
          "Account email address.",
          "Transaction or order reference.",
          "Charge date and amount.",
          "A short explanation and relevant screenshot.",
        ],
      },
    ],
    actions: [
      { title: "Check the purchase channel", body: "Confirm whether the payment was made on ConnectLove, an app store, or another provider." },
      { title: "Cancel future renewal", body: "Use the same purchase channel to stop the next automatic renewal." },
      { title: "Submit a billing request", body: "Contact support with the account email and non-sensitive transaction details." },
    ],
    faq: [
      {
        question: "Does cancelling automatically refund the current billing period?",
        answer:
          "Not necessarily. Cancellation generally stops a future renewal. Any refund request is reviewed under the purchase channel's rules, the checkout terms, and applicable law.",
      },
      {
        question: "Where do I request an app-store refund?",
        answer:
          "Use the refund process for the app store or payment provider that processed the purchase. ConnectLove support can help identify the relevant transaction route.",
      },
      {
        question: "What information should I never send to support?",
        answer:
          "Never send your password, OTP, CVV, full card number, card PIN, UPI PIN, or other authentication credentials.",
      },
      {
        question: "How do I report a charge I do not recognize?",
        answer:
          "Contact billing support promptly with the account email, date, amount, and non-sensitive transaction reference, and also notify your payment provider if you believe the payment was unauthorized.",
      },
    ],
    lastUpdated: "2026-07-23",
  };

  return <MarketingInfoPage page={page} />;
}
