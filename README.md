# RetroVision — AI-Powered Retroreflectivity Intelligence Platform

> **NHAI 6th Innovation Hackathon Submission**  
> Measuring, analyzing, monitoring, and predicting retroreflectivity of road signs, pavement markings, and road studs across India's National Highways.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org)
[![IRC 67](https://img.shields.io/badge/Standard-IRC%2067-orange)](https://morth.nic.in)
[![IRC 35](https://img.shields.io/badge/Standard-IRC%2035-orange)](https://morth.nic.in)

---

## Screenshots

### Telemetry Dashboard
Real-time retroreflectivity intelligence across all active routes — compliance trends, critical assets, route performance, and live activity feed.

![Dashboard](screenshots/dashboard.jpg)

---

### Live Intelligence Map
All 12 assets plotted on India's National Highway network with CartoDB dark tiles. Color-coded markers (green/amber/red) for compliance status, with live fleet vehicle overlays.

![Live Map](screenshots/map.jpg)

---

### Fleet Command Center
Real-time tracking of Mobile Retroreflectometer Vans (MRVs) and AI drone units. Shows position, speed, battery level, operator, and readings per vehicle.

![Fleet Command](screenshots/fleet.jpg)

---

### Predictive Maintenance AI
Linear regression on historical readings per asset to compute degradation slope and predict the exact date each sign will breach its IRC 67/IRC 35 threshold.

![Predictive AI](screenshots/predict.jpg)

---

### Alerts Center
Compliance violations auto-generated when measurements fall below IRC thresholds — critical alerts highlighted with left-border color coding, one-click resolve.

![Alerts](screenshots/alerts.jpg)

---

### Reports
Generate, download, and manage inspection, compliance, maintenance, and periodic reports. Downloads as structured CSV with asset inventory + measurement log.

![Reports](screenshots/reports.jpg)

---

## Problem Statement

India's National Highways carry enormous traffic at high speeds. Road signs, pavement markings, and road studs must maintain minimum retroreflectivity values to ensure night-time visibility and driver safety. Traditional manual inspection is:

- **Infrequent** — measured only during periodic inspections
- **Non-predictive** — no advance warning before a sign fails IRC threshold  
- **Siloed** — no network-wide visibility or historical trending
- **Paper-based** — no systematic digital record or compliance tracking

RetroVision solves this by continuously ingesting retroreflectivity measurements, computing compliance against IRC 67 and IRC 35 standards in real-time, and using machine learning to predict which assets will fail next.

---

## IRC Standards Implemented

| Standard | Asset Type | Minimum Threshold |
|---|---|---|
| IRC 67 | Retro-reflective road signs | 150 mcd/lx/m² (Type I) |
| IRC 35 | Pavement markings | 100 mcd/lx/m² (white lines) |
| IRC 35 | Road studs / delineators | 150 mcd/lx/m² |

---

## Three Measurement Methods

RetroVision implements all three IRC-approved retroreflectivity measurement methods:

### Method (i) — Vehicle-Mounted Retroreflectometer
Mobile Retroreflectometer Vans (MRV Alpha, MRV Bravo, MRV Charlie) drive at highway speed and automatically record retroreflectivity at each chainage using a contactless retroreflectometer. Readings are ingested in real-time to the database.

**Fleet Command Center** tracks all MRV units live — position, speed, battery, operator, readings today.

### Method (ii) — AI Camera + Image Processing
Drone units (UAV Delta, UAV Echo) capture high-resolution images of signs and pavement markings. The AI Analyzer page runs image-based retroreflectivity analysis using computer vision, returning a confidence score and estimated mcd value without physical contact.

**Predictive AI** (also Method ii): Uses linear regression on historical measurement data to compute a degradation slope (mcd/lx/m² per day) and extrapolates to predict the exact failure date for each asset. High-confidence predictions require 5+ historical readings.

### Method (iii) — Hybrid Fusion
The system fuses vehicle-mounted and drone measurements for each asset, weighted by measurement confidence. The Fleet Command Center page documents the three-method approach and the hybrid fusion methodology.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4 |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Charts** | Recharts |
| **Maps** | React-Leaflet with CartoDB Dark Matter tiles |
| **API Client** | Orval (OpenAPI codegen) + TanStack Query |
| **Backend** | Express 5, TypeScript, Node.js 20 |
| **Database** | PostgreSQL 16 with Drizzle ORM |
| **Monorepo** | pnpm workspaces |

---

## Project Structure

```
retrovision/
├── artifacts/
│   ├── retro-vision/          # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── pages/         # 15 pages (dashboard, map, fleet, predict, ...)
│   │   │   ├── components/    # Layout, UI components
│   │   │   └── index.css      # Design tokens (dark aerospace theme)
│   │   └── vite.config.ts
│   └── api-server/            # Express REST API
│       └── src/
│           ├── routes/        # measurements, signs, routes, alerts, reports, analytics
│           └── app.ts         # Express app (serves static files in production)
├── lib/
│   ├── db/                    # Drizzle ORM schema + migrations
│   ├── api-spec/              # OpenAPI 3.0 spec
│   ├── api-client-react/      # Auto-generated React Query hooks
│   └── api-zod/               # Zod validation schemas
├── screenshots/               # App screenshots for documentation
├── render.yaml                # Render.com deployment config
└── pnpm-workspace.yaml
```

---

## Key Features

| Feature | Description |
|---|---|
| **Live Telemetry Dashboard** | KPI cards, compliance trend (30-day), route performance, critical assets, activity feed |
| **Live Intelligence Map** | CartoDB dark tiles, GPS-mapped assets, fleet overlays, layer toggles, click-to-inspect |
| **Fleet Command Center** | Live tracking of 3 MRV vans + 2 AI drones with position, speed, battery, operator |
| **Predictive Maintenance AI** | Linear regression per asset — predicts failure date, sorts by urgency |
| **AI Analyzer** | Camera-based retroreflectivity analysis with confidence scoring |
| **Asset Inventory** | All signs, markings, studs, gantries across all routes — filterable, searchable |
| **Alerts Center** | Auto-generated compliance violations with IRC threshold breach details |
| **Inspection Reports** | Generate, download as CSV (asset inventory + measurement log) |
| **Compliance Trending** | 30-day network-wide compliance charts by environmental condition |
| **IRC Threshold Engine** | Real-time pass/fail computed per measurement against IRC 67/35 |

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16

### Setup

```bash
# Clone the repo
git clone https://github.com/himanshuraj650/retrovision.git
cd retrovision

# Install all dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL and SESSION_SECRET

# Run database migrations
pnpm --filter @workspace/db run db:push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (port 5173)
pnpm --filter @workspace/retro-vision run dev
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/retrovision` |
| `SESSION_SECRET` | Secret for session signing | Any random 32+ char string |
| `PORT` | API server port | `8080` |

---

## Deployment on Render

The `render.yaml` at the repo root defines the complete Render deployment:

1. **Fork/clone this repo** to your GitHub account
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create:
   - A **web service** (API + frontend)
   - A **managed PostgreSQL** database
5. Set `SESSION_SECRET` in the Render dashboard (Environment → Secret Files)
6. Deploy — the build runs `pnpm install`, builds both frontend and API, and starts the server

The Express server serves the React build as static files in production — single service, no CORS issues.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/measurements` | List measurements with filters |
| POST | `/api/measurements` | Record new measurement |
| GET | `/api/signs` | Asset inventory |
| POST | `/api/signs` | Add asset |
| GET | `/api/routes` | Inspection routes |
| GET | `/api/alerts` | Compliance alerts |
| GET | `/api/reports` | Reports list |
| POST | `/api/reports` | Generate report |
| GET | `/api/reports/:id/download` | Download report as CSV |
| GET | `/api/analytics/dashboard` | Dashboard KPIs |
| GET | `/api/analytics/compliance-trends` | 30-day trend data |
| GET | `/api/analytics/predictions` | Predictive maintenance data |
| GET | `/api/analytics/fleet` | Fleet telemetry |
| GET | `/api/analytics/route-performance` | Per-route compliance |

Full OpenAPI spec at `lib/api-spec/openapi.yaml`.

---

## Design System

- **Primary accent**: Highway Orange (`hsl(25, 95%, 53%)`) — referencing NHAI's visual identity
- **Background**: Deep navy (`hsl(224, 27%, 7%)`) — aerospace control room aesthetic
- **Font**: Inter with tabular numeric figures for dashboard readability
- **Active sidebar state**: 2px left border accent — not a filled block
- **Charts**: Custom dark tooltips, orange gradient line, threshold-aware bar colors
- **Live clock** in topbar — reinforces real-time telemetry feel

---

## License

MIT License — built for NHAI 6th Innovation Hackathon.
