# Abhishek Kumar Verma — Portfolio

> A modern, minimalist portfolio website. Built with pure HTML, CSS, and JavaScript — no frameworks, no build tools.

![Portfolio Preview](https://img.shields.io/badge/Portfolio-Live-8b5cf6?style=flat)
![HTML](https://img.shields.io/badge/HTML5-E34C26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🌐 Live Demo

[abhishek-webapp.vercel.app](https://abhishek-webapp.vercel.app)

---

## ✨ Features

- **WebGL Fluid Background** — Interactive Three.js fluid simulation on desktop; lightweight animated dot grid on mobile
- **TargetCursor** — Custom GSAP-powered cursor with corner brackets that snap around hovered elements
- **Scroll Reveal Animations** — Elements animate in as they enter the viewport via IntersectionObserver
- **Active Nav Highlighting** — Navigation link updates as you scroll between sections
- **Working Contact Form** — Async Formspree integration with success/error states
- **Scroll Progress Bar** — Fixed gradient bar at the top tracks reading progress
- **Responsive Design** — Fully optimised for desktop, tablet, and mobile
- **Accessibility** — `prefers-reduced-motion` support, `rel="noopener noreferrer"` on all external links
- **DM Sans Font** — Loaded from Google Fonts for a clean, modern typographic feel

---

## 📂 Project Structure

```
portfolio/
├── index.html            # All content and markup
├── style.css             # All styles and responsive breakpoints
├── script.js             # WebGL fluid, dot grid, TargetCursor, animations
├── Abhishek_Verma.pdf    # CV — must be in root for download button to work
└── README.md             # This file
```

---

## 🚀 Running Locally

No install needed. Just clone and open with a local server (required for the camera/WebGL features to work correctly):

```bash
git clone https://github.com/vermaabhii/portfolio.git
cd portfolio

# Python
python3 -m http.server 8000

# Node
npx http-server
```

Then open `http://localhost:8000` in your browser.

> Opening `index.html` directly as a file (`file://`) will block the WebGL background and camera features due to browser security restrictions.

---

## 🎨 Design

### Colour Palette
| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#080810` | Page background |
| `--accent` | `#8b5cf6` | Purple — primary interactive colour |
| `--accent-pink` | `#f9a8d4` | Pink — subtitle, gradients |
| `--text` | `#e8e8f0` | Primary text |
| `--text-muted` | `#7878a0` | Secondary text |

### Typography
- **DM Sans** — Body, UI, headings
- **DM Mono** — Code/monospace contexts

### Breakpoints
| Breakpoint | Layout |
|---|---|
| 1024px+ | Full desktop layout |
| 900px | Stacked about section, wrapped nav |
| 768px | Mobile grid, dot grid replaces WebGL |
| 600px | Single column, smaller type |

---

## ⚙️ Key Technical Details

### Background Strategy
- **Desktop (>768px):** Three.js WebGL fluid simulation — interactive, reacts to mouse movement
- **Mobile (≤768px):** Lightweight canvas dot grid with sine wave ripple — battery friendly, no GPU load

Both backgrounds pause via `IntersectionObserver` when scrolled out of view, and via `visibilitychange` when the tab is hidden.

### TargetCursor
Ported from a React/GSAP component to vanilla JS. Features:
- Spinning corner-bracket cursor with `mix-blend-mode: difference`
- Corners snap to the bounding box of any hovered interactive element
- Click press/release feedback
- Auto-disabled on touch devices

### Contact Form
Powered by [Formspree](https://formspree.io). Submits asynchronously — no page reload. Shows a success card on send, or an error message if the request fails.

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push repo to GitHub (make sure `Abhishek_Verma.pdf` is committed)
2. Import repo at [vercel.com](https://vercel.com)
3. No build settings needed — just deploy
4. Auto-deploys on every push to `main`

### GitHub Pages
1. Push to a repo named `portfolio`
2. Settings → Pages → Source: `main` branch, `/ (root)`
3. Live at `vermaabhii.github.io/portfolio`

> Either way, confirm `Abhishek_Verma.pdf` is in the root of the repo before deploying.

---

## 📊 Projects Showcased

| Project | Tech | Links |
|---|---|---|
| **FitLog** 💪 | HTML, CSS, Vanilla JS, LocalStorage | [GitHub](https://github.com/vermaabhii/FitLog) · [Live](https://fit-log-gym.vercel.app) |
| **This Portfolio** 🌐 | HTML, CSS, JS, WebGL, GSAP | [GitHub](https://github.com/vermaabhii/portfolio) |
| **AntiGravity Hands** 🖐️ | HTML, CSS, MediaPipe, WebRTC | [Live](https://antigravity-hands.vercel.app) |

---

## 👤 About

**Abhishek Kumar Verma** — B.Tech Student (4th Sem, MERI CET), Frontend Developer, UI/UX Enthusiast.

- 📧 [abhikumars2007@gmail.com](mailto:abhikumars2007@gmail.com)
- 💻 [github.com/vermaabhii](https://github.com/vermaabhii)
- 🔗 [linkedin.com/in/vermaabhii](https://www.linkedin.com/in/vermaabhii/)

---

**Last Updated:** 2026 · **Status:** Active
