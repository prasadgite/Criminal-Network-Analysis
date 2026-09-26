import { apiClient } from '@/services/api/apiClient';
import type { TimelineEvent, TimelineEventType } from '../timeline';

export interface TimelineQueryParams {
  caseId?: string;
  entityId?: string;
  eventType?: TimelineEventType;
  limit?: number;
}

export class TimelineDomainService {
  async getTimeline(params: TimelineQueryParams = {}): Promise<{
    data: TimelineEvent[];
    total: number;
  }> {
    return apiClient.get('/api/intelligence/timeline', {
      caseId: params.caseId,
      entityId: params.entityId,
      eventType: params.eventType,
      limit: params.limit ?? 50,
    });
  }
}

export const timelineDomainService = new TimelineDomainService();
