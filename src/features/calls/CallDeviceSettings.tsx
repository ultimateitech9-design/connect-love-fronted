'use client';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { useCallDevices } from './useCallDevices';

export function CallDeviceSettings({ devices, video, onClose }: { devices: ReturnType<typeof useCallDevices>; video: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); }, []);
  const selectClass = 'mt-2 w-full rounded-xl border border-white/15 bg-slate-800 p-3 text-sm text-white outline-none focus:border-rose-400 disabled:opacity-50';
  return <section role="dialog" aria-label="Call device settings" aria-modal="true" onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key === 'Tab') {
      const focusable = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled)');
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  }} className="absolute inset-x-3 bottom-[max(10.5rem,calc(env(safe-area-inset-bottom)+10rem))] z-30 mx-auto max-h-[55dvh] max-w-md space-y-4 overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:bottom-32">
    <header className="flex items-center justify-between gap-3"><h2 className="text-base font-bold">Call device settings</h2><button ref={close} onClick={onClose} aria-label="Close device settings" className="rounded-lg p-2 hover:bg-white/10"><X size={18} /></button></header>
    {devices.error && <p role="alert" className="rounded-xl bg-rose-500/15 p-3 text-xs leading-5 text-rose-200">{devices.error}</p>}
    <label className="block text-xs font-semibold">Microphone<select aria-label="Call microphone" disabled={devices.busy} value={devices.inputIds.microphone} onChange={event => void devices.switchInput('audio', event.target.value)} className={selectClass}><option value="">System default microphone</option>{devices.microphones.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}</select></label>
    {video && <label className="block text-xs font-semibold">Camera<select aria-label="Call camera" disabled={devices.busy} value={devices.inputIds.camera} onChange={event => void devices.switchInput('video', event.target.value)} className={selectClass}><option value="">Default camera</option>{devices.cameras.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${index + 1}`}</option>)}</select></label>}
    <div><label className="block text-xs font-semibold">Speaker / audio output<select aria-label="Call audio output" disabled={!devices.canSelectOutput || devices.busy} value={devices.outputId} onChange={event => void devices.selectOutput(event.target.value)} className={selectClass}><option value="">System default output</option>{devices.outputs.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Speaker / headset ${index + 1}`}</option>)}</select></label>{devices.canPromptOutput && devices.canSelectOutput && <button type="button" onClick={() => void devices.promptOutput()} className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold hover:bg-rose-500">Choose speaker or headphones</button>}<p className="mt-2 text-xs leading-5 text-slate-300">{devices.canSelectOutput ? 'Select a speaker, wired headset or Bluetooth device made available by your browser.' : 'This browser controls audio routing. Use your device audio/Bluetooth controls to switch speaker, earpiece or headset.'}</p></div>
    <button type="button" disabled={devices.busy} onClick={() => void devices.refresh()} className="text-xs font-semibold text-rose-300 underline disabled:opacity-50">Refresh connected devices</button><p className="text-xs text-slate-400">Use your device volume buttons to adjust call volume.</p>
  </section>;
}
