import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface AmadeusTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'amadeus.baseUrl',
      'https://test.api.amadeus.com',
    );
    this.apiKey = this.configService.get<string>('amadeus.apiKey', '');
    this.apiSecret = this.configService.get<string>('amadeus.apiSecret', '');
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt > new Date()
    ) {
      return this.accessToken;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<AmadeusTokenResponse>(
          `${this.baseUrl}/v1/security/oauth2/token`,
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.apiKey,
            client_secret: this.apiSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(
        Date.now() + (response.data.expires_in - 60) * 1000,
      );

      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Amadeus access token', error);
      throw error;
    }
  }

  async searchFlights(params: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    currencyCode?: string;
    max?: number;
  }): Promise<any> {
    // In development without API keys, return mock data
    if (!this.apiKey || !this.apiSecret) {
      return this.getMockFlightResults(params);
    }

    try {
      const token = await this.getAccessToken();

      const queryParams = new URLSearchParams({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        adults: params.adults.toString(),
        currencyCode: params.currencyCode || 'SAR',
        max: (params.max || 50).toString(),
      });

      if (params.returnDate) {
        queryParams.append('returnDate', params.returnDate);
      }
      if (params.children) {
        queryParams.append('children', params.children.toString());
      }
      if (params.infants) {
        queryParams.append('infants', params.infants.toString());
      }
      if (params.travelClass) {
        queryParams.append('travelClass', params.travelClass);
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/v2/shopping/flight-offers?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to search flights', error);
      throw error;
    }
  }

  async searchAirports(keyword: string): Promise<any[]> {
    if (!this.apiKey || !this.apiSecret) {
      return this.getMockAirports(keyword);
    }

    try {
      const token = await this.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/v1/reference-data/locations?subType=AIRPORT,CITY&keyword=${encodeURIComponent(keyword)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error('Failed to search airports', error);
      return [];
    }
  }

  async getAirlines(codes?: string[]): Promise<any[]> {
    if (!this.apiKey || !this.apiSecret) {
      return this.getMockAirlines();
    }

    try {
      const token = await this.getAccessToken();

      let url = `${this.baseUrl}/v1/reference-data/airlines`;
      if (codes && codes.length > 0) {
        url += `?airlineCodes=${codes.join(',')}`;
      }

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return response.data.data || [];
    } catch (error) {
      this.logger.error('Failed to get airlines', error);
      return [];
    }
  }

  // Mock data for development
  private getMockFlightResults(params: any): any {
    return {
      data: [
        {
          id: '1',
          price: {
            total: '1250.00',
            currency: 'SAR',
            base: '1100.00',
            fees: [{ amount: '150.00', type: 'SERVICE' }],
          },
          itineraries: [
            {
              duration: 'PT3H15M',
              segments: [
                {
                  departure: {
                    iataCode: params.originLocationCode,
                    at: `${params.departureDate}T08:00:00`,
                  },
                  arrival: {
                    iataCode: params.destinationLocationCode,
                    at: `${params.departureDate}T11:15:00`,
                  },
                  carrierCode: 'SV',
                  number: '123',
                  aircraft: { code: '789' },
                  duration: 'PT3H15M',
                  numberOfStops: 0,
                  blacklistedInEU: false,
                },
              ],
            },
          ],
          validatingAirlineCodes: ['SV'],
          instantTicketingRequired: false,
          nonHomogeneous: false,
          lastTicketingDate: params.departureDate,
        },
      ],
      dictionaries: {
        carriers: { SV: 'Saudi Arabian Airlines' },
        aircraft: { '789': 'Boeing 787-9' },
        locations: {},
      },
    };
  }

  private getMockAirports(keyword: string): any[] {
    const airports = [
      { iataCode: 'RUH', name: 'King Khalid International Airport', cityName: 'Riyadh' },
      { iataCode: 'JED', name: 'King Abdulaziz International Airport', cityName: 'Jeddah' },
      { iataCode: 'DMM', name: 'King Fahd International Airport', cityName: 'Dammam' },
      { iataCode: 'DXB', name: 'Dubai International Airport', cityName: 'Dubai' },
      { iataCode: 'CAI', name: 'Cairo International Airport', cityName: 'Cairo' },
      { iataCode: 'LHR', name: 'London Heathrow Airport', cityName: 'London' },
    ];

    return airports.filter(
      (a) =>
        a.iataCode.toLowerCase().includes(keyword.toLowerCase()) ||
        a.name.toLowerCase().includes(keyword.toLowerCase()) ||
        a.cityName.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private getMockAirlines(): any[] {
    return [
      { iataCode: 'SV', commonName: 'Saudi Arabian Airlines' },
      { iataCode: 'EK', commonName: 'Emirates' },
      { iataCode: 'EY', commonName: 'Etihad Airways' },
      { iataCode: 'MS', commonName: 'EgyptAir' },
      { iataCode: 'QR', commonName: 'Qatar Airways' },
    ];
  }
}
