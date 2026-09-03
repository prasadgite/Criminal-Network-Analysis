"""
Versioning package for Division 1.

Provides deterministic hashing, version
metadata, manifest generation, and tamper
detection for processed datasets.

Components:
    hashing  — SHA-256 file/DataFrame hashing
               and logical version ID
    version  — VersionInfo metadata dataclass
    manifest — Manifest creation and serialization
    verify   — Post-processing tamper detection
"""

from .hashing import (
    sha256_file,
    dataframe_hash,
    dataset_version_id,
)
from .version import (
    VersionInfo,
    create_version_info,
)
from .manifest import (
    create_manifest,
    write_manifest,
)
from .verify import (
    verify_file_hash,
)


__all__ = [
    "sha256_file",
    "dataframe_hash",
    "dataset_version_id",
    "VersionInfo",
    "create_version_info",
    "create_manifest",
    "write_manifest",
    "verify_file_hash",
]
