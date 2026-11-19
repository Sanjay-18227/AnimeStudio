import React from 'react';
import { Camera, Wand2, Upload, SplitSquareVertical } from 'lucide-react';

export default function PhotoToAnimeStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Camera className="h-6 w-6 text-amber-400" />
            <span>{isTamil ? 'புகைப்படம்-முதல்-அனிம்' : 'Photo-to-Anime Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-slate-300">
              Phase 6
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'உண்மையான புகைப்படங்களை கிளாசிக் ஜப்பானிய அனிம் கலை பாணிகளாக மாற்றவும்'
              : 'Transform real-world portraits, landscapes, and scenes into Japanese anime art styles.'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
          <Wand2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {isTamil ? 'Img2Img அனிம் உருமாற்றம் (Phase 6)' : 'Img2Img Anime Stylization (Phase 6)'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isTamil
              ? 'உங்கள் புகைப்படத்தை பதிவேற்றி, அனிம் வடிகட்டிகள், விளிம்பு கண்டறிதல் மற்றும் பாணி பரிமாற்றம் மூலம் அனிம் பாத்திரமாக மாற்றவும்.'
              : 'Upload real photos and apply SDXL img2img and line-art preprocessors to turn selfies and landscapes into iconic anime art.'}
          </p>
        </div>
      </div>
    </div>
  );
}

