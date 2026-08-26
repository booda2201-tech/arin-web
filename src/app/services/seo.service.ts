import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LanguageService } from './language.service';
import { Lang } from '../data/content';

type SeoContent = { title: string; description: string };

@Injectable({ providedIn: 'root' })
export class SeoService {
  private lang: Lang = 'ar';

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
    private languageService: LanguageService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  init(): void {
    this.languageService.languageChanged$.subscribe((lang) => {
      this.lang = lang;
      this.apply(this.router.url || '/');
    });
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.apply(e.urlAfterRedirects));
  }

  private apply(url: string): void {
    const path = (url || '/').split('?')[0].split('#')[0];
    const content = this.get(path);
    this.title.setTitle(content.title);
    this.meta.updateTag({ name: 'description', content: content.description });
    this.meta.updateTag({ property: 'og:title', content: content.title });
    this.meta.updateTag({ property: 'og:description', content: content.description });
    this.meta.updateTag({ property: 'og:locale', content: this.lang === 'ar' ? 'ar_EG' : 'en_US' });
  }

  private get(path: string): SeoContent {
    const ar: Record<string, SeoContent> = {
      '/': {
        title: 'عرين الموارد التجارية | حلول التجارة الخارجية',
        description:
          'استيراد وتصدير، شحن بحري وبري، توكيلات تجارية، سلاسل إمداد، واستشارات تجارية للشركات والأفراد.',
      },
      '/about': {
        title: 'من نحن | عرين الموارد التجارية',
        description: 'قصة عرين، القيم، ونموذج التشغيل الذي يربط المصدر بالسوق.',
      },
      '/services': {
        title: 'خدماتنا | عرين الموارد التجارية',
        description: 'استيراد وتصدير، شحن دولي، توكيلات، سلاسل إمداد، واستشارات تجارية.',
      },
      '/products': {
        title: 'المنتجات | عرين الموارد التجارية',
        description: 'دليل منتجات توريد للمواد الغذائية والعناية والتوريدات المؤسسية.',
      },
      '/private-label': {
        title: 'علامتك التجارية | عرين الموارد التجارية',
        description: 'من الفكرة إلى منتج جاهز بعلامتك: تصميم، تصنيع، وشحن.',
      },
      '/projects': {
        title: 'مشاريعنا | عرين الموارد التجارية',
        description: 'نماذج من عمليات الشحن والتوريد والتوزيع والعلامات الخاصة.',
      },
      '/contact': {
        title: 'تواصل معنا | عرين الموارد التجارية',
        description: 'هاتف، واتساب، بريد إلكتروني، أو نموذج شراكة لبدء خط التوريد.',
      },
      '/quote': {
        title: 'اطلب عرض سعر | عرين الموارد التجارية',
        description: 'أرسل احتياج التوريد أو الشحن وسنعود إليك بعرض واضح.',
      },
    };
    const en: Record<string, SeoContent> = {
      '/': {
        title: 'Arin Almawared Altijaria | Foreign Trade Solutions',
        description:
          'Import and export, sea and land shipping, commercial agencies, supply chain, and trade consulting.',
      },
      '/about': {
        title: 'About | Arin Almawared Altijaria',
        description: 'Our story, values, and the operating model that connects origin to market.',
      },
      '/services': {
        title: 'Services | Arin Almawared Altijaria',
        description: 'Import/export, international shipping, agencies, supply chain, and consulting.',
      },
      '/products': {
        title: 'Products | Arin Almawared Altijaria',
        description: 'A B2B catalogue across food, personal care and institutional supply.',
      },
      '/private-label': {
        title: 'Private Label | Arin Almawared Altijaria',
        description: 'From idea to a finished product under your brand.',
      },
      '/projects': {
        title: 'Projects | Arin Almawared Altijaria',
        description: 'Capability gallery across freight, supply and private label.',
      },
      '/contact': {
        title: 'Contact | Arin Almawared Altijaria',
        description: 'Phone, WhatsApp, email, or a partnership form to start the next supply line.',
      },
      '/quote': {
        title: 'Request a Quote | Arin Almawared Altijaria',
        description: 'Share your supply or shipping need and receive a clear commercial offer.',
      },
    };
    const dict = this.lang === 'ar' ? ar : en;
    if (path.startsWith('/products/')) {
      return dict['/products'];
    }
    return dict[path] || dict['/'];
  }
}
