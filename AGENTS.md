# Muse AI Clone - Developer & Agent Guide

This is an Expo/React Native application for **Muse AI** (and AI companion **Cooper**) — an autonomous AI agent application tailored for recurring tasks, automated workflows, chat companion interactions, and scheduled operations.

---

## 🚀 Project Overview

- **App Name:** Muse AI Clone
- **Core Concept:** Autonomous AI Agent & Chat Companion for Recurring Tasks, Goals, and Automated Workflows
- **Platform:** iOS, Android, and Web (Universal React Native)
- **Current Phase:** Full UI Implementation with Clean Expo Router Tab Architecture, Pixel-Perfect Chat, Header Mascot, Floating Dock Tabs, Sidebar Drawer, and Settings.

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://docs.expo.dev/) (SDK 57)
- **Runtime:** React Native 0.86.3 / React 19.2.3
- **Router:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation in `src/app/`)
- **Vector Icons:** `@hugeicons/react-native` & `@hugeicons/core-free-icons`
- **Vectors & SVG:** `react-native-svg`
- **Design Tokens:** Centralized in `src/constants/colors.ts`
- **Safe Area:** `react-native-safe-area-context`

---

## 🎨 Design System & Color Tokens (`src/constants/colors.ts`)

Always reference and add color definitions in `src/constants/colors.ts`. Never hardcode ad-hoc hex values inside components.

| Token | Hex / Value | Purpose |
|---|---|---|
| `Colors.primary` | `#2563EB` | Primary brand blue |
| `Colors.chatBubbleUser` | `#E8C4B4` | Warm peach terracotta user chat bubble |
| `Colors.chatBubbleAi` | `#EEF0F2` | Soft light gray agent message bubble |
| `Colors.tabActiveBg` | `#E6E8EA` | Active tab pill capsule background in dock |
| `Colors.iconDark` | `#1E2022` | Dark charcoal for icons and typography |
| `Colors.iconMuted` | `#9E9E9E` | Secondary gray for placeholder and timestamps |
| `Colors.statusBlue` | `#0066FF` | Online indicator dot on header drawer button |
| `Colors.white` | `#FFFFFF` | Main background & floating capsules |

---

## 📁 Clean Directory Structure & Architecture

```
muse_ai_clone/
├── AGENTS.md                  # Project & agent guidelines
├── package.json               # Dependencies & scripts
├── assets/
│   └── images/
│       └── cooper_mascot.jpg  # 3D character mascot avatar portrait
├── src/
│   ├── app/                   # Expo Router file-based screens
│   │   ├── _layout.tsx        # Root Stack navigator & ThemeProvider
│   │   ├── index.tsx          # Google Sign-in onboarding screen (Self-contained)
│   │   ├── home.tsx           # Compatibility redirect to /(tabs)/chat
│   │   └── (tabs)/            # Dedicated 5-Tab Routing & Layout
│   │       ├── _layout.tsx    # Master Tab Layout (AppHeader + Native Tabs + Modals)
│   │       ├── index.tsx      # Tab index redirect to /chat
│   │       ├── chat.tsx       # 1. Chat Tab: Messages list, peach/gray bubbles, input pill
│   │       ├── feed.tsx       # 2. Feed Tab: Minimalist autonomous intelligence feed
│   │       ├── ideas.tsx      # 3. Ideas Tab: 1-tap pre-built automation templates
│   │       ├── tasks.tsx      # 4. Tasks Tab: Scheduled goals & recurring routine manager
│   │       └── settings.tsx   # 5. Settings Tab: Quota card, groups, and integrated sheets
│   ├── components/            # Core Shared UI Layout Components
│   │   └── common/            # Header, Mascot, Drawer, Customizer & Settings Modals
│   └── constants/
│       ├── colors.ts          # Central color palette
│       ├── dummyData.ts       # Initial chat & sample workflows
│       └── theme.ts           # Spacing and typography
```

---

## ⚡ Useful Commands

```bash
# Start the Expo development server
npx expo start

# Typecheck the whole project
npx tsc --noEmit

# Install compatible packages (ALWAYS use this instead of npm i / yarn add)
npx expo install <package-name>
```
