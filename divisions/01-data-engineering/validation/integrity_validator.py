from dataclasses import dataclass, field

import pandas as pd


@dataclass
class IntegrityIssue:
    dataset: str
    issue_type: str
    severity: str
    message: str
    child_field: str
    parent_dataset: str
    parent_field: str
    count: int


@dataclass
class IntegrityValidationResult:
    dataset: str
    passed: bool
    issues: list[IntegrityIssue] = field(
        default_factory=list
    )

    @property
    def errors(self):
        return [
            issue
            for issue in self.issues
            if issue.severity == "error"
        ]

    @property
    def warnings(self):
        return [
            issue
            for issue in self.issues
            if issue.severity == "warning"
        ]


def validate_foreign_key(
    child_dataset: str,
    child_dataframe: pd.DataFrame,
    child_field: str,
    parent_dataset: str,
    parent_dataframe: pd.DataFrame,
    parent_field: str,
    *,
    nullable: bool = False,
) -> list[IntegrityIssue]:

    issues = []

    if child_field not in child_dataframe.columns:

        issues.append(
            IntegrityIssue(
                dataset=child_dataset,
                issue_type="MISSING_FOREIGN_KEY_COLUMN",
                severity="error",
                message=(
                    f"Foreign-key column "
                    f"'{child_field}' is missing."
                ),
                child_field=child_field,
                parent_dataset=parent_dataset,
                parent_field=parent_field,
                count=0,
            )
        )

        return issues

    if parent_field not in parent_dataframe.columns:

        issues.append(
            IntegrityIssue(
                dataset=child_dataset,
                issue_type="MISSING_PARENT_KEY_COLUMN",
                severity="error",
                message=(
                    f"Parent key '{parent_field}' is missing "
                    f"from dataset '{parent_dataset}'."
                ),
                child_field=child_field,
                parent_dataset=parent_dataset,
                parent_field=parent_field,
                count=0,
            )
        )

        return issues

    child_values = child_dataframe[child_field]

    if nullable:
        child_values = child_values.dropna()
    else:

        null_count = int(
            child_values.isna().sum()
        )

        if null_count > 0:

            issues.append(
                IntegrityIssue(
                    dataset=child_dataset,
                    issue_type="NULL_FOREIGN_KEY",
                    severity="error",
                    message=(
                        f"Foreign key '{child_field}' "
                        f"contains {null_count} null values."
                    ),
                    child_field=child_field,
                    parent_dataset=parent_dataset,
                    parent_field=parent_field,
                    count=null_count,
                )
            )

    parent_values = set(
        parent_dataframe[parent_field]
        .dropna()
        .astype(str)
    )

    child_values_as_string = (
        child_values.dropna()
        .astype(str)
    )

    unresolved = (
        ~child_values_as_string.isin(parent_values)
    )

    unresolved_count = int(
        unresolved.sum()
    )

    if unresolved_count > 0:

        issues.append(
            IntegrityIssue(
                dataset=child_dataset,
                issue_type="UNRESOLVED_FOREIGN_KEY",
                severity="error",
                message=(
                    f"{unresolved_count} values in "
                    f"'{child_field}' do not resolve to "
                    f"'{parent_dataset}.{parent_field}'."
                ),
                child_field=child_field,
                parent_dataset=parent_dataset,
                parent_field=parent_field,
                count=unresolved_count,
            )
        )

    return issues


def validate_relationship(
    relationship: dict,
    dataframes: dict[str, pd.DataFrame],
) -> list[IntegrityIssue]:

    child_dataset = relationship["child_dataset"]
    parent_dataset = relationship["parent_dataset"]

    if child_dataset not in dataframes:

        return [
            IntegrityIssue(
                dataset=child_dataset,
                issue_type="MISSING_CHILD_DATASET",
                severity="error",
                message=(
                    f"Child dataset '{child_dataset}' "
                    "was not loaded."
                ),
                child_field=relationship["child_field"],
                parent_dataset=parent_dataset,
                parent_field=relationship["parent_field"],
                count=0,
            )
        ]

    if parent_dataset not in dataframes:

        return [
            IntegrityIssue(
                dataset=child_dataset,
                issue_type="MISSING_PARENT_DATASET",
                severity="error",
                message=(
                    f"Parent dataset '{parent_dataset}' "
                    "was not loaded."
                ),
                child_field=relationship["child_field"],
                parent_dataset=parent_dataset,
                parent_field=relationship["parent_field"],
                count=0,
            )
        ]

    return validate_foreign_key(
        child_dataset,
        dataframes[child_dataset],
        relationship["child_field"],
        parent_dataset,
        dataframes[parent_dataset],
        relationship["parent_field"],
        nullable=relationship.get(
            "nullable",
            False,
        ),
    )


def validate_all_relationships(
    config: dict,
    dataframes: dict[str, pd.DataFrame],
) -> IntegrityValidationResult:

    issues = []

    for relationship in config.get(
        "relationships",
        [],
    ):

        issues.extend(
            validate_relationship(
                relationship,
                dataframes,
            )
        )

    passed = not any(
        issue.severity == "error"
        for issue in issues
    )

    return IntegrityValidationResult(
        dataset="__all__",
        passed=passed,
        issues=issues,
    )


def validate_polymorphic_relationship(
    relationship: dict,
    dataframes: dict[str, pd.DataFrame],
) -> list[IntegrityIssue]:

    issues = []

    dataset_name = relationship["dataset"]
    type_field = relationship["type_field"]
    id_field = relationship["id_field"]

    dataframe = dataframes[dataset_name]

    if type_field not in dataframe.columns:

        return [
            IntegrityIssue(
                dataset=dataset_name,
                issue_type="MISSING_ENTITY_TYPE_COLUMN",
                severity="error",
                message=(
                    f"Missing polymorphic type field "
                    f"'{type_field}'."
                ),
                child_field=id_field,
                parent_dataset="polymorphic",
                parent_field="",
                count=0,
            )
        ]

    if id_field not in dataframe.columns:

        return [
            IntegrityIssue(
                dataset=dataset_name,
                issue_type="MISSING_ENTITY_ID_COLUMN",
                severity="error",
                message=(
                    f"Missing polymorphic ID field "
                    f"'{id_field}'."
                ),
                child_field=id_field,
                parent_dataset="polymorphic",
                parent_field="",
                count=0,
            )
        ]

    for entity_type, target in relationship[
        "allowed_entities"
    ].items():

        subset = dataframe[
            dataframe[type_field].astype(str).str.upper()
            == entity_type.upper()
        ]

        if subset.empty:
            continue

        target_dataset = target["dataset"]
        target_key = target["primary_key"]

        if target_dataset not in dataframes:
            issues.append(
                IntegrityIssue(
                    dataset=dataset_name,
                    issue_type="MISSING_POLYMORPHIC_TARGET",
                    severity="error",
                    message=(
                        f"Target dataset "
                        f"'{target_dataset}' is not loaded."
                    ),
                    child_field=id_field,
                    parent_dataset=target_dataset,
                    parent_field=target_key,
                    count=len(subset),
                )
            )
            continue

        target_values = set(
            dataframes[target_dataset][target_key]
            .dropna()
            .astype(str)
        )

        unresolved = ~(
            subset[id_field]
            .astype(str)
            .isin(target_values)
        )

        unresolved_count = int(
            unresolved.sum()
        )

        if unresolved_count > 0:

            issues.append(
                IntegrityIssue(
                    dataset=dataset_name,
                    issue_type="UNRESOLVED_POLYMORPHIC_ID",
                    severity="error",
                    message=(
                        f"{unresolved_count} "
                        f"'{entity_type}' entity IDs "
                        f"do not resolve to "
                        f"'{target_dataset}.{target_key}'."
                    ),
                    child_field=id_field,
                    parent_dataset=target_dataset,
                    parent_field=target_key,
                    count=unresolved_count,
                )
            )

    return issues


def validate_integrity(
    config: dict,
    dataframes: dict[str, pd.DataFrame],
) -> IntegrityValidationResult:

    issues = []

    issues.extend(
        validate_all_relationships(
            config,
            dataframes,
        ).issues
    )

    for relationship in config.get(
        "polymorphic_relationships",
        [],
    ):

        dataset_name = relationship["dataset"]

        if dataset_name not in dataframes:

            issues.append(
                IntegrityIssue(
                    dataset=dataset_name,
                    issue_type="MISSING_DATASET",
                    severity="error",
                    message=(
                        f"Dataset '{dataset_name}' "
                        "was not loaded."
                    ),
                    child_field=relationship["id_field"],
                    parent_dataset="polymorphic",
                    parent_field="",
                    count=0,
                )
            )

            continue

        issues.extend(
            validate_polymorphic_relationship(
                relationship,
                dataframes,
            )
        )

    passed = not any(
        issue.severity == "error"
        for issue in issues
    )

    return IntegrityValidationResult(
        dataset="__all__",
        passed=passed,
        issues=issues,
    )
