import React from 'react';
import { UserSquare2, Plus, Sparkles, Wand2, Shield } from 'lucide-react';

export default function CharacterStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <UserSquare2 className="h-6 w-6 text-fuchsia-400" />
            <span>{isTamil ? 'கேரக்டர் ஸ்டுடியோ' : 'Character Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-slate-300">
              Phase 4
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'நிலையான அனிம் கதாபாத்திரங்களை உருவாக்கி, காட்சிகள் முழுவதும் அவர்களின் தோற்றத்தை ஒரே மாதிரியாக வைத்திருக்கவும்'
              : 'Design persistent character dossiers with visual consistency prompt templates across all scenes.'}
          </p>
        </div>

        <button
          disabled
          className="flex items-center gap-2 rounded-xl bg-studio-purple/50 px-4 py-2 text-xs font-semibold text-white cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>{isTamil ? 'புதிய கதாபாத்திரம்' : 'Create Character'}</span>
        </button>
      </div>

      <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 mx-auto">
          <Wand2 className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {isTamil ? 'நிலையான பாத்திர வடிவமைப்பு (Phase 4)' : 'Persistent Character Profiles (Phase 4)'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isTamil
              ? 'பெயர், வயது, சிகை அலங்காரம், கண்கள், ஆடைகள், சண்டை பாணி மற்றும் பின்னணி விவரங்களை நீங்கள் சேமிக்க முடியும். அனைத்து அத்தியாயங்களிலும் ஒரே முகம் மற்றும் தோற்றம் பாதுகாக்கப்படும்!'
              : 'Define character facial features, hairstyles, signatures, outfits, and abilities. Generates locked prompt seeds to guarantee character fidelity across multiple scene renders.'}
          </p>
        </div>
      </div>
    </div>
  );
}

