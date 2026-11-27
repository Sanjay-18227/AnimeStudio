import React from 'react';
import {
  Sparkles,
  BookOpen,
  UserSquare2,
  Film,
  Camera,
  MessageSquareCode,
  FolderPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Layers,
  Palette,
  Mic,
  Clock,
  Play
} from 'lucide-react';

export default function DashboardHome({
  activeProject,
  projects = [],
  setActiveView,
  onOpenNewProjectModal,
  onOpenProjects,
  systemHealth,
  language = 'en'
}) {
  const isTamil = language === 'ta';

  const studioCards = [
    {
      id: 'chat',
      title: isTamil ? 'AI அரட்டை ஸ்டுடியோ' : 'AI Chat Studio',
      subtitle: isTamil ? 'கதை & பாத்திர ஆலோசனை' : 'Brainstorming & Scriptwriting',
      description: isTamil
        ? 'கதைக் கரு, வசனங்கள், உலக உருவாக்கம் மற்றும் தூண்டுதல்களை தமிழ் மற்றும் ஆங்கிலத்தில் உருவாக்குங்கள்.'
        : 'Collaborate with an anime co-pilot for story plots, character dialogues, and optimized visual prompts in English & Tamil.',
      icon: MessageSquareCode,
      iconColor: 'text-violet-400',
      badge: isTamil ? 'இருமொழி' : 'Bilingual',
    },
    {
      id: 'manga',
      title: isTamil ? 'மங்கா ஸ்டுடியோ' : 'Manga Studio',
      subtitle: isTamil ? 'அத்தியாயம் & பேனல் உருவாக்கம்' : 'Chapters & Panel Layouts',
      description: isTamil
        ? 'முழு அத்தியாயங்கள், காட்சிகள், பேனல் விளக்கங்கள் மற்றும் காமிக் பக்க அமைப்புகளை உருவாக்குங்கள்.'
        : 'Generate full manga arcs, breakdown chapters into scenes, author dialogues, and generate comic page layouts.',
      icon: BookOpen,
      iconColor: 'text-orange-400',
      badge: 'Phase 3',
    },
    {
      id: 'character',
      title: isTamil ? 'கேரக்டர் ஸ்டுடியோ' : 'Character Studio',
      subtitle: isTamil ? 'நிலைத்தன்மை சுயவிவரங்கள்' : 'Persistent Visual Profiles',
      description: isTamil
        ? 'தோற்றம், சிகை அலங்காரம், உடைகள் மற்றும் திறன்களுடன் நிலையான கதாபாத்திரங்களை வடிவமைக்கவும்.'
        : 'Craft detailed character dossiers (hair, attire, backstory, powers) and maintain prompt consistency across scenes.',
      icon: UserSquare2,
      iconColor: 'text-pink-400',
      badge: 'Phase 4',
    },
    {
      id: 'image',
      title: isTamil ? 'அனிம் பட ஸ்டுடியோ' : 'Anime Image Studio',
      subtitle: isTamil ? 'உரை-முதல்-படம்' : 'Text-to-Image & Wallpapers',
      description: isTamil
        ? 'SDXL மற்றும் Animagine மாதிரிகள் மூலம் உயர்தர அனிம் கலைப்படைப்புகள், வால்பேப்பர்கள் மற்றும் விளக்கப்படங்கள்.'
        : 'Generate breathtaking anime concept art, portraits, action sequences, and screentones with free models.',
      icon: Sparkles,
      iconColor: 'text-green-400',
      badge: 'Phase 5',
    },
    {
      id: 'photo_to_anime',
      title: isTamil ? 'புகைப்படம்-முதல்-அனிம்' : 'Photo-to-Anime',
      subtitle: isTamil ? 'உண்மையிலிருந்து அனிமே வரை' : 'Real-to-Anime Transformation',
      description: isTamil
        ? 'உண்மையான புகைப்படங்களை கிளாசிக் ஜப்பானிய அனிம் கலை பாணிகளாக மாற்றவும்.'
        : 'Transform real-world portraits, landscapes, and scenes into vibrant Japanese anime aesthetic illustrations.',
      icon: Camera,
      iconColor: 'text-blue-400',
      badge: 'Phase 6',
    },
    {
      id: 'video',
      title: isTamil ? 'அனிம் வீடியோ ஸ்டுடியோ' : 'Anime Video Studio',
      subtitle: isTamil ? 'டைம்லைன் & குரல் ஒத்திசைவு' : 'Storyboards & Voiceovers',
      description: isTamil
        ? 'காட்சிகளை அனிமேட் செய்து, கேமரா நகர்வுகள், இலவச நரம்பியல் குரல்கள் மற்றும் வசனங்களுடன் வீடியோவை ஏற்றுமதி செய்யவும்.'
        : 'Sequence scenes, add dynamic camera pans/zooms, attach neural voiceovers (EN/Tamil), and export MP4 with FFmpeg.',
      icon: Film,
      iconColor: 'text-amber-400',
      badge: 'Phase 8',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-studio-purple/30 bg-gradient-to-r from-[#14122E] via-[#0F142A] to-[#121936] p-8 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-studio-purple/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 h-48 w-48 rounded-full bg-studio-cyan/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-studio-purple/40 bg-studio-purple/10 px-3 py-1 text-xs font-semibold text-studio-purple-light">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {isTamil ? 'அனிம் ஸ்டுடியோ AI - இலவச முதல் வடிவமைப்பு' : 'Free-First AI Creative Suite'}
              </span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {isTamil ? (
                <>
                  உங்கள் சொந்த <span className="text-transparent bg-clip-text bg-gradient-to-r from-studio-purple-light via-pink-400 to-studio-cyan">மங்கா & அனிமேவை</span> உருவாக்குங்கள்
                </>
              ) : (
                <>
                  Craft Original <span className="text-transparent bg-clip-text bg-gradient-to-r from-studio-purple-light via-pink-400 to-studio-cyan">Manga & Anime</span> with AI
                </>
              )}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {isTamil
                ? 'கதை உருவாக்கம், அத்தியாய வடிவமைப்பு, நிலையான கதாபாத்திரங்கள், அனிம் படங்கள், குரல்வழி மற்றும் வீடியோ தொகுப்பு — அனைத்தும் ஒரே இடத்தில்.'
                : 'From brainstorm to final video cut: generate stories, build comic layouts, synthesize anime artwork, generate neural voiceovers, and export complete creative productions.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveView('chat')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-studio-purple to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-purple hover:opacity-95 transition-all"
              >
                <span>{isTamil ? 'கதையைத் தொடங்குங்கள்' : 'Start Storytelling'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onOpenNewProjectModal}
                className="flex items-center gap-2 rounded-xl border border-studio-border bg-studio-card/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-studio-hover hover:text-white transition-all"
              >
                <FolderPlus className="h-4 w-4 text-studio-cyan" />
                <span>{isTamil ? 'புதிய திட்டம்' : 'New Project'}</span>
              </button>
            </div>
          </div>

          {/* Active Project Highlight Card */}
          {activeProject ? (
            <section className="w-full shrink-0 space-y-3 rounded-xl border border-studio-border bg-studio-card/90 p-5 shadow-lg backdrop-blur-md md:w-72" aria-label="Active project">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-studio-purple-light">
                  {isTamil ? 'செயலில் உள்ள திட்டம்' : 'Active Project'}
                </span>
                <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {activeProject.genre || 'Shonen'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base truncate">{activeProject.title}</h3>
                <p className="text-[11px] text-studio-cyan">
                  {activeProject.target_audience || 'General'} · {projects.length} {isTamil ? 'திட்டங்கள்' : 'projects'}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {activeProject.description || (isTamil ? 'விளக்கம் இல்லை' : 'No description provided')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-studio-border pt-3 text-center">
                <div className="rounded-lg bg-studio-elevated p-1.5">
                  <div className="text-xs font-bold text-white">{activeProject.characters_count || 0}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Chars</div>
                </div>
                <div className="rounded-lg bg-studio-elevated p-1.5">
                  <div className="text-xs font-bold text-white">{activeProject.chapters_count || 0}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Chapters</div>
                </div>
                <div className="rounded-lg bg-studio-elevated p-1.5">
                  <div className="text-xs font-bold text-white">{activeProject.images_count || 0}</div>
                  <div className="text-[9px] text-slate-400 uppercase">Images</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenProjects}
                className="w-full rounded-lg border border-studio-border px-3 py-2 text-xs font-semibold text-studio-purple-light transition-colors hover:bg-studio-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-studio-purple"
              >
                {isTamil ? 'திட்டங்களை நிர்வகி' : 'Manage projects'}
              </button>
            </section>
          ) : (
            <div className="shrink-0 rounded-xl border border-dashed border-studio-border bg-studio-card/40 p-5 w-full md:w-72 flex flex-col items-center justify-center text-center space-y-2">
              <FolderPlus className="h-8 w-8 text-slate-500" />
              <div className="text-xs font-medium text-slate-300">
                {isTamil ? 'திட்டம் எதுவும் தேர்ந்தெடுக்கப்படவில்லை' : 'No Project Selected'}
              </div>
              <button
                type="button"
                onClick={onOpenNewProjectModal}
                className="text-xs font-bold text-studio-purple-light hover:underline"
              >
                + {isTamil ? 'முதல் திட்டத்தை உருவாக்கவும்' : 'Create First Project'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Free-First AI Model Readiness Bar */}
      <div className="rounded-xl border border-studio-border bg-studio-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                {isTamil ? 'இலவச AI மாதிரிகள் நிலை' : 'Free AI Model Status'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTamil
                  ? 'கட்டண சந்தா தேவையில்லாமல் செயல்படும் திறந்தநிலை & இலவச மாதிரிகள்'
                  : 'Open & free-tier providers configured for instant creative production'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-medium text-emerald-400">
              {systemHealth ? 'Backend API Ready' : 'Connecting...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            {
              name: 'Google Gemini',
              model: 'Gemini 3.5 Flash Lite',
              type: 'Free Tier',
              status: systemHealth?.providers?.gemini?.is_configured ? 'Configured' : 'Ready (Free Key)',
              active: systemHealth?.providers?.gemini?.is_configured,
            },
            {
              name: 'OpenRouter',
              model: 'Llama 3.3 70B',
              type: 'Free Models',
              status: systemHealth?.providers?.openrouter?.is_configured ? 'Configured' : 'Ready (Free Key)',
              active: systemHealth?.providers?.openrouter?.is_configured,
            },
            {
              name: 'Hugging Face',
              model: 'Animagine XL',
              type: 'Free Inference',
              status: systemHealth?.providers?.huggingface?.is_configured ? 'Configured' : 'Ready (Free Token)',
              active: systemHealth?.providers?.huggingface?.is_configured,
            },
            {
              name: 'Cloudflare AI',
              model: 'FLUX.1 schnell',
              type: 'Daily Free Tier',
              status: systemHealth?.providers?.cloudflare?.is_configured ? 'Configured' : 'Ready (Account ID)',
              active: systemHealth?.providers?.cloudflare?.is_configured,
            },
            {
              name: 'Edge Neural TTS',
              model: 'EN & Tamil Voices',
              type: 'Free Local/Edge',
              status: 'Active (Built-in)',
              active: true,
            },
            {
              name: 'FFmpeg Video',
              model: 'Local Pipeline',
              type: 'Free System',
              status: systemHealth?.system_info?.ffmpeg_available ? 'Available' : 'Adapter Mode',
              active: systemHealth?.system_info?.ffmpeg_available,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg border p-3 transition-colors ${
                item.active
                  ? 'border-emerald-500/30 bg-emerald-950/15'
                  : 'border-studio-border bg-studio-elevated/60'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                <span className="truncate">{item.name}</span>
                <CheckCircle className={`h-3 w-3 ${item.active ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-1">{item.model}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-studio-purple-light">
                  {item.type}
                </span>
                <span className={`text-[9px] font-medium ${item.active ? 'text-emerald-300' : 'text-amber-400'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Studios Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isTamil ? 'உற்பத்தி ஸ்டுடியோக்கள்' : 'Creative Studio Workspaces'}
            </h2>
            <p className="text-xs text-slate-400">
              {isTamil ? 'உங்கள் படைப்பைத் தேர்ந்தெடுக்கவும்' : 'Select a dedicated module to begin creating'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studioCards.map((studio) => {
            const Icon = studio.icon;
            return (
              <article
                key={studio.id}
                className="group relative flex flex-col justify-between rounded-xl border border-studio-border bg-studio-card p-6 shadow-md transition-all duration-200 hover:border-studio-purple/50 hover:bg-studio-elevated hover:shadow-glow-purple"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center">
                      <Icon className={`h-5 w-5 ${studio.iconColor}`} />
                    </div>
                    <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {studio.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-studio-purple-light transition-colors">
                      {studio.title}
                    </h3>
                    <p className="text-xs font-medium text-studio-cyan mt-0.5">
                      {studio.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {studio.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView(studio.id)}
                  className="flex w-full items-center gap-1.5 border-t border-studio-border/60 pt-3 text-left text-xs font-semibold text-studio-purple-light transition-transform group-hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-studio-purple"
                  aria-label={`${studio.title}: open studio`}
                >
                  <span>{isTamil ? 'ஸ்டுடியோ திற' : 'Open Studio'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {/* Anime Production Lifecycle / Pipeline Visualizer */}
      <div className="rounded-xl border border-studio-border bg-studio-card p-6">
        <h3 className="text-sm font-bold text-white mb-1">
          {isTamil ? 'அனிம் தயாரிப்பு பணிப்பாய்வு' : 'End-to-End Anime Production Pipeline'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {isTamil
            ? 'யோசனையிலிருந்து முடிக்கப்பட்ட வீடியோ வரை முழுமையான உற்பத்தி படிநிலைகள்'
            : 'How Anime Studio AI coordinates modules into a unified creative production flow'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Story Brainstorm', desc: 'AI Chat Studio in English & Tamil', icon: MessageSquareCode, iconColor: 'text-violet-400' },
            { step: '02', title: 'Character Design', desc: 'Consistent visual trait dossiers', icon: UserSquare2, iconColor: 'text-pink-400' },
            { step: '03', title: 'Manga Script & Pages', desc: 'Chapters, scene splits & panel layouts', icon: BookOpen, iconColor: 'text-orange-400' },
            { step: '04', title: 'Anime Art Synthesis', desc: 'SDXL / FLUX text & photo-to-anime', icon: Sparkles, iconColor: 'text-green-400' },
            { step: '05', title: 'Video & Voiceover', desc: 'Timeline composition & FFmpeg MP4', icon: Film, iconColor: 'text-amber-400' },
          ].map((item, idx) => {
            const StepIcon = item.icon;
            return (
              <div key={idx} className="relative rounded-lg border border-studio-border bg-studio-elevated/40 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold text-studio-purple-light">{item.step}</span>
                  <StepIcon className={`h-4 w-4 ${item.iconColor}`} />
                </div>
                <div className="font-semibold text-xs text-white">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

