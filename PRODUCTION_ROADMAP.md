# Sidekick Production Roadmap & Handover Manual

This document provides a comprehensive, senior-level guide detailing the architecture of the **Sidekick App**, what is already fully functional, what must be configured manually, how developer/payment accounts should be set up, how database seeding is structured, and the exact steps to deploy the application to both **iOS** and **Android** devices.

---

## 📂 Table of Contents
1. [Architectural Overview](#-architectural-overview)
2. [Current Project State (What is Done vs. Left)](#-current-project-state)
3. [Developer Accounts & Billing Configuration](#-developer-accounts--billing-configuration)
4. [Environment Configuration & Variables](#-environment-configuration--variables)
5. [Database Seeding Reference](#-database-seeding-reference)
6. [Secure Payment Implementation Gaps & Production Fixes](#-secure-payment-implementation-gaps--production-fixes)
7. [Android Production Linking & Deployment Guide](#-android-production-linking--deployment-guide)
8. [iOS Production Linking & Deployment Guide](#-ios-production-linking--deployment-guide)
9. [Future Development & Reference Discussions](#-future-development--reference-discussions)

---

## 🏗️ Architectural Overview

Sidekick is a premium, high-performance micro-mobility app built with **React Native (TypeScript)** on the frontend and **Fastify + GraphQL (Mercurius)** on the backend. The core architectures are divided as follows:

```mermaid
graph TD
    subgraph Mobile Client (React Native)
        UI[React Native UI Components]
        State[Zustand Store Manager]
        GraphQL[Urql GraphQL Client]
        Cache[MMKV / SQLite Outbox Cache]
        Tracker[Background GPS Tracking]
        Kalman[Kalman Noise Filter]
    end

    subgraph Backend Server (Fastify + GraphQL)
        Fastify[Fastify Node Server]
        Mercurius[Mercurius GraphQL Engine]
        JSONDB[Mock JS JSON Database]
    end

    subgraph External Infrastructure
        Firebase[Firebase Authentication]
        Maps[Google Maps / Directions API]
        Easebuzz[Easebuzz Payment SDK]
    end

    UI --> State
    State --> GraphQL
    State --> Tracker
    Tracker --> Kalman --> Cache
    Cache -- Outbox Sync --> GraphQL
    GraphQL -- HTTP/Bearer Token --> Mercurius
    Mercurius --> JSONDB
    UI -. OTP auth .-> Firebase
    UI -. Maps Render .-> Maps
    UI -. Payment Open .-> Easebuzz
```

### Key Subsystems:
1. **State & GraphQL (Zustand + URQL)**: Zustand serves as the global store (`globalStore`, `useAuthStore`, `useRideStore`, `useWalletStore`, `useUserStore`). Communication with the backend utilizes the lightweight **Urql** GraphQL client, which handles JWT token injections securely via Bearer headers using Firebase Auth ID Tokens.
2. **Offline-First Telemetry Sync (Kalman Filter + MMKV + SQLite)**:
   - **GPS Noise Reduction**: Raw location data is processed on-the-fly using a dynamic **Kalman Filter** to strip GPS drift, signal bouncing, and telemetry spikes.
   - **Transactional SQLite Outbox Queue**: Smoothed coordinates and ride states are transactionally queued in a local SQLite database (`react-native-sqlite-storage` / `expo-sqlite`).
   - **Bulletproof MMKV Fallback**: If native SQLite modules are unlinked or fail in simulator builds, the app gracefully falls back to a high-speed MMKV cache to prevent runtime crashes.
   - **Outbox Sync Worker**: When internet is restored (detected via NetInfo or periodic ping fallbacks), a background worker flushes queued rides and batch-uploads GPS coordinate objects (in groups of 100) using a unified GraphQL batch mutation.
3. **Authentication & Scanning**: Built with Firebase Phone Auth (OTP) and an integrated QR scanner (`react-native-qrcode-scanner` or `react-native-vision-camera`) to identify scooters, verify active rides, and automatically unlock them on the map.
4. **Local Development Backend**: Fastify server utilizing Mercurius to emulate a **Hasura Engine GraphQL endpoint**, parsing SQLite-style operations into a memory-cached local file engine (`sidekick-db.json`).

---

## 📋 Current Project State

Below is the step-by-step checklist of what has been implemented and what remains to be linked, configured, or developed manually.

### 1. What is Already Fully Implemented (Done)
- [x] **Premium Visual Design**: Vibrant, harmonic dark and light modes, typography, smooth micro-animations, custom map styles, bottom sheets, and modern card components.
- [x] **Complete Global State Management**: Zustand stores decoupled from components to prevent circular dependencies.
- [x] **Local Storage Engines**: Hybrid storage abstraction merging MMKV for lightweight caching and SQLite for heavy time-series coordinate telemetry.
- [x] **GPS Telemetry Kalman Filtering**: Fully integrated client-side Kalman Noise Filter to keep scooter paths clean.
- [x] **Offline Synchronization Outbox Engine**: Outbox pattern featuring batched uploads (100 coords/request) and exponential backoff retry algorithms to preserve battery.
- [x] **High-Fidelity DB Seeding**: Dynamic mock database seeder generating premium parking hubs, scooters, a wallet balance of ₹5000, and 7 completed commuter rides across the Delhi University campus (Maurice Nagar, Kamla Nagar, Satya Niketan, Dhaula Kuan).
- [x] **Native Asset Integration**: Font files, SVG vectors, icons, and localized theme configurations.
- [x] **Easebuzz Checkout Frontend Integration**: Add funds layout using `react-native-easebuzz-kit` on the mobile side.

### 2. Manual Configurations & Engineering Left to Do (Left)
- [ ] **Google Cloud Platform Account Setup**: Enable Maps SDKs, Directions API, and set up billing.
- [ ] **Firebase Console Project Creation**: Provision authentication templates and download config files.
- [ ] **Easebuzz Merchant Registration**: Set up billing, register the gateway, and acquire integration keys/salt.
- [ ] **Android Studio Linking**: Link Google Services JSON, keystores, and map configurations.
- [ ] **Xcode Settings & CocoaPods**: Build schemes, permissions descriptions plist, and Apple certificates.
- [ ] **Backend Production Server Hosting**: Host the server on Render/Railway/AWS and connect it to a persistent database (Neon/Supabase) instead of local `sidekick-db.json`.
- [ ] **Backend Payment Route Implementation**: Build the `/initiate-payment` signing endpoint and the secure transaction callback webhook on the backend.
- [ ] **Production Relational DB Seeding**: Seed the production database tables with stable hub coordinates and default fleet configurations.

---

## 🔑 Developer Accounts & Billing Configuration

To take this application live, the following accounts must be registered, configured, and paid for.

### 1. Firebase Suite (Authentication)
*   **Purpose**: Handles SMS OTP user logins and secure sessions.
*   **Steps to Perform**:
    1. Go to the [Firebase Console](https://console.firebase.google.com/) and register a free Spark project (or upgrade to Blaze-pay-as-you-go).
    2. Add an **Android Application** matching package name `in.sidekick`. Add the SHA-1 and SHA-256 signatures generated from your release keystore.
    3. Add an **iOS Application** matching bundle identifier `org.reactjs.native.example.sidekickv1`.
    4. Download `google-services.json` and place it in the `android/app/` folder.
    5. Download `GoogleService-Info.plist` and place it in the `ios/` folder. Add it directly to the Xcode project structure.
    6. Enable **Phone Sign-in** under *Authentication* -> *Sign-in method*.
    7. *Note*: Firebase gives 10,000 free Phone authentications per month under Spark, switching to standard billing tariffs when exceeded.

### 2. Google Cloud Platform (Maps & Directions)
*   **Purpose**: Renders maps and calculates scooter routes/navigation overlays.
*   **Steps to Perform**:
    1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
    2. Go to APIs & Services and enable:
        *   **Maps SDK for Android**
        *   **Maps SDK for iOS**
        *   **Directions API** (needed to calculate routes from user to nearest scooter/parking hub)
    3. Go to the **Billing** tab and link a valid credit card. *IMPORTANT: Google Maps will render a watermarked, non-functional grey map if billing is not activated on the GCP console.*
    4. Generate an API key. Restrict the API key to your specific bundle/package identifiers for security in production.

### 3. Easebuzz (Payment Gateway)
*   **Purpose**: Handles credit/debit card, UPI, net-banking, and wallet recharges for users to add money.
*   **Steps to Perform**:
    1. Sign up for a developer merchant account at [Easebuzz](https://easebuzz.in/).
    2. Complete standard KYC verification to allow real settlements.
    3. In your merchant dashboard, find the **Merchant Key** and **Merchant Salt** under Integration settings.
    4. Configure your callback/webhook URL (e.g. `https://your-production-backend.com/api/payment-response`) to verify transactions on the server side.

### 4. Apple Developer Account (App Store Deployment)
*   **Purpose**: Unlocks TestFlight beta distribution, Apple Push Notifications, background location update capability keys, and iOS App Store publishing.
*   **Cost**: $99/year.
*   **Steps to Perform**:
    1. Register at the [Apple Developer Program](https://developer.apple.com/).
    2. Go to Certificates, Identifiers & Profiles. Register your App ID `org.reactjs.native.example.sidekickv1`.
    3. Create an iOS Distribution Certificate and a mobile provisioning profile linked to your team.

### 5. Google Play Console (Android Deployment)
*   **Purpose**: Publishes release APKs/AABs, unlocks closed testing tracks, and distributes to Android devices.
*   **Cost**: $25 (one-time fee).
*   **Steps to Perform**:
    1. Register at the [Google Play Console](https://play.google.com/console/signup).
    2. Create a new app project matching your package name `in.sidekick`.

---

## ⚙️ Environment Configuration & Variables

To decouple environment values, establish the following files and entries.

### 1. Frontend Mobile Environment (`.env`)
Create a file named `.env` in the root folder (automatically parsed by `react-native-dotenv`):

```bash
# GCP Google Maps Keys
GOOGLE_MAPS_ANDROID_KEY=AIzaSyYourAndroidApiKeyHere
GOOGLE_MAPS_IOS_KEY=AIzaSyYourIOSApiKeyHere

# Active Endpoint (Use your hosted production URL or local machine IP)
# Example Local Dev: http://192.168.1.100:3000/graphql (Do NOT use localhost on physical devices!)
# Example Production: https://sidekick-backend-279t.onrender.com/graphql
GRAPHQL_API_URL=https://sidekick-backend-279t.onrender.com/graphql
REST_API_URL=https://sidekick-backend-279t.onrender.com/api
```

Update your `modules/home/config/mapConfig.ts` to utilize these environment declarations:
```typescript
import { Platform } from 'react-native';
import { GOOGLE_MAPS_ANDROID_KEY, GOOGLE_MAPS_IOS_KEY } from '@env';

export const GOOGLE_MAPS_API_KEY = Platform.OS === 'ios' ? GOOGLE_MAPS_IOS_KEY : GOOGLE_MAPS_ANDROID_KEY;
```

---

### 2. Backend Production Environment (`.env` or Serverless Config)
For your Fastify backend, create a `.env` file in the `sidekick-backend/` directory:

```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Easebuzz merchant secrets (Needed to sign payment hash securely)
EASEBUZZ_MERCHANT_KEY=your_merchant_key_here
EASEBUZZ_MERCHANT_SALT=your_merchant_salt_here
EASEBUZZ_PAY_ENVIRONMENT=production # or test

# Production Database (Neon PostgreSQL / Supabase connection string)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

---

## 🗄️ Database Seeding Reference

The local dev backend automatically triggers a seeding sequence if the JSON database lacks records. In production, your database should be seeded with initial configurations:

### 1. Master Organization
Set up the organization row that holds your fleet:
*   `id`: `org-default-uuid-1111`
*   `name`: `Sidekick Premium Fleet`

### 2. Fleet Scooters & Hub Parking Stations
Insert the coordinates of your parking hubs and available scooters. Standard coordinates are aligned with the **Delhi University (DU) Campus**:

| Entity | ID | Name / Code | Latitude | Longitude | Status / Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hub 1** | `hub-1` | North Campus Hub (Vishwavidyalaya Metro) | 28.6974 | 77.2023 | Central North Campus Hub |
| **Hub 2** | `hub-2` | Kamla Nagar Hub | 28.6816 | 77.2016 | Commercial District Hub |
| **Hub 3** | `hub-3` | South Campus Hub (Dhaula Kuan) | 28.5840 | 77.1630 | Central South Campus Hub |
| **Hub 4** | `hub-4` | Satya Niketan Hub | 28.5873 | 77.1645 | Student Residential Hub |
| **Scooter 1**| `scooter-1` | SCOOTER1 | 28.6974 | 77.2023 | Available at Hub 1 |
| **Scooter 2**| `scooter-2` | SCOOTER2 | 28.6816 | 77.2016 | Available at Hub 2 |
| **Scooter 3**| `scooter-3` | SCOOTER3 | 28.5840 | 77.1630 | Available at Hub 3 |
| **Scooter 4**| `scooter-4` | SCOOTER4 | 28.5873 | 77.1645 | Available at Hub 4 |

---

## 🚨 Secure Payment Implementation Gaps & Production Fixes

Currently, there are major security gaps in the local mock files that **MUST** be fixed prior to production release:

### 1. The Missing `/initiate-payment` Route
In `AddFundsScreen.tsx`, the frontend targets `${config.prodEndpoint}/initiate-payment` to get an transaction checkout token:
```typescript
const clientSecret = await axios.post(`${config.prodEndpoint}/initiate-payment`, { amount, email, phone, firstname });
```
This route is **NOT** defined in your local `server.js` file. The backend must be updated to integrate with Easebuzz's hash initiation API.

### 2. Client-Side Database Mutability Vulnerability
In `AddFundsScreen.tsx` lines 94-108, once the Easebuzz SDK returns successful, the client **directly invokes GraphQL mutations** to increase their wallet balance and security deposits:
```typescript
WalletService.updateWalletSecurityDeposit({ id, security_deposit });
WalletService.updateWalletBalance({ id, balance });
```
> [!CAUTION]
> **CRITICAL SECURITY DANGER**: Under NO circumstances should the client-side app determine or mutate wallet balances directly. Malicious users can intercept GraphQL payloads, bypass the SDK checkout, and directly trigger `update_wallets_by_pk` mutations using GraphQL client consoles (e.g. Apollo/GraphiQL) to grant themselves unlimited credits.

### 🛡️ Production Security Architecture Patch
To build a production-ready payment flow, you must implement server-side verification:

```mermaid
sequenceDiagram
    participant App as Mobile Client
    participant API as Hosted Backend
    participant EB as Easebuzz SDK/API
    participant DB as Production DB (Postgres)

    App->>API: 1. Request Checkout (/initiate-payment)
    API->>API: 2. Generate unique Transaction ID & hash securely using Salt
    API->>EB: 3. Initiate payment session on Easebuzz
    EB-->>API: 4. Return Session Access Key
    API-->>App: 5. Return Access Key
    App->>EB: 6. Open Easebuzz Checkout Overlay
    App->>App: 7. Complete payment process
    EB->>API: 8. Secure HTTP Webhook POST (Payment Response Callback)
    Note over API,EB: Includes Transaction Signature Hash
    API->>API: 9. Verify Signature Hash using Merchant Salt
    alt Signature is Valid & Payment Successful
        API->>DB: 10. Increment Wallet Balance & log Transaction row
        API-->>EB: 11. Respond HTTP 200 OK
    else Signature Invalid
        API-->>EB: 11. Respond HTTP 400 Bad Request
    end
    App->>DB: 12. Fetch Wallet Details (Refreshed Securely)
```

1. **Disable Public Write Mutations**: Restrict `update_wallets_by_pk` permissions in your production database/Hasura schema, preventing regular users from calling it.
2. **Server-Side Easebuzz Webhook Handler**: Create an endpoint on the backend (e.g. `/api/payment-response`) that accepts Easebuzz's server POST request.
3. **Verify Payment Hash**: Compute the SHA-512 payment hash securely using your private Merchant Salt on the server side:
   $$\text{Hash} = \text{SHA512}(\text{salt} \parallel \text{status} \parallel \text{firstname} \parallel \text{amount} \parallel \dots)$$
4. **Mutate Wallet from Backend**: If the signatures match and payment status is `success`, update the database wallet values internally from the secure backend environment (e.g., using a high-privilege DB admin role).

---

## 🤖 Android Production Linking & Deployment Guide

Follow these steps to generate a signed release build of the Android App and submit it to Google Play.

### 1. Native Feature Configurations
1. **Google Play Services Config**: In `android/app/build.gradle`, confirm that the Firebase Google services plugin is declared:
   ```groovy
   apply plugin: 'com.google.gms.google-services'
   ```
2. **Background Permissions & Services**: Ensure `android/app/src/main/AndroidManifest.xml` lists high-accuracy background location permissions and camera usage:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <!-- Required for background telemetry tracking -->
   <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
   ```
3. **Google Maps Key**: Inject your restricted GCP Android Key into the manifest under the `<application>` node:
   ```xml
   <meta-data
     android:name="com.google.android.geo.API_KEY"
     android:value="AIzaSyYourAndroidApiKeyHere" />
   ```

### 2. Generating Signatures & Release Builds
1. **Acquire SHA Signatures**: To configure Phone Auth, you must provide Firebase with your keystore fingerprint. Run the pre-configured script inside the project's root:
   ```bash
   npm run sign-config
   ```
   This executes `./gradlew signingReport` inside `android/` and outputs your SHA-1 and SHA-256 keys. Copy these keys and add them to the Android App configuration in the Firebase Console.
2. **Create a Production Keystore**:
   Generate a secure signing key using keytool (installed via Java SDK):
   ```bash
   keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
   Save the resulting `my-upload-key.keystore` file in the `android/app/` folder. Add your passwords securely to `android/gradle.properties` (which is ignored by Git):
   ```properties
   MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=*****
   MYAPP_UPLOAD_KEY_PASSWORD=*****
   ```
3. **Build the Production Bundle (AAB)**:
   Run the assembly script:
   ```bash
   npm run build-android
   ```
   Alternatively, run from the native folder:
   ```bash
   cd android && ./gradlew bundleRelease && cd ..
   ```
   The compiled `.aab` file will be generated at `android/app/build/outputs/bundle/release/app-release.aab`.

### 3. Submission Checklist
1. Open the **Google Play Console** and select your application `in.sidekick`.
2. Navigate to *Production* (or *Internal Testing* first).
3. Upload the generated `app-release.aab` file.
4. Complete the mandatory **App Content Declarations** (e.g. detailing that the app requests background location to monitor micro-mobility rides and map paths).

---

## 🍏 iOS Production Linking & Deployment Guide

Follow these steps to link iOS dependencies, prepare configurations in Xcode, and compile the iOS package.

### 1. Linking & CocoaPods Setup
1. **Link Assets**: Run CocoaPods to compile and cache native dependencies:
   ```bash
   npm run pod-install
   ```
   *(Ensure you have `cocoapods` installed on your macOS system: `sudo gem install cocoapods` or `brew install cocoapods`).*
2. **Open Workspace**: Open the workspace structure in Xcode using your terminal:
   ```bash
   open ios/sidekickv1.xcworkspace
   ```
   *Do NOT edit the raw `.xcodeproj` file directly. Always work inside `.xcworkspace`.*

### 2. Plist & Native Key Injection
1. **Permission Strings**: Open the main target's properties list file `ios/sidekickv1/Info.plist` and inject description strings explaining why location and camera are accessed:
   *   `NSLocationWhenInUseUsageDescription`: "Sidekick requests location access to map nearby available scooters."
   *   `NSLocationAlwaysAndWhenInUseUsageDescription`: "Sidekick tracks background locations continuously during rides to calculate distance traveled and secure your path."
   *   `NSCameraUsageDescription`: "Sidekick requires camera access to scan scooter QR codes to unlock bookings."
2. **Background Capabilities**: In Xcode, navigate to the **Signing & Capabilities** tab of your primary build target. Click `+ Capability` and add **Background Modes**. Check the box for:
   *   `Location updates` (Critical to prevent the iOS kernel from shutting down the background GPS telemetry thread!).
3. **Firebase ReCAPTCHA URL Schemes**: In the same tab, under the **Info** tab, add a new **URL Type** for Firebase Authentication. Set the identifier and URL schemes to match the `REVERSED_CLIENT_ID` found inside your `ios/GoogleService-Info.plist` file.

### 3. Compiling Release Archives & TestFlight Submission
1. Select **Any iOS Device (arm64)** as the target device in the top Xcode menu bar.
2. In the top Xcode menu, navigate to **Product** -> **Archive**.
3. Once the archiver completes, click **Distribute App** in the Organizer pop-up window.
4. Select **App Store Connect** and check **Upload** options.
5. iOS will securely sign and upload the build package to TestFlight.
6. Open your [App Store Connect Dashboard](https://appstoreconnect.apple.com/), select the app, assign beta testers under TestFlight, and later submit for App Store Review.

---

## 🗣️ Future Development & Reference Discussions

This section provides structural summaries, reference details, and chat notes compiled from our active architectural alignments to support future engineers working on the Sidekick codebase.

### 1. Micro-Mobility GPS Telemetry Filters
*   **Kalman Noise Filter Engine**: Located in `modules/ride/services/backgroundLocation.service.ts` ([backgroundLocation.service.ts](file:///Users/sahilahmed/cse/projects/sidekick/modules/ride/services/backgroundLocation.service.ts)). It applies matrix tracking states adjusting variance metrics inversely based on GPS precision indexes. The noise threshold coefficient ($Q$) is set to `3.0` (metres per second) representing typical urban walking/scooter drift rates.
*   **SQLite-to-MMKV Failback Design**: Defined in `modules/ride/services/sqlite.service.ts` ([sqlite.service.ts](file:///Users/sahilahmed/cse/projects/sidekick/modules/ride/services/sqlite.service.ts)). The system checks if `react-native-sqlite-storage` or `expo-sqlite` are accessible. If absent, `isFallbackMode` switches to `true`, converting query calls (e.g. `saveCoordinate()`, `getUnsyncedRides()`) into key-value sets mapping time-series coordinate arrays under MMKV keys.

### 2. Frontend-to-Backend GraphQL Contract
*   **Sync Mutations**:
    - **Ride Sync**:
      ```graphql
      mutation SyncLocalRide($id: uuid!, $scooter_id: uuid!, $start_time: timestamp!, $end_time: timestamp, $status: String!, $total_distance: numeric!) {
        sync_local_ride(object: { id: $id, scooter_id: $scooter_id, start_time: $start_time, end_time: $end_time, status: $status, total_distance: $total_distance }) {
          id
          status
        }
      }
      ```
    - **Telemetry Sync**:
      ```graphql
      mutation SyncCoordinatesBatch($objects: [ride_coordinates_insert_input!]!) {
        sync_ride_coordinates(objects: $objects) {
          affected_rows
        }
      }
      ```

### 3. Payment Gateway Native Integration
*   **Easebuzz XCFramework**: The local Easebuzz wrapper library requires the presence of `ios/Easebuzz.xcframework` ([Easebuzz.xcframework](file:///Users/sahilahmed/cse/projects/sidekick/ios/Easebuzz.xcframework)) inside the iOS project workspace structure. It utilizes native objective-c/swift bridges, so any changes to the payment kit require cleaning project targets and rebuilds via `npx react-native run-ios`.

---

> [!TIP]
> Keep this document handy in the repository root directory as a reference manual for onboarding new mobile and backend engineering teams.
