import { runtimeConfig } from '@/config/runtime';
import { getStoredSession, clearStoredSession } from '@/features/auth/services/authStorage';

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  data?: any;

  constructor(message: string, status?: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const base =
      this.baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(cleanPath, base);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, headers, ...fetchOptions } = options;

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    // Automatically attach Bearer token if not provided and valid session exists
    if (!requestHeaders['Authorization'] && typeof window !== 'undefined') {
      const session = getStoredSession();
      if (session?.accessToken) {
        requestHeaders['Authorization'] = `Bearer ${session.accessToken}`;
      }
    }

    const response = await fetch(this.buildUrl(path, params), {
      ...fetchOptions,
      headers: requestHeaders,
    });

    if (!response.ok) {
      // Handle unauthorized session expiration (except for login itself)
      if (response.status === 401 && !path.includes('/auth/login')) {
        clearStoredSession();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sandhaan:auth:unauthorized'));
        }
      }
      let message = `Request failed with status ${response.status}`;
      let code: string | undefined;
      let bodyData: any;

      try {
        const body = await response.json();
        bodyData = body;

        if (body?.message) {
          message = Array.isArray(body.message)
            ? body.message.join(', ')
            : body.message;
        }

        code = body?.code;
      } catch {
        // Ignore invalid/non-JSON error responses.
      }

      throw new ApiClientError(message, response.status, code, bodyData);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>(path, {
      method: 'GET',
      params,
    });
  }

  async post<TResponse, TBody>(
    path: string,
    body: TBody,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<TResponse, TBody>(
    path: string,
    body: TBody,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<TResponse, TBody>(
    path: string,
    body: TBody,
  ): Promise<TResponse> {
    return this.request<TResponse>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(runtimeConfig.apiBaseUrl);
