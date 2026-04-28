# Product Requirements Document — Time Zone Converter

## Overview

A zero-login, browser-based time zone converter that lets users compare multiple time zones side-by-side, find suitable meeting times via an interactive slider, and share or export events.

**Stack:** TypeScript · UI5 Web Components · Temporal API (`temporal-polyfill`) · Vite · Vitest

---

## Goals

- Instant, no-signup access to time zone comparison.
- Support global coordination by visualizing up to ~10 time zones simultaneously.
- Enable meeting planning through an interactive time slider and calendar export.
- Shareable state via URL (no backend required).

---

## Non-Goals

- User accounts or persistent server-side storage.
- Native mobile apps (responsive web is sufficient).
- Paid features or paywalls.

---

## User Stories

See [user-stories.md](user-stories.md) for the full list of user stories and acceptance criteria.

---

## Technical Notes

| Concern | Decision |
|---|---|
| Time handling | `temporal-polyfill` (Temporal API); all instants stored as `Temporal.ZonedDateTime` |
| State persistence | URL hash (JSON, `encodeURIComponent`); no server, no localStorage |
| UI components | UI5 Web Components v2 (SAP Fiori design language) |
| Package manager | pnpm |
| Build | Vite 8 / TypeScript 6 |
| Testing | Vitest 4 with Playwright browser provider; screenshot regression tests |
| Linting / Formatting | oxlint + oxfmt |
| Real-time update | `setInterval` at 100 ms; full re-render only on hour change |
| Architecture | Frontend-only; no backend or database dependencies |

### Project Structure

```
index.html          Entry HTML
src/main.ts         Application entry point (all logic lives here)
src/                All source code
vite.config.ts      Vite + Vitest configuration
tsconfig.json       TypeScript configuration
```

### Development Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start local development server |
| `pnpm build` | Production build (`tsc && vite build`) |
| `pnpm test` | Run Vitest browser tests |
| `pnpm run lint` | Lint with oxlint + check formatting with oxfmt |
| `pnpm run format` | Format codebase with oxfmt |

### Coding Guidelines

- Use UI5 Web Components for all UI elements; avoid third-party UI libraries.
- All new features must be covered by Vitest tests.
- Run `pnpm run lint` and `pnpm run format` before submitting changes.
- No backend or database dependencies may be introduced.

---

## Out of Scope (Future Consideration)

- Drag-and-drop reordering (currently arrow buttons).
- iCal / Outlook calendar export.
- Dark mode / theme switching.
- Saved presets / favorite zone sets.
- Duration picker UI (currently fixed at 60 min default).
