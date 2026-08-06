'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';

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

// "Other" used to be ✦ — a stray Unicode glyph that didn't match the rest
// of the emoji row. Replaced with 🔧 so the visual rhythm is consistent.
const PROJECT_TYPE_OPTIONS: { value: NonNullable<BriefData['projectType']>; label: string; icon: string }[] = [
  { value: 'web', label: 'Web app / site', icon: '🌐' },
  { value: 'automation', label: 'Automation / workflow', icon: '⚙️' },
  { value: 'ai-integration', label: 'AI integration', icon: '🤖' },
  { value: 'consulting', label: 'Consulting / advisory', icon: '💡' },
  { value: 'other', label: 'Other', icon: '🔧' },
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
// TTL: 30 days. A draft older than this is treated as empty so stale
// half-filled forms from months ago don't haunt the wizard.
const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type DraftEnvelope = { savedAt: number; data: Partial<BriefData> };

function loadDraft(): BriefData {
  if (typeof window === 'undefined') return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as DraftEnvelope | Partial<BriefData>;
    // Backward compat: pre-TTL drafts were plain objects. Accept either.
    const isEnvelope = parsed && typeof parsed === 'object' && 'savedAt' in parsed && 'data' in parsed;
    const data = isEnvelope ? (parsed as DraftEnvelope).data : (parsed as Partial<BriefData>);
    const savedAt = isEnvelope ? (parsed as DraftEnvelope).savedAt : Date.now();
    if (Date.now() - savedAt > DRAFT_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return INITIAL;
    }
    return { ...INITIAL, ...data };
  } catch {
    return INITIAL;
  }
}

function saveDraft(d: BriefData) {
  try {
    const envelope: DraftEnvelope = { savedAt: Date.now(), data: d };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // ignore quota / disabled storage
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
  const router = useRouter();
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
    saveDraft(data);
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
  const filled = filledFieldCount(data);

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
        const msg =
          json && typeof json === 'object' && 'error' in json && typeof (json as { error: unknown }).error === 'string'
            ? (json as { error: string }).error
            : `Server returned ${res.status}`;
        track('brief_submit_error', { status: res.status, message: msg });
        setServerError(msg);
        setSubmitting(false);
        return;
      }
      // success — clear draft + SPA-navigate via router.push (no full reload)
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      track('brief_submitted', {
        project_type: data.projectType,
        budget: data.budget,
        timeline: data.timeline,
      });
      setSubmitted(true);
      router.push('/brief/thanks');
    } catch (err) {
      track('brief_submit_error', {
        message: err instanceof Error ? err.message : 'Network error',
      });
      setServerError(err instanceof Error ? err.message : 'Network error');
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (!stepValid) return;
    const fromStep = step;
    if (isLastStep) {
      handleSubmit();
    } else {
      track('brief_step_advanced', {
        from_step: fromStep + 1,
        from_label: STEP_LABELS[fromStep],
      });
      if (fromStep === 0) {
        track('brief_started', { project_type_selected: false });
      }
      setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    }
  }

  function handleBack() {
    if (step === 0) return;
    track('brief_step_back', {
      from_step: step + 1,
      from_label: STEP_LABELS[step],
    });
    setStep((s) => Math.max(s - 1, 0));
  }

  function clearDraft() {
    // Confirm before destroying the user's saved progress. Without this a
    // misclick wipes 5 minutes of work + the auto-saved draft. Browser's
    // native confirm is fine — no need for a custom modal here.
    if (typeof window !== 'undefined' && !window.confirm('Reset all answers? Your saved progress will be cleared.')) {
      return;
    }
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    track('brief_draft_cleared');
    setData(INITIAL);
    setStep(0);
  }

  return (
    <div className="rounded-2xl bg-primary border border-theme-9 shadow-sm overflow-hidden">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-4 border-b border-theme-9 bg-background">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="font-secondary uppercase tracking-wider text-secondary">
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
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_LABELS.length}
          />
        </div>
        <div className="hidden md:flex justify-between mt-3 text-xs text-text">
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-label={i < step ? `Go back to step ${i + 1}: ${label}` : i === step ? `Current step: ${label}` : `Step ${i + 1}: ${label} (locked)`}
              className={`transition-colors ${
                i === step
                  ? 'text-secondary font-medium'
                  : i < step
                    ? 'text-text hover:text-accent cursor-pointer'
                    : 'text-text/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6 md:p-8">
        {step === 0 && <Step1 data={data} update={update} />}
        {step === 1 && <Step2 data={data} update={update} />}
        {step === 2 && <Step3 data={data} update={update} toggleTool={toggleTool} />}
        {step === 3 && <Step4 data={data} update={update} />}
        {step === 4 && <Step5 data={data} update={update} />}

        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            {serverError}
          </div>
        )}

        {/* Escape hatch — visible on steps 1 and 2 where users are most
            likely to bounce from form fatigue. Sends them to a 30-min call
            instead, preserving the lead even if the brief is too much. */}
        {(step === 0 || step === 1) && (
          <div className="mt-6 pt-5 border-t border-theme-9 text-center">
            <p className="text-xs text-secondary/70">
              Rather talk it through?{' '}
              <a
                href="https://calendar.app.google/NHF1ScCWjh4WJaey6"
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:underline font-medium"
              >
                Book a free 30-min call instead →
              </a>
            </p>
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
              className="px-4 py-2 rounded-lg text-sm font-medium text-secondary hover:text-accent transition-colors disabled:opacity-50"
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
          {/* Show badge once hydrated + at least one field filled. Was
              previously gated on sm: breakpoint AND filled === 0, which
              left mobile users without any visual confirmation that their
              progress was saved. */}
          {hydrated && filled > 0 && (
            <span
              className="text-xs text-text inline-flex items-center gap-1"
              title="Your progress is auto-saved in this browser for 30 days"
            >
              💾 Draft saved · {filled} answer{filled === 1 ? '' : 's'}
            </span>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!stepValid || submitting}
            aria-busy={submitting}
            aria-disabled={!stepValid}
            title={!stepValid ? 'Complete the required fields above to continue' : undefined}
            className="px-6 py-2.5 rounded-lg bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
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

function Spinner() {
  return (
    <span
      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
      aria-hidden="true"
    />
  );
}

// ── Generic radio card group ───────────────────────────────────────────
// Replaces the old "button pretending to be a radio" pattern. Uses real
// <input type="radio"> inside <fieldset>+<legend> for proper a11y
// (keyboard arrow navigation, screen reader announces group + selection).
// Visual look is identical — selected = orange border + bg-theme-1/5.

type RadioOption<V extends string> = { value: V; label: string; icon?: string };

function RadioGroup<V extends string>(props: {
  name: string;
  legend: string;
  required?: boolean;
  value: V | '';
  onChange: (v: V) => void;
  options: RadioOption<V>[];
  layout?: 'grid-2' | 'grid-3';
  optional?: boolean;
}) {
  const { name, legend, required, value, onChange, options, layout = 'grid-3', optional } = props;
  const gridClass = layout === 'grid-2' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3';
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-secondary mb-1.5">
        {legend} {required && <span className="text-accent">*</span>}
        {!required && optional && (
          <span className="text-secondary/50 font-normal"> (optional)</span>
        )}
      </legend>
      <div className={`grid ${gridClass} gap-2`}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const selected = value === opt.value;
          return (
            <label
              key={opt.value}
              htmlFor={id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium flex items-center gap-2 ${
                selected
                  ? 'border-theme-1 bg-theme-1 text-secondary'
                  : 'border-theme-9 bg-primary text-text hover:border-theme-1/40'
              }`}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.icon && <span aria-hidden="true">{opt.icon}</span>}
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// ── Step components ─────────────────────────────────────────────────────

function Step1({ data, update }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void }) {
  const emailShape = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">Tell me about you</h2>

      {/* Honey-pot: real users never see this; bots fill every input. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        onChange={() => {}}
      />

      <Field label="Your name" required>
        <input
          type="text"
          name="name"
          autoComplete="name"
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
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder="jane@company.com"
          className="input"
        />
      </Field>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Company" optional>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={data.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Acme Inc."
            className="input"
          />
        </Field>
        <Field label="Your role" optional>
          <input
            type="text"
            name="role"
            autoComplete="organization-title"
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
      <RadioGroup
        name="projectType"
        legend="Project type"
        required
        value={data.projectType}
        onChange={(v) => update('projectType', v)}
        options={PROJECT_TYPE_OPTIONS}
        layout="grid-2"
      />
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

function Step3({
  data,
  update,
  toggleTool,
}: {
  data: BriefData;
  update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void;
  toggleTool: (t: string) => void;
}) {
  const tooShort = data.problem.length > 0 && data.problem.trim().length < 10;
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">The problem you're trying to solve</h2>
      <Field
        label="Describe the manual process or pain point"
        required
        error={tooShort ? 'At least a sentence or two — the more detail, the better' : null}
      >
        <textarea
          name="problem"
          required
          rows={5}
          value={data.problem}
          onChange={(e) => update('problem', e.target.value)}
          placeholder="e.g. We manually copy data from 3 spreadsheets into HubSpot every Monday. It takes ~3 hours and someone always forgets a row."
          className="input resize-y min-h-[120px]"
        />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-secondary mb-1.5">
          What tools does it touch today?{' '}
          <span className="text-secondary/50 font-normal">(select all that apply)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {TOOLS_OPTIONS.map((tool) => {
            const id = `tool-${tool.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
            const selected = data.tools.includes(tool);
            return (
              <label
                key={tool}
                htmlFor={id}
                className={`px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-colors ${
                  selected
                    ? 'border-theme-1 bg-theme-1 text-secondary'
                    : 'border-theme-9 text-text hover:border-theme-1/40 bg-primary'
                }`}
              >
                <input
                  type="checkbox"
                  id={id}
                  name="tools"
                  value={tool}
                  checked={selected}
                  onChange={() => toggleTool(tool)}
                  className="sr-only"
                />
                {tool}
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field label="Other tools" optional>
        <input
          type="text"
          value={data.toolsOther}
          onChange={(e) => update('toolsOther', e.target.value)}
          placeholder="Anything else?"
          className="input"
        />
      </Field>

      <RadioGroup
        name="frequency"
        legend="How often does this happen?"
        required
        value={data.frequency}
        onChange={(v) => update('frequency', v)}
        options={FREQUENCY_OPTIONS}
      />
    </div>
  );
}

function Step4({ data, update }: { data: BriefData; update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void }) {
  const tooShort = data.goal.length > 0 && data.goal.trim().length < 10;
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">What does success look like?</h2>
      <Field
        label="The goal / outcome you want"
        required
        error={tooShort ? 'A bit more — at least a sentence' : null}
      >
        <textarea
          name="goal"
          required
          rows={5}
          value={data.goal}
          onChange={(e) => update('goal', e.target.value)}
          placeholder="e.g. The weekly data sync happens automatically and takes less than 10 minutes for a human to review. We've freed up 3 hours / week."
          className="input resize-y min-h-[120px]"
        />
      </Field>
      <Field label="How will you measure success?" optional>
        <input
          type="text"
          name="successMetric"
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

      <RadioGroup
        name="budget"
        legend="Budget range"
        required
        value={data.budget}
        onChange={(v) => update('budget', v)}
        options={BUDGET_OPTIONS}
      />

      <RadioGroup
        name="timeline"
        legend="Timeline"
        required
        value={data.timeline}
        onChange={(v) => update('timeline', v)}
        options={TIMELINE_OPTIONS}
      />

      <Field label="Anything else I should know?" optional>
        <textarea
          name="additionalNotes"
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
    <details open className="mt-6 rounded-lg bg-background border border-theme-9 p-4">
      <summary className="cursor-pointer text-sm font-medium text-text hover:text-accent">
        Review your answers before submitting ↓
      </summary>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row k="Name" v={data.name} />
        <Row k="Email" v={data.email} />
        {data.company && <Row k="Company" v={data.company} />}
        {data.role && <Row k="Role" v={data.role} />}
        <Row
          k="Project"
          v={
            data.projectType === 'other'
              ? `Other — ${data.projectTypeOther}`
              : data.projectType || '—'
          }
        />
        <Row k="Problem" v={data.problem} />
        <Row
          k="Tools"
          v={[...data.tools, data.toolsOther].filter(Boolean).join(', ') || '—'}
        />
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

function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-secondary mb-1.5">
        {label}{' '}
        {required && <span className="text-accent">*</span>}
        {!required && optional && (
          <span className="text-secondary/50 font-normal"> (optional)</span>
        )}
      </span>
      {children}
      {error && (
        <span className="block text-xs text-red-600 mt-1" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
