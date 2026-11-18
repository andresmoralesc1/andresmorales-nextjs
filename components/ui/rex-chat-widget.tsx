'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { RexAvatar, RexEmotion } from './rex-avatar';

const RexCalendarPicker = dynamic(
  () => import('./rex-calendar-picker').then((m) => m.RexCalendarPicker),
  { ssr: false }
);
import type { Locale } from '@/lib/i18n';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Zap,
  Bot,
  Calendar,
  ExternalLink,
  ChevronDown,
  PhoneCall,
  CheckCheck,
} from 'lucide-react';

interface RexChatWidgetProps {
  locale?: Locale;
}

interface Message {
  id: string;
  role: 'rex' | 'user';
  text: string;
  time: string;
  wantsHuman?: boolean;
}

const ANDRES_PHONE = '+57 316 148 2507';
const ANDRES_WA_CLEAN = '573161482507';
const CALENDAR_URL = 'https://calendar.app.google/QvUUb5xu4927P95a8';

const I18N = {
  es: {
    title: 'autoRex · Asistente IA',
    subtitle: 'Andrés Morales · Web & AI Architect',
    bubbleGreeting: '¡Hola! Soy autoRex. ¿Hablamos de automatizar tu negocio o auditar tu página web?',
    welcome:
      '¡Hola! Soy autoRex, el asistente virtual de Andrés Morales. Diseñamos sitios web de alto rendimiento y automatizamos flujos de trabajo inteligentes con n8n e IA.\n\n¿En qué tipo de proyecto digital te gustaría enfocarte hoy?',
    inputPlaceholder: 'Pregúntale a autoRex sobre tu proyecto...',
    send: 'Enviar',
    whatsappButton: 'Continuar en WhatsApp',
    whatsappDisclaimer: 'Chat directo con Andrés Morales',
    typing: 'autoRex está pensando...',
    quickPromptTitle: 'Acciones rápidas:',
    chips: [
      { label: '⚡ Auditoría Web 360°', text: 'Quiero una auditoría gratuita de velocidad y UX para mi página web' },
      { label: '🤖 Automatizar con n8n', text: '¿Cómo me ayuda Andrés a automatizar procesos con n8n e IA?' },
      { label: '📅 Agendar llamada 30 min', text: 'Quiero agendar una llamada directa de 30 min con Andrés Morales' },
      { label: '💬 Hablar con Andrés', text: 'Quiero hablar con un humano o directamente con Andrés Morales' },
    ],
    whatsappPrefill: '¡Hola Andrés! Estuve hablando con autoRex en tu web y quiero hablar directamente contigo sobre mi proyecto:',
    auditAction: 'Probar Auditoría en vivo',
    calendarAction: 'Agendar llamada gratis',
    close: 'Cerrar chat',
  },
  en: {
    title: 'autoRex · AI Assistant',
    subtitle: 'Andrés Morales · Web & AI Architect',
    bubbleGreeting: "Hi! I'm autoRex. Want to automate your business workflows or audit your website?",
    welcome:
      "Hi! I'm autoRex, Andrés Morales' AI assistant. We build high-performance websites and automate business workflows with n8n and AI.\n\nWhat kind of digital project are you looking to build?",
    inputPlaceholder: 'Ask autoRex about your project...',
    send: 'Send',
    whatsappButton: 'Continue on WhatsApp',
    whatsappDisclaimer: 'Direct chat with Andrés Morales',
    typing: 'autoRex is thinking...',
    quickPromptTitle: 'Quick actions:',
    chips: [
      { label: '⚡ 360° Web Audit', text: 'I want a free speed, UX, and AI audit for my website' },
      { label: '🤖 Automate with n8n', text: 'How can Andrés help us automate workflows with n8n and AI?' },
      { label: '📅 Book 30-min Call', text: 'I would like to book a 30-minute discovery call with Andrés' },
      { label: '💬 Talk to Andrés', text: 'I would like to speak directly with Andrés Morales or a human' },
    ],
    whatsappPrefill: 'Hello Andrés! I was chatting with autoRex on your website and would like to speak directly with you about my project:',
    auditAction: 'Try Live 360° Audit',
    calendarAction: 'Book Free 30-min Call',
    close: 'Close chat',
  },
  pt: {
    title: 'autoRex · Assistente IA',
    subtitle: 'Andrés Morales · Web & AI Architect',
    bubbleGreeting: 'Olá! Sou o autoRex. Quer automatizar seu negócio ou auditar seu site?',
    welcome:
      'Olá! Sou o autoRex, assistente virtual do Andrés Morales. Desenvolvemos sites de alta performance e automatizamos fluxos inteligentes com n8n e IA.\n\nEm qual projeto digital você gostaria de focar hoje?',
    inputPlaceholder: 'Pergunte ao autoRex sobre seu projeto...',
    send: 'Enviar',
    whatsappButton: 'Continuar no WhatsApp',
    whatsappDisclaimer: 'Chat direto com Andrés Morales',
    typing: 'autoRex está pensando...',
    quickPromptTitle: 'Ações rápidas:',
    chips: [
      { label: '⚡ Auditoria Web 360°', text: 'Quero uma auditoria gratuita de velocidade e UX para meu site' },
      { label: '🤖 Automatizar com n8n', text: 'Como o Andrés pode me ajudar a automatizar fluxos com n8n e WhatsApp?' },
      { label: '📅 Agendar chamada 30 min', text: 'Gostaria de agendar uma reunião de 30 minutos com o Andrés' },
      { label: '💬 Falar com o Andrés', text: 'Quero falar diretamente com o Andrés Morales ou um atendente humano' },
    ],
    whatsappPrefill: 'Olá Andrés! Estive conversando com o autoRex no seu site e gostaria de falar diretamente com você sobre o meu projeto:',
    auditAction: 'Testar Auditoria 360°',
    calendarAction: 'Agendar chamada gratuita',
    close: 'Fechar chat',
  },
};

function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function RexChatWidget({ locale = 'es' }: RexChatWidgetProps) {
  const t = I18N[locale] || I18N.es;
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emotion, setEmotion] = useState<RexEmotion>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize messages and trigger greeting bubble after initial mount
  useEffect(() => {
    // Check session storage to avoid spamming greeting
    const hasSeenGreeting = typeof window !== 'undefined' && sessionStorage.getItem('rex_seen_greeting');

    const initial: Message = {
      id: 'init-1',
      role: 'rex',
      text: t.welcome,
      time: formatTime(),
    };
    setMessages([initial]);

    if (!hasSeenGreeting) {
      const timer = setTimeout(() => {
        setShowBubble(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('rex_seen_greeting', '1');
        }
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [t.welcome]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Auto focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const raw = textToSend !== undefined ? textToSend : inputText;
    const text = raw.trim();
    if (!text || isLoading) return;

    setInputText('');
    setShowBubble(false);

    const lower = text.toLowerCase();
    if (lower.includes('agendar') || lower.includes('reservar cita') || lower.includes('sacar cita') || lower.includes('cita')) {
      setShowCalendar(true);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: formatTime(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          lang: locale,
        }),
      });

      const data = await res.json();
      if (data.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `rex-${Date.now()}`,
            role: 'rex',
            text: data.reply,
            time: formatTime(),
            wantsHuman: data.wantsHuman,
          },
        ]);
        setEmotion(data.reply.includes('?') ? 'question' : 'idle');
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `rex-${Date.now()}`,
            role: 'rex',
            text:
              data.reply ||
              '¡Rugido interceptado! Hubo un detalle técnico temporal. ¿Me repites tu mensaje o prefieres escribirle a Andrés por WhatsApp?',
            time: formatTime(),
            wantsHuman: true,
          },
        ]);
        setEmotion('question');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `rex-${Date.now()}`,
          role: 'rex',
          text: 'Parece que perdí conexión un instante. Si lo prefieres, podemos continuar directamente en el WhatsApp de Andrés.',
          time: formatTime(),
          wantsHuman: true,
        },
      ]);
      setEmotion('question');
    } finally {
      setIsLoading(false);
    }
  };

  const getWhatsAppLink = (customText?: string) => {
    const text = customText || `${t.whatsappPrefill} `;
    return `https://wa.me/${ANDRES_WA_CLEAN}?text=${encodeURIComponent(text)}`;
  };

  // Helper to parse basic bold text and URLs into interactive links
  const renderFormattedText = (raw: string) => {
    const paragraphs = raw.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');
      return (
        <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
          {lines.map((line, lIdx) => {
            // Check for links, calendar, or audit mentions
            const words = line.split(' ');
            return (
              <span key={lIdx} className="block">
                {words.map((w, wIdx) => {
                  if (w.startsWith('http://') || w.startsWith('https://')) {
                    return (
                      <a
                        key={wIdx}
                        href={w}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#9a3412] underline font-semibold hover:text-[#c2410c] inline-flex items-center gap-0.5 mx-0.5"
                      >
                        {w.includes('calendar') ? '📅 Agendar llamada' : w.includes('wa.me') ? '💬 WhatsApp' : 'Ver enlace'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    );
                  }
                  if (w === '/audit' || w === '`/audit`') {
                    return (
                      <Link
                        key={wIdx}
                        href={`/${locale}/audit`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 text-[#9a3412] border border-orange-300 hover:bg-orange-200 font-semibold text-xs mx-0.5"
                      >
                        ⚡ /audit
                      </Link>
                    );
                  }
                  // Basic bold formatting for **word**
                  if (w.startsWith('**') && w.endsWith('**')) {
                    return <strong key={wIdx} className="font-bold text-white">{w.slice(2, -2)} </strong>;
                  }
                  return w + ' ';
                })}
              </span>
            );
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed z-50 pointer-events-auto">
      {/* ── Floating Speech Bubble (Desktop/Tablet Greeting only to prevent mobile clutter) ── */}
      {showBubble && !isOpen && (
        <div
          role="status"
          aria-live="polite"
          className="hidden sm:block fixed bottom-36 right-6 max-w-xs bg-white border border-[#1E1810]/12 shadow-[0_15px_35px_-5px_rgba(30,24,16,0.15)] ring-1 ring-[#1E1810]/5 text-[#1E1810] rounded-2xl p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300 z-50"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex-1 text-xs leading-relaxed text-[#1E1810]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f96e03] animate-pulse" />
                <span className="font-bold text-[#9a3412] tracking-wide text-[11px] uppercase">autoRex</span>
              </div>
              <p className="text-[#1E1810] leading-snug">{t.bubbleGreeting}</p>
            </div>
            <button
              onClick={() => setShowBubble(false)}
              className="text-[#575250] hover:text-[#1E1810] p-1 rounded-full transition-colors shrink-0 -mr-1 -mt-1"
              aria-label={t.close}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Action button inside bubble - VIBRANT ORANGE BUTTON */}
          <div className="mt-2.5 pt-2 border-t border-[#1E1810]/8 flex items-center justify-between">
            <button
              onClick={() => {
                setShowBubble(false);
                setIsOpen(true);
              }}
              className="text-xs font-bold bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1E1810]" />
              Chatear con autoRex
            </button>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#575250] hover:text-[#1E1810] font-medium flex items-center gap-1 transition-colors"
            >
              WhatsApp
              <ExternalLink className="w-2.5 h-2.5 text-[#9a3412]" />
            </a>
          </div>
        </div>
      )}

      {/* ── Floating Button Trigger ── */}
      {/* Positioned at bottom-20 on mobile to clear StickyMobileCTA, and bottom-4 on tablet/desktop */}
      <div className="fixed bottom-20 sm:bottom-4 right-3 sm:right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? t.close : 'Abrir chat con autoRex, asistente de Andrés Morales'}
          className="group relative flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none"
        >
          {isOpen ? (
            <div className="w-12 h-12 rounded-full bg-[#f96e03] hover:bg-[#ff5100] border border-[#f96e03] text-[#1E1810] flex items-center justify-center shadow-lg shadow-[#f96e03]/30 hover:scale-105 active:scale-95 transition-all">
              <ChevronDown className="w-6 h-6 text-[#1E1810] transition-transform duration-200" />
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <RexAvatar size="2xl" animate={true} emotion={emotion} />
              {/* Sleek message badge on Rex */}
              <div className="absolute top-1 right-2 w-6 h-6 rounded-full bg-[#f96e03] border-2 border-[#F8F5F4] text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform">
                <MessageSquare className="w-3 h-3 fill-current" />
              </div>
            </div>
          )}
        </button>
      </div>

      {/* ── Chat Modal / Window (Warm Glossy Glassmorphism with Hero Orange Dots Pattern) ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-[395px] h-[585px] max-h-[calc(100dvh-6rem)] bg-[#F8F5F4]/94 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(30,24,16,0.22)] ring-1 ring-[#1E1810]/8 rounded-3xl flex flex-col overflow-hidden z-50 text-[#1E1810] animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='12' r='1.1' fill='%23f96e03' fill-opacity='0.16'/></svg>")`,
            backgroundRepeat: 'repeat',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-white/85 backdrop-blur-md border-b border-[#1E1810]/8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RexAvatar
                size="md"
                isTalking={isLoading}
                emotion={isLoading ? 'thinking' : showCalendar ? 'question' : emotion}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#1E1810] tracking-tight">{t.title}</h3>
                </div>
                <p className="text-[11px] text-[#575250] line-clamp-1">{t.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* WhatsApp direct handover icon - ORANGE ACCENT BUTTON */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                title={t.whatsappButton}
                className="p-2 rounded-full bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-xs transition-colors"
                aria-label="Abrir chat en WhatsApp"
              >
                <PhoneCall className="w-3.5 h-3.5" />
              </a>

              {/* Minimize / Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] shadow-xs transition-all hover:scale-105 active:scale-95"
                aria-label={t.close}
                title="Minimizar chat"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 text-xs scroll-smooth bg-[#F8F5F4]/30">
            {messages.map((m) => {
              const isRex = m.role === 'rex';
              return (
                <div
                  key={m.id}
                  className={`flex items-start ${isRex ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isRex
                        ? 'bg-white/95 border border-[#1E1810]/8 text-[#1E1810] shadow-[0_2px_8px_rgba(30,24,16,0.04)]'
                        : 'bg-gradient-to-r from-[#f96e03] to-[#ff5100] text-white font-medium shadow-md shadow-[#f96e03]/20'
                    }`}
                  >
                    <div className="leading-relaxed break-words whitespace-pre-wrap">
                      {isRex ? renderFormattedText(m.text) : m.text}
                    </div>

                    {/* WhatsApp Handover Quick Button if autoRex indicates human contact */}
                    {isRex && m.wantsHuman && (
                      <div className="mt-3 pt-2.5 border-t border-[#1E1810]/8 flex flex-col gap-1.5">
                        <a
                          href={getWhatsAppLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] font-bold text-xs transition-colors shadow-xs"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          {t.whatsappButton}
                        </a>
                        <a
                          href={CALENDAR_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#1E1810]/20 hover:border-[#f96e03] hover:bg-[#f96e03]/10 text-[#1E1810] text-[11px] font-bold transition-colors"
                        >
                          <Calendar className="w-3 h-3 text-[#f96e03]" />
                          {t.calendarAction}
                        </a>
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-end gap-1 ${
                        isRex ? 'text-[#575250]/70' : 'text-white/80'
                      }`}
                    >
                      <span>{m.time}</span>
                      {!isRex && <CheckCheck className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-[#575250]">
                <div className="px-3.5 py-2.5 rounded-2xl bg-white/95 border border-[#1E1810]/8 flex items-center gap-1.5 shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f96e03] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f96e03] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#575250] ml-1.5 font-medium">{t.typing}</span>
                </div>
              </div>
            )}

            {/* Interactive Real-Time Google Calendar Slot Picker */}
            {showCalendar && (
              <div className="pt-1">
                <RexCalendarPicker
                  locale={locale}
                  onBookingSuccess={(booking) => {
                    setEmotion('surprised');
                    setTimeout(() => setEmotion('idle'), 5000);
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `rex-confirmed-${Date.now()}`,
                        role: 'rex',
                        text: `¡Cita confirmada en Google Calendar! 🎉\n\nQuedó reservada para el **${booking.dateDisplay}** a las **${booking.timeDisplay}** (hora Colombia).\n\nTe enviamos todos los detalles y el enlace de la reunión a tu correo. ¡Será un gusto conversar!`,
                        time: formatTime(),
                      },
                    ]);
                  }}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips (Shown when messages count is low) */}
          {messages.length <= 3 && !isLoading && (
            <div className="px-3.5 py-2.5 border-t border-[#1E1810]/8 bg-white/75 backdrop-blur-md">
              <p className="text-[10px] text-[#575250]/80 uppercase font-semibold tracking-wider mb-1.5 px-0.5">
                {t.quickPromptTitle}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {t.chips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (chip.text.toLowerCase().includes('agendar') || chip.label.includes('Agendar')) {
                        setShowCalendar(true);
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `user-${Date.now()}`,
                            role: 'user',
                            text: chip.text,
                            time: formatTime(),
                          },
                          {
                            id: `rex-${Date.now() + 1}`,
                            role: 'rex',
                            text: '¡Excelente! Aquí tienes la disponibilidad en tiempo real de Google Calendar. Elige tu día y hora para bloquear tu sesión de 30 min:',
                            time: formatTime(),
                          },
                        ]);
                      } else {
                        handleSendMessage(chip.text);
                      }
                    }}
                    className="text-[11px] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f96e03] text-[#1E1810] hover:text-[#1E1810] border border-[#f96e03]/35 hover:border-[#f96e03] font-bold transition-all shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95 text-left flex items-center gap-1"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input */}
          <div className="p-3 bg-white/85 backdrop-blur-md border-t border-[#1E1810]/8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.inputPlaceholder}
                disabled={isLoading}
                maxLength={500}
                className="flex-1 bg-white border border-[#1E1810]/15 focus:border-[#f96e03] focus:ring-2 focus:ring-[#f96e03]/20 rounded-xl px-3.5 py-2.5 text-base sm:text-xs min-h-[44px] text-[#1E1810] placeholder-[#575250]/60 focus:outline-none transition-colors shadow-2xs"
              />
              {/* ORANGE SEND BUTTON */}
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                aria-label={t.send}
                className="p-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] disabled:bg-[#f96e03]/30 disabled:text-[#1E1810]/40 text-[#1E1810] transition-all shadow-md shadow-[#f96e03]/25 active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4 text-[#1E1810]" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
