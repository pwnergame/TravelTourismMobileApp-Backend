import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('bank_accounts')
export class BankAccount extends BaseEntity {
  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'bank_name_ar', nullable: true })
  bankNameAr?: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ name: 'account_name_ar', nullable: true })
  accountNameAr?: string;

  @Column({ name: 'account_number', nullable: true })
  accountNumber?: string;

  @Column()
  iban: string;

  @Column({ name: 'swift_code', nullable: true })
  swiftCode?: string;

  @Column({ nullable: true })
  currency?: string; // preferred currency for this account

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  instructions?: string; // any special instructions

  @Column({ name: 'instructions_ar', nullable: true })
  instructionsAr?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
