import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('hotel_searches')
export class HotelSearch extends BaseEntity {
  @Column()
  destination: string;

  @Column({ name: 'check_in', type: 'date' })
  checkIn: Date;

  @Column({ name: 'check_out', type: 'date' })
  checkOut: Date;

  @Column({ type: 'int' })
  rooms: number;

  @Column({ type: 'jsonb' })
  guests: {
    adults: number;
    children: number;
    childrenAges?: number[];
  };

  @Column({ name: 'results_count', default: 0 })
  resultsCount: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;
}
