import { useState, useEffect, useCallback } from 'react';
import ProveedorDAO from '../dao/proveedorDAO';
import { FORM_VACIO_PROVEEDOR, validarProveedor } from '../models/proveedor';
import { Modal, Toast } from '../components/Modal';
import Topbar from '../components/layout/Topbar';

function FormProveedor({ inicial, onSubmit, onCancel, cargando }) {
  const [form, setForm] = useState(inicial || FORM_VACIO_PROVEEDOR);
  const [errores, setErrores] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errores[k]) setErrores(p => ({ ...p, [k]: null })); };
  const enviar = () => {
    const e = validarProveedor(form);
    if (Object.keys(e).length) { setErrores(e); return; }
    onSubmit(form);
  };
  return (
    <div>
      {[
        ['razon_social', 'Razón social'],
        ['ruc', 'RUC'],
        ['telefono', 'Teléfono'],
        ['email', 'Email'],
        ['direccion', 'Dirección'],
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

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [modal,       setModal]       = useState(null);
  const [actual,      setActual]      = useState(null);
  const [toast,       setToast]       = useState(null);

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setProveedores(await ProveedorDAO.obtenerTodos()); }
    catch { notificar('No se pudo conectar con el backend', 'error'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (form) => {
    setEnviando(true);
    try { await ProveedorDAO.crear(form); await cargar(); setModal(null); notificar('Proveedor creado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEditar = async (form) => {
    setEnviando(true);
    try { await ProveedorDAO.actualizar(actual.id_proveedor, form); await cargar(); setModal(null); notificar('Proveedor actualizado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEliminar = async () => {
    setEnviando(true);
    try { await ProveedorDAO.eliminar(actual.id_proveedor); await cargar(); setModal(null); notificar('Proveedor eliminado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <Topbar titulo="Proveedores — Distribuidores registrados" botonLabel="+ Nuevo Proveedor" onBoton={() => setModal('crear')} />
      <div className="content">
        <div className="card">
          <div className="card-head">
            <h3>🏭 Proveedores</h3>
            <span className="badge badge-purple">{proveedores.filter(p => p.activo).length} activos</span>
          </div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando...</div>
          ) : (
            <div className="grid-cards" style={{ padding: 20 }}>
              {proveedores.map(p => (
                <div className="prov-card2" key={p.id_proveedor}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="prov-avatar">{p.razon_social.slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div className="prov-name">{p.razon_social}</div>
                      <div className="prov-ruc">RUC: {p.ruc || '—'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '.76rem', color: 'var(--text2)', marginTop: 6 }}>📞 {p.telefono || '—'} · ✉️ {p.email || '—'}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>📍 {p.direccion || '—'}</div>
                  <div className="actions-cell" style={{ marginTop: 6 }}>
                    <span className="icon-btn" onClick={() => { setActual(p); setModal('editar'); }}>✏️</span>
                    <span className="icon-btn danger" onClick={() => { setActual(p); setModal('confirmar'); }}>🗑️</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal === 'crear' && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Nuevo proveedor</h3>
          <FormProveedor onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'editar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Editar proveedor</h3>
          <FormProveedor inicial={actual} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'confirmar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar proveedor?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22 }}>Se eliminará <strong>{actual.razon_social}</strong> permanentemente.</p>
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
