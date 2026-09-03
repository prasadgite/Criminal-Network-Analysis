import pandas as pd

from normalization.ids import normalize_id
from normalization.dates import normalize_datetime
from normalization.phones import normalize_indian_phone

from .base import add_lineage_metadata


def transform_phones(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the phones dataset.

    - Normalizes phone_id and registered_person_id
    - Creates normalized_phone_number
    - Preserves original phone_number
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    if "phone_id" in result.columns:

        result["phone_id"] = (
            result["phone_id"]
            .map(normalize_id)
        )

    if "registered_person_id" in result.columns:

        result["registered_person_id"] = (
            result["registered_person_id"]
            .map(normalize_id)
        )

    if "phone_number" in result.columns:

        result["normalized_phone_number"] = (
            result["phone_number"]
            .map(normalize_indian_phone)
        )

    return add_lineage_metadata(
        result,
        "phones",
    )


def transform_cdr_records(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the CDR records dataset.

    - Normalizes cdr_id
    - Creates normalized phone columns for
      caller_phone and callee_phone
    - Creates normalized timestamp columns
    - Preserves location_id as-is (semantic
      status pending — CDR→Location
      relationship not yet confirmed)
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    if "cdr_id" in result.columns:

        result["cdr_id"] = (
            result["cdr_id"]
            .map(normalize_id)
        )

    for column in [
        "caller_phone",
        "callee_phone",
    ]:

        if column in result.columns:

            result[
                f"normalized_{column}"
            ] = (
                result[column]
                .map(normalize_indian_phone)
            )

    for column in [
        "timestamp",
        "start_time",
        "end_time",
    ]:

        if column in result.columns:

            result[
                f"normalized_{column}"
            ] = (
                result[column]
                .map(normalize_datetime)
            )

    return add_lineage_metadata(
        result,
        "cdr_records",
    )
