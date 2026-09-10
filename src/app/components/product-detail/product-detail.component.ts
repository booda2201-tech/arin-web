import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { AdminDataService } from '../../services/admin-data.service';
import {
  Lang,
  L,
  ProductItem,
  getProduct,
  relatedProducts,
} from '../../data/content';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnDestroy {
  product?: ProductItem;
  related: ProductItem[] = [];
  lang: Lang = this.language.current;
  activeImageIndex = 0;
  /** 1 = next, -1 = prev — drives slide direction */
  slideDir: -1 | 0 | 1 = 0;
  /** Bumps so CSS enter animation retriggers on every change */
  slideAnimKey = 0;
  private currentSlug = '';
  private sub = new Subscription();
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;
  private readonly autoplayMs = 4000;
  private autoplayPaused = false;
  private autoplayForSlug = '';
  private autoplayImageCount = 0;

  constructor(
    public language: LanguageService,
    private adminData: AdminDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.sub.add(this.language.languageChanged$.subscribe((lang) => (this.lang = lang)));
    this.sub.add(
      this.route.paramMap.subscribe((params) => {
        this.currentSlug = params.get('slug') || '';
        this.activeImageIndex = 0;
        this.slideDir = 0;
        this.slideAnimKey = 0;
        this.applyProduct(this.adminData.getProducts());
        if (!this.adminData.getProducts().length) {
          this.adminData.refreshCatalog().subscribe();
        }
      })
    );
    this.sub.add(
      this.adminData.products$.subscribe((items) => this.applyProduct(items))
    );
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.sub.unsubscribe();
  }

  txt(copy: L): string {
    return copy[this.lang];
  }

  categoryLabel(): string {
    return this.product ? this.adminData.categoryLabel(this.product.category, this.lang) : '';
  }

  availabilityKey(): string {
    return this.product?.availability === 'in-supply' ? 'PRODUCTS_PAGE.IN_SUPPLY' : 'PRODUCTS_PAGE.ON_DEMAND';
  }

  specRows(): { label: L; value: string }[] {
    if (!this.product) {
      return [];
    }
    return [
      { label: { ar: 'المنشأ', en: 'Origin' }, value: this.txt(this.product.origin) },
      { label: { ar: 'التعبئة', en: 'Packaging' }, value: this.txt(this.product.packaging) },
      { label: { ar: 'أقل كمية للطلب', en: 'Minimum order' }, value: this.txt(this.product.moq) },
      ...this.product.specs.map((s) => ({ label: s.label, value: this.txt(s.value) })),
    ];
  }

  get allImages(): string[] {
    if (!this.product) {
      return [];
    }
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images;
    }
    return this.product.image ? [this.product.image] : [];
  }

  get currentImage(): string {
    const list = this.allImages;
    return list[this.activeImageIndex] || this.product?.image || '';
  }

  setActiveImage(index: number): void {
    if (index === this.activeImageIndex || index < 0 || index >= this.allImages.length) {
      return;
    }
    this.playSlide(index > this.activeImageIndex ? 1 : -1, index);
    this.restartAutoplay();
  }

  nextImage(): void {
    const total = this.allImages.length;
    if (total <= 1) return;
    this.playSlide(1, (this.activeImageIndex + 1) % total);
    this.restartAutoplay();
  }

  prevImage(): void {
    const total = this.allImages.length;
    if (total <= 1) return;
    this.playSlide(-1, (this.activeImageIndex - 1 + total) % total);
    this.restartAutoplay();
  }

  pauseAutoplay(): void {
    this.autoplayPaused = true;
  }

  resumeAutoplay(): void {
    this.autoplayPaused = false;
  }

  private playSlide(dir: -1 | 1, index: number): void {
    this.slideDir = 0;
    this.activeImageIndex = index;
    this.slideAnimKey++;
    // Re-apply direction on next tick so CSS enter animation always restarts.
    setTimeout(() => {
      this.slideDir = dir;
    }, 0);
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.allImages.length <= 1 || this.prefersReducedMotion()) {
      return;
    }
    this.autoplayTimer = setInterval(() => {
      if (this.autoplayPaused || this.allImages.length <= 1) {
        return;
      }
      this.playSlide(1, (this.activeImageIndex + 1) % this.allImages.length);
    }, this.autoplayMs);
  }

  private restartAutoplay(): void {
    this.startAutoplay();
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  }

  private applyProduct(products: ProductItem[]): void {
    const slug = this.currentSlug;
    if (!slug) {
      return;
    }
    const fromAdmin = products.find((p) => p.slug === slug);
    this.product = fromAdmin || getProduct(slug);
    this.related = fromAdmin
      ? products.filter((p) => p.slug !== slug).slice(0, 3)
      : relatedProducts(slug);
    if (!this.product && products.length) {
      this.router.navigateByUrl('/products');
      this.stopAutoplay();
      this.autoplayForSlug = '';
      this.autoplayImageCount = 0;
      return;
    }
    const count = this.allImages.length;
    if (slug !== this.autoplayForSlug || count !== this.autoplayImageCount) {
      this.autoplayForSlug = slug;
      this.autoplayImageCount = count;
      this.startAutoplay();
    }
  }
}
