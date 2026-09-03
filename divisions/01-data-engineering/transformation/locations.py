import pandas as pd

from normalization.ids import normalize_id
from normalization.locations import (
    normalize_geographic_text,
)

from .base import add_lineage_metadata


def transform_locations(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the locations dataset.

    - Normalizes location_id
    - Creates normalized geographic text
      columns for state, district, city, pincode
    - Does not alter latitude/longitude
      (coordinate validation belongs to
      quality validation)
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    if "location_id" in result.columns:

        result["location_id"] = (
            result["location_id"]
            .map(normalize_id)
        )

    for column in [
        "state",
        "district",
        "city",
        "pincode",
    ]:

        if column in result.columns:

            result[
                f"normalized_{column}"
            ] = (
                result[column]
                .map(normalize_geographic_text)
            )

    return add_lineage_metadata(
        result,
        "locations",
    )
