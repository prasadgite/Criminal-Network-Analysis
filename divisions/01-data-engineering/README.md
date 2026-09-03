# Division 1: Data Engineering

Division 1 forms the foundational data intake, quality control, standardization, and governing layer for **SANDHAAN** (Criminal Network Analysis System).

It guarantees that raw investigation datasets are ingested, validated, normalized, and transformed into deterministic, versioned, contract-compliant processed datasets before being handed over to downstream divisions (Division 2 NLP/Entity Resolution, Division 3 Knowledge Graph, and Division 4 Analytics).

---

## 1. Core Architectural Principles

1. **Source Immutability**: Raw files in `datasets/raw/` are strictly read-only and never modified or overwritten.
2. **Derivation Over Mutation**: Normalized and transformed fields are derived as distinct columns (e.g., `normalized_name`, `normalized_phone_number`) while raw inputs are preserved.
3. **No Premature Inference**: Division 1 performs schema and quality validation, but **never** performs entity resolution (e.g., assuming two identical names are the same person). That boundary belongs strictly to Division 2.
4. **Deterministic Lineage**: Every processed dataset is accompanied by a SHA-256 source hash, output hash, pipeline version, schema version, and an auditable manifest.

---

## 2. Pipeline Execution Flow

```text
                    RAW DATA
                       │
                       ▼
                ┌─────────────┐
                │  INGESTION  │  (D1.2)
                └──────┬──────┘
                       │
                       ▼
              ┌─────────────────┐
              │ SCHEMA VALIDATE │  (D1.3)
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ QUALITY CHECK   │  (D1.4)
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ REFERENTIAL     │  (D1.5)
              │ INTEGRITY       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ NORMALIZATION   │  (D1.6)
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ TRANSFORMATION  │  (D1.7)
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ DATA CONTRACT   │  (D1.10)
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
         PROFILING           VERSIONING  (D1.8 & D1.9)
              │                 │
              └────────┬────────┘
                       ▼
                PROCESSED DATA  (D1.11 Pipeline Orchestrator)
                       +
                 QUALITY REPORT
                       +
                    MANIFEST
```

---

## 3. Directory Layout

```text
divisions/01-data-engineering/
│
├── config/
│   ├── datasets.yaml              # Dataset registry, primary keys, relationships
│   ├── validation_rules.yaml      # Quality rules, allowed ranges, format patterns
│   └── pipeline.yaml              # Centralized versions & environment config
│
├── ingestion/
│   ├── loader.py                  # Dataset loader & path resolver
│   ├── models.py                  # IngestionResult metadata model
│   └── readers.py                 # Encoding-aware, safe CSV reader
│
├── validation/
│   ├── schema_validator.py        # Required columns, unexpected columns, PK checks
│   ├── quality_validator.py       # Null values, numeric ranges, temporal order
│   ├── integrity_validator.py     # Standard & polymorphic foreign key checks
│   └── validation_pipeline.py     # Ingestion + validation orchestrator
│
├── normalization/
│   ├── ids.py                     # Safe ID trimming and string casting
│   ├── text.py                    # Whitespace collapsing, Unicode NFC, matching keys
│   ├── phones.py                  # Indian mobile & landline normalization (91...)
│   ├── dates.py                   # ISO-8601, timezone-aware datetime normalization
│   ├── locations.py               # Geographic entity normalization (States, cities)
│   ├── categorical.py             # Case-normalized categorical mappings
│   └── pipeline.py                # Reusable column normalization helpers
│
├── transformation/
│   ├── base.py                    # Lineage metadata injection
│   ├── persons.py                 # Person dataset transformation
│   ├── cases.py                   # Cases dataset transformation
│   ├── communications.py          # Phones & CDR records transformation
│   ├── transactions.py            # Bank accounts & transactions transformation
│   ├── locations.py               # Location records transformation
│   ├── writer.py                  # Standard CSV serialization
│   └── versioned_writer.py        # Combined CSV serialization + SHA-256 + manifest
│
├── profiling/
│   ├── profiler.py                # Dataset, column, numeric, categorical, PK stats
│   └── reports.py                 # JSON report builder & pipeline summary generator
│
├── versioning/
│   ├── hashing.py                 # SHA-256 file and DataFrame hashing, version ID
│   ├── version.py                 # VersionInfo metadata dataclass
│   ├── manifest.py                # Manifest creation & serialization
│   └── verify.py                  # Tamper detection via checksum verification
│
├── contracts/
│   ├── data_contract.yaml         # Master SANDHAAN contract definition
│   ├── COMPATIBILITY.md           # SemVer compatibility guidelines
│   ├── loader.py                  # Contract YAML loader
│   ├── validator.py               # Contract enforcement engine
│   └── datasets/                  # 13 YAML data contracts for all domain datasets
│
├── pipeline/
│   └── runner.py                  # End-to-end pipeline runner & multi-dataset coordinator
│
└── tests/
    ├── test_schema.py             # Schema configuration tests
    ├── test_schema_validation.py  # Schema enforcement tests
    ├── test_quality_validation.py # Data quality tests
    ├── test_referential_integrity.py # Relationship & foreign key tests
    ├── test_normalization.py      # Value normalization tests
    ├── test_transformation.py     # Transformation & lineage tests
    ├── test_profiling.py          # Dataset & column profiling tests
    ├── test_versioning.py         # Hashing, manifest, tamper tests
    ├── test_contract.py           # Contract enforcement tests
    └── test_pipeline_integration.py # Full end-to-end integration tests
```

---

## 4. Running the Tests

To run the full suite across all 11 stages of Division 1:

```bash
pytest tests -v
```

Currently: **106 passing tests**, zero failures.
