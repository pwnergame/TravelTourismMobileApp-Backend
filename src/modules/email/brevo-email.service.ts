import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, any>;
}

interface BrevoResponse {
  messageId?: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class BrevoEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly apiUrl = 'https://api.brevo.com/v3/smtp/email';

  // Brand configuration - update these when rebranding
  private readonly brandName = 'Direct Travel';
  private readonly brandColor = '#0066CC';
  private readonly brandTagline = 'Your one-stop solution for all travel needs';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('BREVO_API_KEY', '');
    this.fromEmail = this.configService.get<string>('EMAIL_FROM_ADDRESS', 'noreply@example.com');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Direct Travel');
  }

  async sendEmail(params: SendEmailParams): Promise<BrevoResponse> {
    const { to, subject, htmlContent, textContent, templateId, params: templateParams } = params;

    if (!this.apiKey) {
      this.logger.warn('Brevo API key not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    const recipients = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];

    const payload: Record<string, any> = {
      sender: {
        name: this.fromName,
        email: this.fromEmail,
      },
      to: recipients,
      subject,
    };

    if (templateId) {
      payload.templateId = templateId;
      if (templateParams) {
        payload.params = templateParams;
      }
    } else {
      if (htmlContent) payload.htmlContent = htmlContent;
      if (textContent) payload.textContent = textContent;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this.logger.error(`Brevo API error: ${response.status} - ${JSON.stringify(errorData)}`);
        return { success: false, error: errorData.message || 'Failed to send email' };
      }

      const data = await response.json();
      this.logger.log(`Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}`);
      return { success: true, messageId: data.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async sendOtpEmail(email: string, otp: string): Promise<BrevoResponse> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${this.brandColor}; margin: 0;">✈️ ${this.brandName}</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">${this.brandTagline}</p>
          </div>
          <div style="text-align: center;">
            <h2 style="color: #333; margin-bottom: 10px;">Your Verification Code</h2>
            <p style="color: #666; margin-bottom: 30px;">Use the code below to verify your email address. This code will expire in 5 minutes.</p>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${this.brandColor};">${otp}</span>
            </div>
            <p style="color: #999; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Your verification code is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, please ignore this email.`;

    return this.sendEmail({
      to: email,
      subject: `Your verification code: ${otp}`,
      htmlContent,
      textContent,
    });
  }

  async sendOrderConfirmation(
    email: string,
    orderDetails: { orderId: string; items: string[]; total: number; currency: string },
  ): Promise<BrevoResponse> {
    const itemsList = orderDetails.items.map(item => `<li>${item}</li>`).join('');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: ${this.brandColor}; margin: 0;">✈️ ${this.brandName}</h1>
          </div>
          <h2 style="color: #333;">Order Confirmed! ✅</h2>
          <p>Thank you for your order. Here are your order details:</p>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <h3>Items:</h3>
          <ul>${itemsList}</ul>
          <p><strong>Total:</strong> ${orderDetails.currency} ${orderDetails.total.toFixed(2)}</p>
          <p style="color: #666; margin-top: 30px;">Thank you for choosing ${this.brandName}!</p>
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Order Confirmation - ${orderDetails.orderId}`,
      htmlContent,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<BrevoResponse> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; text-align: center;">
          <h1 style="color: ${this.brandColor};">Welcome to ${this.brandName}! 🎉</h1>
          <p style="color: #666; font-size: 16px;">Hi ${name},</p>
          <p style="color: #666; font-size: 16px;">We're excited to have you on board. Start exploring the best travel deals!</p>
          <div style="margin: 30px 0;">
            <a href="#" style="background-color: ${this.brandColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Explore Now</a>
          </div>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Welcome to ${this.fromName}!`,
      htmlContent,
    });
  }
}
