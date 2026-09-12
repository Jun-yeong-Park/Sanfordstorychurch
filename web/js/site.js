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

  (function(){
    const target = new Date('2026-09-27T18:00:00-04:00').getTime();
    const pad = n => String(Math.max(0,n)).padStart(2,'0');
    const els = {D:document.getElementById('cdD'),H:document.getElementById('cdH'),M:document.getElementById('cdM'),S:document.getElementById('cdS')};
    const prev = {D:null,H:null,M:null,S:null};
    if (!els.D) return;

    function set(key, val, animate){
      const node = els[key];
      const str = key==='D' ? String(val) : pad(val);
      if (node.textContent !== str){
        node.textContent = str;
        if (animate && prev[key] !== null){
          node.classList.remove('tick');
          void node.offsetWidth;
          node.classList.add('tick');
        }
        prev[key] = str;
      }
    }

    function currentDiff(){ return Math.max(0, target - Date.now()); }

    function liveTick(){
      const diff = currentDiff();
      set('D', Math.floor(diff/86400000), true);
      set('H', Math.floor(diff%86400000/3600000), true);
      set('M', Math.floor(diff%3600000/60000), true);
      set('S', Math.floor(diff%60000/1000), true);
    }

    const finalDays = Math.floor(currentDiff()/86400000);
    const startTime = performance.now();
    const duration = 1600;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || finalDays === 0){
      liveTick();
      setInterval(liveTick, 1000);
      return;
    }

    function countUp(now){
      const t = Math.min((now - startTime)/duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const cur = Math.round(eased * finalDays);
      set('D', cur, false);
      if (t < 1){
        requestAnimationFrame(countUp);
      } else {
        liveTick();
        setInterval(liveTick, 1000);
      }
    }
    requestAnimationFrame(countUp);
  })();

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
