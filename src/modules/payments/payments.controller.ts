import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';

import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { ValidatePromoCodeDto } from './dto/promo-code.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('methods')
  @Public()
  @ApiOperation({ summary: 'Get available payment methods' })
  async getPaymentMethods() {
    return this.paymentsService.getPaymentMethods();
  }

  @Get('bank-accounts')
  @Public()
  @ApiOperation({ summary: 'Get bank accounts for manual transfer' })
  async getBankAccounts() {
    return this.paymentsService.getBankAccounts();
  }

  @Post('promo-code/validate')
  @OptionalAuth()
  @ApiOperation({ summary: 'Validate a promo code' })
  async validatePromoCode(
    @CurrentUser() user: User | null,
    @Body() dto: ValidatePromoCodeDto,
  ) {
    return this.paymentsService.validatePromoCode(user?.id || null, dto);
  }

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate payment' })
  async initiatePayment(
    @CurrentUser() user: User,
    @Body() dto: InitiatePaymentDto,
  ) {
    return this.paymentsService.initiatePayment(user.id, dto);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check payment status' })
  async getPaymentStatus(
    @CurrentUser() user: User,
    @Param('id') paymentId: string,
  ) {
    return this.paymentsService.getPaymentStatus(user.id, paymentId);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Payment webhook callback' })
  async handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
