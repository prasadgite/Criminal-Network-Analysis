import pandas as pd

from normalization.ids import normalize_id
from normalization.text import normalize_text

from .base import add_lineage_metadata


def transform_persons(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the persons dataset.

    - Normalizes person_id (safe string trim)
    - Creates normalized_name from name
    - Preserves all original columns
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    if "person_id" in result.columns:

        result["person_id"] = (
            result["person_id"]
            .map(normalize_id)
        )

    # Preserve original values.
    # Create normalized versions only when
    # the source columns exist.

    if "name" in result.columns:

        result["normalized_name"] = (
            result["name"]
            .map(normalize_text)
        )

    return add_lineage_metadata(
        result,
        "persons",
    )
