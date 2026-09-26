from pathlib import Path
import pandas as pd
from extraction.mention_validator import MentionValidator

LOC_FILE = Path("datasets/raw/locations.csv")
SAMPLE_LOCATIONS = pd.DataFrame([
    {"location_id": "L001", "location_name": "Baner", "area": "Baner", "city": "Pune", "district": "Pune"},
    {"location_id": "L002", "location_name": "Kothrud", "area": "Kothrud", "city": "Pune", "district": "Pune"},
])
LOC_SOURCE = str(LOC_FILE) if LOC_FILE.exists() else SAMPLE_LOCATIONS


def test_known_location_is_corrected():

    validator = MentionValidator(LOC_SOURCE)

    mention = {
        "text_span": "Baner",
        "entity_type": "PERSON",
    }

    result = validator.validate(mention)

    assert result["validation_status"] == "CORRECTED"
    assert result["validation_reason"] == "KNOWN_LOCATION"
    assert result["corrected_entity_type"] == "LOCATION"


def test_real_person_is_valid():

    validator = MentionValidator(LOC_SOURCE)

    mention = {
        "text_span": "Akash V Kale",
        "entity_type": "PERSON",
    }

    result = validator.validate(mention)

    assert result["validation_status"] == "VALID"
    assert "corrected_entity_type" not in result