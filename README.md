# SANDHAAN: Criminal Network Analysis System

**SANDHAAN** is an advanced investigation intelligence and criminal network analysis platform designed to process heterogeneous, high-volume law enforcement datasets, perform entity resolution and link prediction, construct temporal knowledge graphs, and surface organized crime syndicates.

---

## Architecture Overview

SANDHAAN is organized into modular divisions:

```text
                               RAW DATASETS
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             DIVISION 1: DATA ENGINEERING                │
       │  - Ingestion, Schema & Quality Validation               │
       │  - Referential & Polymorphic Integrity                  │
       │  - Value Normalization & Domain Transformations         │
       │  - Data Contracts, Profiling & Lineage Manifests        │
       └────────────────────────────┬────────────────────────────┘
                                    │ Processed Datasets + Contracts + Manifests
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             DIVISION 2: INTELLIGENCE & NLP              │
       │  - Entity Resolution & Deduplication (blocking + fuzzy) │
       │  - Unstructured FIR/Charge-sheet Information Extraction │
       │  - Modus Operandi & Crime Pattern Extraction            │
       └────────────────────────────┬────────────────────────────┘
                                    │ Canonical Entities & Relationships
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │           DIVISION 3: KNOWLEDGE GRAPH ENGINE            │
       │  - Heterogeneous Graph Construction (Persons, Cases,    │
       │    Phones, Accounts, Locations, Vehicles)               │
       │  - Community Detection & Centrality Analysis            │
       │  - Subgraph Extraction & Path Finding                   │
       └────────────────────────────┬────────────────────────────┘
                                    │ Network Analytics & Graph Embeddings
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │           DIVISION 4: VISUALIZATION & ANALYTICS         │
       │  - Interactive Investigation Workbenches                │
       │  - Geospatial & Temporal CDR Timeline Playback          │
       │  - Syndicate Hierarchy & Link Probability Visualizer    │
       └─────────────────────────────────────────────────────────┘
```

---

## Division 1: Data Engineering (Completed)

Division 1 establishes the governed data foundation for the entire platform.

### Core Architectural Guarantees:
1. **Source Immutability**: Raw files in `datasets/raw/` are strictly read-only.
2. **Derivation Over Mutation**: Derived normalized fields coexist alongside original raw values without overwriting them.
3. **Strict Division Boundary**: Entity resolution is **not** performed in Division 1; only source-level validation, cleaning, and transformation are executed.
4. **Governed Output Package**: Downstream divisions receive processed CSVs, a formal **Data Contract**, a machine-readable **Quality Report**, and a cryptographic **Lineage Manifest**.

### Pipeline Stages (D1.1 – D1.11):
- **D1.1 — Configuration**: Dataset catalog, primary keys, relationships (`datasets.yaml`, `pipeline.yaml`).
- **D1.2 — Ingestion**: Metadata-tracking CSV readers (`loader.py`, `readers.py`).
- **D1.3 — Schema Validation**: Required columns, unexpected columns, primary key constraints, type enforcement.
- **D1.4 — Quality Validation**: Null checks, empty string detection, numeric range boundaries, temporal order checks.
- **D1.5 — Referential Integrity**: Standard foreign keys and polymorphic entity links (`PERSON`, `VEHICLE`).
- **D1.6 — Normalization**: Safe ID trimming, Unicode NFC text standardisation, Indian phone numbers (`91XXXXXXXXXX`), ISO-8601 timestamps (`Asia/Kolkata`), geographic entities, and categorical values.
- **D1.7 — Domain Transformation**: Dedicated transformers for Persons, Cases, Communications (Phones & CDR), Transactions (Bank Accounts & Transfers), and Locations with lineage injection.
- **D1.8 — Profiling & Quality Reports**: Memory usage, null distribution, uniqueness, numeric & categorical summaries, and pipeline-level summaries (`reports.py`).
- **D1.9 — Versioning & Lineage**: SHA-256 source & output hashing, logical `version_id`, manifest generation, and tamper detection.
- **D1.10 — Data Contracts**: Formal downstream contract definitions for 13 domain datasets and SemVer compatibility rules (`COMPATIBILITY.md`).
- **D1.11 — Pipeline Integration**: Full deterministic orchestrator (`pipeline/runner.py`) running end-to-end with failure isolation.

---

## Directory Structure

```text
Sandhaan/
├── README.md
├── datasets/
│   ├── raw/                       # Raw input datasets (read-only)
│   └── processed/                 # Processed outputs from Division 1
├── divisions/
│   ├── 01-data-engineering/       # Division 1 implementation & test suite
│   │   ├── config/                # Pipeline & dataset configurations
│   │   ├── ingestion/             # File ingestion & loaders
│   │   ├── validation/            # Schema, quality & integrity validators
│   │   ├── normalization/         # Value normalizers
│   │   ├── transformation/        # Domain transformers & versioned writer
│   │   ├── profiling/             # Profiler & report generators
│   │   ├── versioning/            # SHA-256 hashing, manifests & tamper checks
│   │   ├── contracts/             # Data contracts & validator
│   │   ├── pipeline/              # End-to-end pipeline runner
│   │   └── tests/                 # Comprehensive test suite (106 tests)
│   ├── 02-intelligence/           # Division 2 (Entity Resolution & NLP)
│   ├── 03-knowledge-graph/        # Division 3 (Graph Construction & Analytics)
│   └── 04-visualization/          # Division 4 (Frontend & Workbenches)
```

---

## Verification & Testing

To run the full Division 1 automated test suite:

```bash
cd divisions/01-data-engineering
pytest tests -v
```

**Status**: **106 passing tests**, 100% pass rate.
