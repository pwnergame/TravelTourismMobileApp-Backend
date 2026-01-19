import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { VisaService } from './visa.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Visa')
@Controller('visa')
export class VisaController {
  constructor(private readonly visaService: VisaService) {}

  @Get('countries')
  @Public()
  @ApiOperation({ summary: 'Get list of countries offering visa services' })
  async getCountries(@Headers('accept-language') language?: string) {
    return this.visaService.getCountries(language || 'en');
  }

  @Get('countries/:code/types')
  @Public()
  @ApiOperation({ summary: 'Get visa types for a country' })
  async getVisaTypes(
    @Param('code') countryCode: string,
    @Headers('accept-language') language?: string,
  ) {
    return this.visaService.getVisaTypes(countryCode, language || 'en');
  }

  @Get('requirements')
  @Public()
  @ApiOperation({ summary: 'Get visa requirements' })
  async getRequirements(
    @Query('country') country: string,
    @Query('nationality') nationality: string,
    @Query('type') visaType: string,
  ) {
    return this.visaService.getRequirements(country, nationality, visaType);
  }

  @Post('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new visa application' })
  async createApplication(@CurrentUser() user: User, @Body() dto: any) {
    return this.visaService.createApplication(user.id, dto);
  }

  @Get('applications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user visa applications' })
  async getApplications(@CurrentUser() user: User) {
    return this.visaService.getApplications(user.id);
  }

  @Get('applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get visa application details' })
  async getApplication(@CurrentUser() user: User, @Param('id') id: string) {
    return this.visaService.getApplication(user.id, id);
  }
}
