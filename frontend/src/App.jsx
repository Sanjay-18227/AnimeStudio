import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardHome from './components/studios/DashboardHome';
import ChatStudio from './components/studios/ChatStudio';
import MangaStudio from './components/studios/MangaStudio';
import CharacterStudio from './components/studios/CharacterStudio';
import ImageStudio from './components/studios/ImageStudio';
import PhotoToAnimeStudio from './components/studios/PhotoToAnimeStudio';
import VideoStudio from './components/studios/VideoStudio';
import ProjectsHub from './components/studios/ProjectsHub';
import NewProjectModal from './components/modals/NewProjectModal';
import SettingsModal from './components/modals/SettingsModal';
import { fetchHealth, getProjects, createProject, deleteProject } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState('en');

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    async function initApp() {
      setLoading(true);
      try {
        const health = await fetchHealth();
        setSystemHealth(health);

        const projectList = await getProjects();
        setProjects(projectList || []);
        if (projectList && projectList.length > 0) {
          setActiveProject(projectList[0]);
        }
      } catch (err) {
        console.warn('Backend not currently responding, using offline fallback mode:', err);
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, []);

  const handleCreateProject = async (newProjData) => {
    try {
      const created = await createProject(newProjData);
      setProjects([created, ...projects]);
      setActiveProject(created);
      setAlert({
        type: 'success',
        message: language === 'ta' ? 'திட்டம் வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Project created successfully!'
      });
      setTimeout(() => setAlert(null), 4000);
      return created;
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to create project'
      });
      setTimeout(() => setAlert(null), 5000);
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      const updated = projects.filter((p) => p.id !== projectId);
      setProjects(updated);
      if (activeProject && activeProject.id === projectId) {
        setActiveProject(updated.length > 0 ? updated[0] : null);
      }
      setAlert({
        type: 'success',
        message: language === 'ta' ? 'திட்டம் நீக்கப்பட்டது' : 'Project removed'
      });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to delete project'
      });
      setTimeout(() => setAlert(null), 4000);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-studio-bg text-slate-100 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        projectCount={projects.length}
      />

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          activeProject={activeProject}
          projects={projects}
          onSelectProject={setActiveProject}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          language={language}
          setLanguage={setLanguage}
          systemHealth={systemHealth}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Global Toast Alert */}
        {alert && (
          <div className="mx-6 mt-3">
            <div
              className={`rounded-xl border p-3 text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-in fade-in duration-200 ${
                alert.type === 'error'
                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              }`}
            >
              <span>{alert.message}</span>
              <button
                onClick={() => setAlert(null)}
                className="text-slate-400 hover:text-white ml-2 text-sm"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Creative Workspace Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {activeView === 'dashboard' && (
            <DashboardHome
              activeProject={activeProject}
              projects={projects}
              setActiveView={setActiveView}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              systemHealth={systemHealth}
              language={language}
            />
          )}

          {activeView === 'chat' && (
            <ChatStudio
              activeProject={activeProject}
              language={language}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          )}

          {activeView === 'manga' && (
            <MangaStudio activeProject={activeProject} language={language} />
          )}

          {activeView === 'character' && (
            <CharacterStudio activeProject={activeProject} language={language} />
          )}

          {activeView === 'image' && (
            <ImageStudio activeProject={activeProject} language={language} />
          )}

          {activeView === 'photo_to_anime' && (
            <PhotoToAnimeStudio activeProject={activeProject} language={language} />
          )}

          {activeView === 'video' && (
            <VideoStudio activeProject={activeProject} language={language} />
          )}

          {activeView === 'projects' && (
            <ProjectsHub
              projects={projects}
              activeProject={activeProject}
              onSelectProject={setActiveProject}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onDeleteProject={handleDeleteProject}
              setActiveView={setActiveView}
              language={language}
            />
          )}

          {activeView === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <DashboardHome
                activeProject={activeProject}
                projects={projects}
                setActiveView={setActiveView}
                onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                systemHealth={systemHealth}
                language={language}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen || activeView === 'settings'}
        onClose={() => {
          setIsSettingsModalOpen(false);
          if (activeView === 'settings') setActiveView('dashboard');
        }}
        systemHealth={systemHealth}
        language={language}
        activeProject={activeProject}
      />
    </div>
  );
}

