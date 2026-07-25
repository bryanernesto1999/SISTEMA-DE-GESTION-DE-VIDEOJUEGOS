/**
 * Modelo Videojuego — espejo del modelo Python en el frontend.
 * Centraliza la forma de los datos y los valores válidos.
 */
export class Videojuego {
  static ESTADOS        = ['ACTIVO', 'DESCONTINUADO', 'AGOTADO', 'SUSPENDIDO'];
  static CLASIFICACIONES = ['TODOS', 'TEEN', 'MADURO', 'ADULTOS'];
  static PLATAFORMAS    = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X',
                           'Nintendo Switch', 'PC', 'Mobile', 'Otro'];

  constructor(data = {}) {
    this.id_videojuego    = data.id_videojuego    ?? null;
    this.titulo           = data.titulo           ?? '';
    this.plataforma       = data.plataforma        ?? '';
    this.desarrollador    = data.desarrollador     ?? '';
    this.anio_lanzamiento = data.anio_lanzamiento  ?? 2000;
    this.clasificacion    = data.clasificacion     ?? 'TODOS';
    this.precio_compra    = data.precio_compra     ?? 0;
    this.precio_venta     = data.precio_venta      ?? 0;
    this.stock_actual     = data.stock_actual      ?? 0;
    this.stock_minimo     = data.stock_minimo      ?? 3;
    this.stock_maximo     = data.stock_maximo      ?? 100;
    this.estado           = data.estado            ?? 'ACTIVO';
    this.id_categoria     = data.id_categoria      ?? null;
    this.nombre_categoria = data.nombre_categoria  ?? '';
  }

  /** Retorna true si el stock está por debajo del mínimo. */
  stockBajo()   { return this.stock_actual > 0 && this.stock_actual < this.stock_minimo; }
  /** Retorna true si no hay unidades. */
  sinStock()    { return this.stock_actual === 0; }
  /** Color semáforo del stock. */
  colorStock()  {
    if (this.sinStock())    return '#ef4444';
    if (this.stockBajo())   return '#f59e0b';
    return '#22c55e';
  }
  /** Margen de ganancia en porcentaje. */
  margen() {
    if (!this.precio_compra) return 0;
    return (((this.precio_venta - this.precio_compra) / this.precio_compra) * 100).toFixed(1);
  }

  /** Convierte a objeto plano para enviar al API. */
  toPayload() {
    const { id_videojuego, nombre_categoria, ...rest } = this;
    return rest;
  }
}

/** Formulario vacío para crear un videojuego nuevo. */
export const FORM_VACIO = {
  titulo: '', plataforma: '', desarrollador: '',
  anio_lanzamiento: '', clasificacion: 'TODOS',
  precio_compra: '', precio_venta: '',
  stock_actual: '', stock_minimo: '3', stock_maximo: '100',
  estado: 'ACTIVO', id_categoria: '',
};

/** Validaciones del formulario — retorna objeto { campo: mensaje }. */
export function validarForm(form) {
  const e = {};
  if (!form.titulo?.trim())                                    e.titulo = 'Requerido';
  if (!form.plataforma)                                        e.plataforma = 'Requerido';
  if (!form.precio_compra || Number(form.precio_compra) < 0)  e.precio_compra = 'Precio inválido';
  if (!form.precio_venta  || Number(form.precio_venta) < 0)   e.precio_venta  = 'Precio inválido';
  if (!form.stock_actual  || Number(form.stock_actual) < 0)   e.stock_actual  = 'Stock inválido';
  if (!form.id_categoria)                                      e.id_categoria  = 'Requerido';
  const anio = Number(form.anio_lanzamiento);
  if (!anio || anio < 1970 || anio > 2100)                    e.anio_lanzamiento = 'Año entre 1970–2100';
  return e;
}