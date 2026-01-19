import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ApplyPromoDto {
  @ApiProperty({ example: 'SAVE10' })
  @IsString()
  @Length(3, 20)
  code: string;
}
