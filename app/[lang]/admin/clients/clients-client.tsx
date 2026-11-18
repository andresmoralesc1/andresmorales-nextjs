'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import type { Client, Company } from '@/lib/clients-companies-store';
import {
  Users,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Search,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  DollarSign,
  Briefcase,
  X,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ClientsClientProps {
  initialClients: Client[];
  initialCompanies: Company[];
  initialStats: {
    totalClients: number;
    activeClients: number;
    inProgressClients: number;
    potentialClients: number;
  };
  initialCompanyFilter?: string;
  initialSearchQuery?: string;
  username: string;
  locale: string;
}

export default function ClientsClient({
  initialClients,
  initialCompanies,
  initialStats,
  initialCompanyFilter = '',
  initialSearchQuery = '',
  username,
  locale,
}: ClientsClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [search, setSearch] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'en_progreso' | 'potencial' | 'inactivo'>('all');
  const [companyFilter, setCompanyFilter] = useState(initialCompanyFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    name: '',
    email: '',
    phone: '',
    role: '',
    companyId: '',
    companyName: '',
    status: 'potencial' as Client['status'],
    service: 'Automatización con IA',
    totalValue: '',
    notes: '',
    tags: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q)) ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.service && c.service.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesCompany =
        !companyFilter ||
        c.companyId === companyFilter ||
        (c.companyName && c.companyName.toLowerCase() === companyFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCompany;
    });
  }, [clients, search, statusFilter, companyFilter]);

  // Dynamic stats
  const stats = useMemo(() => {
    const total = clients.length;
    const activos = clients.filter((c) => c.status === 'activo').length;
    const enProgreso = clients.filter((c) => c.status === 'en_progreso').length;
    const potenciales = clients.filter((c) => c.status === 'potencial').length;
    return { total, activos, enProgreso, potenciales };
  }, [clients]);

  // WhatsApp link helper
  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (!digits) return null;
    const formatted = digits.length === 10 && digits.startsWith('3') ? `57${digits}` : digits;
    return `https://wa.me/${formatted}`;
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData(initialFormState);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      role: client.role || '',
      companyId: client.companyId || '',
      companyName: client.companyName || '',
      status: client.status,
      service: client.service || '',
      totalValue: client.totalValue || '',
      notes: client.notes || '',
      tags: client.tags ? client.tags.join(', ') : '',
    });
  };

  // Handle Create or Update
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('⚠️ El nombre del cliente es requerido');
      return;
    }

    setIsSubmitting(true);
    try {
      // Find selected company name if companyId chosen
      let resolvedCompanyName = formData.companyName.trim();
      if (formData.companyId) {
        const found = companies.find((comp) => comp.id === formData.companyId);
        if (found) {
          resolvedCompanyName = found.name;
        }
      }

      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role.trim(),
        companyId: formData.companyId,
        companyName: resolvedCompanyName,
        status: formData.status,
        service: formData.service.trim(),
        totalValue: formData.totalValue.trim(),
        notes: formData.notes.trim(),
        tags: tagsArray,
      };

      if (editingClient) {
        // Update
        const res = await fetch('/api/admin/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingClient.id, ...payload }),
        });
        const json = await res.json();
        if (json.ok && json.client) {
          setClients((prev) =>
            prev.map((c) => (c.id === editingClient.id ? json.client : c))
          );
          showToast('✅ Cliente actualizado exitosamente');
          setEditingClient(null);
        } else {
          showToast(`❌ Error: ${json.error || 'No se pudo actualizar'}`);
        }
      } else {
        // Create
        const res = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.ok && json.client) {
          setClients((prev) => [json.client, ...prev]);
          showToast('✅ Cliente creado exitosamente');
          setIsCreateOpen(false);
        } else {
          showToast(`❌ Error: ${json.error || 'No se pudo crear'}`);
        }
      }
    } catch {
      showToast('❌ Error de conexión al guardar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/clients?id=${clientToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
        showToast('🗑️ Cliente eliminado');
      } else {
        showToast(`❌ Error: ${json.error || 'No se pudo eliminar'}`);
      }
    } catch {
      showToast('❌ Error de conexión');
    } finally {
      setIsSubmitting(false);
      setClientToDelete(null);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Nombre', 'Correo', 'Teléfono', 'Cargo', 'Empresa', 'Estado', 'Servicio', 'Valor', 'Notas'];
    const rows = filteredClients.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.role || '').replace(/"/g, '""')}"`,
      `"${(c.companyName || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.service || '').replace(/"/g, '""')}"`,
      `"${(c.totalValue || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes-andresmorales-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Directorio exportado a CSV');
  };

  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'activo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Activo
          </span>
        );
      case 'en_progreso':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            En Negociación
          </span>
        );
      case 'potencial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Potencial
          </span>
        );
      case 'inactivo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Inactivo
          </span>
        );
    }
  };

  return (
    <AdminShell
      username={username}
      locale={locale}
      title="Directorio de Clientes"
      subtitle="Gestión de contactos individuales, cuentas corporativas y seguimiento comercial"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#1E1810] bg-white border border-[#1E1810]/15 hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#575250]" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#f96e03] hover:bg-[#e06202] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      }
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1810] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-mono animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#575250] uppercase tracking-wider font-semibold">
                Total Clientes
              </span>
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#1E1810]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1810] mt-2">
              {stats.total}
            </p>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-700 uppercase tracking-wider font-semibold">
                Clientes Activos
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-emerald-600 mt-2">
              {stats.activos}
            </p>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-700 uppercase tracking-wider font-semibold">
                En Negociación
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-blue-600 mt-2">
              {stats.enProgreso}
            </p>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-700 uppercase tracking-wider font-semibold">
                Oportunidades
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 mt-2">
              {stats.potenciales}
            </p>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-3 sm:p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, empresa, email, teléfono o cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Company Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 text-[#1E1810] focus:bg-white focus:border-[#f96e03] focus:outline-none cursor-pointer"
              >
                <option value="">Todas las Empresas</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.name}>
                    {comp.name}
                  </option>
                ))}
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#1E1810] shadow-sm'
                      : 'text-stone-500 hover:text-[#1E1810]'
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-[#1E1810] shadow-sm'
                      : 'text-stone-500 hover:text-[#1E1810]'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono text-[#575250] mr-1 hidden sm:inline">
              Filtrar:
            </span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'activo', label: 'Activos' },
              { id: 'en_progreso', label: 'En Negociación' },
              { id: 'potencial', label: 'Potenciales' },
              { id: 'inactivo', label: 'Inactivos' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#1E1810] text-white shadow-sm font-semibold'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {(search || statusFilter !== 'all' || companyFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setCompanyFilter('');
                }}
                className="text-xs text-stone-500 hover:text-[#f96e03] underline ml-auto shrink-0 pl-2 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Clients Content */}
        {filteredClients.length === 0 ? (
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1E1810]">
              No se encontraron clientes
            </h3>
            <p className="text-xs text-[#575250] mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o los filtros seleccionados, o añade un nuevo cliente.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#f96e03] hover:bg-[#e06202] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primer Cliente</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const waLink = getWhatsAppLink(client.phone);
              const initials = client.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={client.id}
                  className="bg-white border border-[#1E1810]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Avatar, Name, Company & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                            client.avatarBg || 'bg-orange-500'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#1E1810] truncate group-hover:text-[#f96e03] transition-colors">
                            {client.name}
                          </h4>
                          <p className="text-xs text-[#575250] truncate">
                            {client.role || 'Contacto'}
                          </p>
                        </div>
                      </div>

                      {getStatusBadge(client.status)}
                    </div>

                    {/* Company Link / Info */}
                    {client.companyName && (
                      <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200/80 text-xs text-[#1E1810]">
                        <Building2 className="w-3.5 h-3.5 text-[#f96e03]" />
                        <Link
                          href={`/${locale}/admin/companies?search=${encodeURIComponent(client.companyName)}`}
                          className="font-medium hover:underline truncate"
                          title="Ver empresa en directorio"
                        >
                          {client.companyName}
                        </Link>
                      </div>
                    )}

                    {/* Service & Budget Details */}
                    <div className="mt-4 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                      {client.service && (
                        <div className="flex items-center gap-2 text-stone-700">
                          <Briefcase className="w-3.5 h-3.5 text-[#575250] shrink-0" />
                          <span className="truncate">{client.service}</span>
                        </div>
                      )}

                      {client.totalValue && (
                        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                          <DollarSign className="w-3.5 h-3.5 shrink-0" />
                          <span>{client.totalValue}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes snippet */}
                    {client.notes && (
                      <p className="mt-3 text-[11px] text-[#575250] bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 italic line-clamp-2">
                        "{client.notes}"
                      </p>
                    )}

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {client.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-[#575250] text-[10px] font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div className="mt-5 pt-3 border-t border-[#1E1810]/10 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Escribir por WhatsApp"
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      {client.email && (
                        <a
                          href={`mailto:${client.email}`}
                          title={`Enviar correo a ${client.email}`}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {client.phone && (
                        <a
                          href={`tel:${client.phone}`}
                          title={`Llamar a ${client.phone}`}
                          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(client)}
                        title="Editar cliente"
                        className="p-2 rounded-lg text-[#575250] hover:text-[#1E1810] hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientToDelete(client)}
                        title="Eliminar cliente"
                        className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-[#1E1810]/10 text-[#575250] font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Empresa</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Servicio / Presupuesto</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredClients.map((client) => {
                    const waLink = getWhatsAppLink(client.phone);
                    return (
                      <tr key={client.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1E1810]">{client.name}</div>
                          <div className="text-[11px] text-[#575250]">{client.role || 'Contacto'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {client.companyName ? (
                            <Link
                              href={`/${locale}/admin/companies?search=${encodeURIComponent(client.companyName)}`}
                              className="font-medium text-[#1E1810] hover:underline hover:text-[#f96e03] inline-flex items-center gap-1"
                            >
                              <Building2 className="w-3 h-3 text-[#f96e03]" />
                              <span>{client.companyName}</span>
                            </Link>
                          ) : (
                            <span className="text-stone-400 italic">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          {client.email && (
                            <div className="flex items-center gap-1 text-[#575250]">
                              <Mail className="w-3 h-3 text-stone-400" />
                              <a href={`mailto:${client.email}`} className="hover:underline">
                                {client.email}
                              </a>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1 text-[#575250]">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#1E1810] font-medium truncate max-w-[200px]">
                            {client.service || '—'}
                          </div>
                          {client.totalValue && (
                            <div className="text-emerald-700 font-semibold text-[11px]">
                              {client.totalValue}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(client.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            {waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="WhatsApp"
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => openEditModal(client)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-[#575250] hover:text-[#1E1810] hover:bg-stone-100 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setClientToDelete(client)}
                              title="Eliminar"
                              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT CLIENT                              */}
      {/* ======================================================== */}
      {(isCreateOpen || editingClient) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#1E1810]/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#f96e03] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#1E1810]">
                  {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingClient(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Santiago Gómez Restrepo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Cargo / Posición
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Director de Operaciones"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Estado Comercial
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none cursor-pointer"
                  >
                    <option value="activo">Activo (Proyecto en curso)</option>
                    <option value="en_progreso">En Negociación / Propuesta</option>
                    <option value="potencial">Potencial (Oportunidad)</option>
                    <option value="inactivo">Inactivo / Cerrado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                  Empresa Vinculada
                </label>
                <div className="space-y-2">
                  <select
                    value={formData.companyId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const c = companies.find((comp) => comp.id === selId);
                      setFormData({
                        ...formData,
                        companyId: selId,
                        companyName: c ? c.name : formData.companyName,
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none cursor-pointer"
                  >
                    <option value="">-- Seleccionar de empresas registradas --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.industry})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="O escribir nombre de empresa personalizada..."
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Servicio de Interés
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Agente IA WhatsApp"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Valor / Inversión Acordada <span className="text-stone-400 font-normal text-[11px]">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Sin definir (o ej. $4.500.000 COP)"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  placeholder="VIP, n8n, Chatbot, Web Express"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                  Notas y Bitácora de Seguimiento
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalles clave de la conversación, requerimientos especiales o acuerdos..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#f96e03] hover:bg-[#e06202] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Guardando...' : editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                               */}
      {/* ======================================================== */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#1E1810]/10 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1E1810]">
              ¿Eliminar cliente?
            </h3>
            <p className="text-xs text-[#575250] mt-1.5">
              Esta acción eliminará el registro de <strong>{clientToDelete.name}</strong> del directorio.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
              >
                {isSubmitting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
