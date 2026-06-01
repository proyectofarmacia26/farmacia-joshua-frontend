// usuarios.js
initLayout('usuarios');
document.getElementById('page-title').textContent = '👤 Usuarios';
let paginaActual = 1; const LIMIT = 15;

document.getElementById('main-content').innerHTML = `
  <div class="page-header"><div><h2>Gestión de Usuarios</h2><p>Administra los accesos al sistema</p></div>
    <button class="btn btn-primary" onclick="abrirModal()">➕ Nuevo Usuario</button></div>
  <div class="card" style="margin-bottom:20px;">
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <div class="search-bar"><span class="search-icon">🔍</span><input type="text" id="filtro-q" placeholder="Buscar usuario..." oninput="filtrar()"></div>
      <select id="filtro-activo" class="form-control" style="width:140px;" onchange="filtrar()"><option value="true">Activos</option><option value="false">Inactivos</option><option value="all">Todos</option></select>
    </div>
  </div>
  <div class="card">
    <div class="table-wrapper">
      <table><thead><tr><th>Nombre</th><th>Username</th><th>Rol</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
      <tbody id="tabla-usuarios"><tr class="loading-row"><td colspan="6"><div class="spinner"></div></td></tr></tbody></table>
    </div><div id="paginacion"></div>
  </div>
  <div class="modal-overlay" id="modal-usuario">
    <div class="modal"><div class="modal-header"><h3 id="modal-titulo">Nuevo Usuario</h3><button class="btn-close-modal" onclick="cerrarModal()">✕</button></div>
    <div class="modal-body">
      <input type="hidden" id="usr-id">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nombre completo *</label><input type="text" id="usr-nombre" class="form-control"></div>
        <div class="form-group"><label class="form-label">Username *</label><input type="text" id="usr-username" class="form-control"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Contraseña *</label><input type="password" id="usr-password" class="form-control" placeholder="Mínimo 8 caracteres"></div>
        <div class="form-group"><label class="form-label">Rol *</label>
          <select id="usr-rol" class="form-control"><option value="2">Vendedor</option><option value="1">Administrador</option><option value="3">Inventario</option></select>
        </div>
      </div>
      <p id="usr-pass-hint" style="font-size:.78rem;color:var(--gris-texto);margin-top:-8px;">Deja vacío para no cambiar la contraseña.</p>
    </div>
    <div class="modal-footer"><button class="btn btn-secondary" onclick="cerrarModal()">Cancelar</button><button class="btn btn-primary" onclick="guardar()">💾 Guardar</button></div>
    </div>
  </div>
`;

async function cargarUsuarios() {
  const q = document.getElementById('filtro-q').value.trim();
  const activo = document.getElementById('filtro-activo').value;
  const data = await get(`/usuarios/?page=${paginaActual}&limit=${LIMIT}&activo=${activo}${q?'&q='+encodeURIComponent(q):''}`);
  if (!data?.ok) return;
  const { usuarios, total, total_pages } = data.data;
  const rolBadge = (r) => r === 'administrador' ? '<span class="badge badge-verde">👑 Admin</span>' : r === 'vendedor' ? '<span class="badge badge-azul">🛒 Vendedor</span>' : '<span class="badge badge-naranja">📦 Inventario</span>';
  document.getElementById('tabla-usuarios').innerHTML = usuarios.length === 0
    ? `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">👤</div><p>No hay usuarios</p></div></td></tr>`
    : usuarios.map(u => `<tr>
        <td style="font-weight:700;">${u.nombre}</td><td><code style="background:var(--gris-bg);padding:2px 6px;border-radius:4px;font-size:.8rem;">${u.username}</code></td>
        <td>${rolBadge(u.rol)}</td>
        <td>${u.activo?'<span class="badge badge-verde">Activo</span>':'<span class="badge badge-gris">Inactivo</span>'}</td>
        <td style="font-size:.8rem;color:var(--gris-texto);">${fmt.fecha(u.created_at)}</td>
        <td><div style="display:flex;gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick='editar(${JSON.stringify(u).replace(/"/g,"&quot;")})'>✏️</button>
          <button class="btn btn-danger btn-sm" onclick="desactivar('${u.id}','${u.nombre.replace(/'/g,"\\'")}','${u.activo}')">
            ${u.activo?'🔒 Desactivar':'🔓 Activar'}</button>
        </div></td>
      </tr>`).join('');
  renderPagination('paginacion', paginaActual, total_pages, 'cambiarPagina');
}

function cambiarPagina(p){paginaActual=p;cargarUsuarios();}
let ft; function filtrar(){clearTimeout(ft);ft=setTimeout(()=>{paginaActual=1;cargarUsuarios();},400);}

function abrirModal() {
  document.getElementById('modal-titulo').textContent='Nuevo Usuario';
  document.getElementById('usr-id').value='';
  ['usr-nombre','usr-username','usr-password'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('usr-password').placeholder='Mínimo 8 caracteres';
  document.getElementById('usr-pass-hint').style.display='none';
  document.getElementById('usr-username').readOnly=false;
  document.getElementById('modal-usuario').classList.add('active');
}

function editar(u) {
  document.getElementById('modal-titulo').textContent='Editar Usuario';
  document.getElementById('usr-id').value=u.id;
  document.getElementById('usr-nombre').value=u.nombre;
  document.getElementById('usr-username').value=u.username;
  document.getElementById('usr-username').readOnly=true;
  document.getElementById('usr-password').value='';
  document.getElementById('usr-password').placeholder='Nueva contraseña (dejar vacío para no cambiar)';
  document.getElementById('usr-pass-hint').style.display='block';
  document.getElementById('usr-rol').value=u.rol==='administrador'?1:u.rol==='vendedor'?2:3;
  document.getElementById('modal-usuario').classList.add('active');
}

function cerrarModal(){document.getElementById('modal-usuario').classList.remove('active');}

async function guardar() {
  const id=document.getElementById('usr-id').value;
  const nombre=document.getElementById('usr-nombre').value.trim();
  const username=document.getElementById('usr-username').value.trim();
  const password=document.getElementById('usr-password').value;
  const rol_id=parseInt(document.getElementById('usr-rol').value);
  if(!nombre||(!id&&(!username||!password))){toast('Completa todos los campos requeridos.','warning');return;}
  const body=id?{nombre,rol_id,...(password?{nueva_password:password}:{})}:{nombre,username,password,rol_id};
  const data=id?await put(`/usuarios/${id}`,body):await post('/usuarios/',body);
  if(data?.ok){toast(id?'Usuario actualizado.':'Usuario creado.');cerrarModal();cargarUsuarios();}
  else toast(data?.message||'Error.','error');
}

async function desactivar(id, nombre, activo) {
  const accion = activo==='true'?'desactivar':'activar';
  if(!confirmar(`¿${accion.charAt(0).toUpperCase()+accion.slice(1)} al usuario "${nombre}"?`))return;
  const data = activo==='true' ? await del(`/usuarios/${id}`) : await put(`/usuarios/${id}`,{activo:true});
  if(data?.ok){toast(`Usuario ${accion}do correctamente.`);cargarUsuarios();}
  else toast(data?.message||'Error.','error');
}

cargarUsuarios();
