from pathlib import Path

from ingestion.loader import (
    load_config,
    load_dataset,
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

    print("\nDivision 1 — Raw Data Ingestion\n")
    print("=" * 50)

    for dataset_name in config["datasets"]:

        try:

            dataframe, metadata = load_dataset(
                config,
                dataset_name,
                PROJECT_ROOT,
            )

            print(
                f"[PASS] "
                f"{dataset_name:<20} "
                f"rows={metadata.row_count:<8} "
                f"columns={metadata.column_count}"
            )

        except FileNotFoundError:

            print(
                f"[MISSING] {dataset_name}"
            )

        except Exception as exc:

            print(
                f"[FAIL] "
                f"{dataset_name}: {exc}"
            )

    print("=" * 50)


if __name__ == "__main__":
    main()
