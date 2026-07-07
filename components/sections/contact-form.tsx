'use client';

import { useState } from 'react';

// Form section — currently posts to mailto. Hook to Formspree/Resend when ready.
export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:andresmortal1@gmail.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="p-6 rounded-xl bg-theme-1/10 border border-theme-1 text-center">
        <p className="text-theme-1 font-medium">Opening your email client…</p>
        <p className="text-sm text-text mt-2">
          If nothing happened, write directly to andresmortal1@gmail.com
        </p>
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
          className="w-full px-4 py-2 rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1"
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
          className="w-full px-4 py-2 rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1"
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
          className="w-full px-4 py-2 rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1"
        />
      </div>
      <button type="submit" className="btn-theme">
        Send message
      </button>
    </form>
  );
}
