from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

from ingestion.loader import (
    get_dataset_config,
)
from ingestion.readers import read_csv

from validation.schema_validator import (
    validate_schema,
)
from validation.quality_validator import (
    validate_quality,
)

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
from transformation.writer import (
    write_processed_csv,
)

from contracts.loader import (
    load_dataset_contract,
)
from contracts.validator import (
    validate_dataset_contract,
    ContractViolation,
)

from profiling.profiler import (
    create_complete_profile,
)
from profiling.reports import (
    build_dataset_report,
    write_json_report,
    build_pipeline_summary,
)

from versioning.hashing import (
    sha256_file,
    dataset_version_id,
)
from versioning.manifest import (
    create_manifest,
    write_manifest,
)
from versioning.version import (
    create_version_info,
)


# -------------------------------------------
# Dataset-name → transformer mapping
# -------------------------------------------

TRANSFORMERS = {

    "persons":
        transform_persons,

    "cases":
        transform_cases,

    "phones":
        transform_phones,

    "cdr_records":
        transform_cdr_records,

    "locations":
        transform_locations,

    "bank_accounts":
        transform_bank_accounts,

    "transactions":
        transform_transactions,
}


# -------------------------------------------
# Pipeline result
# -------------------------------------------

@dataclass
class PipelineResult:
    """
    Outcome of processing a single dataset
    through the full Division 1 pipeline.
    """

    dataset: str

    success: bool

    processed_path: Path | None

    report_path: Path | None

    manifest_path: Path | None

    error: str | None = None


# -------------------------------------------
# Single-dataset execution
# -------------------------------------------

def run_dataset(
    dataset_name: str,
    raw_path: str | Path,
    output_directory: str | Path,
    report_directory: str | Path,
    manifest_directory: str | Path,
    config: dict,
    *,
    contracts_directory: str | Path | None = None,
    dataset_config: dict | None = None,
) -> PipelineResult:
    """
    Execute the full Division 1 pipeline for
    one dataset.

    Steps:
        1. Source fingerprint
        2. Ingestion
        3. Schema validation
        4. Quality validation
        5. Transformation
        6. Contract validation (if available)
        7. Profiling
        8. Write processed output
        9. Output fingerprint
       10. Manifest
       11. Quality report
    """

    raw_path = Path(raw_path)

    try:

        # ------------------------------------------
        # 1. Source fingerprint
        # ------------------------------------------

        source_hash = sha256_file(
            raw_path
        )

        # ------------------------------------------
        # 2. Ingestion
        # ------------------------------------------

        dataframe = read_csv(raw_path)

        # ------------------------------------------
        # 3. Schema validation
        # ------------------------------------------

        if dataset_config:

            schema_result = validate_schema(
                dataset_name,
                dataframe,
                dataset_config,
                allow_unexpected_columns=True,
            )

            if not schema_result.passed:

                issues = "; ".join(
                    issue.message
                    for issue
                    in schema_result.issues
                )

                raise ValueError(
                    f"Schema validation failed: "
                    f"{issues}"
                )

        # ------------------------------------------
        # 4. Quality validation
        # ------------------------------------------

        validation_errors = 0
        validation_warnings = 0

        if dataset_config:

            quality_result = validate_quality(
                dataset_name,
                dataframe,
                dataset_config,
            )

            validation_errors = len(
                quality_result.errors
            )

            validation_warnings = len(
                quality_result.warnings
            )

            if not quality_result.passed:

                issues = "; ".join(
                    issue.message
                    for issue
                    in quality_result.errors
                )

                raise ValueError(
                    f"Quality validation failed: "
                    f"{issues}"
                )

        # ------------------------------------------
        # 5. Transformation
        # ------------------------------------------

        transformer = TRANSFORMERS.get(
            dataset_name
        )

        if transformer:
            dataframe = transformer(dataframe)

        # ------------------------------------------
        # 6. Contract validation
        # ------------------------------------------

        if contracts_directory:

            try:

                contract = load_dataset_contract(
                    contracts_directory,
                    dataset_name,
                )

                validate_dataset_contract(
                    dataframe,
                    contract,
                )

            except FileNotFoundError:
                # No contract defined yet for
                # this dataset — skip.
                pass

        # ------------------------------------------
        # 7. Profiling
        # ------------------------------------------

        primary_key = None

        if dataset_config:

            primary_key = dataset_config.get(
                "primary_key"
            )

        profile = create_complete_profile(
            dataframe,
            dataset_name,
            primary_key=primary_key,
        )

        # ------------------------------------------
        # 8. Write processed output
        # ------------------------------------------

        output_path = write_processed_csv(
            dataframe,
            output_directory,
            f"{dataset_name}.csv",
        )

        # ------------------------------------------
        # 9. Output fingerprint
        # ------------------------------------------

        processed_hash = sha256_file(
            output_path
        )

        # ------------------------------------------
        # 10. Manifest
        # ------------------------------------------

        pipeline_version = config.get(
            "pipeline_version",
            "1.0.0",
        )

        schema_version = config.get(
            "schema_version",
            "1.0",
        )

        version_info = create_version_info(
            dataset=dataset_name,
            source_hash=source_hash,
            processed_hash=processed_hash,
            pipeline_version=pipeline_version,
            schema_version=schema_version,
        )

        version_id = dataset_version_id(
            source_hash,
            pipeline_version,
            schema_version,
        )

        manifest = create_manifest(
            version_info
        )

        manifest["version_id"] = version_id

        manifest_path = (
            Path(manifest_directory)
            / dataset_name
            / "manifest.json"
        )

        write_manifest(
            manifest,
            manifest_path,
        )

        # ------------------------------------------
        # 11. Quality report
        # ------------------------------------------

        validation_result = {
            "errors": validation_errors,
            "warnings": validation_warnings,
        }

        report = build_dataset_report(
            profile=profile.to_dict(),
            validation_result=validation_result,
            dataset_name=dataset_name,
            pipeline_version=pipeline_version,
            schema_version=schema_version,
        )

        report_path = (
            Path(report_directory)
            / f"{dataset_name}_quality_report.json"
        )

        write_json_report(
            report,
            report_path,
        )

        return PipelineResult(
            dataset=dataset_name,
            success=True,
            processed_path=output_path,
            report_path=report_path,
            manifest_path=manifest_path,
        )

    except Exception as exc:

        return PipelineResult(
            dataset=dataset_name,
            success=False,
            processed_path=None,
            report_path=None,
            manifest_path=None,
            error=str(exc),
        )


# -------------------------------------------
# Multi-dataset execution
# -------------------------------------------

def run_pipeline(
    datasets: list[dict],
    config: dict,
) -> list[PipelineResult]:
    """
    Execute the full pipeline for multiple
    datasets.

    Each dataset dict must contain:
        name, raw_path, output_directory,
        report_directory, manifest_directory
    """

    results = []

    for dataset in datasets:

        result = run_dataset(
            dataset_name=dataset["name"],
            raw_path=dataset["raw_path"],
            output_directory=
                dataset["output_directory"],
            report_directory=
                dataset["report_directory"],
            manifest_directory=
                dataset["manifest_directory"],
            config=config,
            contracts_directory=
                dataset.get(
                    "contracts_directory"
                ),
            dataset_config=
                dataset.get(
                    "dataset_config"
                ),
        )

        results.append(result)

    return results


# -------------------------------------------
# Pipeline summary
# -------------------------------------------

def summarize_results(
    results: list[PipelineResult],
) -> dict:
    """
    Aggregate pipeline results into a
    machine-readable summary.
    """

    passed = [
        result
        for result in results
        if result.success
    ]

    failed = [
        result
        for result in results
        if not result.success
    ]

    return {
        "total": len(results),

        "passed": len(passed),

        "failed": len(failed),

        "pipeline_status": (
            "PASS"
            if not failed
            else "FAIL"
        ),

        "datasets": [
            {
                "dataset":
                    result.dataset,

                "status":
                    "PASS"
                    if result.success
                    else "FAIL",

                "error":
                    result.error,
            }
            for result in results
        ],
    }
