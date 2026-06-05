(function () {
  "use strict";

  function initials(name) {
    return (name || "").split(/\s+/).slice(0,2)
      .map(function(w){ return w.charAt(0); }).join("").toUpperCase();
  }

  function applyMonogramFallback(photoEl) {
    var img = photoEl.querySelector("img");
    var name = photoEl.dataset.name || "";
    if (!img || !img.src || img.src === window.location.href) {
      photoEl.innerHTML = '<span class="trwt-monogram">' + initials(name) + '</span>';
      return;
    }
    img.addEventListener("error", function () {
      photoEl.innerHTML = '<span class="trwt-monogram">' + initials(name) + '</span>';
    });
  }

  var GAP = 28;

  function settings() {
    var w = window.innerWidth;
    if (w >= 1000) return { perView:2, peek:0.34 };
    if (w >= 700)  return { perView:1, peek:0.55 };
    return               { perView:1, peek:0.12 };
  }

  function init() {
    var section  = document.querySelector(".trwt-praise");
    if (!section) return;
    var viewport = section.querySelector(".trwt-viewport");
    var track    = section.querySelector(".trwt-track");
    var dotsWrap = section.querySelector(".trwt-dots");
    var prevBtn  = section.querySelector('[data-dir="prev"]');
    var nextBtn  = section.querySelector('[data-dir="next"]');
    if (!track || !viewport) return;

    Array.prototype.forEach.call(
      section.querySelectorAll(".trwt-photo"), applyMonogramFallback
    );

    var cards = Array.prototype.slice.call(track.children);
    var index = 0, cardW = 0, step = 0, maxIndex = 0, dots = [];

    function layout() {
      var s = settings();
      var w = viewport.clientWidth;
      cardW = (w - GAP * s.perView) / (s.perView + s.peek);
      step  = cardW + GAP;
      cards.forEach(function(c){ c.style.width = cardW + "px"; });
      maxIndex = Math.max(0, cards.length - s.perView);
      if (index > maxIndex) index = maxIndex;
      buildDots();
      update(false);
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = ""; dots = [];
      for (var i = 0; i <= maxIndex; i++) {
        (function(i){
          var d = document.createElement("button");
          d.className = "trwt-dot"; d.type = "button";
          d.setAttribute("aria-label", "Go to group " + (i+1));
          d.addEventListener("click", function(){ go(i); });
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
        track.style.transition = "none";
        requestAnimationFrame(function(){
          track.style.transform = "translateX(" + (-(index * step)) + "px)";
          requestAnimationFrame(function(){ track.style.transition = ""; });
        });
      } else {
        track.style.transform = "translateX(" + (-(index * step)) + "px)";
      }
      if (prevBtn) prevBtn.setAttribute("disabled", index <= 0 ? "true" : null);
      if (nextBtn) nextBtn.setAttribute("disabled", index >= maxIndex ? "true" : null);
      if (prevBtn) prevBtn.toggleAttribute("disabled", index <= 0);
      if (nextBtn) nextBtn.toggleAttribute("disabled", index >= maxIndex);
      dots.forEach(function(d,i){ d.classList.toggle("is-active", i === index); });
    }

    if (prevBtn) prevBtn.addEventListener("click", function(){ go(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function(){ go(index + 1); });

    section.addEventListener("keydown", function(e){
      if (e.key === "ArrowLeft")  go(index - 1);
      if (e.key === "ArrowRight") go(index + 1);
    });

    document.querySelectorAll(".trwt-arrow").forEach(function(el){
      el.addEventListener("keydown", function(e){
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); el.click(); }
      });
    });

    var startX = 0, startT = 0, dragging = false;
    viewport.addEventListener("pointerdown", function(e){
      dragging = true; startX = e.clientX; startT = index * step;
      track.style.transition = "none";
    });
    window.addEventListener("pointermove", function(e){
      if (!dragging) return;
      track.style.transform = "translateX(" + (-startT + (e.clientX - startX)) + "px)";
    });
    window.addEventListener("pointerup", function(e){
      if (!dragging) return; dragging = false; track.style.transition = "";
      var dx = e.clientX - startX;
      if (Math.abs(dx) > cardW * 0.18) go(index + (dx < 0 ? 1 : -1));
      else update(true);
    });

    var rt;
    window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(layout, 120); });

    layout();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.Webflow = window.Webflow || [];
  window.Webflow.push(init);
})();