export class MovimientoInventario {
  static TIPOS = ['ENTRADA', 'SALIDA', 'TRASLADO', 'DEVOLUCION', 'AJUSTE'];

  constructor(data = {}) {
    this.id_movimiento   = data.id_movimiento   ?? null;
    this.tipo              = data.tipo              ?? 'ENTRADA';
    this.cantidad           = data.cantidad           ?? 1;
    this.fecha              = data.fecha              ?? null;
    this.motivo              = data.motivo              ?? '';
    this.precio_unitario    = data.precio_unitario    ?? null;
    this.id_videojuego     = data.id_videojuego     ?? null;
    this.id_almacen          = data.id_almacen          ?? null;
    this.id_usuario           = data.id_usuario           ?? null;
  }
  toPayload() {
    const { id_movimiento, fecha, ...rest } = this;
    return rest;
  }
}

export const FORM_VACIO_MOVIMIENTO = {
  tipo: 'ENTRADA', cantidad: '1', motivo: '', precio_unitario: '',
  id_videojuego: '', id_almacen: '', id_usuario: '',
};

export function validarMovimiento(form) {
  const e = {};
  if (!form.tipo)                                         e.tipo = 'Requerido';
  if (!form.cantidad || Number(form.cantidad) <= 0)       e.cantidad = 'Debe ser mayor a 0';
  if (!form.id_videojuego)                                 e.id_videojuego = 'Requerido';
  if (!form.id_almacen)                                     e.id_almacen = 'Requerido';
  if (!form.id_usuario)                                      e.id_usuario = 'Requerido';
  return e;
}
