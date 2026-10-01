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
  // 링크가 있는 곡만 누를 수 있게 한다. 없으면 번호만 붙인 줄로 (누를 수 없는데
  // ▶ 를 띄우거나 검색으로 보내면 엉뚱한 영상으로 가기 때문)
  const body = s => `<span class="t">${esc(s.title)}${s.artist ? `<small>${esc(s.artist)}</small>` : ''}</span>`;
  const rows = songs.map((s, i) => s.url
    ? `<li><a class="song-row" href="${esc(s.url)}" target="_blank" rel="noopener">
    <span class="play" aria-hidden="true">▶</span>${body(s)}
    <span class="hint">YouTube ↗</span></a></li>`
    : `<li><div class="song-row song-row--plain">
    <span class="play play--n" aria-hidden="true">${i + 1}</span>${body(s)}</div></li>`).join('');

  // 홈 섹션
  document.getElementById('praiseList').innerHTML = rows;
  document.getElementById('praiseDate').textContent = date;
  document.getElementById('chPraise').hidden = false;
})();
