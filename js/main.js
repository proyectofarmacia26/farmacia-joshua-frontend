/* ============================================================
   Farmacia Joshua — JS Principal v2.0
   PRODUCCIÓN: cambiar API_URL por la URL de Render
   ============================================================ */

// ⚠️ IMPORTANTE: Cambia esta URL por la de tu backend en Render
// Ejemplo: 'https://farmacia-joshua-backend.onrender.com/api'
// Para desarrollo local usa: 'http://127.0.0.1:5000/api'
const API = 'https://farmacia-joshua-backend.onrender.com/api';

/* ── Auth ───────────────────────────────────────────────── */
const Auth = {
  getToken  : ()      => localStorage.getItem('fj_token'),
  getUser   : ()      => JSON.parse(localStorage.getItem('fj_user') || 'null'),
  setSession: (token, user) => { localStorage.setItem('fj_token', token); localStorage.setItem('fj_user', JSON.stringify(user)); },
  clear     : ()      => { localStorage.removeItem('fj_token'); localStorage.removeItem('fj_user'); },
  isAdmin   : ()      => Auth.getUser()?.rol === 'administrador',
  isVendedor: ()      => ['administrador','vendedor'].includes(Auth.getUser()?.rol),
};

/* ── Fetch helper ───────────────────────────────────────── */
async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res  = await fetch(`${API}${path}`, opts);
    const data = await res.json();
    if (res.status === 401) { Auth.clear(); window.location.href = 'index.html'; return null; }
    return data;
  } catch (e) {
    toast('Error de conexión con el servidor.', 'error');
    return null;
  }
}

const get  = (path)       => api('GET',    path);
const post = (path, body) => api('POST',   path, body);
const put  = (path, body) => api('PUT',    path, body);
const del  = (path)       => api('DELETE', path);

/* ── Toast ──────────────────────────────────────────────── */
function toast(msg, type = 'success', duration = 3500) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id='toast-container'; c.className='toast-container'; document.body.appendChild(c); }
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type !== 'success' ? type : ''}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]||'✅'}</span><span class="toast-msg">${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/* ── Formato ────────────────────────────────────────────── */
const fmt = {
  moneda   : (n) => `Q ${parseFloat(n||0).toFixed(2)}`,
  fecha    : (s) => {
    if (!s) return '—';
    const str = String(s).includes('T') ? s : s + 'T12:00:00';
    return new Date(str).toLocaleDateString('es-GT', {day:'2-digit',month:'2-digit',year:'numeric'});
  },
  fechaHora: (s) => s ? new Date(s).toLocaleString('es-GT', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—',
  inicial  : (nombre) => (nombre||'U').charAt(0).toUpperCase(),
};

/* ── Protección ─────────────────────────────────────────── */
function requireAuth() {
  if (!Auth.getToken()) { window.location.href = 'index.html'; return false; }
  return true;
}

/* ── Layout ─────────────────────────────────────────────── */
function initLayout(paginaActiva = '') {
  if (!requireAuth()) return;
  const user = Auth.getUser();

  const navItems = [
    { id:'inicio',        icon:'🏠', label:'Inicio',        href:'inicio.html',        roles:['administrador','vendedor','inventario'] },
    { id:'ventas',        icon:'🛒', label:'Nueva Venta',   href:'ventas.html',         roles:['administrador','vendedor'] },
    { id:'historial',     icon:'📋', label:'Historial',     href:'historial.html',      roles:['administrador','vendedor','inventario'] },
    { id:'productos',     icon:'💊', label:'Productos',     href:'productos.html',      roles:['administrador','vendedor','inventario'] },
    { id:'inventario',    icon:'📦', label:'Inventario',    href:'inventario.html',     roles:['administrador','inventario'] },
    { id:'clientes',      icon:'👥', label:'Clientes',      href:'clientes.html',       roles:['administrador','vendedor'] },
    { id:'proveedores',   icon:'🚚', label:'Proveedores',   href:'proveedores.html',    roles:['administrador','inventario'] },
    { id:'reportes',      icon:'📊', label:'Reportes',      href:'reportes.html',       roles:['administrador'] },
    { id:'dashboard',     icon:'📈', label:'Dashboard',     href:'dashboard.html',      roles:['administrador'] },
    { id:'usuarios',      icon:'👤', label:'Usuarios',      href:'usuarios.html',       roles:['administrador'] },
    { id:'alertas',       icon:'🔔', label:'Alertas',       href:'alertas.html',        roles:['administrador','vendedor','inventario'] },
    { id:'configuracion', icon:'⚙️', label:'Configuración', href:'configuracion.html',  roles:['administrador'] },
  ];

  const navHTML = navItems
    .filter(n => n.roles.includes(user?.rol))
    .map(n => `
      <a href="${n.href}" class="nav-item ${paginaActiva === n.id ? 'active' : ''}">
        <span class="nav-icon">${n.icon}</span>
        <span>${n.label}</span>
        ${n.id === 'alertas' ? '<span class="nav-badge" id="alertas-badge" style="display:none">0</span>' : ''}
      </a>
    `).join('');

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <img src="logo.png" alt="Logo" style="width:36px;height:36px;object-fit:contain;border-radius:8px;">
        </div>
        <div class="sidebar-logo-text">
          <h1>FarmaJoshua</h1>
          <span>Sistema de Farmacia</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <div class="nav-section-title">Menú Principal</div>
        ${navHTML}
      </nav>
      <div class="sidebar-footer">
        <div style="padding:10px 12px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <div class="user-avatar">${fmt.inicial(user?.nombre)}</div>
            <div class="user-info">
              <strong>${user?.nombre || 'Usuario'}</strong>
              <span>${user?.rol || ''}</span>
            </div>
          </div>
          <button onclick="logout()" style="
            width:100%;padding:9px 12px;
            background:rgba(230,57,70,.15);
            border:1px solid rgba(230,57,70,.3);
            border-radius:8px;
            color:#ff8a8a;
            font-family:'Nunito',sans-serif;
            font-size:.82rem;font-weight:700;
            cursor:pointer;
            display:flex;align-items:center;justify-content:center;gap:7px;
            transition:all .2s;
          " onmouseover="this.style.background='rgba(230,57,70,.3)';this.style.color='white'"
             onmouseout="this.style.background='rgba(230,57,70,.15)';this.style.color='#ff8a8a'">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    `;
  }

  const clock = document.getElementById('topbar-clock');
  if (clock) {
    const updateClock = () => { clock.textContent = new Date().toLocaleTimeString('es-GT', {hour:'2-digit',minute:'2-digit'}); };
    updateClock(); setInterval(updateClock, 60000);
  }
  const dateEl = document.getElementById('topbar-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-GT', {weekday:'long',day:'numeric',month:'long',year:'numeric'});

  loadAlertsBadge();
}

async function loadAlertsBadge() {
  const data = await get('/alertas/resumen');
  if (data?.ok && data.data.total > 0) {
    const badge = document.getElementById('alertas-badge');
    if (badge) { badge.textContent = data.data.total; badge.style.display = 'inline-flex'; }
    const dot = document.getElementById('alert-dot');
    if (dot) dot.style.display = 'block';
  }
}

function logout() {
  if (confirmar('¿Deseas cerrar sesión?')) { Auth.clear(); window.location.href = 'index.html'; }
}

/* ── Paginación ─────────────────────────────────────────── */
function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) { if (container) container.innerHTML = ''; return; }
  let html = `<button class="page-btn" ${currentPage<=1?'disabled':''} onclick="(${onPageChange})(${currentPage-1})">‹</button>`;
  const start = Math.max(1, currentPage-2), end = Math.min(totalPages, currentPage+2);
  if (start > 1) html += `<button class="page-btn" onclick="(${onPageChange})(1)">1</button>${start>2?'<span style="padding:0 4px;color:var(--gris-texto)">…</span>':''}`;
  for (let i=start; i<=end; i++) html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="(${onPageChange})(${i})">${i}</button>`;
  if (end < totalPages) html += `${end<totalPages-1?'<span style="padding:0 4px;color:var(--gris-texto)">…</span>':''}<button class="page-btn" onclick="(${onPageChange})(${totalPages})">${totalPages}</button>`;
  html += `<button class="page-btn" ${currentPage>=totalPages?'disabled':''} onclick="(${onPageChange})(${currentPage+1})">›</button>`;
  container.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-top:16px;">${html}</div>`;
}

function confirmar(msg) { return confirm(msg); }
