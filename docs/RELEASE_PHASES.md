# Release Phases & QA Playbook — Sidekick Engine

---

## 1. Core Implementation Phases

The Sidekick development lifecycle is structured into five distinct phases, moving from core data guarantees to real-time math filtering and premium media generation.

```
┌────────────────────────────────────────────────────────┐
│  PHASE 1: Local Foundations & Core UI                  │
│  - Offline SQLite schemas & MMKV backup stores         │
│  - Premium dynamic Slate-Navy theme tokens             │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 2: Geolocation & Filtering Algorithms           │
│  - Kalman Filter noise correction engine               │
│  - Douglas-Peucker path simplification downsampler     │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 3: Resilient Synchronization Outbox             │
│  - NetInfo network restoration observers               │
│  - Exponential backoff batch sync worker (Hasura)      │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 4: Strava-Style Media & Share Cards             │
│  - Camera viewfinder integration                       │
│  - Watermark overlay composite canvas engine           │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│  PHASE 5: Release Readiness & Standalone Builds        │
│  - Sandbox auth bypasses & TypeScript audits           │
│  - Standalone release APK builds & distribution        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Release Milestones

### Phase 1: Local Foundations & Core UI (Completed)
* **Goal:** Establish a bulletproof local-first storage layout and core Dynamic Slate-Navy UI components.
* **Deliverables:**
  * Configured local `sqliteService` with automatic MMKV time-series fallbacks for simulator testing.
  * Extracted Slate-Navy CSS theme tokens (`appBaseBg`, `textPrimary`, etc.) and integrated reactive stores.
  * Designed modular Typography systems (`H1`, `H2`, `H3`, `P1`, `P2`) that dynamically re-render on theme switches without visual glitches.

### Phase 2: High-Precision Geolocation & Algorithms (Completed)
* **Goal:** Implement live GPS trajectory capturing, noise reduction, and route geometry extraction.
* **Deliverables:**
  * Integrated constant-velocity Kalman filtering to smooth raw GPS coordinates in real-time.
  * Added Douglas-Peucker downsampling algorithm to reduce live coordinates by 70% for map and rendering views.
  * Set up local tracking backup routines so active routes rehydrate instantly if the app crashes or is killed during a ride.

### Phase 3: Resilient Connection Sync Worker (Completed)
* **Goal:** Ensure zero ride telemetry data loss over spotty cellular connections.
* **Deliverables:**
  * Engineered a background `SyncService` outbox worker.
  * Attached NetInfo observers to detect when the device goes online and trigger opportunist outbox flushes.
  * Coded an exponential backoff routine (doubling retry delay from 2s up to 60s max) to prevent server hammering.
  * Packaged coordinate batches into groups of 100 to execute bulk-inserts on the backend.

### Phase 4: Strava-Style Media & Share Cards (Completed)
* **Goal:** Launch the visual trip sharing engine.
* **Deliverables:**
  * Mounted the Camera viewfinder wrapper inside the ride modal.
  * Built the `WatermarkCanvasEngine` which takes a captured photo or premium gradient preset, overlays trip stats, draws the route path, and compiles a high-fidelity base64 shareable card.
  * Integrated native OS sharing sheets.

### Phase 5: Release Readiness & standalone Builds (In Progress)
* **Goal:** Prepare the application for production launch.
* **Deliverables:**
  * Coded a zero-network authentication bypass for the test number `9876543210` to allow simulator test runs without real SMS triggers.
  * Resolved the Metro Dynamic Require alias mapping bug to allow the sync outbox to compile on physical device APKs.
  * Generated stand-alone release APK files.

---

## 3. QA Playbook & Verification Checklists

### Checklist A: offline Outbox Integrity
1. Launch the app and sign in with the bypass credentials.
2. Turn off laptop Wi-Fi and mobile data (simulate entering a tunnel).
3. Start a dummy simulated ride to capture coordinates.
4. End the ride at a destination hub.
5. **Verify:** Check the wallet transactions page. The completed ride should list immediately with local calculations (Trip cost, distance).
6. Restore network connectivity.
7. **Verify:** Check console logs. The outbox sync worker must trigger automatically and flush the unsynced ride header and coordinates batch.
8. **Verify:** Confirm the database record status changes from `PENDING` to `SYNCED`.

### Checklist B: Premium Theme Transitions
1. Navigate across all screens: Onboarding carousel, Login welcome screens, TNC loading page, wallet history.
2. Toggle the Dark Mode switch in system settings.
3. **Verify:** Every single background turns into rich Slate-Navy immediately (no hardcoded white backgrounds).
4. **Verify:** All text remains high-contrast and legible.
5. **Verify:** The map background dims immediately.

---

## 4. Useful Debugging & Development Commands

### Clear Metro Cache & Restart
Run this command if Metro holds onto old module caches or circular dependency graphs:
```bash
npm start -- --reset-cache
# or
npx react-native start --reset-cache
```

### Check Active USB Devices
Ensure your physical phone is connected properly for debugging:
```bash
adb devices
```

### Install Directly on Android USB Device
Installs and launches the debug APK on your connected phone:
```bash
npm run android
```

### Build Standing Standalone Release APK
Creates a release-signed standalone APK for distribution:
```bash
cd android
./gradlew assembleRelease
```
