🛡️ Zero Trust Access Manager (ZTAM)

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
- [ML Model](#ml-model--isolation-forest)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [How to Run](#how-to-run)
- [Project Structure](#project-structure)
- [Security Concepts](#security-concepts)
- [Screenshots](#screenshots)
- [Author](#author)

---

## What is ZTAM?

Traditional authentication systems operate on a **trust-but-verify** model — once a user logs in, they are trusted for the entire session. This is exactly how credential-based breaches happen. Stolen tokens, session hijacking, and insider threats all exploit this assumption.

**Zero Trust Access Manager** implements a **never trust, always verify** architecture. Every login and every session is scored in real time using:

- Behavioral signals (login hour, device fingerprint, IP address)
- ML-generated anomaly scores via Isolation Forest
- Adaptive MFA gating — low risk sessions skip MFA, high risk sessions are challenged
- RBAC enforcement at the API dependency layer
- Tamper-evident audit logging of every security event

The result is a system that responds to threat signals automatically — no human intervention required for standard threat patterns.
