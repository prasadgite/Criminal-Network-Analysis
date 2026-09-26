import sys
from pathlib import Path

D2_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(D2_ROOT))

from resolution.person_resolver import PersonResolver


from resolution.person_resolver import PersonResolver


def test_no_candidate_is_unresolved():
    resolver = PersonResolver()

    result = resolver.resolve([])

    assert result["resolution_status"] == "UNRESOLVED"
    assert result["resolution_method"] == "NO_CANDIDATE"
    assert result["resolved_entity_id"] is None


def test_single_candidate_is_resolved():
    resolver = PersonResolver()

    result = resolver.resolve(["P001807"])

    assert result["resolution_status"] == "RESOLVED"
    assert result["resolution_method"] == "UNIQUE_REGISTRY_MATCH"
    assert result["resolved_entity_id"] == "P001807"
    assert result["resolution_confidence"] == 1.0


def test_multiple_candidates_are_ambiguous():
    resolver = PersonResolver()

    result = resolver.resolve([
        "P001807",
        "P002378",
    ])

    assert result["resolution_status"] == "AMBIGUOUS"
    assert result["resolution_method"] == "MULTIPLE_REGISTRY_MATCHES"
    assert result["resolved_entity_id"] is None