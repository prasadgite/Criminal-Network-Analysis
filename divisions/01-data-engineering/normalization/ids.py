import pandas as pd
import unicodedata


def normalize_id(value) -> str | None:
    """
    Safely normalize an identifier.

    Identifiers are always treated as strings.
    Leading zeros are preserved.
    """

    if pd.isna(value):
        return None

    value = str(value)

    value = unicodedata.normalize(
        "NFKC",
        value,
    )

    return value.strip()


def normalize_id_series(
    series: pd.Series,
) -> pd.Series:

    return series.map(normalize_id)
