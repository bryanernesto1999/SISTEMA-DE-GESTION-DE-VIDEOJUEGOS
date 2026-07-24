/**
 * ===============================================================
 * ui.js
 * ===============================================================
 * Este archivo contiene funciones reutilizables para la interfaz
 * gráfica del sistema (UI = User Interface).
 *
 * Su objetivo es centralizar todas las funciones relacionadas
 * con la apariencia del sistema para evitar repetir código
 * en cada página.
 *
 * Aquí NO se realizan operaciones CRUD.
 * Aquí NO se modifica la base de datos.
 * Aquí solamente se controla la parte visual del sistema.
 *
 * Ejemplos:
 * - Mostrar notificaciones (Toast)
 * - Crear badges de plataforma
 * - Mostrar estado del videojuego
 * - Dibujar barras de stock
 * - Resaltar la opción activa del menú lateral
 * - Llenar listas desplegables (Select)
 * ===============================================================
 */



// ===============================================================
// TOAST DE NOTIFICACIÓN
//===============================================================

/**
 * Esta función muestra un pequeño mensaje flotante
 * en la esquina inferior derecha de la pantalla.
 *
 * Se utiliza para informar al usuario que una acción
 * fue realizada correctamente o si ocurrió un error.
 *
 * Ejemplos:
 *
 * toast("Videojuego registrado");
 *
 * toast("Error al guardar", "danger");
 *
 * Parámetros:
 *
 * msg
 * → mensaje que se mostrará.
 *
 * tipo
 * → tipo de notificación.
 *
 * Puede ser:
 *
 * success
 * danger
 * warning
 * info
 */
function toast(msg, tipo = 'success') {

  /**
   * Según el tipo de mensaje,
   * se selecciona un color diferente.
   */
  const color = {
      success: 'var(--c-green)',
      danger: 'var(--c-red)',
      warning: 'var(--c-amber)',
      info: 'var(--c-blue)'
  }[tipo] || 'var(--c-green');


  /**
   * También se asigna un icono
   * dependiendo del tipo de notificación.
   */
  const icono = {
      success: '✓',
      danger: '✕',
      warning: '⚠',
      info: 'ℹ'
  }[tipo] || '✓';


  /**
   * Se crea dinámicamente un DIV
   * donde se mostrará la notificación.
   */
  const el = document.createElement('div');


  /**
   * Se aplican los estilos visuales
   * del Toast.
   *
   * Aquí se define:
   * - posición
   * - colores
   * - tamaño
   * - bordes
   * - sombra
   * - animación
   */
  el.style.cssText = `
    position:fixed;
    bottom:24px;
    right:24px;
    z-index:9999;
    background:var(--bg-card);
    border:0.5px solid ${color};
    color:var(--c-text);
    padding:12px 18px;
    border-radius:10px;
    font-size:13px;
    font-weight:600;
    font-family:'Rajdhani',sans-serif;
    box-shadow:0 4px 20px rgba(0,0,0,.4);
    animation:slideToast .25s ease;
  `;


  /**
   * Se coloca el icono y el mensaje.
   */
  el.textContent = `${icono} ${msg}`;


  /**
   * Si la animación todavía no existe,
   * se crea automáticamente.
   */
  if (!document.getElementById('toast-style')) {

      const s = document.createElement('style');

      s.id = 'toast-style';

      s.textContent =
      '@keyframes slideToast{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}';

      document.head.appendChild(s);
  }


  /**
   * Agrega el Toast a la página.
   */
  document.body.appendChild(el);


  /**
   * Después de 3.5 segundos,
   * la notificación desaparece automáticamente.
   */
  setTimeout(() => el.remove(), 3500);
}



// ===============================================================
// BADGE DE PLATAFORMA
//===============================================================

/**
 * Genera automáticamente el Badge
 * correspondiente a la plataforma
 * del videojuego.
 *
 * Ejemplo:
 *
 * PlayStation 5
 *
 * se mostrará como
 *
 * [ PS5 ]
 *
 * con el color correspondiente.
 */
function badgePlat(p) {

  /**
   * Relaciona cada plataforma
   * con una clase CSS.
   */
  const cls = {

      'PlayStation 5':'badge-ps5',

      'PlayStation 4':'badge-ps5',

      'PC':'badge-pc',

      'Nintendo Switch':'badge-switch',

      'Xbox Series X':'badge-xbox',

      'Mobile':'badge-mobile',

  };


  /**
   * Nombre corto que aparecerá
   * dentro del Badge.
   */
  const short = {

      'PlayStation 5':'PS5',

      'PlayStation 4':'PS4',

      'Xbox Series X':'Xbox',

      'Nintendo Switch':'Switch',

      'PC':'PC',

      'Mobile':'Mobile',

  };


  /**
   * Devuelve el código HTML
   * del Badge listo para mostrarse.
   */
  return `<span class="badge-plat ${cls[p]||''}">${short[p]||p}</span>`;
}



// ===============================================================
// BADGE DE ESTADO
//===============================================================

/**
 * Determina automáticamente
 * el estado del videojuego.
 *
 * Puede mostrar:
 *
 * ACTIVO
 *
 * MÍNIMO
 *
 * AGOTADO
 */
function badgeEstado(j) {

  /**
   * Si el stock es cero
   * o el estado es AGOTADO.
   */
  if (j.stock_actual === 0 || j.estado === 'AGOTADO')

      return '<span class="badge-estado est-agotado">● AGOTADO</span>';


  /**
   * Si el stock es menor
   * al stock mínimo.
   */
  if (j.stock_actual < j.stock_minimo)

      return '<span class="badge-estado est-minimo">● MÍNIMO</span>';


  /**
   * En cualquier otro caso
   * el videojuego se considera activo.
   */
  return '<span class="badge-estado est-activo">● ACTIVO</span>';
}



// ===============================================================
// BARRA DE STOCK
//===============================================================

/**
 * Crea una barra visual que representa
 * la cantidad de stock disponible.
 *
 * Verde
 * → suficiente
 *
 * Amarillo
 * → stock bajo
 *
 * Rojo
 * → agotado
 */
function stockBar(s, min = 5, max = 40) {

  /**
   * Calcula el porcentaje
   * que ocupará la barra.
   */
  const pct = Math.min(100, Math.round((s / max) * 100));


  /**
   * Selecciona el color
   * de acuerdo al stock.
   */
  const col =

      s === 0

      ? 'var(--c-red)'

      : s < min

      ? 'var(--c-amber)'

      : 'var(--c-green)';


  /**
   * Devuelve la barra de progreso
   * junto con la cantidad disponible.
   */
  return `<span class="stock-bar"><span class="stock-fill" style="width:${pct}%;background:${col};"></span></span>${s}`;
}



// ===============================================================
// SIDEBAR ACTIVO
//===============================================================

/**
 * Marca automáticamente
 * la opción del menú lateral
 * correspondiente a la página actual.
 *
 * Ejemplo:
 *
 * videojuegos.html
 *
 * quedará resaltado
 * en el Sidebar.
 */
function marcarSidebarActivo() {

  const pagina = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.sidebar-item').forEach(el => {

      const href = el.getAttribute('href') || '';

      el.classList.toggle(
          'active',
          href === pagina || (pagina === '' && href === 'index.html')
      );

  });

}



// ===============================================================
// LLENAR SELECT DE CATEGORÍAS
//===============================================================

/**
 * Obtiene todas las categorías
 * desde el backend utilizando API.js
 * y llena automáticamente un SELECT.
 *
 * Conecta con:
 *
 * API.getCategorias()
 *
 * del archivo api.js.
 */
async function llenarCategorias(selectId) {

  try {

      const cats = await API.getCategorias();

      const sel = document.getElementById(selectId);

      if (!sel) return;

      cats.forEach(c => {

          const opt = document.createElement('option');

          opt.value = c.id_categoria;

          opt.textContent = c.nombre;

          sel.appendChild(opt);

      });

  } catch (_) {

      /**
       * Si el backend no está disponible,
       * simplemente no llena el Select
       * para evitar errores.
       */

  }

}



// ===============================================================
// LLENAR SELECT DE VIDEOJUEGOS
//===============================================================

/**
 * Llena automáticamente
 * el listado de videojuegos
 * dentro de un SELECT.
 *
 * Se utiliza principalmente
 * en el Modal de Movimientos.
 */
function llenarSelectJuegos(selectId, juegos) {

  const sel = document.getElementById(selectId);

  if (!sel) return;

  /**
   * Limpia las opciones anteriores.
   */
  sel.innerHTML = '<option value="">Seleccionar...</option>';

  /**
   * Agrega todos los videojuegos
   * recibidos como parámetro.
   */
  juegos.forEach(j => {

      const opt = document.createElement('option');

      opt.value = j.id_videojuego;

      opt.textContent = j.titulo;

      sel.appendChild(opt);

  });

}



// ===============================================================
// EVENTO DE CARGA DE LA PÁGINA
//===============================================================

/**
 * Cuando la página termina de cargarse,
 * se ejecuta automáticamente la función
 * marcarSidebarActivo()
 *
 * De esta manera el menú lateral
 * siempre muestra la opción activa.
 */
document.addEventListener(
    'DOMContentLoaded',
    marcarSidebarActivo
);