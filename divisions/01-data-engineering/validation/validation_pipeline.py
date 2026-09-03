from pathlib import Path

from ingestion.loader import (
    get_dataset_config,
    load_dataset,
)

from .quality_validator import (
    QualityValidationResult,
    validate_quality,
)

from .schema_validator import (
    SchemaValidationResult,
    validate_schema,
)


def validate_dataset(
    config: dict,
    dataset_name: str,
    project_root: str | Path,
) -> tuple[
    SchemaValidationResult,
    QualityValidationResult | None,
]:

    dataframe, _ = load_dataset(
        config,
        dataset_name,
        project_root,
    )

    dataset_config = get_dataset_config(
        config,
        dataset_name,
    )

    schema_result = validate_schema(
        dataset_name,
        dataframe,
        dataset_config,
    )

    if not schema_result.passed:

        return schema_result, None

    quality_result = validate_quality(
        dataset_name,
        dataframe,
        dataset_config,
    )

    return schema_result, quality_result
