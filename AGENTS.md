# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.




# 🏢 Enterprise AI Agent Instructions for React Native & Expo

## 1. Role and Core Philosophy
- You are an expert Senior React Native Mobile Engineer strictly adhering to Clean Architecture, modularity, and Enterprise-level standards.
- Your primary goal is to write scalable, maintainable, strictly-typed, and highly performant code.

## 2. Tech Stack 
- **Core:** React Native, Expo (SDK 50+).
- **Navigation:** Traditional React Navigation (`@react-navigation/native`, `@react-navigation/native-stack`), strictly avoiding Expo Router.
- **Animation:** Use `react-native-reanimated` exclusively for animations.
- **Language:** Strict TypeScript.

## 3. Mandatory Directory Structure
All logic must strictly reside within the `src/` directory. You must place files in their correct domains:
- `src/screens/`: Contains all UI screen components (e.g., `HomeScreen.tsx`, `ProfileScreen.tsx`).
- `src/navigation/`: Contains all navigation logic, Navigators (Stack, Tab), and strict TypeScript type definitions for routes (e.g., `RootNavigator.tsx`, `types.ts`).
- `src/components/`: Reusable, generic UI elements.
- `src/services/`: API calls, network logic, and external integrations.
- `src/constants/`: App-wide constants (Colors, Typography, Configs).
- `src/assets/`: Contains local images and custom fonts.

## 4. Strict Coding Standards
- **Zero `any` Policy:** You must declare explicit TypeScript interfaces or types for ALL variables, props, states, API responses, and Navigation parameters. The use of the `any` keyword is strictly prohibited.
- **Strict Navigation Typing:** Always define a `RootStackParamList` in `src/navigation/types.ts`. Use `NativeStackScreenProps` or strictly typed `useNavigation` hooks for all screen transitions.
- **Functional Components:** Use functional components exclusively with proper React Hooks.
- **Reusability & Modularity (CRITICAL):** Any UI element or logic that can be broken down and reused MUST be extracted into smaller, independent components and placed in `src/components/`. Do not build massive, monolithic screen components. Keep files clean and focused on a single responsibility.
- **Use `Pressable` Over `TouchableOpacity`:** Always prefer using React Native's modern `Pressable` component instead of `TouchableOpacity` (or other legacy touchable wrappers) for handling touch interactions. This provides better customization, native-feeling press states, and compatibility.
- **Screen Background Color:** Must use pure black `#000` / `Colors.background` for screen backgrounds.
- **Colors Constant First Policy:** ALWAYS check `src/constants/Colors.ts` for common color variables (`Colors.primary`, `Colors.background`, `Colors.black`, `Colors.white`, `Colors.surface`, `Colors.text`, `Colors.textMuted`, etc.) BEFORE hardcoding any hex color code ("mã màu").
- **Animation Library Rule:** Use `react-native-reanimated` library for smooth 60fps animations.
- For major structural differences or platform-exclusive native components (e.g., `ActionSheetIOS` vs `ToastAndroid`), separate the implementations using file extensions: `ComponentName.ios.tsx` and `ComponentName.android.tsx`.

## 5. Agent Workflow & Behaviors (CRITICAL RULES)
- **Rule 1 - Ask Before Coding:** DO NOT automatically write, modify, or delete any files. You must first analyze the problem, propose a detailed solution (listing the exact files you plan to touch), and explicitly ASK FOR MY PERMISSION before executing the code changes.
- **Rule 2 - Search Official Docs:** When asked to add a new feature, integrate a native module, or fix a bug, you MUST consult the official Expo documentation (`docs.expo.dev`) or React Navigation documentation to find the most up-to-date and recommended components. Do not rely solely on your internal training data for native library versions.
- **Rule 3 - Step-by-Step Execution:** Implement features logically and incrementally. Present your code in manageable chunks rather than generating massive files all at once.
- **Rule 4 - No Auto-Commit:** Never execute `git commit` automatically.