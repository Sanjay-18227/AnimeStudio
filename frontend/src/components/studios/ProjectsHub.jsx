import React, { useState } from 'react';
import {
  FolderGit2,
  FolderPlus,
  Trash2,
  ExternalLink,
  BookOpen,
  UserSquare2,
  Sparkles,
  Film,
  Check,
  LoaderCircle
} from 'lucide-react';

export default function ProjectsHub({
  projects = [],
  activeProject,
  onSelectProject,
  onOpenNewProjectModal,
  onDeleteProject,
  onOpenProject,
  setActiveView,
  language = 'en'
}) {
  const isTamil = language === 'ta';
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (window.confirm(isTamil ? 'இந்த திட்டத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this project?')) {
      setDeletingId(projectId);
      try {
        await onDeleteProject(projectId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <FolderGit2 className="h-6 w-6 text-slate-300" />
            <span>{isTamil ? 'என் திட்டங்கள்' : 'My Creative Projects'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'உங்கள் அனைத்து மங்கா கதைகள், கதாபாத்திரங்கள், படங்கள் மற்றும் அனிம் திட்டங்களை நிர்வகிக்கவும்'
              : 'Manage and organize your anime series, manga storylines, persistent characters, and media assets.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewProjectModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-studio-purple to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow-purple hover:opacity-95 transition-all self-start"
        >
          <FolderPlus className="h-4 w-4" />
          <span>{isTamil ? 'புதிய திட்டம்' : 'Create New Project'}</span>
        </button>
      </div>

      {activeProject && (
        <section className="flex flex-col gap-3 rounded-xl border border-studio-purple/30 bg-studio-purple/10 p-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Current project">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-studio-purple-light">
              {isTamil ? 'செயலில் உள்ள திட்டம்' : 'Active project'}
            </p>
            <h2 className="truncate text-base font-bold text-white">{activeProject.title}</h2>
            <p className="text-xs text-slate-300">
              {activeProject.genre || 'Shonen'} · {activeProject.target_audience || 'General'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenProject(activeProject)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-studio-purple px-3 py-2 text-xs font-semibold text-white hover:bg-studio-purple-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {isTamil ? 'ஸ்டுடியோ திற' : 'Open active project'}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </section>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-studio-border bg-studio-card/50 p-12 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-studio-purple/10 text-studio-purple-light">
            <FolderGit2 className="h-7 w-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-white">
              {isTamil ? 'திட்டங்கள் எதுவும் இல்லை' : 'No Anime Projects Created Yet'}
            </h3>
            <p className="text-xs text-slate-400">
              {isTamil
                ? 'உங்கள் முதல் மங்கா அல்லது அனிம் தயாரிப்பைத் தொடங்க "புதிய திட்டம்" பொத்தானைக் கிளிக் செய்யவும்.'
                : 'Click "Create New Project" to launch your first anime universe, define characters, and generate manga chapters.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewProjectModal}
            className="flex items-center gap-2 rounded-xl bg-studio-purple px-4 py-2 text-xs font-semibold text-white hover:bg-studio-purple-dark transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            <span>{isTamil ? 'முதல் திட்டத்தைத் தொடங்குங்கள்' : 'Start First Project'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const isActive = activeProject && activeProject.id === proj.id;
            return (
              <article
                key={proj.id}
                className={`relative flex min-w-0 flex-col justify-between rounded-xl border p-4 transition-all sm:p-5 ${
                  isActive
                    ? 'border-studio-purple bg-gradient-to-b from-studio-card to-[#191D38] shadow-glow-purple'
                    : 'border-studio-border bg-studio-card hover:border-studio-purple/50 hover:bg-studio-elevated'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-semibold text-studio-cyan">
                      {proj.genre || 'Shonen'}
                    </span>
                    {isActive ? (
                      <span className="flex items-center gap-1 rounded-md border border-studio-purple/50 bg-studio-purple/20 px-2 py-0.5 text-[10px] font-bold text-studio-purple-light">
                        <Check className="h-3 w-3" />
                        {isTamil ? 'செயலில் உள்ளது' : 'Active'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        {proj.target_audience || 'General'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectProject(proj)}
                    className="max-w-full truncate text-left text-base font-bold text-white transition-colors hover:text-studio-purple-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-studio-purple"
                    aria-label={`${isTamil ? 'திட்டத்தைத் தேர்ந்தெடு' : 'Select project'}: ${proj.title}`}
                    aria-pressed={Boolean(isActive)}
                  >
                    {proj.title}
                  </button>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                    {proj.description || (isTamil ? 'விளக்கம் இல்லை' : 'No description provided')}
                  </p>

                  {/* Asset stats */}
                  <div className="grid grid-cols-4 gap-2 border-t border-studio-border/70 pt-3 mt-4 text-center">
                    <div className="rounded-lg bg-studio-elevated/70 p-1.5">
                      <div className="flex items-center justify-center text-slate-400 mb-0.5">
                        <UserSquare2 className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-bold text-white">{proj.characters_count || 0}</div>
                      <div className="text-[8px] text-slate-400 uppercase">Characters</div>
                    </div>
                    <div className="rounded-lg bg-studio-elevated/70 p-1.5">
                      <div className="flex items-center justify-center text-slate-400 mb-0.5">
                        <BookOpen className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-bold text-white">{proj.chapters_count || 0}</div>
                      <div className="text-[8px] text-slate-400 uppercase">Chapters</div>
                    </div>
                    <div className="rounded-lg bg-studio-elevated/70 p-1.5">
                      <div className="flex items-center justify-center text-slate-400 mb-0.5">
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-bold text-white">{proj.images_count || 0}</div>
                      <div className="text-[8px] text-slate-400 uppercase">Images</div>
                    </div>
                    <div className="rounded-lg bg-studio-elevated/70 p-1.5">
                      <div className="flex items-center justify-center text-slate-400 mb-0.5">
                        <Film className="h-3 w-3" />
                      </div>
                      <div className="text-xs font-bold text-white">{proj.videos_count || 0}</div>
                      <div className="text-[8px] text-slate-400 uppercase">Videos</div>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                <div className="flex items-center justify-between border-t border-studio-border/70 pt-3 mt-4 text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProject(proj);
                    }}
                    className="flex items-center gap-1 font-semibold text-studio-purple-light hover:underline"
                  >
                    <span>{isTamil ? 'ஸ்டுடியோ திற' : 'Open in Studio'}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === proj.id}
                    onClick={(e) => handleDelete(e, proj.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-400 disabled:cursor-wait disabled:opacity-60"
                    aria-label={`${isTamil ? 'திட்டத்தை நீக்கு' : 'Delete project'}: ${proj.title}`}
                    title={isTamil ? 'திட்டத்தை நீக்கு' : 'Delete project'}
                  >
                    {deletingId === proj.id
                      ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                      : <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

