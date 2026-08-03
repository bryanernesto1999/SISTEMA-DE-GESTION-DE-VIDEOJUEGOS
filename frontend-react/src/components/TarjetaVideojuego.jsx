import { useState, useEffect, useCallback } from 'react';
import VideojuegoDAO, { CategoriaDAO } from '../dao/videojuegoDAO';
import { Videojuego, FORM_VACIO } from '../models/Videojuego';
import TarjetaVideojuego from '../components/TarjetaVideojuego';
import FormVideojuego    from '../components/FormVideojuego';
import { Modal, Toast }  from '../components/Modal';

const inputStyle = {
  background: '#0f1420', border: '0.5px solid rgba(255,255,255,0.1)',
  borderRadius: 7, padding: '8px 12px', color: '#e2e8f0', fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
};

export default function CatalogoPage() {
  const [videojuegos, setVideojuegos] = useState([]);
  const [categorias,  setCategorias]  = useState([]);
  const [alertas,     setAlertas]     = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [enviando,    setEnviando]    = useState(false);
  const [modal,       setModal]       = useState(null); // 'crear'|'editar'|'stock'|'confirmar'
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

  // ── Acciones CRUD ─────────────────────────────────────────────
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

  // ── Filtros ───────────────────────────────────────────────────
  const filtrados = videojuegos.filter(v => {
    const q = busqueda.toLowerCase();
    const ok1 = !q || v.titulo.toLowerCase().includes(q) || (v.desarrollador || '').toLowerCase().includes(q);
    const ok2 = !filtroCat || String(v.id_categoria) === filtroCat;
    const ok3 = !filtroEst || v.estado === filtroEst;
    return ok1 && ok2 && ok3;
  });

  // ── Stats ─────────────────────────────────────────────────────
  const totalStock  = videojuegos.reduce((a, v) => a + v.stock_actual, 0);
  const valorTotal  = videojuegos.reduce((a, v) => a + v.precio_venta * v.stock_actual, 0);
  const sinStock    = videojuegos.filter(v => v.stock_actual === 0).length;

  // ── Formulario inicial para editar ───────────────────────────
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
      {/* HEADER */}
      <div style={{ background: '#0f1420', borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '16px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa', letterSpacing: 2, margin: 0 }}>🎮 GAME VAULT — SGIV</h1>
          <p style={{ color: '#6b7280', fontSize: 11, margin: '2px 0 0' }}>Sistema de Gestión de Inventario de Videojuegos</p>
        </div>
        <button onClick={() => setModal('crear')} style={{
          background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff',
          border: 'none', padding: '9px 20px', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
        }}>+ Registrar videojuego</button>
      </div>

      <div style={{ padding: '20px 28px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ALERTAS */}
        {alertas.length > 0 && (
          <div style={{ background: 'rgba(234,179,8,0.08)', border: '0.5px solid rgba(234,179,8,0.3)', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 12 }}>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>⚠ Alertas activas ({alertas.length}):</span>
            {alertas.map(a => (
              <span key={a.id_alerta} style={{ color: '#9ca3af', marginLeft: 10 }}>{a.mensaje}</span>
            ))}
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total juegos',     valor: videojuegos.length, color: '#a78bfa' },
            { label: 'Unidades stock',   valor: totalStock,          color: '#60a5fa' },
            { label: 'Valor inventario', valor: `S/ ${valorTotal.toLocaleString('es-PE', { minimumFractionDigits: 0 })}`, color: '#34d399' },
            { label: 'Sin stock',        valor: sinStock,            color: '#f87171' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1f2e', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ color: s.color, fontSize: 22, fontWeight: 800 }}>{s.valor}</div>
              <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por título o desarrollador..."
            style={{ ...inputStyle, flex: '1 1 200px' }} />
          <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} style={{ ...inputStyle, minWidth: 160 }}>
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
          </select>
          <select value={filtroEst} onChange={e => setFiltroEst(e.target.value)} style={{ ...inputStyle, minWidth: 140 }}>
            <option value="">Todos los estados</option>
            {Videojuego.ESTADOS.map(s => <option key={s}>{s}</option>)}
          </select>
          {(busqueda || filtroCat || filtroEst) && (
            <button onClick={() => { setBusqueda(''); setFiltroCat(''); setFiltroEst(''); }}
              style={{ ...inputStyle, color: '#ef4444', cursor: 'pointer', border: '0.5px solid rgba(239,68,68,0.3)' }}>
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* CATÁLOGO */}
        {cargando ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: 60 }}>Cargando catálogo...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, border: '1px dashed rgba(255,255,255,0.06)', borderRadius: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎮</div>
            <div style={{ color: '#4b5563' }}>No se encontraron videojuegos.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 14 }}>
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

      {/* MODALES */}
      {modal === 'crear' && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, margin: '0 0 18px' }}>Registrar videojuego</h3>
          <FormVideojuego categorias={categorias} onSubmit={handleCrear} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}

      {modal === 'editar' && vjActual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, margin: '0 0 18px' }}>Editar videojuego</h3>
          <FormVideojuego inicial={formEditar} categorias={categorias} onSubmit={handleEditar} onCancel={() => setModal(null)} cargando={enviando} />
        </Modal>
      )}

      {modal === 'stock' && vjActual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>Actualizar stock</h3>
          <p style={{ color: '#9ca3af', fontSize: 13, margin: '0 0 16px' }}>
            {vjActual.titulo} — Stock actual: <strong style={{ color: '#22c55e' }}>{vjActual.stock_actual}</strong>
            <span style={{ color: '#6b7280', marginLeft: 8 }}>(mín {vjActual.stock_minimo})</span>
          </p>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.7 }}>Cantidad</label>
          <input id="inp-stock" type="number" min="1" defaultValue="1" style={{ ...inputStyle, width: '100%', marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setModal(null)} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)', color: '#9ca3af', padding: '8px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={() => { const n = parseInt(document.getElementById('inp-stock').value); if (!isNaN(n) && n > 0) { handleStock(vjActual.id_videojuego, -n); setModal(null); } }} style={{ background: 'rgba(220,38,38,0.15)', color: '#ef4444', border: '0.5px solid rgba(220,38,38,0.3)', padding: '8px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>− Reducir</button>
            <button onClick={() => { const n = parseInt(document.getElementById('inp-stock').value); if (!isNaN(n) && n > 0) { handleStock(vjActual.id_videojuego, n); setModal(null); } }} style={{ background: 'rgba(22,163,74,0.15)', color: '#22c55e', border: '0.5px solid rgba(22,163,74,0.3)', padding: '8px 14px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>+ Agregar</button>
          </div>
        </Modal>
      )}

      {modal === 'confirmar' && vjActual && (
        <Modal onClose={() => setModal(null)}>
          <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 600, margin: '0 0 10px' }}>¿Eliminar videojuego?</h3>
          <p style={{ color: '#9ca3af', fontSize: 13, marginBottom: 22 }}>
            Se eliminará <strong style={{ color: '#e2e8f0' }}>{vjActual.titulo}</strong> permanentemente.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setModal(null)} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.15)', color: '#9ca3af', padding: '8px 18px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>Cancelar</button>
            <button onClick={handleEliminar} disabled={enviando} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 22px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, opacity: enviando ? 0.6 : 1 }}>
              {enviando ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </>
  );
}