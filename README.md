# Family Mediation Study (PWA)

A personal, installable study app for Texas family mediation training. It covers seven modules and 21 lessons, plus two optional extensions, with practice cases, worked answers, module tests, case law, worksheets, and references.

The content is generated from **Family Mediation Personal Study Guide v2.1** (Word). That guide is the master copy.

## What's here

| File | Purpose |
|---|---|
| `index.html`, `styles.css`, `app.js` | The app (no build step, no dependencies) |
| `data.json` | All lesson, test, and reference content, generated from the study guide |
| `manifest.webmanifest`, `icons/` | Makes the app installable on a phone's home screen |
| `sw.js` | Service worker: saves everything for offline use |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is |

## Publish with GitHub Pages

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, then branch **main** and folder **/ (root)**, and click **Save**.
3. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

## Install on a phone

- **iPhone (Safari):** open the site, tap **Share**, then **Add to Home Screen**.
- **Android (Chrome):** open the site, tap **⋮**, then **Install app** or **Add to Home screen**.

Open the app once while online. After that it works offline.

## Updating the content

1. Update the Word study guide first.
2. Regenerate `data.json` from the updated guide.
3. In `sw.js`, raise `VERSION` (for example, `fms-v2.1.0` → `fms-v2.2.0`) so phones download the new content.
4. Push. The next time the app opens online, it shows **"An updated version is ready"**; tap **Update**.

## Privacy

Progress, notes, and quiz scores are stored only in the browser on each device. Nothing is sent anywhere. The site itself is public to anyone who has the link.

This is a personal study aid. Where it differs from your certified course, follow the course.
