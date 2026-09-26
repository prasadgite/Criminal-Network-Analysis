import type { InvestigationContext } from '@/types';

export const mockInvestigations: InvestigationContext[] = [
  {
    investigationId: 'INV-17001',
    caseId: 'CASE-2026-001',
    primaryEntityId: 'P-1001',
    selectedEntityIds: [
      'P-1001',
      'P-1002',
      'PH-2001',
      'PH-2002',
    ],
    selectedRelationshipIds: [
      'REL-9001',
      'REL-9002',
    ],
    activeView: 'overview',
    createdAt: '2026-09-16T09:15:00+05:30',
    updatedAt: '2026-09-16T09:15:00+05:30',
  },
];
