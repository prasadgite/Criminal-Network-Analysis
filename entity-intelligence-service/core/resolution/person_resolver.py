from typing import Optional

class PersonResolver:
    """
    Conservative person entity resolver.

    Resolution states:
    - UNRESOLVED: no candidate person was found.
    - RESOLVED: exactly one candidate person was found.
    - AMBIGUOUS: multiple candidate persons remain.

    Important:
    resolution_confidence is NOT a probability.
    It represents the strength/type of the resolution decision.
    """

    UNIQUE_MATCH_CONFIDENCE = 1.0

    def resolve(
        self,
        candidate_person_ids: list[str],
        evidence=None,
    ) -> dict:

        candidates = sorted(set(candidate_person_ids))

        # No candidate
        if not candidates:
            return {
                "resolved_entity_id": None,
                "candidate_person_ids": [],
                "resolution_status": "UNRESOLVED",
                "resolution_method": "NO_CANDIDATE",
                "resolution_confidence": 0.0,
                "evidence": {},
            }

        # Exactly one candidate
        if len(candidates) == 1:
            return {
                "resolved_entity_id": candidates[0],
                "candidate_person_ids": candidates,
                "resolution_status": "RESOLVED",
                "resolution_method": "UNIQUE_REGISTRY_MATCH",
                "resolution_confidence": self.UNIQUE_MATCH_CONFIDENCE,
                "evidence": evidence or {},
            }

        # Multiple candidates
        return {
            "resolved_entity_id": None,
            "candidate_person_ids": candidates,
            "resolution_status": "AMBIGUOUS",
            "resolution_method": "MULTIPLE_REGISTRY_MATCHES",
            "resolution_confidence": 0.0,
            "evidence": evidence or {},
        }