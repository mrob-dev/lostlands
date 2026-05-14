# Lost Lands

A guidebook to countries that no longer exist.

Volume I is **Prussia** (1525–1947): a fourteen-chapter readable history, a twenty-six-stop travel guide, four driving routes, and a mythbusters page, written as long-form editorial prose for the curious traveller.

## What's here

```
index.html                    Lost Lands homepage
prussia/
  index.html                  Volume cover + table of contents
  chapters/01-origins.html    The Pagans by the Amber Sea
  chapters/02-teutonic-order.html
  chapters/03-duchy.html
  chapters/04-brandenburg-prussia.html
  chapters/05-kingdom.html
  chapters/06-frederick-the-great.html
  chapters/07-napoleonic.html
  chapters/08-bismarck.html
  chapters/09-empire.html
  chapters/10-collapse.html
  chapters/11-weimar.html
  chapters/12-third-reich.html
  chapters/13-abolition.html
  chapters/14-legacy.html
  travel.html                 Twenty-six places, three modern countries
  routes.html                 Four driving routes
  mythbusters.html            Eleven misconceptions, politely corrected
assets/css/main.css           Cinematic editorial design system
assets/js/main.js             Scroll progress + reveal-on-scroll
```

## Local preview

Open `index.html` in a browser, or serve from this directory:

```sh
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Deploy to GitHub Pages

The repo is structured as a static site with no build step, so GitHub Pages can host it directly from the root of any branch.

```sh
# 1. Create the repo on github.com (or with `gh repo create lostlands --public --source=. --push`)
# 2. Push:
git remote add origin git@github.com:<your-username>/lostlands.git
git branch -M main
git push -u origin main
# 3. In GitHub: Settings → Pages → Build from branch → main / (root)
```

The `.nojekyll` file is already present so GitHub Pages will serve every file as-is (including paths beginning with underscores).

## Future volumes

The homepage shows nine more volumes-in-progress: the Ottoman Empire, East Germany, Yugoslavia, Austria-Hungary, the Soviet Union, Czechoslovakia, the Kingdom of Bohemia, and the Republic of Venice. They are cards in the atlas grid on `index.html`. Each one, when written, follows the same template as Prussia: a chapter sequence under `<country>/chapters/`, a `travel.html`, a `routes.html`, and a `mythbusters.html`.
