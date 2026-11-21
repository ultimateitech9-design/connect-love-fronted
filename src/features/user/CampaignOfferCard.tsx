"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart, X } from "lucide-react";
import Link from "next/link";
import { getAuthIdentity, getToken, tokenUserId } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import "./welcome-offer.css";

const coupon = "CONNECTLOVE";

export function CampaignOfferCard() {
  const token = getToken() || "";
  const id = tokenUserId(token);
  const { data: profile } = useCurrentUser(token);
  const name = (getAuthIdentity()?.name || (profile?.id === id && profile.name) || "").trim().split(/\s+/)[0];
  const key = "cl_welcome_offer:" + id;
  const [visible, setVisible] = useState(false);
  const [copyState, setCopyState] = useState<"ready" | "copied" | "manual">("ready");
  const input = useRef<HTMLElement>(null);

  useEffect(() => {
    try { setVisible(sessionStorage.getItem(key) !== "dismissed"); }
    catch { setVisible(true); }
    setCopyState("ready");
  }, [key]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon);
      setCopyState("copied");
    } catch {
      if (input.current) {
        const range = document.createRange();
        range.selectNodeContents(input.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setCopyState("manual");
    }
  }

  if (!id || !name || !visible) return null;
  return (
    <section className="cl-welcome-offer" aria-label="Your membership offer" key={id}>
      <div className="cl-offer-heart" aria-hidden="true">
        <Heart className="cl-heart-left" /><Heart className="cl-heart-right" />
      </div>
      <div className="cl-offer-reveal cl-offer-message">
        <p>Hello, <span>{name}</span>!</p>
        <h2><strong>30% off</strong> membership</h2>
        <Link href="/user/premium">Claim your offer <ArrowUpRight size={15}/></Link>
      </div>
      <div className="cl-offer-reveal cl-offer-ticket">
        <div><small>Coupon code</small><code ref={input}>{coupon}</code></div>
        <button type="button" onClick={copyCode} aria-label="Copy coupon code">
          {copyState === "copied" ? <Check size={15}/> : <Copy size={15}/>}
          <span aria-live="polite">{copyState === "copied" ? "Copied!" : copyState === "manual" ? "Select & copy" : "Copy"}</span>
        </button>
      </div>
      <button className="cl-offer-close" type="button" aria-label="Dismiss offer" onClick={() => {
        setVisible(false);
        try { sessionStorage.setItem(key, "dismissed"); } catch {}
      }}><X size={16}/></button>
    </section>
  );
}
