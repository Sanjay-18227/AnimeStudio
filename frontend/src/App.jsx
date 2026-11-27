import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoadingIndicator from './components/ui/LoadingIndicator';
import Toast from './components/ui/Toast';
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const notify = useCallback((type, message) => {
    setToast({ type, message, id: Date.now() });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

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
        console.warn('Backend not currently responding:', err);
        notify('error', err.message || 'Could not load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    initApp();
  }, [notify]);

  const handleCreateProject = async (newProjData) => {
    try {
      const created = await createProject(newProjData);
      setProjects((currentProjects) => [created, ...currentProjects]);
      setActiveProject(created);
      notify('success', language === 'ta' ? 'திட்டம் வெற்றிகரமாக உருவாக்கப்பட்டது!' : 'Project created successfully.');
      return created;
    } catch (err) {
      notify('error', err.message || 'Could not create the project. Please try again.');
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await deleteProject(projectId);
      const nextProject = projects.find((project) => project.id !== projectId) || null;
      setProjects((currentProjects) => currentProjects.filter((project) => project.id !== projectId));
      setActiveProject((currentActiveProject) =>
        currentActiveProject && currentActiveProject.id === projectId ? nextProject : currentActiveProject
      );
      notify('success', language === 'ta' ? 'திட்டம் நீக்கப்பட்டது' : 'Project deleted.');
      return true;
    } catch (err) {
      notify('error', err.message || 'Could not delete the project. Please try again.');
      return false;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-studio-bg text-slate-100 antialiased font-sans">
      <a
        href="#main-content"
        className="sr-only z-[70] rounded-lg bg-studio-purple px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setIsMobileSidebarOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
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
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((open) => !open)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        {toast && (
          <div className="fixed right-4 top-[4.75rem] z-[60] w-[calc(100%-2rem)] sm:right-6 sm:w-full sm:max-w-md">
            <Toast toast={toast} onDismiss={dismissToast} />
          </div>
        )}

        {/* Creative Workspace Scrollable Canvas */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <LoadingIndicator label={language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading your studio...'} />
            </div>
          ) : (
            <>
          {activeView === 'dashboard' && (
            <DashboardHome
              activeProject={activeProject}
              projects={projects}
              setActiveView={setActiveView}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onOpenProjects={() => setActiveView('projects')}
              systemHealth={systemHealth}
              language={language}
            />
          )}

          {activeView === 'chat' && (
            <ChatStudio
              activeProject={activeProject}
              language={language}
              onNotify={notify}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
          )}

          {activeView === 'manga' && (
            <MangaStudio activeProject={activeProject} language={language} onNotify={notify} />
          )}

          {activeView === 'character' && (
            <CharacterStudio activeProject={activeProject} language={language} onNotify={notify} />
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
              onOpenProject={(project) => {
                setActiveProject(project);
                setActiveView('chat');
              }}
            />
          )}

          {activeView === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <DashboardHome
                activeProject={activeProject}
                projects={projects}
                setActiveView={setActiveView}
                onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
                onOpenProjects={() => setActiveView('projects')}
                systemHealth={systemHealth}
                language={language}
              />
            </div>
          )}
            </>
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
        onNotify={notify}
      />
    </div>
  );
}

