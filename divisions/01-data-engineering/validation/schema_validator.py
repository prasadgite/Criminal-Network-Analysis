from dataclasses import dataclass, field

import pandas as pd

from .validators import (
    is_boolean_series,
    is_datetime_series,
    is_float_series,
    is_integer_series,
)


@dataclass
class ValidationIssue:
    dataset: str
    issue_type: str
    message: str
    column: str | None = None


@dataclass
class SchemaValidationResult:
    dataset: str
    passed: bool
    issues: list[ValidationIssue] = field(default_factory=list)


SUPPORTED_TYPES = {
    "string",
    "integer",
    "float",
    "boolean",
    "datetime",
}


def validate_required_columns(
    dataset_name: str,
    dataframe: pd.DataFrame,
    schema: dict,
) -> list[ValidationIssue]:

    issues = []

    actual_columns = set(dataframe.columns)

    for column_name, definition in schema.items():

        if not definition.get("required", False):
            continue

        if column_name not in actual_columns:

            issues.append(
                ValidationIssue(
                    dataset=dataset_name,
                    issue_type="MISSING_COLUMN",
                    message=(
                        f"Required column '{column_name}' "
                        "is missing."
                    ),
                    column=column_name,
                )
            )

    return issues


def validate_unexpected_columns(
    dataset_name: str,
    dataframe: pd.DataFrame,
    schema: dict,
) -> list[ValidationIssue]:

    issues = []

    expected_columns = set(schema.keys())
    actual_columns = set(dataframe.columns)

    unexpected = actual_columns - expected_columns

    for column_name in sorted(unexpected):

        issues.append(
            ValidationIssue(
                dataset=dataset_name,
                issue_type="UNEXPECTED_COLUMN",
                message=(
                    f"Unexpected column '{column_name}'."
                ),
                column=column_name,
            )
        )

    return issues


def validate_primary_key(
    dataset_name: str,
    dataframe: pd.DataFrame,
    primary_key: str,
) -> list[ValidationIssue]:

    issues = []

    if primary_key not in dataframe.columns:
        return issues

    series = dataframe[primary_key]

    null_count = series.isna().sum()

    if null_count > 0:

        issues.append(
            ValidationIssue(
                dataset=dataset_name,
                issue_type="NULL_PRIMARY_KEY",
                message=(
                    f"Primary key '{primary_key}' "
                    f"contains {null_count} null values."
                ),
                column=primary_key,
            )
        )

    duplicate_count = series.duplicated().sum()

    if duplicate_count > 0:

        issues.append(
            ValidationIssue(
                dataset=dataset_name,
                issue_type="DUPLICATE_PRIMARY_KEY",
                message=(
                    f"Primary key '{primary_key}' "
                    f"contains {duplicate_count} duplicates."
                ),
                column=primary_key,
            )
        )

    return issues


def validate_column_types(
    dataset_name: str,
    dataframe: pd.DataFrame,
    schema: dict,
) -> list[ValidationIssue]:

    issues = []

    validators = {
        "integer": is_integer_series,
        "float": is_float_series,
        "boolean": is_boolean_series,
        "datetime": is_datetime_series,
    }

    for column_name, definition in schema.items():

        if column_name not in dataframe.columns:
            continue

        expected_type = definition.get("type")

        if expected_type == "string":
            continue

        validator = validators.get(expected_type)

        if validator is None:
            issues.append(
                ValidationIssue(
                    dataset=dataset_name,
                    issue_type="UNKNOWN_TYPE",
                    message=(
                        f"Unsupported configured type "
                        f"'{expected_type}' for "
                        f"'{column_name}'."
                    ),
                    column=column_name,
                )
            )
            continue

        if not validator(dataframe[column_name]):

            issues.append(
                ValidationIssue(
                    dataset=dataset_name,
                    issue_type="INVALID_TYPE",
                    message=(
                        f"Column '{column_name}' does not "
                        f"match expected type '{expected_type}'."
                    ),
                    column=column_name,
                )
            )

    return issues


def validate_schema(
    dataset_name: str,
    dataframe: pd.DataFrame,
    dataset_config: dict,
    *,
    allow_unexpected_columns: bool = False,
) -> SchemaValidationResult:

    issues = []

    schema_status = dataset_config.get(
        "schema_status",
        "pending",
    )

    # We cannot validate an unknown schema.
    if schema_status != "confirmed":

        return SchemaValidationResult(
            dataset=dataset_name,
            passed=True,
            issues=[],
        )

    schema = dataset_config.get("columns", {})

    issues.extend(
        validate_required_columns(
            dataset_name,
            dataframe,
            schema,
        )
    )

    if not allow_unexpected_columns:

        issues.extend(
            validate_unexpected_columns(
                dataset_name,
                dataframe,
                schema,
            )
        )

    issues.extend(
        validate_primary_key(
            dataset_name,
            dataframe,
            dataset_config["primary_key"],
        )
    )

    issues.extend(
        validate_column_types(
            dataset_name,
            dataframe,
            schema,
        )
    )

    return SchemaValidationResult(
        dataset=dataset_name,
        passed=len(issues) == 0,
        issues=issues,
    )
