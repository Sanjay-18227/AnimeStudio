import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Sliders,
  Palette,
  FolderOpen,
  Wand2,
  Copy,
  Check,
  Download,
  Ratio
} from 'lucide-react';

export default function ImageStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  const [prompt, setPrompt] = useState(
    'A breathtaking cyberpunk samurai standing on a neon rain-slicked Tokyo rooftop, glowing violet katana drawn, dramatic volumetric lighting, Makoto Shinkai aesthetic, 8k resolution'
  );
  const [selectedStyle, setSelectedStyle] = useState('shinkai');
  const [selectedRatio, setSelectedRatio] = useState('16:9');
  const [copied, setCopied] = useState(false);

  const stylePresets = [
    { id: 'shinkai', name: 'Makoto Shinkai', desc: 'Vibrant celestial skies, lens flare, emotive atmosphere' },
    { id: 'ghibli', name: 'Studio Ghibli', desc: 'Hand-painted watercolor warmth, lush landscapes' },
    { id: 'cyberpunk', name: '90s Cyberpunk', desc: 'Retro-futuristic neon, dark alleys, grain aesthetic' },
    { id: 'shonen', name: 'Modern Shonen', desc: 'Bold ink lines, high action, particle effects' },
    { id: 'screentone', name: 'Manga Screentone', desc: 'Monochrome halftone dots, crisp ink hatch lines' }
  ];

  const aspectRatios = ['1:1 (Square)', '16:9 (Landscape)', '9:16 (Portrait)', '3:4 (Classic Manga)'];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-pink-400" />
            <span>{isTamil ? 'அனிம் பட ஸ்டுடியோ' : 'Anime Image Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-pink-400">
              Phase 5 Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'உரையை உயர்தர அனிம் கலைப்படைப்புகள், போர்ட்ரெய்ட்கள் மற்றும் வால்பேப்பர்களாக மாற்றவும்'
              : 'Text-to-Image AI generation powered by FLUX.1 schnell, SDXL, and Animagine XL free inference.'}
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
                  ? 'பட உருவாக்கம் Phase 5-ல் Cloudflare மற்றும் Hugging Face மூலம் இணைக்கப்படும்!'
                  : 'Image generation engine activates in Phase 5 via Cloudflare Workers AI & Hugging Face!'
              )
            }
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-all"
          >
            <Wand2 className="h-4 w-4" />
            <span>{isTamil ? 'படத்தை உருவாக்கு' : 'Generate Artwork'}</span>
          </button>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Prompt Builder & Style Presets */}
        <div className="lg:col-span-2 space-y-5">
          {/* Prompt Box */}
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Creative Anime Prompt
              </label>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1 text-[11px] font-semibold text-studio-purple-light hover:underline"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-xl border border-studio-border bg-studio-elevated p-3 text-xs text-white focus:border-pink-500 focus:outline-none resize-none leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
              <span>Free Inference: <strong>Hugging Face Animagine XL / Cloudflare FLUX.1</strong></span>
              <span>Negative prompt filtering enabled</span>
            </div>
          </div>

          {/* Style Presets Grid */}
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Anime Style Aesthetic Presets
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stylePresets.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedStyle === style.id
                      ? 'border-pink-500 bg-pink-500/10 shadow-sm'
                      : 'border-studio-border bg-studio-elevated hover:border-studio-border/80'
                  }`}
                >
                  <div className="font-bold text-xs text-white mb-0.5">{style.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2">{style.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Generation Settings & Canvas Preview */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Canvas Dimensions & Aspect Ratio
            </span>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedRatio(ratio)}
                  className={`rounded-lg border p-2 text-center text-xs font-semibold transition-colors ${
                    selectedRatio === ratio
                      ? 'border-pink-500 bg-pink-500/20 text-white'
                      : 'border-studio-border bg-studio-elevated text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <div className="border-t border-studio-border/70 pt-3 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Sampling Steps:</span>
                <span className="text-white font-mono">28 (Euler a)</span>
              </div>
              <div className="flex justify-between">
                <span>CFG Guidance Scale:</span>
                <span className="text-white font-mono">7.0</span>
              </div>
              <div className="flex justify-between">
                <span>Seed Mode:</span>
                <span className="text-pink-300 font-mono">Random (-1)</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-6 text-center space-y-2">
            <Palette className="h-8 w-8 text-pink-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">Live Canvas Render</h4>
            <p className="text-[11px] text-slate-400">
              Free-first SDXL and FLUX inference will render your generated character portraits and wallpapers directly here in Phase 5.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
