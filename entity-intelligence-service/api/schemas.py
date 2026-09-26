from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ExtractRequest(BaseModel):
    text: str = Field(..., description="Raw text or FIR narrative to extract mentions from")
    document_id: Optional[str] = Field("DOC_LIVE", description="Optional source document ID")
    case_id: Optional[str] = Field("CASE_LIVE", description="Optional associated case ID")


class EntityMention(BaseModel):
    mention_id: str
    text_span: str
    entity_type: str
    start_char: int
    end_char: int
    extraction_method: str
    confidence: float
    validation_status: Optional[str] = "VALID"
    validation_reason: Optional[str] = None


class ExtractResponse(BaseModel):
    document_id: str
    case_id: str
    mentions: List[EntityMention]
    total_mentions: int
    counts_by_type: Dict[str, int]


class CandidatePerson(BaseModel):
    person_id: str
    full_name: str
    aliases: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    national_id: Optional[str] = None


class PersonResolutionItem(BaseModel):
    mention_id: str
    document_id: str
    case_id: str
    text_span: str
    start_char: int
    end_char: int
    entity_type: str = "PERSON"
    candidate_person_ids: List[str]
    candidates: List[CandidatePerson] = []
    candidate_count: int
    candidate_generation_method: str
    resolved_entity_id: Optional[str] = None
    resolution_status: str  # RESOLVED, AMBIGUOUS, UNRESOLVED
    resolution_method: str
    resolution_confidence: float
    evidence: Dict[str, Any] = {}


class AnalyzeFIRRequest(BaseModel):
    text: str = Field(..., description="FIR narrative or report text to analyze")
    case_id: Optional[str] = Field("CASE_LIVE", description="Case identifier")
    document_id: Optional[str] = Field("DOC_LIVE", description="Document identifier")


class AnalyzeFIRResponse(BaseModel):
    case_id: str
    document_id: str
    raw_text: str
    mentions: List[EntityMention]
    resolutions: List[PersonResolutionItem]
    metrics: Dict[str, int]
