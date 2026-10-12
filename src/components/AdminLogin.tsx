import React, { useState } from 'react';
import { setAdminToken } from '../utils/adminAuth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onExit: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onExit }) => {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passcode.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to authenticate.');
        if (typeof data.attemptsLeft === 'number') {
          setAttemptsLeft(data.attemptsLeft);
        }
        setIsLoading(false);
        return;
      }

      // Save token in client storage for iframe & cross-origin reliability
      if (data.token) {
        setAdminToken(data.token);
      }

      setPasscode('');
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto px-4 py-8 animate-fade-in">
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-white border border-[#E8D2DB] shadow-md shadow-[#D44A74]/5">
        <div className="flex items-center justify-between mb-6">
          <div className="font-mono text-xs uppercase tracking-wider text-[#B83660] font-semibold">
            ADMINISTRATOR ACCESS
          </div>
          <button
            type="button"
            onClick={onExit}
            className="text-xs text-[#7E5868] hover:text-[#321622] font-mono transition-colors cursor-pointer"
          >
            ← Back to Quiz
          </button>
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#321622] mb-2">
          Admin Sign In
        </h2>
        <p className="text-xs text-[#7E5868] mb-6 leading-relaxed">
          Enter the administrator passcode to review Saltanat's saved responses.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-passcode"
                className="block text-xs font-mono text-[#7E5868] font-medium"
              >
                Passcode
              </label>
              <span className="text-[11px] font-mono text-[#B83660]/80">
                Default code: 3595
              </span>
            </div>
            <input
              id="admin-passcode"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              placeholder="••••"
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-center tracking-widest text-lg font-mono text-[#321622] bg-[#FFF8FA] border border-[#E8D2DB] focus:border-[#D44A74] focus:outline-none focus:ring-1 focus:ring-[#D44A74] transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-snug">
              {error}
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <div className="mt-1 font-mono text-[11px] text-red-600">
                  {attemptsLeft} attempt(s) remaining before temporary lockout.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !passcode.trim()}
            className="w-full min-h-[46px] rounded-xl bg-[#D44A74] hover:bg-[#B83660] active:scale-[0.98] text-white font-semibold text-sm shadow-sm shadow-[#D44A74]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#F3E2E9] text-center">
          <span className="text-[11px] font-mono text-[#A67E8E]">
            Server-verified authorization & rate limiting enabled
          </span>
        </div>
      </div>
    </div>
  );
};
