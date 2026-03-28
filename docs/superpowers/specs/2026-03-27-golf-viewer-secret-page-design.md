# Secret Golf Viewer Page — Design Spec

## Goal

Host the `golf-viewer-app` (a standalone vanilla JS PGA Tour shot-by-shot dashboard) on a secret, password-gated page of benlewis.xyz.

## Requirements

- Client-side password gate — cosmetic only, not real security
- Password: `ipoopedatwork`
- No link to the page from anywhere on the site — URL shared directly
- Zero modifications to the golf viewer source code
- Must fit within Cloudflare Pages' 25 MB per-file limit

## Architecture

### File Layout

```
src/pages/golf.astro              # Password gate page (Astro)
src/components/GolfGate.tsx       # React island: password input + iframe render
public/g7v/                       # Golf viewer files (obfuscated path)
  ├── index.html                  # Unmodified golf viewer (~2100 lines vanilla JS)
  └── data/
      ├── tournaments.json        # Tournament index (may be trimmed if tournaments excluded)
      ├── R2026007/               # Genesis Invitational (~16 MB)
      │   ├── app_data.json
      │   └── images/
      ├── R2026009/               # Arnold Palmer Invitational (~16 MB)
      │   ├── app_data.json
      │   └── images/
      ├── R2026010/               # Cognizant Classic (~25 MB)
      │   ├── app_data.json
      │   └── images/
      ├── R2026011/               # THE PLAYERS (~26 MB, include if minified fits)
      │   ├── app_data.json
      │   └── images/
      └── R2026475/               # Valspar Championship (~27 MB, include if minified fits)
          ├── app_data.json
          └── images/
```

### Password Gate Page (`src/pages/golf.astro`)

- Uses a minimal layout variant (no site header/footer) or a dedicated slim layout
- Renders `<GolfGate client:load />` as the sole content
- Sets `overflow: hidden` on body to prevent double scrollbars when iframe is active

### Password Gate Component (`src/components/GolfGate.tsx`)

**State machine:**
1. On mount, check `localStorage` for key `golf-auth`
2. If present and value matches, skip to iframe state
3. Otherwise, show password input

**Password input state:**
- Centered on screen, styled with site's warm paper/terracotta theme (CSS variables from theme.css)
- Single text input (type="password") + submit button
- On submit, compare to hardcoded string `ipoopedatwork`
- On match: save to `localStorage`, transition to iframe state
- On mismatch: shake animation or brief error message

**Iframe state:**
- Render `<iframe src="/g7v/index.html" />` with:
  - `width: 100%`
  - `height: 100dvh`
  - `border: none`
  - `display: block`
- Hide the password UI entirely

### Oversized JSON Handling

1. Run `jq -c` (compact/minify) on all 5 `app_data.json` files before copying to `public/g7v/data/`
2. Check resulting sizes against 25 MB limit
3. For any file still over 25 MB:
   - Exclude that tournament's folder from `public/g7v/data/`
   - Remove its entry from the copied `tournaments.json`
4. Keep whichever tournaments fit

### What We Don't Modify

- `golf-viewer-app/index.html` — copied as-is
- Golf viewer's internal JS, CSS, data format, or image structure
- Any existing pages or layouts on benlewis.xyz

## Known Limitations

- **Not secure:** Password is hardcoded client-side. Anyone reading source or guessing `/g7v/` can bypass.
- **Deploy size:** ~154 MB (or less if tournaments are dropped) added to the deploy. Slows `wrangler pages deploy` but is within Cloudflare Pages limits.
- **Mobile iframe:** `100dvh` handles most cases but mobile Safari can be finicky with iframe scrolling. May need testing.
- **localStorage persistence:** User stays authenticated across tabs and sessions until they clear storage.
