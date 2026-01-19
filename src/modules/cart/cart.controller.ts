import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { ApplyPromoDto } from './dto/apply-promo.dto';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current cart/quote' })
  async getCart(@CurrentUser() user: User) {
    return this.cartService.getOrCreateQuote(user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@CurrentUser() user: User, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(user.id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser() user: User, @Param('id') itemId: string) {
    return this.cartService.removeItem(user.id, itemId);
  }

  @Post('promo')
  @ApiOperation({ summary: 'Apply promo code' })
  async applyPromo(@CurrentUser() user: User, @Body() dto: ApplyPromoDto) {
    return this.cartService.applyPromoCode(user.id, dto.code);
  }

  @Delete('promo')
  @ApiOperation({ summary: 'Remove promo code' })
  async removePromo(@CurrentUser() user: User) {
    return this.cartService.removePromoCode(user.id);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Proceed to checkout' })
  async checkout(@CurrentUser() user: User) {
    return this.cartService.checkout(user.id);
  }
}
