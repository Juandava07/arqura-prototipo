import { ensureMarbleBG } from "./core/helpers.js";
import { state } from "./core/state.js";
import { renderLogin } from "./auth/loginView.js";

// ⚠️ Estas funciones siguen estando donde estaban por ahora
// renderNav, renderHome, renderAdminHome, loadProducts

(async ()=>{
  ensureMarbleBG();
  renderNav();
  await loadProducts();

  if(state.session){
    if(state.session.role === 'admin'){
      renderAdminHome();
    } else {
      renderHome();
    }
  } else {
    renderLogin(app, state, renderNav, renderHome, renderAdminHome);
  }
})();


(async ()=>{
  ensureMarbleBG();
  applyThemeFromPrefs();
  renderNav();
  await loadProducts();

  // ✅ Si hay sesión admin, entra al panel
  if(state.session?.role === 'admin'){
    location.hash = '#/admin';
    renderAdminHome();
    return;
  }

  // ✅ Si NO hay sesión, entra como cliente público
  location.hash = '#/';
  renderHome();
})();
