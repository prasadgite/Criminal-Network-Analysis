"""
Transformation package for Division 1.

Converts validated/normalized DataFrames into
processed datasets with lineage metadata.

Domain transformers:
    persons          — Person records
    cases            — Case records
    communications   — Phones + CDR records
    transactions     — Bank accounts + transactions
    locations        — Location records

Infrastructure:
    base    — Lineage metadata utilities
    writer  — Processed-data serialization
    run     — Standalone transformation runner
"""

from .base import (
    PIPELINE_VERSION,
    SCHEMA_VERSION,
    add_lineage_metadata,
)
from .persons import transform_persons
from .cases import transform_cases
from .communications import (
    transform_phones,
    transform_cdr_records,
)
from .transactions import (
    transform_bank_accounts,
    transform_transactions,
)
from .locations import transform_locations
from .writer import write_processed_csv


__all__ = [
    "PIPELINE_VERSION",
    "SCHEMA_VERSION",
    "add_lineage_metadata",
    "transform_persons",
    "transform_cases",
    "transform_phones",
    "transform_cdr_records",
    "transform_bank_accounts",
    "transform_transactions",
    "transform_locations",
    "write_processed_csv",
]
