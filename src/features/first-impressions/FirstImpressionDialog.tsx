import { useEffect, useState } from 'react';
import { ArrowUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { sendFirstImpression } from './api';

type Props = {
  open: boolean;
  profile: { id: string; name: string; photo: string | null; photoCount: number };
  onClose: () => void;
  onSent?: () => void;
  canSend?: boolean;
  onSendLocked?: () => void;
};

export function FirstImpressionDialog({ open, profile, onClose, onSent, canSend = true, onSendLocked }: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) setMessage('');
  }, [open, profile.id]);

  if (!open) return null;

  const submit = async () => {
    const content = message.trim();
    if (!content || sending) return;
    if (!canSend) {
      onSendLocked?.();
      return;
    }
    setSending(true);
    try {
      const result = await sendFirstImpression(profile.id, content);
      toast.success(`First Impression sent to ${profile.name}. ${result.remainingToday} left today.`);
      onClose();
      onSent?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'First Impression could not be sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="first-impression-title" className="flex max-h-[calc(100dvh-24px)] w-full max-w-[350px] flex-col overflow-hidden bg-[#1b2232] text-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-4 pt-3">
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center text-slate-400 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <span className="grid h-6 min-w-6 place-items-center rounded-full bg-slate-500 px-1.5 text-xs font-bold">5</span>
        </div>

        <div className="px-4 pb-3">
          <p className="mt-1 text-sm font-bold text-blue-400">Up to 5x your chances to match</p>
          <h2 id="first-impression-title" className="mt-1 text-sm font-bold leading-[18px]">
            Stand out with First Impressions. Send a message. See if it&apos;s a match.
          </h2>

          <div className="relative mt-3 h-[clamp(180px,44dvh,340px)] overflow-hidden rounded-xl bg-slate-800">
            {profile.photo ? (
              <img src={profile.photo} alt={`${profile.name}'s profile`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center bg-slate-700 text-5xl font-bold text-slate-400">{profile.name.slice(0, 1)}</div>
            )}
            <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold">1/{Math.max(1, profile.photoCount)}</span>
          </div>

          <div className="mt-3 flex items-center rounded-full bg-[#080c15] p-1 pl-4 ring-1 ring-white/5 focus-within:ring-blue-400">
            <input
              autoFocus
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, 280))}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
              placeholder="Your message"
              aria-label="Your First Impression message"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button type="button" onClick={submit} disabled={!message.trim() || sending} className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-600 text-slate-950 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-45" aria-label="Send First Impression">
              <ArrowUp className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
          <p className="mt-1 text-right text-[10px] leading-none text-slate-500">{message.length}/280</p>
        </div>
      </section>
    </div>
  );
}
