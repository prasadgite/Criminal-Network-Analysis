import pandas as pd

from validation.quality_validator import (
    validate_quality,
)


SCHEMA = {
    "relationship_id": {
        "type": "string",
        "required": True,
    },
    "confidence": {
        "type": "float",
        "required": True,
        "range": {
            "min": 0.0,
            "max": 1.0,
        },
    },
    "start_time": {
        "type": "datetime",
        "required": True,
    },
    "end_time": {
        "type": "datetime",
        "required": False,
    },
}


CONFIG = {
    "schema_status": "confirmed",
    "primary_key": "relationship_id",
    "columns": SCHEMA,
}


def test_valid_quality():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL001",
                "REL002",
            ],
            "confidence": [
                0.95,
                0.81,
            ],
            "start_time": [
                "2026-01-01T10:00:00",
                "2026-01-01T11:00:00",
            ],
            "end_time": [
                "2026-01-01T12:00:00",
                "2026-01-01T13:00:00",
            ],
        }
    )

    result = validate_quality(
        "case_entities",
        dataframe,
        CONFIG,
    )

    assert result.passed is True
    assert len(result.errors) == 0


def test_required_null_fails():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL001",
                None,
            ],
            "confidence": [
                0.95,
                0.81,
            ],
            "start_time": [
                "2026-01-01T10:00:00",
                "2026-01-01T11:00:00",
            ],
            "end_time": [
                "2026-01-01T12:00:00",
                "2026-01-01T13:00:00",
            ],
        }
    )

    result = validate_quality(
        "case_entities",
        dataframe,
        CONFIG,
    )

    assert result.passed is False

    assert any(
        issue.issue_type == "NULL_REQUIRED_FIELD"
        for issue in result.errors
    )


def test_confidence_range_fails():

    dataframe = pd.DataFrame(
        {
            "relationship_id": ["REL001"],
            "confidence": [1.5],
            "start_time": [
                "2026-01-01T10:00:00"
            ],
            "end_time": [
                "2026-01-01T12:00:00"
            ],
        }
    )

    result = validate_quality(
        "case_entities",
        dataframe,
        CONFIG,
    )

    assert result.passed is False

    assert any(
        issue.issue_type == "INVALID_NUMERIC_RANGE"
        for issue in result.errors
    )


def test_temporal_inconsistency_fails():

    dataframe = pd.DataFrame(
        {
            "relationship_id": ["REL001"],
            "confidence": [0.95],
            "start_time": [
                "2026-01-01T15:00:00"
            ],
            "end_time": [
                "2026-01-01T10:00:00"
            ],
        }
    )

    result = validate_quality(
        "case_entities",
        dataframe,
        CONFIG,
    )

    assert result.passed is False

    assert any(
        issue.issue_type == "TEMPORAL_INCONSISTENCY"
        for issue in result.errors
    )


def test_duplicate_rows_are_warning():

    dataframe = pd.DataFrame(
        {
            "relationship_id": [
                "REL001",
                "REL001",
            ],
            "confidence": [
                0.95,
                0.95,
            ],
            "start_time": [
                "2026-01-01T10:00:00",
                "2026-01-01T10:00:00",
            ],
            "end_time": [
                "2026-01-01T12:00:00",
                "2026-01-01T12:00:00",
            ],
        }
    )

    result = validate_quality(
        "case_entities",
        dataframe,
        CONFIG,
    )

    assert any(
        issue.issue_type == "DUPLICATE_RECORD"
        for issue in result.warnings
    )
