import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';
import { AmadeusService } from './providers/amadeus.service';
import { SkyScrapperService } from './providers/sky-scrapper.service';

import { FlightSearch } from './entities/flight-search.entity';
import { FlightOffer } from './entities/flight-offer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlightSearch, FlightOffer]),
    HttpModule,
  ],
  controllers: [FlightsController],
  providers: [FlightsService, AmadeusService, SkyScrapperService],
  exports: [FlightsService, SkyScrapperService],
})
export class FlightsModule {}
