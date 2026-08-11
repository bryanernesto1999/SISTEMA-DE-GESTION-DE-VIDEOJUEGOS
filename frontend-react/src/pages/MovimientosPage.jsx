import { useState, useEffect, useCallback } from 'react';
import MovimientoDAO from '../dao/movimientoDAO';
import VideojuegoDAO from '../dao/videojuegoDAO';
import AlmacenDAO from '../dao/almacenDAO';
import UsuarioDAO from '../dao/usuarioDAO';
import { MovimientoInventario, FORM_VACIO_MOVIMIENTO, validarMovimiento } from '../models/movimientoInventario';
import { Modal, Toast } from '../components/Modal';
import Topbar from '../components/layout/Topbar';

function FormMovimiento({ videojuegos, almacenes, usuarios, onSubmit, onCancel, cargando }) {
  const [form, setForm] = useState(FORM_VACIO_MOVIMIENTO);
  const [errores, setErrores] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errores[k]) setErrores(p => ({ ...p, [k]: null })); };
  const enviar = () => {
    const e = validarMovimiento(form);
    if (Object.keys(e).length) { setErrores(e); return; }
    onSubmit({
      ...form,
      cantidad: Number(form.cantidad),
      precio_unitario: form.precio_unitario ? Number(form.precio_unitario) : null,
      id_videojuego: Number(form.id_videojuego),
      id_almacen: Number(form.id_almacen),
      id_usuario: Number(form.id_usuario),
    });
  };
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Tipo de movimiento</label>
        <select className="input" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
          {MovimientoInventario.TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Cantidad</label>
        <input className="input" type="number" min="1" value={form.cantidad} onChange={e => set('cantidad', e.target.value)} />
        {errores.cantidad && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.cantidad}</span>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Videojuego</label>
        <select className="input" value={form.id_videojuego} onChange={e => set('id_videojuego', e.target.value)}>
          <option value="">Seleccionar...</option>
          {videojuegos.map(v => <option key={v.id_videojuego} value={v.id_videojuego}>{v.titulo}</option>)}
        </select>
        {errores.id_videojuego && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.id_videojuego}</span>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Almacén</label>
        <select className="input" value={form.id_almacen} onChange={e => set('id_almacen', e.target.value)}>
          <option value="">Seleccionar...</option>
          {almacenes.map(a => <option key={a.id_almacen} value={a.id_almacen}>{a.nombre}</option>)}
        </select>
        {errores.id_almacen && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.id_almacen}</span>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Usuario responsable</label>
        <select className="input" value={form.id_usuario} onChange={e => set('id_usuario', e.target.value)}>
          <option value="">Seleccionar...</option>
          {usuarios.map(u => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido}</option>)}
        </select>
        {errores.id_usuario && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.id_usuario}</span>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Precio unitario (S/) — opcional</label>
        <input className="input" type="number" min="0" step="0.01" value={form.precio_unitario} onChange={e => set('precio_unitario', e.target.value)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Motivo</label>
        <input className="input" value={form.motivo} onChange={e => set('motivo', e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-green" onClick={enviar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [videojuegos, setVideojuegos] = useState([]);
  const [almacenes,   setAlmacenes]   = useState([]);
  const [usuarios,    setUsuarios]    = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [modal,       setModal]       = useState(null);
  const [actual,      setActual]      = useState(null);
  const [toast,       setToast]       = useState(null);

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [m, v, a, u] = await Promise.all([
        MovimientoDAO.obtenerTodos(), VideojuegoDAO.obtenerTodos(), AlmacenDAO.obtenerTodos(), UsuarioDAO.obtenerTodos(),
      ]);
      setMovimientos(m); setVideojuegos(v); setAlmacenes(a); setUsuarios(u);
    } catch { notificar('No se pudo conectar con el backend', 'error'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const nombreVideojuego = (id) => videojuegos.find(v => v.id_videojuego === id)?.titulo || `#${id}`;
  const nombreAlmacen    = (id) => almacenes.find(a => a.id_almacen === id)?.nombre || `#${id}`;
  const nombreUsuario    = (id) => { const u = usuarios.find(u => u.id_usuario === id); return u ? `${u.nombre} ${u.apellido}` : `#${id}`; };

  const handleCrear = async (form) => {
    setEnviando(true);
    try { await MovimientoDAO.crear(form); await cargar(); setModal(null); notificar('Movimiento registrado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEliminar = async () => {
    setEnviando(true);
    try { await MovimientoDAO.eliminar(actual.id_movimiento); await cargar(); setModal(null); notificar('Movimiento eliminado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <Topbar titulo="Movimientos — Historial de inventario" botonLabel="+ Movimiento" onBoton={() => setModal('crear')} />
      <div className="content">
        <div className="card">
          <div className="card-head"><h3>🔄 Historial de Movimientos</h3><span className="badge badge-green">{movimientos.length} registros</span></div>
          <div className="note-box">💡 Este historial no edita registros pasados — para corregir algo, se registra un nuevo movimiento (ej. tipo AJUSTE).</div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando...</div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Tipo</th><th>Cant.</th><th>Videojuego</th><th>Almacén</th><th>Motivo</th><th>P. Unitario</th><th>Usuario</th><th>Fecha</th><th>Acciones</th></tr></thead>
              <tbody>
                {movimientos.map(m => (
                  <tr key={m.id_movimiento}>
                    <td><span className="badge badge-blue">{m.tipo}</span></td>
                    <td>{m.cantidad}</td>
                    <td>{nombreVideojuego(m.id_videojuego)}</td>
                    <td>{nombreAlmacen(m.id_almacen)}</td>
                    <td>{m.motivo || '—'}</td>
                    <td>{m.precio_unitario != null ? `S/ ${Number(m.precio_unitario).toFixed(2)}` : '—'}</td>
                    <td>{nombreUsuario(m.id_usuario)}</td>
                    <td>{m.fecha ? new Date(m.fecha).toLocaleString('es-PE') : '—'}</td>
                    <td>
                      <div className="actions-cell">
                        <span className="icon-btn danger" onClick={() => { setActual(m); setModal('confirmar'); }}>🗑️</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal === 'crear' && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Nuevo movimiento</h3>
          <FormMovimiento videojuegos={videojuegos} almacenes={almacenes} usuarios={usuarios} onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'confirmar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar movimiento?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22 }}>Esta acción no se puede deshacer.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: '#dc2626', color: '#fff' }} disabled={enviando} onClick={handleEliminar}>
              {enviando ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </Modal>
      )}
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </>
  );
}
