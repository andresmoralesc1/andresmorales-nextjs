'use client';

import React, { useState, useMemo } from 'react';
import type { GallerySettings } from '@/lib/gallery-store';
import type { ArtworkCard, CollectionMeta, CollectionKey } from '@/lib/artworks-data';
import { AdminShell } from '@/components/admin/admin-shell';
import { AmArtShell } from '@/components/admin/amart-shell';
import {
  Sparkles,
  Upload,
  Settings,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Plus,
  X,
  Palette,
} from 'lucide-react';

interface Props {
  initialSettings: GallerySettings;
  initialCollections: Record<string, CollectionMeta>;
  initialArtworks: ArtworkCard[];
  username: string;
  locale: string;
  isAmArtStandalone?: boolean;
}

export default function ArtAdminClient({
  initialSettings,
  initialCollections,
  initialArtworks,
  username,
  locale,
  isAmArtStandalone = false,
}: Props) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'settings' | 'upload' | 'artworks'>('settings');

  // Settings state
  const [settings, setSettings] = useState<GallerySettings>(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Artworks state
  const [artworks, setArtworks] = useState<ArtworkCard[]>(initialArtworks);
  const [search, setSearch] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTechnique, setUploadTechnique] = useState('Tinta y carboncillo sobre papel');
  const [uploadCollection, setUploadCollection] = useState<CollectionKey>('figura-humana');
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Editing existing artwork modal
  const [editingCard, setEditingCard] = useState<ArtworkCard | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Save General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsNotice(null);

    try {
      const res = await fetch('/api/admin/art', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSettingsNotice('¡Configuración actualizada con éxito!');
        setTimeout(() => setSettingsNotice(null), 4000);
      } else {
        setSettingsNotice(data.error || 'Error al guardar configuración');
      }
    } catch {
      setSettingsNotice('Error de conexión');
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const objUrl = URL.createObjectURL(f);
      setPreviewUrl(objUrl);
    }
  };

  // Handle Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadNotice({ type: 'err', text: 'Por favor selecciona una imagen.' });
      return;
    }

    setUploading(true);
    setUploadNotice(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);
    formData.append('technique', uploadTechnique);
    formData.append('collection', uploadCollection);

    try {
      const res = await fetch('/api/admin/art/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setArtworks((prev) => [data.artwork, ...prev]);
        setUploadNotice({ type: 'ok', text: data.message || 'Obra subida exitosamente.' });
        setFile(null);
        setPreviewUrl(null);
        setUploadTitle('');
        setUploadDescription('');
        setTimeout(() => setUploadNotice(null), 5000);
      } else {
        setUploadNotice({ type: 'err', text: data.error || 'Error al subir obra.' });
      }
    } catch {
      setUploadNotice({ type: 'err', text: 'Error de red al subir la imagen.' });
    } finally {
      setUploading(false);
    }
  };

  // Handle Edit Artwork
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setEditSaving(true);
    try {
      const res = await fetch('/api/admin/art/artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCard),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setArtworks((prev) =>
          prev.map((a) => (a.id === editingCard.id ? data.artwork : a))
        );
        setEditingCard(null);
      } else {
        alert(data.error || 'Error al actualizar obra');
      }
    } catch {
      alert('Error de red');
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Delete Artwork
  const handleDeleteArtwork = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar la obra #${id} "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/art/artwork?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setArtworks((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert(data.error || 'Error al eliminar obra');
      }
    } catch {
      alert('Error de red al eliminar');
    }
  };

  // Filtered artworks
  const filteredArtworks = useMemo(() => {
    return artworks.filter((a) => {
      const matchSearch =
        search === '' ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.id.includes(search) ||
        (a.technique && a.technique.toLowerCase().includes(search.toLowerCase())) ||
        (a.description && a.description.toLowerCase().includes(search.toLowerCase()));

      const matchColl =
        selectedCollection === 'all' || a.collection === selectedCollection;

      return matchSearch && matchColl;
    });
  }, [artworks, search, selectedCollection]);

  const Shell = isAmArtStandalone ? AmArtShell : AdminShell;

  return (
    <Shell
      username={username}
      locale={locale}
      title="Gestor de Galería de Arte"
      subtitle={`${artworks.length} obras registradas en Bocetos de Piel • Optimización WebP y gestión de textos`}
      actions={
        <div className="flex items-center gap-2">
          <a
            href="https://amart.andresmorales.com.co"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1E1810]/15 hover:border-[#f96e03] text-xs font-semibold text-[#1E1810] transition-all shadow-sm"
          >
            <span>Ver Galería En Vivo</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#f96e03]" />
          </a>
          <button
            onClick={() => setActiveTab('upload')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Subir Foto</span>
          </button>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white border border-[#1E1810]/10 rounded-2xl p-2.5 shadow-sm">
          <button
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1E1810] text-white shadow-sm'
                : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
            }`}
          >
            <Settings className="w-4 h-4 text-[#f96e03]" />
            <span>1. Título y Subtítulo General</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#1E1810] text-white shadow-sm'
                : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
            }`}
          >
            <Upload className="w-4 h-4 text-[#f96e03]" />
            <span>2. Subir Nueva Foto / Obra</span>
          </button>

          <button
            onClick={() => setActiveTab('artworks')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'artworks'
                ? 'bg-[#1E1810] text-white shadow-sm'
                : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#f96e03]" />
            <span>3. Catálogo de Obras ({artworks.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: General Settings (Title, Subtitle, Tagline, Desc)  */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-[#1E1810] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#f96e03]" />
                Editar Título y Subtítulo de la Galería
              </h2>
              <p className="text-xs text-[#575250] mt-1 font-sans">
                Estos textos aparecen en la cabecera de la galería, en la barra del tendedero y en los metadatos de Google.
              </p>
            </div>

            {settingsNotice && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{settingsNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Título Principal de la Galería
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="Bocetos de Piel"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                  required
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Ejemplo: <em>Bocetos de Piel</em> o <em>Trazo & Movimiento</em>
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Subtítulo / Bajada de Marca
                </label>
                <input
                  type="text"
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  placeholder="Andrés Morales • Taller de Arte"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                  required
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Aparece encima del título con el indicador luminoso naranja.
                </p>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Tagline / Frase Corta
                </label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  placeholder="Colección de Arte & Bocetos Originales"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Descripción General (SEO y Social Share)
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E1810] hover:bg-[#f96e03] text-white hover:text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: Upload New Photo (Automatic WebP & Thumbnails)    */}
        {/* ======================================================== */}
        {activeTab === 'upload' && (
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm max-w-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-[#1E1810] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#f96e03]" />
                Subir Nueva Foto / Obra
              </h2>
              <p className="text-xs text-[#575250] mt-1 font-sans">
                Sube la foto del boceto o pintura. El sistema la optimiza automáticamente en WebP y crea la versión miniatura para el tendedero y la de alta resolución.
              </p>
            </div>

            {uploadNotice && (
              <div
                className={`mb-6 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                  uploadNotice.type === 'ok'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {uploadNotice.type === 'ok' ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{uploadNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-5">
              {/* File Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Archivo de Imagen (JPG, PNG o WEBP)
                </label>
                <div className="relative border-2 border-dashed border-stone-300 hover:border-[#f96e03] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-stone-50/70">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required
                  />
                  {previewUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-48 rounded-xl shadow-md object-contain border border-stone-200"
                      />
                      <p className="text-xs text-[#f96e03] font-bold">
                        {file?.name} ({(file!.size / 1024).toFixed(0)} KB) — Clic para cambiar
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#575250]">
                      <Upload className="w-8 h-8 text-[#f96e03] mb-1" />
                      <p className="text-xs sm:text-sm font-semibold text-[#1E1810]">
                        Arrastra una foto aquí o haz clic para seleccionarla
                      </p>
                      <p className="text-xs text-stone-400">Soporta JPG, PNG y WebP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Título de la Obra
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Ej: Curva Lunar • Asana III"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                />
              </div>

              {/* Series / Collection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Serie / Colección
                </label>
                <select
                  value={uploadCollection}
                  onChange={(e) => setUploadCollection(e.target.value as CollectionKey)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                >
                  <option value="yoga">Serie Yoga & Asanas</option>
                  <option value="shibari">Serie Shibari & Kinbaku</option>
                  <option value="anatomia-botanica">Serie Anatomía Botánica</option>
                  <option value="pregnant">Serie Pregnant & Maternidad</option>
                  <option value="figura-humana">Estudios de Figura Humana</option>
                </select>
              </div>

              {/* Technique */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Técnica Artística
                </label>
                <input
                  type="text"
                  value={uploadTechnique}
                  onChange={(e) => setUploadTechnique(e.target.value)}
                  placeholder="Tinta y carboncillo sobre papel"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1.5 font-bold">
                  Descripción o Nota Artística
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                  placeholder="Breve nota sobre el trazo, la modelo o la intención visual."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{uploading ? 'Optimizando y Subiendo...' : 'Publicar Obra en la Galería'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: Artworks Catalog & Individual Editor              */}
        {/* ======================================================== */}
        {activeTab === 'artworks' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#1E1810]/10 rounded-2xl p-3 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por ID, título o técnica..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-stone-400" />
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] transition-colors"
                >
                  <option value="all">Todas las Series ({artworks.length})</option>
                  <option value="yoga">Yoga</option>
                  <option value="shibari">Shibari</option>
                  <option value="anatomia-botanica">Anatomía Botánica</option>
                  <option value="pregnant">Pregnant</option>
                  <option value="figura-humana">Figura Humana</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredArtworks.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-stone-200 hover:border-[#f96e03] rounded-2xl p-3 flex gap-3 shadow-sm hover:shadow-md transition-all text-[#1E1810]"
                >
                  <img
                    src={card.imageUrl}
                    alt={card.alt}
                    className="w-20 h-28 object-cover rounded-xl bg-stone-100 shrink-0 border border-stone-100"
                    loading="lazy"
                  />
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-[#f96e03] font-bold">
                          #{card.id}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 uppercase truncate">
                          {card.collectionLabel || card.collection}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-[#1E1810] truncate" title={card.title}>
                        {card.title}
                      </h3>
                      {card.technique && (
                        <p className="text-[11px] text-[#575250] truncate mt-0.5">
                          {card.technique}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-stone-100 mt-2">
                      <button
                        type="button"
                        onClick={() => setEditingCard(card)}
                        className="inline-flex items-center gap-1 text-xs text-[#575250] hover:text-[#f96e03] transition-colors px-2 py-1 rounded-lg hover:bg-stone-50 cursor-pointer font-medium"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteArtwork(card.id, card.title)}
                        className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Eliminar obra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredArtworks.length === 0 && (
              <div className="text-center py-16 text-stone-400 text-xs font-mono">
                No se encontraron obras con ese criterio.
              </div>
            )}
          </div>
        )}

        {/* Modal: Edit Existing Artwork */}
        {editingCard && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <h3 className="text-base font-serif font-bold text-[#1E1810] flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#f96e03]" />
                  Editar Obra #{editingCard.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="text-stone-400 hover:text-[#1E1810] p-1 rounded-lg hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Título
                  </label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Serie / Colección
                  </label>
                  <select
                    value={editingCard.collection}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        collection: e.target.value as CollectionKey,
                        collectionLabel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  >
                    <option value="yoga">Yoga & Asanas</option>
                    <option value="shibari">Shibari & Kinbaku</option>
                    <option value="anatomia-botanica">Anatomía Botánica</option>
                    <option value="pregnant">Pregnant & Maternidad</option>
                    <option value="figura-humana">Figura Humana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Técnica Artística
                  </label>
                  <input
                    type="text"
                    value={editingCard.technique || ''}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, technique: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Descripción / Nota
                  </label>
                  <textarea
                    value={editingCard.description || ''}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setEditingCard(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#575250] hover:bg-stone-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editSaving ? 'Guardando...' : 'Guardar Obra'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
