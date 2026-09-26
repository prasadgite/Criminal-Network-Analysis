import re


class PersonCandidateGenerator:
    """
    Generates candidate person IDs from a PERSON mention.

    Candidate generation is intentionally broader than resolution.

    It answers:
        "Which registry people could this mention refer to?"

    It does NOT answer:
        "Which person is the correct one?"
    """

    @staticmethod
    def normalize_name(name: str) -> str:
        name = str(name).lower().strip()
        name = re.sub(r"[^a-z0-9\s]", " ", name)
        name = re.sub(r"\s+", " ", name).strip()
        return name

    @staticmethod
    def name_tokens(name: str) -> list[str]:
        normalized = PersonCandidateGenerator.normalize_name(name)

        if not normalized:
            return []

        return normalized.split()

    @staticmethod
    def is_initial(token: str) -> bool:
        return len(token) == 1 and token.isalpha()

    def generate(
        self,
        mention_text: str,
        name_index: dict[str, set[str]],
        people,
    ) -> dict:
        """
        Generate candidates using:

        1. Exact normalized full-name/alias match.
        2. Initial + surname matching.

        Returns candidate IDs without resolving identity.
        """

        normalized = self.normalize_name(mention_text)

        # ---------------------------------------------------------
        # Strategy 1: exact normalized registry match
        # ---------------------------------------------------------

        exact_candidates = sorted(
            name_index.get(normalized, set())
        )

        if exact_candidates:
            return {
                "candidate_person_ids": exact_candidates,
                "candidate_generation_method": "EXACT_NAME",
                "candidate_count": len(exact_candidates),
            }

        # ---------------------------------------------------------
        # Strategy 2: abbreviated name
        #
        # Example:
        #   "S. Naik"
        #
        # becomes:
        #   initial = S
        #   surname = Naik
        #
        # and can match:
        #   Sahil Naik
        #   Saurabh Naik
        #   Shreya Naik
        # ---------------------------------------------------------

        tokens = self.name_tokens(mention_text)

        if len(tokens) != 2 or not self.is_initial(tokens[0]):
            return {
                "candidate_person_ids": [],
                "candidate_generation_method": "NO_MATCH",
                "candidate_count": 0,
            }

        initial = tokens[0]
        surname = tokens[1]

        candidates = set()

        for _, row in people.iterrows():

            full_name = row.get("full_name")

            if not isinstance(full_name, str):
                continue

            full_tokens = self.name_tokens(full_name)

            if len(full_tokens) < 2:
                continue

            first_token = full_tokens[0]
            last_token = full_tokens[-1]

            if (
                first_token.startswith(initial)
                and last_token == surname
            ):
                candidates.add(row["person_id"])

        candidates = sorted(candidates)

        if candidates:
            return {
                "candidate_person_ids": candidates,
                "candidate_generation_method": "INITIAL_SURNAME",
                "candidate_count": len(candidates),
            }

        return {
            "candidate_person_ids": [],
            "candidate_generation_method": "NO_MATCH",
            "candidate_count": 0,
        }