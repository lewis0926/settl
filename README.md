# Settl

A no-signup, no-backend bill splitter that runs entirely in the browser.

**Live:** [settl.lewisshum.com](https://settl.lewisshum.com)

## Features

- **3-step flow**: add people with split ratios → log expenses → view the minimal set of transfers to settle up
- **Weighted splits**: each person can have a custom ratio (e.g. 2× for someone who eats more); defaults to equal
- **Multi-currency**: toggle on to enter expenses in USD, CAD, HKD or JPY; settlement converts everything to your chosen display currency using daily ECB rates
- **Minimal transfers**: greedy algorithm produces the fewest possible "X pays Y $Z" steps
- **Persistent**: all data saved to `localStorage`
- **Offline-ready**: no backend, no auth, no signup, works without a network connection (rates fetch on first multi-currency use only)

## Tech stack

- [Vite](https://vitejs.dev) + [React](https://react.dev) + TypeScript
- [Bun](https://bun.sh) for package management and builds
- Nginx (Alpine) for serving in production
- Exchange rates from [@fawazahmed0/currency-api](https://github.com/fawazahmed0/exchange-api) via jsDelivr CDN

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build      # type-check + vite build → dist/
bun run preview    # preview the production build locally
```

## Docker

```bash
docker build -t settl .
docker run -p 8080:80 settl
```
