# 🕺 Break Trainer

A local-first web application to track, analyze, and improve breakdance movements through video-based training.

---

## 🚀 Overview

Break Trainer is a tool designed to help dancers:

- Organize movements (e.g. windmill, sixstep, flare)
- Track progress over time using real training videos
- Annotate videos with timestamped feedback
- Build a personal, structured training knowledge base

The application is **frontend-only**, storing all data locally in the browser, and accessing videos directly from the user’s file system.

---

## 🧠 Core Concepts

### 1. Movement
A movement represents a breakdance concept or technique.

Examples:
- Sixstep
- Windmill
- Flare
- Pretzel

Each movement acts as a container for:
- Videos
- Technical understanding
- Progress tracking

---

### 2. Video
A video represents a recorded training attempt.

Each video:
- Is linked to a movement
- References a local file (not uploaded)
- Has a creation timestamp

👉 Videos are the bridge between theory and execution.

---

### 3. Annotation
Annotations allow detailed analysis of a video.

Each annotation:
- Is tied to a specific timestamp
- Contains feedback or observation
- Has a type:
  - `note`
  - `issue`
  - `improvement`

Example:
00:03 → "Loss of momentum"
00:07 → "Hips too low"

---

### 4. Session (future extension)
Represents a training session grouping multiple videos.

---

## 🏗️ Architecture

### High-level design

Frontend (React)
   ↓
Dexie (IndexedDB)
   ↓
Local File System (Video Files)

---

## 📦 Tech Stack

- React + TypeScript
- Vite
- Dexie (IndexedDB wrapper)
- File System Access API
- HTML5 Video API

---

## 🧩 Architectural Decisions

### 1. Local-first approach

All data is stored locally:
- No backend
- No cloud storage
- No authentication

Why:
- Fast iteration
- No infrastructure cost
- Full control over video files

---

### 2. IndexedDB via Dexie

Used to store:
- Movements
- Videos (metadata + file handles)
- Annotations

Why:
- Persistent
- Handles large datasets
- Reactive with liveQuery

---

### 3. File System Access API

Videos are not uploaded.

Instead:
- User selects files from disk
- App stores a FileSystemFileHandle
- Videos are loaded on demand

Benefits:
- No storage limits
- Instant access
- No upload latency

---

### 4. Reactive data layer (liveQuery)

All UI is driven by reactive queries:
- No manual refetching
- No global state management needed
- DB is the single source of truth

---

## 🗂️ Project Structure

src/
├── app/
├── db/
├── domain/
├── features/
├── hooks/
├── lib/
└── components/

---

## 🔄 Data Flow

### Adding a video

1. User selects a movement
2. Clicks "Add Video"
3. Picks a local file
4. App stores file handle + metadata

---

### Playing a video

1. Retrieve file handle
2. Request permission if needed
3. Convert to Blob URL
4. Render in <video>

---

### Reactivity

- Dexie liveQuery observes DB
- UI updates automatically
- No manual sync needed

---

## ⚠️ Constraints & Limitations

- Chromium-based browsers required
- Data is local to browser
- Permissions may need re-granting

---

## 🛣️ Roadmap

### Phase 1
- Movements CRUD
- Video linking
- Video playback

### Phase 2
- Timestamped annotations
- Timeline visualization

### Phase 3
- Video comparison
- Movement checklists
- Session tracking

---

## 💡 Vision

Turn the app into a personal coaching system with structured technical analysis and progression tracking.

---

## 🧪 Development

npm install  
npm run dev

---

## 🧭 Philosophy

Train consciously. Measure progress. Refine technique.
