import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HajjPackage } from './entities/hajj-package.entity';

@Injectable()
export class HajjService {
  constructor(
    @InjectRepository(HajjPackage)
    private readonly packageRepository: Repository<HajjPackage>,
  ) {}

  async getPackages(type?: 'hajj' | 'umrah', lang: string = 'en'): Promise<any[]> {
    const packages = this.getPackageData(lang);

    if (type) {
      return packages.filter((p) => p.type === type);
    }

    return packages;
  }

  async getPackage(id: string, lang: string = 'en'): Promise<any> {
    const packages = this.getPackageData(lang);
    return packages.find((p) => p.id === id);
  }

  private getPackageData(lang: string = 'en'): any[] {
    const isArabic = lang === 'ar';

    // All prices are in EGP (Egyptian Pounds) as base currency
    return [
      {
        id: 'umrah-10days',
        type: 'umrah',
        name: isArabic ? 'باقة العمرة 10 أيام (20 رمضان)' : '10-Day Umrah Package (20th Ramadan)',
        description: isArabic 
          ? 'رحلة عمرة قصيرة مثالية للجداول المزدحمة، تشمل إقامة مميزة قريبة من الحرم'
          : 'Short Umrah trip perfect for busy schedules with premium accommodation near Haram',
        duration: isArabic ? '10 أيام' : '10 days',
        durationNights: 9,
        price: { amount: 30000, currency: 'EGP' },
        rating: 4.6,
        reviewCount: 128,
        images: [
          'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
        ],
        includes: isArabic 
          ? ['الطيران', 'الفندق', 'المواصلات', 'الإفطار']
          : ['Flights', 'Hotel', 'Transportation', 'Breakfast'],
        inclusions: isArabic
          ? ['تذاكر الطيران ذهاب وعودة', 'إقامة فندقية 4 نجوم', 'المواصلات من وإلى المطار', 'وجبة الإفطار يومياً', 'مرشد ديني', 'تأشيرة العمرة']
          : ['Round-trip flights', '4-star hotel accommodation', 'Airport transfers', 'Daily breakfast', 'Religious guide', 'Umrah visa'],
        exclusions: isArabic
          ? ['المصاريف الشخصية', 'الغداء والعشاء', 'التأمين الصحي']
          : ['Personal expenses', 'Lunch and dinner', 'Travel insurance'],
        makkahHotel: isArabic ? '4 نجوم، 400 متر من الحرم' : '4-star, 400m from Haram',
        madinahHotel: isArabic ? '4 نجوم، 300 متر من المسجد النبوي' : '4-star, 300m from Prophet Mosque',
        departureDates: isArabic ? ['كل جمعة'] : ['Every Friday'],
        hotels: [
          {
            city: isArabic ? 'مكة المكرمة' : 'Makkah',
            name: isArabic ? 'فندق الصفوة رويال أوركيد' : 'Al Safwah Royale Orchid Hotel',
            starRating: 4,
            nights: 5,
            distanceToHaram: isArabic ? '400 متر' : '400m',
          },
          {
            city: isArabic ? 'المدينة المنورة' : 'Madinah',
            name: isArabic ? 'فندق المدينة موفنبيك' : 'Madinah Movenpick Hotel',
            starRating: 4,
            nights: 4,
            distanceToHaram: isArabic ? '300 متر' : '300m',
          },
        ],
        transportation: [
          {
            type: isArabic ? 'الطيران' : 'Flight',
            description: isArabic ? 'رحلات مباشرة على الخطوط السعودية' : 'Direct flights on Saudia Airlines',
          },
          {
            type: isArabic ? 'الحافلة' : 'Bus',
            description: isArabic ? 'حافلات VIP مكيفة بين مكة والمدينة' : 'VIP air-conditioned buses between Makkah and Madinah',
          },
          {
            type: isArabic ? 'النقل' : 'Transfer',
            description: isArabic ? 'نقل خاص من وإلى المطار' : 'Private airport transfers',
          },
        ],
        itinerary: [
          {
            day: 1,
            title: isArabic ? 'الوصول إلى جدة' : 'Arrival in Jeddah',
            description: isArabic ? 'الوصول والانتقال إلى مكة المكرمة' : 'Arrival and transfer to Makkah',
            activities: isArabic 
              ? ['الوصول إلى مطار جدة', 'الانتقال إلى فندق مكة', 'أداء العمرة']
              : ['Arrive at Jeddah Airport', 'Transfer to Makkah hotel', 'Perform Umrah'],
          },
          {
            day: 2,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'العبادة والصلاة في الحرم المكي' : 'Worship and prayers at Masjid Al-Haram',
            activities: isArabic
              ? ['صلاة الفجر في الحرم', 'الطواف والسعي', 'حلقات العلم']
              : ['Fajr prayer at Haram', 'Tawaf and Sa\'i', 'Islamic lectures'],
          },
          {
            day: 3,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'مواصلة العبادة' : 'Continue worship',
            activities: isArabic
              ? ['الصلوات الخمس في الحرم', 'قراءة القرآن', 'الدعاء']
              : ['Five daily prayers at Haram', 'Quran recitation', 'Supplication'],
          },
          {
            day: 4,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'مواصلة العبادة' : 'Continue worship',
            activities: isArabic
              ? ['الطواف', 'زيارة المعالم الإسلامية', 'التسوق']
              : ['Tawaf', 'Visit Islamic landmarks', 'Shopping'],
          },
          {
            day: 5,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'اليوم الأخير في مكة' : 'Last day in Makkah',
            activities: isArabic
              ? ['طواف الوداع', 'الاستعداد للسفر إلى المدينة']
              : ['Farewell Tawaf', 'Prepare for Madinah journey'],
          },
          {
            day: 6,
            title: isArabic ? 'الانتقال إلى المدينة' : 'Transfer to Madinah',
            description: isArabic ? 'السفر إلى المدينة المنورة' : 'Travel to Madinah Al-Munawwarah',
            activities: isArabic
              ? ['المغادرة إلى المدينة', 'الوصول والتسكين', 'زيارة المسجد النبوي']
              : ['Depart for Madinah', 'Check-in at hotel', 'Visit Prophet\'s Mosque'],
          },
          {
            day: 7,
            title: isArabic ? 'أيام في المدينة' : 'Days in Madinah',
            description: isArabic ? 'العبادة في المسجد النبوي' : 'Worship at Prophet\'s Mosque',
            activities: isArabic
              ? ['الصلاة في الروضة الشريفة', 'زيارة البقيع', 'جولة في المدينة']
              : ['Prayer at Rawdah', 'Visit Baqi cemetery', 'Madinah city tour'],
          },
          {
            day: 8,
            title: isArabic ? 'أيام في المدينة' : 'Days in Madinah',
            description: isArabic ? 'زيارة المعالم الإسلامية' : 'Visit Islamic landmarks',
            activities: isArabic
              ? ['زيارة مسجد قباء', 'زيارة جبل أحد', 'زيارة مسجد القبلتين']
              : ['Visit Quba Mosque', 'Visit Mount Uhud', 'Visit Qiblatain Mosque'],
          },
          {
            day: 9,
            title: isArabic ? 'أيام في المدينة' : 'Days in Madinah',
            description: isArabic ? 'اليوم الأخير في المدينة' : 'Last day in Madinah',
            activities: isArabic
              ? ['الصلوات في المسجد النبوي', 'التسوق', 'الاستعداد للمغادرة']
              : ['Prayers at Prophet\'s Mosque', 'Shopping', 'Prepare for departure'],
          },
          {
            day: 10,
            title: isArabic ? 'المغادرة' : 'Departure',
            description: isArabic ? 'العودة إلى الوطن' : 'Return home',
            activities: isArabic
              ? ['الانتقال إلى المطار', 'المغادرة']
              : ['Transfer to airport', 'Departure'],
          },
        ],
        visaIncluded: true,
        flightIncluded: true,
        guidanceIncluded: true,
        mealsIncluded: isArabic ? 'إفطار' : 'Breakfast',
        maxGroupSize: 50,
        spotsRemaining: 15,
      },
      {
        id: 'umrah-14days',
        type: 'umrah',
        name: isArabic ? 'باقة العمرة 14 يوم (أول رمضان)' : '14-Day Umrah Package (1st of Ramadan)',
        description: isArabic 
          ? 'باقة عمرة ممتدة لتجربة روحانية أعمق مع جولات زيارة شاملة'
          : 'Extended Umrah package for a deeper spiritual experience with comprehensive Ziyarat tours',
        duration: isArabic ? '14 يوم' : '14 days',
        durationNights: 13,
        price: { amount: 35000, currency: 'EGP' },
        rating: 4.8,
        reviewCount: 256,
        images: [
          'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
        ],
        includes: isArabic 
          ? ['الطيران', 'الفندق', 'المواصلات', 'نصف إقامة', 'جولات الزيارة']
          : ['Flights', 'Hotel', 'Transportation', 'Half Board', 'Ziyarat Tours'],
        inclusions: isArabic
          ? ['تذاكر الطيران ذهاب وعودة', 'إقامة فندقية 4 نجوم', 'المواصلات من وإلى المطار', 'وجبتي الإفطار والعشاء', 'جولات زيارة كاملة', 'مرشد ديني', 'تأشيرة العمرة']
          : ['Round-trip flights', '4-star hotel accommodation', 'Airport transfers', 'Breakfast and dinner', 'Full Ziyarat tours', 'Religious guide', 'Umrah visa'],
        exclusions: isArabic
          ? ['المصاريف الشخصية', 'الغداء', 'التأمين الصحي']
          : ['Personal expenses', 'Lunch', 'Travel insurance'],
        makkahHotel: isArabic ? '4 نجوم، 300 متر من الحرم' : '4-star, 300m from Haram',
        madinahHotel: isArabic ? '4 نجوم، 200 متر من المسجد النبوي' : '4-star, 200m from Prophet Mosque',
        departureDates: isArabic ? ['كل جمعة'] : ['Every Friday'],
        hotels: [
          {
            city: isArabic ? 'مكة المكرمة' : 'Makkah',
            name: isArabic ? 'فندق هيلتون مكة' : 'Hilton Makkah Convention Hotel',
            starRating: 4,
            nights: 7,
            distanceToHaram: isArabic ? '300 متر' : '300m',
          },
          {
            city: isArabic ? 'المدينة المنورة' : 'Madinah',
            name: isArabic ? 'فندق كراون بلازا المدينة' : 'Crowne Plaza Madinah',
            starRating: 4,
            nights: 6,
            distanceToHaram: isArabic ? '200 متر' : '200m',
          },
        ],
        transportation: [
          {
            type: isArabic ? 'الطيران' : 'Flight',
            description: isArabic ? 'رحلات مباشرة على الخطوط السعودية' : 'Direct flights on Saudia Airlines',
          },
          {
            type: isArabic ? 'الحافلة' : 'Bus',
            description: isArabic ? 'حافلات VIP مكيفة لجميع التنقلات' : 'VIP air-conditioned buses for all transfers',
          },
          {
            type: isArabic ? 'جولات الزيارة' : 'Ziyarat Tours',
            description: isArabic ? 'جولات يومية لزيارة المعالم الإسلامية' : 'Daily tours to Islamic landmarks',
          },
        ],
        itinerary: [
          {
            day: 1,
            title: isArabic ? 'الوصول إلى جدة' : 'Arrival in Jeddah',
            description: isArabic ? 'الوصول والانتقال إلى مكة المكرمة' : 'Arrival and transfer to Makkah',
            activities: isArabic 
              ? ['الوصول إلى مطار جدة', 'الانتقال إلى فندق مكة', 'أداء العمرة']
              : ['Arrive at Jeddah Airport', 'Transfer to Makkah hotel', 'Perform Umrah'],
          },
          {
            day: 2,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'العبادة والصلاة في الحرم المكي' : 'Worship and prayers at Masjid Al-Haram',
            activities: isArabic
              ? ['صلاة الفجر في الحرم', 'الطواف والسعي', 'حلقات العلم']
              : ['Fajr prayer at Haram', 'Tawaf and Sa\'i', 'Islamic lectures'],
          },
          {
            day: 3,
            title: isArabic ? 'جولة مكة التاريخية' : 'Makkah Historical Tour',
            description: isArabic ? 'زيارة المعالم التاريخية في مكة' : 'Visit historical sites in Makkah',
            activities: isArabic
              ? ['زيارة غار حراء', 'زيارة غار ثور', 'زيارة مسجد الجن']
              : ['Visit Cave of Hira', 'Visit Cave of Thawr', 'Visit Masjid Al-Jinn'],
          },
          {
            day: 4,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'مواصلة العبادة' : 'Continue worship',
            activities: isArabic
              ? ['الصلوات الخمس في الحرم', 'قراءة القرآن', 'الدعاء']
              : ['Five daily prayers at Haram', 'Quran recitation', 'Supplication'],
          },
          {
            day: 5,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'مواصلة العبادة' : 'Continue worship',
            activities: isArabic
              ? ['الطواف', 'الاعتكاف', 'قيام الليل']
              : ['Tawaf', 'I\'tikaf', 'Night prayers'],
          },
          {
            day: 6,
            title: isArabic ? 'أيام في مكة' : 'Days in Makkah',
            description: isArabic ? 'مواصلة العبادة' : 'Continue worship',
            activities: isArabic
              ? ['الصلوات في الحرم', 'التسوق', 'وقت حر']
              : ['Prayers at Haram', 'Shopping', 'Free time'],
          },
          {
            day: 7,
            title: isArabic ? 'اليوم الأخير في مكة' : 'Last Day in Makkah',
            description: isArabic ? 'الاستعداد للسفر إلى المدينة' : 'Prepare for Madinah journey',
            activities: isArabic
              ? ['طواف الوداع', 'الانتقال إلى المدينة']
              : ['Farewell Tawaf', 'Transfer to Madinah'],
          },
          {
            day: 8,
            title: isArabic ? 'الوصول إلى المدينة' : 'Arrival in Madinah',
            description: isArabic ? 'الوصول والتسكين' : 'Arrival and check-in',
            activities: isArabic
              ? ['الوصول إلى فندق المدينة', 'زيارة المسجد النبوي', 'الصلاة في الروضة']
              : ['Arrive at Madinah hotel', 'Visit Prophet\'s Mosque', 'Prayer at Rawdah'],
          },
          {
            day: 9,
            title: isArabic ? 'جولة المدينة' : 'Madinah Tour',
            description: isArabic ? 'زيارة المعالم الإسلامية' : 'Visit Islamic landmarks',
            activities: isArabic
              ? ['زيارة مسجد قباء', 'زيارة البقيع', 'زيارة مسجد القبلتين']
              : ['Visit Quba Mosque', 'Visit Baqi cemetery', 'Visit Qiblatain Mosque'],
          },
          {
            day: 10,
            title: isArabic ? 'جولة جبل أحد' : 'Mount Uhud Tour',
            description: isArabic ? 'زيارة جبل أحد والمعالم المحيطة' : 'Visit Mount Uhud and surrounding sites',
            activities: isArabic
              ? ['زيارة جبل أحد', 'زيارة مقبرة شهداء أحد', 'زيارة مسجد الفتح']
              : ['Visit Mount Uhud', 'Visit Uhud martyrs cemetery', 'Visit Masjid Al-Fath'],
          },
          {
            day: 11,
            title: isArabic ? 'أيام في المدينة' : 'Days in Madinah',
            description: isArabic ? 'العبادة في المسجد النبوي' : 'Worship at Prophet\'s Mosque',
            activities: isArabic
              ? ['الصلوات الخمس', 'قراءة القرآن', 'الدعاء']
              : ['Five daily prayers', 'Quran recitation', 'Supplication'],
          },
          {
            day: 12,
            title: isArabic ? 'أيام في المدينة' : 'Days in Madinah',
            description: isArabic ? 'مواصلة العبادة' : 'Continue worship',
            activities: isArabic
              ? ['الصلوات في المسجد النبوي', 'التسوق', 'وقت حر']
              : ['Prayers at Prophet\'s Mosque', 'Shopping', 'Free time'],
          },
          {
            day: 13,
            title: isArabic ? 'اليوم الأخير في المدينة' : 'Last Day in Madinah',
            description: isArabic ? 'الوداع والاستعداد للمغادرة' : 'Farewell and prepare for departure',
            activities: isArabic
              ? ['صلاة الوداع', 'زيارة أخيرة للروضة', 'الاستعداد للمغادرة']
              : ['Farewell prayers', 'Final visit to Rawdah', 'Prepare for departure'],
          },
          {
            day: 14,
            title: isArabic ? 'المغادرة' : 'Departure',
            description: isArabic ? 'العودة إلى الوطن' : 'Return home',
            activities: isArabic
              ? ['الانتقال إلى المطار', 'المغادرة']
              : ['Transfer to airport', 'Departure'],
          },
        ],
        visaIncluded: true,
        flightIncluded: true,
        guidanceIncluded: true,
        mealsIncluded: isArabic ? 'نصف إقامة' : 'Half Board',
        maxGroupSize: 40,
        spotsRemaining: 8,
      },
      {
        id: 'umrah-30days',
        type: 'umrah',
        name: isArabic ? 'باقة العمرة 30 يوم (رمضان كامل)' : '30-Day Umrah Package (Whole Ramadan)',
        description: isArabic 
          ? 'باقة رمضان الكاملة - عش شهر رمضان المبارك في مكة والمدينة'
          : 'Complete Ramadan package - Experience the blessed month of Ramadan in Makkah and Madinah',
        duration: isArabic ? '30 يوم' : '30 days',
        durationNights: 29,
        price: { amount: 50000, currency: 'EGP' },
        rating: 4.9,
        reviewCount: 512,
        images: [
          'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800',
        ],
        includes: isArabic 
          ? ['الطيران', 'الفندق', 'المواصلات', 'إقامة كاملة', 'جولات الزيارة']
          : ['Flights', 'Hotel', 'Transportation', 'Full Board', 'Ziyarat Tours'],
        inclusions: isArabic
          ? ['تذاكر الطيران ذهاب وعودة', 'إقامة فندقية 4 نجوم', 'جميع المواصلات', 'ثلاث وجبات يومياً', 'جولات زيارة كاملة', 'مرشد ديني', 'تأشيرة العمرة', 'هدايا رمضانية']
          : ['Round-trip flights', '4-star hotel accommodation', 'All transfers', 'Three daily meals', 'Full Ziyarat tours', 'Religious guide', 'Umrah visa', 'Ramadan gifts'],
        exclusions: isArabic
          ? ['المصاريف الشخصية', 'التأمين الصحي']
          : ['Personal expenses', 'Travel insurance'],
        makkahHotel: isArabic ? '4 نجوم، 300 متر من الحرم' : '4-star, 300m from Haram',
        madinahHotel: isArabic ? '4 نجوم، 200 متر من المسجد النبوي' : '4-star, 200m from Prophet Mosque',
        departureDates: isArabic ? ['بداية رمضان'] : ['Start of Ramadan'],
        hotels: [
          {
            city: isArabic ? 'مكة المكرمة' : 'Makkah',
            name: isArabic ? 'فندق سويس أوتيل المقام' : 'Swissotel Al Maqam Makkah',
            starRating: 5,
            nights: 20,
            distanceToHaram: isArabic ? '200 متر' : '200m',
          },
          {
            city: isArabic ? 'المدينة المنورة' : 'Madinah',
            name: isArabic ? 'فندق أنوار المدينة موفنبيك' : 'Anwar Al Madinah Movenpick',
            starRating: 5,
            nights: 9,
            distanceToHaram: isArabic ? '100 متر' : '100m',
          },
        ],
        transportation: [
          {
            type: isArabic ? 'الطيران' : 'Flight',
            description: isArabic ? 'رحلات درجة رجال الأعمال على الخطوط السعودية' : 'Business class flights on Saudia Airlines',
          },
          {
            type: isArabic ? 'الحافلة' : 'Bus',
            description: isArabic ? 'حافلات VIP فاخرة لجميع التنقلات' : 'Luxury VIP buses for all transfers',
          },
          {
            type: isArabic ? 'جولات الزيارة' : 'Ziyarat Tours',
            description: isArabic ? 'جولات مكثفة لجميع المعالم الإسلامية' : 'Comprehensive tours of all Islamic landmarks',
          },
        ],
        itinerary: [
          {
            day: 1,
            title: isArabic ? 'الوصول والعمرة' : 'Arrival and Umrah',
            description: isArabic ? 'الوصول إلى مكة وأداء العمرة' : 'Arrive in Makkah and perform Umrah',
            activities: isArabic 
              ? ['الوصول إلى مطار جدة', 'الانتقال إلى فندق مكة', 'أداء العمرة', 'إفطار رمضان']
              : ['Arrive at Jeddah Airport', 'Transfer to Makkah hotel', 'Perform Umrah', 'Ramadan Iftar'],
          },
          {
            day: 2,
            title: isArabic ? 'رمضان في مكة' : 'Ramadan in Makkah',
            description: isArabic ? 'العبادة في شهر رمضان' : 'Worship during Ramadan',
            activities: isArabic
              ? ['صلاة التراويح', 'قيام الليل', 'الإفطار في الحرم', 'السحور']
              : ['Taraweeh prayers', 'Night prayers', 'Iftar at Haram', 'Suhoor'],
          },
          {
            day: 10,
            title: isArabic ? 'جولة مكة' : 'Makkah Tour',
            description: isArabic ? 'زيارة المعالم التاريخية' : 'Visit historical sites',
            activities: isArabic
              ? ['زيارة غار حراء', 'زيارة غار ثور', 'زيارة مسجد الجن']
              : ['Visit Cave of Hira', 'Visit Cave of Thawr', 'Visit Masjid Al-Jinn'],
          },
          {
            day: 20,
            title: isArabic ? 'ليلة القدر' : 'Laylatul Qadr',
            description: isArabic ? 'ليالي العشر الأواخر' : 'Last ten nights',
            activities: isArabic
              ? ['الاعتكاف', 'قيام الليل', 'الدعاء', 'ختم القرآن']
              : ['I\'tikaf', 'Night prayers', 'Supplication', 'Complete Quran'],
          },
          {
            day: 21,
            title: isArabic ? 'الانتقال إلى المدينة' : 'Transfer to Madinah',
            description: isArabic ? 'السفر إلى المدينة المنورة' : 'Travel to Madinah',
            activities: isArabic
              ? ['المغادرة إلى المدينة', 'الوصول والتسكين', 'زيارة المسجد النبوي']
              : ['Depart for Madinah', 'Check-in at hotel', 'Visit Prophet\'s Mosque'],
          },
          {
            day: 25,
            title: isArabic ? 'جولات المدينة' : 'Madinah Tours',
            description: isArabic ? 'زيارة جميع المعالم' : 'Visit all landmarks',
            activities: isArabic
              ? ['مسجد قباء', 'جبل أحد', 'مسجد القبلتين', 'البقيع']
              : ['Quba Mosque', 'Mount Uhud', 'Qiblatain Mosque', 'Baqi'],
          },
          {
            day: 29,
            title: isArabic ? 'عيد الفطر' : 'Eid Al-Fitr',
            description: isArabic ? 'الاحتفال بعيد الفطر' : 'Celebrate Eid Al-Fitr',
            activities: isArabic
              ? ['صلاة العيد', 'تبادل التهاني', 'وليمة العيد']
              : ['Eid prayers', 'Exchange greetings', 'Eid feast'],
          },
          {
            day: 30,
            title: isArabic ? 'المغادرة' : 'Departure',
            description: isArabic ? 'العودة إلى الوطن' : 'Return home',
            activities: isArabic
              ? ['الانتقال إلى المطار', 'المغادرة']
              : ['Transfer to airport', 'Departure'],
          },
        ],
        visaIncluded: true,
        flightIncluded: true,
        guidanceIncluded: true,
        mealsIncluded: isArabic ? 'إقامة كاملة' : 'Full Board',
        maxGroupSize: 30,
        spotsRemaining: 5,
      },
    ];
  }
}
