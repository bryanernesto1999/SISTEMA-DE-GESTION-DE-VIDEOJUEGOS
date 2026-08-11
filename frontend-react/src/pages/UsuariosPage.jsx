import { useState, useEffect, useCallback } from 'react';
import UsuarioDAO from '../dao/usuarioDAO';
import { Usuario, FORM_VACIO_USUARIO, validarUsuario } from '../models/usuario';
import { Modal, Toast } from '../components/Modal';
import Topbar from '../components/layout/Topbar';

function FormUsuario({ inicial, onSubmit, onCancel, cargando, esEdicion }) {
  const [form, setForm] = useState(inicial || FORM_VACIO_USUARIO);
  const [errores, setErrores] = useState({});
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); if (errores[k]) setErrores(p => ({ ...p, [k]: null })); };
  const enviar = () => {
    const e = validarUsuario(form, esEdicion);
    if (Object.keys(e).length) { setErrores(e); return; }
    onSubmit(form);
  };
  return (
    <div>
      {[['nombre', 'Nombre'], ['apellido', 'Apellido'], ['email', 'Email']].map(([campo, label]) => (
        <div key={campo} style={{ marginBottom: 12 }}>
          <label className="form-label">{label}</label>
          <input className="input" value={form[campo]} onChange={e => set(campo, e.target.value)} />
          {errores[campo] && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores[campo]}</span>}
        </div>
      ))}
      <div style={{ marginBottom: 12 }}>
        <label className="form-label">{esEdicion ? 'Nueva contraseña (dejar como está si no cambia)' : 'Contraseña temporal'}</label>
        <input className="input" type="password" value={form.password_hash} onChange={e => set('password_hash', e.target.value)} />
        {errores.password_hash && <span style={{ color: '#ef4444', fontSize: 12 }}>{errores.password_hash}</span>}
      </div>
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Rol</label>
        <select className="input" value={form.rol} onChange={e => set('rol', e.target.value)}>
          {Usuario.ROLES.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-green" onClick={enviar} disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modal,    setModal]    = useState(null);
  const [actual,   setActual]   = useState(null);
  const [toast,    setToast]    = useState(null);

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setUsuarios(await UsuarioDAO.obtenerTodos()); }
    catch { notificar('No se pudo conectar con el backend', 'error'); }
    finally { setCargando(false); }
  }, []);
  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (form) => {
    setEnviando(true);
    try { await UsuarioDAO.crear(form); await cargar(); setModal(null); notificar('Usuario creado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEditar = async (form) => {
    setEnviando(true);
    try {
      const payload = { ...form };
      if (!payload.password_hash) delete payload.password_hash; // no tocar la contraseña si se dejó vacía
      await UsuarioDAO.actualizar(actual.id_usuario, payload);
      await cargar(); setModal(null); notificar('Usuario actualizado');
    }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };
  const handleEliminar = async () => {
    setEnviando(true);
    try { await UsuarioDAO.eliminar(actual.id_usuario); await cargar(); setModal(null); notificar('Usuario eliminado'); }
    catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  return (
    <>
      <Topbar titulo="Usuarios y Roles — Administración de accesos" botonLabel="+ Nuevo Usuario" onBoton={() => setModal('crear')} />
      <div className="content">
        <div className="card">
          <div className="card-head">
            <h3>👤 Usuarios y Roles</h3>
            <span className="badge badge-green">{usuarios.length} usuarios</span>
          </div>
          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando...</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Registro</th><th>Activo</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id_usuario}>
                    <td>{u.nombre} {u.apellido}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-purple">{u.rol}</span></td>
                    <td>{u.fecha_registro || '—'}</td>
                    <td>{u.activo ? '✅' : '—'}</td>
                    <td>
                      <div className="actions-cell">
                        <span className="icon-btn" onClick={() => { setActual({ ...u, password_hash: '' }); setModal('editar'); }}>✏️</span>
                        <span className="icon-btn danger" onClick={() => { setActual(u); setModal('confirmar'); }}>🗑️</span>
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
          <h3 style={{ marginBottom: 18 }}>Nuevo usuario</h3>
          <FormUsuario onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}
      {modal === 'editar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Editar usuario</h3>
          <FormUsuario inicial={actual} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} esEdicion />
        </Modal>
      )}
      {modal === 'confirmar' && actual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar usuario?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22 }}>Se eliminará <strong>{actual.nombre} {actual.apellido}</strong> permanentemente.</p>
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
