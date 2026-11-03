# Personal workspace UI verification

Tested locally on 3 November 2026. Backend ingestion, research synthesis and source URLs were not modified for this UI work.

## Behaviour checked

- Profile V menu shows Vikash and Settings only; click opens, Escape closes and restores avatar focus, Tab moves out and closes, outside click closes. Settings shortcut opens the appearance dialog; close restores avatar focus.
- Light and Dark selections survived reload. System selection survived reload and matched the current dark device setting. Focused automated tests also simulate subsequent device-theme changes and cross-tab preference changes.
- Brief greeting matched device-local afternoon during the browser session. Logic uses local hours, with morning from 5–11, afternoon 12–16, evening 17–23, and Welcome back before 5. No fixed IST conversion is applied to greeting selection.
- Desktop Alerts navigation, mobile Alerts navigation, the brief alert-summary link and Settings Open Alerts shortcut worked. Mobile Edit alert rules scrolled the form below the sticky header and focused the price threshold.
- Starting 4% price / 2× volume rules yielded six crossings. Test values of 50% / 20× produced the no-crossings state and hid the brief summary; unchecking Company update changed highlighted filings from six to five. Saved values/category selection survived reload. Original 4% / 2× and all original categories were restored; six crossings and six highlighted filings returned.
- Portfolio chart, research excerpts/evidence dialog and Source health remained usable. The Infosys original-document link retained its publisher URL and #page=75 anchor.

## Layout and visual checks

Desktop and phone layouts were inspected using requested 1440×1000, 390×844 and 360×800 viewport settings. The embedded browser reported inner widths of 1385, 375 and 346 respectively; recorded DOM measurements are in personal-workspace-layouts.json. No horizontal page overflow was measured in those recorded checks. All five views were visited in both themes; both source tables keep their intended internal horizontal scrolling on phones.

Chart colour samples against the reading surface: dark line contrast 7.57:1 and axis labels 7.59:1; light line 4.32:1 and labels 5.93:1. Light secondary text against the workspace background measured 4.62:1. These are sampled contrast checks, not a full accessibility certification. The glossy layer uses low-opacity gradients and highlights, with blur limited to headers/menus/backdrops and reduced-transparency fallback. Existing reduced-motion behaviour is retained.

Screenshots are in ignored .cache/qa/: personal-final-desktop.png, personal-alerts-desktop.png, personal-settings-mobile.png, personal-mobile-dark.png and personal-mobile-light.png. Browser viewport override was reset at completion.

## Existing checks

All 42 tests passed, including the three new theme behaviour tests. Build, artifact validation and app/theme/charts script syntax checks passed. One existing homepage expectation was updated for the requested greeting. Browser passes caught and corrected view-navigation issues before completion.

Checks used the keyless local server on port 3002 to avoid unnecessary model calls. They do not retest Gemini availability, all companies’ documents, every physical phone, or every assistive technology. No GitHub push, deployment or account action occurred.
