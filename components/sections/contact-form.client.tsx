'use client';

import * as React from 'react';
import { useState } from 'react';
import { track } from '@/lib/analytics';

type FormDict = {
  honeypotLabel: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  successRetry: string;
  errorPrefix: string;
  errorFallback: string;
  errorSuffix: string;
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function ContactFormClient({
  dict,
  lang,
  // Server-rendered form labels (from the parent server component).
  nameLabel,
  emailLabel,
  messageLabel,
  messagePlaceholder,
  messageHelp,
}: {
  dict: FormDict;
  // Locale the form was rendered in. Sent to the API so the
  // notification + auto-reply emails match the user's language.
  lang: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageHelp: string;
}) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [mountedAt, setMountedAt] = useState(0);

  React.useEffect(() => {
    setMountedAt(Date.now());
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `lang` tells the API route which dictionary to use for the
        // email templates (notification + auto-reply). Defaults to the
        // locale the form was rendered in.
        body: JSON.stringify({ ...form, _t: Date.now() - mountedAt, lang }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        track('contact_submit_error', { status: res.status, message: data.error });
        throw new Error(data.error || `Server returned ${res.status}`);
      }

      const data = (await res.json()) as { ok?: boolean; emailSent?: boolean };
      if (!data.ok) {
        track('contact_submit_error', { status: res.status, message: 'rejected' });
        throw new Error('Server rejected the request');
      }

      setState('success');
      track('contact_form_submitted', { emailSent: data.emailSent === true });
      setForm({ name: '', email: '', message: '', website: '' });
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (state === 'success') {
    return (
      <div className="p-6 rounded-xl bg-theme-1/10 border border-theme-1">
        <p className="text-secondary font-medium text-lg mb-2">{dict.successTitle}</p>
        <p className="text-sm text-text">{dict.successBody}</p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="mt-4 text-sm text-secondary hover:text-accent hover:underline"
        >
          {dict.successRetry}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl"
      noValidate
      data-webmcp-form-id="contact"
      data-webmcp-name="Contact form"
      data-webmcp-description="Send a short message to Andrés. Requires name, email, and message."
    >
      {/* WebMCP annotation: lets AI agents (Chrome 146+ with WebMCP flag, or
          any browser with the upcoming WebMCP polyfill) identify and fill
          this form reliably. JSON-LD with JSON Schema draft 2020-12 for
          input_schema. Invisible to browsers without WebMCP — it's a
          script type they don't render. See
          https://github.com/webmachinelearning/webmcp */}
      <script
        type="application/webmcp-form+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            name: 'contact',
            description:
              'Send a message to Andrés Morales. Reply within 48 business hours.',
            input_schema: {
              type: 'object',
              required: ['name', 'email', 'message'],
              properties: {
                name: { type: 'string', minLength: 1, maxLength: 100 },
                email: { type: 'string', format: 'email' },
                message: { type: 'string', minLength: 10, maxLength: 5000 },
              },
            },
          }),
        }}
      />
      <div style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="website">{dict.honeypotLabel}</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">{nameLabel}</label>
        <input
          id="name"
          type="text"
          name="name"
          autoComplete="name"
          required
          data-webmcp-field-name="name"
          data-webmcp-field-type="string"
          data-webmcp-field-required="true"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 min-h-[44px] text-base rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">{emailLabel}</label>
        <input
          id="email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          data-webmcp-field-name="email"
          data-webmcp-field-type="string"
          data-webmcp-field-format="email"
          data-webmcp-field-required="true"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 min-h-[44px] text-base rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">{messageLabel}</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder={messagePlaceholder}
          data-webmcp-field-name="message"
          data-webmcp-field-type="string"
          data-webmcp-field-required="true"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 min-h-[120px] text-base rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60 resize-y"
        />
        <p className="mt-2 text-xs text-secondary/70">{messageHelp}</p>
      </div>

      {state === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-md bg-red-50 border border-red-300 text-sm text-red-800"
        >
          <strong>{dict.errorPrefix}</strong> {errorMsg}
          <br />
          <span className="text-xs text-red-700">
            {dict.errorFallback}{' '}
            <a href="mailto:info@andresmorales.com.co" className="underline hover:no-underline">
              info@andresmorales.com.co
            </a>{' '}
            {dict.errorSuffix}
          </span>
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        aria-busy={state === 'loading'}
        className="btn-theme disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
      >
        {state === 'loading' && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {state === 'loading' ? dict.submitting : dict.submit}
      </button>
    </form>
  );
}
