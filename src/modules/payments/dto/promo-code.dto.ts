import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidatePromoCodeDto {
  @ApiProperty({ description: 'Promo code to validate' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Order subtotal before discount' })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Service type (flights, hotels, visa, hajj)' })
  @IsString()
  @IsOptional()
  serviceType?: string;
}

export class PromoCodeResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  code?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  type?: 'percentage' | 'fixed';

  @ApiPropertyOptional()
  value?: number;

  @ApiPropertyOptional()
  discountAmount?: number;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  minOrderAmount?: number;
}
