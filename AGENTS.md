# 🤖 AGENTS.md

## Purpose

Guide AI agents (Codex, Claude, etc.) working on this repo.

---

## 🧱 Architecture Rules

1. Frontend-only (NO backend)
2. IndexedDB (Dexie) = source of truth
3. FileSystem handles for videos (DO NOT upload)
4. Domain types must stay pure (no browser APIs)

---

## 📂 Layer Responsibilities

- domain/: pure types
- db/: persistence models (Dexie)
- features/: business logic + UI
- hooks/: reusable logic (e.g. useLiveQuery)
- lib/: browser APIs

---

## 🔄 Data Flow

UI → API layer → Dexie → liveQuery → UI

NO manual state sync.

---

## 🚫 Anti-patterns

- ❌ Duplicating state outside Dexie
- ❌ Storing video blobs
- ❌ Adding global state managers unnecessarily
- ❌ Mixing domain and infrastructure types

---

## ✅ Patterns

- Use liveQuery for all reads
- Keep mutations simple and atomic
- Prefer small, composable hooks

---

## 🎯 Goals

- Fast iteration
- Local-first reliability
- Clean separation of concerns

---

## 📌 Notes for AI

- Always respect architecture layers
- Avoid introducing backend unless explicitly requested
- Prefer incremental changes over rewrites
