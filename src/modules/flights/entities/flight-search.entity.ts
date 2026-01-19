import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TripType } from '../dto/search-flights.dto';

@Entity('flight_searches')
@Index(['origin', 'destination', 'departureDate'])
export class FlightSearch extends BaseEntity {
  @Column({ length: 3 })
  origin: string;

  @Column({ length: 3 })
  destination: string;

  @Column({ name: 'departure_date', type: 'date' })
  departureDate: Date;

  @Column({ name: 'return_date', type: 'date', nullable: true })
  returnDate?: Date;

  @Column({ name: 'trip_type', type: 'enum', enum: TripType })
  tripType: TripType;

  @Column({ type: 'jsonb' })
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };

  @Column({ name: 'cabin_class', nullable: true })
  cabinClass?: string;

  @Column({ name: 'results_count', default: 0 })
  resultsCount: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;
}
