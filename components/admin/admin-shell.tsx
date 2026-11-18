'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Palette,
  FileText,
  BarChart3,
  Mail,
  Zap,
  Globe,
  ImageIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Cloud,
  Target,
  UserCheck,
  Building2,
} from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
  username: string;
  locale: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminShell({
  children,
  username,
  locale,
  title,
  subtitle,
  actions,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push(`/${locale}/admin/login`);
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: 'CRM & Briefs',
      href: `/${locale}/admin/crm`,
      icon: Users,
      badge: 'Pipeline',
    },
    {
      label: 'Clientes',
      href: `/${locale}/admin/clients`,
      icon: UserCheck,
      badge: 'Directorio',
    },
    {
      label: 'Empresas',
      href: `/${locale}/admin/companies`,
      icon: Building2,
      badge: 'B2B',
    },
    {
      label: 'WhatsApp Chat',
      href: `/${locale}/admin/chat`,
      icon: MessageSquare,
      badge: 'En vivo',
    },
    {
      label: 'Hunter de Prospectos',
      href: `/${locale}/admin/prospecting`,
      icon: Target,
      badge: 'IA',
    },
    {
      label: 'Automatizaciones & IA',
      href: `/${locale}/admin/automations`,
      icon: Zap,
      badge: 'Agente',
    },
    {
      label: 'Analíticas Web',
      href: `/${locale}/admin/analytics`,
      icon: BarChart3,
      badge: 'Umami',
    },
    {
      label: 'Borradores Blog',
      href: `/${locale}/drafts`,
      icon: FileText,
    },
    {
      label: 'Servicios & Cloud',
      href: `/${locale}/admin/services`,
      icon: Cloud,
    },
  ];

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#F8F5F4] text-[#1E1810] flex font-sans selection:bg-[#f96e03] selection:text-white">
      {/* ======================================================== */}
      {/* DESKTOP SIDEBAR                                         */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-[#1E1810]/10 shrink-0 h-full z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#1E1810]/10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#1E1810] text-[#f96e03] flex items-center justify-center font-serif font-bold text-lg border-2 border-[#f96e03] shadow-sm shrink-0">
            AM
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f96e03] animate-pulse" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#f96e03] font-bold">
                Panel Central
              </p>
            </div>
            <h2 className="text-base font-serif font-bold text-[#1E1810] truncate">
              Andrés Morales
            </h2>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">
          {/* Main Management */}
          <div>
            <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#575250]/70 font-bold mb-2">
              Gestión Principal
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#1E1810] text-white shadow-sm'
                        : 'text-[#1E1810]/80 hover:bg-[#F8F5F4] hover:text-[#1E1810]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#f96e03]' : 'text-[#575250]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[#f96e03] text-[#1E1810] font-bold'
                            : 'bg-stone-100 text-[#575250]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-[#1E1810]/10 bg-stone-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1E1810] text-white flex items-center justify-center text-xs font-mono font-bold">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#1E1810] capitalize">{username}</p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Autenticado</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              title="Cerrar Sesión"
              className="p-2 rounded-lg text-[#575250] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Sheet */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-[#1E1810]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1E1810] text-[#f96e03] flex items-center justify-center font-serif font-bold border border-[#f96e03]">
              AM
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#f96e03] font-bold">
                Panel Central
              </p>
              <h2 className="text-sm font-serif font-bold text-[#1E1810]">
                Andrés Morales
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#575250]/70 font-bold mb-2">
              Gestión Principal
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                      isActive
                        ? 'bg-[#1E1810] text-white shadow-sm'
                        : 'text-[#1E1810]/80 hover:bg-[#F8F5F4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#f96e03]' : 'text-[#575250]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f96e03] text-[#1E1810] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-[#1E1810]/10 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1E1810]">{username}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50"
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
        {/* Top bar on Mobile */}
        <header className="shrink-0 lg:hidden bg-white border-b border-[#1E1810]/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-lg text-[#1E1810] hover:bg-stone-100 cursor-pointer"
              aria-label="Abrir Menú Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f96e03]" />
              <h1 className="text-sm font-serif font-bold text-[#1E1810]">
                {title || 'Panel Andrés Morales'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://andresmorales.com.co"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-stone-600 hover:text-[#f96e03]"
              title="Ver Portafolio"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* Content Header if provided */}
        {(title || actions) && (
          <div className="shrink-0 hidden lg:flex px-8 py-5 bg-white border-b border-[#1E1810]/10 items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#1E1810] tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-[#575250] mt-0.5 font-sans">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2.5">{actions}</div>}
          </div>
        )}

        {/* Page Content Body */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
