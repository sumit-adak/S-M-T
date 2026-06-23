# veeshal.me — Next.js

The full site, ported from PHP to Next.js (App Router, React 19).

## Run it

```bash
npm install
# .env.local holds the Supabase + EmailJS keys (gitignored)
npm run dev             # http://localhost:3000
```

`npm run build && npm start` for production.

## Routes

| URL | Source |
| --- | --- |
| `/` | `app/page.tsx` (home) |
| `/projects` `/timeline` `/chaicode` `/blogs` | `app/<name>/page.tsx` |
| `/blogs/<slug>` | `app/blogs/[slug]` — 23 static posts (SSG) |
| `/blogs/post?slug=` | `app/blogs/post` — Supabase CMS posts |
| `/chaicode/cursor` `/mintlify` `/february` | static microsites in `public/chaicode/` |
| `/vee` | `app/vee` — Supabase admin (anon key, noindex) |

## How content updates without a rebuild

Pages are Server Components that read Supabase via `lib/supabase.ts` with
`revalidate: 120` (same 120s window the old PHP disk-cache used) and fall back
to hardcoded data if Supabase is unreachable. Editing in `/vee` shows up within
120s — no redeploy, no hard refresh.

## Reused, not rewritten

The original site's CSS/JS/assets are reused verbatim: `styles/css/*` is
bundled+hashed by Next; `public/js/*` is loaded by `app/Scripts.tsx` with a
`?v=<deploy>` cache-buster. The 23 static blog posts (`content/blogs/*.json`)
and the `/vee` CMS (`public/js/vee-cms.js`, `styles/css/vee.css`,
`content/vee-body.html`) were extracted from the old PHP by the one-off scripts
in `scripts/` — kept for reference; the PHP sources no longer exist.

## Deploy

See `DEPLOY-NEXTJS.md` (VPS + nginx reverse proxy).
