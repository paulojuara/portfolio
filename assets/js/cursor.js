(function () {
  if (!document.body.hasAttribute('data-cursor-guides')) return;

  var ponteiro = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!ponteiro.matches) return;

  var movimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mira = document.createElement('div');
  mira.className = 'mira';
  mira.setAttribute('aria-hidden', 'true');

  var fioV = document.createElement('i');
  var fioH = document.createElement('i');
  var leitura = document.createElement('span');
  fioV.className = 'fio-v';
  fioH.className = 'fio-h';
  leitura.className = 'leitura';
  mira.append(fioV, fioH, leitura);
  document.body.appendChild(mira);

  var alvoX = 0, alvoY = 0, x = 0, y = 0;
  var iniciada = false, quadroId = null;
  var largura = window.innerWidth, altura = window.innerHeight;

  function quadro() {
    var suave = movimento.matches ? 1 : 0.2;
    x += (alvoX - x) * suave;
    y += (alvoY - y) * suave;
    var chegou = Math.abs(alvoX - x) < 0.1 && Math.abs(alvoY - y) < 0.1;
    if (chegou) { x = alvoX; y = alvoY; }

    fioV.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    fioH.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
    var labelX = Math.max(8, Math.min(x + 14, largura - 120));
    var labelY = Math.max(8, Math.min(y + 12, altura - 24));
    leitura.style.transform = 'translate(' + labelX.toFixed(1) + 'px,' + labelY.toFixed(1) + 'px)';
    leitura.textContent = Math.round(alvoX) + ' × ' + Math.round(alvoY);
    quadroId = chegou ? null : requestAnimationFrame(quadro);
  }

  function esconder() {
    mira.dataset.ativa = 'false';
    iniciada = false;
    if (quadroId !== null) cancelAnimationFrame(quadroId);
    quadroId = null;
  }

  window.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse' || !ponteiro.matches) {
      esconder();
      return;
    }
    alvoX = event.clientX;
    alvoY = event.clientY;
    if (!iniciada) { x = alvoX; y = alvoY; iniciada = true; }
    mira.dataset.ativa = 'true';
    if (quadroId === null) quadroId = requestAnimationFrame(quadro);
  }, {passive: true});

  document.addEventListener('mouseleave', esconder);
  window.addEventListener('blur', esconder);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) esconder();
  });
  ponteiro.addEventListener('change', esconder);
  window.addEventListener('resize', function () {
    largura = window.innerWidth;
    altura = window.innerHeight;
    esconder();
  }, {passive: true});
})();
