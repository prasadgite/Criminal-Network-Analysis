from __future__ import annotations

import pandas as pd


class ContractViolation(
    ValueError
):
    """
    Raised when a processed DataFrame does
    not satisfy its data contract.
    """
    pass


# -------------------------------------------
# Required columns
# -------------------------------------------

def validate_required_columns(
    dataframe: pd.DataFrame,
    contract: dict,
) -> None:
    """
    Verify that all columns defined in the
    contract exist in the DataFrame.
    """

    columns = contract[
        "dataset"
    ].get(
        "columns",
        {},
    )

    missing = [
        column
        for column in columns
        if column not in dataframe.columns
    ]

    if missing:

        raise ContractViolation(
            "Missing contract columns: "
            + ", ".join(missing)
        )


# -------------------------------------------
# Nullability
# -------------------------------------------

def validate_nullability(
    dataframe: pd.DataFrame,
    contract: dict,
) -> None:
    """
    Verify that non-nullable columns contain
    no null values.
    """

    columns = contract[
        "dataset"
    ].get(
        "columns",
        {},
    )

    for column, specification in (
        columns.items()
    ):

        if column not in dataframe.columns:
            continue

        nullable = specification.get(
            "nullable",
            True,
        )

        if not nullable:

            null_count = int(
                dataframe[column]
                .isna()
                .sum()
            )

            if null_count > 0:

                raise ContractViolation(
                    f"{column} contains "
                    f"{null_count} null values"
                )


# -------------------------------------------
# Primary key
# -------------------------------------------

def validate_primary_key(
    dataframe: pd.DataFrame,
    contract: dict,
) -> None:
    """
    Verify primary key existence, non-nullability,
    and uniqueness.
    """

    primary_key = contract[
        "dataset"
    ].get(
        "primary_key"
    )

    if not primary_key:
        return

    column = primary_key[
        "column"
    ]

    if column not in dataframe.columns:

        raise ContractViolation(
            f"Primary key missing: {column}"
        )

    if dataframe[column].isna().any():

        raise ContractViolation(
            f"Primary key contains nulls: "
            f"{column}"
        )

    if primary_key.get(
        "unique",
        False,
    ):

        if dataframe[column].duplicated().any():

            raise ContractViolation(
                f"Primary key is not unique: "
                f"{column}"
            )


# -------------------------------------------
# Logical type validation
# -------------------------------------------

def validate_logical_type(
    series: pd.Series,
    logical_type: str,
) -> bool:
    """
    Check whether a Series conforms to a
    logical data type.

    Logical types abstract over Pandas dtype
    variations (e.g., int64 vs Int64).
    """

    if logical_type == "string":
        return (
            pd.api.types.is_string_dtype(
                series
            )
            or series.dtype == object
        )

    if logical_type == "integer":
        return pd.api.types.is_integer_dtype(
            series
        )

    if logical_type == "float":
        return pd.api.types.is_float_dtype(
            series
        )

    if logical_type == "boolean":
        return pd.api.types.is_bool_dtype(
            series
        )

    if logical_type == "datetime":
        return pd.api.types.is_datetime64_any_dtype(
            series
        )

    # Unknown logical type — skip validation.
    return True


# -------------------------------------------
# Full contract validation
# -------------------------------------------

def validate_dataset_contract(
    dataframe: pd.DataFrame,
    contract: dict,
) -> None:
    """
    Run all contract validations:
        1. Required columns
        2. Nullability
        3. Primary key
        4. Logical data types
    """

    validate_required_columns(
        dataframe,
        contract,
    )

    validate_nullability(
        dataframe,
        contract,
    )

    validate_primary_key(
        dataframe,
        contract,
    )

    columns = contract[
        "dataset"
    ].get(
        "columns",
        {},
    )

    for column, specification in (
        columns.items()
    ):

        if column not in dataframe.columns:
            continue

        logical_type = specification.get(
            "type"
        )

        if logical_type:

            valid = validate_logical_type(
                dataframe[column],
                logical_type,
            )

            if not valid:

                raise ContractViolation(
                    f"Invalid type for "
                    f"{column}: expected "
                    f"{logical_type}"
                )
