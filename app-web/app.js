// ============================================================
// Story App — 해시 라우터 + 4개 화면 (주보 / 노트 / 나눔 / 교회)
//   주보 데이터: data/bulletin.js (../bulletin/data.js 의 복사본, ./sync.sh 로 갱신)
// ============================================================
const D = window.BULLETIN;
const CFG = window.APP_CONFIG || {};
const $ = (sel, el = document) => el.querySelector(sel);
const view = $("#view");
const photoInput = $("#photoInput");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// 주보 날짜 "2026년 9월 27일" → "2026-09-27" (노트·첨부 키)
const ISSUE = (() => {
  const m = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/.exec(D.issue.date);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : D.issue.date;
})();
const fmtTime = iso => new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtDate = id => { const [y, m, d] = id.split("-"); return d ? `${y}년 ${+m}월 ${+d}일` : id; };
const kv = rows => rows.map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join("");
const newNote = issue => ({ issue, title: D.sermon.title, scripture: D.sermon.scripture, preacher: D.sermon.preacher, outline: D.sermon.outline || [], text: {}, updated_at: null });

// ---------------- 주보 ----------------
function viewBulletin() {
  const c = D.church;
  const order = D.order.map(p => `
    <div class="part">
      <div class="part-h"><span class="tag">${p.tag}</span><span class="nm">${p.name}</span><span class="sub">${p.sub}</span></div>
      ${p.items.map(i => `<div class="it"><b>${i.name}</b>${i.by ? `<span class="by">${i.by}</span>` : ""}${i.detail ? `<span class="d">${i.detail}</span>` : ""}</div>`).join("")}
    </div>`).join("");
  const news = D.news.map((n, i) => `<div class="item"><i>${String(i + 1).padStart(2, "0")}</i><div><b>${n.title}</b>${n.body}</div></div>`).join("");
  const groups = D.groups.map(g => `<div class="grp"><b>${g.name}</b> · ${g.desc}<span>${g.when} · ${g.contact}</span></div>`).join("");
  const prayers = D.prayers.map(p => `<li>${p}</li>`).join("");
  const outline = (D.sermon.outline || []).map(o => `<li>${o}</li>`).join("");

  view.innerHTML = `
  <section class="sec navy cover">
    <div class="top"><span>${D.issue.label}</span><span>${D.issue.volume}</span></div>
    <img class="logo" src="assets/logo-white.svg" alt="Sanford Story Church">
    <div class="display slogan">GOD'S STORY<br>BEGINS IN<br><em>YOUR LIFE.</em></div>
    <div class="slogan-ko">${c.taglineKo}</div>
    <div class="date">
      <div><div class="big">${D.issue.dateEn}</div><div class="ko">${D.issue.date}</div></div>
      <div class="svc">Sunday Worship<small>${D.issue.service}</small></div>
    </div>
    <div class="sermon"><div class="t">${D.sermon.title}</div><div class="s">${D.sermon.scripture} · ${D.sermon.preacher}</div></div>
  </section>

  <section class="sec order">
    <div class="h-sec"><span class="display">ORDER OF WORSHIP</span><span class="ko">예배 순서</span></div>
    ${order}
  </section>

  <section class="sec navy verse">
    <div class="eyebrow">Today's Scripture · 오늘의 말씀</div>
    <p>${D.sermon.excerpt}</p>
    <div class="ref">${D.sermon.excerptRef}</div>
  </section>

  <section class="sec white sermon-sec">
    <div class="h-sec"><span class="display">SERMON</span><span class="ko">오늘의 설교</span></div>
    <div class="t">${D.sermon.title}</div>
    <div class="s">${D.sermon.scripture} · ${D.sermon.scriptureEn}<br>${D.sermon.preacher}</div>
    ${outline ? `<ul class="outline">${outline}</ul>` : ""}
    <a class="btn block" href="#notes/${ISSUE}">✍️ &nbsp;설교 노트 쓰기</a>
  </section>

  <section class="sec news">
    <div class="h-sec"><span class="display">STORY NEWS</span><span class="ko">교회 소식</span></div>
    ${news}
  </section>

  <section class="sec navy">
    <h4 class="sub">Small Groups · 모임</h4>${groups}
    <h4 class="sub">Prayer · 기도 제목</h4><ul class="pr">${prayers}</ul>
  </section>

  <section class="sec">
    <h4 class="sub">Next Week · 다음 주</h4>
    <div class="kv">${kv([["날짜", D.nextWeek.date], ["본문", D.nextWeek.scripture], ["제목", D.nextWeek.title], ["섬김", D.nextWeek.serving]])}</div>
    <h4 class="sub">Serving · 섬기는 분들</h4>
    <div class="kv">${kv([...D.team, ...D.thisWeek].map(t => [t.role, t.name]))}</div>
  </section>

  <section class="sec navy foot">
    <img class="logo" src="assets/logo-white.svg" alt="">
    <b>${c.nameKo} ${c.nameEn}</b><br>${c.address}<br>
    <em>${c.web}</em> · ${c.instagram}<br>${c.email}<br>${c.giving}<br>
    <span style="opacity:.6">${c.legal}</span>
  </section>`;
}

// ---------------- 노트 목록 ----------------
async function viewNotes() {
  const notes = (await DB.all("notes")).sort((a, b) => b.issue.localeCompare(a.issue));
  const atts = await DB.all("attachments");
  const count = issue => atts.filter(a => a.issue === issue).length;
  const cur = notes.find(n => n.issue === ISSUE);
  const card = (n, navy) => `<a class="card${navy ? " navy" : ""}" href="#notes/${n.issue}">
      <div class="eyebrow">${navy ? "This Sunday · " + D.issue.dateEn : fmtDate(n.issue)}</div>
      <div class="t">${esc(n.title)}</div><div class="s">${esc(n.scripture)} · ${esc(n.preacher)}</div>
      <div class="meta"><span>${n.updated_at ? "저장 " + fmtTime(n.updated_at) : "아직 노트 없음"}</span>${count(n.issue) ? `<span>첨부 ${count(n.issue)}</span>` : ""}<span class="cta">열기 →</span></div></a>`;
  const past = notes.filter(n => n.issue !== ISSUE);
  view.innerHTML = `<section class="sec">
    <div class="h-sec"><span class="display">MY NOTES</span><span class="ko">설교 노트</span></div>
    ${card(cur || newNote(ISSUE), true)}
    ${past.length ? `<h4 class="sub" style="margin-top:28px">지난 노트</h4>${past.map(n => card(n)).join("")}` : ""}
    <p class="note-tip">노트·사진·손글씨는 이 기기에만 저장됩니다. 나누고 싶은 내용은 [나눔]에 올리거나 [공유]로 보내세요.</p>
  </section>`;
}

// ---------------- 노트 편집 ----------------
async function viewEditor(issue) {
  let note = await DB.get("notes", issue);
  if (!note) {
    if (issue !== ISSUE) { location.hash = "#notes"; return; }
    note = newNote(issue);
  }
  const fields = [
    ...note.outline.map((pt, i) => ({ key: "o" + i, label: pt })),
    { key: "free", label: "자유 노트", sub: "들으며 마음에 남은 말씀, 질문" },
  ];
  view.innerHTML = `
  <section class="sec navy ed-head">
    <a class="eyebrow" href="#notes">← My Notes · ${issue}</a>
    <div class="t">${esc(note.title)}</div><div class="s">${esc(note.scripture)} · ${esc(note.preacher)}</div>
    <div class="saved" id="saved">${note.updated_at ? "저장됨 · " + fmtTime(note.updated_at) : ""}</div>
  </section>
  ${fields.map(f => `<div class="field"><label>${esc(f.label)}${f.sub ? `<small>${f.sub}</small>` : ""}</label><textarea data-key="${f.key}" rows="1">${esc(note.text[f.key] || "")}</textarea></div>`).join("")}
  <div class="field story"><label>My Story Card · 오늘의 결단<small>오늘 말씀을 들고 이번 주 내 삶에서 살아낼 한 가지</small></label><textarea data-key="story" rows="1">${esc(note.text.story || "")}</textarea></div>
  <div class="field"><label>기도 제목<small>테이블 나눔 · 중보기도에서 함께 기도할 것</small></label><textarea data-key="prayer" rows="1">${esc(note.text.prayer || "")}</textarea></div>
  <div class="attach">
    <div class="h-sec"><span class="display">ATTACH</span><span class="ko">주보 사진 · 손글씨</span></div>
    <div class="row"><button class="btn ghost sm ko" id="btnPhoto">📷 종이 주보 찍기</button><a class="btn ghost sm ko" href="#notes/${issue}/draw">✍️ 손글씨 메모</a></div>
    <div class="grid" id="attGrid"></div>
  </div>
  <div class="ed-actions">
    <button class="btn ghost ko block" id="btnShare">공유하기 (카톡 · 메시지)</button>
    <a class="btn ko block" href="#wall?from=${issue}">나눔 벽에 결단 올리기</a>
  </div>`;

  let timer;
  const save = () => { clearTimeout(timer); timer = setTimeout(async () => {
    note.updated_at = new Date().toISOString(); await DB.put("notes", note);
    $("#saved").textContent = "저장됨 · " + fmtTime(note.updated_at);
  }, 400); };
  view.querySelectorAll("textarea").forEach(t => {
    autosize(t);
    t.addEventListener("input", () => { autosize(t); note.text[t.dataset.key] = t.value; save(); });
  });
  $("#btnPhoto").onclick = () => { photoInput.value = ""; photoInput.click(); };
  photoInput.onchange = async () => {
    const f = photoInput.files[0]; if (!f) return;
    const blob = await shrink(f);
    await DB.put("attachments", { id: crypto.randomUUID(), issue, kind: "photo", blob, created_at: new Date().toISOString() });
    save(); renderAttachments(issue);
  };
  $("#btnShare").onclick = () => shareNote(note);
  renderAttachments(issue);
}
function autosize(t) { t.style.height = "auto"; t.style.height = t.scrollHeight + "px"; }

// 사진은 긴 변 1600px, JPEG 로 줄여서 저장 (IndexedDB 용량 절약)
async function shrink(file, max = 1600) {
  const img = new Image(); img.src = URL.createObjectURL(file);
  await img.decode();
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(img.src);
  return new Promise(res => c.toBlob(res, "image/jpeg", .86));
}

async function renderAttachments(issue) {
  const g = $("#attGrid"); if (!g) return;
  const atts = (await DB.byIssue(issue)).sort((a, b) => a.created_at.localeCompare(b.created_at));
  g.innerHTML = atts.length ? "" : `<div class="empty" style="grid-column:1/-1;padding:14px 0 0">아직 첨부가 없어요. 종이 주보에 적은 메모를 찍어 두거나 손글씨로 남겨보세요.</div>`;
  atts.forEach(a => {
    const url = URL.createObjectURL(a.blob);
    const el = document.createElement("div"); el.className = "th";
    el.innerHTML = `<img src="${url}" alt=""><i>${a.kind === "photo" ? "사진" : "손글씨"}</i>`;
    el.onclick = () => openViewer(a, url);
    g.appendChild(el);
  });
}
function openViewer(a, url) {
  const v = document.createElement("div"); v.id = "viewer";
  v.innerHTML = `<img src="${url}" alt=""><div class="bar"><button class="btn ghost sm ko" id="vDel" style="color:#F4F0E6;border-color:#F4F0E6">삭제</button><button class="btn sm ko" id="vClose">닫기</button></div>`;
  document.body.appendChild(v);
  $("#vClose", v).onclick = () => v.remove();
  $("#vDel", v).onclick = async () => {
    if (!confirm("이 첨부를 삭제할까요?")) return;
    await DB.del("attachments", a.id); v.remove(); renderAttachments(a.issue);
  };
}

function noteToText(n) {
  const L = [n.title, `${n.scripture} · ${n.preacher} · ${fmtDate(n.issue)}`, ""];
  n.outline.forEach((pt, i) => { if (n.text["o" + i]) L.push(pt, n.text["o" + i], ""); });
  if (n.text.free) L.push("노트", n.text.free, "");
  if (n.text.story) L.push("My Story Card · 오늘의 결단", n.text.story, "");
  if (n.text.prayer) L.push("기도 제목", n.text.prayer, "");
  L.push("— 샌포드 스토리교회 Story App");
  return L.join("\n");
}
async function shareNote(n) {
  const text = noteToText(n);
  if (navigator.share) { try { await navigator.share({ title: n.title, text }); } catch (_) {} return; }
  await navigator.clipboard.writeText(text);
  alert("노트를 복사했어요. 카톡 등에 붙여넣기 하세요.");
}

// ---------------- 손글씨 ----------------
function viewDraw(issue) {
  view.innerHTML = `<div class="draw">
    <div class="tools">
      <button data-c="#0F1E34" class="on"><span class="sw" style="background:#0F1E34"></span></button>
      <button data-c="#FF9A1F"><span class="sw" style="background:#FF9A1F"></span></button>
      <button data-c="erase">지움</button>
      <button id="dThick">굵게</button>
      <span class="sp"></span>
      <button id="dUndo">↶</button><button id="dClear">전체</button>
      <button id="dCancel">✕</button><button class="save" id="dSave">저장</button>
    </div>
    <canvas id="pad"></canvas></div>`;
  const c = $("#pad"), ctx = c.getContext("2d");
  const strokes = []; let cur = null, color = "#0F1E34", thick = false;
  const W = () => c.getBoundingClientRect();
  const style = s => { ctx.strokeStyle = s.color === "erase" ? "#F4F0E6" : s.color; ctx.lineWidth = s.color === "erase" ? 24 : s.width; ctx.lineCap = ctx.lineJoin = "round"; };
  function paper() {
    const r = W(); ctx.fillStyle = "#F4F0E6"; ctx.fillRect(0, 0, r.width, r.height);
    ctx.strokeStyle = "#D7D9DD"; ctx.lineWidth = 1;
    for (let y = 36; y < r.height; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(r.width, y); ctx.stroke(); }
  }
  function redraw() {
    paper();
    strokes.forEach(s => { style(s); ctx.beginPath(); s.pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); });
  }
  function size() { const r = W(), dpr = devicePixelRatio || 1; c.width = r.width * dpr; c.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); redraw(); }
  const pos = e => { const r = W(); return [e.clientX - r.left, e.clientY - r.top]; };
  c.onpointerdown = e => { c.setPointerCapture(e.pointerId); cur = { color, width: thick ? 6 : 3, pts: [pos(e)] }; strokes.push(cur); style(cur); ctx.beginPath(); ctx.arc(...cur.pts[0], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); };
  c.onpointermove = e => {
    if (!cur) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    style(cur); ctx.beginPath(); ctx.moveTo(...cur.pts[cur.pts.length - 1]);
    evs.forEach(ev => { const p = pos(ev); cur.pts.push(p); ctx.lineTo(...p); });
    ctx.stroke();
  };
  c.onpointerup = c.onpointercancel = () => { cur = null; };
  view.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { color = b.dataset.c; view.querySelectorAll("[data-c]").forEach(x => x.classList.toggle("on", x === b)); });
  $("#dThick").onclick = e => { thick = !thick; e.currentTarget.classList.toggle("on", thick); };
  $("#dUndo").onclick = () => { strokes.pop(); redraw(); };
  $("#dClear").onclick = () => { if (strokes.length && !confirm("모두 지울까요?")) return; strokes.length = 0; redraw(); };
  $("#dCancel").onclick = () => { if (strokes.length && !confirm("저장하지 않고 나갈까요?")) return; location.hash = "#notes/" + issue; };
  $("#dSave").onclick = () => c.toBlob(async blob => {
    await DB.put("attachments", { id: crypto.randomUUID(), issue, kind: "drawing", blob, created_at: new Date().toISOString() });
    const n = (await DB.get("notes", issue)) || newNote(issue); n.updated_at = new Date().toISOString(); await DB.put("notes", n);
    location.hash = "#notes/" + issue;
  }, "image/png");
  requestAnimationFrame(size);
  window.onresize = () => document.body.classList.contains("drawing") && size();
}

// ---------------- 나눔 벽 ----------------
async function viewWall(params) {
  let kind = "share";
  const from = params.from ? await DB.get("notes", params.from) : null;
  view.innerHTML = `<section class="sec">
    <div class="h-sec"><span class="display">STORY WALL</span><span class="ko">은혜 나눔 · 기도</span></div>
    ${Wall.remote ? "" : `<div class="banner"><b>지금은 이 기기에만 저장됩니다.</b> 교회 전체가 함께 보려면 관리자가 Supabase를 연결해야 해요 (app/supabase/README.md).</div>`}
    <div class="compose">
      <div class="kinds"><button data-k="share" class="on">은혜 나눔</button><button data-k="prayer">기도 부탁</button></div>
      <input id="wName" placeholder="이름" maxlength="20" value="${esc(localStorage.getItem("story.name") || "")}">
      <textarea id="wBody" placeholder="오늘 말씀에서 받은 은혜 한 가지, 또는 함께 기도할 제목" maxlength="1000">${esc(from?.text.story || "")}</textarea>
      <div class="row"><span class="dim" style="font-size:12px">${D.issue.date} 주보</span><button class="btn sm ko" id="wPost">올리기</button></div>
    </div>
    <div id="posts"><div class="empty">불러오는 중…</div></div>
  </section>`;
  view.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { kind = b.dataset.k; view.querySelectorAll("[data-k]").forEach(x => x.classList.toggle("on", x === b)); });
  $("#wPost").onclick = async () => {
    const author = $("#wName").value.trim(), body = $("#wBody").value.trim();
    if (!author) return $("#wName").focus();
    if (!body) return $("#wBody").focus();
    $("#wPost").disabled = true;
    try {
      await Wall.add({ kind, author, body, issue: ISSUE });
      localStorage.setItem("story.name", author); $("#wBody").value = "";
      await loadPosts();
    } catch (e) { alert(e.message); }
    $("#wPost").disabled = false;
  };
  await loadPosts();
}
async function loadPosts() {
  const box = $("#posts"); if (!box) return;
  const amened = new Set(JSON.parse(localStorage.getItem("story.amened") || "[]"));
  let posts;
  try { posts = await Wall.list(); } catch (e) { box.innerHTML = `<div class="empty">${esc(e.message)}</div>`; return; }
  if (!posts.length) { box.innerHTML = `<div class="empty">첫 이야기를 올려보세요.</div>`; return; }
  box.innerHTML = posts.map(p => `<div class="post" data-id="${p.id}">
      <div class="who"><span class="chip${p.kind === "prayer" ? " prayer" : ""}">${p.kind === "prayer" ? "기도 부탁" : "은혜 나눔"}</span><b>${esc(p.author)}</b><span>${fmtTime(p.created_at)}</span></div>
      <div class="body">${esc(p.body)}</div>
      <button class="amen${amened.has(p.id) ? " on" : ""}">🙏 아멘 <span>${p.amen_count}</span></button>
    </div>`).join("");
  box.querySelectorAll(".post").forEach(el => {
    const btn = $(".amen", el), id = el.dataset.id;
    btn.onclick = async () => {
      if (amened.has(id)) return;
      amened.add(id); localStorage.setItem("story.amened", JSON.stringify([...amened]));
      btn.classList.add("on"); $("span", btn).textContent = +$("span", btn).textContent + 1;
      try { await Wall.amen(id); } catch (e) { alert(e.message); }
    };
  });
}

// ---------------- 교회 ----------------
function viewChurch() {
  const c = D.church;
  const groups = D.groups.map(g => `<div class="grp"><b>${g.name}</b> · ${g.desc}<span>${g.when} · ${g.contact}</span></div>`).join("");
  view.innerHTML = `
  <section class="sec navy church-hero">
    <img class="logo" src="assets/logo-white.svg" alt="Sanford Story Church">
    <div class="display tag">GOD'S STORY<br>BEGINS IN <em>YOUR LIFE.</em></div>
    <div class="ko">${c.taglineKo}</div>
    <div class="row"><a class="btn" href="${CFG.siteUrl}" target="_blank" rel="noopener">Website ↗</a><a class="btn ghost" href="https://instagram.com/${c.instagram.replace("@", "")}" target="_blank" rel="noopener">Instagram</a></div>
  </section>
  <section class="sec">
    <div class="h-sec"><span class="display">VISIT</span><span class="ko">예배 안내</span></div>
    <div class="kv">${kv([
      ["예배", "주일 " + D.issue.service],
      ["장소", `<a href="https://maps.apple.com/?q=${encodeURIComponent(c.address)}" target="_blank" rel="noopener">${c.address}</a>`],
      ["이메일", `<a href="mailto:${c.email}">${c.email}</a>`],
      ["헌금", c.giving],
      ["소속", c.legal],
    ])}</div>
    <div class="site-meta" id="siteMeta"></div>
  </section>
  <section class="sec navy">
    <h4 class="sub">Small Groups · 모임</h4>${groups}
    <h4 class="sub">Serving · 섬기는 분들</h4><div class="kv">${kv(D.team.map(t => [t.role, t.name]))}</div>
  </section>
  <section class="sec">
    <div class="h-sec"><span class="display">ADD TO HOME</span><span class="ko">홈 화면에 추가</span></div>
    <p style="font-size:14.5px">iPhone: Safari 하단 <b>공유</b> 버튼 → <b>홈 화면에 추가</b>.<br>Android: Chrome 메뉴 → <b>앱 설치</b>.<br>앱처럼 열리고, 오프라인에서도 주보와 노트가 보입니다.</p>
  </section>`;
  fetch("data/site-meta.json").then(r => r.json()).then(m => {
    $("#siteMeta").textContent = `웹사이트 마지막 업데이트 ${m.siteLastCommit.slice(0, 10)} · 확인 ${m.checkedAt.slice(0, 10)}`;
  }).catch(() => {});
}

// ---------------- 라우터 ----------------
function route() {
  const [path, qs] = location.hash.slice(1).split("?");
  const seg = (path || "bulletin").split("/");
  const params = Object.fromEntries(new URLSearchParams(qs || ""));
  const tab = seg[0];
  document.querySelectorAll("#tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === tab));
  const drawing = tab === "notes" && seg[2] === "draw";
  document.body.classList.toggle("drawing", drawing);
  window.scrollTo(0, 0);
  if (drawing) return viewDraw(seg[1]);
  if (tab === "notes" && seg[1]) return viewEditor(seg[1]);
  if (tab === "notes") return viewNotes();
  if (tab === "wall") return viewWall(params);
  if (tab === "church") return viewChurch();
  return viewBulletin();
}
window.addEventListener("hashchange", route);
$("#topIssue").textContent = D.issue.dateEn;
route();
if ("serviceWorker" in navigator && !["localhost", "127.0.0.1"].includes(location.hostname)) navigator.serviceWorker.register("sw.js");
