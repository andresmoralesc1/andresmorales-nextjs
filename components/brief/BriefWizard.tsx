'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { CALENDAR_BOOKING_URL } from '@/lib/constants';
import type { Dictionary, Locale } from '@/lib/i18n';

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
  budget: 'under2k' | '2to5k' | '5to15k' | '15to50k' | 'over50k' | '';
  timeline: 'asap' | '1month' | '1to3months' | 'over3months' | 'flexible' | '';
  additionalNotes: string;
};

// "Other" used to be ✦ — a stray Unicode glyph that didn't match the rest
// of the emoji row. Replaced with 🔧 so the visual rhythm is consistent.
//
// Icons are universal (emoji) — kept in code; labels come from dict (`step2Type`).
// The BriefData union types include '' as the "unset" sentinel; we strip
// it via `Exclude<…, ''>` so the Record has no phantom empty-string key.
type ProjectTypeValue = Exclude<BriefData['projectType'], ''>;
type FrequencyValue = Exclude<BriefData['frequency'], ''>;
type BudgetValue = Exclude<BriefData['budget'], ''>;
type TimelineValue = Exclude<BriefData['timeline'], ''>;

const PROJECT_TYPE_ICONS: Record<ProjectTypeValue, string> = {
  web: '🌐',
  automation: '⚙️',
  'ai-integration': '🤖',
  consulting: '💡',
  other: '🔧',
};

// List of project type `value` keys. Labels are looked up from `dict.brief.step2Type[value]`
// at render time so the wizard automatically reflects the active locale.
const PROJECT_TYPE_VALUES: ProjectTypeValue[] = ['web', 'automation', 'ai-integration', 'consulting', 'other'];

// Frequency values + lookup key. Labels from `dict.brief.step3Frequency[value]`.
const FREQUENCY_VALUES: FrequencyValue[] = ['daily', 'weekly', 'monthly', 'one-off', 'ad-hoc'];

// Budget values aligned with dict keys (`step5Budget`). Labels from `dict.brief.step5Budget[value]`.
// (Was: '<2k', '2-5k', etc. — renamed to match dict for clean i18n.)
const BUDGET_VALUES: BudgetValue[] = ['under2k', '2to5k', '5to15k', '15to50k', 'over50k'];

// Timeline values aligned with dict keys (`step5Timeline`). Labels from `dict.brief.step5Timeline[value]`.
const TIMELINE_VALUES: TimelineValue[] = ['asap', '1month', '1to3months', 'over3months', 'flexible'];

// Step count is fixed at 5. Used for progress math and `aria-valuemax`.
const STEP_COUNT = 5;

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

export default function BriefWizard({ dict, lang }: { dict: Dictionary; lang: Locale }) {
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
  const isLastStep = step === STEP_COUNT - 1;
  const filled = filledFieldCount(data);
  // Step labels derived from dict so the wizard reflects the active locale.
  const stepLabels = [
    dict.brief.step1Title,
    dict.brief.step2Title,
    dict.brief.step3Title,
    dict.brief.step4Title,
    dict.brief.step5Title,
  ];
  const wizardStep = dict.brief.wizardStep
    .replace('{current}', String(step + 1))
    .replace('{total}', String(STEP_COUNT));
  const draftSavedLabel = (filled === 1 ? dict.brief.wizardDraftSaved : dict.brief.wizardDraftSavedPlural)
    .replace('{count}', String(filled));

  async function handleSubmit() {
    setSubmitting(true);
    setServerError(null);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // `lang` tells the API route which dictionary to use for the email
        // templates (notification + auto-reply). Defaults to the locale the
        // form was rendered in.
        body: JSON.stringify({ ...data, lang }),
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
        from_label: stepLabels[fromStep],
      });
      if (fromStep === 0) {
        track('brief_started', { project_type_selected: false });
      }
      setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
    }
  }

  function handleBack() {
    if (step === 0) return;
    track('brief_step_back', {
      from_step: step + 1,
      from_label: stepLabels[step],
    });
    setStep((s) => Math.max(s - 1, 0));
  }

  function clearDraft() {
    // Confirm before destroying the user's saved progress. Without this a
    // misclick wipes 5 minutes of work + the auto-saved draft. Browser's
    // native confirm is fine — no need for a custom modal here.
    if (typeof window !== 'undefined' && !window.confirm(dict.brief.wizardStartOverConfirm)) {
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
            {wizardStep}
          </span>
          <span className="font-secondary uppercase tracking-wider text-text">
            {stepLabels[step]}
          </span>
        </div>
        <div className="h-2 rounded-full bg-theme-9 overflow-hidden">
          <div
            className="h-full bg-theme-1 transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_COUNT}
          />
        </div>
        <div className="hidden md:flex justify-between mt-3 text-xs text-text">
          {stepLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              aria-label={
                i < step
                  ? `Go back to step ${i + 1}: ${label}`
                  : i === step
                    ? `Current step: ${label}`
                    : `Step ${i + 1}: ${label} (locked)`
              }
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

      {/* Step content — wrapped in a single <form> so WebMCP + Lighthouse
          form-coverage audits see one cohesive brief form (not 5 separate
          ones). onSubmit prevents the browser's native submit semantics
          from interfering with the wizard's state machine. */}
      <form
        className="p-6 md:p-8"
        onSubmit={(e) => e.preventDefault()}
        data-webmcp-form-id="brief"
        data-webmcp-name="Project brief wizard"
        data-webmcp-description="5-step project brief: about-you → project type → problem → goal → logistics. Use to scope a paid engagement."
      >
        {step === 0 && <Step1 data={data} update={update} dict={dict} />}
        {step === 1 && <Step2 data={data} update={update} dict={dict} />}
        {step === 2 && <Step3 data={data} update={update} toggleTool={toggleTool} dict={dict} />}
        {step === 3 && <Step4 data={data} update={update} dict={dict} />}
        {step === 4 && <Step5 data={data} update={update} dict={dict} />}

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
              {dict.brief.wizardEscapeHatch}{' '}
              <a
                href={CALENDAR_BOOKING_URL}
                target="_blank"
                rel="noreferrer"
                className="text-secondary hover:underline font-medium"
              >
                {dict.brief.wizardEscapeHatchCta}
              </a>
            </p>
          </div>
        )}
      </form>

      {/* Footer / nav */}
      <div className="px-6 md:px-8 py-4 bg-background border-t border-theme-9 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium text-secondary hover:text-accent transition-colors disabled:opacity-50"
            >
              {dict.brief.wizardBack}
            </button>
          ) : (
            <button
              type="button"
              onClick={clearDraft}
              className="px-3 py-2 min-h-[44px] text-xs text-text hover:text-text underline"
              title={dict.brief.wizardStartOverConfirm}
            >
              {dict.brief.wizardStartOver}
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
              title={dict.brief.wizardDraftTitle}
            >
              {draftSavedLabel}
            </span>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!stepValid || submitting}
            aria-busy={submitting}
            aria-disabled={!stepValid}
            title={!stepValid ? dict.brief.wizardDisabledTitle : undefined}
            className="px-6 py-2.5 rounded-lg bg-theme-1 text-secondary font-bold hover:bg-theme-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> {dict.brief.wizardSending}
              </>
            ) : isLastStep ? (
              dict.brief.wizardSubmit
            ) : (
              dict.brief.wizardNext
            )}
          </button>
        </div>
      </div>

      {submitted && (
        <div className="px-6 py-4 bg-green-50 text-green-700 text-sm text-center">
          {dict.brief.wizardRedirecting}
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
              className={`p-4 min-h-[44px] rounded-lg border-2 cursor-pointer transition-all text-sm font-medium flex items-center gap-2 ${
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

function Step1({
  data,
  update,
  dict,
}: {
  data: BriefData;
  update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void;
  dict: Dictionary;
}) {
  const emailShape = !data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">{dict.brief.step1Title}</h2>

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

      <Field label={dict.brief.step1NameLabel} required>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
          autoFocus
          data-webmcp-field-name="name"
          data-webmcp-field-type="string"
          data-webmcp-field-required="true"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder={dict.brief.step1NamePlaceholder}
          className="input"
        />
      </Field>
      <Field label={dict.brief.step1EmailLabel} required error={!emailShape ? dict.brief.step1EmailError : null}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          data-webmcp-field-name="email"
          data-webmcp-field-type="string"
          data-webmcp-field-format="email"
          data-webmcp-field-required="true"
          value={data.email}
          onChange={(e) => update('email', e.target.value)}
          placeholder={dict.brief.step1EmailPlaceholder}
          className="input"
        />
      </Field>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label={dict.brief.step1CompanyLabel} optional>
          <input
            type="text"
            name="company"
            autoComplete="organization"
            value={data.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder={dict.brief.step1CompanyPlaceholder}
            className="input"
          />
        </Field>
        <Field label={dict.brief.step1RoleLabel} optional>
          <input
            type="text"
            name="role"
            autoComplete="organization-title"
            value={data.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder={dict.brief.step1RolePlaceholder}
            className="input"
          />
        </Field>
      </div>
    </div>
  );
}

function Step2({
  data,
  update,
  dict,
}: {
  data: BriefData;
  update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void;
  dict: Dictionary;
}) {
  // Project-type options: structure from code (icons are universal), labels from dict.
  const projectTypeOptions = PROJECT_TYPE_VALUES.map((value) => ({
    value,
    label: dict.brief.step2Type[value],
    icon: PROJECT_TYPE_ICONS[value],
  }));
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">{dict.brief.step2Title}</h2>
      <RadioGroup
        name="projectType"
        legend={dict.brief.step2Legend}
        required
        value={data.projectType}
        onChange={(v) => update('projectType', v)}
        options={projectTypeOptions}
        layout="grid-2"
      />
      {data.projectType === 'other' && (
        <Field label={dict.brief.step2OtherLabel} required>
          <input
            type="text"
            value={data.projectTypeOther}
            onChange={(e) => update('projectTypeOther', e.target.value)}
            placeholder={dict.brief.step2OtherPlaceholder}
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
  dict,
}: {
  data: BriefData;
  update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void;
  toggleTool: (t: string) => void;
  dict: Dictionary;
}) {
  const tooShort = data.problem.length > 0 && data.problem.trim().length < 10;
  // Frequency options: structure from code, labels from dict.
  const frequencyOptions = FREQUENCY_VALUES.map((value) => ({
    value,
    label: dict.brief.step3Frequency[value],
  }));
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">{dict.brief.step3Title}</h2>
      <Field
        label={dict.brief.step3ProblemLabel}
        required
        error={tooShort ? dict.brief.step3ProblemError : null}
      >
        <textarea
          name="problem"
          required
          rows={5}
          value={data.problem}
          onChange={(e) => update('problem', e.target.value)}
          placeholder={dict.brief.step3ProblemPlaceholder}
          className="input resize-y min-h-[120px]"
        />
      </Field>

      <fieldset>
        <legend className="block text-sm font-medium text-secondary mb-1.5">
          {dict.brief.step3ToolsLegend}{' '}
          <span className="text-secondary/50 font-normal">{dict.brief.step3ToolsHint}</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {dict.brief.tools.map((tool) => {
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

      <Field label={dict.brief.step3OtherToolsLabel} optional>
        <input
          type="text"
          value={data.toolsOther}
          onChange={(e) => update('toolsOther', e.target.value)}
          placeholder={dict.brief.step3OtherToolsPlaceholder}
          className="input"
        />
      </Field>

      <RadioGroup
        name="frequency"
        legend={dict.brief.step3FrequencyLegend}
        required
        value={data.frequency}
        onChange={(v) => update('frequency', v)}
        options={frequencyOptions}
      />
    </div>
  );
}

function Step4({
  data,
  update,
  dict,
}: {
  data: BriefData;
  update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void;
  dict: Dictionary;
}) {
  const tooShort = data.goal.length > 0 && data.goal.trim().length < 10;
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">{dict.brief.step4Title}</h2>
      <Field
        label={dict.brief.step4GoalLabel}
        required
        error={tooShort ? dict.brief.step4GoalError : null}
      >
        <textarea
          name="goal"
          required
          rows={5}
          value={data.goal}
          onChange={(e) => update('goal', e.target.value)}
          placeholder={dict.brief.step4GoalPlaceholder}
          className="input resize-y min-h-[120px]"
        />
      </Field>
      <Field label={dict.brief.step4MetricLabel} optional>
        <input
          type="text"
          name="successMetric"
          value={data.successMetric}
          onChange={(e) => update('successMetric', e.target.value)}
          placeholder={dict.brief.step4MetricPlaceholder}
          className="input"
        />
      </Field>
    </div>
  );
}

function Step5({
  data,
  update,
  dict,
}: {
  data: BriefData;
  update: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void;
  dict: Dictionary;
}) {
  // Budget + timeline options: structure from code, labels from dict.
  const budgetOptions = BUDGET_VALUES.map((value) => ({
    value,
    label: dict.brief.step5Budget[value],
  }));
  const timelineOptions = TIMELINE_VALUES.map((value) => ({
    value,
    label: dict.brief.step5Timeline[value],
  }));
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-2xl">{dict.brief.step5Title}</h2>

      <RadioGroup
        name="budget"
        legend={dict.brief.step5BudgetLegend}
        required
        value={data.budget}
        onChange={(v) => update('budget', v)}
        options={budgetOptions}
      />

      <RadioGroup
        name="timeline"
        legend={dict.brief.step5TimelineLegend}
        required
        value={data.timeline}
        onChange={(v) => update('timeline', v)}
        options={timelineOptions}
      />

      <Field label={dict.brief.step5NotesLabel} optional>
        <textarea
          name="additionalNotes"
          rows={4}
          value={data.additionalNotes}
          onChange={(e) => update('additionalNotes', e.target.value)}
          placeholder={dict.brief.step5NotesPlaceholder}
          className="input resize-y"
        />
      </Field>

      <Summary data={data} dict={dict} />
    </div>
  );
}

function Summary({ data, dict }: { data: BriefData; dict: Dictionary }) {
  // Translate projectType / budget / timeline / frequency values to their
  // localized labels via dict, so the review summary reflects the active
  // locale (not just the raw enum string).
  const projectTypeLabel = data.projectType === 'other'
    ? dict.brief.step5SummaryProjectOther.replace('{value}', data.projectTypeOther || '—')
    : data.projectType
      ? dict.brief.step2Type[data.projectType]
      : '—';
  const budgetLabel = data.budget ? dict.brief.step5Budget[data.budget] : '—';
  const timelineLabel = data.timeline ? dict.brief.step5Timeline[data.timeline] : '—';
  const frequencyLabel = data.frequency ? dict.brief.step3Frequency[data.frequency] : '—';
  const rows = dict.brief.step5SummaryRows;
  return (
    <details open className="mt-6 rounded-lg bg-background border border-theme-9 p-4">
      <summary className="cursor-pointer text-sm font-medium text-text hover:text-accent">
        {dict.brief.step5SummaryToggle}
      </summary>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row k={rows.name} v={data.name} />
        <Row k={rows.email} v={data.email} />
        {data.company && <Row k={rows.company} v={data.company} />}
        {data.role && <Row k={rows.role} v={data.role} />}
        <Row k={rows.project} v={projectTypeLabel} />
        <Row k={rows.problem} v={data.problem} />
        <Row k={rows.tools} v={[...data.tools, data.toolsOther].filter(Boolean).join(', ') || '—'} />
        <Row k={rows.frequency} v={frequencyLabel} />
        <Row k={rows.goal} v={data.goal} />
        {data.successMetric && <Row k={rows.metric} v={data.successMetric} />}
        <Row k={rows.budget} v={budgetLabel} />
        <Row k={rows.timeline} v={timelineLabel} />
        {data.additionalNotes && <Row k={rows.notes} v={data.additionalNotes} />}
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
