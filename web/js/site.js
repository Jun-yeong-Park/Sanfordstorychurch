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

  // 히어로의 '이번 주일'. 날짜를 박아두면 지날 때마다 낡으므로 매번 계산한다.
  (function(){
    const el = document.getElementById('nextDate');
    if (!el) return;
    const en = document.documentElement.lang === 'en';
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
    let add = (7 - d.getDay()) % 7;                       // 다음 일요일까지 남은 날
    if (add === 0 && now.getTime() > d.getTime()) add = 7; // 일요일 저녁 6시가 지났으면 다음 주
    d.setDate(d.getDate() + add);
    el.textContent = en
      ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (주일)';
  })();


  // 홈 로고를 누르면 편지를 처음부터(봉투부터) 다시 연다
  document.querySelectorAll('a.bmark').forEach(a => a.addEventListener('click', () => {
    try { sessionStorage.removeItem('envSeen'); } catch (e) {}
  }));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  // 메뉴 — 데스크탑은 드롭다운, 모바일은 서랍
  (function(){
    const tops = [...document.querySelectorAll('.tn-top')];
    function closeAll(except){
      tops.forEach(t => {
        if (t === except) return;
        t.setAttribute('aria-expanded', 'false');
        const m = document.getElementById(t.getAttribute('aria-controls'));
        if (m) m.hidden = true;
      });
    }
    tops.forEach(t => t.addEventListener('click', e => {
      e.stopPropagation();
      const open = t.getAttribute('aria-expanded') === 'true';
      closeAll(t);
      t.setAttribute('aria-expanded', open ? 'false' : 'true');
      const m = document.getElementById(t.getAttribute('aria-controls'));
      if (m) m.hidden = open;
    }));
    document.addEventListener('click', () => closeAll(null));

    const drawer = document.getElementById('drawer');
    const btn = document.getElementById('menubtn');
    const x = document.getElementById('drawerClose');
    function setDrawer(on){
      if (!drawer || !btn) return;
      drawer.hidden = !on;
      btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.body.style.overflow = on ? 'hidden' : '';
    }
    if (btn) btn.addEventListener('click', e => { e.stopPropagation(); setDrawer(drawer.hidden); });
    if (x) x.addEventListener('click', () => setDrawer(false));
    addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      closeAll(null);
      if (drawer && !drawer.hidden) setDrawer(false);
    });
  })();

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


  // 메일 버튼 — mailto 는 메일 앱이 연결돼 있지 않거나(대부분의 PC·폰) 카카오톡 같은 앱 안 브라우저에선
  // 눌러도 아무 일이 없다. 그래서 누르면 연락 방법을 고르는 창을 띄운다: 메일 앱 · 주소 복사 · 인스타그램 DM.
  (function(){
    const en = document.documentElement.lang === 'en';
    const T = en
      ? { title:'Get in touch', mail:'Open mail app', copy:'Copy address', copied:'Copied', ig:'Message on Instagram', close:'Close', note:'If your mail app does not open, copy the address or send us a message on Instagram.' }
      : { title:'연락하기', mail:'메일 앱으로 보내기', copy:'주소 복사', copied:'복사했습니다', ig:'인스타그램 DM 보내기', close:'닫기', note:'메일 앱이 열리지 않으면 주소를 복사하시거나 인스타그램 메시지로 연락 주세요.' };
    let dlg = null;
    function build(){
      dlg = document.createElement('dialog');
      dlg.className = 'contact-sheet';
      dlg.setAttribute('aria-labelledby', 'csTitle');
      dlg.innerHTML =
        '<button type="button" class="cs-x" aria-label="' + T.close + '">&times;</button>' +
        '<h2 id="csTitle">' + T.title + '</h2>' +
        '<p class="cs-addr" id="csAddr"></p>' +
        '<div class="cs-actions">' +
          '<a class="cs-btn cs-btn--fill" id="csMail" href="#">' + T.mail + '</a>' +
          '<button type="button" class="cs-btn" id="csCopy">' + T.copy + '</button>' +
          '<a class="cs-btn" href="https://ig.me/m/storychurch_sanford" target="_blank" rel="noopener">' + T.ig + ' ↗</a>' +
        '</div>' +
        '<p class="cs-note">' + T.note + '</p>';
      document.body.appendChild(dlg);
      dlg.querySelector('.cs-x').addEventListener('click', () => dlg.close());
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      dlg.querySelector('#csCopy').addEventListener('click', async e => {
        const addr = dlg.querySelector('#csAddr').textContent, b = e.currentTarget;
        try { await navigator.clipboard.writeText(addr); }
        catch (err) { const r = document.createRange(); r.selectNodeContents(dlg.querySelector('#csAddr')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand('copy'); }
        b.textContent = T.copied; setTimeout(() => { b.textContent = T.copy; }, 1800);
      });
    }
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="mailto:"]');
      if (!a || a.closest('.contact-sheet') || typeof HTMLDialogElement === 'undefined') return;
      e.preventDefault();
      if (!dlg) build();
      dlg.querySelector('#csAddr').textContent = a.getAttribute('href').slice(7).split('?')[0];
      dlg.querySelector('#csMail').href = a.getAttribute('href');
      const drawer = document.getElementById('drawer'); if (drawer && !drawer.hidden) document.getElementById('drawerClose')?.click();
      dlg.showModal();
    });
  })();

})();
