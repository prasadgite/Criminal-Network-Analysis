export type DataMode = 'mock' | 'api';

const dataMode =
  (import.meta.env.VITE_DATA_MODE as DataMode | undefined) ?? 'mock';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? '';

export const runtimeConfig = {
  dataMode,
  apiBaseUrl,
} as const;
