'use client';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { prepareAgentPhoto } from '@/features/agents/photo';

export function ProfilePhotoManager({ photos, name, disabled, onChange, onBusyChange }: { photos: string[]; name: string; disabled?: boolean; onChange: (photos: string[]) => void; onBusyChange: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  async function add(files: File[]) {
    if (!files.length) return;
    setError('');
    if (photos.length + files.length > 10) { setError('A profile can have up to 10 photos.'); return; }
    setBusy(true); onBusyChange(true);
    try {
      const prepared: string[] = [];
      for (const file of files) prepared.push(await prepareAgentPhoto(file));
      if (mounted.current) onChange([...photos, ...prepared]);
    } catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : 'Unable to prepare photos.'); }
    finally { if (mounted.current) { setBusy(false); onBusyChange(false); if (input.current) input.current.value = ''; } }
  }
  return <div className="space-y-3"><button type="button" disabled={disabled || busy || photos.length >= 10} onClick={() => input.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}{busy ? 'Preparing photos...' : 'Add photos'}</button><input ref={input} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={event => void add(Array.from(event.target.files || []))} /><p className="text-xs leading-5 text-muted-foreground">JPG, PNG or WebP up to 15 MB each. Use Save Changes to save photo additions and removals.</p>{error && <p role="alert" className="text-xs text-rose-600">{error}</p>}{photos.length ? <div className="grid grid-cols-2 gap-3">{photos.map((photo, index) => <div key={`${index}-${photo.slice(-30)}`} className="relative"><img src={photo} alt={`${name} photo ${index + 1}`} className="aspect-square w-full rounded-xl border border-border object-cover" />{index === 0 && <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-1 text-[10px] font-bold text-white">Primary</span>}<button type="button" disabled={disabled || busy} aria-label={`Remove photo ${index + 1}`} onClick={() => onChange(photos.filter((_, i) => i !== index))} className="absolute right-2 top-2 rounded-full bg-white p-2 text-rose-600 shadow disabled:opacity-50"><Trash2 size={14} /></button></div>)}</div> : <p className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">No profile photos.</p>}</div>;
}
