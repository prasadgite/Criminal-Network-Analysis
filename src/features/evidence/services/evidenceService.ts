import {
  evidenceDomainService,
  type EvidenceQueryParams,
} from "@/domain/investigation/services/evidenceDomainService";

import type {
  InvestigationEvidence,
  EvidenceType,
} from "@/domain/investigation/evidence";

export interface EvidenceListParams {
  caseId?: string;
  type?: EvidenceType | string;
  limit?: number;
  offset?: number;
}

export interface EvidenceListResult {
  data: InvestigationEvidence[];
  total: number;
}

export interface EvidenceSummaryMetrics {
  totalEvidence: number;
  loadedEvidence: number;
  verifiedCount: number;
  collectedCount: number;
  intactIntegrityCount: number;
  caseCount: number;
  topType: string;
  topTypeCount: number;
  typeDistribution: Record<string, number>;
}

class EvidenceService {
  /**
   * Queries evidence from NeonDB via evidenceDomainService
   */
  async listEvidence(
    params: EvidenceListParams = {},
  ): Promise<EvidenceListResult> {
    const query: EvidenceQueryParams = {
      caseId: params.caseId?.trim() || undefined,
      type: (params.type && params.type !== "ALL" && params.type !== "All Types")
        ? (params.type as EvidenceType)
        : undefined,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    };

    return evidenceDomainService.list(query);
  }

  /**
   * Fetches full evidence details by evidence ID, including links from evidence_links
   */
  async getEvidenceById(
    evidenceId: string,
  ): Promise<InvestigationEvidence | null> {
    if (!evidenceId) return null;
    return evidenceDomainService.getById(evidenceId.trim());
  }

  // Compatibility helpers
  async list(params: EvidenceListParams = {}): Promise<InvestigationEvidence[]> {
    const res = await this.listEvidence(params);
    return res.data;
  }

  async getById(evidenceId: string): Promise<InvestigationEvidence | null> {
    return this.getEvidenceById(evidenceId);
  }

  async listByCase(caseId: string): Promise<InvestigationEvidence[]> {
    const res = await this.listEvidence({ caseId, limit: 100 });
    return res.data;
  }

  /**
   * Computes forensic intelligence metrics for the loaded evidence set
   */
  computeSummary(
    evidenceList: InvestigationEvidence[],
    totalEvidence: number = evidenceList.length,
  ): EvidenceSummaryMetrics {
    const typeCounts: Record<string, number> = {};
    const cases = new Set<string>();

    let verifiedCount = 0;
    let collectedCount = 0;
    let intactIntegrityCount = 0;

    for (const item of evidenceList) {
      const type = (item.evidenceType || "other").toLowerCase();
      typeCounts[type] = (typeCounts[type] || 0) + 1;

      if (item.caseId) {
        cases.add(item.caseId);
      }

      if (item.status === "verified") {
        verifiedCount++;
      } else {
        collectedCount++;
      }

      const meta = item.metadata ?? {};
      const origHash = (meta.original_hash_sha256 || meta.originalHashSha256) as string | undefined;
      const currHash = (meta.current_hash_sha256 || meta.currentHashSha256) as string | undefined;
      const integrityStatus = (meta.integrity_status || meta.integrityStatus) as string | undefined;

      if (
        (origHash && currHash && origHash === currHash) ||
        (integrityStatus && integrityStatus.toLowerCase() === "intact")
      ) {
        intactIntegrityCount++;
      }
    }

    let topType = "N/A";
    let topTypeCount = 0;
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > topTypeCount) {
        topType = type;
        topTypeCount = count;
      }
    }

    return {
      totalEvidence,
      loadedEvidence: evidenceList.length,
      verifiedCount,
      collectedCount,
      intactIntegrityCount,
      caseCount: cases.size,
      topType,
      topTypeCount,
      typeDistribution: typeCounts,
    };
  }
}

export const evidenceService = new EvidenceService();
