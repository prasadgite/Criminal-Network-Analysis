import spacy

MODEL_NAME = "en_core_web_sm"


class SpacyNERExtractor:
    """
    spaCy-based Named Entity Recognition extractor.

    Supports both:
    - single-document extraction
    - batch extraction using nlp.pipe()
    """

    def __init__(self, model_name=MODEL_NAME):
        self.nlp = spacy.load(model_name)

    def extract(self, text):
        """
        Extract entities from one document.
        """
        doc = self.nlp(text)
        return self._extract_from_doc(doc)

    def extract_batch(self, texts, batch_size=64):
        """
        Extract entities from multiple documents using spaCy's
        batch pipeline.

        This is considerably more efficient than calling
        self.nlp(text) separately for every document.
        """

        results = []

        for doc in self.nlp.pipe(texts, batch_size=batch_size):

            results.append(self._extract_from_doc(doc))

        return results

    def _extract_from_doc(self, doc):

        mentions = []

        for ent in doc.ents:

            if ent.label_ not in {
                "PERSON",
                "GPE",
                "LOC",
            }:
                continue

            entity_type = self._map_entity_type(ent.label_)

            if entity_type is None:
                continue

            mentions.append(
                {
                    "text_span": ent.text,
                    "start_char": ent.start_char,
                    "end_char": ent.end_char,
                    "entity_type": entity_type,
                    "extracted_value": ent.text,
                    "extraction_method": "spacy_ner",
                }
            )

        return mentions

    @staticmethod
    def _map_entity_type(label):

        mapping = {
            "PERSON": "PERSON",
            "GPE": "LOCATION",
            "LOC": "LOCATION",
        }

        return mapping.get(label)