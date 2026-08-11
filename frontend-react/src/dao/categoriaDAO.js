import { request } from './apiClient';

const CategoriaDAO = {
  obtenerTodas:      ()          => request('/categorias'),
  obtenerPorId:       (id)       => request(`/categorias/${id}`),
  obtenerAlertas:     ()         => request('/categorias/alertas'),
  crear:              (payload)  => request('/categorias', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar:         (id, p)    => request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  eliminar:           (id)       => request(`/categorias/${id}`, { method: 'DELETE' }),
};

export default CategoriaDAO;
