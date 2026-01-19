import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class GuestsDto {
  @ApiProperty({ default: 2 })
  @IsInt()
  @Min(1)
  @Max(10)
  adults: number = 2;

  @ApiProperty({ default: 0 })
  @IsInt()
  @Min(0)
  @Max(6)
  children: number = 0;

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  childrenAges?: number[];
}

export class SearchHotelsDto {
  @ApiProperty({ example: 'riyadh' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2024-03-15' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2024-03-18' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ default: 1 })
  @IsInt()
  @Min(1)
  @Max(10)
  rooms: number = 1;

  @ApiProperty({ type: GuestsDto })
  @ValidateNested()
  @Type(() => GuestsDto)
  guests: GuestsDto;

  @ApiProperty({ required: false, default: 'SAR' })
  @IsOptional()
  @IsString()
  currency?: string;
}
