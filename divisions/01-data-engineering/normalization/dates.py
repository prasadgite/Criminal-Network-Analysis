import pandas as pd


DEFAULT_TIMEZONE = "Asia/Kolkata"


def normalize_datetime(
    value,
    timezone: str = DEFAULT_TIMEZONE,
):
    """
    Normalize a datetime value to a
    timezone-aware timestamp.

    Naive timestamps are localized to the
    investigation environment timezone.

    Aware timestamps are converted to the
    target timezone.
    """

    if pd.isna(value):
        return pd.NaT

    timestamp = pd.to_datetime(
        value,
        errors="coerce",
    )

    if pd.isna(timestamp):
        return pd.NaT

    # Naive timestamp:
    # assume investigation environment timezone.
    if timestamp.tzinfo is None:

        timestamp = timestamp.tz_localize(
            timezone
        )

    else:

        timestamp = timestamp.tz_convert(
            timezone
        )

    return timestamp


def normalize_datetime_series(
    series: pd.Series,
    timezone: str = DEFAULT_TIMEZONE,
) -> pd.Series:

    return series.map(
        lambda value:
        normalize_datetime(
            value,
            timezone,
        )
    )
