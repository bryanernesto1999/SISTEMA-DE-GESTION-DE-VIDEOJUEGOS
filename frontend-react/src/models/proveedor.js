export class Proveedor {
  constructor(data = {}) {
    this.id_proveedor = data.id_proveedor ?? null;
    this.razon_social  = data.razon_social  ?? '';
    this.ruc           = data.ruc           ?? '';
    this.telefono       = data.telefono       ?? '';
    this.email          = data.email          ?? '';
    this.direccion      = data.direccion      ?? '';
    this.activo         = data.activo         ?? true;
  }
  toPayload() {
    const { id_proveedor, ...rest } = this;
    return rest;
  }
}

export const FORM_VACIO_PROVEEDOR = {
  razon_social: '', ruc: '', telefono: '', email: '', direccion: '', activo: true,
};

export function validarProveedor(form) {
  const e = {};
  if (!form.razon_social?.trim()) e.razon_social = 'Requerido';
  return e;
}
