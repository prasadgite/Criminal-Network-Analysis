from dataclasses import dataclass
from typing import Optional


@dataclass
class CanonicalEntity:
    entity_id: str
    entity_type: str

    canonical_value: str

    source_record_id: Optional[str] = None

    confidence: float = 0.0