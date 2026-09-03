from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any

import pandas as pd


@dataclass
class DatasetProfile:
    """
    High-level statistics for an entire dataset.
    """

    dataset: str
    row_count: int
    column_count: int
    memory_usage_bytes: int
    duplicate_rows: int
    null_cells: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ColumnProfile:
    """
    Detailed statistics for a single column.
    """

    column: str
    dtype: str
    null_count: int
    null_percentage: float
    unique_count: int
    unique_percentage: float
    duplicate_count: int

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class CompleteDatasetProfile:
    """
    Full profile combining dataset-level,
    primary-key, and column-level statistics.
    """

    dataset: str
    dataset_stats: dict
    primary_key_stats: dict
    columns: list[dict]

    def to_dict(self) -> dict:
        return asdict(self)


# -------------------------------------------
# Dataset-level profiling
# -------------------------------------------

def profile_dataset(
    dataframe: pd.DataFrame,
    dataset_name: str,
) -> DatasetProfile:
    """
    Compute high-level statistics for a dataset.

    This is read-only — the DataFrame is never
    modified.
    """

    row_count = len(dataframe)

    column_count = len(
        dataframe.columns
    )

    memory_usage = int(
        dataframe.memory_usage(
            deep=True
        ).sum()
    )

    duplicate_rows = int(
        dataframe.duplicated().sum()
    )

    null_cells = int(
        dataframe.isna().sum().sum()
    )

    return DatasetProfile(
        dataset=dataset_name,
        row_count=row_count,
        column_count=column_count,
        memory_usage_bytes=memory_usage,
        duplicate_rows=duplicate_rows,
        null_cells=null_cells,
    )


# -------------------------------------------
# Column-level profiling
# -------------------------------------------

def profile_column(
    dataframe: pd.DataFrame,
    column: str,
) -> ColumnProfile:
    """
    Compute detailed statistics for one column.
    """

    series = dataframe[column]

    total = len(series)

    null_count = int(
        series.isna().sum()
    )

    unique_count = int(
        series.nunique(
            dropna=True
        )
    )

    if total == 0:
        null_percentage = 0.0
        unique_percentage = 0.0
    else:
        null_percentage = (
            null_count / total
        ) * 100

        unique_percentage = (
            unique_count / total
        ) * 100

    duplicate_count = int(
        series.duplicated(
            keep=False
        ).sum()
    )

    return ColumnProfile(
        column=column,
        dtype=str(series.dtype),
        null_count=null_count,
        null_percentage=round(
            null_percentage,
            4,
        ),
        unique_count=unique_count,
        unique_percentage=round(
            unique_percentage,
            4,
        ),
        duplicate_count=duplicate_count,
    )


def profile_columns(
    dataframe: pd.DataFrame,
) -> list[ColumnProfile]:
    """
    Profile every column in the DataFrame.
    """

    return [
        profile_column(
            dataframe,
            column,
        )
        for column in dataframe.columns
    ]


# -------------------------------------------
# Numeric column profiling
# -------------------------------------------

def profile_numeric_column(
    series: pd.Series,
) -> dict:
    """
    Compute min/max/mean/median/std for a
    numeric series.

    Non-numeric values are coerced to NaN.
    """

    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    clean = numeric.dropna()

    if clean.empty:
        return {
            "min": None,
            "max": None,
            "mean": None,
            "median": None,
            "std": None,
        }

    return {
        "min": float(clean.min()),
        "max": float(clean.max()),
        "mean": float(clean.mean()),
        "median": float(clean.median()),
        "std": float(clean.std()),
    }


# -------------------------------------------
# Categorical column profiling
# -------------------------------------------

def profile_categorical_column(
    series: pd.Series,
    top_n: int = 10,
) -> dict:
    """
    Return the top N most frequent values
    in a categorical/string column.
    """

    counts = (
        series
        .dropna()
        .astype(str)
        .value_counts()
        .head(top_n)
    )

    return {
        "top_values": [
            {
                "value": str(value),
                "count": int(count),
            }
            for value, count
            in counts.items()
        ]
    }


# -------------------------------------------
# Primary-key profiling
# -------------------------------------------

def profile_primary_key(
    dataframe: pd.DataFrame,
    primary_key: str,
) -> dict:
    """
    Assess the health of a primary key column.

    Reports existence, null count, duplicate
    count, and unique count.
    """

    if primary_key not in dataframe.columns:

        return {
            "exists": False,
            "null_count": None,
            "duplicate_count": None,
            "unique_count": None,
        }

    series = dataframe[primary_key]

    return {
        "exists": True,
        "null_count": int(
            series.isna().sum()
        ),
        "duplicate_count": int(
            series.duplicated().sum()
        ),
        "unique_count": int(
            series.nunique(
                dropna=True
            )
        ),
    }


# -------------------------------------------
# Complete profile
# -------------------------------------------

def create_complete_profile(
    dataframe: pd.DataFrame,
    dataset_name: str,
    primary_key: str | None = None,
) -> CompleteDatasetProfile:
    """
    Build a full profile combining dataset
    stats, primary key stats, and per-column
    stats.
    """

    dataset_stats = profile_dataset(
        dataframe,
        dataset_name,
    ).to_dict()

    primary_key_stats = {}

    if primary_key:

        primary_key_stats = (
            profile_primary_key(
                dataframe,
                primary_key,
            )
        )

    columns = [
        profile_column(
            dataframe,
            column,
        ).to_dict()
        for column in dataframe.columns
    ]

    return CompleteDatasetProfile(
        dataset=dataset_name,
        dataset_stats=dataset_stats,
        primary_key_stats=primary_key_stats,
        columns=columns,
    )
