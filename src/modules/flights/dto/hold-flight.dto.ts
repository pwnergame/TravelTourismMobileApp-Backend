import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class HoldFlightDto {
  @ApiProperty({ default: 30, description: 'Hold duration in minutes' })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(60)
  holdDuration?: number = 30;
}
