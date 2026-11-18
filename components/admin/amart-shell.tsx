'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Image as ImageIcon,
  Upload,
  Settings,
  Globe,
  ExternalLink,
  LogOut,
  Sparkles,
  Menu,
  X,
  MessageSquare,
  ShieldCheck,
  Heart,
  BookOpen,
} from 'lucide-react';

interface AmArtShellProps {
  children: React.ReactNode;
  username: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AmArtShell({
  children,
  username,
  title,
  subtitle,
  actions,
}: AmArtShellProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/amart/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#141210] text-[#EDE8E3] flex font-sans selection:bg-[#E08738] selection:text-white">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR                                         */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#1A1715] border-r border-[#EDE8E3]/10 shrink-0 h-full z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#EDE8E3]/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0F0E0C] text-[#E08738] flex items-center justify-center font-serif font-bold text-base border border-[#E08738]/40 shadow-sm shrink-0">
            AM
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E08738] animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#E08738] font-bold">
                Panel Curador
              </p>
            </div>
            <h2 className="text-base font-serif font-bold text-[#EDE8E3] truncate">
              Bocetos de Piel
            </h2>
            <p className="text-[11px] text-[#A69E96] truncate">Andrés Morales • Taller de Arte</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#A69E96]/70 font-bold mb-2">
              Galería & Obras
            </p>
            <nav className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#26221E] text-white shadow-sm border border-[#EDE8E3]/10">
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-[#E08738]" />
                  <span>Catálogo de Obras</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E08738] text-[#141210] font-bold">
                  Bocetos
                </span>
              </div>
            </nav>
          </div>

          <div className="p-4 rounded-2xl bg-[#211D1A] border border-[#EDE8E3]/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#EDE8E3]">
              <Sparkles className="w-4 h-4 text-[#E08738]" />
              <span>Galería Pública</span>
            </div>
            <p className="text-[11px] text-[#A69E96] leading-relaxed">
              Explora la experiencia 3D estelar y catálogo en vivo en amart.andresmorales.com.co.
            </p>
            <a
              href="https://amart.andresmorales.com.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-[#2C2723] hover:bg-[#38322D] text-[#EDE8E3] border border-[#EDE8E3]/10 transition-colors"
            >
              <span>Abrir amart</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#E08738]" />
            </a>
          </div>

          <div className="px-3 pt-2">
            <a
              href="https://andresmorales.com.co/es/admin/crm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-[#A69E96] hover:text-[#EDE8E3] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#E08738]" />
              <span>Ir a andresmorales.com.co (CRM)</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
            </a>
          </div>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-[#EDE8E3]/10 bg-[#161412]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2C2723] text-[#E08738] border border-[#E08738]/40 flex items-center justify-center text-xs font-mono font-bold">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#EDE8E3] capitalize">{username}</p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Curador Activo</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Cerrar Sesión AmArt"
              className="p-2 rounded-lg text-[#A69E96] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MOBILE DRAWER OVERLAY                                   */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-[#1A1715] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#EDE8E3]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F0E0C] text-[#E08738] flex items-center justify-center font-serif font-bold text-sm border border-[#E08738]/40">
              AM
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#E08738] font-bold">
                AmArt Curador
              </p>
              <h2 className="text-sm font-serif font-bold text-[#EDE8E3]">
                Bocetos de Piel
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-[#A69E96] hover:bg-[#2C2723]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <a
            href="https://amart.andresmorales.com.co"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#26221E] text-xs font-semibold text-[#EDE8E3]"
          >
            <span>Ver Galería En Vivo</span>
            <ExternalLink className="w-4 h-4 text-[#E08738]" />
          </a>
        </div>

        <div className="p-4 border-t border-[#EDE8E3]/10 bg-[#161412] flex items-center justify-between">
          <span className="text-xs font-bold text-[#EDE8E3]">{username}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN VIEWPORT                                            */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="shrink-0 lg:hidden bg-[#1A1715] border-b border-[#EDE8E3]/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#EDE8E3] hover:bg-[#2C2723] cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E08738]" />
              <h1 className="text-sm font-serif font-bold text-[#EDE8E3]">
                {title || 'Bocetos de Piel • AmArt'}
              </h1>
            </div>
          </div>

          <a
            href="https://amart.andresmorales.com.co"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-[#A69E96] hover:text-[#E08738]"
            title="Ver Galería"
          >
            <Globe className="w-4 h-4" />
          </a>
        </header>

        {/* Desktop Header */}
        {(title || actions) && (
          <div className="shrink-0 hidden lg:flex px-8 py-5 bg-[#1A1715] border-b border-[#EDE8E3]/10 items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#EDE8E3] tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#A69E96] mt-0.5 font-sans">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2.5">{actions}</div>}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overscroll-contain bg-[#141210]">
          {children}
        </div>
      </div>
    </div>
  );
}
