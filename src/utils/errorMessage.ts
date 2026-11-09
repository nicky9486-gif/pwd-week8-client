import axios from 'axios';

export function messageOf(error: unknown): string {
  if (axios.isAxiosError<{ message?: string; error?: { message?: string } }>(error)) {
    return error.response?.data?.message ?? error.response?.data?.error?.message
      ?? error.message;
  }
  return error instanceof Error ? error.message : '요청에 실패했습니다. 다시 시도하세요.';
}
