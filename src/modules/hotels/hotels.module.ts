import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';
import { BookingComService } from './providers/booking-com.service';
import { HotelSearch } from './entities/hotel-search.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HotelSearch]),
    HttpModule,
  ],
  controllers: [HotelsController],
  providers: [HotelsService, BookingComService],
  exports: [HotelsService, BookingComService],
})
export class HotelsModule {}
