
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react';

interface AuthProps {
  onTeacherLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onTeacherLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Capture the current URL (Origin) to help user configure Supabase
    setCurrentUrl(window.location.origin);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();

    // 1. Handle Hardcoded Admin Login (Local Check Only)
    if (cleanEmail === 'admin0126') {
      if (isLogin) {
        if (password === '951753') {
          // Simulate network delay for smooth UX
          setTimeout(() => {
            setLoading(false);
            onTeacherLogin();
          }, 800);
        } else {
          setLoading(false);
          setError('Invalid Admin credentials.');
        }
      } else {
        setLoading(false);
        setError('Admin ID cannot be used for student registration.');
      }
      return;
    }

    // 2. Handle Supabase Student Auth
    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
        // Successful login is handled by onAuthStateChange in App.tsx
      } else {
        // Register
        // CRITICAL: We tell Supabase to redirect back to THIS current URL
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin, 
            data: {
              role: 'student',
            },
          },
        });
        
        if (error) throw error;

        // Check if session was established (Email confirmation might be OFF)
        if (data.session) {
           // Auto-logged in
        } else if (data.user) {
           setSuccessMessage("Registration successful! Please check your email to confirm your account.");
           setIsLogin(true); 
           setEmail('');
           setPassword('');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 pb-20">
      <div className="w-full max-w-sm">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-primary">TradeQuest</span> <span className="text-slate-400 text-2xl">[Edu]</span>
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Welcome back, trader.' : 'Start your journey today.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-slate-700 rounded-3xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-slate-900 rounded-xl p-1 mb-6 border border-slate-800">
            <button
              onClick={() => { setIsLogin(true); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                isLogin ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); setSuccessMessage(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                !isLogin ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-3 items-start">
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-emerald-200 leading-relaxed">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type={isLogin ? "text" : "email"}
                  placeholder={isLogin ? "Email or Admin ID" : "Email Address"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-loss text-xs bg-loss/10 p-3 rounded-lg border border-loss/20">
                <AlertCircle size={14} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (isLogin ? 'Access Portal' : 'Create Account')}
            </button>
          </form>

          {!isLogin && !successMessage && (
            <p className="text-center text-xs text-slate-500 mt-4">
              All new accounts are registered as Students.
            </p>
          )}
        </div>

        {/* Configuration Helper for Cloud Environments */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-center">
             <div className="flex flex-col items-center gap-2">
                 <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Setup: Supabase Redirect URL</p>
                 <p className="text-xs text-slate-400">If email confirmation fails, add this URL to Supabase &gt; Authentication &gt; URL Configuration:</p>
                 <code className="block w-full bg-black/30 p-2 rounded text-[10px] text-blue-400 break-all font-mono select-all cursor-text">
                     {currentUrl}
                 </code>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;