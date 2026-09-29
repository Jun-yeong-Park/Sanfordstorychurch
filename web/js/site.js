(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

  const bg = document.getElementById('heroBg');
  const scrollHint = document.getElementById('scrollHint');

  const state = { pxTarget:0, pyTarget:0, px:0, py:0, ticking:false };

  if (!reduce && !isTouch){
    window.addEventListener('mousemove', (e) => {
      state.pxTarget = (e.clientX / window.innerWidth  - 0.5) * 2;
      state.pyTarget = (e.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    }, { passive:true });
  }

  window.addEventListener('scroll', () => {
    if (scrollHint) scrollHint.style.opacity = Math.max(0, 1 - window.scrollY / 260);
  }, { passive:true });

  function schedule(){
    if (state.ticking) return;
    state.ticking = true;
    requestAnimationFrame(tick);
  }

  function tick(){
    state.px += (state.pxTarget - state.px) * 0.08;
    state.py += (state.pyTarget - state.py) * 0.08;

    if (bg){
      const bgX = state.px * 8;
      const bgY = state.py * 6;
      bg.style.transform = `scale(1.06) translate3d(${bgX}px, ${bgY}px, 0)`;
    }

    const settling =
      Math.abs(state.pxTarget - state.px) > 0.001 ||
      Math.abs(state.pyTarget - state.py) > 0.001;

    if (settling) requestAnimationFrame(tick);
    else state.ticking = false;
  }

  const track = document.getElementById('marqueeTrack');
  if (track){
    const original = track.innerHTML;
    track.innerHTML = original + original;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!reduce && parallaxEls.length){
    let ticking = false;
    function apply(){
      parallaxEls.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        const vh = window.innerHeight;
        const offset = (rect.top + rect.height/2 - vh/2) / vh;
        const factor = parseFloat(el.dataset.parallax) || 0.1;
        const y = -offset * factor * 120;
        el.style.transform = `scale(1.10) translate3d(0,${y.toFixed(1)}px,0)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking){ ticking = true; requestAnimationFrame(apply); }
    }, { passive:true });
    apply();
  }

})();
