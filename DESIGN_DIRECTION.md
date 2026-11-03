# FINN visual and interaction direction

Research pass: 3 November 2026. Proposed work, not a list of shipped features.

## Product anchor

The ENAM brief asks for a mobile-first working prototype that filters information
and saves an investor time. Push and primary-source pull research should connect.
The eight research views and four-quarter comparison are suggestions; reliability
and judgment matter more than breadth. The user's corrected deadline remains
3 November 2026, 11:59 pm IST.

Keep the accepted compact application direction. Improve the two tasks before
adding more visual surfaces. A reviewer should see a filing, understand why it
was prioritised, inspect its source, and start company research without retyping.

## Reference research

- Linear, “A calmer interface for a product in motion”:
  https://linear.app/now/behind-the-latest-design-refresh
  Task hierarchy, quieter navigation, consistent control placement.
- v0 dashboard gallery and design-mode documentation:
  https://v0.app/templates/top/dashboards
  https://v0.app/docs/design-mode
  Component/spacing references and targeted visual iteration. No template source
  or assets imported; adopting its runtime is not needed.
- Lovable design guidance and systems:
  https://docs.lovable.dev/features/design-guidance
  https://docs.lovable.dev/features/design-systems
  Set explicit type/color/layout rules instead of repeatedly changing style.
- Quartr Pro:
  https://quartr.com/products/quartr-pro
  Domain reference for company research and first-party source workflows.

These are references, not proof that a particular design will improve FINN.
The recommendations below are design judgments based on the assignment and the
current local interface. No external source code or branding is copied.

## Next implementation order

1. Filing cards: company/category/time, concise event title, explanation and source
   actions in a stable layout. Preserve original exchange text in an expandable
   detail view. Deterministic shortening may remove boilerplate; it must not
   invent a summary, infer figures, or relabel a board-meeting notice as results.
   Add a direct research-company action. Label the existing category-based
   explanation as a review cue rather than bespoke AI financial analysis.
2. Desktop evidence drawer and mobile sheet: original wording, source link,
   filing date and source state stay within reach. Escape closes, focus returns
   to the trigger, and keyboard navigation remains usable.
3. Research workspace: prominent company/search control, document coverage and
   reporting dates, one selected topic, concise supported answer, inspectable
   citations. Desktop answer/evidence split; mobile evidence opens on demand.
   Missing/blocked sources and extractive mode remain explicit. Do not display a
   model success indicator just because a key is configured.
4. Reduce duplicate overview content: the watchlist strip, four metrics and market
   watch currently repeat some information. Prefer the brief first, with a
   compact context/alerts area. Keep the default real 24-hour window even if
   empty. Provide an honest widen-window action; never shift the default silently
   to make the demo appear busy.
5. Source health: concise per-company state with fetch/session dates and provider
   names. Put raw-feed links and error details behind expansion. Clearly
   distinguish a fresh request from a current trading session. Do not call
   unavailable or stale prices live.
6. Chart refinement: hover/focus session inspection, adjustable available-session
   range, clear price/volume units and source context. Only real available bars.
   Keep the accessible exact-value table. No invented portfolio P/L, benchmark,
   allocation or return figures without holdings and verified data.

## Consistency rules

- One sans-serif interface family and tabular numbers; avoid mixing report-like
  serif headings with application controls.
- Main body/filing text 14–16px; useful metadata 12–13px where practical. Do not
  solve density by shrinking essential content into unreadable labels.
- Blue means action/selection; amber means attention/coverage concern; red/green
  indicates signed movement only when backed by data. Pair color with text.
- Consistent 8/12/16/24px spacing and 6/10/12px corners. Keep surface changes
  purposeful; every subsection does not need its own card.
- Motion explains state changes (150–250ms), respects reduced motion, and never
  creates fake live updates, pulses, scrolling market feeds or changing values.
- State model: loading, ready, no matches, stale, partial sources, provider
  unavailable. Each needs an understandable next action.

## Verification

Test phone widths 360/390px and desktop, keyboard focus, drawer return focus,
source/period labels, chart interactions and no horizontal page overflow. Compare
the actual populated and empty states. Run the existing build/test/validation
checks after implementation. Do not claim these proposed changes are implemented.

No new account, paid service, plugin, migration, publishing or source push is
required for this design work. Live AI answer validation and submission access
remain separate completion requirements.
