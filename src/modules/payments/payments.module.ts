import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PromoCode } from './entities/promo-code.entity';
import { PromoCodeUsage } from './entities/promo-code-usage.entity';
import { PaymentMethodConfig } from './entities/payment-method-config.entity';
import { BankAccount } from './entities/bank-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PromoCode,
      PromoCodeUsage,
      PaymentMethodConfig,
      BankAccount,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
