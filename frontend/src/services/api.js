/**
 * Anime Studio AI - Centralized Frontend API Service
 */

const API_BASE = '/api';

// Health & System
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (fetchHealth):', error);
    return null;
  }
}

// Project Management
export async function getProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error(`Failed to fetch projects: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getProjects):', error);
    throw error;
  }
}

export async function createProject(projectData) {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    if (!res.ok) throw new Error(`Failed to create project: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (createProject):', error);
    throw error;
  }
}

export async function getProject(projectId) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`);
    if (!res.ok) throw new Error(`Failed to get project: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getProject):', error);
    throw error;
  }
}

export async function updateProject(projectId, updateData) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) throw new Error(`Failed to update project: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (updateProject):', error);
    throw error;
  }
}

export async function deleteProject(projectId) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to delete project: ${res.statusText}`);
    return true;
  } catch (error) {
    console.error('API Error (deleteProject):', error);
    throw error;
  }
}

// ========================================================
// AI Providers & Diagnostics
// ========================================================

export async function getAIProviders() {
  try {
    const res = await fetch(`${API_BASE}/ai/providers`);
    if (!res.ok) throw new Error(`Failed to fetch providers: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getAIProviders):', error);
    throw error;
  }
}

export async function getAIStatus() {
  try {
    const res = await fetch(`${API_BASE}/ai/status`);
    if (!res.ok) throw new Error(`Failed to fetch AI status: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getAIStatus):', error);
    return null;
  }
}

export async function testAIProvider(providerName, model = null) {
  try {
    const res = await fetch(`${API_BASE}/ai/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider_name: providerName, model }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Provider test failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API Error (testAIProvider):', error);
    throw error;
  }
}

// ========================================================
// AI Chat Studio & Conversations
// ========================================================

export async function sendChatMessage(messageData) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Chat request failed: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API Error (sendChatMessage):', error);
    throw error;
  }
}

export async function regenerateChatMessage(conversationId) {
  try {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/regenerate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Failed to regenerate response: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('API Error (regenerateChatMessage):', error);
    throw error;
  }
}

export async function getConversations(projectId = null, mode = null, search = null) {
  try {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId);
    if (mode) params.append('mode', mode);
    if (search && search.trim()) params.append('search', search.trim());

    const url = `${API_BASE}/chat/conversations${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch conversations: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getConversations):', error);
    throw error;
  }
}

export async function getConversation(conversationId) {
  try {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}`);
    if (!res.ok) throw new Error(`Failed to get conversation: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getConversation):', error);
    throw error;
  }
}

export async function deleteConversation(conversationId) {
  try {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to delete conversation: ${res.statusText}`);
    return true;
  } catch (error) {
    console.error('API Error (deleteConversation):', error);
    throw error;
  }
}

// ========================================================
// User Settings & Personalization
// ========================================================

export async function getUserSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error(`Failed to fetch settings: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getUserSettings):', error);
    return null;
  }
}

export async function updateUserSettings(settingsData) {
  try {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData),
    });
    if (!res.ok) throw new Error(`Failed to update settings: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (updateUserSettings):', error);
    throw error;
  }
}

export async function resetUserSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to reset settings: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (resetUserSettings):', error);
    throw error;
  }
}

// ========================================================
// Project Memories & Lore Rules
// ========================================================

export async function getProjectMemories(projectId) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/memories`);
    if (!res.ok) throw new Error(`Failed to fetch project memories: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (getProjectMemories):', error);
    return [];
  }
}

export async function createProjectMemory(projectId, memoryData) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memoryData),
    });
    if (!res.ok) throw new Error(`Failed to create memory: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (createProjectMemory):', error);
    throw error;
  }
}

export async function updateProjectMemory(projectId, memoryId, memoryData) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/memories/${memoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memoryData),
    });
    if (!res.ok) throw new Error(`Failed to update memory: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error('API Error (updateProjectMemory):', error);
    throw error;
  }
}

export async function deleteProjectMemory(projectId, memoryId) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/memories/${memoryId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to delete memory: ${res.statusText}`);
    return true;
  } catch (error) {
    console.error('API Error (deleteProjectMemory):', error);
    throw error;
  }
}

export async function clearProjectMemories(projectId) {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/memories`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) throw new Error(`Failed to clear memories: ${res.statusText}`);
    return true;
  } catch (error) {
    console.error('API Error (clearProjectMemories):', error);
    throw error;
  }
}
