# Render: one service for frontend and API

The production Node adapter runs the same bundled Worker as local development. No frontend split, Python runtime, extra server framework or local monitor is required to serve the app.

## Configuration

- Runtime: Node 24 (pinned in `render.yaml`).
- Branch: `main`; repository root is the service root.
- Build command: `npm ci --include=dev && npm run build`.
- Start command: `npm start`.
- Health check: `/healthz` (process readiness, not an upstream-provider or market-freshness check).
- Instance: Free. No paid cron, database or worker is provisioned by the blueprint.
- Automatic deploys: off. Deploy a reviewed revision manually.
- Secret: `GEMINI_API_KEY`, entered privately in Render's Environment settings. The app works with source excerpts if omitted.
- `GEMINI_MODEL=gemini-3.1-flash-lite`; optional ordered backups are in `.env.example`.

`render.yaml` can be imported as a Render Blueprint. Selecting/creating the service starts a public deployment, so do that only after the repository and revision are reviewed. No actual Render service is created by merely committing this file.

## Local production smoke test

Build first, then run `npm.cmd start` in PowerShell. Use `PORT` to choose an unused port. This entry point does not rebuild/reload files, expose `/_qa/mobile`, or provide local desktop notifications. Keep development on `npm.cmd run dev`.

## Hosted limits and post-deployment checks

- A free Render web service sleeps after 15 minutes without incoming requests. The whole app can wait during its next startup. Never promise an always-on scheduler on this tier.
- Current snapshots are included at build time. Online source checks use bounded memory caching, which is lost on restart. Hosted durable ingestion and background notification delivery are not implemented.
- The local 15-minute monitor and Windows notifications remain local. The hosted app hides/unavailable-labels desktop-delivery controls.
- Provider keys remain server-side. Free Gemini access depends on the user's project quota and model availability. Fallback cannot guarantee a response.
- Source sites can block data-center traffic. After deploying, verify all portfolio feeds, one actual filing PDF, seeded and unfamiliar-ticker research, source links and AI synthesis from the hosted origin. Local success alone is insufficient.
- Check signed-out phone and desktop access, saved theme, chart tooltips, Alerts navigation, errors/missing evidence, and absence of secrets in browser assets.
- Protect provider quota with appropriate usage limits before sharing broadly. The prototype is a public demo without user authentication.

References: https://render.com/docs/web-services · https://render.com/docs/free · https://render.com/docs/blueprint-spec · https://render.com/docs/health-checks
