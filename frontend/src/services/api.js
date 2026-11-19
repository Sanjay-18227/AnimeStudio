/**
 * Anime Studio AI - Centralized Frontend API Service
 */

const API_BASE = '/api';

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

