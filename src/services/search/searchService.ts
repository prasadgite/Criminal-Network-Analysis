import { mockDataSource } from '@/services/mock';
import type {
  BankAccount,
  Case,
  Person,
  Phone,
  Vehicle,
  Location,
} from '@/types';

import type {
  SearchParams,
  SearchResponse,
  SearchResult,
  SearchResultType,
} from './search.types';

function normalize(value: unknown): string {
  return String(value ?? '').toLowerCase().trim();
}

function matchesQuery(
  query: string,
  values: unknown[],
): boolean {
  const normalizedQuery = normalize(query);

  return values.some((value) =>
    normalize(value).includes(normalizedQuery),
  );
}

class SearchService {
  async search(params: SearchParams): Promise<SearchResponse> {
    const query = params.query.trim();

    if (!query) {
      return {
        query,
        results: [],
        total: 0,
      };
    }

    const limit = params.limit ?? 20;
    const allowedTypes = params.types;

    const results: SearchResult[] = [];

    const include = (type: SearchResultType): boolean => {
      return !allowedTypes || allowedTypes.includes(type);
    };

    if (include('person')) {
      const persons = await mockDataSource.getAll('persons');

      results.push(
        ...persons
          .filter((person: Person) =>
            matchesQuery(query, [
              person.personId,
              person.fullName,
              person.aliasName,
              person.email,
            ]),
          )
          .map((person) => ({
            id: person.personId,
            type: 'person' as const,
            label: person.fullName,
            secondaryLabel: person.personId,
            relevance: 1,
          })),
      );
    }

    if (include('phone')) {
      const phones = await mockDataSource.getAll('phones');

      results.push(
        ...phones
          .filter((phone: Phone) =>
            matchesQuery(query, [
              phone.phoneId,
              phone.phoneNumber,
              phone.countryCode,
              phone.carrier,
            ]),
          )
          .map((phone) => ({
            id: phone.phoneId,
            type: 'phone' as const,
            label: phone.phoneNumber,
            secondaryLabel: phone.phoneId,
            relevance: 0.95,
          })),
      );
    }

    if (include('vehicle')) {
      const vehicles = await mockDataSource.getAll('vehicles');

      results.push(
        ...vehicles
          .filter((vehicle: Vehicle) =>
            matchesQuery(query, [
              vehicle.vehicleId,
              vehicle.registrationNumber,
              vehicle.make,
              vehicle.model,
              vehicle.color,
            ]),
          )
          .map((vehicle) => ({
            id: vehicle.vehicleId,
            type: 'vehicle' as const,
            label: vehicle.registrationNumber,
            secondaryLabel: `${vehicle.make} ${vehicle.model}`,
            relevance: 0.9,
          })),
      );
    }

    if (include('bank_account')) {
      const accounts = await mockDataSource.getAll('bankAccounts');

      results.push(
        ...accounts
          .filter((account: BankAccount) =>
            matchesQuery(query, [
              account.accountId,
              account.accountNumberMasked,
              account.bankName,
            ]),
          )
          .map((account) => ({
            id: account.accountId,
            type: 'bank_account' as const,
            label: account.accountNumberMasked,
            secondaryLabel: account.bankName,
            relevance: 0.9,
          })),
      );
    }

    if (include('location')) {
      const locations = await mockDataSource.getAll('locations');

      results.push(
        ...locations
          .filter((location: Location) =>
            matchesQuery(query, [
              location.locationId,
              location.locationName,
              location.address,
              location.area,
              location.city,
            ]),
          )
          .map((location) => ({
            id: location.locationId,
            type: 'location' as const,
            label: location.locationName,
            secondaryLabel: location.city,
            relevance: 0.85,
          })),
      );
    }

    if (include('case')) {
      const cases = await mockDataSource.getAll('cases');

      results.push(
        ...cases
          .filter((item: Case) =>
            matchesQuery(query, [
              item.caseId,
              item.firNumber,
              item.caseType,
              item.crimeCategory,
              item.crimeSubcategory,
            ]),
          )
          .map((item) => ({
            id: item.caseId,
            type: 'case' as const,
            label: item.caseId,
            secondaryLabel: item.firNumber,
            relevance: 0.95,
          })),
      );
    }

    results.sort(
      (a, b) => (b.relevance ?? 0) - (a.relevance ?? 0),
    );

    const limitedResults = results.slice(0, limit);

    return {
      query,
      results: limitedResults,
      total: results.length,
    };
  }
}

export const searchService = new SearchService();
