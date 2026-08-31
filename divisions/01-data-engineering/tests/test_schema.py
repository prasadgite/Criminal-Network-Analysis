from pathlib import Path

from ingestion.loader import (
    load_config,
    get_dataset_config,
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CONFIG_PATH = (
    PROJECT_ROOT
    / "divisions"
    / "01-data-engineering"
    / "config"
    / "datasets.yaml"
)


EXPECTED_DATASETS = {
    "persons",
    "cases",
    "fir_narratives",
    "phones",
    "cdr_records",
    "vehicles",
    "locations",
    "location_events",
    "bank_accounts",
    "transactions",
    "case_entities",
    "evidence",
    "organizations",
}


def test_all_mvp_datasets_configured():

    config = load_config(CONFIG_PATH)

    assert EXPECTED_DATASETS.issubset(
        set(config["datasets"].keys())
    )


def test_primary_keys_configured():

    config = load_config(CONFIG_PATH)

    for dataset_name in EXPECTED_DATASETS:

        dataset_config = get_dataset_config(
            config,
            dataset_name,
        )

        assert "primary_key" in dataset_config
        assert dataset_config["primary_key"]


def test_expected_primary_keys():

    config = load_config(CONFIG_PATH)

    expected_keys = {
        "persons": "person_id",
        "cases": "case_id",
        "fir_narratives": "document_id",
        "phones": "phone_id",
        "cdr_records": "cdr_id",
        "vehicles": "vehicle_id",
        "locations": "location_id",
        "location_events": "event_id",
        "bank_accounts": "account_id",
        "transactions": "transaction_id",
        "case_entities": "relationship_id",
        "evidence": "evidence_id",
        "organizations": "organization_id",
    }

    for dataset_name, expected_key in expected_keys.items():

        actual_key = get_dataset_config(
            config,
            dataset_name,
        )["primary_key"]

        assert actual_key == expected_key
