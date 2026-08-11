import { useState } from 'react';
import { Videojuego, FORM_VACIO, validarForm } from '../models/videojuego';

const input = (err) => ({
  width: '100%', background: '#0f1420',
  border: `0.5px solid ${err ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
  borderRadius: 7, padding: '8px 10px',
  color: '#e2e8f0', fontSize: 13,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
});

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.7 }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: '#ef4444', fontSize: 11, marginTop: 3, display: 'block' }}>{error}</span>}
    </div>
  );
}

export default function FormVideojuego({ inicial, categorias = [], onSubmit, onCancel, cargando }) {
  const [form, setForm] = useState(inicial || FORM_VACIO);
  const [errores, setErrores] = useState({});

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errores[k]) setErrores(p => ({ ...p, [k]: null }));
  };

  const enviar = () => {
    const e = validarForm(form);
    if (Object.keys(e).length) { setErrores(e); return; }
    // Convierte tipos antes de enviar
    onSubmit({
      ...form,
      precio_compra:    Number(form.precio_compra),
      precio_venta:     Number(form.precio_venta),
      stock_actual:     Number(form.stock_actual),
      stock_minimo:     Number(form.stock_minimo),
      stock_maximo:     Number(form.stock_maximo),
      anio_lanzamiento: Number(form.anio_lanzamiento),
      id_categoria:     Number(form.id_categoria),
    });
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Título del videojuego" error={errores.titulo}>
            <input style={input(errores.titulo)} value={form.titulo}
              onChange={e => set('titulo', e.target.value)} placeholder="Ej: Elden Ring" />
          </Field>
        </div>

        <Field label="Plataforma" error={errores.plataforma}>
          <select style={input(errores.plataforma)} value={form.plataforma}
            onChange={e => set('plataforma', e.target.value)}>
            <option value="">Seleccionar...</option>
            {Videojuego.PLATAFORMAS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>

        <Field label="Categoría" error={errores.id_categoria}>
          <select style={input(errores.id_categoria)} value={form.id_categoria}
            onChange={e => set('id_categoria', e.target.value)}>
            <option value="">Seleccionar...</option>
            {categorias.map(c => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </Field>

        <Field label="Desarrollador">
          <input style={input(false)} value={form.desarrollador}
            onChange={e => set('desarrollador', e.target.value)} placeholder="Ej: FromSoftware" />
        </Field>

        <Field label="Año de lanzamiento" error={errores.anio_lanzamiento}>
          <input style={input(errores.anio_lanzamiento)} type="number"
            value={form.anio_lanzamiento} onChange={e => set('anio_lanzamiento', e.target.value)}
            placeholder="2024" min="1970" max="2100" />
        </Field>

        <Field label="Precio compra (S/)" error={errores.precio_compra}>
          <input style={input(errores.precio_compra)} type="number"
            value={form.precio_compra} onChange={e => set('precio_compra', e.target.value)}
            placeholder="0.00" min="0" step="0.01" />
        </Field>

        <Field label="Precio venta (S/)" error={errores.precio_venta}>
          <input style={input(errores.precio_venta)} type="number"
            value={form.precio_venta} onChange={e => set('precio_venta', e.target.value)}
            placeholder="0.00" min="0" step="0.01" />
        </Field>

        <Field label="Stock actual" error={errores.stock_actual}>
          <input style={input(errores.stock_actual)} type="number"
            value={form.stock_actual} onChange={e => set('stock_actual', e.target.value)}
            placeholder="0" min="0" />
        </Field>

        <Field label="Clasificación">
          <select style={input(false)} value={form.clasificacion}
            onChange={e => set('clasificacion', e.target.value)}>
            {Videojuego.CLASIFICACIONES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Estado">
          <select style={input(false)} value={form.estado}
            onChange={e => set('estado', e.target.value)}>
            {Videojuego.ESTADOS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)',
          color: '#9ca3af', padding: '8px 18px', borderRadius: 7,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
        }}>Cancelar</button>
        <button onClick={enviar} disabled={cargando} style={{
          background: 'linear-gradient(135deg,#7c3aed,#5b21b6)',
          color: '#fff', border: 'none', padding: '8px 22px', borderRadius: 7,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
          opacity: cargando ? 0.6 : 1,
        }}>{cargando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );
}
