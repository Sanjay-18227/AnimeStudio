import React, { useState } from 'react';
import {
  Camera,
  Wand2,
  Upload,
  SplitSquareVertical,
  Sliders,
  FolderOpen,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';

export default function PhotoToAnimeStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  const [selectedFilter, setSelectedFilter] = useState('shinkai');
  const [animeStrength, setAnimeStrength] = useState(0.75);

  const filters = [
    { id: 'shinkai', name: 'Shinkai Vibrant Sky', desc: 'Brilliant cloudscapes, deep blues and emotive golden hour sunsets' },
    { id: 'ghibli', name: 'Miyazaki Pastoral', desc: 'Hand-drawn vintage film look with lush vegetation' },
    { id: 'kyoto', name: 'Kyoto Animation Soft', desc: 'Delicate light diffusion, soft gradients, and expressive eyes' },
    { id: 'screentone', name: 'Classic Manga Ink', desc: 'Black-and-white ink hatching, screentones, and action lines' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Camera className="h-6 w-6 text-blue-400" />
            <span>{isTamil ? 'புகைப்படம்-முதல்-அனிம்' : 'Photo-to-Anime Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-amber-400">
              Phase 6 Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'உண்மையான புகைப்படங்களை கிளாசிக் ஜப்பானிய அனிம் கலை பாணிகளாக மாற்றவும்'
              : 'Transform real-world portraits, landscapes, and scenes into authentic Japanese anime art styles.'}
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
                  ? 'புகைப்படம்-முதல்-அனிம் உருமாற்றம் Phase 6-ல் SDXL Img2Img மூலம் இயக்கப்படும்!'
                  : 'Photo-to-anime pipeline activates in Phase 6 via SDXL Img2Img & edge detection!'
              )
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-all"
          >
            <Wand2 className="h-4 w-4" />
            <span>{isTamil ? 'அனிமேவாக மாற்று' : 'Transform to Anime'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Zone & Filter Picker */}
        <div className="lg:col-span-2 space-y-5">
          {/* Upload Dropzone */}
          <div className="rounded-2xl border-2 border-dashed border-studio-border bg-studio-card/70 p-8 text-center space-y-3 hover:border-amber-400/50 transition-colors cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Upload Real Photo or Selfie</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                PNG, JPG or WebP up to 10MB. Edge detection & color palette mapping applied automatically.
              </p>
            </div>
          </div>

          {/* Filter Selection */}
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Anime Aesthetic Filters
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filters.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`rounded-xl border p-3.5 cursor-pointer transition-all ${
                    selectedFilter === f.id
                      ? 'border-amber-400 bg-amber-500/10 shadow-sm'
                      : 'border-studio-border bg-studio-elevated hover:border-studio-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white">{f.name}</span>
                    {selectedFilter === f.id && <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings & Side-by-Side Preview */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Transformation Parameters
            </span>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Stylization Strength (Denoising):</span>
                <span className="text-amber-400 font-mono">{(animeStrength * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.95"
                step="0.05"
                value={animeStrength}
                onChange={(e) => setAnimeStrength(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>Preserve Original</span>
                <span>Balanced</span>
                <span>Full Anime</span>
              </div>
            </div>

            <div className="border-t border-studio-border/70 pt-3 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Edge Detection:</span>
                <span className="text-white font-mono">LineArt / Canny</span>
              </div>
              <div className="flex justify-between">
                <span>Eye Enlargement:</span>
                <span className="text-white font-mono">Subtle (Anime Norm)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-6 text-center space-y-2">
            <SplitSquareVertical className="h-8 w-8 text-blue-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Before / After Split Viewer</h4>
            <p className="text-[11px] text-slate-400">
              Interactive split-slider comparison will display your input photo alongside the stylized anime render in Phase 6.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
