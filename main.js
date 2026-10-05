/* Reformas Villa — interacciones. El contenido funciona sin JS; esto solo lo mejora. */
(function () {
  'use strict';
  var V = '20261005';
  var WA = '34600000000';
  var doc = document.documentElement;
  doc.classList.add('js');

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn(e); } }

  // Eventos de conversión (GA4 / Tag Manager si están instalados)
  function track(name, data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, data || {}));
    if (typeof window.gtag === 'function') window.gtag('event', name, data || {});
  }

  function initHeader() {
    var header = document.querySelector('.header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  function initReveal() {
    var els = document.querySelectorAll('.section__head, .svc, .proj, .step, .video, .why__list li, .remote__copy, .remote__media, .faq__list, .form, .contact__info, .trust__item');
    var showAll = function () { els.forEach(function (el) { el.classList.add('is-in'); }); };
    if (!('IntersectionObserver' in window)) return;
    els.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: nada se queda oculto
    setTimeout(function () {
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      });
    }, 1200);
    window.addEventListener('beforeprint', showAll);
  }

  // Galería elástica de la portada: el panel activo se expande
  function initElastic() {
    var panels = document.querySelectorAll('#elastic .el');
    function activate(p) {
      if (p.classList.contains('is-active')) return;
      panels.forEach(function (el) {
        var on = el === p;
        el.classList.toggle('is-active', on);
        var cta = el.querySelector('.el__cta');
        if (cta) cta.tabIndex = on ? 0 : -1;
      });
    }
    panels.forEach(function (p) {
      p.addEventListener('mouseenter', function () { activate(p); });
      p.addEventListener('click', function () { activate(p); });
      p.addEventListener('focus', function () { activate(p); });
      p.addEventListener('keydown', function (e) {
        var list = Array.prototype.slice.call(panels);
        var i = list.indexOf(p);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      });
    });
  }

  function initServicePreselect() {
    var select = document.getElementById('tipo');
    document.querySelectorAll('[data-tipo]').forEach(function (a) {
      a.addEventListener('click', function () { select.value = a.getAttribute('data-tipo'); });
    });
  }

  function initLightbox() {
    var box = document.getElementById('lightbox');
    var img = box.querySelector('img');
    var cap = box.querySelector('figcaption');
    var list = [], idx = 0, title = '', lastFocus = null;

    function show(i) {
      idx = (i + list.length) % list.length;
      img.src = list[idx];
      img.alt = title + ', foto ' + (idx + 1);
      cap.textContent = title + ' · ' + (idx + 1) + ' / ' + list.length;
    }
    function open(btn) {
      var g = btn.getAttribute('data-gallery');
      var n = parseInt(btn.getAttribute('data-count'), 10) || 1;
      title = btn.getAttribute('data-title') || '';
      list = [];
      for (var i = 1; i <= n; i++) list.push('assets/img/' + g + '-' + i + '.jpg?v=' + V);
      lastFocus = btn;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      show(0);
      box.querySelector('.lightbox__close').focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-gallery]').forEach(function (b) {
      b.addEventListener('click', function () { open(b); });
    });
    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    // Deslizar con el dedo en el móvil
    var x0 = null;
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  // Los vídeos solo cargan YouTube al pulsar (más rápido y sin cookies de terceros)
  function initVideos() {
    document.querySelectorAll('[data-yt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-yt');
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
        f.title = btn.getAttribute('aria-label') || 'Vídeo';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.allowFullscreen = true;
        btn.replaceWith(f);
        track('ver_video', { video: id });
      });
    });
  }

  function initTracking() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-track]');
      if (a) track('clic_' + a.getAttribute('data-track'));
    });
  }

  // Formulario: valida y abre WhatsApp con el mensaje ya redactado
  function initForm() {
    var form = document.getElementById('form');
    var msg = document.getElementById('form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var bad = [];
      [f.nombre, f.telefono].forEach(function (el) {
        var ok = el.value.trim().length > 1;
        el.classList.toggle('is-invalid', !ok);
        if (!ok) bad.push(el);
      });
      if (!f.privacidad.checked) bad.push(f.privacidad);
      if (bad.length) {
        msg.textContent = !f.privacidad.checked && bad.length === 1
          ? 'Acepta la política de privacidad para continuar.'
          : 'Revisa los campos marcados: nombre y teléfono son necesarios.';
        bad[0].focus();
        return;
      }
      msg.textContent = '';
      var lines = [
        'Hola, quiero pedir presupuesto.',
        'Nombre: ' + f.nombre.value.trim(),
        'Teléfono: ' + f.telefono.value.trim()
      ];
      if (f.tipo.value) lines.push('Tipo de reforma: ' + f.tipo.value);
      if (f.localidad.value.trim()) lines.push('Localidad: ' + f.localidad.value.trim());
      if (f.email.value.trim()) lines.push('Email: ' + f.email.value.trim());
      if (f.mensaje.value.trim()) lines.push('', f.mensaje.value.trim());
      track('envio_formulario', { tipo: f.tipo.value || 'sin especificar' });
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      msg.style.color = '#1B7A3E';
      msg.textContent = '¡Gracias! Te hemos abierto WhatsApp con tu mensaje listo para enviar.';
    });
    form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
  }

  function initYear() { document.getElementById('year').textContent = new Date().getFullYear(); }

  function boot() {
    safe(initHeader);
    safe(initReveal);
    safe(initElastic);
    safe(initServicePreselect);
    safe(initLightbox);
    safe(initVideos);
    safe(initTracking);
    safe(initForm);
    safe(initYear);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
