import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  officialId?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export interface AccessRequestPayloadDto {
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
  status: string;
  submittedAt: string;
}

export interface AccessRequestStatusResponse {
  applicationNumber: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface JwtPayload {
  sub: number;
  investigatorId: string;
  role: string;
  clearanceLevel: string;
}

export interface InvestigatorRecord {
  id: number;
  investigator_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: string;
  clearance_level: string;
  status: string;
  must_activate?: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}

export interface AuthenticatedUserDto {
  userId: string;
  displayName: string;
  email?: string;
  role: string;
  clearanceLevel: string;
  permissions: string[];
}

export interface AuthSessionResponse {
  accessToken: string;
  user: AuthenticatedUserDto;
  expiresAt: string;
}
