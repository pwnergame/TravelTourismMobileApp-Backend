import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('flight_offers')
@Index(['searchId'])
@Index(['expiresAt'])
export class FlightOffer extends BaseEntity {
  @Column({ name: 'search_id' })
  searchId: string;

  @Column({ name: 'offer_data', type: 'jsonb' })
  offerData: Record<string, any>;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'hold_id', nullable: true })
  holdId?: string;

  @Column({ name: 'hold_expires_at', nullable: true })
  holdExpiresAt?: Date;

  @Column({ name: 'hold_user_id', nullable: true })
  holdUserId?: string;
}
