export class Categoria {
  constructor(data = {}) {
    this.id_categoria = data.id_categoria ?? null;
    this.nombre        = data.nombre        ?? '';
    this.descripcion   = data.descripcion   ?? '';
  }
  toPayload() {
    const { id_categoria, ...rest } = this;
    return rest;
  }
}

export const FORM_VACIO_CATEGORIA = { nombre: '', descripcion: '' };

export function validarCategoria(form) {
  const e = {};
  if (!form.nombre?.trim()) e.nombre = 'Requerido';
  return e;
}
