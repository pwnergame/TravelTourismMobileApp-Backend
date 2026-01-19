export default () => ({
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    name: process.env.DATABASE_NAME || 'travel_superapp',
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    ssl: process.env.DATABASE_SSL === 'true',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // OTP
  otp: {
    length: parseInt(process.env.OTP_LENGTH || '6', 10),
    expiresIn: parseInt(process.env.OTP_EXPIRES_IN || '300', 10),
    resendCooldown: parseInt(process.env.OTP_RESEND_COOLDOWN || '60', 10),
  },

  // Rate Limiting
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },

  // Twilio (SMS & WhatsApp)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  },

  // SendGrid (Email)
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@travelsuperapp.com',
  },

  // Payment Gateway
  payment: {
    gatewayUrl: process.env.PAYMENT_GATEWAY_URL,
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY,
    secret: process.env.PAYMENT_GATEWAY_SECRET,
  },

  // Amadeus (Flights)
  amadeus: {
    apiKey: process.env.AMADEUS_API_KEY,
    apiSecret: process.env.AMADEUS_API_SECRET,
    baseUrl: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com',
  },

  // RapidAPI
  rapidapi: {
    key: process.env.RAPIDAPI_KEY,
    flights: {
      host: process.env.RAPIDAPI_FLIGHTS_HOST || 'sky-scrapper3.p.rapidapi.com',
      baseUrl: 'https://sky-scrapper3.p.rapidapi.com',
    },
    hotels: {
      host: process.env.RAPIDAPI_HOTELS_HOST || 'booking-com.p.rapidapi.com',
      baseUrl: 'https://booking-com.p.rapidapi.com',
    },
  },

  // Hotelbeds (Hotels)
  hotelbeds: {
    apiKey: process.env.HOTELBEDS_API_KEY,
    secret: process.env.HOTELBEDS_SECRET,
    baseUrl: process.env.HOTELBEDS_BASE_URL || 'https://api.test.hotelbeds.com',
  },

  // Visa Provider
  visa: {
    apiKey: process.env.VISA_PROVIDER_API_KEY,
    baseUrl: process.env.VISA_PROVIDER_BASE_URL,
  },

  // AWS S3
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'travel-superapp-documents',
  },

  // Encryption
  encryption: {
    key: process.env.ENCRYPTION_KEY,
  },

  // App URLs
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',
  },
});
