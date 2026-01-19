import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PromoCode } from './promo-code.entity';

@Entity('promo_code_usages')
@Index(['userId', 'promoCodeId'])
export class PromoCodeUsage extends BaseEntity {
  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'promo_code_id' })
  promoCodeId: string;

  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'promo_code_id' })
  promoCode: PromoCode;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2 })
  discountAmount: number;

  @Column({ name: 'order_amount', type: 'decimal', precision: 10, scale: 2 })
  orderAmount: number;

  @Column()
  currency: string;

  @Column({ name: 'applied_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  appliedAt: Date;
}
