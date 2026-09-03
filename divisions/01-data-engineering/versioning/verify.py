from pathlib import Path

from .hashing import sha256_file


def verify_file_hash(
    file_path: str | Path,
    expected_hash: str,
) -> bool:
    """
    Verify that a file's current SHA-256
    matches an expected hash.

    Returns True if the file is untampered,
    False if the content has changed.
    """

    actual_hash = sha256_file(
        file_path
    )

    return actual_hash == expected_hash
