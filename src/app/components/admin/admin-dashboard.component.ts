import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { AdminDataService, FormSubmission } from '../../services/admin-data.service';
import { LanguageService } from '../../services/language.service';
import { ProductItem, ProductCategory, site } from '../../data/content';
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
  productPage = 1;
  readonly productPageSize = 6;
  readonly listPageSize = 6;
  submissionsPage = 1;
  quotesPage = 1;
  privateLabelPage = 1;
  contactPage = 1;

  // Data
  products: ProductItem[] = [];
  submissions: FormSubmission[] = [];
  categories: ProductCategory[] = [];
  allCategories: ProductCategory[] = [];
  categoryOptions: SelectOption[] = [];

  // Toast Notification
  toastMessage = '';
  toastType: 'success' | 'info' | 'error' = 'success';
  private toastTimer: any = null;

  // Category manager
  showCategoryPanel = false;
  editingCategoryId: string | null = null;
  categoryForm = this.fb.group({
    id: [''],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
  });

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
      this.language.languageChanged$.subscribe((l) => {
        this.lang = l;
        this.refreshCategoryOptions();
      })
    );

    this.subs.add(
      this.adminData.products$.subscribe((items) => (this.products = items))
    );

    this.subs.add(
      this.adminData.categories$.subscribe((cats) => {
        this.categories = cats;
        this.allCategories = this.adminData.getFilterCategories();
        this.refreshCategoryOptions();
        if (this.productCategoryFilter !== 'all' && !cats.some((c) => c.id === this.productCategoryFilter)) {
          this.productCategoryFilter = 'all';
        }
      })
    );

    this.subs.add(
      this.adminData.submissions$.subscribe((subs) => {
        this.submissions = subs;
        if (this.selectedSubmission) {
          this.selectedSubmission =
            subs.find((s) => s.id === this.selectedSubmission!.id) || null;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  get currentDateFormatted(): string {
    try {
      return new Intl.DateTimeFormat(this.lang === 'ar' ? 'ar-EG' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());
    } catch {
      return new Date().toLocaleDateString();
    }
  }

  get firstName(): string {
    return this.currentUser?.name ? this.currentUser.name.split(' ')[0] : 'عبدالرحمن';
  }

  detailLabel(key: string): string {
    const map: Record<string, string> = {
      service: 'الخدمة',
      product: 'المنتج',
      quantity: 'الكمية',
      destination: 'الوجهة',
      mode: 'وسيلة الشحن',
      notes: 'ملاحظات',
      category: 'مجال التصنيع',
      volume: 'الكمية المطلوبة',
      message: 'ملخص الاحتياج',
      interest: 'مجال الاهتمام',
    };
    return map[key] || key;
  }

  statusLabel(status: FormSubmission['status']): string {
    if (status === 'new') return 'جديد';
    if (status === 'in_progress') return 'قيد المتابعة';
    return 'مكتمل';
  }

  cycleStatus(sub: FormSubmission, e?: Event): void {
    if (e) {
      e.stopPropagation();
    }
    const order: FormSubmission['status'][] = ['new', 'in_progress', 'completed'];
    const next = order[(order.indexOf(sub.status) + 1) % order.length];
    this.changeStatus(sub, next);
  }

  getWhatsAppUrl(phone: string): string {
    const cleaned = (phone || '').replace(/\+/g, '').replace(/\s+/g, '');
    return `https://wa.me/${cleaned}`;
  }

  private refreshCategoryOptions(): void {
    this.categoryOptions = this.categories.map((c) => ({
      value: c.id,
      label: c.name[this.lang],
    }));
  }

  categoryProductCount(id: string): number {
    return this.adminData.countProductsInCategory(id);
  }

  categoryLabel(id: string): string {
    return this.adminData.categoryLabel(id, this.lang);
  }

  openCategoryPanel(): void {
    this.showCategoryPanel = true;
    this.cancelEditCategory();
  }

  closeCategoryPanel(): void {
    this.showCategoryPanel = false;
    this.cancelEditCategory();
  }

  startAddCategory(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset({ id: '', nameAr: '', nameEn: '' });
  }

  startEditCategory(cat: ProductCategory): void {
    this.editingCategoryId = cat.id;
    this.categoryForm.patchValue({
      id: cat.id,
      nameAr: cat.name.ar,
      nameEn: cat.name.en,
    });
  }

  cancelEditCategory(): void {
    this.editingCategoryId = null;
    this.categoryForm.reset({ id: '', nameAr: '', nameEn: '' });
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.notify('أدخل اسم الفئة بالعربية والإنجليزية', 'error');
      return;
    }
    const val = this.categoryForm.value;
    if (this.editingCategoryId) {
      const res = this.adminData.updateCategory(this.editingCategoryId, {
        nameAr: val.nameAr || '',
        nameEn: val.nameEn || '',
      });
      if (!res.ok) {
        this.notify(res.message || 'تعذر التحديث', 'error');
        return;
      }
      this.notify('تم تحديث الفئة بنجاح');
    } else {
      const res = this.adminData.addCategory({
        id: val.id || undefined,
        nameAr: val.nameAr || '',
        nameEn: val.nameEn || '',
      });
      if (!res.ok) {
        this.notify(res.message || 'تعذر الإضافة', 'error');
        return;
      }
      this.notify(`تمت إضافة الفئة "${val.nameAr}"`);
    }
    this.cancelEditCategory();
  }

  deleteCategory(cat: ProductCategory): void {
    const res = this.adminData.deleteCategory(cat.id);
    if (!res.ok) {
      this.notify(res.message || 'تعذر الحذف', 'error');
      return;
    }
    if (this.editingCategoryId === cat.id) {
      this.cancelEditCategory();
    }
    if (this.productCategoryFilter === cat.id) {
      this.productCategoryFilter = 'all';
    }
    this.notify(`تم حذف الفئة "${cat.name.ar}"`, 'info');
  }

  setTab(tab: AdminTab): void {
    if (tab === 'private-label') {
      this.currentTab = 'overview';
      return;
    }
    this.currentTab = tab;
    this.searchQuery = '';
    this.statusFilter = 'all';
    if (tab !== 'products') {
      this.closeCategoryPanel();
    }
  }

  /** Submissions shown in the admin UI (private-label feature is hidden). */
  get dashboardSubmissions(): FormSubmission[] {
    return this.submissions.filter((s) => s.type !== 'private-label');
  }

  // Stats Calculations
  get newSubmissionsCount(): number {
    return this.dashboardSubmissions.filter((s) => s.status === 'new').length;
  }

  get inProgressCount(): number {
    return this.dashboardSubmissions.filter((s) => s.status === 'in_progress').length;
  }

  get completedCount(): number {
    return this.dashboardSubmissions.filter((s) => s.status === 'completed').length;
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
    return this.applySubmissionsFilter(this.dashboardSubmissions);
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

  private safeListPage(page: number, totalItems: number): number {
    const pages = Math.max(1, Math.ceil(totalItems / this.listPageSize));
    return Math.min(Math.max(1, page), pages);
  }

  private paginateList(list: FormSubmission[], page: number): FormSubmission[] {
    if (!list.length) {
      return [];
    }
    const safe = this.safeListPage(page, list.length);
    const start = (safe - 1) * this.listPageSize;
    return list.slice(start, start + this.listPageSize);
  }

  private pageNumbersFor(totalItems: number): number[] {
    const pages = Math.max(1, Math.ceil(totalItems / this.listPageSize));
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  get pagedSubmissions(): FormSubmission[] {
    return this.paginateList(this.filteredSubmissions, this.submissionsPage);
  }
  get safeSubmissionsPage(): number {
    return this.safeListPage(this.submissionsPage, this.filteredSubmissions.length);
  }
  get submissionsTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredSubmissions.length / this.listPageSize));
  }
  get submissionsPageNumbers(): number[] {
    return this.pageNumbersFor(this.filteredSubmissions.length);
  }
  get submissionsPageStart(): number {
    return this.filteredSubmissions.length ? (this.safeSubmissionsPage - 1) * this.listPageSize + 1 : 0;
  }
  get submissionsPageEnd(): number {
    return Math.min(this.safeSubmissionsPage * this.listPageSize, this.filteredSubmissions.length);
  }

  get pagedQuotes(): FormSubmission[] {
    return this.paginateList(this.filteredQuotes, this.quotesPage);
  }
  get safeQuotesPage(): number {
    return this.safeListPage(this.quotesPage, this.filteredQuotes.length);
  }
  get quotesTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredQuotes.length / this.listPageSize));
  }
  get quotesPageNumbers(): number[] {
    return this.pageNumbersFor(this.filteredQuotes.length);
  }
  get quotesPageStart(): number {
    return this.filteredQuotes.length ? (this.safeQuotesPage - 1) * this.listPageSize + 1 : 0;
  }
  get quotesPageEnd(): number {
    return Math.min(this.safeQuotesPage * this.listPageSize, this.filteredQuotes.length);
  }

  get pagedPrivateLabel(): FormSubmission[] {
    return this.paginateList(this.filteredPrivateLabel, this.privateLabelPage);
  }
  get safePrivateLabelPage(): number {
    return this.safeListPage(this.privateLabelPage, this.filteredPrivateLabel.length);
  }
  get privateLabelTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPrivateLabel.length / this.listPageSize));
  }
  get privateLabelPageNumbers(): number[] {
    return this.pageNumbersFor(this.filteredPrivateLabel.length);
  }
  get privateLabelPageStart(): number {
    return this.filteredPrivateLabel.length ? (this.safePrivateLabelPage - 1) * this.listPageSize + 1 : 0;
  }
  get privateLabelPageEnd(): number {
    return Math.min(this.safePrivateLabelPage * this.listPageSize, this.filteredPrivateLabel.length);
  }

  get pagedContact(): FormSubmission[] {
    return this.paginateList(this.filteredContact, this.contactPage);
  }
  get safeContactPage(): number {
    return this.safeListPage(this.contactPage, this.filteredContact.length);
  }
  get contactTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredContact.length / this.listPageSize));
  }
  get contactPageNumbers(): number[] {
    return this.pageNumbersFor(this.filteredContact.length);
  }
  get contactPageStart(): number {
    return this.filteredContact.length ? (this.safeContactPage - 1) * this.listPageSize + 1 : 0;
  }
  get contactPageEnd(): number {
    return Math.min(this.safeContactPage * this.listPageSize, this.filteredContact.length);
  }

  setStatusFilter(status: 'all' | 'new' | 'in_progress' | 'completed'): void {
    this.statusFilter = status;
    this.resetSubmissionPages();
  }

  private resetSubmissionPages(): void {
    this.submissionsPage = 1;
    this.quotesPage = 1;
    this.privateLabelPage = 1;
    this.contactPage = 1;
  }

  prevSubmissionsPage(): void {
    if (this.safeSubmissionsPage > 1) this.submissionsPage = this.safeSubmissionsPage - 1;
  }
  nextSubmissionsPage(): void {
    if (this.safeSubmissionsPage < this.submissionsTotalPages) this.submissionsPage = this.safeSubmissionsPage + 1;
  }
  goToSubmissionsPage(page: number): void {
    if (page >= 1 && page <= this.submissionsTotalPages) this.submissionsPage = page;
  }

  prevQuotesPage(): void {
    if (this.safeQuotesPage > 1) this.quotesPage = this.safeQuotesPage - 1;
  }
  nextQuotesPage(): void {
    if (this.safeQuotesPage < this.quotesTotalPages) this.quotesPage = this.safeQuotesPage + 1;
  }
  goToQuotesPage(page: number): void {
    if (page >= 1 && page <= this.quotesTotalPages) this.quotesPage = page;
  }

  prevPrivateLabelPage(): void {
    if (this.safePrivateLabelPage > 1) this.privateLabelPage = this.safePrivateLabelPage - 1;
  }
  nextPrivateLabelPage(): void {
    if (this.safePrivateLabelPage < this.privateLabelTotalPages) this.privateLabelPage = this.safePrivateLabelPage + 1;
  }
  goToPrivateLabelPage(page: number): void {
    if (page >= 1 && page <= this.privateLabelTotalPages) this.privateLabelPage = page;
  }

  prevContactPage(): void {
    if (this.safeContactPage > 1) this.contactPage = this.safeContactPage - 1;
  }
  nextContactPage(): void {
    if (this.safeContactPage < this.contactTotalPages) this.contactPage = this.safeContactPage + 1;
  }
  goToContactPage(page: number): void {
    if (page >= 1 && page <= this.contactTotalPages) this.contactPage = page;
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

  get productTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredProducts.length / this.productPageSize));
  }

  get productPageNumbers(): number[] {
    return Array.from({ length: this.productTotalPages }, (_, i) => i + 1);
  }

  get safeProductPage(): number {
    return Math.min(Math.max(1, this.productPage), this.productTotalPages);
  }

  get pagedProducts(): ProductItem[] {
    const list = this.filteredProducts;
    if (!list.length) {
      return [];
    }
    const start = (this.safeProductPage - 1) * this.productPageSize;
    return list.slice(start, start + this.productPageSize);
  }

  get productPageStart(): number {
    if (!this.filteredProducts.length) {
      return 0;
    }
    return (this.safeProductPage - 1) * this.productPageSize + 1;
  }

  get productPageEnd(): number {
    return Math.min(this.safeProductPage * this.productPageSize, this.filteredProducts.length);
  }

  setProductCategory(catId: string): void {
    this.productCategoryFilter = catId;
    this.productPage = 1;
  }

  onProductSearchChange(): void {
    this.productPage = 1;
    this.resetSubmissionPages();
  }

  onListSearchChange(): void {
    this.resetSubmissionPages();
    this.productPage = 1;
  }
  prevProductPage(): void {
    if (this.safeProductPage > 1) {
      this.productPage = this.safeProductPage - 1;
    }
  }

  nextProductPage(): void {
    if (this.safeProductPage < this.productTotalPages) {
      this.productPage = this.safeProductPage + 1;
    }
  }

  goToProductPage(page: number): void {
    if (page >= 1 && page <= this.productTotalPages) {
      this.productPage = page;
    }
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
    const defaultCat = this.categories[0]?.id || 'food';
    this.modalImages = [defaultImg];
    this.newImageUrl = '';
    this.cancelEditModalImage();
    this.productForm.reset({
      category: defaultCat,
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
