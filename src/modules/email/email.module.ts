import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrevoEmailService } from './brevo-email.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [BrevoEmailService],
  exports: [BrevoEmailService],
})
export class EmailModule {}
