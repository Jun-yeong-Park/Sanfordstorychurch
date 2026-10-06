# 설교 영상 → 세로 쇼츠 mp4 (CapCut 「1001 (1)」 양식: 크림 틀 · 로고 · 제목 · 영상 창 · 한/영 자막 · 날짜)
# 사용법:  python3 sns/shorts.py sns/2026-10-04_하나님의첫이야기/쇼츠/쇼츠1.json [쇼츠2.json ...]
#
# 쇼츠 json:
#   source  원본 영상 경로
#   date    오른쪽 아래 글자 (예: "2026.10.04 정경원 목사")
#   title   [윗줄(네이비), 아랫줄(주황)]
#   keep    [[시작초, 끝초], ...]  원본에서 쓸 구간, 적은 순서대로 잇는다 (설교 흐름 순서를 따를 것).
#           구간 안의 0.4초 넘는 쉼은 자동으로 잘라낸다
#   subs    [[원본초, "한국어", "English"], ...]  자막은 다음 자막(또는 구간 끝)까지 보인다
#   zoom    (선택) 영상 확대 배율. 기본 1 (「1001 (1)」 크기). 멀리서 찍은 영상은 1.3~1.5
#   center  (선택) 영상 창 가운데에 올 원본 위치 [가로비율, 세로비율]. 기본은 「1001 (1)」 구도 [0.433, 0.574]
# 결과: json 옆에 같은 이름의 .mp4 (1440×2560, 30fps) 와 _제목.png
import difflib, json, os, re, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "assets", "shorts")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SUB_FONT = os.path.join(A, "BMJUA.ttf")
W, H = 1440, 2560
# CapCut 「1001 (1)」 의 변환값 (scale, posY) — posY 는 화면 중심 기준, 위가 +
LOGO = (0.4589766466932529, 0.8224814106263099)
TITLE = (0.6559163751697138, 0.6018237082066868)
V_SCALE = 2.751959891965413                      # 영상 확대 (원본 폭 → 화면 폭의 몇 배)
CENTER = (0.433, 0.574)  # 「1001 (1)」 의 posX 0.3676 · posY 0.1296 을 원본 비율로 바꾼 값
# 내보낸 영상에서 잰 글자 위치 (1440×2560 기준)
KO = (75, 1875)   # 글자 크기, 글자 윗변
EN = (66, 1977)
DATE = (58, 1040, 2402)  # 크기, 가운데 x, 윗변
GAP, PAD = 0.4, 0.1      # 이보다 긴 쉼을 자르고, 앞뒤로 이만큼 남긴다


def silences(src, a, b):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-ss", str(a), "-to", str(b), "-i", src, "-vn",
                          "-af", f"silencedetect=n=-30dB:d={GAP}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(l.split("silence_start: ")[1].split()[0]) + a for l in out.splitlines() if "silence_start" in l]
    en = [float(l.split("silence_end: ")[1].split()[0]) + a for l in out.splitlines() if "silence_end" in l]
    return list(zip(st, en))


def pieces(src, keep):
    """[(keep 번호, 시작, 끝), ...] — keep 순서대로, 쉼을 잘라낸 조각"""
    out = []
    for k, (a, b) in enumerate(keep):
        cur = a
        for s, e in silences(src, a, b):
            if s - cur > 0.05 and e < b:
                out.append((k, cur, s + PAD))
                cur = e - PAD
        out.append((k, cur, b))
    return [p for p in out if p[2] - p[1] > 0.15]


def timeline(pcs, durs, k, t):
    """keep k 안의 원본 시각 t → 완성 영상 시각. 잘라낸 쉼 안이면 다음 조각 시작으로.
    durs 는 실제로 잘린 조각 길이 (프레임 단위로 반올림돼 계산값과 조금 다르다)"""
    off = 0.0
    for (kk, a, b), d in zip(pcs, durs):
        if kk == k and t <= b:
            return off + min(max(t - a, 0), d)
        off += d
    return off


def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                          "stream=duration", "-of", "csv=p=0", path]))


def spoken_starts(wav, texts):
    """완성된 소리를 다시 받아써서 각 자막 첫 글자가 실제로 말해지는 시각을 찾는다.
    원본에서 잰 시각은 Whisper 오차 + 쉼 자르기로 0.5초 이상 어긋날 수 있다."""
    whisper = shutil.which("mlx_whisper") or os.path.expanduser("~/.local/bin/mlx_whisper")
    d = os.path.dirname(wav)
    subprocess.run([whisper, wav, "--model", "mlx-community/whisper-large-v3-turbo", "--language", "ko",
                    "--word-timestamps", "True", "--output-format", "json", "--output-dir", d,
                    "--condition-on-previous-text", "False", "--verbose", "False"], check=True, capture_output=True)
    words = [w for s in json.load(open(os.path.splitext(wav)[0] + ".json"))["segments"] for w in s["words"]]
    keep = lambda x: re.sub(r"[^0-9A-Za-z가-힣]", "", x)
    heard, at = "", []                               # 들린 글자들과 각 글자의 시각
    for w in words:
        c = keep(w["word"])
        for j, ch in enumerate(c):
            heard += ch
            at.append(w["start"] + (w["end"] - w["start"]) * j / max(len(c), 1))
    want, first = "", []                             # 자막 글자들과 각 자막의 첫 글자 위치
    for t in texts:
        first.append(len(want))
        want += keep(t)
    pos = {}
    for a, b, n in difflib.SequenceMatcher(None, want, heard, autojunk=False).get_matching_blocks():
        for j in range(n):
            pos[a + j] = b + j
    out = []
    for i, f in enumerate(first):
        end = first[i + 1] if i + 1 < len(first) else len(want)
        j = next((j for j in range(f, end) if j in pos), None)        # 자막 안에서 처음 맞는 글자
        # 앞 글자 몇 개가 다르게 들렸으면(예: 죄악→제약) 그만큼 앞 글자의 시각을 쓴다
        out.append(None if j is None else at[max(pos[j] - (j - f), 0)])
    return out


def title_png(lines, path):
    html = f"""<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:P;src:url('file://{A}/Paperlogy-9Black.woff2');font-display:block}}
html,body{{margin:0;background:transparent}}
.t{{width:3600px;height:746px;white-space:nowrap;display:flex;flex-direction:column;align-items:center;justify-content:center;
font-family:P;line-height:1.05;letter-spacing:-8px}}
.a{{color:#021D36;font-size:270px}}.b{{color:#FF5F01;font-size:300px}}</style>
<div class=t><div class=a>{lines[0]}</div><div class=b>{lines[1]}</div></div>"""
    tmp = tempfile.mkdtemp()
    open(f"{tmp}/t.html", "w").write(html)
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
                    "--default-background-color=00000000", "--virtual-time-budget=5000", "--window-size=3600,746",
                    f"--screenshot={tmp}/t.png", f"file://{tmp}/t.html"], check=True, capture_output=True)
    t = Image.open(f"{tmp}/t.png").convert("RGBA")
    t = t.crop(t.getbbox())
    s = min(2006 / t.width, 670 / t.height)  # 「1001 (1)」 제목 글자 상자 크기에 맞춘다
    t = t.resize((round(t.width * s), round(t.height * s)), Image.LANCZOS)
    c = Image.new("RGBA", (2108, 746))
    c.alpha_composite(t, ((2108 - t.width) // 2, (746 - t.height) // 2))
    c.save(path)


def place(canvas, im, scale, py):
    w = W * scale
    h = w * im.height / im.width
    im = im.resize((round(w), round(h)), Image.LANCZOS)
    canvas.alpha_composite(im, (round(W / 2 - w / 2), round(H / 2 - py * H / 2 - h / 2)))


def centered(draw, text, font, cx, top, fill):
    b = font.getbbox(text)
    assert b[2] - b[0] < 1300, f"자막이 너무 깁니다: {text}"
    draw.text((cx - (b[2] - b[0]) / 2, top - b[1]), text, font=font, fill=fill, stroke_width=1, stroke_fill=fill)


def build(spec_path):
    sp = json.load(open(spec_path, encoding="utf-8"))
    base = os.path.splitext(spec_path)[0]
    tmp = tempfile.mkdtemp()
    src = sp["source"]

    pcs = pieces(src, sp["keep"])
    total = sum(b - a for _, a, b in pcs)

    title = base + "_제목.png"
    title_png(sp["title"], title)
    st = Image.new("RGBA", (W, H))
    st.alpha_composite(Image.open(os.path.join(A, "frame.png")).convert("RGBA").resize((W, H), Image.LANCZOS))
    place(st, Image.open(os.path.join(A, "logo.png")).convert("RGBA"), *LOGO)
    place(st, Image.open(title).convert("RGBA"), *TITLE)
    centered(ImageDraw.Draw(st), sp["date"], ImageFont.truetype(SUB_FONT, DATE[0]), DATE[1], DATE[2], "white")
    st.save(f"{tmp}/static.png")

    # 자막: 같은 keep 안의 다음 자막 시작, 없으면 그 keep 끝까지
    keep = sp["keep"]
    subs = []
    for t, ko, en in sorted(sp["subs"]):
        # 붙어 있는 두 구간의 경계에 걸리면 뒤 구간으로
        k = max((i for i, (a, b) in enumerate(keep) if a - 0.3 <= t < b), key=lambda i: keep[i][0])
        subs.append([k, t, keep[k][1], ko, en])
    for cur, nxt in zip(subs, subs[1:]):
        if nxt[0] == cur[0]:
            cur[2] = nxt[1]
    fko, fen = ImageFont.truetype(SUB_FONT, KO[0]), ImageFont.truetype(SUB_FONT, EN[0])
    overlays = []
    def sub_png(i, ko, en):
        im = Image.new("RGBA", (W, 260))
        d = ImageDraw.Draw(im)
        centered(d, ko, fko, W / 2, KO[1] - 1850, "black")
        centered(d, en, fen, W / 2, EN[1] - 1850, "black")
        p = f"{tmp}/s{i:02d}.png"
        im.save(p)
        return p

    for i, (k, t, end, ko, en) in enumerate(subs):
        overlays.append((sub_png(i, ko, en), k, t, end))

    # 영상: 조각마다 따로 잘라(순서를 바꿔도 메모리에 쌓이지 않게) 화면 크기로 만든 뒤 잇고 레이어를 얹는다
    def window(center, zoom):
        """영상 창 구도 → ffmpeg 필터 (원본을 잘라 키워 1440×2560 에 놓기)"""
        cx, cy = center
        zs = V_SCALE * zoom
        vw, vh = W * zs, W * zs * 9 / 16             # 확대된 영상 크기
        x0, y0 = W / 2 - cx * vw, H / 2 - cy * vh    # 확대된 영상의 왼쪽 위 (화면 좌표)
        assert x0 <= 0 and x0 + vw >= W and y0 <= 735, "영상 창이 비지 않도록 center·zoom 을 조정하세요"
        k = 3840 / vw
        vis_h = min(vh, H - y0) - max(0, -y0)        # 화면에 보이는 높이
        return (f"crop={W * k:.0f}:{vis_h * k:.0f}:{-x0 * k:.0f}:{max(0, -y0) * k:.0f},"
                f"scale={W}:-2:out_range=tv,format=yuv420p,setparams=range=tv,pad={W}:{H}:0:{max(0, round(y0))}")
        # 조각마다 화소 형식이 다르면(설교 yuvj420p · 아이폰 yuv420p) 이어 붙일 때 레이어가 풀린다 → 하나로 맞춘다

    def clip(i, path, a, dur, vf):
        # 화면은 프레임 단위로만 잘리므로 소리도 정확히 같은 길이로 맞춘다.
        # (안 맞추면 조각마다 수십 ms 씩 소리가 앞서 입 모양과 어긋난다)
        nf = max(round(dur * 30), 1)
        dur = nf / 30
        p = f"{tmp}/p{i:02d}.mov"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{dur + 0.2:.3f}", "-i", path,
                        "-vf", f"{vf},trim=end_frame={nf}", "-r", "30", "-frames:v", str(nf),
                        "-af", f"atrim=end={dur:.4f},apad=whole_dur={dur:.4f},"
                               f"afade=t=in:d=0.02,afade=t=out:st={dur - 0.03:.4f}:d=0.03",
                        "-c:v", "h264_videotoolbox", "-b:v", "40M",
                        "-c:a", "pcm_s16le", "-ar", "44100", "-ac", "2", p], check=True)
        return p

    vf = window(sp.get("center", CENTER), sp.get("zoom", 1))
    lst = [clip(i, src, a, b - a, vf) for i, (_, a, b) in enumerate(pcs)]
    durs = [duration(p) for p in lst]
    overlays = [(p, timeline(pcs, durs, k, t), timeline(pcs, durs, k, e)) for p, k, t, e in overlays]
    t = sum(durs)
    open(f"{tmp}/list.txt", "w").write("\n".join(f"file '{p}'" for p in lst))

    # 자막 시각 바로잡기: 이어 붙인 소리를 다시 받아써서 각 자막이 실제로 시작되는 시각으로 옮긴다
    order = sorted(range(len(overlays)), key=lambda i: overlays[i][1])
    wav = f"{tmp}/joined.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", f"{tmp}/list.txt",
                    "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    real = spoken_starts(wav, [subs[i][3] for i in order])
    starts = [r if r is not None and abs(r - overlays[i][1]) < 1.5 else overlays[i][1] for i, r in zip(order, real)]
    moved = max(abs(s0 - overlays[i][1]) for i, s0 in zip(order, starts))
    for n_, (i, s0) in enumerate(zip(order, starts)):
        p, _, e = overlays[i]
        nxt = starts[n_ + 1] if n_ + 1 < len(starts) else t
        overlays[i] = (p, max(s0 - 0.05, 0), nxt - 0.05 if n_ + 1 < len(starts) else t)
    n = len(pcs)
    fc = ["[0:v][1:v]overlay=0:0[l]"]
    last = "l"
    for i, (_, a, b) in enumerate(overlays):
        fc.append(f"[{last}][{i + 2}:v]overlay=0:1850:enable='between(t,{a:.3f},{b - 0.001:.3f})'[s{i}]")
        last = f"s{i}"
    # -reinit_filter 0: 조각이 바뀔 때 필터를 다시 만들면 한 번만 읽힌 레이어(틀·자막 PNG)가 빠진다
    cmd = ["ffmpeg", "-y", "-v", "error", "-reinit_filter", "0", "-f", "concat", "-safe", "0", "-i", f"{tmp}/list.txt",
           "-i", f"{tmp}/static.png"]
    for p, _, _ in overlays:
        cmd += ["-i", p]
    out = base + ".mp4"
    cmd += ["-filter_complex", ";".join(fc), "-map", f"[{last}]", "-map", "0:a", "-r", "30",
            "-c:v", "h264_videotoolbox", "-b:v", "17M", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]
    subprocess.run(cmd, check=True)
    print(f"✓ {os.path.relpath(out)}  {t:.1f}초 · {n}조각 · 자막 {len(subs)}개 (말소리에 맞춰 최대 {moved:.2f}초 옮김)")
    return pcs


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__ or "사용법: python3 sns/shorts.py 쇼츠.json [...]")
    for p in sys.argv[1:]:
        build(p)
