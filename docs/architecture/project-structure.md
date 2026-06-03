# Project Structure

EduSmart now uses a layered layout:

```text
apps/
  web/
    public/              # Static assets served by Express
src/
  server/                # Express composition root
  modules/               # API route modules
  core/                  # Domain and AI learning engines
  services/              # External service adapters
  utils/                 # Shared helpers
ops/
  database/              # Migrations and SQL assets
scripts/                 # Operational scripts
docs/                    # Architecture and product notes
```

Design rules:

- Add new API endpoints in `src/modules` and register them in `src/server/route-manifest.js`.
- Keep startup, static hosting, health checks, and frontend fallback logic inside `src/server`.
- Keep AI/domain algorithms in `src/core`; route files should orchestrate rather than own large algorithms.
- Keep generated output, browser profiles, screenshots, and local datasets out of source scanning through `.gitignore` and `.aiignore`.

