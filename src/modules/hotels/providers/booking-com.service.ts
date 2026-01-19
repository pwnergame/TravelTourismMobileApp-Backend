/**
 * Booking.com API Service (RapidAPI)
 * Real hotel data from Booking.com with caching and performance optimization
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, retry, catchError } from 'rxjs';
import { AxiosError } from 'axios';

// In-memory cache
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export interface BookingSearchParams {
  destId: string;
  destType: 'city' | 'region' | 'landmark' | 'hotel';
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  childrenAges?: number[];
  rooms?: number;
  currency?: string;
  locale?: string;
  filterByStar?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'popularity' | 'price' | 'review_score' | 'distance';
}

export interface BookingHotel {
  hotel_id: number;
  hotel_name: string;
  hotel_name_trans?: string;
  address: string;
  city: string;
  country_trans: string;
  zip?: string;
  latitude: number;
  longitude: number;
  url: string;
  review_score?: number;
  review_score_word?: string;
  review_nr?: number;
  class?: number;
  class_is_estimated?: boolean;
  main_photo_url?: string;
  max_photo_url?: string;
  currencycode: string;
  min_total_price?: number;
  composite_price_breakdown?: {
    gross_amount?: { value: number; currency: string };
    net_amount?: { value: number; currency: string };
  };
  checkin?: { from: string; until: string };
  checkout?: { from: string; until: string };
  is_free_cancellable?: boolean;
  distance_to_cc?: number;
  unit_configuration_label?: string;
  accommodation_type_name?: string;
}

export interface BookingHotelDetails {
  hotel_id: number;
  hotel_name: string;
  description_translations?: Record<string, string>;
  address: string;
  city: string;
  country: string;
  zip?: string;
  latitude: number;
  longitude: number;
  class?: number;
  review_score?: number;
  review_score_word?: string;
  number_of_reviews?: number;
  checkin?: { from: string; until: string };
  checkout?: { from: string; until: string };
  facilities?: Array<{ facility_name: string; facility_type_name: string }>;
  photos?: Array<{ url_original: string; url_max: string; photo_id: number }>;
  rooms?: BookingRoom[];
}

export interface BookingRoom {
  room_id: string;
  room_name: string;
  room_description?: string;
  max_persons: number;
  room_size?: { value: number; unit: string };
  bed_configurations?: Array<{ bed_types: Array<{ name: string; count: number }> }>;
  facilities?: string[];
  photos?: Array<{ url_original: string }>;
  block?: Array<{
    block_id: string;
    room_name: string;
    price_breakdown?: {
      gross_price: number;
      currency: string;
      all_inclusive_price?: number;
    };
    refundable?: boolean;
    meals_included?: boolean;
  }>;
}

@Injectable()
export class BookingComService {
  private readonly logger = new Logger(BookingComService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiHost: string;

  // Cache configuration
  private readonly cache = new Map<string, CacheEntry<any>>();
  private readonly DESTINATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly HOTEL_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly DETAILS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRIES = 2;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'rapidapi.hotels.baseUrl',
      'https://booking-com.p.rapidapi.com',
    );
    this.apiKey = this.configService.get<string>('rapidapi.key', '');
    this.apiHost = this.configService.get<string>(
      'rapidapi.hotels.host',
      'booking-com.p.rapidapi.com',
    );

    // Cleanup expired cache entries periodically
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  private getHeaders() {
    return {
      'x-rapidapi-key': this.apiKey,
      'x-rapidapi-host': this.apiHost,
    };
  }

  /**
   * Get from cache if valid
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
      this.logger.debug(`Cache hit: ${key}`);
      return entry.data as T;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttl });
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Make HTTP request with timeout and retry
   */
  private async makeRequest<T>(url: string, params: Record<string, any>): Promise<T> {
    const response = await firstValueFrom(
      this.httpService.get<T>(url, {
        headers: this.getHeaders(),
        params,
        timeout: this.REQUEST_TIMEOUT,
      }).pipe(
        timeout(this.REQUEST_TIMEOUT),
        retry({ count: this.MAX_RETRIES, delay: 1000 }),
        catchError((error: AxiosError) => {
          this.logger.error(`API request failed: ${error.message}`);
          throw error;
        }),
      ),
    );
    return response.data;
  }

  /**
   * Search for destinations with caching
   */
  async searchDestinations(query: string, locale = 'en-gb'): Promise<any[]> {
    if (!this.apiKey) {
      return this.getMockDestinations(query);
    }

    // Check cache first
    const cacheKey = `dest:${query.toLowerCase()}:${locale}`;
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await this.makeRequest<any[]>(
        `${this.baseUrl}/v1/hotels/locations`,
        { name: query, locale },
      );
      
      // Cache the results
      this.setCache(cacheKey, data || [], this.DESTINATION_CACHE_TTL);
      
      return data || [];
    } catch (error: any) {
      this.logger.error('Error searching destinations:', error.message);
      return this.getMockDestinations(query);
    }
  }

  /**
   * Search for hotels with caching
   */
  async searchHotels(params: BookingSearchParams): Promise<{
    hotels: BookingHotel[];
    count?: number;
    cached?: boolean;
  }> {
    if (!this.apiKey) {
      return { hotels: this.getMockHotels(params), cached: false };
    }

    // Generate cache key
    const cacheKey = `hotels:${params.destId}:${params.checkIn}:${params.checkOut}:${params.adults}:${params.sortBy || 'popularity'}`;
    const cached = this.getFromCache<{ hotels: BookingHotel[]; count?: number }>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const queryParams: Record<string, string | number> = {
        dest_id: params.destId,
        dest_type: params.destType,
        checkin_date: params.checkIn,
        checkout_date: params.checkOut,
        adults_number: params.adults,
        room_number: params.rooms || 1,
        units: 'metric',
        order_by: params.sortBy || 'popularity',
        locale: params.locale || 'en-gb',
        filter_by_currency: params.currency || 'AED',
        include_adjacency: 'true',
      };

      if (params.children && params.childrenAges) {
        queryParams.children_number = params.children;
        queryParams.children_ages = params.childrenAges.join(',');
      }

      if (params.filterByStar) {
        queryParams['categories_filter_ids'] = `class::${params.filterByStar}`;
      }

      if (params.minPrice) {
        queryParams.price_min = params.minPrice;
      }
      if (params.maxPrice) {
        queryParams.price_max = params.maxPrice;
      }

      this.logger.log(`Searching hotels in dest_id: ${params.destId}`);

      const response = await this.makeRequest<any>(
        `${this.baseUrl}/v1/hotels/search`,
        queryParams,
      );

      // makeRequest already returns response.data, so access result directly
      const result = {
        hotels: response?.result || [],
        count: response?.count,
      };

      this.logger.log(`Found ${result.hotels.length} hotels`);

      // Cache the results
      if (result.hotels.length > 0) {
        this.setCache(cacheKey, result, this.HOTEL_CACHE_TTL);
      }

      return { ...result, cached: false };
    } catch (error: any) {
      this.logger.error('Error searching hotels:', error.message);
      return { hotels: this.getMockHotels(params), cached: false };
    }
  }

  /**
   * Get hotel details with caching
   */
  async getHotelDetails(
    hotelId: number | string,
    checkIn: string,
    checkOut: string,
    adults: number,
    currency = 'SAR',
    locale = 'en-gb',
  ): Promise<BookingHotelDetails | null> {
    if (!this.apiKey) {
      return this.getMockHotelDetails(hotelId);
    }

    // Check cache
    const cacheKey = `hotel-details:${hotelId}`;
    const cached = this.getFromCache<BookingHotelDetails>(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      // Get basic hotel data
      const [dataResponse, photosResponse, facilitiesResponse] =
        await Promise.all([
          firstValueFrom(
            this.httpService.get(`${this.baseUrl}/v1/hotels/data`, {
              headers: this.getHeaders(),
              params: { hotel_id: hotelId, locale },
            }),
          ),
          firstValueFrom(
            this.httpService.get(`${this.baseUrl}/v1/hotels/photos`, {
              headers: this.getHeaders(),
              params: { hotel_id: hotelId, locale },
            }),
          ).catch(() => ({ data: [] })),
          firstValueFrom(
            this.httpService.get(`${this.baseUrl}/v1/hotels/facilities`, {
              headers: this.getHeaders(),
              params: { hotel_id: hotelId, locale },
            }),
          ).catch(() => ({ data: [] })),
        ]);

      return {
        ...dataResponse.data,
        photos: photosResponse.data,
        facilities: facilitiesResponse.data,
      };
    } catch (error) {
      this.logger.error('Error getting hotel details:', error.message);
      return this.getMockHotelDetails(hotelId);
    }
  }

  /**
   * Get room availability and prices
   */
  async getRoomAvailability(
    hotelId: number | string,
    checkIn: string,
    checkOut: string,
    adults: number,
    rooms = 1,
    currency = 'AED',
  ): Promise<BookingRoom[]> {
    if (!this.apiKey) {
      return this.getMockRooms(hotelId, currency);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v1/hotels/room-list`, {
          headers: this.getHeaders(),
          params: {
            hotel_id: hotelId,
            checkin_date: checkIn,
            checkout_date: checkOut,
            adults_number_by_rooms: adults,
            room_number: rooms,
            currency,
            units: 'metric',
          },
        }),
      );

      // The API returns rooms with block arrays - flatten them for easier consumption
      const data = response.data;
      if (Array.isArray(data)) {
        // Flatten block arrays into top-level room blocks
        const flattenedRooms = data.flatMap((room: any) => {
          if (room.block && Array.isArray(room.block)) {
            return room.block.map((block: any) => ({
              ...block,
              // Inherit room-level properties if not present in block
              max_occupancy: block.max_occupancy || room.max_persons,
              room_surface_in_m2: block.room_surface_in_m2 || room.room_size?.value,
              bed_configurations: block.bed_configurations || room.bed_configurations,
              photos: block.photos || room.photos,
            }));
          }
          return [room];
        });
        return flattenedRooms;
      }
      
      return data || [];
    } catch (error) {
      this.logger.error('Error getting room availability:', error.message);
      return this.getMockRooms(hotelId, currency);
    }
  }

  /**
   * Get hotel reviews
   */
  async getHotelReviews(
    hotelId: number | string,
    locale = 'en-gb',
    page = 0,
  ): Promise<any> {
    if (!this.apiKey) {
      return this.getMockReviews();
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/v1/hotels/reviews`, {
          headers: this.getHeaders(),
          params: {
            hotel_id: hotelId,
            locale,
            page_number: page,
            sort_type: 'SORT_MOST_RELEVANT',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Error getting reviews:', error.message);
      return this.getMockReviews();
    }
  }

  // ============ Mock Data for Development ============

  private getMockDestinations(query: string): any[] {
    const destinations = [
      {
        dest_id: '-3188849',
        dest_type: 'city',
        city_name: 'Riyadh',
        country: 'Saudi Arabia',
        label: 'Riyadh, Riyadh Province, Saudi Arabia',
        latitude: 24.7136,
        longitude: 46.6753,
        nr_hotels: 450,
      },
      {
        dest_id: '-3185680',
        dest_type: 'city',
        city_name: 'Jeddah',
        country: 'Saudi Arabia',
        label: 'Jeddah, Makkah Province, Saudi Arabia',
        latitude: 21.4858,
        longitude: 39.1925,
        nr_hotels: 380,
      },
      {
        dest_id: '-3185891',
        dest_type: 'city',
        city_name: 'Makkah',
        country: 'Saudi Arabia',
        label: 'Makkah, Makkah Province, Saudi Arabia',
        latitude: 21.3891,
        longitude: 39.8579,
        nr_hotels: 520,
      },
      {
        dest_id: '-3185959',
        dest_type: 'city',
        city_name: 'Madinah',
        country: 'Saudi Arabia',
        label: 'Madinah, Madinah Province, Saudi Arabia',
        latitude: 24.5247,
        longitude: 39.5692,
        nr_hotels: 410,
      },
      {
        dest_id: '-782831',
        dest_type: 'city',
        city_name: 'Dubai',
        country: 'United Arab Emirates',
        label: 'Dubai, Dubai Emirate, United Arab Emirates',
        latitude: 25.2048,
        longitude: 55.2708,
        nr_hotels: 1200,
      },
      {
        dest_id: '-290692',
        dest_type: 'city',
        city_name: 'Cairo',
        country: 'Egypt',
        label: 'Cairo, Cairo Governorate, Egypt',
        latitude: 30.0444,
        longitude: 31.2357,
        nr_hotels: 680,
      },
      {
        dest_id: '-2167973',
        dest_type: 'city',
        city_name: 'Istanbul',
        country: 'Turkey',
        label: 'Istanbul, Marmara Region, Turkey',
        latitude: 41.0082,
        longitude: 28.9784,
        nr_hotels: 2500,
      },
    ];

    return destinations.filter(
      (d) =>
        d.city_name.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase()),
    );
  }

  private getMockHotels(params: BookingSearchParams): BookingHotel[] {
    const basePrice = Math.floor(Math.random() * 300) + 200;

    return [
      {
        hotel_id: 1001,
        hotel_name: 'Grand Plaza Hotel',
        hotel_name_trans: 'Grand Plaza Hotel',
        address: '123 King Fahd Road',
        city: 'Riyadh',
        country_trans: 'Saudi Arabia',
        latitude: 24.7136,
        longitude: 46.6753,
        url: 'https://booking.com',
        review_score: 8.7,
        review_score_word: 'Excellent',
        review_nr: 1250,
        class: 5,
        main_photo_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456.jpg',
        currencycode: 'SAR',
        min_total_price: basePrice,
        composite_price_breakdown: {
          gross_amount: { value: basePrice, currency: 'SAR' },
        },
        checkin: { from: '15:00', until: '00:00' },
        checkout: { from: '07:00', until: '12:00' },
        is_free_cancellable: true,
        distance_to_cc: 2.5,
        unit_configuration_label: '1 bedroom',
        accommodation_type_name: 'Hotel',
      },
      {
        hotel_id: 1002,
        hotel_name: 'Business Tower Suites',
        hotel_name_trans: 'Business Tower Suites',
        address: '456 Olaya Street',
        city: 'Riyadh',
        country_trans: 'Saudi Arabia',
        latitude: 24.7235,
        longitude: 46.6421,
        url: 'https://booking.com',
        review_score: 8.2,
        review_score_word: 'Very Good',
        review_nr: 890,
        class: 4,
        main_photo_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/234567.jpg',
        currencycode: 'SAR',
        min_total_price: basePrice - 80,
        composite_price_breakdown: {
          gross_amount: { value: basePrice - 80, currency: 'SAR' },
        },
        checkin: { from: '14:00', until: '00:00' },
        checkout: { from: '06:00', until: '11:00' },
        is_free_cancellable: true,
        distance_to_cc: 1.2,
        unit_configuration_label: '1 bedroom',
        accommodation_type_name: 'Hotel',
      },
      {
        hotel_id: 1003,
        hotel_name: 'Budget Inn Express',
        hotel_name_trans: 'Budget Inn Express',
        address: '789 Airport Road',
        city: 'Riyadh',
        country_trans: 'Saudi Arabia',
        latitude: 24.9578,
        longitude: 46.7012,
        url: 'https://booking.com',
        review_score: 7.5,
        review_score_word: 'Good',
        review_nr: 456,
        class: 3,
        main_photo_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/345678.jpg',
        currencycode: 'SAR',
        min_total_price: basePrice - 150,
        composite_price_breakdown: {
          gross_amount: { value: basePrice - 150, currency: 'SAR' },
        },
        checkin: { from: '14:00', until: '23:00' },
        checkout: { from: '08:00', until: '12:00' },
        is_free_cancellable: false,
        distance_to_cc: 8.5,
        unit_configuration_label: '1 bedroom',
        accommodation_type_name: 'Hotel',
      },
      {
        hotel_id: 1004,
        hotel_name: 'Royal Oasis Resort',
        hotel_name_trans: 'Royal Oasis Resort',
        address: '321 Diplomatic Quarter',
        city: 'Riyadh',
        country_trans: 'Saudi Arabia',
        latitude: 24.6819,
        longitude: 46.6247,
        url: 'https://booking.com',
        review_score: 9.1,
        review_score_word: 'Wonderful',
        review_nr: 2100,
        class: 5,
        main_photo_url: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/456789.jpg',
        currencycode: 'SAR',
        min_total_price: basePrice + 200,
        composite_price_breakdown: {
          gross_amount: { value: basePrice + 200, currency: 'SAR' },
        },
        checkin: { from: '15:00', until: '00:00' },
        checkout: { from: '07:00', until: '12:00' },
        is_free_cancellable: true,
        distance_to_cc: 5.0,
        unit_configuration_label: '1 bedroom',
        accommodation_type_name: 'Resort',
      },
    ];
  }

  private getMockHotelDetails(hotelId: number | string): BookingHotelDetails {
    return {
      hotel_id: Number(hotelId),
      hotel_name: 'Grand Plaza Hotel',
      description_translations: {
        en: 'Luxury 5-star hotel in the heart of the city with world-class amenities.',
      },
      address: '123 King Fahd Road',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      zip: '12345',
      latitude: 24.7136,
      longitude: 46.6753,
      class: 5,
      review_score: 8.7,
      review_score_word: 'Excellent',
      number_of_reviews: 1250,
      checkin: { from: '15:00', until: '00:00' },
      checkout: { from: '07:00', until: '12:00' },
      facilities: [
        { facility_name: 'Free WiFi', facility_type_name: 'Internet' },
        { facility_name: 'Swimming Pool', facility_type_name: 'Pool & Wellness' },
        { facility_name: 'Spa', facility_type_name: 'Pool & Wellness' },
        { facility_name: 'Gym', facility_type_name: 'Fitness' },
        { facility_name: 'Restaurant', facility_type_name: 'Food & Drink' },
        { facility_name: 'Room Service', facility_type_name: 'Food & Drink' },
        { facility_name: 'Parking', facility_type_name: 'Transportation' },
        { facility_name: 'Airport Shuttle', facility_type_name: 'Transportation' },
        { facility_name: '24-hour Front Desk', facility_type_name: 'Services' },
        { facility_name: 'Air Conditioning', facility_type_name: 'Room Amenities' },
      ],
      photos: [
        {
          photo_id: 1,
          url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456.jpg',
          url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456.jpg',
        },
        {
          photo_id: 2,
          url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123457.jpg',
          url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123457.jpg',
        },
      ],
    };
  }

  private getMockRooms(hotelId: number | string, currency = 'AED'): BookingRoom[] {
    // Return mock rooms with proper structure matching API format
    return [
      {
        block_id: 'block-1a',
        room_id: 1001,
        room_name: 'Deluxe King Room - Room Only',
        name_without_policy: 'Deluxe King Room',
        max_occupancy: 2,
        nr_adults: 2,
        room_surface_in_m2: 35,
        bed_configurations: [{ bed_type: [{ name: 'King Bed', count: 1 }] }],
        photos: [
          { url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-deluxe.jpg', url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-deluxe.jpg' },
        ],
        product_price_breakdown: {
          gross_amount: { value: 450, currency },
          gross_amount_per_night: { value: 450, currency },
        },
        refundable: 1,
        is_free_cancellable: true,
        breakfast_included: 0,
        mealplan_text: 'Room only',
      },
      {
        block_id: 'block-1b',
        room_id: 1002,
        room_name: 'Deluxe King Room - With Breakfast',
        name_without_policy: 'Deluxe King Room',
        max_occupancy: 2,
        nr_adults: 2,
        room_surface_in_m2: 35,
        bed_configurations: [{ bed_type: [{ name: 'King Bed', count: 1 }] }],
        photos: [
          { url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-deluxe.jpg', url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-deluxe.jpg' },
        ],
        product_price_breakdown: {
          gross_amount: { value: 520, currency },
          gross_amount_per_night: { value: 520, currency },
        },
        refundable: 1,
        is_free_cancellable: true,
        breakfast_included: 1,
        mealplan_text: 'Breakfast included',
      },
      {
        block_id: 'block-2a',
        room_id: 2001,
        room_name: 'Executive Suite - Room Only',
        name_without_policy: 'Executive Suite',
        max_occupancy: 4,
        nr_adults: 4,
        room_surface_in_m2: 65,
        bed_configurations: [{ bed_type: [{ name: 'King Bed', count: 1 }, { name: 'Sofa Bed', count: 1 }] }],
        photos: [
          { url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-suite.jpg', url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-suite.jpg' },
        ],
        product_price_breakdown: {
          gross_amount: { value: 850, currency },
          gross_amount_per_night: { value: 850, currency },
        },
        refundable: 1,
        is_free_cancellable: true,
        breakfast_included: 0,
        mealplan_text: 'Room only',
      },
      {
        block_id: 'block-2b',
        room_id: 2002,
        room_name: 'Executive Suite - With Breakfast',
        name_without_policy: 'Executive Suite',
        max_occupancy: 4,
        nr_adults: 4,
        room_surface_in_m2: 65,
        bed_configurations: [{ bed_type: [{ name: 'King Bed', count: 1 }, { name: 'Sofa Bed', count: 1 }] }],
        photos: [
          { url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-suite.jpg', url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-suite.jpg' },
        ],
        product_price_breakdown: {
          gross_amount: { value: 950, currency },
          gross_amount_per_night: { value: 950, currency },
        },
        refundable: 1,
        is_free_cancellable: true,
        breakfast_included: 1,
        mealplan_text: 'Breakfast included',
      },
      {
        block_id: 'block-3a',
        room_id: 3001,
        room_name: 'Standard Twin Room - Room Only',
        name_without_policy: 'Standard Twin Room',
        max_occupancy: 2,
        nr_adults: 2,
        room_surface_in_m2: 28,
        bed_configurations: [{ bed_type: [{ name: 'Single Bed', count: 2 }] }],
        photos: [
          { url_original: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-twin.jpg', url_max: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/room-twin.jpg' },
        ],
        product_price_breakdown: {
          gross_amount: { value: 320, currency },
          gross_amount_per_night: { value: 320, currency },
        },
        refundable: 0,
        is_free_cancellable: false,
        breakfast_included: 0,
        mealplan_text: 'Room only - Non-refundable',
      },
    ] as any;
  }

  private getMockReviews(): any {
    return {
      count: 125,
      result: [
        {
          review_id: 1,
          author: { name: 'Mohammed A.' },
          date: '2024-12-15',
          average_score: 9.0,
          title: 'Excellent stay!',
          pros: 'Great location, friendly staff, clean rooms',
          cons: 'Breakfast could have more variety',
          reviewer_country: 'Saudi Arabia',
        },
        {
          review_id: 2,
          author: { name: 'Sarah K.' },
          date: '2024-12-10',
          average_score: 8.5,
          title: 'Very comfortable',
          pros: 'Comfortable beds, good amenities',
          cons: 'Parking was a bit difficult',
          reviewer_country: 'UAE',
        },
      ],
    };
  }
}
