import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AssignedRole } from './access-request-status.enum';

export type ReviewAction = 'APPROVE' | 'REJECT' | 'REQUEST_INFORMATION' | 'UNDER_REVIEW';

export class ReviewAccessRequestDto {
  @IsString()
  @IsNotEmpty()
  action: ReviewAction;

  @IsOptional()
  @IsEnum(AssignedRole)
  role?: AssignedRole;

  @IsOptional()
  @IsString()
  reviewNotes?: string;
}
