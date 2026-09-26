import re
import pandas as pd


TOKEN_PATTERN = re.compile(r"[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)?")


class PersonRegistryExtractor:
    """
    Finds person names and aliases directly in text.

    Uses a token-based trie instead of scanning every registry
    name with a regex for every document.

    Important:
    A name match produces candidate person IDs.
    It does NOT automatically resolve the mention to one person.
    """

    def __init__(self, person_source):
        if isinstance(person_source, pd.DataFrame):
            self.person_file = None
            self.people = person_source
        else:
            self.person_file = person_source
            self.people = pd.read_csv(person_source)

        # Keep the normalized-name -> person IDs mapping.
        self.name_index = self._build_name_index()

        # Build a token trie for fast text matching.
        self.trie = self._build_trie()

    @staticmethod
    def normalize_name(name):
        name = str(name).lower().strip()

        # Treat punctuation as a separator.
        # This makes "S. Naik" normalize to "s naik"
        # instead of "s. naik".
        name = re.sub(r"[^a-z0-9\s]", " ", name)

        name = re.sub(r"\s+", " ", name).strip()

        return name


    @staticmethod
    def normalize_token(token):
        token = token.lower().strip()

    # Token normalization must use the same
    # punctuation rules as normalize_name().
        token = re.sub(r"[^a-z0-9]", "", token)

        return token

    def _build_name_index(self):
        """
        Build:

            normalized name -> set(person IDs)

        Example:

            "akash v kale" ->
                {"P001807", "P002378"}

        Duplicate names therefore remain ambiguous.
        """

        index = {}

        for _, row in self.people.iterrows():

            person_id = row["person_id"]

            # Full name
            full_name = row.get("full_name")

            if bool(pd.notna(full_name)):
                normalized = self.normalize_name(full_name)

                if normalized:
                    index.setdefault(normalized, set()).add(person_id)

            # Alias
            alias = row.get("alias_name")

            if bool(pd.notna(alias)):
                normalized = self.normalize_name(alias)

                if normalized:
                    index.setdefault(normalized, set()).add(person_id)

        return index

    def _build_trie(self):
        """
        Build a token trie from all names and aliases.

        Example:

            "akash v kale"

        becomes:

            akash
              └── v
                    └── kale
                          └── person_ids

        This allows us to search the text by tokens rather than
        testing thousands of regex patterns.
        """

        trie = {
            "children": {},
            "person_ids": set(),
        }

        for normalized_name, person_ids in self.name_index.items():

            tokens = normalized_name.split()

            if not tokens:
                continue

            node = trie

            for token in tokens:

                if token not in node["children"]:
                    node["children"][token] = {
                        "children": {},
                        "person_ids": set(),
                    }

                node = node["children"][token]

            node["person_ids"].update(person_ids)

        return trie

    @staticmethod
    def _tokenize_with_offsets(text):
        """
        Tokenize original text while preserving original character offsets.

        Example:

            "Akash V Kale was here"

        produces tokens containing:

            token
            start
            end
        """

        tokens = []

        for match in TOKEN_PATTERN.finditer(text):

            token = match.group()

            normalized_token = PersonRegistryExtractor.normalize_token(token)

            if not normalized_token:
                continue

            tokens.append(
                {
                    "token": normalized_token,
                    "start": match.start(),
                    "end": match.end(),
                }
            )

        return tokens

    def extract(self, text):
        """
        Extract person-name mentions from text.

        Returns candidate person IDs rather than choosing a
        single person when multiple people share the name.
        """

        mentions = []

        tokens = self._tokenize_with_offsets(text)

        for start_index in range(len(tokens)):

            node = self.trie

            end_index = start_index

            while end_index < len(tokens):

                token = tokens[end_index]["token"]

                children = node["children"]

                if token not in children:
                    break

                node = children[token]

                # We reached the end of a registered name/alias.
                if node["person_ids"]:

                    candidate_person_ids = sorted(node["person_ids"])

                    start_char = tokens[start_index]["start"]
                    end_char = tokens[end_index]["end"]

                    mentions.append(
                        {
                            "text_span": text[start_char:end_char],
                            "start_char": start_char,
                            "end_char": end_char,
                            "entity_type": "PERSON",
                            "extracted_value": text[start_char:end_char],
                            "extraction_method": "person_registry",
                            "candidate_person_ids": candidate_person_ids,
                            "candidate_count": len(candidate_person_ids),
                        }
                    )

                end_index += 1

        return mentions