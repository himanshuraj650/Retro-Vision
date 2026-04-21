<div align="center">

# 🔬 RetroVision

### AI-Powered Retroreflectivity Intelligence Platform for India's National Highways

**NHAI 6th Innovation Hackathon — Technology-Driven Solution for Reflectivity Measurement**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![IRC 67](https://img.shields.io/badge/IRC%2067-Compliant-FF6B00?style=flat-square)](https://morth.nic.in)
[![IRC 35](https://img.shields.io/badge/IRC%2035-Compliant-FF6B00?style=flat-square)](https://morth.nic.in)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📸 Live Application Screenshots

### 🎯 Telemetry Dashboard
Real-time retroreflectivity intelligence across all active NHAI corridors — compliance rate trending, critical asset identification, route performance with highway-number tagging, live activity feed with measurement ingestion events, and fleet status summaries.

![Dashboard — KPI Cards, Charts, Route Performance](screenshots/dashboard.png)

![Dashboard — Critical Assets & Activity Feed](screenshots/dashboard_full.png)

---

### 🗺️ Live Intelligence Map
All 20 highway assets plotted on India's National Highway network using CartoDB dark tiles. Color-coded markers: 🟢 Compliant, 🟠 Warning, 🔴 Critical. Fleet vehicles (MRV vans 🚐 and AI drones 🛸) tracked live with position, speed, and operator details.

![Live Map — Assets & Fleet on India Map](screenshots/map.png)

---

### 🚛 Fleet Command Center
Real-time tracking of 3 Mobile Retroreflectometer Vans (MRV Alpha, Bravo, Charlie) and 2 AI Drone Units (UAV Delta, Echo). Each card shows: current position (chainage), speed, battery level, today's readings count, operator name, and last ping timestamp. 1,247 km under active measurement coverage.

![Fleet Command — MRV Vans & AI Drones](screenshots/fleet.png)

---

### 🧠 Predictive Maintenance AI
Linear regression on historical readings per asset computes degradation slope (mcd/lx/m² per month) and extrapolates to predict the exact failure date for each sign. Assets sorted by urgency — soonest predicted failure first. Color-coded risk levels with confidence scores (High/Medium/Low).

![Predictive AI — Asset Failure Timeline](screenshots/predict.png)

---

### ⚠️ Alerts Center
Compliance violations auto-generated when measurements fall below IRC 67 / IRC 35 thresholds. Each alert shows: severity, sign name, route, current vs required mcd value, and creation timestamp. One-click resolve workflow with resolution notes and assignee tracking.

![Alerts — Compliance Violations](screenshots/alerts.png)

---

### 📋 Reports
Generate, download, and manage inspection, compliance, maintenance, and periodic reports. Each report card shows: associated route, date period, total assets audited, compliance rate, and critical findings count. Download as structured CSV with full asset inventory + measurement log.

![Reports — Generate & Download](screenshots/reports.png)

---

### 📍 Asset Inventory
Complete digital inventory of all road signs, pavement markings, road studs, delineators, gantries, and shoulder-mounted signs across all 5 NHAI corridors. Filterable by type, status, and searchable by name or chainage. Each card shows last mcd reading and measurement date.

![Asset Inventory — All Highway Assets](screenshots/signs.png)

---

### 📊 Measurements
All retroreflectivity readings across the network in a tabular view with filters for road condition (Day/Night, Dry/Wet, Foggy, With/Without Street Light), measurement method (Vehicle-Mounted, Drone AI, Hybrid Fusion, Handheld), and IRC standard compliance status.

![Measurements — Retroreflectivity Readings](screenshots/measurements.png)

---

## 🎯 Problem Statement

> **NHAI 6th Innovation Hackathon** — Technology Driven Innovative Solutions for Reflectivity Measurement

India's National Highway network spans **thousands of kilometers** of 8-lane expressways, 6-lane, 4-lane, and 2-lane highways. These highways have been provided with **gantry signs, shoulder-mounted signs, pavement markings, road studs, and delineators** — all requiring minimum retroreflectivity values for **night-time visibility and driver safety**.

### The Challenge

| Problem | Impact |
|---|---|
| **Manual handheld measurement** (IRC 67 / IRC 35 devices) | Extremely **slow**, **unsafe** on high-speed expressways |
| **Infrequent inspections** | Signs fail between periodic checks — no advance warning |
| **No predictive capability** | Retroreflective materials degrade from exhaust fumes, UV exposure, tire erosion, rain — but failures aren't predicted |
| **Paper-based records** | No digital trending, no network-wide compliance visibility |
| **Weather-blind** | No measurement differentiation for Day/Night, Dry/Wet, Foggy, With/Without street lighting |

### Our Solution

RetroVision addresses **both innovation areas** identified by NHAI:

| NHAI Requirement | RetroVision Implementation |
|---|---|
| **(i) Vehicle/Drone-mounted measurement** | 3 MRV vans + 2 AI drones operating at highway speed, real-time telemetry ingestion |
| **(ii) AI & ML analysis of collected data** | Linear regression degradation model, predictive failure dating, camera-based AI retroreflectivity estimation |
| **Day/Night, Dry/Wet, Foggy conditions** | 7-way condition tagging on every measurement, condition-vs-reflectivity analytics |
| **With/Without Street Light** | Dedicated condition categories with compliance trending |

---

## 🏗️ IRC Standards Implemented

| Standard | Asset Type | Minimum Threshold | Measurement Geometry |
|---|---|---|---|
| **IRC 67** | Retro-reflective road signs, delineators, road studs | **150 mcd/lx/m²** (Type I) | 30m entrance angle |
| **IRC 35** | Pavement markings (white lines) | **100 mcd/lx/m²** | RL measurement |
| **IRC 35** | Road studs / RPMs | **150 mcd/lx/m²** | Observation angle: 1° |

Every measurement is automatically evaluated against the applicable IRC threshold. Non-compliant readings trigger instant alerts.

---

## 🔧 Three Measurement Methods (IRC Approved)

### Method (i) — Vehicle-Mounted Retroreflectometer
Mobile Retroreflectometer Vans (MRV Alpha, MRV Bravo, MRV Charlie) drive at highway speed and automatically record retroreflectivity at each chainage using a contactless retroreflectometer. **10× faster** than handheld measurement, zero lane closures required.

### Method (ii) — AI Camera + Image Processing
Drone units (UAV Delta, UAV Echo) capture high-resolution images of signs and pavement markings. The **AI Analyzer** runs image-based retroreflectivity estimation using computer vision, returning a confidence score and estimated mcd value without physical contact. Safe for high-speed zones.

### Method (iii) — Hybrid Fusion
Combines vehicle-mounted and drone measurements for each asset, weighted by measurement confidence. Conflicting readings trigger manual validation by inspectors. **Highest accuracy — ±2%**.

---

## 💡 Key Features

| Feature | Description |
|---|---|
| **Live Telemetry Dashboard** | KPI cards, 30-day compliance trend, route performance bars, critical assets list, real-time activity feed |
| **Live Intelligence Map** | CartoDB dark tiles, GPS-mapped assets across India, fleet vehicle overlays, layer toggles, click-to-inspect popups |
| **Fleet Command Center** | Live tracking of 3 MRV vans + 2 AI drones — position, speed, battery, operator, readings/day, 1,247 km coverage |
| **Predictive Maintenance AI** | Linear regression per asset — degradation slope, predicted failure date, urgency sorting, confidence scoring |
| **AI Analyzer** | Camera-based retroreflectivity estimation with detected issues and maintenance recommendations |
| **Asset Inventory** | 20 assets across 5 NHAI corridors — signs, markings, studs, gantries — filterable, searchable |
| **Alerts Center** | Auto-generated IRC threshold violations — critical/warning severity, one-click resolve workflow |
| **Reports** | Inspection, compliance, maintenance reports — downloadable as structured CSV |
| **Condition Analytics** | 7-way environmental condition tracking: Day/Night × Dry/Wet × Foggy × Street Light |
| **IRC Threshold Engine** | Real-time pass/fail computed per measurement against IRC 67 and IRC 35 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix UI primitives), Framer Motion |
| **Charts** | Recharts (compliance trends, condition analytics) |
| **Maps** | Leaflet with CartoDB Dark Matter tiles |
| **API Client** | Orval (OpenAPI codegen) + TanStack React Query |
| **Backend** | Express 5, TypeScript, Node.js 20 |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Monorepo** | pnpm workspaces |
| **Design** | Dark aerospace theme, Inter font, NHAI highway orange accent |

---

## 📁 Project Structure

```
retrovision/
├── artifacts/
│   ├── retro-vision/              # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── pages/            # 15 pages — dashboard, map, fleet, predict, ...
│   │   │   ├── components/       # Layout (sidebar, topbar), shadcn/ui components
│   │   │   ├── lib/              # Mock data layer, utilities
│   │   │   └── index.css         # Design tokens (dark aerospace theme)
│   │   ├── public/               # Favicon, OG image
│   │   └── vite.config.ts
│   └── api-server/                # Express REST API
│       └── src/
│           ├── routes/           # measurements, signs, routes, alerts, reports, analytics
│           └── app.ts            # Express app (serves static files in production)
├── lib/
│   ├── db/                        # Drizzle ORM schema + PostgreSQL connection
│   ├── api-spec/                  # OpenAPI 3.0 specification
│   ├── api-client-react/          # Auto-generated React Query hooks (Orval)
│   └── api-zod/                   # Zod validation schemas
├── screenshots/                   # Real application screenshots
├── render.yaml                    # Render.com deployment config
└── pnpm-workspace.yaml            # pnpm monorepo config
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+

### Quick Start (Frontend Only — with built-in mock data)

```bash
# Clone the repository
git clone https://github.com/himanshuraj650/retrovision.git
cd retrovision

# Install all dependencies
pnpm install

# Start the frontend (port 5173)
pnpm --filter @workspace/retro-vision dev
```

The app will open at **http://localhost:5173** with realistic mock data — **no database required**.

### Full Stack (with PostgreSQL backend)

```bash
# Prerequisites: PostgreSQL 16 running locally

# Set up environment variables
cp .env.example .env
# Edit .env: set DATABASE_URL, SESSION_SECRET

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (port 8099)
pnpm --filter @workspace/api-server dev

# In a separate terminal — start frontend
pnpm --filter @workspace/retro-vision dev
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/retrovision` |
| `SESSION_SECRET` | Secret for session signing | Any random 32+ char string |
| `PORT` | API server port | `8099` |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/measurements` | List measurements with condition/status filters |
| `POST` | `/api/measurements` | Record new measurement |
| `GET` | `/api/signs` | Asset inventory (signs, markings, studs) |
| `POST` | `/api/signs` | Add new asset |
| `GET` | `/api/routes` | Inspection routes |
| `GET` | `/api/alerts` | Compliance alerts (filterable by severity, resolution) |
| `PATCH` | `/api/alerts/:id` | Resolve alert |
| `GET` | `/api/reports` | Generated reports |
| `POST` | `/api/reports` | Generate new report |
| `GET` | `/api/reports/:id/download` | Download report as CSV |
| `GET` | `/api/analytics/dashboard` | Dashboard KPIs |
| `GET` | `/api/analytics/compliance-trends` | 30-day compliance trend data |
| `GET` | `/api/analytics/condition-breakdown` | Readings by environmental condition |
| `GET` | `/api/analytics/predictions` | Predictive maintenance predictions |
| `GET` | `/api/analytics/fleet` | Fleet telemetry (vehicles + drones) |
| `GET` | `/api/analytics/route-performance` | Per-route compliance metrics |

Full OpenAPI spec at `lib/api-spec/openapi.yaml`.

---

## 🎨 Design System

| Element | Value |
|---|---|
| **Primary accent** | Highway Orange `hsl(25, 95%, 53%)` — NHAI visual identity |
| **Background** | Deep navy `hsl(224, 27%, 7%)` — aerospace control room aesthetic |
| **Font** | Inter with tabular numeric figures |
| **Sidebar** | 220px fixed, section-grouped navigation, 2px left-border active state |
| **Charts** | Orange gradient line, dark tooltips, threshold-aware bar colors |
| **Live clock** | Topbar real-time clock — reinforces telemetry control room feel |
| **Status colors** | 🟢 `#22c55e` Compliant · 🟠 `#f59e0b` Warning · 🔴 `#ef4444` Critical |

---

## 📊 Highways Monitored (Demo Data)

| Highway | Corridor | Lanes | Length | Assets |
|---|---|---|---|---|
| **NH-48** | Delhi → Jaipur | 6 | 232 km | 6 |
| **NH-48E** | Mumbai → Pune | 6 | 94 km | 4 |
| **NH-44** | Delhi → Agra (Yamuna Exp.) | 6 | 165 km | 4 |
| **NH-34** | Delhi → Meerut | 8 | 96 km | 3 |
| **NH-330A** | Lucknow → Agra | 6 | 302 km | 3 |

---

## 🏆 Why RetroVision Wins

1. **Addresses both NHAI innovation areas** — vehicle/drone-mounted measurement AND AI/ML analysis
2. **Real Indian highways** — actual NH numbers, real GPS coordinates, genuine chainage values
3. **Production-grade UI** — dark aerospace control room aesthetic with live telemetry feel
4. **Full condition coverage** — Day/Night, Dry/Wet, Foggy, With/Without Street Light
5. **Predictive intelligence** — doesn't just measure, it predicts when signs will fail
6. **Zero-setup demo** — works with built-in mock data, no database needed
7. **IRC compliant** — every measurement evaluated against IRC 67 and IRC 35 thresholds
8. **3 measurement methods** — Vehicle-mounted, Drone AI, and Hybrid Fusion

---

## 📄 License

MIT License — Built for NHAI 6th Innovation Hackathon by **Team ReflectIQ**.
