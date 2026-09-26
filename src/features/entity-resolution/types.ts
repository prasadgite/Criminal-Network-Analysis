export interface EntityMention {
  mention_id: string;
  text_span: string;
  entity_type: 'PERSON' | 'PHONE' | 'VEHICLE' | 'LOCATION' | string;
  start_char: number;
  end_char: number;
  extraction_method: string;
  confidence: number;
  validation_status?: 'VALID' | 'CORRECTED' | 'REJECTED' | string;
  validation_reason?: string | null;
}

export interface CandidatePerson {
  person_id: string;
  full_name: string;
  aliases?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  national_id?: string | null;
}

export interface PersonResolutionItem {
  mention_id: string;
  document_id: string;
  case_id: string;
  text_span: string;
  start_char: number;
  end_char: number;
  entity_type: string;
  candidate_person_ids: string[];
  candidates: CandidatePerson[];
  candidate_count: number;
  candidate_generation_method: string;
  resolved_entity_id?: string | null;
  resolution_status: 'RESOLVED' | 'AMBIGUOUS' | 'UNRESOLVED' | string;
  resolution_method: string;
  resolution_confidence: number;
  evidence: Record<string, any>;
}

export interface AnalyzeFIRMetrics {
  total_mentions: number;
  persons_detected: number;
  phones_detected: number;
  vehicles_detected: number;
  locations_detected: number;
  resolved: number;
  ambiguous: number;
  unresolved: number;
}

export interface AnalyzeFIRResponse {
  case_id: string;
  document_id: string;
  raw_text: string;
  mentions: EntityMention[];
  resolutions: PersonResolutionItem[];
  metrics: AnalyzeFIRMetrics;
}

export interface ServiceHealth {
  status: 'online' | 'offline' | string;
  service?: string;
  version?: string;
  indexed_people?: number;
  message?: string;
}
