'use client';

// Login form for the admin panel. Posts to /api/admin/login and follows the
// Set-Cookie response by redirecting to `next` on success.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  next: string;
}

export function LoginForm({ next }: Props) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      // Cookie was set by the response — push to the intended destination.
      router.push(next);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="block text-sm font-medium text-secondary mb-1">Username</span>
        <input
          type="text"
          required
          autoFocus
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input w-full"
          placeholder="admin"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-medium text-secondary mb-1">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input w-full"
          placeholder="••••••••"
        />
      </label>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn-theme w-full disabled:opacity-50"
      >
        {submitting ? 'Signing in…' : 'Sign in →'}
      </button>
    </form>
  );
}