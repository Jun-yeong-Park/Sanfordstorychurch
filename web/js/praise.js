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
  // 전체 재생 — 영상 ID 를 모아 유튜브 임시 재생목록 주소를 만든다.
  // 주소를 박아두지 않으므로 주보의 곡이 바뀌면 재생목록도 따라 바뀐다.
  const idOf = u => {
    const m = String(u).match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);
    return m ? m[1] : null;
  };
  const ids = songs.map(s => idOf(s.url)).filter(Boolean);
  const all = document.getElementById('praiseAll');
  if (all && ids.length > 1){
    all.href = 'https://www.youtube.com/watch_videos?video_ids=' + ids.join(',');
    all.hidden = false;
  }

  document.getElementById('chPraise').hidden = false;

  // 찬양 팝업 — 하루 한 번. '오늘 하루 보지 않기'를 누르면 그날은 다시 안 뜬다.
  const pop = document.getElementById('praisePop');
  if (!pop || typeof pop.showModal !== 'function') return;
  document.getElementById('praisePopList').innerHTML = rows;
  document.getElementById('praisePopDate').textContent = date;
  const popAll = document.getElementById('praisePopAll');
  if (all && !all.hidden){ popAll.href = all.href; popAll.hidden = false; }

  const KEY = 'praisePopHidden';
  const t = new Date();
  const today = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  try { if (localStorage.getItem(KEY) === today) return; } catch (e) {}

  pop.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => pop.close()));
  pop.querySelector('[data-today]').addEventListener('click', () => {
    try { localStorage.setItem(KEY, today); } catch (e) {}
    pop.close();
  });
  pop.addEventListener('click', e => { if (e.target === pop) pop.close(); });   // 바깥(백드롭) 클릭
  setTimeout(() => pop.showModal(), 1200);
})();
