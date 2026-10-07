// 편지 홈 — 봉투 열림(첫 방문 한 번) · 날짜 · 이번 주(data.js) · 문단 등장. data.js 다음에 defer.
(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const en = document.documentElement.lang === 'en';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = document.getElementById('intro');
  let seen = false;
  try { seen = sessionStorage.getItem('envSeen') === '1'; } catch (e) {}
  if (intro && !reduce && !seen){
    intro.hidden = false; document.body.classList.add('has-intro');
    scrollTo(0, 0);
    addEventListener('load', () => scrollTo(0, 0), { once: true });   // 새로고침 때 브라우저가 스크롤을 되돌려도 봉투부터
    const span = () => intro.offsetHeight - innerHeight;   // 스크롤 가능한 길이
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, scrollY / span()));
      intro.style.setProperty('--p', p.toFixed(4));
      intro.classList.toggle('past-half', p > .5);
      if (p >= 1 && !seen){ seen = true; try { sessionStorage.setItem('envSeen', '1'); } catch (e) {} }
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', update);
    update();
    // 봉투를 누르면 끝까지 부드럽게 열어 준다
    document.getElementById('envBox').addEventListener('click', () => scrollTo({ top: span(), behavior: 'smooth' }));
  }

  const d = new Date(); d.setDate(d.getDate() + (7 - d.getDay()) % 7);
  const ld = document.getElementById('letterDate');
  if (ld) ld.textContent = en ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : (d.getMonth() + 1) + '월 ' + d.getDate() + '일 주일';
  const pm = document.getElementById('postmarkDate');
  if (pm) pm.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  const B = window.BULLETIN;
  if (B){
    const S = B.sermon || {};
    const title = en ? S.titleEn : S.title;
    const ready = title && title !== '준비 중' && title !== 'COMING SOON';
    if (ready){
      document.getElementById('wkWord').hidden = false;
      document.getElementById('wkSermon').textContent = title;
      document.getElementById('wkSermonMeta').textContent = (en ? [S.scriptureEn, S.preacherEn] : [S.scripture, S.preacher]).filter(Boolean).join(' · ');
    }
    const songs = B.order.flatMap(p => p.items.flatMap(i => i.songs || [])).filter(s => s && s.title);
    const row = document.getElementById('wkSongsRow');
    if (!songs.length) row.hidden = true;
    else {
      // 곡마다 한 줄. 링크 있는 곡은 그 곡으로
      const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
      document.getElementById('wkSongs').innerHTML = songs.map((s, i) =>
        s.url ? `<a class="song" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="song-n">${i + 1}</span>${esc(s.title)}</a>`
              : `<span class="song"><span class="song-n">${i + 1}</span>${esc(s.title)}</span>`).join('');
      const ids = songs.map(s => (String(s.url).match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/) || [])[1]).filter(Boolean);
      if (ids.length > 1){ row.href = 'https://www.youtube.com/watch_videos?video_ids=' + ids.join(','); row.target = '_blank'; row.rel = 'noopener'; }
    }
    document.getElementById('wkIssue').textContent = en
      ? (B.issue.dateISO ? new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(B.issue.dateISO)) + ' Bulletin' : 'This week’s bulletin')
      : (B.issue.date || '').replace(/^\d{4}년\s*/, '') + ' 주보';
  }

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal-line').forEach(el => io.observe(el));
})();
