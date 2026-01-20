import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '../entities/sub-booking.entity';

export class SubBookingDto {
  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bookingReference?: string;

  @ApiProperty()
  details: Record<string, any>;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  travelers?: string[];

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serviceDate?: string;
}

export class CreateOrderDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  quoteId?: string;

  @ApiProperty({ type: [SubBookingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubBookingDto)
  items: SubBookingDto[];

  @ApiProperty()
  @IsNumber()
  subtotal: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  taxes?: number;

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Order status: pending, confirmed, under_review' })
  @IsString()
  @IsOptional()
  status?: string;
}
