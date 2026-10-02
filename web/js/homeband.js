// 홈 '예배 안내 띠' — 주보(bulletin/data.js)에서 이번 말씀을 가져온다.
// bulletin/data.js 다음에 실행된다.
(function(){
  // 주보가 이번 주 것인지 (지난 주보면 '이번 말씀'·'이번 주 찬양'을 띄우지 않는다)
  function isFresh(B){
    const iso = B && B.issue && B.issue.dateISO;
    if (!iso) return false;
    const t = new Date();
    const today = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    return iso >= today;
  }

  const B = window.BULLETIN || {};
  const set = (id, text) => { const el = document.getElementById(id); if (el && text) el.textContent = text; };
  const en = document.documentElement.lang === 'en';
  const titleCase = t => (t || '').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());   // "LOVE LETTER" → "Love Letter"

  // 첫 예배 일정 띠 (영어 페이지는 …En 값)
  if (B.issue && B.sermon){
    set('fbTitle', en ? titleCase(B.sermon.titleEn) : B.sermon.title);
    set('fbMeta', (en ? [B.sermon.scriptureEn, B.sermon.preacherEn] : [B.sermon.scripture, B.sermon.preacher]).filter(Boolean).join(' · '));
    const band = document.getElementById('firstband');
    if (band) band.hidden = false;
    // 지난 주 주보가 남아 있거나 설교가 아직 안 정해졌으면 '이번 말씀' 칸을 띄우지 않는다
    // (빈 칸이 뜨는 것보다 아예 없는 편이 낫다)
    const w = document.getElementById('fbWord');
    const hasSermon = !!(en ? B.sermon.titleEn : B.sermon.title);
    if (w && isFresh(B) && hasSermon) w.hidden = false;
  }
})();
