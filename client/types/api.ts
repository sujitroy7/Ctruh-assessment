export interface PaginationReqeustParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = T | ApiErrorResponse;

export interface IdempotencyKey {
  idempotency_key: string;
}
