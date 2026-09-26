from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
try:
    from .schemas import (
        ExtractRequest,
        ExtractResponse,
        EntityMention,
        AnalyzeFIRRequest,
        AnalyzeFIRResponse,
        PersonResolutionItem,
    )
    from .service import EntityIntelligenceService
except ImportError:
    try:
        from api.schemas import (
            ExtractRequest,
            ExtractResponse,
            EntityMention,
            AnalyzeFIRRequest,
            AnalyzeFIRResponse,
            PersonResolutionItem,
        )
        from api.service import EntityIntelligenceService
    except ImportError:
        from schemas import (
            ExtractRequest,
            ExtractResponse,
            EntityMention,
            AnalyzeFIRRequest,
            AnalyzeFIRResponse,
            PersonResolutionItem,
        )
        from service import EntityIntelligenceService

service: Optional[EntityIntelligenceService] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global service
    print("[FastAPI] Initializing SANDHAAN Entity Intelligence Service...")
    service = EntityIntelligenceService()
    yield
    print("[FastAPI] Shutting down Entity Intelligence Service...")

app = FastAPI(
    title="SANDHAAN — Division 2 Entity Intelligence API",
    version="1.0.0",
    description="Real-time Criminal Entity Extraction, Candidate Generation, and Conservative Resolution Service",
    lifespan=lifespan,
)

# Enable CORS for Vite frontend and NestJS backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "online",
        "service": "SANDHAAN Division 2 Entity Intelligence",
        "version": "1.0.0",
        "data_source": service.data_source if service else "None",
        "indexed_people": len(service.people_lookup) if service else 0,
    }

@app.get("/api/v1/db/stats")
def get_db_stats():
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    return service.get_db_stats()

@app.get("/api/v1/db/mentions")
def get_db_mentions(
    status: Optional[str] = Query(None, description="Resolution status filter"),
    search: Optional[str] = Query(None, description="Search term for span, case, or person"),
    entity_type: Optional[str] = Query(None, description="Entity type filter"),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    return service.query_db_mentions(
        status=status,
        search=search,
        entity_type=entity_type,
        limit=limit,
        offset=offset
    )

@app.post("/api/v1/db/mentions/{mention_id}/resolve")
def resolve_mention(mention_id: str, body: Dict[str, str]):
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    person_id = body.get("resolved_person_id")
    if not person_id:
        raise HTTPException(status_code=400, detail="Missing resolved_person_id in body")
    res = service.resolve_db_mention(mention_id, person_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error", "Update failed"))
    return res

@app.get("/api/v1/firs/random")
def get_random_fir():
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    return service.get_random_fir()

@app.post("/api/v1/extract", response_model=ExtractResponse)
def extract_entities(req: ExtractRequest):
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    
    mentions_data = service.extract_mentions(
        text=req.text,
        document_id=req.document_id or "DOC_LIVE",
        case_id=req.case_id or "CASE_LIVE"
    )
    
    mentions = [EntityMention(**m) for m in mentions_data]
    counts = {}
    for m in mentions:
        counts[m.entity_type] = counts.get(m.entity_type, 0) + 1

    return ExtractResponse(
        document_id=req.document_id or "DOC_LIVE",
        case_id=req.case_id or "CASE_LIVE",
        mentions=mentions,
        total_mentions=len(mentions),
        counts_by_type=counts
    )

@app.post("/api/v1/analyze-fir", response_model=AnalyzeFIRResponse)
def analyze_fir(req: AnalyzeFIRRequest):
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    
    result = service.analyze_fir(
        text=req.text,
        case_id=req.case_id or "CASE_LIVE",
        document_id=req.document_id or "DOC_LIVE"
    )
    return AnalyzeFIRResponse(**result)

@app.get("/api/v1/persons/{person_id}")
def get_person(person_id: str):
    if not service:
        raise HTTPException(status_code=503, detail="Entity service not ready")
    person = service.people_lookup.get(person_id)
    if not person:
        raise HTTPException(status_code=404, detail=f"Person {person_id} not found in registry")
    return person

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

