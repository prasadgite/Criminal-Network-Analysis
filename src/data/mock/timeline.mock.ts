import type { TimelineEvent } from '@/types';

export const mockTimelineEvents: TimelineEvent[] = [
  {
    eventId: 'TL-19001',
    eventType: 'cdr',
    timestamp: '2026-09-15T09:15:00+05:30',
    title: 'Phone communication event',
    description:
      'Communication event between PH-2001 and PH-2002.',
    sourceRecordId: 'CDR-7001',
    entityIds: [
      'PH-2001',
      'PH-2002',
    ],
    locationId: 'LOC-5001',
    confidence: 0.98,
  },

  {
    eventId: 'TL-19002',
    eventType: 'transaction',
    timestamp: '2026-09-16T16:30:00+05:30',
    title: 'Financial transaction',
    description:
      'Account transfer between ACC-4002 and ACC-4001.',
    sourceRecordId: 'TX-8002',
    entityIds: [
      'ACC-4002',
      'ACC-4001',
    ],
    locationId: 'LOC-5002',
    confidence: 0.99,
  },

  {
    eventId: 'TL-19003',
    eventType: 'evidence',
    timestamp: '2026-09-12T10:00:00+05:30',
    title: 'Evidence collected',
    description:
      'CDR export collected for investigation.',
    sourceRecordId: 'EVD-13001',
    caseId: 'CASE-2026-001',
    confidence: 1,
  },
];
