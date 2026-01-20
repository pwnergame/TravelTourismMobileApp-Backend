import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from './entities/order.entity';
import { SubBooking, BookingStatus, ServiceType } from './entities/sub-booking.entity';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(SubBooking)
    private readonly bookingRepository: Repository<SubBooking>,
  ) {}

  async getOrders(
    userId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Order>> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      relations: ['subBookings'],
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });

    return new PaginatedResult(orders, pagination.page, pagination.limit, total);
  }

  async getOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['subBookings'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getSubBooking(
    userId: string,
    orderId: string,
    bookingId: string,
  ): Promise<SubBooking> {
    const order = await this.getOrder(userId, orderId);

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId, orderId: order.id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.getOrder(userId, orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Completed orders cannot be cancelled');
    }

    // Check cancellation policy
    // In production, verify refund eligibility

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    // Cancel all sub-bookings
    await this.bookingRepository.update(
      { orderId: order.id },
      { status: BookingStatus.CANCELLED },
    );

    return order;
  }

  async createOrderFromQuote(quoteId: string, userId: string): Promise<Order> {
    // This would be called after successful payment
    // Convert quote to order and create sub-bookings
    
    const order = this.orderRepository.create({
      userId,
      quoteId,
      status: OrderStatus.CONFIRMED,
      orderNumber: this.generateOrderNumber(),
    });

    return this.orderRepository.save(order);
  }

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order> {
    // Determine order status based on payment method
    let orderStatus = OrderStatus.PENDING;
    if (dto.status === 'confirmed') {
      orderStatus = OrderStatus.CONFIRMED;
    } else if (dto.status === 'under_review') {
      orderStatus = OrderStatus.PROCESSING;
    }

    // Create the order
    const order = this.orderRepository.create({
      userId,
      quoteId: dto.quoteId,
      orderNumber: this.generateOrderNumber(),
      status: orderStatus,
      subtotal: dto.subtotal,
      discount: dto.discount || 0,
      taxes: dto.taxes || 0,
      total: dto.total,
      currency: dto.currency,
      paymentMethod: dto.paymentMethod,
      paymentReference: dto.paymentReference,
      paidAt: dto.status === 'confirmed' ? new Date() : undefined,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create sub-bookings for each item
    const subBookings = dto.items.map((item) => {
      const bookingStatus = orderStatus === OrderStatus.CONFIRMED 
        ? BookingStatus.CONFIRMED 
        : BookingStatus.PENDING;

      return this.bookingRepository.create({
        orderId: savedOrder.id,
        serviceType: item.serviceType,
        bookingReference: item.bookingReference || this.generateBookingReference(item.serviceType),
        status: bookingStatus,
        details: { ...item.details, title: item.title },
        travelers: item.travelers,
        price: item.price,
        currency: item.currency,
        serviceDate: item.serviceDate ? new Date(item.serviceDate) : undefined,
      });
    });

    await this.bookingRepository.save(subBookings);

    // Reload with sub-bookings
    return this.getOrder(userId, savedOrder.id);
  }

  private generateBookingReference(serviceType: ServiceType): string {
    const prefixes: Record<ServiceType, string> = {
      [ServiceType.FLIGHT]: 'FLT',
      [ServiceType.HOTEL]: 'HTL',
      [ServiceType.VISA]: 'VIS',
      [ServiceType.HAJJ]: 'HJJ',
      [ServiceType.PACKAGE]: 'PKG',
    };
    const prefix = prefixes[serviceType] || 'BKG';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  private generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
