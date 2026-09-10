import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, forkJoin, fromEvent, interval, merge, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { L, ProductCategory, ProductItem } from '../data/content';
import { apiUrl, clearLegacyLocalStorage } from './api.config';
import { AuthService } from './auth.service';

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

export interface MutationResult {
  ok: boolean;
  message?: string;
  category?: ProductCategory;
}

/** Backend request status enum (0-based). */
const STATUS_TO_API: Record<FormSubmission['status'], number> = {
  new: 0,
  in_progress: 1,
  completed: 2,
};

const CATALOG_SYNC_KEY = 'arin_catalog_sync';
const CATALOG_POLL_MS = 20000;

@Injectable({ providedIn: 'root' })
export class AdminDataService implements OnDestroy {
  private productsSubject = new BehaviorSubject<ProductItem[]>([]);
  products$ = this.productsSubject.asObservable();

  private submissionsSubject = new BehaviorSubject<FormSubmission[]>([]);
  submissions$ = this.submissionsSubject.asObservable();

  private categoriesSubject = new BehaviorSubject<ProductCategory[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private syncChannel: BroadcastChannel | null = null;
  private liveSub = new Subscription();
  private lastSyncAt = 0;
  private refreshingCatalog = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private zone: NgZone
  ) {
    clearLegacyLocalStorage();
    this.refreshCatalog().subscribe();
    this.auth.user$.subscribe((user) => {
      if (user) {
        this.refreshSubmissions().subscribe();
      } else {
        this.submissionsSubject.next([]);
      }
    });
    this.startLiveCatalogSync();
  }

  ngOnDestroy(): void {
    this.liveSub.unsubscribe();
    this.syncChannel?.close();
  }

  /** Public catalog — products + categories (no auth required). */
  refreshCatalog(options?: { broadcast?: boolean }): Observable<void> {
    if (this.refreshingCatalog) {
      return of(void 0);
    }
    this.refreshingCatalog = true;
    this.loadingSubject.next(true);
    return forkJoin({
      products: this.fetchProducts(),
      categories: this.fetchCategories(),
    }).pipe(
      tap(({ products, categories }) => {
        this.categoriesSubject.next(categories);
        this.productsSubject.next(products);
        this.loadingSubject.next(false);
        this.refreshingCatalog = false;
        this.lastSyncAt = Date.now();
        if (options?.broadcast) {
          this.broadcastCatalogSync();
        }
      }),
      map(() => void 0),
      catchError((err) => {
        console.warn('Failed to refresh catalog', err);
        this.loadingSubject.next(false);
        this.refreshingCatalog = false;
        return of(void 0);
      })
    );
  }

  /** Call after admin mutations so other tabs / open site pages refresh. */
  publishCatalogChange(): void {
    this.refreshCatalog({ broadcast: true }).subscribe();
  }

  /** Admin inbox — requires auth. */
  refreshSubmissions(): Observable<void> {
    return this.fetchSubmissions().pipe(
      tap((submissions) => this.submissionsSubject.next(submissions)),
      map(() => void 0),
      catchError((err) => {
        console.warn('Failed to refresh submissions', err);
        return of(void 0);
      })
    );
  }

  refreshAll(): Observable<void> {
    return forkJoin({
      catalog: this.refreshCatalog(),
      submissions: this.auth.isLoggedIn ? this.refreshSubmissions() : of(void 0),
    }).pipe(map(() => void 0));
  }

  getProducts(): ProductItem[] {
    return this.productsSubject.value;
  }

  getCategories(): ProductCategory[] {
    return this.categoriesSubject.value;
  }

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

  getSubmissions(): FormSubmission[] {
    return this.submissionsSubject.value;
  }

  addProduct(item: ProductItem, imageFiles: File[] = []): Observable<MutationResult> {
    if (!imageFiles.length) {
      return of({ ok: false, message: 'أضف صورة للمنتج من جهازك' });
    }
    const form = this.toProductFormData(item, {
      mode: 'create',
      imageFiles,
      keepImageUrls: [],
    });
    return this.http.post<unknown>(apiUrl('/api/Products'), form).pipe(
      switchMap(() => this.reloadProducts()),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر إضافة المنتج')))
    );
  }

  updateProduct(
    slug: string,
    updated: Partial<ProductItem>,
    options: {
      productId?: string;
      imageFiles?: File[];
      keepImageUrls?: string[];
      /** Ordered gallery (cover first). Preferred over loose files/urls. */
      gallerySlots?: { file?: File; remoteUrl?: string }[];
      replaceGallery?: boolean;
    } = {}
  ): Observable<MutationResult> {
    const slots = options.gallerySlots;
    const imageFiles =
      options.imageFiles ||
      (slots ? slots.map((s) => s.file).filter((f): f is File => !!f) : []);
    const keepImageUrls = this.normalizeImageUrls(
      options.keepImageUrls ||
        (slots
          ? slots.map((s) => s.remoteUrl || '').filter(Boolean)
          : [])
    );
    const replaceGallery = !!options.replaceGallery;

    const existing = this.findProduct(options.productId, slug);
    if (!existing?.id) {
      return of({ ok: false, message: 'معرّف المنتج غير متوفر للتحديث' });
    }
    const merged: ProductItem = { ...existing, ...updated, id: existing.id };
    if (!merged.category) {
      return of({ ok: false, message: 'يجب اختيار فئة للمنتج قبل التحديث' });
    }

    if (!replaceGallery) {
      const form = this.toProductFormData(merged, { mode: 'metadata' });
      return this.http.put<unknown>(apiUrl(`/api/Products/${existing.id}`), form).pipe(
        switchMap(() => this.reloadProducts()),
        map(() => ({ ok: true })),
        catchError((err) => of(this.fail(err, 'تعذر تحديث المنتج')))
      );
    }

    if (!imageFiles.length && !keepImageUrls.length && !(slots && slots.length)) {
      return of({ ok: false, message: 'أضف صورة واحدة على الأقل للمنتج' });
    }

    merged.images = keepImageUrls;
    merged.image = keepImageUrls[0] || '';

    // Prefer ordered files (download kept remote URLs) so PUT matches a working create shape.
    return this.materializeGalleryFiles(slots, imageFiles, keepImageUrls).pipe(
      switchMap((orderedFiles) => {
        const putForm = this.toProductFormData(merged, {
          mode: 'replace-image',
          imageFiles: orderedFiles,
          keepImageUrls: orderedFiles.length ? [] : keepImageUrls,
        });
        return this.http.put<unknown>(apiUrl(`/api/Products/${existing.id}`), putForm).pipe(
          switchMap(() => this.reloadProducts()),
          map(() => ({ ok: true as const })),
          catchError((err: HttpErrorResponse) => {
            if (err.status !== 500 && err.status !== 405) {
              return of(this.fail(err, 'تعذر تحديث صور المنتج'));
            }
            return this.replaceProductViaRecreate(
              existing,
              merged,
              orderedFiles,
              orderedFiles.length &&
                (!slots?.length || orderedFiles.length >= slots.length)
                ? []
                : keepImageUrls
            );
          })
        );
      }),
      catchError((err) => of(this.fail(err, 'تعذر تجهيز صور المنتج للتحديث')))
    );
  }

  /**
   * PUT+Images often 500s on the host. Safe swap:
   * park old slug → POST new product at final slug → delete parked row.
   * Never deletes the original before the new row exists.
   */
  private replaceProductViaRecreate(
    existing: ProductItem,
    merged: ProductItem,
    imageFiles: File[],
    keepImageUrls: string[]
  ): Observable<MutationResult> {
    const finalSlug = (merged.slug || existing.slug || '').trim();
    if (!finalSlug || !existing.id) {
      return of({ ok: false, message: 'تعذر استبدال الصور على الخادم' });
    }
    if (!imageFiles.length && !keepImageUrls.length) {
      return of({ ok: false, message: 'تعذر استبدال الصور على الخادم' });
    }

    const parkSlug = `${finalSlug}-old-${Date.now().toString(36)}`;
    const parkForm = this.toProductFormData(
      { ...existing, slug: parkSlug },
      { mode: 'metadata' }
    );

    const createItem: ProductItem = {
      ...merged,
      id: undefined,
      slug: finalSlug,
      images: keepImageUrls,
      image: keepImageUrls[0] || '',
    };
    const createForm = this.toProductFormData(createItem, {
      mode: 'create',
      imageFiles,
      keepImageUrls,
      allowUrlsOnly: true,
    });

    return this.http.put<unknown>(apiUrl(`/api/Products/${existing.id}`), parkForm).pipe(
      switchMap(() => this.http.post<unknown>(apiUrl('/api/Products'), createForm)),
      switchMap(() => this.reloadProducts()),
      switchMap(() => {
        const created = this.productsSubject.value.find((p) => p.slug === finalSlug);
        if (!created?.id) {
          return this.restoreProductSlug(existing.id!, finalSlug).pipe(
            map(() => ({
              ok: false as const,
              message: 'تم رفع الصور لكن تعذر إكمال الاستبدال — تم الإبقاء على المنتج الأصلي',
            }))
          );
        }
        return this.http.delete<unknown>(apiUrl(`/api/Products/${existing.id}`)).pipe(
          catchError(() => of(null)),
          switchMap(() => this.reloadProducts()),
          map(() => ({ ok: true as const }))
        );
      }),
      catchError((err: HttpErrorResponse) =>
        this.restoreProductSlug(existing.id!, finalSlug).pipe(
          map(() => this.fail(err, 'تعذر استبدال صور المنتج'))
        )
      )
    );
  }

  private restoreProductSlug(productId: string, slug: string): Observable<unknown> {
    const current =
      this.productsSubject.value.find((p) => p.id === productId) ||
      ({ id: productId, slug, category: '', name: { ar: '', en: '' }, origin: { ar: '', en: '' }, packaging: { ar: '', en: '' }, image: '', notes: { ar: '', en: '' }, description: { ar: '', en: '' }, moq: { ar: '', en: '' }, availability: 'in-supply', specs: [] } as ProductItem);
    const form = this.toProductFormData({ ...current, slug }, { mode: 'metadata' });
    return this.http.put<unknown>(apiUrl(`/api/Products/${productId}`), form).pipe(
      catchError(() => of(null)),
      switchMap(() => this.reloadProducts()),
      catchError(() => of(null))
    );
  }

  private findProduct(productId: string | undefined, slug: string): ProductItem | undefined {
    const list = this.productsSubject.value;
    if (productId) {
      const byId = list.find((p) => p.id === productId);
      if (byId) {
        return byId;
      }
    }
    if (slug) {
      const bySlug = list.find((p) => p.slug === slug);
      if (bySlug) {
        return bySlug;
      }
    }
    return undefined;
  }

  /** Build ordered Files for gallery: local files as-is, remote URLs fetched as blobs. */
  private materializeGalleryFiles(
    slots: { file?: File; remoteUrl?: string }[] | undefined,
    fallbackFiles: File[],
    fallbackUrls: string[]
  ): Observable<File[]> {
    const ordered = slots?.length
      ? slots
      : [
          ...fallbackFiles.map((file) => ({ file, remoteUrl: undefined as string | undefined })),
          ...fallbackUrls.map((remoteUrl) => ({ file: undefined as File | undefined, remoteUrl })),
        ];

    if (!ordered.length) {
      return of([]);
    }

    return forkJoin(
      ordered.map((slot, index) => {
        if (slot.file) {
          return of(slot.file);
        }
        const url = slot.remoteUrl;
        if (!url || !/^https?:\/\//i.test(url)) {
          return of(null as File | null);
        }
        return this.http.get(url, { responseType: 'blob' }).pipe(
          map((blob) => {
            const ext = (blob.type || 'image/jpeg').split('/')[1] || 'jpg';
            return new File([blob], `gallery-${index}.${ext}`, {
              type: blob.type || 'image/jpeg',
            });
          }),
          catchError(() => of(null as File | null))
        );
      })
    ).pipe(
      map((files) => files.filter((f): f is File => !!f)),
      map((files) => {
        if (files.length) {
          return files;
        }
        // CORS or fetch failed — caller can still recreate with ImageUrls.
        return fallbackFiles;
      })
    );
  }

  deleteProduct(slug: string, productId?: string): Observable<MutationResult> {
    const existing = this.findProduct(productId, slug);
    if (!existing?.id) {
      return of({ ok: false, message: 'معرّف المنتج غير متوفر للحذف' });
    }
    return this.http.delete<unknown>(apiUrl(`/api/Products/${existing.id}`)).pipe(
      switchMap(() => this.reloadProducts()),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر حذف المنتج')))
    );
  }

  addCategory(input: {
    id?: string;
    nameAr: string;
    nameEn: string;
  }): Observable<MutationResult> {
    const nameAr = input.nameAr.trim();
    const nameEn = input.nameEn.trim();
    if (!nameAr || !nameEn) {
      return of({ ok: false, message: 'الاسم بالعربية والإنجليزية مطلوبان' });
    }

    const form = new FormData();
    form.append('NameAr', nameAr);
    form.append('NameEn', nameEn);
    form.append('DescriptionAr', nameAr);
    form.append('DescriptionEn', nameEn);
    form.append('IsActive', 'true');

    return this.http.post<unknown>(apiUrl('/api/ProductCategories'), form).pipe(
      switchMap(() => this.reloadCategories()),
      map(() => {
        const created = this.categoriesSubject.value.find(
          (c) => c.name.ar === nameAr || c.name.en === nameEn
        );
        return { ok: true, category: created };
      }),
      catchError((err) => of(this.fail(err, 'تعذر إضافة الفئة')))
    );
  }

  updateCategory(
    id: string,
    input: { nameAr: string; nameEn: string }
  ): Observable<MutationResult> {
    if (id === 'all') {
      return of({ ok: false, message: 'لا يمكن تعديل فئة الكل' });
    }
    const nameAr = input.nameAr.trim();
    const nameEn = input.nameEn.trim();
    if (!nameAr || !nameEn) {
      return of({ ok: false, message: 'الاسم بالعربية والإنجليزية مطلوبان' });
    }

    const form = new FormData();
    form.append('NameAr', nameAr);
    form.append('NameEn', nameEn);
    form.append('DescriptionAr', nameAr);
    form.append('DescriptionEn', nameEn);
    form.append('IsActive', 'true');

    return this.http.put<unknown>(apiUrl(`/api/ProductCategories/${id}`), form).pipe(
      catchError(() =>
        this.http.post<unknown>(apiUrl(`/api/ProductCategories/${id}`), form)
      ),
      switchMap(() => this.reloadCategories()),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر تحديث الفئة')))
    );
  }

  deleteCategory(id: string): Observable<MutationResult> {
    if (id === 'all') {
      return of({ ok: false, message: 'لا يمكن حذف فئة الكل' });
    }
    const used = this.countProductsInCategory(id);
    if (used > 0) {
      return of({
        ok: false,
        message: `لا يمكن الحذف: يوجد ${used} منتج مرتبط بهذه الفئة. انقل المنتجات أولاً.`,
      });
    }
    return this.http.delete<unknown>(apiUrl(`/api/ProductCategories/${id}`)).pipe(
      switchMap(() => this.reloadCategories()),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر حذف الفئة')))
    );
  }

  /** Public site: create contact message on the API. */
  createContactMessage(payload: {
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    interestField?: string;
    message: string;
  }): Observable<MutationResult> {
    return this.http.post<unknown>(apiUrl('/api/ContactMessages'), payload).pipe(
      tap(() => {
        if (this.auth.isLoggedIn) {
          this.reloadSubmissions().subscribe();
        }
      }),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر إرسال الرسالة')))
    );
  }

  /** Public site: create quote request on the API. */
  createQuoteRequest(payload: {
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    serviceName?: string;
    productId?: string | null;
    productName?: string;
    estimatedQuantity: string;
    destination: string;
    shippingMethod: number;
    specNotes?: string;
  }): Observable<MutationResult> {
    return this.http.post<unknown>(apiUrl('/api/QuoteRequests'), payload).pipe(
      tap(() => {
        if (this.auth.isLoggedIn) {
          this.reloadSubmissions().subscribe();
        }
      }),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر إرسال طلب عرض السعر')))
    );
  }

  /** Public site: create private-label request on the API. */
  createPrivateLabelRequest(payload: {
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    manufacturingField?: string;
    estimatedQuantity?: string;
    requirementSummary?: string;
  }): Observable<MutationResult> {
    return this.http.post<unknown>(apiUrl('/api/PrivateLabelRequests'), payload).pipe(
      tap(() => {
        if (this.auth.isLoggedIn) {
          this.reloadSubmissions().subscribe();
        }
      }),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر إرسال طلب العلامة الخاصة')))
    );
  }

  /** @deprecated Prefer typed create* methods. */
  addSubmission(
    sub: Omit<FormSubmission, 'id' | 'createdAt' | 'status'> & { status?: FormSubmission['status'] }
  ): void {
    if (sub.type === 'contact') {
      this.createContactMessage({
        fullName: sub.name,
        email: sub.email,
        phone: sub.phone,
        companyName: sub.company,
        interestField: String(sub.details?.['interest'] || ''),
        message: String(sub.details?.['message'] || ''),
      }).subscribe();
      return;
    }
    if (sub.type === 'quote') {
      const productSlug = String(sub.details?.['productSlug'] || '');
      const product = this.productsSubject.value.find((p) => p.slug === productSlug);
      this.createQuoteRequest({
        fullName: sub.name,
        email: sub.email,
        phone: sub.phone,
        companyName: sub.company,
        serviceName: String(sub.details?.['service'] || ''),
        productId: product?.id || null,
        productName: String(sub.details?.['product'] || ''),
        estimatedQuantity: String(sub.details?.['quantity'] || ''),
        destination: String(sub.details?.['destination'] || ''),
        shippingMethod: this.shippingMethodFromLabel(String(sub.details?.['mode'] || 'SEA')),
        specNotes: String(sub.details?.['notes'] || ''),
      }).subscribe();
      return;
    }
    if (sub.type === 'private-label') {
      this.createPrivateLabelRequest({
        fullName: sub.name,
        email: sub.email,
        phone: sub.phone,
        companyName: sub.company,
        manufacturingField: String(sub.details?.['category'] || ''),
        estimatedQuantity: String(sub.details?.['volume'] || ''),
        requirementSummary: String(sub.details?.['message'] || ''),
      }).subscribe();
    }
  }

  updateSubmissionStatus(id: string, status: FormSubmission['status']): Observable<MutationResult> {
    const sub = this.submissionsSubject.value.find((s) => s.id === id);
    if (!sub) {
      return of({ ok: false, message: 'الطلب غير موجود' });
    }
    const apiStatus = STATUS_TO_API[status];
    const path =
      sub.type === 'quote'
        ? `/api/QuoteRequests/${id}/status`
        : sub.type === 'contact'
          ? `/api/ContactMessages/${id}/status`
          : `/api/PrivateLabelRequests/${id}/status`;

    const body = { status: apiStatus };
    return this.http.put<unknown>(apiUrl(path), body).pipe(
      catchError(() => this.http.patch<unknown>(apiUrl(path), body)),
      catchError(() => this.http.post<unknown>(apiUrl(path), body)),
      tap(() => {
        const list = this.submissionsSubject.value.map((s) =>
          s.id === id ? { ...s, status } : s
        );
        this.submissionsSubject.next(list);
      }),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر تحديث الحالة')))
    );
  }

  deleteSubmission(id: string): Observable<MutationResult> {
    const sub = this.submissionsSubject.value.find((s) => s.id === id);
    if (!sub) {
      return of({ ok: false, message: 'الطلب غير موجود' });
    }
    const path =
      sub.type === 'quote'
        ? `/api/QuoteRequests/${id}`
        : sub.type === 'contact'
          ? `/api/ContactMessages/${id}`
          : `/api/PrivateLabelRequests/${id}`;

    return this.http.delete<unknown>(apiUrl(path)).pipe(
      tap(() => {
        this.submissionsSubject.next(this.submissionsSubject.value.filter((s) => s.id !== id));
      }),
      map(() => ({ ok: true })),
      catchError((err) => of(this.fail(err, 'تعذر حذف الطلب')))
    );
  }

  shippingMethodFromLabel(mode: string): number {
    const key = mode.toUpperCase();
    if (key === 'LAND' || key === 'LAND_HINT' || mode === 'land') {
      return 2;
    }
    if (key === 'UNSURE' || mode === 'unsure') {
      return 3;
    }
    return 1; // sea / default
  }

  private reloadProducts(): Observable<ProductItem[]> {
    return this.fetchProducts().pipe(
      tap((list) => {
        this.productsSubject.next(list);
        this.lastSyncAt = Date.now();
        this.broadcastCatalogSync();
      })
    );
  }

  private reloadCategories(): Observable<ProductCategory[]> {
    return this.fetchCategories().pipe(
      tap((list) => {
        this.categoriesSubject.next(list);
        this.lastSyncAt = Date.now();
        this.broadcastCatalogSync();
      })
    );
  }

  private reloadSubmissions(): Observable<FormSubmission[]> {
    return this.fetchSubmissions().pipe(
      tap((list) => this.submissionsSubject.next(list))
    );
  }

  private startLiveCatalogSync(): void {
    try {
      this.syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CATALOG_SYNC_KEY) : null;
      if (this.syncChannel) {
        this.syncChannel.onmessage = () => {
          this.zone.run(() => this.refreshCatalog().subscribe());
        };
      }
    } catch {
      this.syncChannel = null;
    }

    if (typeof window !== 'undefined') {
      this.liveSub.add(
        fromEvent<StorageEvent>(window, 'storage')
          .pipe(filter((e) => e.key === CATALOG_SYNC_KEY))
          .subscribe(() => this.refreshCatalog().subscribe())
      );

      this.liveSub.add(
        merge(
          fromEvent(document, 'visibilitychange').pipe(filter(() => document.visibilityState === 'visible')),
          fromEvent(window, 'focus')
        ).subscribe(() => {
          if (Date.now() - this.lastSyncAt > 5000) {
            this.refreshCatalog().subscribe();
          }
        })
      );

      this.zone.runOutsideAngular(() => {
        this.liveSub.add(
          interval(CATALOG_POLL_MS)
            .pipe(filter(() => typeof document === 'undefined' || document.visibilityState === 'visible'))
            .subscribe(() => {
              this.zone.run(() => this.refreshCatalog().subscribe());
            })
        );
      });
    }
  }

  private broadcastCatalogSync(): void {
    const stamp = String(Date.now());
    try {
      localStorage.setItem(CATALOG_SYNC_KEY, stamp);
    } catch {
      /* ignore */
    }
    try {
      this.syncChannel?.postMessage({ at: stamp });
    } catch {
      /* ignore */
    }
  }

  private fetchProducts(): Observable<ProductItem[]> {
    return this.http.get<unknown>(apiUrl('/api/Products')).pipe(
      map((res) => this.unwrapList(res).map((row) => this.mapProduct(row))),
      catchError((err) => {
        console.warn('Products fetch failed', err);
        // Keep last known catalog — empty wipe breaks in-progress edits (missing id).
        return of(this.productsSubject.value);
      })
    );
  }

  private fetchCategories(): Observable<ProductCategory[]> {
    return this.http.get<unknown>(apiUrl('/api/ProductCategories')).pipe(
      map((res) =>
        this.unwrapList(res)
          .map((row) => this.mapCategory(row))
          .filter((c): c is ProductCategory => !!c)
      ),
      catchError((err) => {
        console.warn('Categories fetch failed', err);
        return of([] as ProductCategory[]);
      })
    );
  }

  private fetchSubmissions(): Observable<FormSubmission[]> {
    const quotes$ = this.http.get<unknown>(apiUrl('/api/QuoteRequests')).pipe(
      map((res) => this.unwrapList(res).map((row) => this.mapQuote(row))),
      catchError(() => of([] as FormSubmission[]))
    );
    const contacts$ = this.http.get<unknown>(apiUrl('/api/ContactMessages')).pipe(
      map((res) => this.unwrapList(res).map((row) => this.mapContact(row))),
      catchError(() => of([] as FormSubmission[]))
    );

    return forkJoin([quotes$, contacts$]).pipe(
      map(([quotes, contacts]) =>
        [...quotes, ...contacts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      )
    );
  }

  private unwrapList(res: unknown): Record<string, unknown>[] {
    if (Array.isArray(res)) {
      return res as Record<string, unknown>[];
    }
    if (res && typeof res === 'object') {
      const r = res as Record<string, unknown>;
      if (Array.isArray(r['data'])) {
        return r['data'] as Record<string, unknown>[];
      }
      if (Array.isArray(r['items'])) {
        return r['items'] as Record<string, unknown>[];
      }
    }
    return [];
  }

  private mapProduct(row: Record<string, unknown>): ProductItem {
    const pick = (...keys: string[]) => {
      for (const key of keys) {
        const v = row[key];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return v;
        }
      }
      return '';
    };

    const imagesRaw = Array.isArray(row['images'])
      ? (row['images'] as Record<string, unknown>[])
      : Array.isArray(row['Images'])
        ? (row['Images'] as Record<string, unknown>[])
        : [];
    const fromGallery = imagesRaw
      .slice()
      .sort(
        (a, b) =>
          Number(a['sortOrder'] ?? a['SortOrder'] ?? 0) -
          Number(b['sortOrder'] ?? b['SortOrder'] ?? 0)
      )
      .map((img) => String(img['imageUrl'] || img['ImageUrl'] || ''));

    const coverRaw = String(pick('coverImageUrl', 'CoverImageUrl') || '');
    const imageUrls = this.normalizeImageUrls([...fromGallery, coverRaw]);
    const cover = imageUrls[0] || '';

    const nameAr = String(pick('nameAr', 'NameAr'));
    const nameEn = String(pick('nameEn', 'NameEn'));
    const originAr = String(pick('originCountryAr', 'OriginCountryAr'));
    const originEn = String(pick('originCountryEn', 'OriginCountryEn'));
    const packAr = String(pick('packagingMethodAr', 'PackagingMethodAr'));
    const packEn = String(pick('packagingMethodEn', 'PackagingMethodEn'));
    const moqAr = String(pick('moqAr', 'MoqAr'));
    const moqEn = String(pick('moqEn', 'MoqEn'));
    const notesAr = String(pick('notesAr', 'NotesAr'));
    const notesEn = String(pick('notesEn', 'NotesEn'));
    const isActive = row['isActive'] !== false && row['IsActive'] !== false;
    const id = String(pick('id', 'Id'));

    return {
      id,
      slug: String(pick('slug', 'Slug') || id),
      category: String(pick('categoryId', 'CategoryId')),
      name: { ar: nameAr, en: nameEn } as L,
      origin: { ar: originAr, en: originEn } as L,
      packaging: { ar: packAr, en: packEn } as L,
      image: cover,
      images: imageUrls,
      notes: { ar: notesAr, en: notesEn } as L,
      description: { ar: notesAr || nameAr, en: notesEn || nameEn } as L,
      moq: { ar: moqAr, en: moqEn } as L,
      availability: isActive ? 'in-supply' : 'on-demand',
      specs: [
        { label: { ar: 'المنشأ', en: 'Origin' }, value: { ar: originAr, en: originEn } },
        { label: { ar: 'التعبئة', en: 'Packaging' }, value: { ar: packAr, en: packEn } },
      ],
    };
  }

  private mapCategory(row: Record<string, unknown>): ProductCategory | null {
    const id = String(row['id'] || '');
    if (!id) {
      return null;
    }
    return {
      id,
      name: {
        ar: String(row['nameAr'] || ''),
        en: String(row['nameEn'] || ''),
      } as L,
    };
  }

  private mapQuote(row: Record<string, unknown>): FormSubmission {
    const shipping = row['shippingMethod'];
    let mode = 'SEA';
    if (shipping === 2 || shipping === '2' || shipping === 'Land') {
      mode = 'LAND';
    } else if (shipping === 3 || shipping === '3' || shipping === 'Unsure') {
      mode = 'UNSURE';
    }

    return {
      id: String(row['id'] || ''),
      type: 'quote',
      createdAt: this.formatDate(row['createdAt'] || row['createdOn'] || row['date']),
      name: String(row['fullName'] || row['name'] || ''),
      company: String(row['companyName'] || row['company'] || ''),
      email: String(row['email'] || ''),
      phone: String(row['phone'] || ''),
      status: this.mapStatus(row['status']),
      details: {
        service: String(row['serviceName'] || row['service'] || ''),
        product: String(row['productName'] || ''),
        quantity: String(row['estimatedQuantity'] || row['quantity'] || ''),
        destination: String(row['destination'] || ''),
        mode,
        notes: String(row['specNotes'] || row['notes'] || ''),
        productId: row['productId'] ? String(row['productId']) : '',
      },
    };
  }

  private mapContact(row: Record<string, unknown>): FormSubmission {
    return {
      id: String(row['id'] || ''),
      type: 'contact',
      createdAt: this.formatDate(row['createdAt'] || row['createdOn'] || row['date']),
      name: String(row['fullName'] || row['name'] || ''),
      company: String(row['companyName'] || row['company'] || ''),
      email: String(row['email'] || ''),
      phone: String(row['phone'] || ''),
      status: this.mapStatus(row['status']),
      details: {
        interest: String(row['interestField'] || row['interest'] || ''),
        message: String(row['message'] || ''),
      },
    };
  }

  private mapStatus(raw: unknown): FormSubmission['status'] {
    if (typeof raw === 'string') {
      const s = raw.toLowerCase();
      if (s.includes('progress') || s === 'inprogress' || s === '1') {
        return 'in_progress';
      }
      if (s.includes('complete') || s.includes('done') || s === '2' || s === 'closed') {
        return 'completed';
      }
      if (s === 'new' || s === '0' || s === 'pending') {
        return 'new';
      }
    }
    if (typeof raw === 'number') {
      if (raw === 1) {
        return 'in_progress';
      }
      if (raw === 2) {
        return 'completed';
      }
      return 'new';
    }
    return 'new';
  }

  private formatDate(raw: unknown): string {
    if (!raw) {
      return new Date().toISOString().replace('T', ' ').substring(0, 16);
    }
    const d = new Date(String(raw));
    if (Number.isNaN(d.getTime())) {
      return String(raw).substring(0, 16);
    }
    return d.toISOString().replace('T', ' ').substring(0, 16);
  }

  private toProductFormData(
    item: ProductItem,
    options: {
      mode?: 'create' | 'replace-image' | 'metadata';
      imageFiles?: File[];
      keepImageUrls?: string[];
      allowUrlsOnly?: boolean;
    } = {}
  ): FormData {
    const form = new FormData();
    form.append('CategoryId', item.category || '');
    form.append('NameAr', item.name?.ar || '');
    form.append('NameEn', item.name?.en || '');
    form.append('Slug', item.slug || '');
    form.append('OriginCountryAr', item.origin?.ar || '');
    form.append('OriginCountryEn', item.origin?.en || '');
    form.append('PackagingMethodAr', item.packaging?.ar || '');
    form.append('PackagingMethodEn', item.packaging?.en || '');
    form.append('MoqAr', item.moq?.ar || '');
    form.append('MoqEn', item.moq?.en || '');
    form.append('NotesAr', item.notes?.ar || '');
    form.append('NotesEn', item.notes?.en || '');
    form.append('IsActive', item.availability === 'on-demand' ? 'false' : 'true');

    const files = options.imageFiles || [];
    const urls = this.normalizeImageUrls(options.keepImageUrls || []);
    const mode = options.mode || 'create';

    if (mode === 'metadata') {
      return form;
    }

    // Files as repeated Images parts (Postman File / multi)
    files.forEach((file) => {
      form.append('Images', file, file.name || 'image.jpg');
    });

    // Kept remote URLs
    if (urls.length) {
      urls.forEach((url) => form.append('ImageUrls', url));
    }

    if (mode === 'create') {
      if (!files.length && !(options.allowUrlsOnly && urls.length)) {
        return form;
      }
      form.append('CoverIndex', '0');
      return form;
    }

    // replace-image
    form.append('ReplaceImages', 'true');
    form.append('CoverIndex', '0');
    return form;
  }

  /** Split accidental "url1,url2" values into separate http(s) URLs. */
  private normalizeImageUrls(values: string[]): string[] {
    const out: string[] = [];
    for (const raw of values) {
      if (!raw) {
        continue;
      }
      const parts = String(raw)
        .split(/,(?=https?:\/\/)/i)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const part of parts) {
        if (/^https?:\/\//i.test(part) && !out.includes(part)) {
          out.push(part);
        }
      }
    }
    return out;
  }

  private fail(err: unknown, fallback: string): MutationResult {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object') {
        const msg = (body as Record<string, unknown>)['message'];
        if (typeof msg === 'string' && msg.trim() && !msg.includes('<')) {
          return { ok: false, message: msg };
        }
        const title = (body as Record<string, unknown>)['title'];
        if (typeof title === 'string' && title.trim()) {
          return { ok: false, message: title };
        }
        const errors = (body as Record<string, unknown>)['errors'];
        if (errors && typeof errors === 'object') {
          const parts = Object.entries(errors as Record<string, unknown>)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .filter(Boolean);
          if (parts.length) {
            return { ok: false, message: parts.join(' · ') };
          }
        }
      }
      if (typeof body === 'string' && body.trim() && !body.includes('<')) {
        return { ok: false, message: body };
      }
      if (err.status === 401 || err.status === 403) {
        return { ok: false, message: 'يلزم تسجيل الدخول بصلاحية مناسبة.' };
      }
      if (err.status === 0) {
        return { ok: false, message: 'تعذر الاتصال بالخادم.' };
      }
      if (err.status === 500) {
        return {
          ok: false,
          message: 'الخادم رفض تحديث المنتج (500). تأكد أن روابط الصور صحيحة وأن الفئة محددة.',
        };
      }
      return { ok: false, message: `${fallback} (${err.status})` };
    }
    return { ok: false, message: fallback };
  }
}
