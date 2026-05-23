# Sidekick: Offline-First Geolocation Tracking & Sharing Engine

Sidekick is a premium, senior-grade mobile application and self-contained local backend designed to facilitate resilient geospatial location tracking, route mapping, and transaction history. Inspired by high-end telemetry sharing platforms like Strava, Sidekick supports high-fidelity route composting, automated path simplification, and offline-first database synchronization.

---

## 🚀 Core Features

### 1. Robust Location Tracking & Geodesic Fallbacks
* **High-Precision Geodesics**: Integrated mathematics utilities dynamically calculate accurate distances using the **Haversine formula** across successive GPS logs.
* **Kalman Filtering**: Eliminates high-frequency GPS jitter and sudden measurement spikes to produce smooth, physical-prediction-aligned route coordinates.
* **Douglas-Peucker Simplification**: Smooths path vectors by downsampling dense coordinate arrays, allowing fast canvas drawings and high-performance SVG maps with zero loss in visual accuracy.

### 2. High-Fidelity Composting & Watermark Share Engine
* **Platform-Agnostic HTML5 Canvas Composting**: Employs an isolated, lightweight HTML5 canvas within a hidden Web View to overlay completed ride routes, glowing vector paths, translucent glassmorphic dark gradients, and crisp white details.
* **Premium Gradients & Camera Viewfinder**: Interfaces with native cameras or falls back to customized cyberpunk, sunset, carbon, and forest gradient backgrounds.
* **Native Share Sheets**: Prompts quick downloads, clipboard copies, or external social sharing via native iOS/Android sharing sheets.

### 3. Self-Contained Local GraphQL Backend (`sidekick-backend/`)
* **Zero-Setup Server**: Built on Fastify + Mercurius (GraphQL) to require no external Docker containers, remote credentials, or configuration overhead.
* **Embedded SQLite Database**: Auto-seeds relational database schemas with mock users, wallets, scooters, and hubs on initialization.
* **Interactive GraphiQL IDE**: Access an interactive explorer playground directly at `http://localhost:3000/graphiql`.

---

## 🧪 Testing Suite

Sidekick implements a thorough unit and widget testing environment to support rigorous Test-Driven Development (TDD) principles.

* **Component Unit Tests**: Built with **React Native Testing Library (RNTL)** to verify layout structure, timezone-independent Luxon date-time renders, Rupees/Credits formatting conditions, and Touch callback bindings.
* **Mathematical Utilities Validation**: Comprehensive suites covering GPS noise filtering, coordinate reductions, and geodesic distance meters.

---

## 💻 Getting Started

### 1. Launch the Local Backend
Navigate to the backend folder and start the server:
```sh
cd sidekick-backend
npm install
npm run dev
```

### 2. Launch the Mobile Client
From the root of the project, start the Metro dev server:
```sh
npm install
npm start
```
In a separate terminal window, compile and run the app for your preferred platform:
* **Android**: `npm run android`
* **iOS**: `bundle exec pod install` && `npm run ios`

### 3. Run the Jest Test Suite
Verify that all unit tests and component layouts pass:
```sh
npm test
```
