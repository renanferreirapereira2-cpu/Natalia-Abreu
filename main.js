(function () {
  'use strict';

  function init() {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    const E = 'cubic-bezier(.19,1,.22,1)';
    const easeOut = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
    const tween = (dur, delay, onUpdate, onDone) => {
      const start = performance.now() + (delay || 0);
      const step = (now) => {
        let t = (now - start) / dur;
        if (t < 0) { requestAnimationFrame(step); return; }
        if (t > 1) t = 1;
        onUpdate(easeOut(t), t);
        if (t < 1) requestAnimationFrame(step); else if (onDone) onDone();
      };
      requestAnimationFrame(step);
    };

    // ---- MENU ----
    let menuOpen = false;
    const ov = document.querySelector('[data-menu]');
    const menuBtn = document.querySelector('[data-menu-btn]');
    const lbl = document.querySelector('[data-menu-label]');
    const b1 = document.querySelector('[data-bar1]');
    const b2 = document.querySelector('[data-bar2]');
    let menuTok = 0;
    const setMenu = (open) => {
      menuOpen = open;
      if (!ov) return;
      const tok = ++menuTok;
      ov.style.visibility = 'visible';
      if (menuBtn) { menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); }
      if (lbl) { lbl.textContent = open ? 'Fechar' : 'Menu'; lbl.style.color = open ? '#EFE7DC' : '#1A1613'; }
      if (b1) { b1.style.background = open ? '#EFE7DC' : '#1A1613'; b1.style.top = open ? '5px' : '1px'; b1.style.transform = open ? 'rotate(45deg)' : 'none'; }
      if (b2) { b2.style.background = open ? '#EFE7DC' : '#1A1613'; b2.style.top = open ? '5px' : '8px'; b2.style.width = open ? '30px' : '18px'; b2.style.transform = open ? 'rotate(-45deg)' : 'none'; }
      const fromO = parseFloat(ov.style.opacity) || 0, toO = open ? 1 : 0;
      const fromY = parseFloat(ov.dataset.y || '40'), toY = open ? 0 : 36;
      tween(open ? 760 : 480, 0, (e) => {
        if (tok !== menuTok) return;
        ov.style.opacity = (fromO + (toO - fromO) * e).toFixed(3);
        const y = fromY + (toY - fromY) * e; ov.dataset.y = y;
        ov.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        const links = ov.querySelectorAll('[data-menu-link]');
        if (open) links.forEach((a, i) => { const le = Math.max(0, Math.min(1, (e - i * 0.06) / (1 - i * 0.06 || 1))); a.style.opacity = le.toFixed(3); a.style.transform = 'translate3d(0,' + ((1 - le) * 30).toFixed(1) + 'px,0)'; });
      }, () => { if (tok !== menuTok) return; if (!open) ov.style.visibility = 'hidden'; });
    };
    if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!menuOpen));
    document.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen) setMenu(false); });
    if (ov) ov.addEventListener('click', (e) => { if (e.target === ov || e.target === ov.firstElementChild) setMenu(false); });

    // ---- SMOOTH ANCHORS ----
    document.querySelectorAll('[data-nav]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id[0] !== '#') return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        const y = t.getBoundingClientRect().top + window.scrollY - 10;
        window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      });
    });

    // ---- REVEALS ----
    const setHidden = (el, type) => {
      el.style.willChange = 'transform,opacity,clip-path,filter';
      if (type === 'rise') { el.style.opacity = '0'; el.style.transform = 'translate3d(0,52px,0)'; el.style.filter = 'blur(8px)'; }
      else if (type === 'fade') { el.style.opacity = '0'; el.style.filter = 'blur(16px)'; el.style.transform = 'scale(1.04)'; }
      else if (type === 'clip-img') { el.style.opacity = '1'; el.style.transform = 'scale(1.07)'; el.style.clipPath = 'inset(0 0 100% 0)'; el.style.filter = 'blur(3px)'; }
    };
    const reveals = [...document.querySelectorAll('[data-reveal]')];
    if (!reduced) reveals.forEach((el) => setHidden(el, el.getAttribute('data-reveal')));
    const FROM = { rise: { o: 0, ty: 52, sc: 1, bl: 8 }, fade: { o: 0, ty: 0, sc: 1.04, bl: 16 }, 'clip-img': { o: 0, ty: 0, sc: 1.06, bl: 0 } };
    const revealEl = (el) => {
      if (el._revealed) return; el._revealed = true;
      const type = el.getAttribute('data-reveal');
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      const f = FROM[type] || FROM.rise;
      if (type === 'clip-img') {
        const dur = 1500;
        tween(dur, delay, (e) => {
          const inset = (100 * (1 - e)).toFixed(2);
          el.style.clipPath = 'inset(0 0 ' + inset + '% 0)';
          const sc = 1.07 + (1 - 1.07) * e, bl = 3 * (1 - e);
          el.style.transform = 'scale(' + sc.toFixed(4) + ')';
          el.style.filter = bl > 0.05 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
        }, () => { el.style.clipPath = 'none'; el.style.transform = 'none'; el.style.filter = 'none'; el.style.willChange = 'auto'; });
        return;
      }
      const dur = 1100;
      tween(dur, delay, (e) => {
        el.style.opacity = (f.o + (1 - f.o) * e).toFixed(3);
        const ty = f.ty * (1 - e), sc = f.sc + (1 - f.sc) * e, bl = f.bl * (1 - e);
        let tf = '';
        if (ty) tf += 'translate3d(0,' + ty.toFixed(2) + 'px,0)';
        if (sc !== 1) tf += (tf ? ' ' : '') + 'scale(' + sc.toFixed(4) + ')';
        el.style.transform = tf || 'none';
        el.style.filter = bl > 0.04 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
      }, () => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; el.style.willChange = 'auto'; });
    };
    if (reduced) reveals.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; el.style.clipPath = 'none'; });

    // ---- SPLIT WORD REVEAL ----
    const splitEls = [];
    document.querySelectorAll('[data-split]').forEach((el) => {
      const words = el.textContent.trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const wrap = document.createElement('span');
        wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.04em';
        const inner = document.createElement('span');
        inner.style.cssText = 'display:inline-block;transform:translate3d(0,115%,0);will-change:transform';
        if (reduced) inner.style.transform = 'none';
        inner.textContent = w;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      });
      splitEls.push(el);
    });
    const revealSplit = (el) => {
      if (el._revealed) return; el._revealed = true;
      [...el.querySelectorAll(':scope > span > span')].forEach((inn, i) => {
        tween(1050, i * 60, (e) => { inn.style.transform = 'translate3d(0,' + (115 * (1 - e)).toFixed(2) + '%,0)'; }, () => { inn.style.transform = 'none'; inn.style.willChange = 'auto'; });
      });
    };

    // ---- PARALLAX + PROGRESS + HEADER ----
    const px = [...document.querySelectorAll('[data-parallax]')].map((el) => ({ el, s: parseFloat(el.getAttribute('data-parallax')), sc: parseFloat(el.getAttribute('data-base-scale') || '1'), ty: 0, hk: 1 }));
    const applyPx = (o) => { o.el.style.transform = 'translate3d(0,' + o.ty.toFixed(1) + 'px,0) scale(' + (o.sc * o.hk).toFixed(4) + ')'; };
    const prog = document.querySelector('[data-progress]');
    const header = document.querySelector('[data-header]');
    let ticking = false, lastY = 0;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      if (!reduced) {
        const trig = vh * 0.92;
        reveals.forEach((el) => { if (!el._revealed) { const r = el.getBoundingClientRect(); if (r.top < trig) revealEl(el); } });
        splitEls.forEach((el) => { if (!el._revealed) { const r = el.getBoundingClientRect(); if (r.top < trig) revealSplit(el); } });
      }
      const narrow = window.innerWidth <= 760;
      if (!reduced) px.forEach((o) => {
        if (narrow) { o.ty = 0; applyPx(o); return; }
        const r = o.el.getBoundingClientRect();
        o.ty = ((r.top + r.height / 2) - vh / 2) * o.s;
        applyPx(o);
      });
      if (prog) { const h = document.documentElement; const p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1); prog.style.transform = 'scaleX(' + p.toFixed(4) + ')'; }
      if (header && !menuOpen) {
        const y = window.scrollY;
        if (y > 180 && y > lastY + 3) header.style.transform = 'translateY(-130%)';
        else if (y < lastY - 3 || y < 180) header.style.transform = 'translateY(0)';
        lastY = y;
      }
    };
    const hoverZoom = (img, on) => { const o = px.find((p) => p.el === img); if (!o) return; const an = () => { o.hk += ((on ? 1.055 : 1) - o.hk) * 0.14; applyPx(o); if (Math.abs((on ? 1.055 : 1) - o.hk) > 0.0008) img._hz = requestAnimationFrame(an); }; cancelAnimationFrame(img._hz); img._hz = requestAnimationFrame(an); };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) onScroll(); });
    window.addEventListener('pageshow', onScroll);
    update();
    setTimeout(update, 120);
    setTimeout(update, 450);
    window.addEventListener('load', update);

    // ---- SERVICE PREVIEW SWAP ----
    const preview = document.querySelector('[data-service-preview]');
    const rows = [...document.querySelectorAll('[data-service-row]')];
    if (preview) preview._src = preview.getAttribute('src');
    rows.forEach((row) => {
      const name = row.querySelector('[data-sv-name]');
      row.addEventListener('mouseenter', () => {
        if (name) name.style.color = '#C2A05E';
        rows.forEach((r) => { if (r !== row) { const n = r.querySelector('[data-sv-name]'); if (n) n.style.color = 'rgba(239,231,220,.5)'; } });
        if (!preview || reduced) return;
        const src = row.getAttribute('data-img');
        if (preview._src === src) { tween(420, 0, (e) => { const s = 1.05 - 0.05 * e; preview.style.transform = 'scale(' + s.toFixed(3) + ')'; }); return; }
        preview._src = src;
        tween(190, 0, (e) => { preview.style.opacity = (1 - e * 0.85).toFixed(2); }, () => {
          preview.src = src;
          tween(360, 0, (e) => { preview.style.opacity = (0.15 + 0.85 * e).toFixed(2); preview.style.transform = 'scale(' + (1.05 - 0.05 * e).toFixed(3) + ')'; });
        });
      });
    });
    const svList = document.querySelector('#servicos');
    if (svList) svList.addEventListener('mouseleave', () => { rows.forEach((r) => { const n = r.querySelector('[data-sv-name]'); if (n) n.style.color = '#EFE7DC'; }); });

    // ---- IMAGE HOVER ZOOM (works with parallax) ----
    document.querySelectorAll('[data-hover-zoom]').forEach((img) => {
      const host = img.closest('[data-cursor]') || img.parentElement;
      host.addEventListener('mouseenter', () => hoverZoom(img, true));
      host.addEventListener('mouseleave', () => hoverZoom(img, false));
    });

    // ---- LINE BUTTONS (underline wipes in from left, out to right) ----
    document.querySelectorAll('[data-line-btn]').forEach((btn) => {
      const fill = btn.querySelector('[data-line-fill]');
      if (!fill) return;
      let raf, cur = 0;
      const anim = (to) => { cancelAnimationFrame(raf); const step = () => { cur += (to - cur) * 0.2; fill.style.width = (cur * 100).toFixed(1) + '%'; if (Math.abs(to - cur) > 0.004) raf = requestAnimationFrame(step); else { cur = to; fill.style.width = (to * 100) + '%'; } }; step(); };
      btn.addEventListener('mouseenter', () => { fill.style.left = '0'; fill.style.right = 'auto'; anim(1); });
      btn.addEventListener('mouseleave', () => { fill.style.left = 'auto'; fill.style.right = '0'; anim(0); });
    });

    // ---- SOLID PILL BUTTONS (soft sheen + lift on hover) ----
    document.querySelectorAll('[data-soft-btn]').forEach((btn) => {
      btn.style.transition = 'transform .5s cubic-bezier(.19,1,.22,1),box-shadow .5s ease,background-color .5s ease,color .5s ease';
      const lift = btn.getAttribute('data-soft-lift') || '-3px';
      btn.addEventListener('mouseenter', () => { btn.style.transform = 'translateY(' + lift + ')'; if (btn.dataset.softShadow) btn.style.boxShadow = btn.dataset.softShadow; });
      btn.addEventListener('mouseleave', () => { btn.style.transform = 'translateY(0)'; btn.style.boxShadow = btn.dataset.softShadow0 || 'none'; });
    });

    // ---- FADE LINKS (gentle brighten on hover) ----
    document.querySelectorAll('[data-fade]').forEach((el) => {
      const base = el.style.color || '';
      el.addEventListener('mouseenter', () => { el.style.color = '#F2ECE4'; });
      el.addEventListener('mouseleave', () => { el.style.color = base; });
    });

    // ---- CUSTOM CURSOR (soft beauty glow + precise core) + MAGNETIC ----
    if (fine && !reduced) {
      document.documentElement.style.cursor = 'none';
      // soft, slow-trailing glow — the "beauty light"
      const glow = document.createElement('div');
      glow.style.cssText = 'position:fixed;left:0;top:0;width:130px;height:130px;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:9998;background:radial-gradient(circle,rgba(194,160,94,.20) 0%,rgba(194,160,94,.07) 42%,rgba(194,160,94,0) 70%);filter:blur(2px);opacity:.9;transition:opacity .5s ease,width .6s ' + E + ',height .6s ' + E;
      const ring = document.createElement('div');
      ring.style.cssText = 'position:fixed;left:0;top:0;width:30px;height:30px;border:1px solid rgba(168,133,75,.7);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:9999;display:flex;align-items:center;justify-content:center;transition:width .45s ' + E + ',height .45s ' + E + ',background .45s ease,border-color .45s ease,opacity .3s';
      const ringLabel = document.createElement('span');
      ringLabel.style.cssText = "font-family:'Cormorant',serif;font-style:italic;font-weight:500;font-size:15px;letter-spacing:.01em;color:#1A1613;opacity:0;transition:opacity .3s";
      ring.appendChild(ringLabel);
      const dot = document.createElement('div');
      dot.style.cssText = 'position:fixed;left:0;top:0;width:4px;height:4px;background:#A8854B;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:10000;transition:opacity .25s';
      document.body.appendChild(glow); document.body.appendChild(ring); document.body.appendChild(dot);
      let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, gx = mx, gy = my;
      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px';
        if (document.body.hasAttribute('data-kbd')) { document.body.removeAttribute('data-kbd'); document.documentElement.style.cursor = 'none'; ring.style.opacity = '1'; dot.style.opacity = '1'; glow.style.opacity = '.9'; }
      });
      const loop = () => {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        gx += (mx - gx) * 0.09; gy += (my - gy) * 0.09; glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
        requestAnimationFrame(loop);
      };
      loop();
      document.querySelectorAll('[data-cursor]').forEach((el) => {
        const lab = el.getAttribute('data-cursor-label');
        el.addEventListener('mouseenter', () => {
          glow.style.width = '180px'; glow.style.height = '180px';
          if (lab) { ring.style.width = '92px'; ring.style.height = '92px'; ring.style.background = 'rgba(240,233,221,.92)'; ring.style.borderColor = 'rgba(168,133,75,.25)'; ringLabel.textContent = lab; ringLabel.style.opacity = '1'; dot.style.opacity = '0'; }
          else { ring.style.width = '54px'; ring.style.height = '54px'; ring.style.background = 'rgba(168,133,75,.07)'; ring.style.borderColor = 'rgba(168,133,75,.4)'; }
        });
        el.addEventListener('mouseleave', () => { ring.style.width = '30px'; ring.style.height = '30px'; ring.style.background = 'transparent'; ring.style.borderColor = 'rgba(168,133,75,.7)'; ringLabel.style.opacity = '0'; dot.style.opacity = '1'; glow.style.width = '130px'; glow.style.height = '130px'; });
      });
      document.querySelectorAll('[data-magnetic]').forEach((el) => {
        el.addEventListener('mouseenter', () => { el.style.transition = 'transform .2s ease-out'; });
        el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); const x = e.clientX - (r.left + r.width / 2); const y = e.clientY - (r.top + r.height / 2); el.style.transform = 'translate(' + (x * 0.28).toFixed(1) + 'px,' + (y * 0.4).toFixed(1) + 'px)'; });
        el.addEventListener('mouseleave', () => { el.style.transition = 'transform .55s ' + E; el.style.transform = 'translate(0,0)'; });
      });
      window.addEventListener('keydown', (e) => { if (e.key === 'Tab') { document.body.setAttribute('data-kbd', ''); document.documentElement.style.cursor = 'auto'; ring.style.opacity = '0'; dot.style.opacity = '0'; glow.style.opacity = '0'; } });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
