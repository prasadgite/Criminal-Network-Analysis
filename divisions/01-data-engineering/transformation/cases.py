import pandas as pd

from normalization.ids import normalize_id
from normalization.text import normalize_text
from normalization.dates import normalize_datetime

from .base import add_lineage_metadata


def transform_cases(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the cases dataset.

    - Normalizes case_id
    - Creates normalized_case_title
    - Normalizes temporal columns where present
    - Preserves all original columns
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    if "case_id" in result.columns:

        result["case_id"] = (
            result["case_id"]
            .map(normalize_id)
        )

    if "case_title" in result.columns:

        result["normalized_case_title"] = (
            result["case_title"]
            .map(normalize_text)
        )

    for column in [
        "start_time",
        "end_time",
        "created_at",
        "updated_at",
    ]:

        if column in result.columns:

            result[f"normalized_{column}"] = (
                result[column]
                .map(normalize_datetime)
            )

    return add_lineage_metadata(
        result,
        "cases",
    )
