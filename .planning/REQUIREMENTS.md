# Requirements: GuardManager — UI/UX Redesign v2

**Defined:** 2026-02-19  
**Milestone:** v2.0 UI/UX Redesign  
**Core Value:** A premium claymorphism UI that faithfully reflects Stitch designs while following React Native best practices.

---

## v2 Requirements

Each screen is redesigned using the Stitch HTML/CSS export as visual reference, converted to idiomatic React Native.

### Auth Flow

- [ ] **AUTH-UI-01**: SplashScreen matches Stitch design (logo, animation, brand colors)
- [ ] **AUTH-UI-02**: WelcomeScreen matches Stitch design (hero, CTA buttons, layout)
- [ ] **AUTH-UI-03**: SignupScreen matches Stitch design (form layout, inputs, validation states)
- [ ] **AUTH-UI-04**: VerificationScreen matches Stitch design (OTP input, resend, states)
- [ ] **AUTH-UI-05**: ProfileSetupScreen matches Stitch design (form, avatar, fields)

### Home Tab

- [ ] **HOME-UI-01**: AttendanceScreen matches Stitch design (header, guard cards, date picker, mark attendance)
- [ ] **HOME-UI-02**: AttendanceReviewScreen matches Stitch design (summary cards, list, filters)
- [ ] **HOME-UI-03**: NotificationsScreen matches Stitch design (notification cards, empty state)
- [ ] **HOME-UI-04**: SettingsScreen matches Stitch design (sections, toggles, theme switcher)

### Payroll Tab

- [ ] **PAY-UI-01**: AdvancesScreen matches Stitch design (form, guard picker, amount input)
- [ ] **PAY-UI-02**: AdvancesListScreen matches Stitch design (advance cards, status badges, filters)

### Guards Tab

- [ ] **GUARD-UI-01**: GuardsListScreen matches Stitch design (guard cards, search, add button)
- [ ] **GUARD-UI-02**: AddGuardScreen matches Stitch design (multi-section form, photo upload area)

### Sites Tab

- [ ] **SITE-UI-01**: SitesListScreen matches Stitch design (site cards, search, add button)
- [ ] **SITE-UI-02**: AddSiteScreen matches Stitch design (form layout, fields, map placeholder)

### Reports Tab

- [ ] **RPT-UI-01**: ReportsScreen matches Stitch design (report type selector, date range, filters)
- [ ] **RPT-UI-02**: ReportResultsScreen matches Stitch design (results table/cards, export button)

### Design System

- [ ] **DS-01**: Claymorphism design tokens defined (shadows, radii, fills, elevation)
- [ ] **DS-02**: Shared component library updated (cards, buttons, inputs, badges)
- [ ] **DS-03**: Typography scale applied consistently across all screens
- [ ] **DS-04**: Dark mode variants correct for all redesigned screens
- [ ] **DS-05**: Bottom tab bar redesigned to match Stitch navigation design

---

## Out of Scope

| Feature | Reason |
|---|---|
| New Firebase features | This milestone is UI-only; backend logic unchanged |
| New screens | Only redesigning existing screens |
| Navigation restructure | Tab structure stays the same |
| Performance optimization | Separate milestone |

---

## Traceability

| Requirement | Phase | Status |
|---|---|---|
| DS-01, DS-02, DS-03, DS-04, DS-05 | Phase 1: Design System | Pending |
| AUTH-UI-01..05 | Phase 2: Auth Flow | Pending |
| HOME-UI-01..04 | Phase 3: Home Tab | Pending |
| PAY-UI-01..02 | Phase 4: Payroll Tab | Pending |
| GUARD-UI-01..02 | Phase 5: Guards Tab | Pending |
| SITE-UI-01..02 | Phase 6: Sites Tab | Pending |
| RPT-UI-01..02 | Phase 7: Reports Tab | Pending |

**Coverage:**
- v2 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-19*
