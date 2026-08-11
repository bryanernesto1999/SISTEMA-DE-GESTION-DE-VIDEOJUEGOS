import { useState, useEffect, useCallback } from 'react';
import VideojuegoDAO, { CategoriaDAO } from '../dao/videojuegoDAO';
import { Videojuego, FORM_VACIO } from '../models/videojuego';
import TarjetaVideojuego from '../components/TarjetaVideojuego';
import FormVideojuego    from '../components/FormVideojuego';
import { Modal, Toast }  from '../components/Modal';
import Topbar from '../components/layout/Topbar';

export default function VideojuegosPage() {
  const [videojuegos, setVideojuegos] = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [alertas,     setAlertas]     = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [modal,       setModal]       = useState(null);
  const [vjActual,    setVjActual]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [busqueda,    setBusqueda]    = useState('');
  const [filtroCat,   setFiltroCat]   = useState('');
  const [filtroEst,   setFiltroEst]   = useState('');

  const notificar = (msg, tipo = 'ok') => setToast({ msg, tipo });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [vjs, cats, als] = await Promise.all([
        VideojuegoDAO.obtenerTodos(),
        CategoriaDAO.obtenerTodas(),
        CategoriaDAO.obtenerAlertas(),
      ]);
      setVideojuegos(vjs);
      setCategorias(cats);
      setAlertas(als);
    } catch {
      notificar('No se pudo conectar con el backend', 'error');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleCrear = async (form) => {
    setEnviando(true);
    try {
      const nuevo = await VideojuegoDAO.crear(form);
      setVideojuegos(prev => [...prev, nuevo]);
      setModal(null);
      notificar('Videojuego registrado correctamente');
    } catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  const handleEditar = async (form) => {
    setEnviando(true);
    try {
      const actualizado = await VideojuegoDAO.actualizar(vjActual.id_videojuego, form);
      setVideojuegos(prev => prev.map(v => v.id_videojuego === actualizado.id_videojuego ? actualizado : v));
      setModal(null);
      notificar('Videojuego actualizado');
    } catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  const handleEliminar = async () => {
    setEnviando(true);
    try {
      await VideojuegoDAO.eliminar(vjActual.id_videojuego);
      setVideojuegos(prev => prev.filter(v => v.id_videojuego !== vjActual.id_videojuego));
      setModal(null);
      notificar('Videojuego eliminado');
    } catch (e) { notificar(e.message, 'error'); }
    finally { setEnviando(false); }
  };

  const handleStock = async (id, cantidad) => {
    try {
      const actualizado = await VideojuegoDAO.actualizarStock(id, cantidad);
      setVideojuegos(prev => prev.map(v => v.id_videojuego === actualizado.id_videojuego ? actualizado : v));
      notificar('Stock actualizado');
    } catch (e) { notificar(e.message, 'error'); }
  };

  const filtrados = videojuegos.filter(v => {
    const q = busqueda.toLowerCase();
    const ok1 = !q || v.titulo.toLowerCase().includes(q) || (v.desarrollador || '').toLowerCase().includes(q);
    const ok2 = !filtroCat || String(v.id_categoria) === filtroCat;
    const ok3 = !filtroEst || v.estado === filtroEst;
    return ok1 && ok2 && ok3;
  });

  const formEditar = vjActual ? {
    ...FORM_VACIO, ...vjActual,
    precio_compra:    String(vjActual.precio_compra),
    precio_venta:     String(vjActual.precio_venta),
    stock_actual:     String(vjActual.stock_actual),
    stock_minimo:     String(vjActual.stock_minimo),
    stock_maximo:     String(vjActual.stock_maximo),
    anio_lanzamiento: String(vjActual.anio_lanzamiento),
    id_categoria:     String(vjActual.id_categoria),
  } : FORM_VACIO;

  return (
    <>
      <Topbar
        titulo="Videojuegos — Catálogo completo"
        busqueda={busqueda}
        onBusqueda={setBusqueda}
        botonLabel="+ Nuevo Juego"
        onBoton={() => setModal('crear')}
      />

      <div className="content">
        {alertas.length > 0 && (
          <div className="note-box" style={{ marginBottom: 16 }}>
            ⚠ Alertas activas ({alertas.length}):{' '}
            {alertas.map(a => <span key={a.id_alerta} style={{ marginLeft: 8 }}>{a.mensaje}</span>)}
          </div>
        )}

        <div className="card">
          <div className="filter-bar">
            <select className="select" value={filtroCat} onChange={e => setFiltroCat(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
            <select className="select" value={filtroEst} onChange={e => setFiltroEst(e.target.value)}>
              <option value="">Todos los estados</option>
              {Videojuego.ESTADOS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="card-head">
            <h3>📋 Catálogo de Videojuegos</h3>
            <span className="badge badge-green">{filtrados.length} títulos</span>
          </div>

          {cargando ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 60 }}>Cargando catálogo...</div>
          ) : filtrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎮</div>
              <div style={{ color: 'var(--text3)' }}>No se encontraron videojuegos.</div>
            </div>
          ) : (
            <div className="grid-cards" style={{ padding: 20 }}>
              {filtrados.map(vj => (
                <TarjetaVideojuego key={vj.id_videojuego} data={vj}
                  onEditar={v  => { setVjActual(v); setModal('editar'); }}
                  onEliminar={v => { setVjActual(v); setModal('confirmar'); }}
                  onStock={v   => { setVjActual(v); setModal('stock'); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {modal === 'crear' && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Registrar videojuego</h3>
          <FormVideojuego categorias={categorias} onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}

      {modal === 'editar' && vjActual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 18 }}>Editar videojuego</h3>
          <FormVideojuego inicial={formEditar} categorias={categorias} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}

      {modal === 'stock' && vjActual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 6 }}>Actualizar stock</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 16 }}>
            {vjActual.titulo} — Stock actual: <strong>{vjActual.stock_actual}</strong>
          </p>
          <label className="form-label">Cantidad</label>
          <input id="inp-stock" type="number" min="1" defaultValue="1" className="input" style={{ width: '100%', marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn" style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444' }}
              onClick={() => { const n = parseInt(document.getElementById('inp-stock').value); if (!isNaN(n) && n > 0) { handleStock(vjActual.id_videojuego, -n); setModal(null); } }}>
              − Reducir
            </button>
            <button className="btn btn-green"
              onClick={() => { const n = parseInt(document.getElementById('inp-stock').value); if (!isNaN(n) && n > 0) { handleStock(vjActual.id_videojuego, n); setModal(null); } }}>
              + Agregar
            </button>
          </div>
        </Modal>
      )}

      {modal === 'confirmar' && vjActual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ marginBottom: 10 }}>¿Eliminar videojuego?</h3>
          <p style={{ color: 'var(--text2)', marginBottom: 22 }}>
            Se eliminará <strong>{vjActual.titulo}</strong> permanentemente.
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
