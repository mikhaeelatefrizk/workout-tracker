# workout-tracker

An offline-first progressive web app for a three-day A/B/C strength programme. One
HTML file, vanilla JavaScript, no framework, no build step, no network calls after the
first load. Everything you log stays in your browser's local storage.

**Open it:** https://mikhaeelatefrizk.github.io/workout-tracker/ — then "Add to Home
Screen" so it runs as an installed app and your data persists.

## What it does

- **Logs sets** (weight, reps, done) per exercise per session, with live persistence
  while you type so nothing is lost to screen-lock.
- **Learns your equipment.** Weight increments per machine are inferred from your own
  history; pin-stack machines get rung and notch detection so the coach only suggests
  loads that exist on the stack.
- **Coaches progression.** Double progression within a rep range, RIR targets, and a
  per-muscle weekly volume plan with automatic mesocycles and a reactive deload when
  performance drops.
- **Learns single-arm vs both-arm loads** so unilateral and bilateral versions of a lift
  inform each other.
- **Shows what a lift trains** with front/back anatomy panels highlighting primary and
  synergist muscles (upper body; lower-body panels are not drawn yet).
- **Rest timer** with a looping alarm and a native-Android alarm bridge where available.
- **Auto-backup** of your log to Downloads, plus a warning when the browser cannot
  guarantee persistent storage.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole app: styles, programme definition, coaching engine, UI. |
| `sw.js` | Service worker: caches the app shell for offline use (`workout-shell-*`). |
| `manifest.json`, `icon-*.png` | PWA install metadata. |
| `rafael/` | A separate, scope-isolated copy for one other person's upper-body programme. It shares most of the code but lags the main app in features; see below. |

## Known gaps

- `rafael/` is a hard fork and does not have the volume planner, weight ladder,
  single/both-arm learning, rest alarm, or anatomy panels that the main app has.
- Anatomy panels exist only for upper-body movements. Ten of the 26 programme entries
  (all lower body) show no panel.
- There is no automated test suite; the app is checked by loading it in a browser.

## Privacy

No analytics, no accounts, no server. The service worker only caches the app's own files.
