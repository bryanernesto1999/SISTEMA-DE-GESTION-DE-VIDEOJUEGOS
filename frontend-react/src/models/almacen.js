export class Almacen {
  constructor(data = {}) {
    this.id_almacen  = data.id_almacen  ?? null;
    this.nombre       = data.nombre       ?? '';
    this.ubicacion     = data.ubicacion     ?? '';
    this.responsable   = data.responsable   ?? '';
    this.activo        = data.activo        ?? true;
  }
  toPayload() {
    const { id_almacen, ...rest } = this;
    return rest;
  }
}

export const FORM_VACIO_ALMACEN = { nombre: '', ubicacion: '', responsable: '', activo: true };

export function validarAlmacen(form) {
  const e = {};
  if (!form.nombre?.trim())    e.nombre = 'Requerido';
  if (!form.ubicacion?.trim()) e.ubicacion = 'Requerido';
  return e;
}
