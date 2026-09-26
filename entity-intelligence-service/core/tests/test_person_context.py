import pandas as pd

from resolution.person_context import PersonContextBuilder


def test_ambiguous_akash_case_has_no_direct_candidate_relationship():
    case_entities = pd.DataFrame([
        {
            "case_id": "C000001",
            "source_entity_id": "C000001",
            "source_entity_type": "Case",
            "relationship_type": "INVOLVES",
            "target_entity_id": "P003684",
            "target_entity_type": "Person",
            "confidence": 0.95,
            "source_document_id": "DOC000001",
            "verified": True,
            "verification_status": "Verified",
        }
    ])

    builder = PersonContextBuilder()

    evidence = builder.build(
        candidate_person_ids=["P001807", "P002378"],
        case_id="C000001",
        document_id="DOC000001",
        case_entities=case_entities,
    )

    assert evidence["P001807"].evidence == []
    assert evidence["P002378"].evidence == []