'use client';

import { useEffect, useMemo, useState } from 'react';

type BriefData = {
  // Step 1 — About you
  name: string;
  email: string;
  company: string;
  role: string;
  // Step 2 — Project type
  projectType: 'web' | 'automation' | 'ai-integration' | 'consulting' | 'other' | '';
  projectTypeOther: string;
  // Step 3 — Problem
  problem: string;
  tools: string[];
  toolsOther: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'one-off' | 'ad-hoc' | '';
  // Step 4 — Goal
  goal: string;
  successMetric: string;
  // Step 5 — Logistics
  budget: '<2k' | '2-5k' | '5-15k' | '15-50k' | '50k+' | '';
  timeline: 'asap' | '1-month' | '1-3-months' | '3+ months' | 'flexible' | '';
  additionalNotes: string;
};

const PROJECT_TYPE_OPTIONS: { value: NonNullable<BriefData['projectType']>; label: string; icon: string }[] = [
  { value: 'web', label: 'Web app / site', icon: '🌐' },
  { value: 'automation', label: 'Automation / workflow', icon: '⚙️' },
  { value: 'ai-integration', label: 'AI integration', icon: '🤖' },
  { value: 'consulting', label: 'Consulting / advisory', icon: '💡' },
  { value: 'other', label: 'Other', icon: '✦' },
];

const TOOLS_OPTIONS = [
  'CRM (HubSpot, Salesforce)',
  'Spreadsheets (Google Sheets, Excel)',
  'Email (Gmail, Outlook)',
  'Chat / WhatsApp',
  'Slack / Teams',
  'Notion / Airtable',
  'Zapier / Make',
  'Custom API',
];

const FREQUENCY_OPTIONS: { value: NonNullable<BriefData['frequency']>; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'one-off', label: 'One-off' },
  { value: 'ad-hoc', label: 'Ad-hoc (on demand)' },
];

const BUDGET_OPTIONS: { value: NonNullable<BriefData['budget']>; label: string }[] = [
  { value: '<2k', label: 'Under $2k' },
  { value: '2-5k', label: '$2k – $5k' },
  { value: '5-15k', label: '$5k – $15k' },
  { value: '15-50k', label: '$15k – $50k' },
  { value: '50k+', label: '$50k+' },
];

const TIMELINE_OPTIONS: { value: NonNullable<BriefData['timeline']>; label: string }[] = [
  { value: 'asap', label: 'ASAP' },
  { value: '1-month', label: 'Within 1 month' },
  { value: '1-3-months', label: '1 – 3 months' },
  { value: '3+ months', label: '3+ months' },
  { value: 'flexible', label: 'Flexible' },
];

const STEP_LABELS = ['About you', 'Project type', 'The problem', 'The goal', 'Logistics'];

const INITIAL: BriefData = {
  name: '',
  email: '',
  company: '',
  role: '',
  projectType: '',
  projectTypeOther: '',
  problem: '',
  tools: [],
  toolsOther: '',
  frequency: '',
  goal: '',
  successMetric: '',
  budget: '',
  timeline: '',
  additionalNotes: '',
};

const STORAGE_KEY = 'portfolio-brief-draft-v1';

function loadDraft(): BriefData {
  if (typeof window === 'undefined') return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<BriefData>;
    return { ...INITIAL, ...parsed };
  } catch {
    return INITIAL;
  }
}

function isStepValid(step: number, d: BriefData): boolean {
  switch (step) {
    case 0:
      return d.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim());
    case 1:
      if (!d.projectType) return false;
      if (d.projectType === 'other' && !d.projectTypeOther.trim()) return false;
      return true;
    case 2:
      if (d.problem.trim().length < 10) return false;
      if (!d.frequency) return false;
      return true;
    case 3:
      return d.goal.trim().length >= 10;
    case 4:
      return Boolean(d.budget) && Boolean(d.timeline);
    default:
      return false;
  }
}

export default function BriefWizard() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<BriefData>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setData(loadDraft());
    setHydrated(true);
  }, []);

  // Persist draft on every change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore quota / disabled storage
    }
  }, [data, hydrated]);

  function update<K extends keyof BriefData>(key: K, value: BriefData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleTool(tool: string) {
    setData((d) => ({
      ...d,
      tools: d.tools.includes(tool) ? d.tools.filter((t) => t !== tool) : [...d.tools, tool],
    }));
  }

  const stepValid = useMemo(() => isStepValid(step, data), [step, data]);
  const isLastStep = step === STEP_LABELS.length - 1;

  async function handleSubmit() {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (json && typeof json === 'object' && 'error' in json && typeof (json as { error: unknown }).error === 'string')
          ? (json as { error: string }).error
          : `Server returned ${res.status}`;
        setServerError(msg);
        setSubmitting(false);
        return;
      }
      // success — clear draft + redirect
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      setSubmitted(true);
      window.location.href = '/brief/thanks';
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Network error');
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!stepValid) return;
    if (isLastStep) {
      handleSubmit();
    } else {
      setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    }
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setData(INITIAL);
    setStep(0);
  }

  return (
    <div className="rounded-2xl bg-primary border border-theme-9 shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-4 border-b border-theme-9 bg-background">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="font-secondary uppercase tracking-wider text-theme-1">
            Step {step + 1} of {STEP_LABELS.length}
          </span>
          <span className="font-secondary uppercase tracking-wider text-text">
            {STEP_LABELS[step]}
          </span>
        </div>
        <div className="h-2 rounded-full bg-theme-9 overflow-hidden">
          <div
            className="h-full bg-theme-1 transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>
        <div className="hidden md:flex justify-between mt-3 text-xs text-text">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={`transition-colors ${
                i === step ? 'text-theme-1 font-medium' : i < step ? 'text-text hover:text-theme-1 cursor-pointer' : 'text-text/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 md:p-8">
        {step === 0 && (
          <Step1 data={data} update={update} />
        )}
        {step === 1 && (
          <Step2 data={data} update={update} />
        )}
        {step === 2 && (
          <Step3 data={data} update={update} toggleTool={toggleTool} />
        )}
        {step === 3 && (
          <Step4 data={data} update={update} />
        )}
        {step === 4 && (
          <Step5 data={data} update={update} />
        )}

        {serverError && (
          <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {serverError}
          </div>
        )}
      </div>

      {/* Footer / nav */}
      <div className="px-6 md:px-8 py-4 bg-background border-t border-theme-9 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text hover:text-theme-1 transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-2 text-xs text-text/70 hover:text-text underline"
              title="Reset all answers"
            >
              Start over
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DraftBadge hydrated={hydrated} filled={filledFieldCount(data)} />
          <button
            type="button"
            onClick={handleNext}
            disabled={!stepValid || submitting}
            className="px-6 py-2.5 rounded-lg bg-theme-1 text-white font-medium hover:bg-theme-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> Sending…
              </>
            ) : isLastStep ? (
              'Submit brief →'
            ) : (
              'Next →'
            )}
          </button>
        </div>
      </div>

      {submitted && (
        <div className="px-6 py-4 bg-green-50 text-green-700 text-sm text-center">
          Brief sent! Redirecting…
        </div>
      )}
    </div>
  );
}

function filledFieldCount(d: BriefData): number {
  let n = 0;
  for (const v of Object.values(d)) {
    if (Array.isArray(v) ? v.length > 0 : Boolean(v)) n++;
  }
  return n;
}

function DraftBadge({ hydrated, filled }: { hydrated: boolean; filled: number }) {
  if (!hydrated || filled === 0) return null;
  return (
    <span className="hidden sm:inline text-xs text-text/60" title="Your progress is auto-saved in this browser">
      💾 Draft saved · {filled} answers
    </span>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
  );
}

// ── Step components ─────────────────────────────────────────────────────

function Step1({ data, update }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void }) {
  const emailShape = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">Tell me about you</h2>
      <Field label="Your name" required>
        <input
          type="text"
          required
          autoFocus
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Jane Smith"
          className="input"
        />
      </Field>
      <Field label="Email" required error={!emailShape ? 'Enter a valid email' : null}>
        <input
          type="email"
          required
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="jane@company.com"
          className="input"
        />
      </Field>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Company">
          <input
            type="text"
            value={data.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Acme Inc."
            className="input"
          />
        </Field>
        <Field label="Your role">
          <input
            type="text"
            value={data.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder="Founder, Head of Ops, etc."
            className="input"
          />
        </Field>
      </div>
    </div>
  );
}

function Step2({ data, update }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">What kind of project?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROJECT_TYPE_OPTIONS.map((opt) => {
          const selected = data.projectType === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('projectType', opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-theme-1 bg-theme-1/5 shadow-sm'
                  : 'border-theme-9 hover:border-theme-1/40 bg-primary'
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="font-medium text-secondary">{opt.label}</div>
            </button>
          );
        })}
      </div>
      {data.projectType === 'other' && (
        <Field label="Tell me more" required>
          <input
            type="text"
            value={data.projectTypeOther}
            onChange={(e) => update('projectTypeOther', e.target.value)}
            placeholder="What's the project?"
            className="input"
          />
        </Field>
      )}
    </div>
  );
}

function Step3({ data, update, toggleTool }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void; toggleTool: (t: string) => void }) {
  const tooShort = data.problem.length > 0 && data.problem.trim().length < 10;
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">The problem you're trying to solve</h2>
      <Field label="Describe the manual process or pain point" required error={tooShort ? 'At least a sentence or two — the more detail, the better' : null}>
        <textarea
          required
          rows={5}
          value={data.problem}
          onChange={(e) => update('problem', e.target.value)}
          placeholder="e.g. We manually copy data from 3 spreadsheets into HubSpot every Monday. It takes ~3 hours and someone always forgets a row."
          className="input resize-y min-h-[120px]"
        />
      </Field>

      <Field label="What tools does it touch today? (select all that apply)">
        <div className="flex flex-wrap gap-2">
          {TOOLS_OPTIONS.map((tool) => {
            const selected = data.tools.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selected
                    ? 'border-theme-1 bg-theme-1 text-white'
                    : 'border-theme-9 text-text hover:border-theme-1/40'
                }`}
              >
                {tool}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Other tools (optional)">
        <input
          type="text"
          value={data.toolsOther}
          onChange={(e) => update('toolsOther', e.target.value)}
          placeholder="Anything else?"
          className="input"
        />
      </Field>

      <Field label="How often does this happen?" required>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FREQUENCY_OPTIONS.map((f) => {
            const selected = data.frequency === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => update('frequency', f.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-theme-1 bg-theme-1 text-white'
                    : 'border-theme-9 text-text hover:border-theme-1/40'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </Field>
    </div>
  );
}

function Step4({ data, update }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void }) {
  const tooShort = data.goal.length > 0 && data.goal.trim().length < 10;
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">What does success look like?</h2>
      <Field label="The goal / outcome you want" required error={tooShort ? 'A bit more — at least a sentence' : null}>
        <textarea
          required
          rows={5}
          value={data.goal}
          onChange={(e) => update('goal', e.target.value)}
          placeholder="e.g. The weekly data sync happens automatically and takes less than 10 minutes for a human to review. We've freed up 3 hours / week."
          className="input resize-y min-h-[120px]"
        />
      </Field>
      <Field label="How will you measure success? (optional)">
        <input
          type="text"
          value={data.successMetric}
          onChange={(e) => update('successMetric', e.target.value)}
          placeholder="e.g. 90% reduction in time, 0 errors / month, etc."
          className="input"
        />
      </Field>
    </div>
  );
}

function Step5({ data, update }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">Logistics</h2>
      <Field label="Budget range" required>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BUDGET_OPTIONS.map((b) => {
            const selected = data.budget === b.value;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => update('budget', b.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-theme-1 bg-theme-1 text-white'
                    : 'border-theme-9 text-text hover:border-theme-1/40'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Timeline" required>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TIMELINE_OPTIONS.map((t) => {
            const selected = data.timeline === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => update('timeline', t.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-theme-1 bg-theme-1 text-white'
                    : 'border-theme-9 text-text hover:border-theme-1/40'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Anything else I should know? (optional)">
        <textarea
          rows={4}
          value={data.additionalNotes}
          onChange={(e) => update('additionalNotes', e.target.value)}
          placeholder="Constraints, deadlines, links to relevant docs…"
          className="input resize-y"
        />
      </Field>

      <Summary data={data} />
    </div>
  );
}

function Summary({ data }: { data: BriefData }) {
  return (
    <details className="mt-6 rounded-lg bg-background border border-theme-9 p-4">
      <summary className="cursor-pointer text-sm font-medium text-text hover:text-theme-1">
        Review your answers before submitting ↓
      </summary>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row k="Name" v={data.name} />
        <Row k="Email" v={data.email} />
        {data.company && <Row k="Company" v={data.company} />}
        {data.role && <Row k="Role" v={data.role} />}
        <Row k="Project" v={data.projectType === 'other' ? `Other — ${data.projectTypeOther}` : (data.projectType || '—')} />
        <Row k="Problem" v={data.problem} />
        <Row k="Tools" v={[...data.tools, data.toolsOther].filter(Boolean).join(', ') || '—'} />
        <Row k="Frequency" v={data.frequency} />
        <Row k="Goal" v={data.goal} />
        {data.successMetric && <Row k="Success metric" v={data.successMetric} />}
        <Row k="Budget" v={data.budget} />
        <Row k="Timeline" v={data.timeline} />
        {data.additionalNotes && <Row k="Notes" v={data.additionalNotes} />}
      </dl>
    </details>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium text-text min-w-[100px]">{k}:</dt>
      <dd className="text-secondary whitespace-pre-wrap break-words">{v}</dd>
    </div>
  );
}

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-secondary mb-1.5">
        {label} {required && <span className="text-theme-1">*</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}
