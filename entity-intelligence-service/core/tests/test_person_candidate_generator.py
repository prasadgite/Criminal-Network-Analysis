import pandas as pd

from candidate_generation.person_candidate_generator import (
    PersonCandidateGenerator,
)


def test_exact_name_match():

    generator = PersonCandidateGenerator()

    name_index = {
        "rohit wagh": {"P001"},
    }

    people = pd.DataFrame(
        [
            {
                "person_id": "P001",
                "full_name": "Rohit Wagh",
            }
        ]
    )

    result = generator.generate(
        "Rohit Wagh",
        name_index,
        people,
    )

    assert result["candidate_person_ids"] == ["P001"]
    assert result["candidate_generation_method"] == "EXACT_NAME"


def test_abbreviated_name_match():

    generator = PersonCandidateGenerator()

    name_index = {}

    people = pd.DataFrame(
        [
            {
                "person_id": "P001",
                "full_name": "Sahil Naik",
            },
            {
                "person_id": "P002",
                "full_name": "Shreya Naik",
            },
            {
                "person_id": "P003",
                "full_name": "Rahul Patil",
            },
        ]
    )

    result = generator.generate(
        "S. Naik",
        name_index,
        people,
    )

    assert result["candidate_person_ids"] == [
        "P001",
        "P002",
    ]

    assert result["candidate_generation_method"] == (
        "INITIAL_SURNAME"
    )