import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  LayoutGrid,
  FileText,
  Download,
  Sparkles,
  Layers,
  ChevronRight,
  SplitSquareVertical,
  Sliders,
  CheckCircle2,
  FolderOpen,
  Wand2,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  Volume2,
  Edit3,
  Undo2,
  Redo2,
  Save,
  HelpCircle,
  ExternalLink,
  Flame,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  getProjectMangaStories,
  getMangaStory,
  updateMangaStory,
  deleteMangaStory,
  generateMangaChapter,
  updateMangaChapter,
  deleteMangaChapter,
  addMangaScene,
  updateMangaScene,
  deleteMangaScene,
  addMangaPanel,
  updateMangaPanel,
  deleteMangaPanel,
  transformMangaScript,
  exportMangaStory
} from '../../services/api';
import MangaStoryWizard from '../manga/MangaStoryWizard';

export default function MangaStudio({ activeProject, language = 'en' }) {
  const isTamil = language === 'ta';

  // Navigation Tabs: 'editor' | 'overview' | 'grid' | 'export'
  const [activeTab, setActiveTab] = useState('editor');

  // Stories State
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [loadingStories, setLoadingStories] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Active Editor Navigation State
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  // Editing & UI State
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [aiTransformLoading, setAiTransformLoading] = useState(false);

  // Undo / Redo History Stack
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI Transform Modal / Prompt
  const [transformModalOpen, setTransformModalOpen] = useState(false);
  const [transformAction, setTransformAction] = useState('expand_scene');
  const [transformInstruction, setTransformInstruction] = useState('');

  // Chapter Rewrite Modal
  const [rewriteModalOpen, setRewriteModalOpen] = useState(false);
  const [rewriteFocusPrompt, setRewriteFocusPrompt] = useState('');

  // Initial load when activeProject changes
  useEffect(() => {
    if (activeProject && activeProject.id) {
      loadProjectStories(activeProject.id);
    } else {
      setStories([]);
      setActiveStory(null);
    }
  }, [activeProject]);

  const loadProjectStories = async (projectId) => {
    setLoadingStories(true);
    try {
      const data = await getProjectMangaStories(projectId);
      setStories(data || []);
      if (data && data.length > 0) {
        // Load first story
        loadStoryDetails(data[0].id);
      } else {
        setActiveStory(null);
      }
    } catch (err) {
      console.error('Failed to load project manga stories:', err);
    } finally {
      setLoadingStories(false);
    }
  };

  const loadStoryDetails = async (storyId) => {
    try {
      const full = await getMangaStory(storyId);
      setActiveStory(full);
      setActiveChapterIndex(0);
      setActiveSceneIndex(0);
      // Reset history
      setHistory([JSON.stringify(full)]);
      setHistoryIndex(0);
    } catch (err) {
      console.error('Failed to load manga story details:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Push to Undo history
  const updateStoryWithHistory = (newStory) => {
    const serialized = JSON.stringify(newStory);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(serialized);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setActiveStory(newStory);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setActiveStory(JSON.parse(history[prevIndex]));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setActiveStory(JSON.parse(history[nextIndex]));
    }
  };

  // Active items
  const currentChapter =
    activeStory && activeStory.chapters && activeStory.chapters[activeChapterIndex]
      ? activeStory.chapters[activeChapterIndex]
      : null;

  const currentScene =
    currentChapter && currentChapter.scenes && currentChapter.scenes[activeSceneIndex]
      ? currentChapter.scenes[activeSceneIndex]
      : null;

  // ========================================================
  // Panel Edits & Local Updates
  // ========================================================

  const handlePanelChange = (panelId, field, value) => {
    if (!activeStory || !currentChapter || !currentScene) return;

    const updated = { ...activeStory };
    const chap = updated.chapters[activeChapterIndex];
    const sc = chap.scenes[activeSceneIndex];
    const pIdx = sc.panels.findIndex((p) => p.id === panelId);

    if (pIdx !== -1) {
      sc.panels[pIdx] = { ...sc.panels[pIdx], [field]: value };
      updateStoryWithHistory(updated);
    }
  };

  const handleAddDialogue = (panelId) => {
    if (!activeStory || !currentChapter || !currentScene) return;

    const charNames = (activeStory.characters || []).map((c) => c.name);
    const defaultSpeaker = charNames[0] || 'Character';

    const updated = { ...activeStory };
    const chap = updated.chapters[activeChapterIndex];
    const sc = chap.scenes[activeSceneIndex];
    const pIdx = sc.panels.findIndex((p) => p.id === panelId);

    if (pIdx !== -1) {
      const targetPanel = sc.panels[pIdx];
      const dlgs = targetPanel.dialogues ? [...targetPanel.dialogues] : [];
      dlgs.push({
        character: defaultSpeaker,
        text: 'New dialogue line...',
        emotion: 'Neutral',
        dialogue_type: 'speech'
      });
      targetPanel.dialogues = dlgs;
      updateStoryWithHistory(updated);
    }
  };

  const handleRemoveDialogue = (panelId, dIdx) => {
    if (!activeStory || !currentChapter || !currentScene) return;

    const updated = { ...activeStory };
    const chap = updated.chapters[activeChapterIndex];
    const sc = chap.scenes[activeSceneIndex];
    const pIdx = sc.panels.findIndex((p) => p.id === panelId);

    if (pIdx !== -1) {
      const targetPanel = sc.panels[pIdx];
      const dlgs = targetPanel.dialogues.filter((_, idx) => idx !== dIdx);
      targetPanel.dialogues = dlgs;
      updateStoryWithHistory(updated);
    }
  };

  const handleAddSoundEffect = (panelId) => {
    if (!activeStory || !currentChapter || !currentScene) return;

    const updated = { ...activeStory };
    const chap = updated.chapters[activeChapterIndex];
    const sc = chap.scenes[activeSceneIndex];
    const pIdx = sc.panels.findIndex((p) => p.id === panelId);

    if (pIdx !== -1) {
      const targetPanel = sc.panels[pIdx];
      const sfxs = targetPanel.sound_effects ? [...targetPanel.sound_effects] : [];
      sfxs.push({
        text: 'ドドド',
        meaning: 'Rumble',
        visual_style: 'impact'
      });
      targetPanel.sound_effects = sfxs;
      updateStoryWithHistory(updated);
    }
  };

  const handleRemoveSoundEffect = (panelId, sIdx) => {
    if (!activeStory || !currentChapter || !currentScene) return;

    const updated = { ...activeStory };
    const chap = updated.chapters[activeChapterIndex];
    const sc = chap.scenes[activeSceneIndex];
    const pIdx = sc.panels.findIndex((p) => p.id === panelId);

    if (pIdx !== -1) {
      const targetPanel = sc.panels[pIdx];
      const sfxs = targetPanel.sound_effects.filter((_, idx) => idx !== sIdx);
      targetPanel.sound_effects = sfxs;
      updateStoryWithHistory(updated);
    }
  };

  const handleAddPanel = async () => {
    if (!currentScene) return;
    try {
      const newPanel = await addMangaPanel(currentScene.id, {
        shot_type: 'Medium Shot',
        instruction: 'New dramatic comic panel.'
      });
      loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'புதிய பேனல் சேர்க்கப்பட்டது!' : 'New comic panel added!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePanel = async (panelId) => {
    if (!window.confirm(isTamil ? 'இந்த பேனலை நீக்கவா?' : 'Delete this comic panel?')) return;
    try {
      await deleteMangaPanel(panelId);
      loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'பேனல் நீக்கப்பட்டது' : 'Panel removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddScene = async () => {
    if (!currentChapter) return;
    try {
      const createdScene = await addMangaScene(currentChapter.id, {
        action: 'create',
        tone: 'Dramatic'
      });
      await loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'புதிய காட்சி சேர்க்கப்பட்டது!' : 'New scene added!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteScene = async (sceneId) => {
    if (!window.confirm(isTamil ? 'இந்த காட்சியை முழுமையாக நீக்கவா?' : 'Delete this entire scene?')) return;
    try {
      await deleteMangaScene(sceneId);
      await loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'காட்சி நீக்கப்பட்டது' : 'Scene removed');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddChapter = async () => {
    if (!activeStory) return;
    try {
      setIsSaving(true);
      await generateMangaChapter(activeStory.id, {
        action: 'create',
        focus_prompt: 'Continue story with escalating tension.'
      });
      await loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'புதிய அத்தியாயம் வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Continuation chapter generated!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRewriteChapter = async () => {
    if (!currentChapter) return;
    try {
      setIsSaving(true);
      setRewriteModalOpen(false);
      await generateMangaChapter(activeStory.id, {
        chapter_number: currentChapter.chapter_number,
        action: 'rewrite',
        focus_prompt: rewriteFocusPrompt
      });
      await loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'அத்தியாயம் மாற்றி எழுதப்பட்டது!' : 'Chapter rewritten with AI!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================================
  // Granular AI Transformations
  // ========================================================

  const triggerAITransform = async (action, parameters = {}) => {
    if (!activeStory) return;
    setAiTransformLoading(true);

    try {
      const payload = {
        story_id: activeStory.id,
        chapter_id: currentChapter ? currentChapter.id : null,
        scene_id: currentScene ? currentScene.id : null,
        action: action,
        parameters: parameters
      };

      const res = await transformMangaScript(payload);
      await loadStoryDetails(activeStory.id);
      showToast(isTamil ? 'AI மாற்றம் வெற்றிகரமாக பயன்பட்டது!' : `AI action '${action}' applied successfully!`);
    } catch (err) {
      showToast(err.message || 'Transform action failed', 'error');
    } finally {
      setAiTransformLoading(false);
      setTransformModalOpen(false);
    }
  };

  // Save All Changes to Backend
  const handleSaveAll = async () => {
    if (!activeStory) return;
    setIsSaving(true);
    try {
      // 1. Update story high-level metadata
      await updateMangaStory(activeStory.id, {
        title: activeStory.title,
        synopsis: activeStory.synopsis,
        world_building: activeStory.world_building
      });

      // 2. Persist updated panels in current scene
      if (currentScene && currentScene.panels) {
        for (const p of currentScene.panels) {
          await updateMangaPanel(p.id, {
            shot_type: p.shot_type,
            camera_angle: p.camera_angle,
            visual_description: p.visual_description,
            dialogues: p.dialogues,
            sound_effects: p.sound_effects,
            narration: p.narration,
            emotion: p.emotion
          });
        }
      }

      showToast(isTamil ? 'அனைத்து மாற்றங்களும் சேமிக்கப்பட்டன!' : 'All manga edits saved to database!');
    } catch (err) {
      showToast(err.message || 'Failed to save changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Export handlers
  const handleExportDownload = async (format) => {
    if (!activeStory) return;
    try {
      const content = await exportMangaStory(activeStory.id, format);
      const blob = new Blob([content], {
        type: format === 'markdown' ? 'text/markdown' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeStory.title.replace(/\s+/g, '_')}_script.${format === 'markdown' ? 'md' : 'json'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Exported ${activeStory.title} as ${format.toUpperCase()}`);
    } catch (err) {
      showToast(`Failed to export: ${err.message}`, 'error');
    }
  };

  const shotTypeOptions = [
    'Wide Shot',
    'Close-Up',
    'Extreme Close-Up',
    'Dutch Angle',
    'Over the Shoulder',
    'Splash Page',
    'Low Angle',
    'High Angle'
  ];

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* Studio Header & Story Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 text-studio-cyan" />
              <span>{isTamil ? 'மங்கா ஸ்டுடியோ' : 'Manga Studio'}</span>
              <span className="rounded-md border border-studio-cyan/30 bg-studio-cyan/10 px-2 py-0.5 text-xs font-bold text-studio-cyan">
                Phase 3 Engine
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'முழு மங்கா அத்தியாயங்கள், காட்சிகள், பேனல் விளக்கங்கள் மற்றும் வசனங்களை உருவாக்கி திருத்தவும்'
              : 'Synthesize user ideas into publication-ready structured comic chapters, scenes, and panel dialogues'}
          </p>
        </div>

        {/* Action Controls & Wizard Launcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Story Selector Dropdown */}
          <div className="relative">
            <select
              value={activeStory ? activeStory.id : ''}
              onChange={(e) => loadStoryDetails(e.target.value)}
              disabled={loadingStories || stories.length === 0}
              className="appearance-none rounded-xl border border-studio-border bg-studio-card py-2 pl-3 pr-8 text-xs font-semibold text-white focus:border-studio-cyan focus:outline-none max-w-[200px] truncate cursor-pointer"
            >
              {stories.length === 0 && <option value="">No Manga Stories Yet</option>}
              {stories.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.title} ({st.chapters.length} Ch.)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-studio-cyan to-blue-600 px-4 py-2 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span>{isTamil ? 'புதிய மங்கா கதை' : 'New Story Wizard'}</span>
          </button>
        </div>
      </div>

      {/* Global Toast */}
      {toast && (
        <div
          className={`rounded-xl border p-3 text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in duration-200 ${
            toast.type === 'error'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">×</button>
        </div>
      )}

      {/* Navigation Sub-Tabs & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-studio-border pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'editor'
                ? 'border-studio-cyan text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="h-4 w-4 text-studio-cyan" />
            <span>{isTamil ? 'திரைக்கதை எடிட்டர்' : 'Screenplay Editor'}</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-studio-cyan text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="h-4 w-4 text-studio-purple-light" />
            <span>{isTamil ? 'கதை மேலோட்டம் & பாத்திரங்கள்' : 'Story Bible & Characters'}</span>
            {activeStory && (
              <span className="rounded-full bg-studio-purple/20 px-1.5 py-0.2 text-[10px] text-studio-purple-light font-bold">
                {activeStory.characters.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'grid'
                ? 'border-studio-cyan text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-emerald-400" />
            <span>{isTamil ? 'பேனல் தளவமைப்பு கிரிட்' : 'Panel Grid Layout'}</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 py-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-studio-cyan text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="h-4 w-4 text-fuchsia-400" />
            <span>{isTamil ? 'வெளியீடு & ஏற்றுமதி' : 'Publish & Export'}</span>
          </button>
        </div>

        {/* Editor Action Buttons (Undo, Redo, Save, AI Tools) */}
        {activeTab === 'editor' && activeStory && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg border border-studio-border bg-studio-card text-slate-400 hover:text-white disabled:opacity-40"
              title="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg border border-studio-border bg-studio-card text-slate-400 hover:text-white disabled:opacity-40"
              title="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setTransformAction('add_twist');
                setTransformModalOpen(true);
              }}
              disabled={aiTransformLoading}
              className="flex items-center gap-1.5 rounded-lg border border-studio-purple/40 bg-studio-purple/10 px-2.5 py-1.5 text-xs font-bold text-studio-purple-light hover:bg-studio-purple hover:text-white transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isTamil ? 'திருப்பம் சேர்' : 'Add Plot Twist'}</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSaving ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isTamil ? 'சேமி' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* EMPTY STATE: NO STORIES YET */}
      {/* ======================================================== */}
      {!loadingStories && stories.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-studio-border bg-studio-card/60 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-studio-cyan/10 text-studio-cyan">
            <BookOpen className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {isTamil ? 'மங்கா கதைகள் எதுவும் உருவாக்கப்படவில்லை' : 'No Manga Stories Created Yet'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isTamil
                ? 'உங்கள் யோசனையை உடனடியாக முழு அத்தியாயங்கள், காட்சிகள் மற்றும் பேனல் ஸ்கிரிப்ட்களாக மாற்ற "புதிய மங்கா கதை" பொத்தானை அழுத்தவும்.'
                : 'Launch the Manga Story Wizard to generate multi-chapter comic screenplays complete with character dialogues and shot framing.'}
            </p>
          </div>

          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-studio-cyan to-blue-600 px-5 py-2.5 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isTamil ? 'முதல் கதையை உருவாக்கவும்' : 'Launch Story Creation Wizard'}</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: SCREENPLAY EDITOR */}
      {/* ======================================================== */}
      {activeTab === 'editor' && activeStory && (
        <div className="space-y-5">
          {/* Chapter Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-studio-border/70 pb-2 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              {(activeStory.chapters || []).map((chap, idx) => (
                <button
                  key={chap.id}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setActiveSceneIndex(0);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    activeChapterIndex === idx
                      ? 'bg-studio-cyan text-black shadow-md'
                      : 'border border-studio-border bg-studio-card text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Ch. {chap.chapter_number}</span>
                  <span className="max-w-[120px] truncate text-[11px] font-medium opacity-90">
                    {chap.title}
                  </span>
                </button>
              ))}

              <button
                onClick={handleAddChapter}
                disabled={isSaving}
                className="flex items-center gap-1 rounded-xl border border-dashed border-studio-border bg-studio-card/80 px-3 py-1.5 text-xs font-semibold text-studio-cyan hover:border-studio-cyan transition-colors"
                title="Generate next chapter with AI continuity"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isTamil ? 'அடுத்த அத்தியாயம்' : 'Add Chapter'}</span>
              </button>
            </div>

            {currentChapter && (
              <button
                onClick={() => setRewriteModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-semibold text-studio-purple-light hover:underline shrink-0"
              >
                <RefreshCw className="h-3 w-3" />
                <span>{isTamil ? 'அத்தியாயத்தை மாற்றி எழுது' : 'Rewrite Chapter with AI'}</span>
              </button>
            )}
          </div>

          {/* Chapter Summary & Cliffhanger Banner */}
          {currentChapter && (
            <div className="rounded-xl border border-studio-border bg-studio-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chapter {currentChapter.chapter_number}: {currentChapter.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {currentChapter.scenes.length} Scenes • {currentChapter.scenes.reduce((acc, s) => acc + s.panels.length, 0)} Comic Panels
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentChapter.summary}</p>
              {currentChapter.cliffhanger && (
                <div className="rounded-lg border border-studio-purple/30 bg-studio-purple/10 p-2 text-xs text-studio-purple-light flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 shrink-0" />
                  <span><strong>Cliffhanger Hook:</strong> {currentChapter.cliffhanger}</span>
                </div>
              )}
            </div>
          )}

          {/* Scene Selector & Panel Layout Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Scenes Navigation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Scenes ({currentChapter ? currentChapter.scenes.length : 0})
                </span>
                <button
                  onClick={handleAddScene}
                  className="flex items-center gap-1 text-[11px] font-bold text-studio-cyan hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Scene</span>
                </button>
              </div>

              <div className="space-y-2">
                {currentChapter &&
                  currentChapter.scenes.map((sc, sIdx) => (
                    <div
                      key={sc.id}
                      onClick={() => setActiveSceneIndex(sIdx)}
                      className={`rounded-xl border p-3 cursor-pointer transition-all ${
                        activeSceneIndex === sIdx
                          ? 'border-studio-cyan bg-studio-elevated shadow-glow-cyan'
                          : 'border-studio-border bg-studio-card hover:border-studio-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white truncate">
                          Scene {sc.scene_number}: {sc.title}
                        </span>
                        <span className="rounded-md border border-studio-border bg-studio-card px-1.5 py-0.2 text-[9px] font-bold text-studio-purple-light uppercase">
                          {sc.mood || 'Dramatic'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{sc.location || 'Location'}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{sc.panels.length} Panels</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScene(sc.id);
                          }}
                          className="hover:text-rose-400 p-0.5"
                          title="Delete scene"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Scene AI Tools */}
              {currentScene && (
                <div className="rounded-xl border border-studio-border bg-studio-card p-3 space-y-2 pt-3">
                  <span className="text-[11px] font-bold text-white block uppercase tracking-wider">
                    Scene AI Enhancements
                  </span>
                  <button
                    onClick={() => {
                      setTransformAction('expand_scene');
                      setTransformModalOpen(true);
                    }}
                    className="w-full text-left rounded-lg border border-studio-border bg-studio-elevated p-2 text-xs text-slate-300 hover:border-studio-cyan hover:text-white transition-colors"
                  >
                    + Expand Scene Depth
                  </button>
                  <button
                    onClick={() => {
                      setTransformAction('improve_dialogue');
                      setTransformModalOpen(true);
                    }}
                    className="w-full text-left rounded-lg border border-studio-border bg-studio-elevated p-2 text-xs text-slate-300 hover:border-studio-cyan hover:text-white transition-colors"
                  >
                    ✨ Sharpen Character Dialogue
                  </button>
                  <button
                    onClick={() => {
                      setTransformAction('change_tone');
                      setTransformModalOpen(true);
                    }}
                    className="w-full text-left rounded-lg border border-studio-border bg-studio-elevated p-2 text-xs text-slate-300 hover:border-studio-cyan hover:text-white transition-colors"
                  >
                    🎭 Change Scene Tone
                  </button>
                </div>
              )}
            </div>

            {/* Right 3 Columns: Panels Script Cards */}
            <div className="lg:col-span-3 space-y-4">
              {currentScene ? (
                <>
                  {/* Current Scene Header */}
                  <div className="rounded-xl border border-studio-border bg-studio-card p-4 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-studio-cyan">
                          Scene {currentScene.scene_number}:
                        </span>
                        <input
                          type="text"
                          value={currentScene.title}
                          onChange={(e) => {
                            const updated = { ...activeStory };
                            updated.chapters[activeChapterIndex].scenes[activeSceneIndex].title = e.target.value;
                            updateStoryWithHistory(updated);
                          }}
                          className="bg-transparent font-bold text-sm text-white focus:outline-none focus:border-b border-studio-cyan"
                        />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Location:</span>
                        <input
                          type="text"
                          value={currentScene.location}
                          onChange={(e) => {
                            const updated = { ...activeStory };
                            updated.chapters[activeChapterIndex].scenes[activeSceneIndex].location = e.target.value;
                            updateStoryWithHistory(updated);
                          }}
                          className="bg-studio-elevated rounded-lg px-2 py-0.5 text-xs text-white border border-studio-border focus:outline-none focus:border-studio-cyan"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{currentScene.description}</p>
                  </div>

                  {/* Panels List */}
                  <div className="space-y-4">
                    {currentScene.panels.map((panel, pIdx) => (
                      <div
                        key={panel.id}
                        className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4 shadow-md hover:border-studio-cyan/40 transition-colors"
                      >
                        {/* Panel Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-studio-border/60 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-studio-cyan/20 text-studio-cyan font-bold text-xs">
                              #{panel.panel_number}
                            </span>

                            {/* Shot Type Selector */}
                            <select
                              value={panel.shot_type || 'Medium Shot'}
                              onChange={(e) => handlePanelChange(panel.id, 'shot_type', e.target.value)}
                              className="rounded-lg border border-studio-border bg-studio-elevated px-2.5 py-1 text-xs font-semibold text-studio-cyan focus:outline-none focus:border-studio-cyan"
                            >
                              {shotTypeOptions.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>

                            {/* Camera Angle */}
                            <input
                              type="text"
                              value={panel.camera_angle || 'Eye Level'}
                              onChange={(e) => handlePanelChange(panel.id, 'camera_angle', e.target.value)}
                              placeholder="Camera Angle"
                              className="rounded-lg border border-studio-border bg-studio-elevated px-2 py-1 text-xs text-slate-300 w-28 focus:outline-none focus:border-studio-cyan"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => triggerAITransform('regenerate_panel', { shot_type: panel.shot_type })}
                              className="flex items-center gap-1 rounded-lg border border-studio-purple/30 bg-studio-purple/10 px-2 py-1 text-[11px] font-semibold text-studio-purple-light hover:bg-studio-purple hover:text-white transition-colors"
                              title="Regenerate artwork description"
                            >
                              <Wand2 className="h-3 w-3" />
                              <span>AI Prompt</span>
                            </button>

                            <button
                              onClick={() => handleDeletePanel(panel.id)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete panel"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Visual Description (Artwork Specification) */}
                        <div className="space-y-1">
                          <label className="text-[11px] uppercase font-bold text-slate-400 block">
                            Artwork Visual Description (For Manga Artist / Diffusion Model):
                          </label>
                          <textarea
                            rows={3}
                            value={panel.visual_description}
                            onChange={(e) => handlePanelChange(panel.id, 'visual_description', e.target.value)}
                            className="w-full rounded-xl border border-studio-border bg-studio-elevated p-3 text-xs text-white focus:border-studio-cyan focus:outline-none leading-relaxed resize-none"
                            placeholder="Describe character pose, background scenery, lighting, and action dynamics..."
                          />
                        </div>

                        {/* Character Dialogues Editor */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-studio-purple-light" />
                              <span>Character Dialogues & Thoughts:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddDialogue(panel.id)}
                              className="text-[11px] font-bold text-studio-purple-light hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Line</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(panel.dialogues || []).length === 0 ? (
                              <div className="text-[11px] text-slate-500 italic p-2 bg-studio-elevated/40 rounded-lg">
                                Silent comic frame or atmospheric beat.
                              </div>
                            ) : (
                              panel.dialogues.map((dlg, dIdx) => (
                                <div
                                  key={dIdx}
                                  className="flex items-center gap-2 rounded-xl border border-studio-border bg-studio-elevated/80 p-2 text-xs"
                                >
                                  <input
                                    type="text"
                                    value={dlg.character}
                                    onChange={(e) => {
                                      const updatedDlgs = [...panel.dialogues];
                                      updatedDlgs[dIdx].character = e.target.value;
                                      handlePanelChange(panel.id, 'dialogues', updatedDlgs);
                                    }}
                                    placeholder="Speaker"
                                    className="w-24 rounded-lg border border-studio-border bg-studio-card px-2 py-1 font-bold text-studio-cyan text-xs focus:outline-none"
                                  />

                                  <input
                                    type="text"
                                    value={dlg.text}
                                    onChange={(e) => {
                                      const updatedDlgs = [...panel.dialogues];
                                      updatedDlgs[dIdx].text = e.target.value;
                                      handlePanelChange(panel.id, 'dialogues', updatedDlgs);
                                    }}
                                    placeholder="Dialogue speech line..."
                                    className="flex-1 rounded-lg border border-studio-border bg-studio-card px-2.5 py-1 text-white text-xs focus:outline-none"
                                  />

                                  <select
                                    value={dlg.emotion}
                                    onChange={(e) => {
                                      const updatedDlgs = [...panel.dialogues];
                                      updatedDlgs[dIdx].emotion = e.target.value;
                                      handlePanelChange(panel.id, 'dialogues', updatedDlgs);
                                    }}
                                    className="rounded-lg border border-studio-border bg-studio-card px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                                  >
                                    <option value="Determined">Determined</option>
                                    <option value="Shocked">Shocked</option>
                                    <option value="Angry">Angry</option>
                                    <option value="Smiling">Smiling</option>
                                    <option value="Tearful">Tearful</option>
                                    <option value="Whisper">Whisper</option>
                                  </select>

                                  <button
                                    onClick={() => handleRemoveDialogue(panel.id, dIdx)}
                                    className="text-slate-500 hover:text-rose-400 p-1"
                                    title="Remove dialogue"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Sound Effects (Onomatopoeia) Chips */}
                        <div className="space-y-2 pt-1 border-t border-studio-border/50">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Manga Sound Effects (SFX / 擬音):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddSoundEffect(panel.id)}
                              className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add SFX</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {(panel.sound_effects || []).map((sfx, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-1.5 rounded-lg border border-studio-border bg-studio-elevated px-2 py-1 text-xs"
                              >
                                <span className="font-mono font-bold text-emerald-400">{sfx.text}</span>
                                <span className="text-slate-400 text-[10px]">({sfx.meaning})</span>
                                <button
                                  onClick={() => handleRemoveSoundEffect(panel.id, sIdx)}
                                  className="text-slate-500 hover:text-rose-400 text-xs ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Panel Button */}
                    <button
                      onClick={handleAddPanel}
                      className="w-full py-3.5 rounded-2xl border-2 border-dashed border-studio-border hover:border-studio-cyan bg-studio-card/40 hover:bg-studio-card text-xs font-bold text-studio-cyan flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isTamil ? 'புதிய காமிக் பேனலைச் சேர்' : 'Add Comic Panel'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 rounded-xl border border-studio-border bg-studio-card">
                  Select a scene from the left sidebar to view and author comic panels.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STORY BIBLE / OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && activeStory && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story Synopsis Card */}
            <div className="md:col-span-2 rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-studio-border/70 pb-3">
                <div>
                  <span className="rounded-md border border-studio-cyan/30 bg-studio-cyan/10 px-2 py-0.5 text-[10px] font-bold text-studio-cyan uppercase">
                    {activeStory.genre} • {activeStory.target_audience}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{activeStory.title}</h2>
                </div>
                <span className="text-xs text-slate-400">
                  Setting: <strong className="text-white">{activeStory.setting || 'Neo-Edo'}</strong>
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Narrative Synopsis:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-studio-elevated/50 rounded-xl p-4 border border-studio-border">
                  {activeStory.synopsis}
                </p>
              </div>

              {activeStory.world_building && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    World Canon & Power System Rules:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-studio-elevated/50 rounded-xl p-4 border border-studio-border">
                    {activeStory.world_building}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Metrics & Production Stats */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3 shadow-lg">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Production Blueprint
                </span>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-studio-border/60 pb-1.5">
                    <span>Total Chapters:</span>
                    <strong className="text-studio-cyan">{activeStory.chapters.length}</strong>
                  </div>
                  <div className="flex justify-between border-b border-studio-border/60 pb-1.5">
                    <span>Total Scenes:</span>
                    <strong className="text-white">
                      {activeStory.chapters.reduce((acc, c) => acc + c.scenes.length, 0)}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-studio-border/60 pb-1.5">
                    <span>Total Comic Panels:</span>
                    <strong className="text-studio-purple-light">
                      {activeStory.chapters.reduce(
                        (acc, c) => acc + c.scenes.reduce((pAcc, sc) => pAcc + sc.panels.length, 0),
                        0
                      )}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tone:</span>
                    <strong className="text-white">{activeStory.tone}</strong>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-studio-purple/30 bg-studio-purple/10 p-5 space-y-2">
                <span className="text-xs font-bold text-studio-purple-light flex items-center gap-1.5">
                  <Flame className="h-4 w-4" />
                  <span>Central Conflict & Climax</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeStory.main_conflict || 'The protagonist battles against an overwhelming cosmic or human destiny.'}
                </p>
              </div>
            </div>
          </div>

          {/* Character Dossiers Grid (Prepared for Phase 4) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Character Profiles & Visual Seeds (Ready for Phase 4 Character Studio)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeStory.characters || []).map((char) => (
                <div
                  key={char.id}
                  className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-bold text-studio-cyan uppercase">
                        {char.role}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">{char.name}</h4>
                      <span className="text-xs text-slate-400">Age: {char.age || 'Unknown'}</span>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-studio-cyan/10 text-studio-cyan">
                      <User className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div><strong>Hair:</strong> {char.hair || 'N/A'}</div>
                    <div><strong>Eyes:</strong> {char.eye_color || 'N/A'}</div>
                    <div><strong>Attire:</strong> {char.clothing || 'N/A'}</div>
                    <div><strong>Signature:</strong> {char.abilities || 'N/A'}</div>
                  </div>

                  {char.visual_prompt && (
                    <div className="border-t border-studio-border/70 pt-2 text-[10px] font-mono text-slate-400 line-clamp-2">
                      Prompt: {char.visual_prompt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COMIC PANEL GRID LAYOUT (Phase 7 Preview) */}
      {/* ======================================================== */}
      {activeTab === 'grid' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="rounded-xl border border-studio-border bg-studio-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">4-Koma & Shonen Dynamic Grid Composer</h3>
              <p className="text-xs text-slate-400">
                Visual panel layout preview of current chapter scenes mapped to standard manga printing specifications.
              </p>
            </div>
            <span className="rounded-md border border-studio-cyan/30 bg-studio-cyan/10 px-2 py-0.5 text-[10px] font-bold text-studio-cyan">
              Phase 7 Ready
            </span>
          </div>

          {currentScene ? (
            <div className="rounded-2xl border border-studio-border bg-studio-elevated/40 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScene.panels.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border-2 border-studio-border bg-black/60 p-4 min-h-[160px] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Panel #{p.panel_number}</span>
                      <span className="rounded bg-studio-card px-2 py-0.5 text-[10px] font-mono text-studio-cyan">
                        {p.shot_type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic my-2">{p.visual_description}</p>

                    <div className="space-y-1">
                      {p.sound_effects && p.sound_effects.length > 0 && (
                        <div className="text-[11px] font-bold text-emerald-400 font-mono">
                          {p.sound_effects.map((s) => s.text).join(' ')}
                        </div>
                      )}
                      {p.dialogues && p.dialogues.length > 0 && (
                        <div className="text-[11px] text-white font-medium">
                          <strong>{p.dialogues[0].character}:</strong> "{p.dialogues[0].text}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 bg-studio-card rounded-xl">
              No active scenes loaded.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: PUBLISH & EXPORT */}
      {/* ======================================================== */}
      {activeTab === 'export' && activeStory && (
        <div className="rounded-2xl border border-studio-border bg-studio-card p-8 text-center max-w-lg mx-auto space-y-5 animate-in fade-in duration-150 shadow-2xl">
          <Download className="h-12 w-12 text-studio-cyan mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Export Complete Manga Screenplay</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download your full structured screenplay for publication, table reads, or downstream AI comic page generation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleExportDownload('markdown')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-studio-cyan to-blue-600 px-5 py-2.5 text-xs font-bold text-black hover:opacity-95 transition-all shadow-md"
            >
              <FileText className="h-4 w-4" />
              <span>Download Markdown (.md)</span>
            </button>

            <button
              onClick={() => handleExportDownload('json')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-studio-border bg-studio-elevated px-5 py-2.5 text-xs font-bold text-white hover:bg-studio-hover transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Download Structured JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS: STORY CREATION WIZARD */}
      {/* ======================================================== */}
      <MangaStoryWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        activeProject={activeProject}
        onStoryCreated={(created) => {
          loadProjectStories(activeProject.id);
          showToast(`Manga Story '${created.title}' generated successfully!`);
        }}
        language={language}
      />

      {/* MODALS: REWRITE CHAPTER MODAL */}
      {rewriteModalOpen && currentChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Rewrite Chapter {currentChapter.chapter_number}
              </h3>
              <button onClick={() => setRewriteModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Provide instructions or focus points to rewrite this chapter with heightened drama, pacing, and visual impact.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Heighten the emotional sacrifice; make Kenjiro's betrayal more sudden and shocking..."
              value={rewriteFocusPrompt}
              onChange={(e) => setRewriteFocusPrompt(e.target.value)}
              className="w-full rounded-xl border border-studio-border bg-studio-elevated p-3 text-xs text-white focus:border-studio-cyan focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRewriteModalOpen(false)}
                className="rounded-lg border border-studio-border px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRewriteChapter}
                className="rounded-lg bg-studio-cyan px-4 py-1.5 text-xs font-bold text-black hover:bg-cyan-400"
              >
                Rewrite with AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS: AI TRANSFORM MODAL */}
      {transformModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-studio-border bg-studio-card p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white capitalize">
                {transformAction.replace('_', ' ')}
              </h3>
              <button onClick={() => setTransformModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Targeted AI action on current scene or chapter.
            </p>
            <textarea
              rows={3}
              placeholder="Custom instructions (e.g. Introduce a shocking betrayal / make dialogues more poetic)..."
              value={transformInstruction}
              onChange={(e) => setTransformInstruction(e.target.value)}
              className="w-full rounded-xl border border-studio-border bg-studio-elevated p-3 text-xs text-white focus:border-studio-cyan focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTransformModalOpen(false)}
                className="rounded-lg border border-studio-border px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => triggerAITransform(transformAction, { instruction: transformInstruction })}
                className="rounded-lg bg-studio-cyan px-4 py-1.5 text-xs font-bold text-black hover:bg-cyan-400"
              >
                Execute Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
