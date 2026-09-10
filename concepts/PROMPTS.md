# 이미지 생성 프롬프트 (ChatGPT / DALL·E / Midjourney 용)

## 먼저 읽어주세요

1. **글자를 넣지 마세요.** 모든 프롬프트에 "no text" 를 넣어뒀습니다. 이미지 모델은 글자를 반드시 깨뜨리고,
   도시 이름·좌표는 지금 HTML 라벨이 정확하게 처리하고 있습니다. 이미지는 **배경만** 담당합니다.
2. **지형은 정확하지 않습니다.** 이미지 모델은 실제 지도를 못 그립니다.
   A안을 쓰면 배경 호수·도로 모양과 그 위에 얹힌 실좌표 핀이 어긋납니다.
   → 정확도가 중요하면 **B안(텍스처)** 또는 **C안(풍경)** 을 쓰고, 지형은 지금의 SVG를 유지하세요.
3. **여백 규칙:** 왼쪽 아래(필드 카드)와 오른쪽 위(범례) 영역은 비워야 합니다. 프롬프트에 명시돼 있습니다.
4. 브랜드 색: 네이비 `#0F1E34` / 오렌지 `#FF9A1F` / 크림 `#F4F0E6`

---

## A안 — 양식화된 지역 지도 (예쁨 ↑ / 정확도 ↓)

> 주의: 지형이 실제와 다릅니다. 그 위에 실좌표 핀을 얹으면 어긋납니다.
> 지도를 "분위기"로만 쓰고 라벨을 뺄 때만 쓰세요.

```
A flat vector illustration of a stylized regional survey map, 3:2 landscape.

Palette — strictly three colors only: deep navy #0F1E34 for ink and linework,
warm cream #F4F0E6 as the paper ground, and a single warm orange #FF9A1F used
ONLY for one continuous highway ribbon running diagonally from lower-left to
upper-right. No other colors.

Content: a wide lake near the center with a river flowing north out of it,
gentle marshland contour lines, a faint 1px survey grid across the whole sheet,
a few small solid navy dots marking settlements, and a dashed county boundary.

Style: mid-century printed nautical chart. Absolutely flat — no gradients,
no drop shadows, no 3D, no glow, no bevel. Fine hairline strokes. Subtle paper
grain. Generous empty space. Editorial, restrained, confident.

Composition: keep the lower-left quadrant and the upper-right corner visually
quiet and nearly empty — UI panels sit there.

NO TEXT. No letters, no numbers, no labels, no legend, no compass rose,
no watermark, no signature.
```

---

## B안 — 종이·차트 텍스처만 (가장 안전 · 추천)

> 지형은 지금의 정확한 SVG를 그대로 두고, 그 아래에 질감만 깝니다.
> 정확도를 하나도 잃지 않으면서 화면이 따뜻해집니다.

```
A seamless flat background texture of aged survey chart paper, 3:2 landscape.

Warm cream #F4F0E6 ground with very subtle fiber grain and faint uneven ink
absorption, as if printed on heavy uncoated stock. A barely visible navy #0F1E34
survey grid at about 6% opacity. A few extremely faint foxing marks and one soft
crease. Nothing else.

Style: flat, scanned-print look. No gradients, no vignette burn, no 3D,
no drop shadows. Even lighting edge to edge so UI can sit anywhere on it.

NO TEXT, no letters, no numbers, no map features, no illustration, no border.
```

사용법: 생성된 이미지를 `assets/photos/paper-texture.jpg` 로 저장한 뒤
`.chart` 의 배경으로 깔고 기존 `.grid` 격자는 투명도를 낮추면 됩니다.

---

## C안 — 샌포드 풍경 일러스트 (히어로 교체용)

> 지도를 포기하고 장소의 인상으로 가는 안. 정확도 문제 없음.

```
A flat editorial vector illustration of a small Florida lakefront town at dusk,
3:2 landscape, viewed from a low distant angle across calm water.

Palette — strictly: deep navy #0F1E34, warm cream #F4F0E6, and warm orange
#FF9A1F used sparingly for window lights and one horizon band only.

Content: a wide calm lake in the foreground, a low historic main street skyline
with a modest clock tower, live oaks with hanging moss, a few sailboat masts,
palms. Quiet, warm, human scale. No people in focus.

Style: screen-printed poster, two-and-a-half colors, flat shapes with clean
edges, subtle halftone grain. No gradients, no drop shadows, no photorealism,
no lens flare.

Composition: horizon in the lower third; keep the lower-left quadrant simple
and uncluttered — a text panel sits there.

NO TEXT, no letters, no numbers, no signage, no watermark.
```

---

## 받은 이미지를 넘겨줄 때

파일을 `assets/photos/` 에 넣고 알려주시면 히어로에 적용하겠습니다.
적용 전에 확인할 것:
- 글자가 섞여 들어갔는지 (있으면 다시 뽑아야 합니다)
- 그 위에 얹히는 크림/네이비 텍스트가 4.5:1 이상 나오는지
- 왼쪽 아래·오른쪽 위가 충분히 비어 있는지
