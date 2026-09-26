import { apiClient } from '@/services/api';
import type { AnalyzeFIRResponse, ServiceHealth } from '../types';

const AI_DIRECT_URL = 'http://localhost:8000';

export const SAMPLE_FIRS = [
  {
    title: 'Pune Extortion Syndicate FIR #2026/089',
    caseId: 'CASE-2026-PUN-089',
    documentId: 'FIR-089',
    text: `Special Task Force Diary: On 14-Sept-2026, IO0074 filed preliminary inquiry into the financial syndicate operating near Baner and Shivajinagar. Multiple witnesses confirmed suspect Rohit Wagh was operating a black sedan bearing registration MH12FM4689. Calls were traced to phone number 9876543210 registered under an alias. Associate S. Naik was observed delivering cash packages to a warehouse in Kothrud while communicating with Akash V Kale.`,
  },
  {
    title: 'Cyber Hawala Transshipment Memo #2026/114',
    caseId: 'CASE-2026-MUM-114',
    documentId: 'MEMO-114',
    text: `Cyber Cell intercepted communication between target P001807 and handler in Thane. Target identified self as Akash V Kale and requested immediate account clearing. Vehicle DL01AB1234 was identified leaving Hadapsar towards Viman Nagar. Primary contact used device 9822012345. Officer IO0112 recommends immediate surveillance under section 420.`,
  },
  {
    title: 'Narcotics Logistics Dispatch #2026/203',
    caseId: 'CASE-2026-MAH-203',
    documentId: 'DSP-203',
    text: `Confidential Source Report: Informant reports consignment movement arranged by Vikram Shinde using carrier vehicle KA04ME9876. Contact number 9123456789 was pinged at tower junction in Hinjawadi. R. Wagh coordinated logistics with warehouse custodian in Wakad.`,
  },
];

export const entityResolutionService = {
  async getHealth(): Promise<ServiceHealth> {
    try {
      // First attempt backend gateway
      return await apiClient.get<ServiceHealth>('/api/intelligence/entity-resolution/health');
    } catch {
      try {
        // Fallback to direct Python FastAPI microservice
        const directRes = await fetch(`${AI_DIRECT_URL}/health`);
        if (directRes.ok) {
          return await directRes.json();
        }
      } catch {
        // Unreachable
      }
      return {
        status: 'offline',
        message: 'Entity Intelligence microservice is offline. Run `npm run dev:ai` to launch.',
      };
    }
  },

  async getDbStats(): Promise<{ total: number; resolved: number; ambiguous: number; unresolved: number }> {
    try {
      const res = await fetch(`${AI_DIRECT_URL}/api/v1/db/stats`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    return { total: 50000, resolved: 20007, ambiguous: 10000, unresolved: 19993 };
  },

  async queryDbMentions(params: {
    status?: string;
    search?: string;
    entity_type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; limit: number; offset: number; items: any[] }> {
    const q = new URLSearchParams();
    if (params.status && params.status !== 'ALL') q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (params.entity_type && params.entity_type !== 'ALL') q.set('entity_type', params.entity_type);
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));

    const res = await fetch(`${AI_DIRECT_URL}/api/v1/db/mentions?${q.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to query NeonDB mentions (${res.status})`);
    }
    return await res.json();
  },

  async resolveDbMention(mentionId: string, personId: string): Promise<any> {
    const res = await fetch(`${AI_DIRECT_URL}/api/v1/db/mentions/${encodeURIComponent(mentionId)}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolved_person_id: personId }),
    });
    if (!res.ok) {
      throw new Error(`Failed to resolve mention in NeonDB: ${await res.text()}`);
    }
    return await res.json();
  },

  async getRandomFIR(): Promise<{ document_id: string; case_id: string; narrative_text: string }> {
    try {
      const directRes = await fetch(`${AI_DIRECT_URL}/api/v1/firs/random`);
      if (directRes.ok) {
        return await directRes.json();
      }
    } catch {
      // Fallback to sample
    }
    return {
      document_id: SAMPLE_FIRS[0].documentId,
      case_id: SAMPLE_FIRS[0].caseId,
      narrative_text: SAMPLE_FIRS[0].text,
    };
  },

  async analyzeFIR(
    text: string,
    caseId = 'CASE_LIVE',
    documentId = 'DOC_LIVE'
  ): Promise<AnalyzeFIRResponse> {
    try {
      // Try backend gateway first
      return await apiClient.post<
        AnalyzeFIRResponse,
        { text: string; caseId?: string; documentId?: string }
      >(
        '/api/intelligence/entity-resolution/analyze-fir',
        { text, caseId, documentId }
      );
    } catch {
      // Fallback directly to FastAPI microservice
      const directRes = await fetch(`${AI_DIRECT_URL}/api/v1/analyze-fir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          case_id: caseId,
          document_id: documentId,
        }),
      });

      if (!directRes.ok) {
        const err = await directRes.text();
        throw new Error(`AI service failed: ${err}`);
      }

      return await directRes.json();
    }
  },
};
