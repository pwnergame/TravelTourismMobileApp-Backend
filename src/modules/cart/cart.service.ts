import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quote, QuoteStatus } from './entities/quote.entity';
import { QuoteItem, ServiceType } from './entities/quote-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteItem)
    private readonly itemRepository: Repository<QuoteItem>,
  ) {}

  async getOrCreateQuote(userId: string): Promise<Quote> {
    let quote = await this.quoteRepository.findOne({
      where: { userId, status: QuoteStatus.DRAFT },
      relations: ['items'],
    });

    if (!quote) {
      quote = this.quoteRepository.create({
        userId,
        status: QuoteStatus.DRAFT,
        subtotal: 0,
        discount: 0,
        taxes: 0,
        total: 0,
        currency: 'SAR',
      });
      await this.quoteRepository.save(quote);
      quote.items = [];
    }

    return quote;
  }

  async addItem(userId: string, dto: AddToCartDto): Promise<Quote> {
    const quote = await this.getOrCreateQuote(userId);

    const item = this.itemRepository.create({
      quoteId: quote.id,
      serviceType: dto.serviceType,
      serviceId: dto.serviceId,
      serviceName: dto.serviceName,
      serviceDetails: dto.serviceDetails,
      travelers: dto.travelers,
      price: dto.price,
      currency: dto.currency || 'SAR',
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    await this.itemRepository.save(item);

    return this.recalculateQuote(quote.id);
  }

  async removeItem(userId: string, itemId: string): Promise<Quote> {
    const quote = await this.getOrCreateQuote(userId);

    const item = await this.itemRepository.findOne({
      where: { id: itemId, quoteId: quote.id },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.itemRepository.remove(item);

    return this.recalculateQuote(quote.id);
  }

  async applyPromoCode(userId: string, code: string): Promise<Quote> {
    const quote = await this.getOrCreateQuote(userId);

    // Mock promo code validation
    const validCodes: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
      SAVE10: { type: 'percentage', value: 10 },
      SAVE50: { type: 'fixed', value: 50 },
      WELCOME: { type: 'percentage', value: 15 },
    };

    const promo = validCodes[code.toUpperCase()];
    if (!promo) {
      throw new BadRequestException('Invalid promo code');
    }

    quote.promoCode = code.toUpperCase();
    quote.promoType = promo.type;
    quote.promoValue = promo.value;

    await this.quoteRepository.save(quote);

    return this.recalculateQuote(quote.id);
  }

  async removePromoCode(userId: string): Promise<Quote> {
    const quote = await this.getOrCreateQuote(userId);

    quote.promoCode = undefined;
    quote.promoType = undefined;
    quote.promoValue = undefined;
    quote.discount = 0;

    await this.quoteRepository.save(quote);

    return this.recalculateQuote(quote.id);
  }

  async checkout(userId: string): Promise<{ checkoutUrl: string; orderId: string }> {
    const quote = await this.getOrCreateQuote(userId);

    if (!quote.items || quote.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Check for expired items
    const now = new Date();
    const expiredItems = quote.items.filter(
      (item) => item.expiresAt && item.expiresAt < now,
    );

    if (expiredItems.length > 0) {
      throw new BadRequestException('Some items in cart have expired');
    }

    quote.status = QuoteStatus.PENDING_PAYMENT;
    await this.quoteRepository.save(quote);

    // In production, generate payment URL
    return {
      orderId: quote.id,
      checkoutUrl: `/payment/${quote.id}`,
    };
  }

  private async recalculateQuote(quoteId: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id: quoteId },
      relations: ['items'],
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    // Calculate subtotal
    quote.subtotal = quote.items.reduce((sum, item) => sum + Number(item.price), 0);

    // Calculate discount
    if (quote.promoCode && quote.promoType && quote.promoValue) {
      if (quote.promoType === 'percentage') {
        quote.discount = (quote.subtotal * quote.promoValue) / 100;
      } else {
        quote.discount = Math.min(quote.promoValue, quote.subtotal);
      }
    } else {
      quote.discount = 0;
    }

    // Calculate taxes (15% VAT)
    const taxableAmount = quote.subtotal - quote.discount;
    quote.taxes = taxableAmount * 0.15;

    // Calculate total
    quote.total = taxableAmount + quote.taxes;

    await this.quoteRepository.save(quote);

    return quote;
  }
}
