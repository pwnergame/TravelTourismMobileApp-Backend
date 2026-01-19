import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VisaController } from './visa.controller';
import { VisaService } from './visa.service';
import { VisaApplication } from './entities/visa-application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VisaApplication])],
  controllers: [VisaController],
  providers: [VisaService],
  exports: [VisaService],
})
export class VisaModule {}
