# Repair Café TV Page (Visitors + Repairs)

Static website (GitHub Pages compatible) with three pages:

1. **`index.html`** — visitor counter (once per day per device)
2. **`display.html`** — TV screen with big counters and latest repairs
3. **`admin.html`** — staff adds repairs and sets status (`queued`, `in_progress`, `done`)

Data stored in browser `localStorage`, synced in real-time across tabs on the same machine via `BroadcastChannel`.

---

## Running locally

> **Do not open files directly** (`file://`) — Chrome blocks ES module imports. Serve via HTTP instead.

```bash
npx serve .
```

Then open: `http://localhost:3000/display.html`

---

## Deployment (GitHub Pages)

1. Push files to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `Deploy from branch`, branch `master`, folder `/root`

URL will be: `https://YOUR_GITHUB_USER.github.io/repair-cafe-tv/`

---

## Usage during events

| Page | Who | URL |
|------|-----|-----|
| `index.html` | Visitors (phone/tablet) | `/index.html` |
| `admin.html` | Staff | `/admin.html` |
| `display.html` | TV / Chromecast | `/display.html` |

**Chromecast tip:** cast `display.html` so the TV never affects visitor counting.
To visit without incrementing counter: `index.html?novisit=1`

---

## Slideshow (TV display)

Configure in `config.js`:

```js
export const SLIDESHOW_ENABLED = true;
export const SLIDESHOW_DEFAULT_DURATION = 10000; // ms

export const SLIDESHOW_SLIDES = [
  { type: "dashboard" },                                          // stats screen
  { type: "image", url: "./assets/img/yourimage.jpg", duration: 8000 },
  { type: "webpage", url: "https://yoursite.com", duration: 15000 },
];
```

Slide types:
- `dashboard` — shows live stats and repairs list
- `image` — full-screen image
- `webpage` — full-screen iframe (note: sites with `X-Frame-Options` will refuse to load)

---

## Data persistence

`localStorage` is **per origin** — data added on GitHub Pages is separate from `localhost`.
Admin and display must run in the same browser/origin to share data.
