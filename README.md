# Lost Lands

A guidebook to countries that no longer exist.

**All twelve volumes are now available** (full chapters, travel guide, driving routes, mythbusters).

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

Total: **104 chapters across twelve volumes**.

## What's here

```
index.html                    Lost Lands homepage (with three.js globe)
assets/css/main.css           Cinematic editorial design system
assets/js/main.js             Scroll progress + reveal-on-scroll
assets/js/globe.js            three.js low-poly globe with markers

<volume>/                     One directory per volume
  index.html                  Cover, foreword, table of contents
  chapters/01-…html …         Long-form chapters
  travel.html                 Travel guide (12-20 stops)
  routes.html                 Driving/transport routes
  mythbusters.html            Misconceptions corrected
```

## Local preview

Open `index.html` in a browser, or serve from this directory:

```sh
python3 -m http.server 8080
# then visit http://localhost:8080
```

The three.js globe loads from `cdn.jsdelivr.net` via an import map and requires an internet connection. Imagery is served from Wikimedia Commons (public domain or freely licensed).

## Deploy to GitHub Pages

Static site, no build step. The `.nojekyll` file is present so GitHub Pages will serve every file as-is.

```sh
git remote add origin git@github.com:<your-username>/lostlands.git
git branch -M main
git push -u origin main
# In GitHub: Settings → Pages → Build from branch → main / (root)
```
