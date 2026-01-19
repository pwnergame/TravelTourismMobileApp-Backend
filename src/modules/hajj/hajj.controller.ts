import { Controller, Get, Param, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';

import { HajjService } from './hajj.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Hajj')
@Controller('hajj')
export class HajjController {
  constructor(private readonly hajjService: HajjService) {}

  @Get('packages')
  @Public()
  @ApiOperation({ summary: 'Get Hajj/Umrah packages' })
  @ApiHeader({ name: 'Accept-Language', required: false, description: 'Language (en or ar)' })
  async getPackages(
    @Query('type') type?: 'hajj' | 'umrah',
    @Headers('accept-language') lang?: string,
  ) {
    const language = lang?.startsWith('ar') ? 'ar' : 'en';
    return this.hajjService.getPackages(type, language);
  }

  @Get('packages/:id')
  @Public()
  @ApiOperation({ summary: 'Get package details' })
  @ApiHeader({ name: 'Accept-Language', required: false, description: 'Language (en or ar)' })
  async getPackage(
    @Param('id') id: string,
    @Headers('accept-language') lang?: string,
  ) {
    const language = lang?.startsWith('ar') ? 'ar' : 'en';
    return this.hajjService.getPackage(id, language);
  }
}
