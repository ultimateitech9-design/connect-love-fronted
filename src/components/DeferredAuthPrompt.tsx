"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AuthPromptModal = dynamic(
  () => import("@/features/home/AuthPromptModal").then((module) => module.AuthPromptModal),
  { ssr: false },
);

export function DeferredAuthPrompt() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 30000);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? <AuthPromptModal /> : null;
}
