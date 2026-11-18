'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Mail,
  Zap,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Filter,
  Download,
  Layers,
  FileSpreadsheet,
  Palette,
  Eye,
  Layout,
  Share2,
  ChevronDown,
  MapPin,
  X,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/admin-shell';
import type { Prospect, ProspectData } from '@/lib/prospect-store';

interface Props {
  initialProspects: Prospect[];
  lastSearch?: ProspectData['lastSearch'];
  username: string;
  locale: string;
}

export interface CountryItem {
  name: string;
  flag: string;
  code: string;
  isTop?: boolean;
}

export const TOP_COUNTRIES: CountryItem[] = [
  { name: 'Colombia', flag: '🇨🇴', code: 'CO', isTop: true },
  { name: 'Estados Unidos', flag: '🇺🇸', code: 'US', isTop: true },
  { name: 'Brasil', flag: '🇧🇷', code: 'BR', isTop: true },
  { name: 'México', flag: '🇲🇽', code: 'MX', isTop: true },
  { name: 'España', flag: '🇪🇸', code: 'ES', isTop: true },
  { name: 'Chile', flag: '🇨🇱', code: 'CL', isTop: true },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR', isTop: true },
  { name: 'Perú', flag: '🇵🇪', code: 'PE', isTop: true },
  { name: 'Panamá', flag: '🇵🇦', code: 'PA', isTop: true },
  { name: 'Costa Rica', flag: '🇨🇷', code: 'CR', isTop: true },
  { name: 'Ecuador', flag: '🇪🇨', code: 'EC', isTop: true },
  { name: 'Uruguay', flag: '🇺🇾', code: 'UY', isTop: true },
  { name: 'República Dominicana', flag: '🇩🇴', code: 'DO', isTop: true },
  { name: 'Guatemala', flag: '🇬🇹', code: 'GT', isTop: true },
];

export const ALL_OTHER_COUNTRIES: CountryItem[] = [
  { name: 'Alemania', flag: '🇩🇪', code: 'DE' },
  { name: 'Andorra', flag: '🇦🇩', code: 'AD' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'Austria', flag: '🇦🇹', code: 'AT' },
  { name: 'Bélgica', flag: '🇧🇪', code: 'BE' },
  { name: 'Bolivia', flag: '🇧🇴', code: 'BO' },
  { name: 'Canadá', flag: '🇨🇦', code: 'CA' },
  { name: 'Dinamarca', flag: '🇩🇰', code: 'DK' },
  { name: 'El Salvador', flag: '🇸🇻', code: 'SV' },
  { name: 'Emiratos Árabes Unidos', flag: '🇦🇪', code: 'AE' },
  { name: 'Francia', flag: '🇫🇷', code: 'FR' },
  { name: 'Honduras', flag: 'HN', code: 'HN' },
  { name: 'Irlanda', flag: '🇮🇪', code: 'IE' },
  { name: 'Israel', flag: '🇮🇱', code: 'IL' },
  { name: 'Italia', flag: '🇮🇹', code: 'IT' },
  { name: 'Japón', flag: '🇯🇵', code: 'JP' },
  { name: 'Nicaragua', flag: '🇳🇮', code: 'NI' },
  { name: 'Noruega', flag: '🇳🇴', code: 'NO' },
  { name: 'Nueva Zelanda', flag: '🇳🇿', code: 'NZ' },
  { name: 'Países Bajos', flag: '🇳🇱', code: 'NL' },
  { name: 'Paraguay', flag: '🇵🇾', code: 'PY' },
  { name: 'Polonia', flag: '🇵🇱', code: 'PL' },
  { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
  { name: 'Puerto Rico', flag: '🇵🇷', code: 'PR' },
  { name: 'Reino Unido', flag: '🇬🇧', code: 'GB' },
  { name: 'Singapur', flag: '🇸🇬', code: 'SG' },
  { name: 'Suecia', flag: '🇸🇪', code: 'SE' },
  { name: 'Suiza', flag: '🇨🇭', code: 'CH' },
];

export const ALL_COUNTRIES: CountryItem[] = [...TOP_COUNTRIES, ...ALL_OTHER_COUNTRIES];
export const COUNTRIES: string[] = ALL_COUNTRIES.map((c) => c.name);

export function getCountryFlag(countryName: string): string {
  const found = ALL_COUNTRIES.find(
    (c) => c.name.toLowerCase() === (countryName || '').trim().toLowerCase()
  );
  return found ? found.flag : '🌍';
}

const COUNTRY_CITIES: Record<string, string[]> = {
  Colombia: [
    'Medellín',
    'Bogotá',
    'Cali',
    'Barranquilla',
    'Bucaramanga',
    'Cartagena',
    'Pereira',
    'Manizales',
    'Santa Marta',
    'Cúcuta',
    'Ibagué',
    'Pasto',
    'Armenia',
    'Villavicencio',
    'Montería',
    'Todas (Nacional)',
  ],
  'Estados Unidos': [
    'Miami (Florida)',
    'Orlando (Florida)',
    'New York',
    'Los Ángeles (California)',
    'Houston (Texas)',
    'Austin (Texas)',
    'Dallas (Texas)',
    'Chicago (Illinois)',
    'San Francisco (California)',
    'Atlanta (Georgia)',
    'Boston (Massachusetts)',
    'Todas (Nacional)',
  ],
  Brasil: [
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Curitiba',
    'Porto Alegre',
    'Brasília',
    'Salvador',
    'Florianópolis',
    'Fortaleza',
    'Campinas',
    'Recife',
    'Todas (Nacional)',
  ],
  México: [
    'Ciudad de México',
    'Guadalajara',
    'Monterrey',
    'Puebla',
    'Querétaro',
    'Cancún',
    'Mérida',
    'León',
    'Tijuana',
    'Zapopan',
    'Todas (Nacional)',
  ],
  España: [
    'Madrid',
    'Barcelona',
    'Valencia',
    'Sevilla',
    'Málaga',
    'Bilbao',
    'Alicante',
    'Zaragoza',
    'Murcia',
    'Palma de Mallorca',
    'Todas (Nacional)',
  ],
  Chile: [
    'Santiago',
    'Valparaíso',
    'Concepción',
    'Viña del Mar',
    'Antofagasta',
    'La Serena',
    'Todas (Nacional)',
  ],
  Argentina: [
    'Buenos Aires',
    'Córdoba',
    'Rosario',
    'Mendoza',
    'La Plata',
    'Mar del Plata',
    'Todas (Nacional)',
  ],
  Perú: [
    'Lima',
    'Arequipa',
    'Trujillo',
    'Chiclayo',
    'Cusco',
    'Piura',
    'Todas (Nacional)',
  ],
  Panamá: [
    'Ciudad de Panamá',
    'David',
    'Colón',
    'Todas (Nacional)',
  ],
  'Costa Rica': [
    'San José',
    'Heredia',
    'Alajuela',
    'Escazú',
    'Todas (Nacional)',
  ],
  Ecuador: [
    'Quito',
    'Guayaquil',
    'Cuenca',
    'Todas (Nacional)',
  ],
  Uruguay: [
    'Montevideo',
    'Punta del Este',
    'Todas (Nacional)',
  ],
  'República Dominicana': [
    'Santo Domingo',
    'Santiago de los Caballeros',
    'Punta Cana',
    'Todas (Nacional)',
  ],
  Guatemala: [
    'Ciudad de Guatemala',
    'Antigua Guatemala',
    'Quetzaltenango',
    'Todas (Nacional)',
  ],
  Canadá: [
    'Toronto',
    'Vancouver',
    'Montreal',
    'Calgary',
    'Ottawa',
    'Todas (Nacional)',
  ],
  'Reino Unido': [
    'Londres',
    'Manchester',
    'Birmingham',
    'Edimburgo',
    'Todas (Nacional)',
  ],
  Alemania: [
    'Berlín',
    'Múnich',
    'Fráncfort',
    'Hamburgo',
    'Todas (Nacional)',
  ],
  Francia: [
    'París',
    'Lyon',
    'Marsella',
    'Burdeos',
    'Todas (Nacional)',
  ],
  Italia: [
    'Milán',
    'Roma',
    'Florencia',
    'Turín',
    'Todas (Nacional)',
  ],
  Portugal: [
    'Lisboa',
    'Oporto',
    'Braga',
    'Todas (Nacional)',
  ],
};

const CATEGORIES = [
  'Gestión de Proyectos & Automatización Excel',
  'Proyectos & Construcción',
  'Servicios Profesionales & Consultorías',
  'Clínicas, Salud & Odontología',
  'Mayoristas, B2B & Distribución',
  'Inmobiliarias & Bienes Raíces',
  'Firmas Legales & Contables',
  'Joyería & Lujo',
  'Calzado & Cuero',
  'Moda & Ropa',
  'Cosmética & Cuidado',
  'Muebles & Hogar',
  'Restaurantes & Gastronomía',
  'Suplementos & Fitness',
  'Agencias de Marketing & Software',
  'Personalizado (Escribir término)',
];

export default function ProspectingClient({
  initialProspects,
  lastSearch,
  username,
  locale,
}: Props) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [country, setCountry] = useState(lastSearch?.country || 'Colombia');
  const [city, setCity] = useState(lastSearch?.city || 'Medellín');
  const [customCity, setCustomCity] = useState('');
  const [isCustomCity, setIsCustomCity] = useState(false);
  const [category, setCategory] = useState(lastSearch?.category || 'Gestión de Proyectos & Automatización Excel');
  const [customCategory, setCustomCategory] = useState('');
  const [count, setCount] = useState(5);
  const [scouting, setScouting] = useState(false);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [auditingAll, setAuditingAll] = useState(false);
  const [auditProgress, setAuditProgress] = useState<{ done: number; total: number } | null>(null);

  // Country & City Searchable Popover States
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Click outside to close country / city dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered countries for the dropdown
  const filteredTopCountries = useMemo(() => {
    if (!countrySearch.trim()) return TOP_COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return TOP_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const filteredOtherCountries = useMemo(() => {
    if (!countrySearch.trim()) return ALL_OTHER_COUNTRIES;
    const q = countrySearch.toLowerCase().trim();
    return ALL_OTHER_COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  // Cities for current country
  const currentAvailableCities = useMemo(() => {
    return (
      COUNTRY_CITIES[country] || [
        'Capital / Principal',
        'Segunda Ciudad',
        'Todas (Nacional)',
      ]
    );
  }, [country]);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return currentAvailableCities;
    const q = citySearch.toLowerCase().trim();
    return currentAvailableCities.filter((c) => c.toLowerCase().includes(q));
  }, [currentAvailableCities, citySearch]);

  const handleSelectCountry = (newCountry: string) => {
    setCountry(newCountry);
    const available = COUNTRY_CITIES[newCountry] || ['Todas (Nacional)'];
    setCity(available[0]);
    setIsCustomCity(false);
    setCustomCity('');
    setCountryOpen(false);
    setCountrySearch('');
  };

  const handleSelectCity = (newCity: string) => {
    setCity(newCity);
    setIsCustomCity(false);
    setCustomCity('');
    setCityOpen(false);
    setCitySearch('');
  };

  // Filters
  const [filter, setFilter] = useState<'all' | 'hot' | 'audited' | 'pending' | 'imported'>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPitchId, setCopiedPitchId] = useState<string | null>(null);

  // Per-prospect UX/UI tab selection & pitch angles (tech, uxui, voice)
  const [auditTabs, setAuditTabs] = useState<Record<string, 'all' | 'tech' | 'ux' | 'ui'>>({});
  const [pitchModes, setPitchModes] = useState<Record<string, 'tech' | 'uxui' | 'voice'>>({});

  // Manual Add Modal
  const [manualOpen, setManualOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualCountry, setManualCountry] = useState('Colombia');
  const [manualCity, setManualCity] = useState('Medellín');
  const [manualCategory, setManualCategory] = useState('Joyería & Lujo');
  const [savingManual, setSavingManual] = useState(false);

  // Batch URLs Modal
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [batchCountry, setBatchCountry] = useState('Colombia');
  const [batchCategory, setBatchCategory] = useState('Joyería & Lujo');
  const [savingBatch, setSavingBatch] = useState(false);

  // Handle country change
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry);
    const availableCities = COUNTRY_CITIES[newCountry] || COUNTRY_CITIES['Colombia'];
    setCity(availableCities[0]);
    setIsCustomCity(false);
  };

  // Stats
  const totalCount = prospects.length;
  const auditedCount = prospects.filter((p) => p.status === 'audited' || p.status === 'imported_crm').length;
  const importedCount = prospects.filter((p) => p.status === 'imported_crm').length;
  const pendingCount = prospects.filter((p) => p.status === 'discovered').length;
  const hotCount = prospects.filter((p) => (p.viewCount || 0) > 0).length;

  const avgScore = useMemo(() => {
    const scores = prospects.map((p) => p.audit?.score).filter((s): s is number => typeof s === 'number');
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [prospects]);

  // Unique countries in current prospects
  const availableCountries = useMemo(() => {
    const set = new Set(prospects.map((p) => p.country || 'Colombia').filter(Boolean));
    return Array.from(set);
  }, [prospects]);

  // Filtered prospects
  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.website.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.country && p.country.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (countryFilter !== 'all' && (p.country || 'Colombia') !== countryFilter) {
        return false;
      }

      if (filter === 'hot') return (p.viewCount || 0) > 0;
      if (filter === 'audited') return p.status === 'audited' || p.status === 'imported_crm';
      if (filter === 'pending') return p.status === 'discovered';
      if (filter === 'imported') return p.status === 'imported_crm';
      return true;
    });
  }, [prospects, searchQuery, filter, countryFilter]);

  // Scout businesses
  const handleScout = async (e: React.FormEvent) => {
    e.preventDefault();
    setScouting(true);
    const targetCity = isCustomCity && customCity.trim() ? customCity.trim() : city;
    const targetCategory =
      category === 'Personalizado (Escribir término)' && customCategory.trim()
        ? customCategory.trim()
        : category;
    try {
      const res = await fetch('/api/admin/prospecting/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, city: targetCity, category: targetCategory, count }),
      });
      const data = await res.json();
      if (res.ok && data.ok && Array.isArray(data.prospects)) {
        const returned = data.prospects;
        setProspects((prev) => {
          const map = new Map<string, Prospect>();
          for (const item of [...returned, ...prev]) {
            map.set(item.id, item);
          }
          return Array.from(map.values());
        });
        if (returned.length > 0) {
          alert(`¡Scouting completado con éxito! Se encontraron ${returned.length} empresas en ${targetCity}, ${country}.`);
        } else {
          alert(`No se encontraron empresas adicionales para "${targetCategory}" en ${targetCity}. Intenta con otra ciudad o nicho.`);
        }
      } else {
        alert(data.error || 'Error al buscar prospectos');
      }
    } catch {
      alert('Error de conexión con el explorador');
    } finally {
      setScouting(false);
    }
  };

  // Run audit on single prospect
  const handleAudit = async (id: string) => {
    setAuditingId(id);
    try {
      const res = await fetch('/api/admin/prospecting/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.prospect) {
        setProspects((prev) =>
          prev.map((p) => (p.id === id ? data.prospect : p))
        );
      } else {
        alert(data.error || 'Error al auditar el sitio');
      }
    } catch {
      alert('Error de conexión durante la auditoría');
    } finally {
      setAuditingId(null);
    }
  };

  // Run audit on ALL pending prospects sequentially
  const handleAuditAllPending = async () => {
    const pending = prospects.filter((p) => p.status === 'discovered');
    if (pending.length === 0) {
      alert('No hay prospectos pendientes por auditar.');
      return;
    }
    if (!confirm(`¿Deseas auditar automáticamente los ${pending.length} prospectos pendientes en lote?`)) {
      return;
    }

    setAuditingAll(true);
    setAuditProgress({ done: 0, total: pending.length });

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      setAuditingId(item.id);
      try {
        const res = await fetch('/api/admin/prospecting/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.prospect) {
          setProspects((prev) =>
            prev.map((p) => (p.id === item.id ? data.prospect : p))
          );
        }
      } catch (err) {
        console.warn(`[Batch audit] Error auditing ${item.name}:`, err);
      }
      setAuditProgress({ done: i + 1, total: pending.length });
    }

    setAuditingId(null);
    setAuditingAll(false);
    setAuditProgress(null);
  };

  // Import prospect to CRM
  const handleImportToCrm = async (id: string) => {
    setImportingId(id);
    try {
      const res = await fetch('/api/admin/prospecting/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProspects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: 'imported_crm' } : p))
        );
        alert('¡Prospecto importado exitosamente a tu Pipeline de CRM!');
      } else {
        alert(data.error || 'Error al importar al CRM');
      }
    } catch {
      alert('Error de conexión al importar');
    } finally {
      setImportingId(null);
    }
  };

  // Delete prospect
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este prospecto de la lista?')) return;
    try {
      const res = await fetch(`/api/admin/prospecting?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProspects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Error al eliminar');
    }
  };

  // Quick edit email
  const handleUpdateEmail = async (id: string, newEmail: string) => {
    try {
      const res = await fetch('/api/admin/prospecting', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email: newEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProspects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, email: newEmail.trim() } : p))
        );
      }
    } catch {
      alert('Error al actualizar correo');
    }
  };

  // Add manual store
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualUrl.trim()) return;

    setSavingManual(true);
    try {
      const res = await fetch('/api/admin/prospecting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualName.trim(),
          website: manualUrl.trim(),
          country: manualCountry,
          city: manualCity,
          category: manualCategory,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok && data.prospect) {
        setProspects((prev) => [data.prospect, ...prev]);
        setManualOpen(false);
        setManualName('');
        setManualUrl('');
        handleAudit(data.prospect.id);
      } else {
        alert(data.error || 'Error al guardar la tienda');
      }
    } catch {
      alert('Error de conexión al agregar');
    } finally {
      setSavingManual(false);
    }
  };

  // Process Batch URLs
  const handleProcessBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawLines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) return;

    setSavingBatch(true);
    const createdList: Prospect[] = [];

    for (const line of rawLines) {
      let targetUrl = line;
      let targetName = '';

      // Support "Nombre | URL" or just "URL"
      if (line.includes('|')) {
        const parts = line.split('|');
        targetName = parts[0].trim();
        targetUrl = parts[1].trim();
      } else {
        // Auto-extract name from hostname (e.g. https://tiendaxyz.com -> Tiendaxyz)
        try {
          const urlObj = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
          targetName = urlObj.hostname.replace(/^www\./, '').split('.')[0];
          targetName = targetName.charAt(0).toUpperCase() + targetName.slice(1);
        } catch {
          targetName = 'Tienda Online';
        }
      }

      if (!targetUrl.startsWith('http')) targetUrl = `https://${targetUrl}`;

      try {
        const res = await fetch('/api/admin/prospecting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: targetName,
            website: targetUrl,
            country: batchCountry,
            city: 'Online / Nacional',
            category: batchCategory,
          }),
        });
        const data = await res.json();
        if (res.ok && data.ok && data.prospect) {
          createdList.push(data.prospect);
        }
      } catch (err) {
        console.warn('Error saving batch url:', line, err);
      }
    }

    setProspects((prev) => [...createdList, ...prev]);
    setBatchOpen(false);
    setBatchText('');
    setSavingBatch(false);

    alert(`¡${createdList.length} tiendas añadidas correctamente! Ahora puedes auditarlas.`);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (prospects.length === 0) return;
    const headers = [
      'ID',
      'Nombre',
      'Pais',
      'Ciudad',
      'Categoria',
      'Sitio Web',
      'Telefono / WA',
      'Email',
      'Instagram',
      'Estado',
      'Puntaje Global',
      'Puntaje Tecnico',
      'Puntaje UX',
      'Puntaje UI',
      'Plataforma',
      'Tiempo Carga (ms)',
      'WhatsApp Flotante',
      'Meta Pixel',
      'Mensaje WA Tecnico',
      'Mensaje WA UX/UI',
    ];

    const escapeCsv = (str?: string | number | boolean | null) => {
      if (str === undefined || str === null) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = prospects.map((p) => [
      escapeCsv(p.id),
      escapeCsv(p.name),
      escapeCsv(p.country || 'Colombia'),
      escapeCsv(p.city),
      escapeCsv(p.category),
      escapeCsv(p.website),
      escapeCsv(p.phone),
      escapeCsv(p.email),
      escapeCsv(p.instagram),
      escapeCsv(p.status),
      escapeCsv(p.audit?.score || ''),
      escapeCsv(p.audit?.techScore ?? p.audit?.score ?? ''),
      escapeCsv(p.audit?.uxScore ?? ''),
      escapeCsv(p.audit?.uiScore ?? ''),
      escapeCsv(p.audit?.platform || ''),
      escapeCsv(p.audit?.loadTimeMs || ''),
      escapeCsv(p.audit ? (p.audit.hasWhatsAppFloating ? 'SI' : 'NO') : ''),
      escapeCsv(p.audit ? (p.audit.hasMetaPixel ? 'SI' : 'NO') : ''),
      escapeCsv(p.pitch?.whatsapp || ''),
      escapeCsv(p.pitch?.whatsappUxUi || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `prospectos_hunter_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitchId(id);
    setTimeout(() => setCopiedPitchId(null), 2000);
  };

  return (
    <AdminShell
      username={username}
      locale={locale}
      title="Hunter B2B & Automatización de Negocios"
      subtitle="Scouting inteligente por país y ciudad con diagnóstico técnico, reemplazo de Excels y propuesta de automatización con IA"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setBatchOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1E1810]/15 hover:border-[#1E1810] text-xs font-bold text-[#1E1810] transition-all shadow-sm cursor-pointer"
            title="Pegar una lista de URLs de tiendas para agregarlas a la vez"
          >
            <Layers className="w-3.5 h-3.5 text-[#f96e03]" />
            <span>+ Carga Masiva URLs</span>
          </button>
          <button
            type="button"
            onClick={() => setManualOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#1E1810]/15 hover:border-[#1E1810] text-xs font-bold text-[#1E1810] transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#f96e03]" />
            <span>+ 1 Tienda</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-800 transition-colors shadow-sm cursor-pointer"
            title="Descargar lista completa en CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>
          <Link
            href={`/${locale}/admin/crm`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
          >
            <span>Ver Pipeline CRM</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#f96e03]" />
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#575250] font-bold block">
              Total Negocios
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1E1810]">
              {totalCount}
            </div>
            <span className="text-[10px] text-stone-500 block">En prospección activa</span>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#575250] font-bold block">
              Auditados con IA
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-purple-700">
              {auditedCount}
            </div>
            <span className="text-[10px] text-stone-500 block">Con diagnóstico técnico</span>
          </div>

          <div
            onClick={() => setFilter('hot')}
            className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 cursor-pointer hover:bg-amber-100/70 transition-all"
            title="Filtrar por prospectos que abrieron el reporte"
          >
            <span className="text-[11px] font-mono uppercase text-amber-800 font-bold flex items-center gap-1">
              <span>🔥</span>
              <span>Leads Calientes</span>
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-900">
              {hotCount}
            </div>
            <span className="text-[10px] text-amber-700/80 block">Vieron su auditoría</span>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#575250] font-bold block">
              Importados al CRM
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700">
              {importedCount}
            </div>
            <span className="text-[10px] text-stone-500 block">En pipeline de conversión</span>
          </div>

          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
            <span className="text-[11px] font-mono uppercase text-[#575250] font-bold block">
              Puntaje Promedio
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-800">
              {avgScore > 0 ? `${avgScore}/100` : '—'}
            </div>
            <span className="text-[10px] text-stone-500 block">Rendimiento global</span>
          </div>
        </div>

        {/* Scouting Control Box with Country + City Selector */}
        <div className="bg-gradient-to-r from-stone-900 via-[#1E1810] to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative">
          <div className="max-w-2xl space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#f96e03] text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>International Hunter & Automation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Explorar Negocios & Empresas por País & Ciudad
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Descubre empresas reales (servicios, proyectos, clínicas, e-commerce) en Colombia, USA, Brasil y más de 40 países. El agente analiza fricción operativa, Excels desorganizados y redacta ganchos consultivos directos.
            </p>
          </div>

          <form onSubmit={handleScout} className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            {/* Country Selector with Live Search Popover */}
            <div className="relative" ref={countryRef}>
              <label className="block text-[11px] font-mono uppercase text-stone-400 font-bold mb-1.5 flex items-center justify-between">
                <span>País</span>
                <span className="text-[10px] text-stone-400 lowercase font-normal">{ALL_COUNTRIES.length} países</span>
              </label>
              <button
                type="button"
                onClick={() => setCountryOpen((prev) => !prev)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm flex items-center justify-between gap-2 focus:outline-none focus:border-[#f96e03] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base flex-shrink-0">{getCountryFlag(country)}</span>
                  <span className="truncate font-medium">{country}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${
                    countryOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {countryOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#1a1510] border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-white/10 bg-white/5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Buscar país (ej: Colombia, Brasil, USA)..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white/10 border border-white/10 text-white placeholder-stone-400 focus:outline-none focus:border-[#f96e03]"
                      />
                      {countrySearch && (
                        <button
                          type="button"
                          onClick={() => setCountrySearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-white/5 text-xs">
                    {filteredTopCountries.length > 0 && (
                      <div className="p-1.5">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#f96e03] font-bold">
                          🏆 Top & LATAM Prioritarios
                        </div>
                        <div className="space-y-0.5">
                          {filteredTopCountries.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => handleSelectCountry(c.name)}
                              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                                country === c.name
                                  ? 'bg-[#f96e03] text-stone-950 font-bold'
                                  : 'hover:bg-white/10 text-stone-200'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              {country === c.name && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredOtherCountries.length > 0 && (
                      <div className="p-1.5">
                        <div className="px-2 py-1 text-[10px] font-mono uppercase text-stone-400 font-bold">
                          🌐 Todos los Países
                        </div>
                        <div className="space-y-0.5">
                          {filteredOtherCountries.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => handleSelectCountry(c.name)}
                              className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                                country === c.name
                                  ? 'bg-[#f96e03] text-stone-950 font-bold'
                                  : 'hover:bg-white/10 text-stone-200'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </span>
                              {country === c.name && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredTopCountries.length === 0 && filteredOtherCountries.length === 0 && (
                      <div className="p-4 text-center text-xs text-stone-400">
                        No encontramos &quot;{countrySearch}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* City Selector with Live Search Popover */}
            <div className="relative" ref={cityRef}>
              <label className="block text-[11px] font-mono uppercase text-stone-400 font-bold mb-1.5 flex items-center justify-between">
                <span>Ciudad / Región</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {isCustomCity ? 'Personalizada' : `${currentAvailableCities.length} ciudades`}
                </span>
              </label>
              <button
                type="button"
                onClick={() => setCityOpen((prev) => !prev)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs sm:text-sm flex items-center justify-between gap-2 focus:outline-none focus:border-[#f96e03] text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#f96e03] flex-shrink-0" />
                  <span className="truncate font-medium">{city}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${
                    cityOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {cityOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#1a1510] border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-white/10 bg-white/5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Buscar o ingresar ciudad en ${country}...`}
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-white/10 border border-white/10 text-white placeholder-stone-400 focus:outline-none focus:border-[#f96e03]"
                      />
                      {citySearch && (
                        <button
                          type="button"
                          onClick={() => setCitySearch('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-white/5 text-xs">
                    {citySearch.trim() && (
                      <div className="p-1.5 bg-[#f96e03]/10">
                        <button
                          type="button"
                          onClick={() => {
                            setCity(citySearch.trim());
                            setIsCustomCity(true);
                            setCustomCity(citySearch.trim());
                            setCityOpen(false);
                            setCitySearch('');
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-left text-[#f96e03] hover:bg-[#f96e03]/20 font-bold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Usar &quot;{citySearch.trim()}&quot; como ciudad</span>
                        </button>
                      </div>
                    )}

                    <div className="p-1.5 space-y-0.5">
                      {filteredCities.map((cityName) => (
                        <button
                          key={cityName}
                          type="button"
                          onClick={() => handleSelectCity(cityName)}
                          className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                            city === cityName && !isCustomCity
                              ? 'bg-[#f96e03] text-stone-950 font-bold'
                              : 'hover:bg-white/10 text-stone-200'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{cityName}</span>
                          </span>
                          {city === cityName && !isCustomCity && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}

                      {filteredCities.length === 0 && !citySearch.trim() && (
                        <div className="p-4 text-center text-xs text-stone-400">
                          Escribe arriba para ingresar cualquier ciudad.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nicho / Categoría */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-stone-400 font-bold mb-1.5">
                Nicho / Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:border-[#f96e03]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-stone-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
              {category === 'Personalizado (Escribir término)' && (
                <input
                  type="text"
                  placeholder="Ej: Contratistas de climatización..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 rounded-lg bg-white/10 border border-[#f96e03] text-white text-xs focus:outline-none placeholder-stone-400"
                  autoFocus
                />
              )}
            </div>

            {/* Count */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-stone-400 font-bold mb-1.5">
                Cantidad a Explorar
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs sm:text-sm focus:outline-none focus:border-[#f96e03]"
              >
                <option value={3} className="bg-stone-900 text-white">3 Negocios</option>
                <option value={5} className="bg-stone-900 text-white">5 Negocios</option>
                <option value={10} className="bg-stone-900 text-white">10 Negocios</option>
                <option value={15} className="bg-stone-900 text-white">15 Negocios</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={scouting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] font-serif font-bold text-xs sm:text-sm transition-all shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {scouting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Explorar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#1E1810]/10 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, web o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
              />
            </div>

            {/* Country filter dropdown */}
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] font-medium focus:outline-none focus:border-[#f96e03]"
            >
              <option value="all">🌍 Todos los Países</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
            {pendingCount > 0 && (
              <button
                type="button"
                disabled={auditingAll}
                onClick={handleAuditAllPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                title="Audita automáticamente todos los que no tienen análisis"
              >
                <Zap className={`w-3.5 h-3.5 text-purple-600 ${auditingAll ? 'animate-spin' : ''}`} />
                <span>
                  {auditingAll
                    ? `Auditando (${auditProgress?.done || 0}/${auditProgress?.total || 0})...`
                    : `Auditar ${pendingCount} Pendientes`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#1E1810] text-white shadow-sm'
                  : 'bg-stone-100 text-[#575250] hover:bg-stone-200'
              }`}
            >
              Todos ({prospects.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('hot')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'hot'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
              title="Filtrar por negocios que abrieron el reporte interactivo"
            >
              <span>🔥</span>
              <span>Vistos ({hotCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter('audited')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'audited'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-stone-100 text-[#575250] hover:bg-stone-200'
              }`}
            >
              Auditados ({auditedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 text-[#575250] hover:bg-stone-200'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('imported')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'imported'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 text-[#575250] hover:bg-stone-200'
              }`}
            >
              En CRM ({importedCount})
            </button>
          </div>
        </div>

        {/* Prospect List */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#1E1810]/10 rounded-2xl p-12 text-center space-y-3">
            <Search className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#1E1810]">
              No hay tiendas que coincidan con la búsqueda
            </h3>
            <p className="text-xs text-[#575250] max-w-md mx-auto">
              Utiliza el buscador superior para explorar tiendas por país y ciudad, o pulsa en <strong>"+ Carga Masiva URLs"</strong> para pegar un lote de enlaces.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map((p) => {
              const isAudited = Boolean(p.audit);
              const score = p.audit?.score || 0;
              const rawDigits = p.phone ? p.phone.replace(/\D/g, '') : '';

              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#1E1810]/10 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 hover:border-[#1E1810]/30 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-serif font-bold text-[#1E1810]">{p.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          🌍 {p.country || 'Colombia'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          📍 {p.city}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          🏷️ {p.category}
                        </span>
                        {p.status === 'imported_crm' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>En Pipeline CRM</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#575250]">
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#f96e03] hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>{p.website.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {rawDigits && (
                          <span className="font-mono text-[11px]">📱 +{rawDigits}</span>
                        )}
                        {p.email ? (
                          <button
                            type="button"
                            onClick={() => {
                              const input = prompt(
                                `Editar correo para ${p.name}:`,
                                p.email
                              );
                              if (input !== null) {
                                handleUpdateEmail(p.id, input);
                              }
                            }}
                            className="font-mono text-[11px] text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 cursor-pointer transition-colors"
                            title="Hacer clic para editar el correo"
                          >
                            ✉️ {p.email}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const input = prompt(
                                `Ingresar correo para ${p.name}:`,
                                ''
                              );
                              if (input !== null && input.trim()) {
                                handleUpdateEmail(p.id, input.trim());
                              }
                            }}
                            className="font-mono text-[11px] text-stone-400 hover:text-stone-700 hover:underline cursor-pointer flex items-center gap-1"
                            title="Ingresar correo manualmente"
                          >
                            <span>✉️ + Correo</span>
                          </button>
                        )}
                        {p.instagram && (
                          <a
                            href={`https://instagram.com/${p.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:underline font-mono text-[11px]"
                          >
                            📸 @{p.instagram}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-wrap justify-end">
                      {isAudited && (
                        (p.viewCount && p.viewCount > 0) ? (
                          <span
                            className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 shadow-sm"
                            title={`Última visita: ${p.lastViewedAt ? new Date(p.lastViewedAt).toLocaleString() : 'Reciente'}`}
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{p.viewCount} {p.viewCount === 1 ? 'visita' : 'visitas'}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-xl text-[10px] font-mono text-stone-400 bg-stone-50 border border-stone-200 flex items-center gap-1">
                            <Eye className="w-3 h-3 text-stone-300" />
                            <span>0 visitas</span>
                          </span>
                        )
                      )}
                      {isAudited ? (
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          <div
                            className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm ${
                              score >= 80
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : score >= 50
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}
                            title="Puntaje Ponderado Global (35% Técnico, 35% UX, 30% UI)"
                          >
                            <span className="text-[9px] font-mono uppercase font-bold">Global</span>
                            <span className="text-sm font-serif font-black">{score}/100</span>
                          </div>

                          {p.audit?.techScore !== undefined && (
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1"
                              title="Rendimiento, TTFB y velocidad de servidor"
                            >
                              <Zap className="w-3 h-3 text-blue-600" />
                              <span>Técnico: {p.audit.techScore}</span>
                            </span>
                          )}

                          {p.audit?.uxScore !== undefined && (
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"
                              title="Experiencia de compra, fricción y checkout móvil"
                            >
                              <Smartphone className="w-3 h-3 text-amber-600" />
                              <span>UX: {p.audit.uxScore}</span>
                            </span>
                          )}

                          {p.audit?.uiScore !== undefined && (
                            <span
                              className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1"
                              title="Diseño visual, jerarquía tipográfica y presentación de marca"
                            >
                              <Palette className="w-3 h-3 text-purple-600" />
                              <span>UI: {p.audit.uiScore}</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-stone-400 bg-stone-100 px-3 py-1 rounded-xl">
                          Sin auditar
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Technical & UX/UI Audit Findings */}
                  {isAudited && p.audit && (() => {
                    const currentTab = auditTabs[p.id] || 'all';
                    const showTech = currentTab === 'all' || currentTab === 'tech';
                    const showUx = currentTab === 'all' || currentTab === 'ux';
                    const showUi = currentTab === 'all' || currentTab === 'ui';

                    return (
                      <div className="bg-[#FAF7F5] border border-stone-200/80 rounded-2xl p-4 sm:p-5 space-y-3.5">
                        {/* Audit Tab Selector */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setAuditTabs((prev) => ({ ...prev, [p.id]: 'all' }))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                                currentTab === 'all'
                                  ? 'bg-[#1E1810] text-white font-bold'
                                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                              }`}
                            >
                              📋 Vista Integral
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuditTabs((prev) => ({ ...prev, [p.id]: 'tech' }))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                                currentTab === 'tech'
                                  ? 'bg-blue-700 text-white font-bold'
                                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                              }`}
                            >
                              <Zap className="w-3 h-3" />
                              <span>⚡ Técnico ({p.audit.techScore ?? score})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuditTabs((prev) => ({ ...prev, [p.id]: 'ux' }))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                                currentTab === 'ux'
                                  ? 'bg-amber-700 text-white font-bold'
                                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                              }`}
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>📱 UX & Conversión ({p.audit.uxScore ?? '—'})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuditTabs((prev) => ({ ...prev, [p.id]: 'ui' }))}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                                currentTab === 'ui'
                                  ? 'bg-purple-700 text-white font-bold'
                                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                              }`}
                            >
                              <Palette className="w-3 h-3" />
                              <span>🎨 UI & Diseño ({p.audit.uiScore ?? '—'})</span>
                            </button>
                          </div>
                        </div>

                        {/* SECTION 1: Technical & Performance */}
                        {showTech && (
                          <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-stone-200/60">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-mono uppercase text-blue-900 font-bold flex items-center gap-1">
                                <Zap className="w-3.5 h-3.5 text-blue-600" />
                                Infraestructura & Velocidad
                              </span>
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-bold text-[#1E1810]">Plataforma:</span>
                                <span className="px-2 py-0.5 rounded-lg bg-stone-100 border border-stone-200 font-mono text-[11px]">
                                  {p.audit.platform}
                                </span>
                                <span className="text-stone-300">|</span>
                                <span className="font-bold text-[#1E1810]">Carga:</span>
                                <span className="font-mono text-[11px] text-stone-700 font-semibold">
                                  {(p.audit.loadTimeMs / 1000).toFixed(1)}s (TTFB: {(p.audit.ttfbMs / 1000).toFixed(2)}s)
                                </span>
                                <span className="text-stone-300">|</span>
                                <span className="font-bold text-[#1E1810]">Píxel:</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                                    p.audit.hasMetaPixel ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {p.audit.hasMetaPixel ? '✓ Activo' : '✗ No detectado'}
                                </span>
                              </div>
                            </div>
                            <ul className="space-y-1 text-xs text-[#2b2725] pl-1">
                              {p.audit.auditHighlights.map((h, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold shrink-0">•</span>
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* SECTION 2: UX & Conversion Friction */}
                        {showUx && (
                          <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-stone-200/60">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-[11px] font-mono uppercase text-amber-900 font-bold flex items-center gap-1">
                                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                                Experiencia de Compra & Conversión (UX)
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold ${
                                    p.audit.hasWhatsAppFloating
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {p.audit.hasWhatsAppFloating ? '✓ WA Flotante' : '✗ Sin WA Flotante'}
                                </span>
                                {p.audit.uxUiSignals && (
                                  <>
                                    <span
                                      className={`px-2 py-0.5 rounded font-bold ${
                                        p.audit.uxUiSignals.hasSearch
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-stone-100 text-stone-600'
                                      }`}
                                    >
                                      {p.audit.uxUiSignals.hasSearch ? '✓ Buscador' : '✗ Sin Buscador'}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded font-bold ${
                                        p.audit.uxUiSignals.hasCartOrCheckout
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {p.audit.uxUiSignals.hasCartOrCheckout ? '✓ Checkout Visible' : '⚠️ Carrito Poco Claro'}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded font-bold ${
                                        p.audit.uxUiSignals.hasTrustBadges
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {p.audit.uxUiSignals.hasTrustBadges ? '✓ Sellos Pago Seguro' : '✗ Sin Sellos Confianza'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ul className="space-y-1 text-xs text-[#2b2725] pl-1">
                              {(p.audit.uxFindings && p.audit.uxFindings.length > 0
                                ? p.audit.uxFindings
                                : [
                                    p.audit.hasWhatsAppFloating
                                      ? 'Canal de WhatsApp disponible para cerrar ventas en caliente'
                                      : 'Sin botón directo de WhatsApp: clientes con dudas abandonan la tienda sin pagar',
                                    'Flujo de compra y checkout evaluado en dispositivos móviles',
                                  ]
                              ).map((f, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-amber-600 font-bold shrink-0">•</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* SECTION 3: UI & Visual Polish */}
                        {showUi && (
                          <div className="space-y-2 bg-white/70 p-3 rounded-xl border border-stone-200/60">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-[11px] font-mono uppercase text-purple-900 font-bold flex items-center gap-1">
                                <Palette className="w-3.5 h-3.5 text-purple-600" />
                                Diseño Visual, Jerarquía & Marca (UI)
                              </span>
                              {p.audit.uxUiSignals && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      p.audit.uxUiSignals.hasCustomTypography
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-stone-100 text-stone-600'
                                    }`}
                                  >
                                    {p.audit.uxUiSignals.hasCustomTypography ? '✓ Tipografía de Marca' : '⚠️ Tipografía Genérica'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      p.audit.uxUiSignals.hasFavicon
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {p.audit.uxUiSignals.hasFavicon ? '✓ Favicon' : '✗ Sin Favicon'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      p.audit.uxUiSignals.hasModernImages
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {p.audit.uxUiSignals.hasModernImages ? '✓ Formatos WebP' : '⚠️ Imágenes Legacy'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded font-bold ${
                                      p.audit.uxUiSignals.hasAggressivePopups
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                  >
                                    {p.audit.uxUiSignals.hasAggressivePopups ? '⚠️ Popups Invasivos' : '✓ Sin Popups Agresivos'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <ul className="space-y-1 text-xs text-[#2b2725] pl-1">
                              {(p.audit.uiFindings && p.audit.uiFindings.length > 0
                                ? p.audit.uiFindings
                                : [
                                    'Estilo visual general y consistencia de espaciados evaluados',
                                    'Presentación de catálogo y micro-interacciones en pantallas móviles',
                                  ]
                              ).map((f, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-600 font-bold shrink-0">•</span>
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggested Improvement */}
                        {p.audit.suggestedImprovement && (
                          <div className="pt-2 border-t border-stone-200/70 text-xs text-[#575250]">
                            <strong className="text-[#1E1810]">Oportunidad Estratégica:</strong>{' '}
                            {p.audit.suggestedImprovement}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Consultative Pitch & Actions */}
                  {isAudited && p.pitch && (() => {
                    const pitchMode = pitchModes[p.id] || 'tech';
                    const activePitchText =
                      pitchMode === 'voice'
                        ? p.pitch.voiceScript ||
                          `Hola equipo de ${p.name}, les habla Andrés Morales. Estuve revisando su sitio web y les preparé un dictamen técnico confidencial sobre su velocidad móvil y una propuesta para automatizar cotizaciones y proyectos sin depender de Excels manuales. Les comparto el enlace privado por aquí por si quieren revisarlo con el equipo.`
                        : pitchMode === 'uxui' && p.pitch.whatsappUxUi
                        ? p.pitch.whatsappUxUi
                        : p.pitch.whatsapp;

                    return (
                      <div className="bg-white border border-purple-200/70 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-serif font-bold text-purple-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            Gancho de Contacto Consultivo (Cero Precios · Alta Conversión)
                          </span>

                          {/* Pitch Mode Toggle */}
                          <div className="flex items-center gap-1 bg-purple-50 p-0.5 rounded-lg border border-purple-200/60">
                            <button
                              type="button"
                              onClick={() => setPitchModes((prev) => ({ ...prev, [p.id]: 'tech' }))}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                pitchMode === 'tech'
                                  ? 'bg-purple-700 text-white shadow-xs'
                                  : 'text-purple-800 hover:bg-purple-100'
                              }`}
                            >
                              ⚡ Velocidad & Tech
                            </button>
                            <button
                              type="button"
                              onClick={() => setPitchModes((prev) => ({ ...prev, [p.id]: 'uxui' }))}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                pitchMode === 'uxui'
                                  ? 'bg-purple-700 text-white shadow-xs'
                                  : 'text-purple-800 hover:bg-purple-100'
                              }`}
                            >
                              🎨 Rediseño UX/UI
                            </button>
                            <button
                              type="button"
                              onClick={() => setPitchModes((prev) => ({ ...prev, [p.id]: 'voice' }))}
                              className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                pitchMode === 'voice'
                                  ? 'bg-purple-700 text-white shadow-xs'
                                  : 'text-purple-800 hover:bg-purple-100'
                              }`}
                            >
                              🎙️ Nota de Voz (20s)
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(activePitchText, p.id)}
                            className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedPitchId === p.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>{pitchMode === 'voice' ? 'Copiar Guion' : 'Copiar Texto'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {pitchMode === 'voice' && (
                          <div className="text-[11px] font-mono text-purple-900 bg-purple-100/70 p-2.5 rounded-xl border border-purple-200/60 leading-relaxed">
                            💡 <strong>Estrategia 100% Gratis:</strong> Graba este guion con tu propia voz humana en WhatsApp (20 segundos) justo después de enviarle el link. Convierte +65% porque el cliente nota que un experto real dedicó tiempo a analizar su empresa.
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 whitespace-pre-wrap leading-relaxed font-sans">
                          {activePitchText}
                        </div>

                        <div className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-mono">
                          <span className="text-slate-600 truncate flex items-center gap-1.5">
                            <span className="text-slate-400">🔗 Link Auditoría:</span>
                            <a
                              href={`/audit/${p.auditSlug || p.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#f96e03] hover:underline"
                            >
                              andresmorales.com.co/audit/{p.auditSlug || p.id}
                            </a>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const url = `https://andresmorales.com.co/audit/${p.auditSlug || p.id}`;
                              navigator.clipboard.writeText(url);
                              alert('Link de auditoría copiado al portapapeles');
                            }}
                            className="text-stone-600 hover:text-stone-900 shrink-0 ml-2 font-sans font-medium cursor-pointer"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {!isAudited ? (
                        <button
                          type="button"
                          disabled={auditingId === p.id}
                          onClick={() => handleAudit(p.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-serif font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>{auditingId === p.id ? 'Auditando en vivo...' : '⚡ Auditar Tienda con IA'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={auditingId === p.id}
                          onClick={() => handleAudit(p.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                          title="Volver a medir y actualizar métricas"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${auditingId === p.id ? 'animate-spin' : ''}`} />
                          <span>Re-auditar</span>
                        </button>
                      )}

                      {isAudited && rawDigits && p.pitch && (() => {
                        const pitchMode = pitchModes[p.id] || 'tech';
                        const textToSend =
                          pitchMode === 'uxui' && p.pitch.whatsappUxUi
                            ? p.pitch.whatsappUxUi
                            : p.pitch.whatsapp;
                        return (
                          <a
                            href={`https://wa.me/${rawDigits}?text=${encodeURIComponent(textToSend)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Enviar por WhatsApp</span>
                          </a>
                        );
                      })()}

                      {isAudited && p.pitch && (() => {
                        const emailDraft = {
                          to: p.email || '',
                          name: p.name || '',
                          subject:
                            p.pitch.emailSubject ||
                            `Diagnóstico de conversión y UX e-commerce | ${p.name}`,
                          body: p.pitch.emailBody || '',
                        };
                        const emailQuery = new URLSearchParams({
                          tab: 'email',
                          to: emailDraft.to,
                          name: emailDraft.name,
                          subject: emailDraft.subject,
                          body: emailDraft.body,
                        }).toString();

                        const handlePrepareEmail = () => {
                          if (typeof window !== 'undefined') {
                            try {
                              sessionStorage.setItem('crm_email_draft', JSON.stringify(emailDraft));
                            } catch {
                              // ignore
                            }
                          }
                        };

                        return (
                          <Link
                            href={`/${locale}/admin/crm?${emailQuery}`}
                            onClick={handlePrepareEmail}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                            title={
                              p.email
                                ? `Abrir compositor en CRM con borrador para ${p.email}`
                                : 'Abrir compositor en CRM con asunto y mensaje precargados'
                            }
                          >
                            <Mail className="w-3.5 h-3.5 text-[#f96e03]" />
                            <span>Preparar Correo</span>
                          </Link>
                        );
                      })()}

                      {isAudited && (
                        <>
                          <a
                            href={`/audit/${p.auditSlug || p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A0D14] hover:bg-[#1A2234] text-white font-medium text-xs transition-all shadow-sm cursor-pointer"
                            title="Ver reporte interactivo en una pestaña nueva"
                          >
                            <Smartphone className="w-3.5 h-3.5 text-[#f96e03]" />
                            <span>Ver Reporte Web</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </a>

                          <a
                            href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(p.website)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors cursor-pointer border border-blue-200/70"
                            title="Verificar métricas en vivo en Google PageSpeed Insights"
                          >
                            <Gauge className="w-3.5 h-3.5 text-blue-600" />
                            <span>Google PageSpeed</span>
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              const url = `https://andresmorales.com.co/audit/${p.auditSlug || p.id}`;
                              navigator.clipboard.writeText(url);
                              alert(`¡Enlace confidencial copiado!\n${url}`);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
                            title="Copiar link interactivo confidencial para enviar por cualquier canal"
                          >
                            <Share2 className="w-3.5 h-3.5 text-stone-500" />
                            <span>Copiar Link</span>
                          </button>

                          {(p.pdfUrl || p.auditSlug?.includes('bosi') || p.name?.toLowerCase().includes('bosi')) && (
                            <a
                              href={p.pdfUrl || '/audits/ultra_auditoria_ux_ui_bosi_colombia_andresmorales.pdf'}
                              download={`Ultra_Auditoria_${p.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_AndresMorales.pdf`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Descargar Dictamen Técnico en PDF con capturas reales"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Descargar PDF</span>
                            </a>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      {p.status !== 'imported_crm' ? (
                        <button
                          type="button"
                          disabled={importingId === p.id}
                          onClick={() => handleImportToCrm(p.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1810] hover:bg-[#332b21] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-[#f96e03]" />
                          <span>{importingId === p.id ? 'Importando...' : '📥 Importar al Pipeline CRM'}</span>
                        </button>
                      ) : (
                        <Link
                          href={`/${locale}/admin/crm`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <span>Ver en CRM</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Add Stores Modal */}
      {batchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#1E1810]/10 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1E1810] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#f96e03]" />
                Carga Masiva de URLs de Tiendas
              </h3>
              <p className="text-xs text-[#575250] mt-0.5">
                Pega múltiples URLs (una por línea) o en formato <code>Nombre de Marca | https://tienda.com</code>.
              </p>
            </div>

            <form onSubmit={handleProcessBatch} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    País
                  </label>
                  <select
                    value={batchCountry}
                    onChange={(e) => setBatchCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    Categoría
                  </label>
                  <select
                    value={batchCategory}
                    onChange={(e) => setBatchCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                  Lista de Tiendas (1 por línea)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={`https://tienda1.com\nJoyería Ámbar | https://joyeriaambar.co\nhttps://calzadomoderno.mx`}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-[#1E1810] font-mono focus:outline-none focus:border-[#f96e03] leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setBatchOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#575250] hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingBatch}
                  className="px-5 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingBatch ? 'Cargando Lote...' : 'Procesar Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Single Store Modal */}
      {manualOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#1E1810]/10 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#1E1810]">
                Agregar Tienda para Auditoría
              </h3>
              <p className="text-xs text-[#575250] mt-0.5">
                Ingresa los datos del negocio y el agente realizará la inspección técnica de inmediato.
              </p>
            </div>

            <form onSubmit={handleAddManual} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                  Nombre Comercial
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Joyería Aurora"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                  Sitio Web Oficial
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://tienda.com.co"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    País
                  </label>
                  <select
                    value={manualCountry}
                    onChange={(e) => setManualCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    placeholder="Ciudad..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#575250] font-bold mb-1">
                  Categoría
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1E1810] focus:outline-none focus:border-[#f96e03]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setManualOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#575250] hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingManual}
                  className="px-5 py-2 rounded-xl bg-[#f96e03] hover:bg-[#ff5100] text-[#1E1810] font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingManual ? 'Guardando...' : 'Guardar y Auditar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
