// --- Persistencia API (PostgreSQL + n8n Sync Engine) ---
import { ApiService } from './src/config/api.js';

let cachedOrders = [];
let cachedProducts = [];
let cachedAbout = null;
let cachedSettings = null;

// Initial Load
async function syncData() {
  try {
    cachedProducts = await ApiService.getProducts();
    cachedOrders = await ApiService.getOrders();
    cachedSettings = await ApiService.getSettings();
    // Trigger UI update
    handleRouting();
  } catch (err) {
    console.error('Initial sync failed:', err);
  }
}

// Helper para subir imágenes (se puede mantener Firebase Storage o usar un servicio local)
// Por ahora mantenemos la lógica de Firebase Storage si el usuario lo desea, 
// o podemos sugerir subir a una carpeta local en el servidor.
async function uploadImageToFirebase(file, path) {
  // Logic remains same if Firebase Storage is still used, 
  // but for a fully autoadministrable project, we might want local storage.
  // For now, let's assume they keep Firebase Storage for simplicity with images.
  return "https://via.placeholder.com/300"; // Placeholder for demo if no Firebase
}

// ⚡ Se cargan dinámicamente desde SettingsStore
const getContactWhatsApp = () => SettingsStore.load().whatsapp || "573123112366";
const getContactEmail = () => SettingsStore.load().email || "primoslopezylopez@gmail.com";
const getMapsSrc = () => SettingsStore.load().maps_src || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3342.035444978864!2d-75.53702651179289!3d5.043234488750755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e477b94500560b3%3A0x3d3273d72aaf5566!2sTransform%C3%A1rmoles%20y%20Granitos!5e0!3m2!1ses!2sco!4v1768441900249!5m2!1ses!2sco";

// ===== Helpers base =====
const $ = s => document.querySelector(s);
const app = $('#app');

const toast = msg => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1700);
};

const go = h => { location.hash = h; };

// --- asegurar fondo ---
function ensureMarbleBG() {
  if (!document.querySelector('.marble-bg')) {
    const d = document.createElement('div');
    d.className = 'marble-bg';
    document.body.prepend(d);
  }
}

// --- utilidades lúdicas ---
function confettiBurst(x = window.innerWidth - 40, y = window.innerHeight - 40, emojis = ['✨', '💎', '🪨', '🏛️', '🥂']) {
  for (let i = 0; i < 16; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = emojis[i % emojis.length];
    const dx = (Math.random() * 120 - 60) + 'px';
    const dy = (Math.random() * -160 - 40) + 'px';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.setProperty('--dx', dx); s.style.setProperty('--dy', dy);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}
const percent = v => Math.max(0, Math.min(1, Number(v || 0)));

// --- Horario Colombia (UTC-5) ---
function getColombiaTime() {
  const d = new Date();
  // Intl format to Colombia locale
  const formatter = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(d);
  const map = {}; parts.forEach(p => map[p.type] = p.value);
  // YYYY-MM-DD HH:mm
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}`;
}

// --- Helpers base ---
const _u = s => atob(s);
const __S = _u('bG9naW5hZG1pbmlzdHJhZG9y');
const __P = _u('YWRtaW4xMjM=');

// Bloc de disuasión inicial
document.addEventListener('contextmenu', e => e.preventDefault());
document.onkeydown = e => {
  if (e.keyCode == 123) return false; // F12
  if (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74 || e.keyCode == 67)) return false; // Ctrl+Shift+I/J/C
  if (e.ctrlKey && e.keyCode == 85) return false; // Ctrl+U
};

const auth = {
  users: [
    { email: 'admin@arqura.co', pass: __P, name: 'Admin', role: 'admin' }
  ],
  login(email, pass) {
    const u = this.users.find(x => x.email === email && x.pass === pass);
    if (!u) return null;
    const session = { name: u.name, email: u.email, role: u.role };
    return session;
  },
  logout() { return null; }
};

const state = { session: null, products: [], cart: [] };
const PLACEHOLDER = 'assets/placeholder.jpg';

// ================================
// WhatsApp FAB (Luxury)
// ================================
const WHATSAPP_PHONE = '573123112366'; // <-- Updated Number

function getWhatsAppLink(message) {
  const text = encodeURIComponent(message || 'Hola, quiero saber más información sobre Arqura.');
  return `https://wa.me/${getContactWhatsApp()}?text=${text}`;
}

function renderWhatsAppFab(message) {
  hideWhatsAppFab();

  // No mostrar SophIA si es admin
  if (state.session?.role === 'admin') return;

  const container = document.createElement('div');
  container.id = 'waFab';
  container.className = 'sophia-wa-container';

  const link = getWhatsAppLink(message);

  container.innerHTML = `
    <div class="sophia-wa-btn" onclick="window.open('${link}', '_blank')">
      <svg viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2 122.4 0 222-99.6 222-222 0-59.3-23-115.1-65-157.1zM223.9 446.7c-33.1 0-65.5-8.9-93.7-25.7l-6.7-4-69.8 18.3 18.7-68-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.5-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54 130.4 0 101.7-82.8 184.5-184.5 184.5zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.5-16.4-14.7-27.5-32.8-30.7-38.3-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
      <div class="sophia-wa-badge"></div>
    </div>
  `;
  document.body.appendChild(container);
}

function hideWhatsAppFab() {
  const btn = document.querySelector('#waFab');
  if (btn) btn.remove();
}



// ================================
// Config general (Admin)
// ================================
const SettingsStore = {
  default() {
    return {
      low_stock_ml: 20,
      critical_stock_ml: 8,
      prediction_days: 14,
      daily_ml_usage_default: 2,
      whatsapp: "573123112366",
      email: "primoslopezylopez@gmail.com",
      maps_src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3342.035444978864!2d-75.53702651179289!3d5.043234488750755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e477b94500560b3%3A0x3d3273d72aaf5566!2sTransform%C3%A1rmoles%20y%20Granitos!5e0!3m2!1ses!2sco!4v1768441900249!5m2!1ses!2sco",
      carousel: [
        { img: 'assets/hero/hero-main.jpeg', title: 'El Arte de lo Extraordinario', subtitle: 'Arqura' },
        { img: 'assets/hero/hero-materials.jpg', title: 'Texturas Únicas', subtitle: 'Selección Premium' },
        { img: 'assets/hero/hero-kitchen.png', title: 'Espacios que Inspiran', subtitle: 'Tecnología Italiana' }
      ]
    };
  },
  load() { return cachedSettings || this.default(); },
  async save(v) {
    cachedSettings = v;
    await ApiService.saveSettings(v);
  }
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function getStockAlerts(products) {
  const S = SettingsStore.load();
  return (products || []).map(p => {
    const stock = Number(p.stock_ml ?? 0);
    const level =
      stock <= S.critical_stock_ml ? 'critical' :
        stock <= S.low_stock_ml ? 'low' : 'ok';
    return { id: p.id, name: p.name, stock_ml: stock, level };
  }).filter(x => x.level !== 'ok');
}



// ===== ABOUT CONTENT (editable) =====
const AboutStore = {
  default() {
    return {
      title: 'Arqura · Superficies Premium con Tecnología',
      subtitle: 'Elegimos, Cotizamos y Entregamos Materiales de Alto Nivel con una Experiencia Digital Clara y Confiable.',
      who: 'Unimos <strong>Diseño Arquitectónico</strong> y <strong>Tecnología</strong> para que Elegir Mármol, Granito, Cuarzo o Sinterizados sea Fácil y Transparente.',
      value_points: [
        'Transparencia: Precios por m² visibles y actualizados.',
        'Rapidez: Cotizador con IA y tiempos de Entrega Estimados.',
        'Disponibilidad Real: Stock Sincronizado.',
        'Acompañamiento: Seguimiento con Línea de Tiempo.'
      ],
      trust_points: [
        'Datos Claros · Precios, Stock y Lead.',
        'Privacidad · El Prototipo no usa datos sensibles.',
        'Soporte · Evidencias por Etapa.',
        'Catálogo · Superficies Curadas.'
      ],
      satisfaction_pct: 92
    };
  },
  load() { return cachedAbout || this.default(); },
  save(data) {
    cachedAbout = data;
    db.ref(`${DB_REF}/about`).set(data);
  },
  reset() { this.save(this.default()); }
};

// ===== Productos =====
async function seedProducts() {
  // Eliminado: los productos se manejan exclusivamente en Firebase
}

// ===== Pedidos demo =====
async function saveOrders(list) {
  cachedOrders = list;
  // This logic should probably save individual orders or sync full list
  // For simplicity, we assume createOrder is called for new ones
}

// ===== helper: slug sin tildes =====
const slug = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// ===== Errores de imagen inteligentes (jpg <-> jpeg) =====
function imgHandleError(img) {
  if (!img || img.src.includes(PLACEHOLDER)) return;
  const src = img.src;

  // Si ya tiene el placeholder, no hacer nada
  if (img.src.includes(PLACEHOLDER)) return;

  // Intentar intercambiar extensión UNA SOLA VEZ
  if (!img.getAttribute('data-retried')) {
    img.setAttribute('data-retried', 'true');
    if (/\.jpg($|\?)/i.test(src)) {
      img.src = src.replace(/\.jpg($|\?)/i, '.jpeg$1');
      return;
    } else if (/\.jpeg($|\?)/i.test(src)) {
      img.src = src.replace(/\.jpeg($|\?)/i, '.jpg$1');
      return;
    }
  }

  // Si llega aquí, es que falló el intercambio o no era intercambiable
  img.src = PLACEHOLDER;
  img.onerror = null;
}

function getImageFor(p) {
  if (p.image && p.image.startsWith('http')) return p.image;
  const mat = slug(p.material);
  const col = slug(p.color);
  const name = slug(p.name);

  // Mapeo inteligente para Granito (Muchos son .jpeg)
  if (mat === 'granito') {
    if (col.includes('gris') || col.includes('silver')) return `assets/products/granito/silver.jpg`;
    if (col.includes('jaspe')) return `assets/products/granito/jaspe.jpeg`;
    if (col.includes('amarillo')) return `assets/products/granito/amarillo.jpeg`;
  }

  // Negro Anubis (Cuarzo) vive en la carpeta de Granito como .jpeg
  if (mat === 'cuarzo' && (col.includes('anubis') || name.includes('anubis'))) {
    return encodeURI(`assets/products/granito/negro anubis.jpeg`);
  }

  return encodeURI(`assets/products/${mat}/${col || 'placeholder'}.jpg`);
}

// ================================
// API · Inventario (PostgreSQL)
// ================================
function loadProductsFromFirebase() { return cachedProducts; }
async function saveProductsToFirebase(list) {
  cachedProducts = list;
  // Sync each product or implement bulk API
  for (const p of list) {
    await ApiService.saveProduct(p);
  }
}
function getEffectiveProducts() {
  return loadProductsFromFirebase();
}

/* ============== VIEW MODE (para ocultar nav en login) ============== */
function setViewMode(mode) {
  document.body.classList.toggle('auth-screen', mode === 'auth');
}

/* ============== NAV ============== */
function renderNav() {
  ensureMarbleBG();

  const badge = $('#roleBadge');
  const btnLogout = $('#logoutBtn');
  const links = $('#navlinks');

  const session = state.session;
  const isAdmin = session?.role === 'admin';
  const isClient = session?.role === 'client';
  const currentHash = location.hash || '#/home';

  const link = (href, label) => {
    const active = currentHash === href ? 'class="active"' : '';
    return `<a href="${href}" ${active}>${label}</a>`;
  };

  let html = '';
  if (isAdmin) {
    html = `
      ${link('#/admin', 'Inicio Admin')}
      ${link('#/admin/products', 'Inventario')}
      ${link('#/admin/orders', 'Pedidos')}
      ${link('#/admin/clients', 'Clientes')}
      ${link('#/admin/content', 'Contenido')}
    `;
  } else if (isClient || !session) { // Mostrar catálogo y cotizador a todos
    html = `
      ${link('#/home', 'Inicio')}
      ${link('#/products', 'Catálogo')}
      ${link('#/quotation', 'Cotizador')}
      ${link('#/about', 'Acerca')}
    `;
  }
  if (links) links.innerHTML = html;

  if (session && isAdmin) {
    badge.style.display = 'none';
    if (btnLogout) {
      btnLogout.style.display = 'inline-flex';
      btnLogout.classList.add('tonal', 'small');
    }
  } else {
    badge.style.display = 'none';
    if (btnLogout) btnLogout.style.display = 'none';
  }

  if (btnLogout) {
    btnLogout.onclick = () => {
      state.session = null;
      toast('Sesión cerrada correctamente');
      renderNav();
      location.hash = '#/login';
    };
  }
}

/* ============ ROUTER & ACCESS CONTROL ============ */
const routes = {
  '/': { render: renderClientLanding, role: 'any' },
  '/home': { render: renderClientLanding, role: 'any' },
  '/about': { render: renderAbout, role: 'any' },
  ['/' + __S]: { render: renderLogin, role: 'any' },

  '/products': { render: renderProducts, role: 'any' },
  '/quotation': { render: renderQuotation, role: 'any' },

  '/admin': { render: renderAdminHome, role: 'admin' },
  '/admin/products': { render: renderAdminProducts, role: 'admin' },
  '/admin/orders': { render: renderAdminOrders, role: 'admin' },
  '/admin/clients': { render: renderAdminClients, role: 'admin' },
  '/admin/content': { render: renderAdminContent, role: 'admin' },
};

function handleRouting() {
  // Asegurar que la ruta siempre sea #/home por defecto si no hay hash o es solo #/
  if (!location.hash || location.hash === '#/' || location.hash === '#') {
    location.hash = '#/home';
    return;
  }
  const path = location.hash.replace('#', '');
  const route = routes[path];
  const userRole = state.session?.role;

  // 1. Si hay sesión de admin y está en la URL de login, mandarlo a su dashboard
  if (state.session?.role === 'admin' && path === '/' + __S) {
    location.hash = '#/admin';
    return;
  }

  // 2. Control de Acceso
  if (!route) {
    location.hash = '#/home';
    return;
  }

  // Si la ruta es pública ('any'), renderizarla
  if (route.role === 'any') {
    route.render();
  }
  // Si no hay sesión y la ruta NO es pública, forzar login
  else if (!state.session) {
    location.hash = '#/' + __S;
  }

  // Si hay sesión pero el rol no coincide (ej: cliente en admin)
  else if (route.role !== 'any' && route.role !== userRole) {
    toast('⛔ Acceso restringido');
    location.hash = userRole === 'admin' ? '#/admin' : '#/home';
    return;
  }
  // Acceso permitido
  else {
    route.render();
  }

  renderNav();
  scrollTopSmooth();

  // Mostrar SophIA excepto para admin
  if (userRole !== 'admin') {
    renderWhatsAppFab();
  } else {
    hideWhatsAppFab();
  }
}

window.addEventListener('hashchange', handleRouting);

/* ========== CLIENTE ========== */
function renderProducts() {
  setViewMode('app');

  app.innerHTML = `
    <!-- Hero minimalista estilo Apple -->
    <section class="about-hero">
      <div class="about-hero__content">
        <h1 class="about-hero__title">Catálogo Premium</h1>
        <p class="about-hero__subtitle">
          Explora Superficies Exclusivas, Solicita tu Cotización y Transforma tus Espacios con Elegancia.
        </p>
        <div style="margin-top:32px">
          <a class="btn primary" href="#/quotation">Ir al Cotizador</a>
        </div>
      </div>
    </section>

    <div class="container">
      <!-- Filtros minimalistas -->
      <section class="about-section" style="margin-top:0">
        <div class="about-text-center" style="padding: 24px; margin-bottom: 48px;">
          <div style="display:flex;gap:15px;flex-wrap:wrap;align-items:center;justify-content:center">
            <div style="flex: 1; min-width: 200px;">
              <select id="filterMaterial" style="background: var(--bg-2); border-color: var(--stroke);">
                <option value="">Todos los Materiales</option>
                <option>Mármol</option><option>Granito</option><option>Cuarzo</option><option>Sinterizado</option>
              </select>
            </div>

            <div style="flex: 1; min-width: 200px;">
              <select id="filterColor" style="background: var(--bg-2); border-color: var(--stroke);">
                <option value="">Todos los Colores</option>
                <option>Verde</option><option>Negro</option><option>Blanco</option><option>Gris</option>
              </select>
            </div>

            <button class="btn primary" id="btnFilter" style="min-width: 140px;">Filtrar</button>
          </div>
          <p class="small" style="margin-top: 16px; text-align: center;">* Imágenes de Referencia de Nuestro Stock Real</p>
        </div>

        <h2 class="about-section__title" style="text-align:center; margin-bottom: 48px;">Nuestra Colección</h2>
        
        <div class="about-features" id="cardGrid">
          <!-- Se llena con draw() -->
        </div>
      </section>
    </div>
  `;

  const grid = $('#cardGrid');

  const draw = (list) => {
    const activeList = (list || []).filter(p => !p.disabled);
    if (!activeList || activeList.length === 0) {
      grid.innerHTML = `
        <div class="about-feature" style="grid-column: 1 / -1; min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <img src="${PLACEHOLDER}?v=${Date.now()}"
               alt="Sin resultados"
               style="width:120px; height:120px; object-fit:contain; margin-bottom:20px; opacity:.3;">
          <h3 class="about-feature__title">Sin resultados</h3>
          <p class="about-feature__desc">Prueba cambiando los filtros de Material o Color.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = activeList.map(p => {
      const baseDepth = Number(p.base_depth_cm ?? 60);
      const stockML = Number(p.stock_ml ?? 0);
      const priceML = Number(p.price_per_ml ?? 0);

      return `
        <div class="about-feature" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; text-align: left;">
          <div class="about-feature__media">
            <img 
              class="about-feature__img"
              src="${getImageFor(p)}" 
              onerror="imgHandleError(this)"
              alt="${p.name}">
            <div style="position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 8px;">
              <span class="role-badge" style="background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-color: var(--stroke);">${p.material}</span>
            </div>
          </div>
          
          <div class="about-feature__body">
            <h3 class="about-feature__title" style="margin-bottom: 8px; font-size: 20px;">${p.name}</h3>
            
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
              <span class="small" style="background: var(--bg-accent); padding: 4px 10px; border-radius: 999px; color: var(--gold-2); font-weight: 600;">${p.finish}</span>
            </div>

            <p class="about-feature__desc" style="font-size: 14px; margin-bottom: 20px;">
              Color: ${p.color} · Fondo base: ${baseDepth} cm
            </p>

            <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div style="font-size: 20px; font-weight: 800; color: var(--ink);">
                $${priceML.toLocaleString('es-CO')} <span class="small" style="font-weight: 400;">/ ML</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn primary small" onclick='addToCart(${JSON.stringify(p.id)})' style="padding: 8px 14px;">Añadir</button>
                <a class="btn tonal small" href="#/quotation" style="padding: 8px 14px;">Cotizar</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  draw(getEffectiveProducts());

  $('#btnFilter').onclick = () => {
    const m = slug($('#filterMaterial').value);
    const c = slug($('#filterColor').value);

    // Efecto Scanner High-Tech
    grid.classList.add('scanner-active');

    setTimeout(() => {
      const base = getEffectiveProducts();
      const list = base.filter(p => {
        const matchM = !m || slug(p.material) === m;
        const matchC = !c || slug(p.color) === c;
        return matchM && matchC;
      });
      draw(list);
      grid.classList.remove('scanner-active');
    }, 800);
  };
}


function addToCart(id) {
  const p = getEffectiveProducts().find(x => x.id === id);
  if (!p) return;

  const existing = state.cart.find(x => x.id === id);
  if (existing) {
    existing.ml = (existing.ml ?? 1) + 1;     // suma ML
  } else {
    state.cart.push({
      ...p,
      ml: 1,
      depth_cm: Number(p.base_depth_cm || 60) // fondo por defecto = base del producto
    });
  }
  toast('Añadido a la cotización');
}

function calcLinealPricing(p, ml, depth_cm) {
  const price_per_ml = Number(p.price_per_ml || 0);
  const base = Number(p.base_depth_cm || 60);
  const req = Number(depth_cm || base);
  const qty = Math.max(0, Number(ml || 0));

  const price_per_cm = price_per_ml / 100;
  const delta_cm = req - base;               // puede ser negativo
  const adjust = delta_cm * price_per_cm;    // descuento o extra
  const unit_price = Math.max(0, price_per_ml + adjust);
  const total = unit_price * qty;

  return { base, req, delta_cm, price_per_cm, adjust, unit_price, total };
}


function renderQuotation() {
  setViewMode('app');

  const items = state.cart;

  // ✅ asegura estado de prioridad (persistente en memoria)
  if (!state.aiPriority) {
    state.aiPriority = 'balanced';
  }

  app.innerHTML = `
    <!-- Hero minimalista estilo Apple -->
    <section class="about-hero">
      <div class="about-hero__content">
        <h1 class="about-hero__title">Cotizador Premium</h1>
        <p class="about-hero__subtitle">
          Configura tus Materiales, Ajusta las Medidas y Genera una Estimación Profesional Instantánea.
        </p>
      </div>
    </section>

    <div class="container">
      <section class="about-section" style="margin-top:0">
        <div class="grid" style="grid-template-columns:1.25fr .75fr; gap:24px">
          
          <!-- Carrito de Compras -->
          <div class="about-text-center" style="text-align: left; padding: 32px; max-width: none; margin: 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:24px">
              <h2 class="about-section__title" style="margin:0; font-size: 28px;">Detalle de Cotización</h2>
              <div style="display:flex;gap:12px;flex-wrap:wrap">
                <button class="btn tonal small" id="btnDownloadExcel">📊 Descargar Excel</button>
              </div>
            </div>

            <div id="cartTable"></div>
          </div>

          <!-- Columna Lateral: IA y Finalizar -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            
            <!-- Cotizar con IA -->
            <div class="about-text-center" style="text-align: left; padding: 28px; max-width: none; margin: 0; border-color: var(--gold-light);">
              <h3 class="about-feature__title" style="margin-top:0">Sugerencias Inteligentes ✨</h3>
              <p class="small" style="margin-bottom: 20px;">
                Recomendación automática basada en <strong>stock</strong>, <strong>precio</strong> y <strong>entrega</strong>.
              </p>

              <div style="margin-bottom: 20px;">
                <label class="small" style="display: block; margin-bottom: 8px; font-weight: 700; color: var(--gold-2);">Prioridad de la IA</label>
                <select id="aiPriority" style="background: var(--bg-2); border-color: var(--stroke); border-radius: 12px; padding: 10px;">
                  <option value="balanced">Equilibrado (Recomendado)</option>
                  <option value="match">Similar a mi Selección</option>
                  <option value="fastest">Más Rápido (Lead menor)</option>
                  <option value="cheapest">Más Económico</option>
                  <option value="stock">Mayor Disponibilidad</option>
                </select>
              </div>

              <div style="background: var(--bg-accent); padding: 16px; border-radius: 16px; border: 1px solid var(--stroke); margin-bottom: 20px;">
                <div class="small" style="text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Recomendación Actual</div>
                <div id="aiPick" style="font-weight:700; font-size: 18px; color: var(--ink); margin-bottom: 4px;">—</div>
                <div id="aiMeta" class="small" style="line-height: 1.4;"></div>
              </div>

              <div style="grid-template-columns: 1fr 1fr; display: grid; gap: 10px;">
                <button class="btn tonal small" id="btnAIRefresh">Recalcular</button>
                <button class="btn primary small" id="btnAIApply">Aplicar</button>
              </div>
            </div>

            <!-- Finalizar WhatsApp -->
            <div class="about-satisfaction" style="padding: 32px; border-radius: 28px; border-width: 1px; text-align: left;">
              <h3 class="about-feature__title" style="margin-top:0">Finalizar pedido</h3>
              <p class="small" style="margin-bottom: 20px; color: var(--ink-2);">
                Una vez lista tu cotización, coordinaremos las medidas finales y la instalación vía WhatsApp.
              </p>

              <button class="btn primary" id="btnFinishWA" style="width:100%; padding: 16px; font-size: 16px;">
                Confirmar por WhatsApp
              </button>

              <div id="badgeBox" style="margin-top:16px; display: flex; flex-wrap: wrap; gap: 8px;"></div>
            </div>

          </div>
        </div>
      </section>
    </div>
  `;

  hideWhatsAppFab(); // ✅ asegura que no quede el FAB pegado al cambiar de vista


  // ✅ bind del select (persistente y recalcula)
  const prSel = document.querySelector('#aiPriority');
  if (prSel) {
    prSel.value = state.aiPriority || 'balanced';
    prSel.onchange = (e) => {
      state.aiPriority = e.target.value;
      paintAI();
      toast('Prioridad IA actualizada');
    };
  }

  function paintAI() {
    const best = pickBestProductAI();

    if (!best) {
      $('#aiPick').textContent = 'Sin datos';
      $('#aiMeta').textContent = '';
      return;
    }

    $('#aiPick').textContent = best.name;

    const affTxt = (state.cart?.length)
      ? ` · Afinidad: ${Math.round((best._affinity || 0) * 100)}%`
      : '';

    const prLabel = {
      balanced: 'Equilibrado',
      match: 'Similar al carrito',
      fastest: 'Más rápido',
      cheapest: 'Más económico',
      stock: 'Más stock'
    }[state.aiPriority || best._priority] || (state.aiPriority || 'Equilibrado');

    $('#aiMeta').textContent =
      `Prioridad: ${prLabel} · $${Number(best.price_per_ml || 0).toLocaleString('es-CO')} / ML${affTxt}`;

    // ✅ Aplicar: añade, REPINTA y vuelve a recomendar
    $('#btnAIApply').onclick = () => {
      addToCart(best.id);
      drawCart();          // 🔥 ahora sí se ve
      confettiBurst();
      toast('Recomendación IA añadida');
      paintAI();           // 🔁 recomienda otro (evita repetir)
      document.querySelector('#cartTable')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }

  $('#btnAIRefresh').onclick = () => {
    paintAI();
    toast('IA recalculó sugerencia');
  };

  paintAI(); // primera sugerencia

  function drawCart() {
    if (items.length === 0) {
      $('#cartTable').innerHTML = `
        <div style="padding: 40px; text-align: center; background: var(--bg-2); border-radius: 20px; border: 1px dashed var(--stroke);">
          <p style="color: var(--muted); margin: 0;">No hay materiales en la cotización actual.</p>
          <a href="#/products" class="btn tonal small" style="margin-top: 16px;">Ver Catálogo</a>
        </div>
      `;
      hideWhatsAppFab();

      const b = $('#badgeBox');
      if (b) b.innerHTML = '';
      return;
    }

    let total = 0;

    const rows = items.map((it, i) => {
      const ml = Number(it.ml ?? it.qty ?? 1);
      const depth = Number(it.depth_cm ?? it.base_depth_cm ?? 60);

      const r = calcLinealPricing(it, ml, depth);
      total += r.total;

      return `
        <tr style="transition: background 0.2s ease;">
          <td style="padding: 20px 12px;">
            <div style="font-weight: 700; color: var(--ink);">${it.name}</div>
            <div class="small" style="color: var(--gold-2); font-weight: 600;">${it.id}</div>
          </td>

          <td style="padding: 20px 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="number" min="0.5" step="0.5"
                value="${ml}" style="width:70px; padding: 8px; border-radius: 8px; text-align: center;"
                data-i="${i}" class="mlInp"/>
              <span class="small" style="font-weight: 600;">ML</span>
            </div>
          </td>

          <td style="padding: 20px 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <input type="number" min="40" max="90" step="1"
                value="${depth}" style="width:70px; padding: 8px; border-radius: 8px; text-align: center;"
                data-i="${i}" class="depInp"/>
              <span class="small" style="font-weight: 600;">cm</span>
            </div>
          </td>

          <td style="padding: 20px 12px;">
            <div style="font-weight: 800; color: var(--ink); font-size: 16px;">$${r.total.toLocaleString('es-CO')}</div>
            <div class="small" style="color: var(--muted);">$${r.unit_price.toLocaleString('es-CO')} u.</div>
          </td>

          <td style="padding: 20px 12px; text-align: right;">
            <button class="btn tonal small" data-r="${i}" style="padding: 8px; border-radius: 8px; color: #64748b;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    $('#cartTable').innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="padding: 12px; border-bottom: 2px solid var(--bg-accent); color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Material</th>
            <th style="padding: 12px; border-bottom: 2px solid var(--bg-accent); color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Cantidad</th>
            <th style="padding: 12px; border-bottom: 2px solid var(--bg-accent); color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Fondo</th>
            <th style="padding: 12px; border-bottom: 2px solid var(--bg-accent); color: var(--muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Subtotal</th>
            <th style="padding: 12px; border-bottom: 2px solid var(--bg-accent);"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <th colspan="3" style="text-align:right; padding: 24px 12px; font-size: 18px; color: var(--muted); font-weight: 500;">Inversión Estimada:</th>
            <th style="padding: 24px 12px; font-size: 24px; font-weight: 900; color: var(--gold-2);">$${total.toLocaleString('es-CO')}</th>
            <th></th>
          </tr>
        </tfoot>
      </table>
    `;

    // badges
    const $bb = $('#badgeBox');
    $bb.innerHTML = '';
    if (total >= 2000000) $bb.innerHTML += `<div class="chip" style="background: var(--bg-accent); border: 1px solid var(--gold-light); color: var(--gold-2); font-weight: 600;">🏅 Proyecto Mediano</div> `;
    if (items.length >= 3) $bb.innerHTML += `<div class="chip" style="background: var(--bg-accent); border: 1px solid var(--gold-light); color: var(--gold-2); font-weight: 600;">🎯 Mix de Materiales</div> `;

    // bind ML
    document.querySelectorAll('.mlInp').forEach(inp => {
      inp.onchange = (e) => {
        const i = Number(e.target.dataset.i);
        items[i].ml = Math.max(0.5, Number(e.target.value || 1));
        drawCart();
      };
    });

    // bind Fondo
    document.querySelectorAll('.depInp').forEach(inp => {
      inp.onchange = (e) => {
        const i = Number(e.target.dataset.i);
        items[i].depth_cm = Math.max(40, Math.min(90, Number(e.target.value || 60)));
        drawCart();
      };
    });

    // quitar
    document.querySelectorAll('[data-r]').forEach(btn => {
      btn.onclick = (e) => {
        const i = Number(e.target.closest('[data-r]').dataset.r);
        items.splice(i, 1);
        drawCart();
      };
    });

    // ===== MENSAJE WHATSAPP PROFESIONAL =====
    const resumen = items.map(it => {
      const ml = Number(it.ml ?? 1);
      const depth = Number(it.depth_cm ?? it.base_depth_cm ?? 60);
      const r = calcLinealPricing(it, ml, depth);

      let spec = "";
      const mat = it.material.toLowerCase();
      if (mat.includes('mármol')) spec = "(Piedra Natural - Requiere Sellado)";
      if (mat.includes('granito')) spec = "(Alta Resistencia Térmica)";
      if (mat.includes('cuarzo')) spec = "(Antimanchas e Higiénico)";
      if (mat.includes('sinterizado')) spec = "(Grado Industrial Exterior)";

      return `• ${it.name} | ${ml} ML | Fondo ${depth}cm | $${r.total.toLocaleString('es-CO')} ${spec}`;
    }).join('\n');

    const msg =
      `*SOLICITUD DE COTIZACIÓN TÉCNICA - ARQURA* 👋
Hola, he generado mi presupuesto detallado en el portal. Adjunto especificaciones:

*Materiales Seleccionados:*
${resumen}

*Inversión Total Estimada:* $${total.toLocaleString('es-CO')}

_Nota: Deseo coordinar visita técnica para verificación de medidas y tiempos de entrega._`;

    renderWhatsAppFab(msg);

    // botón finalizar
    $('#btnFinishWA').onclick = () => window.open(getWhatsAppLink(msg), '_blank');
  }


  // Descargar Excel
  $('#btnDownloadExcel').onclick = () => {
    // Validar que el carrito no esté vacío
    if (!items || items.length === 0) {
      toast('⚠️ El carrito está vacío. Agrega materiales para descargar la cotización.');
      return;
    }

    // Preparar datos para Excel
    const excelData = [];

    // Título y encabezado
    excelData.push(['COTIZACIÓN ARQURA - SUPERFICIES PREMIUM']);
    excelData.push(['Fecha:', new Date().toLocaleDateString('es-CO')]);
    excelData.push([]); // Línea vacía

    // Encabezados de columnas
    excelData.push([
      'Material',
      'ID',
      'Metros Lineales (ML)',
      'Fondo (cm)',
      'Precio Base/ML',
      'Ajuste Fondo',
      'Precio Final/ML',
      'Subtotal'
    ]);

    let total = 0;

    // Agregar cada item del carrito
    items.forEach(it => {
      const ml = Number(it.ml ?? it.qty ?? 1);
      const depth = Number(it.depth_cm ?? it.base_depth_cm ?? 60);
      const r = calcLinealPricing(it, ml, depth);

      total += r.total;

      excelData.push([
        it.name,
        it.id,
        ml,
        depth,
        r.price_per_ml,
        r.adjust,
        r.unit_price,
        r.total
      ]);
    });

    // Línea vacía y total
    excelData.push([]);
    excelData.push(['', '', '', '', '', '', 'TOTAL:', total]);

    // Información adicional
    excelData.push([]);
    excelData.push(['Notas:']);
    excelData.push(['• Precios en pesos colombianos (COP)']);
    excelData.push(['• El precio se ajusta automáticamente según el fondo solicitado']);
    excelData.push(['• Fondo base: 60 cm']);
    excelData.push(['• Para confirmar medidas, instalación y entrega contactar por WhatsApp']);

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Configurar anchos de columna
    ws['!cols'] = [
      { wch: 30 },  // Material
      { wch: 12 },  // ID
      { wch: 20 },  // ML
      { wch: 12 },  // Fondo
      { wch: 18 },  // Precio Base
      { wch: 15 },  // Ajuste
      { wch: 18 },  // Precio Final
      { wch: 18 }   // Subtotal
    ];

    // Aplicar formato de moneda a las columnas de precios
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 4; R <= range.e.r; ++R) {
      // Columnas de precios: E (4), F (5), G (6), H (7)
      [4, 5, 6, 7].forEach(col => {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: col });
        if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = '$#,##0';
        }
      });
    }

    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Cotización');

    // Generar nombre de archivo con fecha
    const fecha = new Date().toISOString().slice(0, 10);
    const fileName = `cotizacion_arqura_${fecha}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);

    toast('✅ Cotización descargada en Excel');
  };

  drawCart();
}





/* ===== Acerca ===== */
function renderAbout() {
  setViewMode('app');

  const A = AboutStore.load();
  app.innerHTML = `
    <!-- Hero minimalista estilo Apple -->
    <section class="about-hero">
      <div class="about-hero__content">
        <h1 class="about-hero__title">${A.title}</h1>
        <p class="about-hero__subtitle">${A.subtitle}</p>
      </div>
    </section>

    <!-- Sección principal -->
    <div class="container about-container">
      
      <!-- Quiénes Somos - Full width -->
      <section class="about-section">
        <div class="about-text-center">
          <h2 class="about-section__title">Quiénes Somos</h2>
          <p class="about-section__text">${A.who}</p>
        </div>
      </section>

      <!-- Propuesta de Valor - Grid de features -->
      <section class="about-section">
        <h2 class="about-section__title" style="text-align:center;margin-bottom:48px">Propuesta de Valor</h2>
        <div class="about-features">
          ${A.value_points.map((point, i) => {
    const [title, desc] = point.split(':').map(s => s.trim());
    const icons = ['💎', '⚡', '📊', '🎯'];
    return `
              <div class="about-feature" style="animation-delay: ${i * 0.1}s">
                <div class="about-feature__icon">${icons[i] || '✨'}</div>
                <h3 class="about-feature__title">${title}</h3>
                <p class="about-feature__desc">${desc || ''}</p>
              </div>
            `;
  }).join('')}
        </div>
      </section>

      <!-- Confianza - Pills minimalistas -->
      <section class="about-section">
        <h2 class="about-section__title" style="text-align:center;margin-bottom:36px">Confianza</h2>
        <div class="about-trust">
          ${A.trust_points.map(point => {
    const [label, desc] = point.split('·').map(s => s.trim());
    return `
              <div class="about-trust-item">
                <div class="about-trust-item__label">${label}</div>
                <div class="about-trust-item__desc">${desc}</div>
              </div>
            `;
  }).join('')}
        </div>
      </section>

      <!-- Satisfacción - Minimalista -->
      <section class="about-section">
        <div class="about-satisfaction">
          <div class="about-satisfaction__label">Satisfacción del Cliente</div>
          <div class="about-satisfaction__number">${Number(A.satisfaction_pct || 0)}%</div>
          <div class="about-satisfaction__bar">
            <div class="about-satisfaction__fill" style="width: ${Number(A.satisfaction_pct || 0)}%"></div>
          </div>
        </div>
      </section>

    </div>
  `;
}

/* ========== ADMIN ========== */
function scrollTopSmooth() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function renderAdminHome() {
  setViewMode('app');
  if (state.session?.role !== 'admin') { location.hash = '#/products'; return; }

  let currentPeriod = 'mes';

  function calculateDashboard(ordersList, productsList) {
    const now = new Date();
    const coToday = getColombiaTime().split(' ')[0]; // YYYY-MM-DD

    const filteredOrders = ordersList.filter(o => {
      if (!o.created) return false;
      const oDatePart = o.created.split(' ')[0];
      const oDateObj = new Date(o.created);

      if (currentPeriod === 'hoy') return oDatePart === coToday;
      if (currentPeriod === 'semana') {
        const diff = (now - oDateObj) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (currentPeriod === 'mes') {
        // Simple month check
        return oDateObj.getMonth() === now.getMonth() && oDateObj.getFullYear() === now.getFullYear();
      }
      return true; // Todo
    });

    const totalRevenue = filteredOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const revenueToday = ordersList.filter(o => (o.created || '').split(' ')[0] === coToday)
      .reduce((s, o) => s + (Number(o.total) || 0), 0);

    const avgTicket = totalRevenue / Math.max(1, filteredOrders.length);
    const activeOrders = ordersList.filter(o => ['pendiente', 'en_proceso', 'despachado'].includes(o.status));
    const pendingOrdersCount = activeOrders.length;

    const pendingRevenue = activeOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const stockValorizado = productsList.reduce((s, p) => s + ((Number(p.stock_ml) || 0) * (Number(p.price_per_ml) || 0)), 0);
    const lowStockItems = getStockAlerts(productsList);

    const salesByDate = {};
    filteredOrders.forEach(o => {
      const day = (o.created || '').split(' ')[0];
      if (day) salesByDate[day] = (salesByDate[day] || 0) + Number(o.total);
    });
    const dates = Object.keys(salesByDate).sort().slice(-7);
    const chartData = dates.map(d => ({ label: d.split('-').slice(1).reverse().join('/'), value: salesByDate[d] }));

    const prodSales = {};
    ordersList.forEach(o => { (o.items || []).forEach(it => { prodSales[it.name] = (prodSales[it.name] || 0) + Number(it.ml || 0); }); });
    const topProds = Object.entries(prodSales)
      .map(([name, ml]) => ({ name, ml, img: getImageFor(productsList.find(p => p.name === name)) }))
      .sort((a, b) => b.ml - a.ml).slice(0, 4);

    return {
      totalRevenue, revenueToday, avgTicket, pendingOrdersCount, pendingRevenue,
      stockValorizado, chartData, topProds, lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.filter(x => x.level === 'critical').slice(0, 3),
      byStatus: ordersList.reduce((m, o) => { m[o.status] = (m[o.status] || 0) + 1; return m; }, {
        pendiente: 0, en_proceso: 0, despachado: 0, entregado: 0, cancelado: 0
      })
    };
  }

  function renderUI() {
    const freshOrders = loadOrders(); // Use raw load to avoid re-seeding loop
    const freshProducts = getEffectiveProducts();
    const data = calculateDashboard(freshOrders, freshProducts);

    app.innerHTML = `
      <div class="container" style="margin:18px 0 24px">
        <div class="admin-surface">
          <div class="dash-header">
            <div>
              <h2 style="margin:0">Panel Estratégico</h2>
              <p class="small">Análisis en tiempo real para toma de decisiones.</p>
            </div>
            <div class="dash-filters">
              <button class="dash-filter-btn ${currentPeriod === 'hoy' ? 'active' : ''}" data-p="hoy">Hoy</button>
              <button class="dash-filter-btn ${currentPeriod === 'semana' ? 'active' : ''}" data-p="semana">7D</button>
              <button class="dash-filter-btn ${currentPeriod === 'mes' ? 'active' : ''}" data-p="mes">Mes</button>
              <button class="dash-filter-btn ${currentPeriod === 'todo' ? 'active' : ''}" data-p="todo">Todo</button>
            </div>
          </div>

          <div class="kpi-modern-grid">
            <div class="kpi-modern">
               <div class="kpi-icon">💰</div>
               <div class="kpi-modern__label">Ingresos Hoy</div>
               <div class="kpi-modern__value">$${data.revenueToday.toLocaleString('es-CO')}</div>
               <div class="kpi-modern__trend up">↗ Hoy (${getColombiaTime().split(' ')[0]})</div>
            </div>
            <div class="kpi-modern">
               <div class="kpi-icon">📦</div>
               <div class="kpi-modern__label">Pedidos Activos</div>
               <div class="kpi-modern__value">${data.pendingOrdersCount}</div>
               <div class="kpi-modern__trend">En cola de producción</div>
            </div>
            <div class="kpi-modern">
               <div class="kpi-icon">🕒</div>
               <div class="kpi-modern__label">Venta en Cola</div>
               <div class="kpi-modern__value">$${data.pendingRevenue.toLocaleString('es-CO')}</div>
               <div class="kpi-modern__trend down">Proyección de recaudo</div>
            </div>
            <div class="kpi-modern">
               <div class="kpi-icon">⚠</div>
               <div class="kpi-modern__label">Alertas Stock</div>
               <div class="kpi-modern__value">${data.lowStockCount}</div>
               <div class="kpi-modern__trend ${data.lowStockCount > 0 ? 'down' : 'up'}">${data.lowStockCount > 0 ? '⚠ Revisar inventario' : '✓ Niveles estables'}</div>
            </div>
          </div>

          <div class="charts-row">
            <div class="chart-card">
              <h3>Tendencia de Ventas ($)</h3>
              <div class="v-bar-chart">
                ${data.chartData.length ? data.chartData.map(d => {
      const maxVal = Math.max(...data.chartData.map(x => x.value));
      const h = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
      return `<div class="v-bar-item"><div class="v-bar" style="height:${h}%" data-val="$${d.value.toLocaleString('es-CO')}"></div><div class="v-bar-label">${d.label}</div></div>`;
    }).join('') : '<div style="flex:1;text-align:center;padding:40px;color:var(--muted)">Sin datos</div>'}
              </div>
            </div>
            <div class="chart-card">
              <h3>Materiales Top</h3>
              <div class="top-list">
                ${data.topProds.map(p => `
                  <div class="top-item">
                    <img src="${p.img}" onerror="imgHandleError(this)">
                    <div class="top-info"><div class="top-name">${p.name}</div><div class="top-stat">Volumen</div></div>
                    <div class="top-val">${p.ml} ML</div>
                  </div>
                `).join('')}
              </div>
              </div>
            </div>
          </div>

          ${data.lowStockItems.length > 0 ? `
          <div class="card" style="margin-bottom:24px; border: 1px solid var(--stroke); background: #fffaf0;">
            <h3 style="margin:0 0 12px; font-size:16px; color: #a52a2a;">🚨 Atención Necesaria: Stock Crítico</h3>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
              ${data.lowStockItems.map(it => `
                <div class="glass-card" style="padding:10px 15px; flex:1; min-width:200px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-weight:700;">${it.name}</div>
                    <div class="small">Solo quedan ${it.stock_ml} ML</div>
                  </div>
                  <button class="btn tonal small" onclick="go('#/admin/products')">Reponer</button>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <div class="state-cards" style="margin-bottom:24px">
            <div class="state-card"><div class="label">Pendiente</div><div class="num">${data.byStatus.pendiente || 0}</div></div>
            <div class="state-card"><div class="label">En proceso</div><div class="num">${data.byStatus.en_proceso || 0}</div></div>
            <div class="state-card"><div class="label">Despachado</div><div class="num">${data.byStatus.despachado || 0}</div></div>
            <div class="state-card green"><div class="label">Entregado</div><div class="num">${data.byStatus.entregado || 0}</div></div>
            <div class="state-card red"><div class="label">Cancelado</div><div class="num">${data.byStatus.cancelado || 0}</div></div>
          </div>

          <div class="toolbar">
            <button class="btn primary" id="goInv">Inventario</button>
            <button class="btn tonal" id="goOrd">Pedidos</button>
            <button class="btn tonal" id="goContent">Contenido</button>
            <div style="flex:1"></div>
            <button class="btn" id="topBtn">Arriba</button>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.dash-filter-btn').forEach(btn => {
      btn.onclick = () => { currentPeriod = btn.dataset.p; renderUI(); };
    });

    $('#goInv').onclick = () => go('#/admin/products');
    $('#goOrd').onclick = () => go('#/admin/orders');
    $('#goContent').onclick = () => go('#/admin/content');
    $('#topBtn').onclick = scrollTopSmooth;
  }

  // Real-time listener: refresh if storage updates
  const onDataUpdate = (e) => {
    if (e.key === ORDERS_KEY || e.key === PRODUCTS_KEY) renderUI();
  };
  window.addEventListener('storage', onDataUpdate);

  // Initial render
  renderUI();
}

function renderAdminSettings() {
  setViewMode('app');
  if (state.session?.role !== 'admin') { location.hash = '#/products'; return; }

  const S = SettingsStore.load();

  app.innerHTML = `
    <div class="container" style="margin:18px 0 24px">
      <div class="admin-surface">
        <div class="section-title"><h2>Configuración</h2></div>
        <p class="section-sub">Reglas de alertas y predicción (demo).</p>

        <div class="grid" style="grid-template-columns:1fr;gap:14px">
          <div class="card">
            <h3 style="margin-top:0">Alertas de stock (ML)</h3>
            <div class="row">
              <div style="flex:1">
                <label class="small">Stock bajo (ML)</label>
                <input id="low" class="input" type="number" min="0" value="${S.low_stock_ml}">
              </div>
              <div style="flex:1">
                <label class="small">Stock crítico (ML)</label>
                <input id="crit" class="input" type="number" min="0" value="${S.critical_stock_ml}">
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="margin-top:0">Predicción (simple)</h3>
            <div class="row">
              <div style="flex:1">
                <label class="small">Ventana (días)</label>
                <input id="predDays" class="input" type="number" min="7" max="90" value="${S.prediction_days}">
              </div>
              <div style="flex:1">
                <label class="small">Consumo diario base (ML/día)</label>
                <input id="daily" class="input" type="number" min="0" step="0.5" value="${S.daily_ml_usage_default}">
              </div>
            </div>
          </div>

          <div class="card">
            <h3 style="margin-top:0">Configuración de Negocio (Público)</h3>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap:14px">
              <div style="grid-column: 1 / -1">
                <label class="small">Google Maps Embed URL</label>
                <input id="setMaps" class="input" value="${S.maps_src}">
              </div>
              <div>
                <label class="small">WhatsApp de Contacto (con 57)</label>
                <input id="setWA" class="input" value="${S.whatsapp}">
              </div>
              <div>
                <label class="small">Email de Contacto</label>
                <input id="setEmail" class="input" value="${S.email}">
              </div>
            </div>
          </div>

          <div class="card">
            <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
              <button class="btn primary" id="save">Guardar</button>
              <button class="btn" id="back">Volver</button>
              <div style="flex:1"></div>
              <span class="small">* Se guarda en localStorage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  $('#save').onclick = () => {
    const next = {
      low_stock_ml: clamp(Number($('#low').value || 0), 0, 999999),
      critical_stock_ml: clamp(Number($('#crit').value || 0), 0, 999999),
      prediction_days: clamp(Number($('#predDays').value || 14), 7, 90),
      daily_ml_usage_default: clamp(Number($('#daily').value || 0), 0, 9999),
      whatsapp: $('#setWA').value.trim(),
      email: $('#setEmail').value.trim(),
      maps_src: $('#setMaps').value.trim()
    };

    if (next.critical_stock_ml > next.low_stock_ml) {
      next.critical_stock_ml = next.low_stock_ml;
    }

    SettingsStore.save(next);
    toast('Configuración guardada');
  };

  $('#back').onclick = () => go('#/admin');
}


/* ====== ADMIN: Gestión de Contenido ====== */
function renderAdminContent() {
  setViewMode('app');
  if (state.session?.role !== 'admin') { location.hash = '#/products'; return; }

  const about = AboutStore.load();
  const S = SettingsStore.load();
  const slides = S.carousel || [];

  app.innerHTML = `
    <div class="container" style="margin:18px 0 24px">
      <div class="admin-surface" style="max-width: 900px; margin: 0 auto;">
        <div class="section-title"><h2>Gestión de Contenido</h2></div>
        <p class="section-sub">Personaliza el carrusel de inicio, datos de contacto e información corporativa.</p>

        <!-- 1. Contacto Directo -->
        <div class="card" style="margin-bottom:24px; border: 1px solid var(--stroke);">
          <h3 style="margin-top:0">🚀 Contacto Directo</h3>
          <p class="small" style="margin-bottom:15px">Estos datos se reflejan en el botón de WhatsApp y pie de página.</p>
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap:14px">
            <div>
              <label class="small-caps">WhatsApp (con prefijo 57)</label>
              <input id="setWA" class="input" value="${S.whatsapp || ''}" placeholder="57300...">
            </div>
            <div>
              <label class="small-caps">Email de Contacto</label>
              <input id="setEmail" class="input" value="${S.email || ''}" placeholder="email@ejemplo.com">
            </div>
          </div>
        </div>

        <!-- 2. Carrusel Editor -->
        <div class="card" style="margin-bottom:24px; border: 1px solid var(--stroke);">
          <h3 style="margin-top:0">🖼️ Editor de Carrusel (Hero)</h3>
          <div id="carouselEditor" style="display:flex; flex-direction:column; gap:16px;">
            ${slides.map((s, i) => `
              <div class="glass-card" style="padding:15px; display:grid; grid-template-columns: 100px 1fr auto; gap:15px; align-items:center;">
                <img src="${s.img}" onerror="imgHandleError(this)" style="width:100px; height:60px; object-fit:cover; border-radius:8px;">
                <div style="display:grid; gap:8px;">
                  <input class="input small c-img" placeholder="URL Imagen" value="${s.img}">
                  <div style="display:flex; gap:8px;">
                    <input class="input small c-title" placeholder="Título" value="${s.title}" style="flex:2">
                    <input class="input small c-sub" placeholder="Subtítulo" value="${s.subtitle}" style="flex:1">
                  </div>
                </div>
                <button class="btn danger small slide-del-btn" data-idx="${i}">✕</button>
              </div>
            `).join('')}
            <button class="btn tonal" id="addSlideBtn">+ Agregar Diapositiva</button>
          </div>
        </div>

        <!-- 3. Información Acerca de (Corporativa) -->
        <div class="card" style="margin-bottom:24px; border: 1px solid var(--stroke);">
          <h3 style="margin-top:0">🏛️ Información Corporativa (Acerca)</h3>
          <div class="grid" style="grid-template-columns: 1fr; gap:14px">
            <div>
              <label class="small-caps">Título Principal</label>
              <input id="aboutTitle" class="input" value="${about.title}">
            </div>
            <div>
              <label class="small-caps">Subtítulo / Misión</label>
              <textarea id="aboutSub" class="input" style="min-height:60px">${about.subtitle}</textarea>
            </div>
            <div>
              <label class="small-caps">¿Quiénes somos?</label>
              <textarea id="aboutWho" class="input" style="min-height:80px">${about.who}</textarea>
            </div>
            <div class="row" style="gap:14px">
              <div style="flex:1">
                <label class="small-caps">Propuesta de Valor (uno por línea)</label>
                <textarea id="aboutValue" class="input" style="min-height:100px">${(about.value_points || []).join('\n')}</textarea>
              </div>
              <div style="flex:1">
                <label class="small-caps">Puntos de Confianza (uno por línea)</label>
                <textarea id="aboutTrust" class="input" style="min-height:100px">${(about.trust_points || []).join('\n')}</textarea>
              </div>
            </div>
            <div style="max-width:200px">
              <label class="small-caps">Satisfacción (%)</label>
              <input id="aboutSat" class="input" type="number" min="0" max="100" value="${about.satisfaction_pct}">
            </div>
          </div>
        </div>

        <!-- 4. Ajuste de Precios Global -->
        <div class="card" style="margin-bottom:24px; background: #fff5f5; border: 1px solid #fed7d7;">
          <h3 style="color: #c53030; margin-top:0">⚠️ Ajuste Global de Precios</h3>
          <p class="small">Modifica el precio de TODOS los productos por un porcentaje.</p>
          <div style="display:flex; gap:12px; align-items:center; margin-top:12px;">
            <input type="number" id="pricePercent" class="input" placeholder="%" style="width:100px">
            <button class="btn danger" id="applyPricingBtn">Aplicar a todo el Inventario</button>
          </div>
        </div>

        <div class="toolbar" style="margin-top:24px; position: sticky; bottom: 20px; background: var(--bg-1); padding: 15px; border-radius: 12px; box-shadow: var(--shadow-lg);">
          <button class="btn primary" id="saveContent">💾 Guardar Todos los Cambios</button>
          <button class="btn" id="backToAdmin">Volver</button>
        </div>
      </div>
    </div>
  `;

  // Handlers
  $('#addSlideBtn').onclick = () => {
    slides.push({ img: '', title: 'Nuevo Título', subtitle: 'Arqura' });
    S.carousel = slides;
    SettingsStore.save(S);
    renderAdminContent();
  };

  document.querySelectorAll('.slide-del-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.idx);
      slides.splice(idx, 1);
      S.carousel = slides;
      SettingsStore.save(S);
      renderAdminContent();
    };
  });

  $('#applyPricingBtn').onclick = () => {
    const p = Number($('#pricePercent').value);
    if (!p || isNaN(p)) { toast('⚠️ Ingresa un porcentaje válido'); return; }
    if (!confirm(`¿Estás seguro de ajustar TODOS los precios un ${p}%? Esta acción es masiva.`)) return;
    const factor = 1 + (p / 100);
    const products = getEffectiveProducts();
    products.forEach(prod => prod.price_per_ml = Math.round(Number(prod.price_per_ml || 0) * factor));
    saveProductsToFirebase(products);
    toast(`✅ Precios actualizados un ${p}%`);
    $('#pricePercent').value = '';
  };

  $('#saveContent').onclick = () => {
    // 1. Guardar Settings (WhatsApp, Email, Carousel)
    const newSlides = [];
    document.querySelectorAll('#carouselEditor .glass-card').forEach(card => {
      newSlides.push({
        img: card.querySelector('.c-img').value,
        title: card.querySelector('.c-title').value,
        subtitle: card.querySelector('.c-sub').value
      });
    });
    S.carousel = newSlides;
    S.whatsapp = $('#setWA').value.trim();
    S.email = $('#setEmail').value.trim();
    SettingsStore.save(S);

    // 2. Guardar About Content
    const newAbout = {
      title: $('#aboutTitle').value,
      subtitle: $('#aboutSub').value,
      who: $('#aboutWho').value,
      value_points: $('#aboutValue').value.split('\n').map(s => s.trim()).filter(Boolean),
      trust_points: $('#aboutTrust').value.split('\n').map(s => s.trim()).filter(Boolean),
      satisfaction_pct: Number($('#aboutSat').value || 0)
    };
    AboutStore.save(newAbout);

    toast('✅ Todo el contenido ha sido actualizado');
  };

  $('#backToAdmin').onclick = () => go('#/admin');
}

function renderAdminProducts() {
  setViewMode('app');
  if (state.session?.role !== 'admin') { location.hash = '#/products'; return; }

  const $u = v => (v ?? '');
  let data = getEffectiveProducts();

  app.innerHTML = `
    <div class="container" style="margin:18px 0 24px">
      <div class="admin-surface">
        <div class="section-title"><h2>Inventario</h2></div>
        <div class="toolbar">
          <input type="text" id="qProd" class="input" placeholder="Buscar por nombre o id">
          <button class="btn primary" id="btnAdd">Agregar</button>
          <button class="btn" id="btnExport">📊 Exportar Excel</button>
          <button class="btn" id="btnImport">📥 Importar Excel</button>
          <div style="flex:1"></div>
          <button class="btn" id="backPanel">Volver</button>
        </div>

        <table class="table-modern">
          <thead>
            <tr>
              <th>Vista</th><th>ID</th><th>Nombre</th><th>Material</th><th>Color</th><th>Acabado</th>
              <th>Precio ML</th><th>Stock</th><th>Estado</th><th style="width:120px">Acciones</th>
            </tr>
          </thead>
          <tbody id="invRows"></tbody>
        </table>

        <p class="small">* Cambios se guardan en localStorage y predominan sobre el JSON.</p>
      </div>
    </div>

    <div id="sheet" style="display:none"></div>
  `;

  const $rows = $('#invRows');

  function paint(rows) {
    $rows.innerHTML = rows.map(p => `
      <tr>
        <td data-label="Vista"><img src="${getImageFor(p)}" onerror="imgHandleError(this)" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--stroke);background:white;"></td>
        <td data-label="ID"><strong>${p.id}</strong></td>
        <td data-label="Producto">${p.name}</td>
        <td data-label="Material">${p.material}</td>
        <td data-label="Color">${p.color}</td>
        <td data-label="Acabado">${p.finish}</td>
        <td data-label="Precio">$${Number(p.price_per_ml || 0).toLocaleString('es-CO')}</td>
        <td data-label="Stock">${Number(p.stock_ml || 0)} ML</td>
        <td data-label="Estado">
          <span class="p-chip ${p.disabled ? 'red' : 'green'}" style="cursor:pointer" data-toggle-vis="${p.id}">
            ${p.disabled ? '✖ Oculto' : '✓ Activo'}
          </span>
        </td>
        <td data-label="Acciones">
          <div class="table-actions">
            <button class="btn tonal small" data-edit="${p.id}">✏️</button>
            <button class="btn danger small" data-del="${p.id}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
    bindRowActions();
  }

  function bindRowActions() {
    document.querySelectorAll('[data-edit]').forEach(b => {
      b.onclick = () => openSheet(data.find(x => x.id === b.dataset.edit));
    });
    document.querySelectorAll('[data-del]').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.del;
        if (!confirm('¿Seguro de eliminar esta referencia?')) return;
        const ov = getEffectiveProducts().filter(x => x.id !== id);
        saveProductsToFirebase(ov);
        data = getEffectiveProducts();
        apply();
        toast('Referencia eliminada');
      };
    });
    document.querySelectorAll('[data-toggle-vis]').forEach(b => {
      b.onclick = () => {
        const id = b.dataset.toggleVis;
        const list = getEffectiveProducts();
        const prod = list.find(x => x.id === id);
        if (prod) {
          prod.disabled = !prod.disabled;
          saveProductsToFirebase(list);
          data = getEffectiveProducts();
          apply();
          toast(prod.disabled ? 'Producto oculto' : 'Producto activo');
        }
      };
    });
  }

  function generateNextId(material) {
    const raw = (material || '').toLowerCase();
    let prefix = 'X-';
    if (raw.includes('mármol') || raw.includes('marmol')) prefix = 'M-';
    else if (raw.includes('granito')) prefix = 'G-';
    else if (raw.includes('sinterizado')) prefix = 'S-';
    else if (raw.includes('cuarzo')) prefix = 'Q-';

    const all = getEffectiveProducts();
    const nums = all
      .filter(p => p.id.startsWith(prefix))
      .map(p => {
        const parts = p.id.split('-');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const nextNum = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `${prefix}${nextNum.toString().padStart(3, '0')}`;
  }

  function openSheet(item) {
    const s = $('#sheet');
    const P = item || { id: '', name: '', material: 'Mármol', color: 'Blanco', finish: 'Pulido', price_per_ml: 0, stock_ml: 0, base_depth_cm: 60, lead_time_days: 5, image: '', description: '', disabled: false };

    s.innerHTML = `
      <div class="sheet">
        <h4 style="margin:0 0 12px">${item ? 'Editar' : 'Nueva'} Referencia</h4>
        <div style="margin-bottom:15px">
           <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:600">
             <input type="checkbox" id="fActive" ${!P.disabled ? 'checked' : ''} style="width:auto"> 
             Producto Activo (Visible para clientes)
           </label>
        </div>
        <div class="row">
          <input id="fId" class="input" placeholder="ID" value="${$u(P.id)}" ${item ? 'disabled' : ''}>
          <input id="fName" class="input" placeholder="Nombre" value="${$u(P.name)}">
          <input id="fMat" class="input" placeholder="Material" value="${$u(P.material)}">

          <div style="grid-column: 1 / -1;">
            <label class="small">Descripción (Magia AI ✨)</label>
            <div style="display:flex; gap:10px;">
              <textarea id="fDesc" class="input" style="flex:1; min-height:60px;">${$u(P.description)}</textarea>
              <button class="btn btn-ai-magic" id="btnAiMagic" style="width:50px; font-size:18px;" title="Generar con SophIA">✨</button>
            </div>
          </div>
          <input id="fCol" class="input" placeholder="Color" value="${$u(P.color)}">
          <input id="fFin" class="input" placeholder="Acabado" value="${$u(P.finish)}">
          <input id="fPrice" class="input" type="number" placeholder="Precio ML" value="${$u(P.price_per_ml)}">
          <input id="fStock" class="input" type="number" placeholder="Stock ML" value="${$u(P.stock_ml)}">
          <input id="fBase" class="input" type="number" placeholder="Fondo base (cm)" value="${$u(P.base_depth_cm ?? 60)}">
          <input id="fLead" class="input" type="number" placeholder="Lead días" value="${$u(P.lead_time_days)}">
        </div>
        
        <div style="margin-top:14px">
          <label class="small">Imagen del Producto</label>
          <div style="display:flex; flex-direction:column; gap:10px; align-items:center; border: 1px dashed var(--stroke); padding: 15px; border-radius: 12px; background: var(--bg-accent);">
            <img id="imgPreview" 
                 src="${getImageFor(P)}" 
                 onerror="imgHandleError(this)"
                 style="width:120px; height:120px; object-fit:cover; border-radius:8px; border:1px solid var(--stroke); background:white;">
            <div style="display:flex; flex-direction:column; align-items:center; gap:5px">
              <label class="btn tonal" style="cursor:pointer; margin:0">
                📁 Seleccionar Imagen
                <input type="file" id="fUpload" style="display:none" accept="image/*">
              </label>
              <p class="small" style="margin:0; text-align:center; color: var(--muted-2);">Formatos recomendados: JPG, PNG, WebP</p>
            </div>
            <input id="fImg" type="hidden" value="${$u(P.image)}">
          </div>
        </div>
        <div class="toolbar" style="margin-top:12px">
          <button class="btn primary" id="saveP">💾 Guardar Referencia</button>
          <button class="btn" id="closeS">Cerrar</button>
        </div>
      </div>`;
    s.style.display = 'block';

    const $fImg = s.querySelector('#fImg');
    const $imgPreview = s.querySelector('#imgPreview');
    const $fId = s.querySelector('#fId');
    const $fMat = s.querySelector('#fMat');
    const $fCol = s.querySelector('#fCol');
    let manualUpload = false;

    const refreshPreview = () => {
      if (manualUpload) return;
      const tempP = { material: $fMat.value, color: $fCol.value, image: '' };
      $imgPreview.src = getImageFor(tempP);
    };

    $fMat.oninput = () => {
      refreshPreview();
      if (!item && ($fId.value.trim() === '' || $fId.value.includes('-'))) {
        $fId.value = generateNextId($fMat.value);
      }
    };
    $fCol.oninput = refreshPreview;

    const $fUpload = s.querySelector('#fUpload');
    const $btnSave = s.querySelector('#saveP');
    if ($fUpload) {
      $fUpload.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast('❌ Imagen muy grande (máx 5MB)');
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          toast('❌ Solo se permiten imágenes');
          return;
        }

        $btnSave.disabled = true;
        const oldText = $btnSave.textContent;
        $btnSave.textContent = '⏳ Subiendo...';

        try {
          console.log('🚀 Iniciando upload de imagen...');
          const url = await uploadImageToFirebase(file, 'products');
          $fImg.value = url;
          $imgPreview.src = url;
          manualUpload = true;
          toast('✅ Imagen subida correctamente');
          console.log('✅ Upload exitoso:', url);
        } catch (err) {
          console.error('❌ Error completo:', err);
          const errorMsg = err.message || 'Error al subir la imagen';
          toast(`❌ ${errorMsg}`);

          // Mostrar alerta con más detalles
          alert(`Error al subir imagen:\n\n${errorMsg}\n\nRevisa la consola (F12) para más detalles.`);
        } finally {
          $btnSave.disabled = false;
          $btnSave.textContent = oldText;
        }
      };
    }

    s.querySelector('#closeS').onclick = () => s.style.display = 'none';

    s.querySelector('#btnAiMagic').onclick = () => {
      const mat = s.querySelector('#fMat').value;
      const col = s.querySelector('#fCol').value;
      const name = s.querySelector('#fName').value;
      const prompts = {
        'Mármol': `Exclusiva pieza de ${name} con vetas naturales en tono ${col}. Aporta una elegancia atemporal y un brillo espejo ideal para interiores de lujo.`,
        'Granito': `Superficie de alto tráfico ${name}, color ${col}. Destaca por su dureza extrema y resistencia al calor, perfecto para cocinas exigentes.`,
        'Cuarzo': `Superficie premium ${name} color ${col}. Material higiénico y antibacterial, resistente a manchas y de muy bajo mantenimiento.`,
        'Sinterizado': `Tecnología de punta en este ${name}. Material ultracompacto y resistente a rayos UV, ideal para fachadas y exteriores.`
      };
      s.querySelector('#fDesc').value = prompts[mat] || `Material premium ${name} en tono ${col}, ideal para acabados de lujo.`;
      toast('✨ SophIA generó la descripción');
    };

    const stock = Number(P.stock_ml || 0);
    if (stock > 50) {
      const suggest = Math.round(Number(s.querySelector('#fPrice').value || P.price_per_ml) * 0.95);
      const div = document.createElement('div');
      div.className = 'ai-suggestion-box';
      div.innerHTML = `<span>💡 <strong>Sugerencia AI:</strong> Stock alto. Precio sugerido: $${suggest.toLocaleString('es-CO')}</span>`;
      s.querySelector('.row').after(div);
    }

    s.querySelector('#saveP').onclick = () => {
      const idVal = $('#fId').value.trim().toUpperCase();
      const nameVal = $('#fName').value.trim();
      if (!idVal || !nameVal) { toast('⚠️ ID y Nombre son obligatorios'); return; }

      const newP = {
        id: $('#fId').value.trim(),
        name: $('#fName').value.trim(),
        material: $('#fMat').value.trim(),
        color: $('#fCol').value.trim(),
        finish: $('#fFin').value.trim(),
        price_per_ml: Number($('#fPrice').value || 0),
        stock_ml: Number($('#fStock').value || 0),
        base_depth_cm: Number($('#fBase').value || 60),
        lead_time_days: Number($('#fLead').value || 5),
        image: $('#fImg').value.trim(),
        description: $('#fDesc').value.trim(),
        disabled: !$('#fActive').checked
      };

      // Si la imagen es una URL de Firebase (Manual), se guarda.
      // Si el campo está vacío o tiene una ruta local 'assets/', lo guardamos como "" para que sea DINÁMICO.
      if (!newP.image.startsWith('http')) {
        newP.image = "";
      }

      const ov = getEffectiveProducts();
      if (!item && ov.some(x => x.id === newP.id)) {
        toast('❌ Este ID ya existe');
        return;
      }

      const i = ov.findIndex(x => x.id === newP.id);
      if (i >= 0) ov[i] = newP; else ov.push(newP);
      saveProductsToFirebase(ov);
      data = getEffectiveProducts();
      apply();
      s.style.display = 'none';
      toast(item ? '✅ Actualizado' : '✅ Creado');
    };
  }

  $('#qProd').oninput = (e) => {
    const q = (e.target.value || '').toLowerCase();
    paint(data.filter(p => [p.id, p.name].join(' ').toLowerCase().includes(q)));
  };

  $('#btnExport').onclick = () => {
    const rows = [['ID', 'Nombre', 'Material', 'Acabado', 'Color', 'Precio ML', 'Stock ML', 'Fondo Base', 'Lead', 'Imagen']];
    data.forEach(p => rows.push([p.id, p.name, p.material, p.finish, p.color, p.price_per_ml, p.stock_ml, p.base_depth_cm, p.lead_time_days, p.image]));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "inventario_arqura.xlsx");
    toast('✅ Exportado');
  };

  $('#btnImport').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx, .xls';
    inp.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
          if (rows.length < 2) throw new Error("Vacío");
          const [head, ...dataRows] = rows;
          const getVal = (row, key, pos) => {
            const idx = head.findIndex(h => h && h.toString().toLowerCase().includes(key.toLowerCase()));
            return row[idx !== -1 ? idx : pos];
          };
          const imported = dataRows.map(c => ({
            id: String(getVal(c, 'ID', 0) || '').trim(),
            name: String(getVal(c, 'Nombre', 1) || '').trim(),
            material: String(getVal(c, 'Material', 2) || '').trim(),
            finish: String(getVal(c, 'Acabado', 3) || '').trim(),
            color: String(getVal(c, 'Color', 4) || '').trim(),
            price_per_ml: Number(getVal(c, 'Precio', 5) || 0),
            stock_ml: Number(getVal(c, 'Stock', 6) || 0),
            base_depth_cm: Number(getVal(c, 'Fondo', 7) || 60),
            lead_time_days: Number(getVal(c, 'Lead', 8) || 0),
            image: String(getVal(c, 'Imagen', 9) || '').trim()
          })).filter(x => x.id && x.name);
          const baseOv = getEffectiveProducts();
          const map = {}; baseOv.forEach(x => map[x.id] = x); imported.forEach(x => map[x.id] = x);
          saveProductsToFirebase(Object.values(map));
          data = getEffectiveProducts(); apply(); toast('✅ Importado');
        } catch (err) { toast(`❌ Error: ${err.message}`); }
      };
      reader.readAsBinaryString(file);
    };
    inp.click();
  };

  $('#btnAdd').onclick = () => openSheet(null);
  $('#backPanel').onclick = () => go('#/admin');

  function apply() { paint(data); }
  paint(data);
}

/* ====== ADMIN: Clientes (CRM) ====== */
function renderAdminClients() {
  setViewMode('app');
  if (state.session?.role !== 'admin') { location.hash = '#/products'; return; }

  const orders = loadOrders();
  const customersMap = {};

  orders.forEach(o => {
    const id = o.identification || 'Sin ID';
    if (!customersMap[id]) {
      customersMap[id] = {
        id,
        name: o.customerName || 'Cliente',
        phone: String(o.phone || ''),
        totalOrders: 0,
        totalInvestment: 0,
        lastOrder: o.created,
        orders: []
      };
    }
    customersMap[id].totalOrders++;
    customersMap[id].totalInvestment += Number(o.total || 0);
    customersMap[id].orders.push(o.id);
    if (o.created && new Date(o.created) > new Date(customersMap[id].lastOrder)) {
      customersMap[id].lastOrder = o.created;
    }
  });

  const clients = Object.values(customersMap).sort((a, b) => b.totalInvestment - a.totalInvestment);
  const top5 = clients.slice(0, 5);
  const others = clients.slice(5);

  app.innerHTML = `
    <div class="container" style="margin:18px 0 24px">
      <div class="admin-surface">
        <div class="section-title"><h2>Directorio de Clientes</h2></div>
        <p class="section-sub">Consolidado automático basado en el historial de pedidos.</p>

        <!-- Sección Elite -->
        ${top5.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom: 20px;">
              <div style="font-size:24px;">🏆</div>
              <h3 style="margin:0; font-size:18px;">Top 5 Clientes de Mayor Impacto</h3>
            </div>
            <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
              ${top5.map(c => renderClientCard(c, true)).join('')}
            </div>
          </div>
        ` : ''}

        <div class="toolbar">
           <div style="display:flex; align-items:center; gap:12px;">
             <h3 style="margin:0; font-size:18px;">Base de Clientes</h3>
             <span class="badge tonal">${clients.length} Total</span>
           </div>
           <div style="flex:1"></div>
           <input type="text" id="qClient" class="input" placeholder="Buscar cliente o ID..." style="max-width:300px;">
           <button class="btn" id="backPanel">Volver</button>
        </div>

        <div class="grid" id="clientGrid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top:20px;">
           <!-- Pintar clientes -->
        </div>
      </div>
    </div>
  `;

  function renderClientCard(c, isElite = false) {
    return `
      <div class="client-card ${isElite ? 'elite' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div class="client-name">${c.name}</div>
          ${isElite ? '<div class="elite-badge">💎 VIP Investor</div>' : ''}
        </div>
        <div class="client-meta">CC: ${c.id} · 📱 ${c.phone}</div>
        <hr style="border:none; border-top: 1px solid var(--stroke); margin: 8px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div class="small-caps" style="font-size:10px;">Total Pedidos</div>
            <div style="font-weight:700;">${c.totalOrders}</div>
          </div>
          <div style="text-align:right;">
            <div class="small-caps" style="font-size:10px;">Inversión Total</div>
            <div style="font-weight:700; color: var(--gold-2);">$${c.totalInvestment.toLocaleString('es-CO')}</div>
          </div>
        </div>
        <div style="margin-top:8px;">
           <a href="https://wa.me/${c.phone.startsWith('57') ? c.phone : '57' + c.phone}" target="_blank" class="btn tonal small" style="width:100%;">Contactar WhatsApp</a>
        </div>
      </div>
    `;
  }

  function paint(list) {
    const grid = $('#clientGrid');
    if (!grid) return;
    if (list.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color: var(--muted);">No hay clientes registrados o que coincidan con la búsqueda.</div>';
      return;
    }
    grid.innerHTML = list.map(c => renderClientCard(c)).join('');
  }

  // Por defecto pintamos los que no están en el top 5 para evitar duplicados visuales si así se desea, 
  // o pintamos todos los filtrables. El usuario pidió que el resto se pueda filtrar.
  paint(others);

  const $qClient = $('#qClient');
  if ($qClient) {
    $qClient.oninput = (e) => {
      const q = e.target.value.toLowerCase();
      // Si busca, buscamos en todos.
      if (q) {
        paint(clients.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)));
      } else {
        paint(others);
      }
    };
  }
  $('#backPanel').onclick = () => go('#/admin');
}


function renderAdminOrders() {
  setViewMode('app');
  if (state.session?.role !== 'admin') { go('#/loginadministrador'); return; }

  let orders = seedOrders();
  const allProducts = getEffectiveProducts() || [];
  const labels = { pendiente: 'Pendiente', en_proceso: 'En proceso', despachado: 'Despachado', entregado: 'Entregado', cancelado: 'Cancelado' };

  // Material datalist
  const materialOptions = allProducts.map(p => `<option value="${p.name}"></option>`).join('');

  app.innerHTML = `
    <section class="about-hero" style="min-height: 200px; padding: 60px 0;">
      <div class="about-hero__content">
        <h1 class="about-hero__title" style="font-size: 2.5rem;">Gestión de Pedidos</h1>
        <p class="about-hero__subtitle">Control logístico y seguimiento de clientes</p>
      </div>
    </section>

    <div class="container" style="margin-bottom: 80px;">
      <section class="about-section" style="margin-bottom: 40px;">
        <div class="card order-card-form">
          <h3 class="about-section__title" style="font-size: 1.4rem; margin-bottom: 24px;">➕ Crear Nuevo Pedido</h3>
          <form id="addOrderForm" class="order-grid-form">
            <div class="form-group"><label class="small-caps">Referencia</label><input id="newId" class="input" placeholder="ARQ-XXXX" required></div>
            <div class="form-group"><label class="small-caps">Identificación</label><input id="newIdent" class="input" placeholder="Cédula / ID" required></div>
            <div class="form-group"><label class="small-caps">Cliente</label><input id="newName" class="input" placeholder="Nombre completo" required></div>
            <div class="form-group"><label class="small-caps">Móvil</label><input id="newPhone" class="input" placeholder="57..." required></div>
            <div class="form-group"><label class="small-caps">Fecha Entrega</label><input id="newDelivery" class="input" type="date" required></div>
            <div id="orderItems" class="order-items-list">
              <div class="item-row formal-row">
                <div class="form-group"><label class="small">ML</label><input class="input it-ml" type="number" step="0.01" required></div>
                <div class="form-group"><label class="small">Fondo (cm)</label><input class="input it-depth" type="number" placeholder="60" required></div>
                <div class="form-group"><label class="small">Material</label><input class="input it-mat" list="matList" placeholder="Buscar..." required></div>
                <button type="button" class="btn danger remove-it" style="display:none">✕</button>
              </div>
            </div>
            <div class="order-form-footer">
              <button type="button" class="btn tonal" id="addItemBtn">➕ Añadir Material</button>
              <div class="order-total-display">
                <label class="small-caps">Total Estimado</label>
                <input id="newTotal" class="input-total" type="text" placeholder="$0" readonly>
              </div>
            </div>
            <button class="btn primary btn-submit-order" type="submit">Generar Orden de Pedido</button>
          </form>
        </div>
      </section>

      <datalist id="matList">${materialOptions}</datalist>

      <div class="admin-surface order-list-surface">
        <div class="toolbar order-toolbar">
          <input id="qO" class="input search-input" placeholder="🔍 Buscar ID o Cliente...">
          <select id="filterStatus" class="input status-filter">
            <option value="all">Todos los estados</option>
            ${Object.keys(labels).map(k => `<option value="${k}">${labels[k]}</option>`).join('')}
          </select>
          <div class="date-filters" style="gap:8px;">
            <input type="date" id="filterDeliveryFrom" class="input" style="font-size:12px; padding: 6px 10px;">
            <input type="date" id="filterDeliveryTo" class="input" style="font-size:12px; padding: 6px 10px;">
            <button class="btn tonal small" id="clearFilters">✕</button>
          </div>
          <div style="flex:1"></div>
          <button class="btn danger" id="btnBulkDelete" style="display:none">🗑️ Eliminar Seleccionados</button>
          <button class="btn" id="btnImportOrders">📥 Importar</button>
          <button class="btn primary" id="btnExportOrders">📊 Exportar</button>
          <button class="btn" id="backToAdminHome">Volver</button>
        </div>

        <div class="table-responsive">
          <table class="table-modern">
            <thead>
              <tr>
                <th style="width:40px"><input type="checkbox" id="selectAllOrders"></th>
                <th>Referencia / Cliente</th><th>Creación</th><th>Entrega</th><th>Inversión</th><th>Estado</th><th style="width:140px">Acciones</th>
              </tr>
            </thead>
            <tbody id="ordRows"></tbody>
          </table>
        </div>
        <div id="noOrdersMsg" class="empty-state" style="display:none;"><div class="empty-icon">🏛️</div><p>No hay registros coincidentes.</p></div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div id="editOrderModal" class="modal" style="display:none">
      <div class="modal-card edit-modal">
        <h3 class="about-section__title">Edición de Pedido <span id="editOrderIdDisplay"></span></h3>
        <form id="editOrderForm" class="edit-grid-form">
          <div class="form-group"><label class="small-caps">Identificación</label><input id="editIdent" class="input" required></div>
          <div class="form-group"><label class="small-caps">Nombre Cliente</label><input id="editName" class="input" required></div>
          <div class="form-group"><label class="small-caps">Móvil</label><input id="editPhone" class="input" required></div>
          <div class="form-group"><label class="small-caps">Fecha Creación</label><input id="editDate" class="input" readonly></div>
          <div class="form-group full-width"><label class="small-caps">Fecha de entrega pactada</label><input id="editDelivery" class="input" type="date" required></div>
          <div id="editOrderItems" class="order-items-list full-width"></div>
          <div class="order-form-footer full-width">
            <button type="button" class="btn tonal" id="addEditItemBtn">➕ Material</button>
            <div class="order-total-display"><label class="small-caps">Total</label><input id="editTotal" class="input-total" type="text" readonly></div>
          </div>
          <div class="modal-actions full-width">
            <button type="button" class="btn" id="closeEditModal">Cancelar</button>
            <button type="submit" class="btn primary">Confirmar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const $rows = $('#ordRows');
  const $noOrders = $('#noOrdersMsg');

  function paint(list) {
    if (!$rows) return;
    if (!list || list.length === 0) {
      $rows.innerHTML = '';
      if ($noOrders) $noOrders.style.display = 'block';
      return;
    }
    if ($noOrders) $noOrders.style.display = 'none';

    $rows.innerHTML = list.map(o => {
      const customer = o.customerName || 'Cliente';
      const status = o.status || 'pendiente';
      const statusLabel = labels[status] || status;
      const date = o.created || '---';
      const total = Number(o.total || 0);

      return `
        <tr class="order-row">
          <td><input type="checkbox" class="order-select" data-id="${o.id}"></td>
          <td data-label="Cliente" class="cell-main-info">
            <div class="ref">${o.id || '---'}</div>
            <div class="cust">${customer}</div>
            <div class="small-caps" style="font-size:9px">CC: ${o.identification || '---'}</div>
          </td>
          <td data-label="Creación" class="small">${date.split(' ')[0]}</td>
          <td data-label="Entrega" class="cell-delivery"><div style="font-weight:600">${o.deliveryDate || '---'}</div></td>
          <td data-label="Inversión">$${total.toLocaleString('es-CO')}</td>
          <td data-label="Estado">
            <div class="status-stepper">
              ${['pendiente', 'en_proceso', 'despachado', 'entregado', 'cancelado'].map((s, idx) => {
        let active = false;
        if (status === 'cancelado') {
          active = s === 'cancelado';
        } else {
          active = ['pendiente', 'en_proceso', 'despachado', 'entregado'].indexOf(status) >= idx && s !== 'cancelado';
        }
        const isCancel = s === 'cancelado';
        return `<div class="step-dot ${active ? 'active' : ''} ${status === s ? 'current' : ''} ${isCancel ? 'dot-cancel' : ''}" 
                  data-st-update="${o.id}" data-st-val="${s}" title="${labels[s]}"></div>`;
      }).join('<div class="step-line"></div>')}
            </div>
            <div class="small-caps" style="margin-top:4px; font-size:9px; text-align:center; color: ${status === 'cancelado' ? 'var(--error)' : 'inherit'}">${statusLabel}</div>
          </td>
          <td data-label="Acciones">
            <div class="action-buttons">
              <button class="btn tonal small" data-toggle-items="${o.id}">🔍</button>
              <button class="btn tonal small" data-edit="${o.id}">✏️</button>
              <button class="btn danger small" data-del="${o.id}">🗑️</button>
            </div>
          </td>
        </tr>
        <tr id="items-${o.id}" class="items-accordion-row" style="display:none">
          <td colspan="7" style="padding:15px">
            <div style="display:flex; flex-wrap:wrap; gap:10px;">
              ${(o.items || []).map(it => `
                <div class="glass-card" style="padding:10px; border:1px solid var(--stroke); min-width:180px;">
                  <div style="font-weight:700;">${it.name}</div>
                  <div class="small">${it.ml} ML | Fondo: ${it.depth} CM</div>
                </div>
              `).join('')}
            </div>
          </td>
        </tr>`;
    }).join('');

    // Bindings
    $rows.querySelectorAll('[data-toggle-items]').forEach(btn => {
      btn.onclick = () => {
        const row = $(`#items-${btn.dataset.toggleItems}`);
        if (row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
      };
    });
    $rows.querySelectorAll('[data-st-update]').forEach(dot => {
      dot.onclick = () => {
        const list = loadOrders();
        const ord = list.find(x => x.id === dot.dataset.stUpdate);
        if (ord) { ord.status = dot.dataset.stVal; saveOrders(list); applyFilters(); }
      };
    });
    $rows.querySelectorAll('[data-del]').forEach(btn => {
      btn.onclick = () => {
        if (confirm('Eliminar?')) { orders = orders.filter(x => x.id !== btn.dataset.del); saveOrders(orders); applyFilters(); }
      };
    });
    $rows.querySelectorAll('[data-edit]').forEach(btn => {
      btn.onclick = () => openOrderEditor(btn.dataset.edit);
    });
    $rows.querySelectorAll('.order-select').forEach(ck => {
      ck.onchange = updateBulkButton;
    });
  }

  function updateBulkButton() {
    const selected = Array.from($rows.querySelectorAll('.order-select:checked'));
    const btn = $('#btnBulkDelete');
    if (btn) {
      btn.style.display = selected.length > 0 ? 'inline-block' : 'none';
      btn.textContent = `🗑️ Eliminar (${selected.length})`;
    }
  }

  $('#selectAllOrders').onchange = (e) => {
    $rows.querySelectorAll('.order-select').forEach(ck => ck.checked = e.target.checked);
    updateBulkButton();
  };

  $('#btnBulkDelete').onclick = () => {
    const selectedIds = Array.from($rows.querySelectorAll('.order-select:checked')).map(ck => ck.dataset.id);
    if (selectedIds.length === 0) return;
    if (confirm(`¿Eliminar ${selectedIds.length} pedidos seleccionados?`)) {
      orders = orders.filter(o => !selectedIds.includes(o.id));
      saveOrders(orders);
      applyFilters();
      $('#selectAllOrders').checked = false;
      updateBulkButton();
      toast('✅ Eliminados');
    }
  };

  function applyFilters() {
    const q = ($('#qO')?.value || '').toLowerCase();
    const st = $('#filterStatus')?.value || 'all';
    const from = $('#filterDeliveryFrom')?.value || '';
    const to = $('#filterDeliveryTo')?.value || '';

    const filtered = orders.filter(o => {
      const matchSearch = ((o.id || '') + (o.customerName || '')).toLowerCase().includes(q);
      const matchStatus = st === 'all' || o.status === st;
      const matchFrom = !from || (o.deliveryDate || '') >= from;
      const matchTo = !to || (o.deliveryDate || '') <= to;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });
    paint(filtered);
  }

  function openOrderEditor(id) {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    $('#editOrderModal').style.display = 'flex';
    $('#editOrderIdDisplay').textContent = o.id;
    $('#editIdent').value = o.identification || '';
    $('#editName').value = o.customerName || '';
    $('#editPhone').value = o.phone || '';
    $('#editDate').value = o.created || '';
    $('#editDelivery').value = o.deliveryDate || '';

    const $editItemsContainer = $('#editOrderItems');
    $editItemsContainer.innerHTML = '';
    const updateEditTotal = () => {
      let t = 0;
      $editItemsContainer.querySelectorAll('.item-row').forEach(row => {
        const ml = Number(row.querySelector('.it-ml').value || 0);
        const depth = Number(row.querySelector('.it-depth').value || 0);
        const p = allProducts.find(x => x.name === row.querySelector('.it-mat').value);
        if (p) t += calcLinealPricing(p, ml, depth).total;
      });
      $('#editTotal').value = `$${Math.round(t).toLocaleString('es-CO')}`;
    };

    const addEditItemRow = (it = null) => {
      const div = document.createElement('div');
      div.className = 'item-row formal-row';
      div.innerHTML = `
        <div class="form-group"><input class="input it-ml" type="number" step="0.01" value="${it ? it.ml : ''}"></div>
        <div class="form-group"><input class="input it-depth" type="number" value="${it ? it.depth : 60}"></div>
        <div class="form-group"><input class="input it-mat" list="matList" value="${it ? it.name : ''}"></div>
        <button type="button" class="btn danger remove-it">✕</button>
      `;
      $editItemsContainer.appendChild(div);
      div.querySelectorAll('.input').forEach(i => i.oninput = updateEditTotal);
      div.querySelector('.remove-it').onclick = () => { div.remove(); updateEditTotal(); };
    };

    (o.items || []).forEach(addEditItemRow);
    if (!o.items?.length) addEditItemRow();
    updateEditTotal();

    $('#addEditItemBtn').onclick = () => addEditItemRow();
    $('#closeEditModal').onclick = () => { $('#editOrderModal').style.display = 'none'; };
    $('#editOrderForm').onsubmit = (e) => {
      e.preventDefault();
      o.identification = $('#editIdent').value;
      o.customerName = $('#editName').value;
      o.phone = $('#editPhone').value;
      o.deliveryDate = $('#editDelivery').value;
      const items = [];
      $editItemsContainer.querySelectorAll('.item-row').forEach(row => {
        const ml = Number(row.querySelector('.it-ml').value || 0);
        const d = Number(row.querySelector('.it-depth').value || 0);
        const n = row.querySelector('.it-mat').value;
        const p = allProducts.find(x => x.name === n);
        if (p) items.push({ id: p.id, name: p.name, ml, depth: d, price: p.price_per_ml });
      });
      o.items = items;
      o.total = Number($('#editTotal').value.replace(/\D/g, ''));
      saveOrders(orders);
      applyFilters();
      $('#editOrderModal').style.display = 'none';
      toast('✅ Guardado');
    };
  }

  function addItemRow() {
    const div = document.createElement('div');
    div.className = 'item-row formal-row';
    div.innerHTML = `
      <div class="form-group"><input class="input it-ml" type="number" step="0.01" placeholder="ML"></div>
      <div class="form-group"><input class="input it-depth" type="number" value="60"></div>
      <div class="form-group"><input class="input it-mat" list="matList" placeholder="Material"></div>
      <button type="button" class="btn danger remove-it">✕</button>
    `;
    $('#orderItems').appendChild(div);
    div.querySelectorAll('.input').forEach(i => i.oninput = updateAutoTotal);
    div.querySelector('.remove-it').onclick = () => { div.remove(); updateAutoTotal(); };
  }

  function updateAutoTotal() {
    let t = 0;
    document.querySelectorAll('#orderItems .item-row').forEach(row => {
      const ml = Number(row.querySelector('.it-ml').value || 0);
      const d = Number(row.querySelector('.it-depth').value || 0);
      const n = row.querySelector('.it-mat').value;
      const p = allProducts.find(x => x.name === n);
      if (p) t += calcLinealPricing(p, ml, d).total;
    });
    $('#newTotal').value = `$${Math.round(t).toLocaleString('es-CO')}`;
  }

  // Handlers
  $('#qO').oninput = applyFilters;
  $('#filterStatus').onchange = applyFilters;
  $('#filterDeliveryFrom').onchange = applyFilters;
  $('#filterDeliveryTo').onchange = applyFilters;
  $('#clearFilters').onclick = () => { $('#qO').value = ''; $('#filterStatus').value = 'all'; $('#filterDeliveryFrom').value = ''; $('#filterDeliveryTo').value = ''; applyFilters(); };
  $('#addItemBtn').onclick = addItemRow;
  $('#backToAdminHome').onclick = () => go('#/admin');
  $('#btnExportOrders').onclick = () => {
    const ws = XLSX.utils.json_to_sheet(orders.map(o => ({ ID: o.id, Cliente: o.customerName, Total: o.total, Estado: o.status })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
    XLSX.writeFile(wb, "Pedidos_Arqura.xlsx");
  };

  $('#btnImportOrders').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx, .xls, .csv';
    inp.onchange = (e) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const wb = XLSX.read(evt.target.result, { type: 'binary' });
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
          const [head, ...data] = rows;
          const getV = (r, k, p) => {
            const idx = head.findIndex(h => h && h.toString().toLowerCase().trim().includes(k.toLowerCase()));
            return r[idx !== -1 ? idx : p];
          };

          const imported = data.map(r => {
            const id = String(getV(r, 'ID', 0) || '').trim();
            const cName = String(getV(r, 'Cliente', 1) || '').trim();
            if (!id || !cName) return null;

            const matsRaw = String(getV(r, 'Materiales', 6) || '').trim();
            const items = matsRaw.split(';').map(m => {
              const parts = m.split(':');
              if (parts.length < 2) return null;
              const n = parts[0];
              const d = parts[1];
              const [ml, dp] = d.split(',');
              const p = allProducts.find(x => slug(x.name) === slug(n.trim()));
              return p ? { id: p.id, name: p.name, ml: Number(ml), depth: Number(dp), price: p.price_per_ml } : null;
            }).filter(x => x);

            return {
              id,
              identification: String(getV(r, 'Cédula', 2) || ''),
              customerName: cName,
              phone: String(getV(r, 'Móvil', 3) || ''),
              deliveryDate: String(getV(r, 'Entrega', 4) || ''),
              total: Number(getV(r, 'Total', 5) || 0),
              status: 'pendiente',
              created: getColombiaTime(),
              items,
              timeline: [{ step: 'Importado', at: getColombiaTime() }]
            };
          }).filter(x => x);

          const base = loadOrders();
          const map = {};
          base.forEach(o => map[o.id] = o);
          imported.forEach(o => map[o.id] = o);

          saveOrders(Object.values(map));
          orders = loadOrders();
          applyFilters();
          toast(`✅ ${imported.length} Pedidos importados`);
        } catch (err) {
          console.error(err);
          toast('❌ Error al importar');
        }
      };
      reader.readAsBinaryString(e.target.files[0]);
    };
    inp.click();
  };

  $('#addOrderForm').onsubmit = (e) => {
    e.preventDefault();
    const id = $('#newId').value.trim();
    if (orders.some(o => o.id === id)) { toast('❌ ID repetido'); return; }
    const items = [];
    document.querySelectorAll('#orderItems .item-row').forEach(row => {
      const ml = Number(row.querySelector('.it-ml').value || 0);
      const d = Number(row.querySelector('.it-depth').value || 0);
      const p = allProducts.find(x => x.name === row.querySelector('.it-mat').value);
      if (p) items.push({ id: p.id, name: p.name, ml, depth: d, price: p.price_per_ml });
    });
    orders.push({ id, identification: $('#newIdent').value, customerName: $('#newName').value, phone: $('#newPhone').value, deliveryDate: $('#newDelivery').value, status: 'pendiente', created: getColombiaTime(), total: Number($('#newTotal').value.replace(/\D/g, '')), items });
    saveOrders(orders); applyFilters(); $('#addOrderForm').reset(); $('#orderItems').innerHTML = ''; addItemRow(); toast('✅ Creado');
  };

  paint(orders);
}

function renderLogin() {
  setViewMode('auth');
  renderWhatsAppFab('Hola SophIA, soy un administrador.');
  app.innerHTML = `
    <section class="login-page" style="display: flex; align-items: center; justify-content: center; min-height: 80vh;">
      <div class="login-card" style="box-shadow: var(--shadow-lg); background: white; border: 1px solid var(--stroke);">
        <div class="brand-inline"><img src="assets/logo_arqura.jpg" alt="Logo" /></div>
        <h2 style="margin:14px 0 6px; text-align: center;">Acceso Privado</h2>
        <p class="small" style="text-align: center; margin-bottom: 24px;">Ingresa tus credenciales para continuar.</p>
        <form id="loginForm">
          <div class="row-login">
            <input id="loginEmail" type="email" placeholder="Email" required class="input" />
            <input id="loginPass" type="password" placeholder="Contraseña" required class="input" style="margin-top:10px" />
          </div>
          <button class="btn primary" type="submit" style="width:100%; margin-top:20px">Ingresar</button>
        </form>
      </div>
    </section>`;
  $('#loginForm').onsubmit = (e) => { e.preventDefault(); doLogin(); };
}

function doLogin() {
  const email = $('#loginEmail').value.trim();
  const pass = $('#loginPass').value.trim();
  const s = auth.login(email, pass);
  if (!s) { toast('❌ Credenciales inválidas'); return; }
  state.session = s;
  toast(`✅ Bienvenido, ${s.name}`);
  renderNav();
  location.hash = s.role === 'admin' ? '#/admin' : '#/home';
}

(async () => {
  ensureMarbleBG();
  // Esperar un momento a que Firebase conecte y traiga los productos cacheados
  setTimeout(async () => {
    await seedProducts();
    handleRouting();
  }, 500);
})();

function renderClientLanding() {
  setViewMode('app');
  const S = SettingsStore.load();
  const slides = S.carousel || [];

  app.innerHTML = `
    <!-- Carrusel Minimalista Premium -->
    <div class="container" style="margin-top: 40px; margin-bottom: 40px;">
      <div style="position: relative; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 60px rgba(176,141,87,0.1); border: 1px solid rgba(176,141,87,0.08);">
        
        <!-- Contenedor del Carrusel -->
        <div class="hero-carousel" id="heroCarousel" style="position: relative; height: 520px;">
          ${slides.map((s, idx) => `
            <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background-image:url('${s.img}'); background-size: cover; background-position: center;">
              <div style="position: absolute; bottom: 40px; left: 40px; z-index: 5; max-width: 500px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                  <div style="width: 32px; height: 2px; background: var(--gold);"></div>
                  <span class="small" style="text-transform: uppercase; letter-spacing: 0.3em; color: #fff; font-weight: 700;">${s.subtitle || 'Arqura'}</span>
                </div>
                <h2 style="font-size: 42px; font-weight: 800; color: #fff; margin: 0 0 12px; line-height: 1.1; letter-spacing: -0.03em;">
                  ${s.title || 'Superficies Premium'}
                </h2>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Indicadores -->
        <div style="position: absolute; bottom: 40px; right: 40px; z-index: 5; display: flex; gap: 8px;">
          ${slides.map((_, idx) => `
            <div class="carousel-dot ${idx === 0 ? 'active' : ''}" data-idx="${idx}" style="width: 24px; height: 3px; background: ${idx === 0 ? 'var(--gold)' : 'rgba(0,0,0,0.2)'}; border-radius: 2px; transition: all 0.4s ease; cursor: pointer;"></div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Botones de Acción -->
    <div class="container" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 100px;">
      <a href="#/products" class="btn primary" style="padding: 20px 52px; font-size: 17px; border-radius: 18px; box-shadow: 0 12px 30px rgba(176,141,87,0.2);">
        Iniciar Proyecto
      </a>
      <a href="#/quotation" class="btn tonal" style="padding: 20px 52px; font-size: 17px; border-radius: 18px; border: 1px solid rgba(176,141,87,0.15);">
        Ver Cotizador
      </a>
    </div>

    <!-- 2. VALORES -->
    <div class="container" style="margin-bottom: 120px;">
      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
        <div class="about-feature glass-card animate-fade-in" style="padding: 56px 40px; text-align: left;">
          <div style="font-size: 44px; margin-bottom: 24px;">💎</div>
          <h3 class="about-feature__title" style="font-size: 24px; margin-bottom: 16px;">Curaduría Elite</h3>
          <p class="about-feature__desc" style="font-size: 16px; line-height: 1.6;">Seleccionamos solo el 1% de las canteras más exclusivas del mundo por su pureza y veteado único.</p>
        </div>
        <div class="about-feature glass-card animate-fade-in animate-delay-1" style="padding: 56px 40px; text-align: left;">
          <div style="font-size: 44px; margin-bottom: 24px;">📐</div>
          <h3 class="about-feature__title" style="font-size: 24px; margin-bottom: 16px;">Precisión Quirúrgica</h3>
          <p class="about-feature__desc" style="font-size: 16px; line-height: 1.6;">Corte y pulido con tecnología italiana que garantiza juntas invisibles y acabados de espejo.</p>
        </div>
        <div class="about-feature glass-card animate-fade-in animate-delay-2" style="padding: 56px 40px; text-align: left;">
          <div style="font-size: 44px; margin-bottom: 24px;">⌛</div>
          <h3 class="about-feature__title" style="font-size: 24px; margin-bottom: 16px;">Trascendencia</h3>
          <p class="about-feature__desc" style="font-size: 16px; line-height: 1.6;">Nuestras superficies no solo decoran, sino que aumentan el valor intrínseco de cada propiedad.</p>
        </div>
      </div>
    </div>

    <!-- 4. MAPA Y PRESENCIA -->
    <div class="container" style="padding: 120px 0;">
      <div class="about-text-center">
        <h2 class="about-section__title">Nuestra Sede de Diseño</h2>
        <p class="about-section__text" style="margin-bottom: 64px;">Un espacio pensado para que la inspiración fluya entre bloques de mármol y café.</p>
      </div>
      <div class="grid contact-grid" style="gap: 48px; margin-top: 24px;">
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <div class="glass-card" style="padding: 32px; border: 1px solid rgba(176,141,87,0.1);">
            <h3 style="margin-top: 0; color: var(--gold-2);">Showroom Manizales</h3>
            <p class="small" style="line-height: 1.6; font-size: 15px;">Epicentro de elegancia donde artesanos y arquitectos dan vida a proyectos iconográficos.</p>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid rgba(0,0,0,0.05);">
            <div style="display: grid; gap: 12px;">
              <a href="https://wa.me/${getContactWhatsApp()}" target="_blank" class="btn tonal small" style="justify-content: flex-start; gap: 12px;">
                <span>💬</span> WhatsApp Directo
              </a>
              <a href="mailto:${getContactEmail()}" class="btn tonal small" style="justify-content: flex-start; gap: 12px;">
                <span>✉️</span> ${getContactEmail()}
              </a>
            </div>
          </div>
        </div>
        <div style="border-radius: 40px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.08); height: 500px; border: 1px solid rgba(176,141,87,0.12);">
          <iframe src="${getMapsSrc()}" width="100%" height="100%" style="border:0;" loading="lazy"></iframe>
        </div>
      </div>
    </div>
  `;
  startHeroCarousel();
}

function startHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  let index = 0;

  if (!slides.length) return;

  // Limpiar cualquier intervalo previo para evitar aceleraciones raros
  if (window.heroTimer) clearInterval(window.heroTimer);

  window.heroTimer = setInterval(() => {
    // Validar que seguimos en la vista con carrusel
    const currentSlides = document.querySelectorAll('.hero-slide');
    const currentDots = document.querySelectorAll('.carousel-dot');

    if (!currentSlides.length) {
      clearInterval(window.heroTimer);
      return;
    }

    // Remover activo
    currentSlides[index].classList.remove('active');
    if (currentDots[index]) currentDots[index].classList.remove('active');

    index = (index + 1) % currentSlides.length;

    // Añadir activo
    currentSlides[index].classList.add('active');
    if (currentDots[index]) currentDots[index].classList.add('active');
  }, 6000);
}

function pickBestProductAI() {
  const all = getEffectiveProducts().filter(p => !p.disabled);
  if (!all.length) return null;

  const cart = state.cart || [];
  const priority = state.aiPriority || 'balanced';

  // 1. Filtrar los que ya están en el carrito para no repetir sugerencias
  const pool = all.filter(p => !cart.some(it => it.id === p.id));
  if (!pool.length) return null;

  // 2. Calcular popularidad basada en pedidos históricos
  const orders = loadOrders();
  const productPopularity = {};
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      productPopularity[item.name] = (productPopularity[item.name] || 0) + 1;
    });
  });
  const maxPopularity = Math.max(...Object.values(productPopularity), 1);

  // 3. Normalización de valores para scoring (Min-Max scaling)
  const stats = {
    minPrice: Math.min(...pool.map(p => Number(p.price_per_ml))),
    maxPrice: Math.max(...pool.map(p => Number(p.price_per_ml))),
    minStock: Math.min(...pool.map(p => Number(p.stock_ml))),
    maxStock: Math.max(...pool.map(p => Number(p.stock_ml))),
    minLead: Math.min(...pool.map(p => Number(p.lead_time_days))),
    maxLead: Math.max(...pool.map(p => Number(p.lead_time_days))),
  };

  // 4. Evaluar cada producto
  const ranked = pool.map(p => {
    // Puntajes individuales (0 a 1, donde 1 es mejor)

    // Precio: a menor precio, mayor puntaje
    const priceRange = stats.maxPrice - stats.minPrice;
    const sPrice = priceRange === 0 ? 1 : 1 - ((Number(p.price_per_ml) - stats.minPrice) / priceRange);

    // Stock: a mayor stock, mayor puntaje + penalización por stock bajo
    const stockRange = stats.maxStock - stats.minStock;
    let sStock = stockRange === 0 ? 1 : (Number(p.stock_ml) - stats.minStock) / stockRange;
    // Penalización severa si stock < 10 ML
    if (Number(p.stock_ml) < 10) {
      sStock *= 0.3; // Reduce el score a 30% del original
    }

    // Tiempo: a menor tiempo, mayor puntaje
    const leadRange = stats.maxLead - stats.minLead;
    const sLead = leadRange === 0 ? 1 : 1 - ((Number(p.lead_time_days) - stats.minLead) / leadRange);

    // Popularidad: basada en pedidos históricos
    const popularity = productPopularity[p.name] || 0;
    const sPopularity = popularity / maxPopularity;

    // Afinidad: similitud con el carrito actual (CORREGIDA)
    let sAffinity = 0;
    if (cart.length > 0) {
      let totalMatches = 0;
      cart.forEach(it => {
        let itemMatch = 0;
        if (it.material === p.material) itemMatch += 0.5;
        if (it.color === p.color) itemMatch += 0.3;
        if (it.finish === p.finish) itemMatch += 0.2;
        totalMatches += itemMatch;
      });
      // Promedio de coincidencias (no suma acumulativa)
      sAffinity = Math.min(1, totalMatches / cart.length);
    } else {
      sAffinity = 0.5; // Neutral si el carrito está vacío
    }

    // 5. Calcular puntaje final según prioridad
    let totalScore = 0;
    const weights = {
      balanced: { price: 0.20, stock: 0.20, lead: 0.20, affinity: 0.20, popularity: 0.20 },
      cheapest: { price: 0.60, stock: 0.10, lead: 0.10, affinity: 0.10, popularity: 0.10 },
      fastest: { price: 0.10, stock: 0.10, lead: 0.60, affinity: 0.10, popularity: 0.10 },
      stock: { price: 0.10, stock: 0.60, lead: 0.10, affinity: 0.10, popularity: 0.10 },
      match: { price: 0.10, stock: 0.10, lead: 0.10, affinity: 0.50, popularity: 0.20 }
    }[priority] || { price: 0.20, stock: 0.20, lead: 0.20, affinity: 0.20, popularity: 0.20 };

    totalScore = (sPrice * weights.price) +
      (sStock * weights.stock) +
      (sLead * weights.lead) +
      (sAffinity * weights.affinity) +
      (sPopularity * weights.popularity);

    return {
      ...p,
      _score: totalScore,
      _affinity: sAffinity,
      _popularity: sPopularity,
      _priority: priority
    };
  });

  // Sort descendente por score
  ranked.sort((a, b) => b._score - a._score);

  // 6. Factor de exploración: 20% de probabilidad de sugerir algo diferente
  if (cart.length > 0 && Math.random() < 0.20) {
    // Buscar productos con material diferente al del carrito
    const cartMaterials = [...new Set(cart.map(it => it.material))];
    const diverse = ranked.filter(p => !cartMaterials.includes(p.material));
    if (diverse.length > 0) {
      // Devolver uno de los top 3 diversos
      const topDiverse = diverse.slice(0, 3);
      return topDiverse[Math.floor(Math.random() * topDiverse.length)];
    }
  }

  // 7. Devolver el mejor (con un pequeño factor aleatorio entre los top 2 para variedad si el puntaje es similar)
  if (ranked.length > 1 && ranked[0]._score - ranked[1]._score < 0.05) {
    return Math.random() > 0.5 ? ranked[0] : ranked[1];
  }

  return ranked[0];
}





// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    syncData();
});
