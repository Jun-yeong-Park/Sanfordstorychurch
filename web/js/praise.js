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
  // 지난 주보가 남아 있으면 '이번 주 찬양'이 아니므로 띄우지 않는다
  const t = new Date();
  const today = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  if (B.issue && B.issue.dateISO && B.issue.dateISO >= today){
    document.getElementById('chPraise').hidden = false;
  }
})();
