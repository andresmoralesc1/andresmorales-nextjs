'use client';

import { useState } from 'react';

// Contact form — POSTs JSON to /api/contact which sends via Brevo.
// Visual states: idle | loading | success | error.
type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || `Server returned ${res.status}`);
      }

      const data = (await res.json()) as { ok?: boolean; emailSent?: boolean };
      if (!data.ok) {
        throw new Error('Server rejected the request');
      }

      setState('success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (state === 'success') {
    return (
      <div className="p-6 rounded-xl bg-theme-1/10 border border-theme-1">
        <p className="text-theme-1 font-medium text-lg mb-2">
          ✓ Message sent
        </p>
        <p className="text-sm text-text">
          Thanks for reaching out. I usually reply within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 text-sm text-theme-1 hover:underline"
        >
          Send another message →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60"
        />
      </div>

      {state === 'error' && (
        <div className="p-3 rounded-md bg-red-50 border border-red-300 text-sm text-red-800">
          <strong>Couldn&apos;t send:</strong> {errorMsg}
          <br />
          <span className="text-xs text-red-700">
            Fall back to emailing{' '}
            <a
              href="mailto:info@andresmorales.com.co"
              className="underline hover:no-underline"
            >
              info@andresmorales.com.co
            </a>{' '}
            directly.
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="btn-theme disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
