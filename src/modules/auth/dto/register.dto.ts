import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  Length,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ required: false, example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, example: 'SA' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  nationality?: string;

  @ApiProperty({ required: false, example: 'en' })
  @IsOptional()
  @IsIn(['en', 'ar'])
  preferredLanguage?: string;
}
