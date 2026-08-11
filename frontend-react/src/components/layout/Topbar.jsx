export default function Topbar({ titulo, busqueda, onBusqueda, botonLabel, onBoton }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{titulo}</div>
      {onBusqueda && (
        <div className="search">
          <span style={{ color: 'var(--text3)' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar..."
            value={busqueda}
            onChange={e => onBusqueda(e.target.value)}
          />
        </div>
      )}
      {botonLabel && (
        <button className="btn btn-green" onClick={onBoton}>{botonLabel}</button>
      )}
    </div>
  );
}