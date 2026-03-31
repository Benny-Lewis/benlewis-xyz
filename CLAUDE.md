# benlewis.fyi

## Stack
- Astro 6 (static output, no SSR adapter)
- React islands via @astrojs/react (e.g. PizzaCalculator with `client:visible`)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (NOT `@astrojs/tailwind`, which is deprecated)
- Astro Fonts API for self-hosted Google Fonts (`<Font />` component in BaseLayout head)

## Commands
- `npm run dev` — local dev server
- `npm run build` — build to `dist/`
- `npx wrangler pages deploy dist --project-name benlewis-fyi` — deploy to Cloudflare Pages

## Hosting & Services
- Cloudflare Pages (static deploy via wrangler CLI, GitHub auto-deploy not yet connected)
- Cloudflare Email Routing: ben@benlewis.fyi → Gmail
- Old domain benlewis.xyz redirects to benlewis.fyi (email routing still active on both)
- Domain DNS on Cloudflare

## Design
- Warm paper/terracotta theme ported from benandnicole.com (source at ../benandnicole)
- CSS variables defined in src/styles/theme.css, component styles in src/styles/global.css
- Fonts: Space Grotesk (--font-heading), Manrope (--font-body)
