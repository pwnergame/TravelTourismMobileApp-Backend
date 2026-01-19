import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { QuoteItem } from './quote-item.entity';

export enum QuoteStatus {
  DRAFT = 'draft',
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('quotes')
export class Quote extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: QuoteStatus, default: QuoteStatus.DRAFT })
  status: QuoteStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ name: 'promo_code', nullable: true })
  promoCode?: string;

  @Column({ name: 'promo_type', nullable: true })
  promoType?: 'percentage' | 'fixed';

  @Column({ name: 'promo_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  promoValue?: number;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date;

  @OneToMany(() => QuoteItem, (item) => item.quote)
  items: QuoteItem[];
}
