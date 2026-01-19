import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum PackageType {
  HAJJ = 'hajj',
  UMRAH = 'umrah',
}

@Entity('hajj_packages')
export class HajjPackage extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: PackageType })
  type: PackageType;

  @Column()
  duration: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ type: 'jsonb' })
  includes: string[];

  @Column({ name: 'makkah_hotel' })
  makkahHotel: string;

  @Column({ name: 'madinah_hotel' })
  madinahHotel: string;

  @Column({ type: 'jsonb', name: 'departure_dates' })
  departureDates: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
