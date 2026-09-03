import re

import pandas as pd


def normalize_indian_phone(
    value,
) -> str | None:
    """
    Normalize an Indian phone number to a
    consistent internal representation.

    Rules:
    - 10-digit local → prepend "91"
    - 0 + 10-digit  → strip "0", prepend "91"
    - 91 + 10-digit → already international
    - Other lengths  → return digits as-is

    Unknown representations are never silently
    altered into valid phone numbers.
    """

    if pd.isna(value):
        return None

    value = str(value).strip()

    if not value:
        return None

    digits = re.sub(
        r"\D",
        "",
        value,
    )

    if not digits:
        return None

    # International Indian format
    if digits.startswith("91") and len(digits) == 12:
        return digits

    # Local 10-digit format
    if len(digits) == 10:
        return "91" + digits

    # 0 + 10-digit local format
    if len(digits) == 11 and digits.startswith("0"):
        return "91" + digits[1:]

    # Unknown representation.
    # Do not silently alter it.
    return digits


def normalize_indian_phone_series(
    series: pd.Series,
) -> pd.Series:

    return series.map(normalize_indian_phone)
