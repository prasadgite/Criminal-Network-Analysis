import { mockDataSource } from '@/services/mock';
import type { InvestigationContext } from '@/types';

class InvestigationService {
  async list(): Promise<InvestigationContext[]> {
    return mockDataSource.getAll('investigations');
  }

  async getById(
    investigationId: string,
  ): Promise<InvestigationContext | undefined> {
    return mockDataSource.findById(
      'investigations',
      investigationId,
      'investigationId',
    );
  }

  async getByCase(
    caseId: string,
  ): Promise<InvestigationContext[]> {
    const investigations = await this.list();

    return investigations.filter(
      (investigation) =>
        investigation.caseId === caseId,
    );
  }
}

export const investigationService =
  new InvestigationService();
