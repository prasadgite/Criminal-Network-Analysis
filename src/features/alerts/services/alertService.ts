import { mockDataSource } from '@/services/mock';
import type { IntelligenceAlert } from '@/types';

class AlertService {
  async list(): Promise<IntelligenceAlert[]> {
    return mockDataSource.getAll('alerts');
  }

  async getById(
    alertId: string,
  ): Promise<IntelligenceAlert | undefined> {
    return mockDataSource.findById(
      'alerts',
      alertId,
      'alertId',
    );
  }
}

export const alertService = new AlertService();
