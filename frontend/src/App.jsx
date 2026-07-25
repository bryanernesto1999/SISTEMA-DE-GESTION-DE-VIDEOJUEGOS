import CatalogoPage from './pages/CatalogoPage';

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      color: '#f1f5f9',
      fontFamily: "'Rajdhani', 'Segoe UI', sans-serif",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <CatalogoPage />
    </div>
  );
}