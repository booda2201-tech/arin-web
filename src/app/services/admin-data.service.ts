import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { L, ProductCategory, ProductItem, productCategories, products } from '../data/content';

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
const STORAGE_CATEGORIES_KEY = 'arin_admin_categories';

const SEED_CATEGORIES: ProductCategory[] = productCategories.filter((c) => c.id !== 'all');

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

  private categoriesSubject = new BehaviorSubject<ProductCategory[]>(this.loadCategories());
  categories$ = this.categoriesSubject.asObservable();

  constructor() {
    if (!localStorage.getItem(STORAGE_SUBMISSIONS_KEY)) {
      this.saveSubmissions(this.submissionsSubject.value);
    }
    if (!localStorage.getItem(STORAGE_PRODUCTS_KEY)) {
      this.saveProducts(this.productsSubject.value);
    }
    if (!localStorage.getItem(STORAGE_CATEGORIES_KEY)) {
      this.saveCategories(this.categoriesSubject.value);
    }
  }

  getProducts(): ProductItem[] {
    return this.productsSubject.value;
  }

  addProduct(item: ProductItem): void {
    const list = [item, ...this.productsSubject.value.filter((p) => p.slug !== item.slug)];
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

  getCategories(): ProductCategory[] {
    return this.categoriesSubject.value;
  }

  /** Filter list including virtual "all" for UI pills */
  getFilterCategories(): ProductCategory[] {
    return [
      { id: 'all', name: { ar: 'الكل', en: 'All' } },
      ...this.categoriesSubject.value,
    ];
  }

  categoryLabel(id: string, lang: 'ar' | 'en'): string {
    if (id === 'all') {
      return lang === 'ar' ? 'الكل' : 'All';
    }
    const found = this.categoriesSubject.value.find((c) => c.id === id);
    return found ? found.name[lang] : id;
  }

  countProductsInCategory(id: string): number {
    return this.productsSubject.value.filter((p) => p.category === id).length;
  }

  addCategory(input: { id?: string; nameAr: string; nameEn: string }): { ok: boolean; message?: string; category?: ProductCategory } {
    const nameAr = input.nameAr.trim();
    const nameEn = input.nameEn.trim();
    if (!nameAr || !nameEn) {
      return { ok: false, message: 'الاسم بالعربية والإنجليزية مطلوبان' };
    }

    let id = (input.id || nameEn).trim().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!id) {
      id = 'cat-' + Date.now().toString(36);
    }
    if (id === 'all') {
      return { ok: false, message: 'المعرّف "all" محجوز' };
    }
    if (this.categoriesSubject.value.some((c) => c.id === id)) {
      return { ok: false, message: 'معرّف الفئة موجود بالفعل' };
    }

    const category: ProductCategory = {
      id,
      name: { ar: nameAr, en: nameEn } as L,
    };
    this.saveCategories([...this.categoriesSubject.value, category]);
    return { ok: true, category };
  }

  updateCategory(id: string, input: { nameAr: string; nameEn: string }): { ok: boolean; message?: string } {
    if (id === 'all') {
      return { ok: false, message: 'لا يمكن تعديل فئة الكل' };
    }
    const nameAr = input.nameAr.trim();
    const nameEn = input.nameEn.trim();
    if (!nameAr || !nameEn) {
      return { ok: false, message: 'الاسم بالعربية والإنجليزية مطلوبان' };
    }
    if (!this.categoriesSubject.value.some((c) => c.id === id)) {
      return { ok: false, message: 'الفئة غير موجودة' };
    }
    const list = this.categoriesSubject.value.map((c) =>
      c.id === id ? { ...c, name: { ar: nameAr, en: nameEn } as L } : c
    );
    this.saveCategories(list);
    return { ok: true };
  }

  deleteCategory(id: string): { ok: boolean; message?: string } {
    if (id === 'all') {
      return { ok: false, message: 'لا يمكن حذف فئة الكل' };
    }
    const used = this.countProductsInCategory(id);
    if (used > 0) {
      return {
        ok: false,
        message: `لا يمكن الحذف: يوجد ${used} منتج مرتبط بهذه الفئة. انقل المنتجات أولاً.`,
      };
    }
    if (this.categoriesSubject.value.length <= 1) {
      return { ok: false, message: 'يجب الإبقاء على فئة واحدة على الأقل' };
    }
    this.saveCategories(this.categoriesSubject.value.filter((c) => c.id !== id));
    return { ok: true };
  }

  getSubmissions(): FormSubmission[] {
    return this.submissionsSubject.value;
  }

  addSubmission(sub: Omit<FormSubmission, 'id' | 'createdAt' | 'status'> & { status?: FormSubmission['status'] }): void {
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newSub: FormSubmission = {
      ...sub,
      status: sub.status || 'new',
      id: this.nextSubmissionId(),
      createdAt: stamp,
    };
    this.saveSubmissions([newSub, ...this.submissionsSubject.value]);
  }

  updateSubmissionStatus(id: string, status: FormSubmission['status']): void {
    const list = this.submissionsSubject.value.map((s) => (s.id === id ? { ...s, status } : s));
    this.saveSubmissions(list);
  }

  deleteSubmission(id: string): void {
    this.saveSubmissions(this.submissionsSubject.value.filter((s) => s.id !== id));
  }

  private nextSubmissionId(): string {
    const nums = this.submissionsSubject.value
      .map((s) => parseInt(String(s.id).replace(/\D/g, ''), 10))
      .filter((n) => !Number.isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 1000) + 1;
    return 'SUB-' + next;
  }

  private loadProducts(): ProductItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed: ProductItem[] = JSON.parse(stored);
        return parsed.map((p) => ({
          ...p,
          images: p.images && p.images.length ? p.images : p.image ? [p.image] : [],
        }));
      }
    } catch (e) {
      console.warn('Failed to load admin products from storage', e);
    }
    return products.map((p) => ({
      ...p,
      images: p.images && p.images.length ? p.images : p.image ? [p.image] : [],
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

  private loadCategories(): ProductCategory[] {
    try {
      const stored = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProductCategory[];
        return parsed.filter((c) => c.id && c.id !== 'all' && c.name?.ar && c.name?.en);
      }
    } catch (e) {
      console.warn('Failed to load categories from storage', e);
    }
    return SEED_CATEGORIES.map((c) => ({ ...c, name: { ...c.name } }));
  }

  private saveCategories(list: ProductCategory[]): void {
    try {
      localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save categories', e);
    }
    this.categoriesSubject.next(list);
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
    return [...INITIAL_SUBMISSIONS];
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
