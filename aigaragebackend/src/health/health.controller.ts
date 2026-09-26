import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async getHealth() {
    const startTime = Date.now();
    try {
      const pingRes = await this.db.query('SELECT NOW() as current_time, current_database(), current_user;');
      const latencyMs = Date.now() - startTime;

      const countsRes = await this.db.query(`
        SELECT 
          (SELECT COUNT(*) FROM persons) as persons,
          (SELECT COUNT(*) FROM cases) as cases,
          (SELECT COUNT(*) FROM phones) as phones,
          (SELECT COUNT(*) FROM cdr_records) as cdr_records,
          (SELECT COUNT(*) FROM transactions) as transactions,
          (SELECT COUNT(*) FROM case_entities) as case_entities,
          (SELECT COUNT(*) FROM location_events) as location_events,
          (SELECT COUNT(*) FROM evidence) as evidence;
      `);

      return {
        status: 'ok',
        platform: 'SANDHAAN Criminal Network Intelligence Platform',
        timestamp: new Date().toISOString(),
        database: {
          status: 'connected',
          latencyMs,
          databaseName: pingRes.rows[0].current_database,
          user: pingRes.rows[0].current_user,
          records: {
            persons: parseInt(countsRes.rows[0].persons, 10),
            cases: parseInt(countsRes.rows[0].cases, 10),
            phones: parseInt(countsRes.rows[0].phones, 10),
            cdrRecords: parseInt(countsRes.rows[0].cdr_records, 10),
            transactions: parseInt(countsRes.rows[0].transactions, 10),
            caseEntities: parseInt(countsRes.rows[0].case_entities, 10),
            locationEvents: parseInt(countsRes.rows[0].location_events, 10),
            evidence: parseInt(countsRes.rows[0].evidence, 10),
          },
        },
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        database: {
          status: 'error',
          error: err.message,
        },
      };
    }
  }
}
