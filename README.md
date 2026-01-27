# GuardManager App

A comprehensive Guard Supervision and Attendance Management System built with React Native (Expo) and Firebase.

## Features

### 🔐 Authentication
- **Email/Password Login & Signup**: Secure authentication via Firebase Auth.
- **Google Sign-In**: Integrated Google login (Web supported).
- **Profile Management**: Mandatory profile setup for Supervisors (Name, Region, Stats).

### 📱 UI & Navigation
- **Modern Design**: Clean, professional UI with consistent branding.
- **Swipe Navigation**: Fluid swipe gestures between main modules (Home, Payroll, Guards, etc.).
- **Safe Area Handling**: Optimized for modern devices with notches and home indicators.

### 🛠 Core Modules
1.  **Dashboard**: Overview of attendance and stats.
2.  **Attendance**: Clock-in/out system with location/selfie verification (planned).
3.  **Payroll**: Manage advances and view salaries.
4.  **Guards & Sites**: Add and manage security guards and sites.
5.  **Reports**: Generate site-wise or guard-wise reports with auto-refreshing data.

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start the Server**
    ```bash
    npx expo start -c
    ```
    *Note: The `-c` flag clears the cache, which is recommended after dependency updates.*

3.  **Run on Device**
    - Press `w` for Web.
    - Press `a` for Android Emulator.
    - Scan QR code with Expo Go app for physical device.

## Google Auth Setup
- Currently configured for **Web** using `signInWithPopup`.
- For Native (Android/iOS), you will need to configure `expo-google-app-auth` or `react-native-google-signin` with proper SHA-1 keys in Firebase Console.

## Project Structure
- `src/screens`: UI Screens.
- `src/navigation`: App Navigation (Swipeable Tabs, Stacks).
- `src/services`: Firebase interaction logic (guards, sites, reports).
- `src/context`: Authentication State Management.
- `src/theme`: Centralized colors and styling constants.

Built by [Your Name/Team]
