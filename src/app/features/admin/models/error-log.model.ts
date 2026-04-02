/**
 * error-log.model.ts
 *
 * Data shapes for the error_logs table.
 */

export interface ErrorLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  endpoint: string;
  httpMethod: string;
  requestPayload: Record<string, unknown> | null;
  errorType: string;
  errorMessage: string;
  stackTrace: string | null;
  httpStatus: number | null;
  userFacingError: string | null;
  platform: string | null;
  deployTarget: string | null;
  nodeVersion: string | null;
  marketsCount: number | null;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedNote: string | null;
  createdAt: string;
}

export interface ErrorLogStats {
  total: number;
  unresolved: number;
  last24h: number;
  byType: Record<string, number>;
  byEndpoint: Record<string, number>;
  byPlatform: Record<string, number>;
}

export interface ErrorLogListResponse {
  errors: ErrorLog[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorLogFilters {
  page?: number;
  limit?: number;
  resolved?: boolean;
  errorType?: string;
  platform?: string;
}
