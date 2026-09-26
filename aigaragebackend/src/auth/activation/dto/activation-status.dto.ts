import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ActivationStatusDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  investigatorId!: string;
}
