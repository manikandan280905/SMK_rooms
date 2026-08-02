'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { Logo } from '@/components/common/logo';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to backend server. Ensure backend is running on http://localhost:5000');
      } else {
        const msg = err.response?.data?.message || 'Invalid email or password';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@smkrooms.com');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size="lg" variant="light" subtitleText="Digital Arrival & Departure Register" />
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="mb-6 p-3 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900">
          <div>
            <span className="font-semibold block text-blue-950">Default Admin Credentials</span>
            <span className="text-blue-700">admin@smkrooms.com / admin123</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded text-xs transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Auto-fill</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-md bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smkrooms.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Register</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400">
            Authorized Personnel Only • Secure 256-bit Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
