from pathlib import Path

import pandas as pd
import pytest

from ingestion.loader import (
    load_config,
    load_dataset,
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CONFIG_PATH = (
    PROJECT_ROOT
    / "divisions"
    / "01-data-engineering"
    / "config"
    / "datasets.yaml"
)


@pytest.fixture
def config():
    return load_config(CONFIG_PATH)


def test_config_loads(config):

    assert "datasets" in config


def test_missing_dataset_fails(config):

    with pytest.raises(Exception):
        load_dataset(
            config,
            "does_not_exist",
            PROJECT_ROOT,
        )


def test_configured_file_path(config):

    dataframe, metadata = load_dataset(
        config,
        "phones",
        PROJECT_ROOT,
    )

    assert isinstance(dataframe, pd.DataFrame)

    assert metadata.dataset_name == "phones"

    assert metadata.row_count >= 0

    assert metadata.column_count == len(
        metadata.columns
    )


def test_ingestion_does_not_modify_raw_file(config):

    path = (
        PROJECT_ROOT
        / "datasets"
        / "raw"
        / config["datasets"]["phones"]["file"]
    )

    if not path.exists():
        pytest.skip("phones.csv not present")

    before = path.read_bytes()

    load_dataset(
        config,
        "phones",
        PROJECT_ROOT,
    )

    after = path.read_bytes()

    assert before == after
