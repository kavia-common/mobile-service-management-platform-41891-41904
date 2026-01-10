const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// PUBLIC_INTERFACE
export function setAuthToken(token) {
  /** Persist auth token for subsequent requests. */
  if (token) localStorage.setItem('msm_token', token);
  else localStorage.removeItem('msm_token');
}

// PUBLIC_INTERFACE
export function getAuthToken() {
  /** Get persisted auth token if present. */
  return localStorage.getItem('msm_token');
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

// PUBLIC_INTERFACE
export const api = {
  /** REST calls used by the app UI. */
  health: () => request('/health'),
  seed: () => request('/api/dev/seed'),
  listServices: () => request('/api/services'),
  getService: (id) => request(`/api/services/${id}`),
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  me: () => request('/api/auth/me', { auth: true }),
  listOrders: () => request('/api/orders', { auth: true }),
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload, auth: true }),
};
