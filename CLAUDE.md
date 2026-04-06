# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start development server (Vite)
- `npm run build` — TypeScript check + production build
- `npm run preview` — Preview production build

No test runner or linter is currently configured.

## Architecture

Break Trainer is a **local-first, frontend-only** web app for tracking breakdance training through video analysis. No backend, no uploads, no auth.

### Layer responsibilities

| Layer | Path | Purpose |
|-------|------|---------|
| Domain | `src/domain/` | Pure TypeScript types — no browser APIs |
| DB | `src/db/` | Dexie (IndexedDB) schema and instance |
| Features | `src/features/` | Business logic (API layer) + UI components |
| Hooks | `src/hooks/` | Reusable React hooks (e.g. `useLiveQuery`) |
| Lib | `src/lib/` | Browser API wrappers (File System Access API) |

### Data flow

```
UI → feature API layer → Dexie → liveQuery → UI
```

All UI reads must go through Dexie's `liveQuery` — no manual state sync. Mutations go through the feature API layer and are automatically reflected in the UI.

### Video handling

Videos are never uploaded or stored as blobs. The app stores a `FileSystemFileHandle` pointing to a file on the user's local disk, then converts it to a Blob URL on demand for playback. Requires permission re-grant across sessions.

### Constraints

- Chromium-based browsers required (File System Access API)
- Data is local to the browser — no cloud sync
- `FileSystemFileHandle` must not be mixed with domain types

## Anti-patterns to avoid

- Duplicating state outside Dexie
- Storing video blobs in IndexedDB
- Adding global state managers (Redux, Zustand, etc.)
- Mixing domain types with infrastructure types (`FileSystemFileHandle`)
- Introducing a backend or server-side logic
