# 🔄 Feature Implementation Workflow

This document defines the standard 5-phase engineering workflow for Developers and AI Agents when researching, designing, implementing, and delivering any new feature in the SnapStep Mobile codebase.

> [!IMPORTANT]
> **Project Constitution:** Every step in this workflow strictly adheres to the core directives defined in [AGENTS.md](file:///d:/Tuhoc/native/SnapStep/AGENTS.md). The AI Agent MUST automatically apply the meta-skill `using-agent-skills` first for every request (**Rule 5**).

---

## 🗺️ Skills Mapping Matrix

| Phase | System Skills | Primary Responsibility |
|---|---|---|
| **Phase 1: Analysis & Spec** | `using-agent-skills`<br>`interview-me`<br>`idea-refine`<br>`spec-driven-development`<br>`source-driven-development` | - Route skills dynamically (**Rule 5**).<br>- Interview to clarify underspecified requirements.<br>- Draft formal specifications for complex features.<br>- Ground decisions in official Expo SDK 57 docs (**Rule 2**). |
| **Phase 2: Planning & Architecture** | `planning-and-task-breakdown`<br>`api-and-interface-design`<br>`security-and-hardening` | - Decompose into thin vertical tasks.<br>- Enforce strictly-typed contracts (Zero `any`).<br>- Design Firebase rules & data security.<br>- **Ask explicit permission before coding (Rule 1)**. |
| **Phase 3: Incremental Implementation** | `incremental-implementation`<br>`expo-native-ui`<br>`frontend-ui-engineering`<br>`performance-optimization` | - Build in small verifiable slices (**Rule 3**).<br>- Craft native-feeling UI (`Pressable`, `Colors.ts`, `Value.ts`).<br>- Guarantee 60fps animations with `react-native-reanimated`.<br>- Maintain Vietnamese code comments policy. |
| **Phase 4: Verification & Quality Gate** | `test-driven-development`<br>`code-review-and-quality`<br>`code-simplification`<br>`debugging-and-error-recovery` | - Verify TypeScript compilation `npx tsc --noEmit` (0 errors).<br>- Append test cases to `docs/TEST_SCENARIOS.md`.<br>- Conduct 5-axis code review before handover.<br>- Isolate and eliminate root causes of bugs. |
| **Phase 5: Delivery & Versioning** | `shipping-and-launch`<br>`git-workflow-and-versioning` | - Provide concise walkthrough & testing instructions.<br>- Guide atomic Git staging.<br>- **Never execute auto-commit (Rule 4)**. |

---

## 🎯 Detailed 5-Phase Implementation

### Phase 1: Analysis & Specification (Define Phase)

1. **Clarify Ambiguous Requirements (`interview-me` & `idea-refine`):**
   - When receiving an underspecified or broad requirement, the Agent must ask targeted, single-topic clarifying questions to extract true intent before planning.
2. **Specification Decision Gate (`spec-driven-development`):**
   - **MANDATORY Spec Creation** at `docs/specs/[FEATURE_NAME]_SPEC.md` when:
     - Introducing new Firestore collections or Realtime Database schemas.
     - Dealing with cryptographic primitives, token management, or security-sensitive flows (e.g., `CHAT_ENCRYPTION_SPEC.md`).
     - Integrating new native modules or multi-step asynchronous transactions.
   - **BYPASS Spec Creation** when:
     - Applying minor UI tweaks, simple CRUD field additions, or straightforward bug fixes.
3. **Official Documentation Grounding (`source-driven-development` - Rule 2):**
   - Verify APIs directly against [Expo SDK 57 Documentation](https://docs.expo.dev/versions/v57.0.0/) and React Navigation docs. Do not hallucinate or rely on outdated legacy APIs.

---

### Phase 2: Planning & Architecture (Rule 1 Gate)

1. **Task Breakdown (`planning-and-task-breakdown`):**
   - Break features into ordered, verifiable increments: Data/Storage Layer &rarr; Service Layer &rarr; Reusable Component Layer &rarr; Screen Assembly Layer.
2. **Interface & Contract Design (`api-and-interface-design`):**
   - Define exact TypeScript `type` and `interface` models in `src/navigation/types.ts` and service files.
   - Strictly adhere to the **Zero `any` Policy**.
3. **Security & Permissions Hardening (`security-and-hardening`):**
   - Pre-design Firebase Firestore and Realtime Database security rules to eliminate potential `permission-denied` roadblocks early.
4. 👉 **APPROVAL GATE (Rule 1 - Ask Before Coding):**
   - The Agent must propose a comprehensive implementation plan detailing the exact files to be created or modified within `src/`.
   - **STOP and request user permission.** Absolutely no file modifications may occur before receiving explicit approval!

---

### Phase 3: Incremental Implementation (Rule 3)

All code must strictly reside in the designated subdirectories of `src/`:

* **Step 3.1: Types & Navigation Layer (`src/navigation/`):**
  - Update `RootStackParamList` in `src/navigation/types.ts`.
  - Type all navigation props strictly via `NativeStackScreenProps` or typed hooks.

* **Step 3.2: Service & Business Logic Layer (`src/services/`):**
  - Encapsulate network requests, Firebase queries, and crypto operations cleanly.
  - Handle asynchronous errors gracefully using structured `try/catch` blocks.

* **Step 3.3: Modular Reusable Components Layer (`src/components/` - `expo-native-ui`):**
  - **Modularity (Single Responsibility):** Extract all reusable elements into small, dedicated components. Monolithic screens are strictly prohibited.
  - **Touch Component:** Exclusively use React Native's modern `Pressable` component (never `TouchableOpacity`).
  - **Colors Constant First Policy:** Always source colors from `src/constants/Colors.ts` (`Colors.primary`, `Colors.background`, `Colors.error`, etc.). Never hardcode hex codes.
  - **Screen Dimensions Layout Policy:** Always import dimensions from `src/constants/Value.ts` (`Value.widthScreen`, `Value.heightScreen`).
  - **Screen Background Color:** Pure black `#000` / `Colors.background` required for screen backgrounds.
  - **Animation Library Rule:** Use `react-native-reanimated` exclusively for 60fps animations.
  - **Vietnamese Comments Policy:** Always write code comments in Vietnamese (`tiếng Việt`) for local team clarity.

* **Step 3.4: Screen Assembly Layer (`src/screens/`):**
  - Compose modular components with service hooks.
  - Register screens into `RootNavigator.tsx`.

---

### Phase 4: Verification & Quality Gate (QA Phase)

1. **Static Typecheck:**
   - Execute: `npx tsc --noEmit`.
   - Mandatory prerequisite: **Exit Code 0 (0 errors)** before proceeding.
2. **Test Scenario Upgrades (`test-driven-development`):**
   - Update `docs/TEST_SCENARIOS.md` with new test cases (including happy paths, offline/network errors, and persistence validation).
   - Update the Pre-Release Regression Checklist table.
3. **Multi-Axis Review (`code-review-and-quality` & `code-simplification`):**
   - Verify zero `any` usage, remove unused abstractions, and confirm no hardcoded styling.
4. **Root-Cause Debugging (`debugging-and-error-recovery`):**
   - If runtime bugs occur on device testing, diagnose the architectural root cause rather than applying temporary patches.

---

### Phase 5: Delivery & Version Control (Rule 4 Gate)

1. **Handover & Walkthrough (`shipping-and-launch`):**
   - Provide a concise summary of all modified/created files and clear instructions for manual device verification.
2. 👉 **NO AUTO-COMMIT POLICY (Rule 4):**
   - Provide recommended `git status` and `git diff` commands (`git-workflow-and-versioning`).
   - Leave the final review and commit execution strictly in the hands of the user.

---

## 🏁 Definition of Done (DoD) Checklist

A feature is considered 100% complete only when all of the following criteria are met:

- [ ] Explicit user permission obtained prior to code execution (**Rule 1**).
- [ ] Validated against official Expo SDK 57 / React Navigation documentation (**Rule 2**).
- [ ] Strict compliance with the `src/` directory architecture.
- [ ] 100% adherence to the **Zero `any` Policy**.
- [ ] `Pressable` used for touches; colors from `Colors.ts`; dimensions from `Value.ts`.
- [ ] Animations powered exclusively by `react-native-reanimated`.
- [ ] All code comments written in Vietnamese.
- [ ] Static typecheck `npx tsc --noEmit` exits with **0 errors (Exit Code 0)**.
- [ ] QA test scenarios documented in `docs/TEST_SCENARIOS.md`.
- [ ] **No automatic `git commit` executed** (**Rule 4**).
