import React from 'react';
import {
  FolderPlus,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sliders,
  ChevronDown
} from 'lucide-react';

export default function Header({
  activeProject,
  projects = [],
  onSelectProject,
  onOpenNewProjectModal,
  language,
  setLanguage,
  systemHealth,
  onOpenSettings
}) {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-studio-border bg-[#0C0E1B]/80 px-6 backdrop-blur-md">
      {/* Left: Active Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-studio-purple-light" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Project:
          </span>
        </div>

        <div className="relative">
          <select
            value={activeProject ? activeProject.id : ''}
            onChange={(e) => {
              const selected = projects.find((p) => p.id === e.target.value);
              if (selected) onSelectProject(selected);
            }}
            className="appearance-none rounded-lg border border-studio-border bg-studio-card py-1.5 pl-3 pr-8 text-xs font-semibold text-white focus:border-studio-purple focus:outline-none focus:ring-1 focus:ring-studio-purple cursor-pointer max-w-[220px] truncate"
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
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-1.5 rounded-lg border border-studio-purple/30 bg-studio-purple/10 px-2.5 py-1.5 text-xs font-medium text-studio-purple-light hover:bg-studio-purple hover:text-white transition-all shadow-sm"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Right: Status Pills, Language, Actions */}
      <div className="flex items-center gap-3">
        {/* Free-First AI Model Status Pill */}
        <div
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-2 rounded-full border border-studio-border bg-studio-card/80 px-3 py-1 text-xs cursor-pointer hover:border-studio-purple/50 transition-colors"
          title="Click to view AI Provider settings"
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
        </div>

        {/* Bilingual Selector (English / தமிழ்) */}
        <div className="flex items-center rounded-lg border border-studio-border bg-studio-card p-0.5 text-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              language === 'en'
                ? 'bg-studio-purple text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>EN</span>
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition-colors ${
              language === 'ta'
                ? 'bg-studio-purple text-white shadow-sm font-["Noto_Sans_Tamil"]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>தமிழ்</span>
          </button>
        </div>

        {/* Quick Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-300 hover:text-white hover:bg-studio-hover transition-colors"
          title="Configure Free AI Providers"
        >
          <Sliders className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

