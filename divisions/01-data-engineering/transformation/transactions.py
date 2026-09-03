import pandas as pd

from normalization.ids import normalize_id
from normalization.dates import normalize_datetime

from .base import add_lineage_metadata


def transform_bank_accounts(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the bank_accounts dataset.

    - Normalizes account_id and holder_person_id
    - Does not alter financial semantics
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    for column in [
        "account_id",
        "holder_person_id",
    ]:

        if column in result.columns:

            result[column] = (
                result[column]
                .map(normalize_id)
            )

    return add_lineage_metadata(
        result,
        "bank_accounts",
    )


def transform_transactions(
    dataframe: pd.DataFrame,
) -> pd.DataFrame:
    """
    Transform the transactions dataset.

    - Normalizes transaction_id,
      sender_account_id, receiver_account_id
    - Creates normalized timestamp columns
    - Does not alter transaction amounts
    - Attaches lineage metadata
    """

    result = dataframe.copy()

    for column in [
        "transaction_id",
        "sender_account_id",
        "receiver_account_id",
    ]:

        if column in result.columns:

            result[column] = (
                result[column]
                .map(normalize_id)
            )

    for column in [
        "timestamp",
        "transaction_time",
        "created_at",
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
        "transactions",
    )
