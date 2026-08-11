import { request } from './apiClient';

const UsuarioDAO = {
  obtenerTodos:  ()          => request('/usuarios'),
  obtenerPorId:  (id)        => request(`/usuarios/${id}`),
  crear:         (payload)   => request('/usuarios', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar:    (id, p)     => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  eliminar:      (id)        => request(`/usuarios/${id}`, { method: 'DELETE' }),
};

export default UsuarioDAO;
