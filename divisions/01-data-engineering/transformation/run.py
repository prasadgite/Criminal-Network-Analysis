from pathlib import Path

from ingestion.loader import (
    load_config,
    load_dataset,
)

from .cases import transform_cases
from .communications import (
    transform_cdr_records,
    transform_phones,
)
from .locations import transform_locations
from .persons import transform_persons
from .transactions import (
    transform_bank_accounts,
    transform_transactions,
)
from .writer import write_processed_csv


PROJECT_ROOT = Path(__file__).resolve().parents[3]

CONFIG_PATH = (
    PROJECT_ROOT
    / "divisions"
    / "01-data-engineering"
    / "config"
    / "datasets.yaml"
)


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


def run():
    """
    Run all registered transformations.

    This is a standalone demonstration runner.
    The final production orchestrator will be
    created after profiling/reporting are
    implemented, incorporating the full pipeline:

        ingest → schema → quality → integrity
        → normalize → transform → profile
    """

    config = load_config(
        CONFIG_PATH
    )

    processed_root = (
        PROJECT_ROOT
        / "datasets"
        / "processed"
    )

    for dataset_name, transformer in (
        TRANSFORMERS.items()
    ):

        print(
            f"Processing {dataset_name}..."
        )

        try:

            dataframe, _ = load_dataset(
                config,
                dataset_name,
                PROJECT_ROOT,
            )

        except Exception as error:

            print(
                f"  SKIP: {error}"
            )
            continue

        transformed = transformer(
            dataframe
        )

        output_directory = (
            processed_root
            / dataset_name
        )

        output_path = write_processed_csv(
            transformed,
            output_directory,
            f"{dataset_name}.csv",
        )

        print(
            f"  -> {output_path}"
        )


if __name__ == "__main__":
    run()
