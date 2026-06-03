# Web App Structure

The current frontend is a browser-only single page application.

- `public/html/app.html`: The only HTML entrypoint.
- `public/css/edusmart-pro.css`: Application stylesheet.
- `public/js/edusmart-app.js`: Current SPA bundle. It is intentionally kept as a legacy bundle during this structural cleanup so behavior stays stable.

Future frontend work should move route renderers out of `edusmart-app.js` into feature folders under `src/features/`, then build back into `public/js/`.

