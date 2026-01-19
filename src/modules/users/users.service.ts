import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { User } from './entities/user.entity';
import { TravelerProfile } from './entities/traveler-profile.entity';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateTravelerDto } from './dto/create-traveler.dto';
import { UpdateTravelerDto } from './dto/update-traveler.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TravelerProfile)
    private readonly travelerRepository: Repository<TravelerProfile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['travelers'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(userId);

    // Check for email uniqueness if updating email
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.assign(user, dto);
    await this.userRepository.save(user);

    return user;
  }

  // Traveler Profile Methods
  async getTravelers(userId: string): Promise<TravelerProfile[]> {
    return this.travelerRepository.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async getTraveler(userId: string, travelerId: string): Promise<TravelerProfile> {
    const traveler = await this.travelerRepository.findOne({
      where: { id: travelerId, userId },
    });

    if (!traveler) {
      throw new NotFoundException('Traveler not found');
    }

    return traveler;
  }

  async createTraveler(
    userId: string,
    dto: CreateTravelerDto,
  ): Promise<TravelerProfile> {
    // If this is marked as primary, unset other primary travelers
    if (dto.isPrimary) {
      await this.travelerRepository.update({ userId }, { isPrimary: false });
    }

    const traveler = this.travelerRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      gender: dto.gender,
      nationality: dto.nationality,
      type: dto.type,
      email: dto.email,
      phone: dto.phone,
      passportNumber: dto.passportNumber,
      passportIssuingCountry: dto.passportIssuingCountry,
      nationalId: dto.nationalId,
      isPrimary: dto.isPrimary,
      userId,
      dateOfBirth: new Date(dto.dateOfBirth),
      passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : undefined,
    });

    return this.travelerRepository.save(traveler);
  }

  async updateTraveler(
    userId: string,
    travelerId: string,
    dto: UpdateTravelerDto,
  ): Promise<TravelerProfile> {
    const traveler = await this.getTraveler(userId, travelerId);

    // If setting as primary, unset other primary travelers
    if (dto.isPrimary) {
      await this.travelerRepository
        .createQueryBuilder()
        .update()
        .set({ isPrimary: false })
        .where('userId = :userId AND id != :travelerId', { userId, travelerId })
        .execute();
    }

    // Update traveler fields
    if (dto.firstName) traveler.firstName = dto.firstName;
    if (dto.lastName) traveler.lastName = dto.lastName;
    if (dto.middleName !== undefined) traveler.middleName = dto.middleName;
    if (dto.gender) traveler.gender = dto.gender;
    if (dto.dateOfBirth) traveler.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.nationality) traveler.nationality = dto.nationality;
    if (dto.passportNumber !== undefined) traveler.passportNumber = dto.passportNumber;
    if (dto.passportExpiry) traveler.passportExpiry = new Date(dto.passportExpiry);
    if (dto.passportIssuingCountry !== undefined) traveler.passportIssuingCountry = dto.passportIssuingCountry;
    if (dto.nationalId !== undefined) traveler.nationalId = dto.nationalId;
    if (dto.email !== undefined) traveler.email = dto.email;
    if (dto.phone !== undefined) traveler.phone = dto.phone;
    if (dto.isPrimary !== undefined) traveler.isPrimary = dto.isPrimary;
    if (dto.type) traveler.type = dto.type;

    return this.travelerRepository.save(traveler);
  }

  async deleteTraveler(userId: string, travelerId: string): Promise<void> {
    const traveler = await this.getTraveler(userId, travelerId);
    await this.travelerRepository.remove(traveler);
  }
}
