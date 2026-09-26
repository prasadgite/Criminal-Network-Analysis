import sys
from pathlib import Path

import pandas as pd


D2_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = D2_ROOT.parents[1]

sys.path.insert(0, str(D2_ROOT))

from extraction.hybrid import HybridEntityExtractor


INPUT_FILE = PROJECT_ROOT / "datasets" / "raw" / "fir_narratives.csv"
PERSON_FILE = PROJECT_ROOT / "datasets" / "raw" / "person.csv"
OUTPUT_FILE = D2_ROOT / "output" / "entity_mentions.csv"

BATCH_SIZE = 64


def run_pipeline():

    print(f"Reading FIR data: {INPUT_FILE}")

    df = pd.read_csv(INPUT_FILE)

    required_columns = {
        "document_id",
        "case_id",
        "narrative_text",
    }

    missing = required_columns - set(df.columns)

    if missing:
        raise ValueError(
            f"Missing required columns: {sorted(missing)}"
        )

    print(f"Documents loaded: {len(df):,}")

    extractor = HybridEntityExtractor(PERSON_FILE)

    all_mentions = []

    mention_counter = 0

    total_documents = len(df)

    for batch_start in range(
        0,
        total_documents,
        BATCH_SIZE,
    ):

        batch = df.iloc[
            batch_start : batch_start + BATCH_SIZE
        ]

        texts = [
            str(text)
            for text in batch["narrative_text"]
        ]

        # -------------------------------------------------
        # spaCy batch extraction
        # -------------------------------------------------

        spacy_results = extractor.spacy_extractor.extract_batch(
            texts,
            batch_size=BATCH_SIZE,
        )

        # -------------------------------------------------
        # Process each document in the batch
        # -------------------------------------------------

        for batch_position, (_, row) in enumerate(
            batch.iterrows()
        ):

            text = texts[batch_position]

            mentions = []

            # 1. Phone extraction
            from extraction.regex import extract_phones

            mentions.extend(
                extract_phones(text)
            )

            # 2. Vehicle extraction
            from extraction.regex import extract_vehicles

            mentions.extend(
                extract_vehicles(text)
            )

            # 3. spaCy extraction
            mentions.extend(
                spacy_results[batch_position]
            )

            # 4. Person registry extraction
            mentions.extend(
                extractor.person_registry.extract(text)
            )

            # 5. Deduplicate
            mentions = extractor._deduplicate_mentions(
                mentions
            )

            # -------------------------------------------------
            # Build output records
            # -------------------------------------------------

            for mention in mentions:

                mention_counter += 1

                output = {
                    "mention_id": (
                        f"EM{mention_counter:08d}"
                    ),
                    "document_id": row["document_id"],
                    "case_id": row["case_id"],
                    "text_span": mention["text_span"],
                    "start_char": mention["start_char"],
                    "end_char": mention["end_char"],
                    "entity_type": mention["entity_type"],
                    "extracted_value": mention["extracted_value"],
                    "extraction_method": mention[
                        "extraction_method"
                    ],
                    "candidate_person_ids": None,
                    "candidate_count": 0,
                }

                if "candidate_person_ids" in mention:

                    output[
                        "candidate_person_ids"
                    ] = "|".join(
                        mention["candidate_person_ids"]
                    )

                    output["candidate_count"] = (
                        mention["candidate_count"]
                    )

                all_mentions.append(output)

        processed = min(
            batch_start + BATCH_SIZE,
            total_documents,
        )

        print(
            f"Processed "
            f"{processed:,}/{total_documents:,} documents"
        )

    # -----------------------------------------------------
    # Save output
    # -----------------------------------------------------

    result = pd.DataFrame(all_mentions)

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    result.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print("\nPipeline completed.")

    print(
        f"Documents processed: "
        f"{total_documents:,}"
    )

    print(
        f"Entity mentions: "
        f"{len(result):,}"
    )

    print("\nEntity counts:")

    print(
        result["entity_type"]
        .value_counts()
        .to_string()
    )

    print("\nExtraction method counts:")

    print(
        result["extraction_method"]
        .value_counts()
        .to_string()
    )

    print("\nOutput written to:")

    print(OUTPUT_FILE)


if __name__ == "__main__":
    run_pipeline()