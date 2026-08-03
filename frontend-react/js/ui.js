/**
 * ui.js — Utilidades de interfaz compartidas
 * Toast, badges, barra de stock, sidebar activo.
 */

// ── Toast de notificación ──────────────────────────────────────
function toast(msg, tipo = 'success') {
  const color = { success: 'var(--c-green)', danger: 'var(--c-red)', warning: 'var(--c-amber)', info: 'var(--c-blue)' }[tipo] || 'var(--c-green)';
  const icono = { success: '✓', danger: '✕', warning: '⚠', info: 'ℹ' }[tipo] || '✓';
  const el = document.createElement('div');
  el.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:9999;
    background:var(--bg-card);border:0.5px solid ${color};
    color:var(--c-text);padding:12px 18px;border-radius:10px;
    font-size:13px;font-weight:600;font-family:'Rajdhani',sans-serif;
    box-shadow:0 4px 20px rgba(0,0,0,.4);
    animation:slideToast .25s ease;
  `;
  el.textContent = `${icono} ${msg}`;
  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes slideToast{from{transform:translateX(20px);opacity:0}to{transform:translateX(0);opacity:1}}';
    document.head.appendChild(s);
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ── Badge de plataforma ────────────────────────────────────────
function badgePlat(p) {
  const cls = {
    'PlayStation 5':'badge-ps5','PlayStation 4':'badge-ps5',
    'PC':'badge-pc','Nintendo Switch':'badge-switch',
    'Xbox Series X':'badge-xbox','Mobile':'badge-mobile',
  };
  const short = {
    'PlayStation 5':'PS5','PlayStation 4':'PS4',
    'Xbox Series X':'Xbox','Nintendo Switch':'Switch',
    'PC':'PC','Mobile':'Mobile',
  };
  return `<span class="badge-plat ${cls[p]||''}">${short[p]||p}</span>`;
}

// ── Badge de estado ────────────────────────────────────────────
function badgeEstado(j) {
  if (j.stock_actual === 0 || j.estado === 'AGOTADO')
    return '<span class="badge-estado est-agotado">● AGOTADO</span>';
  if (j.stock_actual < j.stock_minimo)
    return '<span class="badge-estado est-minimo">● MÍNIMO</span>';
  return '<span class="badge-estado est-activo">● ACTIVO</span>';
}

// ── Barra de stock ─────────────────────────────────────────────
function stockBar(s, min = 5, max = 40) {
  const pct = Math.min(100, Math.round((s / max) * 100));
  const col = s === 0 ? 'var(--c-red)' : s < min ? 'var(--c-amber)' : 'var(--c-green)';
  return `<span class="stock-bar"><span class="stock-fill" style="width:${pct}%;background:${col};"></span></span>${s}`;
}

// ── Marcar sidebar activo según la página actual ───────────────
function marcarSidebarActivo() {
  const pagina = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-item').forEach(el => {
    const href = el.getAttribute('href') || '';
    el.classList.toggle('active', href === pagina || (pagina === '' && href === 'index.html'));
  });
}

// ── Llenar select de categorías ────────────────────────────────
async function llenarCategorias(selectId) {
  try {
    const cats = await API.getCategorias();
    const sel = document.getElementById(selectId);
    if (!sel) return;
    cats.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id_categoria;
      opt.textContent = c.nombre;
      sel.appendChild(opt);
    });
  } catch (_) { /* si el backend no está activo, se ignora */ }
}

// ── Llenar select de videojuegos (para modal movimiento) ───────
function llenarSelectJuegos(selectId, juegos) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Seleccionar...</option>';
  juegos.forEach(j => {
    const opt = document.createElement('option');
    opt.value = j.id_videojuego;
    opt.textContent = j.titulo;
    sel.appendChild(opt);
  });
}

// Ejecutar al cargar cualquier página
document.addEventListener('DOMContentLoaded', marcarSidebarActivo);