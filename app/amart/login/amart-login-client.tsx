'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Palette, Lock, User, ArrowRight, Sparkles, Globe } from 'lucide-react';

export default function AmArtLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/amart/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError('Error de conexión con el servidor de arte');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#12100E] text-[#EDE8E3] flex flex-col items-center justify-center p-4 selection:bg-[#E08738] selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E08738]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#1A1715] text-[#E08738] border border-[#E08738]/40 flex items-center justify-center mx-auto shadow-2xl">
            <Palette className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E08738] font-bold">
              Taller de Arte • Andrés Morales
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#EDE8E3]">
              Bocetos de Piel
            </h1>
            <p className="text-xs text-[#A69E96] mt-1">
              Acceso exclusivo al panel curador y gestor de catálogo
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#1A1715]/90 backdrop-blur-md border border-[#EDE8E3]/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-center font-mono animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#EDE8E3] mb-1.5">
                Usuario Curador
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A69E96]" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#24201D] border border-[#EDE8E3]/15 text-white placeholder-stone-500 focus:border-[#E08738] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDE8E3] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A69E96]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#24201D] border border-[#EDE8E3]/15 text-white placeholder-stone-500 focus:border-[#E08738] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#E08738] hover:bg-[#cf782d] text-[#12100E] transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Validando...' : 'Entrar al Panel de Arte'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#EDE8E3]/10 flex items-center justify-between text-[11px] text-[#A69E96]">
            <a
              href="https://amart.andresmorales.com.co"
              className="hover:text-[#E08738] transition-colors flex items-center gap-1"
            >
              <Globe className="w-3 h-3" />
              <span>Ver Galería</span>
            </a>
            <a
              href="https://andresmorales.com.co"
              className="hover:text-[#E08738] transition-colors"
            >
              andresmorales.com.co
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
