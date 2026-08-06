"use client";

// Post editor — 3 tabs (EN | ES | PT) sharing one "Guardar todo" button.
//
// Each tab keeps its own local state (title / description / tags / body) so
// the user can flip between languages without losing work. Saving POSTs to
// /api/posts/[lang]/[slug] per locale — only the languages with a body are
// saved (the missing ones are flagged but not auto-created).
//
// Auth: the server-rendered parent passes `isAuthenticated` (true if the
// am_admin cookie is valid). When true, the save button works; otherwise
// the page shows a "Modo lectura" banner explaining that admin login is
// required.

import { useState, useCallback } from "react";

const LOCALE_LABELS = { en: "English", es: "Espa\u00f1ol", pt: "Portugu\u00eas" };

interface LocaleBody {
  locale: "en" | "es" | "pt";
  exists: boolean;
  title?: string;
  description?: string;
  tags?: string[];
  coverImage?: string;
  bodyMarkdown?: string;
}

interface Props {
  slug: string;
  initialBodies: LocaleBody[];
  isAuthenticated: boolean;
}

interface LocaleState {
  title: string;
  description: string;
  tags: string;
  body: string;
  dirty: boolean;
}

function initState(b: LocaleBody): LocaleState {
  return {
    title: b.title ?? "",
    description: b.description ?? "",
    tags: (b.tags ?? []).join(", "),
    body: b.bodyMarkdown ?? "",
    dirty: false,
  };
}

export function PostEditClient({ slug, initialBodies, isAuthenticated }: Props) {
  const [activeLocale, setActiveLocale] = useState<"en" | "es" | "pt">(
    initialBodies.find((b) => b.exists)?.locale ?? "en",
  );
  const [states, setStates] = useState<Record<"en" | "es" | "pt", LocaleState>>({
    en: initState(initialBodies.find((b) => b.locale === "en")!),
    es: initState(initialBodies.find((b) => b.locale === "es")!),
    pt: initState(initialBodies.find((b) => b.locale === "pt")!),
  });
  const [status, setStatus] = useState<{
    kind: "idle" | "saving" | "saved" | "error";
    msg?: string;
    perLocale?: Record<"en" | "es" | "pt", "idle" | "saving" | "saved" | "error" | "skipped">;
  }>({ kind: "idle" });

  const updateField = useCallback(
    <K extends keyof LocaleState>(locale: "en" | "es" | "pt", field: K, value: LocaleState[K]) => {
      setStates((prev) => ({
        ...prev,
        [locale]: { ...prev[locale], [field]: value, dirty: true },
      }));
    },
    [],
  );

  const saveAll = useCallback(async () => {
    if (!isAuthenticated) {
      setStatus({ kind: "error", msg: "Sin sesi\u00f3n. Inicia sesi\u00f3n desde /<lang>/admin/login." });
      return;
    }

    const perLocale: Record<"en" | "es" | "pt", "idle" | "saving" | "saved" | "error" | "skipped"> = {
      en: "idle",
      es: "idle",
      pt: "idle",
    };
    setStatus({ kind: "saving", msg: "Guardando los 3 idiomas\u2026", perLocale });

    const dirtyLocales = (["en", "es", "pt"] as const).filter((l) => states[l].dirty);

    if (dirtyLocales.length === 0) {
      setStatus({ kind: "saved", msg: "Nada que guardar \u2014 no hiciste cambios.", perLocale });
      return;
    }

    const promises = dirtyLocales.map(async (locale) => {
      const s = states[locale];
      const tags = s.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      try {
        const res = await fetch(`/api/posts/${locale}/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: s.body,
            title: s.title,
            description: s.description,
            tags,
          }),
          credentials: "same-origin",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "HTTP " + res.status);
        perLocale[locale] = "saved";
        return { locale, ok: true };
      } catch (err) {
        perLocale[locale] = "error";
        return { locale, ok: false, err: (err as Error).message };
      }
    });

    const results = await Promise.all(promises);
    const failed = results.filter((r) => !r.ok);

    if (failed.length === 0) {
      setStates((prev) => {
        const next = { ...prev };
        for (const l of dirtyLocales) next[l] = { ...prev[l], dirty: false };
        return next;
      });
      setStatus({
        kind: "saved",
        msg: `Guardado: ${dirtyLocales.length} idioma${dirtyLocales.length === 1 ? "" : "s"}. Corre \`npm run build\` para que se vea en vivo.`,
        perLocale,
      });
    } else {
      setStatus({
        kind: "error",
        msg: `Fall\u00f3 guardando ${failed.map((f) => f.locale.toUpperCase()).join(", ")}: ${failed.map((f) => f.err).join("; ")}`,
        perLocale,
      });
    }
  }, [isAuthenticated, slug, states]);

  const active = states[activeLocale];
  const activeMeta = initialBodies.find((b) => b.locale === activeLocale)!;
  const dirtyCount = (["en", "es", "pt"] as const).filter((l) => states[l].dirty).length;

  return (
    <div>
      {!isAuthenticated && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          \u26a0 <strong>Modo lectura</strong> \u2014 inicia sesi\u00f3n desde
          {" "}<code>/&lt;lang&gt;/admin/login</code> para habilitar Guardar.
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 flex-wrap" role="tablist" aria-label="Idioma">
        {(["en", "es", "pt"] as const).map((loc) => {
          const meta = initialBodies.find((b) => b.locale === loc)!;
          const isActive = activeLocale === loc;
          const dirty = states[loc].dirty;
          return (
            <button
              key={loc}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveLocale(loc)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-theme-1 text-secondary"
                  : "bg-theme-3 text-theme-5 hover:bg-theme-1/10 border border-theme-9"
              }`}
            >
              <span>{LOCALE_LABELS[loc]}</span>
              {!meta.exists && (
                <span className="text-[10px] uppercase tracking-wider opacity-70 bg-secondary/15 rounded-full px-1.5 py-0.5">
                  sin body
                </span>
              )}
              {dirty && (
                <span
                  className="h-2 w-2 rounded-full bg-orange-500"
                  aria-label="Cambios sin guardar"
                />
              )}
            </button>
          );
        })}
        <span className="ml-auto text-sm text-theme-5/70">
          {dirtyCount > 0
            ? `${dirtyCount} idioma${dirtyCount === 1 ? "" : "s"} con cambios sin guardar`
            : "Todo guardado"}
        </span>
      </div>

      {activeMeta.coverImage && (
        <div className="mb-4 rounded-xl border border-theme-9 bg-theme-3 p-3 text-sm flex items-center gap-3">
          <img
            src={activeMeta.coverImage}
            alt=""
            className="h-12 w-20 object-cover rounded"
          />
          <div className="min-w-0">
            <p className="text-xs text-theme-5/60 mb-0.5">Cover image</p>
            <code className="text-xs font-mono text-theme-5/80 break-all">
              {activeMeta.coverImage}
            </code>
          </div>
        </div>
      )}

      {!activeMeta.exists ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <p className="font-medium mb-2">No hay body en {LOCALE_LABELS[activeLocale]} todav\u00eda.</p>
          <p className="text-sm">
            Crea el archivo <code className="font-mono">content/blog/{slug}.{activeLocale}.md</code> con frontmatter v\u00e1lido
            y vuelve a esta p\u00e1gina. No hay UI para crearlo desde cero todav\u00eda \u2014
            p\u00eddemelo si lo necesitas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="sr-only">Title</span>
            <input
              type="text"
              value={active.title}
              onChange={(e) => updateField(activeLocale, "title", e.target.value)}
              placeholder="Title"
              className="input w-full font-heading text-xl font-bold"
            />
          </label>

          <label className="block">
            <span className="sr-only">Description</span>
            <input
              type="text"
              value={active.description}
              onChange={(e) => updateField(activeLocale, "description", e.target.value)}
              placeholder="Description (SEO meta)"
              className="input w-full text-sm"
            />
          </label>

          <label className="block">
            <span className="sr-only">Tags</span>
            <input
              type="text"
              value={active.tags}
              onChange={(e) => updateField(activeLocale, "tags", e.target.value)}
              placeholder="tags, separados, por, comas"
              className="input w-full text-sm"
            />
          </label>

          <label className="block">
            <span className="sr-only">Body markdown</span>
            <textarea
              value={active.body}
              onChange={(e) => updateField(activeLocale, "body", e.target.value)}
              spellCheck={false}
              placeholder="Body markdown"
              className="input w-full font-mono text-sm leading-relaxed min-h-[480px]"
            />
          </label>

          <p className="text-xs text-theme-5/60">
            Cambios en este idioma se guardan al hacer click en <strong>Guardar todo</strong>.
            El dot naranja en la pesta\u00f1a indica cambios sin guardar.
          </p>
        </div>
      )}

      <div className="sticky bottom-4 mt-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="rounded-2xl bg-theme-3 border border-theme-9 shadow-lg p-4 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            {status.msg && (
              <p
                className={`text-sm ${
                  status.kind === "error"
                    ? "text-red-600"
                    : status.kind === "saved"
                      ? "text-green-700"
                      : "text-theme-5/80"
                }`}
              >
                {status.kind === "saving" && "\u23f3 "}
                {status.msg}
              </p>
            )}
            {status.perLocale && (
              <div className="flex gap-3 mt-1 text-xs">
                {(["en", "es", "pt"] as const).map((loc) => {
                  const s = status.perLocale?.[loc];
                  if (!s || s === "idle") return null;
                  const color =
                    s === "saved"
                      ? "text-green-700"
                      : s === "error"
                        ? "text-red-600"
                        : s === "saving"
                          ? "text-theme-5/70"
                          : "text-theme-5/50";
                  return (
                    <span key={loc} className={color}>
                      {loc.toUpperCase()}: {s === "saved" ? "\u2713" : s === "error" ? "\u2717" : "\u23f3"}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={saveAll}
            disabled={!isAuthenticated || dirtyCount === 0 || status.kind === "saving"}
            className="btn-theme text-sm disabled:opacity-50"
          >
            {status.kind === "saving" ? "Guardando\u2026" : `Guardar todo${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
