"use client";

import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";

type RazorpayCheckout = new (options: Record<string, unknown>) => { open: () => void };

function loadCheckout(): Promise<boolean> {
  if ((window as { Razorpay?: RazorpayCheckout }).Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const src = "https://checkout.razorpay.com/v1/checkout.js";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Buys a coin pack through the Razorpay wallet recharge (1 coin = ₹1).
 * Resolves with the coins added, or null if the user closed the checkout.
 */
export async function buyCoins(coins: number, description = `${coins} coins`): Promise<number | null> {
  const token = getToken();
  if (!(await loadCheckout())) throw new Error("Payment checkout could not be loaded.");
  const orderResponse = await fetch(`${API_ORIGIN}/wallet/razorpay/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ coins }),
  });
  const order = await orderResponse.json().catch(() => null);
  if (!orderResponse.ok) throw new Error(order?.message || "Payment could not be started.");

  const Checkout = (window as { Razorpay?: RazorpayCheckout }).Razorpay!;
  return new Promise<number | null>((resolve, reject) => {
    new Checkout({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "ConnectLove",
      description,
      order_id: order.orderId,
      prefill: { name: order.customer?.name, email: order.customer?.email },
      theme: { color: "#ff2d78" },
      handler: async (payment: Record<string, string>) => {
        try {
          const verified = await fetch(`${API_ORIGIN}/wallet/razorpay/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payment),
          });
          const data = await verified.json().catch(() => null);
          if (!verified.ok) throw new Error(data?.message || "Payment verification failed.");
          window.dispatchEvent(new Event("connect-love-wallet-changed"));
          resolve(Number(data?.coinsAdded) || coins);
        } catch (error) {
          reject(error);
        }
      },
      modal: { ondismiss: () => resolve(null) },
    }).open();
  });
}
