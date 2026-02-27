# PaperPress Home Page Redesign

## What Was Built
8 files — replace them in your project exactly as shown.

## File Placement

| File | Replace At |
|------|-----------|
| `src/app/(main)/home/page.tsx` | `src/app/(main)/home/page.tsx` |
| `src/components/home/HomeHeader.tsx` | `src/components/home/HomeHeader.tsx` |
| `src/components/home/GreetingHero.tsx` | `src/components/home/GreetingHero.tsx` |
| `src/components/home/PrimaryActionCard.tsx` | `src/components/home/PrimaryActionCard.tsx` |
| `src/components/home/StatsRow.tsx` | `src/components/home/StatsRow.tsx` |
| `src/components/home/LastPaperCard.tsx` | `src/components/home/LastPaperCard.tsx` |
| `src/components/home/QuickStartRow.tsx` | `src/components/home/QuickStartRow.tsx` |
| `src/components/home/UsageBar.tsx` | `src/components/home/UsageBar.tsx` |

## Also Add to src/components/home/index.ts

Add these lines at the bottom:

```ts
export { GreetingHero } from "./GreetingHero";
export { PrimaryActionCard } from "./PrimaryActionCard";
export { StatsRow } from "./StatsRow";
export { LastPaperCard } from "./LastPaperCard";
export { QuickStartRow } from "./QuickStartRow";
export { UsageBar } from "./UsageBar";
```

## What Each Component Does

- **HomeHeader** — Fixed top bar with PaperPress logo left, user avatar (first letter) right that goes to Settings
- **GreetingHero** — "Good Morning, Muneeb" with time-aware greeting + institute name below
- **PrimaryActionCard** — The main card with blue left border, "Create Exam Paper" heading, "Start Creating →" button
- **StatsRow** — Three pill chips: papers count, free papers left, today's date
- **LastPaperCard** — Most recent paper with subject, class, date, marks + "Open" pill button. Shows empty state with "Create First Paper" if no papers exist
- **QuickStartRow** — Horizontal scrollable row of 6 subject chips (Physics, Chemistry, Biology, Math, Computer, English) — tapping navigates directly to subjects page
- **UsageBar** — Free papers progress bar, turns red when only 5 left, hidden for premium users
