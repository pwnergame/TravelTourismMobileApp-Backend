import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PromoCodeType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum PromoCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}

@Entity('promo_codes')
export class PromoCode extends BaseEntity {
  @Column({ unique: true })
  @Index()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: PromoCodeType })
  type: PromoCodeType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderAmount?: number;

  @Column({ name: 'max_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount?: number;

  @Column({ name: 'usage_limit', nullable: true })
  usageLimit?: number;

  @Column({ name: 'usage_count', default: 0 })
  usageCount: number;

  @Column({ name: 'per_user_limit', default: 1 })
  perUserLimit: number;

  @Column({ name: 'valid_from', type: 'timestamp' })
  validFrom: Date;

  @Column({ name: 'valid_until', type: 'timestamp' })
  validUntil: Date;

  @Column({ type: 'enum', enum: PromoCodeStatus, default: PromoCodeStatus.ACTIVE })
  status: PromoCodeStatus;

  @Column({ name: 'applicable_services', type: 'simple-array', nullable: true })
  applicableServices?: string[]; // 'flights', 'hotels', 'visa', 'hajj', 'all'

  @Column({ name: 'applicable_currencies', type: 'simple-array', nullable: true })
  applicableCurrencies?: string[]; // 'SAR', 'USD', 'EUR', etc. null = all

  @Column({ name: 'first_order_only', default: false })
  firstOrderOnly: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
