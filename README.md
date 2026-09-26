# SANDHAAN (संधान)
### Criminal Network Intelligence Platform for Law Enforcement

> **Government-Grade Criminal Network Analysis, Entity Resolution, and Spatio-Temporal Correlation Platform**

---

## 🏛️ Overview

**SANDHAAN** is a specialized intelligence workstation built for Indian law enforcement and investigative agencies (NIA, CBI, State Police Intelligence, Cyber Crime Cells). It provides a unified, desktop-first command environment to ingest unstructured First Information Reports (FIRs), correlate disparate entities (suspects, vehicles, burner phones, shell bank accounts), perform multi-hop network link analysis, and trace criminal syndicates.

---

## 🏗️ Architecture

The platform consists of three integrated systems:

```
trial-sandhaan/
├── src/                          # Frontend: React 18 + TypeScript + Vite
│   ├── features/                 # Modular domain features (Cases, Entities, Network, Timeline, Auth, etc.)
│   ├── layouts/                  # Command workstation desktop layouts
│   ├── routes/                   # RBAC & Protected routes
│   └── services/                 # Unified API clients & mock data fallbacks
│
├── aigaragebackend/              # Backend Gateway: NestJS 10 + TypeORM
│   ├── src/                      # Auth, RBAC guards, NeonDB PostgreSQL data layer
│   ├── scripts/                  # Database migration & operational seed scripts
│   └── migrations/               # Production SQL schemas
│
└── entity-intelligence-service/  # AI Microservice: Python 3.10 + FastAPI
    ├── api/                      # REST endpoints (/api/v1/extract, /analyze-fir, /db/mentions)
    ├── core/                     # Extraction pipeline, Token-Trie index, Conservative Resolver
    └── requirements.txt          # Python dependencies
```

---

## 🚀 Key Capabilities

1. **Entity Extraction & Recognition (Division 2)**:
   - Hybrid NER combining spaCy, deterministic regex engines, and token-based trie dictionary matching.
   - Extracts persons, aliases, vehicles (standard RTO formats), phone numbers, and location landmarks.
2. **Conservative Entity Resolution**:
   - Traceable, explainable matching against indexed national suspect registries.
   - Context-aware validation preventing false-positive name/officer collisions.
3. **Multi-Hop Criminal Network Analysis**:
   - Visual link analysis decomposing syndicate hierarchies, kingpins, and front intermediaries.
4. **Spatio-Temporal & Location Intelligence**:
   - Cell tower CDR correlation, movement vector tracking, and safehouse cluster heatmaps.
5. **Role-Based Access Control (RBAC)**:
   - Official government identity lifecycle with investigator activation and supervisor approval queues.

---

## 🛠️ Quick Start

### Prerequisites
- **Node.js**: >= 20.x or 22.x
- **Python**: 3.10.x or 3.11.x
- **PostgreSQL**: NeonDB cloud connection (configured in `.env`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/sandhaan.git
cd trial-sandhaan

# Install root dependencies
npm install

# Install backend dependencies
cd aigaragebackend
npm install
cd ..

# Setup Python virtual environment
python -m venv .venv
.\.venv\Scripts\pip install -r entity-intelligence-service/requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
cp aigaragebackend/.env.example aigaragebackend/.env
```

### 3. Launch Development Environment

Run all three services concurrently:
```bash
npm run dev:all
```

Or launch services individually:
| Service | Command | URL |
|---------|---------|-----|
| **Frontend** | `npm run dev` | `http://localhost:5173` |
| **Backend API** | `npm run dev:backend` | `http://localhost:3000` |
| **AI Intelligence** | `npm run dev:ai` | `http://localhost:8000` |

---

## 🧪 Testing & Verification

```bash
# Run frontend build & typecheck
npm test

# Run AI service unit tests (15 core tests)
npm run test:ai

# Build backend
npm --prefix aigaragebackend run build
```

---

## 🔒 Security & Compliance
- **Indian Evidence Act § 65B**: Designed for evidentiary traceability and audit preservation.
- **Environment Isolation**: `.env`, `.venv`, and temporary artifacts are protected and excluded via `.gitignore`.

---

## 📄 License
Confidential — Developed for Hackathon & Law Enforcement Intelligence Demonstration.
