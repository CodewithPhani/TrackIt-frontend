import { useState, type FormEvent } from 'react';
import {
  ArrowRight,
  BusFront,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MapPinned,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import './AuthPage.css';
import { apiService, type AuthResult } from '../services/api';

type AuthMode = 'login' | 'signup';
export type UserRole = 'student' | 'driver' | 'admin';

type AuthPageProps = {
  onAuthenticated: (auth: AuthResult) => void;
};

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (mode === 'signup' && name.trim().length < 2) { setError('Please enter your full name.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Your password must contain at least 8 characters.'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError('The passwords do not match.'); return; }
    if (mode === 'signup' && role !== 'student') { setError('Driver and Admin accounts are created by the transport administrator.'); return; }
    setBusy(true);
    try {
      const result = mode === 'signup'
        ? await apiService.signup(name.trim(), email.trim(), password, busNumber.trim())
        : await apiService.login(email.trim(), password, role);
      onAuthenticated(result);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="SkyLine Transit overview">
        <div className="auth-visual-glow auth-visual-glow-one" />
        <div className="auth-visual-glow auth-visual-glow-two" />
        <div className="auth-brand">
          <span className="auth-brand-icon"><BusFront size={24} strokeWidth={2.3} /></span>
          <span>SkyLine <strong>Transit</strong></span>
        </div>

        <div className="auth-visual-content">
          <span className="auth-eyebrow"><span className="auth-live-dot" /> SMARTER CITY TRAVEL</span>
          <h1>Your journey.<br /><span>In real time.</span></h1>
          <p>Track buses, find nearby stops, and make every commute a little easier.</p>
          <div className="auth-feature-list">
            <div className="auth-feature"><span><MapPinned size={18} /></span><div><b>Live bus tracking</b><small>See buses move on the map</small></div></div>
            <div className="auth-feature"><span><CheckCircle2 size={18} /></span><div><b>Smarter journeys</b><small>Plan around routes and stops</small></div></div>
            <div className="auth-feature"><span><ShieldCheck size={18} /></span><div><b>One simple dashboard</b><small>Everything for your commute</small></div></div>
          </div>
        </div>
        <div className="auth-visual-footer"><span>MOVE WITH CONFIDENCE</span><span>01 — 03</span></div>
        <div className="auth-route-art" aria-hidden="true">
          <div className="auth-route-line" />
          <span className="auth-route-stop auth-route-stop-a" />
          <span className="auth-route-stop auth-route-stop-b" />
          <span className="auth-route-stop auth-route-stop-c" />
          <span className="auth-route-bus"><BusFront size={20} /></span>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><span className="auth-brand-icon"><BusFront size={22} /></span> SkyLine <strong>Transit</strong></div>
          <div className="auth-form-heading">
            <span className="auth-kicker">WELCOME {mode === 'login' ? 'BACK' : 'ABOARD'}</span>
            <h2>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>
            <p>{mode === 'login' ? `Sign in to your ${role} account to open the correct dashboard.` : 'Create a student account to follow your college bus.'}</p>
          </div>

          <div className="auth-role-picker" aria-label="Choose account type">
            <p className="auth-role-label">SIGN IN AS</p>
            <div className="auth-role-options">
              {(['student', 'driver', 'admin'] as UserRole[]).map((item) => (
                <button key={item} type="button" className={`auth-role-option ${role === item ? 'active' : ''}`} onClick={() => { setRole(item); setError(''); if (item !== 'student' && mode === 'signup') setMode('login'); }} aria-pressed={role === item}>
                  {item === 'student' ? <UserRound size={17} /> : item === 'driver' ? <BusFront size={17} /> : <ShieldCheck size={17} />}
                  <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="auth-mode-switch" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
            {role === 'student' && <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>}
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <label className="auth-field">
                <span>Full name</span>
                <div className="auth-input-wrap"><UserRound size={18} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your full name" required /></div>
              </label>
            )}
            <label className="auth-field">
              <span>Email address</span>
              <div className="auth-input-wrap"><Mail size={18} /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
            </label>
            <label className="auth-field">
              <span>Password</span>
              <div className="auth-input-wrap"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required minLength={8} /><button className="auth-eye-button" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </label>
            {mode === 'signup' && (
              <label className="auth-field">
                <span>Bus number (optional)</span>
                <div className="auth-input-wrap"><BusFront size={18} /><input value={busNumber} onChange={(event) => setBusNumber(event.target.value.toUpperCase())} placeholder="Example: B001" /></div>
              </label>
            )}
            {mode === 'signup' && (
              <label className="auth-field">
                <span>Confirm password</span>
                <div className="auth-input-wrap"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Re-enter your password" required /></div>
              </label>
            )}
            {mode === 'login' && <div className="auth-form-meta"><label className="auth-remember"><input type="checkbox" /> <span>Remember me</span></label><span className="auth-help-text">Secure access</span></div>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={18} /></button>
          </form>

          <p className="auth-switch-copy">{mode === 'login' ? 'New to SkyLine Transit?' : 'Already have an account?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <div className="auth-security-note"><ShieldCheck size={15} /><span>Designed for a safer, simpler commute</span></div>
          <div className="auth-demo-note"><small>Student accounts are registered here. Driver and Admin accounts are issued by the transport administrator.</small></div>
        </div>
      </section>
    </main>
  );
}
