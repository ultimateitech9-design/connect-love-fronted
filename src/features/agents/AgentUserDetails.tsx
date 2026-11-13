'use client';
import { useEffect, useRef, useState } from 'react';
import { Ban, Loader2, Trash2, Upload, X } from 'lucide-react';
import { agentRequest, type ManagedUser } from './api';
import { prepareAgentPhoto } from './photo';
import { UserActivityPanel } from '@/features/management/UserActivityPanel';
import type { UserActivity } from '@/features/management/userActivity';

export function AgentUserDetails({ user, onClose, onSaved, onRemoved }: { user: ManagedUser; onClose: () => void; onSaved: (user: ManagedUser) => void; onRemoved: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirm, setConfirm] = useState<'ban' | 'delete' | null>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  async function savePhoto(file?: File) {
    if (!file || saving) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const photo = await prepareAgentPhoto(file);
      const result = await agentRequest<{ user: ManagedUser; message: string }>(`/users/${user.id}/photo`, { photo });
      onSaved(result.user); setMessage(result.message);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save this photo.'); }
    finally { setSaving(false); }
  }
  async function moderate() {
    if (!confirm || saving) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const result = await agentRequest<{ message: string }>(`/users/${user.id}/${confirm}`, {});
      if (confirm === 'delete') { onRemoved(); return; }
      onSaved({ ...user, status: 'banned' }); setMessage(result.message); setConfirm(null);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update this account.'); }
    finally { setSaving(false); }
  }
  return <dialog ref={dialog} onCancel={event => { if (saving) event.preventDefault(); else onClose(); }} onClick={event => { if (!saving && event.target === event.currentTarget) onClose(); }} className="ag-dialog" aria-labelledby="ag-detail-title"><div className="ag-dialog-inner">
    <div className="ag-draft-heading"><h2 id="ag-detail-title">User details</h2><button autoFocus disabled={saving} onClick={onClose} aria-label="Close details"><X size={20} /></button></div>
    <div className="ag-detail-profile"><span className="ag-avatar">{user.name.charAt(0)}</span><div><h3>{user.name}</h3><p>{user.email}</p></div></div>
    <div className="ag-detail-photos">{user.photos?.map((photo, index) => <img key={index} src={photo} alt={`${user.name} profile photo ${index + 1}`} />)}</div>
    <div className="ag-photo-row"><label className="ag-upload">{saving ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{saving ? 'Saving...' : user.photos?.length ? 'Change profile photo' : 'Add profile photo'}<input type="file" disabled={saving} accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void savePhoto(file); }} /></label><span className="ag-muted">Up to 15 MB | resized automatically</span></div>
    {error && <div role="alert" className="ag-alert ag-error">{error}</div>}{message && <div role="status" className="ag-alert ag-success">{message}</div>}
    <dl>{[['Account ID', user.id], ['Phone', user.phone], ['Date of birth', user.birthDate?.slice(0, 10)], ['Gender', user.gender], ['City', user.city], ['Profession', user.profession], ['About', user.bio], ['Status', user.status], ['Onboarding', user.onboardingCompleted ? 'Complete' : 'User to complete on login']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl>
    <div className="ag-user-actions"><button className="ag-secondary" disabled={saving || user.status === 'banned'} onClick={() => setConfirm('ban')}><Ban size={16} />{user.status === 'banned' ? 'User banned' : 'Ban user'}</button><button className="ag-danger-button" disabled={saving} onClick={() => setConfirm('delete')}><Trash2 size={16} />Delete user</button></div>
    {confirm && <section className="ag-action-confirm" role="alertdialog" aria-labelledby="ag-confirm-action"><h3 id="ag-confirm-action">{confirm === 'delete' ? 'Permanently delete this user?' : 'Ban this user?'}</h3><p>{confirm === 'delete' ? `${user.name}'s account and related profile data will be permanently removed. This cannot be undone.` : `${user.name} will lose access to their account and disappear from Discover.`}</p><div className="ag-user-actions"><button className="ag-secondary" disabled={saving} onClick={() => setConfirm(null)}>Cancel</button><button className="ag-danger-button" disabled={saving} onClick={() => void moderate()}>{saving ? 'Please wait...' : confirm === 'delete' ? 'Delete permanently' : 'Confirm ban'}</button></div></section>}
    <UserActivityPanel userId={user.id} initial={user.activity} loadPage={page => agentRequest<UserActivity>(`/users/${user.id}/activity?page=${page}`)} />
  </div></dialog>;
}
