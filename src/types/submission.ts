import type { EntityId, SubmissionStatus } from './index';
export interface CreateServerSubmissionInput {
  restaurantName: string;
  category: string;
  location: string;
  priceRange?: string;
  recommendedMenu?: string[];
  review?: string;
}
// 제보자 UUID·표시 정보와 검토 정보는 클라이언트가 보내지 않고 서버가 결정합니다.
export interface ServerSubmission extends CreateServerSubmissionInput {
  id: EntityId;
  status: SubmissionStatus;
  submitterId: string;
  submitterName: string;
  submitterEmail: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ServerSubmissionForm {
  restaurantName: string;
  category: string;
  location: string;
  priceRange: string;
  recommendedMenu: string;
  review: string;
}
