# 주일 현장 영상·사진 → 박자에 맞춰 자른 세로 리캡 쇼츠 mp4 (1080×1920, 30fps)
# 사용법:  python3 sns/recap.py sns/2026-10-04_하나님의첫이야기/리캡/리캡.json
#
# 리캡 json:
#   src     원본 폴더 (shots 의 파일명은 이 폴더 아래 어디에 있어도 찾는다)
#   music   [파일, 시작초, bpm, 첫박초]  첫박초 = 음악 파일에서 박자 하나가 떨어지는 시각
#   shots   [[박자수, [파일, 원본시작초, 가로중심, 세로중심, 확대], (두 번째 장면)], ...]
#           장면 1개 = 전체 화면, 2개 = 위아래로 쌓기(사람이 많아 보인다)
#           가로·세로중심은 원본 비율(0~1). 확대 1 = 원본 높이 전체를 잘라 쓴 것
#   texts   [[시작박, 끝박, "큰 글자", "작은 글자"], ...]
#   outro   박자수 — 마지막 로고 화면 길이
# 결과: json 옆에 리캡.mp4
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, "assets")
BLACK = os.path.join(A, "shorts", "Paperlogy-9Black.woff2")
PRE = os.path.expanduser("~/Library/Fonts/Pretendard-Bold.otf")
W, H, FPS = 1080, 1920, 30
NAVY, CREAM, ORANGE = (15, 30, 52), (244, 240, 230), (255, 154, 31)
PUSH = 0.07   # 컷마다 천천히 들어가는 확대 비율
PUNCH = 0.10  # 컷이 바뀌는 순간 살짝 튀어 들어왔다 돌아오는 확대 (박자감)
GRADE = "eq=contrast=1.06:saturation=1.2,colorbalance=rs=0.03:rm=0.02:bs=-0.03,vignette=PI/5"


def run(cmd):
    subprocess.run(cmd, check=True, capture_output=True)


def find(root, name):
    for d, _, fs in os.walk(root):
        if name in fs:
            return os.path.join(d, name)
    sys.exit(f"없음: {name}")


def size(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height:stream_side_data=rotation", "-of", "json", path],
                         capture_output=True, text=True).stdout
    s = json.loads(out)["streams"][0]
    rot = abs(int(s.get("side_data_list", [{}])[0].get("rotation", 0) or 0))
    return (s["height"], s["width"]) if rot in (90, 270) else (s["width"], s["height"])


def crop(sw, sh, cx, cy, zoom, aspect):
    ch = sh / zoom
    cw = ch * aspect
    if cw > sw:
        cw, ch = sw, sw / aspect
    x = min(max(cx * sw - cw / 2, 0), sw - cw)
    y = min(max(cy * sh - ch / 2, 0), sh - ch)
    return int(cw) // 2 * 2, int(ch) // 2 * 2, int(x), int(y)


def shot(parts, dur, out, tmp, flash=False):
    # parts: [[파일, 시작초, 가로중심, 세로중심, 확대], ...] — 1개면 전체 화면, 2개면 위아래로 쌓는다
    h = H // len(parts)
    inputs, chains = [], []
    f = f"(1+{PUSH}*t/{dur:.4f}+{PUNCH}*exp(-t/0.09))"
    for k, (path, start, cx, cy, zoom) in enumerate(parts):
        photo = path.lower().endswith((".jpg", ".jpeg", ".heic", ".png"))
        if photo:  # HEIC 는 jpg 로, 회전 정보는 픽셀에 반영해 둔다
            jpg = os.path.join(tmp, f"{os.path.basename(out)}{k}.jpg")
            if path.lower().endswith(".heic"):
                run(["sips", "-s", "format", "jpeg", path, "--out", jpg])
                path = jpg
            ImageOps.exif_transpose(Image.open(path)).convert("RGB").save(jpg)
            path = jpg
        sw, sh = Image.open(path).size if photo else size(path)
        cw, ch, x, y = crop(sw, sh, cx, cy, zoom, W / h)
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", path] if photo else ["-ss", str(start), "-i", path]
        chains.append(f"[{k}:v]crop={cw}:{ch}:{x}:{y},scale={W}:{h},"
                      f"scale=w='trunc({W}*{f}/2)*2':h='trunc({h}*{f}/2)*2':eval=frame,"
                      f"crop={W}:{h},fps={FPS},setsar=1[s{k}]")
    look = GRADE + (",fade=in:st=0:d=0.18:color=white" if flash else "")  # 마디 첫 박엔 하얀 번쩍임
    if len(parts) == 1:
        fc = chains[0] + f";[s0]{look},format=yuv420p[v]"
    else:  # 가운데 크림 선으로 나눈다
        fc = ";".join(chains) + f";[s0][s1]vstack,drawbox=y={h - 4}:w=iw:h=8:color=0xF4F0E6:t=fill,{look},format=yuv420p[v]"
    run(["ffmpeg", "-y", *inputs, "-t", f"{dur:.4f}", "-filter_complex", fc, "-map", "[v]", "-an",
         "-c:v", "libx264", "-preset", "medium", "-crf", "16", out])


def text_png(big, small, out):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    size_ = 128
    while d.textlength(big, font=ImageFont.truetype(BLACK, size_)) > W - 140:
        size_ -= 4
    fb, fs = ImageFont.truetype(BLACK, size_), ImageFont.truetype(PRE, 60)
    y = 1180
    bw = d.textlength(big, font=fb)
    d.text(((W - bw) / 2, y), big, font=fb, fill=CREAM)
    d.rectangle(((W - 120) / 2, y + 170, (W + 120) / 2, y + 182), fill=ORANGE)  # 주황은 글자 대신 밑줄
    if small:
        sw_ = d.textlength(small, font=fs)
        d.text(((W - sw_) / 2, y + 214), small, font=fs, fill=CREAM)
    base = Image.new("RGBA", im.size, (0, 0, 0, 0))  # 밝은 화면에서도 읽히도록 글자 뒤 그림자
    base.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(16)).point(lambda a: min(230, a * 3)))
    base.alpha_composite(im)
    box = base.getbbox()
    base.crop(box).save(out)
    return box


def outro_png(lines, out):
    im = Image.new("RGB", (W, H), NAVY)
    logo = Image.open(os.path.join(A, "logo-on-navy.png")).convert("RGBA")
    logo = logo.resize((760, int(760 * logo.height / logo.width)))
    im.paste(logo, ((W - 760) // 2, 640), logo)
    d = ImageDraw.Draw(im)
    y = 640 + logo.height + 120
    for i, s in enumerate(lines):
        f = ImageFont.truetype(PRE, 64 if i == 0 else 50)
        d.text(((W - d.textlength(s, font=f)) / 2, y), s, font=f, fill=CREAM if i == 0 else (200, 196, 186))
        y += 100
    im.save(out)


def main(cfg_path):
    cfg = json.load(open(cfg_path))
    T = 60 / cfg["music"][2]
    tmp = tempfile.mkdtemp()
    clips, beat = [], 0
    frame = lambda b: round(b * T * FPS)  # 누적 박자 → 프레임 (반올림이 쌓여 어긋나지 않게)
    for i, (beats, *parts) in enumerate(cfg["shots"]):
        dur = (frame(beat + beats) - frame(beat)) / FPS
        out = os.path.join(tmp, f"{i:02d}.mp4")
        shot([[find(cfg["src"], p[0]), *p[1:]] for p in parts], dur, out, tmp, flash=beat > 0 and beat % 8 == 0)
        clips.append(out)
        beat += beats
        print(f"{i:02d} {' / '.join(p[0] for p in parts)} {dur:.2f}s")
    ob = cfg["outro"]
    odur = (frame(beat + ob) - frame(beat)) / FPS
    opng = os.path.join(tmp, "outro.png")
    outro_png(cfg["outro_lines"], opng)
    oclip = os.path.join(tmp, "outro.mp4")
    run(["ffmpeg", "-y", "-loop", "1", "-framerate", str(FPS), "-i", opng, "-t", f"{odur:.4f}",
         "-vf", f"fade=in:st=0:d=0.25,format=yuv420p,setsar=1", "-c:v", "libx264", "-crf", "16", oclip])
    clips.append(oclip)
    total = (frame(beat + ob)) / FPS

    lst = os.path.join(tmp, "list.txt")
    open(lst, "w").write("".join(f"file '{c}'\n" for c in clips))
    joined = os.path.join(tmp, "joined.mp4")
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", joined])

    inputs, chain, last = [], [], "[0:v]"
    for k, (b0, b1, big, small) in enumerate(cfg["texts"]):
        png = os.path.join(tmp, f"t{k}.png")
        x0, y0, x1, y1 = text_png(big, small, png)
        inputs += ["-loop", "1", "-framerate", str(FPS), "-i", png]
        t0, t1 = frame(b0) / FPS, frame(b1) / FPS
        z = f"(1+0.35*exp(-max(t-{t0:.3f},0)/0.07))"  # 글자가 크게 튀어나왔다 자리 잡는다
        chain.append(f"[{k + 2}:v]scale=w='trunc({x1 - x0}*{z}/2)*2':h='trunc({y1 - y0}*{z}/2)*2':eval=frame,"
                     f"fade=in:st={t0:.3f}:d=0.15:alpha=1[tx{k}]")
        chain.append(f"{last}[tx{k}]overlay=x='{(x0 + x1) / 2}-w/2':y='{(y0 + y1) / 2}-h/2':eval=frame:"
                     f"enable='between(t,{t0:.3f},{t1 - 0.001:.3f})'[v{k}]")
        last = f"[v{k}]"
    mf, ms = cfg["music"][0], cfg["music"][1]
    audio = f"[1:a]atrim=0:{total:.3f},afade=t=in:d=0.15,afade=t=out:st={total - 2:.3f}:d=2[a]"
    out = os.path.join(os.path.dirname(os.path.abspath(cfg_path)), "리캡.mp4")
    run(["ffmpeg", "-y", "-i", joined, "-ss", str(ms), "-i", mf, *inputs,
         "-filter_complex", ";".join(chain + [audio]), "-map", last, "-map", "[a]",
         "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "192k", "-t", f"{total:.3f}", "-movflags", "+faststart", out])
    print(out, f"{total:.2f}s")


if __name__ == "__main__":
    main(sys.argv[1])
