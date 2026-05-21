'use client';

import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ShieldCheck, TrendingUp, Sparkles, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const LoginScreen: React.FC = () => {
  const { login } = useFinance();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        alert(`Google Login Error: ${error.message}`);
        setLoading(false);
      }
    } catch (err: any) {
      alert(`An error occurred: ${err.message || err}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-50/50 blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-50/50 blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo Icon */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 mb-4 animate-pulse-subtle">
          <Navigation className="w-6 h-6 rotate-45" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Antara Finance
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          A calm personal money companion.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 rounded-3xl sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Google Authentication
              </span>
              <h3 className="mt-2 text-lg font-medium text-slate-900">
                Welcome back
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Sign in securely to access your financial command center.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400">Security & Privacy</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-2xl text-center border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-slate-500">Bank-Grade</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-2xl text-center border border-slate-100">
                <TrendingUp className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-slate-500">Real-Time</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 rounded-2xl text-center border border-slate-100">
                <Sparkles className="w-5 h-5 text-blue-500 mb-1" />
                <span className="text-[10px] font-medium text-slate-500">Smart Score</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          By signing in, you agree to our friendly usage guidelines.
          <br />
          Data is saved safely on your local device.
        </p>
      </div>
    </div>
  );
};
