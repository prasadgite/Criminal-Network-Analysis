import pandas as pd
import pytest

from normalization.ids import normalize_id, normalize_id_series
from normalization.text import (
    normalize_text,
    normalize_for_matching,
    normalize_text_series,
)
from normalization.phones import (
    normalize_indian_phone,
    normalize_indian_phone_series,
)
from normalization.dates import (
    normalize_datetime,
    normalize_datetime_series,
)
from normalization.locations import (
    normalize_geographic_text,
    normalize_state,
)
from normalization.categorical import (
    normalize_category,
)
from normalization.pipeline import (
    normalize_identifier_column,
    normalize_text_column,
    normalize_phone_column,
    normalize_datetime_column,
)


def test_id_preserves_leading_zero():
    assert normalize_id(" 001234 ") == "001234"


def test_id_handles_none_and_non_str():
    assert normalize_id(None) is None
    assert normalize_id(float("nan")) is None
    assert normalize_id("P000001") == "P000001"


def test_text_trim():
    assert normalize_text("  Rahul Sharma  ") == "Rahul Sharma"
    assert normalize_text(None) is None


def test_matching_text():
    assert normalize_for_matching("  RAHUL   SHARMA ") == "rahul sharma"
    assert normalize_for_matching(None) is None


def test_phone_local():
    assert normalize_indian_phone("9876543210") == "919876543210"


def test_phone_international():
    assert normalize_indian_phone("+91 9876543210") == "919876543210"


def test_phone_zero_prefix():
    assert normalize_indian_phone("09876543210") == "919876543210"


def test_invalid_phone_not_invented():
    assert normalize_indian_phone("12345") == "12345"
    assert normalize_indian_phone(None) is None


def test_datetime_timezone():
    result = normalize_datetime("2026-01-01 10:00:00")
    assert str(result.tz) == "Asia/Kolkata"


def test_datetime_nat_on_invalid():
    result = normalize_datetime("not-a-date")
    assert pd.isna(result)


def test_state_normalization():
    geo_config = {
        "states": {
            "maharashtra": {"canonical": "Maharashtra"},
            "karnataka": {"canonical": "Karnataka"},
        }
    }
    assert normalize_state(" MAHARASHTRA ", geo_config) == "Maharashtra"
    assert normalize_state("Goa", geo_config) == "Goa"


def test_category_normalization():
    assert normalize_category("  EXTORTION   CALL ") == "EXTORTION CALL"
    assert normalize_category(None) is None


def test_original_value_preserved():
    dataframe = pd.DataFrame(
        {
            "phone": ["+91 9876543210"],
            "person_id": [" 00123 "],
            "name": ["  RAHUL SHARMA  "],
            "created_at": ["2026-01-01 10:00:00"],
        }
    )

    result = normalize_phone_column(dataframe, "phone", "normalized_phone")
    result = normalize_identifier_column(result, "person_id", "normalized_person_id")
    result = normalize_text_column(result, "name", "normalized_name")
    result = normalize_datetime_column(result, "created_at", "normalized_created_at")

    # Source column checks
    assert dataframe.loc[0, "phone"] == "+91 9876543210"
    assert result.loc[0, "phone"] == "+91 9876543210"
    assert result.loc[0, "person_id"] == " 00123 "

    # Normalized column checks
    assert result.loc[0, "normalized_phone"] == "919876543210"
    assert result.loc[0, "normalized_person_id"] == "00123"
    assert result.loc[0, "normalized_name"] == "RAHUL SHARMA"
    assert str(result.loc[0, "normalized_created_at"].tz) == "Asia/Kolkata"
