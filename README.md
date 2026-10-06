# 🤖 Muse AI Clone

A pixel-perfect, universal React Native application for **Muse AI** and companion **Cooper** — an autonomous AI agent for recurring tasks, workflows, and goals.

Built with **Expo (SDK 57)**, **React Native 0.86**, **Expo Router**, and **TypeScript**.

---

## ✨ Features

- **Google Sign-In Authentication:** Beautiful onboarding screen with official 4-color SVG Google sign-in button.
- **Header & 3D Character Mascot:** Sticky top header featuring Cooper's 3D portrait, floating name pill, 2-line menu with unread indicator dot, and 3-dots action sheet.
- **Real-Time Interactive Chat:** Peach user bubbles, soft gray agent bubbles, date dividers, typing indicator animations, and intelligent simulated response loop.
- **Stadium Floating Dock:** Bottom capsule dock switching between **Chat**, **Feed**, **Ideas**, **Tasks**, and **Settings**.
- **Slide-in Session Drawer:** Main chat shortcut, searchable side chat history with unread indicators, and bottom compose toolbar.
- **Agent Personalization Modal:** Live preview editor for agent name, role subtitle, 5 emblem icons, and 6 aura theme colors.
- **Autonomous Tasks & Goals:** Recurring checks manager with active/paused toggles and instantaneous simulated manual runs.
- **Settings & Connectors:** Plan usage progress tracker, 7 tool integrations (Google, Notion, GitHub, Slack, Linear, Figma, X), monthly/yearly Pro pricing modal, and theme preferences.

---

## 📚 Complete Codebase Documentation

For an exhaustive, file-by-file breakdown explaining the architecture, dependencies, data flow, and documented code snippets for every file, see:

👉 [**`CODEBASE_EXPLANATION.md`**](./CODEBASE_EXPLANATION.md)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
# Start Expo Metro bundler
npm run start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in Web browser
npm run web
```

### 3. Type Checking
```bash
npx tsc --noEmit
```

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://docs.expo.dev/) (SDK 57)
- **Runtime:** React Native 0.86.3 / React 19.2.3
- **Router:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based in `src/app/`)
- **Icons:** `@hugeicons/react-native` & `@hugeicons/core-free-icons`
- **Vectors:** `react-native-svg`
- **Safe Area:** `react-native-safe-area-context`
