# Backend Structure

This folder contains the runtime backend code.

- `server/`: Express composition root. It owns middleware setup, static hosting, API mounting, health checks, and SPA fallback routing.
- `modules/`: HTTP API modules grouped by product capability. Each file exports an Express router.
- `core/`: Domain engines and AI learning logic, such as diagnostic models, learning paths, RAG, agents, and mastery calculation.
- `services/`: External service adapters, such as Xunfei virtual human and rhythm analysis integration.
- `utils/`: Shared infrastructure helpers.
- `config.js`, `db.js`, `middleware.js`: Runtime configuration, MySQL pool, and auth guards.

Root-level `server.js`, `config.js`, `db.js`, and `middleware.js` are compatibility shims for older scripts.

