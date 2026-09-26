import { IsOptional, IsString } from 'class-validator';

export class AccessRequestQueryDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  limit?: number | string;

  @IsOptional()
  offset?: number | string;
}
