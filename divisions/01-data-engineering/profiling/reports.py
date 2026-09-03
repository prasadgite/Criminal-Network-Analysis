import json

from datetime import datetime, timezone
from pathlib import Path


def write_json_report(
    report: dict,
    output_path: str | Path,
) -> Path:
    """
    Serialize a report dict to a JSON file.

    Creates parent directories if they don't
    exist.
    """

    output_path = Path(
        output_path
    )

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    with output_path.open(
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            report,
            file,
            indent=2,
            ensure_ascii=False,
        )

    return output_path


def build_dataset_report(
    profile: dict,
    validation_result: dict,
    dataset_name: str,
    pipeline_version: str,
    schema_version: str,
) -> dict:
    """
    Combine a dataset profile and validation
    result into a single quality report.

    Status is FAIL if any errors exist,
    PASS otherwise (warnings alone do not
    cause failure).
    """

    errors = validation_result.get(
        "errors",
        0,
    )

    warnings = validation_result.get(
        "warnings",
        0,
    )

    status = (
        "FAIL"
        if errors > 0
        else "PASS"
    )

    return {
        "dataset": dataset_name,

        "status": status,

        "profile": profile,

        "validation": validation_result,

        "lineage": {
            "pipeline_version":
                pipeline_version,

            "schema_version":
                schema_version,

            "generated_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        },
    }


def build_pipeline_summary(
    dataset_reports: list[dict],
) -> dict:
    """
    Aggregate individual dataset reports into
    a pipeline-level summary.

    The pipeline status is FAIL if any dataset
    failed.
    """

    total = len(
        dataset_reports
    )

    passed = sum(
        report["status"] == "PASS"
        for report in dataset_reports
    )

    failed = sum(
        report["status"] == "FAIL"
        for report in dataset_reports
    )

    total_warnings = sum(
        report["validation"].get(
            "warnings",
            0,
        )
        for report in dataset_reports
    )

    return {
        "total_datasets": total,
        "passed_datasets": passed,
        "failed_datasets": failed,
        "total_warnings": total_warnings,
        "pipeline_status": (
            "FAIL"
            if failed > 0
            else "PASS"
        ),
        "datasets": [
            {
                "dataset":
                    report["dataset"],
                "status":
                    report["status"],
            }
            for report in dataset_reports
        ],
    }
