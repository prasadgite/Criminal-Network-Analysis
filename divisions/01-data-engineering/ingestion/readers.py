from pathlib import Path

import pandas as pd


def read_csv(path: str | Path) -> pd.DataFrame:
    """
    Read a CSV file into a pandas DataFrame.

    This is the single entry point for all CSV reading
    in the ingestion layer.
    """

    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(
            f"Data file not found: {path}"
        )

    return pd.read_csv(path)
