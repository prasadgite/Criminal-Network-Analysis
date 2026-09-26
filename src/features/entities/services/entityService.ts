import { mockDataSource } from '@/services/mock';
import type {
  BankAccount,
  Location,
  Person,
  Phone,
  Vehicle,
} from '@/types';
import { searchService } from '@/services/search';

export type EntityRecord =
  | Person
  | Phone
  | Vehicle
  | BankAccount
  | Location;

class EntityService {
  async search(query: string) {
    return searchService.search({
      query,
      limit: 20,
    });
  }

  async getPerson(
    personId: string,
  ): Promise<Person | undefined> {
    return mockDataSource.findById(
      'persons',
      personId,
      'personId',
    );
  }

  async getPhone(
    phoneId: string,
  ): Promise<Phone | undefined> {
    return mockDataSource.findById(
      'phones',
      phoneId,
      'phoneId',
    );
  }

  async getVehicle(
    vehicleId: string,
  ): Promise<Vehicle | undefined> {
    return mockDataSource.findById(
      'vehicles',
      vehicleId,
      'vehicleId',
    );
  }

  async getBankAccount(
    accountId: string,
  ): Promise<BankAccount | undefined> {
    return mockDataSource.findById(
      'bankAccounts',
      accountId,
      'accountId',
    );
  }

  async getLocation(
    locationId: string,
  ): Promise<Location | undefined> {
    return mockDataSource.findById(
      'locations',
      locationId,
      'locationId',
    );
  }
}

export const entityService = new EntityService();
