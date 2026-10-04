# SNS — 설교 카드뉴스 · 쇼츠 · 캡션

주보(`bulletin/`)처럼 **txt 한 파일 → 명령 한 줄**로 인스타 카드뉴스(1080×1350, 4:5)를 뽑습니다.
색·로고는 `web/docs/brand-guide.md` 와 로고 원본 색 기준. (실제 사이트 site.css 와 색이 다름 — 루트 CLAUDE.md 13절 "미해결" 참고)

```
sns/
├── prep.py            # 영상 → 폴더·받아쓰기·교정 원고·카드.txt 머리
├── make.py            # ★ 카드뉴스 빌드
├── 교정.txt            # 받아쓰기 오인식 교정표
├── _양식_카드.txt      # 매주 복사해서 쓰는 양식
├── assets/            # web/assets 에서 축소 복사한 공식 로고 (on-light / on-navy / emblem)
└── 2026-09-27_그리스도의편지/     # 주차별 폴더
    ├── 카드.txt        # 카드 내용 (입력)
    ├── 카드뉴스/ + 카드뉴스.zip   # 빌드 결과 (git 에 안 올림)
    ├── 캡션.md         # 인스타 캡션
    ├── 설교원고.txt     # Whisper 받아쓰기 + 성경용어 교정
    └── 쇼츠/           # 구간 클립 mp4 (git 에 안 올림) + 구간.md
```

## 매주
```bash
python3 sns/prep.py ~/Downloads/영상.MP4     # 폴더 · 받아쓰기 · 교정 원고 · 카드.txt 머리 (날짜는 촬영 시각, 제목·본문은 주보에서)
# 카드.txt 내용 채우기 — Claude Code 에서 "이번 주 카드 만들어줘" (.claude/skills/sns-cards)
python3 sns/make.py sns/2026-10-04_하나님의첫이야기/카드.txt
```
- 주보 제목과 실제 설교 제목이 다르면 `--title "제목"`, 촬영 시각이 없거나 틀리면 `--date YYYY-MM-DD`
- 이미 있는 파일은 건너뜀 (받아쓰기를 다시 돌리려면 `설교원고_자동자막.srt` 를 지운다)
- 반복되는 받아쓰기 오인식은 `교정.txt` 에 `틀린말 → 바른말` 한 줄 추가

## 카드.txt 문법
| 기호 | 뜻 |
|---|---|
| `/` | 줄바꿈 |
| `*글자*` | 오렌지 강조 (제목·질문·구절) |
| `**글자**` | 굵은 강조 (내용) |
| `#` 시작 줄 | 메모 (무시) |

블록: 머리(제목·본문·본문영문·날짜) → `[카드]`(태그·제목·내용·질문) / `[구절]`(태그·내용·출처) 반복 → (선택) `[CTA]`.
CTA 를 안 쓰면 `make.py` 의 `DEFAULT_CTA` (저장·공유·주일 오후 6시 예배·@storychurch_sanford).

글자 수: 제목 3줄·줄당 6자 내외(4줄이면 자동 축소) / 내용 4줄·줄당 22자 / 질문 3줄. 내용 카드 4~6장 → 전체 6~8장.

## 자동 규칙
- 순서: 표지(네이비 + 엠블럼) → 내용 카드 크림/네이비 번갈아 → **마지막 내용 카드는 오렌지** → CTA(네이비 + 찢어진 종이)
- 오렌지 카드엔 로고 대신 글자 워드마크 (가이드: 저대비 배경에 로고 금지, 로고 색 변경 금지)
- 그라데이션 없음, 장식은 브랜드 모티프인 점선 "길(path)" 하나
- 한글: Pretendard(로컬 설치 필요) / 영문 라벨: Montserrat / 쪽번호·따옴표: Bebas Neue / CTA 손글씨: Nanum Pen Script (Google Fonts, 인터넷 필요)

## 쇼츠 · 원고 만들기 (설교 영상 → 받아쓰기)
```bash
ffmpeg -i 영상.MP4 -vn -ac 1 -ar 16000 audio.wav
mlx_whisper audio.wav --model mlx-community/whisper-large-v3-turbo --language ko --output-format all --condition-on-previous-text False
# 구간 자르기 (가로 원본 유지, 정확한 컷을 위해 재인코딩)
ffmpeg -ss 191.3 -to 261.5 -i 영상.MP4 -c:v h264_videotoolbox -b:v 40M -c:a aac -b:a 192k 쇼츠1.mp4
```
받아쓰기는 성경 용어·고유명사 오인식이 많음 (고린도구서→고린도후서, 무사람→뭇사람, 불안하셔서→부활하셔서 등) — 교정 후 사용.
