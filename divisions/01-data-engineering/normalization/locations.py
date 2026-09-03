from pathlib import Path

import pandas as pd
import unicodedata
import yaml


def normalize_geographic_text(
    value,
) -> str | None:
    """
    Normalize a geographic text value.

    Applies Unicode NFKC normalization and
    collapses internal whitespace.
    """

    if pd.isna(value):
        return None

    value = str(value)

    value = unicodedata.normalize(
        "NFKC",
        value,
    )

    value = " ".join(
        value.strip().split()
    )

    return value


def load_geography_config(
    config_path: str | Path,
) -> dict:
    """
    Load the geography configuration YAML
    containing canonical state/district/city
    mappings.
    """

    config_path = Path(config_path)

    with config_path.open(
        "r",
        encoding="utf-8",
    ) as file:

        return yaml.safe_load(file)


def normalize_state(
    value,
    geography_config: dict,
) -> str | None:
    """
    Normalize a state name using the
    geography configuration lookup.

    If the state is found in the config,
    the canonical representation is returned.
    Otherwise, the normalized text value
    is returned unchanged.
    """

    value = normalize_geographic_text(value)

    if value is None:
        return None

    lookup_key = value.casefold()

    state_config = geography_config.get(
        "states",
        {},
    )

    if lookup_key in state_config:

        return state_config[
            lookup_key
        ]["canonical"]

    return value


def normalize_state_series(
    series: pd.Series,
    geography_config: dict,
) -> pd.Series:

    return series.map(
        lambda value:
        normalize_state(
            value,
            geography_config,
        )
    )
