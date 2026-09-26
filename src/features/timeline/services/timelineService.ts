import { timelineDomainService } from '@/domain/investigation/services/timelineDomainService';
import type { TimelineEvent, TimelineEventType } from '@/domain/investigation/timeline';

export interface TimelineParams {
  caseId?: string;
  entityId?: string;
  eventType?: TimelineEventType;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

class TimelineService {
  async list(params: TimelineParams = {}): Promise<TimelineEvent[]> {
    const limit = params.limit ?? 50;

    const response = await timelineDomainService.getTimeline({
      caseId: params.caseId?.trim() || undefined,
      entityId: params.entityId?.trim() || undefined,
      eventType: params.eventType || undefined,
      limit,
    });

    let items = response.data;

    // Client-side date-range filtering to preserve verified backend query contract
    if (params.startDate) {
      const startMs = new Date(params.startDate).getTime();
      if (!Number.isNaN(startMs)) {
        items = items.filter((ev) => new Date(ev.timestamp).getTime() >= startMs);
      }
    }

    if (params.endDate) {
      const endMs = new Date(params.endDate).getTime();
      if (!Number.isNaN(endMs)) {
        // Set to end of the day if date only string
        const adjustedEnd = params.endDate.includes('T') ? endMs : endMs + 86400000;
        items = items.filter((ev) => new Date(ev.timestamp).getTime() <= adjustedEnd);
      }
    }

    return items;
  }
}

export const timelineService = new TimelineService();
