"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import {
  X,
  MessageSquare,
  Sparkles,
  Send,
  Heart,
  Clock,
  User,
  CornerDownRight,
  Filter,
} from "lucide-react"
import type { ArtNote } from "@/lib/art-notes"
import type { ArtworkCard } from "@/lib/artworks-data"

interface ArtNotesModalProps {
  isOpen: boolean
  onClose: () => void
  activeCard?: ArtworkCard | null
  allCards?: ArtworkCard[]
  notes: ArtNote[]
  onNoteAdded: (newNote: ArtNote) => void
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diffSec < 60) return "Hace un momento"
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `Hace ${diffMin} min`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `Hace ${diffHours} h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `Hace ${diffDays} d`
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
  } catch {
    return "Reciente"
  }
}

export default function ArtNotesModal({
  isOpen,
  onClose,
  activeCard,
  allCards = [],
  notes,
  onNoteAdded,
}: ArtNotesModalProps) {
  const [tab, setTab] = useState<"current" | "all">("current")
  const [name, setName] = useState("")
  const [noteText, setNoteText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load saved visitor name from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("amart_visitor_name")
      if (saved) setName(saved)
    } catch {}
  }, [])

  // Auto-switch to "all" if opened without an active card
  useEffect(() => {
    if (!activeCard) {
      setTab("all")
    } else {
      setTab("current")
    }
  }, [activeCard, isOpen])

  // Clear feedback when changing cards
  useEffect(() => {
    setFeedback(null)
  }, [activeCard, isOpen])

  const currentNotes = useMemo(() => {
    if (!activeCard) return notes
    return notes.filter((n) => n.artworkId === activeCard.id)
  }, [notes, activeCard])

  const displayedNotes = tab === "current" && activeCard ? currentNotes : notes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedNote = noteText.trim()

    if (!trimmedName || trimmedName.length < 2) {
      setFeedback({ type: "error", msg: "Por favor escribe tu nombre (mínimo 2 letras)." })
      return
    }
    if (!trimmedNote || trimmedNote.length < 3) {
      setFeedback({ type: "error", msg: "Escribe una nota o mensaje (mínimo 3 caracteres)." })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const targetId = activeCard ? activeCard.id : "general"
      const targetTitle = activeCard ? activeCard.title : "Galería Bocetos de Piel"

      const res = await fetch("/api/art-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: targetId,
          artworkTitle: targetTitle,
          name: trimmedName,
          note: trimmedNote,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo guardar la nota.")
      }

      // Save name for next time
      try {
        localStorage.setItem("amart_visitor_name", trimmedName)
      } catch {}

      onNoteAdded(data.note)
      setNoteText("")
      setFeedback({
        type: "success",
        msg: "¡Tu nota ha sido publicada en la galería!",
      })

      // Auto-clear success message after 4s
      setTimeout(() => {
        setFeedback(null)
      }, 4000)
    } catch (err: any) {
      setFeedback({
        type: "error",
        msg: err.message || "Ocurrió un error al enviar tu nota.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      {/* Drawer Container */}
      <div
        className="w-full sm:w-[480px] h-[100dvh] max-h-[100dvh] bg-[#FFFDFB] text-[#1E1810] border-l border-stone-200 shadow-[0_0_50px_rgba(0,0,0,0.25)] flex flex-col z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <header className="px-5 py-4 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f96e03]/15 border border-[#f96e03]/30 flex items-center justify-center text-[#f96e03]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold text-[#1E1810] tracking-tight flex items-center gap-1.5">
                Libro de Visitas & Notas
              </h2>
              <p className="text-[11px] font-mono text-[#575250]">
                Deja tus impresiones en los bocetos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-[#1E1810] hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Cerrar notas"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Selected Artwork Context Pill */}
        {activeCard && (
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activeCard.imageUrl}
                alt={activeCard.title}
                className="w-10 h-10 rounded object-cover border border-stone-200 shrink-0 shadow-sm"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-[#f96e03] font-bold">
                  Dibujo #{activeCard.id}
                </span>
                <p className="text-xs font-serif font-medium text-[#1E1810] truncate">
                  {activeCard.title}
                </p>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center p-0.5 rounded-full bg-stone-200 border border-stone-300 text-[10px] font-mono shrink-0">
              <button
                type="button"
                onClick={() => setTab("current")}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  tab === "current"
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-sm"
                    : "text-[#575250] hover:text-[#1E1810]"
                }`}
              >
                Esta ({currentNotes.length})
              </button>
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  tab === "all"
                    ? "bg-[#f96e03] text-[#1E1810] font-bold shadow-sm"
                    : "text-[#575250] hover:text-[#1E1810]"
                }`}
              >
                Todas ({notes.length})
              </button>
            </div>
          </div>
        )}

        {/* Notes Feed Area */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3.5 scrollbar-thin scrollbar-thumb-stone-200">
          {displayedNotes.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#f96e03]/60 animate-pulse" />
              <p className="text-sm font-serif text-[#1E1810]">Aún no hay notas en esta obra.</p>
              <p className="text-xs font-sans text-stone-500 mt-1">
                ¡Sé la primera persona en dejar tus palabras!
              </p>
            </div>
          ) : (
            displayedNotes.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-xl bg-white border border-stone-200/90 hover:border-stone-300 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#f96e03]/15 text-[#f96e03] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {n.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="text-xs font-serif font-bold text-[#1E1810] truncate">
                      {n.name}
                    </span>
                    {n.artworkId && n.artworkId !== "general" && tab === "all" && (
                      <span className="text-[9px] font-mono text-[#f96e03] bg-[#f96e03]/10 px-1.5 py-0.5 rounded border border-[#f96e03]/20 shrink-0 font-bold">
                        #{n.artworkId}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-[#1E1810]/90 font-sans leading-relaxed whitespace-pre-wrap pl-6">
                  {n.note}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Note Submission Form */}
        <footer className="p-4 bg-white border-t border-stone-200 shrink-0">
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {feedback && (
              <div
                className={`p-2.5 rounded-lg text-xs font-sans ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {feedback.msg}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu Nombre o apodo..."
                maxLength={60}
                required
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-[#1E1810] text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#f96e03] focus:ring-1 focus:ring-[#f96e03]/30 transition-all font-sans"
              />
            </div>

            <div className="relative">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  activeCard
                    ? `Deja una nota o dedicatoria para #${activeCard.id} (${activeCard.title})...`
                    : "Deja tus impresiones sobre la galería..."
                }
                rows={2}
                maxLength={600}
                required
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-[#1E1810] text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#f96e03] focus:ring-1 focus:ring-[#f96e03]/30 transition-all font-sans resize-none"
              />
              <span className="absolute bottom-1.5 right-2 text-[9px] font-mono text-stone-400">
                {noteText.length}/600
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-xs font-mono font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-[0_2px_12px_rgba(249,110,3,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#1E1810] border-t-transparent rounded-full animate-spin" />
                  <span>Publicando nota...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publicar Nota en la Galería</span>
                </>
              )}
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}
