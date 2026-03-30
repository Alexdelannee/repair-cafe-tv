# Repair Café TV Page (Visitors + Repairs)

This is a small static website (GitHub Pages) with:
1. A visitor page that auto-increments a **visits counter** once per day per device.
2. A TV display page with **big-font counters** and the latest repairs.
3. A staff/admin page to **add repairs** and mark them `queued`, `in_progress`, or `done`.

Data is shared across devices via **Supabase** (hosted database).

## 1) Create Supabase database

1. Create a Supabase project: https://supabase.com/
2. Open **SQL Editor**
3. Run the file `supabase_schema.sql`

After that:
1. Go to **Project Settings**
2. Copy:
   - `Project URL`
   - `anon public` key

## 2) Configure the site

Edit `config.js` in this folder and set:

```js
export const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

## 3) Deploy to GitHub Pages

1. Create a new GitHub repository (example: `repair-cafe-tv`)
2. Upload/push the files from this folder:
   - `index.html`
   - `display.html`
   - `admin.html`
   - `styles.css`
   - `config.js`
   - `supabaseClient.js`
   - `lib.js`
3. GitHub: **Settings -> Pages**
4. Set **Source** to `Deploy from a branch`
5. Choose the branch (usually `main`) and folder/root: `/ (root)`

You should end up with a URL like:
`https://YOUR_GITHUB_USER.github.io/repair-cafe-tv/`

## 4) How to use it during the event

- Visitors open: `index.html` (on phones/tablets)
- Staff open: `admin.html`
- TV/Chromecast (mirroring) should show: `display.html`  
  The display page auto-refreshes every ~4.5 seconds.

### Chromecast mirroring tip

Because Chromecast mirroring shows whatever is in your browser tab/window:
- **Cast `display.html`** so the TV never affects visitor counting.
- If you must cast the visitor page, use `index.html?novisit=1` so it **does not** increment the visitor counter.

## Security note (important)

The included Supabase SQL enables **anonymous read/write** so it’s easy to run during an event.
If your café has public internet access, you should add real authentication (or an admin-only write path) to prevent abuse.

