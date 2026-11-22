import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  LayoutGrid,
  FileText,
  Download,
  Sparkles,
  Layers,
  ChevronRight,
  SplitSquareVertical,
  Sliders,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export default function MangaStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState('outline');
  const [selectedLayout, setSelectedLayout] = useState('4koma');

  const layouts = [
    { id: '4koma', name: '4-Koma Classic', panels: 4, desc: 'Vertical 4-panel gag & slice-of-life' },
    { id: 'shonen_action', name: 'Shonen Dynamic', panels: 5, desc: 'Diagonal action splash with focal point' },
    { id: 'webtoon', name: 'Webtoon Vertical', panels: 6, desc: 'Continuous smartphone vertical scroll' },
    { id: 'seinen_grid', name: 'Seinen Dramatic', panels: 7, desc: 'Complex asymmetric storytelling panels' }
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-studio-cyan" />
            <span>{isTamil ? 'மங்கா ஸ்டுடியோ' : 'Manga Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-studio-cyan">
              Phase 3 Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'முழு மங்கா கதைக்கரு, அத்தியாயங்கள், காட்சிகள், வசனங்கள் மற்றும் காமிக் பக்க அமைப்புகளை உருவாக்குங்கள்'
              : 'Generate complete manga story arcs, chapters, scene breakdowns, dialogues, and comic grid layouts.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-studio-border bg-studio-card px-3 py-1.5 text-xs flex items-center gap-2">
            <FolderOpen className="h-3.5 w-3.5 text-studio-purple-light" />
            <span className="text-slate-300 font-semibold truncate max-w-[150px]">
              {activeProject ? activeProject.title : 'No Project Active'}
            </span>
          </div>

          <button
            onClick={() => alert(isTamil ? 'மங்கா அத்தியாய உருவாக்கம் Phase 3-ல் முழுமையாக இணைக்கப்படும்!' : 'Manga chapter synthesis engine activates in Phase 3!')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-studio-purple to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-purple hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{isTamil ? 'புதிய அத்தியாயம்' : 'New Chapter'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-studio-border gap-2">
        <button
          onClick={() => setActiveTab('outline')}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'outline'
              ? 'border-studio-cyan text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4 text-studio-cyan" />
          <span>{isTamil ? 'கதை & அத்தியாயங்கள்' : 'Story & Chapter Outline'}</span>
        </button>

        <button
          onClick={() => setActiveTab('grid')}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'grid'
              ? 'border-studio-cyan text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="h-4 w-4 text-studio-purple-light" />
          <span>{isTamil ? 'பேனல் தளவமைப்பு கிரிட்' : 'Comic Panel Grids'}</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'export'
              ? 'border-studio-cyan text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="h-4 w-4 text-emerald-400" />
          <span>{isTamil ? 'வெளியீடு & ஏற்றுமதி' : 'Export & Print PDF'}</span>
        </button>
      </div>

      {/* Main Workspace Area */}
      {activeTab === 'outline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chapter Outline Preview */}
          <div className="lg:col-span-2 rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-studio-cyan" />
                <h3 className="text-sm font-bold text-white">
                  {isTamil ? 'அத்தியாயம் 1: விதியின் விழிப்புணர்வு' : 'Chapter 1: The Awakening of Fate'}
                </h3>
              </div>
              <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-semibold text-studio-purple-light">
                {activeProject ? activeProject.genre : 'Shonen'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-studio-elevated/50 rounded-xl p-4 border border-studio-border">
              {activeProject?.description ||
                'In Neo-Edo year 2188, ancient spirit katanas awaken in response to an impending cybernetic eclipse. A rogue courier discovers a dormant blade that syncs only with his neural signature.'}
            </p>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {isTamil ? 'காட்சி வரிசை (Storyboard Breakdown)' : 'Scene Sequence (Storyboard Breakdown)'}
              </span>

              {[
                { scene: 1, title: 'The Midnight Cyber Market', action: 'Crowded neon rain street; protagonist receives a sealed antique lockbox.', panels: 4 },
                { scene: 2, title: 'The Ambush in Sector 7', action: 'Shadow cyborgs drop from hovercrafts; lockbox activates violet luminescence.', panels: 6 },
                { scene: 3, title: 'Blade Awakening (Cliffhanger)', action: 'Double-page splash: The spirit blade manifests its celestial dragon aura.', panels: 2 }
              ].map((s) => (
                <div
                  key={s.scene}
                  className="rounded-xl border border-studio-border bg-studio-elevated/40 p-3.5 flex items-start justify-between gap-3 hover:border-studio-purple/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-studio-cyan">Scene {s.scene}:</span>
                      <span className="text-xs font-semibold text-white">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{s.action}</p>
                  </div>
                  <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-[10px] font-mono text-slate-300 shrink-0">
                    {s.panels} Panels
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chapter Controls & Dialogue Inspector */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {isTamil ? 'AI மங்கா ஜெனரேட்டர் (Phase 3)' : 'AI Manga Synthesis (Phase 3)'}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Phase 3 activates structured JSON screenplay breakdowns directly into page panel scripts with speech bubbles and sound effects (Onomatopoeia / ドン!).
              </p>
              <div className="rounded-xl border border-dashed border-studio-border p-3 text-center text-xs text-studio-cyan bg-studio-elevated/30">
                Connected to Active Project Context
              </div>
            </div>

            <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                {isTamil ? 'ஜப்பானிய ஒலிக்குறிப்புகள்' : 'Manga SFX / Sound Effects'}
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['ドドド (Rumble)', 'ゴゴゴ (Menacing)', 'バキッ (Impact)', 'スパッ (Slash)', 'ドキッ (Heartbeat)'].map((sfx) => (
                  <span
                    key={sfx}
                    className="rounded-lg border border-studio-border bg-studio-elevated px-2 py-1 text-[11px] text-slate-300 font-mono"
                  >
                    {sfx}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comic Panel Grids Tab */}
      {activeTab === 'grid' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {layouts.map((l) => (
              <div
                key={l.id}
                onClick={() => setSelectedLayout(l.id)}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedLayout === l.id
                    ? 'border-studio-cyan bg-studio-elevated shadow-glow-cyan'
                    : 'border-studio-border bg-studio-card hover:border-studio-border/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">{l.name}</span>
                  {selectedLayout === l.id && <CheckCircle2 className="h-4 w-4 text-studio-cyan" />}
                </div>
                <p className="text-[11px] text-slate-400">{l.desc}</p>
                <div className="mt-3 text-[10px] font-mono text-studio-purple-light uppercase">
                  {l.panels} Panels Grid
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-8 text-center max-w-lg mx-auto space-y-2">
            <LayoutGrid className="h-8 w-8 text-studio-cyan mx-auto" />
            <h4 className="text-sm font-bold text-white">Visual Grid Composer</h4>
            <p className="text-xs text-slate-400">
              Interactive panel resizing, speech bubble drag-and-drop, and screentone overlay rendering will be fully unlocked in Phase 7.
            </p>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="rounded-2xl border border-studio-border bg-studio-card p-8 text-center max-w-md mx-auto space-y-4">
          <Download className="h-10 w-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Manga Page & Tankōbon Export</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Export ready-to-print B5/A5 Manga PDF bundles, high-resolution PNG image sequences, or digital webtoon packages.
          </p>
          <div className="pt-2">
            <button
              onClick={() => alert('Exporting will be enabled once manga pages are rendered in Phase 7 & 9!')}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              Export Preview Bundle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
