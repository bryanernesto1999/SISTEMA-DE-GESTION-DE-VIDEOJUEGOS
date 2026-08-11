import { useEffect } from 'react';

// Modal genérico: fondo oscuro + panel centrado.
// Se usa envolviendo cualquier contenido (formularios, confirmaciones, etc.)
export function Modal({ onClose, children }) {
  // Permite cerrar con la tecla Escape
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a1f2e',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: 24,
          width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Toast de notificación: aparece abajo a la derecha y se cierra solo tras unos segundos.
const TOAST_COLORES = {
  ok:    { fondo: 'rgba(22,163,74,0.15)',  borde: 'rgba(22,163,74,0.35)',  texto: '#22c55e' },
  error: { fondo: 'rgba(220,38,38,0.15)',  borde: 'rgba(220,38,38,0.35)',  texto: '#ef4444' },
};

export function Toast({ msg, tipo = 'ok', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const color = TOAST_COLORES[tipo] || TOAST_COLORES.ok;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 200,
      background: color.fondo,
      border: `0.5px solid ${color.borde}`,
      color: color.texto,
      borderRadius: 10, padding: '12px 18px',
      fontSize: 13, fontWeight: 600,
      boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 340,
    }}>
      <span style={{ flex: 1 }}>{msg}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent', border: 'none', color: color.texto,
          cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
