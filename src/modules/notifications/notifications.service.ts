import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export enum NotificationType {
  SMS = 'sms',
  EMAIL = 'email',
  PUSH = 'push',
  WHATSAPP = 'whatsapp',
}

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  template: string;
  data: Record<string, any>;
  recipient?: string; // phone or email
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  async send(payload: NotificationPayload): Promise<void> {
    await this.notificationQueue.add('send', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    this.logger.log(`Notification queued: ${payload.type} - ${payload.template}`);
  }

  async sendOrderConfirmation(userId: string, orderId: string, email: string): Promise<void> {
    await this.send({
      userId,
      type: NotificationType.EMAIL,
      template: 'order-confirmation',
      data: { orderId },
      recipient: email,
    });
  }

  async sendPaymentReceipt(userId: string, paymentId: string, email: string): Promise<void> {
    await this.send({
      userId,
      type: NotificationType.EMAIL,
      template: 'payment-receipt',
      data: { paymentId },
      recipient: email,
    });
  }

  async sendBookingReminder(userId: string, bookingId: string, phone: string): Promise<void> {
    await this.send({
      userId,
      type: NotificationType.SMS,
      template: 'booking-reminder',
      data: { bookingId },
      recipient: phone,
    });
  }

  async sendVisaStatusUpdate(userId: string, applicationId: string, status: string): Promise<void> {
    await this.send({
      userId,
      type: NotificationType.PUSH,
      template: 'visa-status-update',
      data: { applicationId, status },
    });
  }
}
