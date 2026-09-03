from pathlib import Path

import pandas as pd


class DataReadError(Exception):
    """Raised when a dataset cannot be read."""


def read_csv(
    file_path: str | Path,
    *,
    encoding: str = "utf-8",
) -> pd.DataFrame:
    """
    Read a CSV file without modifying the source file.

    Returns
    -------
    pandas.DataFrame
        Raw contents of the CSV.
    """

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"Dataset file not found: {file_path}"
        )

    if not file_path.is_file():
        raise DataReadError(
            f"Dataset path is not a file: {file_path}"
        )

    try:
        return pd.read_csv(
            file_path,
            encoding=encoding,
            low_memory=False,
        )

    except UnicodeDecodeError as exc:
        raise DataReadError(
            f"Unable to decode CSV using {encoding}: {file_path}"
        ) from exc

    except pd.errors.EmptyDataError as exc:
        raise DataReadError(
            f"CSV file is empty: {file_path}"
        ) from exc

    except pd.errors.ParserError as exc:
        raise DataReadError(
            f"CSV parsing failed: {file_path}"
        ) from exc
