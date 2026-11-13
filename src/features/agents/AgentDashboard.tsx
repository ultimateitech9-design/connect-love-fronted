'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownToLine, ArrowLeft, ArrowRight, Check, ChevronDown, Eye, EyeOff, Heart, LayoutDashboard, Loader2, LogOut, Plus, Search, ShieldCheck, Trash2, Upload, UserPlus, Users, X } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { AgentApiError, agentRequest, agentToken, clearAgentToken, emptyDraft, type Agent, type ManagedUser, type UserDraft, type UsersResult } from './api';
import { CSV_FIELDS, downloadCsv, parseUsersCsv } from './csv';
import { prepareAgentPhoto } from './photo';
import { AgentUserDetails as UserDetails } from './AgentUserDetails';

export function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [data, setData] = useState<UsersResult | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [tab, setTab] = useState<'users' | 'create'>('users');
  const [selected, setSelected] = useState<ManagedUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [drafts, setDrafts] = useState<UserDraft[]>([emptyDraft()]);
  const [consent, setConsent] = useState(false);
  const [credentials, setCredentials] = useState<string[][]>([]);
  const csvInput = useRef<HTMLInputElement>(null);
  const photoUploadRef = useRef(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [photoErrors, setPhotoErrors] = useState<Record<number, string>>({});
  const photoBusy = photoIndex !== null;
  const fail = useCallback((err: unknown) => {
    if (err instanceof AgentApiError && err.status === 401) { clearAgentToken(); router.replace('/agent/login'); }
    else setError(err instanceof Error ? err.message : 'Unable to load workspace. Please try again.');
  }, [router]);
  useEffect(() => {
    if (!agentToken()) { router.replace('/agent/login'); return; }
    let active = true;
    agentRequest<{ agent: Agent }>('/me').then(result => { if (active) setAgent(result.agent); }).catch(err => { if (active) fail(err); });
    return () => { active = false; };
  }, [router, fail]);
  useEffect(() => {
    if (!agent) return;
    let active = true; setLoading(true);
    const timer = setTimeout(() => {
      agentRequest<UsersResult>(`/users?page=${page}&search=${encodeURIComponent(search)}`).then(result => { if (active) setData(result); }).catch(err => { if (active) fail(err); }).finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [agent, page, search, refresh, fail]);
  function update(index: number, field: keyof UserDraft, value: string | string[]) {
    setDrafts(current => current.map((draft, i) => i === index ? { ...draft, [field]: value } : draft));
  }
  async function importCsv(file?: File) {
    if (!file) return;
    setError(''); setMessage('');
    try {
      if (file.size > 1024 * 1024) throw new Error('Please choose a CSV smaller than 1 MB.');
      const imported = parseUsersCsv(await file.text());
      const blank = drafts.length === 1 && Object.entries(drafts[0]).every(([key, value]) => key === 'gender' || (Array.isArray(value) ? !value.length : !value));
      const combined = blank ? imported : [...drafts, ...imported];
      if (combined.length > 25) throw new Error('A batch can contain up to 25 users. Remove rows before importing more.');
      if (blank) setPhotoErrors({});
      setDrafts(combined); setTab('create'); setMessage(`${imported.length} rows imported. Review details before creating accounts.`);
    } catch (err) { fail(err); }
    finally { if (csvInput.current) csvInput.current.value = ''; }
  }
  function clearPhotoError(index: number) {
    setPhotoErrors(current => { const next = { ...current }; delete next[index]; return next; });
  }
  function removeDraft(index: number) {
    setDrafts(current => current.filter((_, i) => i !== index));
    setPhotoErrors(current => Object.fromEntries(Object.entries(current).filter(([key]) => Number(key) !== index).map(([key, value]) => [Number(key) > index ? Number(key) - 1 : Number(key), value])));
  }
  async function uploadPhoto(index: number, file?: File) {
    if (!file || photoUploadRef.current) return;
    photoUploadRef.current = true; setPhotoIndex(index); clearPhotoError(index);
    try {
      const photo = await prepareAgentPhoto(file);
      update(index, 'photos', [photo]);
    } catch (err) {
      setPhotoErrors(current => ({ ...current, [index]: err instanceof Error ? err.message : 'Unable to prepare this photo. Please try again.' }));
    } finally { photoUploadRef.current = false; setPhotoIndex(null); }
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    if (photoUploadRef.current) { setError('Please wait until your photo finishes preparing.'); return; }
    if (Object.keys(photoErrors).length) { setError('Please fix or dismiss the photo errors before creating accounts.'); return; }
    setBusy(true); setError(''); setMessage('');
    try {
      if (new Blob([JSON.stringify(drafts)]).size > 9_500_000) throw new Error('This batch contains too many large photos. Use smaller photos or create fewer accounts at a time.');
      const result = await agentRequest<{ message: string }>('/users/bulk', { users: drafts, consentConfirmed: consent });
      setCredentials(drafts.map(({ name, email, password }) => [name, email, password]));
      setMessage(result.message); setPhotoErrors({}); setDrafts([emptyDraft()]); setConsent(false); setTab('users'); setSearch(''); setPage(1); setRefresh(value => value + 1);
    } catch (err) { fail(err); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try { await agentRequest('/auth/logout', {}); clearAgentToken(); setCredentials([]); router.replace('/agent/login'); }
    catch (err) { fail(err); } finally { setBusy(false); }
  }
  async function showDetails(user: ManagedUser) {
    setError('');
    try { const result = await agentRequest<{ user: ManagedUser }>(`/users/${user.id}`); setSelected(result.user); }
    catch (err) { fail(err); }
  }
  if (!agent) return <main className="ag-loading">{error ? <div role="alert"><p>{error}</p><button className="ag-secondary" onClick={() => window.location.reload()}>Try again</button><Link href="/agent/login">Back to sign in</Link></div> : <><Loader2 className="animate-spin" />Opening your workspace…</>}</main>;
  return <div className="ag-dashboard">
    <aside className="ag-sidebar"><Link className="ag-brand" href="/"><BrandLogo className="h-10 w-10" /><span>Connect<span>Love</span></span></Link><span className="ag-eyebrow">AGENT WORKSPACE</span>
      <nav aria-label="Agent navigation"><button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><LayoutDashboard size={19} />My users<span>{data?.totalAccounts ?? '—'}</span></button><button className={tab === 'create' ? 'active' : ''} onClick={() => { setTab('create'); setError(''); }}><UserPlus size={19} />Create accounts</button></nav>
      <div className="ag-sidebar-note"><Heart size={23} /><h3>Every profile is a possibility.</h3><p>Help someone take their first step toward a meaningful connection.</p></div>
      <Link className="ag-back ag-site-link" href="/"><ArrowLeft size={16} /> Visit ConnectLove</Link>
      <div className="ag-agent"><span className="ag-avatar">{agent.name.slice(0, 1).toUpperCase()}</span><div><strong>{agent.name}</strong><small>{agent.email}</small></div><button aria-label="Sign out" title="Sign out" disabled={busy} onClick={logout}><LogOut size={18} /></button></div>
    </aside>
    <main className="ag-main"><header className="ag-topbar"><span>Workspace <span className="ag-muted">/ {tab === 'users' ? 'My users' : 'Create accounts'}</span></span><span className="ag-private"><ShieldCheck size={15} />Private workspace</span></header>
      <div className="ag-content"><div className="ag-page-heading"><div><span className="ag-eyebrow">YOUR CONNECTIONS, IN ONE PLACE</span><h1>{tab === 'users' ? `Hello, ${agent.name.split(' ')[0]}.` : 'A new beginning starts here.'}</h1><p className="ag-muted">{tab === 'users' ? 'Create accounts, keep track of profiles, and help people connect.' : 'Add one person or a whole batch. Give each user their own login.'}</p></div>{tab === 'users' && <button className="ag-primary" onClick={() => { setTab('create'); setError(''); }}><Plus size={18} /> Create accounts</button>}</div>
      {error && <div role="alert" className="ag-alert ag-error">{error}<button aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
      {message && <div role="status" className="ag-alert ag-success"><span>{message}</span><button aria-label="Dismiss message" onClick={() => setMessage('')}><X size={16} /></button></div>}
      {credentials.length > 0 && <section className="ag-credentials"><div><strong><Check size={18} /> Login details are ready</strong><p>Download and share each login privately with its user. Passwords are available only during this visit.</p></div><button className="ag-secondary" onClick={() => downloadCsv('connectlove-user-logins.csv', [['name', 'email', 'password'], ...credentials])}><ArrowDownToLine size={16} />Download logins</button><button aria-label="Clear login details" onClick={() => setCredentials([])}><X size={18} /></button></section>}
      <div className="ag-stats"><article><div><span>Total accounts</span><strong>{data?.totalAccounts ?? '—'}</strong><small>Created by you</small></div><span className="ag-stat-icon"><Users size={23} /></span></article><article><div><span>Active accounts</span><strong>{data?.activeAccounts ?? '—'}</strong><small>Available in Discover filters</small></div><span className="ag-stat-icon"><Heart size={23} /></span></article><article className="ag-stat-accent"><div><span>Better together</span><h3>One batch. More possibilities.</h3><small>Create up to 25 accounts at a time.</small></div><LayersIcon /></article></div>
      {tab === 'users' ? <section className="ag-panel"><div className="ag-panel-header"><div><h2>Your users <span className="ag-count">{data?.totalAccounts ?? 0}</span></h2><p className="ag-muted">Only accounts you created appear here.</p></div><label className="ag-search"><Search size={17} /><input aria-label="Search your users" placeholder="Search name, email or city" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label></div>
        {loading ? <div className="ag-empty" role="status"><Loader2 className="animate-spin" /><p>Loading your users…</p></div> : !data?.users.length ? <div className="ag-empty"><span className="ag-empty-icon"><Users size={30} /></span><h3>{search ? 'No matching users' : 'Your first connection starts here'}</h3><p>{search ? 'Try another name, email or city.' : 'Create your first user account or import a CSV to get started.'}</p>{!search && <button className="ag-primary" onClick={() => setTab('create')}><Plus size={17} />Add your first user</button>}</div> : <><div className="ag-table-wrap"><table><thead><tr><th>User</th><th>Location</th><th>Status</th><th>Joined</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{data.users.map(user => <tr key={user.id}><td><div className="ag-user-cell"><span className="ag-avatar">{user.name.charAt(0).toUpperCase()}</span><div><button className="ag-user-name" onClick={() => void showDetails(user)}><strong>{user.name}</strong></button><small>{user.email}</small></div></div></td><td>{user.city}<small className="ag-cell-small">{user.gender}</small></td><td><span className={`ag-status ${user.status === 'active' ? 'ag-status-active' : ''}`}>{user.status.replaceAll('_', ' ')}</span></td><td>{new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td><td><button className="ag-detail-btn" onClick={() => void showDetails(user)}>View details <ArrowRight size={14} /></button></td></tr>)}</tbody></table></div><div className="ag-pagination"><span>{data.total} {search ? 'matching' : ''} accounts · Page {page} of {data.pages}</span><div><button className="ag-secondary" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}><ArrowLeft size={15} />Previous</button><button className="ag-secondary" disabled={page >= data.pages || loading} onClick={() => setPage(value => value + 1)}>Next<ArrowRight size={15} /></button></div></div></>}
      </section> : <section className="ag-panel"><div className="ag-panel-header"><div><h2>Create user accounts</h2><p className="ag-muted">Review each profile before adding it to ConnectLove.</p></div><div className="ag-actions"><button className="ag-secondary" onClick={() => downloadCsv('connectlove-users-template.csv', [[...CSV_FIELDS], ['Example User', 'user@example.com', 'ReplaceWithStrongPassword', '1998-04-15', 'female', 'Mumbai', '', '', '']])}><ArrowDownToLine size={16} />CSV template</button><button className="ag-secondary" disabled={busy || photoBusy} onClick={() => csvInput.current?.click()}><Upload size={16} />Import CSV</button><input ref={csvInput} hidden type="file" accept=".csv,text/csv" onChange={event => void importCsv(event.target.files?.[0])} /></div></div>
        <form onSubmit={create} className="ag-create-form"><p className="ag-info">Users can sign in at the regular login page with their email and assigned password. Profiles appear in Discover according to age, gender, location and privacy filters. Users complete their remaining onboarding after signing in.</p>
          <fieldset disabled={busy || photoBusy} className="ag-batch-fields">{drafts.map((draft, index) => <section className="ag-draft" key={index}><div className="ag-draft-heading"><h3><span>{String(index + 1).padStart(2, '0')}</span>User profile</h3><button type="button" className="ag-remove" disabled={drafts.length === 1} aria-label={`Remove user ${index + 1}`} onClick={() => removeDraft(index)}><Trash2 size={16} />Remove</button></div>
            <div className="ag-field-grid"><label>Full name *<input required minLength={2} maxLength={150} placeholder="Full name" value={draft.name} onChange={event => update(index, 'name', event.target.value)} /></label><label>Email address *<input required type="email" maxLength={255} placeholder="user@gmail.com" value={draft.email} onChange={event => update(index, 'email', event.target.value)} /></label><TemporaryPasswordField value={draft.password} userNumber={index + 1} onChange={value => update(index, 'password', value)} /><label>Date of birth *<input required type="date" max={adultDate()} value={draft.birthDate} onChange={event => update(index, 'birthDate', event.target.value)} /></label><label>Gender *<div className="ag-select"><select value={draft.gender} onChange={event => update(index, 'gender', event.target.value)}><option value="female">Female</option><option value="male">Male</option><option value="non-binary">Non-binary</option><option value="prefer-not">Prefer not to say</option></select><ChevronDown size={16} /></div></label><label>City *<input required minLength={2} maxLength={150} placeholder="e.g. Mumbai" value={draft.city} onChange={event => update(index, 'city', event.target.value)} /></label><label>Phone <span className="ag-optional">optional</span><input type="tel" maxLength={30} placeholder="+91" value={draft.phone} onChange={event => update(index, 'phone', event.target.value)} /></label><label>Profession <span className="ag-optional">optional</span><input maxLength={150} placeholder="What do they do?" value={draft.profession} onChange={event => update(index, 'profession', event.target.value)} /></label><label className="ag-full-width">About them <span className="ag-optional">optional</span><textarea maxLength={500} rows={2} placeholder="A little about their interests and personality…" value={draft.bio} onChange={event => update(index, 'bio', event.target.value)} /></label></div>
            <div className="ag-photo-row">{draft.photos[0] && <img src={draft.photos[0]} alt={`Profile photo for ${draft.name || 'new user'}`} />}<label className="ag-upload"><Upload size={16} />{photoIndex === index ? 'Preparing photo...' : draft.photos.length ? 'Change photo' : 'Add profile photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void uploadPhoto(index, file); }} /></label><span className="ag-muted">JPG, PNG or WebP | up to 15 MB | resized automatically</span>{draft.photos.length > 0 && <button type="button" aria-label="Remove photo" onClick={() => { update(index, 'photos', []); clearPhotoError(index); }}><X size={16} /></button>}</div>{photoIndex === index && <p className="ag-photo-feedback" role="status">Preparing photo. Please wait before creating accounts.</p>}{photoErrors[index] && <div className="ag-photo-feedback ag-photo-error" role="alert">{photoErrors[index]}<button type="button" onClick={() => clearPhotoError(index)}>Continue without changing photo</button></div>}
          </section>)}</fieldset>
          <button type="button" className="ag-add-row" disabled={busy || photoBusy || drafts.length >= 25} onClick={() => setDrafts(current => [...current, emptyDraft()])}><Plus size={18} />Add another user<span>{drafts.length}/25</span></button>
          <label className="ag-consent"><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} /><span>I confirm that each user is 18 or older and has agreed to this account being created and their profile appearing on ConnectLove.</span></label>
          <div className="ag-submit-row"><p><ShieldCheck size={16} />Passwords are stored securely.</p><button className="ag-primary" disabled={busy || photoBusy || Object.keys(photoErrors).length > 0 || !consent}>{busy ? <><Loader2 size={18} className="animate-spin" />Creating accounts…</> : <><UserPlus size={18} />Create {drafts.length} {drafts.length === 1 ? 'account' : 'accounts'}</>}</button></div>
        </form>
      </section>}
      <footer className="ag-workspace-footer">ConnectLove Agent Workspace <span>Made for meaningful connections.</span></footer></div>
    </main>
    {selected && <UserDetails user={selected} onClose={() => setSelected(null)} onSaved={user => { setSelected(user); setRefresh(value => value + 1); }} onRemoved={() => { setSelected(null); setRefresh(value => value + 1); setMessage('User permanently deleted.'); }} />}
  </div>;
}
function TemporaryPasswordField({ value, onChange, userNumber }: { value: string; onChange: (value: string) => void; userNumber: number }) {
  const [visible, setVisible] = useState(false);
  const toggleLabel = `${visible ? 'Hide' : 'Show'} temporary password for user ${userNumber}`;
  return <label>Temporary password *<div className="ag-password">
    <input required type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} placeholder="At least 8 characters" value={value} onChange={event => onChange(event.target.value)} />
    <button type="button" aria-label={toggleLabel} title={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(current => !current)}>
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div></label>;
}
function adultDate() { const date = new Date(); date.setFullYear(date.getFullYear() - 18); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function LayersIcon() { return <div className="ag-stat-hearts"><Heart size={42} /><Heart size={26} /></div>; }
