/* auth.js — tremolo.mx
   Inyecta modal de login/registro y botón de usuario en el nav.
   Se carga en todas las páginas. No toca lógica ni contenido existente.
*/
(function () {
  const SUPA_URL = 'https://osgbjknlajdxlbfeueqc.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZ2Jqa25sYWpkeGxiZmV1ZXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjcyMTYsImV4cCI6MjA5MzQ0MzIxNn0.6cDM7Xpf7ZkdwH88uBPPP3xH0GZGqXiEJBdnK7pSDW4';

  if (!window.supabase) { console.warn('auth.js: Supabase SDK no cargado'); return; }
  const sb = window.supabase.createClient(SUPA_URL, SUPA_KEY);

  let _session = null;

  // ── ESTILOS ──────────────────────────────────────────────────────────────────
  const CSS = `
    .tm-user-wrap { position: relative; margin-left: auto; flex-shrink: 0; }

    .tm-auth-btn {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; font-weight: 500; letter-spacing: .04em;
      padding: 6px 14px; border-radius: 4px;
      border: 1px solid currentColor;
      background: transparent; cursor: pointer;
      transition: color .2s, border-color .2s;
      white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;
    }
    nav .tm-auth-btn        { color: var(--ink4, #8a7a64); border-color: var(--paper4, #c8b99f); }
    nav .tm-auth-btn:hover  { color: var(--copper, #a85a1e); border-color: var(--copper, #a85a1e); }
    nav .tm-auth-btn.active { color: var(--copper, #a85a1e); border-color: var(--copper, #a85a1e); }
    header .tm-auth-btn        { color: var(--text2, #8a7a6e); border-color: var(--hl, #3a3026); }
    header .tm-auth-btn:hover  { color: var(--accent, #d68838); border-color: var(--accent, #d68838); }
    header .tm-auth-btn.active { color: var(--accent, #d68838); border-color: var(--accent, #d68838); }

    .tm-user-drop {
      position: absolute; top: calc(100% + 8px); right: 0;
      background: #1c1812; border: 1px solid #3a3026;
      border-radius: 6px; padding: 4px 0; min-width: 190px;
      z-index: 1001; display: none;
      box-shadow: 0 8px 28px rgba(0,0,0,.35);
    }
    .tm-user-drop.open { display: block; }
    .tm-drop-email {
      padding: 10px 14px 8px;
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      color: #8a7a64; letter-spacing: .04em;
      border-bottom: 1px solid #3a3026;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .tm-drop-plan {
      padding: 4px 14px 8px;
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      color: #d68838; letter-spacing: .06em; text-transform: uppercase;
      border-bottom: 1px solid #3a3026;
    }
    .tm-drop-item {
      padding: 9px 14px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      color: #f4ece0; cursor: pointer; letter-spacing: .02em;
    }
    .tm-drop-item:hover { background: #26201a; }
    .tm-drop-item.danger { color: #e86060; }

    /* ── OVERLAY ── */
    .tm-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(10,8,5,.78); backdrop-filter: blur(7px);
      display: flex; align-items: center; justify-content: center;
      opacity: 0; pointer-events: none; transition: opacity .2s;
    }
    .tm-overlay.open { opacity: 1; pointer-events: all; }

    /* ── MODAL ── */
    .tm-modal {
      background: #1c1812; border: 1px solid #3a3026; border-radius: 8px;
      padding: 36px 32px 28px; width: 100%; max-width: 400px; margin: 16px;
      position: relative;
      transform: translateY(12px); transition: transform .22s;
    }
    .tm-overlay.open .tm-modal { transform: translateY(0); }

    .tm-modal-logo {
      font-family: 'Marcellus', Georgia, serif; font-size: 19px; color: #f4ece0;
      display: inline-flex; align-items: baseline; gap: 2px; margin-bottom: 24px;
    }
    .tm-modal-logo .mx {
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      color: #8a7a64; margin-left: 2px;
    }

    .tm-tabs {
      display: flex; border-bottom: 1px solid #3a3026; margin-bottom: 22px;
    }
    .tm-tab {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      letter-spacing: .08em; text-transform: uppercase;
      padding: 6px 14px 9px; cursor: pointer;
      color: #8a7a64; border: none; background: none;
      border-bottom: 2px solid transparent; margin-bottom: -1px;
      transition: color .15s, border-color .15s;
    }
    .tm-tab.active { color: #d68838; border-bottom-color: #d68838; }

    .tm-msg {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      padding: 9px 12px; border-radius: 4px; margin-bottom: 14px; display: none;
      letter-spacing: .02em; line-height: 1.5;
    }
    .tm-msg.error   { display: block; background: rgba(220,60,60,.1);   color: #e86060; border: 1px solid rgba(220,60,60,.2); }
    .tm-msg.success { display: block; background: rgba(76,175,80,.1);   color: #4caf50; border: 1px solid rgba(76,175,80,.2); }

    .tm-field { margin-bottom: 13px; }
    .tm-label {
      display: block; font-family: 'JetBrains Mono', monospace;
      font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
      color: #8a7a64; margin-bottom: 5px;
    }
    .tm-input {
      width: 100%; background: #26201a; border: 1px solid #3a3026;
      border-radius: 5px; padding: 9px 12px;
      font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #f4ece0;
      outline: none; transition: border-color .15s; box-sizing: border-box;
    }
    .tm-input:focus { border-color: #d68838; }
    .tm-input::placeholder { color: #3a3026; }

    .tm-submit {
      width: 100%; margin-top: 6px; padding: 11px;
      background: #d68838; color: #13100c; border: none; border-radius: 5px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase;
      cursor: pointer; transition: background .2s;
    }
    .tm-submit:hover    { background: #eaa55a; }
    .tm-submit:disabled { background: #3a3026; color: #8a7a64; cursor: default; }

    .tm-close {
      position: absolute; top: 14px; right: 14px;
      background: none; border: none; color: #8a7a64;
      font-size: 16px; cursor: pointer; padding: 4px 8px; line-height: 1;
    }
    .tm-close:hover { color: #f4ece0; }
  `;

  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── MODAL ────────────────────────────────────────────────────────────────────
  function buildModal() {
    const el = document.createElement('div');
    el.className = 'tm-overlay';
    el.id = 'tm-overlay';
    el.innerHTML = `
      <div class="tm-modal" role="dialog" aria-modal="true">
        <button class="tm-close" id="tm-close" aria-label="Cerrar">✕</button>
        <div class="tm-modal-logo">
          tr<svg width="11" height="11" viewBox="0 0 22 22" style="display:inline-block;vertical-align:middle;margin:0 1px 2px 1px"><path d="M2 11 Q 5.5 4, 9 11 T 16 11 T 20 11" stroke="#d68838" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>molo<span class="mx">.mx</span>
        </div>
        <div class="tm-tabs">
          <button class="tm-tab active" data-tab="login">Entrar</button>
          <button class="tm-tab" data-tab="signup">Registrarse</button>
        </div>
        <div id="tm-msg" class="tm-msg"></div>
        <form id="tm-form" novalidate>
          <div class="tm-field">
            <label class="tm-label" for="tm-email">Email</label>
            <input class="tm-input" id="tm-email" type="email" placeholder="tu@email.com" autocomplete="email" required/>
          </div>
          <div class="tm-field">
            <label class="tm-label" for="tm-pass">Contraseña</label>
            <input class="tm-input" id="tm-pass" type="password" placeholder="••••••••" autocomplete="current-password" minlength="6" required/>
          </div>
          <button class="tm-submit" id="tm-submit" type="submit">Entrar</button>
        </form>
      </div>`;
    document.body.appendChild(el);

    let tab = 'login';

    el.addEventListener('click', e => { if (e.target === el) closeModal(); });
    document.getElementById('tm-close').addEventListener('click', closeModal);

    el.querySelectorAll('.tm-tab').forEach(t => {
      t.addEventListener('click', function () {
        tab = this.dataset.tab;
        el.querySelectorAll('.tm-tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tm-submit').textContent = tab === 'login' ? 'Entrar' : 'Crear cuenta';
        document.getElementById('tm-pass').autocomplete = tab === 'login' ? 'current-password' : 'new-password';
        clearMsg();
      });
    });

    document.getElementById('tm-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('tm-email').value.trim();
      const pass  = document.getElementById('tm-pass').value;
      const btn   = document.getElementById('tm-submit');
      btn.disabled = true; btn.textContent = '…'; clearMsg();
      try {
        if (tab === 'login') {
          const { error } = await sb.auth.signInWithPassword({ email, password: pass });
          if (error) throw error;
          closeModal();
        } else {
          const { error } = await sb.auth.signUp({ email, password: pass });
          if (error) throw error;
          showMsg('Revisa tu email para confirmar la cuenta.', 'success');
        }
      } catch (err) {
        showMsg(err.message || 'Ocurrió un error.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = tab === 'login' ? 'Entrar' : 'Crear cuenta';
      }
    });
  }

  function openModal()  { document.getElementById('tm-overlay')?.classList.add('open'); }
  function closeModal() { document.getElementById('tm-overlay')?.classList.remove('open'); }
  function showMsg(txt, type) {
    const el = document.getElementById('tm-msg');
    if (!el) return; el.textContent = txt; el.className = 'tm-msg ' + type;
  }
  function clearMsg() {
    const el = document.getElementById('tm-msg');
    if (el) { el.textContent = ''; el.className = 'tm-msg'; }
  }

  // ── BOTÓN EN NAV ─────────────────────────────────────────────────────────────
  function buildNavButton() {
    const nav = document.querySelector('nav') || document.querySelector('header');
    if (!nav) return;

    // Quitar CTA estático si existe
    nav.querySelector('.nav-cta')?.remove();

    const wrap = document.createElement('div');
    wrap.className = 'tm-user-wrap';
    wrap.innerHTML = `
      <button class="tm-auth-btn" id="tm-nav-btn">Entrar</button>
      <div class="tm-user-drop" id="tm-user-drop">
        <div class="tm-drop-email" id="tm-drop-email"></div>
        <div class="tm-drop-plan"  id="tm-drop-plan">Plan free</div>
        <div class="tm-drop-item danger" id="tm-logout">Cerrar sesión</div>
      </div>`;
    nav.appendChild(wrap);

    document.getElementById('tm-nav-btn').addEventListener('click', function () {
      if (_session) {
        document.getElementById('tm-user-drop').classList.toggle('open');
      } else {
        openModal();
      }
    });

    document.getElementById('tm-logout').addEventListener('click', async function () {
      await sb.auth.signOut();
      document.getElementById('tm-user-drop').classList.remove('open');
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) {
        document.getElementById('tm-user-drop')?.classList.remove('open');
      }
    });
  }

  function updateNav(session) {
    const btn   = document.getElementById('tm-nav-btn');
    const email = document.getElementById('tm-drop-email');
    const plan  = document.getElementById('tm-drop-plan');
    if (!btn) return;
    if (session) {
      const addr = session.user.email || '';
      btn.textContent = addr[0]?.toUpperCase() || '●';
      btn.classList.add('active');
      btn.title = addr;
      if (email) email.textContent = addr;
      // Fetch plan from profiles
      sb.from('profiles').select('plan').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (plan && data?.plan) plan.textContent = 'Plan ' + data.plan;
        });
    } else {
      btn.textContent = 'Entrar';
      btn.classList.remove('active');
      btn.title = '';
    }
  }

  // ── ACTIVIDAD ────────────────────────────────────────────────────────────────
  async function trackView(session) {
    if (!session) return;
    try {
      await sb.from('activity').insert({
        user_id: session.user.id,
        page:    window.location.pathname,
        event:   'page_view',
      });
    } catch (_) {}
  }

  // ── PERFIL ───────────────────────────────────────────────────────────────────
  async function ensureProfile(session) {
    if (!session) return;
    try {
      await sb.from('profiles').upsert(
        { id: session.user.id, email: session.user.email },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    } catch (_) {}
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async function () {
    injectStyles();
    buildModal();
    buildNavButton();

    const { data: { session } } = await sb.auth.getSession();
    _session = session;
    updateNav(session);
    if (session) {
      ensureProfile(session);
      trackView(session);
    }

    sb.auth.onAuthStateChange(async function (event, session) {
      _session = session;
      updateNav(session);
      if (session) {
        await ensureProfile(session);
        if (event === 'SIGNED_IN') trackView(session);
      }
    });
  });

})();
