import os
import sys
import random
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import psycopg2

# Add core to sys.path so Prathamesh's imports work directly
core_dir = Path(__file__).resolve().parent.parent / "core"
if str(core_dir) not in sys.path:
    sys.path.insert(0, str(core_dir))

try:
    from extraction.hybrid import HybridEntityExtractor
    from extraction.mention_validator import MentionValidator
    from candidate_generation.person_candidate_generator import PersonCandidateGenerator
    from resolution.person_resolver import PersonResolver
    from resolution.person_context import PersonContextBuilder
except ImportError:
    from ..core.extraction.hybrid import HybridEntityExtractor  # type: ignore
    from ..core.extraction.mention_validator import MentionValidator  # type: ignore
    from ..core.candidate_generation.person_candidate_generator import PersonCandidateGenerator  # type: ignore
    from ..core.resolution.person_resolver import PersonResolver  # type: ignore
    from ..core.resolution.person_context import PersonContextBuilder  # type: ignore

DEFAULT_NEON_URL = (
    "postgresql://neondb_owner:npg_bEUj5tZ8zYPw@"
    "ep-soft-darkness-b31r85gj-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
)

class EntityIntelligenceService:
    def __init__(self, data_dir: Optional[str] = None, database_url: Optional[str] = None):
        self.db_url = database_url or os.environ.get("DATABASE_URL") or DEFAULT_NEON_URL
        self.data_dir = Path(data_dir or os.environ.get("DATASETS_DIR", "datasets/raw"))
        self.data_source = "CSV"
        
        # Try loading registries directly from NeonDB first
        loaded_from_neon = self._try_load_from_neon()
        
        if not loaded_from_neon:
            self._load_from_csv()

        print(f"[EntityIntelligenceService] Active Data Source: {self.data_source}")
        print(f"[EntityIntelligenceService] Ready with {len(self.people_lookup)} indexed registry people.")

    def _get_db_connection(self):
        return psycopg2.connect(self.db_url)

    def _try_load_from_neon(self) -> bool:
        try:
            print("[EntityIntelligenceService] Connecting to NeonDB PostgreSQL...")
            conn = self._get_db_connection()
            cur = conn.cursor()

            # 1. Load persons from NeonDB
            cur.execute("SELECT person_id, full_name, alias_name, date_of_birth, gender, nationality FROM persons;")
            person_rows = cur.fetchall()
            df_persons = pd.DataFrame(
                person_rows,
                columns=pd.Index(['person_id', 'full_name', 'aliases', 'date_of_birth', 'gender', 'national_id'])
            )

            # 2. Load locations from NeonDB
            cur.execute("SELECT location_id, location_name, area, city, district FROM locations;")
            location_rows = cur.fetchall()
            df_locations = pd.DataFrame(
                location_rows,
                columns=pd.Index(['location_id', 'location_name', 'area', 'city', 'district'])
            )

            # 3. Load phones & vehicles for context builder
            cur.execute("SELECT phone_id, phone_number, registered_person_id FROM phones;")
            phones_df = pd.DataFrame(cur.fetchall(), columns=pd.Index(['phone_id', 'phone_number', 'registered_person_id']))

            cur.execute("SELECT vehicle_id, registration_number, registered_owner_id, current_owner_id FROM vehicles;")
            vehicles_df = pd.DataFrame(cur.fetchall(), columns=pd.Index(['vehicle_id', 'registration_number', 'registered_owner_id', 'current_owner_id']))

            # 4. Load case entities for contextual evidence matching (PersonContextBuilder)
            cur.execute("""
                SELECT case_id, source_entity_id, source_entity_type, relationship_type,
                       target_entity_id, target_entity_type, confidence, verified,
                       verification_status, source_document_id
                FROM case_entities 
                LIMIT 50000;
            """)
            self.case_entities_df = pd.DataFrame(
                cur.fetchall(),
                columns=pd.Index([
                    'case_id', 'source_entity_id', 'source_entity_type', 'relationship_type',
                    'target_entity_id', 'target_entity_type', 'confidence', 'verified',
                    'verification_status', 'source_document_id'
                ])
            )
            if not self.case_entities_df.empty:
                self.case_entities_df['confidence'] = self.case_entities_df['confidence'].fillna(1.0)
                self.case_entities_df['verified'] = self.case_entities_df['verified'].fillna(False)
                self.case_entities_df['verification_status'] = self.case_entities_df['verification_status'].fillna('Contextual')
                self.case_entities_df['source_document_id'] = self.case_entities_df['source_document_id'].fillna('')

            cur.close()
            conn.close()

            # Initialize Extractors with NeonDB DataFrames
            self.extractor = HybridEntityExtractor(df_persons)
            self.validator = MentionValidator(df_locations)
            self.candidate_generator = PersonCandidateGenerator()
            self.resolver = PersonResolver()
            self.context_builder = PersonContextBuilder(phones=phones_df, vehicles=vehicles_df)

            # Build in-memory fast person lookup
            self.people_lookup = {}
            for row in df_persons.itertuples(index=False):
                pid = getattr(row, "person_id", None)
                if pid:
                    self.people_lookup[pid] = {
                        "person_id": str(pid),
                        "full_name": str(getattr(row, "full_name", "")),
                        "aliases": str(getattr(row, "aliases", "")) if bool(pd.notna(getattr(row, "aliases", None))) else None,
                        "date_of_birth": str(getattr(row, "date_of_birth", "")) if bool(pd.notna(getattr(row, "date_of_birth", None))) else None,
                        "gender": str(getattr(row, "gender", "")) if bool(pd.notna(getattr(row, "gender", None))) else None,
                        "national_id": str(getattr(row, "national_id", "")) if bool(pd.notna(getattr(row, "national_id", None))) else None,
                    }

            self.data_source = "NeonDB (Cloud PostgreSQL)"
            return True
        except Exception as e:
            print(f"[EntityIntelligenceService] NeonDB connection failed ({e}). Falling back to local CSV files...")
            return False

    def _load_from_csv(self):
        person_file = self.data_dir / "person.csv"
        locations_file = self.data_dir / "locations.csv"
        phones_file = self.data_dir / "phones.csv"
        vehicles_file = self.data_dir / "vehicles.csv"
        case_entities_file = self.data_dir / "case_entities.csv"

        self.extractor = HybridEntityExtractor(str(person_file))
        self.validator = MentionValidator(str(locations_file))
        self.candidate_generator = PersonCandidateGenerator()
        self.resolver = PersonResolver()

        phones_df = pd.read_csv(phones_file) if phones_file.exists() else pd.DataFrame()
        vehicles_df = pd.read_csv(vehicles_file) if vehicles_file.exists() else pd.DataFrame()
        self.context_builder = PersonContextBuilder(phones=phones_df, vehicles=vehicles_df)
        if case_entities_file.exists():
            self.case_entities_df = pd.read_csv(case_entities_file)
        else:
            self.case_entities_df = pd.DataFrame({
                'case_id': [], 'source_entity_id': [], 'source_entity_type': [], 'relationship_type': [],
                'target_entity_id': [], 'target_entity_type': [], 'confidence': [], 'verified': [],
                'verification_status': [], 'source_document_id': []
            })

        self.people_lookup = {}
        if hasattr(self.extractor, "person_registry") and hasattr(self.extractor.person_registry, "people"):
            df = self.extractor.person_registry.people
            for row in df.itertuples(index=False):
                pid = getattr(row, "person_id", None)
                if pid:
                    self.people_lookup[pid] = {
                        "person_id": str(pid),
                        "full_name": str(getattr(row, "full_name", "")),
                        "aliases": str(getattr(row, "aliases", "")) if bool(pd.notna(getattr(row, "aliases", None))) else None,
                        "date_of_birth": str(getattr(row, "date_of_birth", "")) if bool(pd.notna(getattr(row, "date_of_birth", None))) else None,
                        "gender": str(getattr(row, "gender", "")) if bool(pd.notna(getattr(row, "gender", None))) else None,
                        "national_id": str(getattr(row, "national_id", "")) if bool(pd.notna(getattr(row, "national_id", None))) else None,
                    }
        self.data_source = "Local CSV (Junction)"

    def get_random_fir(self) -> Dict[str, Any]:
        """Fetch a live FIR directly from NeonDB fir_narratives table."""
        try:
            conn = self._get_db_connection()
            cur = conn.cursor()
            # Random offset among 10,000 FIRs
            offset = random.randint(0, 9950)
            cur.execute(
                """
                SELECT document_id, case_id, document_type, document_date, source_officer, narrative_text
                FROM fir_narratives
                OFFSET %s LIMIT 1;
                """,
                (offset,)
            )
            row = cur.fetchone()
            cur.close()
            conn.close()
            if row:
                return {
                    "document_id": str(row[0]),
                    "case_id": str(row[1]),
                    "document_type": str(row[2]),
                    "document_date": str(row[3]),
                    "source_officer": str(row[4]),
                    "narrative_text": str(row[5])
                }
        except Exception as e:
            print(f"[EntityIntelligenceService] Error fetching random FIR from NeonDB: {e}")

        return {
            "document_id": "DOC000001",
            "case_id": "C000001",
            "document_type": "FIR",
            "document_date": "2019-08-13",
            "source_officer": "IO0074",
            "narrative_text": "On 13 August 2019, Akash V Kale was reported in connection with a robbery in Kothrud, Pune with Komal R Naik in vehicle MH12FM4689."
        }

    # =========================================================================
    # LIVE NEONDB QUERIES (Searching, Filtering, and Resolving 50,000 Mentions)
    # =========================================================================

    def get_db_stats(self) -> Dict[str, Any]:
        """Returns live statistics from NeonDB entity_mentions table."""
        try:
            conn = self._get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                SELECT resolution_status, count(*) 
                FROM entity_mentions 
                GROUP BY resolution_status;
            """)
            counts = {r[0]: r[1] for r in cur.fetchall()}
            cur.execute("SELECT count(*) FROM entity_mentions;")
            row_total = cur.fetchone()
            total = int(row_total[0]) if row_total else 0
            cur.close()
            conn.close()
            return {
                "total": total,
                "resolved": counts.get("RESOLVED", 0),
                "ambiguous": counts.get("AMBIGUOUS", 0),
                "unresolved": counts.get("UNRESOLVED", 0),
                "source": "NeonDB"
            }
        except Exception as e:
            return {"error": str(e), "total": 50000, "resolved": 20007, "ambiguous": 10000, "unresolved": 19993}

    def query_db_mentions(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None,
        entity_type: Optional[str] = None,
        limit: int = 25,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Searches and filters the 50,000 entity mentions directly in NeonDB."""
        try:
            conn = self._get_db_connection()
            cur = conn.cursor()

            clauses = []
            params = []

            if status and status.upper() != "ALL":
                clauses.append("m.resolution_status = %s")
                params.append(status.upper())

            if entity_type and entity_type.upper() != "ALL":
                clauses.append("m.entity_type = %s")
                params.append(entity_type.upper())

            if search and search.strip():
                clauses.append("(m.text_span ILIKE %s OR m.case_id ILIKE %s OR m.document_id ILIKE %s OR p.full_name ILIKE %s)")
                term = f"%{search.strip()}%"
                params.extend([term, term, term, term])

            where_sql = ("WHERE " + " AND ".join(clauses)) if clauses else ""

            # Count total matching
            count_sql = f"""
                SELECT count(*)
                FROM entity_mentions m
                LEFT JOIN persons p ON m.resolved_entity_id = p.person_id
                {where_sql};
            """
            cur.execute(count_sql, params)
            count_row = cur.fetchone()
            total_matching = int(count_row[0]) if count_row else 0

            # Fetch paginated rows
            data_sql = f"""
                SELECT 
                    m.mention_id, 
                    m.document_id, 
                    m.case_id, 
                    m.text_span, 
                    m.start_char, 
                    m.end_char, 
                    m.entity_type, 
                    m.resolved_entity_id, 
                    m.confidence, 
                    m.resolution_status,
                    p.full_name as resolved_person_name,
                    p.alias_name as resolved_person_alias,
                    p.date_of_birth as resolved_person_dob,
                    p.gender as resolved_person_gender
                FROM entity_mentions m
                LEFT JOIN persons p ON m.resolved_entity_id = p.person_id
                {where_sql}
                ORDER BY m.mention_id ASC
                LIMIT %s OFFSET %s;
            """
            cur.execute(data_sql, params + [limit, offset])
            rows = cur.fetchall()
            cur.close()
            conn.close()

            items = []
            for r in rows:
                mention_id, doc_id, case_id, text_span, s_char, e_char, etype, res_id, conf, res_stat, p_name, p_alias, p_dob, p_gender = r
                
                # If ambiguous or unresolved, generate candidate options from the Trie registry
                candidates = []
                if etype == "PERSON":
                    cand_res = self.candidate_generator.generate(
                        text_span,
                        self.extractor.person_registry.name_index,
                        self.extractor.person_registry.people
                    )
                    cand_ids = cand_res.get("candidate_person_ids", [])
                    candidates = [
                        self.people_lookup.get(pid, {"person_id": pid, "full_name": pid})
                        for pid in cand_ids
                    ]

                items.append({
                    "mention_id": mention_id,
                    "document_id": doc_id,
                    "case_id": case_id,
                    "text_span": text_span,
                    "start_char": s_char,
                    "end_char": e_char,
                    "entity_type": etype,
                    "resolved_entity_id": res_id,
                    "confidence": float(conf) if conf is not None else 0.0,
                    "resolution_status": res_stat,
                    "resolved_person": {
                        "person_id": res_id,
                        "full_name": p_name or res_id,
                        "aliases": p_alias,
                        "date_of_birth": str(p_dob) if p_dob else None,
                        "gender": p_gender
                    } if res_id else None,
                    "candidates": candidates,
                    "candidate_count": len(candidates)
                })

            return {
                "total": total_matching,
                "limit": limit,
                "offset": offset,
                "items": items,
                "data_source": "NeonDB"
            }
        except Exception as e:
            print(f"[EntityIntelligenceService] Error querying NeonDB mentions: {e}")
            return {"total": 0, "limit": limit, "offset": offset, "items": [], "error": str(e)}

    def resolve_db_mention(self, mention_id: str, resolved_person_id: str) -> Dict[str, Any]:
        """Updates the resolution of an entity mention directly in NeonDB."""
        try:
            conn = self._get_db_connection()
            cur = conn.cursor()
            cur.execute(
                """
                UPDATE entity_mentions
                SET resolved_entity_id = %s,
                    resolution_status = 'RESOLVED',
                    confidence = 1.00
                WHERE mention_id = %s
                RETURNING mention_id, document_id, case_id, text_span, resolved_entity_id, resolution_status;
                """,
                (resolved_person_id, mention_id)
            )
            row = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()

            if row:
                return {
                    "success": True,
                    "mention_id": row[0],
                    "document_id": row[1],
                    "case_id": row[2],
                    "text_span": row[3],
                    "resolved_entity_id": row[4],
                    "resolution_status": row[5],
                    "message": f"Mention {mention_id} successfully resolved to person {resolved_person_id} in NeonDB."
                }
            return {"success": False, "error": f"Mention {mention_id} not found in NeonDB."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def save_mentions_to_db(self, mentions: List[Dict[str, Any]], case_id: str, document_id: str):
        """Inserts newly analyzed mentions into NeonDB entity_mentions table if document exists."""
        if not mentions:
            return
        try:
            conn = self._get_db_connection()
            cur = conn.cursor()
            # Verify document exists in fir_narratives to satisfy foreign key constraint
            cur.execute("SELECT 1 FROM fir_narratives WHERE document_id = %s;", (document_id,))
            if not cur.fetchone():
                # Document is transient / ad-hoc (e.g. DOC_LIVE), skip DB persist
                cur.close()
                conn.close()
                return

            for m in mentions:
                cur.execute(
                    """
                    INSERT INTO entity_mentions (
                        mention_id, document_id, case_id, text_span, start_char, end_char,
                        entity_type, extracted_value, resolved_entity_id, confidence, resolution_status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (mention_id) DO UPDATE SET
                        resolved_entity_id = EXCLUDED.resolved_entity_id,
                        resolution_status = EXCLUDED.resolution_status,
                        confidence = EXCLUDED.confidence;
                    """,
                    (
                        m["mention_id"],
                        document_id,
                        case_id,
                        m["text_span"],
                        m.get("start_char", 0),
                        m.get("end_char", 0),
                        m["entity_type"],
                        m["text_span"],
                        m.get("resolved_entity_id"),
                        m.get("confidence", 1.0),
                        m.get("resolution_status", "UNRESOLVED")
                    )
                )
            conn.commit()
            cur.close()
            conn.close()
            print(f"[EntityIntelligenceService] Persisted {len(mentions)} mentions into NeonDB.")
        except Exception as e:
            print(f"[EntityIntelligenceService] Warning saving mentions to NeonDB: {e}")

    # =========================================================================
    # ON-DEMAND LIVE ANALYSIS
    # =========================================================================

    def extract_mentions(self, text: str, document_id: str = "DOC_LIVE", case_id: str = "CASE_LIVE") -> List[Dict[str, Any]]:
        raw_mentions = self.extractor.extract(text)
        validated_mentions = []
        
        for idx, m in enumerate(raw_mentions):
            val = self.validator.validate(m)
            v_status = val.get("validation_status", "VALID")
            
            entity_type = m.get("entity_type")
            if v_status == "CORRECTED" and "corrected_entity_type" in val:
                entity_type = val["corrected_entity_type"]

            validated_mentions.append({
                "mention_id": f"{document_id}_M{idx+1:04d}",
                "text_span": m.get("text_span", ""),
                "entity_type": entity_type,
                "start_char": m.get("start_char", 0),
                "end_char": m.get("end_char", 0),
                "extraction_method": m.get("extraction_method", "UNKNOWN"),
                "confidence": float(m.get("confidence", 1.0)),
                "validation_status": v_status,
                "validation_reason": val.get("validation_reason"),
            })
            
        return validated_mentions

    def resolve_person(self, mention_id: str, text_span: str, case_id: str, document_id: str, start_char: int = 0, end_char: int = 0) -> Dict[str, Any]:
        cand_res = self.candidate_generator.generate(
            text_span,
            self.extractor.person_registry.name_index,
            self.extractor.person_registry.people
        )
        candidate_ids = cand_res.get("candidate_person_ids", [])
        cand_count = cand_res.get("candidate_count", len(candidate_ids))
        cand_method = cand_res.get("candidate_generation_method", "UNKNOWN")

        evidence = self.context_builder.build(
            candidate_ids,
            case_id,
            document_id,
            self.case_entities_df
        )

        resolution = self.resolver.resolve(candidate_ids, evidence)
        
        candidates_detailed = [
            self.people_lookup.get(pid, {"person_id": pid, "full_name": pid})
            for pid in candidate_ids
        ]

        return {
            "mention_id": mention_id,
            "document_id": document_id,
            "case_id": case_id,
            "text_span": text_span,
            "start_char": start_char,
            "end_char": end_char,
            "entity_type": "PERSON",
            "candidate_person_ids": candidate_ids,
            "candidates": candidates_detailed,
            "candidate_count": cand_count,
            "candidate_generation_method": cand_method,
            "resolved_entity_id": resolution.get("resolved_entity_id"),
            "resolution_status": resolution.get("resolution_status", "UNRESOLVED"),
            "resolution_method": resolution.get("resolution_method", "CONSERVATIVE"),
            "resolution_confidence": float(resolution.get("resolution_confidence", 0.0)),
            "evidence": evidence
        }

    def analyze_fir(self, text: str, case_id: str = "CASE_LIVE", document_id: str = "DOC_LIVE", save_to_neon: bool = True) -> Dict[str, Any]:
        mentions = self.extract_mentions(text, document_id=document_id, case_id=case_id)
        resolutions = []
        metrics = {
            "total_mentions": len(mentions),
            "persons_detected": 0,
            "phones_detected": 0,
            "vehicles_detected": 0,
            "locations_detected": 0,
            "resolved": 0,
            "ambiguous": 0,
            "unresolved": 0
        }

        for m in mentions:
            etype = m["entity_type"]
            if etype == "PERSON":
                metrics["persons_detected"] += 1
                if m["validation_status"] != "REJECTED":
                    res = self.resolve_person(
                        mention_id=m["mention_id"],
                        text_span=m["text_span"],
                        case_id=case_id,
                        document_id=document_id,
                        start_char=m["start_char"],
                        end_char=m["end_char"]
                    )
                    resolutions.append(res)
                    status = res["resolution_status"].lower()
                    if status in metrics:
                        metrics[status] += 1
            elif etype == "PHONE":
                metrics["phones_detected"] += 1
            elif etype == "VEHICLE":
                metrics["vehicles_detected"] += 1
            elif etype == "LOCATION":
                metrics["locations_detected"] += 1

        # Optionally persist into NeonDB
        if save_to_neon and self.data_source.startswith("NeonDB"):
            persisted_list = []
            for r in resolutions:
                persisted_list.append({
                    "mention_id": r["mention_id"],
                    "text_span": r["text_span"],
                    "start_char": r["start_char"],
                    "end_char": r["end_char"],
                    "entity_type": "PERSON",
                    "resolved_entity_id": r.get("resolved_entity_id"),
                    "confidence": r.get("resolution_confidence", 1.0),
                    "resolution_status": r["resolution_status"]
                })
            if persisted_list:
                self.save_mentions_to_db(persisted_list, case_id, document_id)

        return {
            "case_id": case_id,
            "document_id": document_id,
            "raw_text": text,
            "mentions": mentions,
            "resolutions": resolutions,
            "metrics": metrics,
            "data_source": self.data_source
        }
