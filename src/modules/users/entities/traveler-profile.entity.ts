import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from './user.entity';

export enum TravelerType {
  ADULT = 'adult',
  CHILD = 'child',
  INFANT = 'infant',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('traveler_profiles')
export class TravelerProfile extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.travelers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 2 })
  nationality: string;

  @Column({ name: 'passport_number', nullable: true })
  passportNumber?: string;

  @Column({ name: 'passport_expiry', type: 'date', nullable: true })
  passportExpiry?: Date;

  @Column({ name: 'passport_issuing_country', length: 2, nullable: true })
  passportIssuingCountry?: string;

  @Column({ name: 'national_id', nullable: true })
  nationalId?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'enum', enum: TravelerType, default: TravelerType.ADULT })
  type: TravelerType;

  // Virtual getter for full name
  get fullName(): string {
    return [this.firstName, this.middleName, this.lastName]
      .filter(Boolean)
      .join(' ');
  }

  // Calculate traveler type based on date of birth
  calculateType(departureDate: Date = new Date()): TravelerType {
    const age = this.calculateAge(departureDate);
    if (age < 2) return TravelerType.INFANT;
    if (age < 12) return TravelerType.CHILD;
    return TravelerType.ADULT;
  }

  private calculateAge(referenceDate: Date): number {
    const birthDate = new Date(this.dateOfBirth);
    let age = referenceDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
    
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    
    return age;
  }
}
