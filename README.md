# Kurcaf — Learn Latvian

Personal Latvian language learning app built with Next.js. A work in progress, not yet published.

> **Course content is not included.** The vocabulary, audio and images come from a third-party course and are proprietary; they are not distributed with this repository and are excluded via `.gitignore`. The code here is only the app.

## Features

- **50 units × 4 lessons** of Latvian vocabulary and sentences
- **5 exercise modes** per lesson: Flashcard, Listen, Multiple Choice, Fill-in-blank, Dialogue
- **Weak items review** — automatically surfaces items with low accuracy
- Progress tracked locally in `localStorage` (no account needed)
- Mobile-first, card-based UI

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Provide course data locally

The app expects the course data in these (gitignored) locations:

```
src/data/lv_Latvian.json   ← course structure and items
public/audio/              ← *.mp3 files named by item ID
public/images/             ← *.png files named by item ID
```

Without them the app has nothing to show. Never commit these files.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

```
src/
  app/
    page.tsx                          # Home: unit grid
    unit/[unit]/page.tsx              # Unit overview: 4 lessons
    lesson/[unit]/[lesson]/
      flashcard/page.tsx              # Flashcard mode
      listen/page.tsx                 # Listening mode
      choice/page.tsx                 # Multiple choice
      fill/page.tsx                   # Fill-in-blank
      dialogue/page.tsx               # Dialogue replay
    review/page.tsx                   # Weak items review
  components/
    AudioButton.tsx
    ItemImage.tsx
    ProgressRing.tsx
    ExerciseShell.tsx
  lib/
    types.ts                          # TypeScript interfaces
    data.ts                           # JSON normalisation
    progress.ts                       # localStorage helpers
  data/                               # gitignored — add lv_Latvian.json here
public/
  audio/                              # gitignored — add *.mp3 here
  images/                             # gitignored — add *.png here
```
