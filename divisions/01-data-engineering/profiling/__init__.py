"""
Profiling package for Division 1.

Provides read-only dataset and column profiling,
plus quality report generation and serialization.

Components:
    profiler — Dataset/column/numeric/categorical
               and primary-key profiling
    reports  — JSON report generation and
               pipeline summary aggregation
"""

from .profiler import (
    DatasetProfile,
    ColumnProfile,
    CompleteDatasetProfile,
    profile_dataset,
    profile_column,
    profile_columns,
    profile_numeric_column,
    profile_categorical_column,
    profile_primary_key,
    create_complete_profile,
)
from .reports import (
    write_json_report,
    build_dataset_report,
    build_pipeline_summary,
)


__all__ = [
    "DatasetProfile",
    "ColumnProfile",
    "CompleteDatasetProfile",
    "profile_dataset",
    "profile_column",
    "profile_columns",
    "profile_numeric_column",
    "profile_categorical_column",
    "profile_primary_key",
    "create_complete_profile",
    "write_json_report",
    "build_dataset_report",
    "build_pipeline_summary",
]
