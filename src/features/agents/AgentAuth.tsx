'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Heart, Layers3, Loader2, ShieldCheck, Users } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { agentRequest, agentToken, saveAgentToken, type Agent } from './api';
import { useAgentRegistration } from './AgentRegistrationProvider';

type Mode = 'login' | 'register' | 'verify' | 'reset';
export function AgentAuth({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { draft, setDraft } = useAgentRegistration();
  const [name, setName] = useState(() => mode === 'register' ? draft?.name || '' : '');
  const [email, setEmail] = useState(() => mode === 'register' ? draft?.email || '' : '');
  const [password, setPassword] = useState(() => mode === 'register' ? draft?.password || '' : '');
  const [sentEmail, setSentEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(() => mode === 'verify' && draft ? Math.max(0, Math.ceil((draft.sentAt + 60_000 - Date.now()) / 1000)) : 0);

  useEffect(() => { if (mode === 'login' && agentToken()) router.replace('/coordinator/dashboard'); }, [mode, router]);
  useEffect(() => {
    if (mode === 'verify' && !draft) router.replace('/coordinator/register?reason=restart');
    if (mode === 'register') {
      if (draft) { setName(draft.name); setEmail(draft.email); setPassword(draft.password); }
      else if (new URLSearchParams(window.location.search).get('reason') === 'restart') setMessage('Please enter your details again to continue email verification.');
    }
    if (mode === 'verify' && draft) setCooldown(Math.max(0, Math.ceil((draft.sentAt + 60_000 - Date.now()) / 1000)));
  }, [mode, draft, router]);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(value => value - 1), 1000); return () => clearTimeout(timer); }, [cooldown]);

  const resetHasCode = mode === 'reset' && sentEmail === email.trim().toLowerCase() && !!sentEmail;
  const title = { login: 'Welcome back.', register: 'Make more connections.', verify: 'Verify your email.', reset: 'Reset your password.' }[mode];
  const description = mode === 'login' ? 'Sign in to manage your users and create new accounts.'
    : mode === 'register' ? 'Enter your name, email and password. Next, verify your email with a code.'
    : mode === 'verify' ? `Enter the 6-digit code sent to ${draft?.email || 'your email'}.`
    : 'We will email you a code to reset your coordinator password.';

  async function sendCode() {
    if (busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const destination = mode === 'verify' ? draft?.email : email.trim().toLowerCase();
      if (!destination) return;
      const result = await agentRequest<{ message: string }>(mode === 'reset' ? '/auth/forgot-password' : '/auth/signup-otp', { email: destination });
      if (mode === 'verify' && draft) setDraft({ ...draft, sentAt: Date.now() });
      else setSentEmail(destination);
      setMessage(result.message); setCooldown(60);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send code.'); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (mode === 'reset' && !resetHasCode) { await sendCode(); return; }
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'register') {
        if (Array.from(name.trim()).length < 2) throw new Error('Enter your full name using at least 2 characters.');
        if (Array.from(password).length < 8) throw new Error('Password must contain at least 8 characters.');
        if (new TextEncoder().encode(password).length > 72) throw new Error('Use a password of up to 72 UTF-8 bytes. Shorten it if it contains emoji.');
        const submitted = { name: name.trim(), email: email.trim().toLowerCase(), password };
        const reusable = draft?.email === submitted.email && draft.sentAt + 600_000 > Date.now();
        if (!reusable) await agentRequest('/auth/signup-otp', { email: submitted.email });
        setDraft({ ...submitted, sentAt: reusable ? draft.sentAt : Date.now() });
        router.push('/coordinator/register/verify');
      } else if (mode === 'verify') {
        if (!draft) { router.replace('/coordinator/register?reason=restart'); return; }
        const result = await agentRequest<{ agent: Agent; token: string }>('/auth/register', { name: draft.name, email: draft.email, password: draft.password, otp: data.get('otp') });
        saveAgentToken(result.token); router.replace('/coordinator/dashboard');
      } else if (mode === 'reset') {
        const result = await agentRequest<{ message: string }>('/auth/reset-password', { email, password, otp: data.get('otp') });
        setMessage(result.message); setSentEmail(''); setPassword('');
      } else {
        const result = await agentRequest<{ agent: Agent; token: string }>('/auth/login', { email, password });
        saveAgentToken(result.token); router.replace('/coordinator/dashboard');
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue.'); }
    finally { setBusy(false); }
  }

  if (mode === 'verify' && !draft) return <main className="ag-loading" role="status"><Loader2 className="animate-spin" />Opening registration...</main>;
  return <main className="ag-auth">
    <section className="ag-story">
      <Link href="/" className="ag-back"><ArrowLeft size={16} /> Back to ConnectLove</Link>
      <div className="ag-story-content"><span className="ag-eyebrow">CONNECTLOVE &middot; COORDINATOR PARTNER</span><div className="ag-heart"><Heart size={48} fill="currentColor" /></div><h1>Great connections<br />start with you.</h1><p>A thoughtful workspace to help people take their first step toward something meaningful.</p>
        <div className="ag-benefit"><Users size={20} /><span>Create and organise user accounts</span></div><div className="ag-benefit"><Layers3 size={20} /><span>Add multiple profiles in one go</span></div><div className="ag-benefit"><ShieldCheck size={20} /><span>A private workspace, just for your users</span></div>
      </div><span className="ag-story-foot">A little help. A world of possibilities.</span>
    </section>
    <section className="ag-auth-main"><div className="ag-auth-card">
      <Link href="/" className="ag-brand"><BrandLogo className="h-11 w-11" /><span>Connect<span>Love</span></span></Link>
      <span className="ag-pill">Coordinator workspace{(mode === 'register' || mode === 'verify') && <> &middot; Step {mode === 'register' ? '1' : '2'} of 2</>}</span><h2>{title}</h2><p className="ag-muted">{description}</p>
      {error && <div className="ag-alert ag-error" role="alert">{error}</div>}{message && <div className="ag-alert ag-success" role="status">{message}</div>}
      <form onSubmit={submit} className="ag-form">
        {mode === 'register' && <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={150} value={name} onChange={event => setName(event.target.value)} disabled={busy} required /></label>}
        {mode !== 'verify' && <label>Email address<input type="email" name="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@gmail.com" maxLength={255} disabled={busy} required /></label>}
        {(mode === 'verify' || resetHasCode) && <label>Verification code<input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="6-digit code from your email" disabled={busy} required /></label>}
        {(mode === 'login' || mode === 'register' || resetHasCode) && <label>{mode === 'reset' ? 'New password' : 'Password'}<div className="ag-password"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} placeholder="At least 8 characters" value={password} onChange={event => setPassword(event.target.value)} disabled={busy} required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>}
        {mode === 'login' && <Link className="ag-forgot" href="/coordinator/forgot-password">Forgot password?</Link>}
        <button className="ag-primary" disabled={busy}>{busy ? <Loader2 size={18} className="animate-spin" /> : <>{mode === 'login' ? 'Sign in to workspace' : mode === 'register' ? 'Continue to verification' : mode === 'verify' ? 'Verify & create account' : resetHasCode ? 'Reset password' : 'Send verification code'}<ArrowRight size={18} /></>}</button>
        {(mode === 'verify' || resetHasCode) && <button type="button" className="ag-text-button" disabled={busy || cooldown > 0} onClick={() => void sendCode()}>{cooldown ? `Resend code in ${cooldown}s` : 'Resend verification code'}</button>}
        {mode === 'verify' && <Link href="/coordinator/register" className="ag-text-button"><ArrowLeft size={14} className="mr-1 inline" />Edit name, email or password</Link>}
      </form>
      <p className="ag-auth-switch">{mode === 'login' ? <>New here? <Link href="/coordinator/register">Create a coordinator account</Link></> : <>Already have an account? <Link href="/coordinator/login">Sign in</Link></>}</p>
      <p className="ag-secure"><ShieldCheck size={14} /> Your coordinator account is separate from your dating profile.</p>
    </div></section>
  </main>;
}
