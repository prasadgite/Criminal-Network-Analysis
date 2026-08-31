from pathlib import Path

from ingestion.loader import (
    get_dataset_config,
    load_dataset,
)

from .schema_validator import (
    SchemaValidationResult,
    validate_schema,
)


def validate_dataset(
    config: dict,
    dataset_name: str,
    project_root: str | Path,
) -> SchemaValidationResult:

    dataframe, _ = load_dataset(
        config,
        dataset_name,
        project_root,
    )

    dataset_config = get_dataset_config(
        config,
        dataset_name,
    )

    return validate_schema(
        dataset_name,
        dataframe,
        dataset_config,
    )
