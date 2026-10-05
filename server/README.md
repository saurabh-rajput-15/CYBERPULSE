# CyberPulse — Standalone Scraper Server

A dedicated Express server (port **3001**) that handles all threat intelligence scraping independently from the main app server.

## Why separate?

Scraping is I/O-heavy, slow, and can block. Running it on its own process keeps the main FAIR engine and UI completely responsive.

## Setup

```bash
cd server
npm install
npm run dev      # development (auto-reload on save)
npm start        # production
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check + schedule state |
| GET | `/sources` | All configured sources with live status |
| PATCH | `/sources/:id` | Enable/disable a source `{ enabled: bool }` |
| GET | `/items` | Scraped items (supports `?source=&severity=&scenario=&search=&limit=&offset=`) |
| DELETE | `/items/:id` | Remove one item |
| DELETE | `/items` | Clear all items (resets to seed data) |
| POST | `/scrape/all` | Trigger all enabled sources immediately |
| POST | `/scrape/source/:id` | Trigger one specific source |
| POST | `/scrape/custom` | Scrape an arbitrary URL `{ url, targetScenarioId? }` |
| POST | `/schedule/set` | Set auto-schedule `{ cadence: "off"|"30s"|"1m"|"5m"|"15m"|"1h" }` |
| GET | `/schedule/status` | Current schedule state + next run time |
| GET | `/logs` | Recent scrape logs `?n=100` |

## Supported Sources

| ID | Name | Type |
|----|------|------|
| `cisa-kev` | CISA KEV Catalog | Live JSON API |
| `threatfox-abuse` | ThreatFox / Abuse.ch | REST API |
| `github-ghsa` | GitHub GHSA | REST API |
| `nvd-nist` | NIST NVD | RSS XML |
| `cert-in` | CERT-In India | Web Scrape |
| `custom-url` | Any URL | On-demand |

## How the client connects

The Vite dev server proxies `/scraper-api/*` → `http://localhost:3001/*`.

So `fetch('/scraper-api/items')` in the browser hits the scraper server transparently.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SCRAPER_PORT` | `3001` | Port to bind on |
