# -*- coding: utf-8 -*-
"""Emits the seven pages of the manuscript site from one shell + per-page content."""
import re

MAPFIG = open('/tmp/mapfig.html', encoding='utf-8').read()
MAPFIG = MAPFIG.replace('<figure class="mapfig rv rv2">', '<figure class="mapfig plate rv">') \
               .replace('<figcaption class="plate">', '<figcaption>')

CHAPTERS = [  # book order
  ('about.html',      '제1장', 'One',   '교회 소개',   '누구이며 무엇을 믿는가'),
  ('worship.html',    '제2장', 'Two',   '예배',        '주일 저녁 여섯 시'),
  ('ministries.html', '제3장', 'Three', '사역과 소그룹','한 사람을 제자로'),
  ('visit.html',      '제4장', 'Four',  '처음 오시는 분','편하게, 준비 없이'),
  ('settle.html',     '제5장', 'Five',  '정착 안내',   '막 도착한 분께'),
  ('giving.html',     '제6장', 'Six',   '헌금과 후원', '작을수록 투명하게'),
]
HOME = 'o-atlas-brand.html'

def head(title, desc, extra=''):
    return f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="../assets/favicon/favicon-96.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@300;400;500;700&family=Nanum+Brush+Script&family=Instrument+Serif:ital@0;1&family=Bebas+Neue&family=Montserrat:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="book.css?v=6">
</head>
<body>
{extra}'''

def bar(current):
    def a(href, label):
        cur = ' aria-current="page"' if href == current else ''
        return f'<a href="{href}"{cur}>{label}</a>'
    nav = '\n    '.join(a(f, ko) for f, _, _, ko, _ in CHAPTERS)
    def li(f, no, ko):
        cur = ' aria-current="page"' if f == current else ''
        return f'<li><a href="{f}"{cur}><em>{no}</em><span>{ko}</span></a></li>'
    toc = '\n    '.join(li(f, no, ko) for f, no, _, ko, _ in CHAPTERS)
    return f'''<header class="bar">
  <a class="wordmark" href="{HOME}">Sanford <i>Story</i> Church</a>
  <nav aria-label="차례">
    {nav}
  </nav>
  <a class="btn ink small" href="visit.html">처음 오시나요?</a>
  <button class="menubtn" id="tocbtn" aria-expanded="false" aria-controls="toc">차례</button>
</header>

<div id="toc" class="sheet" hidden>
  <button class="menubtn close" id="tocclose">닫기</button>
  <h2>차례</h2>
  <ol>
    <li><a href="{HOME}"><em>표지</em><span>처음으로</span></a></li>
    {toc}
  </ol>
</div>
'''

FOOTER = f'''<footer class="colophon sheet">
  <div class="grid inner">
    <div>
      <img class="logo" src="../assets/logo/1.png" alt="스토리교회 Sanford Story Church 로고">
      <ul><li>주일 저녁 6시</li><li>Sanford, Seminole County, FL</li></ul>
    </div>
    <div><h4>차례</h4><ul>
      {''.join(f'<li><a href="{f}">{ko}</a></li>' for f,_,_,ko,_ in CHAPTERS[:4])}
    </ul></div>
    <div><h4>더</h4><ul>
      {''.join(f'<li><a href="{f}">{ko}</a></li>' for f,_,_,ko,_ in CHAPTERS[4:])}
      <li>첫 예배 2026. 09. 27 · <span data-dday>D–19</span></li>
    </ul></div>
    <div><h4>연결</h4><ul>
      <li><a href="https://instagram.com/sundayproject_fl" target="_blank" rel="noopener">@sundayproject_fl</a></li>
      <li><a href="mailto:junyeongpark96@gmail.com">이메일</a></li>
    </ul></div>
  </div>
  <div class="inner">
    <div class="crc">
      <img src="../assets/brand/crcna-logo.png" alt="Christian Reformed Church in North America">
      <p>스토리교회는 북미주 개혁교회(CRCNA)에 속한 교회입니다.
        <a href="https://www.crcna.org/" target="_blank" rel="noopener">crcna.org</a></p>
    </div>
    <div class="legal">
      <span>Sunday Project Ministry Inc. dba Sanford Story Church</span>
      <span>Florida Non-Profit Corporation</span>
      <span>© 2026 스토리교회</span>
    </div>
  </div>
</footer>
'''

SCRIPT = r'''<script>
(function(){
  var T=new Date('2026-09-27T18:00:00-04:00').getTime();
  function up(){var l=T-Date.now(),t=l<=0?'오늘':'D–'+Math.floor(l/864e5);
    [].forEach.call(document.querySelectorAll('[data-dday]'),function(e){e.textContent=t})}
  up();setInterval(up,60000);


  // The pen writes the name only if the animation can actually finish. If it
  // cannot, the effect is dropped and the plain name stays on the page.
  (function(){
    var word = document.querySelector('.penword');
    if (!word) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('js-pen');
    setTimeout(function(){
      var a = word.getAnimations ? word.getAnimations()[0] : null;
      if (!a || a.playState !== 'finished') {
        document.documentElement.classList.remove('js-pen');
      }
    }, 4000);
  })();

  var toc=document.getElementById('toc'),btn=document.getElementById('tocbtn'),close=document.getElementById('tocclose');
  function setOpen(o){toc.hidden=!o;btn.setAttribute('aria-expanded',String(o));
    document.body.style.overflow=o?'hidden':'';(o?close:btn).focus()}
  btn.addEventListener('click',function(){setOpen(true)});
  close.addEventListener('click',function(){setOpen(false)});
  toc.addEventListener('click',function(e){if(e.target.closest('a'))setOpen(false)});
  addEventListener('keydown',function(e){if(e.key==='Escape'&&!toc.hidden)setOpen(false)});

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Content is visible by default. The reveal (and the pen underline) is opt-in,
  // switched on only once script has confirmed it can finish the job.
  var items=[].slice.call(document.querySelectorAll('.rv, .u'));
  if(!reduce && 'IntersectionObserver' in window && items.length){
    document.documentElement.classList.add('js-reveal');
    function show(el){el.classList.add('in')}
    items.forEach(function(el){if(el.getBoundingClientRect().top<innerHeight)show(el)});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){show(e.target);io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6%'});
    items.forEach(function(el){if(!el.classList.contains('in'))io.observe(el)});
    setTimeout(function(){if(items.every(function(el){return !el.classList.contains('in')}))
      document.documentElement.classList.remove('js-reveal')},4000);
  }

  // the pen keeps its place: the margin line writes itself as the reader moves.
  if(!reduce){
    var rails=[].slice.call(document.querySelectorAll('.chapter .inner, .titlepage .inner'));
    rails.forEach(function(el){el.style.setProperty('--drawn','0')});
    var pending=false;
    function draw(){pending=false;var vh=innerHeight;rails.forEach(function(el){
      var r=el.getBoundingClientRect(),p=(vh*.85-r.top)/Math.max(r.height,1);
      el.style.setProperty('--drawn',p<0?0:p>1?1:p.toFixed(3))})}
    function onScroll(){if(!pending){pending=true;requestAnimationFrame(draw)}}
    draw();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});
    setTimeout(function(){if(rails.every(function(el){return el.style.getPropertyValue('--drawn')==='0'}))
      rails.forEach(function(el){el.style.removeProperty('--drawn')})},2500);
  }
})();
</script>
'''

def chapter_head(no, en, title, sub=None):
    return f'''<header class="chapter-head rv">
  <p class="folio"><span class="no">{no}</span><i>Chapter {en}</i></p>
  <h1>{title}</h1>
</header>'''

def page(fname, title, desc, body, extra=''):
    html = head(title, desc, extra) + bar(fname) + '<main>\n' + body + '</main>\n\n' + FOOTER + SCRIPT + '</body>\n</html>\n'
    open(fname, 'w', encoding='utf-8').write(html)
    print(f'{fname:20} {len(html.splitlines())} lines')

# ═══════════════════════════ 표지 · HOME ═══════════════════════════
home_body = f'''
<section class="titlepage sheet">
  <figure class="frontis">
    <img src="../assets/photos/sanford-lakefront-dusk.jpg" width="1536" height="1024" fetchpriority="high" decoding="async"
         alt="해질 무렵 레이크 먼로 건너편에서 바라본 샌포드 다운타운. 시계탑과 오크나무, 물가에 정박한 돛단배가 보인다.">
    <figcaption><b>Fig. i</b>Downtown Sanford across Lake Monroe</figcaption>
  </figure>
  <div class="inner">
    <p class="en">Sanford <i>Story</i> Church</p>
    <p class="penline">
      <span class="penword">스토리처치</span>
      <svg class="pen" viewBox="0 0 64 64" aria-hidden="true">
        <path class="barrel" d="M40 6 L58 24 L30 52 L12 34 Z"/>
        <path class="band" d="M12 34 L30 52 L24 58 L6 40 Z"/>
        <path class="nib" d="M6 40 L24 58 C 16 62, 8 62, 2 56 C -2 50, 0 44, 6 40 Z"/>
      </svg>
    </p>
    <h1>하나님의 이야기가<br><span class="u">당신의 삶</span>에서 시작됩니다.</h1>
    <blockquote class="epigraph">너희는 우리로 말미암아 나타난 그리스도의 편지니 이는 먹으로 쓴 것이 아니요 오직 살아 계신 하나님의 영으로 쓴 것이며 또 돌판에 쓴 것이 아니요 오직 육의 마음판에 쓴 것이라.<cite>— 고린도후서 3:3</cite></blockquote>
    <p class="imprint"><b>첫 예배</b> 2026년 9월 27일 주일 저녁 6시 · 샌포드, 플로리다<span class="dday" data-dday>D–19</span></p>
    <div class="btnrow">
      <a class="btn ink" href="visit.html">처음 오시나요?</a>
      <a class="btn line" href="about.html">교회 소개</a>
    </div>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">서문</span><i>Preface</i></p>
      <h2>우리는 그분의 <span class="u">살아있는 편지</span>입니다.</h2></header>
    <div class="prose rv">
      <p class="dropcap">복음은 나를 향한 하나님의 가장 아름다운 이야기입니다. 우리는 옛 이야기를 끝내고, 그리스도 안에서 완전히 새로워진 '하나님의 살아있는 편지'로 다시 태어났습니다. 그 편지는 먹이 아니라 성령으로, 돌판이 아니라 마음판에 쓰입니다.</p>
      <p>스토리교회는 하나님이 써 내려가시는 은혜의 발자취를 온전히 담아내는 거룩한 그릇이 되고자 합니다. 예수님을 알고, 예수님을 전하고, 예수로 사는 삶. <b>모든 성도가 그의 스토리텔러가 되는 교회</b>, 그것이 우리의 미션입니다.</p>
      <p class="muted">이 사이트는 그 이야기를 적어 나가는 원고입니다. 아직 첫 장이고, 빈 자리도 있습니다. 함께 써 주시겠습니까.</p>
    </div>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">차례</span><i>Contents</i></p>
      <h2>이 책에 담긴 것</h2></header>
    <ol class="contents rv">
      {''.join(f'<li><a href="{f}"><span class="no">{no}</span><span class="t">{ko}<small>{sub}</small></span><span class="pg">{en}</span></a></li>' for f,no,en,ko,sub in CHAPTERS)}
    </ol>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">첫 예배</span><i>First Gathering</i></p>
      <h2>2026년 9월 27일, <span class="u">주일 저녁 여섯 시</span>.</h2></header>
    <div class="prose rv">
      <p>편한 옷으로 오세요. 정장도, 특별한 준비도 필요 없습니다. 찬양은 컨템포러리 곡 위주이고, 예배가 끝나면 원형 테이블에 둘러앉아 함께 식사를 나눕니다. 처음 오신 분께는 헌금을 권하지 않습니다.</p>
    </div>
    <dl class="ledger rv">
      <div><dt>언제</dt><dd>주일 오후 6시<small>Sunday 6:00 PM · Eastern Time</small></dd></div>
      <div><dt>어디서</dt><dd>Sanford, Seminole County, Florida<small>정확한 주소는 첫 예배 전에 공지됩니다</small></dd></div>
      <div><dt>어떤 지역</dt><dd>I-4 회랑 일대<small>샌포드 · 레이크메리 · 히스로 · 롱우드 · 데버리 · 델토나 · 델랜드</small></dd></div>
    </dl>
    <div class="btnrow rv">
      <a class="btn ink" href="https://forms.gle/UD3BDJRezNzVYegw6" target="_blank" rel="noopener">9월 27일 함께하기 →</a>
      <a class="btn line" href="visit.html">오시는 길과 안내</a>
    </div>
  </div>
</section>

<section class="chapter sheet" id="join">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">함께 쓰기</span><i>Join</i></p>
      <h2>이 이야기를 함께 써 내려갈 분을 찾습니다.</h2></header>
    <ul class="joins rv">
      <li><a href="https://forms.gle/AWhvv4ShUS9dLa7A9" target="_blank" rel="noopener"><span class="n">1</span><span class="t">찬양팀<small>Worship Team · 지원서</small></span><span class="ar">→</span></a></li>
      <li><a href="https://docs.google.com/forms/u/2/d/e/1FAIpQLSfx3vyJKxm3ixhfoT4CRvCoW7EcD_wKn_njVPkHBbSzxcjFzg/viewform?usp=send_form" target="_blank" rel="noopener"><span class="n">2</span><span class="t">미디어팀<small>Media Team · 지원서</small></span><span class="ar">→</span></a></li>
      <li><a href="mailto:junyeongpark96@gmail.com?subject=%5B%EC%8A%A4%ED%86%A0%EB%A6%AC%EA%B5%90%ED%9A%8C%5D%20%EB%AC%B8%EC%9D%98"><span class="n">✉</span><span class="t">그 외 문의<small>이메일로 연락하기</small></span><span class="ar">→</span></a></li>
    </ul>
  </div>
</section>
'''
page(HOME, '스토리교회 · Sanford Story Church',
     '2026년 9월 27일 플로리다 샌포드에서 시작되는 한인 개척교회. 하나님의 이야기가 당신의 삶에서 시작됩니다.', home_body)

# ═══════════════════════════ 제1장 교회 소개 ═══════════════════════════
about_body = f'''
<section class="chapter sheet">
  <div class="inner">
    {chapter_head('제1장','One','예수님을 알고, 예수님을 전하고,<br><span class="u">예수로 사는 삶</span>.')}
    <div class="prose rv">
      <p class="dropcap">스토리교회는 하나님이 써 내려가시는 은혜의 발자취를 온전히 담아내는 거룩한 그릇이 되고자 합니다. 우리를 부르신 거룩한 뜻을 따라, 내 안에 살아계신 예수 그리스도의 이야기를 담대히 증거하는 신실한 공동체가 되기를 꿈꿉니다.</p>
      <p>이를 위해 스토리교회는 영성의 깊이를 더하는 거룩한 훈련의 장이 됩니다. 영적 단련과 다듬어짐을 통해 성도를 온전한 제자로 세우며, 우리 안에 거하시는 주님의 은혜를 세상 가운데 가장 선명하고 아름답게 드러내겠습니다. <b>말씀으로 온전히 살아내는 살아있는 증인의 공동체</b>, 그것이 스토리교회입니다.</p>
    </div>
    <ol class="entries rv">
      <li><span class="n">1</span><h3>Know Jesus <i>예수님을 알고</i></h3></li>
      <li><span class="n">2</span><h3>Make Jesus Known <i>예수님을 전하고</i></h3></li>
      <li><span class="n">3</span><h3>Live a Jesus Life <i>예수로 사는 삶</i></h3></li>
    </ol>
  </div>
</section>

<section class="chapter sheet" id="process">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 1</span><i>Ministry Process</i></p>
      <h2>복음에서 시작해 <span class="u">공동체</span>로 완성됩니다.</h2></header>
    <div class="prose rv"><p>네 단계는 순서를 매긴 과정이라기보다 하나의 길입니다. 처음 오신 분이 복음을 만나고, 삶으로 살아내고, 훈련을 통해 깊어지고, 마침내 공동체를 이룹니다.</p></div>
    <ol class="entries rv">
      <li><span class="n">1</span><h3>His Story <i>복음의 중심</i></h3>
        <p>나를 구원하신 주님의 위대한 이야기. 모든 사역과 예배의 중심에 오직 예수 그리스도의 복음을 두고, 처음 오신 분도 복음의 핵심을 쉽게 이해하고 접할 수 있도록 돕습니다.</p></li>
      <li><span class="n">2</span><h3>My Story <i>증인의 삶</i></h3>
        <p>세상 속에서 내가 직접 살아내는 이야기. 예배 관람객에 머물지 않고, 일터와 가정과 학교에서 주님의 이야기를 삶으로 증거하는 살아있는 증인으로 섭니다.</p></li>
      <li><span class="n">3</span><h3>Deep Story <i>영성 훈련</i></h3>
        <p>말씀과 기도로 내면이 깊어지는 이야기. 222 디사이플십, 커피 브레이크, PRS 같은 소그룹과 일대일 양육으로 한 사람을 충성스러운 제자로 세웁니다.</p></li>
      <li><span class="n">4</span><h3>Our Story <i>신실한 공동체</i></h3>
        <p>우리가 함께 모여 완성해 가는 이야기. 원형 테이블 중심의 식탁 교제와 나눔을 통해 그리스도의 성품과 복음이 선명하게 드러나는 따뜻한 공동체를 이룹니다.</p></li>
    </ol>
  </div>
</section>

<section class="chapter sheet" id="roadmap">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 2</span><i>Three Years</i></p>
      <h2>서두르지 않고 <span class="u">한 사람씩</span> 세웁니다.</h2></header>
    <div class="prose rv"><p>숫자를 목표로 삼지 않습니다. 다만 무엇을 언제 시작할지는 미리 정해 두었습니다. 아래는 공개할 수 있는 범위의 계획입니다.</p></div>
    <ol class="entries rv">
      <li><span class="n">I</span><h3>문화를 세우는 해 <i>Year One</i></h3>
        <p>예배의 리듬을 안정시키고 코어팀을 세웁니다. 찬양 인도·웰컴·친교를 순번제로 돌려 한 사람에게 부담이 쏠리지 않게 합니다. 3개월차부터 222 디사이플십을 시작하고, 6개월차에 커피 브레이크를 엽니다.</p></li>
      <li><span class="n">II</span><h3>리더가 자라는 해 <i>Year Two</i></h3>
        <p>222 디사이플십을 마친 분들이 소그룹 리더로 섭니다. 목회자 한 사람 중심에서 평신도 중심으로 옮겨 갑니다. 북클럽과 PRS를 새로 열고, 세례식을 공동체의 잔치로 지킵니다.</p></li>
      <li><span class="n">III</span><h3>다음 세대를 여는 해 <i>Year Three</i></h3>
        <p>자녀들을 위한 공간과 교사를 준비해 아동부를 시작합니다. 찬양과 서두는 온 세대가 함께 드리고, 말씀 시간에 아이들은 별도 공과로 이동하는 세대 통합 구조를 만듭니다. 운영위원회를 구성해 재정과 사역 방향을 함께 결정합니다.</p></li>
    </ol>
    <div class="prose rv"><p class="muted" style="margin-top:1.4rem">계획은 계획일 뿐이라는 것도 압니다. 사람이 오면 계획은 바뀝니다. 바뀌지 않는 것은 순서입니다 — <b>복음이 먼저, 사람이 그다음, 조직은 마지막</b>입니다.</p></div>
  </div>
</section>

<section class="chapter sheet" id="people">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 3</span><i>People</i></p><h2>함께 시작합니다.</h2></header>
    <figure class="portrait plate rv">
      <img src="../assets/people/Jung.jpg" alt="정경원 담임목사" loading="lazy" width="570" height="784">
      <figcaption>
        <p class="folio" style="margin:0 0 .3rem"><span class="no">담임목사</span><i>Senior Pastor</i></p>
        <h3 style="margin:0">정경원 <i>Kyong Won Jung</i></h3>
        <p style="margin:.4rem 0 0;color:var(--ink-2)">Reformed Theological Seminary (RTS) M.Div. 졸업</p>
      </figcaption>
    </figure>
  </div>
</section>

<section class="chapter sheet" id="crcna">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 4</span><i>Affiliation</i></p><h2>북미주 개혁교회(CRCNA)에 속합니다.</h2></header>
    <div class="prose rv">
      <p>1857년 네덜란드 이민자들이 세운 신앙 유산에서 시작되어, 종교개혁의 정통성과 깊이 있는 신학을 지켜온 교단입니다. 역사적 뿌리는 네덜란드에 있지만 지금은 다양한 인종과 문화가 어우러진 북미의 대표적인 교단으로 자랐습니다. 말씀의 절대 권위를 믿으며, 교회뿐 아니라 삶의 모든 영역에서 하나님의 주권을 인정하는 신앙을 추구합니다.</p>
    </div>
    <div class="btnrow rv"><a class="btn line" href="https://www.crcna.org/" target="_blank" rel="noopener">crcna.org →</a><a class="btn ink" href="visit.html">처음 오시나요?</a></div>
  </div>
</section>
'''
page('about.html', '제1장 교회 소개 · 스토리교회', '스토리교회의 비전과 미션, 4단계 사역 프로세스, 세 해의 계획, 섬기는 사람, CRCNA 소속.', about_body)

# ═══════════════════════════ 제2장 예배 ═══════════════════════════
worship_body = f'''
<section class="chapter sheet">
  <div class="inner">
    {chapter_head('제2장','Two','보는 예배가 아니라 <span class="u">살아내는 예배</span>.')}
    <div class="prose rv">
      <p class="dropcap">전통적인 관람형 예배에서 벗어나, 모든 성도가 깊이 몰입하고 마음을 나누는 참여형 예배를 드립니다. 찬양은 컨템포러리 곡 위주이고, 드레스 코드는 캐주얼입니다. 편한 옷으로 오시면 됩니다.</p>
    </div>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 1</span><i>Order of Service</i></p><h2>세 개의 장으로 드립니다.</h2></header>
    <ol class="entries rv">
      <li><span class="n">1</span><h3>His Story <i>뜨거운 찬양과 강력한 말씀</i></h3>
        <p>마음을 열어주는 뜨거운 찬양으로 하나님 임재의 보좌 앞으로 나아갑니다. 오직 예수 그리스도의 복음과 선명한 성경 말씀에 몰입하며, 영적 가슴이 다시 뛰는 은혜를 경험합니다.</p><small>Praise &amp; Word</small></li>
      <li><span class="n">2</span><h3>Your Story <i>결단과 행동하는 믿음</i></h3>
        <p>말씀의 감격을 들고 각자가 삶을 결단하는 시간입니다. 성도들의 진솔한 영상 간증에 마음을 모으고, 각자의 기도와 결단을 담은 Story Card를 팰릿 월에 직접 꽂습니다. 보는 예배에서 살아내는 믿음으로 넘어가는 자리입니다.</p><small>Reflection &amp; Action</small></li>
      <li><span class="n">3</span><h3>Our Story <i>깊은 나눔과 파송</i></h3>
        <p>원형 테이블에 둘러앉아 말씀의 은혜를 솔직하게 나누고 서로를 위해 뜨겁게 중보합니다. 따뜻한 식탁 교제로 온 성도가 하나 된 뒤, 세상 속 증인으로 담대히 파송받습니다.</p><small>Fellowship &amp; Sending</small></li>
    </ol>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 2</span><i>Story Card</i></p><h2>듣고 끝나지 않도록.</h2></header>
    <div class="prose rv">
      <p>설교가 끝나면 카드 한 장을 받습니다. 오늘 들은 말씀 앞에서 무엇을 결단할지 손으로 적고, 팰릿 월에 직접 꽂습니다. 다음 주에 다시 와서 지난주에 꽂아 둔 카드를 볼 수 있습니다. <b>말씀이 삶으로 건너가는 다리</b>를 예배 안에 두려는 장치입니다.</p>
    </div>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 3</span><i>The Room</i></p><h2>강단이 아니라 <span class="u">둘러앉는 자리</span>.</h2></header>
    <div class="prose rv"><p>모던하고 감성적인 라운지 분위기를 지향합니다. 줄지어 앞을 보는 자리 대신 원형 테이블을 씁니다. 예배가 끝나면 그 자리가 그대로 식탁이 됩니다.</p></div>
    <p class="note rv"><b>준비 중</b>예배 공간 사진과 정확한 주소는 첫 예배 전에 이 자리에 올라갑니다.</p>
    <div class="btnrow rv"><a class="btn ink" href="visit.html">처음 오시나요?</a><a class="btn line" href="ministries.html">소그룹 보기</a></div>
  </div>
</section>
'''
page('worship.html', '제2장 예배 · 스토리교회', '주일 오후 6시. His Story · Your Story · Our Story 세 장으로 드리는 참여형 예배와 Story Card, 원형 테이블 식탁 교제.', worship_body)

# ═══════════════════════════ 제3장 사역과 소그룹 ═══════════════════════════
min_body = f'''
<section class="chapter sheet">
  <div class="inner">
    {chapter_head('제3장','Three','한 사람을 <span class="u">제자로</span> 세웁니다.')}
    <div class="prose rv"><p class="dropcap">큰 모임보다 작은 모임에서 사람이 자랍니다. 그래서 예배만큼 소그룹에 무게를 둡니다. 아직 신앙을 갖지 않은 분도 편하게 앉을 수 있는 자리를 만드는 것이 목표입니다. 교회 건물 밖에서도 모입니다.</p></div>
    <ol class="entries rv">
      <li><span class="n">1</span><h3>222 디사이플십 <i>Discipleship · 1:1, 1:2</i></h3>
        <p>목회자가 직접 진행하는 일대일 또는 일대이 양육입니다. 말씀을 함께 읽고, 질문하고, 삶을 나눕니다. 이 과정을 마친 분이 다음 소그룹의 리더가 됩니다.</p><small>목회자 인도 · 상시</small></li>
      <li><span class="n">2</span><h3>커피 브레이크 <i>Coffee Break</i></h3>
        <p>교회 건물이 아니라 지역 카페와 성도 가정에서 모입니다. 아직 신앙을 갖지 않은 분도 문턱 없이 앉을 수 있는 자리를 목표로 합니다.</p><small>평일 저녁 · 주말 오후</small></li>
      <li><span class="n">3</span><h3>PRS 성경 읽기 <i>Public Reading of Scripture</i></h3>
        <p>함께 소리 내어 말씀을 읽습니다. 해설보다 본문 자체에 오래 머무는 모임이고, 평신도 리더가 인도합니다.</p><small>평신도 리더 인도</small></li>
      <li><span class="n">4</span><h3>북클럽 <i>Book Club</i></h3>
        <p>책 한 권을 매개로 신앙과 삶을 나눕니다. 대상별 특성을 고려해 시즌제로 운영합니다.</p><small>시즌제 운영</small></li>
    </ol>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 1</span><i>Serving</i></p><h2>잘하지 않아도 됩니다.</h2></header>
    <div class="prose rv"><p>개척의 자리에는 손이 많이 필요합니다. 경력이나 실력보다 <b>함께 시작할 마음</b>이면 충분합니다.</p></div>
    <ul class="joins rv">
      <li><a href="https://forms.gle/AWhvv4ShUS9dLa7A9" target="_blank" rel="noopener"><span class="n">1</span><span class="t">찬양팀<small>Worship Team · 지원서</small></span><span class="ar">→</span></a></li>
      <li><a href="https://docs.google.com/forms/u/2/d/e/1FAIpQLSfx3vyJKxm3ixhfoT4CRvCoW7EcD_wKn_njVPkHBbSzxcjFzg/viewform?usp=send_form" target="_blank" rel="noopener"><span class="n">2</span><span class="t">미디어팀<small>Media Team · 지원서</small></span><span class="ar">→</span></a></li>
      <li><a href="mailto:junyeongpark96@gmail.com?subject=%5B%EC%8A%A4%ED%86%A0%EB%A6%AC%EA%B5%90%ED%9A%8C%5D%20%EB%AC%B8%EC%9D%98"><span class="n">✉</span><span class="t">그 외 문의<small>이메일로 연락하기</small></span><span class="ar">→</span></a></li>
      <li><a href="https://instagram.com/sundayproject_fl" target="_blank" rel="noopener"><span class="n">IG</span><span class="t">@sundayproject_fl<small>준비 과정을 인스타그램에서 보실 수 있어요</small></span><span class="ar">→</span></a></li>
    </ul>
  </div>
</section>
'''
page('ministries.html', '제3장 사역과 소그룹 · 스토리교회', '222 디사이플십, 커피 브레이크, PRS 성경 읽기, 북클럽. 그리고 찬양팀·미디어팀 동역자 모집.', min_body)

# ═══════════════════════════ 제4장 처음 오시는 분 ═══════════════════════════
SR = '''<p class="sr-only">지도 안내: 샌포드 지역 개략도입니다. 북쪽에 레이크 먼로가 있고,
I-4 고속도로가 남서에서 북동으로 가로지르며 SR-46, SR-417, SR-429, US 17-92와 만납니다.
스토리교회는 샌포드(북위 28.8028, 서경 81.2731) 일대에 세워지며, 정확한 예배 장소는 추후 공지됩니다.
지도는 개략도이며 길찾기용이 아닙니다.</p>
'''
visit_body = f'''
<section class="chapter sheet">
  <div class="inner">
    {chapter_head('제4장','Four','편하게 오세요. <span class="u">준비할 건 없습니다</span>.')}
    <div class="prose rv"><p class="dropcap">주일 저녁 6시, 샌포드에서 모입니다. 아무것도 몰라도 괜찮고, 아무 준비 없이 오셔도 괜찮습니다. 오시면 웰컴팀이 먼저 찾아가 인사드립니다.</p></div>
    <dl class="ledger rv">
      <div><dt>언제</dt><dd>주일 오후 6시<small>Sunday 6:00 PM · Eastern Time</small></dd></div>
      <div><dt>어디서</dt><dd>Sanford, Seminole County, Florida<small>28.8028 N · 81.2731 W</small></dd></div>
      <div><dt>어떤 지역</dt><dd>I-4 회랑 일대<small>샌포드 · 레이크메리 · 히스로 · 롱우드 · 데버리 · 델토나 · 델랜드</small></dd></div>
      <div><dt>옷차림</dt><dd>캐주얼<small>편한 복장으로 오시면 됩니다. 정장 필요 없습니다.</small></dd></div>
      <div><dt>예배 후</dt><dd>식탁 교제<small>원형 테이블에 둘러앉아 함께 식사를 나눕니다.</small></dd></div>
      <div><dt>자녀</dt><dd>함께 예배<small>아동부는 2028년 시작을 준비하고 있습니다.</small></dd></div>
      <div><dt>주차</dt><dd>공지 예정<small>장소 확정 후 안내합니다.</small></dd></div>
    </dl>
    <p class="note rv"><b>준비 중</b>정확한 예배 장소 주소와 주차 안내, 실제 지도는 첫 예배 전에 이 자리에 올라갑니다.</p>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 1</span><i>Where</i></p><h2>어디로 가나요.</h2></header>
{MAPFIG}
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 2</span><i>New Family</i></p><h2>처음 두 주.</h2></header>
    <ol class="entries rv">
      <li><span class="n">1</span><h3>Welcome Story <i>첫 주</i></h3><p>예배 후 식탁 교제 시간에 웰컴팀이 함께합니다. 교회 머그컵과 드립백 커피, 손편지가 담긴 웰컴 키트를 드립니다.</p></li>
      <li><span class="n">2</span><h3>Pastor's Table <i>둘째 주</i></h3><p>담임목사와 함께하는 가벼운 식사 자리입니다. 교회의 비전을 나누고, 무엇보다 당신의 이야기를 듣습니다.</p></li>
    </ol>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 3</span><i>Before You Come</i></p><h2>자주 묻는 것들.</h2></header>
    <ol class="entries two rv">
      <li><span class="n">Q</span><h3>뭘 입고 가야 하나요?</h3><p>편한 옷이면 됩니다. 정장도, 특별한 준비도 필요 없습니다.</p></li>
      <li><span class="n">Q</span><h3>예배가 몇 시에 끝나나요?</h3><p>예배 후 식탁 교제까지 함께하시면 좋지만, 사정이 있으면 예배만 드리고 가셔도 괜찮습니다.</p></li>
      <li><span class="n">Q</span><h3>아이를 데려가도 되나요?</h3><p>물론입니다. 다만 아직 아동부가 없어 자녀와 함께 예배드리게 됩니다.</p></li>
      <li><span class="n">Q</span><h3>헌금을 해야 하나요?</h3><p>아닙니다. 처음 오신 분께 헌금을 권하지 않습니다. 그냥 오셔서 함께 앉아 계시면 됩니다.</p></li>
    </ol>
    <div class="btnrow rv"><a class="btn ink" href="https://forms.gle/UD3BDJRezNzVYegw6" target="_blank" rel="noopener">9월 27일 함께하기 →</a><a class="btn line" href="mailto:junyeongpark96@gmail.com?subject=%5B%EC%8A%A4%ED%86%A0%EB%A6%AC%EA%B5%90%ED%9A%8C%5D%20%EB%AC%B8%EC%9D%98">이메일로 묻기</a></div>
  </div>
</section>
'''
page('visit.html', '제4장 처음 오시는 분 · 스토리교회', '주일 오후 6시, 플로리다 샌포드. 예배 시간과 위치, 드레스 코드, 새가족 2주 안내, 자주 묻는 질문.', visit_body, extra=SR)

# ═══════════════════════════ 제5장 정착 안내 ═══════════════════════════
settle_body = f'''
<section class="chapter sheet">
  <div class="inner">
    {chapter_head('제5장','Five','샌포드에 막 도착하셨다면, <span class="u">밥부터 같이 드시죠</span>.')}
    <div class="prose rv">
      <p class="dropcap">유학이든 이직이든, 처음 몇 달은 누구에게나 버겁습니다. 스토리교회는 아직 작은 개척교회라 해드릴 수 있는 게 많지는 않지만, 먼저 온 사람들이 아는 것과 따뜻한 밥 한 끼는 나눌 수 있습니다.</p>
      <p>정착을 도와드린다고 해서 서류를 대신 처리해 드리거나 보증을 서 드리지는 못합니다. 대신 저희가 실제로 할 수 있는 건 이런 것들입니다.</p>
    </div>
    <ol class="entries rv">
      <li><span class="n">1</span><h3>따뜻한 집밥 <i>A home-cooked meal</i></h3><p>혼자 먹는 밥이 제일 지칩니다. 예배 후 원형 테이블에 둘러앉아 함께 먹습니다. 삼겹살도 굽고 한식도 나눕니다. 교회에 다니지 않아도 오셔서 드셔도 됩니다.</p><small>매주 예배 후</small></li>
      <li><span class="n">2</span><h3>먼저 온 사람들 <i>People who arrived first</i></h3><p>어느 마트에 뭐가 있는지, 차는 어디서 봤는지, 그 서류는 어떻게 했는지 — 검색해도 안 나오는 걸 먼저 겪은 사람에게 물어볼 수 있습니다.</p><small>소그룹 · 카톡</small></li>
      <li><span class="n">3</span><h3>웰컴 키트 <i>Welcome kit</i></h3><p>처음 오신 주에 교회 머그컵과 드립백 커피, 손편지를 드립니다. 둘째 주에는 담임목사와 가벼운 식사 자리를 갖습니다.</p><small>첫 주 · 둘째 주</small></li>
      <li><span class="n">4</span><h3>비행학교 유학생 <i>Flight school students</i></h3><p>샌포드에는 비행학교가 있고, 한인 유학생이 계속 오갑니다. 훈련 일정이 불규칙해서 매주 못 오셔도 괜찮습니다. 오실 수 있는 날 오시면 됩니다.</p><small>일정 유연</small></li>
    </ol>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 1</span><i>The First Days</i></p><h2>순서대로 하나씩.</h2></header>
    <div class="prose rv"><p>아래는 이 지역에 먼저 온 분들이 대체로 거쳐 간 순서입니다. 각자 상황이 다르니 참고만 하시고, <b>정확한 절차와 필요 서류는 반드시 해당 기관에 직접 확인</b>하세요.</p></div>
    <dl class="ledger rv">
      <div><dt>하나</dt><dd>지낼 곳<small>계약 전에 통근 거리를 먼저 보세요. 이 지역은 차 없이 움직이기 어렵습니다.</small></dd></div>
      <div><dt>둘</dt><dd>차<small>중고차를 먼저 구하는 분이 많습니다. 보험은 차보다 먼저 알아보는 편이 낫습니다.</small></dd></div>
      <div><dt>셋</dt><dd>전화 · 인터넷<small>선불 요금제로 시작했다가 나중에 바꾸는 경우가 많습니다.</small></dd></div>
      <div><dt>넷</dt><dd>은행 계좌<small>신분 서류를 미리 챙겨 가세요. 지점마다 요구하는 것이 조금씩 다릅니다.</small></dd></div>
      <div><dt>다섯</dt><dd>장보기<small>한인 식료품은 올랜도 쪽으로 나가야 합니다. 처음엔 같이 가 드릴 수 있습니다.</small></dd></div>
    </dl>
    <p class="note rv"><b>확인 필요</b>구체적인 상호·주소·영업시간은 자주 바뀌어서 적어두지 않았습니다. 필요하시면 물어봐 주세요. 그때그때 맞는 정보를 알려드리겠습니다.</p>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 2</span><i>Ask</i></p><h2>교회 안 나오셔도 됩니다. 그냥 물어보세요.</h2></header>
    <div class="prose rv"><p>정착 관련해서 궁금한 게 있으면 편하게 연락 주세요. 교회 등록이나 출석과 아무 상관 없습니다.</p></div>
    <ul class="joins rv">
      <li><a href="mailto:junyeongpark96@gmail.com?subject=%5B%EC%8A%A4%ED%86%A0%EB%A6%AC%EA%B5%90%ED%9A%8C%5D%20%EC%A0%95%EC%B0%A9%20%EB%AC%B8%EC%9D%98"><span class="n">✉</span><span class="t">이메일로 물어보기<small>정착 관련 무엇이든</small></span><span class="ar">→</span></a></li>
      <li><a href="https://instagram.com/sundayproject_fl" target="_blank" rel="noopener"><span class="n">IG</span><span class="t">@sundayproject_fl<small>DM도 봅니다</small></span><span class="ar">→</span></a></li>
    </ul>
    <div class="btnrow rv"><a class="btn ink" href="visit.html">예배 안내 보기 →</a></div>
  </div>
</section>
'''
page('settle.html', '제5장 정착 안내 · 스토리교회', '샌포드에 막 도착하셨나요. 비행학교 유학생과 새로 이사 온 가정을 위한 정착 안내 — 집밥, 먼저 온 사람들, 처음 며칠 순서.', settle_body)

# ═══════════════════════════ 제6장 헌금과 후원 ═══════════════════════════
giving_body = f'''
<section class="chapter sheet">
  <div class="inner">
    {chapter_head('제6장','Six','작은 교회일수록 <span class="u">더 투명하게</span>.')}
    <div class="prose rv">
      <p class="dropcap">스토리교회는 2026년 9월에 시작하는 개척 교회입니다. 아직 온라인 헌금 채널이 열리지 않았고, 준비되는 대로 이 자리에 올립니다. 그 전에 저희가 지키려는 원칙을 먼저 적어둡니다.</p>
    </div>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 1</span><i>How</i></p><h2>준비 중입니다.</h2></header>
    <div class="prose rv"><p>온라인 헌금 채널은 아직 열리지 않았습니다. 교회가 법인 등록(Sunday Project Ministry Inc.)과 EIN 발급을 마친 상태이고, 계좌와 온라인 채널은 <b>첫 예배 전까지</b> 준비해 이 자리에 올립니다.</p></div>
    <dl class="ledger rv">
      <div><dt>온라인</dt><dd>준비 중<small>첫 예배 전 공개 예정</small></dd></div>
      <div><dt>수표</dt><dd>준비 중<small>첫 예배 전 공개 예정</small></dd></div>
      <div><dt>현장</dt><dd>주일 예배 현장에서<small>2026. 09. 27부터</small></dd></div>
    </dl>
    <p class="note rv"><b>알려드립니다</b>이 페이지에 계좌번호나 송금 링크가 적히기 전까지, 스토리교회 이름으로 온라인 헌금을 요청하는 연락을 받으시면 응하지 마시고 아래 이메일로 먼저 확인해 주세요.</p>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 2</span><i>Transparency</i></p><h2>어디에 쓰였는지 <span class="u">분기마다</span> 알려드립니다.</h2></header>
    <div class="prose rv"><p>개척 교회의 재정은 작습니다. 작을수록 더 선명하게 보여야 한다고 생각합니다. 분기별 재정 보고서를 온 성도에게 공유합니다. 묻지 않아도 먼저 알려드리는 것이 원칙입니다.</p></div>
    <dl class="ledger rv">
      <div><dt>공유 주기</dt><dd>분기별<small>연 4회, 전 성도 대상</small></dd></div>
      <div><dt>법인</dt><dd>Sunday Project Ministry Inc.<small>Florida Non-Profit Corporation · EIN 발급 완료</small></dd></div>
      <div><dt>교단</dt><dd>북미주 개혁교회(CRCNA) 소속<small>교단 회계 기준을 따릅니다</small></dd></div>
    </dl>
  </div>
</section>

<section class="chapter sheet">
  <div class="inner">
    <header class="chapter-head rv"><p class="folio"><span class="no">§ 3</span><i>First-time Visitors</i></p><h2>헌금하지 않으셔도 됩니다.</h2></header>
    <div class="prose rv"><p>처음 오신 분께는 헌금을 권하지 않습니다. 그냥 오셔서 함께 앉아 계시면 됩니다. 밥도 드시고 가세요. 헌금은 이 공동체가 내 공동체라고 느껴진 다음에 생각하셔도 충분히 늦지 않습니다.</p></div>
    <div class="btnrow rv"><a class="btn ink" href="visit.html">처음 오시나요?</a><a class="btn line" href="mailto:junyeongpark96@gmail.com?subject=%5B%EC%8A%A4%ED%86%A0%EB%A6%AC%EA%B5%90%ED%9A%8C%5D%20%ED%97%8C%EA%B8%88%C2%B7%ED%9B%84%EC%9B%90%20%EB%AC%B8%EC%9D%98">헌금 · 후원 문의</a></div>
  </div>
</section>
'''
page('giving.html', '제6장 헌금과 후원 · 스토리교회', '스토리교회 헌금 안내와 재정 투명성 원칙. 온라인 헌금 채널은 첫 예배 전 공개 예정입니다.', giving_body)
