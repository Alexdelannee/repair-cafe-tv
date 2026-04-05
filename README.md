# Repair Café TV Page (Visitors + Repairs)

This is a local-only, static website (GitHub Pages compatible) featuring:
1. A visitor page that auto-increments a **visits counter** once per day per device.
2. A TV display page with **big-font counters** and the latest repairs.
3. A staff/admin page to **add repairs** and mark them `queued`, `in_progress`, or `done`.

Data is stored locally in the browser (`localStorage`) and synchronized in real-time across all open tabs/windows on the same computer using the `BroadcastChannel` API.

## 1) Deployment

1. Create a new GitHub repository (example: `repair-cafe-tv`)
2. Upload/push the files from this folder:
   - `index.html`
   - `display.html`
   - `admin.html`
   - `styles.css`
   - `config.js`
   - `lib.js`
3. GitHub: **Settings -> Pages**
4. Set **Source** to `Deploy from a branch`
5. Choose the branch and folder/root: `/ (root)`

You should end up with a URL like:
`https://YOUR_GITHUB_USER.github.io/repair-cafe-tv/`

## 2) How to use it during the event

- Visitors open: `index.html` (on phones/tablets)
- Staff open: `admin.html`
- TV/Chromecast (mirroring) should show: `display.html`  

### Real-time Synchronization
Since this is a local-only setup, ensure all your devices (Admin PC and TV PC) are connected and running in the same browser environment or session if you want them to sync, or simply keep the Admin panel and Display open in different tabs on the machine connected to the TV.

### Chromecast tip

- **Cast `display.html`** so the TV never affects visitor counting.
- If you must cast the visitor page, use `index.html?novisit=1` so it **does not** increment the visitor counter.

