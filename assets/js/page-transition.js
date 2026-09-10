(function () {
  'use strict';

  var storageKey = 'portfolio-page-arrival';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var active = null;
  var arrivalCleanup = null;
  var prefetched = new Set();

  function route(path) { return path.replace(/\/index\.html$/, '/'); }

  // Read before first paint. Storage being unavailable never prevents navigation.
  try {
    var arrival = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    sessionStorage.removeItem(storageKey);
    if (arrival && !reducedMotion.matches &&
        route(arrival.path) === route(location.pathname) &&
        Date.now() - arrival.time >= 0 && Date.now() - arrival.time < 10000 &&
        (arrival.kind === 'about' || arrival.kind === 'portfolio')) {
      root.dataset.pageArrival = arrival.kind;
      arrivalCleanup = window.setTimeout(function () {
        delete root.dataset.pageArrival;
      }, 800);
    }
  } catch (_) { /* Normal navigation remains available. */ }

  function clearDeparture() {
    if (!active) return;
    window.clearTimeout(active.timer);
    active.overlay.remove();
    active.link.removeAttribute('data-departing');
    document.body.classList.remove('is-departing');
    document.body.removeAttribute('aria-busy');
    active = null;
  }

  function navigate() {
    if (!active || active.navigating) return;
    active.navigating = true;
    window.clearTimeout(active.timer);
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        path: active.url.pathname, kind: active.kind, time: Date.now()
      }));
    } catch (_) { /* The exit still works without an arrival animation. */ }
    location.assign(active.url.href);
  }

  function prefetch(link) {
    if (reducedMotion.matches || prefetched.has(link.href)) return;
    var connection = navigator.connection;
    if (connection && connection.saveData) return;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    prefetched.add(link.href);
    var hint = document.createElement('link');
    hint.rel = 'prefetch';
    hint.href = url.href;
    hint.as = 'document';
    document.head.appendChild(hint);
  }

  function setup() {
    var links = document.querySelectorAll('.home-card[data-page-transition]');
    links.forEach(function (link) {
      link.addEventListener('pointerenter', function () { prefetch(link); }, {once: true});
      link.addEventListener('focus', function () { prefetch(link); }, {once: true});
      link.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey || link.download ||
            (link.target && link.target !== '_self')) return;
        if (active) { event.preventDefault(); return; }
        if (reducedMotion.matches) return;
        var url = new URL(link.href, location.href);
        var art = link.querySelector('.home-card-art');
        if (url.origin !== location.origin || !art ||
            !window.CSS || !CSS.supports('clip-path', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)')) return;
        var images = Array.from(art.querySelectorAll('img'));
        if (!images.every(function (img) { return img.complete && img.naturalWidth > 0; })) return;

        event.preventDefault();
        prefetch(link);
        var bounds = art.getBoundingClientRect();
        var kind = link.dataset.pageTransition;
        var overlay = document.createElement('div');
        overlay.className = 'page-departure';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.setProperty('--departure-origin-x', (bounds.left + bounds.width / 2) + 'px');
        overlay.style.setProperty('--departure-origin-y', (bounds.top + bounds.height / 2) + 'px');
        overlay.style.setProperty('--departure-x', (innerWidth / 2 - bounds.left - bounds.width / 2) + 'px');
        overlay.style.setProperty('--departure-y', (innerHeight * .45 - bounds.top - bounds.height / 2) + 'px');
        overlay.style.setProperty('--departure-tilt', kind === 'about' ? '-8deg' : '8deg');

        var sheet = document.createElement('div');
        sheet.className = 'page-departure-sheet';
        var sticker = document.createElement('div');
        sticker.className = 'page-departure-sticker home-card--' + kind;
        sticker.style.left = bounds.left + 'px';
        sticker.style.top = bounds.top + 'px';
        sticker.style.width = bounds.width + 'px';
        sticker.style.height = bounds.height + 'px';
        sticker.appendChild(art.cloneNode(true));
        overlay.append(sheet, sticker);
        document.body.appendChild(overlay);
        link.setAttribute('data-departing', '');
        document.body.classList.add('is-departing');
        document.body.setAttribute('aria-busy', 'true');

        active = {link: link, overlay: overlay, url: url, kind: kind, navigating: false};
        sticker.addEventListener('animationend', function (animation) {
          if (animation.target === sticker) navigate();
        }, {once: true});
        // A disabled stylesheet or interrupted animation must not trap the link.
        active.timer = window.setTimeout(navigate, 900);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, {once: true});
  else setup();

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && active && !active.navigating) clearDeparture();
  });
  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) {
      delete root.dataset.pageArrival;
      if (active) navigate();
    }
  });
  window.addEventListener('pageshow', function (event) {
    clearDeparture();
    if (event.persisted) {
      window.clearTimeout(arrivalCleanup);
      delete root.dataset.pageArrival;
    }
  });
})();
