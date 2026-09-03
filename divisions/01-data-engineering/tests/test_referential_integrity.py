import pandas as pd

from validation.integrity_validator import (
    validate_foreign_key,
)


def test_valid_foreign_key():

    persons = pd.DataFrame(
        {
            "person_id": [
                "P001",
                "P002",
            ]
        }
    )

    phones = pd.DataFrame(
        {
            "phone_id": [
                "PH001",
                "PH002",
            ],
            "registered_person_id": [
                "P001",
                "P002",
            ],
        }
    )

    issues = validate_foreign_key(
        "phones",
        phones,
        "registered_person_id",
        "persons",
        persons,
        "person_id",
    )

    assert issues == []


def test_unresolved_foreign_key():

    persons = pd.DataFrame(
        {
            "person_id": [
                "P001",
            ]
        }
    )

    phones = pd.DataFrame(
        {
            "phone_id": [
                "PH001",
            ],
            "registered_person_id": [
                "P999",
            ],
        }
    )

    issues = validate_foreign_key(
        "phones",
        phones,
        "registered_person_id",
        "persons",
        persons,
        "person_id",
    )

    assert len(issues) == 1

    assert (
        issues[0].issue_type
        == "UNRESOLVED_FOREIGN_KEY"
    )


def test_nullable_foreign_key():

    persons = pd.DataFrame(
        {
            "person_id": [
                "P001",
            ]
        }
    )

    vehicles = pd.DataFrame(
        {
            "vehicle_id": [
                "V001",
            ],
            "registered_owner_id": [
                None,
            ],
        }
    )

    issues = validate_foreign_key(
        "vehicles",
        vehicles,
        "registered_owner_id",
        "persons",
        persons,
        "person_id",
        nullable=True,
    )

    assert issues == []


def test_polymorphic_relationship():

    from validation.integrity_validator import (
        validate_polymorphic_relationship,
    )

    locations = pd.DataFrame(
        {
            "location_id": [
                "L001",
            ]
        }
    )

    persons = pd.DataFrame(
        {
            "person_id": [
                "P001",
            ]
        }
    )

    vehicles = pd.DataFrame(
        {
            "vehicle_id": [
                "V001",
            ]
        }
    )

    events = pd.DataFrame(
        {
            "event_id": [
                "E001",
                "E002",
            ],
            "entity_type": [
                "PERSON",
                "VEHICLE",
            ],
            "entity_id": [
                "P001",
                "V001",
            ],
        }
    )

    relationship = {
        "dataset": "location_events",
        "type_field": "entity_type",
        "id_field": "entity_id",
        "allowed_entities": {
            "PERSON": {
                "dataset": "persons",
                "primary_key": "person_id",
            },
            "VEHICLE": {
                "dataset": "vehicles",
                "primary_key": "vehicle_id",
            },
        },
    }

    dataframes = {
        "location_events": events,
        "locations": locations,
        "persons": persons,
        "vehicles": vehicles,
    }

    issues = validate_polymorphic_relationship(
        relationship,
        dataframes,
    )

    assert issues == []


def test_invalid_polymorphic_relationship():

    from validation.integrity_validator import (
        validate_polymorphic_relationship,
    )

    events = pd.DataFrame(
        {
            "event_id": [
                "E001",
            ],
            "entity_type": [
                "PERSON",
            ],
            "entity_id": [
                "P999",
            ],
        }
    )

    persons = pd.DataFrame(
        {
            "person_id": [
                "P001",
            ]
        }
    )

    relationship = {
        "dataset": "location_events",
        "type_field": "entity_type",
        "id_field": "entity_id",
        "allowed_entities": {
            "PERSON": {
                "dataset": "persons",
                "primary_key": "person_id",
            },
        },
    }

    dataframes = {
        "location_events": events,
        "persons": persons,
    }

    issues = validate_polymorphic_relationship(
        relationship,
        dataframes,
    )

    assert len(issues) == 1

    assert (
        issues[0].issue_type
        == "UNRESOLVED_POLYMORPHIC_ID"
    )
