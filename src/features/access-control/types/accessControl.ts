export type AccessRequestStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export type AssignedRole =
  | 'CYBER_CELL_ADMIN'
  | 'SENIOR_INVESTIGATOR'
  | 'INVESTIGATOR'
  | 'ANALYST'
  | 'AUDITOR';

export interface AccessRequestSummary {
  id: number;
  applicationNumber: string;
  fullName: string;
  officialId: string;
  officialEmail: string;
  officialPhone: string;
  organization: string;
  department: string;
  designation: string;
  rank?: string;
  jurisdiction: string;
  officeUnit?: string;
  supervisorName: string;
  supervisorId: string;
  purpose: string;
  status: AccessRequestStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
}

export interface AccessRequestStats {
  pending: number;
  underReview: number;
  approved: number;
  moreInfoRequired: number;
  rejected: number;
  total: number;
}

export interface PaginatedAccessRequests {
  data: AccessRequestSummary[];
  total: number;
  limit: number;
  offset: number;
  stats: AccessRequestStats;
}

export interface AccessRequestQueryParams {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ReviewAccessRequestPayload {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_INFORMATION' | 'UNDER_REVIEW';
  role?: AssignedRole;
  reviewNotes?: string;
}

export interface ReviewResponse {
  message: string;
  accessRequest: AccessRequestSummary;
  user?: {
    id: number;
    official_id: string;
    email: string;
    full_name: string;
    role: string;
    status: string;
  };
}
