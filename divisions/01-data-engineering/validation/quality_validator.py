from dataclasses import dataclass, field

import pandas as pd


@dataclass
class QualityIssue:
    dataset: str
    issue_type: str
    severity: str
    message: str
    column: str | None = None
    count: int = 0


@dataclass
class QualityValidationResult:
    dataset: str
    passed: bool
    issues: list[QualityIssue] = field(
        default_factory=list
    )

    @property
    def errors(self) -> list[QualityIssue]:
        return [
            issue
            for issue in self.issues
            if issue.severity == "error"
        ]

    @property
    def warnings(self) -> list[QualityIssue]:
        return [
            issue
            for issue in self.issues
            if issue.severity == "warning"
        ]


def validate_required_values(
    dataset_name: str,
    dataframe: pd.DataFrame,
    schema: dict,
) -> list[QualityIssue]:

    issues = []

    for column_name, definition in schema.items():

        if column_name not in dataframe.columns:
            continue

        if not definition.get("required", False):
            continue

        null_count = int(
            dataframe[column_name].isna().sum()
        )

        if null_count > 0:

            issues.append(
                QualityIssue(
                    dataset=dataset_name,
                    issue_type="NULL_REQUIRED_FIELD",
                    severity="error",
                    message=(
                        f"Required field '{column_name}' "
                        f"contains {null_count} null values."
                    ),
                    column=column_name,
                    count=null_count,
                )
            )

    return issues


def validate_empty_strings(
    dataset_name: str,
    dataframe: pd.DataFrame,
    schema: dict,
) -> list[QualityIssue]:

    issues = []

    for column_name, definition in schema.items():

        if column_name not in dataframe.columns:
            continue

        if not definition.get("required", False):
            continue

        series = dataframe[column_name]

        empty_count = int(
            series.astype("string")
            .str.strip()
            .eq("")
            .sum()
        )

        if empty_count > 0:

            issues.append(
                QualityIssue(
                    dataset=dataset_name,
                    issue_type="EMPTY_REQUIRED_FIELD",
                    severity="error",
                    message=(
                        f"Required field '{column_name}' "
                        f"contains {empty_count} empty values."
                    ),
                    column=column_name,
                    count=empty_count,
                )
            )

    return issues


def validate_duplicate_rows(
    dataset_name: str,
    dataframe: pd.DataFrame,
) -> list[QualityIssue]:

    duplicate_count = int(
        dataframe.duplicated().sum()
    )

    if duplicate_count == 0:
        return []

    return [
        QualityIssue(
            dataset=dataset_name,
            issue_type="DUPLICATE_RECORD",
            severity="warning",
            message=(
                f"Dataset contains {duplicate_count} "
                "duplicate rows."
            ),
            count=duplicate_count,
        )
    ]


def validate_numeric_range(
    dataset_name: str,
    dataframe: pd.DataFrame,
    column_name: str,
    minimum: float,
    maximum: float,
) -> list[QualityIssue]:

    if column_name not in dataframe.columns:
        return []

    numeric = pd.to_numeric(
        dataframe[column_name],
        errors="coerce",
    )

    invalid = (
        numeric.notna()
        & (
            (numeric < minimum)
            | (numeric > maximum)
        )
    )

    invalid_count = int(invalid.sum())

    if invalid_count == 0:
        return []

    return [
        QualityIssue(
            dataset=dataset_name,
            issue_type="INVALID_NUMERIC_RANGE",
            severity="error",
            message=(
                f"Column '{column_name}' contains "
                f"{invalid_count} values outside "
                f"[{minimum}, {maximum}]."
            ),
            column=column_name,
            count=invalid_count,
        )
    ]


def validate_temporal_order(
    dataset_name: str,
    dataframe: pd.DataFrame,
    start_column: str,
    end_column: str,
) -> list[QualityIssue]:

    if (
        start_column not in dataframe.columns
        or end_column not in dataframe.columns
    ):
        return []

    start = pd.to_datetime(
        dataframe[start_column],
        errors="coerce",
    )

    end = pd.to_datetime(
        dataframe[end_column],
        errors="coerce",
    )

    invalid = (
        start.notna()
        & end.notna()
        & (start > end)
    )

    invalid_count = int(invalid.sum())

    if invalid_count == 0:
        return []

    return [
        QualityIssue(
            dataset=dataset_name,
            issue_type="TEMPORAL_INCONSISTENCY",
            severity="error",
            message=(
                f"'{start_column}' occurs after "
                f"'{end_column}' in "
                f"{invalid_count} records."
            ),
            count=invalid_count,
        )
    ]


def validate_quality(
    dataset_name: str,
    dataframe: pd.DataFrame,
    dataset_config: dict,
) -> QualityValidationResult:

    issues = []

    schema = dataset_config.get(
        "columns",
        {},
    )

    issues.extend(
        validate_required_values(
            dataset_name,
            dataframe,
            schema,
        )
    )

    issues.extend(
        validate_empty_strings(
            dataset_name,
            dataframe,
            schema,
        )
    )

    issues.extend(
        validate_duplicate_rows(
            dataset_name,
            dataframe,
        )
    )

    for column_name, definition in schema.items():

        value_range = definition.get("range")

        if value_range:

            issues.extend(
                validate_numeric_range(
                    dataset_name,
                    dataframe,
                    column_name,
                    value_range["min"],
                    value_range["max"],
                )
            )

    if (
        "start_time" in dataframe.columns
        and "end_time" in dataframe.columns
    ):

        issues.extend(
            validate_temporal_order(
                dataset_name,
                dataframe,
                "start_time",
                "end_time",
            )
        )

    passed = not any(
        issue.severity == "error"
        for issue in issues
    )

    return QualityValidationResult(
        dataset=dataset_name,
        passed=passed,
        issues=issues,
    )
