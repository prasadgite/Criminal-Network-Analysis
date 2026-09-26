import { mockDataSource } from '@/services/mock';

export interface DashboardOverview {
  totalCases: number;
  openCases: number;
  highSeverityCases: number;
  totalPersons: number;
  totalRelationships: number;
  activeAlerts: number;
  recentCaseIds: string[];
}

class DashboardService {
  async getOverview(): Promise<DashboardOverview> {
    const [
      cases,
      persons,
      relationships,
      alerts,
    ] = await Promise.all([
      mockDataSource.getAll('cases'),
      mockDataSource.getAll('persons'),
      mockDataSource.getAll('relationships'),
      mockDataSource.getAll('alerts'),
    ]);

    return {
      totalCases: cases.length,

      openCases: cases.filter(
        (item) => item.caseStatus === 'open',
      ).length,

      highSeverityCases: cases.filter(
        (item) => item.severity === 'high',
      ).length,

      totalPersons: persons.length,

      totalRelationships: relationships.length,

      activeAlerts: alerts.filter(
        (item) =>
          item.status === 'new' ||
          item.status === 'acknowledged',
      ).length,

      recentCaseIds: cases
        .slice(-5)
        .map((item) => item.caseId),
    };
  }
}

export const dashboardService =
  new DashboardService();
