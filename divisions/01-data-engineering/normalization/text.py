import pandas as pd
import unicodedata


def normalize_text(value) -> str | None:

    if pd.isna(value):
        return None

    value = str(value)

    value = unicodedata.normalize(
        "NFKC",
        value,
    )

    value = value.strip()

    return value


def normalize_for_matching(value) -> str | None:
    """
    Produce a matching-ready representation.

    Casefolded, with all internal whitespace
    collapsed to single spaces.

    Intended for entity matching, not display.
    """

    value = normalize_text(value)

    if value is None:
        return None

    return " ".join(
        value.casefold().split()
    )


def normalize_text_series(
    series: pd.Series,
) -> pd.Series:

    return series.map(normalize_text)


def normalize_for_matching_series(
    series: pd.Series,
) -> pd.Series:

    return series.map(normalize_for_matching)
