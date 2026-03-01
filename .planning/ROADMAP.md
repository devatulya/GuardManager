# Roadmap: GuardManager

## Milestones

- 📋 **v2.0 UI/UX Redesign** — Phases 1-7 (in progress)

---

## 🚧 v2.0 UI/UX Redesign (In Progress)

**Milestone Goal:** Redesign the entire application UI to a premium claymorphism aesthetic using Stitch HTML/CSS exports as reference, converted to idiomatic React Native.

**Design Approach:**
- Stitch HTML/CSS = visual reference (layout, spacing, hierarchy, component boundaries)
- Convert to clean React Native — ignore web-only CSS
- Claymorphism: soft shadows, rounded cards, pastel fills, depth layers
- Dark mode variants for every screen

---

### Phase 1: Design System Foundation
**Goal**: Establish the claymorphism design token system and shared component library that all screens will use.  
**Depends on**: Nothing  
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05  
**Success Criteria**:
  1. `src/theme/index.js` exports complete claymorphism token set (shadows, radii, fills, colors)
  2. Shared components (Card, Button, Input, Badge, Avatar) built with new tokens
  3. Bottom tab bar redesigned to match Stitch navigation
  4. Dark mode variants correct for all tokens
  5. All existing screens still render without crash (tokens are backwards-compatible)

Plans:
- [ ] 01-01: Theme tokens — claymorphism colors, shadows, radii, typography
- [ ] 01-02: Shared components — Card, Button, TextInput, Badge, Avatar
- [ ] 01-03: MainNavigator tab bar redesign

---

### Phase 2: Auth Flow Redesign
**Goal**: Redesign all authentication and onboarding screens.  
**Depends on**: Phase 1  
**Requirements**: AUTH-UI-01, AUTH-UI-02, AUTH-UI-03, AUTH-UI-04, AUTH-UI-05  
**Success Criteria**:
  1. SplashScreen matches Stitch design
  2. WelcomeScreen matches Stitch design with correct CTAs
  3. SignupScreen form matches Stitch layout with validation states
  4. VerificationScreen OTP input matches Stitch design
  5. ProfileSetupScreen form matches Stitch design

Plans:
- [ ] 02-01: SplashScreen + WelcomeScreen redesign
- [ ] 02-02: SignupScreen + VerificationScreen redesign
- [ ] 02-03: ProfileSetupScreen redesign

---

### Phase 3: Home Tab Redesign
**Goal**: Redesign all screens in the Home tab (attendance, review, notifications, settings).  
**Depends on**: Phase 1  
**Requirements**: HOME-UI-01, HOME-UI-02, HOME-UI-03, HOME-UI-04  
**Success Criteria**:
  1. AttendanceScreen matches Stitch design (guard cards, date picker, mark attendance flow)
  2. AttendanceReviewScreen matches Stitch design (summary, list, filters)
  3. NotificationsScreen matches Stitch design (cards, empty state)
  4. SettingsScreen matches Stitch design (sections, toggles, theme switcher)

Plans:
- [ ] 03-01: AttendanceScreen redesign
- [ ] 03-02: AttendanceReviewScreen redesign
- [ ] 03-03: NotificationsScreen + SettingsScreen redesign

---

### Phase 4: Payroll Tab Redesign
**Goal**: Redesign the advances/payroll screens.  
**Depends on**: Phase 1  
**Requirements**: PAY-UI-01, PAY-UI-02  
**Success Criteria**:
  1. AdvancesScreen form matches Stitch design
  2. AdvancesListScreen cards and status badges match Stitch design

Plans:
- [ ] 04-01: AdvancesScreen + AdvancesListScreen redesign

---

### Phase 5: Guards Tab Redesign
**Goal**: Redesign the guards management screens.  
**Depends on**: Phase 1  
**Requirements**: GUARD-UI-01, GUARD-UI-02  
**Success Criteria**:
  1. GuardsListScreen cards and search match Stitch design
  2. AddGuardScreen multi-section form matches Stitch design

Plans:
- [ ] 05-01: GuardsListScreen + AddGuardScreen redesign

---

### Phase 6: Sites Tab Redesign
**Goal**: Redesign the sites management screens.  
**Depends on**: Phase 1  
**Requirements**: SITE-UI-01, SITE-UI-02  
**Success Criteria**:
  1. SitesListScreen cards and search match Stitch design
  2. AddSiteScreen form matches Stitch design

Plans:
- [ ] 06-01: SitesListScreen + AddSiteScreen redesign

---

### Phase 7: Reports Tab Redesign
**Goal**: Redesign the reports screens.  
**Depends on**: Phase 1  
**Requirements**: RPT-UI-01, RPT-UI-02  
**Success Criteria**:
  1. ReportsScreen selector and filters match Stitch design
  2. ReportResultsScreen results display matches Stitch design

Plans:
- [ ] 07-01: ReportsScreen + ReportResultsScreen redesign

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|---|---|---|---|---|
| 1. Design System Foundation | v2.0 | 0/3 | Not started | - |
| 2. Auth Flow Redesign | v2.0 | 0/3 | Not started | - |
| 3. Home Tab Redesign | v2.0 | 0/3 | Not started | - |
| 4. Payroll Tab Redesign | v2.0 | 0/1 | Not started | - |
| 5. Guards Tab Redesign | v2.0 | 0/1 | Not started | - |
| 6. Sites Tab Redesign | v2.0 | 0/1 | Not started | - |
| 7. Reports Tab Redesign | v2.0 | 0/1 | Not started | - |
