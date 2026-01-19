import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { FlightsService } from './flights.service';
import { SkyScrapperService } from './providers/sky-scrapper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

import { SearchFlightsDto } from './dto/search-flights.dto';
import { HoldFlightDto } from './dto/hold-flight.dto';

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(
    private readonly flightsService: FlightsService,
    private readonly skyScrapperService: SkyScrapperService,
  ) {}

  @Post('search')
  @Public()
  @ApiOperation({ summary: 'Search for flights' })
  @ApiResponse({ status: 200, description: 'Flight search results' })
  async search(@Body() dto: SearchFlightsDto) {
    return this.flightsService.search(dto);
  }

  @Get('offers/:id')
  @Public()
  @ApiOperation({ summary: 'Get flight offer details' })
  @ApiResponse({ status: 200, description: 'Flight offer details' })
  async getOffer(@Param('id') offerId: string) {
    return this.flightsService.getOffer(offerId);
  }

  @Post('offers/:id/hold')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hold a flight offer' })
  @ApiResponse({ status: 200, description: 'Flight held successfully' })
  async holdOffer(
    @CurrentUser() user: User,
    @Param('id') offerId: string,
    @Body() dto: HoldFlightDto,
  ) {
    return this.flightsService.holdOffer(user.id, offerId, dto);
  }

  @Get('airports')
  @Public()
  @ApiOperation({ summary: 'Search airports' })
  @ApiResponse({ status: 200, description: 'Airport search results' })
  async searchAirports(@Query('q') query: string) {
    return this.flightsService.searchAirports(query);
  }

  @Get('airlines')
  @Public()
  @ApiOperation({ summary: 'Get airline information' })
  @ApiResponse({ status: 200, description: 'Airline list' })
  async getAirlines(@Query('codes') codes?: string) {
    return this.flightsService.getAirlines(codes?.split(','));
  }

  // ============ Sky-Scrapper Endpoints (RapidAPI) ============

  @Get('skyscrapper/locations')
  @Public()
  @ApiOperation({ summary: 'Search locations using Sky-Scrapper' })
  @ApiResponse({ status: 200, description: 'Location search results' })
  async searchLocations(@Query('query') query: string) {
    return this.skyScrapperService.searchLocations(query);
  }

  @Post('skyscrapper/search')
  @Public()
  @ApiOperation({ summary: 'Search flights using Sky-Scrapper (real data)' })
  @ApiResponse({ status: 200, description: 'Flight search results from Skyscanner' })
  async searchFlightsSkyScrapper(
    @Body()
    dto: {
      originSkyId: string;
      destinationSkyId: string;
      originEntityId?: string;
      destinationEntityId?: string;
      date: string;
      returnDate?: string;
      cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
      adults?: number;
      children?: number;
      infants?: number;
      currency?: string;
    },
  ) {
    return this.skyScrapperService.searchFlights({
      ...dto,
      currency: dto.currency || 'SAR',
      market: 'SA',
      locale: 'en-US',
    });
  }

  @Get('skyscrapper/details')
  @Public()
  @ApiOperation({ summary: 'Get flight details from Sky-Scrapper' })
  @ApiResponse({ status: 200, description: 'Flight details' })
  async getFlightDetails(
    @Query('itineraryId') itineraryId: string,
    @Query('legs') legs: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.skyScrapperService.getFlightDetails(
      itineraryId,
      JSON.parse(legs),
      sessionId,
    );
  }
}
