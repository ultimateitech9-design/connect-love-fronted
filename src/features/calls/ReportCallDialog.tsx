"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Flag, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";

const REASONS = [
  "Inappropriate or abusive behaviour",
  "Nudity or sexual content",
  "Harassment or threats",
  "Asking for money or a scam",
  "Fake profile",
  "Something else",
];

async function post(path: string, body: unknown) {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || "Request failed.");
  }
}

/** Report and/or block the other person from the call screen; ends the call afterwards. */
export function ReportCallDialog({ callId, otherUser, onClose, onDone }: {
  callId: string;
  otherUser: { id: string; name: string };
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [block, setBlock] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason && !block) return toast.error("Choose a reason or block this person.");
    setBusy(true);
    try {
      if (reason) await post("/direct-calls/report", { callId, reason, details });
      if (block) await post("/direct-calls/block", { userId: otherUser.id });
      toast.success(
        reason && block ? `${otherUser.name} was reported and blocked.`
          : reason ? `Thanks, we will review your report about ${otherUser.name}.`
            : `${otherUser.name} was blocked.`,
      );
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the report.");
      setBusy(false);
    }
  };

  if (typeof document === "undefined") return null;
  return createPortal((
    <div className="fixed inset-0 z-[10080] flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="report-call-title" onClick={(event) => event.stopPropagation()} className="relative w-full max-w-md rounded-t-3xl bg-card p-6 text-foreground shadow-2xl sm:rounded-3xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
        <h2 id="report-call-title" className="flex items-center gap-2 pr-10 text-lg font-bold"><Flag className="h-5 w-5 text-rose-500" /> Report or block {otherUser.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">The call will end. Reports go to our safety team.</p>

        <fieldset className="mt-4 space-y-2">
          <legend className="sr-only">Reason</legend>
          {REASONS.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50/60 dark:has-[:checked]:bg-rose-500/10">
              <input type="radio" name="report-reason" value={option} checked={reason === option} onChange={() => setReason(option)} className="accent-rose-600" />
              {option}
            </label>
          ))}
        </fieldset>
        {reason && (
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={2000} rows={3} placeholder="What happened? (optional)" className="mt-3 w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-rose-300" />
        )}
        <label className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={block} onChange={(event) => setBlock(event.target.checked)} className="accent-rose-600" />
          Also block {otherUser.name} (no more calls or messages)
        </label>

        <button type="button" disabled={busy} onClick={() => void submit()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 font-bold text-white hover:bg-rose-500 disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {reason ? (block ? "Report, block and end call" : "Report and end call") : "Block and end call"}
        </button>
      </div>
    </div>
  ), document.body);
}
