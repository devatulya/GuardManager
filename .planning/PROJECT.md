# Project: GuardManager

**Type:** React Native (Expo) Mobile App  
**Platform:** Android & iOS  
**Backend:** Firebase (Auth + Firestore)  
**Defined:** 2026-02-19

---

## Core Value

A premium guard supervision and attendance management app for security companies — enabling managers to track guard attendance, manage sites, process salary advances, and generate reports from a single mobile interface.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK) |
| Navigation | React Navigation (Stack + Material Top Tabs) |
| Backend | Firebase Auth + Firestore |
| State | React Context (AuthContext, ThemeContext) |
| Icons | @expo/vector-icons (MaterialIcons) |
| Storage | AsyncStorage (theme persistence) |
| Components | Custom (DateTimePickerField, SearchablePicker, FirebaseRecaptcha) |

---

## Milestones

- 📋 **v2.0 UI/UX Redesign** — Phases 1-7 (in progress)

---

## Architecture

```
App.js
└── SafeAreaProvider
    └── ThemeProvider (ThemeContext)
        └── AuthProvider (AuthContext)
            └── AppNavigator
                ├── AuthNavigator (unauthenticated)
                │   ├── SplashScreen
                │   ├── WelcomeScreen
                │   ├── SignupScreen
                │   └── VerificationScreen
                ├── ProfileSetupScreen (authenticated, no profile)
                └── MainNavigator (authenticated + profile)
                    ├── Home Tab → AttendanceScreen, AttendanceReviewScreen, NotificationsScreen, SettingsScreen
                    ├── Payroll Tab → AdvancesScreen, AdvancesListScreen
                    ├── Guards Tab → GuardsListScreen, AddGuardScreen
                    ├── Sites Tab → SitesListScreen, AddSiteScreen
                    └── Reports Tab → ReportsScreen, ReportResultsScreen
```

---

## Design System

- **Style:** Claymorphism — soft shadows, rounded cards, pastel fills, depth
- **Theme:** Light + Dark mode (persisted via AsyncStorage)
- **Reference:** Stitch HTML/CSS exports provided per screen
- **Approach:** Convert Stitch designs to idiomatic React Native; ignore web-only CSS

---

## History

- **v1.0 MVP** — Initial app built with Firebase Auth, Firestore, full navigation, attendance, guards, sites, advances, reports, dark mode.
