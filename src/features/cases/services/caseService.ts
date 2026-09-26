import { caseDomainService } from '@/domain/investigation/services/caseDomainService';
import type {
  InvestigationCase,
  CaseStatus,
  CasePriority,
} from '@/domain/investigation/case';

export interface CaseListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: CaseStatus;
  priority?: CasePriority;
}

export interface CaseListResult {
  items: InvestigationCase[];
  page: number;
  pageSize: number;
  total: number;
}

class CaseService {
  async list(params: CaseListParams = {}): Promise<CaseListResult> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    const offset = (page - 1) * pageSize;

    const response = await caseDomainService.list({
      search: params.search,
      status: params.status,
      priority: params.priority,
      limit: pageSize,
      offset,
    });

    return {
      items: response.data,
      page,
      pageSize,
      total: response.total,
    };
  }

  async getById(
    caseId: string,
  ): Promise<InvestigationCase | null> {
    return caseDomainService.getById(caseId);
  }
}

export const caseService = new CaseService();
