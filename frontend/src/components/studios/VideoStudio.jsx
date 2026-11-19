import React from 'react';
import { Film, Play, Mic, Subtitles, Video, Sliders } from 'lucide-react';

export default function VideoStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <Film className="h-6 w-6 text-cyan-400" />
            <span>{isTamil ? 'அனிம் வீடியோ ஸ்டுடியோ' : 'Anime Video Studio'}</span>
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-slate-300">
              Phase 8
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'ஸ்டோரிபோர்டு அனிமேஷன், கேமரா நகர்வுகள், இலவச நரம்பியல் குரல்கள், வசனங்கள் மற்றும் FFmpeg MP4 ஏற்றுமதி'
              : 'Storyboard sequencing, Ken Burns camera motion, AI neural voiceovers (EN/Tamil), and MP4 rendering.'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-12 text-center max-w-xl mx-auto space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mx-auto">
          <Film className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">
            {isTamil ? 'அனிம் வீடியோ & குரல் தயாரிப்பு (Phase 8)' : 'Video Composition & Audio Sync (Phase 8)'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isTamil
              ? 'காட்சிகளை ஒன்றிணைத்து, கேமரா ஜூம்/பான் விளைவுகள், தானியங்கி வசனங்கள் மற்றும் தமிழ் & ஆங்கிலத்தில் இலவச AI குரல்களை சேர்த்து வீடியோவாக மாற்றும் ஸ்டுடியோ.'
              : 'Multi-track timeline for scenes, dynamic motion pacing, auto-generated subtitles, bilingual neural voiceovers via Edge TTS, and native FFmpeg export.'}
          </p>
        </div>
      </div>
    </div>
  );
}

