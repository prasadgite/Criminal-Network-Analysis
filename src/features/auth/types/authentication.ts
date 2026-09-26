export type AccessRequestStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "MORE_INFORMATION_REQUIRED"
  | "CANCELLED";

export interface AccessRequestPayload {
  fullName: string;
  officialId: string;
  officialEmail: string;
  officialPhone: string;
  organization: string;
  department: string;
  designation: string;
  rank: string;
  jurisdiction: string;
  officeUnit: string;
  supervisorName: string;
  supervisorId: string;
  purpose: string;
  authorizationDocument?: string;
}

export interface AccessRequestResponse {
  applicationNumber: string;
  status: AccessRequestStatus;
  submittedAt: string;
}

export interface AccessRequestStatusResponse {
  applicationNumber: string;
  status: AccessRequestStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}
