# Randoro 🎲🍅

_A random + classic Pomodoro timer for focus_

## 🚀 Aim & Purpose

Randoro is a simple, privacy-first **Pomodoro web app**.

- **Normal Mode**: classic 25/5 cycle with long breaks.
- **Random Mode**: work + break times chosen from ranges, for variety.
- **Task list**: up to 3 focus tasks with notes.
- **Custom alarm**: upload your own sound (saved locally, never uploaded).
- **Reset option**: clear current session, timer, and tasks.
- Works offline and can be **installed as a PWA** (like a native app).

## 🛠 Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript (ES6)
- **Storage**: IndexedDB (session + alarm), localStorage (settings)
  - **Persistent across page reloads**
  - Supported on **Chrome, Firefox, Brave, Safari** (modern browsers)
- **PWA**: manifest.json + service-worker.js
- **Hosting**: GitHub Pages or Azure Blob (static site)

## ✅ Checklist

### Core Features

- [ ] Normal Mode timer logic
- [ ] Random Mode timer logic with session memory
- [ ] Task list UI (limit 3 tasks)
- [ ] Alarm sound (built-in + upload feature stored locally)
- [ ] Reset button to clear session, timer, and tasks

### Styling & UI

- [ ] Responsive layout (mobile + desktop)
- [ ] Tailwind integration for quick styling
- [ ] Visual indicators for work/rest cycles

### Offline & PWA

- [ ] Service Worker for offline caching
- [ ] `manifest.json` setup for installable PWA

### Testing

- [ ] Desktop browser test
- [ ] Mobile browser test
- [ ] Alarm sound playback verification

### Deployment

- [ ] Push code to GitHub
- [ ] Enable GitHub Pages or upload to Azure Blob
- [ ] (Optional) Set custom domain `randoro.teshwar.com`

## 🌐 Deployment

- Default: `https://teshwar.github.io/randoro/`
- Custom: `https://randoro.teshwar.com`

## Sounds

All sounds were obtained from pixabay, found the playlist here: https://pixabay.com/playlists/sounds-for-randoro-29953768/

- Level Up 07: Universfiled from Pixabay
- Car horn: Ennismore from Pixabay
- African tabla: Ribhav Agrawal from Pixabay
- Funny Alarm: Abrar Ahmad from Pixabay

## 📜 License

MIT – free to use and share.
