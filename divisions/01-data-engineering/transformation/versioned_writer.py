from pathlib import Path

import pandas as pd

from versioning.hashing import sha256_file
from versioning.manifest import (
    create_manifest,
    write_manifest,
)
from versioning.version import (
    create_version_info,
)

from .writer import (
    write_processed_csv,
)


def write_versioned_dataset(
    dataframe: pd.DataFrame,
    dataset_name: str,
    output_directory: str | Path,
    manifest_directory: str | Path,
    source_hash: str | None,
    pipeline_version: str,
    schema_version: str,
):
    """
    Write a processed dataset and its
    version manifest.

    Workflow:
        1. Write processed CSV
        2. Hash the output file
        3. Create VersionInfo
        4. Build and write manifest

    Returns:
        (output_path, manifest_path, version_info)
    """

    output_path = write_processed_csv(
        dataframe,
        output_directory,
        f"{dataset_name}.csv",
    )

    processed_hash = sha256_file(
        output_path
    )

    version_info = create_version_info(
        dataset=dataset_name,
        source_hash=source_hash,
        processed_hash=processed_hash,
        pipeline_version=pipeline_version,
        schema_version=schema_version,
    )

    manifest = create_manifest(
        version_info
    )

    manifest_path = (
        Path(manifest_directory)
        / dataset_name
        / "manifest.json"
    )

    write_manifest(
        manifest,
        manifest_path,
    )

    return (
        output_path,
        manifest_path,
        version_info,
    )
