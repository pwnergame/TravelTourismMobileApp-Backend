import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TripType {
  ONE_WAY = 'one_way',
  ROUND_TRIP = 'round_trip',
  MULTI_CITY = 'multi_city',
}

export enum CabinClass {
  ECONOMY = 'ECONOMY',
  PREMIUM_ECONOMY = 'PREMIUM_ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST',
}

class PassengersDto {
  @ApiProperty({ default: 1, minimum: 1, maximum: 9 })
  @IsInt()
  @Min(1)
  @Max(9)
  adults: number = 1;

  @ApiProperty({ default: 0, minimum: 0, maximum: 8 })
  @IsInt()
  @Min(0)
  @Max(8)
  children: number = 0;

  @ApiProperty({ default: 0, minimum: 0, maximum: 4 })
  @IsInt()
  @Min(0)
  @Max(4)
  infants: number = 0;
}

export class SearchFlightsDto {
  @ApiProperty({ example: 'RUH', description: 'Origin airport IATA code' })
  @IsString()
  @Length(3, 3)
  origin: string;

  @ApiProperty({ example: 'JED', description: 'Destination airport IATA code' })
  @IsString()
  @Length(3, 3)
  destination: string;

  @ApiProperty({ example: '2024-03-15' })
  @IsDateString()
  departureDate: string;

  @ApiProperty({ required: false, example: '2024-03-22' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiProperty({ enum: TripType, default: TripType.ROUND_TRIP })
  @IsEnum(TripType)
  tripType: TripType = TripType.ROUND_TRIP;

  @ApiProperty({ type: PassengersDto })
  @ValidateNested()
  @Type(() => PassengersDto)
  passengers: PassengersDto;

  @ApiProperty({ enum: CabinClass, required: false })
  @IsOptional()
  @IsEnum(CabinClass)
  cabinClass?: CabinClass;

  @ApiProperty({ required: false, default: 'SAR' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
