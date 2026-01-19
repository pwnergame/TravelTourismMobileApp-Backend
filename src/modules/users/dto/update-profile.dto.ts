import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  Length,
  IsIn,
  IsUrl,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'John' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;

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

  @ApiProperty({ required: false, example: 'SAR' })
  @IsOptional()
  @IsIn(['SAR', 'USD', 'EUR', 'GBP', 'AED'])
  preferredCurrency?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;
}
