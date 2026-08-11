import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import VideojuegosPage   from './pages/VideojuegosPage';
import CategoriasPage    from './pages/CategoriasPage';
import ProveedoresPage   from './pages/ProveedoresPage';
import AlmacenesPage     from './pages/AlmacenesPage';
import UsuariosPage      from './pages/UsuariosPage';
import StockAlmacenPage  from './pages/StockAlmacenPage';
import MovimientosPage   from './pages/MovimientosPage';

const PAGINAS = {
  'videojuegos':   VideojuegosPage,
  'categorias':    CategoriasPage,
  'proveedores':   ProveedoresPage,
  'almacenes':     AlmacenesPage,
  'usuarios':      UsuariosPage,
  'stock-almacen': StockAlmacenPage,
  'movimientos':   MovimientosPage,
};

export default function App() {
  const [pagina, setPagina] = useState('videojuegos');
  const Pagina = PAGINAS[pagina] || VideojuegosPage;

  return (
    <>
      <Sidebar paginaActiva={pagina} onNavegar={setPagina} />
      <main className="main">
        <Pagina />
      </main>
    </>
  );
}
