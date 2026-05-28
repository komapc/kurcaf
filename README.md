# Kurcaf — Learn Latvian

Personal Latvian language learning app built with Next.js. Data sourced from the Ling/Simya course.

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

### 2. Add course data

Place `lv_Latvian.json` in `src/data/`:

```
src/data/lv_Latvian.json
```

### 3. Add audio and image assets

Extract the Ling asset zip into `public/`:

```
public/audio/   ← *.mp3 files
public/images/  ← *.png files
```

Asset filenames match item IDs from the JSON (e.g. `a3101103.mp3`, `a3101103.png`).

### 4. Run locally

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
