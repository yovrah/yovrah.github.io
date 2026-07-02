# yovrah.node

<div align="center">

```
[ping] --ms | [hint] loading...
```

**a fake-hacking terminal boot sequence for a personal landing page**

[![Live Site](https://img.shields.io/badge/live-yovrah.github.io-63ff8a?style=for-the-badge&logo=googlechrome&logoColor=black)](https://yovrah.github.io)
![Made with](https://img.shields.io/badge/made%20with-%E2%9D%A4-c68ba6?style=for-the-badge)
![Stack](https://img.shields.io/badge/stack-vanilla%20JS-9ae6f0?style=for-the-badge&logo=javascript&logoColor=black)

</div>

---

## what this is

A single-page personal site built to look like a live intrusion in progress. On load it fakes an authentication sequence — geo-lookup, session decode, client fingerprinting — before dropping into an animated ASCII logo, a background video/audio loop, and a fully interactive fake terminal console pinned to the bottom of the screen.

No framework, no build step. Just `index.html`, jQuery, and a couple of hand-rolled effects.

## features

- **Boot sequence** — typewriter-style intro that pulls real IP/geo data (`ipgeolocation.io`) and renders a decrypt-style reveal animation
- **ASCII logo** — glitch pulse on click / on interval, mouse-parallax tilt
- **Live terminal console** — type `help` for the full command list:
  - `about`, `contact`, `stats`, `clear`
  - `music on|off|random|<track name>` — searches iTunes and streams a preview
  - `volume <0-100>`
  - `mono on|off`, `pixel on|off`, `matrix on|off`, `holo on|off`, `warp`, `blackout`, `logo`
- **Live weather** — pulled from Open-Meteo based on visitor geolocation
- **Visit counter** — with a local-storage fallback if the counter API is unreachable
- **Background video + audio loop** with a fade-in and cookie-based resume position
- **Mobile-aware** — swaps the video background for a static image on phones/tablets

## stack

| | |
|---|---|
| Structure | HTML5 |
| Styling | vanilla CSS, [animate.css](https://animate.style/) |
| Scripting | vanilla JS, jQuery + jQuery plugins (marquee, cookie), [Typed.js](https://github.com/mattboldt/typed.js/) |
| Icons | Font Awesome |
| APIs | ipgeolocation.io, Open-Meteo, iTunes Search, countapi.xyz |
| Hosting | GitHub Pages |

## project layout

```
.
├── index.html
├── ass.mp4                     # background loop
└── assets/
    ├── icons/                  # favicon + link icons
    ├── javascript/
    │   ├── app.js               # shared app state (brand text, volume, effects)
    │   ├── portfolio.js          # boot sequence, terminal console, all interactivity
    │   ├── analytics.js
    │   └── lib/                  # vendored jQuery / Typed.js / plugins
    └── stylesheets/
        └── stylesheet.css
```

## running locally

No build tooling required — it's a static site.

```bash
git clone https://github.com/yovrah/yovrah.github.io.git
cd yovrah.github.io
python3 -m http.server 8080
# open http://localhost:8080
```

## license

Personal project, source visible for reference. No explicit license — ask before reusing wholesale.

---

<div align="center">

made with ❤ by [yovrah](https://github.com/yovrah)

</div>
