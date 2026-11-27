import React, { useEffect, useRef, useState } from 'react';
import { FolderOpen, Plus, UserSquare2, Trash2, Edit3, X, Save } from 'lucide-react';
import {
  getProjectCharacters,
  createProjectCharacter,
  updateProjectCharacter,
  deleteProjectCharacter
} from '../../services/api';
import LoadingIndicator from '../ui/LoadingIndicator';

const emptyCharacter = {
  name: '',
  age: '',
  role: 'Protagonist',
  background: '',
  appearance: '',
  hairstyle: '',
  clothing: '',
  personality: '',
  abilities: '',
  reference_image_url: ''
};

function ReferenceImage({ url, alt, isTamil, className = '' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url) return null;

  if (failed) {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-lg border border-studio-border bg-studio-elevated text-xs text-slate-400 ${className}`}>
        <UserSquare2 aria-hidden="true" className="h-5 w-5 shrink-0 text-fuchsia-400" />
        <span>{isTamil ? 'குறிப்பு படம் கிடைக்கவில்லை' : 'Reference image unavailable'}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-lg border border-studio-border bg-studio-elevated object-cover ${className}`}
    />
  );
}

export default function CharacterStudio({ activeProject, language = 'en', onNotify }) {
  const isTamil = language === 'ta';
  const projectId = activeProject?.id;
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [charactersProjectId, setCharactersProjectId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [reloadVersion, setReloadVersion] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCharacter);
  const [formProjectId, setFormProjectId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const dialogRef = useRef(null);
  const modalTriggerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setCharacters([]);
    setCharactersProjectId(projectId);
    setLoadError('');

    if (!projectId) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProjectCharacters(projectId)
      .then((items) => {
        if (!cancelled) {
          setCharacters(items);
          setCharactersProjectId(projectId);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setLoadError(error.message || '');
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [projectId, reloadVersion]);

  useEffect(() => {
    setModalOpen(false);
    setEditing(null);
    setFormProjectId(null);
  }, [projectId]);

  useEffect(() => {
    if (modalOpen) {
      const frame = window.requestAnimationFrame(() => {
        dialogRef.current?.querySelector('input, textarea, button')?.focus();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    if (modalTriggerRef.current?.isConnected) {
      modalTriggerRef.current.focus();
    }
    return undefined;
  }, [modalOpen]);

  const openCreate = () => {
    modalTriggerRef.current = document.activeElement;
    setEditing(null);
    setForm(emptyCharacter);
    setFormProjectId(projectId);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (character) => {
    modalTriggerRef.current = document.activeElement;
    setEditing(character);
    setFormProjectId(projectId);
    setFormError('');
    setForm({
      name: character.name || '',
      age: character.age || '',
      role: character.role || 'Protagonist',
      background: character.background || '',
      appearance: character.appearance || '',
      hairstyle: character.hairstyle || '',
      clothing: character.clothing || '',
      personality: character.personality || '',
      abilities: character.abilities || '',
      reference_image_url: character.reference_image_url || ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (savingRef.current) return;
    setModalOpen(false);
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (savingRef.current || !projectId || formProjectId !== projectId) return;
    savingRef.current = true;
    setSaving(true);
    setFormError('');
    const saveProjectId = projectId;
    try {
      const saved = editing
        ? await updateProjectCharacter(saveProjectId, editing.id, form)
        : await createProjectCharacter(saveProjectId, form);
      if (projectIdRef.current === saveProjectId) {
        setCharacters((items) => editing
          ? items.map((item) => item.id === saved.id ? saved : item)
          : [saved, ...items]);
        setModalOpen(false);
        onNotify?.('success', isTamil ? 'கதாபாத்திரம் சேமிக்கப்பட்டது.' : 'Character saved.');
      }
    } catch (error) {
      setFormError(error.message || (isTamil ? 'கதாபாத்திரத்தைச் சேமிக்க முடியவில்லை.' : 'Unable to save character.'));
      onNotify?.('error', error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async (character) => {
    if (!projectId) return;
    if (!window.confirm(isTamil ? `“${character.name}” கதாபாத்திரத்தை நீக்க வேண்டுமா?` : `Delete "${character.name}"?`)) return;
    try {
      const deleteProjectId = projectId;
      await deleteProjectCharacter(deleteProjectId, character.id);
      if (projectIdRef.current === deleteProjectId) {
        setCharacters((items) => items.filter((item) => item.id !== character.id));
        onNotify?.('success', isTamil ? 'கதாபாத்திரம் நீக்கப்பட்டது.' : 'Character deleted.');
      }
    } catch (error) {
      onNotify?.('error', error.message);
    }
  };

  const fields = [
    ['name', isTamil ? 'பெயர்' : 'Name', 'text', true],
    ['age', isTamil ? 'வயது' : 'Age', 'text', false],
    ['role', isTamil ? 'பங்கு' : 'Role', 'text', false],
    ['hairstyle', isTamil ? 'சிகை' : 'Hairstyle', 'text', false],
    ['clothing', isTamil ? 'உடை' : 'Clothing', 'text', false],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-studio-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2.5">
            <UserSquare2 className="h-6 w-6 text-fuchsia-400" />
            {isTamil ? 'கேரக்டர் ஸ்டுடியோ' : 'Character Studio'}
            <span className="rounded-md border border-studio-border bg-studio-card px-2 py-0.5 text-xs text-fuchsia-400">Phase 4</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil ? 'கதாபாத்திரத் தோற்றமும் உத்திகளும் ஒரே திட்டத்தில் நிலையாக சேமிக்கப்படும்.' : 'Create persistent character profiles and visual consistency seeds.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-studio-border bg-studio-card px-3 py-2 text-xs flex items-center gap-2 max-w-[220px]">
            <FolderOpen className="h-3.5 w-3.5 text-studio-purple-light" />
            <span className="truncate">{activeProject?.title || (isTamil ? 'திட்டம் இல்லை' : 'No Project Active')}</span>
          </div>
          <button type="button" onClick={openCreate} disabled={!activeProject} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            <Plus className="h-4 w-4" /> {isTamil ? 'புதிய கதாபாத்திரம்' : 'Create Character'}
          </button>
        </div>
      </div>

      {!activeProject ? (
        <div className="rounded-2xl border border-studio-border bg-studio-card p-10 text-center text-sm text-slate-400">
          {isTamil ? 'கதாபாத்திரம் உருவாக்க ஒரு திட்டத்தைத் தேர்ந்தெடுக்கவும்.' : 'Select or create a project to manage characters.'}
        </div>
      ) : loading || charactersProjectId !== projectId ? (
        <div className="py-16"><LoadingIndicator label={isTamil ? 'கதாபாத்திரங்கள் ஏற்றப்படுகின்றன...' : 'Loading characters...'} /></div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
          <p className="text-sm text-red-200">{loadError || (isTamil ? 'கதாபாத்திரங்களை ஏற்ற முடியவில்லை.' : 'Unable to load characters.')}</p>
          <button type="button" onClick={() => setReloadVersion((version) => version + 1)} className="mt-4 rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10">
            {isTamil ? 'மீண்டும் முயற்சி செய்' : 'Try again'}
          </button>
        </div>
      ) : characters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-fuchsia-500/30 bg-fuchsia-500/5 p-10 text-center">
          <UserSquare2 className="h-9 w-9 mx-auto text-fuchsia-400 mb-3" />
          <p className="text-sm text-slate-300">{isTamil ? 'இன்னும் கதாபாத்திரங்கள் இல்லை.' : 'No characters in this project yet.'}</p>
          <button type="button" onClick={openCreate} className="mt-4 rounded-lg border border-fuchsia-500/30 px-3 py-2 text-xs text-fuchsia-300">{isTamil ? 'முதல் கதாபாத்திரத்தை உருவாக்கு' : 'Create the first character'}</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {characters.map((character) => (
            <div key={character.id} className="rounded-2xl border border-studio-border bg-studio-card p-5 space-y-4">
              {character.reference_image_url && (
                <ReferenceImage
                  url={character.reference_image_url}
                  alt={isTamil ? `${character.name} குறிப்பு படம்` : `${character.name} reference`}
                  isTamil={isTamil}
                  className="h-48 w-full"
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md border border-studio-border bg-studio-elevated px-2 py-0.5 text-[10px] font-semibold text-fuchsia-300 uppercase">{character.role}</span>
                  <h3 className="text-base font-bold text-white mt-1">{character.name}</h3>
                  {character.age && <span className="text-xs text-slate-400">{isTamil ? 'வயது' : 'Age'}: {character.age}</span>}
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(character)} className="rounded-lg p-2 text-slate-400 hover:bg-studio-elevated hover:text-white" aria-label={isTamil ? 'திருத்து' : 'Edit'} title={isTamil ? 'திருத்து' : 'Edit'}><Edit3 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => handleDelete(character)} className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300" aria-label={isTamil ? 'நீக்கு' : 'Delete'} title={isTamil ? 'நீக்கு' : 'Delete'}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  ['Hair', character.hairstyle],
                  ['Appearance', character.appearance],
                  ['Attire', character.clothing],
                  ['Personality', character.personality],
                  ['Ability', character.abilities]
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="flex items-start gap-2 bg-studio-elevated/50 p-2 rounded-lg border border-studio-border/60">
                    <span className="font-bold text-slate-300 shrink-0">{label}:</span><span className="text-slate-400">{value}</span>
                  </div>
                ))}
              </div>
              {character.visual_prompt && (
                <div className="border-t border-studio-border/70 pt-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Visual Consistency Seed</span>
                  <div className="rounded-lg bg-black/40 p-2.5 font-mono text-[11px] text-slate-300 border border-studio-border">{character.visual_prompt}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-3" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <form
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="character-dialog-title"
            aria-busy={saving}
            onKeyDown={handleDialogKeyDown}
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-studio-border bg-studio-card p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 id="character-dialog-title" className="text-lg font-bold text-white">{editing ? (isTamil ? 'கதாபாத்திரத்தைத் திருத்து' : 'Edit Character') : (isTamil ? 'புதிய கதாபாத்திரம்' : 'New Character')}</h2>
              <button type="button" onClick={closeModal} disabled={saving} aria-label={isTamil ? 'மூடு' : 'Close'} className="rounded-lg p-2 text-slate-400 hover:bg-studio-elevated disabled:opacity-50"><X aria-hidden="true" className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(([key, label, type, required]) => (
                <label key={key} className="text-xs text-slate-300">
                  {label}
                  <input required={required} type={type} value={form[key]} onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-studio-border bg-studio-elevated px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-500" />
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3">
              {[
                ['appearance', isTamil ? 'தோற்றம் / கண்கள்' : 'Appearance / Eyes'],
                ['background', isTamil ? 'பின்னணி' : 'Background'],
                ['personality', isTamil ? 'தனித்தன்மை' : 'Personality'],
                ['abilities', isTamil ? 'சிறப்பு திறன்கள்' : 'Signature Abilities'],
                ['reference_image_url', isTamil ? 'குறிப்பு படம் URL' : 'Reference Image URL']
              ].map(([key, label]) => (
                <label key={key} className="text-xs text-slate-300">
                  {label}
                  {key === 'reference_image_url'
                    ? <>
                      <input type="url" value={form[key]} onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-studio-border bg-studio-elevated px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-500" />
                      {form[key] && (
                        <ReferenceImage
                          url={form[key]}
                          alt={isTamil ? 'கதாபாத்திர குறிப்பு பட முன்னோட்டம்' : 'Character reference preview'}
                          isTamil={isTamil}
                          className="mt-2 h-40 w-full"
                        />
                      )}
                    </>
                    : <textarea rows={key === 'appearance' ? 2 : 3} value={form[key]} onChange={(event) => setForm((value) => ({ ...value, [key]: event.target.value }))} className="mt-1 w-full resize-none rounded-lg border border-studio-border bg-studio-elevated px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-500" />}
                </label>
              ))}
            </div>
            {formError && <p role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-200">{formError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeModal} disabled={saving} className="rounded-lg border border-studio-border px-4 py-2 text-xs text-slate-300 disabled:opacity-50">{isTamil ? 'ரத்து' : 'Cancel'}</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />{saving ? (isTamil ? 'சேமிக்கிறது...' : 'Saving...') : (isTamil ? 'சேமி' : 'Save Character')}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
