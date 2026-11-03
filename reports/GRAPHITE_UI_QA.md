# Graphite UI refinement

Dark surfaces and controls now use neutral black/charcoal and silver, preserving financial green/red and warning amber. Mobile header uses an inline geometric F, FINN subtitle and graphite V avatar. Existing content and calculation paths are unchanged.

All 42 existing tests passed; final build and artifact validation passed. Desktop five-view navigation and overflow checked. Mobile viewport settings 360x800 and 390x844 inspected; the latter reports inner width 375 and header height approximately 68px. Profile Settings and Dark persistence through reload checked. Safe-area CSS is included for header and bottom navigation; physical notched devices were not tested.

Reduced-motion CSS disables animations/transitions globally; this was inspected in source, not tested by changing OS settings. Refresh rotation still depends on the existing request-bound spinner class. No continuous decorative animation was added. Source links, alert rules and research code remain intact. Screenshots: .cache/qa/graphite-mobile.png and graphite-desktop.png. No push or deployment.
