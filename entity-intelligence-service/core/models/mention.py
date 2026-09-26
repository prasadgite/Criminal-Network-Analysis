from dataclasses import dataclass
from typing import Optional


@dataclass
class EntityMention:
    mention_id: str
    document_id: str
    case_id: str

    text_span: str
    start_char: int
    end_char: int

    entity_type: str
    extracted_value: str

    normalized_value: Optional[str] = None

    resolved_entity_id: Optional[str] = None

    extraction_method: Optional[str] = None

    extraction_confidence: float = 0.0
    resolution_confidence: float = 0.0

    resolution_status: str = "UNRESOLVED"

    source_system: Optional[str] = None
    model_version: Optional[str] = None