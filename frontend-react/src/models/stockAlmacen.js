export class StockAlmacen {
  constructor(data = {}) {
    this.id_videojuego       = data.id_videojuego       ?? null;
    this.id_almacen           = data.id_almacen           ?? null;
    this.cantidad              = data.cantidad              ?? 0;
    this.fecha_actualizacion  = data.fecha_actualizacion  ?? null;
  }
}

export const FORM_VACIO_STOCK = { id_videojuego: '', id_almacen: '', cantidad: '0' };

export function validarStock(form) {
  const e = {};
  if (!form.id_videojuego) e.id_videojuego = 'Requerido';
  if (!form.id_almacen)     e.id_almacen = 'Requerido';
  if (form.cantidad === '' || Number(form.cantidad) < 0) e.cantidad = 'Cantidad inválida';
  return e;
}
