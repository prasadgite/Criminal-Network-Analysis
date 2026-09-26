import {
  findingDomainService,
  type FindingQueryParams,
} from "@/domain/investigation/services/findingDomainService";

import type {
  InvestigationFinding,
  FindingSeverity,
  FindingType,
  FindingDetectionSource,
} from "@/domain/investigation/finding";

export interface FindingListParams {
  caseId?: string;
  limit?: number;
  severity?: FindingSeverity | "ALL";
  findingType?: FindingType | "ALL";
  detectionSource?: FindingDetectionSource | "ALL";
  minConfidence?: number;
  query?: string;
}

export interface FindingListResult {
  data: InvestigationFinding[];
  total: number;
}

export interface FindingSummaryMetrics {
  total: number;
  loaded: number;
  criticalCount: number;
  highCount: number;
  confirmedCount: number;
  avgConfidence: number;
  typeDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
}

class FindingService {
  /**
   * Queries findings from NeonDB backend via findingDomainService
   * and applies frontend filters for attributes not accepted by the backend query contract
   * (severity, findingType, detectionSource, confidence, free-text query).
   */
  async listFindings(
    params: FindingListParams = {},
  ): Promise<FindingListResult> {
    const queryParams: FindingQueryParams = {
      caseId: params.caseId?.trim() || undefined,
      limit: params.limit ?? 50,
    };

    const res = await findingDomainService.getFindings(queryParams);

    let items = res.data;

    // Severity filter
    if (params.severity && params.severity !== "ALL") {
      items = items.filter((f) => f.severity === params.severity);
    }

    // Finding Type filter
    if (params.findingType && params.findingType !== "ALL") {
      items = items.filter((f) => f.findingType === params.findingType);
    }

    // Detection Source filter
    if (params.detectionSource && params.detectionSource !== "ALL") {
      items = items.filter((f) => f.detectionSource === params.detectionSource);
    }

    // Minimum Confidence filter
    if (typeof params.minConfidence === "number" && params.minConfidence > 0) {
      items = items.filter((f) => f.confidence >= params.minConfidence!);
    }

    // Search query filter (matches ID, title, description, entity references)
    if (params.query?.trim()) {
      const q = params.query.toLowerCase().trim();
      items = items.filter((f) => {
        return (
          f.findingId.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.entityReferences.some(
            (e) =>
              e.entityId.toLowerCase().includes(q) ||
              (e.label && e.label.toLowerCase().includes(q)),
          )
        );
      });
    }

    return {
      data: items,
      total: res.total,
    };
  }

  /**
   * Retrieves finding by ID from generated intelligence feed
   */
  async getFindingById(
    findingId: string,
  ): Promise<InvestigationFinding | null> {
    if (!findingId) return null;
    const res = await this.listFindings({ limit: 100 });
    return res.data.find((f) => f.findingId === findingId.trim()) ?? null;
  }

  // Compatibility helpers
  async list(params: FindingListParams = {}): Promise<InvestigationFinding[]> {
    const res = await this.listFindings(params);
    return res.data;
  }

  async getById(findingId: string): Promise<InvestigationFinding | null> {
    return this.getFindingById(findingId);
  }

  async listByCase(caseId: string): Promise<InvestigationFinding[]> {
    const res = await this.listFindings({ caseId });
    return res.data;
  }

  /**
   * Computes intelligence metrics across the loaded findings
   */
  computeSummary(
    findings: InvestigationFinding[],
    serverTotal: number = findings.length,
  ): FindingSummaryMetrics {
    let criticalCount = 0;
    let highCount = 0;
    let confirmedCount = 0;
    let confidenceSum = 0;

    const typeDistribution: Record<string, number> = {};
    const sourceDistribution: Record<string, number> = {};

    for (const f of findings) {
      if (f.severity === "critical") criticalCount++;
      if (f.severity === "high") highCount++;
      if (f.status === "confirmed") confirmedCount++;

      confidenceSum += f.confidence ?? 0;

      const typeKey = f.findingType || "other";
      typeDistribution[typeKey] = (typeDistribution[typeKey] || 0) + 1;

      const srcKey = f.detectionSource || "rule";
      sourceDistribution[srcKey] = (sourceDistribution[srcKey] || 0) + 1;
    }

    const avgConfidence = findings.length > 0
      ? Math.round((confidenceSum / findings.length) * 100)
      : 0;

    return {
      total: serverTotal,
      loaded: findings.length,
      criticalCount,
      highCount,
      confirmedCount,
      avgConfidence,
      typeDistribution,
      sourceDistribution,
    };
  }
}

export const findingService = new FindingService();
