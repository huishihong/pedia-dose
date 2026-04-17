# PediaDose — Product Requirements Document
**Version:** 4.0  
**Date:** April 2026  
**Status:** Phases 0–3 substantially complete. Phase 4 (offline PWA + polish) next.

---

## What this document is

This is the single source of truth for building PediaDose — a responsive web app
that helps frontline clinicians look up paediatric drug doses quickly and safely
at the point of care.

The app supports four types of lookup:
- **Weight-based calculation** — enter a child's weight, get mg dose and mL volume
- **Age-banded / weight-banded reference** — drugs dosed by age group, weight
  range, or a combination; weight input may or may not be required
- **Fixed-dose / topical reference** — instruction-based drugs with no calculation
- **Condition-based protocol** — multi-drug treatment pathways by severity tier

Not all drugs require weight input. Clinicians naturally search by drug name
regardless of whether the drug is weight-based, and expect a useful clinical
answer in all cases.

Hand this document to Claude Code at the start of each new phase.

---

## Project overview

**Problem:** Clinicians seeing paediatric patients currently face two friction
points at the point of care:

1. Drug dose calculations (mg/kg) are done using an Excel spreadsheet that is
   slow, error-prone, and fails when IT systems go down.
2. Non-weight-based drugs (topical agents, age-banded medicines, fixed-dose
   instructions) require flipping through multiple PDF guidelines — there is no
   single fast reference.

**Solution:** A responsive Progressive Web App (PWA) accessible by URL or QR
code. No download required. Works offline. Compatible with both desktop and
mobile browsers. Clinicians can search by drug name or condition, enter the
patient's weight where relevant, and get a clear dosing answer in under
10 seconds.

**Primary users:** Doctors and nurses in paediatric and general settings in
Singapore — including junior doctors, medical officers, and nurses who need a
fast, trustworthy reference at the bedside.

**Key insight from clinician testing:** Users interact with the app as a drug
dose guide, not only a dose calculator. They search for drugs by name —
including non-weight-based agents like topical creams, nasal sprays, and
eye drops — and expect the app to return a useful clinical answer regardless
of whether weight is required. The patient-centred approach (results always
contextualised to the patient's age or weight) is highly valued.

**Primary devices:** Mobile phone (iOS and Android) and desktop browser  
**Access method:** Shared URL link or QR code on ward whiteboards

---

## Core data sources

All clinical content is derived from authoritative sources. Do not invent or
estimate any dose values.

1. **KKH CE Clinical Guidelines, January 2026 edition** — condition → drug →
   severity pathways; inpatient and emergency protocols
2. **NHG Pharmacy Paediatric Dose Calculator, July 2024 (v2024.07.26)** —
   weight-based dose calculations, formulations, and max doses
3. **PaedsENGAGE Drug Guide, 1st Edition (February 2025)** — primary dosing
   reference for outpatient drugs, age-banded drugs, and topical agents
4. **Paeds_Meds_v2** — additional drug coverage, weight-band tables, and
   pre-calculated mL volumes

Reference PDFs are stored in `docs/references/` for traceability.

---

## Non-goals (never build these)

- No user accounts or login
- No patient data storage — calculations are stateless, nothing is ever saved
- No EHR/EMR integration
- No prescribing or ordering functionality
- Not a replacement for clinical judgment — this is a calculation aid only

---

## Tech stack

- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Offline/PWA:** vite-plugin-pwa with Service Worker
- **Hosting:** Vercel (free tier)
- **Version control:** GitHub

Use only well-maintained, lightweight packages. No backend. All logic runs
client-side.

---

## Design principles

These principles guide all UI decisions. They can be updated at any time —
when updated, flag any existing screens that may need catching up.

- **Speed over aesthetics** — every interaction should feel instant
- **Clarity over density** — show the dose result in the largest possible text
- **Responsive** — designed to work well on both mobile (390px) and desktop;
  mobile layout is the baseline, desktop scales gracefully
- **Error prevention** — Calculate button disabled until a valid weight is entered
- **Clean and clinical** — white/light grey palette, clear typographic hierarchy;
  must feel trustworthy
- **Accessibility** — minimum 16px font for body text, AAA contrast for dose results
- **One hand usable on mobile** — large tap targets, no fiddly interactions

---

## Dosing modes

The correct mode is determined automatically from the drug's data entry — the
clinician never has to select a mode.

### 1. Weight-based calculation
Used when a drug is dosed in mg/kg. The clinician enters the patient's weight;
the app calculates the mg dose (capped at max dose where applicable) and converts
to mL using the default formulation concentration. Shows frequency, route, and a
dosing note where relevant.

*Examples: amoxicillin, ibuprofen, erythromycin, prednisolone*

### 2. Age-banded / weight-banded reference
Used when the correct dose is determined by age group, a weight range, or a
combination of both rather than a simple mg/kg calculation. Some drugs show a
flat dose per age group (e.g. montelukast: 4 mg if <5y, 5 mg if 6–14y). Others
use weight bands with pre-calculated doses for each range (e.g. oseltamivir).
Weight input may or may not be required depending on the drug.

*Examples: montelukast, fexofenadine, oseltamivir, albendazole, nystatin,
ipratropium bromide*

### 3. Fixed-dose / topical reference
Used for topical agents and fixed-dose drugs where the instruction is the same
regardless of age or weight. No weight input required. Shows an instruction row
with application method, frequency, and clinical notes.

*Examples: chloramphenicol eye drops, mupirocin ointment, calamine lotion,
permethrin, fluticasone nasal spray*

### 4. Condition-based protocol
Used when the clinician searches by condition (e.g. "asthma", "croup"). Shows
severity tiers; clinician selects the appropriate tier; enters weight where
relevant; sees all drugs for that condition and severity with calculated doses,
routes, frequencies, and clinical notes.

*Examples: asthma, anaphylaxis, croup, febrile seizure, UTI*

---

## Phase 0 — Environment setup ✓ COMPLETE

GitHub, Vercel, and Claude Code configured. Project scaffolded and deployed.

---

## Phase 1 — MVP: single drug calculator ✓ COMPLETE

Paracetamol calculator with weight input, dose output, max dose cap, and
non-dismissible disclaimer. Deployed to Vercel.

---

## Phase 2 — Unified search ✓ COMPLETE

Single search bar handles drug-first and condition-first lookup. Drug library
expanded from 1 to 29 drugs. Conditions mapped with severity tiers and clinical
notes. Browse tabs added to home screen (Conditions A–Z and Drugs A–Z).

---

## Phase 3 — Drug coverage + safety layer ✓ SUBSTANTIALLY COMPLETE

### Safety features implemented
- Red warning when weight-based dose is capped at the maximum
- Hospital-only flag for IV/IM drugs requiring inpatient setting
- Dosing notes (amber card) for drugs with important clinical context
- Cautions (red card) for drugs with safety warnings (e.g. QT prolongation)
- Dengue and bronchiolitis clinical flags in condition views

### Drug coverage
Library expanded to **56 drugs** across all major paediatric categories.
All four dosing modes implemented. All drugs sourced from the four reference
sources listed above.

**Categories covered:**
- Analgesics / Antipyretics
- Antibiotics — Oral and Topical (including eye drops)
- Antivirals and Antiparasitics
- Antihistamines — 1st and 2nd generation
- Respiratory (bronchodilators, corticosteroids, mucolytics, leukotriene
  receptor antagonists)
- Corticosteroids — Oral and IV
- Gastrointestinal
- Antifungals — Oral and Topical
- Antipruritic / Topical
- Intranasal agents
- Sedation / Anticonvulsants

Full drug list maintained in `src/data/drugs.json`.

### Remaining Phase 3 items
- Age/weight-based minimum threshold warnings (e.g. ibuprofen contraindicated
  under 5 kg or 6 months)
- Amber warning for doses in the upper therapeutic range

---

## Phase 4 — Offline PWA and polish

**Goal:** Make the app feel native, work with no internet connection, and be
easy to distribute on wards.

### Features
- PWA manifest: app name "PediaDose", installs to home screen with icon
- Full offline support via Service Worker (all data cached on first load)
- "Add to home screen" prompt on iOS Safari and Android Chrome
- Shareable dose summary: formatted text block suitable for copying into
  clinical notes or screenshotting
- Dark mode support

### Acceptance criteria
- App works fully with airplane mode enabled after first load
- Install prompt appears on both iOS Safari and Android Chrome
- Dose summary copy text is correctly formatted

---

## Future considerations (not scheduled)

- **Drug allergy alternatives:** Surface allergy-aware alternatives within
  condition views (e.g. "penicillin allergy? use azithromycin instead"). Affects
  almost every antibiotic condition. Deferred until allergy data can be
  comprehensively sourced and the alternative drugs confirmed in-app.
- **IV infusion rate calculations** — out of scope for current version
- **Neonatal dosing** (< 1 month) — requires separate data set and review
- **Renal / hepatic dose adjustments** — too complex for current scope
- **Drug interaction checking** — requires external data source

---

## File structure

```
pedia-dose/
├── docs/
│   └── references/
│       ├── PaedsENGAGE_Drug_Guide_Feb2025.pdf
│       └── Paeds_Meds_v2.pdf
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── WeightInput.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── ConditionView.tsx
│   │   ├── DoseResult.tsx
│   │   └── FormulationSelector.tsx
│   ├── data/
│   │   ├── drugs.json        ← 56 drugs, four dosing modes
│   │   └── conditions.json   ← condition → severity → drug mappings
│   ├── utils/
│   │   ├── doseCalculator.ts
│   │   ├── genericDoseCalculator.ts
│   │   └── search.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

---

## Git and deployment rules

- After each phase is complete and tested locally, commit with a descriptive
  message and push to main.
- Never commit broken or untested code to the main branch.
- After each push, Vercel deploys automatically — verify the live URL before
  starting the next phase.
- If something breaks, roll back with: `git checkout <commit-hash>`

---

## Hard constraints (never violate these)

1. **No patient data** — the app must never store, log, or transmit any patient
   information. Every calculation is stateless and lives only in the browser
   during that session.

2. **No invented clinical data** — every dose value must trace back to one of
   the four listed data sources. If a value is uncertain, add
   `"requiresReview": true` and exclude from calculations until reviewed by
   a clinician.

3. **Disclaimer always visible** — the non-dismissible disclaimer must appear on
   every screen: *"PediaDose is a calculation aid only. Always verify doses
   against current formulary guidelines and apply clinical judgment."*

4. **No auto-updating drug data** — drug and condition data is bundled with the
   app. Updates require editing the JSON files and redeploying. This is
   intentional: no untested data reaches production silently.

5. **Performance** — app must load in under 2 seconds on a standard 4G mobile
   connection. Keep bundle size minimal.

6. **Not for neonates** — the app must not be used for children under 1 month
   old unless neonatal dosing is explicitly marked in the data file.

7. **`requiresClinicalDecision` entries require a visible warning** — any drug
   entry marked `"requiresClinicalDecision": true` must be shown in the UI but
   accompanied by a clear notice: "Dosing for this drug is complex and
   context-dependent. Clinical assessment required — do not use this app as the
   sole guide." The drug name and basic information are visible; no calculated
   dose is shown.

---

*End of PRD — Version 4.0*
