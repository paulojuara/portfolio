(function () {
  'use strict';

  var storageKey = 'portfolio-page-arrival';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var active = null;
  var arrivalCleanup = null;
  var etiquetaChegada = null;
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
      if (arrival.label) etiquetaChegada = arrival.label;
      // A coreografia de chegada termina em ~740ms; a folga evita
      // que o atributo saia no meio de uma animação.
      arrivalCleanup = window.setTimeout(function () {
        delete root.dataset.pageArrival;
      }, 1200);
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
        path: active.url.pathname, kind: active.kind, time: Date.now(),
        label: active.label
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

  // O viajante retoma a coordenada que tinha na página anterior e
  // vai até o rótulo do hero, que só aparece quando ele chega.
  function entregarRotulo() {
    if (!etiquetaChegada) return;
    var alvo = document.querySelector('.pf-hero .pf-rotulo') ||
               document.querySelector('.hero .eyebrow') ||
               document.querySelector('.abertura .rotulo');
    if (!alvo) return;
    var destino = alvo.getBoundingClientRect();
    var viajante = document.createElement('span');
    viajante.className = 'page-rotulo page-rotulo--chegada';
    viajante.textContent = etiquetaChegada.texto;
    viajante.setAttribute('aria-hidden', 'true');
    viajante.style.left = etiquetaChegada.x + 'px';
    viajante.style.top = etiquetaChegada.y + 'px';
    viajante.style.setProperty('--rotulo-dx', (destino.left - etiquetaChegada.x) + 'px');
    viajante.style.setProperty('--rotulo-dy', (destino.top - etiquetaChegada.y) + 'px');
    document.body.appendChild(viajante);
    function remover() { if (viajante.parentNode) viajante.remove(); }
    viajante.addEventListener('animationend', remover, {once: true});
    // Uma animação interrompida não pode deixar o rótulo na tela.
    window.setTimeout(remover, 1200);
  }

  function setup() {
    entregarRotulo();
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
        if (url.origin !== location.origin ||
            !window.CSS || !CSS.supports('clip-path', 'inset(0px 0px 0px 0px)')) return;

        event.preventDefault();
        prefetch(link);
        // A virada começa exatamente sobre o card e abre até a borda.
        var bounds = link.getBoundingClientRect();
        var kind = link.dataset.pageTransition;
        var overlay = document.createElement('div');
        overlay.className = 'page-departure';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.setProperty('--departure-top', bounds.top + 'px');
        overlay.style.setProperty('--departure-right', (innerWidth - bounds.right) + 'px');
        overlay.style.setProperty('--departure-bottom', (innerHeight - bounds.bottom) + 'px');
        overlay.style.setProperty('--departure-left', bounds.left + 'px');

        var sheet = document.createElement('div');
        sheet.className = 'page-departure-sheet';
        overlay.appendChild(sheet);

        // O rótulo do card sobe para cima da folha e fica parado:
        // é a coordenada que a próxima página vai retomar.
        var etiqueta = null;
        var rotulo = link.querySelector('.home-card-rotulo');
        if (rotulo) {
          var lr = rotulo.getBoundingClientRect();
          etiqueta = {x: lr.left, y: lr.top, texto: rotulo.textContent};
          var copia = document.createElement('span');
          copia.className = 'page-rotulo page-rotulo--saida';
          copia.textContent = etiqueta.texto;
          copia.setAttribute('aria-hidden', 'true');
          copia.style.left = etiqueta.x + 'px';
          copia.style.top = etiqueta.y + 'px';
          overlay.appendChild(copia);
        }

        document.body.appendChild(overlay);
        link.setAttribute('data-departing', '');
        document.body.classList.add('is-departing');
        document.body.setAttribute('aria-busy', 'true');

        active = {link: link, overlay: overlay, url: url, kind: kind,
                  label: etiqueta, navigating: false};
        sheet.addEventListener('animationend', function (animation) {
          if (animation.target === sheet) navigate();
        }, {once: true});
        // A disabled stylesheet or interrupted animation must not trap the link.
        active.timer = window.setTimeout(navigate, 520);
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
