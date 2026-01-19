import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Server
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  // Database
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().default('travel_superapp'),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
  DATABASE_SSL: Joi.boolean().default(false),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),

  // JWT
  JWT_SECRET: Joi.string().default('development-secret-key-change-in-production'),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // OTP
  OTP_LENGTH: Joi.number().default(6),
  OTP_EXPIRES_IN: Joi.number().default(300),
  OTP_RESEND_COOLDOWN: Joi.number().default(60),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // External Services (optional in development)
  TWILIO_ACCOUNT_SID: Joi.string().allow(''),
  TWILIO_AUTH_TOKEN: Joi.string().allow(''),
  TWILIO_PHONE_NUMBER: Joi.string().allow(''),
  TWILIO_WHATSAPP_NUMBER: Joi.string().allow(''),
  SENDGRID_API_KEY: Joi.string().allow(''),
  SENDGRID_FROM_EMAIL: Joi.string().email().default('noreply@travelsuperapp.com'),
  
  // Payment
  PAYMENT_GATEWAY_URL: Joi.string().allow(''),
  PAYMENT_GATEWAY_API_KEY: Joi.string().allow(''),
  PAYMENT_GATEWAY_SECRET: Joi.string().allow(''),

  // Providers
  AMADEUS_API_KEY: Joi.string().allow(''),
  AMADEUS_API_SECRET: Joi.string().allow(''),
  AMADEUS_BASE_URL: Joi.string().default('https://test.api.amadeus.com'),
  HOTELBEDS_API_KEY: Joi.string().allow(''),
  HOTELBEDS_SECRET: Joi.string().allow(''),
  HOTELBEDS_BASE_URL: Joi.string().default('https://api.test.hotelbeds.com'),
  VISA_PROVIDER_API_KEY: Joi.string().allow(''),
  VISA_PROVIDER_BASE_URL: Joi.string().allow(''),

  // AWS
  AWS_ACCESS_KEY_ID: Joi.string().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow(''),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().default('travel-superapp-documents'),

  // Encryption
  ENCRYPTION_KEY: Joi.string().min(32).allow(''),

  // App URLs
  APP_URL: Joi.string().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().default('http://localhost:8081'),
  CORS_ORIGINS: Joi.string().default('http://localhost:8081'),
});
