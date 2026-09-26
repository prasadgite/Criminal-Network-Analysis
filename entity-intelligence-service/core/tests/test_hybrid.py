import sys
from pathlib import Path

D2_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = D2_ROOT.parents[1]

sys.path.insert(0, str(D2_ROOT))

from extraction.hybrid import HybridEntityExtractor


import pandas as pd

PERSON_FILE = PROJECT_ROOT / "datasets" / "raw" / "person.csv"
SAMPLE_PERSONS = pd.DataFrame([
    {"person_id": "P001807", "full_name": "Akash V Kale", "aliases": "Akash Kale", "date_of_birth": "1988-04-12", "gender": "Male", "nationality": "Indian"},
    {"person_id": "P002378", "full_name": "Akash V Kale", "aliases": None, "date_of_birth": "1992-09-01", "gender": "Male", "nationality": "Indian"},
    {"person_id": "P003412", "full_name": "Komal R Naik", "aliases": "Komal Naik", "date_of_birth": "1990-01-15", "gender": "Female", "nationality": "Indian"},
])
PERSON_SOURCE = PERSON_FILE if PERSON_FILE.exists() else SAMPLE_PERSONS


def test_hybrid_extracts_phone_and_vehicle():

    extractor = HybridEntityExtractor(PERSON_SOURCE)

    text = (
        "Akash V Kale was reported in Pune. "
        "Vehicle MH12FM4689 was involved. "
        "Contact number 9410921380."
    )

    result = extractor.extract(text)

    entity_types = {
        item["entity_type"]
        for item in result
    }

    assert "PHONE" in entity_types
    assert "VEHICLE" in entity_types


def test_hybrid_prefers_complete_person_name():

    extractor = HybridEntityExtractor(PERSON_SOURCE)

    text = (
        "Akash V Kale was reported in connection "
        "with a robbery incident in Pune."
    )

    result = extractor.extract(text)

    persons = [
        item
        for item in result
        if item["entity_type"] == "PERSON"
    ]

    names = [
        item["extracted_value"]
        for item in persons
    ]

    assert "Akash V Kale" in names
    assert "V Kale" not in names

def test_registry_person_wins_over_spacy_person():
    """
    When the registry and spaCy identify the same person span,
    the registry result should win because it contains
    candidate person IDs.
    """

    text = "Komal R Naik was questioned."

    extractor = HybridEntityExtractor(
        PERSON_SOURCE
    )

    mentions = extractor.extract(text)

    person_mentions = [
        m
        for m in mentions
        if (
            m["entity_type"] == "PERSON"
            and m["text_span"] == "Komal R Naik"
        )
    ]

    assert len(person_mentions) == 1

    mention = person_mentions[0]

    assert mention["extraction_method"] == "person_registry"

    assert mention["candidate_count"] >= 1

    assert len(
        mention["candidate_person_ids"]
    ) >= 1
