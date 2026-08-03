/**
 * DAO del frontend — todas las llamadas al API de videojuegos.
 * Centraliza fetch, manejo de errores y URL base.
 */

const BASE = 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
  return data;
}

const VideojuegoDAO = {
  /** GET /videojuegos — lista completa */
  obtenerTodos: ()              => request('/videojuegos'),

  /** GET /videojuegos/:id */
  obtenerPorId: (id)            => request(`/videojuegos/${id}`),

  /** POST /videojuegos */
  crear: (payload)              => request('/videojuegos', {
    method: 'POST', body: JSON.stringify(payload),
  }),

  /** PUT /videojuegos/:id */
  actualizar: (id, payload)     => request(`/videojuegos/${id}`, {
    method: 'PUT', body: JSON.stringify(payload),
  }),

  /** DELETE /videojuegos/:id */
  eliminar: (id)                => request(`/videojuegos/${id}`, {
    method: 'DELETE',
  }),

  /** PATCH /videojuegos/:id/stock */
  actualizarStock: (id, cantidad) => request(`/videojuegos/${id}/stock`, {
    method: 'PATCH', body: JSON.stringify({ cantidad }),
  }),
};

export default VideojuegoDAO;

/** DAO de categorías */
export const CategoriaDAO = {
  obtenerTodas: () => request('/categorias'),
  obtenerAlertas: () => request('/categorias/alertas'),
};