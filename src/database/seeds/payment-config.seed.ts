import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { PromoCode, PromoCodeType, PromoCodeStatus } from '../../modules/payments/entities/promo-code.entity';
import { PaymentMethodConfig, PaymentMethodType } from '../../modules/payments/entities/payment-method-config.entity';
import { BankAccount } from '../../modules/payments/entities/bank-account.entity';

// Load environment variables from .env file
config();

/**
 * Seed initial payment configuration data
 * Run with: npx ts-node src/database/seeds/payment-config.seed.ts
 */

export async function seedPaymentConfig(dataSource: DataSource) {
  console.log('Seeding payment configuration...');

  // Seed Payment Methods
  const paymentMethodRepo = dataSource.getRepository(PaymentMethodConfig);
  
  const paymentMethods = [
    {
      code: 'card',
      name: 'Credit/Debit Card',
      nameAr: 'بطاقة ائتمان/خصم',
      description: 'Visa, Mastercard, AMEX',
      descriptionAr: 'فيزا، ماستركارد، أمريكان إكسبرس',
      icon: 'card-outline',
      type: PaymentMethodType.CARD,
      isEnabled: true,
      sortOrder: 1,
      requiresVerification: false,
    },
    {
      code: 'mada',
      name: 'Mada Card',
      nameAr: 'بطاقة مدى',
      description: 'Saudi local debit cards',
      descriptionAr: 'بطاقات الخصم المحلية السعودية',
      icon: 'card',
      type: PaymentMethodType.MADA,
      isEnabled: true,
      sortOrder: 2,
      requiresVerification: false,
    },
    {
      code: 'bank_transfer',
      name: 'Bank Transfer',
      nameAr: 'تحويل بنكي',
      description: 'Manual transfer - requires verification',
      descriptionAr: 'تحويل يدوي - يتطلب التحقق',
      icon: 'business-outline',
      type: PaymentMethodType.BANK_TRANSFER,
      isEnabled: true,
      sortOrder: 3,
      requiresVerification: true,
    },
    {
      code: 'apple_pay',
      name: 'Apple Pay',
      nameAr: 'أبل باي',
      description: 'Pay with Apple Pay',
      descriptionAr: 'الدفع عبر أبل باي',
      icon: 'logo-apple',
      type: PaymentMethodType.APPLE_PAY,
      isEnabled: false, // Disabled until integration is complete
      sortOrder: 4,
      requiresVerification: false,
    },
    {
      code: 'stc_pay',
      name: 'STC Pay',
      nameAr: 'اس تي سي باي',
      description: 'Pay with STC Pay wallet',
      descriptionAr: 'الدفع عبر محفظة اس تي سي باي',
      icon: 'wallet-outline',
      type: PaymentMethodType.STC_PAY,
      isEnabled: false, // Disabled until integration is complete
      sortOrder: 5,
      requiresVerification: false,
    },
  ];

  for (const method of paymentMethods) {
    const existing = await paymentMethodRepo.findOne({ where: { code: method.code } });
    if (!existing) {
      await paymentMethodRepo.save(paymentMethodRepo.create(method));
      console.log(`  Created payment method: ${method.name}`);
    }
  }

  // Seed Bank Accounts
  const bankAccountRepo = dataSource.getRepository(BankAccount);
  
  const bankAccounts = [
    {
      bankName: 'Al Rajhi Bank',
      bankNameAr: 'بنك الراجحي',
      accountName: 'Travel & Tourism LLC',
      accountNameAr: 'شركة السفر والسياحة',
      accountNumber: '608010167519',
      iban: 'SA03 8000 0000 6080 1016 7519',
      swiftCode: 'RJHISARI',
      currency: 'SAR',
      isPrimary: true,
      isEnabled: true,
      sortOrder: 1,
      instructions: 'Please include your order number in the transfer reference',
      instructionsAr: 'يرجى تضمين رقم الطلب في مرجع التحويل',
    },
    {
      bankName: 'Saudi National Bank (SNB)',
      bankNameAr: 'البنك الأهلي السعودي',
      accountName: 'Travel & Tourism LLC',
      accountNameAr: 'شركة السفر والسياحة',
      accountNumber: '12345678901',
      iban: 'SA44 2000 0001 2345 6789 0123',
      swiftCode: 'NCBKSAJE',
      currency: 'SAR',
      isPrimary: false,
      isEnabled: true,
      sortOrder: 2,
      instructions: 'Please include your order number in the transfer reference',
      instructionsAr: 'يرجى تضمين رقم الطلب في مرجع التحويل',
    },
  ];

  for (const account of bankAccounts) {
    const existing = await bankAccountRepo.findOne({ where: { iban: account.iban } });
    if (!existing) {
      await bankAccountRepo.save(bankAccountRepo.create(account));
      console.log(`  Created bank account: ${account.bankName}`);
    }
  }

  // Seed Promo Codes
  const promoCodeRepo = dataSource.getRepository(PromoCode);
  
  const now = new Date();
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  const promoCodes = [
    {
      code: 'WELCOME10',
      name: 'Welcome Discount',
      description: '10% off your first order',
      type: PromoCodeType.PERCENTAGE,
      value: 10,
      validFrom: now,
      validUntil: oneYearFromNow,
      status: PromoCodeStatus.ACTIVE,
      perUserLimit: 1,
      firstOrderOnly: true,
      applicableServices: ['all'],
    },
    {
      code: 'SAVE50',
      name: 'Flat ₹50 Off',
      description: 'Get ₹50 off on any order',
      type: PromoCodeType.FIXED,
      value: 50,
      validFrom: now,
      validUntil: oneYearFromNow,
      status: PromoCodeStatus.ACTIVE,
      perUserLimit: 3,
    },
    {
      code: 'TRAVEL20',
      name: 'Travel Season Sale',
      description: '20% off on orders above ₹500',
      type: PromoCodeType.PERCENTAGE,
      value: 20,
      minOrderAmount: 500,
      maxDiscountAmount: 200,
      validFrom: now,
      validUntil: oneYearFromNow,
      status: PromoCodeStatus.ACTIVE,
      perUserLimit: 2,
    },
    {
      code: 'VIP25',
      name: 'VIP Exclusive',
      description: '25% off for premium customers on orders above ₹1000',
      type: PromoCodeType.PERCENTAGE,
      value: 25,
      minOrderAmount: 1000,
      maxDiscountAmount: 500,
      validFrom: now,
      validUntil: oneYearFromNow,
      status: PromoCodeStatus.ACTIVE,
      perUserLimit: 5,
    },
    {
      code: 'FLIGHT15',
      name: 'Flight Special',
      description: '15% off on flight bookings',
      type: PromoCodeType.PERCENTAGE,
      value: 15,
      validFrom: now,
      validUntil: oneYearFromNow,
      status: PromoCodeStatus.ACTIVE,
      applicableServices: ['flights'],
      perUserLimit: 2,
    },
    {
      code: 'HOTEL10',
      name: 'Hotel Deal',
      description: '10% off on hotel bookings',
      type: PromoCodeType.PERCENTAGE,
      value: 10,
      validFrom: now,
      validUntil: oneYearFromNow,
      status: PromoCodeStatus.ACTIVE,
      applicableServices: ['hotels'],
      perUserLimit: 2,
    },
  ];

  for (const promo of promoCodes) {
    const existing = await promoCodeRepo.findOne({ where: { code: promo.code } });
    if (!existing) {
      await promoCodeRepo.save(promoCodeRepo.create(promo));
      console.log(`  Created promo code: ${promo.code}`);
    }
  }

  console.log('Payment configuration seeding complete!');
}

// Can be run standalone or imported
if (require.main === module) {
  // When running standalone, we need to create the data source
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'travel_superapp',
    entities: [PromoCode, PaymentMethodConfig, BankAccount],
    synchronize: true,
  });

  console.log(`Connecting to database: ${process.env.DATABASE_NAME || 'travel_superapp'}...`);

  AppDataSource.initialize()
    .then(async () => {
      await seedPaymentConfig(AppDataSource);
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding data:', error);
      process.exit(1);
    });
}
