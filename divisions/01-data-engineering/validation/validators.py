import pandas as pd


def is_integer_series(series: pd.Series) -> bool:

    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    return numeric.notna().all() and (
        numeric % 1 == 0
    ).all()


def is_float_series(series: pd.Series) -> bool:

    numeric = pd.to_numeric(
        series,
        errors="coerce",
    )

    return numeric.notna().all()


def is_boolean_series(series: pd.Series) -> bool:

    valid_values = {
        True,
        False,
        "True",
        "False",
        "true",
        "false",
        1,
        0,
    }

    values = set(
        series.dropna().unique()
    )

    return values.issubset(valid_values)


def is_datetime_series(series: pd.Series) -> bool:

    converted = pd.to_datetime(
        series,
        errors="coerce",
    )

    non_null = series.notna()

    return converted[non_null].notna().all()
