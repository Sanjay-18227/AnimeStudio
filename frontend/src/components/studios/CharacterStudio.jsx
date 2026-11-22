import React, { useState } from 'react';
import {
  UserSquare2,
  Plus,
  Sparkles,
  Wand2,
  Shield,
  Layers,
  Palette,
  CheckCircle2,
  FolderOpen,
  Info
} from 'lucide-react';

export default function CharacterStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState('dossiers');

  const sampleCharacters = [
    {
      id: 1,
      name: 'Ren Kusanagi',
      role: 'Protagonist',
      age: 19,
      hair: 'Spiky midnight violet hair with silver streak',
      eyes: 'Electric cyan eyes',
      clothing: 'Black weathered cyber trench coat, high collar, fingerless tech gloves',
      ability: 'Void Flash (Zero-delay kinetic sword blink)',
      personality: 'Stoic, deeply loyal, quiet intensity'
    },
    {
      id: 2,
      name: 'Aiko Shimada',
      role: 'Companion / Hacker',
      age: 18,
      hair: 'Twin pink cyber-pigtails with glowing neon clips',
      eyes: 'Amber gold eyes',
      clothing: 'Oversized lavender streetwear hoodie with holographic emblems',
      ability: 'Signal Overclock (Neural mesh manipulation)',
      personality: 'Cheerful, sharp-witted, tactical genius'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <UserSquare2 className="h-6 w-6 text-fuchsia-400" />
            <span>{isTamil ? 'கேரக்டர் ஸ்டுடியோ' : 'Character Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-fuchsia-400">
              Phase 4 Architecture
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'நிலையான அனிம் கதாபாத்திரங்களை உருவாக்கி, காட்சிகள் முழுவதும் அவர்களின் தோற்றத்தை ஒரே மாதிரியாக வைத்திருக்கவும்'
              : 'Design persistent character dossiers with visual consistency prompt templates across all scenes.'}
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
            onClick={() => alert(isTamil ? 'கதாபாத்திர சுயவிவர உருவாக்கம் Phase 4-ல் முழுமையாக இயக்கப்படும்!' : 'Character profile generator activates in Phase 4!')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{isTamil ? 'புதிய கதாபாத்திரம்' : 'Create Character'}</span>
          </button>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sampleCharacters.map((char) => (
          <div
            key={char.id}
            className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4 hover:border-fuchsia-500/40 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-semibold text-fuchsia-300 uppercase">
                  {char.role}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{char.name}</h3>
                <span className="text-xs text-slate-400">Age: {char.age} • {char.personality}</span>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                <UserSquare2 className="h-6 w-6" />
              </div>
            </div>

            {/* Trait Tags */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 bg-studio-elevated/50 p-2 rounded-lg border border-studio-border/60">
                <span className="font-bold text-slate-300 shrink-0">Hair:</span>
                <span className="text-slate-400">{char.hair}</span>
              </div>
              <div className="flex items-start gap-2 bg-studio-elevated/50 p-2 rounded-lg border border-studio-border/60">
                <span className="font-bold text-slate-300 shrink-0">Eyes:</span>
                <span className="text-slate-400">{char.eyes}</span>
              </div>
              <div className="flex items-start gap-2 bg-studio-elevated/50 p-2 rounded-lg border border-studio-border/60">
                <span className="font-bold text-slate-300 shrink-0">Attire:</span>
                <span className="text-slate-400">{char.clothing}</span>
              </div>
              <div className="flex items-start gap-2 bg-studio-elevated/50 p-2 rounded-lg border border-studio-border/60">
                <span className="font-bold text-slate-300 shrink-0">Signature:</span>
                <span className="text-fuchsia-300">{char.ability}</span>
              </div>
            </div>

            {/* Visual Consistency Prompt Preview */}
            <div className="border-t border-studio-border/70 pt-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Locked Prompt Seed (Consistency Guarantee):
              </span>
              <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] text-slate-300 border border-studio-border">
                {`${char.name}, anime aesthetic, ${char.hair}, ${char.eyes}, wearing ${char.clothing}, masterpiece, 8k resolution`}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Callout */}
      <div className="rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-fuchsia-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-fuchsia-300">
              Visual Consistency Architecture (Phase 4):
            </h4>
            <p className="text-xs text-fuchsia-200/80 leading-relaxed">
              In Phase 4, saving characters automatically extracts persistent visual seeds and attaches them to the project database. When generating manga panels or anime images, character descriptors are automatically woven into image generation prompts to guarantee identical face, hair, and clothing across all chapters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
