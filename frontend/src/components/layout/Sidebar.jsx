import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  BookOpen,
  UserSquare2,
  Sparkles,
  Camera,
  Film,
  FolderGit2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  X
} from 'lucide-react';

export default function Sidebar({
  activeView,
  setActiveView,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onCloseMobile,
  projectCount = 0
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Studio Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-cyan-400',
      badge: 'Hub',
      badgeColor: 'bg-studio-purple/20 text-studio-purple-light border-studio-purple/30',
    },
    {
      id: 'chat',
      label: 'AI Chat Studio',
      icon: MessageSquareCode,
      iconColor: 'text-violet-400',
      badge: 'EN / தமிழ்',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'manga',
      label: 'Manga Studio',
      icon: BookOpen,
      iconColor: 'text-orange-400',
      badge: 'Pages',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'character',
      label: 'Character Studio',
      icon: UserSquare2,
      iconColor: 'text-pink-400',
      badge: 'Profiles',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'image',
      label: 'Anime Image Studio',
      icon: Sparkles,
      iconColor: 'text-green-400',
      badge: 'SDXL / FLUX',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'photo_to_anime',
      label: 'Photo-to-Anime',
      icon: Camera,
      iconColor: 'text-blue-400',
      badge: 'Img2Img',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'video',
      label: 'Anime Video Studio',
      icon: Film,
      iconColor: 'text-amber-400',
      badge: 'Timeline',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'projects',
      label: 'My Projects',
      icon: FolderGit2,
      iconColor: 'text-slate-300',
      badge: projectCount > 0 ? String(projectCount) : '0',
      badgeColor: 'bg-slate-700/60 text-slate-300 border-slate-600/40',
    },
  ];

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
        />
      )}
      <aside
        id="studio-sidebar"
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-studio-border bg-black transition-transform duration-300 ease-in-out select-none md:relative md:z-20 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-studio-border px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center">
              <Flame className="h-5 w-5 text-violet-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold tracking-wide text-white text-base leading-tight">
                ANIMESTUDIO
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                AI Production OS
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center">
            <Flame className="h-5 w-5 text-violet-400" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-400 hover:text-white hover:bg-studio-hover transition-colors ${
            isCollapsed ? 'hidden' : 'flex'
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-400 hover:text-white md:hidden"
          aria-label="Close navigation menu"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        <div className="px-2 pb-1.5">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Creative Studios
            </span>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-black text-white border-studio-border'
                  : 'text-slate-400 hover:bg-studio-card hover:text-slate-200 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <Icon className={`h-4 w-4 ${item.iconColor}`} />
              </div>

              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="truncate text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1.5 shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer & Settings */}
      <div className="border-t border-studio-border p-3 space-y-2">
        <button
          type="button"
          onClick={() => setActiveView('settings')}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
            activeView === 'settings'
              ? 'bg-studio-purple/20 text-white border border-studio-purple/40'
              : 'text-slate-400 hover:bg-studio-card hover:text-white border border-transparent'
          }`}
          title="AI Providers & Settings"
          aria-current={activeView === 'settings' ? 'page' : undefined}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-studio-card text-slate-400">
            <Settings className="h-4 w-4 text-violet-400" />
          </div>
          {!isCollapsed && <span className="truncate">Settings & Providers</span>}
        </button>

        {!isCollapsed ? (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full mono-visual"></span>
              <span className="text-[11px] font-semibold text-emerald-400">Free-First Active</span>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      </aside>
    </>
  );
}

