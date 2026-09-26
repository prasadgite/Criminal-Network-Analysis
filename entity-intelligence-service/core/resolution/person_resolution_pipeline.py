from pathlib import Path
import ast
import json
import sys
from dataclasses import asdict, is_dataclass

import pandas as pd


# ============================================================
# PATH SETUP
# ============================================================

CURRENT_FILE = Path(__file__).resolve()

# divisions/02-entity-intelligence
DIVISION_ROOT = CURRENT_FILE.parents[1]

# F:\SIH\Criminal-Network-Analysis
PROJECT_ROOT = CURRENT_FILE.parents[3]

if str(DIVISION_ROOT) not in sys.path:
    sys.path.insert(0, str(DIVISION_ROOT))


# ============================================================
# IMPORTS
# ============================================================

from extraction.mention_validator import MentionValidator
from extraction.person_registry import PersonRegistryExtractor

from candidate_generation.person_candidate_generator import (
    PersonCandidateGenerator,
)

from resolution.person_resolver import PersonResolver
from resolution.person_context import PersonContextBuilder


# ============================================================
# FILE PATHS
# ============================================================

INPUT_FILE = (
    PROJECT_ROOT
    / "divisions"
    / "02-entity-intelligence"
    / "output"
    / "entity_mentions.csv"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "divisions"
    / "02-entity-intelligence"
    / "output"
    / "person_resolutions.csv"
)

CASE_ENTITIES_FILE = (
    PROJECT_ROOT
    / "datasets"
    / "raw"
    / "case_entities.csv"
)

PHONES_FILE = (
    PROJECT_ROOT
    / "datasets"
    / "raw"
    / "phones.csv"
)

VEHICLES_FILE = (
    PROJECT_ROOT
    / "datasets"
    / "raw"
    / "vehicles.csv"
)

LOCATION_FILE = (
    PROJECT_ROOT
    / "datasets"
    / "raw"
    / "locations.csv"
)

PERSON_FILE = (
    PROJECT_ROOT
    / "datasets"
    / "raw"
    / "person.csv"
)


# ============================================================
# HELPERS
# ============================================================

def parse_candidate_ids(value):
    """
    Convert stored candidate IDs into a Python list.
    """

    if value is None:
        return []

    if isinstance(value, float) and pd.isna(value):
        return []

    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    value = str(value).strip()

    if not value:
        return []

    # Example:
    # ['P001', 'P002']
    if value.startswith("[") and value.endswith("]"):
        try:
            parsed = ast.literal_eval(value)

            if isinstance(parsed, list):
                return [
                    str(item).strip()
                    for item in parsed
                    if str(item).strip()
                ]

        except (ValueError, SyntaxError):
            pass

    # Example:
    # P001|P002
    if "|" in value:
        return [
            item.strip()
            for item in value.split("|")
            if item.strip()
        ]

    # Example:
    # P001,P002
    if "," in value:
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    return [value]


def serialize_list(values):
    """
    Serialize a list into JSON for CSV output.
    """

    if values is None:
        return "[]"

    return json.dumps(
        list(values),
        ensure_ascii=False,
    )


def serialize_json(value):
    """
    Convert dataclasses and nested objects into JSON.
    """

    if value is None:
        return "{}"

    def convert(obj):

        if is_dataclass(obj):
            return convert(asdict(obj))

        if isinstance(obj, dict):
            return {
                str(key): convert(val)
                for key, val in obj.items()
            }

        if isinstance(obj, (list, tuple)):
            return [
                convert(item)
                for item in obj
            ]

        return obj

    return json.dumps(
        convert(value),
        ensure_ascii=False,
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("PERSON ENTITY RESOLUTION PIPELINE")
    print("=" * 70)

    # ========================================================
    # CHECK FILES
    # ========================================================

    print("\nChecking required files...")

    required_files = [
        INPUT_FILE,
        CASE_ENTITIES_FILE,
        PHONES_FILE,
        VEHICLES_FILE,
        LOCATION_FILE,
        PERSON_FILE,
    ]

    for file_path in required_files:

        if not file_path.exists():
            raise FileNotFoundError(
                f"Required file not found:\n{file_path}"
            )

        print(f"[OK] {file_path}")

    # ========================================================
    # LOAD DATA
    # ========================================================

    print("\nLoading data...")

    mentions_df = pd.read_csv(
        INPUT_FILE
    )

    case_entities_df = pd.read_csv(
        CASE_ENTITIES_FILE
    )

    phones_df = pd.read_csv(
        PHONES_FILE
    )

    vehicles_df = pd.read_csv(
        VEHICLES_FILE
    )

    people_df = pd.read_csv(
        PERSON_FILE
    )

    print(
        f"Entity mentions: {len(mentions_df):,}"
    )

    print(
        f"Case entities: {len(case_entities_df):,}"
    )

    print(
        f"People: {len(people_df):,}"
    )

    print(
        f"Phones: {len(phones_df):,}"
    )

    print(
        f"Vehicles: {len(vehicles_df):,}"
    )

    # ========================================================
    # PERSON REGISTRY
    # ========================================================

    print("\nBuilding person registry...")

    person_registry = PersonRegistryExtractor(
        PERSON_FILE
    )

    print(
        f"Registry records: "
        f"{len(person_registry.people):,}"
    )

    print(
        f"Registry names: "
        f"{len(person_registry.name_index):,}"
    )

    # ========================================================
    # COMPONENTS
    # ========================================================

    resolver = PersonResolver()

    candidate_generator = (
        PersonCandidateGenerator()
    )

    mention_validator = MentionValidator(
        LOCATION_FILE
    )

    context_builder = PersonContextBuilder(
        phones=phones_df,
        vehicles=vehicles_df,
    )

    # ========================================================
    # PERSON MENTIONS
    # ========================================================

    person_mentions = mentions_df[
        mentions_df["entity_type"] == "PERSON"
    ].copy()

    print(
        f"\nPERSON mentions found: "
        f"{len(person_mentions):,}"
    )

    # ========================================================
    # COUNTERS
    # ========================================================

    results = []

    skipped_location = 0
    skipped_officer = 0

    status_counts = {
        "RESOLVED": 0,
        "AMBIGUOUS": 0,
        "UNRESOLVED": 0,
    }

    method_counts = {}

    evidence_count = 0

    total = len(person_mentions)

    print("\nProcessing PERSON mentions...")
    print("-" * 70)

    # ========================================================
    # PROCESS EACH PERSON MENTION
    # ========================================================

    for counter, row in enumerate(
        person_mentions.itertuples(index=False),
        start=1,
    ):

        if (
            counter == 1
            or counter % 1000 == 0
            or counter == total
        ):
            print(
                f"Processed "
                f"{counter:,}/{total:,}"
            )

        # ----------------------------------------------------
        # MENTION
        # ----------------------------------------------------

        mention = {
            "text_span": row.text_span,
            "entity_type": row.entity_type,
        }

        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        validated_mention = (
            mention_validator.validate(
                mention
            )
        )

        validation_status = (
            validated_mention[
                "validation_status"
            ]
        )

        if validation_status == "CORRECTED":

            skipped_location += 1
            continue

        if validation_status == "REJECTED":

            skipped_officer += 1
            continue

        # ----------------------------------------------------
        # BASIC VALUES
        # ----------------------------------------------------

        mention_text = str(
            row.text_span
        ).strip()

        document_id = str(
            row.document_id
        )

        case_id = str(
            row.case_id
        )

        # ----------------------------------------------------
        # CANDIDATE GENERATION
        # ----------------------------------------------------

        candidate_result = (
            candidate_generator.generate(
                mention_text=mention_text,
                name_index=person_registry.name_index,
                people=person_registry.people,
            )
        )

        candidate_ids = candidate_result[
            "candidate_person_ids"
        ]

        candidate_generation_method = (
            candidate_result[
                "candidate_generation_method"
            ]
        )

        candidate_count = (
            candidate_result[
                "candidate_count"
            ]
        )

        # ----------------------------------------------------
        # FALLBACK TO EXISTING CANDIDATES
        # ----------------------------------------------------

        if not candidate_ids:

            existing_candidates = (
                parse_candidate_ids(
                    getattr(
                        row,
                        "candidate_person_ids",
                        None,
                    )
                )
            )

            if existing_candidates:

                candidate_ids = (
                    existing_candidates
                )

                candidate_generation_method = (
                    "EXISTING_MENTION_CANDIDATES"
                )

                candidate_count = len(
                    candidate_ids
                )

        # ----------------------------------------------------
        # CONTEXT EVIDENCE
        # ----------------------------------------------------

        context_evidence = (
            context_builder.build(
                candidate_person_ids=candidate_ids,
                case_id=case_id,
                document_id=document_id,
                case_entities=case_entities_df,
            )
        )

        # ----------------------------------------------------
        # CHECK CONTEXT EVIDENCE
        # ----------------------------------------------------

        has_context_evidence = any(
            candidate_evidence.evidence
            for candidate_evidence
            in context_evidence.values()
        )

        if has_context_evidence:

            evidence_count += 1

        # ----------------------------------------------------
        # RESOLUTION
        # ----------------------------------------------------

        resolution = resolver.resolve(
            candidate_person_ids=candidate_ids,
            evidence=context_evidence,
        )

        # ----------------------------------------------------
        # STATUS
        # ----------------------------------------------------

        resolution_status = (
            resolution[
                "resolution_status"
            ]
        )

        status_counts[
            resolution_status
        ] = (
            status_counts.get(
                resolution_status,
                0,
            )
            + 1
        )

        # ----------------------------------------------------
        # METHOD
        # ----------------------------------------------------

        resolution_method = (
            resolution[
                "resolution_method"
            ]
        )

        method_counts[
            resolution_method
        ] = (
            method_counts.get(
                resolution_method,
                0,
            )
            + 1
        )

        # ----------------------------------------------------
        # OUTPUT RECORD
        # ----------------------------------------------------

        result = {

            "mention_id": getattr(
                row,
                "mention_id",
                None,
            ),

            "document_id": document_id,

            "case_id": case_id,

            "text_span": mention_text,

            "start_char": getattr(
                row,
                "start_char",
                None,
            ),

            "end_char": getattr(
                row,
                "end_char",
                None,
            ),

            "entity_type": "PERSON",

            "candidate_person_ids": (
                serialize_list(
                    candidate_ids
                )
            ),

            "candidate_count": (
                candidate_count
            ),

            "candidate_generation_method": (
                candidate_generation_method
            ),

            "resolved_entity_id": (
                resolution[
                    "resolved_entity_id"
                ]
            ),

            "resolution_status": (
                resolution[
                    "resolution_status"
                ]
            ),

            "resolution_method": (
                resolution[
                    "resolution_method"
                ]
            ),

            "resolution_confidence": (
                resolution[
                    "resolution_confidence"
                ]
            ),

            "evidence": serialize_json(
                resolution.get(
                    "evidence",
                    {},
                )
            ),
        }

        results.append(result)

    # ========================================================
    # OUTPUT DATAFRAME
    # ========================================================

    output_df = pd.DataFrame(
        results
    )

    # ========================================================
    # SAVE
    # ========================================================

    OUTPUT_FILE.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    output_df.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    # ========================================================
    # FINAL REPORT
    # ========================================================

    print("\n")
    print("=" * 70)
    print("PERSON RESOLUTION COMPLETE")
    print("=" * 70)

    print(
        f"\nInput PERSON mentions: "
        f"{len(person_mentions):,}"
    )

    print(
        f"Output resolution rows: "
        f"{len(output_df):,}"
    )

    print(
        f"Skipped location false positives: "
        f"{skipped_location:,}"
    )

    print(
        f"Skipped officer identifiers: "
        f"{skipped_officer:,}"
    )

    print("\nResolution status:")

    for status, count in status_counts.items():

        print(
            f"  {status:<12} "
            f"{count:,}"
        )

    print("\nResolution methods:")

    for method, count in sorted(
        method_counts.items(),
        key=lambda item: item[1],
        reverse=True,
    ):

        print(
            f"  {method:<30} "
            f"{count:,}"
        )

    print(
        f"\nEvidence-bearing mentions: "
        f"{evidence_count:,}"
    )

    print(
        f"\nResolved entities: "
        f"{status_counts['RESOLVED']:,}"
    )

    print(
        f"Ambiguous mentions: "
        f"{status_counts['AMBIGUOUS']:,}"
    )

    print(
        f"Unresolved mentions: "
        f"{status_counts['UNRESOLVED']:,}"
    )

    print(
        f"\nOutput file:\n{OUTPUT_FILE}"
    )

    print(
        "\nPipeline finished successfully."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()