"""
Data Contract package for Division 1.

Formalizes the boundary between Division 1
and downstream consumers (Division 2, 3, 4).

Components:
    loader    — YAML contract loading
    validator — Contract validation against
                processed DataFrames
"""

from .loader import (
    load_contract,
    load_dataset_contract,
    load_master_contract,
)
from .validator import (
    ContractViolation,
    validate_required_columns,
    validate_nullability,
    validate_primary_key,
    validate_logical_type,
    validate_dataset_contract,
)


__all__ = [
    "load_contract",
    "load_dataset_contract",
    "load_master_contract",
    "ContractViolation",
    "validate_required_columns",
    "validate_nullability",
    "validate_primary_key",
    "validate_logical_type",
    "validate_dataset_contract",
]
