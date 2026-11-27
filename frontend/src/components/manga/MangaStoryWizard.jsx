import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  User,
  Users,
  Compass,
  Clock,
  Palette,
  Flag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RotateCw,
  Flame,
  Layers,
  Wand2,
  Film
} from 'lucide-react';
import { generateMangaStory } from '../../services/api';

export default function MangaStoryWizard({
  isOpen,
  onClose,
  activeProject,
  onStoryCreated,
  language = 'en'
}) {
  const isTamil = language === 'ta';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State with Sensible Defaults
  const [formData, setFormData] = useState({
    title: '',
    genre: 'Action',
    subgenre: '',
    premise: '',
    protagonist: '',
    supporting_characters: '',
    setting: '',
    time_period: '',
    art_direction: '',
    target_audience: 'Shonen',
    chapter_count: 3,
    language: language === 'ta' ? 'ta' : 'en',
    tone: 'Dramatic',
    ending_type: 'Cliffhanger'
  });

  const genres = [
    'Action',
    'Fantasy',
    'Adventure',
    'Sci-fi',
    'Supernatural',
    'Thriller',
    'Mystery',
    'Horror',
    'Romance',
    'Slice of life',
    'Comedy'
  ];

  const presets = [
    {
      label: isTamil ? 'சைபர்பங்க் சாமுராய்' : 'Cyberpunk Samurai',
      genre: 'Sci-fi',
      subgenre: 'Cyberpunk Action',
      title: 'Neon Ronin: Zero Resonance',
      premise: 'A rogue cybernetic courier in Neo-Tokyo awakens a sealed spirit blade that feeds on electrical currents.',
      protagonist: 'Ren Kusanagi — Cynical hacker courier with glowing violet cybernetic optics.',
      supporting: 'Aiko — Rebellion netrunner; Kenjiro — Elite corporate enforcer wielding plasma dual blades.',
      setting: 'Neo-Tokyo Sector 4 Rain Alleys & Spire Citadels',
      time_period: 'Year 2188',
      art_direction: 'Volumetric rain, neon reflection contrast, heavy ink action splash lines',
      tone: 'Dramatic and High Stakes',
      ending_type: 'Cliffhanger'
    },
    {
      label: isTamil ? 'இருண்ட மாய அகாடமி' : 'Dark Fantasy Academy',
      genre: 'Fantasy',
      subgenre: 'Dark Supernatural',
      title: 'Grimoire of the Eclipse',
      premise: 'At a prestigious imperial sorcery academy, a talentless student finds an forbidden grimoire written in ancient blood.',
      protagonist: 'Sora Valken — Underdog scholar with zero innate mana who can copy cursed incantations.',
      supporting: 'Lady Vespera — Top noble spellcaster; Professor Raven — Mysterious shadow archivist.',
      setting: 'Grand Citadel of Arcanum & The Sunken Catacombs',
      time_period: 'Neo-Victorian Magitech Era',
      art_direction: 'Intricate gothic architecture, glowing runic circles, dynamic spell impact frames',
      tone: 'Mysterious and Epic',
      ending_type: 'Epic Climax'
    },
    {
      label: isTamil ? 'நகர ஆவி துப்பறியும் நபர்' : 'Urban Spirit Detective',
      genre: 'Supernatural',
      subgenre: 'Urban Mystery Thriller',
      title: 'Yokai Bureau 0',
      premise: 'A detective who can perceive spirits uncovers a syndicate harvesting phantom energy across midnight subway lines.',
      protagonist: 'Daisuke Jin — Chain-smoking private investigator with spiritual third-eye tattoo.',
      supporting: 'Kitsune informant Yuki; Chief Inspector Saito.',
      setting: 'Shinjuku Night District & Subterranean Spirit Lines',
      time_period: 'Contemporary Modern',
      art_direction: 'Noir film shadows, Makoto Shinkai celestial skies, vibrant spectral apparitions',
      tone: 'Suspenseful and Gritty',
      ending_type: 'Plot Twist'
    }
  ];

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      title: preset.title,
      genre: preset.genre,
      subgenre: preset.subgenre,
      premise: preset.premise,
      protagonist: preset.protagonist,
      supporting_characters: preset.supporting,
      setting: preset.setting,
      time_period: preset.time_period,
      art_direction: preset.art_direction,
      tone: preset.tone,
      ending_type: preset.ending_type
    }));
  };

  const handleSubmit = async () => {
    if (!activeProject) {
      setError(isTamil ? 'செயலில் உள்ள திட்டத்தைத் தேர்ந்தெடுக்கவும்' : 'Please select or create an active project first.');
      return;
    }
    if (!formData.premise.trim()) {
      setError(isTamil ? 'கதைக்கருவை (Premise) உள்ளிடவும்' : 'Story premise is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        project_id: activeProject.id,
        ...formData,
        chapter_count: parseInt(formData.chapter_count) || 3
      };

      const createdStory = await generateMangaStory(payload);
      if (onStoryCreated) {
        onStoryCreated(createdStory);
      }
      onClose();
    } catch (err) {
      console.error('Failed to generate manga story:', err);
      setError(err.message || 'Failed to generate manga story. Check provider settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 animate-in fade-in duration-150 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manga-story-wizard-title"
        className="relative flex max-h-[calc(100dvh-2rem)] min-h-0 w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-studio-border bg-studio-card shadow-2xl sm:max-h-[92vh]"
      >
        {/* Wizard Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-studio-border bg-[#0C0E1B] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-studio-cyan to-blue-600 text-white shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="manga-story-wizard-title" className="flex flex-wrap items-center gap-2 text-base font-bold text-white">
                <span>{isTamil ? 'AI மங்கா கதை உருவாக்கம்' : 'AI Manga Story Creation Wizard'}</span>
                <span className="shrink-0 rounded-md border border-studio-cyan/30 bg-studio-cyan/10 px-2 py-0.5 text-[10px] font-bold text-studio-cyan">
                  Phase 3
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isTamil
                  ? 'உங்கள் யோசனையை அத்தியாயங்கள், காட்சிகள் மற்றும் படங்களாக மாற்றும் AI எஞ்சின்'
                  : 'Synthesize user ideas into publication-ready structured comic chapters and scene scripts'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-studio-hover hover:text-white"
            aria-label={isTamil ? 'சாளரத்தை மூடு' : 'Close manga story wizard'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="flex shrink-0 flex-col items-start gap-2 border-b border-studio-border bg-studio-elevated/40 px-4 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-6">
            <div
              onClick={() => !loading && setStep(1)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                step === 1 ? 'font-bold text-studio-cyan' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step === 1 ? 'bg-studio-cyan text-black font-bold' : 'bg-studio-card text-slate-400'
              }`}>
                1
              </span>
              <span>{isTamil ? 'கரு & வகை' : 'Premise & Genre'}</span>
            </div>

            <div
              onClick={() => !loading && setStep(2)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                step === 2 ? 'font-bold text-studio-cyan' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step === 2 ? 'bg-studio-cyan text-black font-bold' : 'bg-studio-card text-slate-400'
              }`}>
                2
              </span>
              <span>{isTamil ? 'பாத்திரங்கள் & உலகம்' : 'Characters & World'}</span>
            </div>

            <div
              onClick={() => !loading && setStep(3)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                step === 3 ? 'font-bold text-studio-cyan' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                step === 3 ? 'bg-studio-cyan text-black font-bold' : 'bg-studio-card text-slate-400'
              }`}>
                3
              </span>
              <span>{isTamil ? 'பாணி & கட்டமைப்பு' : 'Art Style & Ending'}</span>
            </div>
          </div>

          <span className="max-w-full break-words text-[11px] font-mono text-slate-400 sm:text-right">
            {activeProject ? `Project: ${activeProject.title}` : 'No active project'}
          </span>
        </div>

        {/* Wizard Body */}
        <div className="min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-slate-400 hover:text-white">×</button>
            </div>
          )}

          {/* Quick Presets Bar */}
          <div className="rounded-xl border border-studio-border bg-studio-elevated/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-studio-cyan" />
              <span>{isTamil ? 'விரைவு மாதிரிகள்:' : 'Quick Concept Presets:'}</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="rounded-lg border border-studio-border bg-studio-card px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:border-studio-cyan hover:text-white transition-colors"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* STEP 1: PREMISE & GENRE */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'கதை தலைப்பு (Story Title)' : 'Manga Title'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Neon Ronin: Zero Resonance"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'முதன்மை வகை (Main Genre)' : 'Primary Genre'}
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'துணை வகை (Subgenre)' : 'Subgenre / Tropes'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cyberpunk Action, Isekai, Dark Fantasy"
                    value={formData.subgenre}
                    onChange={(e) => setFormData({ ...formData, subgenre: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'இலக்கு பார்வையாளர்கள் (Target Audience)' : 'Target Demographic'}
                  </label>
                  <select
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  >
                    <option value="Shonen">Shonen (High action, perseverance, camaraderie)</option>
                    <option value="Seinen">Seinen (Complex, psychological, mature themes)</option>
                    <option value="Shojo">Shojo (Emotion-driven, romantic, stylistic)</option>
                    <option value="Josei">Josei (Adult slice of life, realism)</option>
                    <option value="General">General Manga Audience</option>
                  </select>
                </div>
              </div>

              {/* Story Premise */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-white">
                    {isTamil ? 'கதைக்கரு / ஆரம்ப யோசனை (Story Premise)' : 'Story Premise & Core Hook'} *
                  </label>
                  <span className="text-[10px] text-slate-400">Required</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe the inciting incident, central conflict, or high-concept hook... (e.g. In 2188, spirit katanas awaken in response to a celestial eclipse. A rogue courier accidentally unlocks the void blade...)"
                  value={formData.premise}
                  onChange={(e) => setFormData({ ...formData, premise: e.target.value })}
                  className="w-full rounded-xl border border-studio-border bg-studio-elevated p-3 text-xs text-white focus:border-studio-cyan focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'அத்தியாயங்களின் எண்ணிக்கை' : 'Number of Chapters to Generate'}
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setFormData({ ...formData, chapter_count: cnt })}
                        className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-colors ${
                          formData.chapter_count === cnt
                            ? 'border-studio-cyan bg-studio-cyan/20 text-white'
                            : 'border-studio-border bg-studio-elevated text-slate-400 hover:text-white'
                        }`}
                      >
                        {cnt} {cnt === 1 ? 'Chapter' : 'Chapters'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'மொழி (Language)' : 'Story Script Language'}
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  >
                    <option value="en">English (Official Manga Screenplay)</option>
                    <option value="ta">தமிழ் (Tamil Dialogues & Narrative)</option>
                    <option value="ja">日本語 (Japanese Dialogues)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: CHARACTERS & SETTING */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  {isTamil ? 'முக்கிய கதாநாயகன் (Main Protagonist)' : 'Main Protagonist Profile'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ren Kageyama — 19, spiky violet hair, electric cyan glowing eyes, weathered duster coat. Stoic, protective, wielding the Void Blade."
                  value={formData.protagonist}
                  onChange={(e) => setFormData({ ...formData, protagonist: e.target.value })}
                  className="w-full rounded-xl border border-studio-border bg-studio-elevated p-2.5 text-xs text-white focus:border-studio-cyan focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  {isTamil ? 'துணை பாத்திரங்கள் & எதிரிகள்' : 'Supporting Characters, Rivals & Antagonists'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Kenjiro — Rival cyber-samurai with crimson cybernetic arm; Aiko — Streetwise hacker companion."
                  value={formData.supporting_characters}
                  onChange={(e) => setFormData({ ...formData, supporting_characters: e.target.value })}
                  className="w-full rounded-xl border border-studio-border bg-studio-elevated p-2.5 text-xs text-white focus:border-studio-cyan focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'முதன்மை களம் / இருப்பிடம்' : 'Primary Setting & World'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Neo-Tokyo Rain Alleys & Spire Citadels"
                    value={formData.setting}
                    onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'காலம் (Time Period)' : 'Time Period'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Year 2188 / Feudal Edo Period / Contemporary"
                    value={formData.time_period}
                    onChange={(e) => setFormData({ ...formData, time_period: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  {isTamil ? 'கதை தொனி (Story Tone)' : 'Emotional Atmosphere / Tone'}
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                >
                  <option value="Dramatic and High Stakes">Dramatic and High Stakes (Classic Shonen Tension)</option>
                  <option value="Dark, Gritty and Psychological">Dark, Gritty and Psychological (Seinen)</option>
                  <option value="Inspiring and Triumphant">Inspiring and Triumphant (Heroic Journey)</option>
                  <option value="Mysterious and Suspenseful">Mysterious and Suspenseful (Thriller / Noir)</option>
                  <option value="Warm, Whimsical and Lighthearted">Warm, Whimsical and Lighthearted (Slice of Life)</option>
                  <option value="Epic and Mythological">Epic and Mythological (Grand Fantasy)</option>
                </select>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: ART DIRECTION & ENDING */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  {isTamil ? 'கலை இயக்கம் & காட்சி பாணி' : 'Manga Art Direction & Visual Style'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. High contrast black ink lines, Makoto Shinkai volumetric lighting, dramatic screentone halftones, wide action splash panels."
                  value={formData.art_direction}
                  onChange={(e) => setFormData({ ...formData, art_direction: e.target.value })}
                  className="w-full rounded-xl border border-studio-border bg-studio-elevated p-2.5 text-xs text-white focus:border-studio-cyan focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'முடிவு வகை (Ending Type)' : 'Story Arc Resolution / Ending'}
                  </label>
                  <select
                    value={formData.ending_type}
                    onChange={(e) => setFormData({ ...formData, ending_type: e.target.value })}
                    className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-cyan focus:outline-none"
                  >
                    <option value="Cliffhanger">Cliffhanger Hook (Leaves reader eager for next arc)</option>
                    <option value="Epic Climax">Epic Climax (All threads collide in massive battle)</option>
                    <option value="Bittersweet Resolution">Bittersweet Resolution (Emotional sacrifice)</option>
                    <option value="Triumphant Victory">Triumphant Victory (Protagonist awakens full potential)</option>
                    <option value="Plot Twist">Major Plot Twist (Nothing was as it seemed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1">
                    {isTamil ? 'திட்ட நினைவக இணைப்பு' : 'Phase 2 Project Lore Memory'}
                  </label>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-300">
                    Active project lore and character canon will automatically be injected for continuity.
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="rounded-xl border border-studio-border bg-studio-elevated/80 p-4 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {isTamil ? 'உற்பத்தி சுருக்கம்' : 'Production Summary'}
                </span>
                <div className="text-xs text-slate-300 space-y-1">
                  <div><strong>Title:</strong> {formData.title || 'Untitled Epic'}</div>
                  <div><strong>Genre:</strong> {formData.genre} ({formData.subgenre || 'Standard'}) • {formData.target_audience}</div>
                  <div><strong>Scope:</strong> {formData.chapter_count} full chapters with panel breakdowns</div>
                  <div><strong>Language:</strong> {formData.language.toUpperCase()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-studio-border bg-[#0C0E1B] px-4 py-3.5 sm:px-6">
          {step > 1 ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-studio-border bg-studio-card px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isTamil ? 'முந்தையது' : 'Back'}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-studio-border bg-studio-card px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {isTamil ? 'ரத்து செய்' : 'Cancel'}
            </button>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2">
            {step < 3 ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-studio-cyan px-5 py-2 text-xs font-bold text-black hover:bg-cyan-400 transition-colors"
              >
                <span>{isTamil ? 'அடுத்தது' : 'Next Step'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || !formData.premise.trim()}
                onClick={handleSubmit}
                className="flex max-w-full items-center gap-2 rounded-xl bg-gradient-to-r from-studio-cyan via-teal-500 to-emerald-500 px-6 py-2.5 text-xs font-bold text-black transition-all shadow-md hover:opacity-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>{isTamil ? 'AI கதை உருவாக்குகிறது...' : 'Generating Manga Script...'}</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    <span>{isTamil ? 'முழு கதையை உருவாக்கு' : 'Generate Full Manga Script'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
