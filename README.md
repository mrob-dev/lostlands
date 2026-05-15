# Lost Lands

A guidebook to countries that no longer exist.

**All twelve volumes are available** (full chapters + travel + routes + mythbusters + bibliography).

## The library

| Vol | Title | Years | Chapters |
| :- | :- | :- | :- |
| I | Prussia | 1525 – 1947 | 14 |
| II | The Ottoman Empire | 1299 – 1922 | 10 |
| III | East Germany | 1949 – 1990 | 8 |
| IV | Yugoslavia | 1918 – 2003 | 10 |
| V | Persia | 550 BC – 1979 AD | 10 |
| VI | The Soviet Union | 1922 – 1991 | 10 |
| VII | The Inca Empire | 1438 – 1572 | 10 |
| VIII | The Congo Free State | 1885 – 1908 | 8 |
| IX | The Roman Empire | 27 BC – 1453 AD | 10 |
| X | The Caliphate of Córdoba | 929 – 1031 | 9 |
| XI | Green Ukraine | 1917 – 1922 | 6 |
| XII | The Kingdom of Jerusalem | 1099 – 1291 | 10 |

105 chapters across twelve volumes.

## Features

- **Cross-volume timeline** at `/timeline.html` — all twelve states on one horizontal axis
- **Three.js globe** on the homepage with clickable markers and per-state boundary shapes on hover
- **Reading progress** tracked in `localStorage`: read indicators on TOCs, a "Continue reading" tile on the homepage
- **Dark mode** toggleable from the navbar, with `prefers-color-scheme` and `localStorage` persistence
- **Per-volume bibliographies** with sources organised by chapter
- **Inline imagery** — 33 chapters carry inline figures from Wikimedia Commons; the remaining ~70 are candidates for future cycles

## What's here

```
index.html                    Homepage (hero + globe + atlas + about)
timeline.html                 Cross-volume timeline
assets/css/main.css           Editorial design system + dark mode
assets/js/main.js             Theme, progress, nav injection
assets/js/globe.js            three.js globe with earth texture + hover shapes
assets/favicon.svg            Lost Lands logo / favicon
assets/textures/              Globe earth texture (self-hosted)

<volume>/                     One directory per volume
  index.html                  Cover, foreword, table of contents
  chapters/01-…html …         Long-form chapters
  travel.html                 Travel guide
  routes.html                 Driving routes
  mythbusters.html            Misconceptions corrected
  bibliography.html           Sources by chapter
```

## Local preview

```sh
python3 -m http.server 8080
# then visit http://localhost:8080
```

The three.js globe loads from `cdn.jsdelivr.net` via an import map and requires an internet connection. Wikimedia Commons hosts the volume hero imagery; the globe earth-outline texture is self-hosted in `assets/textures/`.

## Deploy to GitHub Pages

Static site, no build step. The `.nojekyll` file is present so GitHub Pages serves every file as-is.

```sh
git push origin main
# In GitHub: Settings → Pages → Build from branch → main / (root)
```
