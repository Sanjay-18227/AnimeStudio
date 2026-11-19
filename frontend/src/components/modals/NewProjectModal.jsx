import React, { useState } from 'react';
import { X, FolderPlus, Sparkles } from 'lucide-react';

export default function NewProjectModal({ isOpen, onClose, onCreateProject, language = 'en' }) {
  const isTamil = language === 'ta';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'Shonen',
    target_audience: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError(isTamil ? 'தலைப்பு தேவை' : 'Title is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onCreateProject(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const genres = [
    'Shonen',
    'Seinen',
    'Shojo',
    'Isekai',
    'Cyberpunk Anime',
    'Dark Fantasy',
    'Mecha',
    'Supernatural',
    'Slice of Life',
    'Psychological Thriller'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-studio-border bg-studio-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-border pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-studio-purple/20 text-studio-purple-light">
              <FolderPlus className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">
              {isTamil ? 'புதிய அனிம்/மங்கா திட்டம்' : 'Create New Anime Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-studio-hover hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isTamil ? 'திட்டத்தின் தலைப்பு *' : 'Project Title *'}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={isTamil ? 'எ.கா., நிழல் வேட்டைக்காரன்' : 'e.g., Shadow Awakener: Neo Tokyo'}
              className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-studio-purple focus:outline-none focus:ring-1 focus:ring-studio-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {isTamil ? 'கதை சுருக்கம் / சினாப்சிஸ்' : 'Synopsis / Premise'}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={isTamil ? 'கதையின் முக்கிய நிகழ்வுகள் மற்றும் உலகம்...' : 'Brief story logline, world setting, core conflict...'}
              className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-studio-purple focus:outline-none focus:ring-1 focus:ring-studio-purple resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isTamil ? 'வகை (Genre)' : 'Genre'}
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isTamil ? 'பார்வையாளர்கள்' : 'Target Audience'}
              </label>
              <select
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                className="w-full rounded-xl border border-studio-border bg-studio-elevated px-3 py-2 text-xs text-white focus:border-studio-purple focus:outline-none"
              >
                <option value="Shonen (Teens)">Shonen (Teens)</option>
                <option value="Seinen (Mature / Adults)">Seinen (Mature)</option>
                <option value="Shojo (Romantic / Drama)">Shojo</option>
                <option value="General Audiences">General Audiences</option>
              </select>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-studio-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-studio-border px-4 py-2 text-xs font-medium text-slate-300 hover:bg-studio-hover hover:text-white transition-colors"
            >
              {isTamil ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-studio-purple to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-glow-purple hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{loading ? (isTamil ? 'உருவாக்குகிறது...' : 'Creating...') : (isTamil ? 'திட்டத்தை உருவாக்கு' : 'Create Project')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

