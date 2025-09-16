# Randoro 🎲🍅

_A random + classic Pomodoro timer for focus_

## 🚀 Aim & Purpose

Randoro is a simple, privacy-first **Pomodoro web app**.

- **Normal Mode**: classic 25/5 cycle with long breaks.
- **Random Mode**: work + break times chosen from ranges, for variety.
- **Task list**: up to 3 focus tasks with notes.
- **Custom alarm**: upload your own sound (saved locally in browser).
- **Reset option**: clear current session, timer, and tasks.
- Works offline and can be **installed as a PWA** (like a native app).

## 🛠 Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript (ES6)
- **Storage**: IndexedDB (session + uploaded sounds + alarm), localStorage (settings, tasks)
  - **Persistent across page reloads & browser restarts**
  - Uploaded sounds are stored locally in IndexedDB
  - Clearing site data/cache will remove uploaded sounds
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

## 🎵 Sounds

All built-in sounds were obtained from Pixabay:  
https://pixabay.com/playlists/sounds-for-randoro-29953768/

- Level Up 07: Universfiled from Pixabay
- Car horn: Ennismore from Pixabay
- African tabla: Ribhav Agrawal from Pixabay
- LoFi: Sound : Lesiakower from Pixabay

## Fonts

This project uses the **m6x11 font** by [Daniel Linssen](https://managore.itch.io/m6x11),  
which is free to use with attribution.

### Custom Uploads

- Users can upload their own notification sound.
- Uploaded sounds are stored locally in the browser via IndexedDB.
- They persist across reloads and browser restarts.
- **Note**: Clearing site data/cache will remove uploaded sounds.

## 📜 License

MIT – free to use and share.
