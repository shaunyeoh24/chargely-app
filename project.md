# Chargely

EV charging and mileage tracking web app.

---

## Vision

Chargely is:
- A learning vehicle (React + system architecture)
- A personal EV ownership analytics tool
- Future-extensible to mobile (Expo / React Native)
- Architected cleanly from day one

Primary goal: **Ship a usable MVP.**
Secondary goal: **Develop real frontend + system architecture competence.**

---

## Tech Stack (Locked)

- Next.js (App Router)
- TypeScript
- Supabase (Postgres)
- TailwindCSS
- Deploy on Vercel

No stack switching mid-build.

---

## MVP Scope (Multi-Vehicle Enabled)

### Vehicles

User can:

- Create vehicle
  - name (e.g., “Model 3”)
  - make
  - model
  - year
  - battery_capacity_kwh (optional)

- View list of vehicles
- Select active vehicle (context for sessions)
- Delete vehicle (removes all associated charging history)

---

### Charging Sessions

For a selected vehicle:

User can:

- Add charging session:
  - date
  - kWh added
  - total cost (RM)
  - odometer (km)

- View sessions in table (sorted by date descending)
- Switch active vehicle directly from the sessions view
- Edit previously logged session data (date, kWh, cost, odometer)

---

### Auto Calculations (Per Vehicle)

- RM per kWh
- Wh per km (between sessions)
- Cost per 100km
- Running averages
- Aggregated totals per vehicle

---

### Basic Analytics

- Efficiency trend chart (Wh/km), or
- Cost per 100km trend

Filtered by selected vehicle.

---

## Explicit Non-Goals (MVP)

- No social features
- No complex authentication (single user for now)
- No tariff engine
- No battery degradation modelling
- No offline-first architecture
- No role-based access control

---

## Architecture Principles

Clean separation between:

### 1. UI Layer
- React components
- No direct DB calls inside components
- Receives data via props

### 2. Business Logic Layer
- Pure calculation utilities
- No UI code
- No Supabase imports

### 3. Data Layer
- Supabase client
- CRUD services (Create, Read, Update, Delete)
- Responsible for querying and managing data by vehicle_id
- Handles cascading deletions for vehicles and sessions in the service layer

Frontend is replaceable.
Backend schema is stable.

---

## Database Schema (Supabase)

### Table: vehicles

- id (uuid, primary key)
- name (text, not null)
- make (text)
- model (text)
- year (int)
- battery_capacity_kwh (numeric)
- created_at (timestamp, default now())

---

### Table: charging_sessions

- id (uuid, primary key)
- vehicle_id (uuid, foreign key → vehicles.id)
- date (date, not null)
- kwh (numeric, not null)
- cost_rm (numeric, not null)
- odometer_km (numeric, not null)
- created_at (timestamp, default now())

---

## Folder Structure
