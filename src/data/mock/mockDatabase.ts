import { mockAlerts } from './alerts.mock';
import { mockBankAccounts } from './bankAccounts.mock';
import { mockCdrRecords } from './cdrRecords.mock';
import { mockCases } from './cases.mock';
import { mockCellTowers } from './cellTowers.mock';
import { mockEvidence, mockEvidenceLinks } from './evidence.mock';
import { mockFindings } from './findings.mock';
import { mockFirNarratives, mockEntityMentions } from './documents.mock';
import { mockInvestigations } from './investigations.mock';
import { mockLocationEvents } from './locationEvents.mock';
import { mockLocations } from './locations.mock';
import { mockNetworks } from './networks.mock';
import { mockPersonGroundTruth } from './entityResolution.mock';
import { mockPersons } from './persons.mock';
import { mockPhones } from './phones.mock';
import { mockRelationships } from './relationships.mock';
import { mockTimelineEvents } from './timeline.mock';
import { mockTransactions } from './transactions.mock';
import { mockVehicles } from './vehicles.mock';

export const mockDatabase = {
  persons: mockPersons,
  phones: mockPhones,
  vehicles: mockVehicles,
  bankAccounts: mockBankAccounts,

  cases: mockCases,
  relationships: mockRelationships,

  cdrRecords: mockCdrRecords,
  transactions: mockTransactions,

  locations: mockLocations,
  cellTowers: mockCellTowers,
  locationEvents: mockLocationEvents,

  firNarratives: mockFirNarratives,
  entityMentions: mockEntityMentions,

  evidence: mockEvidence,
  evidenceLinks: mockEvidenceLinks,

  findings: mockFindings,
  alerts: mockAlerts,

  investigations: mockInvestigations,
  networks: mockNetworks,

  personGroundTruth: mockPersonGroundTruth,
  timeline: mockTimelineEvents,
  timelineEvents: mockTimelineEvents,
} as const;

export type MockDatabase = typeof mockDatabase;
