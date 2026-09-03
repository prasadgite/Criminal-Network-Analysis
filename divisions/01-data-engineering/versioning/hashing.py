from __future__ import annotations

import hashlib
from pathlib import Path

import pandas as pd


BUFFER_SIZE = 1024 * 1024


def sha256_file(
    file_path: str | Path,
) -> str:
    """
    Compute SHA-256 hash of a file.

    Reads in chunks to handle large files
    without loading them entirely into memory.
    """

    file_path = Path(file_path)

    digest = hashlib.sha256()

    with file_path.open("rb") as file:

        while True:

            chunk = file.read(
                BUFFER_SIZE
            )

            if not chunk:
                break

            digest.update(chunk)

    return digest.hexdigest()


def dataframe_hash(
    dataframe: pd.DataFrame,
) -> str:
    """
    Compute a deterministic SHA-256 hash of
    a DataFrame's content.

    Column order is normalized (sorted) to
    ensure determinism. Row order is preserved
    because it may be semantically meaningful
    (e.g., chronological CDR records).
    """

    normalized = dataframe.copy()

    # Make column ordering deterministic.
    normalized = normalized.reindex(
        sorted(normalized.columns),
        axis=1,
    )

    row_hashes = pd.util.hash_pandas_object(
        normalized,
        index=True,
    )

    digest = hashlib.sha256()

    digest.update(
        row_hashes.to_numpy(
            dtype="uint64"
        ).tobytes()
    )

    return digest.hexdigest()


def dataset_version_id(
    source_hash: str,
    pipeline_version: str,
    schema_version: str,
) -> str:
    """
    Compute a deterministic logical version ID
    from source hash + pipeline + schema.

    This changes whenever any of the three
    inputs change, even if the output is
    identical.
    """

    value = (
        f"{source_hash}:"
        f"{pipeline_version}:"
        f"{schema_version}"
    )

    return hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()
