import React, { useState } from 'react';
import {
  Film,
  Play,
  Mic,
  Subtitles,
  Video,
  Sliders,
  FolderOpen,
  Volume2,
  Download,
  FastForward,
  Sparkles
} from 'lucide-react';

export default function VideoStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  const [activeMotion, setActiveMotion] = useState('slow_zoom_in');
  const [voiceLanguage, setVoiceLanguage] = useState(language === 'ta' ? 'ta' : 'en');

  const motionPresets = [
    { id: 'slow_zoom_in', name: 'Ken Burns Zoom In', desc: 'Focuses inward to emphasize dramatic emotional beats' },
    { id: 'slow_pan_right', name: 'Slow Pan Right', desc: 'Sweeps horizontally across wide scenic landscapes' },
    { id: 'dynamic_push', name: 'Dynamic Action Push', desc: 'Rapid velocity push for shonen battle impact frames' },
    { id: 'static_fade', name: 'Atmospheric Crossfade', desc: 'Smooth cinematic dissolution between story scenes' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Film className="h-6 w-6 text-amber-400" />
            <span>{isTamil ? 'அனிம் வீடியோ ஸ்டுடியோ' : 'Anime Video Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-cyan-400">
              Phase 8 Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'ஸ்டோரிபோர்டு அனிமேஷன், கேமரா நகர்வுகள், இலவச நரம்பியல் குரல்கள், வசனங்கள் மற்றும் FFmpeg MP4 ஏற்றுமதி'
              : 'Storyboard sequencing, Ken Burns camera motion, AI neural voiceovers (EN/Tamil), and MP4 rendering.'}
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
            onClick={() =>
              alert(
                isTamil
                  ? 'வீடியோ தொகுப்பு மற்றும் FFmpeg ஏற்றுமதி Phase 8-ல் முழுமையாக இயக்கப்படும்!'
                  : 'Video rendering & FFmpeg MP4 pipeline activates in Phase 8!'
              )
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-all"
          >
            <Download className="h-4 w-4" />
            <span>{isTamil ? 'வீடியோவை ஏற்றுமதி செய்' : 'Render MP4'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Tracks Visualizer */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Multi-Track Production Timeline
              </span>
              <span className="text-xs text-slate-400 font-mono">00:00 / 00:45</span>
            </div>

            {/* Visual Cut Track */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-amber-400" />
                <span>Track 1: Visual Scenes & Artwork</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-center text-xs">
                  <span className="font-bold text-white block truncate">Scene 1: Market Rain</span>
                  <span className="text-[10px] text-slate-400">0.0s - 12.0s</span>
                </div>
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-center text-xs">
                  <span className="font-bold text-white block truncate">Scene 2: Ambush</span>
                  <span className="text-[10px] text-slate-400">12.0s - 28.0s</span>
                </div>
                <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-center text-xs">
                  <span className="font-bold text-white block truncate">Scene 3: Awakening</span>
                  <span className="text-[10px] text-slate-400">28.0s - 45.0s</span>
                </div>
              </div>
            </div>

            {/* Audio Voiceover Track */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-fuchsia-400" />
                <span>Track 2: Neural Voiceover (English & Tamil)</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 p-2.5 text-xs">
                  <span className="font-bold text-white block truncate">Ren: "The seal is broken..."</span>
                  <span className="text-[10px] text-slate-400">Edge-TTS (en-US-ChristopherNeural)</span>
                </div>
                <div className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 p-2.5 text-xs">
                  <span className="font-bold text-white block truncate">Aiko: "Get out of there now!"</span>
                  <span className="text-[10px] text-slate-400">Edge-TTS (ta-IN-PallaviNeural)</span>
                </div>
              </div>
            </div>

            {/* Subtitles Track */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Subtitles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Track 3: Burned Subtitles & Styled Fonts</span>
              </span>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                Automated SRT / ASS subtitle timing sync with anime stroke font rendering via FFmpeg.
              </div>
            </div>
          </div>

          {/* Camera Motion Selection */}
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Cinematic Camera Movement Presets
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {motionPresets.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setActiveMotion(m.id)}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                    activeMotion === m.id
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-sm'
                      : 'border-studio-border bg-studio-elevated hover:border-studio-border/80'
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-0.5">{m.name}</div>
                  <p className="text-[11px] text-slate-400">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Engine Notice & Video Specs */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Export Video Specifications
            </span>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Container & Codec:</span>
                <span className="text-white font-mono">MP4 (H.264 / AAC)</span>
              </div>
              <div className="flex justify-between">
                <span>Resolution:</span>
                <span className="text-white font-mono">1080p Full HD (1920x1080)</span>
              </div>
              <div className="flex justify-between">
                <span>Framerate:</span>
                <span className="text-white font-mono">24 fps (Anime standard)</span>
              </div>
              <div className="flex justify-between">
                <span>Audio Engine:</span>
                <span className="text-cyan-300 font-mono">Edge Neural Speech</span>
              </div>
            </div>

            <div className="rounded-xl border border-studio-border bg-studio-elevated p-3 text-[11px] text-slate-400 leading-relaxed">
              <strong>Architecture Rule:</strong> FFmpeg handles local video assembly, Ken Burns camera zooms, audio mixing, and subtitles. Generative AI video models (such as Wan 2.1) are interfaced via optional adapters.
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-6 text-center space-y-2">
            <Play className="h-8 w-8 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Interactive Storyboard Player</h4>
            <p className="text-[11px] text-slate-400">
              Live HTML5 canvas video playback and timeline scrub bar will activate in Phase 8.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
