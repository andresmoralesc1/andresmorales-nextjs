'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Search,
  Send,
  RefreshCw,
  User,
  UserCheck,
  Users,
  Check,
  CheckCheck,
  ExternalLink,
  Zap,
  Phone,
  Clock,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Building2,
  DollarSign,
  Radio,
  Volume2,
  VolumeX,
  Power,
  PowerOff,
  Plus,
  X,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/admin-shell';
import type { EvolutionChat, EvolutionChatMessage, EvolutionInstanceInfo } from '@/lib/evolution';
import type { AutomationSettings } from '@/lib/crm-store';

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', placeholder: '300 123 4567' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸', placeholder: '612 345 678' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', placeholder: '9 11 1234 5678' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', placeholder: '9 1234 5678' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', placeholder: '912 345 678' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', placeholder: '99 123 4567' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦', placeholder: '6123 4567' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', placeholder: '8123 4567' },
  { code: 'DO', name: 'Rep. Dominicana', dialCode: '+1', flag: '🇩🇴', placeholder: '809 123 4567' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', placeholder: '5123 4567' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', placeholder: '91 234 567' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', placeholder: '7123 4567' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', placeholder: '412 123 4567' },
  { code: 'CA', name: 'Canadá', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0123' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'DE', name: 'Alemania', dialCode: '+49', flag: '🇩🇪', placeholder: '151 12345678' },
  { code: 'FR', name: 'Francia', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'IT', name: 'Italia', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
];

interface EnrichedChat extends EvolutionChat {
  lead?: {
    id: string;
    name: string;
    status: string;
    score?: string;
    service?: string;
  } | null;
}

interface Props {
  initialChats: EnrichedChat[];
  initialStatus: EvolutionInstanceInfo;
  initialSettings?: AutomationSettings;
  username: string;
  locale: string;
}

const QUICK_TEMPLATES = [
  {
    label: '📋 Brief Recibido',
    text: '¡Hola! He recibido tu brief correctamente. Estoy revisando todos los detalles para preparar tu propuesta personalizada.',
  },
  {
    label: '🚀 Propuesta Lista',
    text: '¡Hola! Ya tengo lista la propuesta de diseño y desarrollo web para tu proyecto. ¿Tienes 10 minutos para revisarla juntos?',
  },
  {
    label: '📅 Agendar Llamada',
    text: '¡Hola! Me encantaría conversar unos minutos para entender mejor tus objetivos. ¿Qué día y hora te queda más cómodo?',
  },
  {
    label: '👋 Saludo Inicial',
    text: '¡Hola! Soy Andrés Morales, Diseñador y Desarrollador Full-Stack. ¿En qué tipo de proyecto digital te puedo ayudar?',
  },
  {
    label: '🔔 Seguimiento',
    text: '¡Hola! Quería consultar cómo va todo con la revisión de la propuesta. Quedo atento si tienes alguna duda técnica o de alcance.',
  },
];

export default function ChatInboxClient({
  initialChats,
  initialStatus,
  initialSettings,
  username,
  locale,
}: Props) {
  const [chats, setChats] = useState<EnrichedChat[]>(initialChats);
  const [status, setStatus] = useState<EvolutionInstanceInfo>(initialStatus);
  const [settings, setSettings] = useState<AutomationSettings>(initialSettings || {});
  const [togglingBot, setTogglingBot] = useState(false);
  const [selectedChat, setSelectedChat] = useState<EnrichedChat | null>(
    initialChats.length > 0 ? initialChats[0] : null
  );
  const [messages, setMessages] = useState<EvolutionChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'leads' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState(false);

  // New Chat Modal States
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(COUNTRIES[0]);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newChatCreateLead, setNewChatCreateLead] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  // Mobile navigation toggle
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isGlobalBotActive = settings.autoReplyWhatsAppAgent !== false;

  const isChatBotMuted = (jid?: string, phone?: string) => {
    if (!jid && !phone) return false;
    const currentMuted = settings.mutedJids || [];
    const rawDigits = (phone || '').replace(/\D/g, '');
    return Boolean(
      (jid && currentMuted.includes(jid)) ||
      (rawDigits && currentMuted.includes(rawDigits))
    );
  };

  const handleToggleGlobalBot = async () => {
    setTogglingBot(true);
    const nextVal = !isGlobalBotActive;
    try {
      const res = await fetch('/api/admin/crm/trigger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            autoReplyWhatsAppAgent: nextVal,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSettings((prev) => ({ ...prev, autoReplyWhatsAppAgent: nextVal }));
      } else {
        alert('Error al actualizar bot: ' + (data.error || ''));
      }
    } catch {
      alert('Error de conexión al cambiar estado del bot');
    } finally {
      setTogglingBot(false);
    }
  };

  const handleToggleChatBot = async (jid: string, phone: string) => {
    setTogglingBot(true);
    const currentMuted = settings.mutedJids || [];
    const rawDigits = (phone || '').replace(/\D/g, '');
    const isMuted = isChatBotMuted(jid, phone);

    let newMuted: string[];
    if (isMuted) {
      // Reactivar bot
      newMuted = currentMuted.filter((item) => item !== jid && item !== rawDigits);
    } else {
      // Silenciar bot en este chat
      newMuted = Array.from(new Set([...currentMuted, jid, rawDigits].filter(Boolean)));
    }

    try {
      const res = await fetch('/api/admin/crm/trigger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            mutedJids: newMuted,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSettings((prev) => ({ ...prev, mutedJids: newMuted }));
      } else {
        alert('Error al actualizar bot para este chat: ' + (data.error || ''));
      }
    } catch {
      alert('Error de conexión al actualizar bot para este chat');
    } finally {
      setTogglingBot(false);
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Load messages whenever selectedChat changes
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    let isMounted = true;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `/api/admin/chat/messages?jid=${encodeURIComponent(selectedChat.remoteJid)}`
        );
        const data = await res.json();
        if (isMounted && data.ok && Array.isArray(data.messages)) {
          setMessages(data.messages);
          setTimeout(() => scrollToBottom(false), 50);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedChat?.remoteJid]);

  // Periodic Polling (every 6s) to refresh messages & chats in background
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return;

      // 1. Refresh active chat messages
      if (selectedChat) {
        try {
          const res = await fetch(
            `/api/admin/chat/messages?jid=${encodeURIComponent(selectedChat.remoteJid)}`
          );
          const data = await res.json();
          if (data.ok && Array.isArray(data.messages)) {
            setMessages((prev) => {
              // Only update if count changed or last message id differs
              if (
                data.messages.length !== prev.length ||
                (data.messages.length > 0 &&
                  data.messages[data.messages.length - 1]?.id !== prev[prev.length - 1]?.id)
              ) {
                setTimeout(() => scrollToBottom(true), 50);
                return data.messages;
              }
              return prev;
            });
          }
        } catch {
          // ignore background poll errors
        }
      }

      // 2. Refresh chats list in background
      try {
        const cRes = await fetch('/api/admin/chat');
        const cData = await cRes.json();
        if (cData.ok && Array.isArray(cData.chats)) {
          setChats(cData.chats);
          if (cData.status) setStatus(cData.status);
          if (cData.settings) setSettings(cData.settings);
        }
      } catch {
        // ignore background poll errors
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [selectedChat?.remoteJid]);

  // Visual tab unread count (Strictly silent - NO sound)
  useEffect(() => {
    const totalUnread = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) WhatsApp Chat | Andrés Morales`;
    } else {
      document.title = 'WhatsApp Chat | Andrés Morales';
    }
  }, [chats]);

  // Manual full refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/chat');
      const data = await res.json();
      if (data.ok && Array.isArray(data.chats)) {
        setChats(data.chats);
        if (data.status) setStatus(data.status);
        if (data.settings) setSettings(data.settings);

        // Update selected chat reference if matched
        if (selectedChat) {
          const updated = data.chats.find((c: EnrichedChat) => c.remoteJid === selectedChat.remoteJid);
          if (updated) setSelectedChat(updated);
        }
      }

      if (selectedChat) {
        const mRes = await fetch(
          `/api/admin/chat/messages?jid=${encodeURIComponent(selectedChat.remoteJid)}`
        );
        const mData = await mRes.json();
        if (mData.ok && Array.isArray(mData.messages)) {
          setMessages(mData.messages);
          setTimeout(() => scrollToBottom(false), 50);
        }
      }
    } catch (err) {
      console.error('Failed to refresh chats:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedChat || sending) return;

    setSending(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: EvolutionChatMessage = {
      id: tempId,
      remoteJid: selectedChat.remoteJid,
      fromMe: true,
      senderName: 'Yo',
      text,
      timestamp: Date.now(),
      status: 'PENDING',
      mediaType: 'conversation',
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setTemplatesOpen(false);
    setTimeout(() => scrollToBottom(true), 50);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remoteJid: selectedChat.remoteJid,
          phone: selectedChat.phone,
          text,
          leadId: selectedChat.lead?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        const errMessage = typeof data.error === 'string'
          ? data.error
          : typeof data.error === 'object'
            ? JSON.stringify(data.error)
            : 'Fallo desconocido';
        alert(`Error al enviar mensaje: ${errMessage}`);
      } else {
        // Refetch chat messages to get server ID & status
        const mRes = await fetch(
          `/api/admin/chat/messages?jid=${encodeURIComponent(selectedChat.remoteJid)}`
        );
        const mData = await mRes.json();
        if (mData.ok && Array.isArray(mData.messages)) {
          setMessages(mData.messages);
        }
      }
    } catch (err) {
      console.error('Send error:', err);
      alert('Error de conexión al enviar el mensaje por Evolution API');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter key to send (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 1-Click convert contact to CRM Lead
  const handleConvertToLead = async () => {
    if (!selectedChat || convertingLead) return;
    setConvertingLead(true);

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedChat.name !== `+${selectedChat.phone}` ? selectedChat.name : `Lead WhatsApp ${selectedChat.phone}`,
          phone: selectedChat.phone,
          source: 'whatsapp',
          status: 'in_conversation',
          score: 'warm',
          budget: '',
          service: 'Sitio Web / Estrategia Digital',
          initialNote: `Creado desde la bandeja WhatsApp Chat en Admin. Conversación iniciada por el cliente.`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok && data.lead) {
        const newLead = {
          id: data.lead.id,
          name: data.lead.name,
          status: data.lead.status,
          score: data.lead.score,
          service: data.lead.service,
        };

        // Update local state
        const updatedChat = { ...selectedChat, lead: newLead };
        setSelectedChat(updatedChat);
        setChats((prev) =>
          prev.map((c) => (c.remoteJid === selectedChat.remoteJid ? updatedChat : c))
        );
      } else {
        alert(`Error al crear lead: ${data.error || 'Intenta de nuevo'}`);
      }
    } catch (err) {
      console.error('Error converting to lead:', err);
      alert('Error de red al crear lead en CRM');
    } finally {
      setConvertingLead(false);
    }
  };

  // Start a new WhatsApp chat with country code support (default Colombia +57)
  const handleStartNewChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (creatingChat) return;

    const rawDial = selectedCountry.dialCode.replace(/\D/g, '');
    let cleanPhone = newChatPhone.replace(/\D/g, '');

    if (!cleanPhone) {
      alert('Por favor escribe el número de teléfono.');
      return;
    }

    // Strip leading dial code if the user already typed it
    if (cleanPhone.startsWith(rawDial)) {
      cleanPhone = cleanPhone.slice(rawDial.length);
    }
    // Remove leading zeros if present
    cleanPhone = cleanPhone.replace(/^0+/, '');

    const fullNumber = `${rawDial}${cleanPhone}`;
    if (fullNumber.length < 8) {
      alert('El número ingresado es demasiado corto. Verifica el código de país y el número.');
      return;
    }

    setCreatingChat(true);

    try {
      const remoteJid = `${fullNumber}@s.whatsapp.net`;
      const contactName = newChatName.trim() || `+${fullNumber}`;

      // 1. Check if chat already exists
      let targetChat = chats.find(
        (c) => c.remoteJid === remoteJid || c.phone.replace(/\D/g, '') === fullNumber
      );

      // 2. If initial message was provided, send it through API
      const messageText = newChatMessage.trim();
      if (messageText) {
        const sendRes = await fetch('/api/admin/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            remoteJid,
            phone: fullNumber,
            text: messageText,
          }),
        });
        const sendData = await sendRes.json();
        if (!sendRes.ok || !sendData.ok) {
          const errDetail = typeof sendData?.error === 'string' ? sendData.error : 'No se pudo enviar el mensaje';
          alert(`⚠️ No se pudo enviar el mensaje a WhatsApp: ${errDetail}`);
        }
      }

      // 3. If "Crear Lead en CRM" is checked
      let createdLead: any = null;
      if (newChatCreateLead) {
        try {
          const crmRes = await fetch('/api/admin/crm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: contactName,
              phone: `+${fullNumber}`,
              source: 'whatsapp',
              status: 'in_conversation',
              service: 'Contacto WhatsApp',
              message: messageText || 'Conversación iniciada desde Admin WhatsApp',
              initialNote: `Chat nuevo iniciado desde el panel de WhatsApp el ${new Date().toLocaleString('es-CO')}.`,
            }),
          });
          const crmData = await crmRes.json();
          if (crmRes.ok && crmData.ok && crmData.lead) {
            createdLead = {
              id: crmData.lead.id,
              name: crmData.lead.name,
              status: crmData.lead.status,
              score: crmData.lead.score,
              service: crmData.lead.service,
            };
          }
        } catch (crmErr) {
          console.warn('[NewChat] Could not auto-create CRM lead:', crmErr);
        }
      }

      // 4. If chat didn't exist in local list, create it
      if (!targetChat) {
        targetChat = {
          id: remoteJid,
          remoteJid,
          phone: fullNumber,
          name: contactName,
          pushName: newChatName.trim() || null,
          profilePicUrl: null,
          updatedAt: new Date().toISOString(),
          unreadCount: 0,
          isGroup: false,
          lead: createdLead,
          lastMessage: messageText
            ? {
                id: `msg-${Date.now()}`,
                text: messageText,
                fromMe: true,
                timestamp: Date.now(),
                status: 'PENDING',
              }
            : undefined,
        };
        setChats((prev) => [targetChat!, ...prev]);
      } else if (createdLead && !targetChat.lead) {
        targetChat = { ...targetChat, lead: createdLead };
        setChats((prev) =>
          prev.map((c) => (c.remoteJid === targetChat!.remoteJid ? targetChat! : c))
        );
      }

      // 5. Select this chat and open view
      setSelectedChat(targetChat);
      setMobileChatOpen(true);

      // If message sent, fetch updated messages
      if (messageText) {
        try {
          const mRes = await fetch(
            `/api/admin/chat/messages?jid=${encodeURIComponent(remoteJid)}`
          );
          const mData = await mRes.json();
          if (mData.ok && Array.isArray(mData.messages)) {
            setMessages(mData.messages);
          }
        } catch {
          // ignore
        }
      } else {
        setMessages([]);
      }

      // Close modal & reset inputs
      setIsNewChatModalOpen(false);
      setNewChatPhone('');
      setNewChatName('');
      setNewChatMessage('');
      setNewChatCreateLead(false);
      setSelectedCountry(COUNTRIES[0]); // Reset to Colombia (+57)
    } catch (err: any) {
      console.error('Error starting new chat:', err);
      alert('Error inesperado al iniciar el chat: ' + (err?.message || 'Error de conexión'));
    } finally {
      setCreatingChat(false);
    }
  };

  // Filtered Chats
  const filteredChats = chats.filter((c) => {
    if (filterType === 'leads' && !c.lead) return false;
    if (filterType === 'unread' && c.unreadCount <= 0) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = c.name.toLowerCase().includes(q);
    const matchPhone = c.phone.includes(q);
    const matchMsg = c.lastMessage?.text.toLowerCase().includes(q);
    const matchLead = c.lead?.name.toLowerCase().includes(q);
    return matchName || matchPhone || matchMsg || matchLead;
  });

  // Format timestamp
  const formatTime = (ts: number | string) => {
    const d = new Date(typeof ts === 'string' ? ts : ts);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <AdminShell
      username={username}
      locale={locale}
      title="WhatsApp Chat en Vivo"
      subtitle="Bandeja de entrada conectada a Evolution API con sincronización directa al CRM"
      actions={
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={() => setIsNewChatModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#f96e03] hover:bg-[#e06200] text-white shadow-xs transition-all cursor-pointer"
            title="Iniciar una nueva conversación de WhatsApp"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Chat</span>
          </button>

          {/* Master AI Bot Toggle */}
          <button
            type="button"
            onClick={handleToggleGlobalBot}
            disabled={togglingBot}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isGlobalBotActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
            }`}
            title={
              isGlobalBotActive
                ? 'El Bot IA (Gemini) está respondiendo en WhatsApp. Clic para APAGARLO globalmente.'
                : 'El Bot IA está apagado. Clic para ENCENDERLO.'
            }
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGlobalBotActive ? 'text-orange-200' : 'text-stone-400'}`} />
            <span>{isGlobalBotActive ? 'Bot IA: Activo' : 'Bot IA: Apagado'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isGlobalBotActive ? 'bg-white animate-pulse' : 'bg-stone-400'
              }`}
            />
          </button>

          {/* Quick link to Prompt Editor */}
          <Link
            href={`/${locale}/admin/automations`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors shadow-xs"
            title="Editar Prompt e Instrucciones del Agente IA"
          >
            <span>Editar Prompt</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          {/* Connection Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-xs ${
              status.connected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="font-bold">
              {status.connected ? '🟢 Evolution' : '🔴 Desconectado'}
            </span>
            {status.number && (
              <span className="font-mono opacity-80">
                (+{status.number})
              </span>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-[#1E1810] transition-colors cursor-pointer"
            title="Refrescar conversaciones"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      {/* WhatsApp Web Inbox Layout */}
      <div className="h-[calc(100vh-140px)] min-h-[580px] bg-white rounded-2xl border border-stone-200 shadow-sm flex overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CHATS LIST                                  */}
        {/* ========================================================= */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col bg-white shrink-0 ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search & Filters Header */}
          <div className="p-3.5 border-b border-stone-200/80 bg-[#FAF7F5] space-y-2.5">
            {/* Search Input + New Chat Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar chat o mensaje..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#f96e03]/20 focus:border-[#f96e03] transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E1810] hover:bg-[#2e261b] text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                title="Iniciar nueva conversación de WhatsApp"
              >
                <Plus className="w-3.5 h-3.5 text-[#f96e03]" />
                <span className="hidden sm:inline">Nuevo Chat</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-[#1E1810] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Todos ({chats.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('leads')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === 'leads'
                    ? 'bg-[#f96e03] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>Leads CRM ({chats.filter((c) => c.lead).length})</span>
              </button>
              {chats.some((c) => c.unreadCount > 0) && (
                <button
                  type="button"
                  onClick={() => setFilterType('unread')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    filterType === 'unread'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  No leídos
                </button>
              )}
            </div>
          </div>

          {/* Chats Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-40 text-stone-300" />
                <p className="text-xs">No se encontraron conversaciones</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isSelected = selectedChat?.remoteJid === chat.remoteJid;
                return (
                  <div
                    key={chat.remoteJid}
                    onClick={() => {
                      setSelectedChat(chat);
                      setMobileChatOpen(true);
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                      isSelected
                        ? 'bg-[#FAF7F5] border-l-4 border-l-[#f96e03]'
                        : 'hover:bg-stone-50/80'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {chat.profilePicUrl ? (
                        <img
                          src={chat.profilePicUrl}
                          alt={chat.name}
                          className="w-11 h-11 rounded-full object-cover border border-stone-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-[#f96e03] flex items-center justify-center font-bold text-sm border border-stone-200">
                          {chat.isGroup ? (
                            <Users className="w-5 h-5 text-stone-600" />
                          ) : (
                            chat.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                      )}
                      {chat.lead && (
                        <span
                          className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#f96e03] text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs"
                          title="Vinculado como Lead en CRM"
                        >
                          ⚡
                        </span>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4
                          className={`text-xs truncate ${
                            isSelected ? 'font-bold text-[#1E1810]' : 'font-semibold text-stone-800'
                          }`}
                        >
                          {chat.name}
                        </h4>
                        {chat.lastMessage?.timestamp && (
                          <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                            {formatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>

                      {/* Badges: Lead & Muted */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {chat.lead && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-[#f96e03]">
                            <span>Lead:</span>
                            <span className="truncate max-w-[110px]">{chat.lead.name}</span>
                          </span>
                        )}
                        {isChatBotMuted(chat.remoteJid, chat.phone) && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            <span>🔇 Bot Silenciado</span>
                          </span>
                        )}
                      </div>

                      {/* Last Message Snippet */}
                      <p className="text-[11px] text-[#575250] truncate flex items-center gap-1">
                        {chat.lastMessage?.fromMe && (
                          <CheckCheck className="w-3 h-3 text-blue-500 shrink-0 inline" />
                        )}
                        <span>{chat.lastMessage?.text || 'Sin mensajes aún'}</span>
                      </p>
                    </div>

                    {/* Unread Pill */}
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION                    */}
        {/* ========================================================= */}
        <div
          className={`flex-1 flex flex-col bg-[#F8F5F2] ${
            mobileChatOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 bg-white border-b border-stone-200 flex items-center justify-between shrink-0 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="md:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Contact Avatar */}
                  <div className="relative shrink-0">
                    {selectedChat.profilePicUrl ? (
                      <img
                        src={selectedChat.profilePicUrl}
                        alt={selectedChat.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 text-[#f96e03] flex items-center justify-center font-bold text-xs border border-stone-200">
                        {selectedChat.isGroup ? (
                          <Users className="w-4 h-4 text-stone-600" />
                        ) : (
                          selectedChat.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                    )}
                  </div>

                  {/* Header Details */}
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1E1810] truncate flex items-center gap-2">
                      <span>{selectedChat.name}</span>
                      {selectedChat.isGroup && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-stone-100 rounded text-stone-600 font-normal">
                          Grupo
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-500 truncate flex items-center gap-1.5">
                      <span>+{selectedChat.phone}</span>
                      {selectedChat.pushName && selectedChat.pushName !== selectedChat.name && (
                        <span className="text-stone-400 font-sans">
                          (Nombre WA: {selectedChat.pushName})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Header Actions & CRM Link */}
                <div className="flex items-center gap-2">
                  {/* Per-Chat Bot Mute/Unmute Toggle */}
                  {isGlobalBotActive ? (
                    isChatBotMuted(selectedChat.remoteJid, selectedChat.phone) ? (
                      <button
                        type="button"
                        onClick={() => handleToggleChatBot(selectedChat.remoteJid, selectedChat.phone)}
                        disabled={togglingBot}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        title="El Bot IA está en silencio para este chat. Clic para reactivarlo."
                      >
                        <VolumeX className="w-3.5 h-3.5 text-amber-700" />
                        <span className="hidden sm:inline">Bot Silenciado</span>
                        <span className="text-[10px] font-mono underline text-amber-700">(Reactivar)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleChatBot(selectedChat.remoteJid, selectedChat.phone)}
                        disabled={togglingBot}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                        title="El Bot IA responderá automáticamente a este cliente. Clic para silenciarlo en este chat."
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#f96e03]" />
                        <span className="hidden sm:inline">Bot IA Activo</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono">
                          Silenciar
                        </span>
                      </button>
                    )
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-500 text-[11px] font-mono border border-stone-200">
                      <span>⏸️ Bot Apagado</span>
                    </span>
                  )}

                  {selectedChat.lead ? (
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/${locale}/admin/clients?search=${encodeURIComponent(selectedChat.lead.name)}`}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Ver Cliente en Directorio"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Cliente</span>
                      </Link>

                      <Link
                        href={`/${locale}/admin/crm`}
                        className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[#f96e03] text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Ver ficha en el CRM"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">CRM</span>
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConvertToLead}
                      disabled={convertingLead}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Registrar contacto como nuevo Lead comercial"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{convertingLead ? 'Creando...' : '⚡ Convertir a Lead'}</span>
                    </button>
                  )}

                  {/* WhatsApp External Link */}
                  <a
                    href={`https://wa.me/${selectedChat.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Abrir en WhatsApp Web / App externa"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-stone-400 text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#f96e03]" />
                    <span>Cargando historial de mensajes...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-stone-400 text-center p-6 space-y-2">
                    <MessageSquare className="w-10 h-10 text-stone-300" />
                    <p className="text-xs text-stone-500 font-medium">
                      No hay mensajes almacenados con este contacto.
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-sm">
                      Envía un mensaje abajo usando las plantillas para iniciar la conversación directamente desde tu servidor.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.fromMe;
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-2xs text-xs relative ${
                            isMe
                              ? 'bg-emerald-700 text-white rounded-br-none'
                              : 'bg-white text-[#1E1810] border border-stone-200/80 rounded-bl-none'
                          }`}
                        >
                          {!isMe && msg.senderName && (
                            <p className="text-[10px] font-bold text-emerald-700 mb-0.5">
                              {msg.senderName}
                            </p>
                          )}

                          {/* Message Text */}
                          <div className="whitespace-pre-wrap leading-relaxed break-words font-sans">
                            {msg.text}
                          </div>

                          {/* Timestamp & Delivery status */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${
                              isMe ? 'text-emerald-100/80' : 'text-stone-400'
                            }`}
                          >
                            <span>{formatTime(msg.timestamp)}</span>
                            {isMe && (
                              <span>
                                {msg.status === 'READ' ? (
                                  <CheckCheck className="w-3 h-3 text-cyan-200" />
                                ) : msg.status === 'DELIVERY_ACK' ? (
                                  <CheckCheck className="w-3 h-3 text-emerald-200" />
                                ) : (
                                  <Check className="w-3 h-3 text-emerald-200" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bot Status Banner for this Chat */}
              <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 shrink-0">
                {!isGlobalBotActive ? (
                  <div className="flex items-center gap-2 text-stone-600">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <span>Bot IA apagado a nivel global (respuestas 100% manuales).</span>
                    <button
                      type="button"
                      onClick={handleToggleGlobalBot}
                      disabled={togglingBot}
                      className="text-[#f96e03] font-bold underline hover:text-[#e06200] cursor-pointer ml-1"
                    >
                      Encender Bot IA
                    </button>
                  </div>
                ) : isChatBotMuted(selectedChat.remoteJid, selectedChat.phone) ? (
                  <div className="flex items-center gap-2 text-amber-900">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>
                      <strong>Bot Silenciado aquí:</strong> no responderá a este cliente mientras conversas tú.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleChatBot(selectedChat.remoteJid, selectedChat.phone)}
                      disabled={togglingBot}
                      className="text-amber-800 font-bold underline hover:text-amber-950 cursor-pointer ml-1"
                    >
                      Reactivar Bot
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5 text-[#f96e03]" />
                    <span>
                      <strong>Bot IA Activo:</strong> Antigravity responderá en ~4s si el contacto escribe.
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleChatBot(selectedChat.remoteJid, selectedChat.phone)}
                      disabled={togglingBot}
                      className="text-emerald-700 font-bold underline hover:text-emerald-950 cursor-pointer ml-1"
                    >
                      Silenciar en este chat
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Input & Quick Templates */}
              <div className="p-3 bg-white border-t border-stone-200 space-y-2">
                {/* Templates Toggle & Previews */}
                <div className="flex items-center justify-between gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTemplatesOpen(!templatesOpen)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#f96e03]" />
                      <span>Plantillas Rápidas</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          templatesOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Templates Menu */}
                    {templatesOpen && (
                      <div className="absolute bottom-9 left-0 w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-20 p-2 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-stone-400 px-2 py-1">
                          Respuestas predeterminadas
                        </div>
                        {QUICK_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setInputText(tmpl.text);
                              setTemplatesOpen(false);
                              inputRef.current?.focus();
                            }}
                            className="w-full text-left p-2 rounded-lg hover:bg-orange-50 text-xs transition-colors cursor-pointer group"
                          >
                            <span className="font-bold text-[#1E1810] group-hover:text-[#f96e03] block mb-0.5">
                              {tmpl.label}
                            </span>
                            <span className="text-[11px] text-stone-500 line-clamp-2">
                              {tmpl.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-stone-400 hidden sm:inline">
                    Enter para enviar · Shift+Enter para nueva línea
                  </span>
                </div>

                {/* Input Text Area + Send Button */}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Escribe un mensaje para ${selectedChat.name}...`}
                    className="flex-1 p-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#f96e03]/20 focus:border-[#f96e03] resize-none bg-stone-50 focus:bg-white transition-colors"
                  />

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || sending}
                    className={`h-[58px] px-4 rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer shrink-0 ${
                      inputText.trim() && !sending
                        ? 'bg-[#f96e03] hover:bg-[#e06200] text-white shadow-md active:scale-95'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                    title="Enviar mensaje (Enter)"
                  >
                    {sending ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-400 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-stone-300" />
              <h3 className="text-sm font-bold text-stone-600">
                Selecciona una conversación para comenzar
              </h3>
              <p className="text-xs text-stone-400 max-w-sm">
                Escoge cualquier chat de la izquierda para responder en tiempo real a través de tu servidor Evolution API.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: INICIAR NUEVO CHAT                                 */}
      {/* ========================================================= */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF7F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#1E1810]">
                    Iniciar Nuevo Chat
                  </h3>
                  <p className="text-[11px] text-[#575250]">
                    Escribe a cualquier número en WhatsApp directo desde el panel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleStartNewChat} className="p-5 space-y-4 overflow-y-auto">
              {/* Country Selector */}
              <div>
                <label className="block text-xs font-bold text-[#1E1810] mb-1.5 flex items-center justify-between">
                  <span>País de Destino</span>
                  <span className="text-[10px] font-mono text-[#f96e03] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60 font-bold">
                    🇨🇴 Predeterminado: Colombia (+57)
                  </span>
                </label>
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const found = COUNTRIES.find((c) => c.code === e.target.value);
                    if (found) setSelectedCountry(found);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 text-[#1E1810] focus:bg-white focus:border-[#f96e03] focus:outline-none transition-colors cursor-pointer font-medium"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-xs font-bold text-[#1E1810] mb-1.5">
                  Número de Teléfono / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200 focus-within:bg-white focus-within:border-[#f96e03] transition-colors overflow-hidden">
                  <span className="px-3.5 py-2.5 text-xs font-mono font-bold text-stone-700 bg-stone-100 border-r border-stone-200 flex items-center gap-1.5 shrink-0">
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.dialCode}</span>
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={newChatPhone}
                    onChange={(e) => setNewChatPhone(e.target.value)}
                    placeholder={selectedCountry.placeholder}
                    className="w-full px-3.5 py-2.5 text-xs text-[#1E1810] bg-transparent focus:outline-none font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#575250]">
                  Ingresa el número celular (ej: {selectedCountry.placeholder}).
                </p>
              </div>

              {/* Contact Name (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#1E1810] mb-1.5">
                  Nombre del Contacto o Empresa <span className="text-stone-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="ej. Carlos Gómez o Calzado Cali"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 text-[#1E1810] focus:bg-white focus:border-[#f96e03] focus:outline-none transition-colors"
                />
              </div>

              {/* Initial Message (Optional) */}
              <div>
                <label className="block text-xs font-bold text-[#1E1810] mb-1.5 flex items-center justify-between">
                  <span>Mensaje Inicial</span>
                  <span className="text-stone-400 font-normal text-[11px]">(Opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Escribe tu mensaje o déjalo vacío para abrir la conversación y redactar allí..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 text-[#1E1810] focus:bg-white focus:border-[#f96e03] focus:outline-none transition-colors resize-none"
                />

                {/* Quick Templates Chips */}
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-stone-400 mr-1">Plantillas:</span>
                  {QUICK_TEMPLATES.slice(0, 3).map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewChatMessage(tpl.text)}
                      className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[10px] text-stone-700 transition-colors cursor-pointer"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create CRM Lead Checkbox */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newChatCreateLead}
                    onChange={(e) => setNewChatCreateLead(e.target.checked)}
                    className="w-4 h-4 rounded text-[#f96e03] focus:ring-[#f96e03] border-stone-300"
                  />
                  <span className="font-semibold text-[#1E1810]">
                    Registrar también como Lead en el CRM
                  </span>
                </label>
                <p className="text-[11px] text-stone-500 pl-6.5 mt-0.5">
                  Crea este contacto en el pipeline comercial para hacerle seguimiento.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingChat || !newChatPhone.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#f96e03] hover:bg-[#e06200] text-white shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingChat ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Abriendo...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{newChatMessage.trim() ? 'Enviar y Abrir Chat' : 'Abrir Chat'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
