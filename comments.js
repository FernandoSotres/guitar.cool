/* comments.js — tremolo.mx
   Sistema de comentarios para páginas de compositores.

   ──────────────────────────────────────────────────────────────
   SETUP SQL — ejecutar UNA VEZ en Supabase > SQL Editor:

   CREATE TABLE IF NOT EXISTS public.comments (
     id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
     page_slug    text NOT NULL,
     user_name    text NOT NULL CHECK (char_length(user_name) BETWEEN 1 AND 80),
     comment_text text NOT NULL CHECK (char_length(comment_text) BETWEEN 10 AND 2000),
     created_at   timestamptz DEFAULT now() NOT NULL
   );

   ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "comments_read"   ON public.comments FOR SELECT USING (true);
   CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (true);
   CREATE POLICY "comments_delete" ON public.comments FOR DELETE
     USING ((auth.jwt() ->> 'email') = 'fsotresdlt@gmail.com');
   ──────────────────────────────────────────────────────────────
*/

(function () {
  'use strict';

  const SUPA_URL = 'https://osgbjknlajdxlbfeueqc.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZ2Jqa25sYWpkeGxiZmV1ZXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjcyMTYsImV4cCI6MjA5MzQ0MzIxNn0.6cDM7Xpf7ZkdwH88uBPPP3xH0GZGqXiEJBdnK7pSDW4';

  const section = document.getElementById('tm-comments-section');
  if (!section) return;

  const slug = section.dataset.slug || window.location.pathname.split('/').pop();

  /* ── ESTILOS ─────────────────────────────────────────────────────────────── */
  const css = `
    /* Indicador en nav */
    .nav-comments-anchor {
      display: flex; align-items: center; gap: 5px;
      padding: 0 14px; height: 56px;
      font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase;
      text-decoration: none; white-space: nowrap; flex-shrink: 0;
      color: #2e7d52; font-family: 'JetBrains Mono', monospace;
      border-bottom: 2px solid transparent;
      transition: color .2s, border-color .2s;
    }
    .nav-comments-anchor:hover { color: #1a5c38; border-bottom-color: #2e7d52; }
    .nav-comments-anchor .nca-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #2e7d52; display: inline-block; flex-shrink: 0;
    }

    /* Separador antes de sección */
    .tm-comments-sep {
      height: 1px; background: var(--paper3, #e8e0d4);
      margin: 0 48px;
    }

    /* Sección completa */
    .tm-comments-wrap {
      max-width: 680px; margin: 0 auto;
      padding: 72px 48px 100px;
    }
    .tm-comments-label {
      font-size: 10px; font-weight: 700; letter-spacing: .22em; text-transform: uppercase;
      color: #2e7d52; margin-bottom: 12px;
      display: flex; align-items: center; gap: 10px;
    }
    .tm-comments-label::before {
      content: ''; display: block; height: 1px; width: 24px;
      background: #2e7d52; opacity: .45;
    }
    .tm-comments-title {
      font-family: 'Marcellus', Georgia, serif;
      font-size: clamp(22px, 3vw, 30px); font-weight: 700;
      letter-spacing: -.02em; color: var(--ink, #1c1410); margin-bottom: 6px;
    }
    .tm-comments-sub {
      font-size: 14px; color: var(--ink4, #8a7a64); margin-bottom: 36px; line-height: 1.65;
    }

    /* Formulario */
    .tm-cf {
      background: #fff; border: 1px solid var(--paper4, #c8b99f);
      border-radius: 12px; padding: 26px 26px 22px; margin-bottom: 44px;
    }
    .tm-cf-row { display: flex; gap: 12px; margin-bottom: 14px; }
    .tm-cf-name { flex: 0 0 200px; }
    .tm-cf-label {
      display: block; font-size: 10px; font-weight: 600;
      letter-spacing: .12em; text-transform: uppercase;
      color: var(--ink5, #8a7a66); margin-bottom: 5px;
      font-family: 'JetBrains Mono', monospace;
    }
    .tm-cf-input, .tm-cf-textarea {
      width: 100%; background: var(--paper, #f4ece0);
      border: 1px solid var(--paper4, #c8b99f); border-radius: 6px;
      padding: 9px 12px; font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px; color: var(--ink, #1c1410);
      outline: none; transition: border-color .15s; box-sizing: border-box;
    }
    .tm-cf-input:focus, .tm-cf-textarea:focus { border-color: #2e7d52; }
    .tm-cf-textarea { resize: vertical; min-height: 88px; }
    .tm-cf-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .tm-cf-hint { font-size: 11px; color: var(--ink5, #8a7a66); }
    .tm-cf-submit {
      background: #2e7d52; color: #fff; border: none; border-radius: 6px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;
      letter-spacing: .08em; text-transform: uppercase;
      padding: 9px 20px; cursor: pointer; transition: background .2s; white-space: nowrap;
    }
    .tm-cf-submit:hover    { background: #1a5c38; }
    .tm-cf-submit:disabled { background: var(--paper4, #c8b99f); cursor: default; color: #fff; }
    .tm-cf-msg {
      font-size: 11px; padding: 8px 12px; border-radius: 5px; margin-top: 12px;
      display: none; font-family: 'JetBrains Mono', monospace; letter-spacing: .02em;
    }
    .tm-cf-msg.ok  { display: block; background: rgba(46,125,82,.08); color: #1a5c38; border: 1px solid rgba(46,125,82,.25); }
    .tm-cf-msg.err { display: block; background: rgba(200,60,60,.07); color: #c03030; border: 1px solid rgba(200,60,60,.2); }

    /* Lista de comentarios */
    .tm-comment-list { display: flex; flex-direction: column; gap: 14px; }
    .tm-comment-empty { font-size: 14px; color: var(--ink5, #8a7a66); font-style: italic; padding: 4px 0 8px; }
    .tm-comment-item {
      background: #fff; border: 1px solid var(--paper3, #e8e0d4);
      border-radius: 10px; padding: 18px 20px;
    }
    .tm-comment-meta {
      display: flex; align-items: baseline; gap: 10px; margin-bottom: 9px;
    }
    .tm-comment-name { font-weight: 600; font-size: 13px; color: var(--ink, #1c1410); }
    .tm-comment-date {
      font-family: 'JetBrains Mono', monospace; font-size: 10px;
      color: var(--ink5, #8a7a66); letter-spacing: .04em;
    }
    .tm-comment-text { font-size: 14px; color: var(--ink3, #4a3c2c); line-height: 1.7; }
    .tm-comments-loading {
      font-size: 12px; color: var(--ink5, #8a7a66);
      font-family: 'JetBrains Mono', monospace; letter-spacing: .04em;
    }

    @media (max-width: 768px) {
      .tm-comments-sep { margin: 0 20px; }
      .tm-comments-wrap { padding: 56px 20px 80px; }
      .tm-cf-row { flex-direction: column; }
      .tm-cf-name { flex: unset; }
      .tm-cf-footer { flex-direction: column; align-items: flex-start; gap: 10px; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ── RENDER SECCIÓN ──────────────────────────────────────────────────────── */
  section.id = 'comentarios';
  section.insertAdjacentHTML('beforebegin', '<div class="tm-comments-sep"></div>');
  section.innerHTML = `
    <div class="tm-comments-wrap">
      <span class="tm-comments-label">Conversación</span>
      <h2 class="tm-comments-title">Comentarios</h2>
      <p class="tm-comments-sub">¿Qué piensas de este compositor? Comparte tu perspectiva, una anécdota o qué pieza te marcó.</p>

      <div class="tm-cf">
        <div class="tm-cf-row">
          <div class="tm-cf-name">
            <label class="tm-cf-label" for="tc-name">Tu nombre</label>
            <input class="tm-cf-input" id="tc-name" type="text" placeholder="Nombre o alias" maxlength="80" autocomplete="nickname"/>
          </div>
        </div>
        <div style="margin-bottom:14px">
          <label class="tm-cf-label" for="tc-text">Comentario</label>
          <textarea class="tm-cf-textarea" id="tc-text" placeholder="¿Qué escuchaste que no olvidaste? ¿Algo que te sorprendió de su historia?" maxlength="2000"></textarea>
        </div>
        <div class="tm-cf-footer">
          <span class="tm-cf-hint">Sin registro necesario · Mín. 10 caracteres</span>
          <button class="tm-cf-submit" id="tc-submit">Publicar</button>
        </div>
        <div class="tm-cf-msg" id="tc-msg"></div>
      </div>

      <div id="tc-list"><p class="tm-comments-loading">Cargando comentarios…</p></div>
    </div>
  `;

  /* ── NAV INDICATOR ───────────────────────────────────────────────────────── */
  // Runs after auth.js (same DOMContentLoaded queue, auth.js script comes before)
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const anchor = document.createElement('a');
    anchor.href = '#comentarios';
    anchor.className = 'nav-comments-anchor';
    anchor.innerHTML = '<span class="nca-dot"></span>Comentarios';
    // Insert before the auth wrap
    const authWrap = nav.querySelector('.tm-user-wrap');
    if (authWrap) nav.insertBefore(anchor, authWrap);
    else nav.appendChild(anchor);
  });

  /* ── HELPERS ─────────────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function renderList(comments) {
    const list = document.getElementById('tc-list');
    if (!list) return;
    if (!comments || comments.length === 0) {
      list.innerHTML = '<p class="tm-comment-empty">Sé la primera persona en dejar un comentario.</p>';
      return;
    }
    list.innerHTML = '<div class="tm-comment-list">' +
      comments.map(c => `
        <div class="tm-comment-item">
          <div class="tm-comment-meta">
            <span class="tm-comment-name">${esc(c.user_name)}</span>
            <span class="tm-comment-date">${fmtDate(c.created_at)}</span>
          </div>
          <p class="tm-comment-text">${esc(c.comment_text).replace(/\n/g, '<br>')}</p>
        </div>`
      ).join('') +
      '</div>';
  }

  /* ── SUPABASE ────────────────────────────────────────────────────────────── */
  function waitForSupa(cb, tries = 0) {
    if (window.supabase) return cb(window.supabase.createClient(SUPA_URL, SUPA_KEY));
    if (tries > 30) return console.warn('comments.js: Supabase no disponible');
    setTimeout(() => waitForSupa(cb, tries + 1), 100);
  }

  waitForSupa(async (sb) => {
    // Cargar comentarios existentes
    const { data } = await sb
      .from('comments')
      .select('id, user_name, comment_text, created_at')
      .eq('page_slug', slug)
      .order('created_at', { ascending: true });

    renderList(data);

    // Manejar envío
    const btn = document.getElementById('tc-submit');
    const msg = document.getElementById('tc-msg');
    if (!btn || !msg) return;

    btn.addEventListener('click', async () => {
      const name = (document.getElementById('tc-name').value || '').trim();
      const text = (document.getElementById('tc-text').value || '').trim();
      msg.className = 'tm-cf-msg';

      if (!name) {
        msg.textContent = 'Escribe tu nombre o alias.';
        msg.className = 'tm-cf-msg err';
        return;
      }
      if (text.length < 10) {
        msg.textContent = 'El comentario debe tener al menos 10 caracteres.';
        msg.className = 'tm-cf-msg err';
        return;
      }

      btn.disabled = true; btn.textContent = '…';

      const { error } = await sb.from('comments').insert({
        page_slug: slug, user_name: name, comment_text: text
      });

      if (error) {
        msg.textContent = 'No se pudo publicar. Intenta de nuevo más tarde.';
        msg.className = 'tm-cf-msg err';
      } else {
        msg.textContent = '¡Comentario publicado! Gracias.';
        msg.className = 'tm-cf-msg ok';
        document.getElementById('tc-text').value = '';
        const { data: fresh } = await sb
          .from('comments')
          .select('id, user_name, comment_text, created_at')
          .eq('page_slug', slug)
          .order('created_at', { ascending: true });
        renderList(fresh);
      }

      btn.disabled = false; btn.textContent = 'Publicar';
    });
  });
})();
