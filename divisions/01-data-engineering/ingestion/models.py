from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class IngestionResult:
    """
    Metadata describing a successfully ingested dataset.
    """

    dataset_name: str
    source_file: Path
    row_count: int
    column_count: int
    columns: tuple[str, ...]
