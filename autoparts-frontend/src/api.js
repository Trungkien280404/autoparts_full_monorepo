const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function setToken(t) { localStorage.setItem('autoparts_token', t || ''); }
export function getToken() { return localStorage.getItem('autoparts_token') || ''; }

// ---- Helpers cho JSON (Dữ liệu thường)
async function jget(path) {
  const r = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function jpost(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function jput(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function jdel(path) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ---- Helpers cho FormData (Upload ảnh) - KHÔNG SET Content-Type thủ công
async function jpostMultipart(path, formData) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function jputMultipart(path, formData) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`
    },
    body: formData
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export const Api = {
  // --- Auth ---
  forgot: (email) => jpost('/api/auth/forgot', { email }),
  verifyReset: (email, code) => jpost('/api/auth/verify-reset', { email, code }),
  reset: (email, code, newPassword) => jpost('/api/auth/reset', { email, code, newPassword }),
  login: (email, password) => jpost('/api/auth/login', { email, password }),
  register: (name, email, password) => jpost('/api/auth/register', { name, email, password }),

  // --- Products (CRUD) ---
  products: () => jget('/api/products'),
  // Dùng hàm Multipart để hỗ trợ upload file
  createProduct: (formData) => jpostMultipart('/api/products', formData),
  updateProduct: (id, formData) => jputMultipart(`/api/products/${id}`, formData),
  deleteProduct: (id) => jdel(`/api/products/${id}`),

  // --- Orders ---
  checkout: (items, info, method) => jpost('/api/orders', { items, info, method }),
  myOrders: () => jget('/api/orders/my'),
  receiveOrder: (id) => jput(`/api/orders/${id}/receive`, {}),

  // --- Stats ---
  overview: () => jget('/api/stats/overview'),
  traffic: () => jget('/api/stats/traffic'),

  // --- ADMIN: User Management ---
  adminGetUsers: () => jget('/api/admin/users'),
  adminUpdateUserRole: (id, role) => jput(`/api/admin/users/${id}`, { role }),
  adminDeleteUser: (id) => jdel(`/api/admin/users/${id}`),

  // --- ADMIN: Orders Management (QUAN TRỌNG - ĐỂ FIX LỖI BẠN ĐANG GẶP) ---
  adminGetOrders: () => jget('/api/admin/orders'),
  adminUpdateOrderStatus: (id, status) => jput(`/api/admin/orders/${id}`, { status }),

  // --- Misc ---
  ping: () => fetch(`${BASE}/api/traffic/ping`, { method: 'POST' }),

  // Chẩn đoán ảnh
  diagnose: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return jpostMultipart('/api/ml/diagnose', form);
  }
};