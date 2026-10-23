const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to perform authenticated and unauthenticated fetch requests
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Automatically attach Authorization Bearer header for protected requests
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // If unauthorized, clear invalid session
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
};
