# mandar.fm — Spec (v0.2, approved)

A Nagpuri/Sadri nostalgia radio for Jharkhand: one illustrated scene, a radio that never stops,
ambient sound underneath, zero friction. Static site, no backend, no login, no cookies.

> Status: **approved 2026-10-19.** Decisions are recorded in §11.

---

## 1. Goals and non-goals

**Goals**
- Opening the page feels like arriving at a place: the dusk-lit akhra, crickets, a song already queued.
- One tap to start; after that the music never stops on its own (shuffle, skip dead tracks silently).
- Four worlds, each with its own illustration, playlist and ambience: Akhra, Trekker, Biha, Parab.
- Usable on a 360 px phone; keyboard-driven on desktop.
- Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices and SEO.

**Non-goals (v1)**
- No accounts, likes, comments, chat, or listener counts.
- No self-hosted or downloaded copyrighted audio, ever.
- No analytics, no third-party cookies set by us. The YouTube embed uses `youtube-nocookie.com`.
- No lunar calendar computation; festival dates are hand-edited config.

---

## 2. Stack and project layout

- **Vite + TypeScript, vanilla (no framework).** The UI is one scene plus a small radio panel; a
  ~60-line signal/store is enough, and it keeps the JS bundle small for Lighthouse. (Preact is the
  fallback if the UI grows.)
- **Vitest** for unit tests (fake timers for the clock).
- **Static output** in `dist/`, deployed to Vercel with zero config (`vercel.json` only for headers).
- Node ≥ 20 (for native `fetch` in the verify script), run with `tsx`.

```
/
├─ index.html
├─ public/                     robots.txt, sitemap.xml, og.png, favicons, fonts (subset, OFL)
├─ src/
│  ├─ main.ts                  boot: render scene, read prefs, wire overlay
│  ├─ store.ts                 tiny reactive store (world, track, volume, ambience on/off, phase)
│  ├─ data/
│  │  ├─ playlists.json        tracks (schema §4.1)
│  │  ├─ artists.json          artist name → official channel URL (schema §4.2)
│  │  ├─ festivals.json        yearly festival dates, hand-edited (schema §4.3)
│  │  └─ worlds.ts             world definitions (id, dial position, palette, ambience recipe)
│  ├─ i18n/strings.ts          ALL Nagpuri/Sadri + English copy, every Nagpuri string `// VERIFY`
│  ├─ time/
│  │  ├─ dayPhase.ts           local time → morning | afternoon | dusk | night   (pure, tested)
│  │  └─ festival.ts           date + festivals.json → active festival | null    (pure, tested)
│  ├─ player/
│  │  ├─ youtube.ts            lazy-load IFrame API, wrap player, map errors
│  │  ├─ queue.ts              per-world shuffle-without-repeat               (pure, tested)
│  │  └─ mediaSession.ts       lock-screen metadata + action handlers
│  ├─ ambience/
│  │  ├─ engine.ts             Web Audio graph, master gain, crossfades
│  │  ├─ synth/*.ts            crickets, wind, birds, mandar, engine, horn, fire crackle
│  │  └─ samples.ts            optional CC0 file loader (only if we ship files)
│  ├─ scene/
│  │  ├─ akhra.svg.ts  trekker.svg.ts  biha.svg.ts  parab.svg.ts
│  │  ├─ sohrai-border.svg.ts  shared motifs
│  │  └─ scene.css             palettes as CSS custom properties per phase, animations
│  ├─ ui/
│  │  ├─ radio.ts              dial, now-playing, skip, volume, ambience toggle
│  │  ├─ overlay.ts            "Tap to tune in"
│  │  ├─ keyboard.ts
│  │  └─ footer.ts
│  └─ storage.ts               try/catch localStorage wrapper
├─ scripts/
│  ├─ verify-playlists.ts      oEmbed check (§6)
│  └─ render-og.ts             default scene SVG → public/og.png (1200×630)
├─ tests/                      *.test.ts
├─ .github/ISSUE_TEMPLATE/suggest-a-song.yml
├─ CREDITS.md   README.md   SPEC.md
```

---

## 3. Worlds

| # | id | Name (EN / Nagpuri) | Scene | Ambience recipe | Playlist character |
|---|----|------|-------|-----------------|--------------------|
| 1 | `akhra` (default) | Akhra / अखड़ा | Village akhra at dusk under sal trees; mandar and nagara resting on a mat; people arriving along a laterite path; a mud house with Sohrai wall art | crickets, birds (morning/afternoon only), wind through sal leaves, occasional distant mandar pattern, fire crackle at night | Theth Nagpuri, jhumar, janani jhumar, mardani jhumar |
| 2 | `trekker` | Trekker / टेकर | Overloaded trekker on a ghat road, people on the roof and hanging off the back, luggage tied on top, hills and sal forest dropping away; cassette deck glowing on the dashboard | engine idle/rumble loop, periodic horn, wind rush, occasional gear-change | 2000s–2010s Nagpuri pop and DJ remixes |
| 3 | `biha` | Biha / बिहा | Madwa (wedding pavilion) with mango leaves, marigold strings, kalash, lamps; women in laal paar sarees in a domkach line | crowd murmur, distant nagara + dhak rolls, shehnai-like drone (synth), laughter is out of scope (no synthesis) | Wedding songs, domkach, high-energy nagara/dhak/shehnai |
| 4 | `parab` | Parab / परब | Karam branch planted in the akhra, Sarhul sal flowers, decorated courtyard; small details change with the active festival (§5.2) | crowd, mandar, birds, wind | Karam, Sarhul, Jitiya, Fagua songs |

**Shared visual language**
- Palette tokens: laal paar red `#B3202A`, saree white `#F4EBDD`, sal green `#3F6B35`/`#2C4A26`,
  laterite `#A2482B`/`#7E3A22`, Sohrai ochre/black/white earth pigments.
- Sohrai-style borders: original geometric/animal motifs drawn by me as SVG (no traced or copied artwork).
- Every scene is a layered inline SVG (sky → far hills → trees → midground → foreground → lights) so
  layers can animate independently with CSS transforms/opacity only (GPU-friendly):
  swaying sal leaves, rising smoke, flickering diya/lantern, drifting clouds, trekker body bounce.
- `prefers-reduced-motion`: all animation stops; the scene stays static and still looks complete.

---

## 4. Data model

### 4.1 `src/data/playlists.json`
Array of tracks. Required fields from your brief, plus two optional ones I'd like to add (marked *new*):

```ts
type WorldId = 'akhra' | 'trekker' | 'biha' | 'parab';

interface Track {
  world: WorldId;
  title: string;          // as you'd write it; used in UI + mismatch check
  artist: string;         // display; comma-separated for multiple artists
  youtubeId: string;      // "" = placeholder, skipped by player, reported by verify script
  startAt?: number;       // seconds; skip long intros
  notes?: string;
  festival?: 'karam' | 'sarhul' | 'jitiya' | 'fagua';   // *new*, parab only: boost during that festival
  titleMatch?: string;    // *new*, optional override string for the mismatch check (§6)
}
```

Seed content (all with `youtubeId: ""` — I will not invent or guess any ID):
- Folk/theth (`akhra`): Mukund Nayak, Mahavir Nayak, Govind Sharan Lohra, Madhu Mansuri Hasmukh —
  one placeholder each with `title: "TODO"`.
- Modern (`trekker`): Monika Mundu, Pawan Roy, Pankaj Roy, Nitesh Kachhap, Kumar Pritam, Ignes Kumari —
  one placeholder each.
- Example: `{ "world": "trekker", "title": "Pokhara Ke Pire Guiya", "artist": "Pawan Roy, Pankaj Roy, Monika Mundu", "youtubeId": "", "notes": "2016" }`
- `biha` and `parab`: one placeholder each so the structure is obvious.

### 4.2 `src/data/artists.json`
```ts
interface Artist { name: string; channelUrl: string; } // "" until you fill it in
```
The footer lists only artists with a non-empty `channelUrl`. I won't guess channel URLs either.
The verify script checks that each filled URL is `https://www.youtube.com/...` and returns HTTP 200.

### 4.3 `src/data/festivals.json`
Hand-edited each year. No lunar computation.
```ts
interface FestivalEntry {
  id: 'karam' | 'sarhul' | 'jitiya' | 'fagua';
  year: number;
  start: string;          // "YYYY-MM-DD", local date
  end?: string;           // inclusive; defaults to start
  leadDays?: number;      // highlight starts this many days before `start` (default 7)
  trailDays?: number;     // and lasts this many days after `end` (default 2)
}
```
Shipped with **empty entries for 2026 and 2027 and a `// fill me` note in the README**, unless you'd
rather I seed best-guess dates marked VERIFY (§11, Q5).

### 4.4 Persisted prefs (localStorage key `mandarfm:v1`)
`{ world: WorldId, volume: 0–100, ambience: boolean }`. All reads/writes go through `storage.ts`,
which wraps every call in try/catch and falls back to defaults (private mode, blocked storage, etc.).

---

## 5. Time and festival logic

### 5.1 Day phase (`dayPhase.ts`)
Pure function `getDayPhase(date: Date): Phase`, using the **device's local time**.

| Phase | Local time | Visual |
|-------|-----------|--------|
| `morning` | 05:00–10:59 | pale gold sky, mist on hills, birds active |
| `afternoon` | 11:00–15:59 | bright, high sun, short shadows |
| `dusk` | 16:00–18:59 | orange-pink sky, long shadows, first lamps lit (default look) |
| `night` | 19:00–04:59 | indigo sky, stars, lanterns/fire glow on, crickets louder, birds off |

- Applied as `data-phase` on `<html>`; palettes are CSS custom properties, transitions are 2 s crossfades.
- Re-evaluated every 60 s so the scene changes live if you leave the tab open across a boundary.
- Ambience recipe also depends on phase (birds by day, crickets + fire by night).
- Dev override: `?phase=night` (also used for screenshots and the OG render).

### 5.2 Festival (`festival.ts`)
Pure function `getActiveFestival(date: Date, entries: FestivalEntry[]): FestivalEntry | null`.
- Active if `start − leadDays ≤ date ≤ end + trailDays` (local date, day granularity).
- If two overlap, the one whose `start` is nearest wins.
- When active:
  - the Parab dial position glows and a small banner shows the festival greeting (from i18n);
  - Parab's scene shows that festival's props (Karam branch / sal flowers / Jitiya / Fagua colours);
  - tracks tagged with that `festival` are weighted 3× in the Parab shuffle;
  - **first-time visitors** land on Parab; returning visitors keep their saved world (dial still glows).
    See §11, Q4.
- Dev override: `?date=2026-09-02`.

---

## 6. Playlist verification (`scripts/verify-playlists.ts`)

Runs as `npm run verify` and as the first step of `npm run build`.

For each track with a non-empty `youtubeId`:
1. `GET https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`
   (concurrency 4, 10 s timeout, 1 retry).
2. Print a table: `world | your title | your artist | oEmbed title | oEmbed author | status`.
3. Status:
   - `OK` — 200 and title matches.
   - `DEAD` — 400/401/403/404 (removed, private, or embedding disabled). **Fails the build.**
   - `MISMATCH` — 200 but title doesn't match. **Fails the build.**
   - `NETWORK` — timeout/5xx after retry. **Fails the build** (so we never ship unverified IDs);
     override with `VERIFY_OFFLINE=warn` for local dev without internet.
4. **Match rule**: normalise both strings (lowercase, strip diacritics/punctuation/"official video",
   "full song", "nagpuri", years, etc.), then require ≥ 60% of the tokens of `titleMatch ?? title` to
   appear in the oEmbed title. Nagpuri titles are spelled many ways in Latin script ("Pokhara"/"Pokhra",
   "Guiya"/"Guiyan"), so tokens also match at edit distance ≤ 1 for words ≥ 5 chars. If a genuine track
   still fails, you set `titleMatch` to a substring of the real YouTube title.
5. Placeholders (`youtubeId: ""`) are listed as `PENDING` and **do not fail** the build.
6. **Does fail** if any world has zero playable (`OK`) tracks — otherwise that world can't play.
   Override with `ALLOW_EMPTY_WORLDS=1` so the scaffold builds before you've filled anything in.
7. Also fails on duplicate IDs, malformed IDs (not `[A-Za-z0-9_-]{11}`), and unknown `world` values.

Note: oEmbed returning 200 doesn't guarantee the video is embeddable everywhere (some labels
geo-block or restrict embedding on third-party sites). The runtime player handles that by skipping (§7.3).

---

## 7. Player behaviour

### 7.1 Start-up
1. HTML + inline critical CSS + scene SVG render first (no JS needed for the scene to look right).
2. JS reads prefs, sets phase/festival, shows the **"Tap to tune in" overlay** (Nagpuri + English line).
3. **The YouTube IFrame API is not loaded until the first tap.** That keeps it out of Lighthouse's
   critical path. The overlay can preconnect to `www.youtube-nocookie.com` on hover/touchstart.
4. First tap: resume `AudioContext`, start ambience at once (instant feedback), load the API and start
   the first track. Overlay fades out with a "tuning" crackle sound.
5. If YouTube fails to load (offline, blocked, adblock): the scene and ambience keep working, and the
   radio shows "Signal nai milat hai" (i18n, VERIFY) with a retry button. Nothing crashes.

### 7.2 Queue (`queue.ts`)
- Per-world shuffle bag: shuffle all playable tracks, play through, reshuffle when exhausted, never
  repeating within the session until the bag is empty; the first track of a new bag ≠ the last played.
- Switching worlds keeps each world's bag position, so coming back continues without repeats.
- `startAt` honoured via `playerVars.start`.

### 7.3 Errors
- IFrame `onError` codes 2, 5, 100, 101, 150 → mark track bad for the session, skip silently to next.
- Watchdog: if a track hasn't reached `PLAYING` within 12 s of loading, skip it.
- If every track in a world fails → show the "no signal" state for that world; ambience continues.

### 7.4 Controls
- **Dial**: four positions with a needle; drag/click/tap; static crackle (synth) while tuning;
  ambience crossfades (1.5 s) between worlds; the scene crossfades.
- **Now playing**: title + artist, marquee if too long; link "on YouTube ↗" to the video page.
- **Skip** (next track), **play/pause**, **volume** slider (music), **ambience toggle** (on/off;
  ambience volume is fixed relative to music at about −14 dB under, ducking a further 3 dB while a
  track plays).
- **Keyboard** (desktop, ignored while typing in an input):
  `Space` play/pause · `→` next track · `←` restart current track (if > 3 s in) · `↑/↓` volume ±10 ·
  `1–4` jump to world · `A` ambience on/off · `M` mute. Shown in a `?` help popover.
- All controls are real `<button>`/`<input type=range>` elements with labels; focus rings visible;
  touch targets ≥ 44 px.

### 7.5 Media Session
- `navigator.mediaSession.metadata` = title, artist, album = world name, artwork = a 512×512 PNG per world.
- Handlers: `play`, `pause`, `nexttrack`, `previoustrack` (restart). Updated on every track change.
- **Caveat** (see §11, Q1): mobile browsers usually suspend a cross-origin YouTube iframe when the screen
  locks or the tab is backgrounded, especially iOS Safari. Lock-screen metadata will show, but continuous
  background playback can't be guaranteed through the IFrame API. I'll make it work as well as the
  browser allows and document this, not hack around it.

---

## 8. Ambience

**Proposal: synthesise everything with Web Audio for v1** — zero licensing risk, zero audio bytes to
download (good for Lighthouse), easy to vary by phase. Then swap individual layers for CC0 recordings
later if a synth layer sounds too artificial.

| Layer | Synthesis approach |
|-------|--------------------|
| Crickets | AM-modulated sine bursts ~4.5 kHz, several voices with random timing, density by phase |
| Wind through sal | pink noise → slow-modulated band-pass + gentle gusts (LFO on gain) |
| Birds | short FM chirps with pitch glides, randomly spaced; morning/afternoon only |
| Distant mandar | pitched membrane (sine + pitch envelope + noise slap) through low-pass + reverb, playing a simple rhythm every 40–90 s |
| Nagara / dhak | lower membrane + noise, rolls (Biha) |
| Shehnai-ish drone | filtered sawtooth with vibrato, very low in the mix (Biha) |
| Trekker engine | detuned saw/square around 40–60 Hz, LFO for rpm wobble, low-pass; occasional rev |
| Horn | two detuned square tones, short envelope, every 20–60 s |
| Fire crackle | sparse filtered noise clicks (night only) |
| Crowd murmur | band-passed noise with slow formant-like filter sweeps |

If we do add recorded CC0 files: Opus/OGG ≤ 150 KB each, lazy-loaded after the first tap, each one
listed in CREDITS.md with title, author, source URL, licence (CC0 1.0 / public domain) and date
accessed. Synthesised layers are also listed in CREDITS.md as "synthesised in-browser".

---

## 9. Copy and i18n (`src/i18n/strings.ts`)

- Single file, two locales: `nag` (Nagpuri/Sadri in Devanagari) and `en`. The UI shows Nagpuri as the
  main line with English as a smaller subtitle. No language switcher in v1.
- **Every Nagpuri string has a trailing `// VERIFY` comment.** A unit test fails if any `nag` string
  is missing the marker, so nothing gets past unreviewed. You remove the markers yourself once checked;
  the test then switches to warn-only after a `DIALECT_REVIEWED = true` flag is set.
- Initial strings (all drafts for you to correct): greeting "जोहार", tap-to-tune line, world names,
  per-phase greetings (morning/afternoon/dusk/night), festival greetings, no-signal message, footer line.
- Fonts: **system fonts only** (Noto Sans Devanagari on Android, Kohinoor on iOS/macOS, Nirmala UI on
  Windows). A self-hosted Devanagari face was 98 KB even per-script, which blows the performance budget;
  revisit with a glyph subset if the system faces feel too plain.

---

## 10. Launch polish

- **SEO**: `<title>` "mandar.fm — Nagpuri radio from Jharkhand | मांदर एफएम"; meta description EN +
  Devanagari; canonical. `lang="en"` on `<html>` and `lang="hi"` on Devanagari elements. Sadri does
  have a code (`sck`), but screen readers don't voice it, so I'm using `hi` for pronunciation. Tell me
  if you'd rather use `sck`.
- **JSON-LD**: `WebSite` + `FAQPage` ("What is mandar.fm?", "Where does the music come from?",
  "How do I suggest a song?").
- `public/robots.txt`, `public/sitemap.xml` (single URL; generated from `SITE_URL`).
- **OG image**: `npm run og` screenshots the default Akhra scene at dusk plus the title in Devanagari
  and Latin to `public/og.png` (1200×630) using local headless Chrome, so it matches the live CSS
  exactly. It is committed rather than rebuilt on Vercel (no Chrome there); re-run after scene changes. Tags: `og:*` + `twitter:card=summary_large_image`. WhatsApp needs < 300 KB, so it's
  tested for that size.
- **Footer**: "Made with love from Jharkhand" (+ Nagpuri line), artist channel links (from
  `artists.json`), link to `/credits` (rendered from CREDITS.md at build), "Suggest a song" →
  `https://github.com/vinitshahdeo/mandar.fm/issues/new?template=suggest-a-song.yml` with fields for
  title, artist, YouTube link, world, why.
- **README**: run, build, verify, test, deploy-to-Vercel, how to fill playlists/festivals, plus the
  one-line entry for `chetanraj/awesome-saloon-wtf` under Regional.

### Performance budget (to hit Lighthouse mobile ≥ 90)
- JS ≤ 35 KB gzip initial (no YouTube until tap); CSS ≤ 10 KB; scene SVG inline ≤ 40 KB for the
  default world; other worlds' SVGs lazy-loaded on idle.
- Fonts: none downloaded (system fonts).
- No layout shift: overlay and radio panel have fixed dimensions.

---

## 11. Decisions (answered 2026-10-19)

1. **Player stays hidden** behind the scene, as briefed. The iframe is 200×200 px, kept in the layout
   (not `display:none`, which stops playback) and placed under the scene with `z-index` and
   `pointer-events:none`. Risk accepted: YouTube's embed policies require a visible player.
2. **Name: mandar.fm.** Production URL: `https://mandar.fm.vercel.app`. "Akhra" stays as the name of the
   default world.
3. **Repo:** `vinitshahdeo/mandar.fm` (used for "Suggest a song").
4. **Festival:** only first-time visitors are auto-switched to Parab; returning visitors see the glow + banner.
5. **Festival dates:** `festivals.json` ships empty; you fill it in each year.
6. **Ambience:** all synthesised in v1; CC0 recordings may replace layers later.
7. **Keys:** as specified in §7.4 (←/→ tracks, ↑/↓ volume, 1–4 worlds).

---

## 12. Acceptance criteria

Build and data
- [ ] `npm run build` runs `verify-playlists`, typecheck, tests, then `vite build`; fails on DEAD,
      MISMATCH, NETWORK, malformed/duplicate IDs, or (unless `ALLOW_EMPTY_WORLDS=1`) a world with no
      playable tracks.
- [ ] No YouTube ID or channel URL in the repo was written by me; all seed entries are empty placeholders.
- [ ] `npm test` passes; covers `getDayPhase` at every boundary (04:59, 05:00, 10:59, 11:00, 15:59,
      16:00, 18:59, 19:00, 23:59, 00:00), `getActiveFestival` (lead/trail edges, overlap, year
      rollover, empty config) with a mocked clock via `vi.setSystemTime`, shuffle-bag no-repeat
      invariants, storage wrapper when `localStorage` throws, and the i18n `// VERIFY` marker check.

Behaviour
- [ ] First load shows the illustrated scene with no JS errors even if `youtube.com` is blocked.
- [ ] Nothing plays before the first tap; first tap starts ambience immediately and music within a few seconds.
- [ ] All four worlds switch via dial, click, and keys 1–4, with scene + ambience crossfades.
- [ ] Shuffle never repeats a track within a session until the world's bag is exhausted.
- [ ] A dead/embed-blocked ID is skipped silently within 12 s at most.
- [ ] Scene palette matches local time; `?phase=` and `?date=` overrides work.
- [ ] During a configured festival window, Parab glows and shows the banner.
- [ ] Last world, volume and ambience on/off survive a reload; site works with storage disabled.
- [ ] Lock-screen / headset shows title + artist and play/pause/next work (where the browser allows).
- [ ] No horizontal scroll at 360 px; all controls reachable by keyboard and screen reader.
- [ ] `prefers-reduced-motion` disables animation.

Launch
- [ ] Lighthouse mobile ≥ 90 on all four categories (measured on the Vercel preview).
- [ ] OG image 1200×630, < 300 KB, previews correctly in X card validator / WhatsApp.
- [ ] robots.txt, sitemap.xml, JSON-LD FAQ validate.
- [ ] CREDITS.md lists every sound (recorded or synthesised); `/credits` page renders it.
- [ ] README has run/build/verify/deploy steps and the awesome-saloon-wtf one-liner.

---

## 13. Build plan (small commits, after your review)

1. Scaffold: Vite + TS + Vitest, lint/format, `storage.ts`, empty data files, README skeleton.
2. `dayPhase` + `festival` + tests (mocked clock).
3. `queue` shuffle-bag + tests.
4. `verify-playlists.ts` + seeded placeholder `playlists.json` / `artists.json`.
5. i18n file + VERIFY-marker test.
6. Akhra scene SVG (layered) + phase palettes + animations + reduced motion.
7. Radio UI (dial, now-playing, controls) + overlay + keyboard.
8. YouTube player wrapper + error skipping + watchdog + Media Session.
9. Ambience engine + synth layers per world/phase.
10. Trekker, Biha, Parab scenes; festival props + banner.
11. Footer, credits page, issue template.
12. SEO, JSON-LD, sitemap/robots, OG render script.
13. Lighthouse pass and perf fixes; README final + awesome-list line.
