import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HajjController } from './hajj.controller';
import { HajjService } from './hajj.service';
import { HajjPackage } from './entities/hajj-package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HajjPackage])],
  controllers: [HajjController],
  providers: [HajjService],
  exports: [HajjService],
})
export class HajjModule {}
