'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, Orbit, Search, X, Sparkles, Filter } from 'lucide-react';
import { CircularGallery, type GalleryItem } from '@/components/ui/circular-gallery';

export type ProjectItem = {
  key: string;
  image: string;
  href: string;
  caseStudySlug?: string;
  category: 'saas' | 'ecommerce' | 'ai';
  tags: string[];
  status?: 'live' | 'archived';
  access?: {
    email: string;
    password: string;
  };
  title: string;
  subtitle: string;
  metric: string;
  desc: string;
};

export type AutomationItem = {
  key: string;
  image: string;
  title: string;
  subtitle: string;
  metric: string;
  desc: string;
  badge: string;
  tags: string[];
};

type Props = {
  projects: ProjectItem[];
  automationCases: AutomationItem[];
  lang: string;
  labels: {
    filterAll: string;
    filterSaas: string;
    filterEcommerce: string;
    filterAi: string;
    filterAutomation: string;
    badgeLive: string;
    badgeArchived: string;
    demoCreds: string;
    email: string;
    pass: string;
    viewCase: string;
    visitLive: string;
    autoCasePrefix: string;
    view3d: string;
    viewGrid: string;
    view3dTitle: string;
    viewGridTitle: string;
    showcase3dBadge: string;
    showcase3dInstructions: string;
    viewCaseShort: string;
    rotateLeft: string;
    rotateRight: string;
    resetRotation: string;
    metricLabel: string;
    automationSubtitle: string;
  };
};

const POPULAR_TECH_TAGS = ['Next.js', 'Shopify', 'Three.js', 'PostgreSQL', 'Tailwind'] as const;

export function PortfolioInteractiveGrid({
  projects,
  automationCases,
  lang,
  labels,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'saas' | 'ecommerce' | 'ai' | 'automation'
  >('all');
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | '3d'>('3d');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: "/" or "Cmd+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if already inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isInput) {
        if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (target === searchInputRef.current && e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Count items per category
  const saasCount = projects.filter((p) => p.category === 'saas').length;
  const ecomCount = projects.filter((p) => p.category === 'ecommerce').length;
  const aiCount = projects.filter((p) => p.category === 'ai').length;
  const autoCount = automationCases.length;
  const totalCount = projects.length;

  const categories = [
    { id: 'all', label: labels.filterAll, count: totalCount },
    { id: 'saas', label: labels.filterSaas, count: saasCount },
    { id: 'ecommerce', label: labels.filterEcommerce, count: ecomCount },
    { id: 'ai', label: labels.filterAi, count: aiCount },
    { id: 'automation', label: labels.filterAutomation, count: autoCount },
  ] as const;

  // Filtered projects with category + tech tag + search term
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'automation') return [];

    return projects.filter((p) => {
      // Category check
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Tech tag filter
      if (selectedTech) {
        const hasTag = p.tags?.some((t) =>
          t.toLowerCase().includes(selectedTech.toLowerCase())
        );
        if (!hasTag) return false;
      }

      // Search query filter (matches title, subtitle, desc or tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = p.title.toLowerCase().includes(query);
        const inSubtitle = p.subtitle.toLowerCase().includes(query);
        const inDesc = p.desc.toLowerCase().includes(query);
        const inTags = p.tags?.some((t) => t.toLowerCase().includes(query));
        if (!inTitle && !inSubtitle && !inDesc && !inTags) {
          return false;
        }
      }

      return true;
    });
  }, [projects, selectedCategory, selectedTech, searchQuery]);

  const hasActiveFilters = Boolean(
    selectedCategory !== 'all' || selectedTech || searchQuery.trim()
  );

  const handleCategoryClick = (catId: typeof selectedCategory) => {
    if (catId === 'automation') {
      const el = document.getElementById('automatizaciones');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setSelectedCategory(catId);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedTech(null);
    setSearchQuery('');
  };

  // Format real projects for 3D Spotlight Showcase
  const galleryItems: GalleryItem[] = filteredProjects.map((p) => {
    const cardHref = p.caseStudySlug
      ? lang === 'en'
        ? `/work/${p.caseStudySlug}`
        : `/${lang}/work/${p.caseStudySlug}`
      : p.href;
    return {
      common: p.title,
      binomial: p.subtitle,
      category: p.category.toUpperCase(),
      tags: p.tags,
      href: cardHref,
      photo: {
        url: p.image,
        text: p.title,
        pos: 'top',
        by: p.metric || 'Andrés Morales',
      },
    };
  });

  return (
    <div className="space-y-6">
      {/* Unified Centered Control Hub with Search & Stacks */}
      <div className="flex flex-col items-center gap-4 max-w-4xl mx-auto mb-4">
        {/* Tier 1: View Mode Switcher + Instant Live Search */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          {/* Segmented Control 3D vs Grid */}
          <div className="inline-flex items-center bg-primary border border-theme-9 p-1 rounded-2xl shadow-xs shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-secondary font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:outline-none ${
                viewMode === '3d'
                  ? 'bg-theme-1 text-secondary shadow-xs'
                  : 'text-text hover:text-secondary'
              }`}
              title={labels.view3dTitle}
            >
              <Orbit className="w-4 h-4 text-accent" />
              <span>{labels.view3d}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-secondary text-primary rounded-full">
                3D
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-secondary font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:outline-none ${
                viewMode === 'grid'
                  ? 'bg-theme-1 text-secondary shadow-xs'
                  : 'text-text hover:text-secondary'
              }`}
              title={labels.viewGridTitle}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{labels.viewGrid}</span>
            </button>
          </div>

          {/* Instant Search Bar with Accessible Label & Keyboard Hint */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text pointer-events-none" />
            <input
              ref={searchInputRef}
              id="portfolio-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={
                lang === 'en'
                  ? 'Search projects by technology, client or stack'
                  : lang === 'pt'
                  ? 'Buscar projetos por tecnologia, cliente ou stack'
                  : 'Buscar proyectos por tecnología, cliente o nombre'
              }
              placeholder={
                lang === 'en'
                  ? 'Search stack, client...'
                  : lang === 'pt'
                  ? 'Buscar stack, cliente...'
                  : 'Buscar tecnología, cliente...'
              }
              className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-primary border border-theme-9 rounded-xl text-secondary placeholder:text-text/70 focus:outline-none focus:border-theme-1 focus:ring-2 focus:ring-theme-1/40 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-text hover:text-secondary p-1 cursor-pointer focus-visible:ring-1 focus-visible:ring-theme-1 rounded"
                  title="Limpiar búsqueda"
                  aria-label="Limpiar campo de búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-theme-5 border border-theme-9 text-text select-none">
                  /
                </kbd>
              )}
            </div>
          </div>
        </div>

        {/* Tier 2: Category Filter Pills (Optimized for Mobile Touch) */}
        <div className="w-full flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1 px-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-secondary font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-theme-1 focus-visible:outline-none ${
                  isActive
                    ? 'bg-secondary text-primary shadow-sm scale-102 ring-1 ring-secondary'
                    : 'bg-primary text-secondary hover:text-secondary border border-theme-9 hover:border-secondary/40'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-theme-1 text-secondary'
                      : 'bg-theme-5 text-text'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tier 3: Quick Tech Tags Filter + Results Counter */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 px-2 text-xs">
          {/* Tech pills with touch target >= 40px in mobile */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-text uppercase tracking-wider mr-1 inline-flex items-center gap-1">
              <Filter className="w-3 h-3 text-text" />
              Stack:
            </span>
            {POPULAR_TECH_TAGS.map((tag) => {
              const isTagActive = selectedTech === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTech(isTagActive ? null : tag)}
                  className={`px-3 py-1.5 sm:py-0.5 rounded-md text-[11px] font-mono transition-all cursor-pointer focus-visible:ring-1 focus-visible:ring-theme-1 ${
                    isTagActive
                      ? 'bg-theme-1 text-secondary font-bold ring-1 ring-theme-2'
                      : 'bg-primary/90 border border-theme-9 text-text hover:text-secondary hover:border-theme-1'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Dynamic Results Counter & Clear all button */}
          <div className="flex items-center gap-2 ml-auto text-[11px] font-mono text-text">
            <span>
              {lang === 'en'
                ? `Showing ${filteredProjects.length} of ${projects.length}`
                : lang === 'pt'
                ? `Mostrando ${filteredProjects.length} de ${projects.length}`
                : `Mostrando ${filteredProjects.length} de ${projects.length}`}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-accent hover:underline font-secondary font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Clear' : lang === 'pt' ? 'Limpar' : 'Limpiar'}
              </button>
            )}
          </div>
        </div>

        {/* Subtle navigation instruction when in 3D mode */}
        {viewMode === '3d' && galleryItems.length > 0 && (
          <p className="text-xs text-text text-center font-secondary flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{labels.showcase3dInstructions}</span>
          </p>
        )}
      </div>

      {/* Suggestion banner if 3D has very few items (1 or 2 items) */}
      {viewMode === '3d' && filteredProjects.length > 0 && filteredProjects.length <= 2 && (
        <div className="max-w-md mx-auto text-center p-3 rounded-xl bg-theme-5/80 border border-theme-9 text-xs text-text flex items-center justify-between gap-3">
          <span>
            {lang === 'en'
              ? 'Showing 1-2 filtered projects.'
              : lang === 'pt'
              ? 'Mostrando 1-2 projetos filtrados.'
              : 'Mostrando 1-2 proyectos con este filtro.'}
          </span>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className="text-secondary font-secondary font-bold text-xs underline hover:text-accent cursor-pointer"
          >
            {lang === 'en' ? 'Switch to Grid →' : lang === 'pt' ? 'Ver em Grade →' : 'Ver en Cuadrícula →'}
          </button>
        </div>
      )}

      {/* Empty State when no results match search or filters */}
      {filteredProjects.length === 0 && selectedCategory !== 'automation' && (
        <div className="bg-primary border border-theme-9 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
          <p className="text-secondary font-heading text-lg mb-2">
            {lang === 'en' ? 'No projects match your filter' : lang === 'pt' ? 'Nenhum projeto encontrado' : 'No encontramos proyectos con ese filtro'}
          </p>
          <p className="text-text text-xs mb-4">
            {lang === 'en' ? 'Try adjusting your search query or technology tag.' : lang === 'pt' ? 'Tente ajustar sua busca ou etiqueta tecnológica.' : 'Prueba cambiando el término de búsqueda o la tecnología.'}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-theme-1 text-secondary font-secondary font-bold text-xs rounded-lg hover:bg-theme-2 transition-all cursor-pointer"
          >
            {lang === 'en' ? 'Show all projects' : lang === 'pt' ? 'Ver todos os projetos' : 'Ver todos los proyectos'}
          </button>
        </div>
      )}

      {/* 3D Showcase Stage View — 1 página al tiempo en gran formato */}
      {viewMode === '3d' && galleryItems.length > 0 && (
        <div className="w-full rounded-3xl bg-theme-5/40 border border-theme-9/80 relative shadow-sm py-4 sm:py-6 overflow-hidden">
          <CircularGallery
            items={galleryItems}
            autoRotateSpeed={0}
            byLabel={labels.metricLabel}
            viewCaseLabel={labels.viewCaseShort}
            rotateLeftTitle={labels.rotateLeft}
            rotateRightTitle={labels.rotateRight}
            resetRotationTitle={labels.resetRotation}
          />
        </div>
      )}

      {/* Classic Projects Grid with Live Status & Hover Glow */}
      {viewMode === 'grid' && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const cardHref = proj.caseStudySlug
              ? lang === 'en'
                ? `/work/${proj.caseStudySlug}`
                : `/${lang}/work/${proj.caseStudySlug}`
              : proj.href;
            const isArchived = proj.status === 'archived';

            return (
              <article
                key={proj.key}
                className="group flex flex-col bg-primary rounded-2xl overflow-hidden border border-theme-9 hover:border-theme-1 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
              >
                {/* Image Container with Link & Live Pulse */}
                <Link
                  href={cardHref}
                  className="relative aspect-[16/10] overflow-hidden bg-theme-9 block"
                >
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  {/* Status Badge with Live Pulsing Indicator */}
                  <span
                    className={`absolute top-3 left-3 text-[10px] uppercase tracking-widest font-secondary font-bold px-2.5 py-1 rounded-full shadow-md inline-flex items-center gap-1.5 ${
                      isArchived
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-theme-1 text-secondary'
                    }`}
                  >
                    {!isArchived && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                      </span>
                    )}
                    <span>{isArchived ? labels.badgeArchived : labels.badgeLive}</span>
                  </span>

                  {/* Subtle category tag top-right */}
                  <span className="absolute top-3 right-3 text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-secondary/80 text-primary backdrop-blur-xs">
                    {proj.category}
                  </span>
                </Link>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category subtitle */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold">
                        {proj.subtitle}
                      </span>
                    </div>

                    {/* Tech chips */}
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {proj.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-theme-5 text-secondary/80 border border-theme-9"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="font-heading text-xl md:text-2xl mb-2 text-secondary group-hover:text-theme-1 transition-colors">
                      <Link href={cardHref}>{proj.title}</Link>
                    </h3>
                    <p className="text-sm text-text leading-relaxed mb-4">
                      {proj.desc}
                    </p>

                    {/* Demo Credentials if applicable */}
                    {proj.access && (
                      <div className="border-t border-theme-8/20 mt-3 pt-3 mb-4 space-y-2 bg-theme-5/50 p-2.5 rounded-lg">
                        <div className="text-[10px] uppercase tracking-widest text-secondary font-secondary font-bold">
                          {labels.demoCreds}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                          <span className="opacity-70">{labels.email}:</span>
                          <span className="bg-primary px-2 py-0.5 rounded select-all">
                            {proj.access.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                          <span className="opacity-70">{labels.pass}:</span>
                          <span className="bg-primary px-2 py-0.5 rounded select-all">
                            {proj.access.password}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer with Metric & Links */}
                  <div className="pt-3 border-t border-theme-9 flex items-center justify-between gap-2 flex-wrap">
                    {proj.metric && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-theme-1/15 border border-theme-1/30 text-xs font-secondary font-bold text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {proj.metric}
                      </span>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                      {proj.caseStudySlug && (
                        <Link
                          href={
                            lang === 'en'
                              ? `/work/${proj.caseStudySlug}`
                              : `/${lang}/work/${proj.caseStudySlug}`
                          }
                          className="text-xs font-secondary font-bold text-secondary hover:text-accent transition-colors flex items-center gap-1"
                        >
                          {labels.viewCase}
                        </Link>
                      )}
                      {proj.href && proj.href.startsWith('http') && (
                        <a
                          href={proj.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-secondary font-bold text-secondary/70 hover:text-secondary transition-colors inline-flex items-center gap-1"
                          title="Visitar sitio web en producción"
                        >
                          {labels.visitLive}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
