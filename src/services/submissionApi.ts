import { authApi } from './http';
import type { ApiResponse, EntityId, Restaurant, SubmissionStatus } from '../types';
import type { CreateServerSubmissionInput, ServerSubmission } from '../types/submission';

export const submissionAPI = {
  createSubmission: async (payload: CreateServerSubmissionInput): Promise<ApiResponse<ServerSubmission>> =>
    (await authApi.post('/api/submissions', payload)).data,
  listSubmissions: async (status?: SubmissionStatus): Promise<ApiResponse<ServerSubmission[]>> =>
    (await authApi.get('/api/submissions', { params: { status } })).data,
  updateSubmission: async (id: EntityId, payload: { status: 'rejected' }): Promise<ApiResponse<ServerSubmission>> =>
    (await authApi.put(`/api/submissions/${id}`, payload)).data,
  approveSubmission: async (id: EntityId): Promise<ApiResponse<Restaurant>> =>
    (await authApi.post(`/api/submissions/${id}/approve`)).data,
  deleteSubmission: async (id: EntityId): Promise<number> =>
    (await authApi.delete(`/api/submissions/${id}`)).status,
};
