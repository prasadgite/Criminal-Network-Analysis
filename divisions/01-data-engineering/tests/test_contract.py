from pathlib import Path

import pandas as pd
import pytest

from contracts.validator import (
    ContractViolation,
    validate_required_columns,
    validate_nullability,
    validate_primary_key,
    validate_logical_type,
    validate_dataset_contract,
)
from contracts.loader import (
    load_contract,
    load_dataset_contract,
    load_master_contract,
)


CONTRACTS_DIR = (
    Path(__file__).resolve().parents[1]
    / "contracts"
)


# -------------------------------------------
# Required columns
# -------------------------------------------

def test_required_columns_pass():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    contract = {
        "dataset": {
            "columns": {
                "person_id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
            }
        }
    }

    validate_required_columns(
        dataframe,
        contract,
    )


def test_missing_column_fails():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001"]
        }
    )

    contract = {
        "dataset": {
            "columns": {
                "person_id": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
            }
        }
    }

    with pytest.raises(
        ContractViolation
    ):

        validate_required_columns(
            dataframe,
            contract,
        )


# -------------------------------------------
# Nullability
# -------------------------------------------

def test_nullability_pass():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
        }
    )

    contract = {
        "dataset": {
            "columns": {
                "person_id": {
                    "nullable": False,
                },
            }
        }
    }

    validate_nullability(
        dataframe,
        contract,
    )


def test_nullability_fails():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", None],
        }
    )

    contract = {
        "dataset": {
            "columns": {
                "person_id": {
                    "nullable": False,
                },
            }
        }
    }

    with pytest.raises(
        ContractViolation
    ):

        validate_nullability(
            dataframe,
            contract,
        )


# -------------------------------------------
# Primary key
# -------------------------------------------

def test_primary_key_pass():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
        }
    )

    contract = {
        "dataset": {
            "primary_key": {
                "column": "person_id",
                "unique": True,
            }
        }
    }

    validate_primary_key(
        dataframe,
        contract,
    )


def test_primary_key_uniqueness_fails():

    dataframe = pd.DataFrame(
        {
            "person_id": [
                "P001",
                "P001",
            ]
        }
    )

    contract = {
        "dataset": {
            "primary_key": {
                "column": "person_id",
                "unique": True,
            }
        }
    }

    with pytest.raises(
        ContractViolation
    ):

        validate_primary_key(
            dataframe,
            contract,
        )


def test_primary_key_null_fails():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", None],
        }
    )

    contract = {
        "dataset": {
            "primary_key": {
                "column": "person_id",
                "unique": True,
            }
        }
    }

    with pytest.raises(
        ContractViolation
    ):

        validate_primary_key(
            dataframe,
            contract,
        )


def test_primary_key_missing_column_fails():

    dataframe = pd.DataFrame(
        {
            "other": ["A"]
        }
    )

    contract = {
        "dataset": {
            "primary_key": {
                "column": "person_id",
                "unique": True,
            }
        }
    }

    with pytest.raises(
        ContractViolation
    ):

        validate_primary_key(
            dataframe,
            contract,
        )


# -------------------------------------------
# Logical type validation
# -------------------------------------------

def test_string_type():

    series = pd.Series(
        ["a", "b", "c"]
    )

    assert validate_logical_type(
        series,
        "string",
    )


def test_integer_type():

    series = pd.Series(
        [1, 2, 3]
    )

    assert validate_logical_type(
        series,
        "integer",
    )


def test_float_type():

    series = pd.Series(
        [1.0, 2.5, 3.7]
    )

    assert validate_logical_type(
        series,
        "float",
    )


def test_boolean_type():

    series = pd.Series(
        [True, False, True]
    )

    assert validate_logical_type(
        series,
        "boolean",
    )


def test_unknown_type_passes():

    series = pd.Series(
        [1, 2, 3]
    )

    assert validate_logical_type(
        series,
        "unknown_type",
    )


# -------------------------------------------
# Full contract validation
# -------------------------------------------

def test_full_contract_validation_pass():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
        }
    )

    contract = {
        "dataset": {
            "primary_key": {
                "column": "person_id",
                "unique": True,
            },
            "columns": {
                "person_id": {
                    "type": "string",
                    "nullable": False,
                },
                "name": {
                    "type": "string",
                    "nullable": False,
                },
            }
        }
    }

    validate_dataset_contract(
        dataframe,
        contract,
    )


def test_full_contract_validation_type_fail():

    dataframe = pd.DataFrame(
        {
            "person_id": [1, 2],
        }
    )

    contract = {
        "dataset": {
            "columns": {
                "person_id": {
                    "type": "string",
                    "nullable": False,
                },
            }
        }
    }

    with pytest.raises(
        ContractViolation
    ):

        validate_dataset_contract(
            dataframe,
            contract,
        )


# -------------------------------------------
# Contract loading
# -------------------------------------------

def test_load_master_contract():

    contract = load_master_contract(
        CONTRACTS_DIR
    )

    assert (
        contract["contract"]["name"]
        == "SANDHAAN Data Contract"
    )

    assert (
        contract["contract"]["version"]
        == "1.0"
    )


def test_load_persons_contract():

    contract = load_dataset_contract(
        CONTRACTS_DIR,
        "persons",
    )

    assert (
        contract["dataset"]["name"]
        == "persons"
    )

    assert (
        contract["dataset"]["primary_key"]["column"]
        == "person_id"
    )


def test_load_cdr_contract_limitations():

    contract = load_dataset_contract(
        CONTRACTS_DIR,
        "cdr_records",
    )

    assert (
        contract["dataset"]["columns"]
        ["location_id"]["relationship_status"]
        == "semantics_pending"
    )

    assert len(
        contract["dataset"]["limitations"]
    ) > 0


def test_missing_dataset_contract():

    with pytest.raises(
        FileNotFoundError
    ):

        load_dataset_contract(
            CONTRACTS_DIR,
            "nonexistent_dataset",
        )


# -------------------------------------------
# Contract against real YAML
# -------------------------------------------

def test_persons_contract_against_data():

    contract = load_dataset_contract(
        CONTRACTS_DIR,
        "persons",
    )

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
            "normalized_name": [
                "Rahul",
                "Priya",
            ],
        }
    )

    validate_dataset_contract(
        dataframe,
        contract,
    )
