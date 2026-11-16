'use client';
import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

type OutputAudio = HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };
type OutputMedia = MediaDevices & { selectAudioOutput?: (options?: { deviceId?: string }) => Promise<MediaDeviceInfo> };
type Options = {
  callId?: string;
  localStream: MutableRefObject<MediaStream | null>;
  peer: MutableRefObject<RTCPeerConnection | null>;
  audio: MutableRefObject<HTMLAudioElement | null>;
  onStreamsChanged: () => void;
};

export function useCallDevices({ callId, localStream, peer, audio, onStreamsChanged }: Options) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [outputId, setOutputId] = useState('');
  const [inputIds, setInputIds] = useState({ microphone: '', camera: '' });
  const [canSelectOutput, setCanSelectOutput] = useState(false);
  const [canPromptOutput, setCanPromptOutput] = useState(false);
  const outputRef = useRef('');
  const sessionRef = useRef(callId);
  sessionRef.current = callId;

  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter(device => Boolean(device.deviceId)));
      setInputIds({ microphone: localStream.current?.getAudioTracks()[0]?.getSettings().deviceId || '', camera: localStream.current?.getVideoTracks()[0]?.getSettings().deviceId || '' });
      setCanSelectOutput(typeof (audio.current as OutputAudio | null)?.setSinkId === 'function');
      setCanPromptOutput(typeof (navigator.mediaDevices as OutputMedia).selectAudioOutput === 'function');
      if (outputRef.current && !list.some(device => device.kind === 'audiooutput' && device.deviceId === outputRef.current)) {
        const element = audio.current as OutputAudio | null;
        if (element?.setSinkId) {
          await element.setSinkId(''); outputRef.current = ''; setOutputId('');
        }
      }
    } catch { setError('Could not list devices. Check your camera and microphone permissions.'); }
  }, [audio, localStream]);

  useEffect(() => {
    if (!callId) return;
    setError(''); setOutputId(''); outputRef.current = '';
    void refresh();
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh);
    return () => { navigator.mediaDevices?.removeEventListener?.('devicechange', refresh); };
  }, [callId, refresh]);

  const switchInput = useCallback(async (kind: 'audio' | 'video', deviceId: string) => {
    const stream = localStream.current;
    if (!stream || busyRef.current) return;
    const session = sessionRef.current;
    const oldTrack = stream.getTracks().find(track => track.kind === kind);
    const settings = oldTrack?.getSettings();
    const enabled = oldTrack?.enabled ?? true;
    const constraints = (id: string): MediaStreamConstraints => kind === 'audio'
      ? { audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, ...(id ? { deviceId: { exact: id } } : {}) }, video: false }
      : { audio: false, video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 30 }, ...(id ? { deviceId: { exact: id } } : { facingMode: 'user' }) } };
    busyRef.current = true; setBusy(true); setError('');
    let acquired: MediaStream | null = null;
    let adopted = false;
    const adopt = async (next: MediaStream) => {
      if (localStream.current !== stream || session !== sessionRef.current) return false;
      const track = next.getTracks().find(item => item.kind === kind);
      if (!track) throw new Error('The selected device did not provide a media track.');
      track.enabled = enabled;
      if (kind === 'video') track.contentHint = 'motion';
      const sender = peer.current?.getSenders().find(item => item.track?.kind === kind);
      if (sender) await sender.replaceTrack(track);
      if (localStream.current !== stream || session !== sessionRef.current) return false;
      if (oldTrack) { stream.removeTrack(oldTrack); oldTrack.stop(); }
      stream.addTrack(track); onStreamsChanged();
      await refresh();
      return true;
    };
    try {
      try { acquired = await navigator.mediaDevices.getUserMedia(constraints(deviceId)); }
      catch (err) {
        // Some phones require releasing the front camera before opening the rear.
        if (kind !== 'video' || !oldTrack || !['NotReadableError', 'AbortError'].includes((err as DOMException).name)) throw err;
        oldTrack.stop();
        acquired = await navigator.mediaDevices.getUserMedia(constraints(deviceId));
      }
      adopted = await adopt(acquired);
    } catch (err) {
      // Restore the previous camera if a phone required us to release it first.
      if (oldTrack?.readyState === 'ended' && localStream.current === stream && session === sessionRef.current) {
        let restored: MediaStream | null = null;
        let kept = false;
        try {
          restored = await navigator.mediaDevices.getUserMedia(constraints(settings?.deviceId || ''));
          kept = await adopt(restored);
        } catch { /* The permission/device error below remains visible. */ }
        finally { if (!kept) restored?.getTracks().forEach(track => track.stop()); }
      }
      if (session === sessionRef.current) setError(err instanceof Error ? `Could not switch ${kind === 'audio' ? 'microphone' : 'camera'}: ${err.message}` : 'Could not switch devices.');
    } finally {
      if (!adopted) acquired?.getTracks().forEach(track => track.stop());
      busyRef.current = false; setBusy(false);
    }
  }, [localStream, peer, onStreamsChanged, refresh]);

  const selectOutput = useCallback(async (id: string) => {
    const element = audio.current as OutputAudio | null;
    if (!element?.setSinkId) { setError('This browser uses the system audio output. Use your phone or computer audio/Bluetooth controls to choose the speaker or headset.'); return; }
    const session = sessionRef.current;
    setError('');
    try {
      await element.setSinkId(id);
      if (session !== sessionRef.current) return;
      outputRef.current = id; setOutputId(id);
    } catch { setError('Audio output could not be changed. Allow speaker access or choose another device.'); }
  }, [audio]);

  const promptOutput = useCallback(async () => {
    const media = navigator.mediaDevices as OutputMedia;
    if (!media?.selectAudioOutput) return;
    const session = sessionRef.current;
    setError('');
    try {
      // Call directly from the click handler; the picker requires user activation.
      const selected = await media.selectAudioOutput();
      if (session !== sessionRef.current) return;
      await selectOutput(selected.deviceId); await refresh();
    } catch (err) { if ((err as DOMException).name !== 'AbortError') setError('Speaker selection was not allowed. Use your system audio controls or try again.'); }
  }, [refresh, selectOutput]);

  const cameras = devices.filter(device => device.kind === 'videoinput');
  const flipCamera = useCallback(async () => {
    const list = devices.filter(device => device.kind === 'videoinput');
    if (list.length < 2) { setError('Only one camera is available on this device.'); return; }
    const current = localStream.current?.getVideoTracks()[0]?.getSettings().deviceId;
    const index = list.findIndex(device => device.deviceId === current);
    await switchInput('video', list[(index + 1) % list.length].deviceId);
  }, [devices, localStream, switchInput]);

  return { devices, cameras, microphones: devices.filter(device => device.kind === 'audioinput'), outputs: devices.filter(device => device.kind === 'audiooutput'), inputIds, outputId, canSelectOutput, canPromptOutput, busy, error, refresh, switchInput, selectOutput, promptOutput, flipCamera };
}
