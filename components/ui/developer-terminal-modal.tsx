'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { CALENDAR_BOOKING_URL, CONTACT_EMAIL } from '@/lib/constants';

type HistoryEntry = {
  command: string;
  output: string | React.ReactNode;
};

export function DeveloperTerminalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: 'welcome',
      output: (
        <div className="space-y-1 text-xs">
          <p className="text-emerald-400 font-bold">
            Andrés Morales CLI [Version 2.4.0-prod]
          </p>
          <p className="text-zinc-400">
            Type <span className="text-theme-1 font-bold">help</span> to view available commands or press <span className="text-zinc-200">ESC</span> to close.
          </p>
        </div>
      ),
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: "~" (Backquote) or open event
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Toggle only if not in another text input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleGlobalKey);
    window.addEventListener('open-dev-terminal', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      window.removeEventListener('open-dev-terminal', handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, history]);

  const executeCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();

    let output: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-zinc-300 font-bold mb-1">Available commands:</p>
            <p><span className="text-theme-1 font-bold">projects</span> — List recent production platforms</p>
            <p><span className="text-theme-1 font-bold">automation</span> — Inspect n8n and AI agent pipelines</p>
            <p><span className="text-theme-1 font-bold">skills</span> — Full technical stack & architecture</p>
            <p><span className="text-theme-1 font-bold">contact</span> — Instant booking, email and telegram</p>
            <p><span className="text-theme-1 font-bold">whoami</span> — Identity & background summary</p>
            <p><span className="text-theme-1 font-bold">clear</span> — Clear the terminal history</p>
            <p><span className="text-theme-1 font-bold">exit</span> — Close the developer console</p>
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-emerald-400 font-bold">17 Verified Client Systems:</p>
            <p>• <span className="text-white font-bold">Impresos Americana</span> — 3D B2B Quotation Engine (-38% scrap)</p>
            <p>• <span className="text-white font-bold">EmbryoGlass</span> — Liquid Glassmorphism IVF clinical suite</p>
            <p>• <span className="text-white font-bold">Qué Nivel, Maribel!</span> — Cultural ticketing & attendee CRM</p>
            <p>• <span className="text-white font-bold">Barriotech</span> — GPS Fleet logistics in Leaflet + PostgreSQL</p>
            <p>• <span className="text-white font-bold">Superllantas</span> — 4x4 Off-road multi-brand catalog</p>
            <p className="text-zinc-400 text-[11px] mt-1">Scroll up on the page to view in full 3D orbital canvas.</p>
          </div>
        );
        break;

      case 'automation':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-accent font-bold">Core Production Pipelines:</p>
            <p>1. E-com Bulk Ingestion: CSV ──▶ OpenAI ──▶ Marketplaces (6× faster)</p>
            <p>2. SEO Dynamic Copy: Photo ──▶ Vision Engine ──▶ Shopify (+47% CTR)</p>
            <p>3. Product Photography AI: Raw ──▶ AI Cutout ──▶ 4K WebP (12hr → 12min)</p>
            <p>4. Omnichannel Dispatch: 1-Click ──▶ n8n ──▶ 5 Channels Sync</p>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-zinc-200 font-bold">Technical Stack:</p>
            <p>• <span className="text-zinc-400">Frontend:</span> Next.js 16 (App Router), React 19, TypeScript, Three.js, Tailwind</p>
            <p>• <span className="text-zinc-400">Automation:</span> n8n, Make, OpenAI API, Anthropic Claude, LangChain</p>
            <p>• <span className="text-zinc-400">Backend / DB:</span> PostgreSQL, Supabase, Prisma, Redis, Docker</p>
            <p>• <span className="text-zinc-400">Infra / DevOps:</span> VPS Linux (systemd), Nginx reverse proxy, Cloudflare, Vercel</p>
          </div>
        );
        break;

      case 'whoami':
        output = (
          <p className="text-xs text-zinc-300 leading-relaxed">
            Andrés Morales — AI Consultant & Full-Stack Systems Architect. Helping businesses eliminate manual drag with autonomous workflows, high-converting platforms and zero fluff.
          </p>
        );
        break;

      case 'contact':
        output = (
          <div className="space-y-1 text-xs">
            <p className="text-emerald-400 font-bold">Direct Channels:</p>
            <p>• Calendar: <a href={CALENDAR_BOOKING_URL} target="_blank" rel="noreferrer" className="text-theme-1 underline">calendar.app.google</a></p>
            <p>• Email: <span className="text-white">{CONTACT_EMAIL}</span></p>
            <p>• Telegram: <span className="text-accent">@andresmorales</span></p>
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
        setIsOpen(false);
        setInputVal('');
        return;

      default:
        output = (
          <p className="text-rose-400 text-xs">
            command not found: {cmd}. Type <span className="text-theme-1 underline">help</span> for available options.
          </p>
        );
    }

    setHistory((prev) => [...prev, { command: trimmed, output }]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = historyIndex + 1;
        if (nextIdx < cmdHistory.length) {
          setHistoryIndex(nextIdx);
          setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(cmdHistory[cmdHistory.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Developer Terminal Console"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`w-full bg-[#121110] border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 font-mono ${
          isExpanded ? 'h-[90vh] max-w-5xl' : 'h-[460px] max-w-2xl'
        }`}
      >
        {/* Terminal Header Bar */}
        <div className="bg-[#1a1918] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors"
              title="Close terminal"
            />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors"
              title="Expand terminal"
            />
            <span className="text-xs text-zinc-400 ml-2 font-mono flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-theme-1" />
              <span>andres@portfolio:~</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
              title={isExpanded ? 'Restore' : 'Maximize'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Terminal Output */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {history.map((entry, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-emerald-400 font-bold">➜</span>
                <span className="text-accent font-semibold">~</span>
                <span className="text-white">{entry.command}</span>
              </div>
              <div className="pl-4 border-l border-zinc-800 text-zinc-300">
                {entry.output}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Prompt Input Row */}
        <div className="p-3 bg-[#181716] border-t border-zinc-800 flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-xs">➜</span>
          <span className="text-accent text-xs font-semibold">~</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type help, projects, skills..."
            className="flex-1 bg-transparent border-none text-white text-xs font-mono focus:outline-none placeholder:text-zinc-600"
          />
        </div>
      </div>
    </div>
  );
}
