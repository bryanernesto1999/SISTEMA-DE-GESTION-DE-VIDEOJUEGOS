import { Videojuego } from '../models/Videojuego';

export default function TarjetaVideojuego({ data, onEditar, onEliminar, onStock }) {
  const vj = new Videojuego(data);

  return (
    <div style={{
      background: '#1a1f2e',
      border: vj.sinStock()
        ? '1px solid rgba(239,68,68,0.3)'
        : '0.5px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: 18,
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'transform .2s, box-shadow .2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 28px rgba(124,58,237,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1.3, flex: 1 }}>
          {vj.titulo}
        </h3>
        <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>
          S/ {Number(vj.precio_venta).toFixed(2)}
        </span>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ background: 'rgba(0,55,145,0.4)', color: '#60a5fa', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
          {vj.plataforma}
        </span>
        <span style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '0.5px solid rgba(139,92,246,0.3)' }}>
          {vj.nombre_categoria}
        </span>
        <span style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280', fontSize: 10, padding: '2px 8px', borderRadius: 20 }}>
          {vj.clasificacion}
        </span>
      </div>

      {/* Desarrollador y año */}
      <div style={{ fontSize: 11, color: '#6b7280' }}>
        {vj.desarrollador} · {vj.anio_lanzamiento}
      </div>

      {/* Stock y margen */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: vj.colorStock(), fontSize: 13, fontWeight: 700 }}>
          {vj.sinStock() ? 'Sin stock' : `${vj.stock_actual} uds.`}
          {vj.stockBajo() && !vj.sinStock() && (
            <span style={{ color: '#f59e0b', fontSize: 10, marginLeft: 5 }}>⚠ bajo mínimo</span>
          )}
        </span>
        <span style={{ fontSize: 11, color: '#4b5563' }}>
          Margen: <span style={{ color: '#34d399' }}>{vj.margen()}%</span>
        </span>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button onClick={() => onStock(data)} style={btnStyle('#22c55e')}>
          📦 Stock
        </button>
        <button onClick={() => onEditar(data)} style={btnStyle('#a78bfa')}>
          ✏ Editar
        </button>
        <button onClick={() => onEliminar(data)} style={btnStyle('#ef4444')}>
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    flex: 1, background: `${color}18`,
    color, border: `0.5px solid ${color}33`,
    borderRadius: 7, padding: '6px 0', cursor: 'pointer',
    fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
  };
}