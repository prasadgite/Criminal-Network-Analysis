import re


PHONE_PATTERN = re.compile(r"\b\d{10}\b")

VEHICLE_PATTERN = re.compile(
    r"\b[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}\b",
    re.IGNORECASE,
)


def extract_phones(text: str):
    mentions = []

    for match in PHONE_PATTERN.finditer(text):
        mentions.append({
            "text_span": match.group(),
            "start_char": match.start(),
            "end_char": match.end(),
            "entity_type": "PHONE",
            "extracted_value": match.group(),
            "extraction_method": "regex",
        })

    return mentions


def extract_vehicles(text: str):
    mentions = []

    for match in VEHICLE_PATTERN.finditer(text):
        value = match.group().upper()

        mentions.append({
            "text_span": match.group(),
            "start_char": match.start(),
            "end_char": match.end(),
            "entity_type": "VEHICLE",
            "extracted_value": value,
            "extraction_method": "regex",
        })

    return mentions