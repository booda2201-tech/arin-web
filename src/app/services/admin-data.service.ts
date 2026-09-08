import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { products, ProductItem } from '../data/content';

export interface FormSubmission {
  id: string;
  type: 'quote' | 'contact' | 'private-label';
  createdAt: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  status: 'new' | 'in_progress' | 'completed';
  details: Record<string, any>;
}

const STORAGE_PRODUCTS_KEY = 'arin_admin_products';
const STORAGE_SUBMISSIONS_KEY = 'arin_admin_submissions';

const INITIAL_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'SUB-1042',
    type: 'quote',
    createdAt: '2026-09-08 14:20',
    name: 'م. طارق السويدي',
    company: 'مجموعة الدلتا للتوزيع',
    email: 'tarek@deltagroup.com.eg',
    phone: '+20 100 234 5678',
    status: 'new',
    details: {
      service: 'الشحن الدولي',
      product: 'زيت زيتون بكر ممتاز',
      quantity: 'حاوية 40 قدم (22 طن)',
      destination: 'ميناء الإسكندرية',
      mode: 'بحري',
      notes: 'مطلوب شهادة مطابقة وفحص مخبري قبل الشحن.',
    },
  },
  {
    id: 'SUB-1041',
    type: 'private-label',
    createdAt: '2026-09-08 11:15',
    name: 'سارة عبدالمجيد',
    company: 'شركة لافندر لمستحضرات العناية',
    email: 'sara@lavender-eg.com',
    phone: '+20 111 876 5432',
    status: 'in_progress',
    details: {
      category: 'العناية الشخصية',
      volume: '15,000 عبوة سيروم 50 مل',
      message: 'نبحث عن مصنع معتمد لتعبئة خط سيروم فيتامين سي وهيالورونيك بعلامتنا التجارية الخاصة مع تصميم العبوات الزجاجية.',
    },
  },
  {
    id: 'SUB-1040',
    type: 'contact',
    createdAt: '2026-09-07 17:45',
    name: 'عمر الفاروق',
    company: 'الخليج للاستيراد والتصدير',
    email: 'omar@al-khaleej-trade.com',
    phone: '+966 54 321 0987',
    status: 'completed',
    details: {
      interest: 'التوكيلات التجارية',
      message: 'نود بحث إمكانية الحصول على تمثيل تجاري لمنتجاتكم الغذائية في المنطقة الشرقية بالمملكة.',
    },
  },
  {
    id: 'SUB-1039',
    type: 'quote',
    createdAt: '2026-09-06 10:30',
    name: 'د. حازم القاضي',
    company: 'سلاسل الرضا ماركت',
    email: 'hazem@elreda-markets.com',
    phone: '+20 122 456 7890',
    status: 'completed',
    details: {
      service: 'الاستيراد والتصدير',
      product: 'أرز بسمتي مُعتّق',
      quantity: '50 طن (أكياس 10 كجم)',
      destination: 'مستودعات 6 أكتوبر',
      mode: 'بحري + نقل بري',
      notes: 'عقد توريد ربع سنوي.',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class AdminDataService {
  private productsSubject = new BehaviorSubject<ProductItem[]>(this.loadProducts());
  products$ = this.productsSubject.asObservable();

  private submissionsSubject = new BehaviorSubject<FormSubmission[]>(this.loadSubmissions());
  submissions$ = this.submissionsSubject.asObservable();

  constructor() {}

  // Products CRUD
  getProducts(): ProductItem[] {
    return this.productsSubject.value;
  }

  addProduct(item: ProductItem): void {
    const list = [item, ...this.productsSubject.value];
    this.saveProducts(list);
  }

  updateProduct(slug: string, updated: Partial<ProductItem>): void {
    const list = this.productsSubject.value.map((p) => (p.slug === slug ? { ...p, ...updated } : p));
    this.saveProducts(list);
  }

  deleteProduct(slug: string): void {
    const list = this.productsSubject.value.filter((p) => p.slug !== slug);
    this.saveProducts(list);
  }

  // Submissions Management
  getSubmissions(): FormSubmission[] {
    return this.submissionsSubject.value;
  }

  addSubmission(sub: Omit<FormSubmission, 'id' | 'createdAt'>): void {
    const newSub: FormSubmission = {
      ...sub,
      id: 'SUB-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    const list = [newSub, ...this.submissionsSubject.value];
    this.saveSubmissions(list);
  }

  updateSubmissionStatus(id: string, status: FormSubmission['status']): void {
    const list = this.submissionsSubject.value.map((s) => (s.id === id ? { ...s, status } : s));
    this.saveSubmissions(list);
  }

  deleteSubmission(id: string): void {
    const list = this.submissionsSubject.value.filter((s) => s.id !== id);
    this.saveSubmissions(list);
  }

  // Storage Handlers
  private loadProducts(): ProductItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed: ProductItem[] = JSON.parse(stored);
        return parsed.map((p) => ({
          ...p,
          images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []),
        }));
      }
    } catch (e) {
      console.warn('Failed to load admin products from storage', e);
    }
    return products.map((p) => ({
      ...p,
      images: p.images && p.images.length ? p.images : (p.image ? [p.image] : []),
    }));
  }

  private saveProducts(list: ProductItem[]): void {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save admin products', e);
    }
    this.productsSubject.next(list);
  }

  private loadSubmissions(): FormSubmission[] {
    try {
      const stored = localStorage.getItem(STORAGE_SUBMISSIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load submissions from storage', e);
    }
    return INITIAL_SUBMISSIONS;
  }

  private saveSubmissions(list: FormSubmission[]): void {
    try {
      localStorage.setItem(STORAGE_SUBMISSIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save submissions', e);
    }
    this.submissionsSubject.next(list);
  }
}
