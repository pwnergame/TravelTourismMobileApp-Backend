import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VisaApplication, VisaStatus } from './entities/visa-application.entity';

@Injectable()
export class VisaService {
  constructor(
    @InjectRepository(VisaApplication)
    private readonly applicationRepository: Repository<VisaApplication>,
  ) {}

  async getCountries(language: string = 'en'): Promise<any[]> {
    const isArabic = language.startsWith('ar');
    
    const countries = [
      // Gulf Countries
      { code: 'SA', nameEn: 'Saudi Arabia (KSA)', nameAr: 'المملكة العربية السعودية', flag: '🇸🇦', processingDays: '3-7' },
      { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', flag: '🇦🇪', processingDays: '1-2' },
      { code: 'OM', nameEn: 'Oman', nameAr: 'سلطنة عمان', flag: '🇴🇲', processingDays: '3-5' },
      { code: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭', processingDays: '2-3' },
      { code: 'QA', nameEn: 'Qatar', nameAr: 'قطر', flag: '🇶🇦', processingDays: '2-4' },
      // Asia
      { code: 'CN', nameEn: 'China', nameAr: 'الصين', flag: '🇨🇳', processingDays: '7-15' },
      { code: 'MY', nameEn: 'Malaysia', nameAr: 'ماليزيا', flag: '🇲🇾', processingDays: '3-5' },
      { code: 'TH', nameEn: 'Thailand', nameAr: 'تايلاند', flag: '🇹🇭', processingDays: '3-5' },
      // Middle East
      { code: 'TR', nameEn: 'Turkey', nameAr: 'تركيا', flag: '🇹🇷', processingDays: '3-5' },
      { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', flag: '🇪🇬', processingDays: '2-3' },
      // Western Countries
      { code: 'GB', nameEn: 'United Kingdom', nameAr: 'المملكة المتحدة', flag: '🇬🇧', processingDays: '15-20' },
      { code: 'US', nameEn: 'United States', nameAr: 'الولايات المتحدة', flag: '🇺🇸', processingDays: '30-60' },
      { code: 'EU', nameEn: 'Schengen Area', nameAr: 'منطقة شنغن', flag: '🇪🇺', processingDays: '15-30' },
    ];
    
    return countries.map(c => ({
      code: c.code,
      name: isArabic ? c.nameAr : c.nameEn,
      flag: c.flag,
      processingDays: c.processingDays,
    }));
  }

  async getVisaTypes(countryCode: string, language: string = 'en'): Promise<any[]> {
    const isArabic = language.startsWith('ar');
    
    // Localized visa type names
    const visaTypeNames: Record<string, { en: string; ar: string }> = {
      'tourist': { en: 'Tourist Visa', ar: 'تأشيرة سياحية' },
      'umrah': { en: 'Umrah Visa', ar: 'تأشيرة العمرة' },
      'business': { en: 'Business Visa', ar: 'تأشيرة عمل' },
      'work': { en: 'Work Visa', ar: 'تأشيرة عمل' },
      'work-visit': { en: 'Work Visit Visa', ar: 'تأشيرة زيارة عمل' },
      'transit': { en: 'Transit Visa', ar: 'تأشيرة ترانزيت' },
      'tourist-express': { en: 'Express Tourist Visa', ar: 'تأشيرة سياحية سريعة' },
      'evisa': { en: 'e-Visa', ar: 'تأشيرة إلكترونية' },
      'gcc-residents': { en: 'GCC Residents Visa', ar: 'تأشيرة مقيمي دول الخليج' },
      'tourist-multiple': { en: 'Multiple Entry Tourist', ar: 'تأشيرة سياحية متعددة' },
      'tourist-l': { en: 'Tourist Visa (L)', ar: 'تأشيرة سياحية (L)' },
      'business-m': { en: 'Business Visa (M)', ar: 'تأشيرة عمل (M)' },
      'work-z': { en: 'Work Visa (Z)', ar: 'تأشيرة عمل (Z)' },
      'student-x': { en: 'Student Visa (X)', ar: 'تأشيرة طالب (X)' },
      'transit-g': { en: 'Transit Visa (G)', ar: 'تأشيرة ترانزيت (G)' },
      'tourist-30': { en: '30 Day Tourist Visa', ar: 'تأشيرة سياحية 30 يوم' },
      'tourist-60': { en: '60 Day Tourist Visa', ar: 'تأشيرة سياحية 60 يوم' },
      'tourist-90': { en: '90 Day Tourist Visa', ar: 'تأشيرة سياحية 90 يوم' },
      'tourist-14': { en: '14 Day Tourist Visa', ar: 'تأشيرة سياحية 14 يوم' },
      'student': { en: 'Student Visa', ar: 'تأشيرة طالب' },
    };
    
    // Localized duration labels
    const formatDuration = (duration: string): string => {
      if (!isArabic) return duration;
      return duration
        .replace('days', 'يوم')
        .replace('day', 'يوم')
        .replace('months', 'شهور')
        .replace('month', 'شهر')
        .replace('hours', 'ساعة')
        .replace('hour', 'ساعة')
        .replace('year', 'سنة');
    };
    
    const getName = (id: string, fallback: string): string => {
      const names = visaTypeNames[id];
      return names ? (isArabic ? names.ar : names.en) : fallback;
    };
    
    // All prices are in EGP (base currency)
    // Country-specific visa types with EGP prices
    const visaTypesByCountry: Record<string, any[]> = {
      // Saudi Arabia - السعودية
      SA: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('90 days'), price: 11000 },
        { id: 'umrah', name: getName('umrah', 'Umrah Visa'), duration: formatDuration('30 days'), price: 15000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 75000 },
        { id: 'work-visit', name: getName('work-visit', 'Work Visit Visa'), duration: formatDuration('90 days'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('96 hours'), price: 3000 },
      ],
      // UAE - الإمارات
      AE: [
        { id: 'tourist-30', name: getName('tourist-30', '30 Day Tourist Visa'), duration: formatDuration('30 days'), price: 4000 },
        { id: 'tourist-60', name: getName('tourist-60', '60 Day Tourist Visa'), duration: formatDuration('60 days'), price: 8000 },
        { id: 'tourist-90', name: getName('tourist-90', '90 Day Tourist Visa'), duration: formatDuration('90 days'), price: 11000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('48 hours'), price: 2300 },
      ],
      // Oman - سلطنة عمان
      OM: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 3000 },
        { id: 'tourist-express', name: getName('tourist-express', 'Express Tourist Visa'), duration: formatDuration('30 days'), price: 5000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 3000 },
      ],
      // Bahrain - البحرين
      BH: [
        { id: 'tourist-14', name: getName('tourist-14', '14 Day Tourist Visa'), duration: formatDuration('14 days'), price: 4000 },
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 8000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'gcc-residents', name: getName('gcc-residents', 'GCC Residents Visa'), duration: formatDuration('14 days'), price: 2000 },
      ],
      // Qatar - قطر
      QA: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 2000 },
        { id: 'tourist-multiple', name: getName('tourist-multiple', 'Multiple Entry Tourist'), duration: formatDuration('1 year'), price: 15000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('96 hours'), price: 3000 },
      ],
      // China - الصين
      CN: [
        { id: 'tourist-l', name: getName('tourist-l', 'Tourist Visa (L)'), duration: formatDuration('30 days'), price: 20000 },
        { id: 'business-m', name: getName('business-m', 'Business Visa (M)'), duration: formatDuration('60 days'), price: 30000 },
        { id: 'work-z', name: getName('work-z', 'Work Visa (Z)'), duration: formatDuration('90 days'), price: 40000 },
        { id: 'student-x', name: getName('student-x', 'Student Visa (X)'), duration: formatDuration('180 days'), price: 50000 },
        { id: 'transit-g', name: getName('transit-g', 'Transit Visa (G)'), duration: formatDuration('7 days'), price: 5000 },
      ],
      // Malaysia - ماليزيا
      MY: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 4000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 3000 },
      ],
      // Turkey - تركيا
      TR: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('90 days'), price: 4000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 3000 },
      ],
      // Egypt - مصر
      EG: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 8000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 3000 },
      ],
      // UK - بريطانيا
      GB: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('6 months'), price: 20000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 80000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('48 hours'), price: 15000 },
      ],
      // USA - أمريكا
      US: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('6 months'), price: 25000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 150000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('48 hours'), price: 20000 },
      ],
      // Schengen - شنغن
      EU: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('90 days'), price: 15000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 90000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 9000 },
      ],
      // Thailand - تايلاند (default pricing)
      TH: [
        { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 5000 },
        { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
        { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 3000 },
      ],
    };

    // Return country-specific visa types or default types
    return visaTypesByCountry[countryCode] || [
      { id: 'tourist', name: getName('tourist', 'Tourist Visa'), duration: formatDuration('30 days'), price: 5000 },
      { id: 'work', name: getName('work', 'Work Visa'), duration: formatDuration('1 year'), price: 40000 },
      { id: 'transit', name: getName('transit', 'Transit Visa'), duration: formatDuration('72 hours'), price: 3000 },
    ];
  }

  async getRequirements(
    country: string,
    nationality: string,
    visaType: string,
  ): Promise<any> {
    // Country-specific requirements
    const requirementsByCountry: Record<string, any> = {
      SA: {
        documents: [
          { id: 'passport', name: 'Valid Passport', description: 'At least 6 months validity, with 2 blank pages' },
          { id: 'photo', name: 'Passport Photo', description: 'White background, recent (within 6 months)' },
          { id: 'application', name: 'Application Form', description: 'Completely filled and signed' },
          { id: 'insurance', name: 'Travel Insurance', description: 'Covering full stay duration' },
          { id: 'vaccination', name: 'COVID Vaccination', description: 'Full vaccination certificate (if required)' },
        ],
        processingTime: '3-7 business days',
        price: { amount: 450, currency: 'SAR' },
        validity: '90 days',
        entries: 'Multiple',
        notes: 'Saudi Tourist Visa allows visits to all cities including Makkah and Madinah',
      },
      OM: {
        documents: [
          { id: 'passport', name: 'Valid Passport', description: 'At least 6 months validity' },
          { id: 'photo', name: 'Passport Photo', description: 'White background, recent' },
          { id: 'return-ticket', name: 'Return Ticket', description: 'Confirmed return flight booking' },
          { id: 'hotel', name: 'Hotel Booking', description: 'Confirmed accommodation for entire stay' },
          { id: 'bank', name: 'Bank Statement', description: 'Last 3 months showing sufficient funds' },
        ],
        processingTime: '3-5 business days',
        price: { amount: 80, currency: 'SAR' },
        validity: '30 days',
        entries: 'Single',
        notes: 'e-Visa available for most nationalities',
      },
      BH: {
        documents: [
          { id: 'passport', name: 'Valid Passport', description: 'At least 6 months validity' },
          { id: 'photo', name: 'Passport Photo', description: 'White background' },
          { id: 'hotel', name: 'Hotel Booking', description: 'Confirmed reservation' },
          { id: 'ticket', name: 'Flight Reservation', description: 'Round trip ticket' },
        ],
        processingTime: '2-3 business days',
        price: { amount: 75, currency: 'SAR' },
        validity: '14 days',
        entries: 'Single',
        notes: 'e-Visa on arrival available for GCC residents',
      },
      QA: {
        documents: [
          { id: 'passport', name: 'Valid Passport', description: 'At least 6 months validity' },
          { id: 'photo', name: 'Passport Photo', description: 'White background, biometric' },
          { id: 'return-ticket', name: 'Return Ticket', description: 'Confirmed departure flight' },
          { id: 'hotel', name: 'Hotel Booking', description: 'Confirmed accommodation' },
          { id: 'funds', name: 'Proof of Funds', description: 'Bank statement or credit card' },
        ],
        processingTime: '2-4 business days',
        price: { amount: 110, currency: 'SAR' },
        validity: '30 days',
        entries: 'Single',
        notes: 'Free transit visa for up to 96 hours',
      },
      CN: {
        documents: [
          { id: 'passport', name: 'Valid Passport', description: 'At least 6 months validity, 2 blank pages' },
          { id: 'photo', name: 'Passport Photo', description: 'White background, 48x33mm, recent' },
          { id: 'application', name: 'Application Form', description: 'V.2013 form completed in full' },
          { id: 'itinerary', name: 'Travel Itinerary', description: 'Detailed day-by-day plan' },
          { id: 'hotel', name: 'Hotel Booking', description: 'All accommodations confirmed' },
          { id: 'ticket', name: 'Flight Booking', description: 'Round trip flight reservation' },
          { id: 'bank', name: 'Bank Statement', description: 'Last 3 months, minimum balance required' },
          { id: 'employment', name: 'Employment Letter', description: 'From employer with salary details' },
        ],
        processingTime: '7-15 business days',
        price: { amount: 180, currency: 'SAR' },
        validity: '30 days',
        entries: 'Single',
        notes: 'Visa-free transit available at some airports for 72-144 hours',
      },
    };

    // Return country-specific requirements or default requirements
    return requirementsByCountry[country] || {
      documents: [
        { id: 'passport', name: 'Valid Passport', description: 'At least 6 months validity' },
        { id: 'photo', name: 'Passport Photo', description: '4x6 white background' },
        { id: 'application', name: 'Application Form', description: 'Filled and signed' },
        { id: 'bank', name: 'Bank Statement', description: 'Last 3 months' },
        { id: 'ticket', name: 'Flight Ticket', description: 'Round trip reservation' },
        { id: 'hotel', name: 'Hotel Booking', description: 'Confirmed reservation' },
      ],
      processingTime: '3-5 business days',
      price: { amount: 250, currency: 'SAR' },
      validity: '30 days',
      entries: 'Single',
    };
  }

  async createApplication(userId: string, dto: any): Promise<VisaApplication> {
    const application = this.applicationRepository.create({
      userId,
      country: dto.country,
      visaType: dto.visaType,
      travelers: dto.travelers,
      status: VisaStatus.DRAFT,
    });

    return this.applicationRepository.save(application);
  }

  async getApplications(userId: string): Promise<VisaApplication[]> {
    return this.applicationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getApplication(userId: string, id: string): Promise<VisaApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id, userId },
    });

    if (!application) {
      throw new NotFoundException('Visa application not found');
    }

    return application;
  }
}
