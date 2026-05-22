import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Diamond, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { cn } from '../lib/utils.ts';

type Screen = 'login' | 'register' | 'register-otp' | 'forgot-email' | 'forgot-otp';

export default function Login() {
  const [screen, setScreen] = useState<Screen>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otpValue, setOtpValue] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const reset = () => { setError(''); setSuccessMsg(''); setOtpValue(''); };

  // ── LOGIN ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok) { login(data); navigate(redirect); }
      else setError(data.error || 'Invalid credentials');
    } catch { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  // ── REGISTER STEP 1 — Send OTP ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (formData.password !== formData.confirmPassword) { setError("Passwords don't match"); return; }
    if (formData.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) setScreen('register-otp');
      else setError(data.error || 'Failed to send OTP');
    } catch { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  // ── REGISTER STEP 2 — Verify OTP + Create Account ──
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, password: formData.password, otp: otpValue }),
      });
      const data = await res.json();
      if (res.ok) { login(data); navigate(redirect); }
      else setError(data.error || 'Invalid OTP');
    } catch { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  // ── FORGOT — Send OTP ──
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setScreen('forgot-otp'); // always move forward (don't reveal if email exists)
    } catch { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  // ── FORGOT — Verify OTP + Reset Password ──
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (newPassword !== confirmNewPassword) { setError("Passwords don't match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: otpValue, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Password reset successfully! Please log in.');
        setScreen('login');
        setOtpValue('');
      } else setError(data.error || 'Failed to reset password');
    } catch { setError('An error occurred'); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-sm font-light text-on-surface focus:border-primary transition-colors outline-none";
  const labelClass = "font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-1 block";

  return (
    <main className="text-on-surface flex min-h-screen items-center justify-center overflow-hidden p-6 relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#132030] rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#1e2b3b] rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="w-full max-w-lg z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <motion.div initial={{ rotate: 180, opacity: 0 }} animate={{ rotate: 45, opacity: 1 }} className="mb-4 text-primary">
            <Diamond size={48} />
          </motion.div>
          <h1 className="font-headline italic text-4xl tracking-tighter text-primary">JaseerGems</h1>
          <p className="font-label uppercase text-[10px] tracking-[0.3em] text-on-surface-variant mt-2">Jaipur • Established 1978</p>
        </div>

        <div className="bg-surface-container-low p-10 rounded-xl border-t border-outline-variant/10 shadow-2xl shadow-[#020f1e]/40">

          {/* ── LOGIN SCREEN ── */}
          <AnimatePresence mode="wait">
          {screen === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Tab switcher */}
              <div className="flex items-center justify-center mb-10 gap-8">
                <button className="font-label uppercase text-xs tracking-[0.2em] border-b-2 pb-2 text-primary border-primary">Login</button>
                <button onClick={() => { reset(); setScreen('register'); }} className="font-label uppercase text-xs tracking-[0.2em] border-b-2 pb-2 text-on-surface-variant border-transparent hover:text-primary transition-colors">Create Account</button>
              </div>
              {successMsg && <p className="text-success text-[10px] uppercase font-bold tracking-widest text-center mb-6">{successMsg}</p>}
              <form onSubmit={handleLogin} className="space-y-6">
                <div><label className={labelClass}>Email Address</label><input name="email" type="email" required onChange={handleChange} className={inputClass} placeholder="you@example.com" /></div>
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input name="password" required type={showPassword ? "text" : "password"} onChange={handleChange} className={cn(inputClass, "pr-10")} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-[10px] uppercase font-bold tracking-widest text-center">{error}</motion.p>}
                <div className="pt-2 space-y-4">
                  <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-label font-bold uppercase text-xs tracking-[0.2em] py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? 'Signing in...' : 'Login'}
                  </button>
                  <button type="button" onClick={() => { reset(); setScreen('forgot-email'); }} className="w-full text-center text-[10px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">
                    Forgot Password?
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── REGISTER SCREEN ── */}
          {screen === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-center mb-10 gap-8">
                <button onClick={() => { reset(); setScreen('login'); }} className="font-label uppercase text-xs tracking-[0.2em] border-b-2 pb-2 text-on-surface-variant border-transparent hover:text-primary transition-colors">Login</button>
                <button className="font-label uppercase text-xs tracking-[0.2em] border-b-2 pb-2 text-primary border-primary">Create Account</button>
              </div>
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div><label className={labelClass}>Full Name</label><input name="name" required onChange={handleChange} className={inputClass} placeholder="Your full name" /></div>
                <div><label className={labelClass}>Email Address</label><input name="email" type="email" required onChange={handleChange} className={inputClass} placeholder="you@example.com" /></div>
                <div><label className={labelClass}>Phone Number</label><input name="phone" type="tel" required onChange={handleChange} className={inputClass} placeholder="+1 234 567 8900" /></div>
                <div>
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input name="password" required type={showPassword ? "text" : "password"} onChange={handleChange} className={cn(inputClass, "pr-10")} placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div><label className={labelClass}>Confirm Password</label><input name="confirmPassword" required type="password" onChange={handleChange} className={inputClass} placeholder="••••••••" /></div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-[10px] uppercase font-bold tracking-widest text-center">{error}</motion.p>}
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-label font-bold uppercase text-xs tracking-[0.2em] py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── REGISTER OTP SCREEN ── */}
          {screen === 'register-otp' && (
            <motion.div key="register-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button onClick={() => { reset(); setScreen('register'); }} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-[10px] uppercase tracking-widest mb-8">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="font-headline italic text-2xl text-on-surface mb-2">Verify Your Email</h2>
              <p className="text-on-surface-variant text-xs mb-8">A 6-digit OTP was sent to <span className="text-primary">{formData.email}</span>. Check your inbox.</p>
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className={labelClass}>Enter OTP</label>
                  <input type="text" maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-3xl font-light text-center tracking-[0.6em] text-primary focus:border-primary transition-colors outline-none"
                    placeholder="000000" />
                </div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-[10px] uppercase font-bold tracking-widest text-center">{error}</motion.p>}
                <div className="pt-2 space-y-3">
                  <button type="submit" disabled={loading || otpValue.length < 6} className="w-full bg-primary text-on-primary font-label font-bold uppercase text-xs tracking-[0.2em] py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>
                  <button type="button" onClick={handleSendOtp} className="w-full text-center text-[10px] text-on-surface-variant hover:text-primary transition-colors uppercase tracking-widest">
                    Resend OTP
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD — EMAIL SCREEN ── */}
          {screen === 'forgot-email' && (
            <motion.div key="forgot-email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button onClick={() => { reset(); setScreen('login'); }} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-[10px] uppercase tracking-widest mb-8">
                <ArrowLeft size={14} /> Back to Login
              </button>
              <h2 className="font-headline italic text-2xl text-on-surface mb-2">Forgot Password</h2>
              <p className="text-on-surface-variant text-xs mb-8">Enter your registered email and we'll send you a reset OTP.</p>
              <form onSubmit={handleForgotSendOtp} className="space-y-6">
                <div><label className={labelClass}>Email Address</label><input type="email" required value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setError(''); }} className={inputClass} placeholder="you@example.com" /></div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-[10px] uppercase font-bold tracking-widest text-center">{error}</motion.p>}
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-label font-bold uppercase text-xs tracking-[0.2em] py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── FORGOT PASSWORD — OTP + NEW PASSWORD SCREEN ── */}
          {screen === 'forgot-otp' && (
            <motion.div key="forgot-otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <button onClick={() => { reset(); setScreen('forgot-email'); }} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-[10px] uppercase tracking-widest mb-8">
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="font-headline italic text-2xl text-on-surface mb-2">Reset Password</h2>
              <p className="text-on-surface-variant text-xs mb-8">Enter the OTP sent to <span className="text-primary">{forgotEmail}</span> and choose a new password.</p>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className={labelClass}>OTP Code</label>
                  <input type="text" maxLength={6} value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-3xl font-light text-center tracking-[0.6em] text-primary focus:border-primary transition-colors outline-none"
                    placeholder="000000" />
                </div>
                <div><label className={labelClass}>New Password</label><input type="password" required value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} className={inputClass} placeholder="Min. 8 characters" /></div>
                <div><label className={labelClass}>Confirm New Password</label><input type="password" required value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setError(''); }} className={inputClass} placeholder="••••••••" /></div>
                {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-[10px] uppercase font-bold tracking-widest text-center">{error}</motion.p>}
                <div className="pt-2">
                  <button type="submit" disabled={loading || otpValue.length < 6} className="w-full bg-primary text-on-primary font-label font-bold uppercase text-xs tracking-[0.2em] py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
          </AnimatePresence>

        </div>
        <div className="mt-12 text-center text-[10px] text-on-surface-variant tracking-[0.1em] uppercase">
          Private Inventory • Appraisals • Jaipur Heritage
        </div>
      </div>
    </main>
  );
}