// 홈 전용 — 히어로 영상 · "이번 주" 스트립 · 초대 화면.
// bulletin/data.js 다음에 defer 로 실행된다.
(() => {
  const en = document.documentElement.lang === 'en';
  const root = en ? '../' : '';

  // 히어로 영상 — 한 편 반복. 탭을 떠났다 돌아오면 브라우저가 멈춘 영상을 다시 돌린다.
  const v = document.querySelector('.hero-video');
  if (v && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const go = () => v.play().then(() => v.classList.add('on')).catch(() => {});
    v.loop = true; v.src = root + 'assets/video/hero-group.mp4'; go();
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') go(); });
  }

  const B = window.BULLETIN; if (!B) return;
  const set = (id, t) => { const e = document.getElementById(id); if (e && t) e.textContent = t; };

  // 이번 주 스트립 — 말씀 · 찬양 · 주보는 data.js 에서
  const S = B.sermon || {};
  const title = en ? S.titleEn : S.title;
  const ready = title && title !== '준비 중' && title !== 'COMING SOON';
  set('wkSermon', ready ? title : (en ? 'Coming soon' : '준비 중'));
  set('wkSermonMeta', ready
    ? [en ? S.scriptureEn : S.scripture, en ? S.preacherEn : S.preacher].filter(Boolean).join(' · ')
    : (en ? S.preacherEn : S.preacher));
  const songs = B.order.flatMap(p => p.items.flatMap(i => i.songs || [])).filter(s => s && s.title);
  set('wkSongs', songs.slice(0, 2).map(s => s.title).join(' · ') + (songs.length > 2 ? (en ? ' & more' : ' 외') : ''));
  set('wkSongsMeta', en ? songs.length + ' songs · Kanghyeon Heo' : songs.length + '곡 · 허강현 전도사');
  set('wkIssue', en
    ? ((B.issue.dateEn || '').replace(/, \d{4}$/, '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) + ' Bulletin')
    : ((B.issue.date || '').replace(/^\d{4}년\s*/, '') + ' 주보'));

  // 초대 화면 — 날짜는 히어로의 "다음 주일" 계산(js/site.js)을 그대로
  set('invDate', document.getElementById('nextDate')?.textContent);
  // 주황 화면이 상단 바 아래로 들어오면 바에 어두운 띠
  const bar = document.querySelector('.brand-bar'), inv = document.getElementById('invite');
  if (bar && inv) new IntersectionObserver(([e]) => bar.classList.toggle('on-orange', e.isIntersecting),
    { rootMargin: '0px 0px -92% 0px' }).observe(inv);
})();
