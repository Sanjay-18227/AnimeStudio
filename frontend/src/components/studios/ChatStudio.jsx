import React from 'react';
import { MessageSquareCode, Sparkles, Send, Bot, User, Globe2 } from 'lucide-react';

export default function ChatStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-2xl border border-studio-border bg-studio-card overflow-hidden shadow-2xl">
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-studio-border px-6 py-4 bg-studio-elevated/40">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-studio-purple to-indigo-600 text-white shadow-glow-purple">
            <MessageSquareCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isTamil ? 'AI அரட்டை ஸ்டுடியோ' : 'AI Chat Studio'}</span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Phase 2 Integration
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isTamil
                ? 'கதை ஆலோசனை, உலக வடிவமைப்பு மற்றும் தூண்டுதல் உகப்பாக்கம் (தமிழ் & English)'
                : 'Conversational anime assistant for story brainstorming, character dialogue & prompt optimization'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-studio-border bg-studio-card px-2.5 py-1 text-xs font-semibold text-studio-purple-light flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5" />
            <span>{isTamil ? 'தமிழ் ஆதரவு உள்ளது' : 'Bilingual EN / TA'}</span>
          </span>
        </div>
      </div>

      {/* Chat Messages Placeholder */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Welcome message from Anime Studio AI Assistant */}
        <div className="flex items-start gap-3 max-w-2xl">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-studio-purple text-white shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
          <div className="rounded-2xl rounded-tl-none border border-studio-border bg-studio-elevated/80 p-4 text-xs text-slate-200 space-y-2">
            <p className="font-semibold text-white">
              {isTamil ? 'வணக்கம்! நான் உங்கள் அனிம் ஸ்டுடியோ AI உதவியாளர்.' : 'Konnichiwa! Welcome to Anime Studio AI.'}
            </p>
            <p className="leading-relaxed">
              {isTamil
                ? 'நான் உங்கள் மங்கா கதைகளை உருவாக்க, அனிம் பாத்திரங்களை செதுக்க, மற்றும் காட்சிகளுக்கான தூண்டுதல்களை தமிழ் மற்றும் ஆங்கிலத்தில் எழுத உதவுவேன். Phase 2-ல் இந்த ஸ்டுடியோ முழுமையாக செயல்படத் தொடங்கும்!'
                : 'I am your dedicated anime production co-pilot. I can help brainstorm manga plots, craft character backstories, generate dialogue, and refine image/video generation prompts. Full multi-turn streaming AI chat will be activated in Phase 2!'}
            </p>
            {activeProject && (
              <div className="rounded-lg border border-studio-purple/30 bg-studio-purple/10 p-2 text-[11px] text-studio-purple-light">
                {isTamil ? 'செயலில் உள்ள திட்டம்:' : 'Target Project Context:'} <strong>{activeProject.title}</strong> ({activeProject.genre})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Box Footer */}
      <div className="border-t border-studio-border p-4 bg-studio-elevated/30">
        <div className="relative flex items-center">
          <input
            type="text"
            disabled
            placeholder={
              isTamil
                ? 'Phase 2-ல் அரட்டை தொடங்கும்... (எ.கா: "ஒரு சைபர்பங்க் நிஞ்ஜா கதையை உருவாக்கு")'
                : 'Chat co-pilot activating in Phase 2... (e.g. "Create a dark fantasy shonen protagonist with shadow powers")'
            }
            className="w-full rounded-xl border border-studio-border bg-studio-elevated py-3 pl-4 pr-12 text-xs text-slate-400 placeholder-slate-500 focus:outline-none cursor-not-allowed"
          />
          <button
            disabled
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-studio-purple/40 text-slate-400 cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Powered by Google Gemini 1.5/2.0 Flash & OpenRouter Free Tier</span>
          <span>Bilingual: English & தமிழ்</span>
        </div>
      </div>
    </div>
  );
}

