import React, { useState } from 'react';
import { Lock, X, ShieldAlert, KeyRound, AlertTriangle, Terminal } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure fields are completely cleared whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(username.trim(), password.trim());
      onSuccess(res.token, res.user.username);
      setUsername('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication rejected. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-neutral-950 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-left overflow-hidden">
        {/* Glow Header Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Colorful Header */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span>Command Vault</span>
              <span className="text-[10px] rounded bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 border border-cyan-500/40">
                AUTH REQUIRED
              </span>
            </h3>
            <p className="text-xs font-mono text-cyan-400/70">
              CYBER CRIME PORTAL BY BAIDAR
            </p>
          </div>
        </div>

        {/* Security Warning */}
        <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs font-mono text-amber-200/90 leading-relaxed">
          <strong className="text-amber-400">RESTRICTED TERMINAL:</strong> Authorized incident officers only. All attempts are signed and logged with observed IP.
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-rose-300">Access Rejected:</span> {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300">
              Admin Identity / Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="Enter username or email"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-300">
              Master Passphrase
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              placeholder="••••••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg border border-cyan-400/50 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 py-2.5 text-xs font-bold font-mono uppercase tracking-wider text-white hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating Key Exchange...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-5 text-center text-[10px] font-mono text-neutral-500">
          PROTECTED BY BRUTE-FORCE RATE LOCKOUT &amp; WAF IP ENGINE
        </div>
      </div>
    </div>
  );
};
