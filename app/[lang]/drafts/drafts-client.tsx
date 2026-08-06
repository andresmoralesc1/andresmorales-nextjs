"use client";

// Drafts UI — list, preview, edit, approve, discard. Auth is now a
// server-side cookie (`am_admin`); the server component enforces it
// before this client component even renders. Mutations POST to the
// drafts API with `credentials: "same-origin"` so the cookie rides along.

import { useEffect, useMemo, useState, useCallback } from "react";

interface BlogPostSummary {
  slug: string;
  locale?: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  author?: string;
  readingTime?: number;
  coverImage?: string;
  coverImageCredit?: string;
  coverImageAlt?: string;
  source?: string;
  sourceTitle?: string;
  href: string;
}

interface Props {
  initialDrafts: BlogPostSummary[];
  locale: "en" | "es" | "pt";
}

interface PreviewData {
  bodyMarkdown: string;
  bodyHtml: string;
  title: string;
  description: string;
  tags: string[];
}

export function DraftsClient({ initialDrafts, locale }: Props) {
  const [drafts] = useState(initialDrafts);
  const [filter, setFilter] = useState<"all" | "en" | "es" | "pt">(locale);
  const [openDraft, setOpenDraft] = useState<BlogPostSummary | null>(null);
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  const visible = useMemo(
    () => (filter === "all" ? drafts : drafts.filter((d) => d.locale === filter)),
    [drafts, filter],
  );

  const loadFullDraft = useCallback(async (slug: string, lang: string): Promise<PreviewData | null> => {
    const res = await fetch(`/api/drafts/${lang}/${slug}/preview`, { credentials: "same-origin" });
    if (!res.ok) return null;
    return res.json();
  }, []);

  const openPreview = useCallback(async (draft: BlogPostSummary) => {
    if (!draft.locale) return;
    setOpenDraft(draft);
    setEditing(false);
    const data = await loadFullDraft(draft.slug, draft.locale);
    if (!data) {
      setStatus({ kind: "error", msg: "No se pudo cargar el preview" });
      return;
    }
    setEditBody(data.bodyMarkdown);
    setEditTitle(data.title);
    setEditDescription(data.description);
    setEditTags((data.tags ?? []).join(", "));
  }, [loadFullDraft]);

  const closeModal = useCallback(() => {
    setOpenDraft(null);
    setEditing(false);
    setStatus({ kind: "idle" });
  }, []);

  const sendAction = useCallback(async (slug: string, lang: string, action: string, extra: Record<string, unknown> = {}) => {
    setStatus({ kind: "busy", msg: action === "approve" ? "Aprobando\u2026" : action === "discard" ? "Descartando\u2026" : action === "update" ? "Guardando\u2026" : "Procesando\u2026" });
    const res = await fetch(`/api/drafts/${lang}/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus({ kind: "error", msg: json.error || `HTTP ${res.status}` });
      return false;
    }
    setStatus({ kind: "ok", msg: json.message || "Listo" });
    return true;
  }, []);

  const onApprove = useCallback(async (draft: BlogPostSummary) => {
    if (!draft.locale) return;
    const ok = await sendAction(draft.slug, draft.locale, "approve");
    if (ok) {
      setTimeout(() => window.location.reload(), 800);
    }
  }, [sendAction]);

  const onDiscard = useCallback(async (draft: BlogPostSummary) => {
    if (!draft.locale) return;
    if (!confirm(`Descartar "${draft.title}"? Esto borra el archivo .md y la cover.`)) return;
    const ok = await sendAction(draft.slug, draft.locale, "discard");
    if (ok) {
      setTimeout(() => window.location.reload(), 800);
    }
  }, [sendAction]);

  const onSaveEdit = useCallback(async () => {
    if (!openDraft || !openDraft.locale) return;
    const tags = editTags.split(",").map((t) => t.trim()).filter(Boolean);
    const ok = await sendAction(openDraft.slug, openDraft.locale, "update", {
      body: editBody,
      title: editTitle,
      description: editDescription,
      tags,
    });
    if (ok) setEditing(false);
  }, [openDraft, editBody, editTitle, editDescription, editTags, sendAction]);

  return (
    <div>
      {/* Filter pills */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        {(["all", "en", "es", "pt"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
              filter === f
                ? "bg-theme-1 text-secondary"
                : "bg-theme-3 text-theme-5 hover:bg-theme-1/10 border border-theme-9"
            }`}
          >
            {f === "all" ? "Todos" : f.toUpperCase()} ({f === "all" ? drafts.length : drafts.filter((d) => d.locale === f).length})
          </button>
        ))}
      </div>

      {/* Empty state */}
      {visible.length === 0 && (
        <div className="rounded-2xl border border-theme-9 bg-theme-3 p-8 text-center text-theme-5/70">
          <p className="text-sm">No hay borradores {filter === "all" ? "" : `en ${filter.toUpperCase()}`}.</p>
          <p className="text-xs mt-2 text-theme-5/50">Cuando la pipeline genere algo nuevo, aparecer\u00e1 ac\u00e1.</p>
        </div>
      )}

      {/* Draft list */}
      <ul className="space-y-3">
        {visible.map((d) => (
          <li
            key={`${d.slug}:${d.locale}`}
            className="rounded-2xl border border-theme-9 bg-theme-3 p-4 flex items-center gap-4"
          >
            {d.coverImage && (
              <img
                src={d.coverImage}
                alt=""
                className="h-16 w-24 object-cover rounded-md flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-theme-5/60 mb-1">
                {(d.locale ?? "?").toUpperCase()} \u00b7 {d.date} \u00b7 {d.readingTime ?? 1} min
              </p>
              <h2 className="font-heading text-lg font-bold text-secondary leading-tight mb-1">
                {d.title}
              </h2>
              <p className="text-sm text-theme-5/80 line-clamp-2">{d.description}</p>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => openPreview(d)}
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-theme-3 hover:bg-secondary/90"
              >
                Ver
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {openDraft && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-stretch md:items-start justify-center md:p-4 overflow-hidden md:overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="bg-background w-full md:max-w-3xl md:rounded-2xl flex flex-col h-full md:h-auto md:max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-5 border-b border-theme-9 flex-shrink-0">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <p className="text-xs uppercase tracking-widest text-theme-5/60">
                  {(openDraft.locale ?? "?").toUpperCase()} \u00b7 Draft
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-theme-5/60 hover:text-secondary text-xl leading-none"
                  aria-label="Cerrar"
                >
                  \u00d7
                </button>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input w-full font-heading text-xl font-bold"
                  aria-label="Title"
                />
              ) : (
                <h3 className="font-heading text-2xl font-bold text-secondary">{openDraft.title}</h3>
              )}
            </header>

            <div className="p-5 flex-1 overflow-y-auto min-h-0">
              {editing ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="sr-only">Description</span>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      className="input w-full text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Tags</span>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      placeholder="tags, separados, por, comas"
                      className="input w-full text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">Body markdown</span>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      spellCheck={false}
                      className="input w-full font-mono text-sm leading-relaxed min-h-[300px]"
                    />
                  </label>
                </div>
              ) : (
                <article className="prose prose-sm max-w-none text-secondary">
                  <p className="text-theme-5/80 italic mb-4">{openDraft.description}</p>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-theme-3 p-4 rounded-md overflow-x-auto">
                    {editBody}
                  </pre>
                </article>
              )}
            </div>

            <footer className="p-5 border-t border-theme-9 flex items-center gap-3 flex-shrink-0 bg-theme-3">
              <div className="flex-1 min-w-0 text-sm">
                {status.msg && (
                  <p
                    className={
                      status.kind === "error"
                        ? "text-red-600"
                        : status.kind === "ok"
                          ? "text-green-700"
                          : "text-theme-5/70"
                    }
                  >
                    {status.kind === "busy" && "\u23f3 "}
                    {status.msg}
                  </p>
                )}
              </div>
              {editing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="text-xs font-medium px-3 py-1.5 rounded-md text-theme-5 hover:text-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={onSaveEdit}
                    disabled={status.kind === "busy"}
                    className="text-xs font-bold px-3 py-1.5 rounded-md bg-secondary text-theme-3 hover:bg-secondary/90 disabled:opacity-50"
                  >
                    Guardar cambios
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-theme-9 text-secondary hover:bg-theme-9/30"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDiscard(openDraft)}
                    disabled={status.kind === "busy"}
                    className="text-xs font-medium px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={() => onApprove(openDraft)}
                    disabled={status.kind === "busy"}
                    className="text-xs font-bold px-3 py-1.5 rounded-md bg-theme-1 text-secondary hover:opacity-90 disabled:opacity-50"
                  >
                    Aprobar
                  </button>
                </>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
