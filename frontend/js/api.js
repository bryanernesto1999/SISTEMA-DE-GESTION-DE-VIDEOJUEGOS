/**
 * ===============================================================
 * api.js
 * ===============================================================
 * Este archivo es la capa de comunicación entre el Frontend
 * (HTML + JavaScript) y el Backend desarrollado en FastAPI.
 *
 * Todas las páginas del sistema (Dashboard, Videojuegos,
 * Categorías, Movimientos, etc.) utilizan este archivo
 * para enviar y recibir información del servidor.
 *
 * Aquí NO se diseña la interfaz.
 * Aquí únicamente se realizan peticiones HTTP al backend.
 *
 * Si el servidor cambia de dirección o de puerto,
 * solamente se modifica la variable API_BASE.
 * ===============================================================
 */


/**
 * Dirección base donde se encuentra ejecutándose el servidor FastAPI.
 *
 * En este caso:
 * http://localhost:8000
 *
 * localhost  → significa que el servidor está en la misma computadora.
 * 8000       → puerto donde FastAPI está escuchando las solicitudes.
 *
 * Todas las funciones del archivo utilizan esta dirección
 * para construir la URL completa de cada endpoint.
 */
const API_BASE = 'http://localhost:8000';


/**
 * ===============================================================
 * FUNCIÓN PRIVADA _req()
 * ===============================================================
 *
 * Esta es la función más importante del archivo.
 *
 * Su trabajo es enviar cualquier petición al backend.
 *
 * Todas las demás funciones (crear, editar, eliminar, listar)
 * utilizan esta función para evitar repetir código.
 *
 * Recibe:
 *
 * path
 * → ruta del endpoint.
 *
 * options
 * → configuración adicional como:
 *      - método HTTP (GET, POST, PUT, DELETE...)
 *      - body
 *      - headers
 *
 * Devuelve:
 *
 * La respuesta convertida a JSON.
 *
 * Si el servidor devuelve un error,
 * genera una excepción para que pueda ser capturada
 * con try/catch desde otra parte del sistema.
 * ===============================================================
 */
async function _req(path, options = {}) {

  /**
   * fetch()
   * Envía la petición HTTP al servidor FastAPI.
   *
   * La URL final será:
   *
   * http://localhost:8000 + path
   *
   * Ejemplo:
   *
   * API_BASE = http://localhost:8000
   *
   * path = /videojuegos
   *
   * Resultado:
   *
   * http://localhost:8000/videojuegos
   */
  const res = await fetch(`${API_BASE}${path}`, {

    /**
     * Cabecera HTTP.
     *
     * Indica que los datos enviados al servidor
     * estarán en formato JSON.
     */
    headers: {
      'Content-Type': 'application/json'
    },

    /**
     * Agrega cualquier configuración recibida
     * (POST, PUT, DELETE, body, etc.).
     */
    ...options,
  });


  /**
   * Convierte la respuesta del servidor a formato JSON.
   *
   * Si la respuesta viene vacía,
   * devuelve un objeto vacío {} para evitar errores.
   */
  const data = await res.json().catch(() => ({}));


  /**
   * Si el servidor responde con un error
   * (404, 400, 500, etc.)
   *
   * Se genera una excepción con el mensaje recibido
   * desde FastAPI.
   */
  if (!res.ok)
      throw new Error(data.detail || `Error ${res.status}`);


  /**
   * Devuelve la información recibida desde el backend.
   */
  return data;
}



/**
 * ===============================================================
 * OBJETO API
 * ===============================================================
 *
 * Contiene todas las funciones disponibles
 * para comunicarse con el backend.
 *
 * Gracias a este objeto,
 * desde cualquier página solamente se escribe:
 *
 * API.getVideojuegos();
 *
 * sin necesidad de volver a escribir fetch().
 *
 * Esto mantiene el código limpio y organizado.
 * ===============================================================
 */
const API = {

  // ============================================================
  // VIDEOJUEGOS
  // ============================================================

  /**
   * Obtiene todos los videojuegos registrados.
   *
   * Método HTTP:
   * GET
   *
   * Endpoint:
   * /videojuegos
   */
  getVideojuegos : () => _req('/videojuegos'),


  /**
   * Obtiene un videojuego específico mediante su ID.
   *
   * Método:
   * GET
   *
   * Endpoint:
   * /videojuegos/{id}
   */
  getVideojuego : (id) =>
      _req(`/videojuegos/${id}`),


  /**
   * Registra un nuevo videojuego.
   *
   * Método:
   * POST
   *
   * Endpoint:
   * /videojuegos
   *
   * body contiene toda la información
   * del videojuego enviada al servidor.
   */
  crearVideojuego : (body) =>
      _req('/videojuegos', {
          method:'POST',
          body: JSON.stringify(body)
      }),


  /**
   * Actualiza los datos de un videojuego.
   *
   * Método:
   * PUT
   *
   * Endpoint:
   * /videojuegos/{id}
   */
  editarVideojuego : (id, body) =>
      _req(`/videojuegos/${id}`, {
          method:'PUT',
          body: JSON.stringify(body)
      }),


  /**
   * Elimina un videojuego.
   *
   * Método:
   * DELETE
   *
   * Endpoint:
   * /videojuegos/{id}
   */
  eliminarVideojuego : (id) =>
      _req(`/videojuegos/${id}`, {
          method:'DELETE'
      }),


  /**
   * Modifica únicamente el stock.
   *
   * Método:
   * PATCH
   *
   * Endpoint:
   * /videojuegos/{id}/stock
   *
   * Envía únicamente la cantidad
   * que debe aumentar o disminuir.
   */
  actualizarStock : (id, cant) =>
      _req(`/videojuegos/${id}/stock`, {
          method:'PATCH',
          body: JSON.stringify({
              cantidad: cant
          })
      }),



  // ============================================================
  // CATEGORÍAS
  // ============================================================

  /**
   * Obtiene todas las categorías.
   *
   * Método:
   * GET
   *
   * Endpoint:
   * /categorias
   */
  getCategorias : () =>
      _req('/categorias'),


  /**
   * Obtiene las alertas de stock.
   *
   * Método:
   * GET
   *
   * Endpoint:
   * /categorias/alertas
   */
  getAlertas : () =>
      _req('/categorias/alertas'),



  // ============================================================
  // MOVIMIENTOS
  // ============================================================

  /**
   * Obtiene todos los movimientos registrados.
   *
   * Método:
   * GET
   *
   * Endpoint:
   * /movimientos
   *
   * Si el endpoint todavía no existe,
   * devuelve un arreglo vacío []
   * para que el sistema continúe funcionando.
   */
  getMovimientos : () =>
      _req('/movimientos').catch(() => []),


  /**
   * Registra un nuevo movimiento de inventario.
   *
   * Método:
   * POST
   *
   * Endpoint:
   * /movimientos
   *
   * body contiene:
   *
   * - tipo de movimiento
   * - videojuego
   * - cantidad
   * - almacén
   * - precio
   * - observación
   */
  crearMovimiento : (body) =>
      _req('/movimientos', {
          method:'POST',
          body: JSON.stringify(body)
      }),
};
};