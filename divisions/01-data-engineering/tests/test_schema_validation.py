import pandas as pd

from validation.schema_validator import (
    validate_schema,
)


CASE_ENTITIES_SCHEMA = {
    "relationship_id": {
        "type": "string",
        "required": True,
    },
    "case_id": {
        "type": "string",
        "required": True,
    },
    "confidence": {
        "type": "float",
        "required": True,
    },
}


DATASET_CONFIG = {
    "primary_key": "relationship_id",
    "schema_status": "confirmed",
    "columns": CASE_ENTITIES_SCHEMA,
}


def test_valid_schema():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL000001",
                "REL000002",
            ],
            "case_id": [
                "C000001",
                "C000002",
            ],
            "confidence": [
                0.95,
                0.91,
            ],
        }
    )

    result = validate_schema(
        "case_entities",
        dataframe,
        DATASET_CONFIG,
    )

    assert result.passed is True
    assert result.issues == []


def test_missing_required_column():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL000001",
            ],
            "confidence": [
                0.95,
            ],
        }
    )

    result = validate_schema(
        "case_entities",
        dataframe,
        DATASET_CONFIG,
    )

    assert result.passed is False

    assert any(
        issue.issue_type == "MISSING_COLUMN"
        for issue in result.issues
    )


def test_duplicate_primary_key():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL000001",
                "REL000001",
            ],
            "case_id": [
                "C000001",
                "C000002",
            ],
            "confidence": [
                0.95,
                0.91,
            ],
        }
    )

    result = validate_schema(
        "case_entities",
        dataframe,
        DATASET_CONFIG,
    )

    assert result.passed is False

    assert any(
        issue.issue_type == "DUPLICATE_PRIMARY_KEY"
        for issue in result.issues
    )


def test_unexpected_column():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL000001",
            ],
            "case_id": [
                "C000001",
            ],
            "confidence": [
                0.95,
            ],
            "unknown_column": [
                "unexpected",
            ],
        }
    )

    result = validate_schema(
        "case_entities",
        dataframe,
        DATASET_CONFIG,
    )

    assert result.passed is False

    assert any(
        issue.issue_type == "UNEXPECTED_COLUMN"
        for issue in result.issues
    )
