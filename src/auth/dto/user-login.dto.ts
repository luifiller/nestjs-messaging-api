import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

/**
 * User Login DTO
 *
 * @description
 * DTO for user authentication requests. Contains user credentials
 * required for login with validation rules.
 *
 * @validation
 * - All fields are required (not empty)
 * - Username must be a string
 * - Email must be a valid email format
 * - Password must meet strong password requirements
 */
export class UserLoginDto {
  @IsString({ message: 'Username is required' })
  @ApiProperty({
    type: 'string',
    example: 'luifiller',
    description: 'The username of the user',
    required: true,
  })
  username: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @ApiProperty({
    type: 'string',
    example: 'lui@example.com',
    description: 'The email of the user',
    required: true,
  })
  email: string;

  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 6 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol',
    },
  )
  @ApiProperty({
    type: 'string',
    example: '@Password123',
    description:
      'The password of the user. Must be at least 6 characters long and include at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    minLength: 6,
    required: true,
  })
  password: string;
}
