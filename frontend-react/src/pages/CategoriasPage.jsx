import { useState, useEffect, useCallback } from 'react';
import CategoriaDAO from '../dao/categoriaDAO';
import { FORM_VACIO_CATEGORIA, validarCategoria } from '../models/categoria';
import { Modal, Toast } from '../components/Modal';
import Topbar from '../components/layout/Topbar';

const ICONOS = ['🗡️', '🐉', '⚽', '♟️', '👻', '🎮', '🏎️', '🧩'];

function FormCategoria({ inicial, onSubmit, onCancel, cargando }) {
  const [form, setForm] = useState(inicial || FORM_VACIO_CATEGORIA);
  const [errores, setErrores] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errores[k]) setErrores(p => ({ ...p, [k]: null })); };
  const enviar = () => {
    const e = validarCategoria(form);
    if (Object.keys(e).length) { setErrores(e); return; }
    onSubmit(form);
  };
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">Nombre</label>
        <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Acción" />
        {errores.nombre && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.nombre}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Descripción</label>
        <input className="input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción opcional" />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-green" onClick={enviar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [enviando,   setEnviando]   = useState(false);
  const [modal,      setModal]      = useState(null);
  const [actual,     setActual]     = useState(null);
  const [toast,      setToast]      = useState(null);

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setCategorias(await CategoriaDAO.obtenerTodas()); }
    catch { notificar('No se pudo conectar con el backend', 'error'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (form) => {
    setEnviando(true);
    try { await CategoriaDAO.crear(form); await cargar(); setModal(null); notificar('Categoría creada'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEditar = async (form) => {
    setEnviando(true);
    try { await CategoriaDAO.actualizar(actual.id_categoria, form); await cargar(); setModal(null); notificar('Categoría actualizada'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEliminar = async () => {
    setEnviando(true);
    try { await CategoriaDAO.eliminar(actual.id_categoria); await cargar(); setModal(null); notificar('Categoría eliminada'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <Topbar titulo="Categorías — Clasificación de videojuegos" botonLabel="+ Nueva Categoría" onBoton={() => setModal('crear')} />
      <div className="content">
        <div className="card">
          <div className="card-head">
            <h3>🏷️ Categorías de Videojuegos</h3>
            <span className="badge badge-green">{categorias.length} categorías</span>
          </div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando...</div>
          ) : (
            <div className="grid-cards" style={{ padding: 20 }}>
              {categorias.map((c, i) => (
                <div className="cat-card" key={c.id_categoria}>
                  <div className="cat-icon">{ICONOS[i % ICONOS.length]}</div>
                  <div className="cat-name">{c.nombre}</div>
                  <div className="cat-desc">{c.descripcion || '—'}</div>
                  <div className="actions-cell" style={{ marginTop: 6 }}>
                    <span className="icon-btn" onClick={() => { setActual(c); setModal('editar'); }}>✏️</span>
                    <span className="icon-btn danger" onClick={() => { setActual(c); setModal('confirmar'); }}>🗑️</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal === 'crear' && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Nueva categoría</h3>
          <FormCategoria onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'editar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Editar categoría</h3>
          <FormCategoria inicial={actual} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'confirmar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar categoría?</h3>
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
