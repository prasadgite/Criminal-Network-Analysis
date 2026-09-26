import type { InvestigationNetwork } from '@/types';

export const mockNetworks: InvestigationNetwork[] = [
  {
    networkId: 'NET-18001',
    name: 'CASE-2026-001 Network',
    entityIds: [
      'P-1001',
      'P-1002',
      'PH-2001',
      'PH-2002',
      'V-3001',
      'ACC-4001',
      'ACC-4002',
    ],
    relationshipIds: [
      'REL-9001',
      'REL-9002',
      'REL-9003',
      'REL-9004',
    ],
    caseIds: [
      'CASE-2026-001',
    ],
    createdAt: '2026-09-16T09:20:00+05:30',
    updatedAt: '2026-09-16T09:20:00+05:30',
  },
];
