# RetroVision — NHAI Retroreflectivity Intelligence Platform

## Overview

Full-stack web application for NHAI's 6th Innovation Hackathon. AI-powered platform for measuring, monitoring, and maintaining the retroreflectivity of road signs, pavement markings, and road studs across Indian National Highways.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/retro-vision) — dark-mode dashboard
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Charts**: Recharts

## Key Features

- **Live Dashboard** — compliance rate, critical findings, avg reflectivity, trend charts
- **Measurements** — full CRUD for retroreflectivity readings with condition filters
- **Asset Inventory** — road signs, pavement markings, road studs management
- **Inspection Routes** — highway route management with per-route compliance stats
- **Alerts Center** — critical/warning compliance alerts with resolve workflow
- **Reports** — generate and download inspection reports
- **AI Analyzer** — image URL analysis for retroreflectivity estimation

## IRC Standards

- IRC 67: Traffic signs (minimum 150 mcd/lx/m²)
- IRC 35: Pavement markings (minimum 100 mcd/lx/m² for centre line)

## Measurement Conditions

day_dry, day_wet, night_dry, night_wet, foggy, no_street_light, with_street_light

## Measurement Methods

vehicle_mounted, drone, handheld, ai_camera

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema Tables

- `routes` — highway inspection routes
- `signs` — road signs, markings, studs, delineators
- `measurements` — retroreflectivity readings
- `alerts` — compliance alerts
- `reports` — inspection reports

## Notes

- api-zod codegen overwrites `lib/api-zod/src/index.ts` — fixed via post-orval echo in codegen script
- API server serves at `/api`
- Frontend at `/` (root)
