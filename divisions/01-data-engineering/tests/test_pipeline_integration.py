import json
from pathlib import Path

import pandas as pd

from pipeline.runner import (
    PipelineResult,
    run_dataset,
    run_pipeline,
    summarize_results,
)
from versioning.hashing import sha256_file


CONTRACTS_DIR = (
    Path(__file__).resolve().parents[1]
    / "contracts"
)


# -------------------------------------------
# Helpers
# -------------------------------------------

def _write_raw_csv(
    tmp_path: Path,
    filename: str,
    dataframe: pd.DataFrame,
) -> Path:
    """Write a DataFrame as a raw CSV."""

    raw_dir = tmp_path / "raw"
    raw_dir.mkdir(exist_ok=True)

    path = raw_dir / filename

    dataframe.to_csv(
        path,
        index=False,
    )

    return path


def _standard_dirs(
    tmp_path: Path,
) -> tuple[Path, Path, Path]:
    """Create output/report/manifest dirs."""

    output = tmp_path / "processed"
    report = tmp_path / "reports"
    manifest = tmp_path / "manifests"

    return output, report, manifest


def _config(
    pipeline_version: str = "1.0.0",
    schema_version: str = "1.0",
) -> dict:

    return {
        "pipeline_version": pipeline_version,
        "schema_version": schema_version,
    }


# -------------------------------------------
# 9. Full end-to-end pipeline
# -------------------------------------------

def test_full_pipeline(tmp_path):

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": [
                "Rahul Sharma",
                "Priya Singh",
            ],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output / "persons",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
        contracts_directory=CONTRACTS_DIR,
    )

    assert result.success
    assert result.processed_path.exists()
    assert result.report_path.exists()
    assert result.manifest_path.exists()


# -------------------------------------------
# 10. Verify the output artifact
# -------------------------------------------

def test_output_contains_expected_data(
    tmp_path,
):

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output / "persons",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
    )

    processed = pd.read_csv(
        result.processed_path
    )

    assert len(processed) == 2
    assert "person_id" in processed.columns
    assert "name" in processed.columns
    assert "normalized_name" in processed.columns
    assert "source_dataset" in processed.columns


# -------------------------------------------
# 11. Verify manifest
# -------------------------------------------

def test_manifest_contains_lineage(
    tmp_path,
):

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output / "persons",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
    )

    with open(
        result.manifest_path,
        "r",
        encoding="utf-8",
    ) as file:

        m = json.load(file)

    assert m["dataset"] == "persons"
    assert m["source"]["sha256"]
    assert m["output"]["sha256"]
    assert m["pipeline"]["version"] == "1.0.0"
    assert m["schema"]["version"] == "1.0"
    assert "version_id" in m


# -------------------------------------------
# 12. Verify report
# -------------------------------------------

def test_report_structure(
    tmp_path,
):

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output / "persons",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
    )

    with open(
        result.report_path,
        "r",
        encoding="utf-8",
    ) as file:

        r = json.load(file)

    assert r["dataset"] == "persons"
    assert "profile" in r
    assert "validation" in r
    assert "lineage" in r
    assert r["status"] == "PASS"


# -------------------------------------------
# 13. Determinism test
# -------------------------------------------

def test_pipeline_determinism(
    tmp_path,
):

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    # First run
    output_1 = tmp_path / "run1" / "processed"
    report_1 = tmp_path / "run1" / "reports"
    manifest_1 = tmp_path / "run1" / "manifests"

    result_1 = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output_1 / "persons",
        report_directory=report_1,
        manifest_directory=manifest_1,
        config=_config(),
    )

    # Second run (same source)
    output_2 = tmp_path / "run2" / "processed"
    report_2 = tmp_path / "run2" / "reports"
    manifest_2 = tmp_path / "run2" / "manifests"

    result_2 = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output_2 / "persons",
        report_directory=report_2,
        manifest_directory=manifest_2,
        config=_config(),
    )

    assert result_1.success
    assert result_2.success

    # Same source → same data content.
    # processing_timestamp is a wall-clock
    # value that legitimately differs between
    # runs, so we compare data columns only.

    df1 = pd.read_csv(
        result_1.processed_path
    )

    df2 = pd.read_csv(
        result_2.processed_path
    )

    compare_cols = [
        col for col in df1.columns
        if col != "processing_timestamp"
    ]

    pd.testing.assert_frame_equal(
        df1[compare_cols],
        df2[compare_cols],
    )

    # Source hashes must also match.
    with open(
        result_1.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m1 = json.load(f)

    with open(
        result_2.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m2 = json.load(f)

    assert (
        m1["source"]["sha256"]
        == m2["source"]["sha256"]
    )

    assert (
        m1["version_id"]
        == m2["version_id"]
    )


# -------------------------------------------
# 14. Source-change test
# -------------------------------------------

def test_source_change_changes_hash(
    tmp_path,
):

    df1 = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        df1,
    )

    output_1 = tmp_path / "run1" / "processed"
    report_1 = tmp_path / "run1" / "reports"
    manifest_1 = tmp_path / "run1" / "manifests"

    result_1 = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output_1 / "persons",
        report_directory=report_1,
        manifest_directory=manifest_1,
        config=_config(),
    )

    # Change source data
    df2 = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Changed Name"],
        }
    )

    df2.to_csv(
        raw_path,
        index=False,
    )

    output_2 = tmp_path / "run2" / "processed"
    report_2 = tmp_path / "run2" / "reports"
    manifest_2 = tmp_path / "run2" / "manifests"

    result_2 = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output_2 / "persons",
        report_directory=report_2,
        manifest_directory=manifest_2,
        config=_config(),
    )

    with open(
        result_1.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m1 = json.load(f)

    with open(
        result_2.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m2 = json.load(f)

    assert (
        m1["source"]["sha256"]
        != m2["source"]["sha256"]
    )

    assert (
        m1["version_id"]
        != m2["version_id"]
    )


# -------------------------------------------
# 15. Pipeline-version test
# -------------------------------------------

def test_pipeline_version_changes_version_id(
    tmp_path,
):

    dataframe = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    # Run with version 1.0.0
    output_1 = tmp_path / "run1" / "processed"
    report_1 = tmp_path / "run1" / "reports"
    manifest_1 = tmp_path / "run1" / "manifests"

    result_1 = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output_1 / "persons",
        report_directory=report_1,
        manifest_directory=manifest_1,
        config=_config("1.0.0", "1.0"),
    )

    # Run with version 1.0.1
    output_2 = tmp_path / "run2" / "processed"
    report_2 = tmp_path / "run2" / "reports"
    manifest_2 = tmp_path / "run2" / "manifests"

    result_2 = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output_2 / "persons",
        report_directory=report_2,
        manifest_directory=manifest_2,
        config=_config("1.0.1", "1.0"),
    )

    with open(
        result_1.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m1 = json.load(f)

    with open(
        result_2.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m2 = json.load(f)

    # Same source → same source hash
    assert (
        m1["source"]["sha256"]
        == m2["source"]["sha256"]
    )

    # Different pipeline → different version_id
    assert (
        m1["version_id"]
        != m2["version_id"]
    )


# -------------------------------------------
# 16. Contract failure test
# -------------------------------------------

def test_contract_failure_prevents_output(
    tmp_path,
):

    # Duplicate person_id violates the
    # persons contract (unique PK)
    dataframe = pd.DataFrame(
        {
            "person_id": ["P001", "P001"],
            "name": ["A", "B"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        dataframe,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output / "persons",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
        contracts_directory=CONTRACTS_DIR,
    )

    assert not result.success
    assert result.error is not None
    assert result.processed_path is None


# -------------------------------------------
# 17. Failure isolation (multi-dataset)
# -------------------------------------------

def test_failure_isolation(tmp_path):

    # Good dataset
    good_df = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
        }
    )

    good_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        good_df,
    )

    # Bad dataset (duplicate PK fails contract)
    bad_df = pd.DataFrame(
        {
            "person_id": ["P001", "P001"],
            "name": ["A", "B"],
        }
    )

    bad_raw = tmp_path / "raw"
    bad_path = bad_raw / "persons_bad.csv"
    bad_df.to_csv(bad_path, index=False)

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    datasets = [
        {
            "name": "persons",
            "raw_path": good_path,
            "output_directory":
                output / "persons",
            "report_directory": report,
            "manifest_directory": manifest,
            "contracts_directory":
                CONTRACTS_DIR,
        },
        {
            "name": "persons",
            "raw_path": bad_path,
            "output_directory":
                output / "persons_bad",
            "report_directory":
                tmp_path / "reports_bad",
            "manifest_directory":
                tmp_path / "manifests_bad",
            "contracts_directory":
                CONTRACTS_DIR,
        },
    ]

    results = run_pipeline(
        datasets,
        _config(),
    )

    assert len(results) == 2

    summary = summarize_results(results)

    assert summary["total"] == 2
    assert summary["passed"] == 1
    assert summary["failed"] == 1
    assert summary["pipeline_status"] == "FAIL"


# -------------------------------------------
# Pipeline summary — all pass
# -------------------------------------------

def test_summary_all_pass(tmp_path):

    df = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        df,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    results = run_pipeline(
        [
            {
                "name": "persons",
                "raw_path": raw_path,
                "output_directory":
                    output / "persons",
                "report_directory": report,
                "manifest_directory": manifest,
            },
        ],
        _config(),
    )

    summary = summarize_results(results)

    assert summary["pipeline_status"] == "PASS"
    assert summary["passed"] == 1
    assert summary["failed"] == 0


# -------------------------------------------
# Non-transformer dataset passes through
# -------------------------------------------

def test_dataset_without_transformer(
    tmp_path,
):

    df = pd.DataFrame(
        {
            "evidence_id": ["E001"],
            "case_id": ["C001"],
            "description": ["Some evidence"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "evidence.csv",
        df,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="evidence",
        raw_path=raw_path,
        output_directory=output / "evidence",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
    )

    assert result.success

    processed = pd.read_csv(
        result.processed_path
    )

    assert "evidence_id" in processed.columns


# -------------------------------------------
# Tamper detection after pipeline
# -------------------------------------------

def test_tamper_detection_after_pipeline(
    tmp_path,
):

    from versioning.verify import (
        verify_file_hash,
    )

    df = pd.DataFrame(
        {
            "person_id": ["P001"],
            "name": ["Rahul"],
        }
    )

    raw_path = _write_raw_csv(
        tmp_path,
        "persons.csv",
        df,
    )

    output, report, manifest = (
        _standard_dirs(tmp_path)
    )

    result = run_dataset(
        dataset_name="persons",
        raw_path=raw_path,
        output_directory=output / "persons",
        report_directory=report,
        manifest_directory=manifest,
        config=_config(),
    )

    with open(
        result.manifest_path,
        "r",
        encoding="utf-8",
    ) as f:
        m = json.load(f)

    # Output matches manifest hash
    assert verify_file_hash(
        result.processed_path,
        m["output"]["sha256"],
    )

    # Tamper with the output
    with open(
        result.processed_path,
        "a",
        encoding="utf-8",
    ) as f:
        f.write("\nP999,Tampered,tampered")

    # Hash no longer matches
    assert not verify_file_hash(
        result.processed_path,
        m["output"]["sha256"],
    )
