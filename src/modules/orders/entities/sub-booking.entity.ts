import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  TICKETED = 'ticketed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum ServiceType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  VISA = 'visa',
  HAJJ = 'hajj',
  PACKAGE = 'package',
}

@Entity('sub_bookings')
export class SubBooking extends BaseEntity {
  @Column({ name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.subBookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'service_type', type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ name: 'booking_reference', nullable: true })
  bookingReference?: string;

  @Column({ name: 'provider_reference', nullable: true })
  providerReference?: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'jsonb' })
  details: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  travelers?: any[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 'SAR' })
  currency: string;

  @Column({ name: 'service_date', type: 'date', nullable: true })
  serviceDate?: Date;

  @Column({ name: 'confirmed_at', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  documents?: { type: string; url: string; name: string }[];
}
