import {
  mockDatabase,
  type MockDatabase,
} from '@/data/mock';

export class MockDataSource {
  private readonly database: MockDatabase;

  constructor(database: MockDatabase) {
    this.database = database;
  }

  get data(): MockDatabase {
    return this.database;
  }

  async getAll<T extends keyof MockDatabase>(
    collection: T,
  ): Promise<MockDatabase[T]> {
    return this.database[collection];
  }

  async findById<T extends keyof MockDatabase>(
    collection: T,
    id: string,
    idField: keyof MockDatabase[T][number],
  ): Promise<MockDatabase[T][number] | undefined> {
    const records = this.database[collection] as unknown as readonly Record<
      string,
      unknown
    >[];

    return records.find((record) => record[idField as string] === id) as
      | MockDatabase[T][number]
      | undefined;
  }
}

export const mockDataSource = new MockDataSource(mockDatabase);
