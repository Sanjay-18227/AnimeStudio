import React from 'react';
import { Sparkles, Image as ImageIcon, Sliders, Palette } from 'lucide-react';

export default function ImageStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-pink-400" />
            <span>{isTamil ? 'அனிம் பட ஸ்டுடியோ' : 'Anime Image Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-slate-300">
              Phase 5
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'உரையை உயர்தர அனிம் கலைப்படைப்புகள், போர்ட்ரெய்ட்கள் மற்றும் வால்பேப்பர்களாக மாற்றவும்'
              : 'Text-to-Image AI generation powered by SDXL, Animagine XL, and FLUX.1 schnell.'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mx-auto">
          <Palette className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {isTamil ? 'அனிம் கலை உருவாக்கம் (Phase 5)' : 'Anime Art Synthesis (Phase 5)'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isTamil
              ? 'இலவச Hugging Face மற்றும் Cloudflare Workers AI மாதிரிகள் மூலம் உயர்தர அனிம் உருவங்கள் மற்றும் காட்சிகளை உருவாக்கும் ஸ்டுடியோ.'
              : 'Dedicated generation studio with anime aesthetics presets (Makoto Shinkai style, Studio Ghibli, 90s Cyberpunk, Modern Shonen, Manga Screentone).'}
          </p>
        </div>
      </div>
    </div>
  );
}

