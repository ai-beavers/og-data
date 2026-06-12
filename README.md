# OG Data

Mobile app for distributed physical-world data collection. Contributors capture everyday objects and environments; the data is packaged for physical-AI, robotics, and simulation buyers.

**Product source of truth:** [`README_PRD.md`](./README_PRD.md) — includes the MVP plan and the two-machine parallel workstream split.

## Stack

Expo SDK 56 · React Native · TypeScript · expo-router · jest-expo

## Get started

```bash
npm install
npm start          # then press i / a / w for iOS / Android / web
```

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # expo lint
npm test           # jest
```

## Structure

```
src/
  app/        # expo-router routes — thin, delegate to features
  features/   # one folder per product domain (see ownership below)
  shared/     # types (domain contracts), api client, storage, ui tokens/primitives
  testing/    # fixtures shared by app seeding and tests
```

Workstream ownership (see PRD for rules of engagement):

- **Machine A — capture side:** `features/onboarding`, `features/opportunities`, `features/capture`
- **Machine B — post-submit side:** `features/submissions`, `features/review`, `features/rewards`
- **Shared seam:** `src/shared/types` + `src/shared/api/client.ts` — coordinated changes only
