import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { HotelsService } from './hotels.service';
import { BookingComService } from './providers/booking-com.service';
import { Public } from '../auth/decorators/public.decorator';
import { SearchHotelsDto } from './dto/search-hotels.dto';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly bookingComService: BookingComService,
  ) {}

  @Post('search')
  @Public()
  @ApiOperation({ summary: 'Search for hotels' })
  @ApiResponse({ status: 200, description: 'Hotel search results' })
  async search(@Body() dto: SearchHotelsDto) {
    return this.hotelsService.search(dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get hotel details' })
  @ApiResponse({ status: 200, description: 'Hotel details' })
  async getHotel(@Param('id') hotelId: string) {
    return this.hotelsService.getHotel(hotelId);
  }

  @Get('destinations/search')
  @Public()
  @ApiOperation({ summary: 'Search destinations' })
  @ApiResponse({ status: 200, description: 'Destination search results' })
  async searchDestinations(@Query('query') query: string) {
    return this.hotelsService.searchDestinations(query);
  }

  // ============ Booking.com Endpoints (RapidAPI) ============

  @Get('booking/destinations')
  @Public()
  @ApiOperation({ summary: 'Search destinations using Booking.com' })
  @ApiResponse({ status: 200, description: 'Destination search results' })
  async searchBookingDestinations(@Query('query') query: string) {
    return this.bookingComService.searchDestinations(query);
  }

  @Post('booking/search')
  @Public()
  @ApiOperation({ summary: 'Search hotels using Booking.com (real data)' })
  @ApiResponse({ status: 200, description: 'Hotel search results from Booking.com' })
  async searchHotelsBooking(
    @Body()
    dto: {
      destId: string;
      destType: 'city' | 'region' | 'landmark' | 'hotel';
      checkIn: string;
      checkOut: string;
      adults: number;
      children?: number;
      childrenAges?: number[];
      rooms?: number;
      currency?: string;
      filterByStar?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: 'popularity' | 'price' | 'review_score' | 'distance';
    },
  ) {
    return this.bookingComService.searchHotels({
      ...dto,
      currency: dto.currency || 'SAR',
      locale: 'en-gb',
    });
  }

  @Get('booking/:id')
  @Public()
  @ApiOperation({ summary: 'Get hotel details from Booking.com' })
  @ApiResponse({ status: 200, description: 'Hotel details' })
  async getBookingHotel(
    @Param('id') hotelId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('adults') adults: string,
  ) {
    return this.bookingComService.getHotelDetails(
      hotelId,
      checkIn,
      checkOut,
      parseInt(adults) || 2,
    );
  }

  @Get('booking/:id/rooms')
  @Public()
  @ApiOperation({ summary: 'Get room availability from Booking.com' })
  @ApiResponse({ status: 200, description: 'Room availability' })
  async getBookingRooms(
    @Param('id') hotelId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('adults') adults: string,
    @Query('rooms') rooms?: string,
    @Query('currency') currency?: string,
  ) {
    return this.bookingComService.getRoomAvailability(
      hotelId,
      checkIn,
      checkOut,
      parseInt(adults) || 2,
      rooms ? parseInt(rooms) : 1,
      currency || 'AED',
    );
  }

  @Get('booking/:id/reviews')
  @Public()
  @ApiOperation({ summary: 'Get hotel reviews from Booking.com' })
  @ApiResponse({ status: 200, description: 'Hotel reviews' })
  async getBookingReviews(
    @Param('id') hotelId: string,
    @Query('page') page?: string,
  ) {
    return this.bookingComService.getHotelReviews(hotelId, 'en-gb', page ? parseInt(page) : 0);
  }
}
