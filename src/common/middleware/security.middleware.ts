/**
 * Security Middleware & Utilities
 * Rate limiting, input sanitization, and security headers
 */

import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  
  // Rate limit configuration
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX = 100; // requests per window
  private readonly SEARCH_RATE_LIMIT_MAX = 20; // search requests per window

  use(req: Request, res: Response, next: NextFunction) {
    // Add security headers
    this.addSecurityHeaders(res);

    // Get client identifier
    const clientId = this.getClientId(req);

    // Check rate limit
    if (!this.checkRateLimit(clientId, req.path)) {
      this.logger.warn(`Rate limit exceeded for ${clientId} on ${req.path}`);
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Sanitize input
    if (req.body) {
      req.body = this.sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = this.sanitizeInput(req.query);
    }

    next();
  }

  private addSecurityHeaders(res: Response): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; img-src 'self' https: data:; script-src 'self'",
    );
    
    // Remove powered by header
    res.removeHeader('X-Powered-By');
    
    // Cache control for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
  }

  private getClientId(req: Request): string {
    // Use combination of IP and user agent for better identification
    const ip = 
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';
    
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Hash for privacy
    return `${ip}:${this.hashString(userAgent)}`;
  }

  private checkRateLimit(clientId: string, path: string): boolean {
    const now = Date.now();
    const key = `${clientId}:${path.includes('search') ? 'search' : 'general'}`;
    const limit = path.includes('search')
      ? this.SEARCH_RATE_LIMIT_MAX
      : this.RATE_LIMIT_MAX;

    const entry = this.rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetAt: now + this.RATE_LIMIT_WINDOW,
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  private sanitizeInput(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeInput(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key of Object.keys(obj)) {
        // Skip potentially dangerous keys
        if (this.isDangerousKey(key)) {
          continue;
        }
        sanitized[this.sanitizeString(key)] = this.sanitizeInput(obj[key]);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    return str
      // Remove null bytes
      .replace(/\0/g, '')
      // Escape HTML entities
      .replace(/[<>]/g, (char) => (char === '<' ? '&lt;' : '&gt;'))
      // Limit length
      .substring(0, 10000);
  }

  private isDangerousKey(key: string): boolean {
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    return dangerous.includes(key.toLowerCase());
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

/**
 * Input validation utilities
 */
export const ValidationUtils = {
  /**
   * Validate date format (YYYY-MM-DD)
   */
  isValidDate(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  },

  /**
   * Validate date is not in the past
   */
  isNotPastDate(date: string): boolean {
    const parsed = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed >= today;
  },

  /**
   * Validate airport code (IATA format)
   */
  isValidAirportCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code.toUpperCase());
  },

  /**
   * Validate currency code
   */
  isValidCurrency(code: string): boolean {
    const validCurrencies = ['SAR', 'USD', 'EUR', 'GBP', 'AED', 'EGP'];
    return validCurrencies.includes(code.toUpperCase());
  },

  /**
   * Validate phone number
   */
  isValidPhone(phone: string): boolean {
    // Saudi format or international
    return /^(\+966|966|0)?5\d{8}$/.test(phone.replace(/\s/g, ''));
  },

  /**
   * Validate email
   */
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  /**
   * Sanitize search query
   */
  sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .substring(0, 100)
      .replace(/[^\w\s\-.,]/gi, '');
  },
};
