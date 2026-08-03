/**
 * api.js — Capa de comunicación con el backend FastAPI
 * Todas las páginas importan este archivo.
 * Cambia API_BASE si tu servidor corre en otro puerto.
 */

const API_BASE = 'http://localhost:8000';

async function _req(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
  return data;
}

const API = {
  // ── Videojuegos ────────────────────────────────────────────────
  getVideojuegos : ()        => _req('/videojuegos'),
  getVideojuego  : (id)      => _req(`/videojuegos/${id}`),
  crearVideojuego: (body)    => _req('/videojuegos', { method:'POST', body: JSON.stringify(body) }),
  editarVideojuego:(id,body) => _req(`/videojuegos/${id}`, { method:'PUT',  body: JSON.stringify(body) }),
  eliminarVideojuego:(id)    => _req(`/videojuegos/${id}`, { method:'DELETE' }),
  actualizarStock:(id,cant)  => _req(`/videojuegos/${id}/stock`, { method:'PATCH', body: JSON.stringify({ cantidad: cant }) }),

  // ── Categorías ─────────────────────────────────────────────────
  getCategorias  : ()        => _req('/categorias'),
  getAlertas     : ()        => _req('/categorias/alertas'),

  // ── Movimientos (si tienes el endpoint) ────────────────────────
  getMovimientos : ()        => _req('/movimientos').catch(() => []),
  crearMovimiento: (body)    => _req('/movimientos', { method:'POST', body: JSON.stringify(body) }),
};