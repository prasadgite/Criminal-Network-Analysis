export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface OffsetPaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface OffsetPaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

