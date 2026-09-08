import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { AdminDataService, FormSubmission } from '../../services/admin-data.service';
import { LanguageService } from '../../services/language.service';
import { ProductItem, productCategories, site } from '../../data/content';
import { SelectOption } from '../select-menu/select-menu.component';

export type AdminTab = 'overview' | 'products' | 'quotes' | 'private-label' | 'contact';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  site = site;
  currentUser: User | null = null;
  currentTab: AdminTab = 'overview';
  lang = this.language.current;

  // Search & Filtering
  searchQuery = '';
  statusFilter: 'all' | 'new' | 'in_progress' | 'completed' = 'all';
  productCategoryFilter = 'all';

  // Data
  products: ProductItem[] = [];
  submissions: FormSubmission[] = [];
  allCategories = productCategories;
  categories = productCategories.filter((c) => c.id !== 'all');

  get categoryOptions(): SelectOption[] {
    return this.categories.map((c) => ({
      value: c.id,
      label: c.name[this.lang],
    }));
  }

  // Toast Notification
  toastMessage = '';
  toastType: 'success' | 'info' | 'error' = 'success';
  private toastTimer: any = null;

  // Product Modal State
  showProductModal = false;
  editingProductSlug: string | null = null;
  modalImages: string[] = [];
  newImageUrl = '';
  editingImageIndex: number | null = null;
  editedImageUrl = '';

  productForm = this.fb.group({
    slug: ['', Validators.required],
    category: ['food', Validators.required],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    originAr: ['', Validators.required],
    originEn: ['', Validators.required],
    packagingAr: ['', Validators.required],
    packagingEn: ['', Validators.required],
    moqAr: ['حاوية 20 قدم أو حسب الاتفاق'],
    moqEn: ['20ft container or by contract'],
    availability: ['in-supply'],
    image: [''],
    notesAr: [''],
    notesEn: [''],
  });

  // Selected Submission Detail Drawer
  selectedSubmission: FormSubmission | null = null;

  private subs = new Subscription();

  constructor(
    public auth: AuthService,
    private adminData: AdminDataService,
    private fb: FormBuilder,
    private router: Router,
    public language: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUser;

    this.subs.add(
      this.language.languageChanged$.subscribe((l) => (this.lang = l))
    );

    this.subs.add(
      this.adminData.products$.subscribe((items) => (this.products = items))
    );

    this.subs.add(
      this.adminData.submissions$.subscribe((subs) => (this.submissions = subs))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  get currentDateFormatted(): string {
    return this.lang === 'ar' ? 'الثلاثاء، 8 سبتمبر 2026' : 'Tuesday, Sep 8, 2026';
  }

  get firstName(): string {
    return this.currentUser?.name ? this.currentUser.name.split(' ')[0] : 'عبدالرحمن';
  }

  getWhatsAppUrl(phone: string): string {
    const cleaned = (phone || '').replace(/\+/g, '').replace(/\s+/g, '');
    return `https://wa.me/${cleaned}`;
  }

  setTab(tab: AdminTab): void {
    this.currentTab = tab;
    this.searchQuery = '';
    this.statusFilter = 'all';
  }

  // Stats Calculations
  get newSubmissionsCount(): number {
    return this.submissions.filter((s) => s.status === 'new').length;
  }

  get inProgressCount(): number {
    return this.submissions.filter((s) => s.status === 'in_progress').length;
  }

  get completedCount(): number {
    return this.submissions.filter((s) => s.status === 'completed').length;
  }

  get quotesList(): FormSubmission[] {
    return this.submissions.filter((s) => s.type === 'quote');
  }

  get privateLabelList(): FormSubmission[] {
    return this.submissions.filter((s) => s.type === 'private-label');
  }

  get contactList(): FormSubmission[] {
    return this.submissions.filter((s) => s.type === 'contact');
  }

  // Filtered lists with Search & Status
  get filteredSubmissions(): FormSubmission[] {
    return this.applySubmissionsFilter(this.submissions);
  }

  get filteredQuotes(): FormSubmission[] {
    return this.applySubmissionsFilter(this.quotesList);
  }

  get filteredPrivateLabel(): FormSubmission[] {
    return this.applySubmissionsFilter(this.privateLabelList);
  }

  get filteredContact(): FormSubmission[] {
    return this.applySubmissionsFilter(this.contactList);
  }

  private applySubmissionsFilter(list: FormSubmission[]): FormSubmission[] {
    let result = list;
    if (this.statusFilter !== 'all') {
      result = result.filter((s) => s.status === this.statusFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.company && s.company.toLowerCase().includes(q)) ||
          s.phone.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.details && JSON.stringify(s.details).toLowerCase().includes(q))
      );
    }
    return result;
  }

  get filteredProducts(): ProductItem[] {
    let list = this.products;
    if (this.productCategoryFilter !== 'all') {
      list = list.filter((p) => p.category === this.productCategoryFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.ar.toLowerCase().includes(q) ||
          p.name.en.toLowerCase().includes(q) ||
          p.origin.ar.toLowerCase().includes(q) ||
          p.origin.en.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // Status Management
  changeStatus(sub: FormSubmission, status: FormSubmission['status']): void {
    this.adminData.updateSubmissionStatus(sub.id, status);
    if (this.selectedSubmission?.id === sub.id) {
      this.selectedSubmission.status = status;
    }
    const statusArabic = status === 'new' ? 'جديد' : status === 'in_progress' ? 'قيد المتابعة' : 'مكتمل';
    this.notify(`تم تحديث حالة الطلب (${sub.id}) إلى: ${statusArabic}`);
  }

  deleteSub(id: string, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الطلب نهائياً؟')) {
      this.adminData.deleteSubmission(id);
      if (this.selectedSubmission?.id === id) {
        this.selectedSubmission = null;
      }
      this.notify('تم حذف الطلب بنجاح', 'info');
    }
  }

  openSubmissionDetails(sub: FormSubmission): void {
    this.selectedSubmission = sub;
  }

  closeSubmissionDetails(): void {
    this.selectedSubmission = null;
  }

  // Product CRUD & Image Management
  addImageUrl(): void {
    const url = this.newImageUrl.trim();
    if (!url) {
      this.notify('يرجى إدخال رابط الصورة أولاً', 'error');
      return;
    }
    if (this.modalImages.includes(url)) {
      this.notify('هذه الصورة مضافة بالفعل', 'info');
      return;
    }
    this.modalImages.push(url);
    this.newImageUrl = '';
    this.syncFormImage();
    this.notify('تمت إضافة الصورة للمنتج بنجاح');
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    let loaded = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          this.modalImages.push(result);
          loaded++;
          if (loaded === files.length) {
            this.syncFormImage();
            this.notify(`تم رفع ${files.length} صورة بنجاح`);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  removeModalImage(index: number, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    if (this.modalImages.length <= 1) {
      this.notify('يجب الإبقاء على صورة واحدة على الأقل للمنتج', 'error');
      return;
    }
    this.modalImages.splice(index, 1);
    this.syncFormImage();
    this.notify('تم حذف الصورة من المعرض', 'info');
  }

  setPrimaryModalImage(index: number, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    if (index === 0) return;
    const [selected] = this.modalImages.splice(index, 1);
    this.modalImages.unshift(selected);
    this.syncFormImage();
    this.notify('تم تعيين الصورة كصورة رئيسية للمنتج');
  }

  startEditModalImage(index: number, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    this.editingImageIndex = index;
    this.editedImageUrl = this.modalImages[index];
  }

  saveEditedModalImage(index: number): void {
    const trimmed = this.editedImageUrl.trim();
    if (trimmed) {
      this.modalImages[index] = trimmed;
      this.syncFormImage();
      this.notify('تم تحديث رابط الصورة بنجاح');
    }
    this.cancelEditModalImage();
  }

  cancelEditModalImage(): void {
    this.editingImageIndex = null;
    this.editedImageUrl = '';
  }

  private syncFormImage(): void {
    const primary = this.modalImages[0] || '';
    this.productForm.patchValue({ image: primary });
  }

  openAddProduct(): void {
    this.editingProductSlug = null;
    const defaultImg = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
    this.modalImages = [defaultImg];
    this.newImageUrl = '';
    this.cancelEditModalImage();
    this.productForm.reset({
      category: 'food',
      availability: 'in-supply',
      moqAr: 'حاوية 20 قدم أو حسب الاتفاق',
      moqEn: '20ft container or by contract',
      image: defaultImg,
    });
    this.showProductModal = true;
  }

  openEditProduct(p: ProductItem, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    this.editingProductSlug = p.slug;
    this.modalImages = p.images && p.images.length ? [...p.images] : (p.image ? [p.image] : []);
    this.newImageUrl = '';
    this.cancelEditModalImage();
    this.productForm.patchValue({
      slug: p.slug,
      category: p.category,
      nameAr: p.name.ar,
      nameEn: p.name.en,
      originAr: p.origin.ar,
      originEn: p.origin.en,
      packagingAr: p.packaging.ar,
      packagingEn: p.packaging.en,
      moqAr: p.moq?.ar || 'حاوية 20 قدم أو حسب الاتفاق',
      moqEn: p.moq?.en || '20ft container or by contract',
      availability: p.availability || 'in-supply',
      image: this.modalImages[0] || p.image || '',
      notesAr: p.notes?.ar || '',
      notesEn: p.notes?.en || '',
    });
    this.showProductModal = true;
  }

  closeProductModal(): void {
    this.showProductModal = false;
    this.editingProductSlug = null;
    this.cancelEditModalImage();
  }

  saveProduct(): void {
    if (this.modalImages.length === 0 && !this.productForm.value.image) {
      this.notify('يرجى إضافة صورة واحدة على الأقل للمنتج', 'error');
      return;
    }
    if (this.modalImages.length > 0 && !this.productForm.value.image) {
      this.syncFormImage();
    }
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const val = this.productForm.value;
    const existing = this.editingProductSlug
      ? this.products.find((p) => p.slug === this.editingProductSlug)
      : null;

    const finalImages = this.modalImages.length ? [...this.modalImages] : (val.image ? [val.image] : []);
    const primaryImage = finalImages[0] || val.image || '';

    const itemData: ProductItem = {
      slug: (val.slug || '').trim().toLowerCase().replace(/\s+/g, '-'),
      category: val.category || 'food',
      name: { ar: val.nameAr || '', en: val.nameEn || '' },
      origin: { ar: val.originAr || '', en: val.originEn || '' },
      packaging: { ar: val.packagingAr || '', en: val.packagingEn || '' },
      image: primaryImage,
      images: finalImages,
      notes: { ar: val.notesAr || '', en: val.notesEn || '' },
      description: existing?.description || {
        ar: val.nameAr || '',
        en: val.nameEn || '',
      },
      moq: {
        ar: val.moqAr || 'حاوية 20 قدم أو حسب الاتفاق',
        en: val.moqEn || '20ft container or upon agreement',
      },
      availability: (val.availability as any) || 'in-supply',
      specs: existing?.specs || [
        { label: { ar: 'المنشأ', en: 'Origin' }, value: { ar: val.originAr || '', en: val.originEn || '' } },
        { label: { ar: 'التعبئة', en: 'Packaging' }, value: { ar: val.packagingAr || '', en: val.packagingEn || '' } },
      ],
    };

    if (this.editingProductSlug) {
      this.adminData.updateProduct(this.editingProductSlug, itemData);
      this.notify(`تم تحديث بيانات وصور المنتج "${itemData.name.ar}" بنجاح`);
    } else {
      this.adminData.addProduct(itemData);
      this.notify(`تم إضافة المنتج "${itemData.name.ar}" إلى الكتالوج بنجاح`);
    }

    this.closeProductModal();
  }

  deleteProd(slug: string, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    const found = this.products.find((p) => p.slug === slug);
    const title = found ? found.name.ar : slug;
    if (confirm(`هل أنت متأكد من حذف المنتج "${title}" نهائياً من الموقع؟`)) {
      this.adminData.deleteProduct(slug);
      this.notify(`تم حذف المنتج "${title}" بنجاح`, 'info');
    }
  }

  copyToClipboard(text: string, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    navigator.clipboard?.writeText(text);
    this.notify(`تم نسخ المعرف: ${text}`);
  }

  notify(msg: string, type: 'success' | 'info' | 'error' = 'success'): void {
    this.toastMessage = msg;
    this.toastType = type;
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
