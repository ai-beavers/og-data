# Physical World Data Collection App — PRD & Progress Tracker

This file is the product source of truth **and** the progress tracker. When work ships, changes scope, or gets cut, update the relevant deliverable here in the same change.

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done

---

## Product Context

### Summary

A mobile app that turns real-world data collection into a simple, game-like activity. Contributors use idle moments (waiting at a bus stop, walking a neighborhood) to capture physical objects and environments. The collected data is packaged for companies building physical AI, robotics, simulation, and spatial-understanding systems.

Two sides: **contributors** who collect data, and **data buyers** who need structured, high-quality physical-world data at scale.

### Problem

Physical AI and robotics companies need large amounts of real-world object and environment data, but the physical world is fragmented, constantly changing, and expensive to capture with centralized teams. Meanwhile, millions of people with capable phones have idle windows where they could capture useful data — but no simple, motivating, trusted way to do it and get rewarded. The core problem is connecting real-world data demand with distributed human contributors in a way that is easy for contributors and useful for buyers.

### Audiences

- **Contributors:** everyday people with smartphones earning small, compounding rewards. No technical knowledge required. Lightweight enough for idle time, engaging enough to return to.
- **Data buyers:** robotics/physical-AI companies, AI model teams, simulation/mapping/digital-twin companies, and research or ops teams that need targeted real-world capture without a centralized field team.

### Core Loop (keep visible in all feature work)

Capture anything → submit → receive feedback → earn.

Contributors are never gated on a task list: the camera is the home screen and anything can be captured. The app classifies what was captured (AI vision on photos + location metadata) — contributors type nothing. Suggested tasks (operator-defined opportunities) remain as optional boosters with defined reward ranges, not the entry point.

### Non-Decisions (intentionally open)

- Final downstream data format is not prescribed: raw media, annotated media, reconstructed assets, metadata-rich records, or another buyer-agreed output.
- AI auto-categorization of captures is in scope (see M8). Other speculative AI/3D pipeline work still requires a task or PRD change that explicitly calls for it.

---

## MVP

Goal: a contributor can onboard, open the camera, capture anything (with optional suggested tasks for bonus rewards), submit, get reviewed, see feedback, and watch earnings accrue. Buyer-side complexity stays internal (operator tools only).

### M1 — App Foundation

- [x] Expo React Native scaffold with feature-oriented project structure
- [x] Navigation shell (thin routing; product logic in feature modules)
- [x] Shared design tokens, UI primitives, and base theme
- [x] API client, storage adapters, and shared types in predictable locations
- [x] Test/mocks/fixtures structure set up as first-class

### M2 — Contributor Onboarding

- [x] Explain what the app does, what can be captured, and how rewards work
- [x] Capture-behavior guidelines (what's allowed, what's not)
- [x] Frame the task simply: find something nearby, capture it well, submit, earn

### M3 — Suggested Tasks (demoted from primary entry point — see M8)

- [x] Opportunity list driven by location and/or general collection goals
- [x] Each opportunity states clearly what to capture and the expected reward range
- [x] Seeded/operator-defined opportunities (no buyer self-serve yet)
- [x] Demoted to an optional "Tasks" tab; free capture (M8) is the home screen

### M4 — Guided Capture Flow

- [x] Camera capture with step-by-step instructions (move around object, multiple angles, close-ups; optional short video deferred — see log)
- [x] Guidance written for non-technical contributors; no exposure of downstream format
- [x] Local capture review before submission

### M5 — Submission

- [x] Submit captured media with basic context: category, location, time, task prompts
- [x] Submission states: pending review, accepted, needs retry, rejected
- [x] Submission history visible to the contributor

### M6 — Review & Quality Feedback

- [x] Internal review queue for approving/rejecting submissions (operator-facing, minimal)
- [x] Plain-language rejection reasons: missing angles, blurry, poor lighting, duplicate, unsupported subject
- [x] Retry flow from a needs-retry state

### M7 — Rewards & Earnings

- [x] Reward assigned per accepted submission (can vary by complexity, demand, quality)
- [x] Earnings screen: accumulated total, per-submission rewards, pending rewards
- [x] Payout status display (actual payout rails are Post-MVP)

### M8 — Free Capture (capture-first pivot)

- [ ] Camera is the home tab: open, shoot one or more angles, review, submit — no task required
- [ ] AI auto-categorization on submit: vision model classifies category + subject label from photos and location metadata; contributor types nothing
- [ ] Graceful AI fallback: submission never blocks on classification (timeout → `uncategorized`, reviewer sees raw capture)
- [ ] Submissions work without an `opportunityId`; suggested tasks still attach one
- [ ] Suggested tasks list loads instantly without location (no geolocation blocking — web fix)

---

## Parallel Workstream Split (two machines) — RETIRED

Phase 1 completed 2026-06-11; both sides merged to main. The capture-first pivot (M8) crosses the old folder boundary, so the split below is retired and kept for history. Shared contract changes remain small, isolated commits.

The MVP is split along the **submit boundary**: Machine A owns everything before a submission exists; Machine B owns everything after. The shared contract between them is the submission payload and its states.

### Phase 0 — Machine A only (blocking, keep it short)

M1 in full, pushed to main before parallel work starts. Most important output: **shared contracts** in `shared/` — types for `Opportunity`, `Submission`, `SubmissionStatus` (`pending_review | accepted | needs_retry | rejected`), `Reward`, and the mock API client surface. Once committed, these are frozen except via coordinated changes.

### Phase 1 — Parallel

| | Machine A — Capture side | Machine B — Post-submit side |
| --- | --- | --- |
| Deliverables | M2 Onboarding, M3 Opportunities, M4 Guided Capture | M5 Submission, M6 Review & Feedback, M7 Rewards |
| Owns | `features/onboarding`, `features/opportunities`, `features/capture` | `features/submissions`, `features/review`, `features/rewards` |
| Works against | Seeded opportunity fixtures | Fixture submissions (never waits on Machine A) |

### Rules of engagement

- Neither machine edits the other's feature folders.
- Changes to `shared/` types or the API contract are small, separate commits, coordinated before merging.
- Rebase on main at least daily.
- Done when the full loop works end to end: capture → submit → review → feedback → reward.

---

## Post-MVP

Goal: deepen contributor retention, open the buyer side, and turn accepted data into sellable datasets.

### P1 — Game-Like Motivation

- [ ] Progress, streaks, and challenges
- [ ] Collection goals, levels, and badges
- [ ] Leaderboards and location-based discovery
- [ ] Keep the game layer motivating without making capture feel like technical work

### P2 — Data Request Campaigns

- [ ] Buyers/operators define needed data: categories, environments, geographies, capture depth, quality expectations, reward ranges
- [ ] Campaigns automatically become contributor-facing opportunities
- [ ] Campaign progress visibility for the requester

### P3 — Dataset Packaging

- [ ] Organize accepted submissions into buyer-ready datasets
- [ ] Preserve captured media plus context needed to evaluate, filter, and use the data
- [ ] Support flexible output formats per buyer agreement (format intentionally not prescribed)

### P4 — Scaled Review & Trust

- [ ] Abuse prevention and duplicate/fraud detection
- [ ] Quality scoring to assist or partially automate review
- [ ] Reviewer tooling improvements for higher volume

### P5 — Real Payouts

- [ ] Payout rails integration (provider TBD)
- [ ] Payout request flow and history
- [ ] Compliance/threshold handling

---

## Progress Log

Add brief dated entries when a deliverable changes status or scope.

| Date | Deliverable | Change |
| --- | --- | --- |
| 2026-06-11 | — | PRD restructured into staged deliverables with MVP / Post-MVP split |
| 2026-06-11 | — | Added two-machine parallel workstream split (capture side vs post-submit side) |
| 2026-06-11 | M1 | Phase 0 complete: Expo SDK 56 scaffold, feature structure, shared contracts (types + mock API + storage), design tokens/UI primitives, nav shell with placeholder routes, jest-expo with contract tests. Parallel work unblocked |
| 2026-06-11 | M2 | Done (Machine A): 3-step onboarding (what/rules/loop), persisted seen-flag via shared storage, entry redirect skips onboarding on revisit |
| 2026-06-11 | M3 | Done (Machine A): location-sorted opportunity list (expo-location, graceful fallback when denied), cards show task + reward range + distance, tap enters capture flow |
| 2026-06-11 | M4 | Done (Machine A): guided flow briefing → per-prompt camera steps (expo-camera) → local review with retakes → submit via shared `createSubmission` contract, then lands on submission history. Scope note: optional short-video capture deferred; contract already supports `kind: 'video'` |
| 2026-06-11 | M5–M7 | Done (Machine B): submission history with status/feedback/retry entry, operator review queue (accept with reward presets, retry/reject with plain-language reasons + optional note), earnings screen (total, pending, reward history, payout-soon notice). All mock-backed with focus refresh. With M4's submit wiring on main, the full loop runs end to end |
| 2026-06-11 | M8 | Capture-first pivot: core loop changed to "capture anything → submit → review → earn". Opportunities demoted to optional suggested tasks; AI auto-categorization (OpenAI vision) added in scope; two-machine split retired |
