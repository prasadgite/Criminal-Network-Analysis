import re
import pandas as pd


class MentionValidator:
    """
    Validates extracted entity mentions against known
    project registries and deterministic patterns.

    Current validation:
    1. Detect known location names from locations.csv.
    2. Correct false PERSON -> LOCATION mentions.
    3. Detect officer identifiers such as IO0074.
    4. Reject officer identifiers from PERSON resolution.

    This class does not perform entity resolution.
    """

    # --------------------------------------------------------
    # Deterministic patterns
    # --------------------------------------------------------

    OFFICER_ID_PATTERN = re.compile(
        r"^IO\d+$",
        re.IGNORECASE,
    )

    def __init__(self, location_source):
        self.location_file = location_source if isinstance(location_source, str) else None
        self.location_df = location_source if isinstance(location_source, pd.DataFrame) else None
        self.location_names = self._load_location_names()

    # --------------------------------------------------------
    # LOCATION REGISTRY
    # --------------------------------------------------------

    def _load_location_names(self):
        """
        Load known location vocabulary from locations.csv or DataFrame.

        Current project fields:
        - area
        - city
        - district

        All values are normalized to lowercase.
        """

        locations = self.location_df if self.location_df is not None else pd.read_csv(
            self.location_file
        )

        names = set()

        for column in [
            "area",
            "city",
            "district",
        ]:

            if column not in locations.columns:
                continue

            values = (
                locations[column]
                .dropna()
                .astype(str)
                .str.strip()
                .str.lower()
            )

            names.update(
                value
                for value in values
                if value
            )

        return names

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    def validate(self, mention):
        """
        Validate one extracted mention.

        Returns the original mention plus
        validation metadata.
        """

        text = str(
            mention.get(
                "text_span",
                "",
            )
        ).strip()

        normalized = text.lower()

        result = dict(mention)

        # Default state
        result["validation_status"] = "VALID"
        result["validation_reason"] = None

        # ====================================================
        # 1. KNOWN LOCATION
        # ====================================================

        if (
            mention.get("entity_type") == "PERSON"
            and normalized in self.location_names
        ):

            result["validation_status"] = (
                "CORRECTED"
            )

            result["validation_reason"] = (
                "KNOWN_LOCATION"
            )

            result["corrected_entity_type"] = (
                "LOCATION"
            )

            return result

        # ====================================================
        # 2. OFFICER IDENTIFIER
        # ====================================================

        if (
            mention.get("entity_type") == "PERSON"
            and self.OFFICER_ID_PATTERN.fullmatch(
                text
            )
        ):

            result["validation_status"] = (
                "REJECTED"
            )

            result["validation_reason"] = (
                "OFFICER_IDENTIFIER"
            )

            return result

        # ====================================================
        # 3. VALID PERSON
        # ====================================================

        return result