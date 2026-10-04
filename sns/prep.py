# 설교 영상 → 주차 폴더 · 받아쓰기 · 교정 원고 · 카드.txt 머리
# 사용법:  python3 sns/prep.py ~/Downloads/XIKN2285.MP4 [--date 2026-09-27] [--title 그리스도의 편지]
# 날짜를 안 주면 영상 촬영 시각으로 정하고, 제목·본문은 주보 게시판(web/bulletin/archive.js)에서 가져온다.
# 이미 있는 파일은 건드리지 않는다 (받아쓰기는 오래 걸리므로 다시 돌리지 않음).
import argparse, datetime, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ARCHIVE = os.path.join(ROOT, "web", "bulletin", "archive.js")
MODEL = "mlx-community/whisper-large-v3-turbo"


def shot_date(video):
    out = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format_tags=creation_time",
                          "-of", "default=nw=1:nk=1", video], capture_output=True, text=True).stdout.strip()
    if not out:
        sys.exit("영상에 촬영 시각이 없습니다. --date YYYY-MM-DD 로 날짜를 주세요.")
    utc = datetime.datetime.fromisoformat(out.replace("Z", "+00:00"))
    return utc.astimezone().date().isoformat()  # 이 Mac 의 시간대(샌포드)로


def issue(date):
    src = open(ARCHIVE, encoding="utf-8").read()
    items = json.loads(src[src.index("["):src.rindex("]") + 1])
    for it in items:
        if it["dateISO"] == date:
            return it
    sys.exit(f"{date} 주보가 게시판에 없습니다. 날짜를 확인하거나 bulletin/make.sh 를 먼저 돌리세요.")


def transcribe(video, srt):
    whisper = shutil.which("mlx_whisper") or os.path.expanduser("~/.local/bin/mlx_whisper")
    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, "audio.wav")
    print("· 오디오 추출…")
    subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vn", "-ac", "1", "-ar", "16000", wav], check=True)
    print("· 받아쓰기… (20분 영상에 몇 분 걸립니다)")
    subprocess.run([whisper, wav, "--model", MODEL, "--language", "ko", "--output-format", "srt",
                    "--output-dir", tmp, "--condition-on-previous-text", "False", "--verbose", "False"], check=True)
    shutil.move(os.path.join(tmp, "audio.srt"), srt)
    shutil.rmtree(tmp)


def fixes():
    pairs = []
    for line in open(os.path.join(HERE, "교정.txt"), encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "→" in line:
            a, _, b = line.partition("→")
            pairs.append((a.strip(), b.strip()))
    return pairs


def script(srt, it, video):
    pairs = fixes()
    out = [f"스토리교회 설교 — {it['scripture']} 「{it['title']}」",
           f"원본: {os.path.basename(video)}",
           "※ 자동 받아쓰기 + 교정.txt 적용. 남은 오인식은 직접 고치고, 반복되는 건 교정.txt 에 추가.", ""]
    for block in open(srt, encoding="utf-8").read().strip().split("\n\n"):
        rows = block.split("\n")
        if len(rows) < 3:
            continue
        h, m, s = rows[1].split(" --> ")[0].split(",")[0].split(":")
        text = " ".join(rows[2:]).strip()
        for a, b in pairs:
            text = text.replace(a, b)
        out.append(f"[{int(h) * 60 + int(m):02d}:{s}] {text}")
    return "\n".join(out) + "\n"


def card_head(it):
    tpl = open(os.path.join(HERE, "_양식_카드.txt"), encoding="utf-8").read()
    # "창세기 1:1–3" → "창세기 1장 1–3절"
    ko = re.sub(r"(\d+):([\d–\-]+)$", r"\1장 \2절", it["scripture"])
    y, m, d = it["dateISO"].split("-")
    head = {"제목": it["title"], "본문": ko, "본문영문": it["scriptureEn"].upper(), "날짜": f"{y}. {m}. {d} 주일설교"}
    for k, v in head.items():
        tpl = re.sub(rf"^{k}: .*$", f"{k}: {v}", tpl, count=1, flags=re.M)
    return tpl


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--date", help="YYYY-MM-DD (기본: 영상 촬영일)")
    ap.add_argument("--title", help="주보 제목과 실제 설교 제목이 다를 때")
    a = ap.parse_args()
    video = os.path.abspath(os.path.expanduser(a.video))
    date = a.date or shot_date(video)
    it = issue(date)
    if a.title:
        it["title"] = a.title

    # 같은 날짜 폴더가 이미 있으면 그걸 쓴다 (제목이 바뀌었어도)
    old = [f for f in os.listdir(HERE) if f.startswith(date + "_")]
    week = os.path.join(HERE, old[0] if old else f"{date}_{it['title'].replace(' ', '')}")
    os.makedirs(week, exist_ok=True)
    print(f"{date} · {it['title']} · {it['scripture']} → {os.path.relpath(week, ROOT)}/")

    srt = os.path.join(week, "설교원고_자동자막.srt")
    if not os.path.exists(srt):
        transcribe(video, srt)
    for name, make in (("설교원고.txt", lambda: script(srt, it, video)), ("카드.txt", lambda: card_head(it))):
        path = os.path.join(week, name)
        if os.path.exists(path):
            print(f"· {name} 이미 있음 — 건너뜀")
        else:
            open(path, "w", encoding="utf-8").write(make())
            print(f"✓ {name}")
    print("다음: 카드.txt 내용 채우기 → python3 sns/make.py " + os.path.relpath(os.path.join(week, "카드.txt"), ROOT))
