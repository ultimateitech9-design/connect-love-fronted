"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MessagesClient = dynamic(() => import("./MessagesClient"), {
  ssr: false,
  loading: () => <MessagesShell />,
});

function MessagesShell() {
  return (
    <div className="chat-theme-surface grid h-full min-h-0 gap-4 rounded-2xl p-0 lg:grid-cols-[320px_1fr]">
      <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/92 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-rose-100 p-4">
          <h1 className="text-lg font-semibold text-slate-950">Messages</h1>
          <div className="relative hidden lg:block">
            <span className="absolute left-3 top-2.5 h-4 w-4 rounded-full border border-slate-400" />
            <div className="h-9 rounded-full bg-rose-50 pl-9" />
          </div>
        </div>
        <div className="hidden flex-1 divide-y divide-rose-50 lg:block">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center gap-3 px-4 py-3">
              <div className="h-11 w-11 rounded-full bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="mt-2 h-2 w-20 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/92 shadow-sm backdrop-blur">
        <header className="flex shrink-0 items-center justify-between border-b border-rose-100 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div>
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="h-4 w-4 rounded-full bg-slate-200" />
            <span className="h-4 w-4 rounded bg-slate-200" />
            <span className="h-4 w-1 rounded bg-slate-200" />
          </div>
        </header>
        <div className="flex-1 px-5 py-6">
          <div className="ml-auto h-10 w-44 rounded-2xl rounded-br-sm bg-rose-500/85" />
          <div className="mt-4 h-10 w-52 rounded-2xl rounded-bl-sm bg-slate-100" />
          <div className="mt-4 ml-auto h-10 w-36 rounded-2xl rounded-br-sm bg-rose-500/85" />
        </div>
        <div className="flex shrink-0 items-center gap-2 border-t border-rose-100 p-4">
          <div className="h-10 flex-1 rounded-full bg-rose-50" />
          <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-600 text-white">
            <span className="block h-3 w-3 rotate-45 border-r-2 border-t-2 border-white" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MessagesPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    let idleId: number | undefined;
    const timer = window.setTimeout(() => setReady(true), 1200);

    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(() => setReady(true), { timeout: 1200 });
    }

    return () => {
      window.clearTimeout(timer);
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
    };
  }, []);

  return ready ? <MessagesClient /> : <MessagesShell />;
}
