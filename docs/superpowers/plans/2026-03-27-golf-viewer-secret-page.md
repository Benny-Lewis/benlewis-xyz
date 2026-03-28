# Secret Golf Viewer Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Host the golf-viewer-app on a password-gated secret page at `/golf` on benlewis.xyz.

**Architecture:** The golf viewer's static files (index.html, data/, images/) are copied into `public/g7v/` untouched. An Astro page at `/golf` renders a React island that prompts for a password; on success it displays a full-viewport iframe pointing to `/g7v/index.html`. Oversized JSON files are minified with `jq -c` before copying; any still over 25 MB are excluded.

**Tech Stack:** Astro 6, React 19, Tailwind CSS v4, existing theme CSS variables

---

## File Structure

| Action | Path | Purpose |
|--------|------|---------|
| Create | `src/pages/golf.astro` | Minimal Astro page that renders the GolfGate React island |
| Create | `src/components/GolfGate.tsx` | React component: password prompt + iframe |
| Copy | `public/g7v/index.html` | Unmodified golf viewer HTML |
| Copy | `public/g7v/data/tournaments.json` | Tournament index (possibly trimmed) |
| Copy | `public/g7v/data/R2026*/` | Tournament data folders (JSON minified, images as-is) |

---

### Task 1: Copy and prepare golf viewer files

**Files:**
- Create: `public/g7v/index.html`
- Create: `public/g7v/data/tournaments.json`
- Create: `public/g7v/data/R2026*/` (tournament folders)

- [ ] **Step 1: Create the `public/g7v/` directory**

```bash
mkdir -p ~/dev/benlewis-xyz/public/g7v
```

- [ ] **Step 2: Copy `index.html` as-is**

```bash
cp ~/dev/golf-viewer-app/index.html ~/dev/benlewis-xyz/public/g7v/index.html
```

- [ ] **Step 3: Copy all tournament data folders with images**

```bash
cp -r ~/dev/golf-viewer-app/data ~/dev/benlewis-xyz/public/g7v/data
```

- [ ] **Step 4: Minify all `app_data.json` files with `jq -c`**

Run `jq -c` on each `app_data.json` in-place to strip whitespace:

```bash
for f in ~/dev/benlewis-xyz/public/g7v/data/R*/app_data.json; do
  jq -c '.' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done
```

- [ ] **Step 5: Check file sizes and exclude any over 25 MB**

```bash
find ~/dev/benlewis-xyz/public/g7v/data -name "app_data.json" -exec ls -lh {} \;
```

For any file still over 25 MB (25000000 bytes):
1. Delete that tournament's entire folder from `public/g7v/data/`
2. Edit `public/g7v/data/tournaments.json` to remove the corresponding entry

Example if R2026475 is still too large:
```bash
rm -rf ~/dev/benlewis-xyz/public/g7v/data/R2026475
```

Then edit `tournaments.json` to remove the `{"id": "R2026475", ...}` entry.

- [ ] **Step 6: Verify the golf viewer works standalone**

```bash
cd ~/dev/benlewis-xyz/public/g7v && npx serve . -p 8888
```

Open `http://localhost:8888` and confirm the viewer loads tournaments correctly.

- [ ] **Step 7: Commit**

```bash
cd ~/dev/benlewis-xyz
git add public/g7v/
git commit -m "Add golf viewer static files to public/g7v/"
```

Note: This will be a large commit (~100+ MB). That's expected.

---

### Task 2: Create the password gate page and component

**Files:**
- Create: `src/pages/golf.astro`
- Create: `src/components/GolfGate.tsx`

- [ ] **Step 1: Create `src/components/GolfGate.tsx`**

```tsx
import { useState, useEffect, useRef } from 'react';

const PASSWORD = 'ipoopedatwork';
const STORAGE_KEY = 'golf-auth';

export default function GolfGate() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === PASSWORD) {
      setAuthenticated(true);
    } else {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      document.body.classList.add('golf-iframe-active');
    }
    return () => {
      document.body.classList.remove('golf-iframe-active');
    };
  }, [authenticated]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, PASSWORD);
      setAuthenticated(true);
    } else {
      setError(true);
      setInput('');
      inputRef.current?.focus();
      setTimeout(() => setError(false), 1500);
    }
  }

  if (authenticated) {
    return (
      <iframe
        src="/g7v/index.html"
        style={{
          width: '100%',
          height: '100dvh',
          border: 'none',
          display: 'block',
        }}
        title="Golf Analysis Dashboard"
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '1rem',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        <label
          htmlFor="golf-pw"
          style={{
            fontFamily: 'var(--font-heading, var(--font-sans))',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Password
        </label>
        <input
          ref={inputRef}
          id="golf-pw"
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter password"
          className="calculator-field focus-accent"
          style={{
            padding: '0.6rem 0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--color-border-input)',
            fontSize: '1rem',
          }}
        />
        {error && (
          <p style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>
            Wrong password
          </p>
        )}
        <button type="submit" className="btn-primary" style={{
          padding: '0.6rem 1rem',
          borderRadius: '0.375rem',
          border: '1px solid',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}>
          Enter
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/pages/golf.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import GolfGate from '../components/GolfGate';
---

<BaseLayout title="Golf">
  <GolfGate client:load />
</BaseLayout>

<style is:global>
  body.golf-iframe-active {
    overflow: hidden;
  }
</style>
```

- [ ] **Step 3: Verify the password gate works**

```bash
cd ~/dev/benlewis-xyz && npm run dev
```

Open `http://localhost:4321/golf`:
1. Should see a centered password prompt styled with the site's warm paper theme
2. Enter wrong password — should see "Wrong password" message
3. Enter `ipoopedatwork` — should transition to full-viewport iframe showing the golf dashboard
4. Refresh the page — should skip the prompt (localStorage persists)
5. Open browser devtools → Application → Local Storage → delete `golf-auth` key → refresh → prompt returns

- [ ] **Step 4: Commit**

```bash
cd ~/dev/benlewis-xyz
git add src/pages/golf.astro src/components/GolfGate.tsx
git commit -m "Add password-gated /golf page with GolfGate React component"
```

---

### Task 3: Build and deploy

**Files:**
- None new — verifying the build works and deploying

- [ ] **Step 1: Run the Astro build**

```bash
cd ~/dev/benlewis-xyz && npm run build
```

Expected: Build succeeds. The `dist/` folder should contain `golf/index.html` and the full `g7v/` directory.

- [ ] **Step 2: Verify the build output**

```bash
ls ~/dev/benlewis-xyz/dist/golf/
ls ~/dev/benlewis-xyz/dist/g7v/index.html
find ~/dev/benlewis-xyz/dist/g7v/data -name "app_data.json" -exec ls -lh {} \;
```

Confirm:
- `dist/golf/index.html` exists (the password gate page)
- `dist/g7v/index.html` exists (the golf viewer)
- No `app_data.json` exceeds 25 MB

- [ ] **Step 3: Deploy to Cloudflare Pages**

```bash
cd ~/dev/benlewis-xyz && npx wrangler pages deploy dist --project-name benlewis-xyz
```

Expected: Deploy succeeds (may take a while due to ~100+ MB of assets).

- [ ] **Step 4: Verify live**

Open `https://benlewis.xyz/golf`:
1. Password prompt appears
2. Enter `ipoopedatwork` — golf viewer loads in iframe
3. Navigate between tournaments — all included tournaments work
4. Direct access to `https://benlewis.xyz/g7v/` — viewer loads (expected, not a concern)

- [ ] **Step 5: Commit any final changes and push**

```bash
cd ~/dev/benlewis-xyz && git push
```
