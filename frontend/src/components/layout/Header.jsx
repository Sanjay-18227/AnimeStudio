import React from 'react';
import {
  FolderPlus,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sliders,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Header({
  activeProject,
  projects = [],
  onSelectProject,
  onOpenNewProjectModal,
  language,
  setLanguage,
  systemHealth,
  onOpenSettings,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false
}) {
  return (
    <header className="sticky top-0 z-10 flex min-h-16 w-full flex-wrap items-center justify-between gap-2 border-b border-studio-border bg-[#0C0E1B]/90 px-3 py-2 backdrop-blur-md sm:flex-nowrap sm:px-6">
      {/* Left: Active Project Selector */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-studio-purple md:hidden"
          aria-label={isMobileSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="studio-sidebar"
          aria-expanded={isMobileSidebarOpen}
        >
          {isMobileSidebarOpen
            ? <X className="h-4 w-4" aria-hidden="true" />
            : <Menu className="h-4 w-4" aria-hidden="true" />}
        </button>
        <div className="hidden items-center gap-2 sm:flex">
          <FolderOpen className="h-4 w-4 text-studio-purple-light" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Project:
          </span>
        </div>

        <div className="relative min-w-0 flex-1 sm:flex-none">
          <select
            value={activeProject ? activeProject.id : ''}
            onChange={(e) => {
              const selected = projects.find((p) => p.id === e.target.value);
              if (selected) onSelectProject(selected);
            }}
            className="w-full max-w-[220px] cursor-pointer truncate appearance-none rounded-lg border border-studio-border bg-studio-card py-2 pl-3 pr-8 text-xs font-semibold text-white focus:border-studio-purple focus:outline-none focus:ring-1 focus:ring-studio-purple sm:w-auto"
            aria-label="Select active project"
          >
            {projects.length === 0 && <option value="">No Projects Yet</option>}
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title} ({proj.genre})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        </div>

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-studio-purple/30 bg-studio-purple/10 px-2.5 text-xs font-medium text-studio-purple-light shadow-sm transition-all hover:bg-studio-purple hover:text-white"
          aria-label="Create a new project"
        >
          <FolderPlus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      {/* Right: Status Pills, Language, Actions */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Free-First AI Model Status Pill */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="hidden xl:flex items-center gap-2 rounded-full border border-studio-border bg-studio-card/80 px-3 py-1 text-xs cursor-pointer hover:border-studio-purple/50 transition-colors"
          title="Click to view AI Provider settings"
          aria-label="Open AI provider settings"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-studio-purple-light" />
            <span className="text-slate-300 font-medium">Free AI Suite:</span>
          </div>
          {systemHealth ? (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Local Mock
            </span>
          )}
        </button>

        {/* Bilingual Selector (English / தமிழ்) */}
        <div className="flex items-center rounded-lg border border-studio-border bg-studio-card p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              language === 'en'
                ? 'bg-studio-purple text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={language === 'en'}
            aria-label="Switch language to English"
          >
            <span>EN</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ta')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              language === 'ta'
                ? 'bg-studio-purple text-white shadow-sm font-["Noto_Sans_Tamil"]'
                : 'text-slate-400 hover:text-white'
            }`}
            aria-pressed={language === 'ta'}
            aria-label="மொழியை தமிழுக்கு மாற்று"
          >
            <span>தமிழ்</span>
          </button>
        </div>

        {/* Quick Settings Icon */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-300 hover:text-white hover:bg-studio-hover transition-colors"
          title="Configure Free AI Providers"
          aria-label="Open AI provider settings"
        >
          <Sliders className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

