import pandas as pd


def normalize_category(
    value,
) -> str | None:
    """
    Normalize a categorical value.

    Strips surrounding whitespace and
    collapses internal whitespace.

    Does not apply any taxonomy mapping;
    that is deferred until actual source
    categories are inspected.
    """

    if pd.isna(value):
        return None

    value = str(value)

    return " ".join(
        value.strip().split()
    )


def normalize_category_series(
    series: pd.Series,
) -> pd.Series:

    return series.map(
        normalize_category
    )
