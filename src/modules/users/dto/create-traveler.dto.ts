import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  Length,
  IsEnum,
  IsBoolean,
  IsPhoneNumber,
} from 'class-validator';
import { Gender, TravelerType } from '../entities/traveler-profile.entity';

export class CreateTravelerDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ required: false, example: 'Michael' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  middleName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'SA' })
  @IsString()
  @Length(2, 2)
  nationality: string;

  @ApiProperty({ required: false, example: 'A12345678' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiProperty({ required: false, example: '2030-01-15' })
  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @ApiProperty({ required: false, example: 'SA' })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  passportIssuingCountry?: string;

  @ApiProperty({ required: false, example: '1234567890' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ required: false, example: 'traveler@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '+966501234567' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiProperty({ enum: TravelerType, default: TravelerType.ADULT })
  @IsOptional()
  @IsEnum(TravelerType)
  type?: TravelerType;
}
