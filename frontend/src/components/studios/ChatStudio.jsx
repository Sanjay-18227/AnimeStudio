import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  RotateCcw,
  BookOpen,
  UserSquare2,
  Palette,
  Film,
  Cpu,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  sendChatMessage,
  getConversations,
  getConversation,
  deleteConversation
} from '../../services/api';

const CREATIVE_MODES = [
  {
    id: 'general',
    label: 'General Anime',
    labelTa: 'பொது அனிமே',
    icon: Sparkles,
    desc: 'Worldbuilding, lore, magic systems, and anime tropes',
    descTa: 'உலக உருவாக்கம், மாய அமைப்புகள் மற்றும் ஆலோசனைகள்',
    color: 'from-purple-500 to-indigo-600',
    starters: [
      "Brainstorm a cyberpunk shonen world where neon magic powers the city",
      "Subvert the classic tournament arc with a strategic mystery",
      "Create a magic system where spells cost fragments of human memories"
    ],
    startersTa: [
      "நியோ-டோக்கியோ பின்னணியில் ஒரு ஷோனென் மாய உலகை உருவாக்குங்கள்",
      "நினைவுகளை இழக்கும் ஒரு விசித்திரமான மந்திர அமைப்பை வடிவமைக்கவும்",
      "கதாநாயகன் மற்றும் அவனது எதிரியின் தீவிர மோதல் சூழ்நிலையை விவரிக்கவும்"
    ]
  },
  {
    id: 'manga_writer',
    label: 'Manga Script',
    labelTa: 'மங்கா திரைக்கதை',
    icon: BookOpen,
    desc: 'Kishōtenketsu arcs, scene beats, panel breakdown & dialogue',
    descTa: 'காட்சிகள், பேனல் விளக்கங்கள் மற்றும் வசனங்கள்',
    color: 'from-blue-500 to-cyan-600',
    starters: [
      "Draft a 4-panel climax scene where the protagonist unlocks their true form",
      "Write a tense dialogue confrontation between rivals on a rain-soaked bridge",
      "Break down Chapter 1 opening into panels with Japanese onomatopoeia SFX"
    ],
    startersTa: [
      "மழையில் பாழடைந்த பாலத்தில் நடக்கும் ஒரு தீவிர வசனக் காட்சியை எழுதுங்கள்",
      "முதல் அத்தியாயத்திற்கான 4-பேனல் காட்சிகளை SFX சத்தங்களுடன் விவரிக்கவும்",
      "கதாநாயகன் தன் இறுதி சக்தியை வெளிப்படுத்தும் உக்கிரமான காட்சியை எழுதுங்கள்"
    ]
  },
  {
    id: 'character_designer',
    label: 'Character Designer',
    labelTa: 'பாத்திர வடிவமைப்பு',
    icon: UserSquare2,
    desc: 'Visual traits, hairstyles, outfits, powers & consistency dossiers',
    descTa: 'தோற்றம், சிகை அலங்காரம், ஆடைகள் மற்றும் திறன்கள்',
    color: 'from-fuchsia-500 to-pink-600',
    starters: [
      "Design a dual-blade rogue anti-hero with silver spiky hair and glowing amber eyes",
      "Create a stoic mentor character with a dark tragic past and lightning techniques",
      "Craft a visual dossier for a female cyberpunk hacker with mechanical fox ears"
    ],
    startersTa: [
      "வெள்ளி நிற முடி மற்றும் மின்னும் கண்கள் கொண்ட இரட்டை வாள்வீரனை வடிவமைக்கவும்",
      "மின்னல் சக்தியுடைய அமைதியான குரு பாத்திரத்தின் பின்னணி மற்றும் திறன்களை எழுதுங்கள்",
      "சைபர்பங்க் அனிமே பெண் பாத்திரத்திற்கான முழுமையான தோற்ற விவரங்களை உருவாக்கவும்"
    ]
  },
  {
    id: 'prompt_engineer',
    label: 'Prompt Engineer',
    labelTa: 'படத் தூண்டுதல்',
    icon: Palette,
    desc: 'Precision positive & negative prompts for SDXL, Animagine & FLUX',
    descTa: 'SDXL & Animagine-க்கான நேர்மறை & எதிர்மறை தூண்டுதல்கள்',
    color: 'from-pink-500 to-rose-600',
    starters: [
      "Generate an Animagine XL prompt for an anime protagonist casting shadow flames",
      "Create an aesthetic 16:9 wallpaper prompt in Makoto Shinkai sky lighting",
      "Craft a black-and-white manga screentone illustration prompt with speedlines"
    ],
    startersTa: [
      "நிழல் தீப்பிழம்புகளை வீசும் அனிம் கதாநாயகனுக்கான SDXL படத் தூண்டுதலை உருவாக்குங்கள்",
      "அழகிய அனிம் வானம் மற்றும் மேகங்கள் நிறைந்த 16:9 வால்பேப்பர் தூண்டுதலை எழுதுங்கள்",
      "பாரம்பரிய கருப்பு-வெள்ளை மங்கா பேனல் விளக்கப்படத்திற்கான தூண்டுதலை உருவாக்கவும்"
    ]
  },
  {
    id: 'storyboard_assistant',
    label: 'Video Storyboard',
    labelTa: 'வீடியோ ஸ்டோரிபோர்டு',
    icon: Film,
    desc: 'Camera angles, motion pacing, voiceover cues & subtitle timings',
    descTa: 'கேமரா கோணங்கள், குரல்வழி குறிப்புகள் மற்றும் வசன நேரங்கள்',
    color: 'from-cyan-500 to-teal-600',
    starters: [
      "Compose a 3-shot storyboard with Ken Burns zooms for a dramatic duel",
      "Sequence a fast-paced action opening with 2-second cuts and sound effect cues",
      "Write voiceover lines and camera tilts for an anime series prologue teaser"
    ],
    startersTa: [
      "ஒரு தீவிர சண்டை காட்சிக்கான 3-ஷாட் வீடியோ ஸ்டோரிபோர்டை உருவாக்குங்கள்",
      "அனிமே டிரெய்லருக்கான குரல்வழி வசனங்கள் மற்றும் கேமரா ஜூம் விவரங்களை எழுதுங்கள்",
      "ஆக்ஷன் காட்சிக்கு ஏற்ற கேமரா நகர்வுகள் மற்றும் பின்னணி இசை குறிப்புகளை அமைக்கவும்"
    ]
  }
];

export default function ChatStudio({
  activeProject,
  language = 'en',
  onOpenSettings
}) {
  const isTamil = language === 'ta';

  // State
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeMode, setActiveMode] = useState('general');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, [activeProject]);

  const loadConversations = async () => {
    try {
      const projId = activeProject ? activeProject.id : null;
      const list = await getConversations(projId);
      setConversations(list || []);

      if (list && list.length > 0 && !currentConversationId) {
        // Load the most recent conversation
        loadConversationDetails(list[0].id);
      } else if (!list || list.length === 0) {
        setMessages([]);
        setCurrentConversationId(null);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadConversationDetails = async (convId) => {
    try {
      setError(null);
      const detail = await getConversation(convId);
      setCurrentConversationId(detail.id);
      setActiveMode(detail.mode || 'general');
      setMessages(detail.messages || []);
    } catch (err) {
      setError(err.message || 'Failed to load conversation messages');
    }
  };

  const handleStartNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInputText('');
    setError(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (window.confirm(isTamil ? 'இந்த உரையாடலை நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Delete this conversation?')) {
      try {
        await deleteConversation(convId);
        const updated = conversations.filter((c) => c.id !== convId);
        setConversations(updated);
        if (currentConversationId === convId) {
          if (updated.length > 0) {
            loadConversationDetails(updated[0].id);
          } else {
            handleStartNewChat();
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to delete conversation');
      }
    }
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputText).trim();
    if (!text || loading) return;

    setError(null);
    const userMsgTemp = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversationId || '',
      sender: 'user',
      content: text,
      provider_used: 'user',
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsgTemp]);
    setInputText('');
    setLoading(true);

    try {
      const payload = {
        content: text,
        conversation_id: currentConversationId,
        project_id: activeProject ? activeProject.id : null,
        mode: activeMode,
        language: language
      };

      const assistantMsg = await sendChatMessage(payload);

      // If this was a new conversation, update currentConversationId and refresh conversation list
      if (!currentConversationId && assistantMsg.conversation_id) {
        setCurrentConversationId(assistantMsg.conversation_id);
        loadConversations();
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'AI request failed');
      // Add error message in stream
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          conversation_id: currentConversationId || '',
          sender: 'assistant',
          content: isTamil
            ? `மன்னிக்கவும்! AI பிழை ஏற்பட்டது: ${err.message}`
            : `I encountered an issue processing your request: ${err.message}`,
          error_message: err.message,
          created_at: new Date().toISOString(),
          isFailed: true,
          failedPrompt: text
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (failedPrompt) => {
    handleSendMessage(failedPrompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeModeObj = CREATIVE_MODES.find((m) => m.id === activeMode) || CREATIVE_MODES[0];
  const starters = isTamil ? activeModeObj.startersTa : activeModeObj.starters;

  return (
    <div className="flex h-[calc(100vh-7.5rem)] rounded-2xl border border-studio-border bg-studio-card overflow-hidden shadow-2xl">
      {/* 1. Conversations Sidebar */}
      <div
        className={`border-r border-studio-border bg-[#0C0E1B] flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-12'
        } shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between border-b border-studio-border px-3">
          {isSidebarOpen ? (
            <button
              onClick={handleStartNewChat}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-studio-purple to-indigo-600 py-1.5 px-3 text-xs font-semibold text-white shadow-glow-purple hover:opacity-95 transition-all mr-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isTamil ? 'புதிய அரட்டை' : 'New Brainstorm'}</span>
            </button>
          ) : (
            <button
              onClick={handleStartNewChat}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-studio-purple text-white shadow-sm"
              title="New Brainstorm"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-studio-border bg-studio-card text-slate-400 hover:text-white"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Sessions List */}
        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {activeProject ? `${activeProject.title} Sessions` : (isTamil ? 'அரட்டை வரலாறு' : 'Saved Sessions')}
            </div>

            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                {isTamil ? 'அரட்டை வரலாறு இல்லை' : 'No saved conversations'}
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = currentConversationId === c.id;
                const modeObj = CREATIVE_MODES.find((m) => m.id === c.mode) || CREATIVE_MODES[0];
                const ModeIcon = modeObj.icon;

                return (
                  <div
                    key={c.id}
                    onClick={() => loadConversationDetails(c.id)}
                    className={`group relative flex items-center justify-between rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-studio-purple/20 text-white border border-studio-purple/40 shadow-sm'
                        : 'text-slate-400 hover:bg-studio-card hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden pr-2">
                      <ModeIcon className="h-3.5 w-3.5 shrink-0 text-studio-purple-light" />
                      <span className="truncate font-medium">{c.title}</span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      title={isTamil ? 'நீக்கு' : 'Delete'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-studio-bg">
        {/* Top Mode Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-studio-border bg-studio-elevated/40 px-6 py-3 gap-3">
          {/* Creative Mode Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CREATIVE_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = activeMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    isSelected
                      ? `bg-gradient-to-r ${mode.color} text-white shadow-sm`
                      : 'border border-studio-border bg-studio-card text-slate-400 hover:text-white hover:bg-studio-hover'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{isTamil ? mode.labelTa : mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Status */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Free-First AI Engine</span>
            </span>

            {currentConversationId && (
              <button
                onClick={(e) => handleDeleteConversation(e, currentConversationId)}
                className="flex items-center gap-1 rounded-lg border border-studio-border bg-studio-card px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                title={isTamil ? 'அரட்டையை அழிக்கவும்' : 'Clear conversation'}
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">{isTamil ? 'அழி' : 'Clear'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            /* Welcome Empty State */
            <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto text-center space-y-6 py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-studio-purple via-indigo-600 to-studio-cyan text-white shadow-glow-purple">
                <activeModeObj.icon className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white font-display">
                  {isTamil ? activeModeObj.labelTa : activeModeObj.label}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  {isTamil ? activeModeObj.descTa : activeModeObj.desc}
                </p>
                {activeProject && (
                  <div className="inline-block rounded-md border border-studio-purple/30 bg-studio-purple/10 px-2.5 py-1 text-[11px] text-studio-purple-light font-medium">
                    {isTamil ? 'செயலில் உள்ள திட்டம்:' : 'Target Project:'} {activeProject.title} ({activeProject.genre})
                  </div>
                )}
              </div>

              {/* Starter Prompt Chips */}
              <div className="w-full space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
                  {isTamil ? 'பரிந்துரைக்கப்பட்ட தொடக்கங்கள்:' : 'Quick Creative Starters:'}
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {starters.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(starter)}
                      className="flex items-center justify-between rounded-xl border border-studio-border bg-studio-card/80 p-3 text-xs text-slate-300 hover:border-studio-purple/50 hover:bg-studio-elevated hover:text-white transition-all text-left group"
                    >
                      <span className="truncate pr-2">{starter}</span>
                      <Send className="h-3 w-3 text-slate-500 group-hover:text-studio-purple-light shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message List */
            messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isFailed = msg.isFailed || Boolean(msg.error_message);

              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-studio-purple to-indigo-600 text-white shadow-sm mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`flex flex-col space-y-1.5 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl p-4 text-xs leading-relaxed transition-all ${
                        isUser
                          ? 'rounded-tr-none bg-gradient-to-r from-studio-purple to-indigo-700 text-white shadow-md'
                          : isFailed
                          ? 'rounded-tl-none border border-rose-500/40 bg-rose-500/10 text-rose-200'
                          : 'rounded-tl-none border border-studio-border bg-studio-card text-slate-200 shadow-md'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans break-words selection:bg-purple-900 selection:text-white">
                        {msg.content}
                      </div>

                      {/* Assistant Actions: Copy, Retry, Provider Badge */}
                      {!isUser && (
                        <div className="flex items-center justify-between border-t border-studio-border/50 pt-2.5 mt-3 text-[10px] text-slate-400 gap-3">
                          <div className="flex items-center gap-2">
                            {msg.provider_used && (
                              <span className="rounded-md border border-studio-border bg-studio-elevated px-1.5 py-0.5 text-[9px] uppercase font-bold text-studio-cyan">
                                {msg.provider_used}
                              </span>
                            )}
                            {msg.model_used && (
                              <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                {msg.model_used}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isFailed && msg.failedPrompt && (
                              <button
                                onClick={() => handleRetry(msg.failedPrompt)}
                                className="flex items-center gap-1 text-rose-300 hover:text-white font-semibold"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>{isTamil ? 'மீண்டும் முயற்சி' : 'Retry'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => copyToClipboard(msg.content, index)}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                              title="Copy response"
                            >
                              {copiedIndex === index ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">{isTamil ? 'நகலெடுக்கப்பட்டது' : 'Copied'}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>{isTamil ? 'நகல்' : 'Copy'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[10px] text-slate-500 px-1">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-studio-elevated text-slate-300 border border-studio-border mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-studio-purple to-indigo-600 text-white shadow-sm animate-pulse">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-studio-border bg-studio-card p-4 text-xs text-slate-300 flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-studio-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-studio-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-slate-400 text-xs font-medium">
                  {isTamil ? 'அனிம் ஸ்டுடியோ AI சிந்திக்கிறது...' : 'Anime Studio AI is drafting creative concepts...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-studio-border p-4 bg-studio-elevated/40 space-y-2">
          {/* Quick starter chips when in active chat */}
          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-slate-500 text-[10px] font-semibold uppercase shrink-0">
                {isTamil ? 'யோசனை:' : 'Suggestion:'}
              </span>
              {starters.slice(0, 2).map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendMessage(starter)}
                  className="rounded-lg border border-studio-border bg-studio-card px-2.5 py-1 text-slate-300 hover:text-white hover:border-studio-purple/50 truncate max-w-[280px] shrink-0 transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          <div className="relative flex items-end rounded-2xl border border-studio-border bg-studio-elevated p-1.5 focus-within:border-studio-purple focus-within:ring-1 focus-within:ring-studio-purple shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isTamil
                  ? `${activeModeObj.labelTa} முறையில் கேளுங்கள்... (Enter = அனுப்பு, Shift+Enter = புதிய வரி)`
                  : `Ask in ${activeModeObj.label} mode... (Enter to send, Shift+Enter for new line)`
              }
              className="w-full resize-none bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none max-h-32 min-h-[38px]"
            />

            <button
              disabled={!inputText.trim() || loading}
              onClick={() => handleSendMessage()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-studio-purple to-indigo-600 text-white shadow-glow-purple hover:opacity-95 disabled:opacity-40 disabled:hover:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              title={isTamil ? 'அனுப்பு' : 'Send message'}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 px-2">
            <span>
              {isTamil ? 'இருமொழி AI இயங்குதளம் (ஆங்கிலம் & தமிழ்)' : 'Bilingual AI Platform (English & தமிழ்)'}
            </span>
            <span>{inputText.length} / 10,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
