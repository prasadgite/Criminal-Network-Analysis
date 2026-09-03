import pandas as pd

from .ids import normalize_id_series
from .text import (
    normalize_text_series,
    normalize_for_matching_series,
)
from .phones import normalize_indian_phone
from .dates import normalize_datetime_series


def add_normalized_column(
    dataframe: pd.DataFrame,
    source_column: str,
    target_column: str,
    normalizer,
) -> pd.DataFrame:
    """
    Apply a generic normalizer function to
    source_column, storing the result in
    target_column.

    The source DataFrame is never modified.
    """

    result = dataframe.copy()

    result[target_column] = (
        result[source_column]
        .map(normalizer)
    )

    return result


def normalize_identifier_column(
    dataframe: pd.DataFrame,
    source_column: str,
    target_column: str,
) -> pd.DataFrame:

    result = dataframe.copy()

    result[target_column] = (
        normalize_id_series(
            result[source_column]
        )
    )

    return result


def normalize_text_column(
    dataframe: pd.DataFrame,
    source_column: str,
    target_column: str,
) -> pd.DataFrame:

    result = dataframe.copy()

    result[target_column] = (
        normalize_text_series(
            result[source_column]
        )
    )

    return result


def normalize_matching_column(
    dataframe: pd.DataFrame,
    source_column: str,
    target_column: str,
) -> pd.DataFrame:
    """
    Add a matching-ready column derived from
    a text source column.

    The matching representation is casefolded
    with collapsed whitespace.
    """

    result = dataframe.copy()

    result[target_column] = (
        normalize_for_matching_series(
            result[source_column]
        )
    )

    return result


def normalize_phone_column(
    dataframe: pd.DataFrame,
    source_column: str,
    target_column: str,
) -> pd.DataFrame:

    result = dataframe.copy()

    result[target_column] = (
        result[source_column]
        .map(normalize_indian_phone)
    )

    return result


def normalize_datetime_column(
    dataframe: pd.DataFrame,
    source_column: str,
    target_column: str,
    timezone: str = "Asia/Kolkata",
) -> pd.DataFrame:

    result = dataframe.copy()

    result[target_column] = (
        normalize_datetime_series(
            result[source_column],
            timezone,
        )
    )

    return result
