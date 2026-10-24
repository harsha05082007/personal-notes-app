// Detect API URL: custom user-configured backend -> environment variable -> relative /api
function getBaseUrl() {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_api_url') : null;
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  return import.meta.env.VITE_API_URL || '/api';
}

const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

// Local storage keys for standalone demo mode (e.g. on GitHub Pages)
const DEMO_USERS_KEY = 'notes_demo_users';
const DEMO_NOTES_KEY = 'notes_demo_items';

function getStoredDemoUsers() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function getStoredDemoNotes(userId = 'default') {
  try {
    const raw = localStorage.getItem(`${DEMO_NOTES_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
    
    // Initial starter notes for interactive demo
    const starterNotes = [
      {
        _id: 'demo-note-1',
        title: 'Welcome to Personal Notes 📝',
        content: 'Your app is live and interactive on GitHub Pages! You can create, organize, and delete notes here.\n\nTip: You can also connect this frontend to a permanent MongoDB backend anytime using the backend URL option.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        _id: 'demo-note-2',
        title: 'Quick Shortcut Tip ⚡',
        content: 'Use Ctrl + Enter (or Cmd + Enter on Mac) while typing inside the note creator box to save your note instantly without touching your mouse.',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
    localStorage.setItem(`${DEMO_NOTES_KEY}_${userId}`, JSON.stringify(starterNotes));
    return starterNotes;
  } catch {
    return [];
  }
}

function saveStoredDemoNotes(notes, userId = 'default') {
  localStorage.setItem(`${DEMO_NOTES_KEY}_${userId}`, JSON.stringify(notes));
}

// Current active demo user ID helper
function getCurrentUserId() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      return u.id || u._id || 'default';
    }
  } catch {}
  return 'default';
}

/**
 * Helper to perform authenticated and unauthenticated fetch requests
 * Falls back to demo local storage mode if on GitHub Pages without a backend
 */
async function request(endpoint, options = {}) {
  const BASE_URL = getBaseUrl();
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // If on GitHub Pages and BASE_URL is still relative '/api', skip network fetch to avoid 404
    if (isGitHubPages && (BASE_URL === '/api' || BASE_URL.startsWith('/'))) {
      throw new Error('FALLBACK_DEMO_MODE');
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If server returned 404 on API endpoint and we're on github.io, fallback
    if (response.status === 404 && isGitHubPages) {
      throw new Error('FALLBACK_DEMO_MODE');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));
      }
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // Check if network error or fallback needed
    const isNetworkError = err.message === 'FALLBACK_DEMO_MODE' || 
                           err.message.includes('Failed to fetch') || 
                           err.name === 'TypeError' ||
                           (isGitHubPages && (BASE_URL === '/api' || BASE_URL.startsWith('/')));

    if (isNetworkError) {
      return handleDemoFallback(endpoint, options);
    }
    throw err;
  }
}

/**
 * Seamless client-side demo fallback for GitHub Pages
 */
function handleDemoFallback(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};
  const currentUserId = getCurrentUserId();

  // 1. Health check
  if (endpoint === '/health') {
    return {
      status: 'ok',
      message: 'Running in GitHub Pages Demo Mode (Browser Storage)',
      database: 'standalone',
      mode: 'demo',
    };
  }

  // 2. Register
  if (endpoint === '/auth/register') {
    const users = getStoredDemoUsers();
    const existing = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
      const err = new Error('A user with this email already exists.');
      err.status = 400;
      throw err;
    }
    const newUser = {
      id: 'demo_u_' + Date.now(),
      name: body.name || 'Demo User',
      email: body.email,
    };
    users.push(newUser);
    saveStoredDemoUsers(users);
    return {
      token: 'demo_token_' + Date.now(),
      user: newUser,
    };
  }

  // 3. Login
  if (endpoint === '/auth/login') {
    const users = getStoredDemoUsers();
    const found = users.find((u) => u.email.toLowerCase() === (body.email || '').toLowerCase());
    const user = found || {
      id: 'demo_u_' + Date.now(),
      name: body.email ? body.email.split('@')[0] : 'Demo User',
      email: body.email || 'demo@example.com',
    };
    return {
      token: 'demo_token_' + Date.now(),
      user,
    };
  }

  // 4. Me
  if (endpoint === '/auth/me') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : { id: 'demo_u_1', name: 'Demo User', email: 'demo@example.com' };
  }

  // 5. Get Notes
  if (endpoint === '/notes' && method === 'GET') {
    return getStoredDemoNotes(currentUserId);
  }

  // 6. Create Note
  if (endpoint === '/notes' && method === 'POST') {
    const notes = getStoredDemoNotes(currentUserId);
    const newNote = {
      _id: 'note_' + Date.now(),
      title: body.title,
      content: body.content,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...notes];
    saveStoredDemoNotes(updated, currentUserId);
    return newNote;
  }

  // 7. Delete Note
  if (endpoint.startsWith('/notes/') && method === 'DELETE') {
    const noteId = endpoint.replace('/notes/', '');
    const notes = getStoredDemoNotes(currentUserId);
    const updated = notes.filter((n) => n._id !== noteId);
    saveStoredDemoNotes(updated, currentUserId);
    return { success: true, message: 'Note removed' };
  }

  return null;
}

export const api = {
  // Authentication Endpoints
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    getMe: () => request('/auth/me'),
  },

  // Notes Endpoints
  notes: {
    getAll: () => request('/notes'),

    create: (noteData) =>
      request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData),
      }),

    delete: (id) =>
      request(`/notes/${id}`, {
        method: 'DELETE',
      }),
  },

  // Health
  getHealth: () => request('/health'),

  // Config custom backend URL
  setCustomBackendUrl: (url) => {
    if (url && url.trim()) {
      localStorage.setItem('custom_api_url', url.trim());
    } else {
      localStorage.removeItem('custom_api_url');
    }
  },

  getCustomBackendUrl: () => localStorage.getItem('custom_api_url') || '',
};
