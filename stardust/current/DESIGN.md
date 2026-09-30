<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-09-30
stardustVersion: 0.25.0
source: https://of1--frescopa26--aem-showcase.aem.page (/, /machines, /beverages)
evidence: stardust/current/_brand-extraction.json, stardust/current/_computed-styles.json
mode: descriptive (current state, not target)
-->
---
name: Fréscopa (current state)
description: Warm editorial coffee brand. Cream paper grounds, burgundy display type, terracotta pill CTAs, charcoal closing bands.
colors:
  paper: "oklch(97% 0.010 82deg)"          # #f8f5ee
  paper-2: "oklch(94.8% 0.015 78deg)"      # #f3ede3
  paper-3: "oklch(91.8% 0.020 74deg)"      # #ece2d6
  sand: "oklch(88.4% 0.025 71deg)"         # #e4d6c7
  ink: "oklch(26.2% 0.021 52deg)"          # #2d221b
  ink-soft: "oklch(43% 0.022 52deg)"       # #5a4d45
  burgundy: "oklch(34% 0.093 25deg)"       # #5f201e
  burgundy-deep: "oklch(27.5% 0.082 26deg)" # #481311
  terracotta: "oklch(60.5% 0.116 44deg)"   # #ba6945
  terracotta-deep: "oklch(51.5% 0.108 40deg)" # #9a4f35
  amber: "oklch(79% 0.128 74deg)"          # #ebad54
  amber-soft: "oklch(86.5% 0.083 80deg)"   # #f0cd94
  teal: "oklch(55% 0.05 205deg)"           # #4d7a7f
  charcoal: "oklch(22.2% 0.016 52deg)"     # #211914
  charcoal-2: "oklch(28.2% 0.020 50deg)"   # #322721
  cream: "oklch(94.5% 0.016 80deg)"        # #f3ece1
  cream-soft: "oklch(79.5% 0.021 78deg)"   # #c4bbad
  line: "oklch(85.5% 0.018 68deg)"         # #d8cdc3
  line-dark: "oklch(40% 0.020 55deg)"      # #51453e
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 1.7rem + 4.6vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 1.3rem + 2vw, 2.8rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.08rem + 0.7vw, 1.6rem)"
    fontWeight: 800
    lineHeight: 1.15
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.62
  body-lg:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 0.98rem + 0.5vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.62
  eyebrow:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.2em"
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
rounded:
  sm: "8px"
  md: "14px"
  lg: "22px"
  xl: "32px"
  pill: "999px"
spacing:
  3xs: "0.25rem"
  2xs: "0.5rem"
  xs: "0.75rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2.5rem"
  xl: "4rem"
  2xl: "6rem"
  section-y: "72px"
  content: "1120px"
  content-wide: "1320px"
  gutter: "clamp(1.25rem, 0.4rem + 3vw, 3rem)"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.cream}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12.75px 22.5px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta-deep}"
  button-light:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  button-ghost-dark:
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
  chip:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "7.2px 12.8px"
  chip-active:
    backgroundColor: "{colors.burgundy}"
    textColor: "{colors.cream}"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
  footer:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.cream}"
---

# Design System: Fréscopa (current state)

## Overview

Fréscopa reads as a warm, editorial, premium-but-approachable coffee brand. Each page opens with a full-bleed, low-key interior photo (brass-and-steel machines, wood, stone, steam, amber window light) under a dark scrim, with a very large, heavy, tightly tracked sans headline. Below the hero the page runs in alternating cream bands (`paper` / `paper-2`). Each section follows the same order: a small uppercase terracotta eyebrow, a burgundy headline (often with a terracotta emphasis phrase), soft body copy, then a pill CTA or a `text →` link. Pages close on a charcoal band and a charcoal footer. The mood is quiet craft plus a light touch of intelligence ("Barista craft, kept warm by a little intelligence"). Register: **brand** (marketing / commerce).

## Colors

The palette is authored as oklch custom properties on `:root` (the normative source). Hex values are conversions.

### Primary
- **Burgundy** `#5f201e` (`--burgundy`) is the headline colour on light grounds and the active-chip fill. It is used as text, background, and border.
- **Terracotta** `#ba6945` (`--terracotta`, also `--accent`, `--link-color`) fills primary pill CTAs, colours eyebrows and text links, and carries emphasis words inside headlines ("without the barista price tag", "knew."). Hover changes it to **terracotta-deep** `#9a4f35`.

### Secondary
- **Amber** `#ebad54` (`--amber`) is the highlight on dark grounds: the emphasis phrase in the closing CTA ("haven't met yet."), eyebrows on dark bands, and the logo mark.

### Tertiary
- **Teal** `#4d7a7f` (`--teal`) is defined as a token but was not observed in computed styles on the three sampled pages.

### Neutral
- **Paper** `#f8f5ee` (page background), **paper-2** `#f3ede3` (alternate band), **paper-3** `#ece2d6`, **sand** `#e4d6c7`.
- **Ink** `#2d221b` (primary text), **ink-soft** `#5a4d45` (body copy; the most-used text colour).
- **Charcoal** `#211914` (dark bands, footer), **charcoal-2** `#322721`, **cream** `#f3ece1` (text on dark), **cream-soft** `#c4bbad` (muted text on dark).
- **Line** `#d8cdc3` (hairlines, chip borders), **line-dark** `#51453e` (dividers on dark).

### Named Rules
- **Warm neutrals only.** Every neutral sits at hue 50–82 in oklch. There is no cool grey anywhere.
- **One loud colour per moment.** Terracotta marks the action and burgundy carries the voice. Amber appears only on dark grounds.

## Typography

- **Display / headings:** Schibsted Grotesk, 800, tracking −0.02em, line-height 1.03 (h1) to 1.15. Measured at 1440px: h1 86.4px, h2 44.8px, h3 and h4 25.6px.
- **Body:** Hanken Grotesk 400, 17px / 1.62. The lead paragraph is 18–21px (fluid).
- **Eyebrow:** Hanken Grotesk 500, 12px, uppercase, 0.2em tracking, terracotta (amber on dark).
- **Buttons:** Hanken Grotesk 600, 15px, sentence case, often ending in `→`.
- Both families are open-licence Google Fonts, self-hosted from `/fonts/`. No font substitution was needed.

### Hierarchy
The scale is fluid (`clamp()` per level) and **ad-hoc**: the ratios between levels are 1.93, 1.75, and 1.51, so there is no single modular ratio. The hierarchy comes mostly from weight and colour: headings are 800 burgundy, body is 400 ink-soft.

## Layout

- Content max-width is 1120px (wide 1320px, narrow 760px). The gutter is fluid, 1.25rem to 3rem. Sections have 72px vertical padding. The nav is 72px tall.
- Most feature sections are two-column split layouts: an eyebrow, headline, and copy on one side, and a card, photo, or interactive widget on the other.
- Product grids use three columns on home. Machines uses a horizontal flagship card plus a two-up card grid. Beverages alternates image-left and image-right bands.
- The site follows the mobile-first EDS boilerplate breakpoints (600 / 900 / 1200).

## Elevation & Depth

### Shadow Vocabulary
- `--shadow-sm`: `0 1px 2px oklch(30% .03 50 / 6%), 0 2px 8px oklch(30% .03 50 / 5%)`, used on small toggles.
- `--shadow-md`: `0 4px 14px oklch(30% .03 50 / 7%), 0 14px 34px oklch(30% .03 50 / 8%)`, the card shadow (24 occurrences).
- `--shadow-lg`: a token that was not observed in computed styles.

Shadows are warm-tinted and soft, never grey or hard.

## Shapes

- **Pill (999px)** is used on every button, chip, and filter tab. It is the most frequent radius (56 occurrences).
- **32px** is used on cards and large media. It covers the largest area of any radius and is the signature shape.
- **22px** is used on feature images and on product cards inside the grid. **14px** is used on inner panels (the calendar widget). **11px** is used on small toggle buttons. **50%** is used on social icons.

## Components

### Buttons
- **Primary:** terracotta fill, cream text, pill, 12.75px × 22.5px padding, 600/15px. Hover changes to terracotta-deep.
- **Ghost on dark:** transparent fill with a cream border at 34% alpha. Hover adds a cream fill at 12% and a solid cream border.
- **Light on dark:** cream fill and ink text (for example "Find a café →").
- **Text link:** terracotta text with a trailing `→`. Hover changes to terracotta-deep.

### Chips
Uppercase, 11.84px, 1px `line` border, pill. The active state is a burgundy fill with cream text (the "Weekday" chip on home and "All machines" on /machines).

### Cards / Containers
Paper background, 32px radius, `--shadow-md`. Product cards pair a photo with a small uppercase eyebrow tag, a heavy title, soft copy, a price in bold ink, and an "Add to cart →" or "Join the list →" link.

### Inputs / Fields
The footer newsletter field is a pill input on charcoal with a terracotta "Sign up" pill button.

### Navigation
The header has the Fréscopa logo on the left (a burgundy wordmark with an amber mark), a centred text nav (The Atelier · Machines · Beverages · Café · Journal), and search, account, and cart icons on the right. The nav is transparent over the home hero. The active item gets a terracotta underline.

### Signature Component
**Taste radar / mood calendar.** These are interactive "the machine learns you" widgets on home: a radar chart inside a card with chips for Weekday, Slow Sunday, and After dinner, and a calendar card. Both present the product's intelligence in the brand's soft-card language.

## Do's and Don'ts

This section is descriptive. It records patterns the current site consistently follows, not prescriptions.

### Do:
- Pair an uppercase terracotta eyebrow with a heavy burgundy headline.
- Put one terracotta emphasis phrase inside a headline (amber on dark).
- Use pill CTAs, often with a `→`.
- Alternate paper and paper-2 bands, and close each page on charcoal.
- Use warm, low-key, natural-light photography.

### Don't:
- Use cool greys or pure black and white. The site uses none.
- Use gradients. None were observed.
- Use hard or dark shadows.
