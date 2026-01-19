import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { OtpService } from './otp.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';

import { StartOtpDto } from './dto/start-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  phone?: string;
  email?: string;
  isRegistered: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {}

  async startOtp(dto: StartOtpDto): Promise<{ message: string; expiresIn: number }> {
    const { phone, email, method } = dto;
    const identifier = phone || email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required');
    }

    // Check rate limiting for this identifier
    const canSend = await this.otpService.canSendOtp(identifier);
    if (!canSend.allowed) {
      throw new BadRequestException(
        `Please wait ${canSend.retryAfter} seconds before requesting another OTP`,
      );
    }

    // Generate and send OTP
    const otp = await this.otpService.generateOtp(identifier);
    
    // Send OTP based on method
    switch (method) {
      case 'sms':
        if (phone) await this.otpService.sendSmsOtp(phone, otp);
        break;
      case 'whatsapp':
        if (phone) await this.otpService.sendWhatsAppOtp(phone, otp);
        break;
      case 'email':
        if (email) await this.otpService.sendEmailOtp(email, otp);
        break;
      default:
        if (phone) await this.otpService.sendSmsOtp(phone, otp);
    }

    const expiresIn = this.configService.get<number>('otp.expiresIn', 300);

    return {
      message: `OTP sent via ${method}`,
      expiresIn,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<AuthTokens & { isNewUser: boolean }> {
    const { phone, email, otp } = dto;
    const identifier = phone || email;

    if (!identifier) {
      throw new BadRequestException('Phone or email is required');
    }

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(identifier, otp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Find or create user
    let user = await this.userRepository.findOne({
      where: phone ? { phone } : { email },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = this.userRepository.create({
        phone,
        email,
        isRegistered: false,
      });
      await this.userRepository.save(user);
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      isNewUser,
    };
  }

  async register(userId: string, dto: RegisterDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isRegistered) {
      throw new BadRequestException('User is already registered');
    }

    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.email = dto.email || user.email;
    user.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined;
    user.nationality = dto.nationality;
    user.preferredLanguage = dto.preferredLanguage || 'en';
    user.isRegistered = true;

    await this.userRepository.save(user);

    return user;
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenEntity || tokenEntity.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old refresh token
    await this.refreshTokenRepository.remove(tokenEntity);

    // Generate new tokens
    return this.generateTokens(tokenEntity.user);
  }

  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    await this.refreshTokenRepository.delete({
      token: refreshToken,
      user: { id: userId },
    });

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      email: user.email,
      isRegistered: user.isRegistered,
    };

    const accessToken = this.jwtService.sign(payload);

    // Create refresh token
    const refreshToken = uuidv4();
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn', '7d');
    const expiresAt = this.calculateExpiry(refreshExpiresIn);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private calculateExpiry(duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: payload.sub } });
  }
}
