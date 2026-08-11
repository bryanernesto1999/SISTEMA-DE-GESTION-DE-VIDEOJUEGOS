import { request } from './apiClient';

// Nota: sin actualizar() — el backend no expone PUT para este módulo
// (movimiento_inventario es un registro de historial/auditoría).
const MovimientoDAO = {
  obtenerTodos:  ()          => request('/movimientos'),
  obtenerPorId:  (id)        => request(`/movimientos/${id}`),
  crear:         (payload)   => request('/movimientos', { method: 'POST', body: JSON.stringify(payload) }),
  eliminar:      (id)        => request(`/movimientos/${id}`, { method: 'DELETE' }),
};

export default MovimientoDAO;
