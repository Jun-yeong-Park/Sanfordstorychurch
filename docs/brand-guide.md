# Sanford Story Church — Website Brand & Design System

We are building the official website for **SANFORD STORY CHURCH**.

The website must follow the existing Sanford Story Church visual identity.
Do NOT redesign the logo or invent a different brand style.

The visual direction should feel: Modern, Bold, Clean, Confident, Warm, Contemporary church, Story-driven, Gospel-centered, Minimal (not corporate), Strong but welcoming.

Avoid: generic church website templates, excessive gradients, overly decorative religious imagery, stock-photo-heavy layouts, too many rounded cards, excessive drop shadows, pastel/feminine styling, traditional serif-heavy church aesthetics, random new colors outside the brand system.

## 1. Brand Name

Official name: **Sanford Story Church**

Display hierarchy:

```
SANFORD
STORY
CHURCH
```

"STORY" should normally be the strongest visual word. "Sanford" establishes the local identity. "Church" should visually support rather than compete with "Story".

## 2. Brand Concept

Core idea: **Our story becomes part of God's greater Story.**

The logo symbol combines: **S + Story/Page/Living Letter + Cross = Sanford Story Church**

The "S" represents Sanford and Story. The flowing shape inside the S can also suggest: a path, a page, a continuing story, a life being rewritten.

The Cross is located at the center of the mark because Jesus Christ and the Gospel are at the center of every story.

Brand theological foundation: **2 Corinthians 3:3 — "We are His Living Story."**

Primary theological themes:
1. **His Story** — The Gospel is the great story of God's salvation.
2. **Living Story** — Christians are not spectators. We live as witnesses of the story Christ is writing through us.
3. **Spiritual Training** — Scripture, prayer, discipleship, and spiritual formation.
4. **Faithful Community** — A community living out the character and Gospel of Jesus in everyday life.

Key messages:
- "Your Story. God's Plan."
- "God's story begins again in your life."
- "Living Story."
- "Real People. Real Stories. Real Hope."

## 3. Primary Color System

```css
:root {
  --story-orange: #FF9A1F;
  --story-navy: #0F1E34;
  --story-cream: #F4F0E6;
  --story-gray: #D7D9DD;
  --story-white: #FFFFFF;
  --story-black: #111111;
}
```

**Story Orange `#FF9A1F`** — logo emblem, key highlights, CTA accents, small labels, active states, important words, section markers, graphic details.

**Story Navy `#0F1E34`** — main dark backgrounds, main typography on light backgrounds, navigation, footer, buttons, large brand sections.

**Warm Cream `#F4F0E6`** — use instead of pure white when possible. Page backgrounds, editorial sections, cards, about/story sections.

**Stone Gray `#D7D9DD`** — use sparingly: borders, dividers, muted UI, secondary backgrounds.

## 4. Dark + Light Brand Modes

The website should intentionally use BOTH brand modes.

**Dark mode section:** background `#0F1E34`; logo = orange emblem, cream/white STORY, orange SANFORD/CHURCH; headline `#FFFFFF` or `#F4F0E6`; accent `#FF9A1F`.

**Light mode section:** background `#F4F0E6` or `#FFFFFF`; logo = orange emblem, navy STORY, orange SANFORD/CHURCH; headline `#0F1E34`; accent `#FF9A1F`.

Do not make the entire website navy. Do not make the entire website cream. Alternate dark and light sections to create rhythm:

```
NAVY HERO → CREAM STORY → WHITE/CREAM MINISTRIES → NAVY FEATURE → CREAM EVENTS → NAVY FOOTER
```

## 5. Typography

**Primary display font: Bebas Neue** — large headlines, hero headings, section statements, big numbers, event titles, strong short phrases. (e.g. "YOUR STORY. GOD'S PLAN." / "STORY" / "LIVING STORY")

**Supporting font: Montserrat** — navigation, body copy, buttons, captions, labels, subheadings, forms, footer. Weights: 400 / 500 / 600 / 700.

Do NOT use Bebas Neue for long paragraphs.

## 6. Type Style

Hero headings (desktop):
```css
font-family: "Bebas Neue";
font-size: clamp(4rem, 8vw, 8rem);
line-height: 0.9;
letter-spacing: 0.01em;
```

Body:
```css
font-family: "Montserrat";
font-size: 16px-18px;
line-height: 1.7;
```

Labels / eyebrow text:
```css
font-family: "Montserrat";
font-size: 12px-14px;
font-weight: 600;
letter-spacing: 0.18em;
text-transform: uppercase;
```

Use generous spacing.

## 7. Logo System

Approved formats:
- **A. Primary horizontal logo** — [S emblem] + SANFORD / STORY / CHURCH
- **B. Emblem only** — S-shaped symbol containing the cross
- **C. Compact lockup** — Symbol + Sanford Story Church
- **D. Vertical lockup** — Emblem over SANFORD / STORY / CHURCH

Use the **emblem-only mark** for: mobile menu, favicon, social avatar, app icon, small branding moments.
Use the **full logo** for: header, footer, about section, large branded compositions.

**IMPORTANT — never distort the logo.** Never stretch, rotate, change proportions, add shadows, add outlines, add random colors, or place on low-contrast backgrounds. Maintain generous clear space.

## 8. Website Visual Language

Use: strong editorial layouts, large typography, generous whitespace, clean grids, full-width sections, strong navy/cream contrast, selective orange accents, photography with human warmth, subtle line graphics suggesting paths/pages/stories, minimal UI chrome.

The page should feel like: a contemporary cultural brand + a modern church + an editorial story-driven website — not a generic church template.

## 9. Buttons

**Primary:** orange background `#FF9A1F`, navy text `#0F1E34`; `padding: 14px 24px;` Montserrat 700 uppercase, `letter-spacing: 0.08em;` border-radius 4–8px max. No exaggerated pill buttons.

**Secondary on navy:** transparent, cream border + text; hover → orange border/text.

**Secondary on light:** transparent, navy border + text; hover → navy background, cream text.

## 10. Header

Desktop: left = logo; right = ABOUT, NEW HERE, MINISTRIES, SERMONS, EVENTS, GIVE; primary CTA = **PLAN YOUR VISIT**.

Prefer transparent header over hero initially; on scroll, cream or navy solid background. Keep navigation clean and compact.

## 11. Homepage Structure

1. **HERO** — navy background, primary logo or emblem. Headline: "YOUR STORY. GOD'S PLAN." or "GOD'S STORY IS STILL BEING WRITTEN." Short supporting text. CTA: PLAN YOUR VISIT / secondary: OUR STORY.
2. **OUR STORY** — cream. Eyebrow: WHY STORY CHURCH? Main idea: "We are His Living Story." Explain the Gospel as God's story of redemption; believers as living letters of Christ. Use 2 Corinthians 3:3.
3. **FOUR BRAND PILLARS** — four clean editorial blocks: HIS STORY / LIVING STORY / SPIRITUAL TRAINING / FAITHFUL COMMUNITY. Avoid generic card UI; prefer grid/editorial layout.
4. **NEW HERE / PLAN YOUR VISIT** — worship time, location, what to expect, kids, parking, contact/directions. Large CTA.
5. **SERMONS** — dark navy. Title: "THE STORY WE LIVE." Feature latest sermon with video thumbnail or sermon card.
6. **MINISTRIES** — cream or white, minimal grid: Kids, Youth, Young Adults, Small Groups, Discipleship, Missions. Do not overdesign.
7. **EVENTS** — simple modern listing; date visually prominent; avoid generic event-card templates.
8. **FINAL CTA** — navy. "YOUR STORY IS PART OF A GREATER STORY." CTA: JOIN US THIS SUNDAY.
9. **FOOTER** — deep navy `#0F1E34`: logo, address, service times, email, social media, quick links, orange accent details.

## 12. Image Direction

Photography should feel: real, warm, human, documentary, community-centered, worshipful without feeling staged.

Prioritize: people talking, worshiping, families, small groups, prayer, volunteers, life together, Sanford/local environment. Avoid polished generic stock church imagery. Photos may have subtle dark navy overlays, warm tint, or grain — keep effects minimal.

## 13. Decorative Graphics

Motif: a **flowing path / line** representing story, journey, God's leading, continuing narrative. Use very subtly — behind headings, between sections, as SVG line art, as page transitions. Do not make the site visually busy.

## 14. Responsive Design

Mobile is extremely important:
- Preserve large typography, scaled responsibly
- Stack logo lockups when necessary
- Generous horizontal padding (20–24px)
- No tiny text; easy-to-tap CTAs
- Don't overuse horizontal scrolling
- Collapse navigation into a clean menu
- Use emblem mark in mobile header if full logo is too wide

Desktop max content width: 1200–1360px.

## 15. Motion

Allowed: soft fade, translateY reveal, image reveal, line drawing, gentle parallax, subtle text mask animation.
Avoid: bouncing, spinning, excessive scroll animations, flashy transitions. Confident, not gimmicky.

## 16. CSS Tokens

See `styles/tokens.css` (container 1280px, spacing scale xs–2xl, radius 4/8px).

## 17. Design Principle

Priority order: **1. STORY → 2. GOSPEL → 3. PEOPLE → 4. PLACE → 5. INFORMATION**

The experience should communicate: "This church has a clear identity and a story." — not "This is another church website."

## 18. Final Brand Feel

BOLD · CLEAN · STORY-DRIVEN · GOSPEL-CENTERED · WARM · MODERN · LOCAL · CONFIDENT · HUMAN · TIMELESS

The visual identity should feel connected to the existing Sanford Story Church logo and brand board at all times.
