import re
import pandas as pd


class LocationRegistryExtractor:
    """
    Extracts known locations from the location registry.

    A location match produces candidate location IDs.
    It does not automatically resolve ambiguous locations.
    """

    def __init__(self, location_file):
        self.location_file = location_file
        self.locations = pd.read_csv(location_file)

        self.name_index = self._build_name_index()

    @staticmethod
    def normalize_name(name):
        name = str(name).lower().strip()
        name = re.sub(r"[^a-z0-9\s]", " ", name)
        name = re.sub(r"\s+", " ", name)
        return name

    def _build_name_index(self):

        index = {}

        for _, row in self.locations.iterrows():

            location_id = row["location_id"]

            location_name = row.get("location_name")

            if pd.notna(location_name):

                normalized = self.normalize_name(
                    location_name
                )

                if normalized:

                    index.setdefault(
                        normalized,
                        set()
                    ).add(location_id)

        return index

    def extract(self, text):

        mentions = []

        normalized_text = self.normalize_name(text)

        for normalized_name, location_ids in self.name_index.items():

            pattern = (
                r"(?<![a-z0-9])"
                + re.escape(normalized_name)
                + r"(?![a-z0-9])"
            )

            for match in re.finditer(
                pattern,
                normalized_text
            ):

                start = match.start()
                end = match.end()

                mentions.append(
                    {
                        "text_span": text[start:end],
                        "start_char": start,
                        "end_char": end,
                        "entity_type": "LOCATION",
                        "extracted_value": text[start:end],
                        "extraction_method": "location_registry",
                        "candidate_location_ids": sorted(
                            location_ids
                        ),
                        "candidate_count": len(
                            location_ids
                        ),
                    }
                )

        return mentions