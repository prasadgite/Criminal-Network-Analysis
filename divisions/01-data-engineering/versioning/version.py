from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone


@dataclass(frozen=True)
class VersionInfo:
    """
    Immutable version metadata for a processed
    dataset.

    Captures the full lineage: source hash,
    processed hash, pipeline version, schema
    version, and generation timestamp.
    """

    dataset: str

    source_hash: str | None

    processed_hash: str

    pipeline_version: str

    schema_version: str

    generated_at: str

    def to_dict(self) -> dict:

        return asdict(self)


def create_version_info(
    dataset: str,
    source_hash: str | None,
    processed_hash: str,
    pipeline_version: str,
    schema_version: str,
) -> VersionInfo:
    """
    Create a VersionInfo with the current
    UTC timestamp.
    """

    return VersionInfo(
        dataset=dataset,
        source_hash=source_hash,
        processed_hash=processed_hash,
        pipeline_version=pipeline_version,
        schema_version=schema_version,
        generated_at=(
            datetime.now(
                timezone.utc
            ).isoformat()
        ),
    )
