from __future__ import annotations

from pathlib import Path

import yaml


def load_contract(
    contract_path: str | Path,
) -> dict:
    """
    Load a single contract YAML file.
    """

    contract_path = Path(
        contract_path
    )

    with contract_path.open(
        "r",
        encoding="utf-8",
    ) as file:

        return yaml.safe_load(file)


def load_dataset_contract(
    contracts_directory: str | Path,
    dataset_name: str,
) -> dict:
    """
    Load the contract for a specific dataset.

    Expects the contract at:
        <contracts_directory>/datasets/<name>.yaml
    """

    contracts_directory = Path(
        contracts_directory
    )

    contract_path = (
        contracts_directory
        / "datasets"
        / f"{dataset_name}.yaml"
    )

    if not contract_path.exists():

        raise FileNotFoundError(
            f"No contract found for "
            f"dataset: {dataset_name}"
        )

    return load_contract(
        contract_path
    )


def load_master_contract(
    contracts_directory: str | Path,
) -> dict:
    """
    Load the master data_contract.yaml.
    """

    contracts_directory = Path(
        contracts_directory
    )

    return load_contract(
        contracts_directory
        / "data_contract.yaml"
    )
