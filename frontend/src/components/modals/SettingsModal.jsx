import React from 'react';
import { X, ShieldCheck, Key, ExternalLink, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, systemHealth, language = 'en' }) {
  const isTamil = language === 'ta';

  if (!isOpen) return null;

  const providers = [
    {
      name: 'Google Gemini API',
      category: 'Text & Story Generation',
      freeTierNote: 'Free tier with rate limits (15 RPM / 1M TPM). No credit card required.',
      getKeyUrl: 'https://aistudio.google.com/app/apikey',
      models: ['gemini-1.5-flash', 'gemini-2.0-flash'],
      envVar: 'GEMINI_API_KEY',
      isConfigured: systemHealth?.providers?.gemini?.is_configured
    },
    {
      name: 'OpenRouter (Free LLMs)',
      category: 'Text & Story Generation',
      freeTierNote: 'Provides 100% free open models like Llama 3.3 70B, Qwen 2.5 72B, Mistral 7B.',
      getKeyUrl: 'https://openrouter.ai/keys',
      models: ['meta-llama/llama-3.3-70b-instruct:free', 'qwen/qwen-2.5-72b-instruct:free'],
      envVar: 'OPENROUTER_API_KEY',
      isConfigured: systemHealth?.providers?.openrouter?.is_configured
    },
    {
      name: 'Hugging Face Inference',
      category: 'Anime Image Generation',
      freeTierNote: 'Free serverless inference for Animagine XL, SDXL, and anime checkpoints.',
      getKeyUrl: 'https://huggingface.co/settings/tokens',
      models: ['cagliostrolab/animagine-xl-3.1', 'stabilityai/stable-diffusion-xl-base-1.0'],
      envVar: 'HUGGINGFACE_API_TOKEN',
      isConfigured: systemHealth?.providers?.huggingface?.is_configured
    },
    {
      name: 'Cloudflare Workers AI',
      category: 'Anime Image Generation',
      freeTierNote: 'Generous 10,000 neurons/day free tier for FLUX.1 schnell and SDXL.',
      getKeyUrl: 'https://dash.cloudflare.com/',
      models: ['@cf/black-forest-labs/flux-1-schnell', '@cf/stabilityai/stable-diffusion-xl-base-1.0'],
      envVar: 'CLOUDFLARE_API_TOKEN',
      isConfigured: systemHealth?.providers?.cloudflare?.is_configured
    },
    {
      name: 'Edge Neural TTS',
      category: 'Voiceover & Dialogue',
      freeTierNote: 'Free built-in neural speech synthesis in English and Tamil (தமிழ்).',
      getKeyUrl: '',
      models: ['en-US-ChristopherNeural', 'ta-IN-PallaviNeural', 'ta-IN-ValluvarNeural'],
      envVar: 'ENABLE_EDGE_TTS=true',
      isConfigured: true
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-studio-border bg-studio-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-border pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-studio-purple/20 text-studio-purple-light">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isTamil ? 'AI வழங்குநர்கள் & அமைப்புகள்' : 'Free AI Providers & Settings'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isTamil ? 'கட்டணமில்லா திறந்த நிலை AI கட்டமைப்பு' : 'Free-first, zero-credit-card creative AI architecture'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-studio-hover hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Assurance Banner */}
        <div className="my-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 shrink-0">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-300 leading-relaxed">
              <strong>Free-First Rule:</strong> Anime Studio AI never requires a paid subscription to run. All core features work with free tier APIs (Google Gemini, OpenRouter Free, Hugging Face Free, Edge TTS). Keys are kept strictly in backend <code className="text-white bg-black/40 px-1 py-0.5 rounded">.env</code> and never exposed to the browser.
            </p>
          </div>
        </div>

        {/* Providers List */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
          {providers.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-studio-border bg-studio-elevated/70 p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{p.name}</span>
                  <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-[10px] font-medium text-studio-cyan">
                    {p.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.isConfigured ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Configured
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-400">
                      Requires Key in .env
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300">{p.freeTierNote}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-studio-border/50 text-[11px]">
                <div className="text-slate-400 font-mono text-[10px]">
                  Config in <code className="text-slate-200">{p.envVar}</code>
                </div>

                {p.getKeyUrl && (
                  <a
                    href={p.getKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-studio-purple-light hover:underline font-medium"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-studio-border pt-3 mt-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl bg-studio-purple px-5 py-2 text-xs font-semibold text-white hover:bg-studio-purple-dark transition-colors"
          >
            {isTamil ? 'மூடு' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}

