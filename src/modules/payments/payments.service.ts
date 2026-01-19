import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { PromoCode, PromoCodeType, PromoCodeStatus } from './entities/promo-code.entity';
import { PromoCodeUsage } from './entities/promo-code-usage.entity';
import { PaymentMethodConfig } from './entities/payment-method-config.entity';
import { BankAccount } from './entities/bank-account.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ValidatePromoCodeDto, PromoCodeResponseDto } from './dto/promo-code.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PromoCode)
    private readonly promoCodeRepository: Repository<PromoCode>,
    @InjectRepository(PromoCodeUsage)
    private readonly promoCodeUsageRepository: Repository<PromoCodeUsage>,
    @InjectRepository(PaymentMethodConfig)
    private readonly paymentMethodConfigRepository: Repository<PaymentMethodConfig>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
  ) {}

  // ========== PAYMENT METHODS ==========

  async getPaymentMethods(userId?: string): Promise<any[]> {
    const methods = await this.paymentMethodConfigRepository.find({
      where: { isEnabled: true },
      order: { sortOrder: 'ASC' },
    });

    // If no configured methods, return defaults
    if (methods.length === 0) {
      return this.getDefaultPaymentMethods();
    }

    return methods.map(m => ({
      id: m.code,
      type: m.type,
      name: m.name,
      nameAr: m.nameAr,
      description: m.description,
      descriptionAr: m.descriptionAr,
      icon: m.icon,
      enabled: m.isEnabled,
      requiresVerification: m.requiresVerification,
      minAmount: m.minAmount,
      maxAmount: m.maxAmount,
      processingFee: m.processingFeeValue ? {
        type: m.processingFeeType,
        value: m.processingFeeValue,
      } : null,
    }));
  }

  private getDefaultPaymentMethods(): any[] {
    return [
      {
        id: 'card',
        type: PaymentMethod.CARD,
        name: 'Credit/Debit Card',
        nameAr: 'بطاقة ائتمان/خصم',
        icon: 'card-outline',
        enabled: true,
      },
      {
        id: 'mada',
        type: PaymentMethod.MADA,
        name: 'Mada Card',
        nameAr: 'بطاقة مدى',
        icon: 'card',
        enabled: true,
      },
      {
        id: 'bank_transfer',
        type: PaymentMethod.BANK_TRANSFER,
        name: 'Bank Transfer',
        nameAr: 'تحويل بنكي',
        description: 'Manual transfer - requires verification',
        descriptionAr: 'تحويل يدوي - يتطلب التحقق',
        icon: 'business-outline',
        enabled: true,
        requiresVerification: true,
      },
    ];
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    const accounts = await this.bankAccountRepository.find({
      where: { isEnabled: true },
      order: { isPrimary: 'DESC', sortOrder: 'ASC' },
    });

    // If no configured accounts, return default
    if (accounts.length === 0) {
      return [{
        id: 'default',
        bankName: 'Al Rajhi Bank',
        bankNameAr: 'بنك الراجحي',
        accountName: 'Travel & Tourism LLC',
        accountNameAr: 'شركة السفر والسياحة',
        iban: 'SA03 8000 0000 6080 1016 7519',
        swiftCode: 'RJHISARI',
        isPrimary: true,
        isEnabled: true,
        sortOrder: 0,
        instructions: 'Please include your order number in the transfer reference',
        instructionsAr: 'يرجى تضمين رقم الطلب في مرجع التحويل',
      }] as any;
    }

    return accounts;
  }

  // ========== PROMO CODES ==========

  async validatePromoCode(userId: string | null, dto: ValidatePromoCodeDto): Promise<PromoCodeResponseDto> {
    const { code, subtotal, currency, serviceType } = dto;
    const now = new Date();

    // Find the promo code
    const promoCode = await this.promoCodeRepository.findOne({
      where: { 
        code: code.toUpperCase(),
        status: PromoCodeStatus.ACTIVE,
      },
    });

    if (!promoCode) {
      return { valid: false, message: 'Invalid promo code' };
    }

    // Check validity dates
    if (promoCode.validFrom > now) {
      return { valid: false, message: 'This promo code is not yet active' };
    }

    if (promoCode.validUntil < now) {
      return { valid: false, message: 'This promo code has expired' };
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return { valid: false, message: 'This promo code has reached its usage limit' };
    }

    // Check per-user limit
    if (userId && promoCode.perUserLimit) {
      const userUsageCount = await this.promoCodeUsageRepository.count({
        where: { userId, promoCodeId: promoCode.id },
      });

      if (userUsageCount >= promoCode.perUserLimit) {
        return { valid: false, message: 'You have already used this promo code' };
      }
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && subtotal < Number(promoCode.minOrderAmount)) {
      return { 
        valid: false, 
        message: `Minimum order amount is ${promoCode.minOrderAmount}`,
        minOrderAmount: Number(promoCode.minOrderAmount),
      };
    }

    // Check applicable services
    if (promoCode.applicableServices && promoCode.applicableServices.length > 0) {
      if (!promoCode.applicableServices.includes('all') && serviceType && !promoCode.applicableServices.includes(serviceType)) {
        return { valid: false, message: 'This promo code is not valid for this service' };
      }
    }

    // Check applicable currencies
    if (promoCode.applicableCurrencies && promoCode.applicableCurrencies.length > 0 && currency) {
      if (!promoCode.applicableCurrencies.includes(currency)) {
        return { valid: false, message: 'This promo code is not valid for your currency' };
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.type === PromoCodeType.PERCENTAGE) {
      discountAmount = (subtotal * Number(promoCode.value)) / 100;
      // Apply max discount cap if set
      if (promoCode.maxDiscountAmount && discountAmount > Number(promoCode.maxDiscountAmount)) {
        discountAmount = Number(promoCode.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(Number(promoCode.value), subtotal);
    }

    return {
      valid: true,
      code: promoCode.code,
      name: promoCode.name,
      type: promoCode.type as 'percentage' | 'fixed',
      value: Number(promoCode.value),
      discountAmount: Math.round(discountAmount * 100) / 100,
      message: promoCode.description || `${promoCode.name} applied!`,
    };
  }

  async applyPromoCode(userId: string, promoCodeId: string, orderId: string, discountAmount: number, orderAmount: number, currency: string): Promise<void> {
    // Record usage
    const usage = this.promoCodeUsageRepository.create({
      userId,
      promoCodeId,
      orderId,
      discountAmount,
      orderAmount,
      currency,
    });
    await this.promoCodeUsageRepository.save(usage);

    // Increment usage count
    await this.promoCodeRepository.increment({ id: promoCodeId }, 'usageCount', 1);
  }

  async getActivePromoCodes(): Promise<PromoCode[]> {
    const now = new Date();
    return this.promoCodeRepository.find({
      where: {
        status: PromoCodeStatus.ACTIVE,
        validFrom: LessThanOrEqual(now),
        validUntil: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ========== ADMIN METHODS ==========

  async createPromoCode(data: Partial<PromoCode>): Promise<PromoCode> {
    const promoCode = this.promoCodeRepository.create({
      ...data,
      code: data.code?.toUpperCase(),
    });
    return this.promoCodeRepository.save(promoCode);
  }

  async updatePromoCode(id: string, data: Partial<PromoCode>): Promise<PromoCode> {
    const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }
    Object.assign(promoCode, data);
    if (data.code) {
      promoCode.code = data.code.toUpperCase();
    }
    return this.promoCodeRepository.save(promoCode);
  }

  async deletePromoCode(id: string): Promise<void> {
    await this.promoCodeRepository.softDelete(id);
  }

  async createPaymentMethodConfig(data: Partial<PaymentMethodConfig>): Promise<PaymentMethodConfig> {
    const config = this.paymentMethodConfigRepository.create(data);
    return this.paymentMethodConfigRepository.save(config);
  }

  async updatePaymentMethodConfig(id: string, data: Partial<PaymentMethodConfig>): Promise<PaymentMethodConfig> {
    const config = await this.paymentMethodConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('Payment method config not found');
    }
    Object.assign(config, data);
    return this.paymentMethodConfigRepository.save(config);
  }

  async createBankAccount(data: Partial<BankAccount>): Promise<BankAccount> {
    const account = this.bankAccountRepository.create(data);
    return this.bankAccountRepository.save(account);
  }

  async updateBankAccount(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException('Bank account not found');
    }
    Object.assign(account, data);
    return this.bankAccountRepository.save(account);
  }

  async initiatePayment(
    userId: string,
    dto: InitiatePaymentDto,
  ): Promise<{ paymentId: string; redirectUrl: string; requires3DS: boolean }> {
    // Create payment record
    const payment = this.paymentRepository.create({
      userId,
      orderId: dto.orderId,
      amount: dto.amount,
      currency: dto.currency || 'SAR',
      method: dto.method,
      status: PaymentStatus.PENDING,
      idempotencyKey: dto.idempotencyKey || uuidv4(),
    });

    await this.paymentRepository.save(payment);

    // In production, call payment gateway
    // Mock response for now
    return {
      paymentId: payment.id,
      redirectUrl: `/payment/3ds/${payment.id}`,
      requires3DS: dto.method === PaymentMethod.CARD,
    };
  }

  async getPaymentStatus(userId: string, paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async handleWebhook(payload: any): Promise<{ received: boolean }> {
    this.logger.log('Received payment webhook', payload);

    // Verify webhook signature
    // Update payment status
    // Trigger order confirmation if successful

    const { paymentId, status, transactionId } = payload;

    if (paymentId) {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId },
      });

      if (payment) {
        payment.status = status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
        payment.gatewayReference = transactionId;
        payment.completedAt = status === 'success' ? new Date() : undefined;

        await this.paymentRepository.save(payment);
      }
    }

    return { received: true };
  }
}
