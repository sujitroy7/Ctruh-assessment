export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
