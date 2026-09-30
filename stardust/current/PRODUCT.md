<!-- stardust:provenance
writtenBy: stardust:extract
writtenAt: 2026-09-30
stardustVersion: 0.25.0
source: https://of1--frescopa26--aem-showcase.aem.page (/, /machines, /beverages)
mode: descriptive (current state)
-->
# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

_provenance: inferred. Basis: captured hero and body copy on the three sampled pages._

Everyday coffee drinkers who want café-quality coffee at home without learning barista skills. The copy names students ("early lectures and late-night study sessions", "a 9am seminar or a 2am essay crunch"), busy professionals ("A packed Monday, an early flight"), and people with a slower weekend ritual. Secondary audiences are tea and cold-pressed-juice drinkers, and visitors to the Fréscopa Café.

## Product Purpose

Fréscopa sells coffee machines (flagship: **The Atelier**, a bean-to-cup machine that "learns what you love, softens or sharpens to match your mood, and quietly takes care of the rest"), plus coffee, tea, cold-pressed juice, and accessories. It also runs physical cafés. Key journeys are Meet your coffee agent / Order the Atelier, browsing machine families (bean-to-cup, espresso, filter, cold brew), shopping beverages, and finding a café.

## Positioning

"Great coffee, without the barista price tag." Fréscopa pairs barista craft with a little intelligence: a machine that adapts to taste, mood, and calendar, and handles reordering and sustainability. The footer notes: "A fictional brand, created for demonstration."

## Capabilities and Constraints

- The site is built on AEM Edge Delivery Services (aem-boilerplate) and authored in Document Authoring. Preview is at `of1--frescopa26--aem-showcase.aem.page` and the production domain is frescopa.coffee.
- The commerce UI (Add to cart, prices, Join the list) is presentational in the sampled pages.
- Interactive home widgets show taste profiling (radar with Weekday / Slow Sunday / After dinner chips) and mood-aware brewing (calendar).

## Brand Commitments

- **Register:** brand (marketing and commerce landing pages).
- **Personality:** warm, confident, understated, and wry. Headlines are short and declarative ("Every morning, perfected.", "Made in the workshop.", "Three ways to fill a cup.", "It reads the room. And the calendar.").
- **Visual identity:** cream paper grounds, burgundy display type, terracotta actions, amber highlights on charcoal, and warm natural-light photography.
- **Observed anti-references:** no cool greys, no gradients, no hard shadows, no stock-tech imagery.

## Evidence on Hand

- `stardust/current/pages/{index,machines,beverages}.json` and `.html`: page records and the rendered DOM
- `stardust/current/assets/screenshots/{index,machines,beverages}.png`: full-page captures
- `stardust/current/_computed-styles.json`: computed-style census (1440 and 360)
- `stardust/current/_brand-extraction.json`: consolidated brand surface
- `stardust/current/DESIGN.md`, `DESIGN.json`: descriptive design system
- `stardust/current/assets/logo.svg`, `assets/favicon.ico`

## Product Principles

_provenance: inferred._

1. Craft first, technology in service. The intelligence is framed as "kept warm", never as the lead.
2. Effortless mornings. Every section resolves to one simple next step.
3. Personal. The copy speaks to "your taste", "your mood", and "your mornings".
4. Considered sustainability ("Nothing wasted, right down to the grounds").

## Accessibility & Inclusion

- 15 of 21 captured images have empty `alt`. That is fine for decorative images, but it also covers product and category photography.
- Body text colour (ink-soft on paper) and cream-on-charcoal both read at high contrast. Terracotta-on-paper text links should be checked against AA for small sizes.
