# Tip Cards (karticky) – personal card app

Offline PWA for lines/tips the user wants to remember (dating, socializing, chatting, books, skills…).
Runs on GitHub Pages: https://lasjosef.github.io/karticky (Android Chrome "Add to Home screen", PC browser).

## Rules
- UI in English. Style = the Trénink app: cool grey neutrals, bumper-plate colours for categories, Barlow / Barlow Condensed, rounded borderless cards, floating icon bottom nav, light + dark.
- No pop-ups/modals, use inline panels.
- Works offline. `sw.js` = cache; bump `V` in `sw.js` with every change.
- No server. Data in `localStorage` (`kc_data`), synced to the user's own Google Drive: one file `Karticky/karticky.json`, scope `drive.file`, same `CLIENT_ID` as Trénink (redirect URI https://lasjosef.github.io/karticky/ must be in the OAuth client).
- Sync = merge per card by `upd` timestamp (newer wins); deletes are tombstones `{id,del:true,upd}`. Categories have their own `catsUpd`.
- No personal data in the repo (it's public).

## Scheduling
LEVELS: 7×/week (1 d), 3×/week (2 d), 1×/week (7 d), 3×/month (10 d), 1×/month (30 d), every 3 months, 2×/year, 1×/year. Never switches off.
Check "Do you remember it?" after 3 reads on levels 0–2, every read from level 3. Yes = +1 level (less often), Not sure = −1, No = −2.
Optional "Situation" field = the card becomes a quiz (cue first, reveal the line).
