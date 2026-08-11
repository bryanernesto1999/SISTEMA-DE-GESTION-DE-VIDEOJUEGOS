// Navegación por estado local (sin react-router-dom, sin dependencias nuevas).
const SECCIONES = [
  {
    titulo: 'Principal',
    items: [
      { id: 'videojuegos', label: 'Videojuegos' },
      { id: 'categorias',  label: 'Categorías' },
    ],
  },
  {
    titulo: 'Inventario',
    items: [
      { id: 'movimientos',    label: 'Movimientos' },
      { id: 'stock-almacen',  label: 'Stock por Almacén' },
    ],
  },
  {
    titulo: 'Compras',
    items: [
      { id: 'proveedores', label: 'Proveedores' },
    ],
  },
  {
    titulo: 'Administración',
    items: [
      { id: 'usuarios',  label: 'Usuarios y Roles' },
      { id: 'almacenes', label: 'Almacenes' },
    ],
  },
];

export default function Sidebar({ paginaActiva, onNavegar }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-badge">
          <div className="logo-icon">🎮</div>
          <div>
            <div className="logo-text">SGIV</div>
            <div className="logo-sub">Inventario de Videojuegos</div>
          </div>
        </div>
      </div>

      <nav className="nav">
        {SECCIONES.map(sec => (
          <div key={sec.titulo}>
            <div className="nav-section" style={{ marginTop: 12 }}>{sec.titulo}</div>
            {sec.items.map(item => (
              <a
                key={item.id}
                href="#"
                className={`nav-item${paginaActiva === item.id ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
                onClick={e => { e.preventDefault(); onNavegar(item.id); }}
              >
                <div className="nav-dot"></div> {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar">AS</div>
        <div className="avatar-info">
          <div className="avatar-name">Admin Sistema</div>
          <div className="avatar-role">ADMINISTRADOR</div>
        </div>
      </div>
    </aside>
  );
}