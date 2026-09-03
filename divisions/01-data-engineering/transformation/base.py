from datetime import datetime, timezone

import pandas as pd


PIPELINE_VERSION = "1.0.0"
SCHEMA_VERSION = "1.0"


def add_lineage_metadata(
    dataframe: pd.DataFrame,
    dataset_name: str,
) -> pd.DataFrame:
    """
    Attach lineage metadata to a processed
    DataFrame so downstream consumers can
    trace provenance.

    Added columns:
        source_dataset
        pipeline_version
        schema_version
        processing_timestamp
    """

    result = dataframe.copy()

    result["source_dataset"] = dataset_name

    result["pipeline_version"] = PIPELINE_VERSION

    result["schema_version"] = SCHEMA_VERSION

    result["processing_timestamp"] = (
        datetime.now(timezone.utc)
        .isoformat()
    )

    return result
