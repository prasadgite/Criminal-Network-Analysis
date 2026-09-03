"""
D1.5 — Referential Integrity Smoke Test

Loads all datasets and validates every configured
foreign-key and polymorphic relationship.
"""

from pathlib import Path

from ingestion.loader import (
    load_config,
    load_dataset,
)

from validation.integrity_validator import (
    validate_integrity,
)


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CONFIG_PATH = (
    PROJECT_ROOT
    / "divisions"
    / "01-data-engineering"
    / "config"
    / "datasets.yaml"
)


def main():

    config = load_config(CONFIG_PATH)

    print("\nDivision 1 — Referential Integrity Check\n")
    print("=" * 60)

    # Load all available datasets
    dataframes = {}

    for dataset_name in config["datasets"]:
        try:
            df, metadata = load_dataset(
                config,
                dataset_name,
                PROJECT_ROOT,
            )
            dataframes[dataset_name] = df
            print(
                f"  [LOADED] {dataset_name:<20} "
                f"rows={metadata.row_count}"
            )
        except FileNotFoundError:
            print(f"  [MISSING] {dataset_name}")

    print("\n" + "-" * 60)
    print("Validating relationships...\n")

    result = validate_integrity(config, dataframes)

    if result.passed:
        print("  [PASS] ALL RELATIONSHIPS VALID\n")
    else:
        print(f"  [FAIL] VALIDATION FAILED\n")

    if result.errors:
        print(f"  ERRORS ({len(result.errors)}):\n")
        for issue in result.errors:
            print(
                f"    [{issue.issue_type}] "
                f"{issue.dataset}.{issue.child_field} → "
                f"{issue.parent_dataset}.{issue.parent_field}"
            )
            print(f"      {issue.message}")
            print()

    if result.warnings:
        print(f"  WARNINGS ({len(result.warnings)}):\n")
        for issue in result.warnings:
            print(
                f"    [{issue.issue_type}] "
                f"{issue.message}"
            )
            print()

    print("=" * 60)


if __name__ == "__main__":
    main()
