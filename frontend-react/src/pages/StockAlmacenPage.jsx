import { useState, useEffect, useCallback } from 'react';
import StockAlmacenDAO from '../dao/stockAlmacenDAO';
import VideojuegoDAO from '../dao/videojuegoDAO';
import AlmacenDAO from '../dao/almacenDAO';
import { FORM_VACIO_STOCK, validarStock } from '../models/stockAlmacen';
import { Modal, Toast } from '../components/Modal';
import Topbar from '../components/layout/Topbar';

function FormStock({ inicial, videojuegos, almacenes, onSubmit, onCancel, cargando, esEdicion }) {
  const [form, setForm] = useState(inicial || FORM_VACIO_STOCK);
  const [errores, setErrores] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errores[k]) setErrores(p => ({ ...p, [k]: null })); };
  const enviar = () => {
    const e = validarStock(form);
    if (Object.keys(e).length) { setErrores(e); return; }
    onSubmit({ ...form, id_videojuego: Number(form.id_videojuego), id_almacen: Number(form.id_almacen), cantidad: Number(form.cantidad) });
  };
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Videojuego</label>
        <select className="input" disabled={esEdicion} value={form.id_videojuego} onChange={e => set('id_videojuego', e.target.value)}>
          <option value="">Seleccionar...</option>
          {videojuegos.map(v => <option key={v.id_videojuego} value={v.id_videojuego}>{v.titulo}</option>)}
        </select>
        {errores.id_videojuego && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.id_videojuego}</span>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Almacén</label>
        <select className="input" disabled={esEdicion} value={form.id_almacen} onChange={e => set('id_almacen', e.target.value)}>
          <option value="">Seleccionar...</option>
          {almacenes.map(a => <option key={a.id_almacen} value={a.id_almacen}>{a.nombre}</option>)}
        </select>
        {errores.id_almacen && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.id_almacen}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Cantidad</label>
        <input className="input" type="number" min="0" value={form.cantidad} onChange={e => set('cantidad', e.target.value)} />
        {errores.cantidad && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.cantidad}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-green" onClick={enviar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );
}

export default function StockAlmacenPage() {
  const [stock,       setStock]       = useState([]);
  const [videojuegos, setVideojuegos] = useState([]);
  const [almacenes,   setAlmacenes]   = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [modal,       setModal]       = useState(null);
  const [actual,      setActual]      = useState(null);
  const [toast,       setToast]       = useState(null);

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [s, v, a] = await Promise.all([StockAlmacenDAO.obtenerTodos(), VideojuegoDAO.obtenerTodos(), AlmacenDAO.obtenerTodos()]);
      setStock(s); setVideojuegos(v); setAlmacenes(a);
    } catch { notificar('No se pudo conectar con el backend', 'error'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const nombreVideojuego = (id) => videojuegos.find(v => v.id_videojuego === id)?.titulo || `#${id}`;
  const nombreAlmacen    = (id) => almacenes.find(a => a.id_almacen === id)?.nombre || `#${id}`;

  const handleCrear = async (form) => {
    setEnviando(true);
    try { await StockAlmacenDAO.crear(form); await cargar(); setModal(null); notificar('Stock registrado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEditar = async (form) => {
    setEnviando(true);
    try {
      await StockAlmacenDAO.actualizar(actual.id_videojuego, actual.id_almacen, { cantidad: Number(form.cantidad) });
      await cargar(); setModal(null); notificar('Stock actualizado');
    } catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEliminar = async () => {
    setEnviando(true);
    try { await StockAlmacenDAO.eliminar(actual.id_videojuego, actual.id_almacen); await cargar(); setModal(null); notificar('Registro eliminado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <Topbar titulo="Stock por Almacén — Distribución de inventario" botonLabel="+ Nuevo Registro" onBoton={() => setModal('crear')} />
      <div className="content">
        <div className="card">
          <div className="card-head"><h3>🏪 Stock por Almacén</h3><span className="badge badge-green">{stock.length} registros</span></div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando...</div>
          ) : (
            <table className="tbl">
              <thead><tr><th>Videojuego</th><th>Almacén</th><th>Cantidad</th><th>Última actualización</th><th>Acciones</th></tr></thead>
              <tbody>
                {stock.map(s => (
                  <tr key={`${s.id_videojuego}-${s.id_almacen}`}>
                    <td>{nombreVideojuego(s.id_videojuego)}</td>
                    <td>{nombreAlmacen(s.id_almacen)}</td>
                    <td>{s.cantidad}</td>
                    <td>{s.fecha_actualizacion || '—'}</td>
                    <td>
                      <div className="actions-cell">
                        <span className="icon-btn" onClick={() => { setActual({ ...s, cantidad: String(s.cantidad) }); setModal('editar'); }}>✏️</span>
                        <span className="icon-btn danger" onClick={() => { setActual(s); setModal('confirmar'); }}>🗑️</span>
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
          <h3 style={{ marginBottom: 18 }}>Nuevo registro de stock</h3>
          <FormStock videojuegos={videojuegos} almacenes={almacenes} onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'editar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Editar cantidad</h3>
          <FormStock inicial={actual} videojuegos={videojuegos} almacenes={almacenes} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} esEdicion />
        </Modal>
      )}
      {modal === 'confirmar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar registro de stock?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22 }}>
            Se eliminará el stock de <strong>{nombreVideojuego(actual.id_videojuego)}</strong> en <strong>{nombreAlmacen(actual.id_almacen)}</strong>.
          </p>
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
