import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Diamond, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { cn } from '../lib/utils.ts';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        login(data);
        navigate(redirect);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (e) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="text-on-surface flex min-h-screen items-center justify-center overflow-hidden p-6 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#132030] rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#1e2b3b] rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ rotate: 180, opacity: 0 }}
            animate={{ rotate: 45, opacity: 1 }}
            className="mb-4 text-primary"
          >
            <Diamond size={48} />
          </motion.div>
          <h1 className="font-headline italic text-4xl tracking-tighter text-primary">JaseerGems</h1>
          <p className="font-label uppercase text-[10px] tracking-[0.3em] text-on-surface-variant mt-2">Jaipur • Established 1978</p>
        </div>

        <div className="bg-surface-container-low p-10 rounded-xl border-t border-outline-variant/10 shadow-2xl shadow-[#020f1e]/40">
          <div className="flex items-center justify-center mb-10 gap-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "font-label uppercase text-xs tracking-[0.2em] transition-all duration-300 border-b-2 pb-2",
                isLogin ? "text-primary border-primary" : "text-on-surface-variant border-transparent"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "font-label uppercase text-xs tracking-[0.2em] transition-all duration-300 border-b-2 pb-2",
                !isLogin ? "text-primary border-primary" : "text-on-surface-variant border-transparent"
              )}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <label className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-1 block">Full Name</label>
                  <input 
                    name="name"
                    required
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-sm font-light text-on-surface focus:border-primary transition-colors outline-none" 
                    placeholder="Julian Vane" 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-1 block">Email Address</label>
              <input 
                name="email"
                type="email"
                required
                onChange={handleChange}
                className="w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-sm font-light text-on-surface focus:border-primary transition-colors outline-none" 
                placeholder="contact@jaseergems.com" 
              />
            </div>

            <div className="space-y-1 relative">
              <label className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-1 block">Password</label>
              <div className="relative">
                <input 
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-sm font-light text-on-surface focus:border-primary transition-colors outline-none pr-10" 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <label className="font-label uppercase text-[10px] tracking-[0.15em] text-on-surface-variant mb-1 block">Confirm Password</label>
                <input 
                  name="confirmPassword"
                  required
                  type="password"
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-outline-variant/40 py-3 px-1 text-sm font-light text-on-surface focus:border-primary transition-colors outline-none" 
                  placeholder="••••••••" 
                />
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error text-[10px] uppercase font-bold tracking-widest text-center">{error}</motion.p>
            )}

            <div className="pt-4 space-y-6">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-label font-bold uppercase text-xs tracking-[0.2em] py-4 rounded-lg hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-outline-variant/20"></div>
                <span className="flex-shrink mx-4 text-[10px] uppercase tracking-widest text-outline">Or</span>
                <div className="flex-grow border-t border-outline-variant/20"></div>
              </div>

              <button type="button" className="w-full flex items-center justify-center gap-3 border border-outline-variant/40 text-on-surface font-label uppercase text-[10px] tracking-[0.15em] py-4 rounded-lg hover:border-primary/40 hover:bg-surface-container transition-all active:scale-[0.98]">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M12 5.04c1.94 0 3.51.68 4.75 1.83l3.48-3.48C18.21 1.5 15.34 0 12 0 7.31 0 3.25 2.69 1.19 6.63l3.92 3.04C6.06 6.94 8.81 5.04 12 5.04z" fill="#EA4335"></path>
                  <path d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.02 3.66-5 3.66-8.73z" fill="#4285F4"></path>
                  <path d="M5.11 14.71c-.13-.4-.2-.82-.2-1.26s.07-.86.2-1.26L1.19 9.15C.43 10.63 0 12.27 0 14s.43 3.37 1.19 4.85l3.92-3.14z" fill="#FBBC05"></path>
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.76-2.91c-1.1.74-2.51 1.18-4.17 1.18-3.19 0-5.94-2.15-6.91-5.04l-3.92 3.14C3.25 21.31 7.31 24 12 24z" fill="#34A853"></path>
                </svg>
                Continue with Google
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center text-[10px] text-on-surface-variant-variant tracking-[0.1em] uppercase">
          Private Inventory • Appraisals • Jaipur Heritage
        </div>
      </div>
    </main>
  );
}
