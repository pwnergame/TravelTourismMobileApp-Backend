import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  IsEnum,
} from 'class-validator';

export enum OtpMethod {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export class StartOtpDto {
  @ApiProperty({ required: false, example: '+966501234567' })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ required: false, example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: OtpMethod, default: OtpMethod.SMS })
  @IsEnum(OtpMethod)
  @IsOptional()
  method?: OtpMethod = OtpMethod.SMS;
}
