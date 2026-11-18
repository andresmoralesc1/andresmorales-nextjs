'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminShell } from '@/components/admin/admin-shell';
import type { Company, Client } from '@/lib/clients-companies-store';
import {
  Building2,
  Users,
  UserCheck,
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
  Globe,
  MapPin,
  DollarSign,
  Briefcase,
  X,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface CompaniesClientProps {
  initialCompanies: Company[];
  initialClients: Client[];
  initialStats: {
    totalCompanies: number;
    activeCompanies: number;
    negotiatingCompanies: number;
    prospectCompanies: number;
    industriesCount: number;
    citiesCount: number;
    industries: string[];
    cities: string[];
  };
  initialIndustryFilter?: string;
  initialSearchQuery?: string;
  username: string;
  locale: string;
}

export default function CompaniesClient({
  initialCompanies,
  initialClients,
  initialStats,
  initialIndustryFilter = '',
  initialSearchQuery = '',
  username,
  locale,
}: CompaniesClientProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState(initialSearchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'cliente_activo' | 'en_negociacion' | 'prospecto' | 'inactivo'>('all');
  const [industryFilter, setIndustryFilter] = useState(initialIndustryFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialFormState = {
    name: '',
    legalName: '',
    nit: '',
    industry: 'E-commerce & Retail',
    website: '',
    country: 'Colombia',
    city: 'Medellín',
    address: '',
    email: '',
    phone: '',
    status: 'prospecto' as Company['status'],
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    annualBudget: '',
    notes: '',
    tags: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Industries list for filtering
  const allIndustries = useMemo(() => {
    const list = new Set<string>();
    companies.forEach((c) => {
      if (c.industry) list.add(c.industry);
    });
    return Array.from(list);
  }, [companies]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.legalName && c.legalName.toLowerCase().includes(q)) ||
        (c.nit && c.nit.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.primaryContactName && c.primaryContactName.toLowerCase().includes(q)) ||
        (c.website && c.website.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesIndustry = !industryFilter || c.industry === industryFilter;

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [companies, search, statusFilter, industryFilter]);

  // Dynamic stats
  const stats = useMemo(() => {
    const total = companies.length;
    const activas = companies.filter((c) => c.status === 'cliente_activo').length;
    const negociando = companies.filter((c) => c.status === 'en_negociacion').length;
    const prospectos = companies.filter((c) => c.status === 'prospecto').length;
    return { total, activas, negociando, prospectos, industriesCount: allIndustries.length };
  }, [companies, allIndustries]);

  // Count clients for each company
  const companyClientsMap = useMemo(() => {
    const map = new Map<string, number>();
    clients.forEach((cli) => {
      if (cli.companyId) {
        map.set(cli.companyId, (map.get(cli.companyId) || 0) + 1);
      } else if (cli.companyName) {
        // match by name
        const match = companies.find((comp) => comp.name.toLowerCase() === cli.companyName?.toLowerCase());
        if (match) {
          map.set(match.id, (map.get(match.id) || 0) + 1);
        }
      }
    });
    return map;
  }, [clients, companies]);

  const getWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (!digits) return null;
    const formatted = digits.length === 10 && digits.startsWith('3') ? `57${digits}` : digits;
    return `https://wa.me/${formatted}`;
  };

  const openCreateModal = () => {
    setFormData(initialFormState);
    setIsCreateOpen(true);
  };

  const openEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name,
      legalName: comp.legalName || '',
      nit: comp.nit || '',
      industry: comp.industry || 'E-commerce & Retail',
      website: comp.website || '',
      country: comp.country || 'Colombia',
      city: comp.city || '',
      address: comp.address || '',
      email: comp.email || '',
      phone: comp.phone || '',
      status: comp.status,
      primaryContactName: comp.primaryContactName || '',
      primaryContactEmail: comp.primaryContactEmail || '',
      primaryContactPhone: comp.primaryContactPhone || '',
      annualBudget: comp.annualBudget || '',
      notes: comp.notes || '',
      tags: comp.tags ? comp.tags.join(', ') : '',
    });
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('⚠️ El nombre de la empresa es requerido');
      return;
    }

    setIsSubmitting(true);
    try {
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name: formData.name.trim(),
        legalName: formData.legalName.trim(),
        nit: formData.nit.trim(),
        industry: formData.industry.trim(),
        website: formData.website.trim(),
        country: formData.country.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
        primaryContactName: formData.primaryContactName.trim(),
        primaryContactEmail: formData.primaryContactEmail.trim(),
        primaryContactPhone: formData.primaryContactPhone.trim(),
        annualBudget: formData.annualBudget.trim(),
        notes: formData.notes.trim(),
        tags: tagsArray,
      };

      if (editingCompany) {
        // Update
        const res = await fetch('/api/admin/companies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCompany.id, ...payload }),
        });
        const json = await res.json();
        if (json.ok && json.company) {
          setCompanies((prev) =>
            prev.map((c) => (c.id === editingCompany.id ? json.company : c))
          );
          showToast('✅ Empresa actualizada');
          setEditingCompany(null);
        } else {
          showToast(`❌ Error: ${json.error || 'No se pudo actualizar'}`);
        }
      } else {
        // Create
        const res = await fetch('/api/admin/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.ok && json.company) {
          setCompanies((prev) => [json.company, ...prev]);
          showToast('✅ Empresa registrada');
          setIsCreateOpen(false);
        } else {
          showToast(`❌ Error: ${json.error || 'No se pudo registrar'}`);
        }
      }
    } catch {
      showToast('❌ Error de conexión al guardar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/companies?id=${companyToDelete.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.ok) {
        setCompanies((prev) => prev.filter((c) => c.id !== companyToDelete.id));
        showToast('🗑️ Empresa eliminada');
      } else {
        showToast(`❌ Error: ${json.error || 'No se pudo eliminar'}`);
      }
    } catch {
      showToast('❌ Error de conexión');
    } finally {
      setIsSubmitting(false);
      setCompanyToDelete(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Empresa',
      'Razón Social',
      'NIT',
      'Sector',
      'Sitio Web',
      'Ciudad',
      'Contacto Principal',
      'Teléfono',
      'Email',
      'Estado',
      'Presupuesto',
      'Notas',
    ];
    const rows = filteredCompanies.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.legalName || '').replace(/"/g, '""')}"`,
      `"${(c.nit || '').replace(/"/g, '""')}"`,
      `"${(c.industry || '').replace(/"/g, '""')}"`,
      `"${(c.website || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.primaryContactName || '').replace(/"/g, '""')}"`,
      `"${(c.phone || c.primaryContactPhone || '').replace(/"/g, '""')}"`,
      `"${(c.email || c.primaryContactEmail || '').replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${(c.annualBudget || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `empresas-b2b-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Directorio de empresas exportado a CSV');
  };

  const getStatusBadge = (status: Company['status']) => {
    switch (status) {
      case 'cliente_activo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Cliente Activo
          </span>
        );
      case 'en_negociacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            En Negociación
          </span>
        );
      case 'prospecto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Prospecto B2B
          </span>
        );
      case 'inactivo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Inactiva
          </span>
        );
    }
  };

  return (
    <AdminShell
      username={username}
      locale={locale}
      title="Directorio de Empresas B2B"
      subtitle="Cuentas corporativas, clasificación sectorial y proyectos comerciales asociados"
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
            <span>Nueva Empresa</span>
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
                Total Empresas
              </span>
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#1E1810]">
                <Building2 className="w-4 h-4" />
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
              {stats.activas}
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
              {stats.negociando}
            </p>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-700 uppercase tracking-wider font-semibold">
                Sectores B2B
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-serif font-bold text-amber-600 mt-2">
              {stats.industriesCount}
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
                placeholder="Buscar por empresa, NIT, sector, ciudad o contacto..."
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

            {/* Industry Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 text-[#1E1810] focus:bg-white focus:border-[#f96e03] focus:outline-none cursor-pointer"
              >
                <option value="">Todos los Sectores</option>
                {allIndustries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
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
              { id: 'all', label: 'Todas' },
              { id: 'cliente_activo', label: 'Clientes Activos' },
              { id: 'en_negociacion', label: 'En Negociación' },
              { id: 'prospecto', label: 'Prospectos' },
              { id: 'inactivo', label: 'Inactivas' },
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

            {(search || statusFilter !== 'all' || industryFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setIndustryFilter('');
                }}
                className="text-xs text-stone-500 hover:text-[#f96e03] underline ml-auto shrink-0 pl-2 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {filteredCompanies.length === 0 ? (
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1E1810]">
              No se encontraron empresas
            </h3>
            <p className="text-xs text-[#575250] mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o el sector, o registra una nueva empresa corporativa.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#f96e03] hover:bg-[#e06202] transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Primera Empresa</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((comp) => {
              const clientsCount = companyClientsMap.get(comp.id) || 0;
              const contactPhone = comp.primaryContactPhone || comp.phone;
              const waLink = getWhatsAppLink(contactPhone);
              const monogram = comp.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={comp.id}
                  className="bg-white border border-[#1E1810]/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Monogram, Name, NIT & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-[#1E1810] text-[#f96e03] border border-[#f96e03]/30 flex items-center justify-center font-serif font-bold text-sm shrink-0 shadow-sm">
                          {monogram}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#1E1810] truncate group-hover:text-[#f96e03] transition-colors">
                            {comp.name}
                          </h4>
                          {comp.nit && (
                            <p className="text-[11px] font-mono text-[#575250] truncate">
                              NIT: {comp.nit}
                            </p>
                          )}
                        </div>
                      </div>

                      {getStatusBadge(comp.status)}
                    </div>

                    {/* Industry & Location */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-[#1E1810] font-medium border border-stone-200/60">
                        {comp.industry}
                      </span>
                      {comp.city && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#575250]">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{comp.city}, {comp.country}</span>
                        </span>
                      )}
                    </div>

                    {/* Website Link */}
                    {comp.website && (
                      <div className="mt-2.5">
                        <a
                          href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#f96e03] hover:underline font-mono"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate">{comp.website.replace(/^https?:\/\//, '')}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Primary Contact Details */}
                    {(comp.primaryContactName || comp.email) && (
                      <div className="mt-4 pt-3 border-t border-stone-100 space-y-1 text-xs">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-[#575250] font-semibold">
                          Contacto Principal:
                        </p>
                        {comp.primaryContactName && (
                          <div className="font-semibold text-[#1E1810]">
                            {comp.primaryContactName}
                          </div>
                        )}
                        {comp.primaryContactEmail && (
                          <div className="flex items-center gap-1.5 text-stone-600">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <a href={`mailto:${comp.primaryContactEmail}`} className="hover:underline truncate">
                              {comp.primaryContactEmail}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Budget / Financials */}
                    {comp.annualBudget && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-100 w-fit">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Presupuesto est: {comp.annualBudget}</span>
                      </div>
                    )}

                    {/* Notes snippet */}
                    {comp.notes && (
                      <p className="mt-3 text-[11px] text-[#575250] bg-stone-50/70 p-2.5 rounded-xl border border-stone-100 italic line-clamp-2">
                        "{comp.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-3 border-t border-[#1E1810]/10 flex items-center justify-between">
                    {/* Linked clients badge */}
                    <Link
                      href={`/${locale}/admin/clients?company=${encodeURIComponent(comp.name)}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/70 text-[11px] font-medium text-[#1E1810] transition-colors"
                      title="Ver contactos de esta empresa"
                    >
                      <Users className="w-3.5 h-3.5 text-[#f96e03]" />
                      <span>{clientsCount} {clientsCount === 1 ? 'Contacto' : 'Contactos'}</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp al contacto"
                          className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditModal(comp)}
                        title="Editar empresa"
                        className="p-2 rounded-lg text-[#575250] hover:text-[#1E1810] hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompanyToDelete(comp)}
                        title="Eliminar empresa"
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
                    <th className="py-3 px-4">Empresa / Razón Social</th>
                    <th className="py-3 px-4">Sector & Ubicación</th>
                    <th className="py-3 px-4">Contacto Principal</th>
                    <th className="py-3 px-4">Contactos</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCompanies.map((comp) => {
                    const clientsCount = companyClientsMap.get(comp.id) || 0;
                    const contactPhone = comp.primaryContactPhone || comp.phone;
                    const waLink = getWhatsAppLink(contactPhone);

                    return (
                      <tr key={comp.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1E1810]">{comp.name}</div>
                          {comp.legalName && comp.legalName !== comp.name && (
                            <div className="text-[11px] text-[#575250]">{comp.legalName}</div>
                          )}
                          {comp.nit && (
                            <div className="text-[10px] font-mono text-stone-400">NIT: {comp.nit}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#1E1810] font-medium">{comp.industry}</div>
                          <div className="text-[11px] text-[#575250]">
                            {comp.city ? `${comp.city}, ${comp.country}` : comp.country}
                          </div>
                          {comp.website && (
                            <a
                              href={comp.website.startsWith('http') ? comp.website : `https://${comp.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#f96e03] hover:underline font-mono inline-flex items-center gap-0.5 mt-0.5"
                            >
                              <span>{comp.website.replace(/^https?:\/\//, '')}</span>
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </td>
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="font-semibold text-[#1E1810]">
                            {comp.primaryContactName || '—'}
                          </div>
                          {comp.primaryContactEmail && (
                            <div className="flex items-center gap-1 text-[#575250] text-[11px]">
                              <Mail className="w-3 h-3 text-stone-400" />
                              <a href={`mailto:${comp.primaryContactEmail}`} className="hover:underline">
                                {comp.primaryContactEmail}
                              </a>
                            </div>
                          )}
                          {contactPhone && (
                            <div className="flex items-center gap-1 text-[#575250] text-[11px]">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{contactPhone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/${locale}/admin/clients?company=${encodeURIComponent(comp.name)}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 hover:text-[#f96e03] text-xs font-mono font-medium"
                          >
                            <Users className="w-3 h-3 text-[#f96e03]" />
                            <span>{clientsCount}</span>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(comp.status)}
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
                              onClick={() => openEditModal(comp)}
                              title="Editar"
                              className="p-1.5 rounded-lg text-[#575250] hover:text-[#1E1810] hover:bg-stone-100 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompanyToDelete(comp)}
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
      {/* MODAL: CREATE / EDIT COMPANY                             */}
      {/* ======================================================== */}
      {(isCreateOpen || editingCompany) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#1E1810]/10 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#f96e03] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-serif font-bold text-[#1E1810]">
                  {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCompany(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                  Nombre Comercial de la Empresa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Grupo Éxito / Alvarado & During"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Razón Social Completa
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Alvarado & During S.A.S"
                    value={formData.legalName}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    NIT / Identificación Fiscal
                  </label>
                  <input
                    type="text"
                    placeholder="ej. 900.567.890-1"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Sector / Industria
                  </label>
                  <input
                    type="text"
                    placeholder="ej. E-commerce, Construcción, Joyería"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
                    <option value="cliente_activo">Cliente Activo (En ejecución)</option>
                    <option value="en_negociacion">En Negociación / Propuesta</option>
                    <option value="prospecto">Prospecto B2B</option>
                    <option value="inactivo">Inactiva / En Pausa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    placeholder="https://empresa.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Ciudad / Ubicación
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Medellín, Bogotá, Cali"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100">
                <p className="text-xs font-mono uppercase tracking-wider text-[#575250] font-semibold mb-2">
                  Contacto Principal de la Empresa
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre del contacto"
                      value={formData.primaryContactName}
                      onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Correo contacto"
                      value={formData.primaryContactEmail}
                      onChange={(e) => setFormData({ ...formData, primaryContactEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Teléfono / WhatsApp"
                      value={formData.primaryContactPhone}
                      onChange={(e) => setFormData({ ...formData, primaryContactPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Presupuesto / Facturación Estimada <span className="text-stone-400 font-normal text-[11px]">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Sin definir (o ej. $8.000.000 COP)"
                    value={formData.annualBudget}
                    onChange={(e) => setFormData({ ...formData, annualBudget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    placeholder="E-commerce, Retail, Corporativo"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-stone-50 border border-stone-200 focus:bg-white focus:border-[#f96e03] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1810] mb-1">
                  Notas y Diagnóstico de la Cuenta
                </label>
                <textarea
                  rows={3}
                  placeholder="Observaciones de la empresa, auditoría previa, requerimientos..."
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
                    setEditingCompany(null);
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
                  {isSubmitting ? 'Guardando...' : editingCompany ? 'Guardar Cambios' : 'Registrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DELETE CONFIRMATION                               */}
      {/* ======================================================== */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#1E1810]/10 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1E1810]">
              ¿Eliminar empresa?
            </h3>
            <p className="text-xs text-[#575250] mt-1.5">
              Esta acción eliminará el registro de <strong>{companyToDelete.name}</strong> del directorio corporativo.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setCompanyToDelete(null)}
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
