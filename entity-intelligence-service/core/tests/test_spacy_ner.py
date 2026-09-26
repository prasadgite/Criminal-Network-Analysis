import sys
from pathlib import Path

D2_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(D2_ROOT))

from extraction.spacy_ner import SpacyNERExtractor


def test_person_extraction():
    extractor = SpacyNERExtractor()

    text = (
        "Akash V Kale was reported in connection with "
        "a robbery incident in Pune."
    )

    result = extractor.extract(text)

    persons = [
        item for item in result
        if item["entity_type"] == "PERSON"
    ]

    assert len(persons) >= 1

    names = [item["extracted_value"] for item in persons]

    assert "V Kale" in names