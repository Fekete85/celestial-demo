# celestial-demo

The landing page behind **[celestial.blackit.hu](https://celestial.blackit.hu)** —
the live demo for [`celestial-chart`](https://github.com/Fekete85/celestial-chart).

Static: one HTML page, the library bundle and the star catalogues. No backend,
no database, no state.

## What is in the repo, and what is not

The page, the catalogues and the deployment config are here. **The library is
not** — it is an npm dependency:

```json
"dependencies": { "celestial-chart": "github:Fekete85/celestial-chart" }
```

That makes this demo a genuine consumer of the published package rather than a
copy that can quietly drift from it. `assemble.mjs` copies the built bundle, the
stylesheet and the picker images out of `node_modules/` into `html/`; those
copies are git-ignored.

## Working on it

```bash
npm install        # also builds celestial-chart via its prepare script
npm run serve      # assembles, then serves html/ on http://127.0.0.1:8080/
```

A real HTTP server is needed even to look at the page: the catalogues are loaded
with `fetch`, which the browser refuses on `file://`.

**“My sky now” falls back to a longitude estimate locally.** The button resolves
your time zone against [blackit-tz](https://github.com/Fekete85/blackit-tz) at
`api.blackit.hu/timezone`, whose CORS allow-list contains the deployed origins,
not `127.0.0.1`. The page handles the refusal and says so; run the tz service
locally with `ALLOWED_ORIGINS` set if you want the real path.

## Privacy

**Nothing leaves the page on load.** No fonts, no analytics, no CDN — the only
outbound request happens after the visitor presses “My sky now”, and it goes to
our own time zone service, never a third party.

This is the point the demo is making. Upstream `d3-celestial` shipped the
author's TimeZoneDB key as a default with `settimezone: true`, so every page
embedding it sent visitor coordinates to a third party, unasked. `celestial-chart`
ships no key and takes a `timezoneResolver` instead; this page passes one.

## Deployment

`nginx:1.27-alpine` behind Traefik, public with no auth and a per-IP rate limit —
the same shape as `~/csillag`.

```bash
npm run assemble
tar czf - html nginx.conf docker-compose.yml \
  | ssh "$DEPLOY_HOST" 'cd ~/celestial && tar xzf -'
ssh "$DEPLOY_HOST" 'cd ~/celestial && docker compose up -d'
```

## Licence

MIT for the page itself — see [`LICENSE`](LICENSE).

The star, deep-sky, constellation and Milky Way catalogues under `html/data/`
come from [d3-celestial](https://github.com/ofrohn/d3-celestial) by Olaf Frohn
and are BSD-3-Clause, as is the library.
