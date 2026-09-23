// 첫 예배 일정 띠 + 선물 섹션 노출 + 팝업 3개(선물 · 찬양 · 장소).
// 모달은 한 번에 하나만 뜰 수 있으므로, 하나를 닫으면 다음이 뜨는 방식으로 셋을 차례로 보여준다.
// bulletin/data.js 와 js/praise.js 다음에 실행된다.
(function(){
  const B = window.BULLETIN || {};
  const LAUNCH = new Date('2026-09-27T18:00:00-04:00').getTime();
  const before = Date.now() < LAUNCH;
  const set = (id, text) => { const el = document.getElementById(id); if (el && text) el.textContent = text; };

  // 첫 예배 일정 띠
  if (B.issue && B.sermon){
    set('fbDate', (B.issue.date || '').replace(/^\d{4}년\s*/, ''));
    set('fbTime', B.issue.service);
    set('fbTitle', B.sermon.title);
    set('fbMeta', [B.sermon.scripture, B.sermon.preacher].filter(Boolean).join(' · '));
    const band = document.getElementById('firstband');
    if (band) band.hidden = false;
  }

  // 첫 예배가 지나면 선물 안내는 내린다 ("첫 예배에 오시는 분들께" 가 틀린 말이 되므로)
  const giftSec = document.getElementById('gift');
  if (giftSec) giftSec.hidden = !before;

  // 찬양 목록은 본문에 이미 그려져 있으니 그대로 가져온다 (같은 코드를 두 번 쓰지 않도록)
  const src = document.getElementById('praiseList');
  const dst = document.getElementById('popSongsList');
  if (src && dst) dst.innerHTML = src.innerHTML;

  const queue = [
    document.getElementById('popGift'),
    dst && dst.children.length ? document.getElementById('popSongs') : null,
    document.getElementById('popPlace'),
  ].filter(d => d && typeof d.showModal === 'function');

  if (!before){
    const g = document.getElementById('popGift');
    if (g){ g.remove(); const k = queue.indexOf(g); if (k > -1) queue.splice(k, 1); }
  }
  if (!queue.length) return;

  // 1 / 3, 2 / 3 … 남은 팝업 수에 맞춰 번호를 다시 매긴다
  queue.forEach((d, n) => {
    const step = d.querySelector('.pop-step');
    if (step) step.textContent = (n + 1) + ' / ' + queue.length;
    const next = d.querySelector('.pop-next');
    if (next && n === queue.length - 1) next.textContent = '닫기';
  });

  const KEY = 'homePopHidden';
  const d0 = new Date();
  const today = d0.getFullYear() + '-' + String(d0.getMonth() + 1).padStart(2, '0') + '-' + String(d0.getDate()).padStart(2, '0');
  let stopped = false;
  try { stopped = localStorage.getItem(KEY) === today; } catch (e) {}
  if (stopped) return;

  let at = 0;
  function openNext(){
    if (stopped || at >= queue.length) return;
    if (queue.some(d => d.open)) return;   // 이미 하나가 떠 있으면 겹쳐 띄우지 않는다
    const d = queue[at++];
    d.showModal();
  }

  queue.forEach(d => {
    d.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => d.close()));
    d.querySelectorAll('[data-today]').forEach(b => b.addEventListener('click', () => {
      stopped = true;
      try { localStorage.setItem(KEY, today); } catch (e) {}
      d.close();
    }));
    d.addEventListener('click', e => { if (e.target === d) d.close(); });   // 바깥(백드롭) 클릭
    d.addEventListener('close', () => setTimeout(openNext, 180));           // 닫으면 다음 팝업
  });

  setTimeout(openNext, 1200);
})();
