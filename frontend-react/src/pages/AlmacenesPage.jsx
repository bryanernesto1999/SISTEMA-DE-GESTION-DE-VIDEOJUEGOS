import { useState, useEffect, useCallback } from 'react';
import AlmacenDAO from '../dao/almacenDAO';
import { FORM_VACIO_ALMACEN, validarAlmacen } from '../models/almacen';
import { Modal, Toast } from '../components/Modal';
import Topbar from '../components/layout/Topbar';

function FormAlmacen({ inicial, onSubmit, onCancel, cargando }) {
  const [form, setForm] = useState(inicial || FORM_VACIO_ALMACEN);
  const [errores, setErrores] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errores[k]) setErrores(p => ({ ...p, [k]: null })); };
  const enviar = () => {
    const e = validarAlmacen(form);
    if (Object.keys(e).length) { setErrores(e); return; }
    onSubmit(form);
  };
  return (
    <div>
      {[
        ['nombre', 'Nombre'],
        ['ubicacion', 'Ubicación'],
        ['responsable', 'Responsable'],
      ].map(([campo, label]) => (
        <div key={campo} style={{ marginBottom: 12 }}>
          <label className="form-label">{label}</label>
          <input className="input" value={form[campo]} onChange={e => set(campo, e.target.value)} />
          {errores[campo] && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores[campo]}</span>}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-green" onClick={enviar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );
}

export default function AlmacenesPage() {
  const [almacenes, setAlmacenes] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [enviando,  setEnviando]  = useState(false);
  const [modal,     setModal]     = useState(null);
  const [actual,    setActual]    = useState(null);
  const [toast,     setToast]     = useState(null);

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setAlmacenes(await AlmacenDAO.obtenerTodos()); }
    catch { notificar('No se pudo conectar con el backend', 'error'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (form) => {
    setEnviando(true);
    try { await AlmacenDAO.crear(form); await cargar(); setModal(null); notificar('Almacén creado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEditar = async (form) => {
    setEnviando(true);
    try { await AlmacenDAO.actualizar(actual.id_almacen, form); await cargar(); setModal(null); notificar('Almacén actualizado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEliminar = async () => {
    setEnviando(true);
    try { await AlmacenDAO.eliminar(actual.id_almacen); await cargar(); setModal(null); notificar('Almacén eliminado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <Topbar titulo="Almacenes — Ubicaciones físicas" botonLabel="+ Nuevo Almacén" onBoton={() => setModal('crear')} />
      <div className="content">
        <div className="card">
          <div className="card-head">
            <h3>🏪 Almacenes</h3>
            <span className="badge badge-green">{almacenes.filter(a => a.activo).length} activos</span>
          </div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando...</div>
          ) : (
            <div className="grid-cards" style={{ padding: 20 }}>
              {almacenes.map(a => (
                <div key={a.id_almacen} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
                  <div style={{ fontSize: 22 }}>🏪</div>
                  <div className="alm-name" style={{ fontSize: '.95rem' }}>{a.nombre}</div>
                  <div className="alm-loc">📍 {a.ubicacion}</div>
                  <div className="alm-sub">👤 Responsable: {a.responsable || '—'}</div>
                  <div className="actions-cell" style={{ marginTop: 6 }}>
                    <span className="icon-btn" onClick={() => { setActual(a); setModal('editar'); }}>✏️</span>
                    <span className="icon-btn danger" onClick={() => { setActual(a); setModal('confirmar'); }}>🗑️</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal === 'crear' && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Nuevo almacén</h3>
          <FormAlmacen onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'editar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Editar almacén</h3>
          <FormAlmacen inicial={actual} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'confirmar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar almacén?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22 }}>Se eliminará <strong>{actual.nombre}</strong> permanentemente.</p>
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
