export type ToastVariant = 'success' | 'error' | 'warning';

export interface ToastPayload {
  message: string;
  type: ToastVariant;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  toast?: ToastPayload;
}

