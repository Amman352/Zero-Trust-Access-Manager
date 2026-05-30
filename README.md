# Zero Trust Access Manager (ZTAM)

```
███████╗████████╗ █████╗ ███╗   ███╗
╚════██║╚══██╔══╝██╔══██╗████╗ ████║
    ██╔╝   ██║   ███████║██╔████╔██║
   ██╔╝    ██║   ██╔══██║██║╚██╔╝██║
   ██║     ██║   ██║  ██║██║ ╚═╝ ██║
   ╚═╝     ╚═╝   ╚═╝  ╚═╝╚═╝     ╚═╝
```

**Enterprise-grade Zero Trust Authentication Platform with ML-Powered Risk Scoring**

> An AI-powered Identity Access Management system that evaluates every login in real time using behavioral signals and Isolation Forest anomaly detection — automatically adapting MFA requirements, scoring session risk, and logging every security event with full audit trail.

![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![scikit-learn](https://img.shields.io/badge/scikit--learn-Isolation_Forest-orange?style=flat-square&logo=scikit-learn)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## Table of Contents

- [What is ZTAM?](#what-is-ztam)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [ML Model — Isolation Forest](#ml-model--isolation-forest)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [How to Run](#how-to-run)
- [Project Structure](#project-structure)
- [Security Concepts](#security-concepts)
- [CI/CD Pipeline](#cicd-pipeline)
- [Interview Brief](#interview-brief)
- [Author](#author)

---

## What is ZTAM?

Traditional authentication systems operate on a **trust-but-verify** model — once a user logs in, they are trusted for the entire session. This is exactly how credential-based breaches happen. Stolen tokens, session hijacking, and insider threats all exploit this assumption.

**Zero Trust Access Manager** implements a **never trust, always verify** architecture. Every login and every session is scored in real time using:

- Behavioral signals — login hour, device fingerprint, IP address, user agent
- ML-generated anomaly scores via Isolation Forest trained on normal behavior
- Adaptive MFA gating — low risk sessions skip the challenge, high risk sessions are always challenged
- RBAC enforcement at the FastAPI dependency injection layer — not middleware, not the database
- Tamper-evident audit logging of every security event as a typed enum in PostgreSQL

```
User Login → Feature Extraction → Risk Scorer → Isolation Forest → Risk Score
     → Adaptive MFA Decision → Session Created with Score → Audit Logged
```

Unlike black-box systems like Auth0 or Okta's risk engine, ZTAM returns the **exact signals** that triggered every score — making it fully explainable for auditors and compliance teams.

---

## Key Features

| #   | Feature                 | Description                                                                                            |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| 01  | 🔐 JWT Authentication   | OAuth2 + JWT with access/refresh token rotation and Redis-backed blacklisting                          |
| 02  | 🧠 ML Risk Scoring      | Isolation Forest anomaly detection on 5 behavioral features per login event                            |
| 03  | ⚡ Adaptive MFA         | TOTP-based MFA auto-triggered when ML risk score exceeds threshold — not static                        |
| 04  | 👥 RBAC Engine          | 5-tier role system (super_admin → viewer) enforced at FastAPI dependency layer                         |
| 05  | 📡 Session Intelligence | Every session stores risk score, trust score, device fingerprint, and IP                               |
| 06  | 🔍 Explainable AI       | Risk response includes signals array — exact reasons behind every score                                |
| 07  | 📊 SOC Dashboard        | CrowdStrike-inspired React dashboard with threat feed, charts, session monitor                         |
| 08  | 🐳 Docker               | Full 7-service stack booted with one command — postgres, redis, backend, frontend, prometheus, grafana |
| 09  | ⚙️ CI/CD                | GitHub Actions pipeline — lint, type check, 8 unit tests on every pull request                         |
| 10  | 📈 Prometheus + Grafana | API metrics auto-scraped and visualized in real time                                                   |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│          React Dashboard · Admin Panel · 3rd Party Apps             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY (Nginx)                           │
│          Rate limiting · JWT validation · SSL termination           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CORE SERVICES (FastAPI)                          │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │
│  │ Auth Service│  │ MFA Service │  │ RBAC Service│  │ Sessions │  │
│  │ OAuth2·JWT  │  │ TOTP·WebAu  │  │ Roles·IAM   │  │ Monitor  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘  │
│                                                                     │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │      Risk Engine        │  │         Audit Logger            │  │
│  │  Geo · Device · Behavior│  │  Events · Access Logs · Timeline│  │
│  └─────────────────────────┘  └─────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          ML ENGINE                                  │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │ Anomaly Detector │  │  Rule Scorer     │  │Behavior Analyzer│   │
│  │ Isolation Forest │  │ Weighted Signals │  │  Time-series    │   │
│  └──────────────────┘  └──────────────────┘  └─────────────────┘   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                 │
│                                                                     │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  PostgreSQL  │  │   Redis    │  │Elasticsearch │  │  Celery  │  │
│  │  Primary DB  │  │  Sessions  │  │  Audit Logs  │  │  Workers │  │
│  └──────────────┘  └────────────┘  └──────────────┘  └──────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   INFRASTRUCTURE & DEPLOYMENT                       │
│                                                                     │
│  ┌──────────┐  ┌────────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │  Docker  │  │ GitHub Actions │  │    Render    │  │Prometheus│  │
│  │ Compose  │  │    CI/CD       │  │  Cloud Deploy│  │ +Grafana │  │
│  └──────────┘  └────────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ML Model — Isolation Forest

### Why Isolation Forest?

Standard fraud detection requires **labelled attack data** — thousands of confirmed breach examples. This data is nearly impossible to obtain for a new system with no history. Isolation Forest solves this with **fully unsupervised anomaly detection**.

It never sees attack examples. Instead:

1. It learns the shape of **normal login behavior** from training data
2. New logins are scored by how different they are from that normal cluster
3. Anomalies are **isolated in few random splits** — normal points sit deep in the cluster and need many splits to isolate

This means ZTAM detects **zero-day credential attacks it has never seen before** — including novel brute force patterns, impossible travel, and off-hours access from new devices.

### Dataset

No external dataset was used. Training data was **synthetically generated** to represent normal enterprise user login behavior — a standard approach in production security systems where real breach data is unavailable or classified.

```python
# backend/app/ml/train.py — generate_training_data()
np.column_stack([
    np.random.normal(13, 3, n).clip(6, 22),    # login_hour: clustered around 1pm
    np.random.poisson(0.1, n).clip(0, 2),       # failed_attempts: nearly zero
    np.random.binomial(1, 0.1, n),              # is_new_device: 10% chance
    np.random.binomial(1, 0.7, n),              # has_mfa: 70% of users enrolled
])
```

A normal user logs in during business hours, from a known device, with near-zero failure rate, and with MFA enabled. This cluster defines "normal." Any login that deviates significantly — 3AM, 5 failures, unknown device, bot user agent — gets a high anomaly score.

As real login data accumulates in PostgreSQL, the model is designed to retrain on actual user patterns, reducing false positives significantly over time.

### The 5 Risk Features

| Feature                 | Type     | Normal                       | Suspicious                   |
| ----------------------- | -------- | ---------------------------- | ---------------------------- |
| `login_hour`            | int 0–23 | 8–20 (business hours)        | 0–5 (off-hours)              |
| `failed_attempts`       | int      | 0–1                          | 5+ (brute force pattern)     |
| `is_new_device`         | 0 or 1   | 0 — known device fingerprint | 1 — unrecognized device      |
| `has_mfa`               | 0 or 1   | 1 — MFA enrolled             | 0 — unprotected account      |
| `user_agent_suspicious` | 0 or 1   | 0 — real browser             | 1 — bot/script/curl detected |

### Risk Score Tiers

| Score    | Level    | Color | Adaptive Action                      |
| -------- | -------- | ----- | ------------------------------------ |
| 0 – 19   | LOW      | 🟢    | Session created, no MFA challenge    |
| 20 – 49  | MEDIUM   | 🟡    | MFA recommended                      |
| 50 – 79  | HIGH     | 🟠    | MFA required before session granted  |
| 80 – 100 | CRITICAL | 🔴    | MFA required + admin alert triggered |

### Explainable AI Output

Unlike black-box systems, ZTAM returns the **exact reasoning** behind every score:

```json
{
  "risk_score": 72,
  "risk_level": "high",
  "signals": ["new_device", "unusual_hour", "no_mfa"],
  "requires_mfa": true,
  "block_login": false
}
```

Security teams and auditors can see **exactly why** a session was flagged — not just that it was.

### Model Parameters

```python
IsolationForest(
    n_estimators=100,    # number of isolation trees in the ensemble
    contamination=0.1,   # expect 10% of logins to be anomalous
    random_state=42,     # reproducible results across restarts
    n_jobs=-1,           # use all CPU cores — optimized for Apple M2
)
```

---

## Tech Stack

### Backend

| Technology                        | Version | Purpose                                                         |
| --------------------------------- | ------- | --------------------------------------------------------------- |
| Python                            | 3.11    | Core language — native M2 ARM64 support                         |
| FastAPI                           | 0.109   | Async web framework — auto-generates OpenAPI/Swagger docs       |
| SQLAlchemy                        | 2.0     | Async ORM with connection pooling                               |
| Alembic                           | 1.13    | Database migrations — every schema change version controlled    |
| Pydantic                          | 2.6     | Request/response validation with complete type safety           |
| python-jose                       | 3.3     | JWT encoding and decoding (OAuth2 standard)                     |
| passlib + bcrypt                  | 1.7     | Password hashing — intentionally slow to defeat brute force     |
| pyotp                             | 2.9     | TOTP-based MFA — compatible with Google Authenticator and Authy |
| redis                             | 5.0     | Token blacklisting — enables real-time session revocation       |
| celery                            | 5.3     | Background task queue for async ML retraining jobs              |
| prometheus-fastapi-instrumentator | 6.1     | Auto-expose /metrics endpoint for Prometheus scraping           |

### ML & Data Science

| Technology   | Version | Purpose                                                  |
| ------------ | ------- | -------------------------------------------------------- |
| scikit-learn | 1.4     | Isolation Forest unsupervised anomaly detection          |
| numpy        | 1.26    | Feature vector construction and matrix operations        |
| pandas       | 2.2     | Training data manipulation and feature engineering       |
| joblib       | 1.3     | Serialize trained model to disk for persistent inference |

### Frontend

| Technology   | Version | Purpose                                                            |
| ------------ | ------- | ------------------------------------------------------------------ |
| React        | 18      | Component-based enterprise dashboard UI                            |
| Vite         | 5       | Build tool — 10x faster than Create React App on M2                |
| Tailwind CSS | 3       | Utility-first styling — pure black enterprise SOC theme            |
| Recharts     | 2       | Area charts, bar charts, pie charts, line graphs — all data-driven |
| Zustand      | 4       | Lightweight global auth state — no Redux boilerplate               |
| Axios        | 1.6     | HTTP client with JWT interceptors and auto-logout on 401           |
| React Router | 6       | Client-side navigation with protected private routes               |

### Infrastructure

| Technology       | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| PostgreSQL 15    | Primary relational database — users, sessions, audit logs |
| Redis 7          | JWT token blacklist and session cache                     |
| Elasticsearch 8  | Full-text audit log search and filtering                  |
| Docker + Compose | Orchestrates all 7 services locally with one command      |
| GitHub Actions   | CI/CD — linting, testing, and Docker build on every PR    |
| Prometheus       | Scrapes /metrics from backend API every 15 seconds        |
| Grafana          | Visualizes Prometheus metrics in configurable dashboards  |
| Render.com       | Free-tier cloud deployment for portfolio access           |

---

## Database Schema

```sql
-- Users — core identity table
CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 VARCHAR(255) UNIQUE NOT NULL,
  username              VARCHAR(100) UNIQUE NOT NULL,
  hashed_password       VARCHAR(255) NOT NULL,
  full_name             VARCHAR(255),
  role                  user_role DEFAULT 'user',
  -- Roles: super_admin | admin | manager | user | viewer
  status                user_status DEFAULT 'pending',
  -- Statuses: active | inactive | suspended | pending
  mfa_enabled           BOOLEAN DEFAULT false,
  mfa_secret            VARCHAR(255),         -- encrypted TOTP secret
  failed_login_attempts INT DEFAULT 0,
  last_login_at         TIMESTAMPTZ,
  last_login_ip         VARCHAR(45),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Sessions — every login creates a tracked, scored session
CREATE TABLE user_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token_jti      VARCHAR(255) UNIQUE NOT NULL,  -- JWT ID for blacklisting
  refresh_token_jti     VARCHAR(255) UNIQUE,
  ip_address            VARCHAR(45),
  user_agent            TEXT,
  device_fingerprint    VARCHAR(255),
  location_country      VARCHAR(100),
  location_city         VARCHAR(100),
  risk_score            FLOAT DEFAULT 0.0,             -- ML output 0–100
  trust_score           FLOAT DEFAULT 100.0,           -- inverse of risk_score
  is_active             BOOLEAN DEFAULT true,
  mfa_verified          BOOLEAN DEFAULT false,
  revoked_at            TIMESTAMPTZ,
  revoke_reason         VARCHAR(255),
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- Audit logs — immutable, typed, queryable event record
CREATE TABLE audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  action         audit_action NOT NULL,    -- typed enum, see below
  resource       VARCHAR(255),
  ip_address     VARCHAR(45),
  user_agent     TEXT,
  extra_metadata JSONB,                    -- flexible JSON event payload
  risk_score     FLOAT DEFAULT 0.0,
  created_at     TIMESTAMPTZ DEFAULT now()
);
```

### AuditAction Enum Values

```
LOGIN_SUCCESS · LOGIN_FAILED · LOGOUT · TOKEN_REFRESHED · TOKEN_REVOKED
MFA_ENABLED · MFA_DISABLED · MFA_CHALLENGE_SUCCESS · MFA_CHALLENGE_FAILED
USER_CREATED · USER_UPDATED · USER_DELETED · PASSWORD_CHANGED · PASSWORD_RESET
ROLE_ASSIGNED · ROLE_REMOVED · PERMISSION_DENIED
SUSPICIOUS_ACTIVITY · ACCOUNT_LOCKED · SESSION_REVOKED
```

---

## API Reference

Full interactive documentation available at `http://localhost:8000/docs` (Swagger UI) after running locally.

### Authentication

| Method | Endpoint                | Auth   | Description                                |
| ------ | ----------------------- | ------ | ------------------------------------------ |
| POST   | `/api/v1/auth/register` | None   | Create new user account with validation    |
| POST   | `/api/v1/auth/login`    | None   | Login — returns JWT tokens + ML risk score |
| GET    | `/api/v1/auth/me`       | Bearer | Get currently authenticated user profile   |

### MFA

| Method | Endpoint                   | Auth   | Description                                    |
| ------ | -------------------------- | ------ | ---------------------------------------------- |
| POST   | `/api/v1/auth/mfa/setup`   | Bearer | Generate TOTP secret and QR code URI           |
| POST   | `/api/v1/auth/mfa/verify`  | Bearer | Verify 6-digit code and activate MFA           |
| POST   | `/api/v1/auth/mfa/disable` | Bearer | Disable MFA — requires valid current TOTP code |

### Users

| Method | Endpoint             | Auth   | Description                                 |
| ------ | -------------------- | ------ | ------------------------------------------- |
| GET    | `/api/v1/users/`     | Admin  | List all users — admin and super_admin only |
| GET    | `/api/v1/users/me`   | Bearer | Get own full profile                        |
| PATCH  | `/api/v1/users/me`   | Bearer | Update own profile fields                   |
| GET    | `/api/v1/users/{id}` | Admin  | Get any user by UUID                        |

### Sessions

| Method | Endpoint                | Auth   | Description                               |
| ------ | ----------------------- | ------ | ----------------------------------------- |
| GET    | `/api/v1/sessions/`     | Bearer | List all active sessions for current user |
| DELETE | `/api/v1/sessions/{id}` | Bearer | Revoke a specific session by ID           |
| DELETE | `/api/v1/sessions/`     | Bearer | Revoke all sessions — logout everywhere   |

### System

| Method | Endpoint   | Auth | Description                                    |
| ------ | ---------- | ---- | ---------------------------------------------- |
| GET    | `/health`  | None | Service health check including database status |
| GET    | `/metrics` | None | Prometheus metrics endpoint                    |
| GET    | `/docs`    | None | Swagger UI — interactive API explorer          |

### Example Login Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "risk_score": 35.0,
  "risk_level": "medium",
  "requires_mfa": true
}
```

---

## How to Run

### Prerequisites

- macOS with Apple M2 chip (or any ARM64/x86 machine)
- Python 3.11
- Node.js 20+
- Docker Desktop installed and running

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Amman352/Zero-Trust-Access-Manager.git
cd Zero-Trust-Access-Manager
```

### Step 2 — Configure Environment

```bash
cp .env.example .env
# Open .env and set SECRET_KEY to a random 64-character string
```

### Step 3 — Backend Setup

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Step 4 — Start Database Services

```bash
cd ..
docker-compose up postgres redis -d
cd backend
alembic upgrade head
```

### Step 5 — Train the ML Model

```bash
python -m app.ml.train
# Expected output: Models saved to app/ml/models/
```

### Step 6 — Frontend Setup

```bash
cd ../frontend
npm install
```

### Step 7 — Run All Services

Open 3 terminal tabs in VS Code:

```bash
# Terminal 1 — Infrastructure
docker-compose up postgres redis -d

# Terminal 2 — Backend API + ML Engine
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 3 — Frontend Dashboard
cd frontend && npm run dev
```

| URL                          | Service                     |
| ---------------------------- | --------------------------- |
| http://localhost:5173        | React SOC Dashboard         |
| http://localhost:8000/docs   | Swagger API Documentation   |
| http://localhost:8000/health | Backend Health + DB Status  |
| http://localhost:9090        | Prometheus Metrics Explorer |

---

## Demo Accounts

| Role     | Email          |
| -------- | -------------- |
| User     | amman@ztam.com |
| Password | Amman123       |

## Project Structure

```
zero-trust-access-manager/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions — lint, test, Docker build
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── auth.py         # Register, login, /me endpoints
│   │   │       ├── users.py        # User CRUD — admin protected
│   │   │       ├── mfa.py          # TOTP setup, verify, disable
│   │   │       └── sessions.py     # Session list + single/bulk revoke
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic settings loaded from .env
│   │   │   ├── database.py         # Async SQLAlchemy engine + session factory
│   │   │   ├── security.py         # JWT creation, bcrypt hashing, token decode
│   │   │   └── dependencies.py     # RBAC — require_admin, require_roles()
│   │   ├── models/
│   │   │   ├── user.py             # User SQLAlchemy model + role/status enums
│   │   │   ├── session.py          # UserSession model with ML score columns
│   │   │   └── audit_log.py        # AuditLog model + AuditAction typed enum
│   │   ├── schemas/
│   │   │   ├── auth.py             # LoginRequest, RegisterRequest, MFA schemas
│   │   │   ├── token.py            # Token response with risk_score fields
│   │   │   └── user.py             # UserResponse, UserCreate, UserUpdate
│   │   ├── services/
│   │   │   ├── auth_service.py     # Register + login business logic
│   │   │   └── mfa_service.py      # TOTP generate, verify, enable, disable
│   │   ├── ml/
│   │   │   ├── risk_scorer.py      # Rule-based weighted risk engine
│   │   │   ├── train.py            # Isolation Forest training script
│   │   │   └── models/             # Serialized .joblib files (gitignored)
│   │   └── main.py                 # FastAPI app instance + router registration
│   ├── alembic/                    # Database migration version files
│   ├── tests/
│   │   └── unit/
│   │       └── test_core.py        # 8 unit tests — ML, JWT, hashing, endpoints
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Sidebar.jsx     # Collapsible enterprise sidebar navigation
│   │   │       └── AppLayout.jsx   # Global layout wrapper with top bar
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx   # SOC overview — charts, threat feed, KPIs
│   │   │   ├── SessionsPage.jsx    # Session intelligence table with revoke
│   │   │   ├── AuditPage.jsx       # Filterable audit log explorer
│   │   │   ├── ThreatPage.jsx      # Live threat feed with block actions
│   │   │   └── AnalyticsPage.jsx   # MFA adoption trends, risk analytics
│   │   ├── services/
│   │   │   └── api.js              # Axios client with JWT interceptors
│   │   ├── store/
│   │   │   └── authStore.js        # Zustand global auth state
│   │   └── App.jsx                 # React Router with private route guards
│   └── Dockerfile
├── monitoring/
│   ├── prometheus.yml              # Prometheus scrape configuration
│   └── grafana/
│       └── dashboards/             # Grafana dashboard JSON exports
├── docs/                           # Architecture diagrams and documentation
├── scripts/                        # Utility and helper scripts
├── docker-compose.yml              # Full 7-service local development stack
├── .env.example                    # Environment variable template
└── README.md
```

---

## Security Concepts

### Zero Trust Principles Applied

**Verify explicitly** — every incoming request validates the JWT signature, checks the Redis blacklist for token revocation, and evaluates the user's RBAC role before any route handler executes. There is no implicit trust.

**Least privilege** — five roles grant strictly scoped permissions. Viewers can read their own profile. Only super_admin and admin roles can list all users. No role escalation is possible through the API.

**Assume breach** — the risk engine assumes any session could be compromised. Every login is independently scored regardless of prior session history. A trusted device on Monday does not grant trust on Tuesday at 3AM.

### JWT Security Design

- Access tokens expire in 30 minutes — short enough to limit damage from theft
- Refresh tokens expire in 7 days — long enough for UX, revocable at any time
- Every token embeds a unique `jti` (JWT ID) — a UUID4 — enabling real-time revocation via Redis without invalidating all tokens globally
- Token type field prevents access tokens from being used in refresh flows and vice versa

### Password Security

- bcrypt with a work factor that produces ~100ms compute time per hash
- This makes brute force attacks computationally prohibitive at scale — hashing 10 million passwords takes 278 hours
- Passwords are never stored in plaintext, never logged, and never returned in any API response

### Adaptive Authentication

The MFA decision is not static — it is computed per login by the ML risk engine. The `requires_mfa` field in the login response is a real-time decision based on 5 behavioral signals evaluated at login time. A known user on a trusted device during business hours skips the challenge. The same user logging in at 3AM from an unrecognized device is always challenged regardless of prior trusted history.

### Audit Trail Design

Every security event is stored as a typed `AuditAction` enum in PostgreSQL — not written to a rotating log file. This architectural choice means the entire audit trail is queryable by user ID, IP address, action type, date range, and risk score. It cannot be accidentally deleted by log rotation. It can be exported for SOC 2 and ISO 27001 compliance reports.

---

## CI/CD Pipeline

Every pull request automatically triggers the GitHub Actions workflow:

```
Code pushed to branch
       │
       ▼
Lint — Ruff checks all Python files for style and unused imports
       │
       ▼
Type Check — mypy validates type annotations across the codebase
       │
       ▼
Unit Tests — pytest runs 8 tests covering:
  · Root and health endpoints
  · Input validation (422 on bad data)
  · ML risk scorer — low risk scenario
  · ML risk scorer — high risk scenario
  · Password hashing and verification
  · JWT access token creation and decoding
  · App import sanity check
       │
       ▼
Docker Build — validates the Dockerfile builds without errors
       │
       ▼ (main branch only)
Deploy — push to Render.com cloud
```

No broken code can merge to `main`. Every commit on main is tested, linted, and verified.

---

## Interview Brief

### Problem Being Solved

85% of data breaches involve compromised credentials (Verizon DBIR). Passwords alone are insufficient. Traditional auth systems trust a user for their entire session once logged in — ZTAM evaluates every login independently in real time and adjusts the authentication challenge dynamically based on behavioral risk signals.

### How ZTAM Differs From Auth0, Okta, Firebase Auth

| Feature             | Auth0 / Okta             | Firebase Auth | ZTAM                                 |
| ------------------- | ------------------------ | ------------- | ------------------------------------ |
| Adaptive MFA        | Paid enterprise tier     | Not available | Built-in, free, custom logic         |
| ML Risk Scoring     | Black box — no reasoning | Not available | Explainable — signals array returned |
| Source code access  | Closed source            | Closed source | Fully open source                    |
| Self-hostable       | Not possible             | Not possible  | Docker Compose — one command         |
| Custom risk signals | Not configurable         | Not available | Fully customizable in Python         |

### Key Resume Talking Points

- _"Implemented adaptive MFA using ML risk scoring — 5 behavioral signals feed an Isolation Forest model that decides in real time whether to challenge the user, making MFA genuinely adaptive rather than static"_
- _"Designed an RBAC engine following IAM principles with hierarchical roles enforced at the FastAPI dependency injection layer — not middleware, not the database, making it impossible to accidentally bypass"_
- _"Built Explainable AI for security — the risk engine returns not just a score but the exact signals that triggered it, giving auditors the reasoning chain they need for compliance"_
- _"Containerized a 7-service stack with Docker Compose and automated CI/CD via GitHub Actions with linting, type checking, and 8 unit tests on every pull request"_
- _"Implemented JWT with refresh token pairing and Redis-backed JTI blacklisting — enabling real-time token revocation without invalidating all user sessions globally"_

### One-Line Project Summary

_"An enterprise-grade Zero Trust authentication platform with adaptive MFA, ML-powered real-time risk scoring, RBAC, session intelligence, and full audit trail — containerized with Docker, automated with GitHub Actions, and visualized through a CrowdStrike-inspired React SOC dashboard."_

---

## Author

**Amman Khan**
B.Tech CSE — Cyber Security

- GitHub: [@Amman352](https://github.com/Amman352)
- Project: [Zero-Trust-Access-Manager](https://github.com/Amman352/Zero-Trust-Access-Manager)

> Built as a full-stack security engineering portfolio project demonstrating backend engineering, ML integration, enterprise authentication patterns, DevOps practices, and security-focused system design.

---

_Zero Trust Access Manager — Because trust is a vulnerability._
