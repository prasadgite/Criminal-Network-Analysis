from extraction.regex import extract_phones, extract_vehicles
from extraction.spacy_ner import SpacyNERExtractor
from extraction.person_registry import PersonRegistryExtractor


class HybridEntityExtractor:
    """
    Combines deterministic regex extraction, spaCy NER,
    and person-registry extraction.
    """

    def __init__(self, person_file):
        self.spacy_extractor = SpacyNERExtractor()
        self.person_registry = PersonRegistryExtractor(person_file)

    def extract(self, text):
        mentions = []

        # 1. Deterministic extraction
        mentions.extend(extract_phones(text))
        mentions.extend(extract_vehicles(text))

        # 2. Generic NER
        mentions.extend(self.spacy_extractor.extract(text))

        # 3. Registry-based PERSON extraction
        mentions.extend(self.person_registry.extract(text))

        # 4. Resolve overlapping mentions
        mentions = self._deduplicate_mentions(mentions)

        return mentions

    @staticmethod
    def _deduplicate_mentions(mentions):
        """
        Remove duplicate/overlapping mentions.

        Priority rules:

        1. Deterministic PHONE/VEHICLE extraction wins.
        2. Person-registry PERSON extraction wins over spaCy PERSON
           when they refer to the same span.
        3. Longer spans win over shorter overlapping spans.
        4. More authoritative extraction methods are preferred.
        """

        if not mentions:
            return []

        method_priority = {
            "regex": 100,
            "person_registry": 95,
            "spacy_ner": 50,
        }

        entity_priority = {
            "PHONE": 100,
            "VEHICLE": 100,
            "PERSON": 90,
            "LOCATION": 80,
            "ORGANIZATION": 10,
        }

        def sort_key(item):

            length = (
                item["end_char"]
                - item["start_char"]
            )

            return (
                -method_priority.get(
                    item["extraction_method"],
                    0,
                ),
                -entity_priority.get(
                    item["entity_type"],
                    0,
                ),
                -length,
                item["start_char"],
            )

        sorted_mentions = sorted(
            mentions,
            key=sort_key,
        )

        selected = []

        for mention in sorted_mentions:

            overlaps = False

            for existing in selected:

                same_span = (
                    mention["start_char"]
                    == existing["start_char"]
                    and mention["end_char"]
                    == existing["end_char"]
                )

                overlapping = (
                    mention["start_char"]
                    < existing["end_char"]
                    and mention["end_char"]
                    > existing["start_char"]
                )

                if same_span or overlapping:

                    # A registry PERSON should replace a
                    # spaCy PERSON for the same span.
                    if (
                        mention["entity_type"] == "PERSON"
                        and existing["entity_type"] == "PERSON"
                        and mention["extraction_method"]
                        == "person_registry"
                        and existing["extraction_method"]
                        == "spacy_ner"
                    ):
                        selected.remove(existing)
                        break

                    overlaps = True
                    break

            if not overlaps:
                selected.append(mention)

        selected.sort(
            key=lambda item: item["start_char"]
        )

        return selected