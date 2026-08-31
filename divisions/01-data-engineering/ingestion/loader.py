from pathlib import Path
import yaml

from .models import IngestionResult
from .readers import read_csv


class DatasetConfigError(Exception):
    """Raised when dataset configuration is invalid."""


def load_config(config_path: str | Path) -> dict:
    """
    Load and validate the Division 1 dataset configuration.
    """

    config_path = Path(config_path)

    if not config_path.exists():
        raise FileNotFoundError(
            f"Configuration file not found: {config_path}"
        )

    with config_path.open("r", encoding="utf-8") as file:
        config = yaml.safe_load(file)

    if not isinstance(config, dict):
        raise DatasetConfigError(
            "datasets.yaml must contain a YAML mapping."
        )

    if "datasets" not in config:
        raise DatasetConfigError(
            "Missing required 'datasets' section."
        )

    if not isinstance(config["datasets"], dict):
        raise DatasetConfigError(
            "'datasets' must be a mapping."
        )

    return config


def get_dataset_config(config: dict, dataset_name: str) -> dict:
    """
    Return configuration for one dataset.
    """

    datasets = config["datasets"]

    if dataset_name not in datasets:
        raise DatasetConfigError(
            f"Unknown dataset: {dataset_name}"
        )

    return datasets[dataset_name]


def get_raw_dataset_path(
    config: dict,
    dataset_name: str,
    project_root: str | Path,
) -> Path:
    """
    Resolve the raw CSV path for a configured dataset.
    """

    dataset_config = get_dataset_config(config, dataset_name)

    if "file" not in dataset_config:
        raise DatasetConfigError(
            f"Dataset '{dataset_name}' has no file configured."
        )

    raw_dir = Path(project_root) / "datasets" / "raw"

    return raw_dir / dataset_config["file"]


def load_dataset(
    config: dict,
    dataset_name: str,
    project_root: str | Path,
):
    """
    Load one configured dataset.

    No transformations are performed here.
    """

    path = get_raw_dataset_path(
        config,
        dataset_name,
        project_root,
    )

    dataframe = read_csv(path)

    result = IngestionResult(
        dataset_name=dataset_name,
        source_file=path,
        row_count=len(dataframe),
        column_count=len(dataframe.columns),
        columns=tuple(dataframe.columns),
    )

    return dataframe, result
