import React from 'react';
import { BookOpen, Plus, LayoutGrid, FileText, Download } from 'lucide-react';

export default function MangaStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-studio-cyan" />
            <span>{isTamil ? 'மங்கா ஸ்டுடியோ' : 'Manga Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-slate-300">
              Phase 3
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'மங்கா கதைகளை எழுதுங்கள், காட்சிகளைப் பிரியுங்கள், மற்றும் காமிக் பக்க அமைப்புகளை உருவாக்குங்கள்'
              : 'Generate manga story arcs, chapters, scene breakdowns, dialogues, and comic grid layouts.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-2 rounded-xl bg-studio-purple/50 px-4 py-2 text-xs font-semibold text-white cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>{isTamil ? 'புதிய அத்தியாயம்' : 'New Chapter'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <FileText className="h-4 w-4 text-studio-purple-light" />
            <span>{isTamil ? 'அத்தியாயங்கள் & கதைகள்' : 'Story & Chapter Outline'}</span>
          </div>
          <p className="text-xs text-slate-400">
            {isTamil
              ? 'Phase 3-ல் AI மூலம் தானியங்கி கதை வரிசை மற்றும் அத்தியாயங்கள் உருவாக்கப்படும்.'
              : 'Phase 3 activates AI story synthesis, episode scripting, and multi-chapter progression.'}
          </p>
          <div className="rounded-xl border border-dashed border-studio-border p-4 text-center text-xs text-slate-500">
            {activeProject ? `Project: ${activeProject.title}` : 'Select a project to view chapters'}
          </div>
        </div>

        <div className="rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <LayoutGrid className="h-4 w-4 text-studio-cyan" />
            <span>{isTamil ? 'பேனல் தளவமைப்பு & கிரிட்' : 'Manga Comic Grid Layouts'}</span>
          </div>
          <p className="text-xs text-slate-400">
            {isTamil
              ? 'பாரம்பரிய ஜப்பானிய மங்கா 4-பேனல் மற்றும் டைனமிக் ஷோனென் பக்க தளவமைப்புகள்.'
              : 'Traditional Japanese right-to-left layout grids, action splash panels, and dialogue bubbles.'}
          </p>
          <div className="rounded-xl border border-dashed border-studio-border p-4 text-center text-xs text-slate-500">
            Grid composer engine coming in Phase 3 & 7
          </div>
        </div>

        <div className="rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Download className="h-4 w-4 text-emerald-400" />
            <span>{isTamil ? 'மங்கா ஏற்றுமதி' : 'Publish & Export'}</span>
          </div>
          <p className="text-xs text-slate-400">
            {isTamil
              ? 'அச்சிடக்கூடிய PDF, PNG அல்லது டிஜிட்டல் மங்கா கோப்புகளாக ஏற்றுமதி செய்யுங்கள்.'
              : 'Export print-ready PDF comic books, high-res PNG pages, or webtoon vertical scrolls.'}
          </p>
          <div className="rounded-xl border border-dashed border-studio-border p-4 text-center text-xs text-slate-500">
            Export pipelines ready in Phase 7 & 9
          </div>
        </div>
      </div>
    </div>
  );
}

