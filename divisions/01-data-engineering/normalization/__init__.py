"""
Normalization package for Division 1.

Provides type-specific normalizers that
produce derived values while preserving
the original source values.

Components:
    ids         — Identifier normalization
    text        — Text normalization + matching
    phones      — Indian phone normalization
    dates       — Timezone-aware datetime
    locations   — Geographic text + lookup
    categorical — Category whitespace cleanup
    pipeline    — DataFrame-level operations
"""

from .ids import (
    normalize_id,
    normalize_id_series,
)
from .text import (
    normalize_text,
    normalize_for_matching,
    normalize_text_series,
    normalize_for_matching_series,
)
from .phones import (
    normalize_indian_phone,
    normalize_indian_phone_series,
)
from .dates import (
    normalize_datetime,
    normalize_datetime_series,
    DEFAULT_TIMEZONE,
)
from .locations import (
    normalize_geographic_text,
    load_geography_config,
    normalize_state,
    normalize_state_series,
)
from .categorical import (
    normalize_category,
    normalize_category_series,
)


__all__ = [
    "normalize_id",
    "normalize_id_series",
    "normalize_text",
    "normalize_for_matching",
    "normalize_text_series",
    "normalize_for_matching_series",
    "normalize_indian_phone",
    "normalize_indian_phone_series",
    "normalize_datetime",
    "normalize_datetime_series",
    "DEFAULT_TIMEZONE",
    "normalize_geographic_text",
    "load_geography_config",
    "normalize_state",
    "normalize_state_series",
    "normalize_category",
    "normalize_category_series",
]
