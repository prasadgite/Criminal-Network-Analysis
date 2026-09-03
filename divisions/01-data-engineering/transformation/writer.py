from pathlib import Path

import pandas as pd


def write_processed_csv(
    dataframe: pd.DataFrame,
    output_directory: str | Path,
    filename: str,
) -> Path:
    """
    Write a processed DataFrame to CSV.

    Creates the output directory if it
    does not already exist.

    Returns the path to the written file.
    """

    output_directory = Path(
        output_directory
    )

    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_path = (
        output_directory / filename
    )

    dataframe.to_csv(
        output_path,
        index=False,
        encoding="utf-8",
    )

    return output_path
