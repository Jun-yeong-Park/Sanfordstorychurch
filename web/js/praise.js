// 이번 주 찬양 — 홈 섹션 + 하루 한 번 팝업. 곡 목록은 bulletin/data.js (window.BULLETIN) 하나만 고친다.
(function(){
  const B = window.BULLETIN;
  if (!B || !Array.isArray(B.order)) return;

  const songsOf = i => (i.songs || []).filter(s => s && s.title);
  const groups = B.order.flatMap(p => p.items.filter(i => songsOf(i).length));
  const songs = groups.flatMap(songsOf);
  if (!songs.length) return;

  const en = document.documentElement.lang === 'en';
  const date = en
    ? ((B.issue && B.issue.dateEn) || '').replace(/, \d{4}$/, '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())   // "SEPTEMBER 27, 2026" → "September 27"
    : ((B.issue && B.issue.date) || '').replace(/^\d{4}년\s*/, '');
  const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const yt = s => s.url || ('https://www.youtube.com/results?search_query=' + encodeURIComponent(s.title + ' ' + (s.artist || '') + ' 찬양'));
  const rows = songs.map(s => `<li><a class="song-row" href="${esc(yt(s))}" target="_blank" rel="noopener">
    <span class="play" aria-hidden="true">▶</span>
    <span class="t">${esc(s.title)}${s.artist ? `<small>${esc(s.artist)}</small>` : ''}</span>
    <span class="hint">${s.url ? 'YouTube ↗' : (en ? 'Search ↗' : '검색 ↗')}</span></a></li>`).join('');

  // 홈 섹션
  document.getElementById('praiseList').innerHTML = rows;
  document.getElementById('praiseDate').textContent = date;
  document.getElementById('chPraise').hidden = false;

  // 팝업 — "오늘 하루 보지 않기"는 로컬 날짜 기준
  const pop = document.getElementById('praisePop');
  if (!pop || typeof pop.showModal !== 'function') return;
  document.getElementById('praisePopList').innerHTML = rows;
  document.getElementById('praisePopDate').textContent = date;

  const KEY = 'praisePopHidden';
  const d = new Date();
  const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  let hidden = false;
  try { hidden = localStorage.getItem(KEY) === today; } catch (e) {}

  document.getElementById('praisePopClose').addEventListener('click', () => pop.close());
  document.getElementById('praisePopOk').addEventListener('click', () => pop.close());
  document.getElementById('praisePopToday').addEventListener('click', () => {
    try { localStorage.setItem(KEY, today); } catch (e) {}
    pop.close();
  });
  pop.addEventListener('click', e => { if (e.target === pop) pop.close(); });   // 바깥(백드롭) 클릭

  if (!hidden) setTimeout(() => { if (!pop.open) pop.showModal(); }, 1400);
})();
