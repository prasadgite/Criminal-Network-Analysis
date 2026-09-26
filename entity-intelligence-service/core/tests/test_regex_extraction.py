import sys
from pathlib import Path

D2_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(D2_ROOT))

from extraction.regex import extract_phones, extract_vehicles


def test_phone_extraction():
    text = "Contact number 9410921380 was recorded."

    result = extract_phones(text)

    assert len(result) == 1
    assert result[0]["extracted_value"] == "9410921380"


def test_vehicle_extraction():
    text = "Vehicle MH12FM4689 was involved."

    result = extract_vehicles(text)

    assert len(result) == 1
    assert result[0]["extracted_value"] == "MH12FM4689"