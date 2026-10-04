# 설교 카드뉴스(인스타 1080×1350) 빌드
# 사용법:  python3 sns/make.py sns/2026-09-27_그리스도의편지/카드.txt
# 출력:    같은 폴더의 카드뉴스/01.png… + 카드뉴스.zip
# 색·폰트·로고 규칙은 web/docs/brand-guide.md 를 따른다.
import html, os, re, shutil, subprocess, sys, tempfile, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# web/styles/tokens.css 와 같은 값
NAVY, CREAM, ORANGE = "#0F1E34", "#F4F0E6", "#FF9A1F"

# 마지막 장(CTA). 카드.txt 에 [CTA] 를 쓰면 그 값으로 덮어씀
DEFAULT_CTA = {
    "태그": "NEXT STEP",
    "제목": "말씀을/*삶으로*",
    "손글씨": "이번 주 이렇게 해봐요!",
    "항목": [
        "저장하고 다시 묵상하기 | 한 주 동안 이 말씀을 다시 읽어보세요",
        "떠오르는 한 사람에게 공유하기 | 당신을 통해 누군가 하나님을 알게 됩니다",
        "이번 주일, 함께 예배하기 | 매주 주일 오후 6시 · 4942 FL-46 #1026, Sanford",
    ],
    "하단": "**@storychurch_sanford**/팔로우하고 매주 말씀 카드 받아보기",
}

FONTS = "<link href='https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@500;600;700&family=Nanum+Pen+Script&display=block' rel='stylesheet'>"
CSS = f"""
*{{margin:0;padding:0;box-sizing:border-box}}html,body{{width:1080px;height:1350px;overflow:hidden}}
body{{position:relative;font-family:Pretendard,sans-serif;word-break:keep-all}}
.nv{{background:{NAVY};color:{CREAM}}}.cr{{background:{CREAM};color:{NAVY}}}.og{{background:{ORANGE};color:{NAVY}}}
.logo{{position:absolute;top:64px;left:76px;height:76px}}
.wordmark{{position:absolute;top:86px;left:80px;font-family:Montserrat;font-weight:700;font-size:22px;letter-spacing:.18em}}
.pg{{position:absolute;top:76px;right:80px;font-family:'Bebas Neue';font-size:44px;letter-spacing:.04em}}
.pg b{{color:{ORANGE};font-weight:400}}.og .pg b{{color:{NAVY}}}
.sp{{position:absolute;left:80px;top:250px;font-family:Montserrat;font-weight:700;letter-spacing:.18em;font-size:24px;color:{ORANGE};text-transform:uppercase}}
.og .sp{{color:{NAVY}}}
h1{{position:absolute;left:74px;top:300px;font-weight:800;font-size:138px;line-height:1.04;letter-spacing:-.055em}}
h1.long{{font-size:112px}}
h1 span,.q span,.vq span{{color:{ORANGE}}}
.og h1 span,.og .q span{{color:{CREAM}}}
.body{{position:absolute;left:80px;right:80px;bottom:190px;font-size:37px;line-height:1.7;font-weight:500}}
.cr .body{{color:#34405A}}.nv .body{{color:#C9CCD4}}.og .body{{color:{NAVY}}}
em{{font-style:normal;font-weight:800;color:{ORANGE}}}.og em{{color:{NAVY}}}
.q{{margin-top:40px;font-size:62px;font-weight:800;line-height:1.24;letter-spacing:-.045em;color:{NAVY}}}
.nv .q{{color:{CREAM}}}
.foot{{position:absolute;left:80px;right:80px;bottom:72px;display:flex;justify-content:space-between;font-family:Montserrat;font-weight:600;font-size:20px;letter-spacing:.18em;opacity:.55}}
.path{{position:absolute;right:0;top:180px;width:520px;height:700px;opacity:.5}}
/* 표지 */
.cover .big{{position:absolute;right:80px;bottom:150px;height:560px}}
.cover .sp{{top:270px}}
.cover h1{{top:320px;font-size:176px;line-height:1}}
.cover .ko{{position:absolute;left:80px;top:710px;font-size:38px;font-weight:600;color:#C9CCD4}}
.cover .date{{position:absolute;left:80px;top:766px;font-size:28px;font-weight:500;color:#8E97A8}}
.swipe{{position:absolute;left:80px;bottom:180px;font-family:Montserrat;font-weight:700;font-size:22px;letter-spacing:.18em;display:flex;gap:18px;align-items:center}}
.swipe i{{display:block;width:90px;height:4px;background:{ORANGE}}}
/* 구절 */
.verse .vq{{position:absolute;left:80px;right:80px;top:330px;font-size:58px;font-weight:700;line-height:1.5;letter-spacing:-.03em}}
.verse .vq:before{{content:'“';display:block;font-family:'Bebas Neue';font-size:220px;line-height:.6;color:{ORANGE};margin-bottom:10px}}
.verse .src{{position:absolute;left:80px;bottom:190px;font-size:32px;font-weight:700;color:{ORANGE}}}
/* CTA */
.cta h1{{font-size:120px;top:300px}}
.hand{{position:absolute;left:520px;top:470px;font-family:'Nanum Pen Script';color:{ORANGE};font-size:64px;transform:rotate(-4deg)}}
.list{{position:absolute;left:80px;right:60px;top:640px;list-style:none}}
.list li{{display:flex;align-items:center;gap:26px;font-size:42px;font-weight:700;margin-bottom:34px}}
.list li img{{height:56px}}
.list small{{display:block;font-size:27px;font-weight:500;color:#9AA3B5;margin-top:4px}}
.paper{{position:absolute;left:0;right:0;bottom:0;height:300px;background:{CREAM};clip-path:polygon(0 14%,4% 9%,9% 15%,14% 8%,20% 13%,26% 7%,31% 14%,37% 9%,43% 15%,49% 8%,55% 13%,61% 7%,67% 14%,72% 9%,78% 15%,84% 8%,90% 13%,95% 7%,100% 12%,100% 100%,0 100%)}}
.paper .pl{{position:absolute;left:76px;top:100px;height:110px}}
.paper .pt{{position:absolute;right:80px;top:104px;text-align:right;color:{NAVY};font-size:28px;font-weight:600;line-height:1.6}}
.paper .pt em{{font-family:Montserrat;font-size:34px}}
.cta .foot{{display:none}}
"""
# 브랜드 모티프: 흐르는 길(path) 선
PATH = f"<svg class=path viewBox='0 0 520 700' fill='none'><path d='M520 40 C 300 60, 180 200, 330 330 S 420 560, 140 680' stroke='{ORANGE}' stroke-width='3' stroke-linecap='round' stroke-dasharray='2 14'/></svg>"


def fmt(s):
    """'/'=줄바꿈, *글자*=오렌지 강조, **글자**=굵은 강조"""
    s = html.escape(s.strip()).replace("/", "<br>")
    s = re.sub(r"\*\*(.+?)\*\*", r"<em>\1</em>", s)
    return re.sub(r"\*(.+?)\*", r"<span>\1</span>", s)


def parse(path):
    head, cards, cur = {}, [], None
    for raw in open(path, encoding="utf-8"):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        m = re.fullmatch(r"\[(.+)\]", line)
        if m:
            cur = {"종류": m.group(1), "항목": []}
            cards.append(cur)
            continue
        key, _, val = line.partition(":")
        key, val = key.strip(), val.strip()
        if key == "항목" and cur is not None:
            cur["항목"].append(val)
        else:
            (cur if cur is not None else head)[key] = val
    return head, cards


def build(head, cards):
    content = [c for c in cards if c["종류"] in ("카드", "구절")]
    cta = next((c for c in cards if c["종류"] == "CTA"), None) or {}
    cta = {**DEFAULT_CTA, **{k: v for k, v in cta.items() if v}}
    total = len(content) + 2
    ref = head.get("본문영문", "")
    pages = []

    def page(cls, top, inner):
        n = len(pages) + 1
        pages.append(f"""<!doctype html><html><head><meta charset=utf-8>{FONTS}<style>{CSS}</style></head>
<body class='{cls}'>{top}<div class=pg><b>{n:02d}</b> / {total:02d}</div>{inner}
<div class=foot><span>SANFORD STORY CHURCH</span><span>{html.escape(ref)}</span></div></body></html>""")

    logo = lambda f: f"<img class=logo src='{ASSETS}/{f}'>"
    emblem = f"{ASSETS}/emblem.png"

    page("nv cover", logo("logo-on-navy.png"),
         f"<img class=big src='{emblem}'><div class=sp>{html.escape(head.get('태그', 'Sunday Sermon'))}</div>"
         f"<h1>{fmt(head['제목'])}</h1><div class=ko>{html.escape(head.get('본문', ''))}</div>"
         f"<div class=date>{html.escape(head.get('날짜', ''))}</div><div class=swipe>SWIPE <i></i></div>")

    # 크림 → 네이비 번갈아, 마지막 내용 카드는 오렌지
    # 오렌지 위에는 로고를 올리지 않는다(브랜드 가이드: 저대비 배경 금지) → 글자 워드마크
    for i, c in enumerate(content):
        bg = "og" if i == len(content) - 1 else ("cr" if i % 2 == 0 else "nv")
        top = {"cr": logo("logo-on-light.png"), "nv": logo("logo-on-navy.png"),
               "og": "<div class=wordmark>SANFORD STORY CHURCH</div>"}[bg]
        deco = "" if bg == "og" else PATH
        tag = f"<div class=sp>{html.escape(c.get('태그', ''))}</div>"
        if c["종류"] == "구절":
            page(f"{bg} verse", top, deco + tag + f"<div class=vq>{fmt(c.get('내용', ''))}</div><div class=src>{html.escape(c.get('출처', ''))}</div>")
            continue
        title = c.get("제목", "")
        long = " class=long" if title.count("/") >= 3 else ""
        q = f"<div class=q>{fmt(c['질문'])}</div>" if c.get("질문") else ""
        page(bg, top, deco + tag + f"<h1{long}>{fmt(title)}</h1><div class=body>{fmt(c.get('내용', ''))}{q}</div>")

    items = "".join(
        f"<li><img src='{emblem}'><div>{html.escape(a.strip())}<small>{html.escape(b.strip())}</small></div></li>"
        for a, _, b in (x.partition("|") for x in cta["항목"]))
    page("nv cta", logo("logo-on-navy.png"),
         f"<div class=sp>{html.escape(cta['태그'])}</div><h1>{fmt(cta['제목'])}</h1><div class=hand>{html.escape(cta['손글씨'])}</div>"
         f"<ul class=list>{items}</ul><div class=paper><img class=pl src='{ASSETS}/logo-on-light.png'><div class=pt>{fmt(cta['하단'])}</div></div>")
    return pages


def render(pages, outdir):
    shutil.rmtree(outdir, ignore_errors=True)
    os.makedirs(outdir)
    tmp = tempfile.mkdtemp()
    for n, doc in enumerate(pages, 1):
        h = os.path.join(tmp, f"{n}.html")
        open(h, "w", encoding="utf-8").write(doc)
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                        "--virtual-time-budget=8000", "--allow-file-access-from-files", "--window-size=1080,1350",
                        f"--screenshot={outdir}/{n:02d}.png", f"file://{h}"], capture_output=True)
    shutil.rmtree(tmp)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("사용법: python3 sns/make.py sns/<날짜_제목>/카드.txt")
    src = os.path.abspath(sys.argv[1])
    week = os.path.dirname(src)
    out = os.path.join(week, "카드뉴스")
    pages = build(*parse(src))
    render(pages, out)
    with zipfile.ZipFile(out + ".zip", "w") as z:
        for f in sorted(os.listdir(out)):
            z.write(os.path.join(out, f), f"{os.path.basename(week)}/{f}")
    print(f"✓ {len(pages)}장 → {os.path.relpath(out)}/  +  카드뉴스.zip")
