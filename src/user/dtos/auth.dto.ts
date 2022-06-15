import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  Matches,
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
    message: 'Email must not be a valid email',
  })
  email: string;

  @IsString()
  @MinLength(5, {
    message: 'Password must be of minimum length of 5',
  })
  password: string;
}
