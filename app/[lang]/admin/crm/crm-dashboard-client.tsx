'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type {
  Lead,
  LeadStatus,
  EmailLog,
  AutomationSettings,
  Proposal,
  ProposalDeliverable,
} from '@/lib/crm-store';
import { AdminShell } from '@/components/admin/admin-shell';
import {
  Users,
  UserCheck,
  Mail,
  Zap,
  Plus,
  Search,
  Phone,
  Building2,
  DollarSign,
  CheckCircle2,
  Send,
  MessageSquare,
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  Inbox,
  AlertCircle,
  Kanban,
  Table as TableIcon,
  X,
  Check,
  BarChart3,
  RefreshCw,
  Clock,
  Clock3,
  Calendar,
  ArrowRight,
  Target,
  Flame,
  Bell,
  Copy,
  CheckCheck,
  FilePlus,
  FileCheck,
  ShieldCheck,
  Layers,
  Smartphone,
  SendHorizontal,
  Radio,
  GripVertical,
} from 'lucide-react';
import type { EvolutionInstanceInfo } from '@/lib/evolution';
import { DEFAULT_SYSTEM_PROMPT, ANDRES_PHONE, CALENDAR_URL, BRIEF_URL } from '@/lib/ai-prompt';

interface Props {
  initialLeads: Lead[];
  initialEmailLogs: EmailLog[];
  initialProposals?: Proposal[];
  initialAutomationSettings: AutomationSettings;
  initialEvoStatus?: EvolutionInstanceInfo;
  initialTab?: 'pipeline' | 'briefs' | 'proposals' | 'email' | 'automations';
  initialEmailDraft?: {
    to?: string;
    name?: string;
    subject?: string;
    body?: string;
  };
  username: string;
  locale: string;
}

const STATUS_COLUMNS: { id: LeadStatus; label: string; color: string; badge: string }[] = [
  { id: 'new', label: 'Nuevo Lead', color: 'border-blue-400 bg-blue-50/50', badge: 'bg-blue-100 text-blue-700' },
  { id: 'brief_received', label: 'Brief Recibido', color: 'border-purple-400 bg-purple-50/50', badge: 'bg-purple-100 text-purple-700' },
  { id: 'in_conversation', label: 'En Contacto / WhatsApp', color: 'border-amber-400 bg-amber-50/50', badge: 'bg-amber-100 text-amber-700' },
  { id: 'proposal_sent', label: 'Propuesta Enviada', color: 'border-orange-400 bg-orange-50/50', badge: 'bg-orange-100 text-orange-700' },
  { id: 'in_development', label: 'En Desarrollo', color: 'border-emerald-400 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'closed_won', label: 'Cerrado / Ganado', color: 'border-green-500 bg-green-50/50', badge: 'bg-green-100 text-green-700' },
  { id: 'closed_lost', label: 'Descartado / Perdido', color: 'border-stone-400 bg-stone-100/60', badge: 'bg-stone-200 text-stone-600' },
];

export default function CrmDashboardClient({
  initialLeads,
  initialEmailLogs,
  initialProposals,
  initialAutomationSettings,
  initialEvoStatus,
  initialTab = 'pipeline',
  initialEmailDraft,
  username,
  locale,
}: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(initialEmailLogs);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals || []);
  const [settings, setSettings] = useState<AutomationSettings>(initialAutomationSettings);
  const [evoStatus, setEvoStatus] = useState<EvolutionInstanceInfo | undefined>(initialEvoStatus);
  const [refreshingEvo, setRefreshingEvo] = useState(false);

  // WhatsApp Evolution Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [waRecipient, setWaRecipient] = useState<{ leadId?: string; name: string; phone: string }>({ name: '', phone: '' });
  const [waMessageText, setWaMessageText] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [waNotice, setWaNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Test WhatsApp message in automations tab
  const [testWaPhone, setTestWaPhone] = useState(initialEvoStatus?.number || '573161482507');
  const [testWaMessage, setTestWaMessage] = useState('Hola Andrés! Mensaje de prueba desde tu panel CRM con Evolution API.');
  const [sendingTestWa, setSendingTestWa] = useState(false);
  const [testWaNotice, setTestWaNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Prompt Editor State
  const [promptText, setPromptText] = useState(
    initialAutomationSettings?.aiAgentPrompt || DEFAULT_SYSTEM_PROMPT
  );
  const [savingPrompt, setSavingPrompt] = useState(false);
  const [promptNotice, setPromptNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Prompt Simulator State
  const [testSimMessage, setTestSimMessage] = useState('Hola, ¿cuánto cuesta un chatbot con IA para mi restaurante?');
  const [simulatingPrompt, setSimulatingPrompt] = useState(false);
  const [simResult, setSimResult] = useState<{ reply: string; durationMs: number; wantsHuman?: boolean } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'pipeline' | 'briefs' | 'proposals' | 'email' | 'automations'
  >(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Kanban Drag and Drop state
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<LeadStatus | null>(null);
  const isDraggingCardRef = React.useRef(false);

  // Lead detail drawer
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Follow-up editing
  const [followUpDateInput, setFollowUpDateInput] = useState('');
  const [followUpNoteInput, setFollowUpNoteInput] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Telegram alert state
  const [telegramStatus, setTelegramStatus] = useState<{ id: string; ok: boolean; msg: string } | null>(null);

  // Proposal modal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [createdProposalUrl, setCreatedProposalUrl] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [proposalForm, setProposalForm] = useState<{
    leadId: string;
    clientName: string;
    clientEmail: string;
    clientCompany: string;
    service: string;
    title: string;
    scopeSummary: string;
    investmentAmount: string;
    investmentTerms: string;
    deliverables: ProposalDeliverable[];
  }>({
    leadId: '',
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    service: '',
    title: '',
    scopeSummary: '',
    investmentAmount: '',
    investmentTerms: '',
    deliverables: [],
  });

  // Mailcow Inbox for selected lead
  const [inboxMessages, setInboxMessages] = useState<Record<string, any[]>>({});
  const [loadingInbox, setLoadingInbox] = useState(false);

  // New Lead Modal
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budget: '',
    message: '',
  });

  // Email composer
  const [emailTo, setEmailTo] = useState(initialEmailDraft?.to || '');
  const [emailToName, setEmailToName] = useState(initialEmailDraft?.name || '');
  const [emailSubject, setEmailSubject] = useState(initialEmailDraft?.subject || '');
  const [emailBody, setEmailBody] = useState(initialEmailDraft?.body || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Load email draft from URL or sessionStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('crm_email_draft');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.to !== undefined) setEmailTo(parsed.to || '');
          if (parsed.name) setEmailToName(parsed.name);
          if (parsed.subject) setEmailSubject(parsed.subject);
          if (parsed.body) setEmailBody(parsed.body);
          if (parsed.name || parsed.to) {
            setEmailNotice({
              type: 'ok',
              text: `✓ Borrador de propuesta cargado para "${parsed.name || parsed.to}". Listo para revisar y enviar.`,
            });
          }
          sessionStorage.removeItem('crm_email_draft');
          return;
        }
      } catch {
        // ignore
      }
    }

    if (initialEmailDraft && (initialEmailDraft.subject || initialEmailDraft.to || initialEmailDraft.body)) {
      if (initialEmailDraft.to) setEmailTo(initialEmailDraft.to);
      if (initialEmailDraft.name) setEmailToName(initialEmailDraft.name);
      if (initialEmailDraft.subject) setEmailSubject(initialEmailDraft.subject);
      if (initialEmailDraft.body) setEmailBody(initialEmailDraft.body);
      if (initialEmailDraft.name || initialEmailDraft.to) {
        setEmailNotice({
          type: 'ok',
          text: `✓ Borrador de propuesta cargado para "${initialEmailDraft.name || initialEmailDraft.to}". Listo para revisar y enviar.`,
        });
      }
    }
  }, [initialEmailDraft]);
  const [generatingAiDraft, setGeneratingAiDraft] = useState(false);
  const [dispatchingProposalId, setDispatchingProposalId] = useState<string | null>(null);

  // n8n Trigger state
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.phone && l.phone.includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q)) ||
        (l.service && l.service.toLowerCase().includes(q)) ||
        (l.budget && l.budget.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  // Brief sub-filter & conversion state
  const [briefFilter, setBriefFilter] = useState<'all' | 'pending' | 'converted'>('all');
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertedNotice, setConvertedNotice] = useState<{ id: string; name: string } | null>(null);

  // Brief Leads (received via /brief or /brief-web)
  const briefLeads = useMemo(() => {
    return leads
      .filter(
        (l) =>
          l.status === 'brief_received' ||
          l.source === 'brief' ||
          l.source === 'brief-web' ||
          Boolean(l.briefData)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [leads]);

  const filteredBriefLeads = useMemo(() => {
    return briefLeads.filter((l) => {
      if (briefFilter === 'pending') return l.status === 'brief_received';
      if (briefFilter === 'converted') return l.status !== 'brief_received';
      return true;
    });
  }, [briefLeads, briefFilter]);

  const pendingBriefsCount = useMemo(
    () => briefLeads.filter((b) => b.status === 'brief_received').length,
    [briefLeads]
  );
  const convertedBriefsCount = useMemo(
    () => briefLeads.filter((b) => b.status !== 'brief_received').length,
    [briefLeads]
  );

  // Stats
  const stats = useMemo(() => {
    const total = leads.length;
    const briefsCount = briefLeads.length;
    const inProgress = leads.filter(
      (l) => l.status === 'in_conversation' || l.status === 'proposal_sent'
    ).length;
    const closed = leads.filter((l) => l.status === 'closed_won').length;
    return { total, briefsCount, inProgress, closed };
  }, [leads, briefLeads]);

  // Actions
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      const data = await res.json();
      if (data.ok && data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) setSelectedLead(data.lead);
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const handleAdvanceStatus = (leadId: string, currentStatus: LeadStatus, direction: 'next' | 'prev') => {
    const currentIndex = STATUS_COLUMNS.findIndex((c) => c.id === currentStatus);
    if (currentIndex === -1) return;
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < STATUS_COLUMNS.length) {
      handleStatusChange(leadId, STATUS_COLUMNS[nextIndex].id);
    }
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDragOverCol(null);
    setDraggedLeadId(null);
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === targetStatus) return;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetStatus, updatedAt: new Date().toISOString() } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: targetStatus, updatedAt: new Date().toISOString() } : null));
    }

    await handleStatusChange(leadId, targetStatus);
  };

  const handleConvertBriefToLead = async (leadId: string) => {
    setConvertingId(leadId);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          status: 'in_conversation',
          followUpDate: today,
          followUpNote: 'Brief calificado y convertido a Lead activo en el Pipeline comercial.',
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.lead) {
        // Also log timeline note
        await fetch('/api/admin/crm/note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            text: '✓ Brief convertido a Lead activo en el Pipeline comercial (En Conversación / WhatsApp).',
            author: username,
          }),
        });

        const updatedLead: Lead = {
          ...data.lead,
          notes: [
            ...(data.lead.notes || []),
            {
              id: `note_${Date.now()}`,
              text: '✓ Brief convertido a Lead activo en el Pipeline comercial (En Conversación / WhatsApp).',
              createdAt: new Date().toISOString(),
            },
          ],
        };

        setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
        if (selectedLead?.id === leadId) setSelectedLead(updatedLead);
        setConvertedNotice({ id: leadId, name: data.lead.name });
        setTimeout(() => setConvertedNotice(null), 6000);
      } else {
        alert(data.error || 'Error al convertir el brief');
      }
    } catch (err) {
      console.error('Failed to convert brief:', err);
      alert('Error de conexión al convertir el brief');
    } finally {
      setConvertingId(null);
    }
  };

  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [promoteNotice, setPromoteNotice] = useState<string | null>(null);

  const handlePromoteLeadToBusiness = async (leadId: string) => {
    setPromotingId(leadId);
    try {
      const res = await fetch('/api/admin/crm/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (data.ok) {
        setPromoteNotice(data.message || 'Lead promovido a Cliente y Empresa con éxito');
        setTimeout(() => setPromoteNotice(null), 5000);
      } else {
        alert(data.error || 'Error al promover');
      }
    } catch {
      alert('Error de conexión al promover');
    } finally {
      setPromotingId(null);
    }
  };


  const refreshEvoStatus = async () => {
    setRefreshingEvo(true);
    try {
      const res = await fetch('/api/admin/crm/whatsapp');
      const data = await res.json();
      if (res.ok && data.ok) {
        setEvoStatus(data.status);
      }
    } catch (err) {
      console.warn('Error refreshing Evolution API:', err);
    } finally {
      setRefreshingEvo(false);
    }
  };

  const openWhatsAppModalForLead = (lead: Lead) => {
    const rawPhone = lead.phone || lead.briefData?.phone || lead.briefData?.telefono || '';
    setWaRecipient({
      leadId: lead.id,
      name: lead.name,
      phone: rawPhone,
    });
    setWaMessageText(
      `Hola ${lead.name}, te saluda Andrés Morales. Estuve revisando tu requerimiento sobre "${lead.service || 'automatización / desarrollo web'}" y me gustaría contarte cómo podemos estructurarlo. ¿Te viene bien si conversamos unos minutos?`
    );
    setWaNotice(null);
    setIsWhatsAppModalOpen(true);
  };

  const applyWaTemplate = (template: 'intro' | 'brief' | 'proposal' | 'followup') => {
    const name = waRecipient.name || 'Cliente';
    if (template === 'brief') {
      setWaMessageText(
        `Hola ${name}, te saluda Andrés Morales. Recibí con mucho interés el brief que enviaste desde mi web. Veo muy claro el objetivo y las herramientas que podemos conectar para optimizar tus tiempos. ¿Cuándo te queda cómodo que tengamos una breve llamada de 10 minutos?`
      );
    } else if (template === 'intro') {
      setWaMessageText(
        `Hola ${name}, un gusto saludarte. Te escribe Andrés Morales (Especialista en Automatizaciones e IA). Quería confirmar si pudiste revisar los requerimientos y si tienes disponibilidad esta semana.`
      );
    } else if (template === 'proposal') {
      setWaMessageText(
        `Hola ${name}, espero que estés teniendo un buen día. Acabo de prepararte una propuesta interactiva con los entregables y fases de tu proyecto. La puedes ver aquí: https://andresmorales.com.co/${locale}/p/ — Quedo a tu total disposición para cualquier consulta.`
      );
    } else if (template === 'followup') {
      setWaMessageText(
        `Hola ${name}, ¿cómo estás? Te escribo para dar un breve seguimiento a nuestra conversación de días pasados. Cuéntame si pudiste evaluar los detalles o si deseas ajustar algo del alcance.`
      );
    }
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waRecipient.phone || !waMessageText.trim()) return;

    setSendingWhatsApp(true);
    setWaNotice(null);

    try {
      const res = await fetch('/api/admin/crm/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: waRecipient.phone,
          text: waMessageText.trim(),
          leadId: waRecipient.leadId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setWaNotice({ type: 'ok', text: `¡WhatsApp enviado con éxito a ${waRecipient.phone} vía Evolution API!` });
        if (waRecipient.leadId) {
          const noteText = `💬 WhatsApp enviado vía Evolution API: "${waMessageText.trim().substring(0, 80)}..."`;
          setLeads((prev) =>
            prev.map((l) =>
              l.id === waRecipient.leadId
                ? {
                    ...l,
                    notes: [
                      ...(l.notes || []),
                      { id: `note_${Date.now()}`, text: noteText, createdAt: new Date().toISOString() },
                    ],
                  }
                : l
            )
          );
        }
        setTimeout(() => {
          setIsWhatsAppModalOpen(false);
          setWaNotice(null);
        }, 1800);
      } else {
        setWaNotice({ type: 'err', text: data.error || 'Error al enviar por Evolution API' });
      }
    } catch {
      setWaNotice({ type: 'err', text: 'Error de conexión con el servidor' });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleSendTestWa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testWaPhone || !testWaMessage.trim()) return;

    setSendingTestWa(true);
    setTestWaNotice(null);

    try {
      const res = await fetch('/api/admin/crm/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: testWaPhone,
          text: testWaMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestWaNotice({ type: 'ok', text: `¡Mensaje de prueba entregado con éxito a ${testWaPhone}!` });
      } else {
        setTestWaNotice({ type: 'err', text: data.error || 'Fallo de entrega' });
      }
    } catch {
      setTestWaNotice({ type: 'err', text: 'Error de red con Evolution API' });
    } finally {
      setSendingTestWa(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.email) return;

    try {
      const res = await fetch('/api/admin/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLeadForm,
          source: 'manual',
          status: 'new',
        }),
      });
      const data = await res.json();
      if (data.ok && data.lead) {
        setLeads((prev) => [data.lead, ...prev]);
        setIsNewLeadOpen(false);
        setNewLeadForm({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          budget: '',
          message: '',
        });
      }
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const handleDeleteLead = async (leadId: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name} del CRM?`)) return;

    try {
      const res = await fetch(`/api/admin/crm?id=${leadId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        if (selectedLead?.id === leadId) setSelectedLead(null);
      }
    } catch (err) {
      console.error('Failed to delete lead:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteInput.trim()) return;

    setSavingNote(true);
    try {
      const res = await fetch('/api/admin/crm/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead.id,
          text: noteInput.trim(),
          author: username,
        }),
      });
      const data = await res.json();
      if (data.success && data.note) {
        const updated = {
          ...selectedLead,
          notes: [...(selectedLead.notes || []), data.note],
        };
        setSelectedLead(updated);
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? updated : l)));
        setNoteInput('');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSelectLead = (lead: Lead | null) => {
    if (isDraggingCardRef.current) return;
    setSelectedLead(lead);
    if (lead) {
      setFollowUpDateInput(lead.followUpDate || '');
      setFollowUpNoteInput(lead.followUpNote || '');
      fetchInboxForLead(lead.email);
    }
  };

  const fetchInboxForLead = async (email: string) => {
    if (!email || inboxMessages[email]) return;
    setLoadingInbox(true);
    try {
      const res = await fetch(`/api/admin/crm/inbox?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok && data.ok) {
        setInboxMessages((prev) => ({ ...prev, [email]: data.messages || [] }));
      }
    } catch (err) {
      console.warn('Error fetching inbox:', err);
    } finally {
      setLoadingInbox(false);
    }
  };

  const handleSaveFollowUp = async (leadId: string) => {
    setSavingFollowUp(true);
    try {
      const res = await fetch('/api/admin/crm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: leadId,
          followUpDate: followUpDateInput || undefined,
          followUpNote: followUpNoteInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok && data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
        if (selectedLead?.id === leadId) setSelectedLead(data.lead);
      }
    } catch (err) {
      console.error('Error saving follow-up:', err);
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleSendTelegram = async (lead: Lead) => {
    setTelegramStatus({ id: lead.id, ok: false, msg: 'Enviando a Telegram...' });
    try {
      const res = await fetch('/api/admin/crm/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTelegramStatus({ id: lead.id, ok: true, msg: '¡Enviado a tu Telegram!' });
      } else {
        setTelegramStatus({ id: lead.id, ok: false, msg: data.error || 'Fallo de envío' });
      }
    } catch {
      setTelegramStatus({ id: lead.id, ok: false, msg: 'Error de red' });
    }
    setTimeout(() => setTelegramStatus(null), 3500);
  };

  const openProposalModalForLead = (lead: Lead) => {
    const brief = lead.briefData || {};
    const scope = brief.problem
      ? `Requerimiento principal:\n${brief.problem}\n\nObjetivo esperado:\n${brief.goal || ''}`
      : lead.message || 'Desarrollo e implementación según requerimientos acordados.';

    setProposalForm({
      leadId: lead.id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || brief.company || '',
      service: lead.service || 'Automatización & Desarrollo Web',
      title: `Propuesta de Proyecto — ${lead.service || 'Solución a Medida'}`,
      scopeSummary: scope,
      investmentAmount: lead.budget || brief.budget || '',
      investmentTerms: '50% de anticipo al inicio · 50% contra entrega final y satisfacción.',
      deliverables: [
        {
          phase: 'Fase 1',
          title: 'Arquitectura & Modelo de Datos',
          description: 'Levantamiento de especificaciones, configuración de repositorios y esquema de base de datos o APIs.',
          duration: 'Semana 1',
        },
        {
          phase: 'Fase 2',
          title: 'Desarrollo, Flujos & Conexiones',
          description: 'Implementación de funcionalidades, agentes de IA o automatización de flujos con pruebas.',
          duration: 'Semana 2',
        },
        {
          phase: 'Fase 3',
          title: 'Pruebas Piloto & Despliegue en Vivo',
          description: 'Validación en vivo, afinamiento de casos borde y entrega formal de accesos.',
          duration: 'Semana 3',
        },
      ],
    });
    setIsProposalModalOpen(true);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingProposal(true);
    try {
      const res = await fetch('/api/admin/crm/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposalForm),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProposals((prev) => [data.proposal, ...prev]);
        setIsProposalModalOpen(false);
        const url = `https://andresmorales.com.co/${locale}/p/${data.proposal.token}`;
        setCreatedProposalUrl(url);
        handleStatusChange(proposalForm.leadId, 'proposal_sent');
        setActiveTab('proposals');
      } else {
        alert(data.error || 'Error al generar la propuesta');
      }
    } catch {
      alert('Error de conexión con el servidor');
    } finally {
      setCreatingProposal(false);
    }
  };

  const copyToClipboard = (text: string, token: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const openEmailModalForLead = (lead: Lead) => {
    setEmailTo(lead.email);
    setEmailToName(lead.name);
    setEmailSubject(`Andrés Morales — ${lead.service || 'Tu proyecto de automatización / web'}`);
    setEmailBody(
      `Hola ${lead.name},\n\nUn gusto saludarte. Vi tu solicitud respecto a "${lead.service || 'automatización / desarrollo'}" y me gustaría revisar los detalles contigo.\n\n¿Tienes disponibilidad esta semana para una breve llamada de 15 minutos o prefieres que lo veamos por WhatsApp?\n\nQuedo a tu disposición.\n\nUn saludo,\nAndrés Morales`
    );
    setActiveTab('email');
  };

  const applyEmailTemplate = (
    template: 'intro' | 'proposal' | 'followup' | 'brief_response'
  ) => {
    const name = emailToName || 'Cliente';
    if (template === 'brief_response') {
      setEmailSubject(`Respuesta a tu Brief de Proyecto — Andrés Morales`);
      setEmailBody(
        `Hola ${name},\n\nUn gusto saludarte. He revisado con mucho interés el brief de proyecto que nos hiciste llegar.\n\nVeo muy claro el objetivo y las herramientas que podemos conectar para resolverlo sin fricciones y optimizando los tiempos de entrega.\n\nMe encantaría que agendemos una breve videollamada de 15 minutos o si prefieres, podemos conversar por WhatsApp para mostrarte la ruta de implementación.\n\n¿Qué día y hora te queda más cómodo esta semana?\n\nUn saludo cordial,\nAndrés Morales\nhttps://andresmorales.com.co`
      );
    } else if (template === 'intro') {
      setEmailSubject(`Andrés Morales — Revisión inicial de requerimientos`);
      setEmailBody(
        `Hola ${name},\n\nGracias por ponerte en contacto. He recibido los requerimientos de tu proyecto y veo una excelente oportunidad para implementar una solución a medida.\n\nPuedes ver casos de estudio similares en mi portafolio: https://andresmorales.com.co/es/portfolio\n\n¿Te parece bien si coordinamos una llamada rápida para afinar el alcance?\n\nSaludos cordiales,\nAndrés Morales`
      );
    } else if (template === 'proposal') {
      setEmailSubject(`Propuesta formal de proyecto — Andrés Morales`);
      setEmailBody(
        `Hola ${name},\n\nEspero que estés teniendo un buen día. Te adjunto los puntos clave de la propuesta que preparamos para tu empresa.\n\nPodemos estructurarlo en etapas claras con entregables semanales y sin costos ocultos.\n\nQuedo atento a tus comentarios o preguntas.\n\nUn abrazo,\nAndrés Morales`
      );
    } else if (template === 'followup') {
      setEmailSubject(`Seguimiento de tu propuesta — Andrés Morales`);
      setEmailBody(
        `Hola ${name},\n\nQuería dar un breve seguimiento a nuestra conversación de días pasados para ver si pudiste revisar la información.\n\nSi necesitas resolver alguna duda o ajustar alguna fase, con todo gusto me avisas.\n\nSaludos,\nAndrés Morales`
      );
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject || !emailBody) return;

    setSendingEmail(true);
    setEmailNotice(null);

    try {
      const res = await fetch('/api/admin/crm/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          toName: emailToName,
          subject: emailSubject,
          body: emailBody,
          author: username,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailNotice({ type: 'ok', text: `Correo enviado exitosamente a ${emailTo} vía Mailcow.` });
        if (data.log) {
          setEmailLogs((prev) => [data.log, ...prev]);
        }
        setEmailSubject('');
        setEmailBody('');
      } else {
        setEmailNotice({ type: 'err', text: data.error || 'Error al enviar correo por Mailcow.' });
      }
    } catch {
      setEmailNotice({ type: 'err', text: 'Error de conexión con el servidor de correo local.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGenerateAiEmailDraft = async (customInstruction?: string) => {
    if (!emailTo) {
      alert('Ingresa el correo del destinatario o abre un cliente desde el CRM.');
      return;
    }
    setGeneratingAiDraft(true);
    setEmailNotice(null);
    try {
      const res = await fetch('/api/admin/crm/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          toName: emailToName,
          incomingSubject: emailSubject,
          incomingSnippet: emailBody,
          instruction: customInstruction,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.subject) setEmailSubject(data.subject);
        if (data.body) setEmailBody(data.body);
        setEmailNotice({
          type: 'ok',
          text: `Borrador IA generado en ${((data.durationMs || 0) / 1000).toFixed(1)}s con ${data.modelUsed}. Puedes editarlo antes de enviar.`,
        });
      } else {
        alert(data.error || 'Error al generar borrador con IA');
      }
    } catch {
      alert('Error de conexión al generar el borrador con IA');
    } finally {
      setGeneratingAiDraft(false);
    }
  };

  const handleDispatchProposal = async (proposalId: string) => {
    if (!confirm('¿Deseas despachar esta propuesta por Correo (Mailcow) y WhatsApp automáticamente al cliente?')) {
      return;
    }
    setDispatchingProposalId(proposalId);
    try {
      const res = await fetch('/api/admin/crm/proposals/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId, locale }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status: 'sent' } : p))
        );
        let summary = '¡Propuesta despachada!';
        if (data.results?.email?.ok) summary += '\n• Enviada por correo Mailcow';
        if (data.results?.whatsapp?.ok) summary += '\n• Enviada por WhatsApp';
        alert(summary);
      } else {
        alert(data.error || 'Error al despachar la propuesta');
      }
    } catch {
      alert('Error de conexión al despachar la propuesta');
    } finally {
      setDispatchingProposalId(null);
    }
  };

  const triggerN8nWebhook = async (lead: Lead) => {
    setTriggeringId(lead.id);
    try {
      const res = await fetch('/api/admin/crm/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          eventType: 'crm_manual_trigger',
          webhookUrl: settings.n8nWebhookLead,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Flujo disparado en n8n para ${lead.name} (Respuesta ${data.status})`);
      } else {
        alert(`Error al disparar n8n: ${data.error || 'Revisa la URL del webhook'}`);
      }
    } catch (err: any) {
      alert(`Fallo de conexión: ${err.message}`);
    } finally {
      setTriggeringId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/crm/trigger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) alert('Configuración de n8n guardada');
    } catch {
      alert('Error al guardar');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleAiAgent = async () => {
    const isCurrentlyActive = settings.autoReplyWhatsAppAgent !== false;
    const nextState = !isCurrentlyActive;
    const updated = {
      ...settings,
      autoReplyWhatsAppAgent: nextState,
    };
    setSettings(updated);
    try {
      await fetch('/api/admin/crm/trigger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to toggle AI agent:', err);
    }
  };

  const handleSavePrompt = async () => {
    setSavingPrompt(true);
    setPromptNotice(null);
    try {
      const res = await fetch('/api/admin/crm/trigger', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            aiAgentPrompt: promptText.trim(),
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSettings((prev) => ({ ...prev, aiAgentPrompt: promptText.trim() }));
        setPromptNotice({ type: 'ok', text: '¡Instrucciones del Agente guardadas exitosamente!' });
        setTimeout(() => setPromptNotice(null), 4000);
      } else {
        setPromptNotice({ type: 'err', text: 'Error al guardar instrucciones: ' + (data.error || '') });
      }
    } catch {
      setPromptNotice({ type: 'err', text: 'Error de red al guardar instrucciones' });
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleResetPrompt = () => {
    if (confirm('¿Restablecer el prompt a las instrucciones predeterminadas de Andrés Morales?')) {
      setPromptText(DEFAULT_SYSTEM_PROMPT);
      setPromptNotice({ type: 'ok', text: 'Prompt restablecido a la plantilla predeterminada. Haz clic en "Guardar Instrucciones" para aplicar.' });
    }
  };

  const handleTestPromptSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testSimMessage.trim() || simulatingPrompt) return;
    setSimulatingPrompt(true);
    setSimResult(null);

    try {
      const res = await fetch('/api/admin/crm/agent/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testSimMessage.trim(),
          prompt: promptText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSimResult({
          reply: data.reply,
          durationMs: data.durationMs,
          wantsHuman: data.wantsHuman,
        });
      } else {
        alert('Error en simulación: ' + (data.error || ''));
      }
    } catch {
      alert('Error de conexión al simular respuesta');
    } finally {
      setSimulatingPrompt(false);
    }
  };

  return (
    <AdminShell
      username={username}
      locale={locale}
      title="CRM & Pipeline de Clientes"
      subtitle="Gestión centralizada de leads, cotizaciones web y automatizaciones • $0 APIs"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/admin/analytics`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1E1810]/15 hover:border-[#f96e03] text-xs font-semibold text-[#1E1810] transition-all shadow-sm"
          >
            <BarChart3 className="w-4 h-4 text-[#f96e03]" />
            <span className="hidden sm:inline">Métricas Web</span>
          </Link>
          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Cliente</span>
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Evolution API WhatsApp Live Integration Banner */}
        <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-lg shrink-0 ${
                evoStatus?.connected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-stone-100 text-stone-500 border border-stone-200'
              }`}
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#1E1810]">
                  WhatsApp Evolution API
                </span>
                {evoStatus?.connected ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Conectado · {evoStatus.number || '+57 316 148 2507'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-bold inline-flex items-center gap-1">
                    <span>Desconectado</span>
                  </span>
                )}
                <span className="text-[10px] font-mono text-stone-400">
                  Instancia: {evoStatus?.instanceName || 'AM'}
                </span>
              </div>
              <p className="text-xs text-[#575250] mt-0.5">
                {evoStatus?.profileName || 'Andres Morales Inteligencia Artificial'} • {evoStatus?.chatsCount || 36} chats activos • Envíos directos desde el servidor a tus clientes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refreshEvoStatus}
              disabled={refreshingEvo}
              className="p-2 rounded-xl border border-stone-200 hover:border-[#1E1810] text-stone-600 hover:text-[#1E1810] transition-colors cursor-pointer"
              title="Refrescar estado de Evolution API"
            >
              <RefreshCw className={`w-4 h-4 ${refreshingEvo ? 'animate-spin' : ''}`} />
            </button>
            <a
              href="https://evo.andresmorales.com.co/manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-[#1E1810] transition-colors shadow-sm cursor-pointer"
            >
              <span>Evolution Manager</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </a>
          </div>
        </div>

        {/* Metric Cards ("Sabroseins") matching andresmorales.com.co */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => {
              setActiveTab('pipeline');
              setStatusFilter('all');
            }}
            className="bg-white border border-[#1E1810]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-[#575250] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#f96e03]" />
                Total Prospectos
              </span>
              <span className="text-[10px] text-stone-400 group-hover:text-[#1E1810]">Pipeline →</span>
            </p>
            <p className="text-3xl font-serif font-bold text-[#1E1810] mt-2">
              {stats.total}
            </p>
          </div>

          <div
            onClick={() => setActiveTab('briefs')}
            className={`rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border ${
              activeTab === 'briefs'
                ? 'bg-purple-100/70 border-purple-400 ring-2 ring-purple-400/20'
                : 'bg-purple-50/50 border-purple-200'
            }`}
          >
            <p className="text-xs font-mono uppercase tracking-wider text-purple-800 flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Briefs Recibidos
              </span>
              <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-mono font-bold">
                Cuestionarios
              </span>
            </p>
            <p className="text-3xl font-serif font-bold text-purple-900 mt-2 flex items-center gap-2">
              {stats.briefsCount}
              <span className="text-xs font-sans font-medium text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-full">
                Listos para evaluar
              </span>
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab('pipeline');
              setStatusFilter('in_conversation');
            }}
            className="bg-white border border-[#1E1810]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5">
              <Clock3 className="w-4 h-4 text-amber-600" />
              En Conversación
            </p>
            <p className="text-3xl font-serif font-bold text-amber-600 mt-2">
              {stats.inProgress}
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab('pipeline');
              setStatusFilter('closed_won');
            }}
            className="bg-white border border-[#1E1810]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-[#575250] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cerrados / Ganados
            </p>
            <p className="text-3xl font-serif font-bold text-emerald-600 mt-2">
              {stats.closed}
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#1E1810]/10 rounded-2xl p-2.5 shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('briefs')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'briefs'
                  ? 'bg-purple-900 text-white shadow-sm'
                  : 'text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Briefs de Proyecto</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'briefs'
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-200 text-purple-800'
                }`}
              >
                {stats.briefsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
              }`}
            >
              <Users className="w-4 h-4 text-[#f96e03]" />
              <span>Pipeline CRM</span>
            </button>

            <Link
              href={`/${locale}/admin/clients`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#575250] hover:text-[#1E1810] hover:bg-stone-100 transition-all border border-stone-200/60 bg-white"
              title="Ir al Directorio de Clientes"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Directorio Clientes</span>
            </Link>

            <Link
              href={`/${locale}/admin/companies`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#575250] hover:text-[#1E1810] hover:bg-stone-100 transition-all border border-stone-200/60 bg-white"
              title="Ir al Directorio de Empresas B2B"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Empresas B2B</span>
            </Link>

            <button
              onClick={() => setActiveTab('proposals')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'proposals'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Propuestas Web</span>
              {proposals.length > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'proposals'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {proposals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
              }`}
            >
              <Mail className="w-4 h-4 text-[#f96e03]" />
              <span>Bandeja de Email (Mailcow)</span>
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'automations'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'text-[#575250] hover:text-[#1E1810] hover:bg-stone-100'
              }`}
            >
              <Zap className="w-4 h-4 text-[#f96e03]" />
              <span>Automatizaciones & Agente IA</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'automations'
                    ? 'bg-[#f96e03] text-[#1E1810]'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                Gemini
              </span>
            </button>
          </div>

          {activeTab === 'pipeline' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-white text-[#1E1810] font-bold shadow-sm'
                      : 'text-[#575250] hover:text-[#1E1810]'
                  }`}
                  title="Vista Tablero Kanban"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tablero</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-[#1E1810] font-bold shadow-sm'
                      : 'text-[#575250] hover:text-[#1E1810]'
                  }`}
                  title="Vista Tabla"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tabla</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: PIPELINE & LEADS (KANBAN / TABLE)                */}
        {/* ======================================================== */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#1E1810]/10 rounded-2xl p-3 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, email, empresa..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] placeholder:text-stone-400 focus:outline-none focus:border-[#f96e03]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                >
                  <option value="all">Todos los estados ({leads.length})</option>
                  <option value="new">Nuevo Lead</option>
                  <option value="brief_received">Brief Recibido</option>
                  <option value="in_conversation">En Conversación / WhatsApp</option>
                  <option value="proposal_sent">Propuesta Enviada</option>
                  <option value="in_development">En Desarrollo</option>
                  <option value="closed_won">Cerrado / Ganado</option>
                  <option value="closed_lost">Descartado / Perdido</option>
                </select>
              </div>
            </div>

            {/* View: Kanban Columns */}
            {viewMode === 'kanban' ? (
              <div className="flex gap-4 overflow-x-auto pb-4 items-start min-w-full">
                {STATUS_COLUMNS.map((col, colIndex) => {
                  const colLeads = filteredLeads.filter((l) => l.status === col.id);
                  return (
                    <div
                      key={col.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverCol !== col.id) setDragOverCol(col.id);
                      }}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          if (dragOverCol === col.id) setDragOverCol(null);
                        }
                      }}
                      onDrop={(e) => handleDropOnColumn(e, col.id)}
                      className={`w-[280px] sm:w-[295px] shrink-0 rounded-2xl p-3 flex flex-col min-h-[400px] transition-all duration-150 ${
                        dragOverCol === col.id
                          ? 'bg-orange-50/90 border-2 border-[#f96e03] ring-4 ring-[#f96e03]/15 shadow-md scale-[1.01]'
                          : 'bg-[#FAF7F5] border border-stone-200/80 shadow-sm'
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200/70">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E1810]">
                          {col.label}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${col.badge}`}>
                          {colLeads.length}
                        </span>
                      </div>

                      {/* Drop Zone Indicator */}
                      {dragOverCol === col.id && (
                        <div className="border-2 border-dashed border-[#f96e03] bg-orange-100/70 text-[#f96e03] rounded-xl p-2.5 mb-2.5 text-center text-[11px] font-bold flex items-center justify-center gap-1.5 animate-pulse">
                          <span>Soltar aquí ({col.label})</span>
                        </div>
                      )}

                      {/* Cards list */}
                      <div className="space-y-2.5 flex-1 min-h-[100px]">
                        {colLeads.map((lead) => {
                          const isBeingDragged = draggedLeadId === lead.id;
                          return (
                            <div
                              key={lead.id}
                              draggable
                              onDragStart={(e) => {
                                isDraggingCardRef.current = true;
                                e.dataTransfer.setData('text/plain', lead.id);
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggedLeadId(lead.id);
                              }}
                              onDragEnd={() => {
                                setDraggedLeadId(null);
                                setDragOverCol(null);
                                setTimeout(() => {
                                  isDraggingCardRef.current = false;
                                }, 120);
                              }}
                              onClick={() => handleSelectLead(lead)}
                              className={`bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#f96e03] rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all shadow-sm hover:shadow-md group relative select-none ${
                                isBeingDragged
                                  ? 'opacity-30 scale-95 border-dashed border-[#f96e03] ring-2 ring-[#f96e03]/20'
                                  : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  <GripVertical className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 shrink-0 cursor-grab" />
                                  <h3 className="text-xs font-bold text-[#1E1810] group-hover:text-[#f96e03] transition-colors truncate">
                                    {lead.name}
                                  </h3>
                                </div>
                                {lead.score === 'hot' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700 shrink-0">
                                    🔥 Caliente
                                  </span>
                                )}
                              </div>

                            {lead.company && (
                              <p className="text-[11px] text-[#575250] flex items-center gap-1 truncate mb-1">
                                <Building2 className="w-3 h-3 text-stone-400" />
                                {lead.company}
                              </p>
                            )}

                            {lead.service && (
                              <p className="text-[11px] text-[#575250] truncate mb-1.5">
                                {lead.service}
                              </p>
                            )}

                            {lead.budget && (
                              <p className="text-[11px] font-mono text-[#f96e03] font-bold flex items-center gap-1 mb-2">
                                <DollarSign className="w-3 h-3" />
                                {lead.budget}
                              </p>
                            )}

                            {lead.followUpDate && (
                              <div className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1 mb-2">
                                <Clock className="w-3 h-3" />
                                <span>{lead.followUpDate}</span>
                              </div>
                            )}

                            {/* Card Footer Quick Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2 gap-1.5">
                              {/* Quick Stage Transitions */}
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {colIndex > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStatus(lead.id, lead.status, 'prev')}
                                    className="px-1.5 py-0.5 rounded hover:bg-stone-200 bg-stone-100 text-stone-600 text-[10px] font-mono cursor-pointer transition-colors"
                                    title={`Retroceder a ${STATUS_COLUMNS[colIndex - 1].label}`}
                                  >
                                    ←
                                  </button>
                                )}
                                {colIndex < STATUS_COLUMNS.length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceStatus(lead.id, lead.status, 'next')}
                                    className="px-2 py-0.5 rounded bg-purple-100 hover:bg-[#f96e03] hover:text-white text-purple-900 text-[10px] font-mono font-bold cursor-pointer transition-colors"
                                    title={`Avanzar a ${STATUS_COLUMNS[colIndex + 1].label}`}
                                  >
                                    {col.id === 'brief_received' ? 'Convertir →' : 'Avanzar →'}
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {(lead.pdfUrl || lead.briefData?.pdfUrl || lead.auditSlug || lead.company?.toLowerCase().includes('bosi') || lead.name?.toLowerCase().includes('bosi')) && (
                                  <a
                                    href={lead.pdfUrl || lead.briefData?.pdfUrl || '/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf'}
                                    download="Ultra_Auditoria_UX_UI_Bosi_Colombia_AndresMorales.pdf"
                                    className="p-1 rounded hover:bg-emerald-50 text-emerald-700 transition-colors cursor-pointer"
                                    title="Descargar Dictamen Técnico PDF"
                                  >
                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                  </a>
                                )}
                                {lead.phone && (
                                  <button
                                    type="button"
                                    onClick={() => openWhatsAppModalForLead(lead)}
                                    className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                                    title={`Enviar WhatsApp a ${lead.phone} vía Evolution API`}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => openProposalModalForLead(lead)}
                                  className="p-1 rounded hover:bg-purple-50 text-purple-700 transition-colors cursor-pointer"
                                  title="Generar propuesta web"
                                >
                                  <FilePlus className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEmailModalForLead(lead)}
                                  className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                                  title="Enviar correo con Mailcow"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSendTelegram(lead)}
                                  className="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                                  title="Notificar a Telegram"
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => triggerN8nWebhook(lead)}
                                  disabled={triggeringId === lead.id}
                                  className="p-1 rounded hover:bg-orange-50 text-[#f96e03] transition-colors cursor-pointer"
                                  title="Disparar flujo en n8n"
                                >
                                  <Zap className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                        {colLeads.length === 0 && (
                          <div className="text-center py-8 text-stone-400 text-xs font-mono">
                            Sin clientes
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* View: Table */
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200 font-mono text-[#575250] text-xs">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">Cliente</th>
                      <th className="py-3.5 px-4 font-bold">Empresa</th>
                      <th className="py-3.5 px-4 font-bold">Contacto</th>
                      <th className="py-3.5 px-4 font-bold">Prioridad</th>
                      <th className="py-3.5 px-4 font-bold">Servicio / Presupuesto</th>
                      <th className="py-3.5 px-4 font-bold">Estado</th>
                      <th className="py-3.5 px-4 text-right font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-stone-50/70 cursor-pointer transition-colors"
                        onClick={() => handleSelectLead(lead)}
                      >
                        <td className="py-3 px-4">
                          <p className="font-bold text-[#1E1810]">{lead.name}</p>
                          <span className="text-[10px] font-mono text-stone-400">
                            Origen: {lead.source}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#575250]">
                          {lead.company || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#575250]">
                          <div>{lead.email}</div>
                          {lead.phone && <div className="text-xs text-stone-400">{lead.phone}</div>}
                        </td>
                        <td className="py-3 px-4">
                          {lead.score === 'hot' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                              <Flame className="w-3 h-3 text-red-600" />
                              🔥 Caliente
                            </span>
                          ) : lead.score === 'warm' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              Moderado
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                              Exploración
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-[#1E1810] font-medium truncate max-w-xs">{lead.service}</p>
                          {lead.budget && (
                            <span className="text-xs font-mono font-bold text-[#f96e03]">
                              {lead.budget}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                          >
                            <option value="new">Nuevo</option>
                            <option value="brief_received">Brief</option>
                            <option value="in_conversation">Conversación</option>
                            <option value="proposal_sent">Propuesta</option>
                            <option value="in_development">Desarrollo</option>
                            <option value="closed_won">Ganado</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {(lead.pdfUrl || lead.briefData?.pdfUrl || lead.auditSlug || lead.company?.toLowerCase().includes('bosi') || lead.name?.toLowerCase().includes('bosi')) && (
                              <a
                                href={lead.pdfUrl || lead.briefData?.pdfUrl || '/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf'}
                                download="Ultra_Auditoria_UX_UI_Bosi_Colombia_AndresMorales.pdf"
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors cursor-pointer"
                                title="Descargar Dictamen Técnico PDF"
                              >
                                <Download className="w-4 h-4 text-emerald-600" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openProposalModalForLead(lead)}
                              className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-700 transition-colors cursor-pointer"
                              title="Crear propuesta web"
                            >
                              <FilePlus className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEmailModalForLead(lead)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                              title="Enviar correo"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendTelegram(lead)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                              title="Notificar Telegram"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerN8nWebhook(lead)}
                              disabled={triggeringId === lead.id}
                              className="p-1.5 rounded-lg hover:bg-orange-50 text-[#f96e03] transition-colors cursor-pointer"
                              title="Disparar n8n"
                            >
                              <Zap className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLead(lead.id, lead.name)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BRIEFS DE PROYECTOS RECIBIDOS                     */}
        {/* ======================================================== */}
        {activeTab === 'briefs' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-white to-amber-50/30 border border-purple-200/80 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-mono font-bold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{briefLeads.length} Briefs Registrados en el Sistema</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1810]">
                    Requerimientos & Cuestionarios de Clientes
                  </h2>
                  <p className="text-xs sm:text-sm text-[#575250] mt-1 max-w-2xl leading-relaxed">
                    Prospectos que han completado los cuestionarios web. Evalúa el alcance, conviértelos a leads activos con 1 clic para moverlos a tu pipeline, o contáctalos directamente por WhatsApp y Mailcow.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('pipeline');
                      setStatusFilter('brief_received');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#1E1810] text-xs font-bold text-[#1E1810] transition-colors shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Kanban className="w-4 h-4 text-[#f96e03]" />
                    <span>Ver en Pipeline</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Banner on Conversion */}
            {convertedNotice && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">¡Brief de {convertedNotice.name} convertido con éxito!</p>
                    <p className="text-[11px] text-emerald-700">Estado actualizado a "En Contacto / WhatsApp" y registrado en tu Pipeline de Ventas.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('pipeline');
                    setStatusFilter('in_conversation');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Ver en Pipeline →
                </button>
              </div>
            )}

            {/* Brief Sub-filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setBriefFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  briefFilter === 'all'
                    ? 'bg-[#1E1810] text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-[#575250] hover:text-[#1E1810]'
                }`}
              >
                Todos los Briefs ({briefLeads.length})
              </button>
              <button
                type="button"
                onClick={() => setBriefFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  briefFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm font-bold'
                    : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                ⏳ Pendientes de Conversión ({pendingBriefsCount})
              </button>
              <button
                type="button"
                onClick={() => setBriefFilter('converted')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  briefFilter === 'converted'
                    ? 'bg-emerald-700 text-white shadow-sm font-bold'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                ✓ Convertidos a Pipeline ({convertedBriefsCount})
              </button>
            </div>

            {/* Brief Cards List */}
            {filteredBriefLeads.length === 0 ? (
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-12 text-center">
                <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-serif font-bold text-[#1E1810]">
                  No hay briefs en esta categoría
                </h3>
                <p className="text-xs text-[#575250] mt-1">
                  {briefFilter === 'pending'
                    ? 'Todos los briefs han sido convertidos a leads activos en el pipeline.'
                    : 'Los cuestionarios que envíen los clientes aparecerán automáticamente aquí.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filteredBriefLeads.map((lead) => {
                  const brief = lead.briefData || {};
                  const toolsList: string[] = Array.isArray(brief.tools) ? brief.tools : [];
                  const rawPhone = lead.phone || brief.phone || brief.telefono || '';
                  const cleanPhone = rawPhone.replace(/\D/g, '');
                  const waUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}?text=${encodeURIComponent(
                        `Hola ${lead.name}, te saluda Andrés Morales. Recibí con mucho interés el brief de proyecto que nos enviaste sobre "${lead.service || 'automatización / desarrollo'}". ¿Te viene bien si conversamos unos minutos para afinar detalles?`
                      )}`
                    : null;

                  return (
                    <div
                      key={lead.id}
                      className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-800 font-serif font-bold text-lg shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-serif font-bold text-[#1E1810]">
                                {lead.name}
                              </h3>
                              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                                {lead.source === 'brief-web' ? '⚡ Web Express' : '📋 Brief de Proyecto'}
                              </span>
                              {brief.mode && (
                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                                  Modo: {brief.mode}
                                </span>
                              )}

                              {/* Pipeline Status Indicator */}
                              {lead.status === 'brief_received' ? (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-xs">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>⏳ Pendiente de Conversión</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1 shadow-xs">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>✓ En Pipeline ({STATUS_COLUMNS.find((c) => c.id === lead.status)?.label || lead.status})</span>
                                </span>
                              )}

                              {/* Lead Score Badge */}
                              {lead.score === 'hot' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1 shadow-xs">
                                  <Flame className="w-3 h-3 text-red-600" />
                                  <span>🔥 Lead Caliente</span>
                                </span>
                              )}
                              {lead.score === 'warm' && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  <span>Moderado</span>
                                </span>
                              )}
                              {lead.score === 'cold' && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                  Exploración
                                </span>
                              )}

                              {lead.followUpDate && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  <span>Seguimiento: {lead.followUpDate}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-[#575250] mt-1 flex-wrap">
                              {lead.company && (
                                <span className="flex items-center gap-1 font-medium text-[#1E1810]">
                                  <Building2 className="w-3.5 h-3.5 text-stone-400" />
                                  {lead.company} {brief.role ? `(${brief.role})` : ''}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-stone-400">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(lead.createdAt).toLocaleDateString('es-CO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <label className="text-[11px] font-mono uppercase text-stone-400 font-bold">
                            Estado:
                          </label>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-[#1E1810] focus:outline-none focus:border-[#f96e03] cursor-pointer"
                          >
                            <option value="new">Nuevo Lead</option>
                            <option value="brief_received">Brief Recibido</option>
                            <option value="in_conversation">En Conversación</option>
                            <option value="proposal_sent">Propuesta Enviada</option>
                            <option value="in_development">En Desarrollo</option>
                            <option value="closed_won">Cerrado / Ganado</option>
                          </select>
                        </div>
                      </div>

                      {/* Key Meta Badges */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-[#f96e03]" />
                          <span className="font-semibold">Servicio:</span>
                          <span>{lead.service}</span>
                        </div>

                        {lead.budget && (
                          <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-1.5 font-mono">
                            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                            <span>Presupuesto: {lead.budget}</span>
                          </div>
                        )}

                        {(brief.timeline || brief.plazo) && (
                          <div className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium flex items-center gap-1.5 font-mono">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Plazo: {brief.timeline || brief.plazo}</span>
                          </div>
                        )}

                        {brief.frequency && (
                          <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#575250] flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
                            <span>Frecuencia: {brief.frequency}</span>
                          </div>
                        )}
                      </div>

                      {/* Content Section: Problem and Goal */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Problem */}
                        <div className="bg-[#FAF7F5] border border-stone-200/80 rounded-xl p-4">
                          <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#575250] font-bold flex items-center gap-1.5 mb-2">
                            <Target className="w-3.5 h-3.5 text-red-500" />
                            <span>Problema o Requerimiento:</span>
                          </h4>
                          <p className="text-xs sm:text-sm text-[#1E1810] leading-relaxed whitespace-pre-wrap">
                            {brief.problem || lead.message || 'Sin descripción detallada'}
                          </p>
                        </div>

                        {/* Goal / Metric */}
                        <div className="bg-[#FAF7F5] border border-stone-200/80 rounded-xl p-4">
                          <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#575250] font-bold flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Objetivo & Métrica de Éxito:</span>
                          </h4>
                          <p className="text-xs sm:text-sm text-[#1E1810] leading-relaxed whitespace-pre-wrap">
                            {brief.goal || 'No especificado'}
                          </p>
                          {brief.successMetric && (
                            <div className="mt-2.5 pt-2 border-t border-stone-200/70 text-xs text-[#575250]">
                              <span className="font-bold text-[#1E1810]">Métrica de éxito: </span>
                              {brief.successMetric}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tools in use */}
                      {toolsList.length > 0 && (
                        <div>
                          <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold block mb-1.5">
                            Herramientas actuales del cliente:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {toolsList.map((tool, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs text-[#1E1810] font-medium"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Notes */}
                      {(brief.additionalNotes || brief.notes) &&
                        brief.additionalNotes !== '—' &&
                        brief.notes !== '—' && (
                          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                            <span className="font-bold">Notas adicionales del cliente: </span>
                            {brief.additionalNotes || brief.notes}
                          </div>
                        )}

                      {/* Card Actions Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-100">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* CONVERT TO ACTIVE LEAD BUTTON */}
                          {lead.status === 'brief_received' ? (
                            <button
                              type="button"
                              onClick={() => handleConvertBriefToLead(lead.id)}
                              disabled={convertingId === lead.id}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>{convertingId === lead.id ? 'Convirtiendo...' : '⚡ Convertir a Lead Comercial'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('pipeline');
                                setStatusFilter(lead.status);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all cursor-pointer"
                            >
                              <span>Ver en Pipeline ({STATUS_COLUMNS.find((c) => c.id === lead.status)?.label || lead.status})</span>
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                            </button>
                          )}

                          {/* Evolution API Direct WhatsApp */}
                          {(rawPhone || lead.phone) && (
                            <button
                              type="button"
                              onClick={() => openWhatsAppModalForLead(lead)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                              title="Enviar mensaje directo vía Evolution API"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-200" />
                              <span>WhatsApp (API)</span>
                            </button>
                          )}

                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border border-stone-200 hover:border-emerald-500 text-stone-600 hover:text-emerald-700 text-xs font-medium transition-all cursor-pointer"
                              title="Abrir en WhatsApp Web externo"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Web</span>
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => openProposalModalForLead(lead)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <FilePlus className="w-3.5 h-3.5 text-purple-200" />
                            <span>📑 Crear Propuesta Web</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              openEmailModalForLead(lead);
                              applyEmailTemplate('brief_response');
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#f96e03]" />
                            <span>Responder por Mailcow</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendTelegram(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                            title="Enviar recordatorio a tu bot de Telegram"
                          >
                            <Bell className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {telegramStatus?.id === lead.id
                                ? telegramStatus.msg
                                : 'Avisar a Telegram'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => triggerN8nWebhook(lead)}
                            disabled={triggeringId === lead.id}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-[#1E1810] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#f96e03]" />
                            <span>{triggeringId === lead.id ? '...' : 'n8n'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectLead(lead)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 hover:border-[#f96e03] text-xs font-bold text-[#1E1810] hover:text-[#f96e03] transition-colors cursor-pointer"
                        >
                          <span>Ver Ficha Completa & Notas</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PROPUESTAS WEB PRIVADAS                           */}
        {/* ======================================================== */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50/30 border border-emerald-200/80 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold mb-2">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{proposals.length} Propuestas Registradas</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1810]">
                    Cotizaciones & Propuestas Web en 1 Clic
                  </h2>
                  <p className="text-xs sm:text-sm text-[#575250] mt-1 max-w-2xl leading-relaxed">
                    Páginas web privadas e interactivas generadas directamente para tus prospectos. Cada cliente puede ver su diagnóstico, fases de entrega con semanas estimadas, monto de inversión y pulsar el botón formal de aceptación.
                  </p>
                </div>
              </div>
            </div>

            {/* Created URL Banner */}
            {createdProposalUrl && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-purple-900 block">
                  🎉 ¡Propuesta generada exitosamente!
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    readOnly
                    value={createdProposalUrl}
                    className="w-full sm:flex-1 px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-mono text-purple-950 select-all"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdProposalUrl, 'banner')}
                      className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      {copiedToken === 'banner' ? (
                        <>
                          <CheckCheck className="w-4 h-4 text-emerald-300" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Enlace</span>
                        </>
                      )}
                    </button>
                    <a
                      href={createdProposalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white border border-purple-300 text-purple-900 hover:bg-purple-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Ver Online</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Proposals List */}
            {proposals.length === 0 ? (
              <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-12 text-center space-y-3">
                <FileCheck className="w-10 h-10 text-stone-300 mx-auto" />
                <h3 className="text-base font-serif font-bold text-[#1E1810]">
                  No has generado propuestas todavía
                </h3>
                <p className="text-xs text-[#575250] max-w-md mx-auto leading-relaxed">
                  Puedes abrir cualquier lead o brief en la pestaña anterior y pulsar el botón{' '}
                  <strong className="text-[#1E1810]">"📑 Crear Propuesta Web"</strong> para generar un enlace privado interactivo prellenado en segundos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {proposals.map((prop) => {
                  const url = `https://andresmorales.com.co/${locale}/p/${prop.token}`;
                  const isAccepted = prop.status === 'accepted';

                  return (
                    <div
                      key={prop.id}
                      className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-serif font-bold text-[#1E1810]">
                              {prop.title}
                            </h3>
                            <span
                              className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                                isAccepted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : prop.status === 'sent'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}
                            >
                              {isAccepted
                                ? '🎉 Aceptada por el Cliente'
                                : prop.status === 'sent'
                                ? 'Enviada al Cliente'
                                : 'Borrador'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#575250] mt-1 flex-wrap">
                            <span className="font-semibold text-[#1E1810]">
                              Para: {prop.clientName}
                            </span>
                            {prop.clientCompany && (
                              <span>({prop.clientCompany})</span>
                            )}
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-400">
                              {prop.clientEmail}
                            </span>
                            <span className="text-stone-400">·</span>
                            <span className="text-stone-400">
                              {new Date(prop.createdAt).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">
                            Inversión
                          </span>
                          <span className="text-lg font-serif font-bold text-amber-700">
                            {prop.investmentAmount}
                          </span>
                        </div>
                      </div>

                      {/* Scope Summary Preview */}
                      {prop.scopeSummary && (
                        <div className="bg-[#FAF7F5] border border-stone-200/70 rounded-xl p-4 text-xs text-[#575250] leading-relaxed whitespace-pre-wrap">
                          <span className="font-bold text-[#1E1810] block mb-1">
                            Diagnóstico / Alcance incluido:
                          </span>
                          {prop.scopeSummary}
                        </div>
                      )}

                      {/* Deliverables summary */}
                      {prop.deliverables && prop.deliverables.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {prop.deliverables.map((d, i) => (
                            <div
                              key={i}
                              className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] flex items-center gap-1.5"
                            >
                              <span className="font-bold text-[#f96e03] font-mono">
                                {d.phase}:
                              </span>
                              <span>{d.title}</span>
                              {d.duration && (
                                <span className="text-[10px] text-stone-400 font-mono">
                                  ({d.duration})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Client acceptance note if any */}
                      {prop.clientNotes && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                          <strong className="block mb-0.5">Comentario del cliente al aceptar:</strong>
                          <span>"{prop.clientNotes}"</span>
                        </div>
                      )}

                      {/* URL Box & Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <code className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 truncate max-w-xs">
                            {url}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url, prop.id)}
                            className="p-2 rounded-xl border border-stone-200 hover:border-[#f96e03] text-stone-600 hover:text-[#1E1810] transition-colors cursor-pointer"
                            title="Copiar enlace"
                          >
                            {copiedToken === prop.id ? (
                              <CheckCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-[#1E1810] text-xs font-bold text-[#1E1810] transition-colors shadow-sm cursor-pointer"
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {(() => {
                            const propLead = leads.find((l) => l.id === prop.leadId);
                            const propPhone = propLead?.phone ? propLead.phone.replace(/\D/g, '') : '';
                            if (!propPhone) return null;
                            const fullPhone = propPhone.startsWith('57') ? propPhone : `57${propPhone}`;
                            return (
                              <a
                                href={`https://wa.me/${fullPhone}?text=${encodeURIComponent(
                                  `¡Hola ${prop.clientName}! 👋 Andrés Morales por aquí.\n\nYa tengo lista la propuesta interactiva para tu proyecto "${prop.title}".\n\nPuedes revisarla en detalle, ver las etapas y confirmarla aquí:\n👉 ${url}\n\nQuedo a tu disposición si tienes alguna inquietud.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
                                title="Abrir chat de WhatsApp prellenado"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </a>
                            );
                          })()}

                          <button
                            type="button"
                            disabled={dispatchingProposalId === prop.id}
                            onClick={() => handleDispatchProposal(prop.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            title="Envía correo por Mailcow y mensaje por WhatsApp automáticamente"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>{dispatchingProposalId === prop.id ? 'Despachando...' : 'Despachar (Email + WA)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEmailTo(prop.clientEmail);
                              setEmailToName(prop.clientName);
                              setEmailSubject(`Propuesta Formal de Proyecto — ${prop.title}`);
                              setEmailBody(
                                `Hola ${prop.clientName},\n\nUn gusto saludarte. He preparado la propuesta interactiva detallada para tu proyecto:\n\n👉 Enlace privado: ${url}\n\nEn la página encontrarás el diagnóstico, el cronograma de entregas desglosado por semanas y el valor de inversión.\n\nPuedes revisarla y aceptarla directamente en la plataforma cuando desees.\n\nQuedo a tu total disposición.\n\nUn saludo cordial,\nAndrés Morales\nhttps://andresmorales.com.co`
                              );
                              setActiveTab('email');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                            title="Editar en el redactor de correo antes de enviar"
                          >
                            <Mail className="w-3.5 h-3.5 text-[#f96e03]" />
                            <span>Borrador Correo</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: EMAIL SECTION (MAILCOW LOCAL SERVER)              */}
        {/* ======================================================== */}
        {activeTab === 'email' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose Card */}
            <div className="lg:col-span-2 bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <div>
                  <h2 className="text-lg font-serif font-bold text-[#1E1810] flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#f96e03]" />
                    Redactar Correo vía Mailcow
                  </h2>
                  <p className="text-xs text-[#575250] mt-0.5">
                    Enviado desde tu servidor local Mailcow (<code>info@andresmorales.com.co</code>).
                  </p>
                </div>

                <a
                  href="https://mail.cleida.com.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs text-[#1E1810] font-medium transition-colors"
                >
                  <span>Abrir Webmail Completo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {emailNotice && (
                <div
                  className={`mb-6 p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 ${
                    emailNotice.type === 'ok'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {emailNotice.type === 'ok' ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
                  <span>{emailNotice.text}</span>
                </div>
              )}

              {/* Quick Template Chips & AI Generator */}
              <div className="mb-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#575250] block font-bold">
                    Plantillas & Asistente IA:
                  </span>
                  <button
                    type="button"
                    disabled={generatingAiDraft}
                    onClick={() => handleGenerateAiEmailDraft()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
                    title="Usa Gemini Flash para redactar el correo con contexto del CRM y sin precios"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{generatingAiDraft ? 'Redactando con IA...' : '🤖 Redactar con IA (Gemini Flash)'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={generatingAiDraft}
                    onClick={() => handleGenerateAiEmailDraft('Borrador de respuesta cálida al brief recibido invitando a llamada de 30 min')}
                    className="px-3 py-1.5 rounded-full bg-purple-100 hover:bg-purple-200 text-xs border border-purple-200 text-purple-900 font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>⚡ IA: Responder Brief</span>
                  </button>
                  <button
                    type="button"
                    disabled={generatingAiDraft}
                    onClick={() => handleGenerateAiEmailDraft('Borrador de seguimiento consultando si pudieron revisar la información y ofreciendo llamada de 30 min')}
                    className="px-3 py-1.5 rounded-full bg-indigo-100 hover:bg-indigo-200 text-xs border border-indigo-200 text-indigo-900 font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>⚡ IA: Seguimiento Comercial</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('intro')}
                    className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs border border-stone-200 text-[#1E1810] font-medium cursor-pointer"
                  >
                    1. Saludo & Agendar Llamada
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('proposal')}
                    className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs border border-stone-200 text-[#1E1810] font-medium cursor-pointer"
                  >
                    2. Enviar Propuesta
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate('followup')}
                    className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-xs border border-stone-200 text-[#1E1810] font-medium cursor-pointer"
                  >
                    3. Seguimiento
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                      Para (Email Destinatario)
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="cliente@ejemplo.com"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                      Nombre del Destinatario
                    </label>
                    <input
                      type="text"
                      value={emailToName}
                      onChange={(e) => setEmailToName(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Asunto del Correo
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Asunto formal..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Mensaje (La firma profesional de Andrés Morales se añade automáticamente)
                  </label>
                  <textarea
                    rows={8}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="w-full px-3.5 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sendingEmail}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingEmail ? 'Enviando vía Mailcow...' : 'Enviar Correo Oficial'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Email Activity Log */}
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h3 className="text-sm font-serif font-bold text-[#1E1810] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#f96e03]" />
                  Historial de Envíos Recientes
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-[#575250]">
                  {emailLogs.length} enviados
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                {emailLogs.length === 0 ? (
                  <p className="text-center text-xs text-stone-400 py-10 font-mono">
                    No se han enviado correos todavía
                  </p>
                ) : (
                  emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-bold text-[#1E1810] truncate">
                          {log.toName || log.to}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold shrink-0 ${
                            log.status === 'sent'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status === 'sent' ? 'Enviado' : 'Fallo'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#575250] truncate">{log.subject}</p>
                      <span className="text-[10px] font-mono text-stone-400 block">
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: AUTOMATIONS (N8N & EVOLUTION API)                 */}
        {/* ======================================================== */}
        {activeTab === 'automations' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Evolution API Panel */}
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-[#1E1810] flex items-center gap-2">
                      WhatsApp Evolution API v2
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                        {evoStatus?.connected ? '🟢 Conectado' : '🔴 Desconectado'}
                      </span>
                    </h2>
                    <p className="text-xs text-[#575250] mt-0.5">
                      Instancia Baileys auto-hospedada en el servidor (puerto 8085 / Docker)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshEvoStatus}
                    disabled={refreshingEvo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#1E1810] text-xs font-semibold text-[#1E1810] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingEvo ? 'animate-spin' : ''}`} />
                    <span>Verificar</span>
                  </button>
                  <a
                    href="https://evo.andresmorales.com.co/manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>Evolution Manager</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                </div>
              </div>

              {/* Status details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                    Número Conectado
                  </span>
                  <span className="text-xs font-bold font-mono text-[#1E1810]">
                    {evoStatus?.number ? `+${evoStatus.number}` : 'No detectado'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                    Nombre Perfil
                  </span>
                  <span className="text-xs font-semibold text-[#1E1810] truncate block">
                    {evoStatus?.profileName || 'Andres Morales'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                    Instancia Docker
                  </span>
                  <span className="text-xs font-bold font-mono text-purple-700">
                    {evoStatus?.instanceName || 'AM'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                    Chats Sincronizados
                  </span>
                  <span className="text-xs font-bold font-mono text-emerald-700">
                    {evoStatus?.chatsCount || 36} chats
                  </span>
                </div>
              </div>

              {/* Webhook Automation Section */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-xs font-bold text-purple-950 font-mono uppercase tracking-wider">
                      Webhook Entrante: Creación Automática de Leads
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                    ✓ Activo (MESSAGES_UPSERT)
                  </span>
                </div>
                <p className="text-xs text-purple-900 leading-relaxed">
                  Cualquier persona que escriba a tu WhatsApp por primera vez es registrada de inmediato como <strong>Nuevo Lead</strong> en tu CRM, alertada con botones en tu <strong>Telegram</strong> y reenviada a tu flujo de <strong>n8n</strong>. Si ya existe, su mensaje se archiva en su historial.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-purple-200/60 text-[11px] font-mono text-purple-800">
                  <span className="truncate">URL: https://andresmorales.com.co/api/webhooks/evolution</span>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/admin/crm/whatsapp/webhook', { method: 'POST' });
                        const data = await res.json();
                        if (res.ok && data.ok) alert('¡Webhook de Evolution API sincronizado con éxito!');
                        else alert('Error al sincronizar webhook: ' + (data.error || ''));
                      } catch {
                        alert('Error de conexión');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-sans text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                  >
                    Reconectar Webhook
                  </button>
                </div>
              </div>

              {/* Live Test Form */}
              <div className="pt-3 border-t border-stone-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1810] mb-2 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Probar Envío de WhatsApp en Vivo</span>
                </h3>
                <p className="text-[11px] text-[#575250] mb-3">
                  Envía un mensaje de prueba desde el servidor para confirmar que la entrega de mensajes está operativa.
                </p>

                {testWaNotice && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold mb-3 ${
                      testWaNotice.type === 'ok'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {testWaNotice.text}
                  </div>
                )}

                <form onSubmit={handleSendTestWa} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-[#575250] mb-1 font-semibold">
                        Número destino (con indicativo):
                      </label>
                      <input
                        type="tel"
                        value={testWaPhone}
                        onChange={(e) => setTestWaPhone(e.target.value)}
                        placeholder="573161482507"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-[#1E1810] focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-[#575250] mb-1 font-semibold">
                        Mensaje de texto:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={testWaMessage}
                          onChange={(e) => setTestWaMessage(e.target.value)}
                          required
                          className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          type="submit"
                          disabled={sendingTestWa}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{sendingTestWa ? 'Enviando...' : 'Enviar Prueba'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* AI Agent Card */}
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#f96e03]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-[#1E1810] flex items-center gap-2">
                      Agente IA WhatsApp (Antigravity · Gemini)
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                          settings.autoReplyWhatsAppAgent !== false
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-stone-100 text-stone-600 border-stone-300'
                        }`}
                      >
                        {settings.autoReplyWhatsAppAgent !== false ? '🟢 Auto-Respuesta Activa' : '⏸️ En Pausa'}
                      </span>
                    </h2>
                    <p className="text-xs text-[#575250] mt-0.5">
                      Motor Gemini 3.8 Flash ejecutado localmente mediante la CLI de Antigravity
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAiAgent}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    settings.autoReplyWhatsAppAgent !== false
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>
                    {settings.autoReplyWhatsAppAgent !== false
                      ? 'Pausar Auto-Respuesta'
                      : 'Activar Auto-Respuesta IA'}
                  </span>
                </button>
              </div>

              {/* Rules summary pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#f96e03] font-bold block">
                    🚫 Cero Precios
                  </span>
                  <p className="text-[11px] text-[#575250] leading-snug">
                    El bot nunca da cifras ni tarifas fijas; invita a cotizar a la medida con propuesta cerrada.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-blue-700 font-bold block">
                    🔗 Casos de Éxito con Link
                  </span>
                  <p className="text-[11px] text-[#575250] leading-snug">
                    Cita enlaces reales a Barriotech, Temptum, Superllantas, Talobot y el portafolio.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                    📱 Contacto & Scoping
                  </span>
                  <p className="text-[11px] text-[#575250] leading-snug">
                    Comparte tu número (+57 316 148 2507) y link a Google Calendar para llamada de 30 min.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 text-[11px] text-orange-950 flex items-center justify-between gap-2">
                <span>
                  💡 <strong>Atención Humana Inteligente</strong>: Si un cliente pide expresamente hablar con Andrés o un asesor, el bot responde cordialmente y te envía una alerta prioritaria con botón directo a Telegram.
                </span>
              </div>
            </div>

            {/* AI Prompt Editor Card */}
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-[#f96e03]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-[#1E1810] flex items-center gap-2">
                      Editor de Prompt e Instrucciones del Agente
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-100 text-[#f96e03] font-bold border border-orange-200">
                        Gemini 3.8 Flash
                      </span>
                    </h2>
                    <p className="text-xs text-[#575250] mt-0.5">
                      Personaliza las instrucciones del bot, tono de voz, reglas de venta y enlaces oficiales.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetPrompt}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-400 text-stone-600 text-xs font-semibold transition-colors cursor-pointer"
                    title="Restablecer a la plantilla base"
                  >
                    Restablecer
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePrompt}
                    disabled={savingPrompt}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{savingPrompt ? 'Guardando...' : 'Guardar Instrucciones'}</span>
                  </button>
                </div>
              </div>

              {promptNotice && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    promptNotice.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {promptNotice.text}
                </div>
              )}

              {/* Quick Snippet Insert Badges */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase text-[#575250] font-bold block">
                  Variables y Enlaces Rápidos (clic para insertar al final):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPromptText((p) => `${p}\nWhatsApp Oficial: ${ANDRES_PHONE}`)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200 cursor-pointer"
                  >
                    + Teléfono ({ANDRES_PHONE})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptText((p) => `${p}\nAgendar Llamada: ${CALENDAR_URL}`)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200 cursor-pointer"
                  >
                    + Google Calendar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptText((p) => `${p}\nBrief Online: ${BRIEF_URL}`)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200 cursor-pointer"
                  >
                    + Formulario Brief
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptText((p) => `${p}\nCaso Talobot: https://andresmorales.com.co/es/work/talobot`)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200 cursor-pointer"
                  >
                    + Caso Talobot
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptText((p) => `${p}\nCaso Barriotech: https://andresmorales.com.co/es/work/barriotech`)}
                    className="text-[10px] font-mono px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors border border-stone-200 cursor-pointer"
                  >
                    + Caso Barriotech
                  </button>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#575250]">
                  <label className="font-mono uppercase font-bold">
                    Instrucciones del Sistema (System Prompt)
                  </label>
                  <span className="font-mono">
                    {promptText.length} caracteres · {promptText.split('\n').length} líneas
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Escribe las instrucciones del Agente IA..."
                  className="w-full p-4 rounded-xl font-mono text-xs text-[#1E1810] bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-[#f96e03] focus:ring-2 focus:ring-[#f96e03]/20 transition-all leading-relaxed"
                />
              </div>

              {/* Simulator / Test Bench */}
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f96e03] animate-pulse" />
                  <h4 className="text-xs font-bold text-orange-950 font-mono uppercase tracking-wider">
                    Simulador en Vivo: Probar Respuesta del Agente
                  </h4>
                </div>
                <p className="text-[11px] text-orange-900 leading-snug">
                  Escribe una consulta de prueba para verificar en tiempo real (~3s) cómo responderá el modelo Gemini con las instrucciones del editor.
                </p>

                <form onSubmit={handleTestPromptSimulation} className="flex gap-2">
                  <input
                    type="text"
                    value={testSimMessage}
                    onChange={(e) => setTestSimMessage(e.target.value)}
                    placeholder="Ej: Hola Andrés, cuánto cuesta una página web?"
                    required
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                  <button
                    type="submit"
                    disabled={simulatingPrompt}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#e06200] text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${simulatingPrompt ? 'animate-spin' : ''}`} />
                    <span>{simulatingPrompt ? 'Generando...' : 'Probar Prompt'}</span>
                  </button>
                </form>

                {simResult && (
                  <div className="p-3.5 rounded-xl bg-white border border-orange-200 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span className="font-bold text-[#f96e03]">🤖 Respuesta Generada por Gemini:</span>
                      <span>Latencia: {(simResult.durationMs / 1000).toFixed(1)}s</span>
                    </div>
                    <p className="text-xs text-[#1E1810] whitespace-pre-wrap leading-relaxed font-sans bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                      {simResult.reply}
                    </p>
                    {simResult.wantsHuman && (
                      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        🚨 Detectó solicitud de contacto humano (notificaría a Telegram y auto-silenciaría)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>


            {/* n8n Webhooks */}
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="pb-4 border-b border-stone-200">
                <h2 className="text-base font-serif font-bold text-[#1E1810] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#f96e03]" />
                  Webhooks de Automatización (n8n & Telegram)
                </h2>
                <p className="text-xs text-[#575250] mt-1 leading-relaxed">
                  Configura los endpoints locales de n8n para que cada acción en el CRM despierte flujos automáticos sin pagar por herramientas SaaS como Zapier o Make.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Webhook n8n: Lead Entrante (Manual o Formulario)
                  </label>
                  <input
                    type="url"
                    value={settings.n8nWebhookLead || ''}
                    onChange={(e) => setSettings({ ...settings, n8nWebhookLead: e.target.value })}
                    placeholder="https://n8n.andresmorales.com.co/webhook/lead-incoming"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Webhook n8n: Propuesta Aceptada
                  </label>
                  <input
                    type="url"
                    value={settings.n8nWebhookProposal || ''}
                    onChange={(e) => setSettings({ ...settings, n8nWebhookProposal: e.target.value })}
                    placeholder="https://n8n.andresmorales.com.co/webhook/send-proposal"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Telegram Chat ID Personal
                  </label>
                  <input
                    type="text"
                    value={settings.telegramChatId || ''}
                    onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                    placeholder="11366916"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ENVIAR WHATSAPP (EVOLUTION API)                   */}
        {/* ======================================================== */}
        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#1E1810]">
                      Enviar WhatsApp vía Evolution API
                    </h3>
                    <p className="text-[11px] text-[#575250]">
                      Desde tu número conectado: {evoStatus?.number ? `+${evoStatus.number}` : '+57 316 148 2507'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-[#1E1810] hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {waNotice && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    waNotice.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {waNotice.text}
                </div>
              )}

              <form onSubmit={handleSendWhatsApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Destinatario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={waRecipient.name || 'Cliente'}
                      className="w-1/2 px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-[#1E1810]"
                    />
                    <input
                      type="tel"
                      value={waRecipient.phone}
                      onChange={(e) => setWaRecipient({ ...waRecipient, phone: e.target.value })}
                      placeholder="573164073336"
                      required
                      className="w-1/2 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-[#1E1810] focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold">
                      Plantillas Rápidas
                    </label>
                    <span className="text-[10px] text-stone-400">Clic para autocompletar</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyWaTemplate('brief')}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      📋 Brief Recibido
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWaTemplate('intro')}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      👋 Saludo Inicial
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWaTemplate('proposal')}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      📑 Propuesta Web
                    </button>
                    <button
                      type="button"
                      onClick={() => applyWaTemplate('followup')}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      📅 Seguimiento
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Mensaje de WhatsApp
                  </label>
                  <textarea
                    rows={5}
                    value={waMessageText}
                    onChange={(e) => setWaMessageText(e.target.value)}
                    required
                    placeholder="Escribe el mensaje que se enviará al WhatsApp del cliente..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-emerald-600 leading-relaxed resize-none"
                  />
                  <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1 font-mono">
                    <span>Instancia: {evoStatus?.instanceName || 'AM'}</span>
                    <span>{waMessageText.length} caracteres</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-stone-100">
                  {waRecipient.phone && (
                    <a
                      href={`https://wa.me/${waRecipient.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>O abrir WhatsApp Web</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => setIsWhatsAppModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-[#575250] cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={sendingWhatsApp || !waRecipient.phone || !waMessageText.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingWhatsApp ? 'Enviando...' : 'Enviar por WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: NUEVO CLIENTE                                     */}
        {/* ======================================================== */}
        {isNewLeadOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <h3 className="text-base font-serif font-bold text-[#1E1810]">
                  Registrar Nuevo Cliente / Prospecto
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewLeadOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-[#1E1810] hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                      WhatsApp / Teléfono
                    </label>
                    <input
                      type="tel"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={newLeadForm.company}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                      Presupuesto Estimado
                    </label>
                    <input
                      type="text"
                      value={newLeadForm.budget}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, budget: e.target.value })}
                      placeholder="$2.000.000 COP"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Servicio de Interés
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, service: e.target.value })}
                    placeholder="Ej: Automatización n8n, Sitio Web..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] mb-1 font-bold">
                    Requerimientos Iniciales / Notas
                  </label>
                  <textarea
                    rows={3}
                    value={newLeadForm.message}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsNewLeadOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#575250] hover:bg-stone-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm"
                  >
                    Guardar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: DETALLES DE LEAD Y NOTAS                          */}
        {/* ======================================================== */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between pb-4 border-b border-stone-200 mb-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1E1810]">
                    {selectedLead.name}
                  </h3>
                  <p className="text-xs text-[#575250] mt-0.5">
                    {selectedLead.company ? `${selectedLead.company} • ` : ''}
                    Registrado el {new Date(selectedLead.createdAt).toLocaleString()} (Origen: {selectedLead.source})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#1E1810] hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Brief conversion banner if pending */}
                {selectedLead.status === 'brief_received' && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-amber-50 to-orange-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <p className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span>Brief pendiente por convertir a Lead Comercial</span>
                      </p>
                      <p className="text-[11px] text-purple-800 mt-0.5">
                        Conviértelo para iniciar la prospección en el Pipeline y agendar el seguimiento con el cliente.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConvertBriefToLead(selectedLead.id)}
                      disabled={convertingId === selectedLead.id}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{convertingId === selectedLead.id ? 'Convirtiendo...' : '⚡ Convertir a Lead Activo'}</span>
                    </button>
                  </div>
                )}

                {/* Promote / Interconnection Banner */}
                {promoteNotice && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="font-semibold">{promoteNotice}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${locale}/admin/clients?search=${encodeURIComponent(selectedLead.name)}`}
                        className="text-[11px] underline text-emerald-700 font-bold hover:text-emerald-900"
                      >
                        Ver en Clientes →
                      </Link>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-blue-50/30 border border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Directorio Corporativo (Clientes & Empresas B2B)</span>
                    </p>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Sincroniza y vincula este lead al directorio central de Clientes y Empresas con 1 clic.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedLead.company && (
                      <Link
                        href={`/${locale}/admin/companies?search=${encodeURIComponent(selectedLead.company)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-[#1E1810] transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Empresa</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handlePromoteLeadToBusiness(selectedLead.id)}
                      disabled={promotingId === selectedLead.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{promotingId === selectedLead.id ? 'Sincronizando...' : '⚡ Sincronizar'}</span>
                    </button>
                  </div>
                </div>

                {/* Contact grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                      Email
                    </span>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="text-xs font-semibold text-[#1E1810] hover:text-[#f96e03] truncate block"
                    >
                      {selectedLead.email}
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                      WhatsApp / Tel
                    </span>
                    <span className="text-xs font-semibold text-[#1E1810]">
                      {selectedLead.phone || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#575250] block mb-0.5 font-bold">
                      Estado en Pipeline
                    </span>
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                      className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-[#1E1810] font-bold focus:outline-none focus:border-[#f96e03]"
                    >
                      <option value="new">Nuevo Lead</option>
                      <option value="brief_received">Brief Recibido</option>
                      <option value="in_conversation">En Conversación / WhatsApp</option>
                      <option value="proposal_sent">Propuesta Enviada</option>
                      <option value="in_development">En Desarrollo</option>
                      <option value="closed_won">Cerrado / Ganado</option>
                    </select>
                  </div>
                </div>

                {/* Audit & PDF Download Section */}
                {(selectedLead.pdfUrl || selectedLead.auditSlug || selectedLead.company?.toLowerCase().includes('bosi') || selectedLead.name?.toLowerCase().includes('bosi')) && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>Dictamen Técnico & Auditoría UX/UI Enterprise</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800">
                          PDF Listo
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-1">
                        Reporte ejecutivo con capturas reales de móvil/desktop, diagnóstico Core Web Vitals (54/100, CLS 0.51) y arquitectura n8n.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={selectedLead.pdfUrl || '/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf'}
                        download="Ultra_Auditoria_UX_UI_Bosi_Colombia_AndresMorales.pdf"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PDF</span>
                      </a>

                      {(selectedLead.auditSlug || selectedLead.company?.toLowerCase().includes('bosi')) && (
                        <Link
                          href={`/${locale}/audit/${selectedLead.auditSlug || 'bosi-cali-zko6'}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-[#1E1810] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#f96e03]" />
                          <span>Ver Web</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority Scoring & Follow-up Action Box */}
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-900 font-bold flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-500" />
                      Prioridad & Seguimiento Comercial
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        selectedLead.score === 'hot'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : selectedLead.score === 'warm'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {selectedLead.score === 'hot'
                        ? '🔥 Lead Caliente'
                        : selectedLead.score === 'warm'
                        ? '⚡ Moderado'
                        : '💡 Exploración'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">
                        Fecha Próximo Seguimiento:
                      </label>
                      <input
                        type="date"
                        value={followUpDateInput}
                        onChange={(e) => setFollowUpDateInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-stone-500 font-bold block mb-1">
                        Nota de Seguimiento:
                      </label>
                      <input
                        type="text"
                        value={followUpNoteInput}
                        onChange={(e) => setFollowUpNoteInput(e.target.value)}
                        placeholder="Ej: Enviar propuesta, llamar el martes..."
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleSaveFollowUp(selectedLead.id)}
                      disabled={savingFollowUp}
                      className="px-3.5 py-1.5 rounded-lg bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingFollowUp ? 'Guardando...' : 'Guardar Seguimiento'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendTelegram(selectedLead)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      <span>
                        {telegramStatus?.id === selectedLead.id
                          ? telegramStatus.msg
                          : 'Avisar a Telegram'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Create Proposal Banner inside Lead Drawer */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-white to-emerald-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-serif font-bold text-[#1E1810] block">
                      ¿Generar cotización interactiva para {selectedLead.name}?
                    </span>
                    <span className="text-[11px] text-[#575250] block">
                      Crea un enlace privado con desglose de entregables, fases e inversión.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const l = selectedLead;
                      setSelectedLead(null);
                      openProposalModalForLead(l);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Crear Propuesta Web</span>
                  </button>
                </div>

                {/* Initial Message / Brief Content */}
                {selectedLead.message && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#575250] mb-2 font-bold">
                      Mensaje / Requerimiento Original:
                    </h4>
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs sm:text-sm text-[#1E1810] whitespace-pre-wrap leading-relaxed">
                      {selectedLead.message}
                    </div>
                  </div>
                )}

                {/* Brief Data if present */}
                {selectedLead.briefData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-purple-700 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Ficha Estructurada del Brief:
                      </h4>
                      {selectedLead.briefData.mode && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                          Modo: {selectedLead.briefData.mode}
                        </span>
                      )}
                    </div>

                    <div className="bg-purple-50/40 border border-purple-200/80 rounded-2xl p-4 space-y-3.5">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Empresa</span>
                          <span className="font-semibold text-[#1E1810] truncate block">
                            {selectedLead.company || selectedLead.briefData.company || '—'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Rol / Cargo</span>
                          <span className="font-semibold text-[#1E1810] truncate block">
                            {selectedLead.briefData.role || '—'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Presupuesto</span>
                          <span className="font-semibold text-amber-700 font-mono truncate block">
                            {selectedLead.budget || selectedLead.briefData.budget || '—'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Plazo de entrega</span>
                          <span className="font-semibold text-blue-700 font-mono truncate block">
                            {selectedLead.briefData.timeline || selectedLead.briefData.plazo || '—'}
                          </span>
                        </div>

                        {selectedLead.briefData.frequency && (
                          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Frecuencia</span>
                            <span className="font-semibold text-stone-700 truncate block">
                              {selectedLead.briefData.frequency}
                            </span>
                          </div>
                        )}

                        {selectedLead.briefData.projectType && (
                          <div className="p-2.5 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block">Tipo Proyecto</span>
                            <span className="font-semibold text-purple-900 truncate block">
                              {selectedLead.briefData.projectType}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp quick action */}
                      {(selectedLead.phone ||
                        selectedLead.briefData.phone ||
                        selectedLead.briefData.telefono) && (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openWhatsAppModalForLead(selectedLead)}
                            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Enviar WhatsApp Directo (Evolution API)</span>
                          </button>
                          <a
                            href={`https://wa.me/${(
                              selectedLead.phone ||
                              selectedLead.briefData.phone ||
                              selectedLead.briefData.telefono
                            ).replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hola ${selectedLead.name}, te saluda Andrés Morales sobre el brief de proyecto que nos enviaste. ¿Cómo estás?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-300 hover:border-emerald-600 text-stone-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer"
                            title="Abrir en WhatsApp Web externo"
                          >
                            <span>WhatsApp Web</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Tools list */}
                      {Array.isArray(selectedLead.briefData.tools) &&
                        selectedLead.briefData.tools.length > 0 && (
                          <div className="p-3 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block mb-1.5">
                              Herramientas que usa hoy:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedLead.briefData.tools.map((tool: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-[#1E1810] text-xs font-medium"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Goal and Success metric */}
                      {selectedLead.briefData.goal && (
                        <div className="p-3.5 rounded-xl bg-white border border-purple-100 text-xs">
                          <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block mb-1">
                            Objetivo principal del cliente:
                          </span>
                          <p className="text-[#1E1810] leading-relaxed">
                            {selectedLead.briefData.goal}
                          </p>
                          {selectedLead.briefData.successMetric && (
                            <p className="mt-2 pt-2 border-t border-stone-100 text-stone-600">
                              <strong className="text-[#1E1810]">Métrica de éxito:</strong>{' '}
                              {selectedLead.briefData.successMetric}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Attached files if present in briefData */}
                      {(() => {
                        const brief = selectedLead.briefData;
                        const allFiles: Array<{ name: string; url: string; size: number; category: string }> = [
                          ...(Array.isArray(brief.logoFiles)
                            ? brief.logoFiles.map((f: any) => ({ ...f, category: 'Logotipo' }))
                            : []),
                          ...(Array.isArray(brief.referenceFiles)
                            ? brief.referenceFiles.map((f: any) => ({ ...f, category: 'Referencia' }))
                            : []),
                          ...(Array.isArray(brief.additionalFiles)
                            ? brief.additionalFiles.map((f: any) => ({ ...f, category: 'Documento' }))
                            : []),
                          ...(Array.isArray(brief.attachmentFiles)
                            ? brief.attachmentFiles.map((f: any) => ({ ...f, category: 'Adjunto' }))
                            : []),
                        ];

                        if (allFiles.length === 0) return null;

                        return (
                          <div className="p-3.5 rounded-xl bg-white border border-purple-100 text-xs space-y-2">
                            <span className="text-[10px] font-mono uppercase text-purple-700 font-bold block">
                              📎 Archivos Adjuntos ({allFiles.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {allFiles.map((file, i) => (
                                <a
                                  key={i}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors group"
                                >
                                  <div className="truncate mr-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-600 block">
                                      {file.category}
                                    </span>
                                    <span className="font-medium text-[#1E1810] group-hover:text-amber-700 truncate block">
                                      {file.name}
                                    </span>
                                  </div>
                                  <span className="text-stone-400 group-hover:text-amber-700 text-sm">↗</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Expandable JSON details */}
                      <details className="pt-1">
                        <summary className="text-[11px] font-mono text-purple-700 cursor-pointer hover:underline">
                          Ver JSON técnico completo ({Object.keys(selectedLead.briefData).length} campos)
                        </summary>
                        <div className="mt-2 bg-stone-900 text-stone-200 rounded-xl p-3 text-[11px] font-mono overflow-x-auto max-h-48">
                          <pre>{JSON.stringify(selectedLead.briefData, null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  </div>
                )}

                {/* Mailcow Inbox Thread */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#575250] font-bold flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#f96e03]" />
                      <span>Bandeja de Correos (Mailcow Local):</span>
                    </h4>
                    {loadingInbox && (
                      <span className="text-[10px] text-stone-400 font-mono animate-pulse">
                        Consultando buzón...
                      </span>
                    )}
                  </div>

                  {inboxMessages[selectedLead.email] && inboxMessages[selectedLead.email].length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {inboxMessages[selectedLead.email].map((m: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1 hover:border-stone-300 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-[#1E1810] truncate">{m.subject}</span>
                            <span className="text-[10px] font-mono text-stone-400 shrink-0">
                              {new Date(m.date).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[#575250] line-clamp-2 leading-relaxed">{m.snippet}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-400 text-center">
                      {loadingInbox ? 'Cargando mensajes del buzón...' : 'Sin correos previos registrados con este remitente en Mailcow.'}
                    </div>
                  )}
                </div>

                {/* Internal Notes */}
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#575250] mb-2 font-bold">
                    Notas Internas ({selectedLead.notes?.length || 0}):
                  </h4>

                  <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Escribe una nota interna sobre este cliente..."
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                    <button
                      type="submit"
                      disabled={savingNote || !noteInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Añadir
                    </button>
                  </form>

                  <div className="space-y-2">
                    {selectedLead.notes?.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                        <p className="text-[#1E1810]">{n.text}</p>
                        <span className="text-[10px] text-stone-400 font-mono mt-1 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-5 border-t border-stone-200 mt-6">
                <button
                  type="button"
                  onClick={() => handleDeleteLead(selectedLead.id, selectedLead.name)}
                  className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Cliente</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const l = selectedLead;
                      setSelectedLead(null);
                      openEmailModalForLead(l);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Redactar Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerN8nWebhook(selectedLead)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Disparar n8n</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: CREAR PROPUESTA WEB INTERACTIVA                   */}
        {/* ======================================================== */}
        {isProposalModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#1E1810]/10 rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1E1810] flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-purple-700" />
                    Generar Propuesta Web en 1 Clic
                  </h3>
                  <p className="text-xs text-[#575250] mt-0.5">
                    Se creará una página web privada lista para compartir con {proposalForm.clientName}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProposalModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#1E1810] hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                      Nombre del Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      value={proposalForm.clientName}
                      onChange={(e) => setProposalForm({ ...proposalForm, clientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                      Email del Cliente *
                    </label>
                    <input
                      type="email"
                      required
                      value={proposalForm.clientEmail}
                      onChange={(e) => setProposalForm({ ...proposalForm, clientEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                      Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      value={proposalForm.clientCompany}
                      onChange={(e) => setProposalForm({ ...proposalForm, clientCompany: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                      Inversión Total Acordada
                    </label>
                    <input
                      type="text"
                      required
                      value={proposalForm.investmentAmount}
                      onChange={(e) => setProposalForm({ ...proposalForm, investmentAmount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-amber-950 font-mono font-bold focus:outline-none focus:border-[#f96e03]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    Título de la Propuesta
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.title}
                    onChange={(e) => setProposalForm({ ...proposalForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    Diagnóstico & Resumen del Alcance
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={proposalForm.scopeSummary}
                    onChange={(e) => setProposalForm({ ...proposalForm, scopeSummary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    Condiciones & Forma de Pago
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalForm.investmentTerms}
                    onChange={(e) => setProposalForm({ ...proposalForm, investmentTerms: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsProposalModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#575250] hover:bg-stone-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProposal}
                    className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {creatingProposal ? 'Generando...' : 'Publicar Propuesta & Obtener Enlace'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
