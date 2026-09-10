(function () {
  var mira = document.querySelector('.mira');
  if (!mira) return;

  // Ponteiro fino apenas. Em toque não há posição de cursor para seguir.
  if (!window.matchMedia('(pointer: fine)').matches) { mira.remove(); return; }

  var fioV    = mira.querySelector('.fio-v');
  var fioH    = mira.querySelector('.fio-h');
  var leitura = mira.querySelector('.leitura');

  var alvoX = 0, alvoY = 0;   // onde o mouse está
  var x = 0, y = 0;           // onde a mira está
  var iniciada = false;
  var rodando = false;

  // Sem atraso quando o sistema pede menos movimento.
  var suave = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0.2;

  function quadro() {
    x += (alvoX - x) * suave;
    y += (alvoY - y) * suave;

    fioV.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    fioH.style.transform = 'translateY(' + y.toFixed(1) + 'px)';
    leitura.style.transform = 'translate(' + (x + 14).toFixed(1) + 'px,' + (y + 12).toFixed(1) + 'px)';
    leitura.textContent = Math.round(alvoX) + ' × ' + Math.round(alvoY);

    // Para o laço quando a mira já alcançou o cursor.
    if (Math.abs(alvoX - x) < 0.1 && Math.abs(alvoY - y) < 0.1) {
      x = alvoX; y = alvoY; rodando = false;
      return;
    }
    requestAnimationFrame(quadro);
  }

  function acorda() {
    if (!rodando) { rodando = true; requestAnimationFrame(quadro); }
  }

  window.addEventListener('mousemove', function (e) {
    alvoX = e.clientX;
    alvoY = e.clientY;
    if (!iniciada) {
      iniciada = true;
      x = alvoX; y = alvoY;
      mira.dataset.ativa = 'true';
    }
    acorda();
  }, { passive: true });

  document.addEventListener('mouseleave', function () { mira.dataset.ativa = 'false'; });
  document.addEventListener('mouseenter', function () { if (iniciada) mira.dataset.ativa = 'true'; });
})();
