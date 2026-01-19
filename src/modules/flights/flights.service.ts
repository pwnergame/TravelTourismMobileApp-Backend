import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { AmadeusService } from './providers/amadeus.service';
import { FlightSearch } from './entities/flight-search.entity';
import { FlightOffer } from './entities/flight-offer.entity';

import { SearchFlightsDto, TripType } from './dto/search-flights.dto';
import { HoldFlightDto } from './dto/hold-flight.dto';

export interface FlightSearchResult {
  searchId: string;
  offers: FlightOfferResult[];
  dictionaries: {
    carriers: Record<string, string>;
    aircraft: Record<string, string>;
    locations: Record<string, { cityCode: string; countryCode: string }>;
  };
}

export interface FlightOfferResult {
  id: string;
  price: {
    total: string;
    currency: string;
    base: string;
    fees: { amount: string; type: string }[];
  };
  itineraries: FlightItinerary[];
  travelerPricings: any[];
  validatingAirlineCodes: string[];
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  lastTicketingDate: string;
}

export interface FlightItinerary {
  duration: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    terminal?: string;
    at: string;
  };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating?: { carrierCode: string };
  duration: string;
  numberOfStops: number;
  blacklistedInEU: boolean;
}

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(
    @InjectRepository(FlightSearch)
    private readonly searchRepository: Repository<FlightSearch>,
    @InjectRepository(FlightOffer)
    private readonly offerRepository: Repository<FlightOffer>,
    private readonly amadeusService: AmadeusService,
  ) {}

  async search(dto: SearchFlightsDto): Promise<FlightSearchResult> {
    const searchId = uuidv4();

    // Call Amadeus API
    const results = await this.amadeusService.searchFlights({
      originLocationCode: dto.origin,
      destinationLocationCode: dto.destination,
      departureDate: dto.departureDate,
      returnDate: dto.tripType === TripType.ROUND_TRIP ? dto.returnDate : undefined,
      adults: dto.passengers.adults,
      children: dto.passengers.children,
      infants: dto.passengers.infants,
      travelClass: dto.cabinClass,
      currencyCode: dto.currency || 'SAR',
      max: 50,
    });

    // Store search for analytics
    const search = this.searchRepository.create({
      origin: dto.origin,
      destination: dto.destination,
      departureDate: new Date(dto.departureDate),
      returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,
      tripType: dto.tripType,
      passengers: dto.passengers,
      cabinClass: dto.cabinClass,
      resultsCount: results.data?.length || 0,
    });
    search.id = searchId;

    await this.searchRepository.save(search);

    // Cache offers temporarily
    if (results.data) {
      const offers = results.data.map((offer: any) => {
        const offerEntity = this.offerRepository.create({
          searchId,
          offerData: offer,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        });
        offerEntity.id = offer.id;
        return offerEntity;
      });

      await this.offerRepository.save(offers);
    }

    return {
      searchId,
      offers: results.data || [],
      dictionaries: results.dictionaries || {},
    };
  }

  async getOffer(offerId: string): Promise<FlightOffer> {
    const offer = await this.offerRepository.findOne({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Flight offer not found or expired');
    }

    if (offer.expiresAt < new Date()) {
      throw new NotFoundException('Flight offer has expired');
    }

    return offer;
  }

  async holdOffer(
    userId: string,
    offerId: string,
    dto: HoldFlightDto,
  ): Promise<{ holdId: string; expiresAt: Date }> {
    const offer = await this.getOffer(offerId);

    // In production, call Amadeus to create an order/booking hold
    // For now, we'll simulate the hold

    const holdId = uuidv4();
    const holdDuration = dto.holdDuration || 30;
    const expiresAt = new Date(Date.now() + holdDuration * 60 * 1000);

    offer.holdId = holdId;
    offer.holdExpiresAt = expiresAt;
    offer.holdUserId = userId;

    await this.offerRepository.save(offer);

    return { holdId, expiresAt };
  }

  async searchAirports(query: string): Promise<any[]> {
    if (!query || query.length < 2) {
      return [];
    }

    return this.amadeusService.searchAirports(query);
  }

  async getAirlines(codes?: string[]): Promise<any[]> {
    return this.amadeusService.getAirlines(codes);
  }
}
