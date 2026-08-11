export class Usuario {
  static ROLES = ['ADMINISTRADOR', 'ALMACENERO', 'SUPERVISOR', 'AUDITOR'];

  constructor(data = {}) {
    this.id_usuario     = data.id_usuario     ?? null;
    this.nombre          = data.nombre          ?? '';
    this.apellido         = data.apellido         ?? '';
    this.email            = data.email            ?? '';
    this.password_hash    = data.password_hash    ?? '';
    this.rol              = data.rol              ?? 'ALMACENERO';
    this.activo            = data.activo            ?? true;
    this.fecha_registro   = data.fecha_registro   ?? null;
  }
  toPayload() {
    const { id_usuario, fecha_registro, ...rest } = this;
    return rest;
  }
}

export const FORM_VACIO_USUARIO = {
  nombre: '', apellido: '', email: '', password_hash: '', rol: 'ALMACENERO', activo: true,
};

export function validarUsuario(form, esEdicion = false) {
  const e = {};
  if (!form.nombre?.trim())        e.nombre = 'Requerido';
  if (!form.apellido?.trim())      e.apellido = 'Requerido';
  if (!form.email?.trim())         e.email = 'Requerido';
  if (!esEdicion && !form.password_hash?.trim()) e.password_hash = 'Requerido';
  return e;
}
