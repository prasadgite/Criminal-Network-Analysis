import pandas as pd

from profiling.profiler import (
    profile_dataset,
    profile_column,
    profile_columns,
    profile_numeric_column,
    profile_categorical_column,
    profile_primary_key,
    create_complete_profile,
)
from profiling.reports import (
    write_json_report,
    build_dataset_report,
    build_pipeline_summary,
)


# -------------------------------------------
# D1.8.17 — Dataset profile
# -------------------------------------------

def test_dataset_profile():

    dataframe = pd.DataFrame(
        {
            "person_id": [
                "P001",
                "P002",
                "P003",
            ],
            "age": [
                21,
                32,
                41,
            ],
        }
    )

    profile = profile_dataset(
        dataframe,
        "persons",
    )

    assert profile.row_count == 3
    assert profile.column_count == 2
    assert profile.duplicate_rows == 0
    assert profile.null_cells == 0


# -------------------------------------------
# D1.8.18 — Null profiling
# -------------------------------------------

def test_null_profiling():

    dataframe = pd.DataFrame(
        {
            "name": [
                "A",
                None,
                "C",
            ]
        }
    )

    profile = profile_dataset(
        dataframe,
        "persons",
    )

    assert profile.null_cells == 1


# -------------------------------------------
# D1.8.19 — Duplicate profiling
# -------------------------------------------

def test_duplicate_rows():

    dataframe = pd.DataFrame(
        {
            "id": [
                "P001",
                "P001",
                "P002",
            ],
            "name": [
                "A",
                "A",
                "B",
            ],
        }
    )

    profile = profile_dataset(
        dataframe,
        "persons",
    )

    assert profile.duplicate_rows == 1


# -------------------------------------------
# D1.8.20 — Primary-key profiling
# -------------------------------------------

def test_primary_key_profile():

    dataframe = pd.DataFrame(
        {
            "person_id": [
                "P001",
                "P002",
                "P002",
                None,
            ]
        }
    )

    result = profile_primary_key(
        dataframe,
        "person_id",
    )

    assert result["exists"] is True
    assert result["null_count"] == 1
    assert result["duplicate_count"] == 1
    assert result["unique_count"] == 2


def test_primary_key_missing_column():

    dataframe = pd.DataFrame(
        {
            "other": ["A"]
        }
    )

    result = profile_primary_key(
        dataframe,
        "person_id",
    )

    assert result["exists"] is False


# -------------------------------------------
# Column-level profiling
# -------------------------------------------

def test_column_profile():

    dataframe = pd.DataFrame(
        {
            "name": [
                "Rahul",
                "Priya",
                None,
                "Rahul",
            ]
        }
    )

    col = profile_column(
        dataframe,
        "name",
    )

    assert col.column == "name"
    assert col.null_count == 1
    assert col.null_percentage == 25.0
    assert col.unique_count == 2


def test_profile_all_columns():

    dataframe = pd.DataFrame(
        {
            "id": ["A", "B"],
            "name": ["X", "Y"],
        }
    )

    cols = profile_columns(dataframe)

    assert len(cols) == 2
    assert cols[0].column == "id"
    assert cols[1].column == "name"


# -------------------------------------------
# Numeric profiling
# -------------------------------------------

def test_numeric_profile():

    series = pd.Series(
        [10, 20, 30, 40, 50]
    )

    stats = profile_numeric_column(
        series
    )

    assert stats["min"] == 10.0
    assert stats["max"] == 50.0
    assert stats["mean"] == 30.0
    assert stats["median"] == 30.0
    assert stats["std"] is not None


def test_numeric_profile_empty():

    series = pd.Series(
        [None, None],
        dtype="object",
    )

    stats = profile_numeric_column(
        series
    )

    assert stats["min"] is None
    assert stats["max"] is None


# -------------------------------------------
# Categorical profiling
# -------------------------------------------

def test_categorical_profile():

    series = pd.Series(
        ["A", "B", "A", "A", "B", "C"]
    )

    stats = profile_categorical_column(
        series
    )

    top = stats["top_values"]

    assert len(top) == 3
    assert top[0]["value"] == "A"
    assert top[0]["count"] == 3


# -------------------------------------------
# Complete profile
# -------------------------------------------

def test_complete_profile():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
        }
    )

    profile = create_complete_profile(
        dataframe,
        "persons",
        primary_key="person_id",
    )

    assert profile.dataset == "persons"
    assert (
        profile.dataset_stats["row_count"]
        == 2
    )
    assert (
        profile.primary_key_stats["exists"]
        is True
    )
    assert len(profile.columns) == 2


# -------------------------------------------
# D1.8.21 — Pipeline summary
# -------------------------------------------

def test_pipeline_summary():

    reports = [
        {
            "dataset": "persons",
            "status": "PASS",
            "validation": {
                "warnings": 1,
                "errors": 0,
            },
        },
        {
            "dataset": "phones",
            "status": "FAIL",
            "validation": {
                "warnings": 0,
                "errors": 2,
            },
        },
    ]

    summary = build_pipeline_summary(
        reports
    )

    assert summary["total_datasets"] == 2
    assert summary["passed_datasets"] == 1
    assert summary["failed_datasets"] == 1
    assert summary["pipeline_status"] == "FAIL"
    assert summary["total_warnings"] == 1


def test_pipeline_summary_all_pass():

    reports = [
        {
            "dataset": "persons",
            "status": "PASS",
            "validation": {
                "warnings": 0,
                "errors": 0,
            },
        },
    ]

    summary = build_pipeline_summary(
        reports
    )

    assert summary["pipeline_status"] == "PASS"


# -------------------------------------------
# D1.8.11 — Dataset quality report
# -------------------------------------------

def test_dataset_report():

    profile = {
        "dataset_stats": {
            "row_count": 100,
        }
    }

    validation = {
        "errors": 0,
        "warnings": 2,
    }

    report = build_dataset_report(
        profile=profile,
        validation_result=validation,
        dataset_name="persons",
        pipeline_version="1.0.0",
        schema_version="1.0",
    )

    assert report["dataset"] == "persons"
    assert report["status"] == "PASS"
    assert report["lineage"]["pipeline_version"] == "1.0.0"


def test_dataset_report_fail():

    report = build_dataset_report(
        profile={},
        validation_result={
            "errors": 3,
            "warnings": 1,
        },
        dataset_name="evidence",
        pipeline_version="1.0.0",
        schema_version="1.0",
    )

    assert report["status"] == "FAIL"


# -------------------------------------------
# D1.8.22 — JSON serialization
# -------------------------------------------

def test_json_report(tmp_path):

    report = {
        "dataset": "persons",
        "status": "PASS",
    }

    output = (
        tmp_path
        / "reports"
        / "report.json"
    )

    result = write_json_report(
        report,
        output,
    )

    assert result.exists()

    content = result.read_text(
        encoding="utf-8"
    )

    assert '"persons"' in content
    assert '"PASS"' in content


# -------------------------------------------
# Profile is read-only (no mutation)
# -------------------------------------------

def test_profiling_does_not_mutate_input():

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", None],
        }
    )

    original = dataframe.copy(deep=True)

    profile_dataset(dataframe, "persons")
    profile_columns(dataframe)
    profile_primary_key(dataframe, "person_id")

    pd.testing.assert_frame_equal(
        dataframe,
        original,
    )
