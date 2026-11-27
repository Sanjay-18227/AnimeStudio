import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Key,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Sliders,
  Database,
  Volume2,
  Trash2,
  Plus,
  RefreshCw,
  BookOpen,
  User,
  Check,
  Languages,
  Zap,
  Layers,
  Palette
} from 'lucide-react';
import {
  getAIProviders,
  testAIProvider,
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
  getProjectMemories,
  createProjectMemory,
  deleteProjectMemory,
  clearProjectMemories
} from '../../services/api';
import LoadingIndicator from '../ui/LoadingIndicator';

export default function SettingsModal({
  isOpen,
  onClose,
  systemHealth,
  language = 'en',
  activeProject = null,
  onNotify
}) {
  const isTamil = language === 'ta';

  // Active Tab: 'providers' | 'personality' | 'memory' | 'voice'
  const [activeTab, setActiveTab] = useState('providers');

  // AI Providers Tab State
  const [providerData, setProviderData] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [selectedModels, setSelectedModels] = useState({});

  // Personalization Settings State
  const [settings, setSettings] = useState({
    assistant_name: 'Anime Studio AI',
    personality: 'Friendly',
    response_tone: 'Helpful and encouraging',
    response_length: 'Balanced',
    language: 'English',
    creativity_level: 'Balanced',
    default_role: 'General assistant',
    theme: 'Dark',
    memory_enabled: true,
    voice_enabled: true,
    auto_speak_responses: false,
    voice_speed: 1.0
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Project Memory State
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [memoriesLoadError, setMemoriesLoadError] = useState('');
  const memoryRequestIdRef = useRef(0);
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState('lore');

  // Voice Test State
  const [isSpeakingTest, setIsSpeakingTest] = useState(false);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => previousFocusRef.current?.focus?.();
  }, [isOpen]);

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadProviders();
      loadSettings();
      if (activeProject?.id) {
        loadMemories(activeProject.id);
      } else {
        memoryRequestIdRef.current += 1;
        setMemories([]);
        setLoadingMemories(false);
        setMemoriesLoadError('');
      }
    } else {
      memoryRequestIdRef.current += 1;
      setLoadingMemories(false);
    }
  }, [isOpen, activeProject?.id]);

  const loadProviders = async () => {
    try {
      const data = await getAIProviders();
      setProviderData(data);
      if (data && data.providers) {
        const initialModels = {};
        data.providers.forEach((p) => {
          initialModels[p.id] = p.default_model;
        });
        setSelectedModels(initialModels);
      }
    } catch (err) {
      console.error('Failed to load AI providers:', err);
      onNotify?.('error', err.message || 'Could not load AI provider settings.');
    }
  };

  const loadSettings = async () => {
    try {
      const userSettings = await getUserSettings();
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (err) {
      console.error('Failed to load user settings:', err);
      onNotify?.('error', err.message || 'Could not load your settings.');
    }
  };

  const loadMemories = async (projectId) => {
    const requestId = ++memoryRequestIdRef.current;
    setMemories([]);
    setLoadingMemories(true);
    setMemoriesLoadError('');
    try {
      const data = await getProjectMemories(projectId);
      if (requestId === memoryRequestIdRef.current) {
        setMemories(data || []);
      }
    } catch (err) {
      if (requestId === memoryRequestIdRef.current) {
        const message = err.message || (isTamil ? 'திட்ட நினைவுகளை ஏற்ற முடியவில்லை.' : 'Could not load project memories.');
        console.error('Failed to load memories:', err);
        setMemoriesLoadError(message);
        onNotify?.('error', message);
      }
    } finally {
      if (requestId === memoryRequestIdRef.current) {
        setLoadingMemories(false);
      }
    }
  };

  const handleTestConnection = async (providerId) => {
    setTestingId(providerId);
    try {
      const model = selectedModels[providerId] || null;
      const res = await testAIProvider(providerId, model);
      setTestResults((prev) => ({
        ...prev,
        [providerId]: res
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: false,
          message: err.message || 'Connection test failed',
          latency_ms: 0
        }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const updated = await updateUserSettings(settings);
      setSettings(updated);
      onNotify?.('success', isTamil ? 'விருப்பத்தேர்வுகள் சேமிக்கப்பட்டன!' : 'Preferences saved successfully.');
    } catch (err) {
      onNotify?.('error', err.message || 'Could not save your settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm(isTamil ? 'அனைத்து அமைப்புகளையும் இயல்புநிலைக்கு மீட்டமைக்கவா?' : 'Reset all assistant settings to default values?')) {
      setSettingsSaving(true);
      try {
        const reset = await resetUserSettings();
        setSettings(reset);
        onNotify?.('success', isTamil ? 'இயல்புநிலைக்கு மீட்டமைக்கப்பட்டது!' : 'Settings restored to defaults.');
      } catch (err) {
        onNotify?.('error', err.message || 'Could not reset your settings.');
      } finally {
        setSettingsSaving(false);
      }
    }
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!activeProject || !newMemoryKey.trim() || !newMemoryContent.trim()) return;

    try {
      const created = await createProjectMemory(activeProject.id, {
        key: newMemoryKey.trim(),
        content: newMemoryContent.trim(),
        category: newMemoryCategory
      });
      setMemoriesLoadError('');
      setMemories((prev) => [created, ...prev]);
      setNewMemoryKey('');
      setNewMemoryContent('');
      onNotify?.('success', isTamil ? 'நினைவகம் சேர்க்கப்பட்டது!' : 'Memory added.');
    } catch (err) {
      onNotify?.('error', err.message || 'Could not add that memory.');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!activeProject) return;
    try {
      await deleteProjectMemory(activeProject.id, memoryId);
      setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      onNotify?.('success', isTamil ? 'நினைவகம் நீக்கப்பட்டது' : 'Memory deleted.');
    } catch (err) {
      console.error('Failed to delete memory:', err);
      onNotify?.('error', err.message || 'Could not delete that memory.');
    }
  };

  const handleClearMemories = async () => {
    if (!activeProject || memories.length === 0) return;
    if (window.confirm(isTamil ? 'இந்த திட்டத்திற்கான அனைத்து நினைவகங்களையும் நீக்கவா?' : 'Clear all lore memories for this project?')) {
      try {
        await clearProjectMemories(activeProject.id);
        setMemoriesLoadError('');
        setMemories([]);
        onNotify?.('success', isTamil ? 'அனைத்து நினைவகங்களும் நீக்கப்பட்டன' : 'Project memories cleared.');
      } catch (err) {
        console.error('Failed to clear memories:', err);
        onNotify?.('error', err.message || 'Could not clear project memories.');
      }
    }
  };

  const handleTestSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const phrase =
      settings.language === 'Tamil'
        ? 'வணக்கம்! நான் உங்கள் அனிம் ஸ்டுடியோ AI படைப்பு தோழன்.'
        : settings.language === 'Japanese'
        ? 'こんにちは！アニメスタジオAIへようこそ。'
        : `Hello! I am ${settings.assistant_name}, your dedicated anime co-creator. Ready to craft legendary manga!`;

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = settings.voice_speed || 1.0;
    if (settings.language === 'Tamil') utterance.lang = 'ta-IN';
    else if (settings.language === 'Japanese') utterance.lang = 'ja-JP';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeakingTest(true);
    utterance.onend = () => setIsSpeakingTest(false);
    utterance.onerror = () => setIsSpeakingTest(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const providers = providerData ? providerData.providers : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm animate-in fade-in duration-150 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        onKeyDown={handleDialogKeyDown}
        className="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-studio-border bg-studio-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-border px-6 py-4 shrink-0 bg-[#0C0E1B]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-studio-purple/20 text-studio-purple-light border border-studio-purple/30">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 id="settings-dialog-title" className="text-base font-bold text-white leading-tight">
                {isTamil ? 'அமைப்புகள் & AI தனிப்பயனாக்கம்' : 'Studio Settings & AI Customization'}
              </h2>
              <p className="text-xs text-slate-400">
                {isTamil
                  ? 'AI வழங்குநர்கள், தனிப்பயனாக்கப்பட்ட ஆளுமை மற்றும் திட்ட நினைவக மேலாண்மை'
                  : 'Manage AI provider tiers, chatbot personality, project lore memory, and speech audio'}
              </p>
            </div>
          </div>
          <button
            type="button"
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-studio-hover hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-studio-purple"
            aria-label={isTamil ? 'சாளரத்தை மூடு' : 'Close settings dialog'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-studio-border bg-studio-elevated/40 px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'providers'
                ? 'border-studio-purple text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-studio-purple-light" />
            <span>{isTamil ? 'AI வழங்குநர்கள்' : 'AI Providers'}</span>
          </button>

          <button
            onClick={() => setActiveTab('personality')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'personality'
                ? 'border-studio-purple text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4 text-studio-cyan" />
            <span>{isTamil ? 'உதவியாளர் ஆளுமை' : 'Assistant Personalization'}</span>
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'memory'
                ? 'border-studio-purple text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="h-4 w-4 text-emerald-400" />
            <span>{isTamil ? 'திட்ட நினைவகம்' : 'Project Memory'}</span>
            {memories.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-300 font-bold">
                {memories.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'voice'
                ? 'border-studio-purple text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="h-4 w-4 text-fuchsia-400" />
            <span>{isTamil ? 'குரல் & ஆடியோ' : 'Voice & Audio'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ======================================================== */}
          {/* TAB 1: AI PROVIDERS */}
          {/* ======================================================== */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              {/* Free-First Architecture Banner */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300 leading-relaxed">
                    <strong>Free-First AI Engine:</strong> Anime Studio AI operates with verified free-tier models. Primary provider is <strong>Google Gemini (gemini-3.5-flash-lite)</strong> with automated fallback to <strong>OpenRouter Free Tier</strong> and an internal <strong>Offline Engine</strong>. Keys are isolated in backend <code className="bg-black/50 text-white px-1.5 py-0.5 rounded text-[11px]">.env</code>.
                  </p>
                </div>
              </div>

              {providers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading AI provider status...</div>
              ) : (
                providers.map((p) => {
                  const test = testResults[p.id];
                  const isTesting = testingId === p.id;
                  const selectedModel = selectedModels[p.id] || p.default_model;

                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-studio-border bg-studio-elevated/70 p-4 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-[10px] font-medium text-studio-cyan">
                            {p.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {p.is_configured ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Configured
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Requires Key in .env
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Masked Credentials & Model Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                            Credential (Masked):
                          </span>
                          <div className="rounded-lg border border-studio-border bg-studio-card px-3 py-1.5 text-slate-300 font-mono text-[11px] flex items-center justify-between">
                            <span>{p.masked_key}</span>
                            <Key className="h-3 w-3 text-slate-500" />
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                            Model Selection:
                          </span>
                          <select
                            value={selectedModel}
                            onChange={(e) =>
                              setSelectedModels((prev) => ({
                                ...prev,
                                [p.id]: e.target.value
                              }))
                            }
                            className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-1.5 text-xs text-white focus:border-studio-purple focus:outline-none"
                          >
                            {p.available_models.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{p.free_tier_limits}</span>
                        {p.documentation_url && p.documentation_url.startsWith('http') && (
                          <a
                            href={p.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-studio-purple-light hover:underline font-medium"
                          >
                            <span>Get Free Key</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {/* Test Connection Button & Result */}
                      <div className="border-t border-studio-border/60 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <button
                          disabled={isTesting}
                          onClick={() => handleTestConnection(p.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-studio-purple/40 bg-studio-purple/10 px-3 py-1.5 text-xs font-semibold text-studio-purple-light hover:bg-studio-purple hover:text-white transition-all disabled:opacity-50 self-start"
                        >
                          {isTesting ? (
                            <>
                              <RotateCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Testing API...</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5" />
                              <span>Test Connection</span>
                            </>
                          )}
                        </button>

                        {test && (
                          <div
                            className={`flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-md ${
                              test.success
                                ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                                : 'text-rose-300 bg-rose-500/10 border border-rose-500/20'
                            }`}
                          >
                            {test.success ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Verified in {test.latency_ms}ms</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                                <span className="line-clamp-1">{test.message}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: ASSISTANT PERSONALIZATION */}
          {/* ======================================================== */}
          {activeTab === 'personality' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-studio-border bg-studio-elevated/70 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Assistant Name */}
                  <div>
                    <label htmlFor="assistant-name" className="block text-xs font-semibold text-slate-300 mb-1">
                      Assistant Display Name
                    </label>
                    <input
                      id="assistant-name"
                      type="text"
                      value={settings.assistant_name}
                      onChange={(e) => setSettings({ ...settings, assistant_name: e.target.value })}
                      placeholder="Anime Studio AI"
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    />
                  </div>

                  {/* Personality Preset */}
                  <div>
                    <label htmlFor="assistant-personality" className="block text-xs font-semibold text-slate-300 mb-1">
                      Personality Type
                    </label>
                    <select
                      id="assistant-personality"
                      value={settings.personality}
                      onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    >
                      <option value="Friendly">Friendly — Warm, encouraging, enthusiastic partner</option>
                      <option value="Professional">Professional — Analytical, precise, industry-grade</option>
                      <option value="Creative">Creative — Imaginative, vivid worldbuilding</option>
                      <option value="Casual">Casual — Relaxed, relatable anime peer</option>
                      <option value="Enthusiastic">Enthusiastic — High energy, passionate creator</option>
                    </select>
                  </div>

                  {/* Response Tone */}
                  <div>
                    <label htmlFor="assistant-tone" className="block text-xs font-semibold text-slate-300 mb-1">
                      Response Tone
                    </label>
                    <input
                      id="assistant-tone"
                      type="text"
                      value={settings.response_tone}
                      onChange={(e) => setSettings({ ...settings, response_tone: e.target.value })}
                      placeholder="Helpful and encouraging"
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    />
                  </div>

                  {/* Response Length */}
                  <div>
                    <label htmlFor="assistant-response-length" className="block text-xs font-semibold text-slate-300 mb-1">
                      Response Length
                    </label>
                    <select
                      id="assistant-response-length"
                      value={settings.response_length}
                      onChange={(e) => setSettings({ ...settings, response_length: e.target.value })}
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    >
                      <option value="Short">Short — Concise, punchy responses (~250 tokens)</option>
                      <option value="Balanced">Balanced — Well-rounded answers (~750 tokens)</option>
                      <option value="Detailed">Detailed — Deep, comprehensive scripts (~1800 tokens)</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label htmlFor="assistant-language" className="block text-xs font-semibold text-slate-300 mb-1">
                      Primary Language
                    </label>
                    <select
                      id="assistant-language"
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Japanese">日本語 (Japanese)</option>
                    </select>
                  </div>

                  {/* Creativity Level */}
                  <div>
                    <label htmlFor="assistant-creativity" className="block text-xs font-semibold text-slate-300 mb-1">
                      Creativity Level (Temperature)
                    </label>
                    <select
                      id="assistant-creativity"
                      value={settings.creativity_level}
                      onChange={(e) => setSettings({ ...settings, creativity_level: e.target.value })}
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    >
                      <option value="Low">Low — Focused, deterministic, consistent (Temp 0.3)</option>
                      <option value="Balanced">Balanced — Harmonic balance of novelty & logic (Temp 0.7)</option>
                      <option value="High">High — Maximum imagination & wild concepts (Temp 1.0)</option>
                    </select>
                  </div>

                  {/* Default Assistant Role */}
                  <div>
                    <label htmlFor="assistant-role" className="block text-xs font-semibold text-slate-300 mb-1">
                      Default Assistant Role
                    </label>
                    <select
                      id="assistant-role"
                      value={settings.default_role}
                      onChange={(e) => setSettings({ ...settings, default_role: e.target.value })}
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    >
                      <option value="General assistant">General anime assistant</option>
                      <option value="Manga writer">Manga script & dialogue writer</option>
                      <option value="Anime artist">Anime image prompt engineer</option>
                      <option value="Character designer">Character design specialist</option>
                      <option value="Storyteller">Epic narrative storyteller</option>
                    </select>
                  </div>

                  {/* Theme */}
                  <div>
                    <label htmlFor="workspace-theme" className="block text-xs font-semibold text-slate-300 mb-1">
                      Workspace Theme
                    </label>
                    <select
                      id="workspace-theme"
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="w-full rounded-lg border border-studio-border bg-studio-card px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
                    >
                      <option value="Dark">Dark Mode (Deep Space Anime Slate)</option>
                      <option value="Light">Light Mode (Clean Studio)</option>
                      <option value="System">System Default</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="border-t border-studio-border/60 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.memory_enabled}
                      onChange={(e) => setSettings({ ...settings, memory_enabled: e.target.checked })}
                      className="rounded border-studio-border bg-studio-card text-studio-purple focus:ring-studio-purple"
                    />
                    <span>Enable Project Memory Context Injection</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={settings.voice_enabled}
                      onChange={(e) => setSettings({ ...settings, voice_enabled: e.target.checked })}
                      className="rounded border-studio-border bg-studio-card text-studio-purple focus:ring-studio-purple"
                    />
                    <span>Enable Voice Synthesis & Dictation</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetSettings}
                  disabled={settingsSaving}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-600/50 bg-studio-card px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-studio-hover hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isTamil ? 'இயல்புநிலைக்கு மீட்டமை' : 'Reset to Defaults'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-studio-purple px-5 py-2 text-xs font-bold text-white hover:bg-studio-purple-dark transition-all disabled:opacity-50 shadow-md"
                >
                  {settingsSaving ? (
                    <>
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{isTamil ? 'அமைப்புகளைச் சேமி' : 'Save Preferences'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PROJECT MEMORY */}
          {/* ======================================================== */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-studio-border bg-studio-elevated/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Active Project Lore & Rules:
                    </span>
                    <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs font-semibold text-studio-purple-light">
                      {activeProject ? activeProject.title : 'No Project Selected'}
                    </span>
                  </div>

                  {memories.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearMemories}
                      className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Key world rules, character traits, and story facts saved here are automatically injected into the AI's prompt context so the assistant maintains continuous story fidelity.
                </p>
              </div>

              {/* Add New Memory Form */}
              {activeProject ? (
                <form
                  onSubmit={handleAddMemory}
                  className="rounded-xl border border-studio-border bg-studio-card p-3.5 space-y-3"
                >
                  <span className="text-xs font-bold text-white block">
                    {isTamil ? 'புதிய திட்ட நினைவகம் / விதியைச் சேர்' : 'Add Persistent Lore Rule / Memory'}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label htmlFor="memory-key" className="sr-only">Memory key</label>
                      <input
                        id="memory-key"
                        type="text"
                        placeholder="Key (e.g. dragon_sword)"
                        value={newMemoryKey}
                        onChange={(e) => setNewMemoryKey(e.target.value)}
                        className="w-full rounded-lg border border-studio-border bg-studio-elevated px-3 py-1.5 text-xs text-white focus:border-studio-purple focus:outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="memory-category" className="sr-only">Memory category</label>
                      <select
                        id="memory-category"
                        value={newMemoryCategory}
                        onChange={(e) => setNewMemoryCategory(e.target.value)}
                        className="w-full rounded-lg border border-studio-border bg-studio-elevated px-3 py-1.5 text-xs text-white focus:border-studio-purple focus:outline-none"
                      >
                        <option value="lore">Lore & World</option>
                        <option value="character">Character Trait</option>
                        <option value="rule">Rule / Magic System</option>
                        <option value="plot">Plot Point</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex items-center">
                      <button
                        type="submit"
                        disabled={!newMemoryKey.trim() || !newMemoryContent.trim()}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Lore Memory</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="memory-content" className="sr-only">Memory content</label>
                    <textarea
                      id="memory-content"
                      rows={2}
                      placeholder="Content (e.g. The sacred Dragon Katana emits violet flames and cannot harm innocent beings.)"
                      value={newMemoryContent}
                      onChange={(e) => setNewMemoryContent(e.target.value)}
                      className="w-full rounded-lg border border-studio-border bg-studio-elevated px-3 py-1.5 text-xs text-white focus:border-studio-purple focus:outline-none"
                    />
                  </div>
                </form>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-studio-elevated/40 rounded-xl border border-studio-border">
                  Select an active project from the top bar to manage its persistent lore memories.
                </div>
              )}

              {/* Memory List */}
              <div className="space-y-2">
                {loadingMemories ? (
                  <LoadingIndicator label="Loading project memories..." />
                ) : memoriesLoadError ? (
                  <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-center text-xs text-red-200">
                    <p>{memoriesLoadError}</p>
                    <button
                      type="button"
                      onClick={() => activeProject?.id && loadMemories(activeProject.id)}
                      className="mt-3 rounded-lg border border-red-400/30 px-3 py-1.5 hover:bg-red-500/10"
                    >
                      {isTamil ? 'மீண்டும் முயற்சி செய்' : 'Try again'}
                    </button>
                  </div>
                ) : memories.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-studio-border p-6 text-center text-xs text-slate-500">
                    No memories saved yet for this project. Add one above to lock persistent facts!
                  </div>
                ) : (
                  memories.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-studio-border bg-studio-elevated/60 p-3 hover:border-studio-purple/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{m.key}</span>
                          <span className="rounded-md border border-studio-border bg-studio-card px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 uppercase">
                            {m.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{m.content}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteMemory(m.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors shrink-0"
                        title="Delete memory"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: VOICE & AUDIO */}
          {/* ======================================================== */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-studio-border bg-studio-elevated/70 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/20 text-fuchsia-300">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Browser Neural Speech Engine</h3>
                    <p className="text-[11px] text-slate-400">
                      High-fidelity Web Speech API text-to-speech and microphone dictation for hands-free conversations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Voice Speed */}
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1 font-semibold">
                      <span>Playback Speed:</span>
                      <span className="text-studio-purple-light font-mono">{settings.voice_speed || 1.0}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.5"
                      step="0.05"
                      value={settings.voice_speed || 1.0}
                      onChange={(e) => setSettings({ ...settings, voice_speed: parseFloat(e.target.value) })}
                      className="w-full accent-studio-purple cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>0.8x (Deliberate)</span>
                      <span>1.0x (Normal)</span>
                      <span>1.5x (Fast)</span>
                    </div>
                  </div>

                  {/* Auto-Speak Toggle */}
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={settings.auto_speak_responses}
                        onChange={(e) =>
                          setSettings({ ...settings, auto_speak_responses: e.target.checked })
                        }
                        className="rounded border-studio-border bg-studio-card text-studio-purple focus:ring-studio-purple"
                      />
                      <span>Auto-Speak Assistant Responses</span>
                    </label>
                    <span className="text-[11px] text-slate-400 mt-1 pl-5">
                      Automatically pronounce replies aloud in Chat Studio
                    </span>
                  </div>
                </div>

                {/* Test Utterance Button */}
                <div className="border-t border-studio-border/60 pt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleTestSpeech}
                    disabled={isSpeakingTest}
                    className="flex items-center gap-2 rounded-lg bg-fuchsia-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-fuchsia-500 transition-colors disabled:opacity-50"
                  >
                    <Volume2 className={`h-4 w-4 ${isSpeakingTest ? 'animate-bounce' : ''}`} />
                    <span>{isSpeakingTest ? 'Playing Audio...' : 'Test Speech Utterance'}</span>
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Language: <strong className="text-white">{settings.language}</strong>
                  </span>
                </div>
              </div>

              {/* Save Voice Preferences */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={settingsSaving}
                  className="flex items-center gap-1.5 rounded-lg bg-studio-purple px-5 py-2 text-xs font-bold text-white hover:bg-studio-purple-dark transition-all disabled:opacity-50 shadow-md"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Audio Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-studio-border px-6 py-3 shrink-0 flex items-center justify-between bg-[#0C0E1B]">
          <span className="text-[11px] text-slate-500">
            Anime Studio AI • Free-First Engine v2.0
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-studio-purple px-5 py-2 text-xs font-semibold text-white hover:bg-studio-purple-dark transition-colors"
          >
            {isTamil ? 'முடிந்தது' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
