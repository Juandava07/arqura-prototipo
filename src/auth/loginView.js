import { $ } from "../core/helpers.js";
import { toast } from "../ui/toast.js";
import { auth } from "./authStore.js";

export function renderLogin(app, state, renderNav, renderHome, renderAdminHome){
  app.innerHTML = `
    <section class="login-page">
      <div class="login-split">
        <div class="login-left"></div>
        <div class="login-right">
          <div>
            <div class="login-card">
              <div class="brand-inline" style="justify-content:center">
                <img src="assets/logo_arqura.jpg" alt="Arqura Logo"/>
              </div>

              <h2>Iniciar Sesión</h2>
              <p>Ingresa tus credenciales para acceder al portal inteligente.</p>

              <form id="loginForm">
                <div class="row-login">
                  <input id="loginEmail" type="email" placeholder="Correo" required />
                  <input id="loginPass" type="password" placeholder="Contraseña" required />
                </div>
                <div class="login-actions">
                  <button class="btn primary" type="submit">Ingresar</button>
                  <button class="btn ghost" type="button" id="forgotBtn">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>

              <p class="small" style="margin-top:14px">
                Tip: usa <strong>admin@arqura.co / admin123</strong> o
                <strong>cliente@arqura.co / cliente123</strong>
              </p>
            </div>

            <div class="fab-wrap" style="position:static;display:flex;gap:10px;justify-content:center;margin-top:14px">
              <button class="fab admin"  id="fabAdmin">Admin demo</button>
              <button class="fab client" id="fabClient">Cliente demo</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  $('#forgotBtn').onclick = () =>
    toast('Función demo: contacta al administrador.');

  $('#fabAdmin').onclick = () => {
    $('#loginEmail').value = 'admin@arqura.co';
    $('#loginPass').value  = 'admin123';
    doLogin();
  };

  $('#fabClient').onclick = () => {
    $('#loginEmail').value = 'cliente@arqura.co';
    $('#loginPass').value  = 'cliente123';
    doLogin();
  };

  $('#loginForm').onsubmit = e => {
    e.preventDefault();
    doLogin();
  };

  function doLogin(){
    const email = $('#loginEmail').value.trim();
    const pass  = $('#loginPass').value.trim();
    const session = auth.login(email, pass);
    if(!session){
      toast('Credenciales inválidas');
      return;
    }
    state.session = session;
    toast(`Bienvenido, ${session.name}`);
    renderNav();
    if(session.role === 'admin'){
      renderAdminHome();
    } else {
      renderHome();
    }
  }
}
