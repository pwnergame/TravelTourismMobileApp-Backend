import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PaymentMethodType {
  CARD = 'card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  MADA = 'mada',
  STC_PAY = 'stc_pay',
  TABBY = 'tabby',
  TAMARA = 'tamara',
  BANK_TRANSFER = 'bank_transfer',
  IPN = 'ipn', // Instapay / Egyptian payment network
}

@Entity('payment_method_configs')
export class PaymentMethodConfig extends BaseEntity {
  @Column({ unique: true })
  code: string; // unique identifier like 'card', 'mada', 'bank_transfer'

  @Column()
  name: string;

  @Column({ name: 'name_ar', nullable: true })
  nameAr?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'description_ar', nullable: true })
  descriptionAr?: string;

  @Column()
  icon: string; // icon name like 'card', 'wallet-outline', etc.

  @Column({ type: 'enum', enum: PaymentMethodType })
  type: PaymentMethodType;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAmount?: number;

  @Column({ name: 'max_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAmount?: number;

  @Column({ name: 'processing_fee_type', nullable: true })
  processingFeeType?: 'percentage' | 'fixed';

  @Column({ name: 'processing_fee_value', type: 'decimal', precision: 10, scale: 4, nullable: true })
  processingFeeValue?: number;

  @Column({ name: 'supported_currencies', type: 'simple-array', nullable: true })
  supportedCurrencies?: string[]; // null = all currencies

  @Column({ name: 'requires_verification', default: false })
  requiresVerification: boolean; // for bank transfer

  @Column({ type: 'jsonb', nullable: true })
  config?: Record<string, any>; // gateway-specific config

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
