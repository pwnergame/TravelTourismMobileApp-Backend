import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum VisaStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

@Entity('visa_applications')
export class VisaApplication extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 2 })
  country: string;

  @Column({ name: 'visa_type' })
  visaType: string;

  @Column({ type: 'jsonb' })
  travelers: any[];

  @Column({ type: 'enum', enum: VisaStatus, default: VisaStatus.DRAFT })
  status: VisaStatus;

  @Column({ type: 'jsonb', nullable: true })
  documents?: { type: string; url: string; uploadedAt: Date }[];

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt?: Date;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'visa_number', nullable: true })
  visaNumber?: string;

  @Column({ name: 'visa_expiry', type: 'date', nullable: true })
  visaExpiry?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
