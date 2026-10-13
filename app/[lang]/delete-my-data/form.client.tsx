'use client';

import { useState } from 'react';

type DeleteDict = {
  formTitle: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lastUpdated: string;
  intro: string;
  verifyTitle: string;
  verifyBody: string;
  scopeTitle: string;
  scopeBody: string;
  scopeNotTitle: string;
  scopeNotBody: string;
  formEmailLabel: string;
  formEmailHelp: string;
  formScopeLabel: string;
  formScopeAll: string;
  formScopeContact: string;
  formScopeAnalytics: string;
  formReasonLabel: string;
  formReasonHelp: string;
  formSubmit: string;
  formSubmitting: string;
  formSuccessTitle: string;
  formSuccessBody: string;
  formErrorPrefix: string;
  formErrorSuffix: string;
  formErrorEmail: string;
  manualTitle: string;
  manualBody: string;
};

type State = 'idle' | 'loading' | 'success' | 'error';

export function DeleteMyDataForm({
  locale,
  dict,
}: {
  locale: string;
  dict: DeleteDict;
}) {
  const [email, setEmail] = useState('');
  const [scope, setScope] = useState<'all' | 'contact' | 'analytics'>('all');
  const [reason, setReason] = useState('');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/delete-my-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scope, reason, lang: locale }),
      });
      const data = (await res.json().catch(() => ({})) as { ok?: boolean; error?: string });
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Server returned ${res.status}`);
      }
      setState('success');
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  if (state === 'success') {
    return (
      <div className="p-6 rounded-xl bg-theme-1/10 border border-theme-1">
        <p className="text-secondary font-medium text-lg mb-2">{dict.formSuccessTitle}</p>
        <p className="text-sm text-text">{dict.formSuccessBody.replace('{email}', email)}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl" noValidate>
      <div>
        <label htmlFor="demail" className="block text-sm font-medium mb-1">
          {dict.formEmailLabel}
        </label>
        <input
          id="demail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 min-h-[44px] text-base rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60"
        />
        <p className="mt-2 text-xs text-secondary/70">{dict.formEmailHelp}</p>
      </div>
      <fieldset>
        <legend className="block text-sm font-medium mb-2">{dict.formScopeLabel}</legend>
        <div className="space-y-2">
          {[
            { v: 'all' as const, l: dict.formScopeAll },
            { v: 'contact' as const, l: dict.formScopeContact },
            { v: 'analytics' as const, l: dict.formScopeAnalytics },
          ].map((opt) => (
            <label key={opt.v} className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="scope"
                value={opt.v}
                checked={scope === opt.v}
                onChange={() => setScope(opt.v)}
                disabled={state === 'loading'}
                className="mt-1"
              />
              <span className="text-sm text-secondary/90">{opt.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="dreason" className="block text-sm font-medium mb-1">
          {dict.formReasonLabel}
        </label>
        <textarea
          id="dreason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={state === 'loading'}
          className="w-full px-4 py-2 min-h-[80px] text-base rounded-md border border-theme-9 focus:border-theme-1 focus:outline-none focus:ring-1 focus:ring-theme-1 disabled:opacity-60 resize-y"
        />
        <p className="mt-2 text-xs text-secondary/70">{dict.formReasonHelp}</p>
      </div>
      {state === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-md bg-red-50 border border-red-300 text-sm text-red-800"
        >
          <strong>{dict.formErrorPrefix}</strong> {errorMsg}
          <br />
          <span className="text-xs text-red-700">{dict.formErrorSuffix}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        aria-busy={state === 'loading'}
        className="btn-theme disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === 'loading' ? dict.formSubmitting : dict.formSubmit}
      </button>
    </form>
  );
}