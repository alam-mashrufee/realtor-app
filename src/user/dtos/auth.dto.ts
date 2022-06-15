import { UserType } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
export class SignupDto {
  @IsString()
  @IsNotEmpty({
    message: 'Name must not be empty',
  })
  name: string;

  @Matches(/(\d{2,3})\-?(\d{3,4})\-?(\d{4})/, {
    message: 'Phone must be a valid phone number',
  })
  phone: string;

  @IsEmail({
    message: 'Email must be a valid email',
  })
  email: string;

  @IsString()
  @MinLength(5, {
    message: 'Password must be of minimum length of 5',
  })
  password: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  productKey?: string;
}

export class SigninDto {
  @IsEmail({
    message: 'Email must be a valid email',
  })
  email: string;

  @IsString()
  password: string;
}

export class GenerateProductKeyDto {
  @IsEmail({
    message: 'Email must be a valid email',
  })
  email: string;

  @IsEnum(UserType)
  userType: UserType;
}
