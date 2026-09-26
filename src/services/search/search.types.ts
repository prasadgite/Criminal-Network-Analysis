import type { EntityType } from '@/types';

export type SearchResultType =
  | EntityType
  | 'case'
  | 'evidence'
  | 'finding';

export interface SearchParams {
  query: string;
  limit?: number;
  types?: SearchResultType[];
}

export interface SearchResult {
  id: string;
  type: SearchResultType;
  label: string;
  secondaryLabel?: string;
  relevance?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}
