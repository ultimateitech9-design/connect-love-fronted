'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Heart, Layers3, Loader2, ShieldCheck, Users } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { agentRequest, agentToken, saveAgentToken, type Agent } from './api';

export function AgentAuth({ mode }: { mode: 'login' | 'register' | 'reset' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => { if (mode === 'login' && agentToken()) router.replace('/agent/dashboard'); }, [mode, router]);
  useEffect(() => { if (!cooldown) return; const timer = setTimeout(() => setCooldown(value => value - 1), 1000); return () => clearTimeout(timer); }, [cooldown]);
  const title = mode === 'login' ? 'Welcome back.' : mode === 'register' ? 'Make more connections.' : 'Let’s get you back in.';
  async function sendCode() {
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await agentRequest<{ message: string }>(mode === 'reset' ? '/auth/forgot-password' : '/auth/signup-otp', { email });
      setSentEmail(email.trim().toLowerCase()); setMessage(result.message); setCooldown(60);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to send code.'); }
    finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (mode !== 'login' && sentEmail !== email.trim().toLowerCase()) { await sendCode(); return; }
    const data = new FormData(form);
    setBusy(true); setError(''); setMessage('');
    try {
      if (mode === 'reset') {
        const result = await agentRequest<{ message: string }>('/auth/reset-password', { email, password: data.get('password'), otp: data.get('otp') });
        setMessage(result.message); setSentEmail(''); form.reset();
      } else {
        const result = await agentRequest<{ agent: Agent; token: string }>(mode === 'login' ? '/auth/login' : '/auth/register', { email, password: data.get('password'), ...(mode === 'register' ? { name: data.get('name'), otp: data.get('otp') } : {}) });
        saveAgentToken(result.token); router.replace('/agent/dashboard');
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to continue.'); }
    finally { setBusy(false); }
  }
  const hasCode = mode !== 'login' && sentEmail === email.trim().toLowerCase() && !!sentEmail;
  return <main className="ag-auth">
    <section className="ag-story">
      <Link href="/" className="ag-back"><ArrowLeft size={16} /> Back to ConnectLove</Link>
      <div className="ag-story-content"><span className="ag-eyebrow">CONNECTLOVE · AGENT PARTNER</span><div className="ag-heart"><Heart size={48} fill="currentColor" /></div><h1>Great connections<br />start with you.</h1><p>A thoughtful workspace to help people take their first step toward something meaningful.</p>
        <div className="ag-benefit"><Users size={20} /><span>Create and organise user accounts</span></div><div className="ag-benefit"><Layers3 size={20} /><span>Add multiple profiles in one go</span></div><div className="ag-benefit"><ShieldCheck size={20} /><span>A private workspace, just for your users</span></div>
      </div><span className="ag-story-foot">A little help. A world of possibilities.</span>
    </section>
    <section className="ag-auth-main"><div className="ag-auth-card">
      <Link href="/" className="ag-brand"><BrandLogo className="h-11 w-11" /><span>Connect<span>Love</span></span></Link>
      <span className="ag-pill">Agent workspace</span><h2>{title}</h2><p className="ag-muted">{mode === 'login' ? 'Sign in to manage your users and create new accounts.' : mode === 'register' ? 'Create your agent account with your Gmail or email address.' : 'We’ll email you a code to reset your agent password.'}</p>
      {error && <div className="ag-alert ag-error" role="alert">{error}</div>}{message && <div className="ag-alert ag-success" role="status">{message}</div>}
      <form onSubmit={submit} className="ag-form">
        {mode === 'register' && <label>Full name<input name="name" autoComplete="name" placeholder="Your full name" minLength={2} maxLength={150} required /></label>}
        <label>Email address<input type="email" name="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@gmail.com" maxLength={255} required /></label>
        {hasCode && <label>Verification code<input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="6-digit code from your email" required /></label>}
        {(mode === 'login' || hasCode) && <label>{mode === 'reset' ? 'New password' : 'Password'}<div className="ag-password"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} placeholder="At least 8 characters" required /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>}
        {mode === 'login' && <Link className="ag-forgot" href="/agent/forgot-password">Forgot password?</Link>}
        <button className="ag-primary" disabled={busy}>{busy ? <Loader2 size={18} className="animate-spin" /> : <>{mode === 'login' ? 'Sign in to workspace' : hasCode ? mode === 'reset' ? 'Reset password' : 'Create agent account' : 'Send verification code'}<ArrowRight size={18} /></>}</button>
        {hasCode && <button type="button" className="ag-text-button" disabled={busy || cooldown > 0} onClick={sendCode}>{cooldown ? `Resend code in ${cooldown}s` : 'Resend verification code'}</button>}
      </form>
      <p className="ag-auth-switch">{mode === 'login' ? <>New here? <Link href="/agent/register">Create an agent account</Link></> : <>Already have an account? <Link href="/agent/login">Sign in</Link></>}</p>
      <p className="ag-secure"><ShieldCheck size={14} /> Your agent account is separate from your dating profile.</p>
    </div></section>
  </main>;
}
