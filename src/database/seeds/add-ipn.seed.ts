import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { PaymentMethodConfig, PaymentMethodType } from '../../modules/payments/entities/payment-method-config.entity';
import { BankAccount } from '../../modules/payments/entities/bank-account.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'travel_superapp',
  entities: [PaymentMethodConfig, BankAccount],
  synchronize: true,
});

async function main() {
  console.log('Connecting to database...');
  await AppDataSource.initialize();
  
  // Add IPN payment method
  const paymentMethodRepo = AppDataSource.getRepository(PaymentMethodConfig);
  
  const existingIPN = await paymentMethodRepo.findOne({ where: { code: 'ipn' } });
  if (!existingIPN) {
    await paymentMethodRepo.save(paymentMethodRepo.create({
      code: 'ipn',
      name: 'InstaPay (IPN)',
      nameAr: 'انستاباي',
      description: 'Egyptian Instant Payment Network - Transfer via mobile number',
      descriptionAr: 'شبكة الدفع الفوري المصرية - تحويل عبر رقم الهاتف',
      icon: 'phone-portrait-outline',
      type: PaymentMethodType.IPN,
      isEnabled: true,
      sortOrder: 4,
      requiresVerification: true,
      supportedCurrencies: ['EGP'],
    }));
    console.log('✓ Created IPN payment method');
  } else {
    console.log('• IPN payment method already exists');
  }
  
  // Add Egyptian bank account for IPN
  const bankAccountRepo = AppDataSource.getRepository(BankAccount);
  
  const existingEgyptBank = await bankAccountRepo.findOne({ where: { currency: 'EGP' } });
  if (!existingEgyptBank) {
    await bankAccountRepo.save(bankAccountRepo.create({
      bankName: 'National Bank of Egypt',
      bankNameAr: 'البنك الأهلي المصري',
      accountName: 'Travel & Tourism LLC',
      accountNameAr: 'شركة السفر والسياحة',
      accountNumber: '0123456789012',
      iban: 'EG38 0019 0005 0000 0000 0126 3019',
      swiftCode: 'NBEGEGCX',
      currency: 'EGP',
      isPrimary: false,
      isEnabled: true,
      sortOrder: 3,
      instructions: 'For InstaPay transfers, use mobile number: +20 100 123 4567. Include your order number in the transfer notes.',
      instructionsAr: 'لتحويلات انستاباي، استخدم رقم الهاتف: 01001234567. أضف رقم طلبك في ملاحظات التحويل.',
    }));
    console.log('✓ Created Egyptian bank account (NBE)');
  } else {
    console.log('• Egyptian bank account already exists');
  }
  
  // List all payment methods
  const allMethods = await paymentMethodRepo.find({ order: { sortOrder: 'ASC' } });
  console.log('\n📋 All Payment Methods:');
  allMethods.forEach(m => {
    console.log(`  ${m.isEnabled ? '✓' : '✗'} ${m.code}: ${m.name} ${m.supportedCurrencies ? `(${m.supportedCurrencies.join(', ')})` : '(all currencies)'}`);
  });
  
  // List all bank accounts
  const allBanks = await bankAccountRepo.find({ order: { sortOrder: 'ASC' } });
  console.log('\n🏦 All Bank Accounts:');
  allBanks.forEach(b => {
    console.log(`  ${b.isEnabled ? '✓' : '✗'} ${b.bankName} (${b.currency || 'SAR'}) ${b.isPrimary ? '[PRIMARY]' : ''}`);
  });
  
  await AppDataSource.destroy();
  console.log('\nDone!');
}

main().catch(console.error);
