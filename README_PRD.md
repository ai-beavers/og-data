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

Discover opportunity → capture well → submit → receive feedback → earn.

### Non-Decisions (intentionally open)

- Final downstream data format is not prescribed: raw media, annotated media, reconstructed assets, metadata-rich records, or another buyer-agreed output.
- No speculative AI/3D pipeline work unless a task or PRD change explicitly calls for it.

---

## MVP

Goal: a contributor can onboard, find a nearby task, capture it with guidance, submit, get reviewed, see feedback, and watch earnings accrue. Buyer-side complexity stays internal (operator tools only).

### M1 — App Foundation

- [ ] Expo React Native scaffold with feature-oriented project structure
- [ ] Navigation shell (thin routing; product logic in feature modules)
- [ ] Shared design tokens, UI primitives, and base theme
- [ ] API client, storage adapters, and shared types in predictable locations
- [ ] Test/mocks/fixtures structure set up as first-class

### M2 — Contributor Onboarding

- [ ] Explain what the app does, what can be captured, and how rewards work
- [ ] Capture-behavior guidelines (what's allowed, what's not)
- [ ] Frame the task simply: find something nearby, capture it well, submit, earn

### M3 — Nearby Capture Opportunities

- [ ] Opportunity list driven by location and/or general collection goals
- [ ] Each opportunity states clearly what to capture and the expected reward range
- [ ] Seeded/operator-defined opportunities (no buyer self-serve yet)

### M4 — Guided Capture Flow

- [ ] Camera capture with step-by-step instructions (move around object, multiple angles, close-ups, optional short video)
- [ ] Guidance written for non-technical contributors; no exposure of downstream format
- [ ] Local capture review before submission

### M5 — Submission

- [ ] Submit captured media with basic context: category, location, time, task prompts
- [ ] Submission states: pending review, accepted, needs retry, rejected
- [ ] Submission history visible to the contributor

### M6 — Review & Quality Feedback

- [ ] Internal review queue for approving/rejecting submissions (operator-facing, minimal)
- [ ] Plain-language rejection reasons: missing angles, blurry, poor lighting, duplicate, unsupported subject
- [ ] Retry flow from a needs-retry state

### M7 — Rewards & Earnings

- [ ] Reward assigned per accepted submission (can vary by complexity, demand, quality)
- [ ] Earnings screen: accumulated total, per-submission rewards, pending rewards
- [ ] Payout status display (actual payout rails are Post-MVP)

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
