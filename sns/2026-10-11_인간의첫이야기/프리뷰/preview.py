# 「인간의 첫 이야기」 설교 예고편 40초 (1080×1920 세로, 30fps)
# 기획: 스마트폰 쇼츠를 넘기듯 보는 타락사 → 글리치·암전 → 십자가 → [죄] → 설교 안내
# 실사 소스 없이 실루엣 모션그래픽(PIL/numpy) + 합성 효과음(numpy) 으로 만든다.
# 사용법: python3 preview.py              → 프리뷰.mp4
#         python3 preview.py 5 12.3 30    → 그 초의 정지 화면 PNG (확인용, still/ 폴더)
import math, os, sys, wave, subprocess
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SNS = os.path.abspath(os.path.join(HERE, "..", ".."))
W, H, FPS, DUR, SR = 1080, 1920, 30, 40.0, 48000
CREAM, ORANGE, NAVY = (251, 246, 234), (255, 154, 31), (20, 16, 10)

# ── 이번 주 정보 (data.js 에 아직 10/11 설교가 없어 기획안 제목을 쓴다) ──
TITLE = "인간의 첫 이야기"
WHEN = "10월 11일 주일 저녁 6시"
WHERE = "4942 FL-46 #1026, Sanford"
QUESTION = ["우리는 어디서부터", "어긋났을까요?"]
SUBCOPY = ["인간이 쌓아 올린 파멸,", "그 끝에서 시작된 하나님의 사랑."]

FONTS = {
    "pre": os.path.expanduser("~/Library/Fonts/Pretendard-ExtraBold.otf"),
    "pre_sb": os.path.expanduser("~/Library/Fonts/Pretendard-SemiBold.otf"),
    "pre_b": os.path.expanduser("~/Library/Fonts/Pretendard-Bold.otf"),
    "myung": "/System/Library/Fonts/Supplemental/AppleMyungjo.ttf",
    "pre_r": os.path.expanduser("~/Library/Fonts/Pretendard-Regular.otf"),
}


@lru_cache(None)
def F(name, size):
    if name == "heavy":
        return ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", size, index=16)
    return ImageFont.truetype(FONTS[name], size)


# ── 공용 ──
def seg(t, a, b): return min(1.0, max(0.0, (t - a) / (b - a)))
def smooth(p): return p * p * (3 - 2 * p)
def ein(p): return p ** 3
def eout(p): return 1 - (1 - p) ** 3
def arr(img): return np.asarray(img, np.float32)
def img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


@lru_cache(None)
def grid(w, h):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    return yy, xx


def vgrad(w, h, stops):
    y = np.linspace(0, 1, h)
    cols = np.stack([np.interp(y, [s[0] for s in stops], [s[1][c] for s in stops]) for c in range(3)], -1)
    return np.repeat(cols[:, None, :], w, 1).astype(np.float32)


def radial(w, h, cx, cy, r, pw=2.0):
    yy, xx = grid(w, h)
    return np.clip(1 - np.hypot(xx - cx, yy - cy) / r, 0, 1) ** pw


@lru_cache(None)
def fbm(seed, w, h, cell=256, octaves=5):
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0.0
    for _ in range(octaves):
        g = rng.random((max(2, h // cell + 2), max(2, w // cell + 2))).astype(np.float32)
        out += amp * np.asarray(Image.fromarray(g, "F").resize((w, h), Image.BICUBIC))
        tot += amp; amp *= 0.5; cell = max(2, cell // 2)
    out /= tot
    return (out - out.min()) / (out.max() - out.min())


def cam(im, z=1.0, dx=0.0, dy=0.0, cx=W / 2, cy=H / 2, t=None, rot=0.0):
    """화면 확대·흔들기. (cx, cy) 를 중심으로 z 배 확대하고 dx, dy 만큼 민다.
    t 를 주면 손으로 든 카메라처럼 천천히 떠다닌다."""
    if t is not None:
        dx += 10 * math.sin(t * .7) + 4 * math.sin(t * 1.3 + 1)
        dy += 8 * math.sin(t * .55 + 2)
        rot += .45 * math.sin(t * .45)
        z *= 1.035
    a = math.radians(rot); c, s_ = math.cos(a) / z, math.sin(a) / z
    ox, oy = cx + dx, cy + dy
    return im.transform((W, H), Image.AFFINE,
                        (c, -s_, ox - c * W / 2 + s_ * H / 2, s_, c, oy - s_ * W / 2 - c * H / 2), Image.BICUBIC)


def shake(t, amt, seed=0):
    return (amt * (math.sin(t * 53 + seed) + 0.6 * math.sin(t * 91 + 2 * seed)),
            amt * (math.cos(t * 47 + seed) + 0.6 * math.sin(t * 77 + seed)))


def over(base, layer): return Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB")


def capsule(d, a, b, w, fill):
    d.line([a, b], fill=fill, width=int(w))
    for p in (a, b):
        d.ellipse([p[0] - w / 2, p[1] - w / 2, p[0] + w / 2, p[1] + w / 2], fill=fill)


def person(d, x, y, h, col):
    r = h * 0.09
    d.ellipse([x - r, y - h, x + r, y - h + 2 * r], fill=col)
    s = y - h + 2.1 * r
    d.polygon([(x - h * .13, s), (x + h * .13, s), (x + h * .1, y - h * .45), (x + h * .08, y),
               (x + h * .02, y), (x, y - h * .4), (x - h * .02, y), (x - h * .08, y), (x - h * .1, y - h * .45)], fill=col)
    capsule(d, (x - h * .12, s + 4), (x - h * .2, y - h * .5), h * .06, col)
    capsule(d, (x + h * .12, s + 4), (x + h * .2, y - h * .5), h * .06, col)


def motes(im, t, n, color, seed, rise=40, size=(2, 6), alpha=170):
    rng = np.random.default_rng(seed)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for x, y, s, ph, sp in zip(rng.random(n) * W, rng.random(n) * H, rng.uniform(*size, n), rng.random(n) * 6.28, rng.uniform(.5, 1.5, n)):
        yy = (y - t * rise * sp) % H
        xx = x + 18 * math.sin(t * .8 + ph)
        a = int(alpha * (0.5 + 0.5 * math.sin(t * 2 * sp + ph)))
        d.ellipse([xx - s, yy - s, xx + s, yy + s], fill=color + (a,))
    return over(im, lay.filter(ImageFilter.GaussianBlur(1.2)))


# ════════════════════════ 장면 ════════════════════════
# 1) 에덴
@lru_cache(None)
def eden_bg():
    w, h = int(W * 1.12), int(H * 1.12)
    a = vgrad(w, h, [(0, (246, 214, 160)), (.3, (255, 230, 178)), (.5, (255, 214, 148)), (.62, (246, 188, 118)), (1, (240, 178, 108))])
    sx, sy = w * .5, h * .46
    a += np.array([255, 250, 230], np.float32) * (radial(w, h, sx, sy, h * .55, 2.2) * .55)[..., None]
    a += 255 * (radial(w, h, sx, sy, 170, 1.5) * .9)[..., None]
    im = img(a)
    rays = Image.new("L", (w, h), 0); dr = ImageDraw.Draw(rays)
    for k in range(18):
        ang, wd = k / 18 * 6.283 + .1, .04 + .025 * (k % 3)
        dr.polygon([(sx, sy), (sx + 3000 * math.cos(ang - wd), sy + 3000 * math.sin(ang - wd)),
                    (sx + 3000 * math.cos(ang + wd), sy + 3000 * math.sin(ang + wd))], fill=35 + (k * 37) % 40)
    rays = arr(rays.filter(ImageFilter.GaussianBlur(30))) / 255
    im = img(arr(im) + rays[..., None] * np.array([255, 245, 215]) * .45)
    d = ImageDraw.Draw(im)
    xs = np.arange(0, w + 10, 10)
    hills = [(.57, 28, 160, 0, (196, 196, 130)), (.63, 45, 260, 1, (140, 160, 90)),
             (.72, 60, 330, 2, (92, 128, 64)), (.86, 50, 280, 3, (52, 88, 44))]
    crest = None
    for base, amp, per, ph, col in hills:
        ys = h * base + amp * np.sin(xs / per + ph) + amp * .4 * np.sin(xs / (per * .37) + ph * 2)
        d.polygon([(0, h)] + list(zip(xs, ys)) + [(w, h)], fill=col)
        if ph == 2: crest = ys
    # 나무
    tx, ty = w * .8, h * .70
    d.polygon([(tx - 34, ty + 30), (tx + 34, ty + 30), (tx + 16, ty - 260), (tx - 16, ty - 260)], fill=(58, 58, 34))
    rng = np.random.default_rng(4)
    for _ in range(160):
        a_, rr = rng.random() * 6.283, rng.random() ** .5 * 250
        cx, cy = tx + rr * math.cos(a_) * 1.15, ty - 420 + rr * math.sin(a_) * .8
        r = rng.uniform(40, 80)
        lit = max(0, (sx - cx) / w + .3)
        c = tuple(int(v) for v in np.array([46, 82, 42]) + lit * np.array([80, 70, 30]) + rng.uniform(-8, 8, 3))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)
    # 두 사람 (가까운 언덕 꼭대기)
    i = int(np.argmin(crest[20:70])) + 20
    px, py = xs[i], crest[i] + 4
    person(d, px - 26, py, 150, (70, 74, 44)); person(d, px + 26, py + 2, 140, (70, 74, 44))
    d.line([(px - 4, py - 70), (px + 4, py - 70)], fill=(70, 74, 44), width=9)
    # 꽃
    for _ in range(260):
        x = rng.random() * w; y = h * .87 + rng.random() * h * .13
        r = rng.uniform(3, 8)
        d.ellipse([x - r, y - r, x + r, y + r], fill=[(255, 250, 240), (255, 200, 210), (255, 225, 120)][rng.integers(3)])
    im = im.filter(ImageFilter.GaussianBlur(1.8))
    a = arr(im)
    a = a * .75 + arr(im.filter(ImageFilter.GaussianBlur(18))) * .45  # 부드러운 빛번짐
    return img(a)


def eden(lt):
    p = lt / 5.2
    im = cam(eden_bg(), z=(1 + .06 * p) / 1.12, cx=eden_bg().size[0] / 2, cy=eden_bg().size[1] / 2, t=lt)
    im = img(arr(im) * (1 + .05 * math.sin(lt * 1.6)))
    return motes(im, lt, 40, (255, 250, 225), 1, rise=30, alpha=200)


# 2) 선악과 → 닫히는 문
@lru_cache(None)
def forest_bg():
    a = vgrad(W, H, [(0, (12, 2, 3)), (.45, (64, 6, 9)), (1, (6, 1, 2))])
    a += np.array([175, 22, 26], np.float32) * (radial(W, H, 560, 820, 760, 2.0) * .8)[..., None]
    a += np.array([90, 12, 15], np.float32) * (fbm(3, W, H, 200) ** 2 * .5)[..., None]
    im = img(a)
    rng = np.random.default_rng(7)
    far = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(far)
    for x in [60, 190, 330, 760, 900, 1030]:
        wd = rng.uniform(18, 40); lean = rng.uniform(-60, 60)
        d.polygon([(x - wd, H), (x + wd, H), (x + lean + wd * .6, 0), (x + lean - wd * .6, 0)], fill=(28, 3, 5, 255))
    im = over(im, far.filter(ImageFilter.GaussianBlur(5)))
    near = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(near)
    for x, wd in [(-20, 120), (160, 60), (980, 90), (1110, 140)]:
        lean = rng.uniform(-40, 40)
        d.polygon([(x - wd, H), (x + wd, H), (x + lean + wd * .7, 0), (x + lean - wd * .7, 0)], fill=(3, 0, 1, 255))
        for _ in range(3):
            y0 = rng.uniform(150, 900); s = 1 if x < 540 else -1
            d.line([(x, y0), (x + s * rng.uniform(150, 300), y0 - rng.uniform(80, 220))], fill=(3, 0, 1, 255), width=int(rng.uniform(10, 22)))
    d.line([(160, 420), (380, 560), (560, 660)], fill=(3, 0, 1, 255), width=20)  # 열매 가지
    return over(im, near.filter(ImageFilter.GaussianBlur(3)))


@lru_cache(None)
def fruit_sprite(r):
    s = 2 * r + 4
    yy, xx = grid(s, s)
    dd = np.hypot(xx - s / 2, yy - s / 2) / r
    col = np.array([205, 22, 28]) * (1 - dd[..., None] * .55) * (1 - .4 * ((xx - s / 2 + yy - s / 2) / (2 * r)).clip(0)[..., None])
    hl = np.clip(1 - np.hypot((xx - s / 2 + r * .35) / (r * .28), (yy - s / 2 + r * .4) / (r * .18)), 0, 1) ** 1.5
    col = col + 255 * hl[..., None] * .8
    alpha = np.clip((1 - dd) * r, 0, 1) * 255
    return Image.fromarray(np.dstack([np.clip(col, 0, 255), alpha]).astype(np.uint8), "RGBA")


def hand(d, x, y, grip, col=(2, 0, 1)):
    d.polygon([(x + 40, y - 55), (x + 60, y + 60), (W + 300, y + 420), (W + 300, y + 200)], fill=col)
    d.ellipse([x - 60, y - 62, x + 80, y + 68], fill=col)
    for k in range(4):
        a = (x - 40, y - 50 + k * 32)
        b = (x - 170 + grip * (60 + k * 6), y - 66 + k * 36 + grip * 10)
        capsule(d, a, b, 30 - k * 2, col)
    capsule(d, (x - 10, y + 50), (x - 90 + grip * 20, y + 80 - grip * 30), 32, col)


def fall(lt):
    if lt < 1.5: return fall_a(lt)
    gl = 1.7 + (lt - 1.7) * 1.3 / 1.9  # 문 장면이 1.3초 → 1.9초로 늘어난 만큼 천천히
    if lt > 1.9: return fall_b(gl)
    return Image.blend(fall_a(lt), fall_b(gl), smooth(seg(lt, 1.5, 1.9)))


def fall_a(lt):
    if True:
        im = forest_bg().copy()
        hx = 560 + 130 + 600 * (1 - eout(seg(lt, .1, 1.0)))
        hy = 820 + 40 * (1 - eout(seg(lt, .1, 1.0)))
        grip = smooth(seg(lt, .85, 1.1))
        pull = ein(seg(lt, 1.15, 1.7))
        fx, fy = 560, 820
        stem = (560, 660)
        if lt >= 1.12:
            hx += 700 * pull; hy += 300 * pull
            fx, fy = hx - 120, hy + 4
            stem = (560, 660 - 30 * math.sin(min(1, (lt - 1.12) * 6) * 3.14) * math.exp(-(lt - 1.12) * 3))
        d = ImageDraw.Draw(im)
        if lt < 1.12:
            d.line([stem, (fx, fy - 80)], fill=(3, 0, 1), width=8)
        f = fruit_sprite(85)
        im.paste(f, (int(fx - f.width / 2), int(fy - f.height / 2)), f)
        hl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        hand(ImageDraw.Draw(hl), hx, hy, grip, (2, 0, 1, 255))
        im = over(im, hl.filter(ImageFilter.GaussianBlur(2.5)))
        dx, dy = shake(lt, 14 * max(0, 1 - abs(lt - 1.15) * 5))
        return cam(im, 1.02 + .03 * lt, dx, dy, t=lt)


def fall_b(lt):  # 문이 닫힌다
    p = ein(seg(lt, 1.75, 2.72))
    gap = 560 * (1 - p)
    a = arr(door_tex()).copy()
    view = arr(cam(eden_bg(), 1.0, cx=eden_bg().size[0] / 2, cy=eden_bg().size[1] / 2)) * .8
    x0, x1 = int(540 - gap / 2), int(540 + gap / 2)
    if x1 > x0:
        a[260:1560, x0:x1] = view[260:1560, x0:x1]
    glow = radial(W, H, 540, 900, 300 + gap * 1.6, 2.0) * (gap / 560) ** .7
    a += np.array([255, 205, 140], np.float32) * glow[..., None] * .55
    if lt > 2.72:
        a *= 1 - .5 * seg(lt, 2.72, 3.0)
    im = img(a)
    if lt > 2.7:
        im = motes(im, lt * 3, 60, (120, 100, 80), 9, rise=-90, size=(2, 5), alpha=120)
    dx, dy = shake(lt, 18 * max(0, 1 - (lt - 2.72) * 4) if lt > 2.72 else 0)
    return cam(im, 1.04, dx, dy, t=lt)


@lru_cache(None)
def door_tex():
    n = fbm(11, W, H, 128)
    a = np.array([52, 40, 31], np.float32) * (.55 + .7 * n)[..., None]
    im = img(a); d = ImageDraw.Draw(im)
    for y in range(300, 1560, 180):
        d.line([(0, y), (W, y)], fill=(25, 18, 14), width=6)
    d.rectangle([0, 0, W, 260], fill=(14, 10, 8)); d.rectangle([0, 1560, W, H], fill=(10, 7, 6))
    return im


# 3) 가인 — 피 묻은 돌
@lru_cache(None)
def cain_bg():
    w, h = int(W * 1.15), int(H * 1.15)
    n = fbm(21, w, h, 160)
    fine = fbm(22, w, h, 16, 3)
    a = np.array([128, 96, 64], np.float32) * (.45 + .6 * n + .25 * fine)[..., None]
    a *= (0.35 + 0.75 * np.linspace(0, 1, h) ** .6)[:, None, None]
    yy, xx = grid(w, h)
    cx, cy = w * .5, h * .5
    ang = np.arctan2(yy - cy, xx - cx)
    rr = 230 + 35 * np.sin(ang * 3 + 1) + 22 * np.sin(ang * 7) + 12 * np.sin(ang * 13 + 2)
    d = np.hypot((xx - cx) / 1.25, yy - cy)
    sh = np.clip(1 - (np.hypot((xx - cx - 40) / 1.3, (yy - cy - 60)) - rr) / 70, 0, 1)
    a *= (1 - .6 * sh)[..., None]
    m = np.clip(rr - d, 0, 1)
    light = np.clip(1.1 - ((xx - cx) + (yy - cy)) / 520 - (d / rr) ** 3 * .5, .15, 1.2)
    stone = np.array([150, 144, 132], np.float32) * (light * (.6 + .5 * fine))[..., None]
    a = a * (1 - m[..., None]) + stone * m[..., None]
    # 돌 위의 피
    bm = np.clip(1 - np.hypot((xx - cx - 140) / 120, (yy - cy + 60) / 90) - n * .5 + .2, 0, 1) * m
    a = a * (1 - bm[..., None]) + np.array([96, 6, 10], np.float32) * bm[..., None]
    return img(a)


def cain(lt):
    big = cain_bg()
    w, h = big.size
    a = arr(big).copy()
    r = 210 * eout(seg(lt, .3, 3.6))
    if r > 1:
        yy, xx = grid(w, h)
        n = fbm(23, w, h, 64, 3)
        pm = np.clip((1 - np.hypot((xx - w * .5 - 220) / (r * 1.4), (yy - h * .5 - 230) / r) - (n - .5) * .5) * 3, 0, 1)
        col = np.array([70, 3, 7], np.float32) + 60 * np.clip(n - .6, 0, 1)[..., None] * np.array([1, .2, .2])
        a = a * (1 - pm[..., None]) + col * pm[..., None]
    im = img(a); d = ImageDraw.Draw(im)
    for k in range(3):  # 돌 가장자리에서 떨어지는 방울
        ph = (lt * 1.4 + k * .37) % 1
        x = w * .5 + 200 + k * 18; y = h * .5 + 70 + ph * 140
        if ph < .9:
            d.ellipse([x - 7, y - 10, x + 7, y + 10], fill=(110, 6, 12))
    im = cam(im, (1 + .08 * lt / 3.6), cx=w * .5 + 60, cy=h * .5 + 80, t=lt)
    return motes(im, lt, 30, (210, 180, 140), 3, rise=12, alpha=90)


# 5) 노아 — 검은 파도
@lru_cache(None)
def storm_bg():
    a = vgrad(W, H + 200, [(0, (30, 36, 46)), (.5, (16, 20, 27)), (1, (6, 8, 11))])
    c = fbm(51, W, H + 200, 220)
    a = a * (.55 + .8 * c)[..., None]
    return a


@lru_cache(None)
def bolt():
    rng = np.random.default_rng(5)
    pts = [(620, 0)]
    while pts[-1][1] < 1000:
        x, y = pts[-1]; pts.append((x + rng.uniform(-70, 60), y + rng.uniform(40, 90)))
    return pts


def flood(lt):
    a = storm_bg()[int(40 * lt):int(40 * lt) + H].copy()
    fl = max(0, 1 - abs(lt - .5) * 7) + .6 * max(0, 1 - abs(lt - 1.9) * 9)
    a += 170 * fl
    yy, xx = grid(W, H)
    hw = 520 + 1000 * smooth(seg(lt, 0, 2.7))
    x = xx[0]
    prof = H - hw * (.55 + .45 * np.exp(-((x - 360) / 430) ** 2)) + 26 * np.sin(x / 60 + lt * 7) + 14 * np.sin(x / 23 - lt * 11)
    dpt = yy - prof[None, :]
    body = np.array([4, 9, 12], np.float32) + np.array([40, 62, 70], np.float32) * np.clip(1 - dpt / 380, 0, 1)[..., None] ** 2
    m = np.clip(dpt, 0, 1)[..., None]
    a = a * (1 - m) + body * m
    foam = np.clip(1 - np.abs(dpt - 8) / (10 + 22 * fbm(52, W, H, 24, 3)), 0, 1) * (fbm(53, W, H, 16, 2) > .45)
    a += 200 * foam[..., None]
    im = img(a)
    if fl > .2:
        lay = Image.new("L", (W, H), 0); ImageDraw.Draw(lay).line(bolt(), fill=255, width=7)
        g = arr(lay.filter(ImageFilter.GaussianBlur(10))) * 1.5 + arr(lay)
        im = img(arr(im) + (g * fl)[..., None])
    rng = np.random.default_rng(int(lt * 30) + 100)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for _ in range(170):
        x0, y0 = rng.random() * (W + 300), rng.random() * H
        d.line([(x0, y0), (x0 - 50, y0 + 130)], fill=(190, 200, 210, int(rng.uniform(40, 110))), width=2)
    im = over(im, lay.filter(ImageFilter.GaussianBlur(1.2)))
    dx, dy = shake(lt, 6 + 10 * seg(lt, 1, 2.8))
    return cam(im, 1.03 + .04 * lt / 2.8, dx, dy, t=lt)


# 6) 바벨탑
@lru_cache(None)
def babel_parts():
    sky = vgrad(W, H, [(0, (16, 7, 6)), (.55, (70, 26, 14)), (.72, (130, 52, 22)), (1, (40, 14, 8))])
    sky *= (.6 + .6 * fbm(61, W, H, 240))[..., None]
    tw = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(tw)
    rng = np.random.default_rng(6)
    base, th = 1700, 125
    for i in range(10):
        wd = 820 * (1 - i * .088); y1 = base - i * th; y0 = y1 - th + 14
        d.polygon([(540 - wd / 2, y1), (540 + wd / 2, y1), (540 + wd / 2 - 22, y0), (540 - wd / 2 + 22, y0)], fill=(26, 14, 10, 255))
        d.line([(540 - wd / 2, y1), (540 - wd / 2 + 22, y0)], fill=(210, 96, 40, 255), width=5)  # 왼쪽 가장자리 빛
        d.line([(540 - wd / 2 + 30, y1 - 6), (540 + wd / 2 - 40, y0 + 8)], fill=(48, 26, 18, 255), width=8)  # 계단
        for _ in range(int(wd / 60)):
            x = 540 + rng.uniform(-wd / 2 + 40, wd / 2 - 40); y = rng.uniform(y0 + 30, y1 - 30)
            d.rectangle([x - 4, y - 7, x + 4, y + 7], fill=(255, 150, 60, 255))
    d.polygon([(500, base - 10 * th + 14), (580, base - 10 * th + 14), (548, 200), (532, 200)], fill=(26, 14, 10, 255))
    crack = [(540, 150)]
    while crack[-1][1] < 1720:
        x, y = crack[-1]; crack.append((540 + rng.uniform(-40, 40), y + rng.uniform(50, 110)))
    left = Image.new("L", (W, H), 0)
    ImageDraw.Draw(left).polygon([(0, 0)] + crack + [(crack[-1][0], H), (0, H)], fill=255)
    tw = tw.filter(ImageFilter.GaussianBlur(1.8))
    return sky, tw, crack, left


def babel(lt):
    sky, tw, crack, left = babel_parts()
    a = sky.copy()
    a += 40 * fbm(62, W, H, 120)[..., None] * math.sin(lt * 2)
    im = img(a)
    rise = (1 - eout(seg(lt, 0, 1.3))) * 1300
    dx = 34 * eout(seg(lt, 1.5, 2.1))
    if lt < 1.5:
        im.paste(tw, (0, int(rise)), tw)
    else:
        L = tw.copy(); L.putalpha(Image.composite(tw.getchannel("A"), Image.new("L", (W, H), 0), left))
        R = tw.copy(); R.putalpha(Image.composite(Image.new("L", (W, H), 0), tw.getchannel("A"), left))
        g = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(g).line(crack, fill=(255, 140, 50, 255), width=int(4 + dx))
        im = over(im, g.filter(ImageFilter.GaussianBlur(8)))
        im.paste(L.rotate(1.5 * dx / 34, center=(300, 1700)), (int(-dx), 0), L.rotate(1.5 * dx / 34, center=(300, 1700)))
        im.paste(R.rotate(-1.5 * dx / 34, center=(780, 1700)), (int(dx), 0), R.rotate(-1.5 * dx / 34, center=(780, 1700)))
        if lt > 1.5:
            im = motes(im, lt * 4, 50, (60, 30, 20), 12, rise=-160, size=(4, 10), alpha=230)
    d = ImageDraw.Draw(im)
    xs = np.arange(0, W + 20, 20)
    d.polygon([(0, H)] + list(zip(xs, 1690 + 18 * np.sin(xs / 90))) + [(W, H)], fill=(10, 5, 4))
    sx, sy = shake(lt, 3 + 16 * max(0, 1 - abs(lt - 1.55) * 3))
    return cam(im, 1.02 + .04 * lt / 2.4, sx, sy, t=lt)


# 7) 포로 — 진흙 속 쇠사슬
@lru_cache(None)
def mud_bg():
    n = fbm(71, W, H, 140); f = fbm(72, W, H, 20, 3)
    a = np.array([62, 44, 30], np.float32) * (.4 + .6 * n + .3 * f)[..., None]
    wet = np.clip(n - .62, 0, 1) * 5
    a += np.array([90, 90, 95]) * (wet * np.clip(f - .5, 0, 1) * 2)[..., None]
    a *= (.45 + .7 * np.linspace(0, 1, H) ** .7)[:, None, None]
    return a


@lru_cache(None)
def link_sprites():
    face = Image.new("RGBA", (170, 110), (0, 0, 0, 0)); d = ImageDraw.Draw(face)
    d.ellipse([6, 6, 164, 104], outline=(58, 58, 62, 255), width=30)
    d.arc([12, 10, 158, 98], 190, 300, fill=(170, 170, 175, 255), width=7)
    edge = Image.new("RGBA", (170, 40), (0, 0, 0, 0)); d = ImageDraw.Draw(edge)
    d.rounded_rectangle([4, 6, 166, 34], 14, fill=(48, 48, 52, 255))
    d.line([(20, 13), (150, 13)], fill=(150, 150, 155, 255), width=5)
    return face, edge


def exile(lt):
    im = img(mud_bg())
    face, edge = link_sprites()
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    path = lambda s: (560 - 520 * s + 60 * math.sin(s * 3), 840 + 1150 * s ** 1.1)
    off = (lt * .35) % (2 * .072)
    for k in range(-2, 16):
        s = k * .072 + off
        if s < 0: continue
        x, y = path(s); x2, y2 = path(s + .01)
        ang = math.degrees(math.atan2(-(y2 - y), x2 - x))
        sp = (face if k % 2 == 0 else edge).rotate(ang, resample=Image.BICUBIC, expand=True)
        lay.paste(sp, (int(x - sp.width / 2), int(y - sp.height / 2)), sp)
    d = ImageDraw.Draw(lay)
    for i, (x, ph) in enumerate([(470, 0), (690, 3.14)]):  # 발목과 족쇄
        lift = max(0, math.sin(lt * 2.2 + ph)) * 40
        d.polygon([(x - 50, -10), (x + 50, -10), (x + 46, 820 - lift), (x - 46, 820 - lift)], fill=(40, 28, 22, 255))
        d.ellipse([x - 70, 790 - lift, x + 110, 880 - lift], fill=(40, 28, 22, 255))
        d.rounded_rectangle([x - 60, 700 - lift, x + 60, 770 - lift], 16, fill=(52, 52, 56, 255))
        d.line([(x - 50, 712 - lift), (x + 50, 712 - lift)], fill=(150, 150, 155, 255), width=5)
    im = over(im, lay.filter(ImageFilter.GaussianBlur(1.8)))
    dx, dy = shake(lt, 3)
    im = motes(im, lt, 30, (170, 150, 120), 8, rise=-20, size=(2, 4), alpha=110)
    return cam(im, 1.03 + .05 * lt / 1.8, dx, dy, t=lt)


SCENES = {"eden": eden, "fall": fall, "cain": cain, "flood": flood, "babel": babel, "exile": exile}
TAGS = {"eden": "#생명 #완벽한_시작", "fall": "#선악과 #불순종 #추방", "cain": "#살인 #질투",
        "flood": "#타락 #심판", "babel": "#교만 #바벨", "exile": "#노예 #절망"}
FEED = [(1.9, "eden", 0), (6.0, "fall", 0), (9.6, "cain", 0), (13.4, "flood", 0), (17.0, "babel", 0), (20.4, "exile", 0)]
for i, name in enumerate(["cain", "flood", "babel", "exile", "cain", "flood", "babel", "exile"]):
    FEED.append((23.8 + i * .15, name, {"cain": 2.6, "flood": .5, "babel": 1.9, "exile": 1.0}[name]))
SWIPE_END = 25.0


# 사건마다 한 줄 설명 (인스타 감성: 가는 글씨 · 짧게 · 성경 장절은 아래 작게)
# 사건마다 말씀 (개역개정 원문 그대로, 장면에 맞는 부분만 · 줄바꿈만 넣음)
DESC = {"eden": (["하나님이 지으신 그 모든 것을", "보시니 보시기에 심히 좋았더라"], "창세기 1:31"),
        "fall": (["선악을 알게 하는 나무의 열매는", "먹지 말라"], "창세기 2:17"),
        "gate": (["이같이 하나님이", "그 사람을 쫓아내시고"], "창세기 3:24"),
        "cain": (["네 아우의 핏소리가", "땅에서부터 내게 호소하느니라"], "창세기 4:10"),
        "flood": (["그의 마음으로 생각하는", "모든 계획이", "항상 악할 뿐임을 보시고"], "창세기 6:5"),
        "babel": (["그 탑 꼭대기를 하늘에 닿게 하여", "우리 이름을 내고"], "창세기 11:4"),
        "exile": (["놋 사슬로 그를 결박하여", "바벨론으로 끌고 갔더라"], "열왕기하 25:7"),
        "cross": (["그가 찔림은 우리의 허물 때문이요", "그가 상함은 우리의 죄악 때문이라"], "이사야 53:5"),
        "drop": (["친히 나무에 달려 그 몸으로", "우리 죄를 담당하셨으니"], "베드로전서 2:24")}


def caption(im, lines, ref, al, y):
    """가는 흰 글씨 + 부드러운 그림자. al 0→1 로 떠오르며 나타난다."""
    if al <= 0: return im
    y += 16 * (1 - al)
    txt = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
    for i, line in enumerate(lines):
        d.text((540, y + i * 70), line, font=F("pre_r", 50), fill=(255, 255, 255, int(255 * al)), anchor="mm")
    if ref:
        d.text((540, y + len(lines) * 70 + 14), ref, font=F("pre_r", 36), fill=(255, 255, 255, int(190 * al)), anchor="mm")
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sh.putalpha(txt.getchannel("A").filter(ImageFilter.GaussianBlur(10)).point(lambda v: min(255, int(v * 1.7))))
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))  # 밝은 화면에서도 읽히게 글 뒤에 은은한 어두운 띠
    bot = y + len(lines) * 70 + (30 if ref else 0)
    ImageDraw.Draw(band).rounded_rectangle([120, y - 70, 960, bot + 10], 60, fill=(0, 0, 0, int(120 * al)))
    return over(over(over(im, band.filter(ImageFilter.GaussianBlur(40))), sh), txt)


def clip(i, t):
    st, name, l0 = FEED[i]
    fr = SCENES[name](l0 + t - st)
    if i >= 6: return fr  # 빠른 스크롤 구간은 글 없이
    lt = t - st
    if name == "fall":  # 열매(창 2:17) → 닫히는 문(창 3:24)
        if lt < 1.6: return caption(fr, *DESC["fall"], smooth(seg(lt, .3, .7)) * (1 - seg(lt, 1.35, 1.6)), 1300)
        return caption(fr, *DESC["gate"], smooth(seg(lt, 1.75, 2.15)), 1300)
    return caption(fr, *DESC[name], smooth(seg(lt, .3, .7)) if i else smooth(seg(lt, .9, 1.5)), 1300)


def feed(t):
    """쇼츠 화면 안의 내용 + 지금 보이는 태그. 스와이프 중엔 두 장면이 위로 밀린다."""
    if t < 1.9: return Image.new("RGB", (W, H), (0, 0, 0)), None
    i = max(k for k, f in enumerate(FEED) if f[0] <= t)
    st, name, l0 = FEED[i]
    fr = clip(i, t)
    if i == 0:
        return img(arr(fr) * seg(t, 1.9, 2.6)), name
    sw = .32 if st < 23.8 else .15
    if t - st >= sw:
        return fr, name
    p = eout((t - st) / sw)
    pst, pname, pl0 = FEED[i - 1]
    prev = clip(i - 1, t)
    out = Image.new("RGB", (W, H))
    prev = img(arr(prev) * (1 - .5 * p))
    out.paste(prev, (0, int(-H * p))); out.paste(fr, (0, int(H * (1 - p))))
    a = arr(out)  # 세로 흔들림 번짐 (빠를수록 길게)
    sp = int(26 * (1 - p)) + 1
    a = sum(np.roll(a, k * sp, 0) for k in range(5)) / 5
    return img(a), (name if p > .5 else pname)


def fmt(n):
    if n >= 1e8: return f"{n / 1e8:.1f}억".replace(".0억", "억")
    if n >= 1e4: return f"{n / 1e4:.1f}만".replace(".0만", "만") if n < 1e5 else f"{int(n / 1e4)}만"
    if n >= 1e3: return f"{n / 1e3:.1f}천"
    return str(int(n))


def likes(t):
    if t < 9.6: return 1240 if t < 6.0 else 3800
    return 12000 * 10 ** (5 * min(15.4, t - 9.6) / 15.4)


def heart(d, cx, cy, s, fill=None, outline=None, width=6):
    pts = [(cx + s * 16 * math.sin(a) ** 3 / 17, cy - s * (13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)) / 17)
           for a in np.linspace(0, 6.283, 80)]
    if fill: d.polygon(pts, fill=fill)
    if outline: d.line(pts + [pts[0]], fill=outline, width=width, joint="curve")


@lru_cache(None)
def avatar(sz=96):
    e = Image.open(os.path.join(SNS, "assets", "emblem.png")).convert("RGBA")
    e.thumbnail((sz - 30, sz - 30))
    bg = Image.new("RGBA", (sz, sz), (0, 0, 0, 0))
    ring = vgrad(sz, sz, [(0, (250, 180, 40)), (.5, (240, 40, 110)), (1, (150, 50, 200))])
    rm = Image.new("L", (sz, sz), 0); ImageDraw.Draw(rm).ellipse([0, 0, sz - 1, sz - 1], fill=255)
    bg.paste(img(ring), (0, 0), rm)
    ImageDraw.Draw(bg).ellipse([5, 5, sz - 6, sz - 6], fill=(255, 255, 255, 255))
    ImageDraw.Draw(bg).ellipse([9, 9, sz - 10, sz - 10], fill=NAVY + (255,))
    bg.alpha_composite(e, ((sz - e.width) // 2, (sz - e.height) // 2))
    return bg


@lru_cache(None)
def ui_shade():
    a = np.zeros((H, W, 4), np.float32)
    y = np.arange(H)
    a[..., 3] = (np.clip((y - 1250) / 670, 0, 1) ** 1.2 * 190 + np.clip(1 - y / 420, 0, 1) ** .8 * 170)[:, None]
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def ui(im, t, name, alpha=1.0):
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    wh = (255, 255, 255, 255); gr = (255, 255, 255, 150)
    # 상태 표시줄
    d.text((150, 80), "11:58", font=F("pre_b", 46), fill=wh, anchor="mm")
    for k in range(4):
        hh = 12 + k * 7
        d.rounded_rectangle([780 + k * 15, 96 - hh, 790 + k * 15, 96], 3, fill=wh if k < 2 else gr)
    for k, r in enumerate((30, 20, 10)):
        d.arc([878 - r, 98 - r, 878 + r, 98 + r], 225, 315, fill=wh, width=7)
    d.rounded_rectangle([925, 62, 1005, 98], 12, fill=wh); d.rounded_rectangle([1007, 72, 1013, 88], 3, fill=wh)
    d.text((965, 80), "100", font=F("pre", 28), fill=(0, 0, 0, 255), anchor="mm")
    # 위: + · 릴스 · 친구
    d.line([(75, 205), (125, 205)], fill=wh, width=6); d.line([(100, 180), (100, 230)], fill=wh, width=6)
    d.text((440, 205), "릴스", font=F("pre", 56), fill=wh, anchor="mm")
    d.text((585, 205), "친구", font=F("pre", 56), fill=gr, anchor="mm")
    for k, c in enumerate([(200, 200, 205), (120, 170, 220), (240, 200, 150)]):
        x = 680 + k * 34
        d.ellipse([x - 24, 181, x + 24, 229], fill=c + (255,), outline=(20, 20, 20, 255), width=3)
    # 오른쪽 버튼
    beat = 0
    if t >= 9.6:
        per = .95 - .6 * seg(t, 9.6, 25)
        beat = max(0, 1 - ((t - 9.6) % per) / .15)
    s = 44 * (1 + .15 * beat)
    if t >= 9.6: heart(d, 998, 1030, s, fill=(255, 48, 64, 255))
    else: heart(d, 998, 1036, s, outline=wh, width=5)
    f = F("pre_b", 36)
    d.text((998, 1110), fmt(likes(t)) if t >= 6.0 else "좋아요", font=f, fill=wh, anchor="mm")
    d.ellipse([966, 1172, 1030, 1236], outline=wh, width=6); d.polygon([(1010, 1226), (1036, 1246), (1028, 1216)], fill=wh)
    d.text((998, 1285), fmt(likes(t) / 37), font=f, fill=wh, anchor="mm")
    d.line([(972, 1360), (972, 1340), (1020, 1340)], fill=wh, width=6); d.polygon([(1018, 1328), (1034, 1340), (1018, 1352)], fill=wh)
    d.line([(1024, 1370), (1024, 1390), (976, 1390)], fill=wh, width=6); d.polygon([(978, 1378), (962, 1390), (978, 1402)], fill=wh)
    d.text((998, 1450), fmt(likes(t) / 80), font=f, fill=wh, anchor="mm")
    d.polygon([(966, 1520), (1034, 1500), (1008, 1570)], outline=wh, width=6); d.line([(966, 1520), (995, 1540)], fill=wh, width=6)
    d.polygon([(972, 1615), (1024, 1615), (1024, 1680), (998, 1660), (972, 1680)], outline=wh, width=6)
    d.text((998, 1730), fmt(likes(t) / 12), font=f, fill=wh, anchor="mm")
    d.line([(970, 1800), (1026, 1800)], fill=wh, width=5); d.line([(984, 1820), (1026, 1820)], fill=wh, width=5)
    # 아래: 프로필 · 음악 · 캡션 · 진행바
    lay.alpha_composite(avatar(), (40, 1648))
    d.text((158, 1676), "storychurch_sanford", font=F("pre", 42), fill=wh, anchor="lm")
    d.rounded_rectangle([640, 1650, 790, 1704], 16, outline=wh, width=3)
    d.text((715, 1677), "팔로우", font=F("pre_b", 36), fill=wh, anchor="mm")
    d.ellipse([158, 1728, 174, 1742], fill=wh); d.line([(172, 1736), (172, 1708), (186, 1712)], fill=wh, width=4)
    d.text((198, 1726), "스토리교회 · 원본 오디오", font=F("pre_b", 34), fill=(230, 230, 230, 255), anchor="lm")
    cap = (TAGS[name] + "  ") if name else ""
    d.text((44, 1800), cap + "주일 가기 전 필수영상 ...", font=F("pre_b", 38), fill=wh, anchor="lm")
    st = max(f[0] for f in FEED if f[0] <= t) if t >= 1.9 else 0
    nxt = min([f[0] for f in FEED if f[0] > t] + [SWIPE_END])
    d.rounded_rectangle([44, 1858, 1036, 1863], 2, fill=(255, 255, 255, 80))
    d.rounded_rectangle([44, 1858, 44 + 992 * seg(t, st, nxt), 1863], 2, fill=wh)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))  # 밝은 화면에서도 보이게 그림자
    sh.putalpha(lay.getchannel("A").filter(ImageFilter.GaussianBlur(4)).point(lambda v: int(v * .6)))
    full = ui_shade().copy(); full.alpha_composite(sh); full.alpha_composite(lay); lay = full
    if alpha < 1:
        lay.putalpha(Image.eval(lay.getchannel("A"), lambda v: int(v * alpha)))
    return over(im, lay)


def lock_screen(t):
    a = vgrad(W, H, [(0, (18, 22, 40)), (.6, (34, 22, 44)), (1, (10, 10, 18))])
    a += np.array([90, 60, 140], np.float32) * (radial(W, H, 300, 1300, 700) * .5)[..., None]
    a += np.array([200, 110, 60], np.float32) * (radial(W, H, 820, 600, 600) * .35)[..., None]
    im = img(a); d = ImageDraw.Draw(im)
    d.text((540, 300), "10월 5일 월요일", font=F("pre_sb", 50), fill=(235, 235, 245), anchor="mm")
    d.text((540, 470), "11:58", font=F("pre_sb", 230), fill=(240, 240, 250), anchor="mm")
    d.rounded_rectangle([390, 1860, 690, 1872], 6, fill=(230, 230, 240))
    return im


def screen(t):
    """폰 화면(1080×1920) 내용: 꺼짐 → 잠금화면 → 쇼츠"""
    if t < .6: return Image.new("RGB", (W, H), (2, 2, 3))
    if t < 1.9:
        ls = img(arr(lock_screen(t)) * seg(t, .6, .8))
        if t < 1.4: return ls
        p = ein(seg(t, 1.4, 1.85))
        out = Image.new("RGB", (W, H), (0, 0, 0)); out.paste(ls, (0, int(-H * p)))
        return out
    fr, name = feed(t)
    return ui(fr, t, name, seg(t, 1.9, 2.3))


@lru_cache(None)
def room():
    a = vgrad(W, H, [(0, (6, 6, 8)), (.6, (12, 10, 9)), (1, (20, 15, 11))])
    return a


def intro(t):
    s = .5 + .5 * ein(seg(t, 2.4, 4.0))
    sc = screen(t)
    lum = arr(sc.resize((8, 8))).mean((0, 1))
    a = room().copy()
    a += lum[None, None, :] * (radial(W, H, 540, 960, 900 * s + 300, 2) * .35)[..., None]
    base = img(a)
    sw, sh = int(W * s), int(H * s)
    bz = int(30 * s / .5)
    d = ImageDraw.Draw(base)
    d.rounded_rectangle([540 - sw / 2 - bz, 960 - sh / 2 - bz, 540 + sw / 2 + bz, 960 + sh / 2 + bz], int(80 * s / .5), fill=(16, 16, 18), outline=(70, 70, 76), width=max(2, int(3 * s / .5)))
    m = Image.new("L", (sw, sh), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, sw - 1, sh - 1], int(60 * s / .5), fill=255)
    base.paste(sc.resize((sw, sh), Image.BILINEAR), (540 - sw // 2, 960 - sh // 2), m)
    d.rounded_rectangle([540 - 70 * s / .5, 960 - sh / 2 + 14 * s / .5, 540 + 70 * s / .5, 960 - sh / 2 + 52 * s / .5], int(20 * s / .5), fill=(0, 0, 0))
    return base


# 8) 글리치 → 무너짐 → 방전 → 암전
@lru_cache(None)
def frozen():
    return arr(screen(24.97))


def glitch(t):
    a = frozen().copy()
    rng = np.random.default_rng(int(t * 30) + 7)
    k = seg(t, 25.0, 26.0) * .7 + .3
    for _ in range(int(6 + 18 * k)):
        y0 = rng.integers(0, H - 40); hh = rng.integers(8, 120)
        a[y0:y0 + hh] = np.roll(a[y0:y0 + hh], int(rng.integers(-160, 160) * k), 1)
    sh = int(6 + 30 * k)
    a[..., 0] = np.roll(a[..., 0], sh, 1); a[..., 2] = np.roll(a[..., 2], -sh, 1)
    for _ in range(int(10 * k)):
        x0, y0 = rng.integers(0, W - 100), rng.integers(0, H - 60)
        a[y0:y0 + rng.integers(10, 60), x0:x0 + rng.integers(40, 300)] = rng.integers(0, 255, 3)
    a[::4] *= .6
    if t > 26.0:  # 바스러져 사라진다
        p = seg(t, 26.0, 26.6)
        g = rng.random((H // 40 + 1, W // 40 + 1))
        g = np.repeat(np.repeat(g, 40, 0), 40, 1)[:H, :W]
        a *= (g > p)[..., None]
    return img(a)


def battery(t):
    im = Image.new("RGB", (W, H), (0, 0, 0))
    if 26.65 < t < 27.4 and int((t - 26.65) * 6) % 2 == 0:
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([450, 920, 610, 1000], 14, outline=(150, 150, 150), width=8)
        d.rounded_rectangle([614, 945, 630, 975], 4, fill=(150, 150, 150))
        d.rectangle([462, 932, 478, 988], fill=(230, 30, 30))
    return im


# 9) 십자가
def cross_shapes(d, col, k=1.0):
    rng = np.random.default_rng(8)
    jag = lambda pts: [(x + rng.uniform(-3, 3), y + rng.uniform(-3, 3)) for x, y in pts]
    d.polygon(jag([(513, 360), (567, 360), (570, 1400), (510, 1400)]), fill=col)
    d.polygon(jag([(250, 548), (830, 540), (832, 594), (248, 600)]), fill=col)
    d.ellipse([522, 588, 588, 660], fill=col)  # 숙인 머리
    capsule(d, (510, 690), (290, 590), 34, col); capsule(d, (570, 690), (790, 590), 34, col)
    d.polygon([(492, 680), (590, 680), (578, 850), (502, 850)], fill=col)
    d.polygon([(488, 840), (594, 840), (586, 920), (496, 920)], fill=col)
    d.polygon([(505, 915), (580, 915), (566, 1120), (548, 1150), (530, 1150), (515, 1120)], fill=col)


@lru_cache(None)
def cross_wide():
    w, h = W, H
    a = np.zeros((h, w, 3), np.float32)
    cl = fbm(81, w, h, 220)
    a += np.array([255, 150, 70], np.float32) * (radial(w, h, 540, 1320, 1250, 2.4) * .95)[..., None]
    a += np.array([255, 225, 180], np.float32) * (radial(w, h, 540, 1330, 380, 1.6) * .9)[..., None]
    a *= (.35 + .9 * cl)[..., None]
    rays = Image.new("L", (w, h), 0); dr = ImageDraw.Draw(rays)
    for k in range(22):
        ang = -3.14 * (k + .5) / 22; wd = .02 + .012 * (k % 3)
        dr.polygon([(540, 1330), (540 + 2600 * math.cos(ang - wd), 1330 + 2600 * math.sin(ang - wd)),
                    (540 + 2600 * math.cos(ang + wd), 1330 + 2600 * math.sin(ang + wd))], fill=30 + (k * 29) % 35)
    a += np.array([255, 200, 140]) * (arr(rays.filter(ImageFilter.GaussianBlur(14))) / 255)[..., None] * .6
    sil = Image.new("L", (w, h), 0); d = ImageDraw.Draw(sil)
    cr = Image.open(os.path.join(HERE, "crucifixion.png")).convert("RGBA").getchannel("A")
    cw = 640; cr = cr.resize((cw, int(cr.height * cw / cr.width)), Image.LANCZOS)
    top = 320
    sil.paste(cr, (540 - cw // 2, top))
    bot = np.asarray(cr)[-3] > 128  # 기둥 아래 끝을 언덕 속까지 잇는다
    xs_ = np.where(bot)[0]
    d.rectangle([540 - cw // 2 + xs_.min(), top + cr.height - 4, 540 - cw // 2 + xs_.max(), 1420], fill=255)
    xs = np.arange(0, w + 10, 10)
    d.polygon([(0, h)] + list(zip(xs, 1390 - 120 * np.exp(-((xs - 540) / 380) ** 2) + 12 * np.sin(xs / 37) + 8 * np.sin(xs / 13))) + [(w, h)], fill=255)
    sil = sil.filter(ImageFilter.GaussianBlur(2.2))
    m = arr(sil) / 255
    rim = np.clip(arr(sil.filter(ImageFilter.GaussianBlur(6))) / 255 - m, 0, 1) * 2.2
    a += np.array([255, 190, 120]) * rim[..., None] * .7 * (a.mean(-1, keepdims=True) / 120).clip(0, 1.5)
    a = a * (1 - m[..., None]) + 4 * m[..., None]
    return a


@lru_cache(None)
def fog():
    return fbm(83, 2 * W, H, 300)


@lru_cache(None)
def zoe_mask():
    lay = Image.new("L", (W, H), 0)
    ImageDraw.Draw(lay).text((540, 830), "죄", font=F("heavy", 660), fill=255, anchor="mm")
    m = arr(lay) / 255
    rough = fbm(101, W, H, 6, 3)
    m *= np.clip((rough - .28) * 6, 0, 1)
    m *= 1 - (fbm(102, W, H, 40, 2) > .78) * .7
    return m


HEAD = (548, 590)  # crucifixion.png 를 cross_wide 에 놓았을 때 머리 위치


def cross_scene(t):
    lt = t - 28.6
    b = smooth(seg(lt, 0, 2.2)) ** 1.4
    if t >= 35.0: b = max(.35, 1 - .65 * seg(t, 35, 35.4))
    p = smooth(seg(t, 31.6, 34.9)) if t < 35.0 else 0  # 35초 「죄」 직전까지 예수님께 다가간다
    z = 1.02 + .07 * seg(t, 28.6, 37.6) + .75 * p
    a = arr(cam(img(cross_wide()), z, cx=540 + (HEAD[0] - 540) * p, cy=H / 2 + 100 + (HEAD[1] - H / 2 - 100) * p, t=lt)) * b
    if p > 0:  # 뒤에서 번지는 빛 (곱해서 밝히므로 검은 실루엣은 그대로)
        a *= 1 + (radial(W, H, 540, 900, 1000, 1.6) * 1.3 * p)[..., None]
    x0 = int(lt * 45) % W  # 흐르는 안개
    a *= (.8 + .4 * fog()[:, x0:x0 + W])[..., None]
    if t >= 35.0:
        a *= np.array([1.0, .72, .7])
        m = zoe_mask()
        k = 1 + .25 * (1 - eout(seg(t, 35, 35.2)))
        if k > 1.001:
            m = arr(cam(Image.fromarray((m * 255).astype(np.uint8)), k, cy=830)) / 255
        a = a * (1 - m[..., None]) + np.array([182, 18, 24]) * m[..., None]
        a += 255 * max(0, 1 - (t - 35) * 8)
        im = img(a)
        al = smooth(seg(t, 35.8, 36.5))
        if al > 0:
            lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
            for i, s in enumerate(SUBCOPY):
                d.text((540, 1290 + i * 92 + 34 * (1 - al)), s, font=F("myung", 60), fill=CREAM + (int(255 * al),), anchor="mm")
            im = over(im, lay)
        dx, dy = shake(t, 16 * max(0, 1 - (t - 35) * 2.5))
        return cam(im, 1.03, dx, dy)
    return img(a)


@lru_cache(None)
def info_card():
    a = np.full((H, W, 3), NAVY, np.float32)
    a += np.array([120, 60, 20]) * (radial(W, H, 540, 300, 900, 2.5) * .35)[..., None]
    return img(a)


def info(t, al_all):
    im = info_card().copy()
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    def A(a0): return int(255 * smooth(seg(t, a0, a0 + .6)) * al_all)
    def U(a0): return 30 * (1 - eout(seg(t, a0, a0 + .8)))
    for i, s in enumerate(QUESTION):
        d.text((540, 520 + i * 96 + U(37.7)), s, font=F("myung", 72), fill=CREAM + (A(37.7),), anchor="mm")
    d.rectangle([540 - 60 * eout(seg(t, 38.0, 38.6)), 790, 540 + 60 * eout(seg(t, 38.0, 38.6)), 797], fill=ORANGE + (A(38.0),))
    d.text((540, 900 + U(38.0)), TITLE, font=F("pre", 128), fill=CREAM + (A(38.0),), anchor="mm")
    d.text((540, 1060 + U(38.3)), WHEN, font=F("pre_sb", 56), fill=CREAM + (A(38.3),), anchor="mm")
    d.text((540, 1140 + U(38.3)), "스토리교회 · " + WHERE, font=F("pre_sb", 40), fill=(200, 192, 176, A(38.3)), anchor="mm")
    lg = Image.open(os.path.join(SNS, "assets", "logo-on-navy.png")).convert("RGBA")
    lg = lg.resize((440, int(440 * lg.height / lg.width)))
    lg.putalpha(Image.eval(lg.getchannel("A"), lambda v: v * A(38.5) // 255))
    lay.alpha_composite(lg, (540 - lg.width // 2, 1450))
    return over(im, lay)


# ── 마무리: 필름 그레인 · 비네트 ──
@lru_cache(None)
def grains():
    rng = np.random.default_rng(0)
    return [rng.normal(0, 1, (H, W, 1)).astype(np.float32) for _ in range(6)]


@lru_cache(None)
def vignette():
    yy, xx = grid(W, H)
    return (1 - .55 * np.clip(np.hypot((xx - W / 2) / (W * .75), (yy - H / 2) / (H * .7)) - .35, 0, 1) ** 1.5)[..., None]


def frame(t):
    if t < 4.0: im, g, v = intro(t), 3, False
    elif t < SWIPE_END: im, g, v = screen(t), 3, False
    elif t < 26.6: im, g, v = glitch(t), 0, False
    elif t < 28.6: im, g, v = battery(t), 0, False
    elif t < 37.6: im, g, v = cross_scene(t), 5, True
    elif t < 38.2:
        p = seg(t, 37.6, 38.2)
        im, g, v = Image.blend(cross_scene(t), info(t, 1), p), 4, True
    else:
        im, g, v = info(t, 1), 3, False
    if 29.6 <= t < 34.6:  # 예수님
        if t < 32.3: im = caption(im, *DESC["cross"], smooth(seg(t, 29.8, 30.6)) * (1 - seg(t, 31.9, 32.3)), 1540)
        else: im = caption(im, *DESC["drop"], smooth(seg(t, 32.5, 33.2)) * (1 - seg(t, 34.2, 34.6)), 1660)
    a = arr(im)
    sm = np.clip(arr(im.resize((W // 4, H // 4), Image.BILINEAR)) - 130, 0, 255) * 1.5
    a += arr(img(sm).filter(ImageFilter.GaussianBlur(9)).resize((W, H), Image.BILINEAR)) * .45
    if v: a *= vignette()
    if g: a += grains()[int(t * FPS) % 6] * g
    if t > 39.6: a *= 1 - seg(t, 39.6, 40.0) * .0  # 끝 화면은 그대로 둔다
    return np.clip(a, 0, 255).astype(np.uint8)


def render_frame(i):
    a = frame(i / FPS).astype(np.uint16) + frame((i + .5) / FPS)
    return (a // 2).astype(np.uint8).tobytes()


# ════════════════════════ 소리 ════════════════════════
def audio(path):
    n = int(SR * DUR)
    rng = np.random.default_rng(1)
    pre, post, wet_pre, wet_post = (np.zeros(n) for _ in range(4))

    def T(d): return np.arange(int(d * SR)) / SR

    def add(buf, at, sig, g=1.0, wet=None, send=0.0):
        i = int(at * SR); j = min(n, i + len(sig))
        if i >= n: return
        buf[i:j] += sig[:j - i] * g
        if wet is not None: wet[i:j] += sig[:j - i] * g * send

    def filt(x, lo=0, hi=SR / 2):
        X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
        gain = 1 / np.sqrt(1 + (f / max(hi, 1)) ** 4)
        if lo > 0: gain *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4)
        return np.fft.irfft(X * gain, len(x))

    def noise(d): return rng.standard_normal(int(d * SR))

    def reverb(x, secs=2.5, seed=2):
        r = np.random.default_rng(seed)
        ir = r.standard_normal(int(secs * SR)) * np.exp(-np.arange(int(secs * SR)) / SR * 6.9 / secs)
        ir = filt(ir, 0, 5000); ir /= np.sqrt((ir ** 2).sum())
        m = len(x) + len(ir)
        y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]
        return y

    def tone(f, d, dec, harm=(1,), fend=None):
        t = T(d); fr = f if fend is None else f * (fend / f) ** (t / d)
        ph = 2 * np.pi * np.cumsum(fr) / SR
        return sum(np.sin(ph * h) / h for h in harm) * np.exp(-t / dec)

    def whoosh(d=.35, up=False):
        lo, hi = filt(noise(d), 250, 1200), filt(noise(d), 1500, 7000)
        t = T(d); x = t / d
        mix = x if up else 1 - x
        env = np.sin(np.pi * x ** .6) ** 2
        return (lo * (1 - mix) + hi * mix * .7) * env * .5

    def thud(f=55, d=1.0, dec=.35):
        x = tone(f, d, dec, (1, 2), fend=f * .6) * .9
        x[:int(.12 * SR)] += filt(noise(.12), 0, 900) * np.exp(-T(.12) / .03) * .5
        return x

    # 0~10초: 화면 켜짐, 신비로운 배경, 하프
    tk = tone(1900, .08, .012) * .6 + tone(300, .08, .03) * .4
    add(pre, .6, tk, .7, wet_pre, .3)
    # 7초: 스와이프, 파열, 저음
    add(pre, 5.9, whoosh(.35), .9)
    add(pre, 7.15, thud(48, 1.5, .5), 1.0, wet_pre, .4)
    add(pre, 9.19, thud(40, 1.6, .55), 1.1, wet_pre, .5)
    t = T(19.45)
    drone = (np.sin(2 * np.pi * 41.2 * t) + .5 * np.sin(2 * np.pi * 82.4 * t) + .25 * np.sin(2 * np.pi * 123.6 * t))
    drone *= (.25 + .75 * t / 19.45) * np.clip(t / .5, 0, 1) * .16
    add(pre, 7.15, drone)
    t = T(8.6)
    tens = (np.sin(2 * np.pi * 880 * t) + np.sin(2 * np.pi * 932 * t) + .6 * np.sin(2 * np.pi * 1318 * t)) * (t / 8.6) ** 2 * .03 * (1 + .5 * np.sin(t * 40))
    add(pre, 18.0, tens, 1, wet_pre, .5)
    # 10~25초: 빨라지는 심장 + 스와이프
    tb = 9.6
    while tb < 26.6:
        per = .95 - .6 * seg(tb, 9.6, 25)
        add(pre, tb, tone(62, .35, .09, (1, 2), fend=45), .9)
        add(pre, tb + .17 * per / .95 + .08, tone(55, .3, .08, (1, 2), fend=40), .55)
        tb += per
    for st, name, _ in FEED[2:]:
        add(pre, st - .08, whoosh(.32 if st < 23.8 else .16), .8)
    add(pre, 9.9, thud(70, .8, .2), .8)  # 돌
    add(pre, 13.4, filt(noise(3.6), 300, 4000) * .12)  # 비
    add(pre, 13.9, filt(noise(2.5), 0, 260) * np.exp(-T(2.5) / .8) * 2.2, 1, wet_pre, .3)  # 천둥
    add(pre, 18.5, filt(noise(.6), 800) * np.exp(-T(.6) / .08) * .7, 1, wet_pre, .4)  # 갈라짐
    add(pre, 18.5, thud(45, 1.2, .4), 1, wet_pre, .4)
    for k in range(9):
        add(pre, 20.45 + k * .35, sum(np.sin(2 * np.pi * f * T(.25)) for f in (1700 + k * 130, 2900, 4100)) * np.exp(-T(.25) / .05) * .1, 1, wet_pre, .4)
    # 25~26.6초: 글리치
    t = T(1.6)
    gate = (np.random.default_rng(4).random(int(1.6 * 30)) > .4).repeat(SR // 30)[:len(t)]
    buzz = np.sign(np.sin(2 * np.pi * 120 * t)) * .12 + np.round(noise(1.6) * 2) / 2 * .1
    add(pre, 25.0, buzz * gate)
    pre += reverb(wet_pre, 2.0, 2) * .8
    pre *= np.concatenate([np.ones(int(26.6 * SR)), np.zeros(n - int(26.6 * SR))])  # 뚝 끊김

    # 26.6~28초: 이명, 그다음 완전한 침묵
    t = T(1.3)
    add(post, 26.6, np.sin(2 * np.pi * 3950 * t) * np.exp(-t / .6) * .09)
    # 28.6~: 바람, 거친 숨
    t = T(11.4)
    add(post, 28.6, filt(noise(11.4), 80, 500) * np.clip(t / 2, 0, 1) * .05)
    for at, d, up in [(29.0, .9, True), (30.0, 1.2, False), (31.6, .8, True), (32.5, 1.3, False)]:
        t = T(d); env = (t / d if up else 1 - t / d) ** .7 * np.sin(np.pi * t / d) * (1 + .3 * np.sin(2 * np.pi * 33 * t))
        add(post, at, filt(noise(d), 400, 1800) * env * .35, 1, wet_post, .25)
    # 35: Dooom
    add(post, 35.0, thud(46, 4.5, 1.4) * 1.3, 1, wet_post, .7)
    add(post, 35.0, filt(noise(.25), 0, 2500) * np.exp(-T(.25) / .05) * .5, 1, wet_post, .7)
    post += reverb(wet_post, 3.5, 3)
    post[:int(26.6 * SR)] = 0

    mix = pre * 2.0 + post
    mix = mix / np.abs(mix).max() * .89

    # 배경음악: Pixabay 「Sad Piano Emotional Rain Story」 (alex-morgan)
    # 에덴에서 잔잔히 → 선악과에서 끊김 → 곡이 쉬었다 다시 시작하는 27초 지점을 십자가(29초)에 맞춘다
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(HERE, "bgm_rain_story.mp3"), "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True).stdout
    mus = np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
    bgm = np.zeros((n, 2))
    def place(src0, src1, at, env):
        a = mus[int(src0 * SR):int(src1 * SR)]
        tt = np.arange(len(a)) / SR + at
        i = int(at * SR); j = min(n, i + len(a))
        bgm[i:j] += a[:j - i] * env(tt[:j - i])[:, None]
    place(0, 7.0, .6, lambda tt: .55 * np.clip((tt - .6) / 1.0, 0, 1) * np.clip((7.3 - tt) / .8, 0, 1))
    place(27.0, 38.0, 29.0, lambda tt: np.clip((tt - 29.0) / 1.2, 0, 1) * (.55 + .4 * np.clip((tt - 35.4) / 1.0, 0, 1)) * (1 - .5 * np.exp(-((tt - 35.15) / .35) ** 2)) * np.clip((40.0 - tt) / 1.2, 0, 1))
    st = np.tanh((np.stack([mix, mix], 1) + bgm) * 1.15)
    st *= .95 / np.abs(st).max()
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


if __name__ == "__main__":
    if len(sys.argv) > 1:
        os.makedirs(os.path.join(HERE, "still"), exist_ok=True)
        for s in sys.argv[1:]:
            Image.fromarray(frame(float(s))).save(os.path.join(HERE, "still", f"{float(s):05.2f}.png"))
        sys.exit()
    from multiprocessing import Pool
    wav = os.path.join(HERE, "_소리.wav")
    audio(wav)
    out = os.path.join(HERE, "프리뷰_인간의첫이야기.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-i", wav, "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-maxrate", "10M", "-bufsize", "20M", "-pix_fmt", "yuv420p",
                           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    with Pool(max(1, os.cpu_count() - 1)) as pool:
        for k, b in enumerate(pool.imap(render_frame, range(int(DUR * FPS)), chunksize=4)):
            ff.stdin.write(b)
            if k % 150 == 0: print(f"{k / FPS:.0f}s", flush=True)
    ff.stdin.close(); ff.wait()
    os.remove(wav)
    print(out)
