import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class EntityResolutionService {
  private readonly logger = new Logger(EntityResolutionService.name);
  private readonly baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  async getHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) {
        return { status: 'offline', message: `AI Service returned HTTP ${res.status}` };
      }
      return await res.json();
    } catch (err: any) {
      this.logger.warn(`AI service unreachable at ${this.baseUrl}: ${err.message}`);
      return {
        status: 'offline',
        message: 'Entity Intelligence microservice is currently unreachable. Start it with `npm run dev:ai`.',
      };
    }
  }

  async extractEntities(text: string, documentId?: string, caseId?: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          document_id: documentId || 'DOC_LIVE',
          case_id: caseId || 'CASE_LIVE',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI Service extraction failed (${res.status}): ${errorText}`);
      }

      return await res.json();
    } catch (err: any) {
      this.logger.error(`Error during entity extraction: ${err.message}`);
      throw new ServiceUnavailableException(
        `Entity Intelligence service is unavailable: ${err.message}`
      );
    }
  }

  async analyzeFIR(text: string, caseId?: string, documentId?: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/analyze-fir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          case_id: caseId || 'CASE_LIVE',
          document_id: documentId || 'DOC_LIVE',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI Service analysis failed (${res.status}): ${errorText}`);
      }

      return await res.json();
    } catch (err: any) {
      this.logger.error(`Error during FIR analysis: ${err.message}`);
      throw new ServiceUnavailableException(
        `Entity Intelligence service is unavailable: ${err.message}`
      );
    }
  }

  async getPerson(personId: string) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/persons/${encodeURIComponent(personId)}`);
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch (err: any) {
      this.logger.error(`Error looking up person ${personId}: ${err.message}`);
      return null;
    }
  }
}
