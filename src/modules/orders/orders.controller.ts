import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async getOrders(@CurrentUser() user: User, @Query() pagination: PaginationDto) {
    return this.ordersService.getOrders(user.id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async getOrder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.ordersService.getOrder(user.id, id);
  }

  @Get(':id/bookings/:bookingId')
  @ApiOperation({ summary: 'Get sub-booking details' })
  async getSubBooking(
    @CurrentUser() user: User,
    @Param('id') orderId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.ordersService.getSubBooking(user.id, orderId, bookingId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  async cancelOrder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.ordersService.cancelOrder(user.id, id);
  }
}
