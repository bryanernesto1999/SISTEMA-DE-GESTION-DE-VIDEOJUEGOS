import { request } from './apiClient';

const ProveedorDAO = {
  obtenerTodos:  ()          => request('/proveedores'),
  obtenerPorId:  (id)        => request(`/proveedores/${id}`),
  crear:         (payload)   => request('/proveedores', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar:    (id, p)     => request(`/proveedores/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  eliminar:      (id)        => request(`/proveedores/${id}`, { method: 'DELETE' }),
};

export default ProveedorDAO;
