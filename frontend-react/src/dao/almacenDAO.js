import { request } from './apiClient';

const AlmacenDAO = {
  obtenerTodos:  ()          => request('/almacenes'),
  obtenerPorId:  (id)        => request(`/almacenes/${id}`),
  crear:         (payload)   => request('/almacenes', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar:    (id, p)     => request(`/almacenes/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  eliminar:      (id)        => request(`/almacenes/${id}`, { method: 'DELETE' }),
};

export default AlmacenDAO;
