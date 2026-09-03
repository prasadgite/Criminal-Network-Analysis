import pandas as pd

from transformation.persons import (
    transform_persons,
)
from transformation.cases import (
    transform_cases,
)
from transformation.communications import (
    transform_phones,
    transform_cdr_records,
)
from transformation.transactions import (
    transform_bank_accounts,
    transform_transactions,
)
from transformation.locations import (
    transform_locations,
)
from transformation.base import (
    PIPELINE_VERSION,
    SCHEMA_VERSION,
)


# -------------------------------------------
# D1.7.15 — Persons transformation
# -------------------------------------------

def test_person_transformation():

    dataframe = pd.DataFrame(
        {
            "person_id": [
                " P001 "
            ],
            "name": [
                "  Rahul Sharma  "
            ],
        }
    )

    result = transform_persons(
        dataframe
    )

    assert result.loc[
        0,
        "person_id"
    ] == "P001"

    assert result.loc[
        0,
        "name"
    ] == "  Rahul Sharma  "

    assert result.loc[
        0,
        "normalized_name"
    ] == "Rahul Sharma"


# -------------------------------------------
# D1.7.15 — Phone transformation
# -------------------------------------------

def test_phone_transformation():

    dataframe = pd.DataFrame(
        {
            "phone_id": [
                " PH001 "
            ],
            "phone_number": [
                "+91 9876543210"
            ],
            "registered_person_id": [
                " P001 "
            ],
        }
    )

    result = transform_phones(
        dataframe
    )

    assert result.loc[
        0,
        "phone_id"
    ] == "PH001"

    assert result.loc[
        0,
        "registered_person_id"
    ] == "P001"

    assert result.loc[
        0,
        "phone_number"
    ] == "+91 9876543210"

    assert result.loc[
        0,
        "normalized_phone_number"
    ] == "919876543210"


# -------------------------------------------
# D1.7.15 — Lineage metadata
# -------------------------------------------

def test_lineage_metadata():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001"]
        }
    )

    result = transform_persons(
        dataframe
    )

    assert (
        result.loc[
            0,
            "source_dataset"
        ]
        == "persons"
    )

    assert (
        result.loc[
            0,
            "pipeline_version"
        ]
        == PIPELINE_VERSION
    )

    assert (
        result.loc[
            0,
            "schema_version"
        ]
        == SCHEMA_VERSION
    )

    assert (
        result.loc[
            0,
            "processing_timestamp"
        ]
        is not None
    )


# -------------------------------------------
# D1.7.16 — Input immutability
# -------------------------------------------

def test_transformation_does_not_mutate_input():

    dataframe = pd.DataFrame(
        {
            "person_id": [" P001 "],
            "name": [" Rahul Sharma "],
        }
    )

    original = dataframe.copy(
        deep=True
    )

    transform_persons(
        dataframe
    )

    pd.testing.assert_frame_equal(
        dataframe,
        original,
    )


# -------------------------------------------
# Cases transformation
# -------------------------------------------

def test_cases_transformation():

    dataframe = pd.DataFrame(
        {
            "case_id": [" C001 "],
            "case_title": ["  Robbery Case  "],
        }
    )

    result = transform_cases(
        dataframe
    )

    assert result.loc[0, "case_id"] == "C001"

    assert result.loc[
        0, "case_title"
    ] == "  Robbery Case  "

    assert result.loc[
        0, "normalized_case_title"
    ] == "Robbery Case"

    assert result.loc[
        0, "source_dataset"
    ] == "cases"


# -------------------------------------------
# CDR records transformation
# -------------------------------------------

def test_cdr_transformation():

    dataframe = pd.DataFrame(
        {
            "cdr_id": [" CDR001 "],
            "caller_phone": ["9876543210"],
            "callee_phone": ["9123456789"],
        }
    )

    result = transform_cdr_records(
        dataframe
    )

    assert result.loc[0, "cdr_id"] == "CDR001"

    assert result.loc[
        0, "normalized_caller_phone"
    ] == "919876543210"

    assert result.loc[
        0, "normalized_callee_phone"
    ] == "919123456789"

    assert result.loc[
        0, "source_dataset"
    ] == "cdr_records"


# -------------------------------------------
# Bank accounts transformation
# -------------------------------------------

def test_bank_accounts_transformation():

    dataframe = pd.DataFrame(
        {
            "account_id": [" ACC001 "],
            "holder_person_id": [" P001 "],
        }
    )

    result = transform_bank_accounts(
        dataframe
    )

    assert result.loc[
        0, "account_id"
    ] == "ACC001"

    assert result.loc[
        0, "holder_person_id"
    ] == "P001"

    assert result.loc[
        0, "source_dataset"
    ] == "bank_accounts"


# -------------------------------------------
# Transactions transformation
# -------------------------------------------

def test_transactions_transformation():

    dataframe = pd.DataFrame(
        {
            "transaction_id": [" TXN001 "],
            "sender_account_id": [" ACC001 "],
            "receiver_account_id": [" ACC002 "],
        }
    )

    result = transform_transactions(
        dataframe
    )

    assert result.loc[
        0, "transaction_id"
    ] == "TXN001"

    assert result.loc[
        0, "sender_account_id"
    ] == "ACC001"

    assert result.loc[
        0, "receiver_account_id"
    ] == "ACC002"

    assert result.loc[
        0, "source_dataset"
    ] == "transactions"


# -------------------------------------------
# Locations transformation
# -------------------------------------------

def test_locations_transformation():

    dataframe = pd.DataFrame(
        {
            "location_id": [" LOC001 "],
            "state": ["  Maharashtra  "],
            "city": ["  Mumbai  "],
        }
    )

    result = transform_locations(
        dataframe
    )

    assert result.loc[
        0, "location_id"
    ] == "LOC001"

    assert result.loc[
        0, "state"
    ] == "  Maharashtra  "

    assert result.loc[
        0, "normalized_state"
    ] == "Maharashtra"

    assert result.loc[
        0, "normalized_city"
    ] == "Mumbai"

    assert result.loc[
        0, "source_dataset"
    ] == "locations"


# -------------------------------------------
# Missing columns are safely skipped
# -------------------------------------------

def test_missing_columns_skipped():

    dataframe = pd.DataFrame(
        {
            "some_other_field": ["value"]
        }
    )

    result = transform_persons(
        dataframe
    )

    assert "normalized_name" not in result.columns
    assert "source_dataset" in result.columns
