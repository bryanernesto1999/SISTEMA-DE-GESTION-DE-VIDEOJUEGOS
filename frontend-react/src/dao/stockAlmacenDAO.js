import { request } from './apiClient';

// Nota: esta tabla no tiene id simple, su identidad es (id_videojuego, id_almacen).
const StockAlmacenDAO = {
  obtenerTodos:     ()                          => request('/stock-almacen'),
  obtenerPorClave:  (idVideojuego, idAlmacen)    => request(`/stock-almacen/${idVideojuego}/${idAlmacen}`),
  crear:            (payload)                   => request('/stock-almacen', { method: 'POST', body: JSON.stringify(payload) }),
  actualizar:       (idVideojuego, idAlmacen, p) => request(`/stock-almacen/${idVideojuego}/${idAlmacen}`, { method: 'PUT', body: JSON.stringify(p) }),
  eliminar:         (idVideojuego, idAlmacen)    => request(`/stock-almacen/${idVideojuego}/${idAlmacen}`, { method: 'DELETE' }),
};

export default StockAlmacenDAO;
