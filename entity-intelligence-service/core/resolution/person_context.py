from dataclasses import dataclass, field


@dataclass
class Evidence:
    source: str
    relationship_type: str
    confidence: float
    verified: bool
    verification_status: str
    source_document_id: str | None = None

    def score(self) -> float:
        return self.confidence


@dataclass
class CandidateEvidence:
    person_id: str
    evidence: list[Evidence] = field(default_factory=list)

    def add(self, evidence: Evidence):
        self.evidence.append(evidence)

    @property
    def total_score(self) -> float:
        return sum(item.score() for item in self.evidence)


class PersonContextBuilder:
    """
    Collects traceable contextual evidence for person candidates.

    Current evidence:
    - Case -> Person INVOLVES
    - Document -> Person MENTIONS
    - Phone registered-person relationship
    - Vehicle owner relationship

    This class collects evidence.
    It does not make the identity decision.
    """

    def __init__(self, phones=None, vehicles=None):
        self.phones = phones
        self.vehicles = vehicles

    @staticmethod
    def _to_bool(value):
        return str(value).strip().lower() in {
            "true", "1", "yes", "y"
        }

    def add_registry_evidence(
        self,
        evidence,
        person_id,
        source,
        relationship_type,
        confidence=1.0,
        verified=False,
        verification_status="Contextual",
        source_document_id=None,
    ):
        evidence[person_id].add(
            Evidence(
                source=source,
                relationship_type=relationship_type,
                confidence=confidence,
                verified=verified,
                verification_status=verification_status,
                source_document_id=source_document_id,
            )
        )

    def build(
        self,
        candidate_person_ids: list[str],
        case_id: str,
        document_id: str,
        case_entities,
    ) -> dict[str, CandidateEvidence]:

        evidence = {
            person_id: CandidateEvidence(person_id)
            for person_id in candidate_person_ids
        }

        case_rows = case_entities[
            case_entities["case_id"] == case_id
        ]

        for person_id in candidate_person_ids:

            # -------------------------------------------------
            # Case -> Person
            # -------------------------------------------------
            case_matches = case_rows[
                (case_rows["target_entity_id"] == person_id)
                &
                (case_rows["target_entity_type"] == "Person")
                &
                (case_rows["relationship_type"] == "INVOLVES")
            ]

            for _, row in case_matches.iterrows():
                evidence[person_id].add(
                    Evidence(
                        source="case_entities",
                        relationship_type="INVOLVES",
                        confidence=float(row["confidence"]),
                        verified=self._to_bool(row["verified"]),
                        verification_status=str(
                            row["verification_status"]
                        ),
                        source_document_id=str(
                            row["source_document_id"]
                        ),
                    )
                )

            # -------------------------------------------------
            # Document -> Person
            # -------------------------------------------------
            document_matches = case_rows[
                (case_rows["source_entity_id"] == document_id)
                &
                (case_rows["source_entity_type"] == "Document")
                &
                (case_rows["target_entity_id"] == person_id)
                &
                (case_rows["target_entity_type"] == "Person")
                &
                (case_rows["relationship_type"] == "MENTIONS")
            ]

            for _, row in document_matches.iterrows():
                evidence[person_id].add(
                    Evidence(
                        source="case_entities",
                        relationship_type="MENTIONS",
                        confidence=float(row["confidence"]),
                        verified=self._to_bool(row["verified"]),
                        verification_status=str(
                            row["verification_status"]
                        ),
                        source_document_id=str(
                            row["source_document_id"]
                        ),
                    )
                )

        return evidence