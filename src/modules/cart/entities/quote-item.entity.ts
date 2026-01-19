import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Quote } from './quote.entity';

export enum ServiceType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  VISA = 'visa',
  HAJJ = 'hajj',
  PACKAGE = 'package',
}

@Entity('quote_items')
export class QuoteItem extends BaseEntity {
  @Column({ name: 'quote_id' })
  quoteId: string;

  @ManyToOne(() => Quote, (quote) => quote.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quote_id' })
  quote: Quote;

  @Column({ name: 'service_type', type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column({ name: 'service_details', type: 'jsonb' })
  serviceDetails: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  travelers?: { id: string; name: string; type: string }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;
}
