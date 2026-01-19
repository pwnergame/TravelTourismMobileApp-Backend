import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { HotelSearch } from './entities/hotel-search.entity';
import { SearchHotelsDto } from './dto/search-hotels.dto';

@Injectable()
export class HotelsService {
  private readonly logger = new Logger(HotelsService.name);

  constructor(
    @InjectRepository(HotelSearch)
    private readonly searchRepository: Repository<HotelSearch>,
  ) {}

  async search(dto: SearchHotelsDto): Promise<any> {
    const searchId = uuidv4();

    // Store search
    const search = this.searchRepository.create({
      id: searchId,
      destination: dto.destination,
      checkIn: new Date(dto.checkIn),
      checkOut: new Date(dto.checkOut),
      rooms: dto.rooms,
      guests: dto.guests,
    });

    await this.searchRepository.save(search);

    // Mock response - integrate with Hotelbeds or similar in production
    return {
      searchId,
      hotels: this.getMockHotels(dto),
    };
  }

  async getHotel(hotelId: string): Promise<any> {
    // Mock hotel details
    return {
      id: hotelId,
      name: 'Grand Luxury Hotel',
      description: 'A luxurious 5-star hotel in the heart of the city',
      rating: 5,
      address: {
        street: '123 Main Street',
        city: 'Riyadh',
        country: 'Saudi Arabia',
      },
      amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'parking'],
      images: [
        'https://example.com/hotel1.jpg',
        'https://example.com/hotel2.jpg',
      ],
      rooms: [
        {
          id: 'room-1',
          name: 'Deluxe Room',
          description: 'Spacious room with city view',
          price: { amount: 500, currency: 'SAR' },
          capacity: 2,
          amenities: ['wifi', 'minibar', 'safe'],
        },
        {
          id: 'room-2',
          name: 'Suite',
          description: 'Luxury suite with separate living area',
          price: { amount: 1200, currency: 'SAR' },
          capacity: 4,
          amenities: ['wifi', 'minibar', 'safe', 'jacuzzi'],
        },
      ],
    };
  }

  async searchDestinations(query: string): Promise<any[]> {
    const destinations = [
      { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', type: 'city' },
      { id: 'jeddah', name: 'Jeddah', country: 'Saudi Arabia', type: 'city' },
      { id: 'makkah', name: 'Makkah', country: 'Saudi Arabia', type: 'city' },
      { id: 'madinah', name: 'Madinah', country: 'Saudi Arabia', type: 'city' },
      { id: 'dubai', name: 'Dubai', country: 'UAE', type: 'city' },
      { id: 'cairo', name: 'Cairo', country: 'Egypt', type: 'city' },
    ];

    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase()),
    );
  }

  private getMockHotels(dto: SearchHotelsDto): any[] {
    return [
      {
        id: 'hotel-1',
        name: 'Grand Luxury Hotel',
        rating: 5,
        price: { amount: 500, currency: 'SAR', perNight: true },
        location: dto.destination,
        image: 'https://example.com/hotel1.jpg',
        amenities: ['wifi', 'pool', 'spa'],
      },
      {
        id: 'hotel-2',
        name: 'Business Inn',
        rating: 4,
        price: { amount: 350, currency: 'SAR', perNight: true },
        location: dto.destination,
        image: 'https://example.com/hotel2.jpg',
        amenities: ['wifi', 'gym', 'restaurant'],
      },
      {
        id: 'hotel-3',
        name: 'Budget Stay',
        rating: 3,
        price: { amount: 180, currency: 'SAR', perNight: true },
        location: dto.destination,
        image: 'https://example.com/hotel3.jpg',
        amenities: ['wifi', 'parking'],
      },
    ];
  }
}
