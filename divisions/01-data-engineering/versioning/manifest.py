from __future__ import annotations

import json
from pathlib import Path

from .version import VersionInfo


def create_manifest(
    version_info: VersionInfo,
) -> dict:
    """
    Build a structured manifest dict from
    version info.

    The manifest organizes lineage into
    source, output, pipeline, and schema
    sections for clear auditability.
    """

    return {
        "dataset":
            version_info.dataset,

        "source": {
            "sha256":
                version_info.source_hash,
        },

        "output": {
            "sha256":
                version_info.processed_hash,
        },

        "pipeline": {
            "version":
                version_info.pipeline_version,
        },

        "schema": {
            "version":
                version_info.schema_version,
        },

        "generated_at":
            version_info.generated_at,
    }


def write_manifest(
    manifest: dict,
    output_path: str | Path,
) -> Path:
    """
    Serialize a manifest to JSON.

    Creates parent directories if needed.
    """

    output_path = Path(
        output_path
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            manifest,
            file,
            indent=2,
            ensure_ascii=False,
        )

    return output_path
