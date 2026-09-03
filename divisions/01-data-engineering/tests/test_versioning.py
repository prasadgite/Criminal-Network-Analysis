import pandas as pd

from versioning.hashing import (
    sha256_file,
    dataframe_hash,
    dataset_version_id,
)
from versioning.version import (
    create_version_info,
)
from versioning.manifest import (
    create_manifest,
    write_manifest,
)
from versioning.verify import (
    verify_file_hash,
)


# -------------------------------------------
# D1.9.8 — File hashing
# -------------------------------------------

def test_sha256_file(tmp_path):

    file_path = (
        tmp_path / "data.txt"
    )

    file_path.write_text(
        "hello",
        encoding="utf-8",
    )

    first_hash = sha256_file(
        file_path
    )

    second_hash = sha256_file(
        file_path
    )

    assert first_hash == second_hash
    assert len(first_hash) == 64


def test_hash_changes_when_file_changes(
    tmp_path,
):

    file_path = (
        tmp_path / "data.txt"
    )

    file_path.write_text(
        "hello",
        encoding="utf-8",
    )

    first_hash = sha256_file(
        file_path
    )

    file_path.write_text(
        "hello world",
        encoding="utf-8",
    )

    second_hash = sha256_file(
        file_path
    )

    assert first_hash != second_hash


# -------------------------------------------
# DataFrame hashing
# -------------------------------------------

def test_dataframe_hash_deterministic():

    df = pd.DataFrame(
        {
            "a": [1, 2, 3],
            "b": ["x", "y", "z"],
        }
    )

    first = dataframe_hash(df)
    second = dataframe_hash(df)

    assert first == second


def test_dataframe_hash_column_order_invariant():

    df1 = pd.DataFrame(
        {
            "a": [1, 2],
            "b": [3, 4],
        }
    )

    df2 = pd.DataFrame(
        {
            "b": [3, 4],
            "a": [1, 2],
        }
    )

    assert dataframe_hash(df1) == dataframe_hash(df2)


def test_dataframe_hash_changes_with_data():

    df1 = pd.DataFrame(
        {"a": [1, 2, 3]}
    )

    df2 = pd.DataFrame(
        {"a": [1, 2, 4]}
    )

    assert dataframe_hash(df1) != dataframe_hash(df2)


# -------------------------------------------
# D1.9.8 — Version ID
# -------------------------------------------

def test_dataset_version_changes_with_pipeline():

    version_a = dataset_version_id(
        "SOURCE123",
        "1.0.0",
        "1.0",
    )

    version_b = dataset_version_id(
        "SOURCE123",
        "1.0.1",
        "1.0",
    )

    assert version_a != version_b


def test_dataset_version_changes_with_schema():

    version_a = dataset_version_id(
        "SOURCE123",
        "1.0.0",
        "1.0",
    )

    version_b = dataset_version_id(
        "SOURCE123",
        "1.0.0",
        "1.1",
    )

    assert version_a != version_b


def test_dataset_version_deterministic():

    a = dataset_version_id(
        "SRC", "1.0.0", "1.0"
    )

    b = dataset_version_id(
        "SRC", "1.0.0", "1.0"
    )

    assert a == b


# -------------------------------------------
# Version info
# -------------------------------------------

def test_version_info_creation():

    info = create_version_info(
        dataset="persons",
        source_hash="SRC_HASH",
        processed_hash="OUT_HASH",
        pipeline_version="1.0.0",
        schema_version="1.0",
    )

    assert info.dataset == "persons"
    assert info.source_hash == "SRC_HASH"
    assert info.processed_hash == "OUT_HASH"
    assert info.generated_at is not None

    d = info.to_dict()
    assert d["dataset"] == "persons"


# -------------------------------------------
# Manifest
# -------------------------------------------

def test_manifest_contains_lineage():

    version = create_version_info(
        dataset="persons",
        source_hash="SOURCE123",
        processed_hash="OUTPUT123",
        pipeline_version="1.0.0",
        schema_version="1.0",
    )

    manifest = create_manifest(
        version
    )

    assert (
        manifest["dataset"]
        == "persons"
    )

    assert (
        manifest["source"]["sha256"]
        == "SOURCE123"
    )

    assert (
        manifest["output"]["sha256"]
        == "OUTPUT123"
    )

    assert (
        manifest["pipeline"]["version"]
        == "1.0.0"
    )

    assert (
        manifest["schema"]["version"]
        == "1.0"
    )

    assert "generated_at" in manifest


def test_manifest_write(tmp_path):

    version = create_version_info(
        dataset="cases",
        source_hash="ABC",
        processed_hash="DEF",
        pipeline_version="1.0.0",
        schema_version="1.0",
    )

    manifest = create_manifest(version)

    path = (
        tmp_path
        / "manifests"
        / "cases"
        / "manifest.json"
    )

    result = write_manifest(
        manifest,
        path,
    )

    assert result.exists()

    content = result.read_text(
        encoding="utf-8"
    )

    assert '"cases"' in content
    assert '"ABC"' in content


# -------------------------------------------
# D1.9.9 — Tamper detection
# -------------------------------------------

def test_hash_verification(tmp_path):

    file_path = (
        tmp_path / "data.txt"
    )

    file_path.write_text(
        "hello",
        encoding="utf-8",
    )

    expected = sha256_file(
        file_path
    )

    assert verify_file_hash(
        file_path,
        expected,
    )

    file_path.write_text(
        "tampered",
        encoding="utf-8",
    )

    assert not verify_file_hash(
        file_path,
        expected,
    )


# -------------------------------------------
# Versioned writer integration
# -------------------------------------------

def test_versioned_writer(tmp_path):

    from transformation.versioned_writer import (
        write_versioned_dataset,
    )

    df = pd.DataFrame(
        {
            "person_id": ["P001", "P002"],
            "name": ["Rahul", "Priya"],
        }
    )

    output_dir = tmp_path / "processed" / "persons"
    manifest_dir = tmp_path / "manifests"

    output_path, manifest_path, version_info = (
        write_versioned_dataset(
            dataframe=df,
            dataset_name="persons",
            output_directory=output_dir,
            manifest_directory=manifest_dir,
            source_hash="SRC_ABC",
            pipeline_version="1.0.0",
            schema_version="1.0",
        )
    )

    assert output_path.exists()
    assert manifest_path.exists()

    assert version_info.dataset == "persons"
    assert version_info.source_hash == "SRC_ABC"
    assert len(version_info.processed_hash) == 64

    # Verify the output file matches the manifest hash
    assert verify_file_hash(
        output_path,
        version_info.processed_hash,
    )
