import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { Otp } from './entities/otp.entity';
import { BrevoEmailService } from '../email/brevo-email.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly configService: ConfigService,
    @Optional() private readonly brevoEmailService?: BrevoEmailService,
  ) {}

  async generateOtp(identifier: string): Promise<string> {
    const length = this.configService.get<number>('otp.length', 6);
    const expiresIn = this.configService.get<number>('otp.expiresIn', 300);

    // Generate numeric OTP
    const otp = this.generateNumericOtp(length);
    const hashedOtp = this.hashOtp(otp);

    // Invalidate previous OTPs for this identifier
    await this.otpRepository.update(
      { identifier, isUsed: false },
      { isUsed: true },
    );

    // Create new OTP
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const otpEntity = this.otpRepository.create({
      identifier,
      otp: hashedOtp,
      expiresAt,
    });

    await this.otpRepository.save(otpEntity);

    this.logger.debug(`OTP generated for ${identifier}: ${otp}`);

    return otp;
  }

  async verifyOtp(identifier: string, otp: string): Promise<boolean> {
    const hashedOtp = this.hashOtp(otp);

    const otpEntity = await this.otpRepository.findOne({
      where: {
        identifier,
        otp: hashedOtp,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!otpEntity) {
      // Increment attempts
      await this.incrementAttempts(identifier);
      return false;
    }

    // Mark as used
    otpEntity.isUsed = true;
    await this.otpRepository.save(otpEntity);

    return true;
  }

  async canSendOtp(
    identifier: string,
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const cooldown = this.configService.get<number>('otp.resendCooldown', 60);
    const cooldownTime = new Date(Date.now() - cooldown * 1000);

    const recentOtp = await this.otpRepository.findOne({
      where: {
        identifier,
        createdAt: MoreThan(cooldownTime),
      },
      order: { createdAt: 'DESC' },
    });

    if (recentOtp) {
      const retryAfter = Math.ceil(
        (recentOtp.createdAt.getTime() + cooldown * 1000 - Date.now()) / 1000,
      );
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  async sendSmsOtp(phone: string, otp: string): Promise<void> {
    // TODO: Integrate with Twilio
    this.logger.log(`[SMS] Sending OTP ${otp} to ${phone}`);
    
    // In development, just log the OTP
    if (this.configService.get<string>('nodeEnv') === 'development') {
      this.logger.warn(`[DEV] OTP for ${phone}: ${otp}`);
      return;
    }

    // Production: Use Twilio
    // const twilioClient = ...
    // await twilioClient.messages.create({...})
  }

  async sendWhatsAppOtp(phone: string, otp: string): Promise<void> {
    // TODO: Integrate with Twilio WhatsApp
    this.logger.log(`[WhatsApp] Sending OTP ${otp} to ${phone}`);

    if (this.configService.get<string>('nodeEnv') === 'development') {
      this.logger.warn(`[DEV] OTP for ${phone}: ${otp}`);
      return;
    }
  }

  async sendEmailOtp(email: string, otp: string): Promise<void> {
    this.logger.log(`[Email] Sending OTP ${otp} to ${email}`);

    // Always log OTP in development for testing
    if (this.configService.get<string>('nodeEnv') === 'development') {
      this.logger.warn(`[DEV] OTP for ${email}: ${otp}`);
    }

    // Send via Brevo if service is available
    if (this.brevoEmailService) {
      try {
        const result = await this.brevoEmailService.sendOtpEmail(email, otp);
        if (result.success) {
          this.logger.log(`OTP email sent successfully to ${email}`);
        } else {
          this.logger.error(`Failed to send OTP email: ${result.error}`);
        }
      } catch (error) {
        this.logger.error(`Error sending OTP email: ${error.message}`);
      }
    }
  }

  private generateNumericOtp(length: number): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const randomNumber = crypto.randomInt(min, max + 1);
    return randomNumber.toString();
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  private async incrementAttempts(identifier: string): Promise<void> {
    // Find the most recent OTP for this identifier
    const recentOtp = await this.otpRepository.findOne({
      where: { identifier, isUsed: false },
      order: { createdAt: 'DESC' },
    });

    if (recentOtp) {
      recentOtp.attempts = (recentOtp.attempts || 0) + 1;

      // Invalidate after 3 failed attempts
      if (recentOtp.attempts >= 3) {
        recentOtp.isUsed = true;
      }

      await this.otpRepository.save(recentOtp);
    }
  }
}
