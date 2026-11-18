'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

export type UploadedBriefFile = {
  name: string;
  url: string;
  size: number;
  type: string;
};

export interface BriefFileUploadProps {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  files: UploadedBriefFile[];
  onChange: (files: UploadedBriefFile[]) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function isImageFile(name: string, type: string): boolean {
  if (type.startsWith('image/')) return true;
  const ext = name.toLowerCase().split('.').pop() || '';
  return ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);
}

function getFileIcon(name: string): string {
  const ext = name.toLowerCase().split('.').pop() || '';
  if (['ai', 'eps', 'svg', 'fig', 'sketch'].includes(ext)) return '🎨';
  if (['pdf'].includes(ext)) return '📑';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return '🖼️';
  if (['zip', 'rar', '7z'].includes(ext)) return '📦';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return '📝';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
  return '📎';
}

export default function BriefFileUpload({
  label,
  hint,
  accept = 'image/*,.ai,.eps,.pdf,.svg,.doc,.docx,.zip',
  multiple = true,
  maxFiles = 5,
  files = [],
  onChange,
  disabled = false,
}: BriefFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadSingleFile(file: File): Promise<UploadedBriefFile | null> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/brief/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || 'Error al subir el archivo');
    }

    return data.file as UploadedBriefFile;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || disabled) return;
    setErrorMessage(null);

    const incoming = Array.from(fileList);
    const availableSlots = maxFiles - files.length;

    if (availableSlots <= 0) {
      setErrorMessage(`Has alcanzado el límite máximo de ${maxFiles} archivos.`);
      return;
    }

    const filesToUpload = incoming.slice(0, availableSlots);
    if (incoming.length > availableSlots) {
      setErrorMessage(`Solo se pudieron procesar ${availableSlots} archivo(s) por el límite máximo.`);
    }

    setIsUploading(true);

    const uploadedResults: UploadedBriefFile[] = [];
    const errors: string[] = [];

    for (const file of filesToUpload) {
      try {
        const uploaded = await uploadSingleFile(file);
        if (uploaded) {
          uploadedResults.push(uploaded);
        }
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message || 'Error al procesar'}`);
      }
    }

    setIsUploading(false);

    if (uploadedResults.length > 0) {
      onChange([...files, ...uploadedResults]);
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(' · '));
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleRemove(index: number) {
    const toRemove = files[index];
    if (!toRemove) return;

    // Optimistically update UI
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);

    // Call DELETE API in background
    try {
      await fetch('/api/brief/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: toRemove.url }),
      });
    } catch {
      // Ignored
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && !isUploading && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-baseline justify-between">
          <span className="block text-sm font-medium text-secondary">
            {label}
          </span>
          <span className="text-xs text-secondary/50 font-mono">
            {files.length}/{maxFiles}
          </span>
        </div>
      )}

      {/* Dropzone */}
      {files.length < maxFiles && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          className={`relative group rounded-xl border-2 border-dashed p-4 sm:p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-theme-1 bg-theme-1/10 shadow-inner'
              : 'border-theme-9 bg-theme-5/40 hover:bg-theme-5/80 hover:border-theme-1/60'
          } ${disabled || isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled || isUploading}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-theme-1/15 text-theme-1 flex items-center justify-center text-lg mb-1 group-hover:scale-105 transition-transform">
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-theme-1 border-t-transparent rounded-full animate-spin" />
              ) : (
                '☁️'
              )}
            </div>

            <p className="text-sm font-medium text-secondary">
              {isUploading ? (
                <span className="text-theme-1 font-semibold">Subiendo archivo...</span>
              ) : (
                <>
                  <span className="text-theme-1 font-semibold underline decoration-theme-1/40 underline-offset-2">
                    Haz clic para examinar
                  </span>{' '}
                  o arrastra aquí
                </>
              )}
            </p>

            {hint ? (
              <p className="text-xs text-secondary/60 max-w-md">{hint}</p>
            ) : (
              <p className="text-[11px] text-secondary/50">
                Imágenes, vectores (.AI, .EPS, .SVG, .PDF) o documentos (máx. 15MB)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error alert */}
      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-600 flex items-start gap-2">
          <span>⚠️</span>
          <span className="flex-1">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-600 font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <ul className="space-y-2 pt-1">
          {files.map((file, idx) => {
            const isImg = isImageFile(file.name, file.type);
            const icon = getFileIcon(file.name);

            return (
              <li
                key={file.url || idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background border border-theme-9 hover:border-theme-1/40 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Preview or icon */}
                  {isImg ? (
                    <div className="w-9 h-9 rounded-lg bg-theme-5/80 border border-theme-9 overflow-hidden shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to emoji icon if image preview fails
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-theme-1/10 border border-theme-1/20 shrink-0 flex items-center justify-center text-base">
                      {icon}
                    </div>
                  )}

                  {/* Name and size */}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-secondary truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-secondary/50 font-mono">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-theme-5 text-secondary hover:text-theme-1 font-medium text-[11px] border border-theme-9 hover:border-theme-1/30 transition-all inline-flex items-center gap-1"
                  >
                    <span>Ver</span>
                    <span>↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Eliminar archivo"
                    className="w-7 h-7 rounded-lg text-secondary/50 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
