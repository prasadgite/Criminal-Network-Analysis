import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  investigatorId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  activationCode!: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  newPassword!: string;
}
