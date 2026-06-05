(function () {
  var attempts = 0;

  function initTRWT() {
    attempts++;
    var section  = document.querySelector('.trwt-praise');
    if (!section) return;
    var viewport = section.querySelector('.trwt-viewport');
    var track    = section.querySelector('.trwt-track.w-dyn-items');
    var dotsWrap = section.querySelector('.trwt-dots');
    var prevBtn  = section.querySelector('[data-dir="prev"]');
    var nextBtn  = section.querySelector('[data-dir="next"]');
    if (!track || !viewport) return;

    var GAP = 28;
    var cards = Array.prototype.slice.call(track.children);

    /* Retry if cards not ready yet — up to 20 attempts */
    if (cards.length === 0 && attempts < 20) {
      setTimeout(initTRWT, 200);
      return;
    }
    if (cards.length === 0) return;

    var index = 0, cardW = 0, step = 0, maxIndex = 0, dots = [];

    function settings() {
      var w = window.innerWidth;
      if (w >= 1000) return { perView:2, peek:0.34 };
      if (w >= 700)  return { perView:1, peek:0.55 };
      return               { perView:1, peek:0.12 };
    }

    function layout() {
      var s = settings();
      var w = viewport.clientWidth;
      if (!w) return;
      cardW = (w - GAP * s.perView) / (s.perView + s.peek);
      step  = cardW + GAP;
      cards.forEach(function(c){
        c.style.width = cardW + 'px';
        var inner = c.querySelector('.trwt-card');
        if (inner) inner.style.width = '100%';
      });
      maxIndex = Math.max(0, cards.length - s.perView);
      if (index > maxIndex) index = maxIndex;
      buildDots();
      update(false);
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = ''; dots = [];
      for (var i = 0; i <= maxIndex; i++) {
        (function(i){
          var d = document.createElement('button');
          d.className = 'trwt-dot'; d.type = 'button';
          d.setAttribute('aria-label', 'Go to group ' + (i+1));
          d.addEventListener('click', function(){ go(i); });
          dotsWrap.appendChild(d); dots.push(d);
        })(i);
      }
    }

    function go(i) {
      index = Math.max(0, Math.min(maxIndex, i));
      update(true);
    }

    function update(animate) {
      if (animate === false) {
        track.style.transition = 'none';
        requestAnimationFrame(function(){
          track.style.transform = 'translateX(' + (-(index * step)) + 'px)';
          requestAnimationFrame(function(){ track.style.transition = ''; });
        });
      } else {
        track.style.transform = 'translateX(' + (-(index * step)) + 'px)';
      }
      if (prevBtn) prevBtn.toggleAttribute('disabled', index <= 0);
      if (nextBtn) nextBtn.toggleAttribute('disabled', index >= maxIndex);
      dots.forEach(function(d,i){ d.classList.toggle('is-active', i === index); });
    }

    if (prevBtn) prevBtn.addEventListener('click', function(){ go(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function(){ go(index + 1); });

    section.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft')  go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    var startX = 0, startT = 0, dragging = false;
    viewport.addEventListener('pointerdown', function(e){
      dragging = true; startX = e.clientX; startT = index * step;
      track.style.transition = 'none';
    });
    window.addEventListener('pointermove', function(e){
      if (!dragging) return;
      track.style.transform = 'translateX(' + (-startT + (e.clientX - startX)) + 'px)';
    });
    window.addEventListener('pointerup', function(e){
      if (!dragging) return; dragging = false; track.style.transition = '';
      var dx = e.clientX - startX;
      if (Math.abs(dx) > cardW * 0.18) go(index + (dx < 0 ? 1 : -1));
      else update(true);
    });

    var rt;
    window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(layout, 120); });

    layout();
  }

  /* Start trying immediately, then keep retrying */
  setTimeout(initTRWT, 100);
  setTimeout(initTRWT, 500);
  setTimeout(initTRWT, 1000);
  setTimeout(initTRWT, 2000);
})();
